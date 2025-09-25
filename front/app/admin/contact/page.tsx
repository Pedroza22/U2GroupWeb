"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  MessageSquare, 
  Mail, 
  Phone, 
  User,
  Calendar,
  Eye,
  Trash2,
  Reply,
  CheckCircle,
  Archive,
  Edit,
  Save,
  X
} from 'lucide-react';
import BackToDashboard from '@/components/admin/back-to-dashboard';

interface ContactMessage {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string;
  project_location: string;
  timeline: string;
  comments: string;
  status: 'new' | 'read' | 'responded' | 'archived';
  status_display: string;
  admin_notes: string;
  created_at: string;
  is_read: boolean;
}

interface Statistics {
  total: number;
  new: number;
  read: number;
  responded: number;
  archived: number;
}

export default function AdminContactPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [statistics, setStatistics] = useState<Statistics>({
    total: 0,
    new: 0,
    read: 0,
    responded: 0,
    archived: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingMessage, setEditingMessage] = useState<number | null>(null);
  const [adminNotes, setAdminNotes] = useState<string>('');

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Intentar cargar desde la API
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/contact-messages/`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Error al cargar mensajes: ${response.status}`);
        }

        const data = await response.json();
        setMessages(data);
        setError(null);
      } catch (apiError) {
        console.error('Error cargando desde API:', apiError);
        
        // Fallback a datos de ejemplo si la API no está disponible
        const mockMessages: ContactMessage[] = [
          {
            id: 1,
            first_name: 'Juan',
            last_name: 'Pérez',
            full_name: 'Juan Pérez',
            email: 'juan.perez@email.com',
            phone: '+57 300 123 4567',
            project_location: 'Bogotá, Colombia',
            timeline: '3-6 meses',
            comments: 'Hola, estoy interesado en el plan Decameron. Necesito más información sobre los servicios incluidos.',
            status: 'new',
            status_display: 'Nuevo',
            admin_notes: '',
            created_at: '2023-08-23T10:00:00Z',
            is_read: false
          },
          {
            id: 2,
            first_name: 'María',
            last_name: 'García',
            full_name: 'María García',
            email: 'maria.garcia@email.com',
            phone: '+57 310 987 6543',
            project_location: 'Medellín, Colombia',
            timeline: '6-12 meses',
            comments: 'Quiero información sobre el plan Mediterráneo. ¿Incluye diseño de interiores?',
            status: 'read',
            status_display: 'Leído',
            admin_notes: 'Cliente interesada en diseño de interiores',
            created_at: '2023-08-22T15:30:00Z',
            is_read: true
          }
        ];
        
        setMessages(mockMessages);
        setError('⚠️ Backend no disponible. Mostrando datos de ejemplo. Inicia el servidor con: python manage.py runserver');
      }
    } catch (err) {
      console.error('Error general cargando mensajes:', err);
      setError('Error al cargar los mensajes de contacto');
    } finally {
      setIsLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/contact-messages/statistics/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStatistics(data);
      } else {
        // Fallback a estadísticas calculadas localmente
        const localStats = {
          total: messages.length,
          new: messages.filter(msg => msg.status === 'new').length,
          read: messages.filter(msg => msg.status === 'read').length,
          responded: messages.filter(msg => msg.status === 'responded').length,
          archived: messages.filter(msg => msg.status === 'archived').length
        };
        setStatistics(localStats);
      }
    } catch (err) {
      console.error('Error cargando estadísticas:', err);
      // Fallback a estadísticas calculadas localmente
      const localStats = {
        total: messages.length,
        new: messages.filter(msg => msg.status === 'new').length,
        read: messages.filter(msg => msg.status === 'read').length,
        responded: messages.filter(msg => msg.status === 'responded').length,
        archived: messages.filter(msg => msg.status === 'archived').length
      };
      setStatistics(localStats);
    }
  };

  const updateMessageStatus = async (messageId: number, status: string, notes?: string) => {
    try {
      // Intentar actualizar en el backend
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/contact-messages/${messageId}/update_status/`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status,
            admin_notes: notes
          }),
        });

        if (!response.ok) {
          throw new Error(`Error al actualizar estado: ${response.status}`);
        }

        const updatedMessage = await response.json();
        setMessages(prev => prev.map(msg => 
          msg.id === messageId ? updatedMessage : msg
        ));
        
        return true;
      } catch (apiError) {
        console.error('Error actualizando en API:', apiError);
        
        // Fallback a actualización local
        setMessages(prev => prev.map(msg => 
          msg.id === messageId ? {
            ...msg,
            status: status as 'new' | 'read' | 'responded' | 'archived',
            status_display: status === 'new' ? 'Nuevo' : 
                           status === 'read' ? 'Leído' : 
                           status === 'responded' ? 'Respondido' : 'Archivado',
            admin_notes: notes || msg.admin_notes,
            is_read: status === 'read' || status === 'responded'
          } : msg
        ));
        
        return true;
      }
    } catch (err) {
      console.error('Error general actualizando estado:', err);
      return false;
    }
  };

  const startEditing = (message: ContactMessage) => {
    setEditingMessage(message.id);
    setAdminNotes(message.admin_notes || '');
  };

  const saveChanges = async (messageId: number) => {
    const success = await updateMessageStatus(messageId, 'read', adminNotes);
    if (success) {
      setEditingMessage(null);
      setAdminNotes('');
    }
  };

  const cancelEditing = () => {
    setEditingMessage(null);
    setAdminNotes('');
  };

  useEffect(() => {
    loadMessages();
  }, []);

  // Actualizar estadísticas cuando cambien los mensajes
  useEffect(() => {
    if (messages.length > 0) {
      const localStats = {
        total: messages.length,
        new: messages.filter(msg => msg.status === 'new').length,
        read: messages.filter(msg => msg.status === 'read').length,
        responded: messages.filter(msg => msg.status === 'responded').length,
        archived: messages.filter(msg => msg.status === 'archived').length
      };
      setStatistics(localStats);
    }
  }, [messages]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      new: { color: 'bg-blue-100 text-blue-800', label: 'Nuevo' },
      read: { color: 'bg-yellow-100 text-yellow-800', label: 'Leído' },
      responded: { color: 'bg-green-100 text-green-800', label: 'Respondido' },
      archived: { color: 'bg-gray-100 text-gray-800', label: 'Archivado' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.new;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getStatusActions = (message: ContactMessage) => {
    const actions = [];
    
    if (message.status === 'new') {
      actions.push(
        <Button
          key="read"
          size="sm"
          variant="outline"
          onClick={() => updateMessageStatus(message.id, 'read')}
          className="text-yellow-600 border-yellow-600 hover:bg-yellow-50"
        >
          <Eye className="w-4 h-4 mr-1" />
          Marcar Leído
        </Button>
      );
    }
    
    if (message.status !== 'responded') {
      actions.push(
        <Button
          key="responded"
          size="sm"
          variant="outline"
          onClick={() => updateMessageStatus(message.id, 'responded')}
          className="text-green-600 border-green-600 hover:bg-green-50"
        >
          <Reply className="w-4 h-4 mr-1" />
          Marcar Respondido
        </Button>
      );
    }
    
    if (message.status !== 'archived') {
      actions.push(
        <Button
          key="archived"
          size="sm"
          variant="outline"
          onClick={() => updateMessageStatus(message.id, 'archived')}
          className="text-gray-600 border-gray-600 hover:bg-gray-50"
        >
          <Archive className="w-4 h-4 mr-1" />
          Archivar
        </Button>
      );
    }
    
    return actions;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">Cargando mensajes...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mensajes de Contacto</h1>
            <p className="text-gray-600 mt-2">Administra los mensajes recibidos del formulario de contacto</p>
          </div>
          <BackToDashboard />
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Mensajes</CardTitle>
            <MessageSquare className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{statistics.total}</div>
            <p className="text-xs text-gray-600">Mensajes recibidos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nuevos</CardTitle>
            <MessageSquare className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{statistics.new}</div>
            <p className="text-xs text-gray-600">Mensajes nuevos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leídos</CardTitle>
            <MessageSquare className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{statistics.read}</div>
            <p className="text-xs text-gray-600">Mensajes leídos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Respondidos</CardTitle>
            <MessageSquare className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{statistics.responded}</div>
            <p className="text-xs text-gray-600">Mensajes respondidos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Archivados</CardTitle>
            <Archive className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{statistics.archived}</div>
            <p className="text-xs text-gray-600">Mensajes archivados</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de mensajes */}
      <Card>
        <CardHeader>
          <CardTitle>Mensajes de Contacto</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={loadMessages}>Reintentar</Button>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No hay mensajes de contacto</p>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message) => (
                <div key={message.id} className="border rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">
                        {message.full_name}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span className="flex items-center">
                          <Mail className="w-4 h-4 mr-1" />
                          {message.email}
                        </span>
                        {message.phone && (
                          <span className="flex items-center">
                            <Phone className="w-4 h-4 mr-1" />
                            {message.phone}
                          </span>
                        )}
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(message.created_at).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(message.status)}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {message.project_location && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Ubicación del proyecto:</p>
                        <p className="text-sm text-gray-600">{message.project_location}</p>
                      </div>
                    )}
                    {message.timeline && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Timeline:</p>
                        <p className="text-sm text-gray-600">{message.timeline}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Comentarios:</p>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                      {message.comments || 'Sin comentarios'}
                    </p>
                  </div>
                  
                  {/* Notas del admin */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-700">Notas del administrador:</p>
                      {editingMessage !== message.id ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startEditing(message)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                      ) : (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => saveChanges(message.id)}
                          >
                            <Save className="w-4 h-4 mr-1" />
                            Guardar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={cancelEditing}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Cancelar
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    {editingMessage === message.id ? (
                      <Textarea
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        placeholder="Agregar notas del administrador..."
                        className="min-h-[100px]"
                      />
                    ) : (
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                        {message.admin_notes || 'Sin notas'}
                      </p>
                    )}
                  </div>
                  
                  {/* Acciones */}
                  <div className="flex flex-wrap gap-2 pt-4 border-t">
                    {getStatusActions(message)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
