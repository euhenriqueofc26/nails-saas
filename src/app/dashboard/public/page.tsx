'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useOnboarding } from '@/hooks/useOnboarding'
import { Globe, Save, X, ExternalLink, Copy, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import ImageUpload from '@/components/ImageUpload'

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
  const { isActive: isOnboardingActive, completeOnboarding } = useOnboarding()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)
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

  const PUBLIC_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.clubnailsbrasil.com.br'
  const pageUrl = user?.slug ? `${PUBLIC_URL}/${user.slug}` : ''

  const handleCopy = async () => {
    if (!pageUrl) return

    try {
      await navigator.clipboard.writeText(pageUrl)
      setCopied(true)
      
      if (isOnboardingActive) {
        completeOnboarding()
      }
      
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      const textarea = document.createElement('textarea')
      textarea.value = pageUrl
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      
      if (isOnboardingActive) {
        completeOnboarding()
      }
      
      setTimeout(() => setCopied(false), 2000)
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

      {pageUrl && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 p-4 bg-gold-50 border border-gold-200 rounded-lg" data-onboarding="copy-link">
          <input
            readOnly
            value={pageUrl}
            onClick={(e) => (e.target as HTMLInputElement).select()}
            className="flex-1 min-w-0 px-3 py-2 bg-white border border-gold-200 rounded text-nude-800 text-sm font-mono truncate cursor-text"
            aria-label="Link da sua página pública"
          />
          <button
            onClick={handleCopy}
            aria-label="Copiar link da página pública"
            title="Copiar link"
            data-onboarding="copy-link-button"
            className={`flex items-center justify-center gap-2 px-3 py-2 text-sm rounded transition-all duration-200 ${
              copied
                ? 'bg-green-50 border-green-300 text-green-700'
                : 'bg-white border border-nude-300 text-nude-600 hover:bg-nude-100'
            }`}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copiado!' : 'Copiar'}
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-nude-900 mb-4">Informações Básicas</h2>
          
            <div className="space-y-4">
            <ImageUpload
              value={formData.coverImage}
              onChange={(url) => setFormData({ ...formData, coverImage: url })}
              label="Imagem de Capa (Hero)"
            />
            <div data-onboarding="cover-image" />

            <div>
              <label className="block text-sm font-medium text-nude-700 mb-1">Bio / Descrição</label>
              <textarea
                className="input min-h-[100px]"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Conte um pouco sobre seu trabalho..."
                data-onboarding="bio"
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
                data-onboarding="address"
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
                data-onboarding="working-hours"
              />
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-nude-900 mb-4">Redes Sociais</h2>
          
          <div className="space-y-4">
            <div data-onboarding="socials">
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
          data-onboarding="save"
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
