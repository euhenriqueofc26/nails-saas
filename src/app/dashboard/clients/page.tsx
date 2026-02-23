'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Users, Plus, Search, X, Phone, Calendar, Edit, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface Client {
  id: string
  name: string
  whatsapp: string
  notes: string | null
  lastServiceDate: string | null
  createdAt: string
  photos: { id: string; url: string }[]
  _count: { appointments: number }
}

export default function ClientsPage() {
  const { token, user } = useAuth()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [formData, setFormData] = useState({ name: '', whatsapp: '', notes: '' })

  useEffect(() => {
    if (token) fetchClients()
  }, [token, search])

  const fetchClients = async () => {
    try {
      const url = search 
        ? `/api/clients?search=${encodeURIComponent(search)}`
        : '/api/clients'
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      setClients(data.clients)
    } catch (error) {
      console.error('Error fetching clients:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const res = await fetch(editingClient ? `/api/clients/${editingClient.id}` : '/api/clients', {
        method: editingClient ? 'PUT' : 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error)
      }

      toast.success(editingClient ? 'Cliente atualizado!' : 'Cliente criado!')
      setShowModal(false)
      setEditingClient(null)
      setFormData({ name: '', whatsapp: '', notes: '' })
      fetchClients()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este cliente?')) return

    try {
      const res = await fetch(`/api/clients/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!res.ok) throw new Error('Erro ao deletar')

      toast.success('Cliente deletado!')
      fetchClients()
    } catch (error) {
      toast.error('Erro ao deletar cliente')
    }
  }

  const openEdit = (client: Client) => {
    setEditingClient(client)
    setFormData({ name: client.name, whatsapp: client.whatsapp, notes: client.notes || '' })
    setShowModal(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-nude-900">Clientes</h1>
          <p className="text-nude-600">{clients.length} clientes cadastrados</p>
        </div>
        <button
          onClick={() => { setEditingClient(null); setFormData({ name: '', whatsapp: '', notes: '' }); setShowModal(true) }}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          Novo Cliente
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-nude-400" size={20} />
        <input
          type="text"
          placeholder="Buscar por nome ou WhatsApp..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input pl-10"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
        </div>
      ) : clients.length === 0 ? (
        <div className="text-center py-12">
          <Users size={48} className="mx-auto mb-4 text-nude-300" />
          <p className="text-nude-600">Nenhum cliente encontrado</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {clients.map((client) => (
            <div key={client.id} className="card flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center">
                  <span className="text-rose-600 font-semibold">
                    {client.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-nude-900">{client.name}</h3>
                  <div className="flex items-center gap-3 text-sm text-nude-600">
                    <span className="flex items-center gap-1">
                      <Phone size={14} />
                      {client.whatsapp}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {client._count.appointments} atendimentos
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEdit(client)}
                  className="p-2 hover:bg-nude-100 rounded-lg transition-colors"
                >
                  <Edit size={18} className="text-nude-600" />
                </button>
                <button
                  onClick={() => handleDelete(client.id)}
                  className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={18} className="text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-nude-900">
                {editingClient ? 'Editar Cliente' : 'Novo Cliente'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-nude-100 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-nude-700 mb-1">Nome</label>
                <input
                  type="text"
                  required
                  className="input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-nude-700 mb-1">WhatsApp</label>
                <input
                  type="tel"
                  required
                  className="input"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-nude-700 mb-1">Observações</label>
                <textarea
                  className="input min-h-[100px]"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Observações sobre o cliente..."
                />
              </div>
              <button type="submit" className="btn btn-primary w-full">
                {editingClient ? 'Salvar alterações' : 'Criar cliente'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
