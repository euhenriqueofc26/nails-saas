'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
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
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState('')
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [review, setReview] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [clientAppointments, setClientAppointments] = useState<{id: string, service: string, date: string}[]>([])

  const fetchClientAppointments = async () => {
    const clientPhone = prompt('Digite seu WhatsApp para encontrar seus agendamentos:')
    if (!clientPhone) return

    try {
      const res = await fetch(`/api/public/${studioSlug}/appointments-by-phone?phone=${encodeURIComponent(clientPhone)}`)
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
        setShowReviewForm(true)
      } else {
        toast.error(data.error || 'Nenhum agendamento encontrado')
      }
    } catch (error) {
      console.error('Error fetching appointments:', error)
      toast.error('Erro ao buscar agendamentos')
    }
  }

  const submitReview = async () => {
    if (!selectedAppointment || rating === 0) {
      toast.error('Selecione o agendamento e a nota')
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
      window.location.reload()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao enviar avaliação')
    } finally {
      setSubmitting(false)
    }
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
            onClick={fetchClientAppointments}
            className="btn btn-primary"
          >
            Avaliar Serviço
          </button>
        </div>

        {reviews.length > 0 ? (
          <div className="grid gap-6">
            {reviews.map((reviewItem) => (
              <div key={reviewItem.id} className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-nude-900">{reviewItem.client.name}</p>
                    <p className="text-sm text-nude-500">{reviewItem.service.name}</p>
                  </div>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={16}
                        className={star <= reviewItem.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                      />
                    ))}
                  </div>
                </div>
                {reviewItem.review && (
                  <p className="text-nude-700">{reviewItem.review}</p>
                )}
                {reviewItem.reviewedAt && (
                  <p className="text-xs text-nude-400 mt-3">
                    {new Date(reviewItem.reviewedAt).toLocaleDateString('pt-BR')}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-nude-600">Nenhuma avaliação ainda. Seja a primeira!</p>
        )}
      </div>

      {showReviewForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md animate-fade-in">
            <h3 className="text-xl font-bold text-nude-900 mb-4">Avaliar Serviço</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-nude-700 mb-2">Selecione o serviço</label>
              <select
                value={selectedAppointment}
                onChange={(e) => setSelectedAppointment(e.target.value)}
                className="input"
              >
                <option value="">Selecione...</option>
                {clientAppointments.map((apt) => (
                  <option key={apt.id} value={apt.id}>
                    {apt.service} - {apt.date}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-nude-700 mb-2">Nota</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1"
                  >
                    <Star
                      size={32}
                      className={star <= (hoverRating || rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-nude-700 mb-2">Comentário (opcional)</label>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                className="input min-h-[100px]"
                placeholder="Conte sua experiência..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowReviewForm(false)}
                className="btn btn-secondary flex-1"
              >
                Cancelar
              </button>
              <button
                onClick={submitReview}
                disabled={submitting || !selectedAppointment || rating === 0}
                className="btn btn-primary flex-1"
              >
                {submitting ? 'Enviando...' : 'Enviar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
