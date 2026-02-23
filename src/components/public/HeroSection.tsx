'use client'

import { Sparkles, ArrowDown } from 'lucide-react'

interface HeroSectionProps {
  studioName: string
  onScrollToServices: () => void
}

export default function HeroSection({ studioName, onScrollToServices }: HeroSectionProps) {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url('https://images.unsplash.com/photo-1604654894610-df63bc536371?w=1920&q=80')`
        }}
      />
      
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-rose-900/10 to-white/40" />
      
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 animate-fade-in">
          <Sparkles className="w-4 h-4 text-gold-400" />
          <span className="text-white/90 text-sm font-medium">Studio de Unhas Profissional</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight animate-fade-in" style={{ animationDelay: '0.1s' }}>
          {studioName}
        </h1>
        
        <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
          Realçando sua beleza com elegância e precisão
        </p>
        
        <button 
          onClick={onScrollToServices}
          className="btn bg-rose-500 hover:bg-rose-600 text-white text-lg px-8 py-4 rounded-full flex items-center gap-2 mx-auto animate-fade-in shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          style={{ animationDelay: '0.3s' }}
        >
          Agendar Agora
          <ArrowDown className="w-5 h-5" />
        </button>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <ArrowDown className="w-8 h-8 text-white/60" />
      </div>
    </section>
  )
}
