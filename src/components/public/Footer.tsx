'use client'

import { Phone, Instagram, Facebook, Heart } from 'lucide-react'

interface FooterProps {
  studioName: string
  whatsapp: string
  instagram: string | null
  facebook: string | null
}

export default function Footer({ studioName, whatsapp, instagram, facebook }: FooterProps) {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-nude-900 text-white py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-2xl font-bold mb-4">{studioName}</h3>
            <p className="text-white/70">
              Realçando sua beleza com elegância e profissionalismo.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contato</h4>
            <a 
              href={`https://wa.me/55${whatsapp.replace(/\D/g, '')}`}
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-2"
            >
              <Phone className="w-4 h-4" />
              {whatsapp}
            </a>
            {instagram && (
              <a 
                href={`https://instagram.com/${instagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-2"
              >
                <Instagram className="w-4 h-4" />
                {instagram}
              </a>
            )}
            {facebook && (
              <a 
                href={facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
              >
                <Facebook className="w-4 h-4" />
                Facebook
              </a>
            )}
          </div>

          <div>
            <h4 className="font-semibold mb-4">Horário de Funcionamento</h4>
            <p className="text-white/70">
              Segunda a Sábado<br />
              9h às 19h
            </p>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/50 text-sm">
            © {currentYear} {studioName}. Todos os direitos reservados.
          </p>
          <p className="text-white/30 text-sm flex items-center gap-1">
            Feito com <Heart className="w-4 h-4 text-rose-500" /> por ClubNailsBrasil
          </p>
        </div>
      </div>
    </footer>
  )
}
