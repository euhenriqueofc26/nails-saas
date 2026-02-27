'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Plus, Trash2, ExternalLink, Package } from 'lucide-react'
import toast from 'react-hot-toast'

interface Supplier {
  id: string
  name: string
  link: string
}

export default function SuppliersPage() {
  const { token } = useAuth()
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({ name: '', link: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (token) fetchSuppliers()
  }, [token])

  const fetchSuppliers = async () => {
    try {
      const res = await fetch('/api/suppliers', { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      setSuppliers(data.suppliers || [])
    } catch (error) {
      console.error('Error fetching suppliers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.link) {
      toast.error('Preencha todos os campos')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(formData),
      })

      if (!res.ok) throw new Error('Erro ao criar')

      toast.success('Fornecedor adicionado!')
      setFormData({ name: '', link: '' })
      setShowModal(false)
      fetchSuppliers()
    } catch (error) {
      toast.error('Erro ao adicionar fornecedor')
    } finally {
      setSaving(false)
    }
  }

  const deleteSupplier = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir?')) return

    try {
      const res = await fetch(`/api/suppliers/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!res.ok) throw new Error('Erro ao deletar')

      toast.success('Fornecedor removido!')
      fetchSuppliers()
    } catch (error) {
      toast.error('Erro ao remover fornecedor')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-nude-900">Fornecedores</h1>
          <p className="text-nude-600">Seus fornecedores favoritos em um só lugar</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          Adicionar Fornecedor
        </button>
      </div>

      {suppliers.length === 0 ? (
        <div className="card text-center py-12">
          <Package size={48} className="mx-auto text-nude-300 mb-4" />
          <p className="text-nude-600">Nenhum fornecedor cadastrado</p>
          <p className="text-sm text-nude-500 mt-1">Adicione seus fornecedores favoritos para acesso rápido</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {suppliers.map((supplier) => (
            <div key={supplier.id} className="card flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center">
                  <Package size={20} className="text-rose-600" />
                </div>
                <div>
                  <p className="font-medium text-nude-900">{supplier.name}</p>
                  <p className="text-sm text-nude-500 truncate max-w-xs">{supplier.link}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={supplier.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 hover:bg-nude-100 rounded-lg"
                  title="Acessar"
                >
                  <ExternalLink size={18} className="text-nude-600" />
                </a>
                <button
                  onClick={() => deleteSupplier(supplier.id)}
                  className="p-2 hover:bg-red-100 rounded-lg"
                  title="Excluir"
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
            <h2 className="text-xl font-bold text-nude-900 mb-4">Adicionar Fornecedor</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-nude-700 mb-1">Nome</label>
                <input
                  type="text"
                  className="input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Bella Hair"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-nude-700 mb-1">Link</label>
                <input
                  type="url"
                  className="input"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary flex-1"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary flex-1"
                >
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
