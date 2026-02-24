'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Globe, Save, X, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'

interface PublicProfile {
  bio: string
  coverImage: string
  address: string
  instagram: string
  facebook: string
  workingHours: string
  isActive: boolean
}

export default function PublicPage() {
  const { token, user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<PublicProfile>({
    bio: '',
    coverImage: '',
    address: '',
    instagram: '',
    facebook: '',
    workingHours: '',
    isActive: true,
  })

  useEffect(() => {
    if (token) fetchProfile()
  }, [token])

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile', { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      
      if (data.profile) {
        setFormData({
          bio: data.profile.bio || '',
          coverImage: data.profile.coverImage || '',
          address: data.profile.address || '',
          instagram: data.profile.instagram || '',
          facebook: data.profile.facebook || '',
          workingHours: data.profile.workingHours || '',
          isActive: data.profile.isActive ?? true,
        })
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
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

      toast.success('Perfil público atualizado!')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setSaving(false)
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
    <div className="space-y-6 max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-nude-900">Página Pública</h1>
          <p className="text-nude-600">Configure sua página de agendamento online</p>
        </div>
        {user?.slug && (
          <a 
            href={`/${user.slug}`}
            target="_blank"
            className="btn btn-outline flex items-center gap-2"
          >
            <Globe size={18} />
            Ver página
            <ExternalLink size={14} />
          </a>
        )}
      </div>

      <div className="bg-gold-50 border border-gold-200 rounded-lg p-4">
        <p className="text-sm text-gold-800">
          <strong>URL:</strong> {typeof window !== 'undefined' ? window.location.origin : ''}/{user?.slug}
        </p>
        <p className="text-xs text-gold-600 mt-1">
          Compartilhe este link com suas clientes para agendamentos online
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-nude-900 mb-4">Informações Básicas</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-nude-700 mb-1">Imagem de Capa (Hero)</label>
              <input
                type="url"
                className="input"
                value={formData.coverImage}
                onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                placeholder="https://exemplo.com/imagem.jpg"
              />
              <p className="text-xs text-nude-500 mt-1">URL da imagem que aparece no topo da página pública</p>
              {formData.coverImage && (
                <div className="mt-2 rounded-lg overflow-hidden h-32">
                  <img src={formData.coverImage} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-nude-700 mb-1">Bio / Descrição</label>
              <textarea
                className="input min-h-[100px]"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Conte um pouco sobre seu trabalho..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-nude-700 mb-1">Endereço</label>
              <input
                type="text"
                className="input"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Rua, número, bairro, cidade"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-nude-700 mb-1">Horário de Funcionamento</label>
              <input
                type="text"
                className="input"
                value={formData.workingHours}
                onChange={(e) => setFormData({ ...formData, workingHours: e.target.value })}
                placeholder="Seg a Sex: 9h às 18h | Sáb: 9h às 14h"
              />
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-nude-900 mb-4">Redes Sociais</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-nude-700 mb-1">Instagram</label>
              <input
                type="text"
                className="input"
                value={formData.instagram}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                placeholder="@seuinstagram"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-nude-700 mb-1">Facebook</label>
              <input
                type="text"
                className="input"
                value={formData.facebook}
                onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                placeholder="https://facebook.com/suapagina"
              />
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-nude-900 mb-4">Configurações</h2>
          
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-5 h-5 rounded border-nude-300 text-rose-500 focus:ring-rose-500"
            />
            <div>
              <p className="font-medium text-nude-900">Página ativa</p>
              <p className="text-sm text-nude-600">Quando ativado, suas clientes podem fazer agendamentos online</p>
            </div>
          </label>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="btn btn-primary w-full flex items-center justify-center gap-2"
        >
          {saving ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Save size={18} />
              Salvar configurações
            </>
          )}
        </button>
      </form>
    </div>
  )
}
