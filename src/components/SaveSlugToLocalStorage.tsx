"use client"

import { useEffect, useState } from "react"

type Props = {
  slug: string
}

export default function SaveSlugToLocalStorage({ slug }: Props) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && slug && typeof window !== "undefined") {
      localStorage.setItem("lastPublicSlug", slug)
    }
  }, [slug, mounted])

  return null
}
