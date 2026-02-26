'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

const galleryImages = [
  'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=600&q=80',
  'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&q=80',
  'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&q=80',
  'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80',
  'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=600&q=80',
  'https://images.unsplash.com/photo-1609220136736-4431404a1a1e?w=600&q=80'
]

export default function GallerySection() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <span className="text-rose-500 font-medium uppercase tracking-wider text-sm">
            Galeria
          </span>
          <h2 className="text-4xl font-bold text-nude-900 mt-2">
            Nosso Portfólio
          </h2>
          <p className="text-nude-600 mt-4 max-w-2xl mx-auto">
            Alguns dos nossos trabalhos mais recentes
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {galleryImages.map((image, index) => (
            <div 
              key={index}
              className="relative aspect-square overflow-hidden rounded-xl cursor-pointer group"
              onClick={() => setSelectedImage(image)}
            >
              <img 
                src={image}
                alt={`Trabalho ${index + 1}`}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-rose-500/0 group-hover:bg-rose-500/20 transition-colors duration-300" />
            </div>
          ))}
        </div>
      </div>

      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            onClick={() => setSelectedImage(null)}
          >
            <X className="w-8 h-8 text-white" />
          </button>
          <img 
            src={selectedImage}
            alt="Imagem ampliada"
            className="max-w-full max-h-full rounded-lg shadow-2xl"
          />
        </div>
      )}
    </section>
  )
}
