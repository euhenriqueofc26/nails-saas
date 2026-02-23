'use client'

import { Heart, Award, Users } from 'lucide-react'

interface AboutSectionProps {
  studioName: string
  bio: string | null
  address: string | null
  workingHours: string | null
}

export default function AboutSection({ studioName, bio, address, workingHours }: AboutSectionProps) {
  const features = [
    {
      icon: Heart,
      title: "Dedicação",
      description: "Cada cliente é único e merece atenção especial"
    },
    {
      icon: Award,
      title: "Qualidade",
      description: "Produtos de primeira linha e técnicas especializadas"
    },
    {
      icon: Users,
      title: "Experiência",
      description: "Anos de experiência trazendo beleza às suas mãos"
    }
  ]

  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-rose-500 font-medium uppercase tracking-wider text-sm">
              Sobre Nós
            </span>
            <h2 className="text-4xl font-bold text-nude-900 mt-2 mb-6">
              {studioName}
            </h2>
            <p className="text-nude-600 text-lg leading-relaxed mb-8">
              {bio || `Bem-vindo ao ${studioName}! Aqui transformamos suas unhas em verdadeiras obras de arte. Nossa missão é proporcionar momentos de relaxamento enquanto realçamos sua beleza com serviços personalizados.`}
            </p>
            
            {(address || workingHours) && (
              <div className="space-y-3">
                {address && (
                  <p className="text-nude-600">
                    <span className="font-semibold text-nude-900">Endereço:</span> {address}
                  </p>
                )}
                {workingHours && (
                  <p className="text-nude-600">
                    <span className="font-semibold text-nude-900">Horário:</span> {workingHours}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="grid gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="flex items-start gap-4 p-6 bg-nude-50 rounded-2xl hover:bg-rose-50 transition-colors duration-300"
              >
                <div className="p-3 bg-rose-100 rounded-full">
                  <feature.icon className="w-6 h-6 text-rose-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-nude-900 text-lg">{feature.title}</h3>
                  <p className="text-nude-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
