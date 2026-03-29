'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Camera, Upload, Trash2, Calendar, Clock, DollarSign, Image as ImageIcon } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import toast from 'react-hot-toast'

interface Photo {
  id: string
  url: string
  createdAt: string
}

interface Appointment {
  id: string
  date: string
  status: string
  service: {
    name: string
    price: number
    duration: number
  }
}

interface Client {
  id: string
  name: string
  whatsapp: string
  notes: string | null
  _count: { appointments: number }
}

interface Props {
  client: Client
  onClose: () => void
}

export default function ClientProfileModal({ client, onClose }: Props) {
  const { token } = useAuth()
  const [activeTab, setActiveTab] = useState<'appointments' | 'photos'>('appointments')
  const [photos, setPhotos] = useState<Photo[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loadingPhotos, setLoadingPhotos] = useState(false)
  const [loadingAppointments, setLoadingAppointments] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchAppointments()
  }, [])

  useEffect(() => {
    if (activeTab === 'photos') {
      fetchPhotos()
    }
  }, [activeTab])

  const fetchPhotos = async () => {
    setLoadingPhotos(true)
    try {
      const res = await fetch(`/api/clients/${client.id}/photos`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setPhotos(data.photos || [])
    } catch (error) {
      console.error('Erro ao buscar fotos:', error)
    } finally {
      setLoadingPhotos(false)
    }
  }

  const fetchAppointments = async () => {
    setLoadingAppointments(true)
    try {
      const res = await fetch(`/api/clients/${client.id}/appointments`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setAppointments(data.appointments || [])
    } catch (error) {
      console.error('Erro ao buscar atendimentos:', error)
    } finally {
      setLoadingAppointments(false)
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Selecione uma imagem')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Imagem muito grande (máx 10MB)')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch(`/api/clients/${client.id}/photos`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      })

      if (!res.ok) throw new Error('Erro no upload')

      toast.success('Foto adicionada!')
      fetchPhotos()
    } catch (error) {
      toast.error('Erro ao fazer upload')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta foto?')) return

    try {
      const res = await fetch(`/api/clients/${client.id}/photos?photoId=${photoId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!res.ok) throw new Error('Erro ao deletar')

      toast.success('Foto excluída!')
      fetchPhotos()
    } catch (error) {
      toast.error('Erro ao excluir foto')
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center">
              <span className="text-rose-600 font-semibold text-lg">
                {client.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-nude-900">{client.name}</h2>
              <p className="text-sm text-nude-600">{client.whatsapp}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-nude-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('appointments')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'appointments'
                ? 'text-rose-600 border-b-2 border-rose-600'
                : 'text-nude-600 hover:text-nude-900'
            }`}
          >
            <Calendar size={16} className="inline mr-2" />
            Histórico ({client._count.appointments})
          </button>
          <button
            onClick={() => setActiveTab('photos')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'photos'
                ? 'text-rose-600 border-b-2 border-rose-600'
                : 'text-nude-600 hover:text-nude-900'
            }`}
          >
            <ImageIcon size={16} className="inline mr-2" />
            Fotos ({photos.length})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'appointments' && (
            <div className="space-y-3">
              {loadingAppointments ? (
                <div className="flex justify-center py-8">
                  <div className="w-6 h-6 border-2 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
                </div>
              ) : appointments.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar size={40} className="mx-auto mb-3 text-nude-300" />
                  <p className="text-nude-600">Nenhum atendimento registrado</p>
                </div>
              ) : (
                appointments.map((apt) => (
                  <div key={apt.id} className="flex items-center justify-between p-3 bg-nude-50 rounded-lg">
                    <div>
                      <p className="font-medium text-nude-900">{apt.service.name}</p>
                      <div className="flex items-center gap-3 text-sm text-nude-600 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {formatDate(apt.date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {apt.service.duration}min
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-rose-600">{formatPrice(apt.service.price)}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        apt.status === 'completed' ? 'bg-green-100 text-green-700' :
                        apt.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {apt.status === 'completed' ? 'Concluído' :
                         apt.status === 'cancelled' ? 'Cancelado' : 'Agendado'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'photos' && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="hidden"
              />
              
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full p-4 border-2 border-dashed border-nude-300 rounded-lg text-nude-600 hover:border-rose-400 hover:text-rose-600 transition-colors mb-4 disabled:opacity-50"
              >
                {uploading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
                    Enviando...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Upload size={20} />
                    Adicionar Foto
                  </div>
                )}
              </button>

              {loadingPhotos ? (
                <div className="flex justify-center py-8">
                  <div className="w-6 h-6 border-2 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
                </div>
              ) : photos.length === 0 ? (
                <div className="text-center py-8">
                  <Camera size={40} className="mx-auto mb-3 text-nude-300" />
                  <p className="text-nude-600">Nenhuma foto adicionada</p>
                  <p className="text-sm text-nude-400 mt-1">Clique acima para adicionar</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {photos.map((photo) => (
                    <div key={photo.id} className="relative group aspect-square">
                      <img
                        src={photo.url}
                        alt="Foto do cliente"
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <button
                          onClick={() => handleDeletePhoto(photo.id)}
                          className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <p className="absolute bottom-1 left-1 text-xs text-white bg-black/50 px-1 rounded">
                        {formatDate(photo.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
