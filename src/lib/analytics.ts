type GAEvent = {
  action: string
  category?: string
  label?: string
  value?: number
}

declare global {
  interface Window {
    gtag: (
      command: 'event' | 'config' | 'js',
      target: string,
      config?: Record<string, unknown>
    ) => void
    dataLayer: unknown[]
  }
}

export function trackEvent({ action, category, label, value }: GAEvent) {
  if (typeof window === 'undefined' || !window.gtag) {
    return
  }

  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value,
  })
}

export function trackPageView(url: string) {
  if (typeof window === 'undefined' || !window.gtag) {
    return
  }

  window.gtag('config', process.env.NEXT_PUBLIC_GA_ID || 'G-LBXSR68S0X', {
    page_path: url,
  })
}