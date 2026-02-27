'use client'

import { useState } from 'react'
import { User, Calendar, LogOut, X, CheckCircle, XCircle, Clock } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

interface Appointment {
  id: string
  date: string
  startTime: string
  status: string
  price: number
  service: {
    name: string
  }
}

interface Client {
  id: string
  name: string
  whatsapp: string
}

interface ClientAreaProps {
  studioSlug: string
  studioWhatsapp: string
}

export default function ClientArea({ studioSlug, studioWhatsapp }: ClientAreaProps) {
  const [client, setClient] = useState<Client | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [whatsapp, setWhatsapp] = useState('')

  const handleLogin = async () => {
    if (!whatsapp) return
    
    setLoading(true)
    try {
      const res = await fetch(`/api/public/${studioSlug}/client-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ whatsapp }),
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        alert(data.error || 'Erro ao fazer login')
        return
      }
      
      setClient(data.client)
      localStorage.setItem('clientToken', data.token)
      localStorage.setItem('clientId', data.client.id)
      
      fetchAppointments(data.client.id, data.token)
    } catch (error) {
      console.error('Login error:', error)
      alert('Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  const fetchAppointments = async (clientId: string, token: string) => {
    try {
      const res = await fetch(
        `/api/public/${studioSlug}/client-appointments?clientId=${clientId}&token=${token}`
      )
      const data = await res.json()
      if (res.ok) {
        setAppointments(data.appointments)
      }
    } catch (error) {
      console.error('Error fetching appointments:', error)
    }
  }

  const handleLogout = () => {
    setClient(null)
    setAppointments([])
    localStorage.removeItem('clientToken')
    localStorage.removeItem('clientId')
    setShowLogin(false)
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return { label: 'Pendente', color: 'bg-orange-100 text-orange-700' }
      case 'confirmed': return { label: 'Confirmado', color: 'bg-blue-100 text-blue-700' }
      case 'completed': return { label: 'Concluído', color: 'bg-green-100 text-green-700' }
      case 'cancelled': return { label: 'Cancelado', color: 'bg-red-100 text-red-700' }
      default: return { label: status, color: 'bg-gray-100 text-gray-700' }
    }
  }

  if (!client) {
    return (
      <section className="py-16 bg-nude-50">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <User size={40} className="mx-auto text-nude-400 mb-4" />
          <h2 className="text-2xl font-bold text-nude-900 mb-2">Área do Cliente</h2>
          <p className="text-nude-600 mb-6">
            Já agendou antes? Faça login para ver seu histórico de agendamentos
          </p>
          <button
            onClick={() => setShowLogin(!showLogin)}
            className="btn bg-rose-500 hover:bg-rose-600 text-white"
          >
            Entrar com WhatsApp
          </button>
          
          {showLogin && (
            <div className="mt-6 p-6 bg-white rounded-xl shadow-md">
              <div className="flex gap-3">
                <input
                  type="tel"
                  placeholder="WhatsApp (só números)"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, ''))}
                  className="input flex-1"
                />
                <button
                  onClick={handleLogin}
                  disabled={loading || !whatsapp}
                  className="btn bg-rose-500 text-white disabled:opacity-50"
                >
                  {loading ? 'Entrando...' : 'Entrar'}
                </button>
              </div>
              <p className="text-xs text-nude-500 mt-3">
                Use o mesmo WhatsApp que usou no seu agendamento
              </p>
            </div>
          )}
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-nude-50">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-nude-900">Olá, {client.name}!</h2>
            <p className="text-nude-600">Seus agendamentos</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-nude-600 hover:text-nude-900"
          >
            <LogOut size={18} />
            Sair
          </button>
        </div>

        {appointments.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-xl">
            <Calendar size={40} className="mx-auto text-nude-300 mb-3" />
            <p className="text-nude-600">Nenhum agendamento encontrado</p>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((apt) => {
              const status = getStatusLabel(apt.status)
              return (
                <div key={apt.id} className="bg-white p-4 rounded-xl shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-nude-900">{apt.service.name}</h3>
                      <p className="text-sm text-nude-600">
                        {formatDate(apt.date)} às {apt.startTime}
                      </p>
                      <p className="text-sm font-medium text-rose-500 mt-1">
                        {formatCurrency(apt.price)}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
