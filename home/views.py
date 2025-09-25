from rest_framework import viewsets, filters, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from .models import CalculatorEntry, Project, Product, ProductImage, Order, OrderItem
from admin_api.models import Project as AdminProject
from .filters import ProductFilter
from .serializer import (
    CalculatorEntrySerializer, ProjectSerializer,
    ProductSerializer, ProductImageSerializer,
    UserSerializer, OrderSerializer
)
from django.core.mail import send_mail
from django.conf import settings
import jwt
import datetime
import logging
from django.utils import timezone

from Back.stripe_config import create_payment_intent, validate_stripe_config
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
import stripe

from admin_api.marketplace_views import ProductFavoriteViewSet
from admin_api.models import MarketplaceProduct
from admin_api.serializers import MarketplaceProductSerializer

User = get_user_model()

class CustomTokenObtainPairView(TokenObtainPairView):
    permission_classes = (AllowAny,)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    try:
        username_or_email = request.data.get('username')
        password = request.data.get('password')
        
        if not username_or_email or not password:
            return Response({
                'error': 'Datos incompletos',
                'details': 'Username/email y password son requeridos'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Intentar encontrar el usuario por email o username
        try:
            if '@' in username_or_email:
                # Es un email
                users = User.objects.filter(email=username_or_email)
                if users.count() > 1:
                    return Response({
                        'error': 'Error en el servidor',
                        'details': 'Hay múltiples cuentas con este email. Contacta al administrador.'
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                elif users.count() == 0:
                    return Response({
                        'error': 'Credenciales incorrectas',
                        'details': 'No se encontró una cuenta con ese email'
                    }, status=status.HTTP_400_BAD_REQUEST)
                user = users.first()
            else:
                # Es un username
                user = User.objects.get(username=username_or_email)
        except User.DoesNotExist:
            return Response({
                'error': 'Credenciales incorrectas',
                'details': 'No se encontró una cuenta con ese username'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Verificar la contraseña
        if not user.check_password(password):
            return Response({
                'error': 'Credenciales incorrectas',
                'details': 'La contraseña es incorrecta'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Generar tokens JWT
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email
            }
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': 'Error en el servidor',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    try:
        # Obtener y validar los datos
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        accepted_policies = request.data.get('profile', {}).get('accepted_policies', False)

        # Validaciones básicas
        if not username or not email or not password:
            return Response({
                'error': 'Datos incompletos',
                'details': 'Username, email y password son requeridos'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Validar email único
        if User.objects.filter(email=email).exists():
            return Response({
                'error': 'Email ya registrado',
                'details': 'Este email ya está en uso'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Validar username único
        if User.objects.filter(username=username).exists():
            return Response({
                'error': 'Username ya registrado',
                'details': 'Este nombre de usuario ya está en uso'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Crear el usuario
        serializer = UserSerializer(data={
            'username': username,
            'email': email,
            'password': password,
            'profile': {
                'accepted_policies': accepted_policies
            }
        })

        if serializer.is_valid():
            user = serializer.save()
            return Response({
                'user': UserSerializer(user).data,
                'message': 'Usuario registrado exitosamente',
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'error': 'Datos inválidos',
            'details': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    except ValueError as e:
        return Response({
            'error': 'Error de validación',
            'details': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        import traceback
        return Response({
            'error': 'Error en el servidor',
            'details': str(e),
            'trace': traceback.format_exc()
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def save_calculator_entry(request):
    try:
        data = request.data.copy()
        area = int(data.get('area_m2', 0))

        if area <= 0:
            return Response({"error": "Área inválida"}, status=status.HTTP_400_BAD_REQUEST)

        price = area * 1
        data['price'] = price

        serializer = CalculatorEntrySerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET','POST'])
def list_projects(request):
    projects = Project.objects.all()
    serializer = ProjectSerializer(projects, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

class CalculatorEntryViewSet(viewsets.ModelViewSet):
    queryset = CalculatorEntry.objects.all()
    serializer_class = CalculatorEntrySerializer

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = AdminProject.objects.all()  # Usar el modelo correcto del admin
    serializer_class = ProjectSerializer
    permission_classes = [AllowAny]
    
    def list(self, request, *args, **kwargs):
        """Listar proyectos desde admin_api.Project con manejo de errores robusto"""
        print("=== LISTANDO PROYECTOS (ADMIN) ===")
        try:
            # Usar .values() para evitar problemas con DecimalField
            queryset = AdminProject.objects.filter(show_on_map=True).values(
                'id', 'title', 'description', 'latitude', 'longitude', 'image', 'created_at'
            )
            print(f"🏗️ Queryset count: {len(queryset)}")
            
            # Si no hay proyectos, devolver array vacío
            if len(queryset) == 0:
                print("ℹ️ No hay proyectos en el mapa")
                return Response([])
            
            # Crear datos con manejo defensivo
            projects_data = []
            for project in queryset:
                try:
                    # Manejo defensivo de cada campo
                    project_data = {
                        'id': project.get('id', 0),
                        'title': project.get('title', 'Sin título'),
                        'description': project.get('description', 'Sin descripción'),
                        'latitude': None,
                        'longitude': None,
                        'image': None,
                        'created_at': project.get('created_at', None)
                    }
                    
                    # Intentar agregar imagen si existe
                    try:
                        if project.get('image'):
                            project_data['image'] = request.build_absolute_uri(project['image'])
                    except:
                        project_data['image'] = None
                    
                    # Intentar agregar coordenadas si existen
                    try:
                        lat = project.get('latitude')
                        lng = project.get('longitude')
                        if lat is not None and lat != '':
                            project_data['latitude'] = float(lat)
                        if lng is not None and lng != '':
                            project_data['longitude'] = float(lng)
                    except:
                        project_data['latitude'] = None
                        project_data['longitude'] = None
                    
                    # Formatear fecha
                    try:
                        if project_data['created_at']:
                            project_data['created_at'] = project_data['created_at'].isoformat()
                    except:
                        project_data['created_at'] = None
                    
                    projects_data.append(project_data)
                    print(f"✅ Proyecto procesado: {project_data['title']} (Lat: {project_data['latitude']}, Lng: {project_data['longitude']})")
                    
                except Exception as project_error:
                    print(f"⚠️ Error procesando proyecto: {project_error}")
                    # Continuar con el siguiente proyecto sin agregarlo
                    continue
            
            print(f"🏗️ Projects data count: {len(projects_data)}")
            return Response(projects_data)
            
        except Exception as e:
            print(f"❌ Error general listando proyectos: {e}")
            # En caso de error total, devolver array vacío en lugar de error 500
            print("🔄 Devolviendo array vacío para evitar error 500")
            return Response([])

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().prefetch_related('images')
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ProductFilter
    search_fields = ['name', 'description']
    ordering_fields = ['price', 'area_m2', 'created_at']

class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Asegurar que los usuarios solo puedan ver sus propias órdenes
        return Order.objects.filter(user=self.request.user).prefetch_related('items__product')

    def create(self, request, *args, **kwargs):
        print(f"🔍 OrderViewSet.create() called")
        print(f"🔍 Request data: {request.data}")
        print(f"🔍 Request user: {request.user}")
        print(f"🔍 User is authenticated: {request.user.is_authenticated}")
        
        serializer = self.get_serializer(data=request.data)
        print(f"🔍 Serializer created")
        
        if serializer.is_valid():
            print(f"🔍 Serializer is valid")
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        else:
            print(f"❌ Serializer errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def perform_create(self, serializer):
        # Asignar el usuario actual a la orden al crearla
        print(f"🔍 OrderViewSet.perform_create() called")
        print(f"🔍 Request user: {self.request.user}")
        print(f"🔍 Serializer data: {serializer.validated_data}")
        serializer.save(user=self.request.user)
        print(f"🔍 Order saved successfully")

class ProductImageViewSet(viewsets.ModelViewSet):
    queryset = ProductImage.objects.all()
    serializer_class = ProductImageSerializer

class PublicMarketplaceProductViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet público para productos del marketplace (solo lectura)
    """
    queryset = MarketplaceProduct.objects.filter(is_active=True).defer('included_items', 'not_included_items', 'features', 'main_level_images')
    serializer_class = MarketplaceProductSerializer
    permission_classes = [AllowAny]
    lookup_field = 'id'
    
    def list(self, request, *args, **kwargs):
        """Listar productos del marketplace público"""
        print("🛍️ PublicMarketplaceProductViewSet.list() - Iniciando...")
        print(f"🛍️ Request user: {request.user}")
        print(f"🛍️ Request method: {request.method}")
        print(f"🛍️ Request path: {request.path}")
        
        try:
            # Usar solo campos básicos para evitar errores de columnas JSON
            basic_queryset = self.get_queryset().values(
                'id', 'name', 'description', 'category', 'style', 'price',
                'area_m2', 'rooms', 'bathrooms', 'floors', 'image', 
                'is_featured', 'is_active', 'area_sqft', 'area_unit', 
                'garage_spaces', 'created_at', 'updated_at'
            )
            
            print(f"🛍️ Queryset count: {basic_queryset.count()}")
            
            # Convertir a lista de diccionarios para el response
            products_data = list(basic_queryset)
            
            # Agregar URLs de imagen
            for product in products_data:
                if product['image']:
                    product['image'] = request.build_absolute_uri(f"/media/{product['image']}")
                else:
                    product['image'] = None
            
            print(f"🛍️ Products data count: {len(products_data)}")
            
            return Response(products_data)
        except Exception as e:
            print(f"❌ Error en PublicMarketplaceProductViewSet.list(): {e}")
            return Response({'error': str(e)}, status=500)
    
    @action(detail=False, methods=['get'])
    def filters(self, request):
        """Obtener configuraciones de filtros para el marketplace"""
        from design.models import FilterConfiguration
        from design.serializers import FilterConfigurationSerializer
        
        try:
            filters = FilterConfiguration.objects.all()
            serializer = FilterConfigurationSerializer(filters, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({'error': str(e)}, status=500)

@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_request(request):
    try:
        email = request.data.get('email')
        User = get_user_model()
        user = User.objects.filter(email=email).first()
        
        if user:
            # Generate reset token
            token = jwt.encode({
                'user_id': user.id,
                'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
            }, settings.SECRET_KEY, algorithm='HS256')
            
            # Send reset email
            reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"
            send_mail(
                'Password Reset Request',
                f'Click the following link to reset your password: {reset_url}',
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=False,
            )
            
            return Response({
                'message': 'If the email exists, password reset instructions have been sent.'
            })
        
        # Return same message even if user doesn't exist (security)
        return Response({
            'message': 'If the email exists, password reset instructions have been sent.'
        })
        
    except Exception as e:
        return Response({
            'error': 'Could not process reset request'
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_data(request):
    """
    Endpoint para obtener los datos del usuario autenticado
    """
    try:
        user = request.user
        serializer = UserSerializer(user)
        return Response(serializer.data)
    except Exception as e:
        return Response({
            'error': 'Error al obtener datos del usuario',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_user_data(request):
    """
    Endpoint para actualizar los datos del usuario
    """
    try:
        user = request.user
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')

        # Si se está intentando cambiar la contraseña, verificar la actual
        if new_password:
            if not current_password:
                return Response({
                    'error': 'Se requiere la contraseña actual para cambiar la contraseña'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if not user.check_password(current_password):
                return Response({
                    'error': 'La contraseña actual es incorrecta'
                }, status=status.HTTP_400_BAD_REQUEST)

        # Preparar los datos para actualizar
        update_data = {
            'username': request.data.get('username', user.username),
            'email': request.data.get('email', user.email),
        }

        # Verificar si el email ya existe para otro usuario
        if update_data['email'] != user.email and User.objects.filter(email=update_data['email']).exists():
            return Response({
                'error': 'Este email ya está en uso'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Verificar si el username ya existe para otro usuario
        if update_data['username'] != user.username and User.objects.filter(username=update_data['username']).exists():
            return Response({
                'error': 'Este nombre de usuario ya está en uso'
            }, status=status.HTTP_400_BAD_REQUEST)

        serializer = UserSerializer(user, data=update_data, partial=True)
        if serializer.is_valid():
            user = serializer.save()
            
            # Actualizar la contraseña si se proporcionó una nueva
            if new_password:
                user.set_password(new_password)
                user.save()

            return Response({
                'message': 'Datos actualizados correctamente',
                'user': UserSerializer(user).data
            })
        
        return Response({
            'error': 'Datos inválidos',
            'details': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        return Response({
            'error': 'Error al actualizar datos del usuario',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_orders(request):
    """
    Endpoint para obtener los pedidos del usuario autenticado
    """
    logger = logging.getLogger(__name__)
    
    try:
        logger.info(f"Intentando obtener pedidos para el usuario: {request.user.username}")
        
        # Verificar que el usuario está autenticado
        if not request.user.is_authenticated:
            logger.error("Usuario no autenticado")
            return Response({
                'error': 'Usuario no autenticado'
            }, status=status.HTTP_401_UNAUTHORIZED)

        # Obtener los pedidos con sus items y productos relacionados
        logger.info("Consultando pedidos en la base de datos")
        orders = Order.objects.filter(
            user=request.user
        ).prefetch_related(
            'items',
            'items__product'
        ).order_by('-created_at')

        logger.info(f"Encontrados {orders.count()} pedidos")

        # Si no hay pedidos, devolver lista vacía
        if not orders.exists():
            logger.info("No se encontraron pedidos")
            return Response([])

        # Serializar los pedidos
        logger.info("Serializando pedidos")
        serializer = OrderSerializer(orders, many=True)
        logger.info("Pedidos serializados correctamente")
        
        return Response(serializer.data)

    except Exception as e:
        logger.error(f"Error al obtener pedidos: {str(e)}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        return Response({
            'error': 'Error al cargar los pedidos',
            'details': str(e),
            'trace': traceback.format_exc()
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def create_payment_intent(request):
    """
    Crear un PaymentIntent de Stripe
    """
    try:
        # Validar configuración de Stripe
        is_valid, message = validate_stripe_config()
        if not is_valid:
            return Response({
                'error': message
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        data = request.data
        amount = data.get('amount')  # En centavos
        currency = data.get('currency', 'usd')
        order_id = data.get('order_id')
        customer_email = data.get('customer_email')
        discount_code = data.get('discount_code')
        discount_amount = data.get('discount_amount', 0)  # En centavos

        # Crear metadata con información del descuento
        metadata = {
            'order_id': order_id,
            'customer_email': customer_email
        }
        
        if discount_code:
            metadata['discount_code'] = discount_code
            metadata['discount_amount'] = str(discount_amount)

        # Crear el PaymentIntent usando la función de Stripe
        from Back.stripe_config import create_payment_intent as create_stripe_payment_intent
        payment_intent = create_stripe_payment_intent(
            amount=amount,
            currency=currency,
            metadata=metadata
        )

        return Response({
            'client_secret': payment_intent.client_secret,
            'payment_intent_id': payment_intent.id
        })

    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def confirm_payment(request):
    """
    Confirmar un pago de Stripe
    """
    try:
        # Validar configuración de Stripe
        is_valid, message = validate_stripe_config()
        if not is_valid:
            return Response({
                'error': message
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        data = request.data
        payment_intent_id = data.get('payment_intent_id')
        order_id = data.get('order_id')

        # Obtener el PaymentIntent usando la función de Stripe
        from Back.stripe_config import confirm_payment as confirm_stripe_payment
        payment_intent = confirm_stripe_payment(payment_intent_id)

        if payment_intent.status == 'succeeded':
            # Actualizar el estado de la orden
            try:
                order = Order.objects.get(id=order_id)
                order.status = 'paid'
                order.stripe_payment_intent_id = payment_intent_id
                order.save()
                
                return Response({
                    'success': True,
                    'message': 'Pago confirmado exitosamente'
                })
            except Order.DoesNotExist:
                return Response({
                    'error': 'Orden no encontrada'
                }, status=status.HTTP_404_NOT_FOUND)
        else:
            return Response({
                'error': 'El pago no fue exitoso'
            }, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def stripe_webhook(request):
    """
    Webhook de Stripe para procesar eventos de pago
    """
    try:
        # Obtener el payload del webhook
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
        
        # Verificar la firma del webhook
        from Back.stripe_config import STRIPE_CONFIG
        webhook_secret = STRIPE_CONFIG['webhook_secret']
        
        if not webhook_secret:
            logger.warning("Webhook secret no configurado")
            return Response({'error': 'Webhook secret no configurado'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, webhook_secret
            )
        except ValueError as e:
            logger.error(f"Error al parsear el payload: {e}")
            return Response({'error': 'Invalid payload'}, status=status.HTTP_400_BAD_REQUEST)
        except stripe.error.SignatureVerificationError as e:
            logger.error(f"Error de verificación de firma: {e}")
            return Response({'error': 'Invalid signature'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Manejar el evento
        if event['type'] == 'payment_intent.succeeded':
            payment_intent = event['data']['object']
            logger.info(f"Pago exitoso: {payment_intent['id']}")
            
            # Actualizar la orden si existe
            order_id = payment_intent.get('metadata', {}).get('order_id')
            if order_id:
                try:
                    order = Order.objects.get(id=order_id)
                    order.status = 'paid'
                    order.stripe_payment_intent_id = payment_intent['id']
                    order.save()
                    logger.info(f"Orden {order_id} actualizada como pagada")
                except Order.DoesNotExist:
                    logger.warning(f"Orden {order_id} no encontrada")
            
        elif event['type'] == 'payment_intent.payment_failed':
            payment_intent = event['data']['object']
            logger.warning(f"Pago fallido: {payment_intent['id']}")
            
            # Actualizar la orden si existe
            order_id = payment_intent.get('metadata', {}).get('order_id')
            if order_id:
                try:
                    order = Order.objects.get(id=order_id)
                    order.status = 'failed'
                    order.save()
                    logger.info(f"Orden {order_id} marcada como fallida")
                except Order.DoesNotExist:
                    logger.warning(f"Orden {order_id} no encontrada")
        
        return Response({'status': 'success'})
        
    except Exception as e:
        logger.error(f"Error en webhook: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def stripe_config(request):
    """
    Endpoint para obtener la configuración de Stripe del frontend
    """
    try:
        is_valid, message = validate_stripe_config()
        return Response({
            'stripe_configured': is_valid,
            'publishable_key': settings.STRIPE_PUBLISHABLE_KEY,
            'message': message
        })
    except Exception as e:
        return Response({
            'stripe_configured': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def create_payment_method_view(request):
    """
    Crea un PaymentMethod de Stripe
    """
    try:
        # Validar configuración de Stripe
        is_valid, message = validate_stripe_config()
        if not is_valid:
            return Response({
                'error': message
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        data = request.data
        type = data.get('type', 'card')
        card_data = data.get('card')
        billing_details = data.get('billing_details')

        # Crear el PaymentMethod
        from Back.stripe_config import create_payment_method
        payment_method = create_payment_method(
            type=type,
            card_data=card_data,
            billing_details=billing_details
        )

        return Response({
            'id': payment_method.id,
            'type': payment_method.type,
            'card': payment_method.card if hasattr(payment_method, 'card') else None,
            'billing_details': payment_method.billing_details
        })

    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def create_customer_view(request):
    """
    Crea un Customer de Stripe
    """
    try:
        # Validar configuración de Stripe
        is_valid, message = validate_stripe_config()
        if not is_valid:
            return Response({
                'error': message
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        data = request.data
        email = data.get('email')
        name = data.get('name')
        metadata = data.get('metadata')

        if not email:
            return Response({
                'error': 'Email es requerido'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Crear el Customer
        from Back.stripe_config import create_customer
        customer = create_customer(
            email=email,
            name=name,
            metadata=metadata
        )

        return Response({
            'id': customer.id,
            'email': customer.email,
            'name': customer.name,
            'created': customer.created
        })

    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def create_checkout_session_view(request):
    """
    Crea una sesión de checkout de Stripe
    """
    try:
        # Validar configuración de Stripe
        is_valid, message = validate_stripe_config()
        if not is_valid:
            return Response({
                'error': message
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        data = request.data
        line_items = data.get('line_items', [])
        success_url = data.get('success_url')
        cancel_url = data.get('cancel_url')
        customer_email = data.get('customer_email')
        metadata = data.get('metadata')

        if not line_items:
            return Response({
                'error': 'line_items es requerido'
            }, status=status.HTTP_400_BAD_REQUEST)

        if not success_url or not cancel_url:
            return Response({
                'error': 'success_url y cancel_url son requeridos'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Crear la sesión de checkout
        from Back.stripe_config import create_checkout_session
        session = create_checkout_session(
            line_items=line_items,
            success_url=success_url,
            cancel_url=cancel_url,
            customer_email=customer_email,
            metadata=metadata
        )

        return Response({
            'id': session.id,
            'url': session.url,
            'payment_intent': session.payment_intent if hasattr(session, 'payment_intent') else None
        })

    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def refund_payment_view(request):
    """
    Reembolsa un pago
    """
    try:
        # Validar configuración de Stripe
        is_valid, message = validate_stripe_config()
        if not is_valid:
            return Response({
                'error': message
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        data = request.data
        payment_intent_id = data.get('payment_intent_id')
        amount = data.get('amount')  # En centavos
        reason = data.get('reason', 'requested_by_customer')

        if not payment_intent_id:
            return Response({
                'error': 'payment_intent_id es requerido'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Crear el reembolso
        from Back.stripe_config import refund_payment
        refund = refund_payment(
            payment_intent_id=payment_intent_id,
            amount=amount,
            reason=reason
        )

        return Response({
            'id': refund.id,
            'amount': refund.amount,
            'status': refund.status,
            'reason': refund.reason
        })

    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([AllowAny])
def test_stripe_connection_view(request):
    """
    Endpoint para probar la conexión con Stripe
    """
    try:
        from Back.stripe_config import test_stripe_connection
        is_success, message = test_stripe_connection()
        
        return Response({
            'success': is_success,
            'message': message,
            'timestamp': timezone.now().isoformat()
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e),
            'timestamp': timezone.now().isoformat()
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def test_payment_method_view(request):
    """
    Endpoint para crear un PaymentMethod de prueba
    """
    try:
        from Back.stripe_config import create_test_payment_method
        
        # Crear PaymentMethod de prueba
        payment_method_id = create_test_payment_method()
        
        if payment_method_id:
            return Response({
                'success': True,
                'payment_method_id': payment_method_id,
                'message': 'PaymentMethod de prueba creado exitosamente'
            })
        else:
            return Response({
                'success': False,
                'error': 'No se pudo crear el PaymentMethod de prueba'
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def validate_discount_view(request):
    """
    Endpoint para validar códigos de descuento
    """
    try:
        code = request.data.get('code', '').upper()
        amount = request.data.get('amount', 0)  # En centavos
        currency = request.data.get('currency', 'usd')

        # Códigos de descuento de prueba
        discount_codes = {
            'DESCUENTO20': {
                'percentage': 20,
                'min_amount': 1000,  # $10.00 en centavos
                'max_discount': 5000,  # $50.00 en centavos
                'active': True
            },
            'WELCOME10': {
                'percentage': 10,
                'min_amount': 500,   # $5.00 en centavos
                'max_discount': 2000, # $20.00 en centavos
                'active': True
            },
            'FLASH25': {
                'percentage': 25,
                'min_amount': 2000,  # $20.00 en centavos
                'max_discount': 10000, # $100.00 en centavos
                'active': True
            }
        }

        # Verificar si el código existe y está activo
        if code not in discount_codes or not discount_codes[code]['active']:
            return Response({
                'error': 'Código de descuento inválido o inactivo'
            }, status=status.HTTP_400_BAD_REQUEST)

        discount_info = discount_codes[code]

        # Verificar monto mínimo
        if amount < discount_info['min_amount']:
            return Response({
                'error': f'Monto mínimo requerido: {discount_info["min_amount"]/100:.2f} {currency.upper()}'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Calcular descuento
        discount_amount = (amount * discount_info['percentage']) / 100

        # Aplicar límite máximo
        if discount_amount > discount_info['max_discount']:
            discount_amount = discount_info['max_discount']

        return Response({
            'success': True,
            'code': code,
            'percentage': discount_info['percentage'],
            'amount': discount_amount / 100,  # Convertir de centavos a unidades
            'message': f'Descuento del {discount_info["percentage"]}% aplicado'
        })

    except Exception as e:
        return Response({
            'error': f'Error al validar código de descuento: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
