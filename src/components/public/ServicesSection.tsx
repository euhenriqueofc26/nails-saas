'use client'

import { Scissors, Clock, ArrowRight } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface Service {
  id: string
  name: string
  price: number
  duration: number
  description: string | null
  image: string | null
}

interface ServicesSectionProps {
  services: Service[]
  onSelectService: (service: Service) => void
}

function getServiceImage(service: Service): string {
  const defaultImage = 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=600&q=80'
  
  if (service.image) {
    const trimmed = service.image.trim()
    if (trimmed !== '' && (trimmed.startsWith('http://') || trimmed.startsWith('https://'))) {
      return trimmed
    }
  }
  
  const name = service.name.toLowerCase()
  if (name.includes('gel')) return 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=600&q=80'
  if (name.includes('acrylic')) return 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&q=80'
  if (name.includes('nails')) return 'https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?w=600&q=80'
  if (name.includes('manicure')) return 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80'
  if (name.includes('pedicure')) return 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&q=80'
  
  return defaultImage
}

export default function ServicesSection({ services, onSelectService }: ServicesSectionProps) {
  return (
    <section id="servicos" className="py-20 bg-gradient-to-b from-nude-50 to-rose-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <span className="text-rose-500 font-medium uppercase tracking-wider text-sm">
            Nossos Serviços
          </span>
          <h2 className="text-4xl font-bold text-nude-900 mt-2">
            Nossos Serviços
          </h2>
          <p className="text-nude-600 mt-4 max-w-2xl mx-auto">
            Escolha o serviço perfeito para você. Qualidade e profissionalismo em cada detalhe.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <div 
              key={service.id}
              className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={getServiceImage(service)}
                  alt={service.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=600&q=80'
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-white font-semibold text-xl">{service.name}</h3>
                </div>
              </div>
              
              <div className="p-6">
                {service.description && (
                  <p className="text-nude-600 text-sm mb-4 line-clamp-2">
                    {service.description}
                  </p>
                )}
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-nude-600">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{service.duration} min</span>
                  </div>
                  <span className="text-2xl font-bold text-rose-500">
                    {formatCurrency(service.price)}
                  </span>
                </div>
                
                <button 
                  onClick={() => onSelectService(service)}
                  className="w-full btn bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center gap-2 group-hover:gap-3 transition-all"
                >
                  Agendar
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
