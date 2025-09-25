from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.core.mail import send_mail, EmailMessage
from django.template.loader import render_to_string
from django.conf import settings
import stripe
import os
from datetime import datetime
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views import View
from django.http import JsonResponse
from django.utils import timezone
from django.contrib.auth.models import User

from .models import (
    MarketplaceProduct, MarketplaceProductImage, Cart, CartItem, MarketplaceOrder, 
    MarketplaceOrderItem, ProductFavorite, OrderZipFile
)
from .serializers import (
    MarketplaceProductSerializer, CartSerializer, CartItemSerializer,
    MarketplaceOrderSerializer, MarketplaceOrderItemSerializer, ProductFavoriteSerializer
)

# Configurar Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY

class MarketplaceProductViewSet(viewsets.ModelViewSet):
    """
    ViewSet para productos del marketplace
    """
    queryset = MarketplaceProduct.objects.filter(is_active=True)
    serializer_class = MarketplaceProductSerializer
    permission_classes = [AllowAny]

    def list(self, request, *args, **kwargs):
        """Listar productos del marketplace"""
        print("🛍️ MarketplaceProductViewSet.list() - Iniciando...")
        print(f"🛍️ Request user: {request.user}")
        print(f"🛍️ Request method: {request.method}")
        print(f"🛍️ Request path: {request.path}")
        
        try:
            queryset = self.filter_queryset(self.get_queryset())
            print(f"🛍️ Queryset count: {queryset.count()}")
            
            serializer = self.get_serializer(queryset, many=True)
            print(f"🛍️ Serializer data count: {len(serializer.data)}")
            
            return Response(serializer.data)
        except Exception as e:
            print(f"❌ Error en MarketplaceProductViewSet.list(): {e}")
            return Response({'error': str(e)}, status=500)

    def create(self, request, *args, **kwargs):
        """Crear producto con imágenes múltiples"""
        with transaction.atomic():
            # Crear el producto
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            product = serializer.save()
            
            # Procesar imágenes múltiples
            images = request.FILES.getlist('images')
            for image in images:
                MarketplaceProductImage.objects.create(
                    product=product,
                    image=image
                )
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        """Actualizar producto con imágenes múltiples"""
        with transaction.atomic():
            partial = kwargs.pop('partial', False)
            instance = self.get_object()
            
            print(f"🔄 Actualizando producto #{instance.id}: {instance.name}")
            print(f"📊 Datos recibidos: {request.data}")
            print(f"📁 Archivos recibidos: {request.FILES}")
            print(f"📁 Tipo de request: {type(request)}")
            print(f"📁 Content-Type: {request.content_type}")
            print(f"📁 Método: {request.method}")
            
            # Verificar si hay archivos en el request
            if hasattr(request, 'FILES'):
                print(f"📁 request.FILES existe: {request.FILES}")
                print(f"📁 request.FILES.keys(): {list(request.FILES.keys())}")
                for key, files in request.FILES.items():
                    print(f"📁 Archivo {key}: {files}")
            else:
                print("❌ request.FILES no existe")
            
            serializer = self.get_serializer(instance, data=request.data, partial=partial)
            serializer.is_valid(raise_exception=True)
            product = serializer.save()
            
            # Procesar imagen principal si se proporciona
            if 'image' in request.FILES:
                print(f"🖼️ Procesando imagen principal: {request.FILES['image'].name}")
                product.image = request.FILES['image']
                product.save()
            else:
                print("ℹ️ No hay imagen principal nueva")
            
            # Procesar nuevas imágenes múltiples solo si se proporcionan
            images = request.FILES.getlist('images')
            if images:
                print(f"🖼️ Procesando {len(images)} imágenes múltiples nuevas")
                # Agregar nuevas imágenes sin eliminar las existentes
                for image in images:
                    print(f"🖼️ Agregando imagen nueva: {image.name}")
                    MarketplaceProductImage.objects.create(
                        product=product,
                        image=image
                    )
            else:
                print("ℹ️ No hay imágenes múltiples nuevas para procesar")
            
            # Procesar eliminación de imágenes si se proporciona lista actualizada
            updated_images = request.data.get('updated_images')
            if updated_images:
                try:
                    import json
                    updated_image_urls = json.loads(updated_images)
                    print(f"🗑️ Procesando eliminación de imágenes. Lista actualizada: {len(updated_image_urls)} imágenes")
                    
                    # Solo eliminar imágenes si la lista NO está vacía
                    if len(updated_image_urls) > 0:
                        # Obtener todas las imágenes actuales del producto
                        current_images = MarketplaceProductImage.objects.filter(product=product)
                        print(f"🖼️ Imágenes actuales en BD: {current_images.count()}")
                        
                        # Eliminar imágenes que ya no están en la lista actualizada
                        for current_image in current_images:
                            current_url = current_image.image.url
                            current_filename = current_url.split('/')[-1]
                            
                            # Verificar si la imagen actual está en la lista actualizada
                            image_found = False
                            for updated_url in updated_image_urls:
                                if updated_url.endswith(current_filename):
                                    image_found = True
                                    break
                            
                            if not image_found:
                                print(f"🗑️ Eliminando imagen: {current_image.image.name}")
                                current_image.delete()
                            else:
                                print(f"✅ Manteniendo imagen: {current_image.image.name}")
                        
                        print(f"✅ Eliminación de imágenes completada")
                    else:
                        print("ℹ️ Lista de imágenes actualizada está vacía, no eliminando imágenes existentes")
                except Exception as e:
                    print(f"❌ Error procesando eliminación de imágenes: {e}")
                    import traceback
                    traceback.print_exc()
            
            print(f"✅ Producto #{product.id} actualizado exitosamente")
            return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[AllowAny])
    def add_to_cart(self, request, pk=None):
        """Agregar producto al carrito"""
        # Para desarrollo, aceptar cualquier token
        print("🛒 add_to_cart called - accepting any token for development")
        
        # Para desarrollo, usar el usuario 'juan'
        try:
            user = User.objects.get(username='juan')
        except User.DoesNotExist:
            print("🛒 User 'juan' not found in add_to_cart")
            return Response({'error': 'Usuario no encontrado'}, status=404)
        
        print(f"🛒 add_to_cart() - User: {user.username}, Product ID: {pk}")
        product = self.get_object()
        quantity = int(request.data.get('quantity', 1))
        
        # Obtener información del plan y área
        plan_type = request.data.get('plan_type', 'pdf')  # 'pdf' o 'editable'
        area_unit = request.data.get('area_unit', 'm2')   # 'm2' o 'sqft'
        
        # Obtener el precio del request o usar el precio del producto
        custom_price = request.data.get('price')
        if custom_price:
            price = float(custom_price)
            print(f"🛒 Using custom price: ${price}")
        else:
            price = float(product.price)
            print(f"🛒 Using product price: ${price}")
        
        print(f"🛒 Product: {product.name}, Price: ${price}, Quantity: {quantity}")
        print(f"🛒 Plan Type: {plan_type}, Area Unit: {area_unit}")
        print(f"🛒 Product base price: ${product.price}")

        # Obtener o crear carrito activo
        # Primero, desactivar todos los carritos activos del usuario
        Cart.objects.filter(user=user, is_active=True).update(is_active=False)
        
        # Luego, obtener el carrito más reciente o crear uno nuevo
        cart = Cart.objects.filter(user=user).order_by('-created_at').first()
        
        if not cart:
            # Si no hay carritos, crear uno nuevo
            cart = Cart.objects.create(user=user, is_active=True)
            created = True
        else:
            # Reactivar el carrito más reciente
            cart.is_active = True
            cart.save()
            created = False
        
        print(f"🛒 Cart: #{cart.id} (created: {created})")

        # Verificar si ya existe un item para este producto
        existing_item = CartItem.objects.filter(cart=cart, product=product).first()
        
        if existing_item:
            # Si ya existe, reemplazar completamente (no sumar cantidad)
            existing_item.quantity = quantity
            existing_item.price = price  # Actualizar precio por si cambió el plan
            existing_item.save()
            print(f"🛒 Updated existing item #{existing_item.id} - quantity: {existing_item.quantity}, price: ${existing_item.price}")
            cart_item = existing_item
        else:
            # Si no existe, crear nuevo item con el precio especificado
            cart_item = CartItem.objects.create(
                cart=cart,
                product=product,
                quantity=quantity,
                price=price
            )
            print(f"🛒 Created new item #{cart_item.id} - quantity: {quantity}, price: ${price}")
            print(f"🛒 Plan: {plan_type}, Area Unit: {area_unit}")

        # Verificar el carrito después de agregar el item
        cart.refresh_from_db()
        print(f"🛒 Cart now has {cart.items.count()} items, total: ${cart.total}")
        
        serializer = CartSerializer(cart)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def toggle_favorite(self, request, pk=None):
        """Alternar producto en favoritos"""
        product = self.get_object()
        user = request.user

        favorite, created = ProductFavorite.objects.get_or_create(
            user=user,
            product=product
        )

        if not created:
            favorite.delete()
            return Response({'favorited': False})

        return Response({'favorited': True})

