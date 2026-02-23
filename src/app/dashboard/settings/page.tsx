'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { User, Lock, Crown, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const { token, user, login, logout } = useAuth()
  const [loading, setLoading] = useState(false)
  const [profileData, setProfileData] = useState({
    name: '',
    whatsapp: '',
    studioName: '',
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name,
        whatsapp: '',
        studioName: user.studioName,
      })
    }
  }, [user])

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      toast.success('Perfil atualizado!')
    } catch (error) {
      toast.error('Erro ao atualizar perfil')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('As senhas não coincidem')
      return
    }

    setLoading(true)

    try {
      toast.success('Senha atualizada!')
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      toast.error('Erro ao atualizar senha')
    } finally {
      setLoading(false)
    }
  }

  const planFeatures = {
    free: {
      name: 'Gratuito',
      features: [
        'Até 10 clientes',
        '50 agendamentos/mês',
        '5 serviços',
        'Página pública básica',
      ],
    },
    pro: {
      name: 'Pro',
      features: [
        'Até 100 clientes',
        '200 agendamentos/mês',
        '20 serviços',
        'Controle financeiro',
        'Página pública completa',
        'Análises',
      ],
    },
    premium: {
      name: 'Premium',
      features: [
        'Clientes ilimitados',
        'Agendamentos ilimitados',
        'Serviços ilimitados',
        'Controle financeiro completo',
        'Página pública completa',
        'Análises avançadas',
        'Suporte prioritário',
      ],
    },
  }

  const currentPlan = planFeatures[user?.planId as keyof typeof planFeatures] || planFeatures.free

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-nude-900">Configurações</h1>
        <p className="text-nude-600">Gerencie sua conta e preferências</p>
      </div>

      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-rose-100 rounded-lg">
            <User className="text-rose-600" size={20} />
          </div>
          <h2 className="text-lg font-semibold text-nude-900">Perfil</h2>
        </div>

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-nude-700 mb-1">Nome</label>
            <input
              type="text"
              className="input"
              value={profileData.name}
              onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-nude-700 mb-1">Nome do Studio</label>
            <input
              type="text"
              className="input"
              value={profileData.studioName}
              onChange={(e) => setProfileData({ ...profileData, studioName: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-nude-700 mb-1">Email</label>
            <input
              type="email"
              className="input bg-nude-50"
              value={user?.email}
              disabled
            />
            <p className="text-xs text-nude-500 mt-1">O email não pode ser alterado</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-nude-700 mb-1">WhatsApp</label>
            <input
              type="tel"
              className="input"
              value={profileData.whatsapp}
              onChange={(e) => setProfileData({ ...profileData, whatsapp: e.target.value })}
              placeholder="(11) 99999-9999"
            />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </form>
      </div>

      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-nude-200 rounded-lg">
            <Lock className="text-nude-700" size={20} />
          </div>
          <h2 className="text-lg font-semibold text-nude-900">Alterar Senha</h2>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-nude-700 mb-1">Senha atual</label>
            <input
              type="password"
              className="input"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-nude-700 mb-1">Nova senha</label>
              <input
                type="password"
                className="input"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-nude-700 mb-1">Confirmar senha</label>
              <input
                type="password"
                className="input"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Alterando...' : 'Alterar senha'}
          </button>
        </form>
      </div>

      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gold-100 rounded-lg">
            <Crown className="text-gold-600" size={20} />
          </div>
          <h2 className="text-lg font-semibold text-nude-900">Plano Atual</h2>
        </div>

        <div className="bg-nude-50 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-nude-900">{currentPlan.name}</span>
            <span className="text-sm text-nude-600 capitalize">{user?.planId}</span>
          </div>
          <ul className="space-y-1">
            {currentPlan.features.map((feature, i) => (
              <li key={i} className="text-sm text-nude-600 flex items-center gap-2">
                <span className="w-1 h-1 bg-gold-500 rounded-full" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center justify-between">
          <a href="#" className="text-rose-600 hover:text-rose-700 text-sm flex items-center gap-1">
            Ver planos disponíveis
            <ExternalLink size={14} />
          </a>
          {user?.slug && (
            <a 
              href={`/${user.slug}`} 
              target="_blank"
              className="text-nude-600 hover:text-nude-700 text-sm flex items-center gap-1"
            >
              Ver minha página pública
              <ExternalLink size={14} />
            </a>
          )}
        </div>
      </div>

      <div className="card border-red-200">
        <h2 className="text-lg font-semibold text-red-600 mb-4">Zona de Perigo</h2>
        <p className="text-sm text-nude-600 mb-4">
          Uma vez que você exclui sua conta, não há volta. Por favor, tenha certeza.
        </p>
        <button
          onClick={logout}
          className="btn bg-red-500 text-white hover:bg-red-600"
        >
          Excluir minha conta
        </button>
      </div>
    </div>
  )
}
