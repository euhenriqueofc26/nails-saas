'use client'

import { MessageCircle } from 'lucide-react'

interface WhatsAppFloatButtonProps {
  phone: string
  studioName?: string
}

export default function WhatsAppFloatButton({ phone, studioName }: WhatsAppFloatButtonProps) {
  const formatWhatsapp = (phone: string) => {
    return phone.replace(/\D/g, '')
  }

  const message = studioName 
    ? `Olá, Nail ${studioName} gostaria de fazer um agendamento personalizado.`
    : 'Olá, gostaria de fazer um agendamento personalizado.'

  const encodedMessage = encodeURIComponent(message)

  return (
    <a
      href={`https://wa.me/55${formatWhatsapp(phone)}?text=${encodedMessage}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 animate-fade-in"
      title="Fale conosco no WhatsApp"
    >
      <MessageCircle className="w-8 h-8" />
      <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse" />
    </a>
  )
}
