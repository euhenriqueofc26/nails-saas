'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Scissors, Plus, X, Clock, Edit, Trash2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Service {
  id: string
  name: string
  price: number
  duration: number
  description: string | null
  image: string | null
  isActive: boolean
}

export default function ServicesPage() {
  const { token, user } = useAuth()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    duration: '60',
    description: '',
    image: '',
  })

  useEffect(() => {
    if (token) fetchServices()
  }, [token])

  const fetchServices = async () => {
    try {
      const res = await fetch('/api/services', { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      setServices(data.services)
    } catch (error) {
      console.error('Error fetching services:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const res = await fetch(editingService ? `/api/services/${editingService.id}` : '/api/services', {
        method: editingService ? 'PUT' : 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          name: formData.name,
          price: parseFloat(formData.price),
          duration: parseInt(formData.duration),
          description: formData.description || null,
          image: formData.image || null,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error)
      }

      toast.success(editingService ? 'Serviço atualizado!' : 'Serviço criado!')
      setShowModal(false)
      setEditingService(null)
      setFormData({ name: '', price: '', duration: '60', description: '', image: '' })
      fetchServices()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este serviço?')) return

    try {
      const res = await fetch(`/api/services/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!res.ok) throw new Error('Erro ao deletar')

      toast.success('Serviço deletado!')
      fetchServices()
    } catch (error) {
      toast.error('Erro ao deletar serviço')
    }
  }

  const toggleActive = async (service: Service) => {
    try {
      const res = await fetch(`/api/services/${service.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ isActive: !service.isActive }),
      })

      if (!res.ok) throw new Error('Erro ao atualizar')

      toast.success(service.isActive ? 'Serviço desativado!' : 'Serviço ativado!')
      fetchServices()
    } catch (error) {
      toast.error('Erro ao atualizar serviço')
    }
  }

  const openEdit = (service: Service) => {
    setEditingService(service)
    setFormData({
      name: service.name,
      price: service.price.toString(),
      duration: service.duration.toString(),
      description: service.description || '',
      image: service.image || '',
    })
    setShowModal(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-nude-900">Serviços</h1>
          <p className="text-nude-600">{services.length} serviços cadastrados</p>
        </div>
        <button
          onClick={() => { setEditingService(null); setFormData({ name: '', price: '', duration: '60', description: '', image: '' }); setShowModal(true) }}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          Novo Serviço
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-12">
          <Scissors size={48} className="mx-auto mb-4 text-nude-300" />
          <p className="text-nude-600">Nenhum serviço cadastrado</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service) => (
            <div key={service.id} className={`card ${!service.isActive ? 'opacity-60' : ''}`}>
              {service.image && (
                <div className="mb-3 -mx-6 -mt-6">
                  <img 
                    src={service.image} 
                    alt={service.name}
                    className="w-full h-40 object-cover rounded-t-xl"
                  />
                </div>
              )}
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-rose-100 rounded-lg">
                  <Scissors className="text-rose-600" size={24} />
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEdit(service)}
                    className="p-2 hover:bg-nude-100 rounded-lg"
                  >
                    <Edit size={16} className="text-nude-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(service.id)}
                    className="p-2 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 size={16} className="text-red-500" />
                  </button>
                </div>
              </div>

              <h3 className="font-semibold text-nude-900 text-lg">{service.name}</h3>
              {service.description && (
                <p className="text-sm text-nude-600 mt-1">{service.description}</p>
              )}

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-nude-200">
                <div className="flex items-center gap-2 text-nude-600">
                  <Clock size={16} />
                  <span className="text-sm">{service.duration} min</span>
                </div>
                <span className="text-xl font-bold text-rose-600">
                  {formatCurrency(service.price)}
                </span>
              </div>

              <button
                onClick={() => toggleActive(service)}
                className={`mt-3 text-sm w-full py-2 rounded-lg ${
                  service.isActive 
                    ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {service.isActive ? 'Ativo' : 'Inativo'}
              </button>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-nude-900">
                {editingService ? 'Editar Serviço' : 'Novo Serviço'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-nude-100 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-nude-700 mb-1">Nome do Serviço</label>
                <input
                  type="text"
                  required
                  className="input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Unha em Gel"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-nude-700 mb-1">Preço (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="input"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0,00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-nude-700 mb-1">Duração (min)</label>
                  <input
                    type="number"
                    required
                    className="input"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-nude-700 mb-1">URL da Imagem (opcional)</label>
                <input
                  type="url"
                  className="input"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://exemplo.com/imagem.jpg"
                />
                <p className="text-xs text-nude-500 mt-1">Cole a URL da imagem do serviço</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-nude-700 mb-1">Descrição (opcional)</label>
                <textarea
                  className="input min-h-[80px]"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição do serviço..."
                />
              </div>

              <button type="submit" className="btn btn-primary w-full">
                {editingService ? 'Salvar alterações' : 'Criar serviço'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
