"use client";
import { useEffect } from 'react'
import { useParams } from 'next/navigation'

export default function RefRedirectPage() {
  const params = useParams()
  const code = params?.code as string | undefined

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const value = code ?? ''
      // Save referral code in a cookie for 365 days
      document.cookie = `ref_code=${encodeURIComponent(value)};path=/;Max-Age=${60 * 60 * 24 * 365}`
      // Redirect to signup
      window.location.href = '/entrar'
    }
  }, [code])

  return null
}
