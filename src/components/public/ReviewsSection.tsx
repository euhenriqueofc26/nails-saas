'use client'

import { useState, useEffect } from 'react'
import { Star, X, MessageCircle, ChevronLeft, ChevronRight, Quote } from 'lucide-react'
import toast from 'react-hot-toast'

interface Review {
  id: string
  rating: number
  review: string | null
  reviewedAt: string | null
  client: {
    name: string
  }
  service: {
    name: string
  }
}

interface ReviewsSectionProps {
  reviews: Review[]
  avgRating: number
  studioSlug: string
  studioWhatsapp: string
}

export default function ReviewsSection({ reviews, avgRating, studioSlug, studioWhatsapp }: ReviewsSectionProps) {
  const [showPhoneModal, setShowPhoneModal] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [currentReview, setCurrentReview] = useState(0)
  const [phoneInput, setPhoneInput] = useState('')
  const [selectedAppointment, setSelectedAppointment] = useState('')
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [review, setReview] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [clientAppointments, setClientAppointments] = useState<{id: string, service: string, date: string}[]>([])
  const [loadingAppointments, setLoadingAppointments] = useState(false)

  useEffect(() => {
    if (reviews.length > 1) {
      const interval = setInterval(() => {
        setCurrentReview((prev) => (prev + 1) % reviews.length)
      }, 4000)
      return () => clearInterval(interval)
    }
  }, [reviews.length])

  const nextReview = () => {
    setCurrentReview((prev) => (prev + 1) % reviews.length)
  }

  const prevReview = () => {
    setCurrentReview((prev) => (prev - 1 + reviews.length) % reviews.length)
  }

  const fetchClientAppointments = async () => {
    if (!phoneInput.trim()) {
      toast.error('Digite seu WhatsApp')
      return
    }

    setLoadingAppointments(true)
    try {
      const res = await fetch(`/api/public/${studioSlug}/appointments-by-phone?phone=${encodeURIComponent(phoneInput)}`)
      const data = await res.json()
      
      if (res.ok && data.appointments && data.appointments.length > 0) {
        const completed = data.appointments.filter((apt: any) => apt.status === 'completed' && !apt.rating)
        if (completed.length === 0) {
          toast.error('Nenhum agendamento pendente de avaliação')
          return
        }
        setClientAppointments(completed.map((apt: any) => ({
          id: apt.id,
          service: apt.service.name,
          date: new Date(apt.date).toLocaleDateString('pt-BR')
        })))
        setShowPhoneModal(false)
        setShowReviewForm(true)
      } else {
        toast.error(data.error || 'Nenhum agendamento encontrado')
      }
    } catch (error) {
      console.error('Error fetching appointments:', error)
      toast.error('Erro ao buscar agendamentos')
    } finally {
      setLoadingAppointments(false)
    }
  }

  const submitReview = async () => {
    if (!selectedAppointment || rating === 0) {
      toast.error('Selecione o serviço e a nota')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch(`/api/public/${studioSlug}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: selectedAppointment,
          rating,
          review: review || null
        })
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error)

      toast.success('Obrigada pela avaliação! ❤️')
      setShowReviewForm(false)
      setSelectedAppointment('')
      setRating(0)
      setReview('')
      setPhoneInput('')
      window.location.reload()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao enviar avaliação')
    } finally {
      setSubmitting(false)
    }
  }

  const resetForms = () => {
    setShowPhoneModal(false)
    setShowReviewForm(false)
    setPhoneInput('')
    setSelectedAppointment('')
    setRating(0)
    setReview('')
  }

  return (
    <section id="avaliacoes" className="py-16 bg-nude-50">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-nude-900 mb-4">Avaliações</h2>
          {avgRating > 0 && (
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-4xl font-bold text-nude-900">{avgRating.toFixed(1)}</span>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={24}
                    className={star <= Math.round(avgRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                  />
                ))}
              </div>
              <span className="text-nude-600">({reviews.length} avaliações)</span>
            </div>
          )}
          <button
            onClick={() => setShowPhoneModal(true)}
            className="btn bg-rose-500 hover:bg-rose-600 text-white px-8 py-3 text-lg"
          >
            <Star size={20} className="mr-2" />
            Avaliar Serviço
          </button>
        </div>

        {reviews.length > 0 ? (
          <div className="relative max-w-2xl mx-auto">
            {/* Carrossel */}
            <div className="overflow-hidden bg-white rounded-2xl shadow-lg p-8 min-h-[200px] flex items-center">
              <div className="w-full text-center">
                <Quote className="w-12 h-12 text-rose-200 mx-auto mb-4" />
                <div className="flex justify-center mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={24}
                      className={star <= reviews[currentReview].rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}
                    />
                  ))}
                </div>
                {reviews[currentReview].review ? (
                  <p className="text-nude-700 text-lg mb-4 italic">"{reviews[currentReview].review}"</p>
                ) : (
                  <p className="text-nude-500 text-lg mb-4">Serviço avaliado com 5 estrelas!</p>
                )}
                <p className="font-bold text-nude-900 text-xl">{reviews[currentReview].client.name}</p>
                <p className="text-nude-500 text-sm">{reviews[currentReview].service.name}</p>
              </div>
            </div>

            {/* Setas */}
            {reviews.length > 1 && (
              <>
                <button
                  onClick={prevReview}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white shadow-lg rounded-full p-2 hover:bg-nude-50 transition-colors"
                >
                  <ChevronLeft className="text-nude-600" size={24} />
                </button>
                <button
                  onClick={nextReview}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white shadow-lg rounded-full p-2 hover:bg-nude-50 transition-colors"
                >
                  <ChevronRight className="text-nude-600" size={24} />
                </button>
              </>
            )}

            {/* Indicadores */}
            {reviews.length > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                {reviews.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentReview(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === currentReview ? 'bg-rose-500 w-8' : 'bg-nude-300'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <p className="text-center text-nude-600">Nenhuma avaliação ainda. Seja a primeira!</p>
        )}
      </div>

      {/* Modal para digitar WhatsApp */}
      {showPhoneModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm animate-fade-in">
            <button 
              onClick={resetForms}
              className="absolute top-4 right-4 text-nude-400 hover:text-nude-600"
            >
              <X size={24} />
            </button>
            
            <div className="text-center mb-6">
              <div className="bg-rose-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle size={32} className="text-rose-500" />
              </div>
              <h3 className="text-xl font-bold text-nude-900">Encontrar Agendamentos</h3>
              <p className="text-nude-600 text-sm mt-2">Digite seu WhatsApp para encontrar seus serviços</p>
            </div>

            <input
              type="tel"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              placeholder="(11) 99999-9999"
              className="input w-full text-center text-lg mb-4"
            />

            <button
              onClick={fetchClientAppointments}
              disabled={loadingAppointments || !phoneInput.trim()}
              className="btn btn-primary w-full py-3"
            >
              {loadingAppointments ? 'Buscando...' : 'Buscar'}
            </button>
          </div>
        </div>
      )}

      {/* Modal de avaliação */}
      {showReviewForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-fade-in">
            <button 
              onClick={resetForms}
              className="absolute top-4 right-4 text-nude-400 hover:text-nude-600"
            >
              <X size={24} />
            </button>
            
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-nude-900">Avaliar Serviço</h3>
              <p className="text-nude-600 text-sm mt-1">Selecione o serviço realizado</p>
            </div>

            <div className="space-y-3 mb-6">
              {clientAppointments.map((apt) => (
                <button
                  key={apt.id}
                  onClick={() => setSelectedAppointment(apt.id)}
                  className={`w-full p-4 rounded-xl text-left transition-all ${
                    selectedAppointment === apt.id 
                      ? 'bg-rose-100 border-2 border-rose-500' 
                      : 'bg-nude-50 border-2 border-transparent hover:bg-nude-100'
                  }`}
                >
                  <p className="font-medium text-nude-900">{apt.service}</p>
                  <p className="text-sm text-nude-500">{apt.date}</p>
                </button>
              ))}
            </div>

            <div className="mb-6">
              <p className="text-center text-nude-700 mb-3">Quanto você avalia?</p>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star
                      size={40}
                      className={star <= (hoverRating || rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                className="input w-full min-h-[80px]"
                placeholder="Deixe um comentário (opcional)"
              />
            </div>

            <button
              onClick={submitReview}
              disabled={submitting || !selectedAppointment || rating === 0}
              className="btn btn-primary w-full py-3 text-lg"
            >
              {submitting ? 'Enviando...' : 'Enviar Avaliação'}
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
