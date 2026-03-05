"use client";
import React from 'react'
import Link from 'next/link'

type Props = {
  path?: string
}

// Simplified: back link uses only the provided path (from parameter in the URL)
export default function PublicBackLink({ path = '/' }: Props) {
  const href = typeof path === 'string' && path.startsWith('/') ? path : '/'
  return (
    <Link href={href} className="text-rose-600 hover:text-rose-700" aria-label="Voltar">
      ← Voltar
    </Link>
  )
}
