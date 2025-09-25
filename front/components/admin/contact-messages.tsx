"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone, MapPin, Calendar, Eye, Check, Trash2 } from "lucide-react"
import axios from "axios"

interface ContactMessage {
  id: number
  first_name: string
  last_name: string
  email: string
  phone: string
  project_location: string
  timeline: string
  comments: string
  created_at: string
  is_read: boolean
}

export default function ContactMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)
  const [showDetail, setShowDetail] = useState(false)

  const loadMessages = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const token = localStorage.getItem("u2-admin-token")
      const response = await axios.get("/api/admin/contact-messages/", {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMessages(response.data)
    } catch (err: any) {
      console.error('Error cargando mensajes:', err)
      setError('Error al cargar mensajes de contacto')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadMessages()
  }, [])

  const markAsRead = async (messageId: number) => {
    try {
      const token = localStorage.getItem("u2-admin-token")
      await axios.post(`/api/admin/contact-messages/${messageId}/mark_as_read/`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, is_read: true } : msg
      ))
    } catch (err) {
      console.error('Error marcando como leído:', err)
    }
  }

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("u2-admin-token")
      await axios.post("/api/admin/contact-messages/mark_all_as_read/", {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMessages(prev => prev.map(msg => ({ ...msg, is_read: true })))
    } catch (err) {
      console.error('Error marcando todos como leídos:', err)
    }
  }

  const deleteMessage = async (messageId: number) => {
    if (!confirm("¿Seguro que quieres eliminar este mensaje?")) return
    
    try {
      const token = localStorage.getItem("u2-admin-token")
      await axios.delete(`/api/admin/contact-messages/${messageId}/`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMessages(prev => prev.filter(msg => msg.id !== messageId))
    } catch (err) {
      console.error('Error eliminando mensaje:', err)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTimelineLabel = (timeline: string) => {
    const labels = {
      'asap': 'Lo antes posible',
      '3-months': 'Dentro de 3 meses',
      '6-months': 'Dentro de 6 meses',
      '1-year': 'Dentro de 1 año',
      'planning': 'Solo planificando'
    }
    return labels[timeline as keyof typeof labels] || timeline
  }

  if (showDetail && selectedMessage) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button onClick={() => setShowDetail(false)} variant="outline">
            ← Volver a mensajes
          </Button>
          <div className="flex space-x-2">
            {!selectedMessage.is_read && (
              <Button onClick={() => markAsRead(selectedMessage.id)} size="sm">
                <Check className="h-4 w-4 mr-2" />
                Marcar como leído
              </Button>
            )}
            <Button 
              onClick={() => deleteMessage(selectedMessage.id)} 
              variant="destructive" 
              size="sm"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </Button>
          </div>
        </div>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedMessage.first_name} {selectedMessage.last_name}
              </h2>
              <p className="text-gray-600">{selectedMessage.email}</p>
            </div>
            <div className="text-right">
              <Badge variant={selectedMessage.is_read ? "secondary" : "default"}>
                {selectedMessage.is_read ? "Leído" : "Nuevo"}
              </Badge>
              <p className="text-sm text-gray-500 mt-1">
                {formatDate(selectedMessage.created_at)}
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Teléfono</p>
                  <p className="font-medium">{selectedMessage.phone || 'No proporcionado'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Ubicación del proyecto</p>
                  <p className="font-medium">{selectedMessage.project_location || 'No especificada'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Timeline</p>
                  <p className="font-medium">{getTimelineLabel(selectedMessage.timeline)}</p>
                </div>
              </div>
            </div>
          </div>

          {selectedMessage.comments && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Comentarios adicionales</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 whitespace-pre-wrap">{selectedMessage.comments}</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
          <Button onClick={loadMessages} size="sm" className="mt-2">
            Reintentar
          </Button>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mensajes de Contacto</h2>
          <p className="text-gray-600">
            {messages.filter(m => !m.is_read).length} mensajes nuevos de {messages.length} total
          </p>
        </div>
        <div className="flex space-x-2">
          {messages.some(m => !m.is_read) && (
            <Button onClick={markAllAsRead} variant="outline">
              <Check className="h-4 w-4 mr-2" />
              Marcar todos como leídos
            </Button>
          )}
          <Button onClick={loadMessages} variant="outline">
            Actualizar
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando mensajes...</p>
        </div>
      ) : messages.length === 0 ? (
        <div className="text-center py-8">
          <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No hay mensajes de contacto</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <Card key={message.id} className={`p-4 hover:shadow-md transition-shadow ${!message.is_read ? 'border-l-4 border-l-blue-500' : ''}`}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">
                      {message.first_name} {message.last_name}
                    </h3>
                    {!message.is_read && (
                      <Badge variant="default">Nuevo</Badge>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mb-1">{message.email}</p>
                  <p className="text-gray-500 text-sm">{formatDate(message.created_at)}</p>
                  {message.comments && (
                    <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                      {message.comments}
                    </p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedMessage(message)
                      setShowDetail(true)
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver
                  </Button>
                  {!message.is_read && (
                    <Button
                      size="sm"
                      onClick={() => markAsRead(message.id)}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Leído
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteMessage(message.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}


import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone, MapPin, Calendar, Eye, Check, Trash2 } from "lucide-react"
import axios from "axios"

interface ContactMessage {
  id: number
  first_name: string
  last_name: string
  email: string
  phone: string
  project_location: string
  timeline: string
  comments: string
  created_at: string
  is_read: boolean
}

export default function ContactMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)
  const [showDetail, setShowDetail] = useState(false)

  const loadMessages = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const token = localStorage.getItem("u2-admin-token")
      const response = await axios.get("/api/admin/contact-messages/", {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMessages(response.data)
    } catch (err: any) {
      console.error('Error cargando mensajes:', err)
      setError('Error al cargar mensajes de contacto')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadMessages()
  }, [])

  const markAsRead = async (messageId: number) => {
    try {
      const token = localStorage.getItem("u2-admin-token")
      await axios.post(`/api/admin/contact-messages/${messageId}/mark_as_read/`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, is_read: true } : msg
      ))
    } catch (err) {
      console.error('Error marcando como leído:', err)
    }
  }

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("u2-admin-token")
      await axios.post("/api/admin/contact-messages/mark_all_as_read/", {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMessages(prev => prev.map(msg => ({ ...msg, is_read: true })))
    } catch (err) {
      console.error('Error marcando todos como leídos:', err)
    }
  }

  const deleteMessage = async (messageId: number) => {
    if (!confirm("¿Seguro que quieres eliminar este mensaje?")) return
    
    try {
      const token = localStorage.getItem("u2-admin-token")
      await axios.delete(`/api/admin/contact-messages/${messageId}/`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMessages(prev => prev.filter(msg => msg.id !== messageId))
    } catch (err) {
      console.error('Error eliminando mensaje:', err)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTimelineLabel = (timeline: string) => {
    const labels = {
      'asap': 'Lo antes posible',
      '3-months': 'Dentro de 3 meses',
      '6-months': 'Dentro de 6 meses',
      '1-year': 'Dentro de 1 año',
      'planning': 'Solo planificando'
    }
    return labels[timeline as keyof typeof labels] || timeline
  }

  if (showDetail && selectedMessage) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button onClick={() => setShowDetail(false)} variant="outline">
            ← Volver a mensajes
          </Button>
          <div className="flex space-x-2">
            {!selectedMessage.is_read && (
              <Button onClick={() => markAsRead(selectedMessage.id)} size="sm">
                <Check className="h-4 w-4 mr-2" />
                Marcar como leído
              </Button>
            )}
            <Button 
              onClick={() => deleteMessage(selectedMessage.id)} 
              variant="destructive" 
              size="sm"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </Button>
          </div>
        </div>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedMessage.first_name} {selectedMessage.last_name}
              </h2>
              <p className="text-gray-600">{selectedMessage.email}</p>
            </div>
            <div className="text-right">
              <Badge variant={selectedMessage.is_read ? "secondary" : "default"}>
                {selectedMessage.is_read ? "Leído" : "Nuevo"}
              </Badge>
              <p className="text-sm text-gray-500 mt-1">
                {formatDate(selectedMessage.created_at)}
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Teléfono</p>
                  <p className="font-medium">{selectedMessage.phone || 'No proporcionado'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Ubicación del proyecto</p>
                  <p className="font-medium">{selectedMessage.project_location || 'No especificada'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Timeline</p>
                  <p className="font-medium">{getTimelineLabel(selectedMessage.timeline)}</p>
                </div>
              </div>
            </div>
          </div>

          {selectedMessage.comments && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Comentarios adicionales</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 whitespace-pre-wrap">{selectedMessage.comments}</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
          <Button onClick={loadMessages} size="sm" className="mt-2">
            Reintentar
          </Button>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mensajes de Contacto</h2>
          <p className="text-gray-600">
            {messages.filter(m => !m.is_read).length} mensajes nuevos de {messages.length} total
          </p>
        </div>
        <div className="flex space-x-2">
          {messages.some(m => !m.is_read) && (
            <Button onClick={markAllAsRead} variant="outline">
              <Check className="h-4 w-4 mr-2" />
              Marcar todos como leídos
            </Button>
          )}
          <Button onClick={loadMessages} variant="outline">
            Actualizar
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando mensajes...</p>
        </div>
      ) : messages.length === 0 ? (
        <div className="text-center py-8">
          <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No hay mensajes de contacto</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <Card key={message.id} className={`p-4 hover:shadow-md transition-shadow ${!message.is_read ? 'border-l-4 border-l-blue-500' : ''}`}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">
                      {message.first_name} {message.last_name}
                    </h3>
                    {!message.is_read && (
                      <Badge variant="default">Nuevo</Badge>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mb-1">{message.email}</p>
                  <p className="text-gray-500 text-sm">{formatDate(message.created_at)}</p>
                  {message.comments && (
                    <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                      {message.comments}
                    </p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedMessage(message)
                      setShowDetail(true)
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver
                  </Button>
                  {!message.is_read && (
                    <Button
                      size="sm"
                      onClick={() => markAsRead(message.id)}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Leído
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteMessage(message.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
