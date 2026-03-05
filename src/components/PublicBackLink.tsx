"use client";
import React from 'react'
import Link from 'next/link'

type Props = {
  path?: string
}

export default function PublicBackLink({ path = '/fundador' }: Props) {
  const goBack = () => {
    if (typeof window !== 'undefined') {
      // 1) Tenta ir para o referrer dentro do mesmo domínio
      try {
        const ref = document.referrer || ''
        const host = window.location.origin
        if (ref && ref.startsWith(host)) {
          window.location.href = ref
          return
        }
      } catch (e) {
        // ignore
      }

      // 2) Se houver histórico, usa voltar no histórico
      if (window.history.length > 1) {
        window.history.back()
        return
      }

      // 3) fallback para o caminho informado (default /fundador)
      window.location.href = path
    }
  }
  return (
    <button onClick={goBack} className="text-rose-600 hover:text-rose-700">← Voltar</button>
  )
}
