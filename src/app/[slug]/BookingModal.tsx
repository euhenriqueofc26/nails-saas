'use client'

import { useState, useEffect } from 'react'
import { format, addDays, startOfToday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { X, Clock, CheckCircle, Calendar } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Service {
  id: string
  name: string
  price: number
  duration: number
  description: string | null
}

interface BookingModalProps {
  service: Service
  studioSlug: string
  onClose: () => void
}

export default function BookingModal({ service, studioSlug, onClose }: BookingModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [clientData, setClientData] = useState({ name: '', whatsapp: '', notes: '' })
  const [whatsapp, setWhatsapp] = useState('')

  const today = startOfToday()
  const nextDays = Array.from({ length: 14 }, (_, i) => addDays(today, i))

  useEffect(() => {
    fetchStudioWhatsapp()
  }, [studioSlug])

  useEffect(() => {
    if (selectedDate) {
      fetchSlots()
    }
  }, [selectedDate])

  const fetchStudioWhatsapp = async () => {
    try {
      const res = await fetch(`/api/public/${studioSlug}`)
      const data = await res.json()
      if (data.studio?.whatsapp) {
        setWhatsapp(data.studio.whatsapp)
      }
    } catch (error) {
      console.error('Error fetching studio:', error)
    }
  }

  const fetchSlots = async () => {
    if (!selectedDate) return
    
    setLoadingSlots(true)
    try {
      const res = await fetch(
        `/api/public/${studioSlug}/slots?date=${format(selectedDate, 'yyyy-MM-dd')}`
      )
      const dataRes = await res.json()
      setAvailableSlots(dataRes.availableSlots || [])
    } catch (error) {
      console.error('Error fetching slots:', error)
    } finally {
      setLoadingSlots(false)
    }
  }

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    setSelectedTime(null)
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
    setStep(2)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDate || !selectedTime) return

    setSubmitting(true)
    try {
      const res = await fetch(`/api/public/${studioSlug}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: clientData.name,
          clientWhatsapp: clientData.whatsapp,
          serviceId: service.id,
          date: format(selectedDate, 'yyyy-MM-dd'),
          startTime: selectedTime,
          notes: clientData.notes,
        }),
      })

      const dataRes = await res.json()

      if (!res.ok) {
        throw new Error(dataRes.error)
      }

      setSuccess(true)
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const formatWhatsapp = (phone: string) => {
    return phone.replace(/\D/g, '')
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-fade-in">
        <div className="sticky top-0 bg-white p-4 border-b flex items-center justify-between rounded-t-2xl">
          <h2 className="text-xl font-bold text-nude-900">
            Agendar {service.name}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-nude-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="text-green-500 w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-nude-900 mb-2">Agendamento Confirmado!</h3>
            <p className="text-nude-600 mb-6">
              Você receberá uma confirmação pelo WhatsApp.
            </p>
            
            <div className="bg-nude-50 rounded-lg p-4 mb-6 text-left">
              <p className="font-medium text-nude-900">{service.name}</p>
              <p className="text-nude-600">
                {selectedDate && format(selectedDate, "dd 'de' MMMM", { locale: ptBR })} às {selectedTime}
              </p>
              <p className="text-rose-600 font-semibold mt-2">{formatCurrency(service.price)}</p>
            </div>

            {whatsapp && (
              <a
                href={`https://wa.me/55${formatWhatsapp(whatsapp)}`}
                className="btn bg-green-500 hover:bg-green-600 text-white w-full flex items-center justify-center gap-2"
              >
                Falar no WhatsApp
              </a>
            )}
          </div>
        ) : (
          <div className="p-4">
            {step === 1 && (
              <div className="space-y-4">
                <div className="bg-rose-50 rounded-lg p-4">
                  <p className="font-semibold text-rose-900">{service.name}</p>
                  <p className="text-rose-700">
                    {formatCurrency(service.price)} • {service.duration} min
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-nude-900 mb-3 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-rose-500" />
                    Escolha a data
                  </h3>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {nextDays.map((date) => (
                      <button
                        key={date.toISOString()}
                        onClick={() => handleDateSelect(date)}
                        className={`flex-shrink-0 p-3 rounded-lg border text-center min-w-[70px] ${
                          selectedDate && date.toDateString() === selectedDate.toDateString()
                            ? 'border-rose-500 bg-rose-50 text-rose-600'
                            : 'border-nude-200 hover:border-rose-300'
                        }`}
                      >
                        <p className="text-xs text-nude-500">
                          {format(date, 'EEE', { locale: ptBR })}
                        </p>
                        <p className="text-lg font-bold text-nude-900">
                          {format(date, 'd')}
                        </p>
                        <p className="text-xs text-nude-500">
                          {format(date, 'MMM', { locale: ptBR })}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {selectedDate && (
                  <div>
                    <h3 className="font-medium text-nude-900 mb-3 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-rose-500" />
                      Horários disponíveis
                    </h3>
                    {loadingSlots ? (
                      <div className="flex justify-center py-8">
                        <div className="w-8 h-8 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
                      </div>
                    ) : availableSlots.length === 0 ? (
                      <p className="text-nude-500 text-center py-4">
                        Nenhum horário disponível
                      </p>
                    ) : (
                      <div className="grid grid-cols-4 gap-2">
                        {availableSlots.map((slot) => (
                          <button
                            key={slot}
                            onClick={() => handleTimeSelect(slot)}
                            className={`py-2 px-3 rounded-lg text-sm font-medium ${
                              selectedTime === slot
                                ? 'bg-rose-500 text-white'
                                : 'bg-nude-100 text-nude-700 hover:bg-rose-100'
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-rose-600 hover:text-rose-700 text-sm mb-2"
                >
                  ← Voltar
                </button>

                <div className="bg-rose-50 rounded-lg p-4">
                  <p className="font-medium text-rose-900">{service.name}</p>
                  <p className="text-rose-700">
                    {selectedDate && format(selectedDate, "dd 'de' MMMM", { locale: ptBR })} às {selectedTime}
                  </p>
                  <p className="text-rose-600 font-semibold">{formatCurrency(service.price)}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-nude-700 mb-1">Nome</label>
                  <input
                    type="text"
                    required
                    className="input"
                    value={clientData.name}
                    onChange={(e) => setClientData({ ...clientData, name: e.target.value })}
                    placeholder="Seu nome completo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-nude-700 mb-1">WhatsApp</label>
                  <input
                    type="tel"
                    required
                    className="input"
                    value={clientData.whatsapp}
                    onChange={(e) => setClientData({ ...clientData, whatsapp: e.target.value })}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-nude-700 mb-1">
                    Observações (opcional)
                  </label>
                  <textarea
                    className="input min-h-[80px]"
                    value={clientData.notes}
                    onChange={(e) => setClientData({ ...clientData, notes: e.target.value })}
                    placeholder="Alguma informação adicional?"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary w-full flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Confirmar Agendamento
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
