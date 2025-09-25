from django.http import JsonResponse
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.authentication import SessionAuthentication
from design.models import Category, Service, GeneralConfig, DesignEntry
from design.serializers import ServiceSerializer, CategorySerializer
import json

class DesignServicesView(APIView):
    """Vista para obtener todos los servicios de diseño"""
    permission_classes = [AllowAny]
    authentication_classes = [SessionAuthentication]
    
    def get(self, request):
        try:
            # Obtener categorías con sus servicios
            categories = Category.objects.prefetch_related('services').all()
            
            result = []
            for category in categories:
                category_data = {
                    'id': category.id,
                    'name': category.name,
                    'emoji': category.emoji,
                    'services': []
                }
                
                for service in category.services.all():
                    service_data = {
                        'id': service.id,
                        'name_en': service.name_en,
                        'name_es': service.name_es,
                        'price_min_usd': service.price_min_usd,
                        'area_max_m2': service.area_max_m2,
                        'max_units': service.max_units,
                        'notes': service.notes,
                        'image': service.image.url if service.image else None,
                        'is_active': True  # Por defecto activo
                    }
                    category_data['services'].append(service_data)
                
                result.append(category_data)
            
            return Response({
                'success': True,
                'data': result,
                'total_services': Service.objects.count(),
                'total_categories': categories.count()
            })
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class DesignServiceDetailView(APIView):
    """Vista para obtener, actualizar o eliminar un servicio específico"""
    permission_classes = [AllowAny]
    authentication_classes = [SessionAuthentication]
    
    def get(self, request, service_id):
        try:
            service = get_object_or_404(Service, id=service_id)
            serializer = ServiceSerializer(service)
            return Response({
                'success': True,
                'data': serializer.data
            })
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def put(self, request, service_id):
        try:
            service = get_object_or_404(Service, id=service_id)
            data = request.data
            
            # Actualizar campos
            if 'name_en' in data:
                service.name_en = data['name_en']
            if 'name_es' in data:
                service.name_es = data['name_es']
            if 'price_min_usd' in data:
                service.price_min_usd = data['price_min_usd']
            if 'area_max_m2' in data:
                service.area_max_m2 = data['area_max_m2']
            if 'max_units' in data:
                service.max_units = data['max_units']
            if 'notes' in data:
                service.notes = data['notes']
            if 'category_id' in data:
                service.category_id = data['category_id']
            
            service.save()
            
            serializer = ServiceSerializer(service)
            return Response({
                'success': True,
                'message': 'Servicio actualizado correctamente',
                'data': serializer.data
            })
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def delete(self, request, service_id):
        try:
            service = get_object_or_404(Service, id=service_id)
            service_name = service.name_es
            service.delete()
            
            return Response({
                'success': True,
                'message': f'Servicio "{service_name}" eliminado correctamente'
            })
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class DesignServiceCreateView(APIView):
    """Vista para crear un nuevo servicio"""
    permission_classes = [AllowAny]
    authentication_classes = [SessionAuthentication]
    
    def post(self, request):
        try:
            data = request.data
            
            # Validar datos requeridos
            required_fields = ['name_en', 'name_es', 'category_id']
            for field in required_fields:
                if field not in data:
                    return Response({
                        'success': False,
                        'error': f'Campo requerido: {field}'
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            # Crear nuevo servicio
            service = Service.objects.create(
                name_en=data['name_en'],
                name_es=data['name_es'],
                category_id=data['category_id'],
                price_min_usd=data.get('price_min_usd'),
                area_max_m2=data.get('area_max_m2'),
                max_units=data.get('max_units'),
                notes=data.get('notes', '')
            )
            
            serializer = ServiceSerializer(service)
            return Response({
                'success': True,
                'message': 'Servicio creado correctamente',
                'data': serializer.data
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class DesignCategoriesView(APIView):
    """Vista para obtener todas las categorías"""
    permission_classes = [AllowAny]
    authentication_classes = [SessionAuthentication]
    
    def get(self, request):
        try:
            categories = Category.objects.all()
            
            # Agregar conteo de servicios por categoría
            result = []
            for category in categories:
                category_data = {
                    'id': category.id,
                    'name': category.name,
                    'emoji': category.emoji,
                    'services_count': category.services.count()
                }
                result.append(category_data)
            
            return Response({
                'success': True,
                'data': result
            })
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class DesignCategoryCreateView(APIView):
    """Vista para crear una nueva categoría"""
    permission_classes = [AllowAny]
    authentication_classes = [SessionAuthentication]
    
    def post(self, request):
        try:
            data = request.data
            
            # Validar datos requeridos
            required_fields = ['name', 'emoji']
            for field in required_fields:
                if field not in data:
                    return Response({
                        'success': False,
                        'error': f'Campo requerido: {field}'
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            # Crear nueva categoría
            category = Category.objects.create(
                name=data['name'],
                emoji=data['emoji']
            )
            
            return Response({
                'success': True,
                'message': 'Categoría creada correctamente',
                'data': {
                    'id': category.id,
                    'name': category.name,
                    'emoji': category.emoji,
                    'services_count': 0
                }
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class DesignCategoryDetailView(APIView):
    """Vista para obtener, actualizar o eliminar una categoría específica"""
    permission_classes = [AllowAny]
    authentication_classes = [SessionAuthentication]
    
    def get(self, request, category_id):
        try:
            category = get_object_or_404(Category, id=category_id)
            return Response({
                'success': True,
                'data': {
                    'id': category.id,
                    'name': category.name,
                    'emoji': category.emoji,
                    'services_count': category.services.count()
                }
            })
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def put(self, request, category_id):
        try:
            category = get_object_or_404(Category, id=category_id)
            data = request.data
            
            # Actualizar campos
            if 'name' in data:
                category.name = data['name']
            if 'emoji' in data:
                category.emoji = data['emoji']
            
            category.save()
            
            return Response({
                'success': True,
                'message': 'Categoría actualizada correctamente',
                'data': {
                    'id': category.id,
                    'name': category.name,
                    'emoji': category.emoji,
                    'services_count': category.services.count()
                }
            })
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def delete(self, request, category_id):
        try:
            category = get_object_or_404(Category, id=category_id)
            category_name = category.name
            
            # Verificar si tiene servicios asociados
            services_count = category.services.count()
            if services_count > 0:
                return Response({
                    'success': False,
                    'error': f'No se puede eliminar la categoría "{category_name}" porque tiene {services_count} servicios asociados'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            category.delete()
            
            return Response({
                'success': True,
                'message': f'Categoría "{category_name}" eliminada correctamente'
            })
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class DesignEntriesView(APIView):
    """Vista para obtener todas las entradas de diseño"""
    permission_classes = [AllowAny]
    authentication_classes = [SessionAuthentication]
    
    def get(self, request):
        try:
            entries = DesignEntry.objects.all().order_by('-created_at')
            
            result = []
            for entry in entries:
                entry_data = {
                    'id': entry.id,
                    'area_total': entry.area_total,
                    'area_basica': entry.area_basica,
                    'area_disponible': entry.area_disponible,
                    'area_usada': entry.area_usada,
                    'porcentaje_ocupado': entry.porcentaje_ocupado,
                    'precio_total': entry.precio_total,
                    'correo': entry.correo,
                    'created_at': entry.created_at.isoformat(),
                    'opciones_count': len(entry.opciones) if entry.opciones else 0
                }
                result.append(entry_data)
            
            return Response({
                'success': True,
                'data': result,
                'total_entries': entries.count()
            })
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class DesignConfigView(APIView):
    """Vista para obtener y actualizar configuración general"""
    permission_classes = [AllowAny]
    authentication_classes = [SessionAuthentication]
    
    def get(self, request):
        try:
            configs = GeneralConfig.objects.all()
            
            result = {}
            for config in configs:
                result[config.key] = config.value
            
            return Response({
                'success': True,
                'data': result
            })
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def put(self, request):
        try:
            data = request.data
            
            for key, value in data.items():
                config, created = GeneralConfig.objects.get_or_create(
                    key=key,
                    defaults={'value': str(value)}
                )
                if not created:
                    config.value = str(value)
                    config.save()
            
            return Response({
                'success': True,
                'message': 'Configuración actualizada correctamente'
            })
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
