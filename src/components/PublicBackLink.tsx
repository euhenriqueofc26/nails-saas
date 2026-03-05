"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

export default function PublicBackLink() {

  const [href, setHref] = useState("/")

  useEffect(()=>{
    const slug = typeof window !== 'undefined' ? localStorage.getItem("lastPublicSlug") : null
    if(slug){
      setHref("/"+slug)
    }
  },[])

  return (
    <Link
      href={href}
      className="text-rose-600 hover:text-rose-700"
      aria-label="Voltar"
    >
      ← Voltar
    </Link>
  )
}
