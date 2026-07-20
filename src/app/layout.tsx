import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { Providers } from '@/components/Providers'
import { Analytics } from '@vercel/analytics/next'
import { Analytics as GoogleAnalytics } from '@/components/GoogleAnalytics'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ClubNailsBrasil | App de Agendamento Online para Nail Designers',
  description: 'Plataforma de agendamento online e gestão completa para nail designers e manicures. Organize sua agenda, controle o financeiro e conquiste mais clientes.',
  keywords: ['app de agendamento online', 'plataforma de agendamento', 'sistema para nail designer', 'agenda manicure online', 'gestão de salão de unhas'],
  openGraph: {
    title: 'ClubNailsBrasil | App de Agendamento Online para Nail Designers',
    description: 'Plataforma de agendamento online e gestão completa para nail designers e manicures.',
    locale: 'pt_BR',
    type: 'website',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <Analytics />
        <GoogleAnalytics />
        <Providers>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#fff',
                color: '#333',
                border: '1px solid #F7EDE9',
                borderRadius: '8px',
              },
              success: {
                iconTheme: {
                  primary: '#EC4899',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff',
                },
              },
            }}
          />
          {children}
        </Providers>
      </body>
    </html>
  )
}
