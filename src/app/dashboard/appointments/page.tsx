'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Calendar as CalendarIcon, Plus, X, Clock, CheckCircle, XCircle, AlertCircle, Star } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import toast from 'react-hot-toast'

interface Appointment {
  id: string
  clientId: string
  serviceId: string
  date: string
  startTime: string
  endTime: string
  price: number
  status: string
  notes: string | null
  client: { id: string; name: string; whatsapp: string }
  service: { id: string; name: string; duration: number }
}

interface Client {
  id: string
  name: string
}

interface Service {
  id: string
  name: string
  price: number
  duration: number
}

export default function AppointmentsPage() {
  const { token, user } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [avgRating, setAvgRating] = useState(0)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())
  const [showModal, setShowModal] = useState(false)
  const [loadingReminder, setLoadingReminder] = useState(false)
  const [formData, setFormData] = useState({
    clientId: '',
    serviceId: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    startTime: '09:00',
    notes: '',
    status: 'pending',
  })

  useEffect(() => {
    if (token) {
      fetchData()
    }
  }, [token, selectedDate])

  const fetchData = async () => {
    try {
      const dateParam = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''
      
      const [aptsRes, clientsRes, servicesRes, dashboardRes] = await Promise.all([
        fetch(`/api/appointments?date=${dateParam}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/clients', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/services', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/dashboard', { headers: { Authorization: `Bearer ${token}` } }),
      ])

      const aptsData = await aptsRes.json()
      const clientsData = await clientsRes.json()
      const servicesData = await servicesRes.json()
      const dashboardData = await dashboardRes.json()

      setAppointments(aptsData.appointments || [])
      setClients(clientsData.clients || [])
      setServices(servicesData.services || [])
      setAvgRating(dashboardData.avgRating || 0)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const testReminder = async () => {
    setLoadingReminder(true)
    try {
      const res = await fetch('/api/reminders', { method: 'GET' })
      const data = await res.json()
      if (res.ok) {
        toast.success(`Enviados ${data.reminders?.length || 0} lembretes`)
      } else {
        toast.error('Erro ao enviar lembretes')
      }
    } catch (error) {
      toast.error('Erro ao enviar lembretes')
    }
    setLoadingReminder(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const selectedService = services.find(s => s.id === formData.serviceId)
      
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          ...formData,
          date: new Date(formData.date),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error)
      }

      toast.success('Agendamento criado!')
      setShowModal(false)
      setFormData({
        clientId: '',
        serviceId: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        startTime: '09:00',
        notes: '',
        status: 'pending',
      })
      fetchData()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ status }),
      })

      if (!res.ok) throw new Error('Erro ao atualizar')

      toast.success('Status atualizado!')
      fetchData()
    } catch (error) {
      toast.error('Erro ao atualizar status')
    }
  }

  const deleteAppointment = async (id: string) => {
    if (!confirm('Cancelar agendamento?')) return

    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ status: 'cancelled' }),
      })

      if (!res.ok) throw new Error('Erro ao cancelar')

      toast.success('Agendamento cancelado!')
      fetchData()
    } catch (error) {
      toast.error('Erro ao cancelar')
    }
  }

  const monthDays = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700'
      case 'pending': return 'bg-orange-100 text-orange-700'
      case 'cancelled': return 'bg-red-100 text-red-700'
      case 'completed': return 'bg-rose-100 text-rose-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getDayAppointments = (day: Date) => {
    return appointments.filter(apt => isSameDay(new Date(apt.date), day))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-nude-900">Agendamentos</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-nude-600">{format(currentDate, 'MMMM yyyy', { locale: ptBR })}</span>
            <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-sm font-medium flex items-center gap-1">
              <Star size={14} className="fill-yellow-400" />
              {avgRating > 0 ? avgRating.toFixed(1) : '0.0'}
            </span>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          Novo Agendamento
        </button>
        <button
          onClick={testReminder}
          disabled={loadingReminder}
          className="btn btn-secondary flex items-center gap-2"
        >
          {loadingReminder ? 'Enviando...' : 'Testar Lembretes'}
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 card">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
              className="p-2 hover:bg-nude-100 rounded-lg"
            >
              ←
            </button>
            <h2 className="font-semibold text-nude-900">
              {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
            </h2>
            <button
              onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
              className="p-2 hover:bg-nude-100 rounded-lg"
            >
              →
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => (
              <div key={i} className="text-xs font-medium text-nude-500 py-2">{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {monthDays.map((day, i) => {
              const dayApts = getDayAppointments(day)
              const isSelected = selectedDate && isSameDay(day, selectedDate)
              const hasAppointments = dayApts.length > 0

              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(day)}
                  className={`
                    p-2 text-sm rounded-lg relative
                    ${!isSameMonth(day, currentDate) ? 'text-nude-300' : ''}
                    ${isSelected ? 'bg-rose-500 text-white' : 'hover:bg-nude-100'}
                    ${isToday(day) && !isSelected ? 'ring-2 ring-rose-500' : ''}
                  `}
                >
                  {format(day, 'd')}
                  {hasAppointments && (
                    <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${
                      isSelected ? 'bg-white' : 'bg-rose-500'
                    }`} />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <div className="lg:col-span-2 card">
          <h2 className="font-semibold text-nude-900 mb-4">
            {selectedDate ? format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR }) : 'Selecione uma data'}
          </h2>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-8 text-nude-500">
              <CalendarIcon size={40} className="mx-auto mb-2 opacity-50" />
              <p>Nenhum agendamento nesta data</p>
            </div>
          ) : (
            <div className="space-y-3">
              {appointments.map((apt) => (
                <div key={apt.id} className="flex items-center justify-between p-4 bg-nude-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="text-center min-w-[60px]">
                      <p className="font-semibold text-nude-900">{apt.startTime}</p>
                      <p className="text-xs text-nude-500">{apt.service.duration}min</p>
                    </div>
                    <div>
                      <p className="font-medium text-nude-900">{apt.client.name}</p>
                      <p className="text-sm text-nude-600">{apt.service.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(apt.status)}`}>
                      {apt.status === 'pending' ? 'Pendente' : 
                       apt.status === 'confirmed' ? 'Confirmado' :
                       apt.status === 'completed' ? 'Concluído' : 'Cancelado'}
                    </span>
                    <span className="font-medium text-nude-700">R$ {apt.price}</span>
                    <div className="flex gap-1">
                      {apt.status === 'pending' && (
                        <button
                          onClick={() => updateStatus(apt.id, 'confirmed')}
                          className="p-1 hover:bg-green-100 rounded"
                          title="Confirmar"
                        >
                          <CheckCircle size={18} className="text-green-600" />
                        </button>
                      )}
                      {apt.status !== 'completed' && apt.status !== 'cancelled' && (
                        <button
                          onClick={() => updateStatus(apt.id, 'completed')}
                          className="p-1 hover:bg-rose-100 rounded"
                          title="Concluir"
                        >
                          <CheckCircle size={18} className="text-rose-600" />
                        </button>
                      )}
                      {apt.status !== 'cancelled' && (
                        <button
                          onClick={() => deleteAppointment(apt.id)}
                          className="p-1 hover:bg-red-100 rounded"
                          title="Cancelar"
                        >
                          <XCircle size={18} className="text-red-500" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-nude-900">Novo Agendamento</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-nude-100 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-nude-700 mb-1">Cliente</label>
                <select
                  required
                  className="input"
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                >
                  <option value="">Selecione um cliente</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-nude-700 mb-1">Serviço</label>
                <select
                  required
                  className="input"
                  value={formData.serviceId}
                  onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
                >
                  <option value="">Selecione um serviço</option>
                  {services.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} - R$ {s.price} ({s.duration}min)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-nude-700 mb-1">Data</label>
                  <input
                    type="date"
                    required
                    className="input"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-nude-700 mb-1">Horário</label>
                  <input
                    type="time"
                    required
                    className="input"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-nude-700 mb-1">Status</label>
                <select
                  className="input"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="pending">Pendente</option>
                  <option value="confirmed">Confirmado</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary w-full">
                Criar Agendamento
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
