'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Plus, Trash2, Send, Megaphone, DollarSign, Percent } from 'lucide-react'
import toast from 'react-hot-toast'

interface Promotion {
  id: string
  title: string
  message: string
  discount: number | null
  isActive: boolean
  sentCount: number
  createdAt: string
}

export default function PromotionsPage() {
  const { token } = useAuth()
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [sending, setSending] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    discount: ''
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (token) fetchPromotions()
  }, [token])

  const fetchPromotions = async () => {
    try {
      const res = await fetch('/api/promotions', { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      setPromotions(data.promotions || [])
    } catch (error) {
      console.error('Error fetching promotions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.message) {
      toast.error('Preencha todos os campos')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/promotions', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          title: formData.title,
          message: formData.message,
          discount: formData.discount ? parseFloat(formData.discount) : null
        }),
      })

      if (!res.ok) throw new Error('Erro ao criar')

      toast.success('Promoção criada!')
      setFormData({ title: '', message: '', discount: '' })
      setShowModal(false)
      fetchPromotions()
    } catch (error) {
      toast.error('Erro ao criar promoção')
    } finally {
      setSaving(false)
    }
  }

  const sendPromotion = async (promotionId: string) => {
    if (!confirm('Enviar esta promoção para todas as suas clientes via WhatsApp?')) return

    setSending(promotionId)
    try {
      const res = await fetch(`/api/promotions/${promotionId}/send`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error)

      toast.success(data.message)
      fetchPromotions()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao enviar')
    } finally {
      setSending(null)
    }
  }

  const deletePromotion = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir?')) return

    try {
      const res = await fetch(`/api/promotions/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!res.ok) throw new Error('Erro ao deletar')

      toast.success('Promoção removida!')
      fetchPromotions()
    } catch (error) {
      toast.error('Erro ao remover')
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
          <h1 className="text-2xl font-bold text-nude-900">Marketing</h1>
          <p className="text-nude-600">Envie promoções para suas clientes pelo WhatsApp</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          Nova Promoção
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-800 flex items-center gap-2">
          <Megaphone size={18} />
          Como funciona
        </h3>
        <p className="text-sm text-blue-700 mt-1">
          Crie uma promoção e envie para todas as suas clientes de uma vez pelo WhatsApp.
          Use {"{nome}"} para personalizar com o nome da cliente e {"{desconto}"} para o desconto.
        </p>
      </div>

      {promotions.length === 0 ? (
        <div className="card text-center py-12">
          <Megaphone size={48} className="mx-auto text-nude-300 mb-4" />
          <p className="text-nude-600">Nenhuma promoção criada</p>
          <p className="text-sm text-nude-500 mt-1">Crie sua primeira promoção para enviar às clientes</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {promotions.map((promotion) => (
            <div key={promotion.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-nude-900">{promotion.title}</h3>
                    {promotion.discount && (
                      <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                        <Percent size={12} />
                        {promotion.discount}%OFF
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-nude-600 mt-1 whitespace-pre-line">{promotion.message}</p>
                  <p className="text-xs text-nude-500 mt-2">
                    Enviada para {promotion.sentCount} clientes
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => sendPromotion(promotion.id)}
                    disabled={sending === promotion.id}
                    className="btn bg-green-500 hover:bg-green-600 text-white flex items-center gap-1"
                    title="Enviar promoção"
                  >
                    <Send size={16} />
                    {sending === promotion.id ? 'Enviando...' : 'Enviar'}
                  </button>
                  <button
                    onClick={() => deletePromotion(promotion.id)}
                    className="p-2 hover:bg-red-100 rounded-lg"
                    title="Excluir"
                  >
                    <Trash2 size={18} className="text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md animate-fade-in">
            <h2 className="text-xl font-bold text-nude-900 mb-4">Nova Promoção</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-nude-700 mb-1">Título</label>
                <input
                  type="text"
                  className="input"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Promoção de Natal"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-nude-700 mb-1">Desconto (%)</label>
                <div className="relative">
                  <Percent size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-nude-400" />
                  <input
                    type="number"
                    className="input pl-10"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                    placeholder="Ex: 10"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-nude-700 mb-1">Mensagem</label>
                <textarea
                  className="input min-h-[120px]"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder={`Olá {nome}! 👋

Temos uma promoção especial pra você: {desconto}%OFF em todos os serviços!

Agende agora e aproveite!

{estudio}`}
                />
                <p className="text-xs text-nude-500 mt-1">
                  Use {"{nome}"}, {"{desconto}"}, {"{estudio}"} para personalizar
                </p>
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
