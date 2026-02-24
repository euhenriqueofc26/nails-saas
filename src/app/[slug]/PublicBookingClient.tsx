'use client'

import { useState, useRef } from 'react'
import { notFound } from 'next/navigation'
import HeroSection from '@/components/public/HeroSection'
import AboutSection from '@/components/public/AboutSection'
import ServicesSection from '@/components/public/ServicesSection'
import GallerySection from '@/components/public/GallerySection'
import WhatsAppFloatButton from '@/components/public/WhatsAppFloatButton'
import Footer from '@/components/public/Footer'
import BookingModal from './BookingModal'

interface Service {
  id: string
  name: string
  price: number
  duration: number
  description: string | null
}

interface StudioData {
  studio: {
    name: string
    slug: string
    whatsapp: string
  }
  profile: {
    bio: string | null
    coverImage: string | null
    address: string | null
    instagram: string | null
    facebook: string | null
    workingHours: string | null
  }
  services: Service[]
}

interface PublicBookingClientProps {
  data: StudioData
}

export default function PublicBookingClient({ data }: PublicBookingClientProps) {
  const servicesRef = useRef<HTMLDivElement>(null)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [showBooking, setShowBooking] = useState(false)

  const handleScrollToServices = () => {
    servicesRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSelectService = (service: Service) => {
    setSelectedService(service)
    setShowBooking(true)
  }

  if (!data) {
    notFound()
  }

  return (
    <div className="min-h-screen">
      <HeroSection 
        studioName={data.studio.name} 
        coverImage={data.profile.coverImage}
        onScrollToServices={handleScrollToServices}
      />
      
      <AboutSection 
        studioName={data.studio.name}
        bio={data.profile.bio}
        address={data.profile.address}
        workingHours={data.profile.workingHours}
      />
      
      <div ref={servicesRef}>
        <ServicesSection 
          services={data.services}
          onSelectService={handleSelectService}
        />
      </div>
      
      <GallerySection />
      
      <Footer 
        studioName={data.studio.name}
        whatsapp={data.studio.whatsapp}
        instagram={data.profile.instagram}
        facebook={data.profile.facebook}
      />
      
      <WhatsAppFloatButton phone={data.studio.whatsapp} studioName={data.studio.name} />
      
      {showBooking && selectedService && (
        <BookingModal 
          service={selectedService}
          studioSlug={data.studio.slug}
          onClose={() => {
            setShowBooking(false)
            setSelectedService(null)
          }}
        />
      )}
    </div>
  )
}
