'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import {
  LayoutDashboard, 
  Users, 
  Calendar, 
  DollarSign, 
  Scissors, 
  Globe, 
  Settings,
  LogOut,
  Menu,
  X,
  Package,
  Crown,
  Megaphone,
  Shield,
  FileText,
  ChevronRight,
  UsersRound
} from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, token, logout, updateUser, isLoading } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!user || !token) return
    let cancelled = false
    fetch('/api/register', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        if (!cancelled && data?.user) {
          updateUser({
            trialEndsAt: data.user.trialEndsAt,
            subscriptionEndsAt: data.user.subscriptionEndsAt,
          })
        }
      })
      .catch(() => {})
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const now = new Date()
  const isAdminUser = user?.role === 'admin' || user?.email === process.env.NEXT_PUBLIC_CEO_EMAIL
  const trialExpired = !!user?.trialEndsAt && new Date(user.trialEndsAt) < now && !user.subscriptionEndsAt
  const subExpired = !!user?.subscriptionEndsAt && new Date(user.subscriptionEndsAt) < now
  const accessExpired = !isAdminUser && (trialExpired || subExpired)
  const isPlansPage = pathname.startsWith('/dashboard/plans')

  const baseNavItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/dashboard/clients', icon: Users, label: 'Clientes' },
    { href: '/dashboard/appointments', icon: Calendar, label: 'Agendamentos' },
    { href: '/dashboard/services', icon: Scissors, label: 'Serviços' },
    { href: '/dashboard/suppliers', icon: Package, label: 'Fornecedores' },
    { href: '/dashboard/financial', icon: DollarSign, label: 'Financeiro', planRequired: true },
    { href: '/dashboard/marketing', icon: Megaphone, label: 'Marketing' },
    { href: '/dashboard/public', icon: Globe, label: 'Página Pública' },
    { href: '/dashboard/plans', icon: Crown, label: 'Planos' },
    { href: '/dashboard/indicacoes', icon: UsersRound, label: 'Indicações', adminOnly: true },
    { 
      href: '/dashboard/settings', 
      icon: Settings, 
      label: 'Configurações',
      children: [
        { href: '/dashboard/settings/politicas', icon: Shield, label: 'Política de Privacidade' },
        { href: '/dashboard/settings/termos', icon: FileText, label: 'Termos de Uso' },
      ]
    },
  ]

  const planSlug = user?.plan?.slug || user?.planId || 'free'

  const filteredNavItems = baseNavItems.filter(item => {
    if (item.adminOnly && user?.role !== 'admin' && user?.email !== process.env.NEXT_PUBLIC_CEO_EMAIL) return false
    if (item.planRequired && planSlug === 'free') return false
    return true
  })

  const navItems = filteredNavItems

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-nude-50">
        <div className="w-12 h-12 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return null

  if (accessExpired && !isPlansPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-nude-50">
        <div className="text-center max-w-md px-4">
          <Crown className="w-12 h-12 mx-auto text-rose-500" />
          <h1 className="mt-4 text-2xl font-bold text-nude-900">
            {subExpired ? 'Sua assinatura expirou' : 'Seu período de teste expirou'}
          </h1>
          <p className="mt-2 text-nude-600">
            {subExpired
              ? 'Escolha um plano para continuar usando todos os recursos da plataforma.'
              : 'Escolha um plano para continuar usando a plataforma. Seus dados estão preservados.'}
          </p>
          <Link href="/dashboard/plans" className="btn-primary inline-flex mt-6">
            Escolher plano
          </Link>
          <button
            onClick={logout}
            className="block mx-auto mt-4 text-sm text-nude-500 hover:text-nude-700"
          >
            Sair
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-nude-50">
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-nude-200 flex items-center justify-between px-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-nude-100"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <span className="font-semibold text-nude-900">{user.studioName}</span>
        <div className="w-10" />
      </div>

      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-white border-r border-nude-200 z-50 flex flex-col
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-16 lg:h-20 flex items-center px-6 border-b border-nude-200">
          <h1 className="text-xl font-bold text-rose-500">ClubNailsBrasil</h1>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <div key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`sidebar-link ${isActive ? 'active' : ''}`}
                >
                  <item.icon size={20} />
                  {item.label}
                  {item.children && <ChevronRight size={16} className="ml-auto" />}
                </Link>
                {item.children && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.children.map((child) => {
                      const isChildActive = pathname === child.href
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={() => setSidebarOpen(false)}
                          className={`sidebar-link text-sm py-2 ${isChildActive ? 'active' : ''}`}
                        >
                          <child.icon size={16} />
                          {child.label}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        <div className="mt-auto p-4 border-t border-nude-200">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-rose-600 font-medium">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0 flex flex-col">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-nude-900 truncate">{user.name}</p>
                {user.role === 'admin' && (
                  <span className="flex-shrink-0 bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full font-medium">
                    ADMIN
                  </span>
                )}
              </div>
              <p className="text-xs text-nude-500 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="sidebar-link w-full text-red-600 hover:bg-red-50"
          >
            <LogOut size={20} />
            Sair
          </button>
        </div>
      </aside>

      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