class CartViewSet(viewsets.ModelViewSet):
    """
    ViewSet para el carrito de compras
    """
    serializer_class = CartSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        # Para desarrollo, usar el usuario 'juan' directamente
        try:
            user = User.objects.get(username='juan')
            print(f"🛒 CartViewSet.get_queryset() - User: {user.username}")
            queryset = Cart.objects.filter(user=user, is_active=True)
            print(f"🛒 Found {queryset.count()} active carts for user")
            return queryset
        except User.DoesNotExist:
            print("🛒 User 'juan' not found")
            return Cart.objects.none()

    def list(self, request, *args, **kwargs):
        """Listar carritos del usuario (solo debería haber uno activo)"""
        try:
            # Para desarrollo, usar el usuario 'juan' directamente
            try:
                user = User.objects.get(username='juan')
                print(f"🛒 CartViewSet.list() - User: {user.username}")
                
                queryset = Cart.objects.filter(user=user, is_active=True)
                print(f"🛒 Queryset count: {queryset.count()}")
                
                if queryset.exists():
                    cart = queryset.first()
                    print(f"🛒 Found cart #{cart.id} with {cart.items.count()} items")
                    serializer = self.get_serializer(cart)
                    return Response(serializer.data)
                else:
                    print(f"🛒 No active cart found for user")
                    # Crear un carrito vacío para el usuario
                    cart = Cart.objects.create(user=user, is_active=True)
                    print(f"🛒 Created new empty cart #{cart.id}")
                    serializer = self.get_serializer(cart)
                    return Response(serializer.data)
            except User.DoesNotExist:
                print("🛒 User 'juan' not found")
                return Response({'error': 'Usuario no encontrado'}, status=404)
        except Exception as e:
            print(f"❌ Error in CartViewSet.list(): {e}")
            return Response({'error': str(e)}, status=500)

    @action(detail=False, methods=['post'])
    def checkout(self, request):
        """Procesar checkout del carrito (llamado desde Next.js)"""
        try:
            # Obtener usuario para desarrollo si no hay autenticación
            user = request.user
            if not getattr(user, 'is_authenticated', False):
                try:
                    user = User.objects.get(username='juan')
                    print("🛒 checkout() - Modo dev: usando usuario 'juan'")
                except User.DoesNotExist:
                    return Response({'error': "Usuario de desarrollo 'juan' no existe"}, status=400)

            # Obtener el carrito activo del usuario
            cart = Cart.objects.filter(user=user, is_active=True).first()
            
            if not cart:
                return Response({'error': 'No hay carrito activo'}, status=400)
            
            print(f"🛒 Procesando checkout para carrito #{cart.id}")
            print(f"🛒 Usuario: {user.username}")
            print(f"🛒 Total del carrito: ${cart.total}")
            print(f"🛒 Items en el carrito: {cart.items.count()}")
            
            if not cart.items.exists():
                return Response({'error': 'Carrito vacío'}, status=400)

            # Crear payment intent con Stripe
            print(f"💳 Creando PaymentIntent con Stripe...")
            payment_intent = stripe.PaymentIntent.create(
                amount=int(cart.total * 100),  # Stripe usa centavos
                currency='usd',
                metadata={
                    'cart_id': cart.id,
                    'user_id': user.id,
                    'user_email': user.email
                }
            )
            print(f"💳 PaymentIntent creado: {payment_intent.id}")

            # Crear orden
            with transaction.atomic():
                print(f"📦 Creando orden en la base de datos...")
                order = MarketplaceOrder.objects.create(
                    user=user,
                    stripe_payment_intent_id=payment_intent.id,
                    total_amount=cart.total,
                    status='pending'
                )
                print(f"📦 Orden creada: #{order.id}")

                # Crear items de la orden
                print(f"📦 Creando items de la orden...")
                for item in cart.items.all():
                    MarketplaceOrderItem.objects.create(
                        order=order,
                        product=item.product,
                        quantity=item.quantity,
                        price=item.price
                    )
                    print(f"📦 Item agregado: {item.product.name} x{item.quantity}")

                # Desactivar carrito
                cart.is_active = False
                cart.save()
                print(f"🛒 Carrito desactivado")

            print(f"✅ Checkout completado exitosamente")
            print(f"📦 Orden #{order.id} creada y lista para pago")
            
            return Response({
                'order_id': order.id,
                'client_secret': payment_intent.client_secret,
                'total': float(cart.total),
                'payment_intent_id': payment_intent.id
            })

        except Exception as e:
            print(f"❌ Error en checkout: {e}")
            return Response({'error': str(e)}, status=500)



    @action(detail=True, methods=['post'])
    def update_item(self, request, pk=None):
        """Actualizar cantidad de un item"""
        cart = self.get_object()
        item_id = request.data.get('item_id')
        quantity = int(request.data.get('quantity', 1))

        try:
            item = CartItem.objects.get(id=item_id, cart=cart)
            if quantity <= 0:
                item.delete()
            else:
                item.quantity = quantity
                item.save()
        except CartItem.DoesNotExist:
            return Response({'error': 'Item no encontrado'}, status=400)

        serializer = CartSerializer(cart)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def remove_item(self, request, pk=None):
        """Remover item del carrito"""
        cart = self.get_object()
        item_id = request.data.get('item_id')

        try:
            item = CartItem.objects.get(id=item_id, cart=cart)
            item.delete()
        except CartItem.DoesNotExist:
            return Response({'error': 'Item no encontrado'}, status=400)

        serializer = CartSerializer(cart)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def checkout(self, request):
        """Procesar checkout del carrito (llamado desde Next.js)"""
        try:
            # Obtener usuario para desarrollo si no hay autenticación
            user = request.user
            if not getattr(user, 'is_authenticated', False):
                try:
                    user = User.objects.get(username='juan')
                    print("🛒 checkout() - Modo dev: usando usuario 'juan'")
                except User.DoesNotExist:
                    return Response({'error': "Usuario de desarrollo 'juan' no existe"}, status=400)

            # Obtener el carrito activo del usuario
            cart = Cart.objects.filter(user=user, is_active=True).first()
            
            if not cart:
                return Response({'error': 'No hay carrito activo'}, status=400)
            
            print(f"🛒 Procesando checkout para carrito #{cart.id}")
            print(f"🛒 Usuario: {user.username}")
            print(f"🛒 Total del carrito: ${cart.total}")
            print(f"🛒 Items en el carrito: {cart.items.count()}")
            
            if not cart.items.exists():
                return Response({'error': 'Carrito vacío'}, status=400)

            # Crear payment intent con Stripe
            print(f"💳 Creando PaymentIntent con Stripe...")
            payment_intent = stripe.PaymentIntent.create(
                amount=int(cart.total * 100),  # Stripe usa centavos
                currency='usd',
                metadata={
                    'cart_id': cart.id,
                    'user_id': user.id,
                    'user_email': user.email
                }
            )
            print(f"💳 PaymentIntent creado: {payment_intent.id}")

            # Crear orden
            with transaction.atomic():
                print(f"📦 Creando orden en la base de datos...")
                order = MarketplaceOrder.objects.create(
                    user=user,
                    stripe_payment_intent_id=payment_intent.id,
                    total_amount=cart.total,
                    status='pending'
                )
                print(f"📦 Orden creada: #{order.id}")

                # Crear items de la orden
                print(f"📦 Creando items de la orden...")
                for item in cart.items.all():
                    MarketplaceOrderItem.objects.create(
                        order=order,
                        product=item.product,
                        quantity=item.quantity,
                        price=item.price
                    )
                    print(f"📦 Item agregado: {item.product.name} x{item.quantity}")

                # Desactivar carrito
                cart.is_active = False
                cart.save()
                print(f"🛒 Carrito desactivado")

            print(f"✅ Checkout completado exitosamente")
            print(f"📦 Orden #{order.id} creada y lista para pago")
            
            return Response({
                'order_id': order.id,
                'client_secret': payment_intent.client_secret,
                'total': float(cart.total),
                'payment_intent_id': payment_intent.id
            })

        except Exception as e:
            print(f"❌ Error en checkout: {e}")
            return Response({'error': str(e)}, status=500)

    @action(detail=True, methods=['post'])
    def checkout_cart(self, request, pk=None):
        """Procesar checkout del carrito"""
        cart = self.get_object()
        
        print(f"🛒 Procesando checkout para carrito #{cart.id}")
        print(f"🛒 Usuario: {request.user.username}")
        print(f"🛒 Total del carrito: ${cart.total}")
        print(f"🛒 Items en el carrito: {cart.items.count()}")
        
        if not cart.items.exists():
            return Response({'error': 'Carrito vacío'}, status=400)

        # Crear payment intent con Stripe
        try:
            print(f"💳 Creando PaymentIntent con Stripe...")
            payment_intent = stripe.PaymentIntent.create(
                amount=int(cart.total * 100),  # Stripe usa centavos
                currency='usd',
                metadata={
                    'cart_id': cart.id,
                    'user_id': request.user.id,
                    'user_email': request.user.email
                }
            )
            print(f"💳 PaymentIntent creado: {payment_intent.id}")

            # Crear orden
            with transaction.atomic():
                print(f"📦 Creando orden en la base de datos...")
                order = MarketplaceOrder.objects.create(
                    user=request.user,
                    stripe_payment_intent_id=payment_intent.id,
                    total_amount=cart.total,
                    status='pending'
                )
                print(f"📦 Orden creada: #{order.id}")

                # Crear items de la orden
                print(f"📦 Creando items de la orden...")
                for item in cart.items.all():
                    MarketplaceOrderItem.objects.create(
                        order=order,
                        product=item.product,
                        quantity=item.quantity,
                        price=item.price
                    )
                    print(f"📦 Item agregado: {item.product.name} x{item.quantity}")

                # Desactivar carrito
                cart.is_active = False
                cart.save()
                print(f"🛒 Carrito desactivado")

            print(f"✅ Checkout completado exitosamente")
            print(f"📦 Orden #{order.id} creada y lista para pago")
            
            # Marcar la orden como completada inmediatamente (para pruebas)
            order.status = 'completed'
            order.save()
            print(f"✅ Orden #{order.id} marcada como completada")
            
            # Enviar factura automáticamente
            try:
                print(f"📧 Enviando factura automática para orden #{order.id}")
                self.send_invoice_automatically(order)
                print(f"📧 Factura enviada exitosamente para orden #{order.id}")
            except Exception as e:
                print(f"❌ Error enviando factura: {e}")
            
            return Response({
                'order_id': order.id,
                'client_secret': payment_intent.client_secret,
                'total': float(cart.total),
                'payment_intent_id': payment_intent.id
            })

        except Exception as e:
            print(f"❌ Error en checkout: {e}")
            return Response({'error': str(e)}, status=500)

class MarketplaceOrderViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para órdenes del marketplace
    """
    serializer_class = MarketplaceOrderSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        # En desarrollo, si no hay usuario autenticado, usar el usuario 'juan'
        try:
            if hasattr(self.request, 'user') and self.request.user and self.request.user.is_authenticated:
                return MarketplaceOrder.objects.filter(user=self.request.user)
            from django.contrib.auth.models import User
            dev_user = User.objects.get(username='juan')
            return MarketplaceOrder.objects.filter(user=dev_user)
        except Exception:
            return MarketplaceOrder.objects.none()

    @action(detail=True, methods=['post'])
    def confirm_payment(self, request, pk=None):
        """Confirmar pago y enviar archivos ZIP"""
        order = self.get_object()
        
        if order.status != 'pending':
            return Response({'error': 'Orden ya procesada'}, status=400)

        try:
            # Verificar pago con Stripe
            payment_intent = stripe.PaymentIntent.retrieve(order.stripe_payment_intent_id)
            
            if payment_intent.status == 'succeeded':
                # Actualizar estado de la orden
                order.status = 'paid'
                order.save()

                # Enviar archivos ZIP por email
                self.send_zip_files(order)

                return Response({'status': 'success', 'message': 'Pago confirmado y archivos enviados'})
            else:
                return Response({'error': 'Pago no completado'}, status=400)

        except Exception as e:
            return Response({'error': str(e)}, status=500)

    def send_zip_files(self, order):
        """Enviar archivos ZIP por email"""
        try:
            # Usar el email del cliente desde la orden o el del usuario registrado
            client_email = order.customer_email or order.user.email
            print(f"📧 Email del cliente para ZIP: {client_email}")
            
            # Preparar archivos para envío
            zip_files = []
            for item in order.items.all():
                if item.product.zip_file:
                    zip_files.append({
                        'name': f"{item.product.name}.zip",
                        'path': item.product.zip_file.path
                    })
                    item.zip_sent = True
                    item.zip_sent_at = datetime.now()
                    item.save()

            if zip_files:
                # Enviar email
                subject = f'Archivos de tu compra - Orden #{order.id}'
                message = render_to_string('marketplace/email/zip_files.html', {
                    'order': order,
                    'zip_files': zip_files
                })

                send_mail(
                    subject=subject,
                    message='',
                    html_message=message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[client_email],
                    fail_silently=False
                )

                order.zip_files_sent = True
                order.save()

        except Exception as e:
            print(f"Error enviando archivos ZIP: {e}")

    @action(detail=True, methods=['post'], permission_classes=[])
    def send_invoice(self, request, pk=None):
        """Enviar factura al admin y al cliente"""
        order = self.get_object()
        
        try:
            admin_email = request.data.get('admin_email', 'urbanunitystudios@gmail.com')
            message = request.data.get('message', 'Se ha realizado una nueva compra. Los archivos serán enviados al cliente en los próximos 3 días hábiles.')
            
            # Determinar email del cliente de forma robusta
            client_email = order.customer_email or getattr(order.user, 'email', None)
            if not client_email:
                # Fallback: usar metadata si existiera
                client_email = ''
            
            # Preparar datos de la orden para el email
            order_items = []
            total = 0
            for item in order.items.all():
                order_items.append({
                    'name': item.product.name,
                    'price': float(item.price),
                    'quantity': item.quantity
                })
                total += float(item.price) * item.quantity
            
            # Enviar email al admin
            admin_subject = f'Nueva compra en el marketplace - Orden #{order.id}'
            admin_message = f"""
            Se ha realizado una nueva compra en el marketplace.
            
            Detalles de la orden:
            - ID de orden: {order.id}
            - Cliente: {order.user.username} ({getattr(order.user, 'email', '')})
            - Fecha: {order.created_at.strftime('%d/%m/%Y %H:%M')}
            - Total: ${total:,.2f}
            
            Productos:
            {chr(10).join([f"- {item['name']}: ${item['price']:,.2f} x {item['quantity']}" for item in order_items])}
            
            Mensaje: {message}
            
            Los archivos deben ser enviados al cliente en los próximos 3 días hábiles.
            
            Para contactar al cliente:
            - Email: {client_email or getattr(order.user, 'email', '')}
            - Usuario: {order.user.username}
            """
            
            try:
                send_mail(
                    subject=admin_subject,
                    message=admin_message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[admin_email],
                    fail_silently=False
                )
                print(f"✅ Email enviado al admin: {admin_email}")
            except Exception as e:
                print(f"❌ Error enviando email al admin: {e}")
            
            # Enviar email de confirmación al cliente si tenemos correo
            if client_email:
                client_subject = f'Confirmación de compra - Orden #{order.id} - U2Group'
                client_message = f"""
                ¡Hola {order.user.username}!
                
                ¡Gracias por tu compra! Tu orden #{order.id} ha sido procesada exitosamente.
                
                Detalles de la orden:
                - Fecha: {order.created_at.strftime('%d/%m/%Y %H:%M')}
                - Total: ${total:,.2f}
                
                Productos comprados:
                {chr(10).join([f"- {item['name']}: ${item['price']:,.2f} x {item['quantity']}" for item in order_items])}
                
                Los archivos PDF y editables serán enviados a tu email en los próximos 3 días hábiles.
                
                Si tienes alguna pregunta, no dudes en contactarnos:
                - Email: sales-team@u2.group
                - Teléfono: 3164035330 - 3043618282
                
                Saludos,
                El equipo de U2 Group
                """
                try:
                    send_mail(
                        subject=client_subject,
                        message=client_message,
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        recipient_list=[client_email],
                        fail_silently=False
                    )
                    print(f"✅ Email enviado al cliente: {client_email}")
                except Exception as e:
                    print(f"❌ Error enviando email al cliente: {e}")
            else:
                print("⚠️ No se envió email al cliente porque no hay correo disponible en la orden")
            
            return Response({
                'status': 'success',
                'message': 'Factura enviada (admin y cliente si hay correo)'
            })
        
        except Exception as e:
            print(f"❌ Error general enviando factura: {e}")
            return Response({
                'status': 'error',
                'message': f'Error enviando factura: {str(e)}'
            }, status=500)

class ProductFavoriteViewSet(viewsets.ModelViewSet):
    """
    ViewSet para favoritos del marketplace
    """
    serializer_class = ProductFavoriteSerializer

    def get_permissions(self):
        if self.action == 'count':
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        if self.action == 'count':
            # Para el count, devolver todos los favoritos si el usuario está autenticado
            if self.request.user.is_authenticated:
                return ProductFavorite.objects.filter(user=self.request.user)
            else:
                return ProductFavorite.objects.none()
        return ProductFavorite.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save()

    @action(detail=False, methods=['get'])
    def count(self, request):
        """Obtener contador de favoritos"""
        if request.user.is_authenticated:
            count = self.get_queryset().count()
        else:
            count = 0
        return Response({'count': count}) 

    @action(detail=False, methods=['post'])
    def test_email(self, request):
        """Endpoint de prueba para verificar el envío de emails"""
        try:
            test_email = request.data.get('email', 'urbanunitystudios@gmail.com')
            
            subject = "Prueba de envío de email - U2Group Marketplace"
            message = f"""
            Este es un email de prueba para verificar que el sistema de envío de emails funciona correctamente.
            
            Fecha y hora: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}
            
            Si recibes este email, significa que la configuración de email está funcionando correctamente.
            
            Saludos,
            Equipo U2Group
            """
            
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[test_email],
                fail_silently=False
            )
            
            return Response({
                'status': 'success',
                'message': f'Email de prueba enviado exitosamente a {test_email}'
            })
            
        except Exception as e:
            print(f"❌ Error en prueba de email: {e}")
            return Response({
                'status': 'error',
                'message': f'Error enviando email de prueba: {str(e)}'
            }, status=500) 

    @action(detail=False, methods=['post'])
    def test_invoice_system(self, request):
        """Endpoint de prueba para verificar el sistema de facturas"""
        try:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            
            # Crear datos de prueba
            test_user, created = User.objects.get_or_create(
                username='test_invoice_user',
                defaults={
                    'email': 'test_invoice@example.com',
                    'first_name': 'Test',
                    'last_name': 'Invoice'
                }
            )
            
            # Crear producto de prueba
            test_product, created = MarketplaceProduct.objects.get_or_create(
                name='Producto Test Factura',
                defaults={
                    'description': 'Producto para probar facturas',
                    'price': 50.00,
                    'image': 'test.jpg'
                }
            )
            
            # Crear orden de prueba
            test_order = MarketplaceOrder.objects.create(
                user=test_user,
                total_amount=50.00,
                status='completed'
            )
            
            # Crear item de la orden
            CartItem.objects.create(
                order=test_order,
                product=test_product,
                quantity=1,
                price=50.00
            )
            
            # Probar envío de factura
            admin_email = 'urbanunitystudios@gmail.com'
            message = 'Prueba del sistema de facturas - Los archivos serán enviados en 3 días hábiles.'
            
            # Preparar datos para el email
            order_items = []
            total = 50.00
            order_items.append({
                'name': test_product.name,
                'price': float(test_product.price),
                'quantity': 1
            })

            # Enviar email al admin
            admin_subject = f'Prueba de sistema de facturas - Orden #{test_order.id}'
            admin_message = f"""
            PRUEBA DEL SISTEMA DE FACTURAS
            
            Se ha realizado una prueba del sistema de facturas.
            
            Detalles de la orden de prueba:
            - ID de orden: {test_order.id}
            - Cliente: {test_user.username} ({test_user.email})
            - Fecha: {test_order.created_at.strftime('%d/%m/%Y %H:%M')}
            - Total: ${total:,.2f}
            
            Productos:
            {chr(10).join([f"- {item['name']}: ${item['price']:,.2f} x {item['quantity']}" for item in order_items])}
            
            Mensaje: {message}
            
            Esta es una prueba del sistema. Los archivos deben ser enviados al cliente en los próximos 3 días hábiles.
            
            Para contactar al cliente:
            - Email: {test_user.email}
            - Usuario: {test_user.username}
            """
            
            try:
                send_mail(
                    subject=admin_subject,
                    message=admin_message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[admin_email],
                    fail_silently=False
                )
                print(f"✅ Email de prueba enviado al admin: {admin_email}")
            except Exception as e:
                print(f"❌ Error enviando email de prueba al admin: {e}")

            # Enviar email de confirmación al cliente
            client_subject = f'Prueba de confirmación - Orden #{test_order.id} - U2Group'
            client_message = f"""
            ¡Hola {test_user.username}!
            
            Esta es una PRUEBA del sistema de confirmación de compras.
            
            Detalles de la orden de prueba:
            - Fecha: {test_order.created_at.strftime('%d/%m/%Y %H:%M')}
            - Total: ${total:,.2f}
            
            Productos de prueba:
            {chr(10).join([f"- {item['name']}: ${item['price']:,.2f} x {item['quantity']}" for item in order_items])}
            
            Los archivos PDF y editables serán enviados a tu email en los próximos 3 días hábiles.
            
            Si tienes alguna pregunta, no dudes en contactarnos:
            - Email: sales-team@u2.group
            - Teléfono: 3164035330 - 3043618282
            
            Saludos,
            El equipo de U2 Group
            """
            
            try:
                send_mail(
                    subject=client_subject,
                    message=client_message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[test_user.email],
                    fail_silently=False
                )
                print(f"✅ Email de prueba enviado al cliente: {test_user.email}")
            except Exception as e:
                print(f"❌ Error enviando email de prueba al cliente: {e}")

            # Limpiar datos de prueba
            test_order.delete()
            
            return Response({
                'status': 'success',
                'message': 'Prueba del sistema de facturas completada exitosamente',
                'test_order_id': test_order.id,
                'admin_email_sent': True,
                'client_email_sent': True
            })

        except Exception as e:
            print(f"❌ Error en prueba del sistema de facturas: {e}")
            return Response({
                'status': 'error',
                'message': f'Error en prueba del sistema de facturas: {str(e)}'
            }, status=500) 

    @action(detail=False, methods=['get'])
    def get_order_by_payment_intent(self, request):
        """Obtener orden por payment_intent_id"""
        payment_intent_id = request.query_params.get('payment_intent_id')
        
        if not payment_intent_id:
            return Response({
                'error': 'payment_intent_id es requerido'
            }, status=400)
        
        try:
            order = MarketplaceOrder.objects.get(stripe_payment_intent_id=payment_intent_id)
            
            return Response({
                'success': True,
                'order': {
                    'id': order.id,
                    'user': {
                        'id': order.user.id,
                        'username': order.user.username,
                        'email': order.user.email
                    },
                    'total_amount': float(order.total_amount),
                    'status': order.status,
                    'created_at': order.created_at.isoformat(),
                    'stripe_payment_intent_id': order.stripe_payment_intent_id
                }
            })
        except MarketplaceOrder.DoesNotExist:
            return Response({
                'error': 'Orden no encontrada'
            }, status=404)
        except Exception as e:
            print(f"❌ Error buscando orden por payment_intent_id: {e}")
            return Response({
                'error': f'Error interno: {str(e)}'
            }, status=500) 

@method_decorator(csrf_exempt, name='dispatch')
class StripeWebhookView(View):
    """Webhook para procesar eventos de Stripe"""
    
    def post(self, request, *args, **kwargs):
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
        
        try:
            # Verificar la firma del webhook (en producción)
            # event = stripe.Webhook.construct_event(payload, sig_header, settings.STRIPE_WEBHOOK_SECRET)
            
            # Por ahora, solo parsear el JSON
            import json
            event = json.loads(payload)
            
            print(f"🔔 Webhook recibido: {event['type']}")
            
            if event['type'] == 'payment_intent.succeeded':
                self.handle_payment_succeeded(event['data']['object'])
            elif event['type'] == 'payment_intent.payment_failed':
                self.handle_payment_failed(event['data']['object'])
            elif event['type'] == 'checkout.session.completed':
                self.handle_checkout_completed(event['data']['object'])
            
            return HttpResponse(status=200)
            
        except Exception as e:
            print(f"❌ Error procesando webhook: {e}")
            return HttpResponse(status=400)
    
    def handle_payment_succeeded(self, payment_intent):
        """Manejar pago exitoso"""
        try:
            payment_intent_id = payment_intent['id']
            print(f"✅ Pago exitoso: {payment_intent_id}")
            
            # Buscar la orden por payment_intent_id
            try:
                order = MarketplaceOrder.objects.get(stripe_payment_intent_id=payment_intent_id)
                print(f"📦 Orden encontrada: #{order.id}")
                print(f"📦 Usuario: {order.user.username}")
                print(f"📦 Estado actual: {order.status}")
                
                # Actualizar estado de la orden
                order.status = 'completed'
                order.save()
                print(f"✅ Orden #{order.id} marcada como completada")
                
                # Enviar factura automáticamente
                try:
                    print(f"📧 Enviando factura automática para orden #{order.id}")
                    self.send_invoice_automatically(order)
                    print(f"📧 Factura enviada exitosamente para orden #{order.id}")
                except Exception as e:
                    print(f"❌ Error enviando factura: {e}")
                
            except MarketplaceOrder.DoesNotExist:
                print(f"❌ Orden no encontrada para payment_intent: {payment_intent_id}")
                
        except Exception as e:
            print(f"❌ Error manejando pago exitoso: {e}")
    
    def handle_payment_failed(self, payment_intent):
        """Manejar pago fallido"""
        try:
            payment_intent_id = payment_intent['id']
            print(f"❌ Pago fallido: {payment_intent_id}")
            
            # Buscar la orden y marcarla como fallida
            try:
                order = MarketplaceOrder.objects.get(stripe_payment_intent_id=payment_intent_id)
                order.status = 'failed'
                order.save()
                print(f"❌ Orden #{order.id} marcada como fallida")
            except MarketplaceOrder.DoesNotExist:
                print(f"❌ Orden no encontrada para payment_intent: {payment_intent_id}")
                
        except Exception as e:
            print(f"❌ Error manejando pago fallido: {e}")
    
    def handle_checkout_completed(self, checkout_session):
        """Manejar checkout completado y capturar email del cliente"""
        try:
            payment_intent_id = checkout_session['payment_intent']
            customer_email = checkout_session.get('customer_details', {}).get('email')
            
            print(f"🛒 Checkout completado: {checkout_session['id']}")
            print(f"📧 Email del cliente desde Stripe: {customer_email}")
            print(f"💳 Payment Intent: {payment_intent_id}")
            
            # Buscar la orden por payment_intent_id
            try:
                order = MarketplaceOrder.objects.get(stripe_payment_intent_id=payment_intent_id)
                print(f"📦 Orden encontrada: #{order.id}")
                
                # Actualizar estado de la orden
                order.status = 'completed'
                order.save()
                print(f"✅ Orden #{order.id} marcada como completada")
                
                # Guardar el email del cliente en la orden (prioridad al email de Stripe)
                if customer_email:
                    order.customer_email = customer_email
                    order.save()
                    print(f"📧 Email del cliente guardado desde Stripe: {customer_email}")
                else:
                    print(f"⚠️ No se encontró email del cliente en el checkout de Stripe")
                
                # Enviar factura automáticamente usando el email de Stripe
                try:
                    print(f"📧 Enviando factura automática para orden #{order.id}")
                    self.send_invoice_automatically(order, customer_email)
                    print(f"📧 Factura enviada exitosamente para orden #{order.id}")
                except Exception as e:
                    print(f"❌ Error enviando factura: {e}")
                
            except MarketplaceOrder.DoesNotExist:
                print(f"❌ Orden no encontrada para payment_intent: {payment_intent_id}")
                
        except Exception as e:
            print(f"❌ Error manejando checkout completado: {e}")
    
    def send_invoice_automatically(self, order, customer_email=None):
        """Enviar factura automáticamente al admin y al cliente"""
        try:
            admin_email = 'urbanunitystudios@gmail.com'
            message = 'Se ha realizado una nueva compra. Los archivos serán enviados al cliente en los próximos 3 días hábiles.'
            
            # Prioridad: 1) Email de Stripe, 2) Email guardado en la orden, 3) Email del usuario
            client_email = customer_email or order.customer_email or order.user.email
            print(f"📧 Email del cliente para factura: {client_email}")
            print(f"📧 Email de Stripe: {customer_email}")
            print(f"📧 Email de la orden: {order.customer_email}")
            print(f"📧 Email del usuario: {order.user.email}")
            
            # Preparar datos de la orden para el email
            order_items = []
            total = 0
            for item in order.items.all():
                item_data = {
                    'name': item.product.name,
                    'price': float(item.price),
                    'quantity': item.quantity,
                    'subtotal': float(item.price) * item.quantity
                }
                order_items.append(item_data)
                total += item_data['subtotal']
            
            # Usar el total de la orden si no hay items o si es diferente
            if total == 0 or abs(total - float(order.total_amount)) > 0.01:
                total = float(order.total_amount)
                print(f"💰 Usando total de la orden: ${total}")
            else:
                print(f"💰 Total calculado de items: ${total}")

            # Enviar email al admin usando plantilla HTML
            admin_subject = f'Nueva compra en el marketplace - Orden #{order.id}'
            
            try:
                from django.template.loader import render_to_string
                from django.core.mail import EmailMessage
                from email.mime.image import MIMEImage
                import os
                
                # Renderizar plantilla HTML
                html_message = render_to_string('marketplace/email/invoice_template.html', {
                    'invoice_title': 'Notificación de Nueva Compra',
                    'order': order,
                    'order_items': order_items,
                    'total': total,
                    'message': message
                })
                
                # Crear email con HTML
                email = EmailMessage(
                    subject=admin_subject,
                    body=html_message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    to=[admin_email]
                )
                email.content_subtype = "html"
                
                # Adjuntar logo
                logo_path = os.path.join(settings.BASE_DIR, 'Back', 'templates', 'marketplace', 'email', 'logo.png')
                if os.path.exists(logo_path):
                    with open(logo_path, 'rb') as f:
                        logo_image = MIMEImage(f.read())
                        logo_image.add_header('Content-ID', '<logo>')
                        email.attach(logo_image)
                
                email.send()
                print(f"✅ Email HTML enviado al admin: {admin_email}")
                
            except Exception as e:
                print(f"❌ Error enviando email HTML al admin: {e}")
                # Fallback a email de texto plano
                admin_message = f"""
                Se ha realizado una nueva compra en el marketplace.
                
                Detalles de la orden:
                - ID de orden: {order.id}
                - Cliente: {order.user.username} ({order.user.email})
                - Fecha: {order.created_at.strftime('%d/%m/%Y %H:%M')}
                - Total: ${total:,.2f}
                
                Productos:
                {chr(10).join([f"- {item['name']}: ${item['price']:,.2f} x {item['quantity']}" for item in order_items])}
                
                Mensaje: {message}
                
                Los archivos deben ser enviados al cliente en los próximos 3 días hábiles.
                
                Para contactar al cliente:
                - Email: {order.user.email}
                - Usuario: {order.user.username}
                """
                
                send_mail(
                    subject=admin_subject,
                    message=admin_message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[admin_email],
                    fail_silently=False
                )
                print(f"✅ Email de texto enviado al admin: {admin_email}")

            # Enviar email de confirmación al cliente usando plantilla HTML
            client_subject = f'Confirmación de compra - Orden #{order.id} - U2Group'
            
            try:
                # Renderizar plantilla HTML para cliente
                html_message = render_to_string('marketplace/email/invoice_template.html', {
                    'invoice_title': 'Factura de Compra',
                    'order': order,
                    'order_items': order_items,
                    'total': total,
                    'message': '¡Gracias por tu compra! Tu orden ha sido procesada exitosamente.'
                })
                
                # Crear email con HTML
                email = EmailMessage(
                    subject=client_subject,
                    body=html_message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    to=[client_email]
                )
                email.content_subtype = "html"
                
                # Adjuntar logo
                logo_path = os.path.join(settings.BASE_DIR, 'Back', 'templates', 'marketplace', 'email', 'logo.png')
                if os.path.exists(logo_path):
                    with open(logo_path, 'rb') as f:
                        logo_image = MIMEImage(f.read())
                        logo_image.add_header('Content-ID', '<logo>')
                        email.attach(logo_image)
                
                email.send()
                print(f"✅ Email HTML enviado al cliente: {client_email}")
                
            except Exception as e:
                print(f"❌ Error enviando email HTML al cliente: {e}")
                # Fallback a email de texto plano
                client_message = f"""
                ¡Hola {order.user.username}!
                
                ¡Gracias por tu compra! Tu orden #{order.id} ha sido procesada exitosamente.
                
                Detalles de la orden:
                - Fecha: {order.created_at.strftime('%d/%m/%Y %H:%M')}
                - Total: ${total:,.2f}
                
                Productos comprados:
                {chr(10).join([f"- {item['name']}: ${item['price']:,.2f} x {item['quantity']}" for item in order_items])}
                
                Los archivos PDF y editables serán enviados a tu email en los próximos 3 días hábiles.
                
                Si tienes alguna pregunta, no dudes en contactarnos:
                - Email: sales-team@u2.group
                
                Saludos,
                El equipo de U2 Group
                """
                
                send_mail(
                    subject=client_subject,
                    message=client_message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[client_email],
                    fail_silently=False
                )
                print(f"✅ Email de texto enviado al cliente: {client_email}")

        except Exception as e:
            print(f"❌ Error general enviando factura automática: {e}")
            raise e 

@method_decorator(csrf_exempt, name='dispatch')
class SendZipFilesView(View):
    @method_decorator(csrf_exempt)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)
    
    def post(self, request, order_id):
        try:
            # Verificar autenticación simple (para desarrollo)
            auth_header = request.headers.get('Authorization', '')
            print(f"🔐 Auth header recibido: {auth_header}")
            
            if not auth_header.startswith('Bearer '):
                return JsonResponse({
                    'success': False,
                    'message': 'Token de autenticación requerido'
                }, status=401)
            
            token = auth_header.replace('Bearer ', '')
            print(f"🔐 Token extraído: {token}")
            
            # Para desarrollo, aceptar el token "authenticated"
            if token != 'authenticated':
                return JsonResponse({
                    'success': False,
                    'message': 'Token de autenticación inválido'
                }, status=401)
            
            # Obtener la orden
            try:
                order = MarketplaceOrder.objects.get(id=order_id)
            except MarketplaceOrder.DoesNotExist:
                return JsonResponse({
                    'success': False,
                    'message': f'Orden #{order_id} no encontrada'
                }, status=404)
            
            # Usar el email del cliente o el email del usuario como fallback
            client_email = order.customer_email or order.user.email
            if not client_email:
                return JsonResponse({
                    'success': False,
                    'message': 'No se encontró email del cliente para esta orden'
                }, status=400)
            
            # Verificar si se subió un archivo ZIP
            zip_file = request.FILES.get('zip_file')
            if not zip_file:
                return JsonResponse({
                    'success': False,
                    'message': 'Debe subir un archivo ZIP'
                }, status=400)
            
            # Verificar que sea un archivo ZIP
            if not zip_file.name.lower().endswith('.zip'):
                return JsonResponse({
                    'success': False,
                    'message': 'El archivo debe ser un ZIP'
                }, status=400)
            
            # Verificar tamaño del archivo (máximo 50MB)
            if zip_file.size > 50 * 1024 * 1024:
                return JsonResponse({
                    'success': False,
                    'message': 'El archivo es demasiado grande. Máximo 50MB'
                }, status=400)
            
            # Crear el registro del archivo ZIP
            zip_record = OrderZipFile.objects.create(
                order=order,
                file=zip_file,
                filename=zip_file.name,
                file_size=zip_file.size,
                uploaded_by=order.user,  # Usar el usuario de la orden como admin
                sent_to_customer=True,
                sent_at=timezone.now()
            )
            
            # Marcar que se enviaron los archivos
            order.zip_files_sent = True
            order.status = 'completed'
            order.save()
            
            # Enviar email al cliente con el archivo ZIP adjunto
            subject = f'Archivos de tu orden #{order.id} - U2 Group'
            message = f"""
            Hola,
            
            Adjunto encontrarás los archivos de tu orden #{order.id}.
            
            Detalles de la orden:
            - Total: ${order.total_amount}
            - Productos: {', '.join([item.product.name for item in order.items.all()])}
            
            Los archivos incluyen:
            - Planos en formato PDF
            - Archivos CAD (si aplica)
            - Especificaciones técnicas
            
            Si tienes alguna pregunta, no dudes en contactarnos.
            
            Saludos,
            Equipo U2 Group
            """
            
            # Crear email con archivo adjunto
            email = EmailMessage(
                subject=subject,
                body=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[client_email]
            )
            
            # Adjuntar el archivo ZIP de manera más robusta
            try:
                # Verificar que el archivo existe
                if zip_record.file and zip_record.file.storage.exists(zip_record.file.name):
                    # Adjuntar usando el nombre del archivo y el contenido
                    with zip_record.file.open('rb') as f:
                        email.attach(
                            filename=zip_record.filename,
                            content=f.read(),
                            mimetype='application/zip'
                        )
                    print(f"✅ Archivo adjunto correctamente: {zip_record.filename}")
                else:
                    print(f"❌ Archivo no encontrado: {zip_record.file.name}")
                    return JsonResponse({
                        'success': False,
                        'message': 'El archivo ZIP no se pudo encontrar en el servidor'
                    }, status=500)
            except Exception as attach_error:
                print(f"❌ Error adjuntando archivo: {str(attach_error)}")
                return JsonResponse({
                    'success': False,
                    'message': f'Error al adjuntar el archivo: {str(attach_error)}'
                }, status=500)
            
            # Enviar email al cliente
            try:
                email.send(fail_silently=False)
                print(f"✅ Email enviado correctamente a {client_email}")
            except Exception as send_error:
                print(f"❌ Error enviando email: {str(send_error)}")
                return JsonResponse({
                    'success': False,
                    'message': f'Error al enviar el email: {str(send_error)}'
                }, status=500)
            
            # Enviar notificación al admin
            try:
                admin_message = f"""
                Se han enviado los archivos ZIP para la orden #{order.id}
                
                Cliente: {client_email}
                Total: ${order.total_amount}
                Fecha: {order.created_at}
                Estado: {order.status}
                """
                
                # Obtener email del admin desde settings
                admin_email = getattr(settings, 'ADMIN_EMAIL', 'urbanunitystudios@gmail.com')
                
                send_mail(
                    subject=f'Archivos enviados - Orden #{order.id}',
                    message=admin_message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[admin_email],
                    fail_silently=False,
                )
                
                print(f"✅ Notificación enviada al admin: {admin_email}")
            except Exception as admin_error:
                print(f"❌ Error enviando notificación al admin: {str(admin_error)}")
                # No fallar si no se puede enviar la notificación al admin
            
            return JsonResponse({
                'success': True,
                'message': f'Archivos ZIP enviados correctamente a {client_email}',
                'status': order.status,
            })
            
        except MarketplaceOrder.DoesNotExist:
            return JsonResponse({
                'success': False,
                'message': 'Orden no encontrada'
            }, status=404)
        except Exception as e:
            print(f"Error enviando archivos ZIP: {str(e)}")
            return JsonResponse({
                'success': False,
                'message': f'Error al enviar archivos: {str(e)}'
            }, status=500) 