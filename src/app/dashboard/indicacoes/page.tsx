'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Users, Gift, TrendingUp, DollarSign, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

interface ReferralData {
  users: {
    id: string
    name: string
    email: string
    studioName: string
    refCode: string | null
    referralCount: number
    createdAt: string
  }[]
  referrals: {
    id: string
    referrer: {
      id: string
      name: string
      studioName: string
      email: string
    }
    referredUser: {
      id: string
      name: string
      email: string
      createdAt: string
    }
    createdAt: string
  }[]
}

export default function IndicacoesPage() {
  const { token, user } = useAuth()
  const [data, setData] = useState<ReferralData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'details'>('overview')

  const fetchData = async () => {
    if (!token) return
    setLoading(true)
    try {
      const res = await fetch('/api/admin/referrals', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const result = await res.json()
        setData(result)
      }
    } catch (error) {
      console.error('Error fetching:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [token])

  if (user?.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-nude-900 mb-4">Acesso Restrito</h1>
        <p className="text-nude-600">Esta página é apenas para administradores.</p>
      </div>
    )
  }

  const totalIndications = data?.users.reduce((acc, u) => acc + u.referralCount, 0) || 0

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-nude-900">Gestão de Indicações</h1>
        <button onClick={fetchData} className="btn btn-outline flex items-center gap-2">
          <RefreshCw size={18} />
          Atualizar
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center">
              <Users className="text-rose-500" size={24} />
            </div>
            <div>
              <p className="text-sm text-nude-600">Total de Nails</p>
              <p className="text-2xl font-bold text-nude-900">{data?.users.length || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Gift className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-nude-600">Total de Indicações</p>
              <p className="text-2xl font-bold text-nude-900">{totalIndications}</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <TrendingUp className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-nude-600">Média por Nail</p>
              <p className="text-2xl font-bold text-nude-900">
                {data?.users.length ? (totalIndications / data.users.length).toFixed(1) : 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'overview' ? 'bg-rose-500 text-white' : 'bg-nude-100 text-nude-600'}`}
        >
          Visão Geral
        </button>
        <button
          onClick={() => setActiveTab('details')}
          className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'details' ? 'bg-rose-500 text-white' : 'bg-nude-100 text-nude-600'}`}
        >
          Detalhes
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin mx-auto" />
        </div>
      ) : activeTab === 'overview' ? (
        <div className="card">
          <h2 className="text-lg font-semibold text-nude-900 mb-4">Indicações por Nail</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-nude-200">
                  <th className="text-left py-3 px-4 text-nude-600 font-medium">Nail</th>
                  <th className="text-left py-3 px-4 text-nude-600 font-medium">Studio</th>
                  <th className="text-left py-3 px-4 text-nude-600 font-medium">Código</th>
                  <th className="text-center py-3 px-4 text-nude-600 font-medium">Indicações</th>
                </tr>
              </thead>
              <tbody>
                {data?.users.sort((a, b) => b.referralCount - a.referralCount).map((u) => (
                  <tr key={u.id} className="border-b border-nude-100">
                    <td className="py-3 px-4">{u.name}</td>
                    <td className="py-3 px-4 text-nude-600">{u.studioName || '-'}</td>
                    <td className="py-3 px-4 font-mono text-sm">{u.refCode || '-'}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${u.referralCount > 0 ? 'bg-green-100 text-green-700' : 'bg-nude-100 text-nude-500'}`}>
                        {u.referralCount}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card">
          <h2 className="text-lg font-semibold text-nude-900 mb-4">Histórico de Indicações</h2>
          <div className="space-y-4">
            {data?.referrals.map((r) => (
              <div key={r.id} className="flex items-center justify-between p-4 bg-nude-50 rounded-lg">
                <div>
                  <p className="font-medium text-nude-900">
                    {r.referrer.name} ({r.referrer.studioName})
                  </p>
                  <p className="text-sm text-nude-500">
                    Indicou: {r.referredUser.name} ({r.referredUser.email})
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-nude-500">
                    {new Date(r.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                    Indicado
                  </span>
                </div>
              </div>
            ))}
            {data?.referrals.length === 0 && (
              <p className="text-center text-nude-500 py-8">Nenhuma indicação ainda.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
