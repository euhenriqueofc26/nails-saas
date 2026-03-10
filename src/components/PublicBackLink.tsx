"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

export default function PublicBackLink() {

  const [href, setHref] = useState("")

  useEffect(()=>{
    if (typeof window === "undefined") return

    // 1) Try localStorage first
    const slug = localStorage.getItem("lastPublicSlug")
    if (slug) {
      setHref("/" + slug)
      return
    }

    // 2) Try document.referrer (if from same origin)
    if (document.referrer) {
      try {
        const refUrl = new URL(document.referrer)
        const currentOrigin = window.location.origin
        if (refUrl.origin === currentOrigin && refUrl.pathname.startsWith("/")) {
          setHref(refUrl.pathname)
          return
        }
      } catch {}
    }

    // 3) Default fallback - leave href empty to use history.back()
  }, [])

  const handleClick = (e: React.MouseEvent) => {
    // If we have a valid href, let the Link work normally
    if (href && href !== "") return
    
    // Otherwise, use history.back()
    e.preventDefault()
    window.history.back()
  }

  return (
    <Link
      href={href || "/"}
      onClick={handleClick}
      className="text-rose-600 hover:text-rose-700"
      aria-label="Voltar"
    >
      ← Voltar
    </Link>
  )
}
