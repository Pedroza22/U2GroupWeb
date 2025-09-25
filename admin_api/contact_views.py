from rest_framework import viewsets, status
from rest_framework.decorators import api_view, action, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.core.mail import send_mail
from django.conf import settings
from .models import ContactMessage
from .serializers import ContactMessageSerializer

class ContactMessageViewSet(viewsets.ModelViewSet):
    """
    ViewSet para mensajes de contacto
    """
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    permission_classes = [IsAuthenticated]
    
    def list(self, request, *args, **kwargs):
        """Listar mensajes de contacto con filtros"""
        queryset = self.get_queryset()
        
        # Filtro por estado de lectura
        is_read = request.query_params.get('is_read')
        if is_read is not None:
            is_read = is_read.lower() == 'true'
            queryset = queryset.filter(is_read=is_read)
        
        # Filtro por fecha
        date_from = request.query_params.get('date_from')
        if date_from:
            queryset = queryset.filter(created_at__date__gte=date_from)
        
        date_to = request.query_params.get('date_to')
        if date_to:
            queryset = queryset.filter(created_at__date__lte=date_to)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        """Marcar mensaje como leído"""
        message = self.get_object()
        message.is_read = True
        message.save()
        return Response({'status': 'success'})
    
    @action(detail=False, methods=['post'])
    def mark_all_as_read(self, request):
        """Marcar todos los mensajes como leídos"""
        ContactMessage.objects.filter(is_read=False).update(is_read=True)
        return Response({'status': 'success'})
    
    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        """Actualizar estado del mensaje"""
        message = self.get_object()
        new_status = request.data.get('status')
        admin_notes = request.data.get('admin_notes')
        
        if new_status and new_status in dict(ContactMessage.STATUS_CHOICES):
            message.status = new_status
            # Si se marca como leído, actualizar también is_read
            if new_status in ['read', 'responded']:
                message.is_read = True
            message.save()
        
        if admin_notes is not None:
            message.admin_notes = admin_notes
            message.save()
        
        serializer = self.get_serializer(message)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Obtener estadísticas de mensajes"""
        total = ContactMessage.objects.count()
        new_count = ContactMessage.objects.filter(status='new').count()
        read_count = ContactMessage.objects.filter(status='read').count()
        responded_count = ContactMessage.objects.filter(status='responded').count()
        archived_count = ContactMessage.objects.filter(status='archived').count()
        
        return Response({
            'total': total,
            'new': new_count,
            'read': read_count,
            'responded': responded_count,
            'archived': archived_count
        })

@api_view(['POST'])
@permission_classes([AllowAny])
def send_contact_message(request):
    """Enviar mensaje de contacto"""
    try:
        # Mapear campos del frontend a los del modelo
        data = request.data.copy()
        if 'firstName' in data:
            data['first_name'] = data.pop('firstName')
        if 'lastName' in data:
            data['last_name'] = data.pop('lastName')
        if 'message' in data:
            data['comments'] = data.pop('message')
            
        serializer = ContactMessageSerializer(data=data)
        if serializer.is_valid():
            contact_message = serializer.save()
            
            # Enviar email de notificación al admin
            try:
                subject = f"Nuevo mensaje de contacto de {contact_message.full_name}"
                message = f"""
                Se ha recibido un nuevo mensaje de contacto:
                
                Nombre: {contact_message.full_name}
                Email: {contact_message.email}
                Teléfono: {contact_message.phone or 'No proporcionado'}
                Ubicación del proyecto: {contact_message.project_location or 'No especificada'}
                Timeline: {contact_message.timeline or 'No especificado'}
                
                Comentarios:
                {contact_message.comments or 'Sin comentarios adicionales'}
                
                Fecha: {contact_message.created_at.strftime('%d/%m/%Y %H:%M')}
                """
                
                # Enviar email al admin
                send_mail(
                    subject=subject,
                    message=message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[settings.EMAIL_HOST_USER],
                    fail_silently=False,
                )
                
                # Enviar email de confirmación al usuario
                user_subject = "Gracias por contactarnos - U2Group"
                user_message = f"""
                Hola {contact_message.first_name},
                
                Gracias por contactarnos. Hemos recibido tu mensaje y nos pondremos en contacto contigo en las próximas 24 horas.
                
                Resumen de tu mensaje:
                - Nombre: {contact_message.full_name}
                - Email: {contact_message.email}
                - Timeline: {contact_message.timeline or 'No especificado'}
                
                Si tienes alguna pregunta urgente, no dudes en contactarnos directamente:
                - Email: sales-team@u2.group
                - Teléfono: 3164035330 - 3043618282
                
                Saludos,
                Equipo U2Group
                """
                
                send_mail(
                    subject=user_subject,
                    message=user_message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[contact_message.email],
                    fail_silently=False,
                )
                
            except Exception as e:
                print(f"Error enviando emails: {e}")
                # No fallar si el email no se puede enviar
            
            return Response({
                'status': 'success',
                'message': 'Mensaje enviado exitosamente. Te contactaremos pronto.',
                'data': serializer.data
            }, status=status.HTTP_201_CREATED)
        else:
            return Response({
                'status': 'error',
                'message': 'Datos inválidos',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        return Response({
            'status': 'error',
            'message': 'Error interno del servidor',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
