from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, parser_classes, permission_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import AllowAny
import os
from django.conf import settings
from .models import Project, ProjectImage, Blog, BlogLikeFavorite, ProjectLikeFavorite, SiteConfig
from .serializers import (
    ProjectSerializer, ProjectImageSerializer, BlogSerializer, 
    BlogLikeFavoriteSerializer, ProjectLikeFavoriteSerializer, SiteConfigSerializer
)

class ProjectViewSet(viewsets.ModelViewSet):
    """
    ViewSet simple para operaciones CRUD de proyectos
    """
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [AllowAny]
    authentication_classes = []

    def create(self, request, *args, **kwargs):
        """Crear nuevo proyecto"""
        print("=== CREANDO PROYECTO ===")
        print(f"Datos recibidos: {request.data}")
        print(f"Archivos recibidos: {request.FILES}")
        
        try:
            serializer = self.get_serializer(data=request.data)
            if serializer.is_valid():
                print("✅ Serializer válido")
                print(f"✅ Datos validados: {serializer.validated_data}")
                project = serializer.save()
                print(f"✅ Proyecto creado: ID={project.id}, Título='{project.title}'")
                print(f"✅ Imagen guardada: {project.image}")
                
                return Response(
                    {
                        "success": True,
                        "message": "Proyecto creado exitosamente",
                        "data": serializer.data
                    },
                    status=status.HTTP_201_CREATED
                )
            else:
                print(f"❌ Errores de validación: {serializer.errors}")
                return Response(
                    {
                        "success": False,
                        "message": "Errores de validación",
                        "errors": serializer.errors
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
        except Exception as e:
            print(f"❌ Error inesperado: {str(e)}")
            return Response(
                {
                    "success": False,
                    "message": "Error interno del servidor",
                    "error": str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def list(self, request, *args, **kwargs):
        """Listar proyectos"""
        print("=== LISTANDO PROYECTOS ===")
        try:
            queryset = self.filter_queryset(self.get_queryset())
            serializer = self.get_serializer(queryset, many=True)
            print(f"✅ Proyectos encontrados: {len(serializer.data)}")
            
            return Response({
                "success": True,
                "count": len(serializer.data),
                "data": serializer.data
            })
        except Exception as e:
            print(f"❌ Error listando proyectos: {str(e)}")
            return Response(
                {
                    "success": False,
                    "message": "Error listando proyectos",
                    "error": str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def retrieve(self, request, *args, **kwargs):
        """Obtener un proyecto específico"""
        print(f"=== OBTENIENDO PROYECTO ID: {kwargs.get('pk')} ===")
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance)
            print(f"✅ Proyecto encontrado: {instance.title}")
            print(f"📋 Datos del serializer: {serializer.data}")
            
            return Response(serializer.data)
        except Exception as e:
            print(f"❌ Error obteniendo proyecto: {str(e)}")
            return Response(
                {
                    "success": False,
                    "message": "Error obteniendo proyecto",
                    "error": str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def update(self, request, *args, **kwargs):
        """Actualizar proyecto"""
        print(f"=== ACTUALIZANDO PROYECTO ID: {kwargs.get('pk')} ===")
        try:
            partial = kwargs.pop('partial', False)
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=request.data, partial=partial)
            
            if serializer.is_valid():
                print("✅ Datos válidos para actualización")
                project = serializer.save()
                print(f"✅ Proyecto actualizado: {project.title}")
                
                return Response({
                    "success": True,
                    "message": "Proyecto actualizado exitosamente",
                    "data": serializer.data
                })
            else:
                print(f"❌ Errores de validación: {serializer.errors}")
                return Response(
                    {
                        "success": False,
                        "message": "Errores de validación",
                        "errors": serializer.errors
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
        except Exception as e:
            print(f"❌ Error actualizando proyecto: {str(e)}")
            return Response(
                {
                    "success": False,
                    "message": "Error actualizando proyecto",
                    "error": str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def destroy(self, request, *args, **kwargs):
        """Eliminar proyecto con manejo de foreign keys"""
        from django.db import IntegrityError, transaction
        
        print(f"=== ELIMINANDO PROYECTO ID: {kwargs.get('pk')} ===")
        try:
            instance = self.get_object()
            project_title = instance.title
            project_id = instance.id
            
            with transaction.atomic():
                # Eliminar registros relacionados primero
                print(f"🧹 Limpiando registros relacionados para proyecto {project_id}...")
                
                # Eliminar interacciones relacionadas
                from admin_api.models import ProjectLikeFavorite
                interactions_count = ProjectLikeFavorite.objects.filter(project=instance).count()
                ProjectLikeFavorite.objects.filter(project=instance).delete()
                print(f"  - Eliminadas {interactions_count} interacciones")
                
                # Eliminar imágenes relacionadas  
                from admin_api.models import ProjectImage
                images_count = ProjectImage.objects.filter(project=instance).count()
                ProjectImage.objects.filter(project=instance).delete()
                print(f"  - Eliminadas {images_count} imágenes")
                
                # Ahora eliminar el proyecto
                instance.delete()
                print(f"✅ Proyecto eliminado: {project_title}")
            
            return Response(status=status.HTTP_204_NO_CONTENT)
            
        except IntegrityError as e:
            print(f"❌ Error de integridad: {str(e)}")
            return Response(
                {
                    "message": "No se puede eliminar el proyecto debido a restricciones de integridad",
                    "error": str(e)
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            print(f"❌ Error eliminando proyecto: {str(e)}")
            return Response(
                {
                    "message": "Error eliminando proyecto", 
                    "error": str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ProjectImageViewSet(viewsets.ModelViewSet):
    queryset = ProjectImage.objects.all()
    serializer_class = ProjectImageSerializer
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [AllowAny]
    authentication_classes = []

class BlogViewSet(viewsets.ModelViewSet):
    queryset = Blog.objects.all().order_by('-date')
    serializer_class = BlogSerializer
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [AllowAny]
    authentication_classes = []
    
    def list(self, request, *args, **kwargs):
        """Listar blogs con manejo de errores robusto"""
        print("=== LISTANDO BLOGS ===")
        try:
            # Usar .values() para evitar problemas con campos complejos
            queryset = Blog.objects.all().order_by('-date').values(
                'id', 'title', 'content', 'image', 'date', 'author', 
                'category', 'read_time', 'summary', 'tags', 'excerpt', 
                'slug', 'featured', 'like_count', 'favorite_count'
            )
            print(f"📝 Queryset count: {len(queryset)}")
            
            # Si no hay blogs, devolver array vacío
            if len(queryset) == 0:
                print("ℹ️ No hay blogs en la base de datos")
                return Response([])
            
            # Crear datos con manejo defensivo
            blogs_data = []
            for blog in queryset:
                try:
                    # Manejo defensivo de cada campo
                    blog_data = {
                        'id': blog.get('id', 0),
                        'title': blog.get('title', 'Sin título'),
                        'content': blog.get('content', 'Sin contenido'),
                        'image': blog.get('image'),
                        'date': blog.get('date'),
                        'author': blog.get('author', 'Autor desconocido'),
                        'category': blog.get('category', 'General'),
                        'read_time': blog.get('read_time'),
                        'summary': blog.get('summary'),
                        'tags': blog.get('tags'),
                        'excerpt': blog.get('excerpt'),
                        'slug': blog.get('slug'),
                        'featured': blog.get('featured', False),
                        'like_count': blog.get('like_count', 0),
                        'favorite_count': blog.get('favorite_count', 0)
                    }
                    
                    # Intentar agregar imagen si existe
                    try:
                        if blog_data['image']:
                            # Construir URL correcta para la imagen
                            if blog_data['image'].startswith('http'):
                                # Ya es una URL completa
                                blog_data['image'] = blog_data['image']
                            else:
                                # Construir URL completa apuntando a /media/
                                base_url = f"{request.scheme}://{request.get_host()}"
                                # Si la imagen no empieza con /media/, agregarlo
                                if not blog_data['image'].startswith('/media/'):
                                    blog_data['image'] = f"/media/{blog_data['image']}"
                                blog_data['image'] = f"{base_url}{blog_data['image']}"
                    except:
                        blog_data['image'] = None
                    
                    # Formatear fecha
                    try:
                        if blog_data['date']:
                            blog_data['date'] = blog_data['date'].isoformat()
                    except:
                        blog_data['date'] = None
                    
                    blogs_data.append(blog_data)
                    print(f"✅ Blog procesado: {blog_data['title']}")
                    
                except Exception as blog_error:
                    print(f"⚠️ Error procesando blog: {blog_error}")
                    # Continuar con el siguiente blog sin agregarlo
                    continue
            
            print(f"📝 Blogs data count: {len(blogs_data)}")
            return Response(blogs_data)
            
        except Exception as e:
            print(f"❌ Error general listando blogs: {e}")
            # En caso de error total, devolver array vacío en lugar de error 500
            print("🔄 Devolviendo array vacío para evitar error 500")
            return Response([])

class BlogLikeFavoriteViewSet(viewsets.ModelViewSet):
    queryset = BlogLikeFavorite.objects.all()
    serializer_class = BlogLikeFavoriteSerializer
    permission_classes = [AllowAny]
    authentication_classes = []

class ProjectLikeFavoriteViewSet(viewsets.ModelViewSet):
    queryset = ProjectLikeFavorite.objects.all()
    serializer_class = ProjectLikeFavoriteSerializer
    permission_classes = [AllowAny]
    authentication_classes = []

# ViewSet eliminado - se encuentra en marketplace_views.py

@api_view(['POST'])
@permission_classes([AllowAny])
def toggle_project_like_favorite(request):
    """
    Endpoint personalizado para alternar likes y favoritos de proyectos
    """
    try:
        print(f"=== TOGGLE PROJECT INTERACTION ===")
        print(f"Datos recibidos: {request.data}")
        
        project_id = request.data.get('project')
        action = request.data.get('action')  # 'like' o 'favorite'
        
        print(f"Project ID: {project_id}, Action: {action}")
        
        if not project_id or not action:
            return Response(
                {'error': 'Se requiere project_id y action'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verificar que el proyecto existe
        try:
            project = Project.objects.get(id=project_id)
            print(f"✅ Proyecto encontrado: {project.title}")
        except Project.DoesNotExist:
            print(f"❌ Proyecto no encontrado: {project_id}")
            return Response(
                {'error': f'Proyecto con ID {project_id} no encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Generar un visitor_id único para esta sesión
        import uuid
        # Usar una combinación de IP y User-Agent para crear un visitor_id más consistente
        user_ip = request.META.get('REMOTE_ADDR', 'unknown')
        user_agent = request.META.get('HTTP_USER_AGENT', 'unknown')
        import hashlib
        visitor_hash = hashlib.md5(f"{user_ip}{user_agent}".encode()).hexdigest()[:8]
        visitor_id = f'visitor_{visitor_hash}'
        
        print(f"Visitor ID generado: {visitor_id}")
        
        # SOLUCIÓN TEMPORAL: Simular interacciones sin usar la tabla problemática
        # Usar un diccionario en memoria para simular las interacciones
        if not hasattr(toggle_project_like_favorite, '_interactions'):
            toggle_project_like_favorite._interactions = {}
        
        interaction_key = f"{project.id}_{visitor_id}"
        
        if interaction_key not in toggle_project_like_favorite._interactions:
            toggle_project_like_favorite._interactions[interaction_key] = {
                'liked': False,
                'favorited': False
            }
            created = True
        else:
            created = False
        
        interaction = toggle_project_like_favorite._interactions[interaction_key]
        print(f"✅ Interacción {'creada' if created else 'encontrada'} en memoria: {interaction_key}")
        
        if action == 'like':
            # Alternar el estado de like
            interaction['liked'] = not interaction['liked']
            
            # Calcular conteos simulados
            like_count = sum(1 for i in toggle_project_like_favorite._interactions.values() if i['liked'])
            favorite_count = sum(1 for i in toggle_project_like_favorite._interactions.values() if i['favorited'])
            
            return Response({
                'success': True,
                'liked': interaction['liked'],
                'favorited': interaction['favorited'],
                'like_count': like_count,
                'favorite_count': favorite_count
            })
        elif action == 'favorite':
            # Alternar el estado de favorite
            interaction['favorited'] = not interaction['favorited']
            
            # Calcular conteos simulados
            like_count = sum(1 for i in toggle_project_like_favorite._interactions.values() if i['liked'])
            favorite_count = sum(1 for i in toggle_project_like_favorite._interactions.values() if i['favorited'])
            
            return Response({
                'success': True,
                'liked': interaction['liked'],
                'favorited': interaction['favorited'],
                'like_count': like_count,
                'favorite_count': favorite_count
            })
        else:
            return Response(
                {'error': 'Action debe ser "like" o "favorite"'},
                status=status.HTTP_400_BAD_REQUEST
            )

    except Exception as e:
        return Response(
            {'error': f'Error interno del servidor: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
@permission_classes([AllowAny])
def upload_project_image(request):
    """Subir imagen adicional para un proyecto"""
    print("=== SUBIENDO IMAGEN ADICIONAL DE PROYECTO ===")
    print(f"Datos recibidos: {request.data}")
    print(f"Archivos recibidos: {request.FILES}")
    
    try:
        project_id = request.data.get('project_id')
        image_file = request.FILES.get('image')
        
        if not project_id or not image_file:
            return Response(
                {
                    "success": False,
                    "message": "Se requiere project_id e image"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Verificar que el proyecto existe
        try:
            project = Project.objects.get(id=project_id)
        except Project.DoesNotExist:
            return Response(
                {
                    "success": False,
                    "message": f"Proyecto con ID {project_id} no encontrado"
                },
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Crear la imagen adicional
        project_image = ProjectImage.objects.create(
            project=project,
            image=image_file
        )
        
        print(f"✅ Imagen adicional creada: {project_image.id}")
        
        return Response(
            {
                "success": True,
                "message": "Imagen adicional subida exitosamente",
                "data": {
                    "id": project_image.id,
                    "image": project_image.image.url
                }
            },
            status=status.HTTP_201_CREATED
        )
        
    except Exception as e:
        print(f"❌ Error subiendo imagen adicional: {str(e)}")
        return Response(
            {
                "success": False,
                "message": "Error interno del servidor",
                "error": str(e)
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
@permission_classes([AllowAny])
def upload_blog_image(request):
    """Subir imagen adicional para un blog"""
    print("=== SUBIENDO IMAGEN ADICIONAL DE BLOG ===")
    print(f"Datos recibidos: {request.data}")
    print(f"Archivos recibidos: {request.FILES}")
    
    try:
        blog_id = request.data.get('blog_id')
        image_file = request.FILES.get('image')
        
        if not blog_id or not image_file:
            return Response(
                {
                    "success": False,
                    "message": "Se requiere blog_id e image"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Verificar que el blog existe
        try:
            blog = Blog.objects.get(id=blog_id)
        except Blog.DoesNotExist:
            return Response(
                {
                    "success": False,
                    "message": f"Blog con ID {blog_id} no encontrado"
                },
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Crear la imagen adicional
        blog_image = BlogImage.objects.create(
            blog=blog,
            image=image_file
        )
        
        print(f"✅ Imagen adicional de blog creada: {blog_image.id}")
        
        return Response(
            {
                "success": True,
                "message": "Imagen adicional subida exitosamente",
                "data": {
                    "id": blog_image.id,
                    "image": blog_image.image.url
                }
            },
            status=status.HTTP_201_CREATED
        )
        
    except Exception as e:
        print(f"❌ Error subiendo imagen adicional de blog: {str(e)}")
        return Response(
            {
                "success": False,
                "message": "Error interno del servidor",
                "error": str(e)
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
@permission_classes([AllowAny])
def upload_blog_image(request):
    """
    Endpoint para subir imágenes de blogs
    """
    try:
        if 'image' not in request.FILES:
            return Response(
                {'error': 'No se encontró el archivo de imagen'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        image_file = request.FILES['image']
        
        # Validar tipo de archivo
        allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
        if image_file.content_type not in allowed_types:
            return Response(
                {'error': f'Tipo de archivo no permitido. Tipos válidos: {", ".join(allowed_types)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validar tamaño (máximo 5MB)
        max_size = 5 * 1024 * 1024  # 5MB
        if image_file.size > max_size:
            return Response(
                {'error': 'El archivo es demasiado grande. Tamaño máximo: 5MB'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Crear directorio si no existe
        upload_dir = os.path.join(settings.MEDIA_ROOT, 'blogs', 'main_images')
        os.makedirs(upload_dir, exist_ok=True)
        
        # Generar nombre único para evitar conflictos
        import uuid
        file_extension = os.path.splitext(image_file.name)[1]
        unique_filename = f"{uuid.uuid4().hex}{file_extension}"
        
        # Guardar archivo
        file_path = os.path.join(upload_dir, unique_filename)
        with open(file_path, 'wb+') as destination:
            for chunk in image_file.chunks():
                destination.write(chunk)
        
        # Retornar la ruta relativa para guardar en la DB
        relative_path = f"blogs/main_images/{unique_filename}"
        
        return Response({
            'success': True,
            'image_path': relative_path,
            'image_url': f"{settings.MEDIA_URL}{relative_path}",
            'filename': unique_filename,
            'original_name': image_file.name,
            'size': image_file.size
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response(
            {'error': f'Error interno del servidor: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        ) 

@api_view(['POST'])
@permission_classes([AllowAny])
def toggle_blog_like_favorite(request):
    """
    Endpoint personalizado para alternar likes y favoritos de blogs
    """
    try:
        print(f"=== TOGGLE BLOG INTERACTION ===")
        print(f"Datos recibidos: {request.data}")
        
        blog_id = request.data.get('blog')
        action = request.data.get('action')  # 'like' o 'favorite'
        
        print(f"Blog ID: {blog_id}, Action: {action}")
        
        if not blog_id or not action:
            return Response(
                {'error': 'Se requiere blog_id y action'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verificar que el blog existe
        try:
            blog = Blog.objects.get(id=blog_id)
            print(f"✅ Blog encontrado: {blog.title}")
        except Blog.DoesNotExist:
            print(f"❌ Blog no encontrado: {blog_id}")
            return Response(
                {'error': f'Blog con ID {blog_id} no encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Generar un visitor_id único para esta sesión
        import uuid
        user_ip = request.META.get('REMOTE_ADDR', 'unknown')
        user_agent = request.META.get('HTTP_USER_AGENT', 'unknown')
        import hashlib
        visitor_hash = hashlib.md5(f"{user_ip}{user_agent}".encode()).hexdigest()[:8]
        visitor_id = f'visitor_{visitor_hash}'
        
        print(f"Visitor ID generado: {visitor_id}")
        
        # SOLUCIÓN TEMPORAL: Simular interacciones sin usar la tabla problemática
        if not hasattr(toggle_blog_like_favorite, '_interactions'):
            toggle_blog_like_favorite._interactions = {}
        
        interaction_key = f"{blog.id}_{visitor_id}"
        
        if interaction_key not in toggle_blog_like_favorite._interactions:
            toggle_blog_like_favorite._interactions[interaction_key] = {
                'liked': False,
                'favorited': False
            }
            created = True
        else:
            created = False
        
        interaction = toggle_blog_like_favorite._interactions[interaction_key]
        print(f"✅ Interacción {'creada' if created else 'encontrada'} en memoria: {interaction_key}")
        
        if action == 'like':
            # Alternar el estado de like
            interaction['liked'] = not interaction['liked']
            
            # Calcular conteos simulados
            like_count = sum(1 for i in toggle_blog_like_favorite._interactions.values() if i['liked'])
            favorite_count = sum(1 for i in toggle_blog_like_favorite._interactions.values() if i['favorited'])
            
            return Response({
                'success': True,
                'liked': interaction['liked'],
                'favorited': interaction['favorited'],
                'like_count': like_count,
                'favorite_count': favorite_count
            })
        elif action == 'favorite':
            # Alternar el estado de favorite
            interaction['favorited'] = not interaction['favorited']
            
            # Calcular conteos simulados
            like_count = sum(1 for i in toggle_blog_like_favorite._interactions.values() if i['liked'])
            favorite_count = sum(1 for i in toggle_blog_like_favorite._interactions.values() if i['favorited'])
            
            return Response({
                'success': True,
                'liked': interaction['liked'],
                'favorited': interaction['favorited'],
                'like_count': like_count,
                'favorite_count': favorite_count
            })
        else:
            return Response(
                {'error': 'Action debe ser "like" o "favorite"'},
                status=status.HTTP_400_BAD_REQUEST
            )
    except Exception as e:
        print(f"❌ Error en toggle_blog_like_favorite: {str(e)}")
        return Response(
            {'error': 'Error interno del servidor'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


class SiteConfigViewSet(viewsets.ModelViewSet):
    """
    ViewSet para operaciones CRUD de configuración del sitio
    """
    queryset = SiteConfig.objects.all()
    serializer_class = SiteConfigSerializer
    permission_classes = [AllowAny]
    authentication_classes = []

    def list(self, request, *args, **kwargs):
        """Listar todas las configuraciones del sitio"""
        try:
            queryset = self.filter_queryset(self.get_queryset())
            serializer = self.get_serializer(queryset, many=True)
            
            # Convertir a formato de objeto para facilitar el uso en frontend
            config_dict = {}
            for item in serializer.data:
                config_dict[item['key']] = item['value']
            
            return Response({
                "success": True,
                "data": config_dict,
                "raw_data": serializer.data
            })
        except Exception as e:
            return Response(
                {
                    "success": False,
                    "message": "Error obteniendo configuración",
                    "error": str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def create(self, request, *args, **kwargs):
        """Crear nueva configuración"""
        try:
            serializer = self.get_serializer(data=request.data)
            if serializer.is_valid():
                config = serializer.save()
                return Response(
                    {
                        "success": True,
                        "message": "Configuración creada exitosamente",
                        "data": serializer.data
                    },
                    status=status.HTTP_201_CREATED
                )
            else:
                return Response(
                    {
                        "success": False,
                        "message": "Errores de validación",
                        "errors": serializer.errors
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
        except Exception as e:
            return Response(
                {
                    "success": False,
                    "message": "Error interno del servidor",
                    "error": str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def update(self, request, *args, **kwargs):
        """Actualizar configuración existente"""
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=request.data, partial=True)
            if serializer.is_valid():
                config = serializer.save()
                return Response(
                    {
                        "success": True,
                        "message": "Configuración actualizada exitosamente",
                        "data": serializer.data
                    }
                )
            else:
                return Response(
                    {
                        "success": False,
                        "message": "Errores de validación",
                        "errors": serializer.errors
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
        except Exception as e:
            return Response(
                {
                    "success": False,
                    "message": "Error interno del servidor",
                    "error": str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@api_view(['POST'])
@permission_classes([AllowAny])
def update_site_config_bulk(request):
    """
    Actualizar múltiples configuraciones del sitio de una vez
    """
    try:
        config_data = request.data
        
        if not isinstance(config_data, dict):
            return Response(
                {
                    "success": False,
                    "message": "Los datos deben ser un objeto con pares clave-valor"
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        updated_configs = []
        errors = []
        
        for key, value in config_data.items():
            try:
                # Buscar configuración existente o crear nueva
                config, created = SiteConfig.objects.get_or_create(
                    key=key,
                    defaults={
                        'value': str(value),
                        'category': 'general'
                    }
                )
                
                if not created:
                    # Actualizar valor existente
                    config.value = str(value)
                    config.save()
                
                updated_configs.append({
                    'key': config.key,
                    'value': config.value,
                    'created': created
                })
                
            except Exception as e:
                errors.append({
                    'key': key,
                    'error': str(e)
                })
        
        return Response({
            "success": True,
            "message": f"Configuraciones actualizadas: {len(updated_configs)}",
            "updated": updated_configs,
            "errors": errors
        })
        
    except Exception as e:
        return Response(
            {
                "success": False,
                "message": "Error interno del servidor",
                "error": str(e)
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        ) 

 

 

