'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { 
  Calendar, 
  DollarSign, 
  Users, 
  Clock, 
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle,
  Shield,
  Camera,
  X,
  Star,
  TrendingDown,
  BarChart3
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { formatCurrency, formatDate, formatTime } from '@/lib/utils'

interface DashboardData {
  todayAppointments: any[]
  todayRevenue: number
  monthlyRevenue: number
  lastMonthRevenue: number
  comparisonPercent: number
  activeClients: number
  upcomingAppointments: any[]
  stats: {
    totalToday: number
    pending: number
    confirmed: number
  }
  analytics: {
    topServices: { name: string; count: number; revenue: number }[]
    busiestDays: { day: string; count: number }[]
    busiestTimes: { time: string; count: number }[]
    frequentClients: { name: string; count: number }[]
    cancellationRate: number
    newClientsThisMonth: number
    recurringClients: number
  }
}

export default function DashboardPage() {
  const { user, token, updateUser } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAvatarModal, setShowAvatarModal] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState('')
  const [savingAvatar, setSavingAvatar] = useState(false)

  useEffect(() => {
    if (token) {
      fetchDashboard()
      const interval = setInterval(fetchDashboard, 5000)
      return () => clearInterval(interval)
    }
  }, [token])

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setData(data)
    } catch (error) {
      console.error('Error fetching dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveAvatar = async () => {
    if (!avatarUrl.trim()) return
    
    setSavingAvatar(true)
    try {
      console.log('Saving avatar:', avatarUrl)
      const res = await fetch('/api/user/avatar', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ avatar: avatarUrl })
      })
      
      const data = await res.json()
      console.log('Response:', res.status, data)
      
      if (!res.ok) throw new Error(data.error || 'Erro ao salvar')
      
      updateUser({ avatar: avatarUrl })
      toast.success('Foto atualizada!')
      setShowAvatarModal(false)
      setAvatarUrl('')
    } catch (error: any) {
      console.error('Error saving avatar:', error)
      toast.error(error.message || 'Erro ao salvar')
    } finally {
      setSavingAvatar(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
      </div>
    )
  }

  const stats = [
    {
      label: 'Agendamentos hoje',
      value: data?.stats.totalToday || 0,
      icon: Calendar,
      color: 'bg-rose-100 text-rose-600',
    },
    {
      label: 'Faturamento do mês',
      value: formatCurrency(data?.monthlyRevenue || 0),
      icon: DollarSign,
      color: 'bg-gold-100 text-gold-600',
    },
    {
      label: 'Clientes ativos',
      value: data?.activeClients || 0,
      icon: Users,
      color: 'bg-nude-200 text-nude-700',
    },
    {
      label: 'Pendentes',
      value: data?.stats.pending || 0,
      icon: AlertCircle,
      color: 'bg-orange-100 text-orange-600',
    },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="text-green-500" size={16} />
      case 'pending':
        return <AlertCircle className="text-orange-500" size={16} />
      case 'cancelled':
        return <XCircle className="text-red-500" size={16} />
      case 'completed':
        return <CheckCircle className="text-rose-500" size={16} />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            {user?.avatar ? (
              <img 
                src={user.avatar} 
                alt={user.name} 
                className="w-12 h-12 rounded-full object-cover border-2 border-nude-200 shadow-md"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-nude-200 flex items-center justify-center text-nude-600 font-bold text-lg border-2 border-nude-300 shadow-md">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <button 
              onClick={() => setShowAvatarModal(true)}
              className="absolute -bottom-1 -right-1 bg-nude-600 text-white p-1.5 rounded-full shadow-md hover:bg-nude-700 transition-colors"
            >
              <Camera size={14} />
            </button>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-nude-900">Dashboard</h1>
            <p className="text-nude-600">Bem-vindo, {user?.name}!</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchDashboard} className="btn btn-secondary">
            Atualizar
          </button>
          <Link
            href="/dashboard/admin"
            className="btn btn-primary flex items-center gap-2"
          >
            <Shield size={18} />
            Admin
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-nude-600">{stat.label}</p>
                <p className="text-2xl font-bold text-nude-900 mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.color}`}>
                <stat.icon size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-nude-900">Agendamentos de Hoje</h2>
            <Link href="/dashboard/appointments" className="text-sm text-rose-600 hover:text-rose-700">
              Ver todos
            </Link>
          </div>

          {data?.todayAppointments.length === 0 ? (
            <div className="text-center py-8 text-nude-500">
              <Calendar size={40} className="mx-auto mb-2 opacity-50" />
              <p>Nenhum agendamento hoje</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data?.todayAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="flex items-center justify-between p-3 bg-nude-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-center min-w-[60px]">
                      <p className="text-lg font-semibold text-nude-900">{apt.startTime}</p>
                    </div>
                    <div>
                      <p className="font-medium text-nude-900">{apt.client.name}</p>
                      <p className="text-sm text-nude-600">{apt.service.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-nude-700">
                      {formatCurrency(apt.price)}
                    </span>
                    {getStatusIcon(apt.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-nude-900">Próximos Agendamentos</h2>
          </div>

          {data?.upcomingAppointments.length === 0 ? (
            <div className="text-center py-8 text-nude-500">
              <Clock size={40} className="mx-auto mb-2 opacity-50" />
              <p>Nenhum agendamento futuro</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data?.upcomingAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="flex items-center justify-between p-3 bg-nude-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-center min-w-[80px]">
                      <p className="text-sm font-medium text-nude-900">
                        {formatDate(apt.date)}
                      </p>
                      <p className="text-xs text-nude-600">{apt.startTime}</p>
                    </div>
                    <div>
                      <p className="font-medium text-nude-900">{apt.client.name}</p>
                      <p className="text-sm text-nude-600">{apt.service.name}</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-nude-700">
                    {formatCurrency(apt.price)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/dashboard/clients" className="card hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-rose-100 rounded-full">
              <Users className="text-rose-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-nude-600">Clientes</p>
              <p className="text-lg font-semibold text-nude-900">{data?.activeClients || 0}</p>
            </div>
          </div>
        </Link>

        <Link href="/dashboard/financial" className="card hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gold-100 rounded-full">
              <TrendingUp className="text-gold-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-nude-600">Receita hoje</p>
              <p className="text-lg font-semibold text-nude-900">
                {formatCurrency(data?.todayRevenue || 0)}
              </p>
            </div>
          </div>
        </Link>

        <Link href="/dashboard/services" className="card hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-nude-200 rounded-full">
              <DollarSign className="text-nude-700" size={24} />
            </div>
            <div>
              <p className="text-sm text-nude-600">Serviços</p>
              <p className="text-lg font-semibold text-nude-900">Gerenciar</p>
            </div>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-nude-900">Análises</h2>
            <BarChart3 size={20} className="text-nude-500" />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-nude-50 rounded-lg">
              <div>
                <p className="text-sm text-nude-600">vs Mês Passado</p>
                <p className={`text-lg font-bold ${data?.comparisonPercent && data.comparisonPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {data?.comparisonPercent && data.comparisonPercent >= 0 ? '+' : ''}{data?.comparisonPercent || 0}%
                </p>
              </div>
              {data?.comparisonPercent && data.comparisonPercent >= 0 ? (
                <TrendingUp className="text-green-600" size={24} />
              ) : (
                <TrendingDown className="text-red-600" size={24} />
              )}
            </div>

            <div className="flex items-center justify-between p-3 bg-nude-50 rounded-lg">
              <div>
                <p className="text-sm text-nude-600">Taxa de Cancelamento</p>
                <p className="text-lg font-bold text-nude-900">{data?.analytics?.cancellationRate || 0}%</p>
              </div>
              <XCircle className="text-red-500" size={24} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-nude-50 rounded-lg text-center">
                <p className="text-sm text-nude-600">Clientes Novos</p>
                <p className="text-lg font-bold text-nude-900">{data?.analytics?.newClientsThisMonth || 0}</p>
              </div>
              <div className="p-3 bg-nude-50 rounded-lg text-center">
                <p className="text-sm text-nude-600">Recorrentes</p>
                <p className="text-lg font-bold text-nude-900">{data?.analytics?.recurringClients || 0}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-nude-900">Serviços Mais Pedidos</h2>
            <Star size={20} className="text-yellow-500" />
          </div>
          
          {data?.analytics?.topServices && data.analytics.topServices.length > 0 ? (
            <div className="space-y-3">
              {data.analytics.topServices.map((service, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-nude-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </span>
                    <span className="font-medium text-nude-900">{service.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-nude-900">{service.count}x</p>
                    <p className="text-xs text-nude-600">{formatCurrency(service.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-nude-500 text-center py-4">Nenhum dado disponível</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-nude-900">Dias Mais Movimentados</h2>
            <Calendar size={20} className="text-nude-500" />
          </div>
          
          {data?.analytics?.busiestDays && data.analytics.busiestDays.length > 0 ? (
            <div className="space-y-2">
              {data.analytics.busiestDays.slice(0, 5).map((day, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-nude-700">{day.day}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-nude-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-rose-500 rounded-full" 
                        style={{ width: `${(day.count / (data.analytics.busiestDays[0]?.count || 1)) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-nude-900 w-8 text-right">{day.count}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-nude-500 text-center py-4">Nenhum dado disponível</p>
          )}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-nude-900">Horários Mais Movimentados</h2>
            <Clock size={20} className="text-nude-500" />
          </div>
          
          {data?.analytics?.busiestTimes && data.analytics.busiestTimes.length > 0 ? (
            <div className="space-y-2">
              {data.analytics.busiestTimes.slice(0, 5).map((time, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-nude-700">{time.time}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-nude-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-rose-500 rounded-full" 
                        style={{ width: `${(time.count / (data.analytics.busiestTimes[0]?.count || 1)) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-nude-900 w-8 text-right">{time.count}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-nude-500 text-center py-4">Nenhum dado disponível</p>
          )}
        </div>
      </div>

      {showAvatarModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-nude-900">Alterar Foto de Perfil</h2>
              <button onClick={() => setShowAvatarModal(false)} className="p-2 hover:bg-nude-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-nude-700 mb-1">URL da Imagem</label>
                <input
                  type="url"
                  className="input"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://exemplo.com/foto.jpg"
                />
                <p className="text-xs text-nude-500 mt-1">
                  Cole a URL de uma imagem (vá até a imagem, clique com botão direito e "Copiar endereço da imagem")
                </p>
              </div>
              {avatarUrl && (
                <div className="flex justify-center">
                  <img 
                    src={avatarUrl} 
                    alt="Preview" 
                    className="w-24 h-24 rounded-full object-cover border-2 border-nude-200 shadow-md"
                    onError={(e) => {
                      e.currentTarget.src = ''
                    }}
                  />
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAvatarModal(false)}
                  className="btn btn-secondary flex-1"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveAvatar}
                  disabled={savingAvatar || !avatarUrl.trim()}
                  className="btn btn-primary flex-1"
                >
                  {savingAvatar ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
