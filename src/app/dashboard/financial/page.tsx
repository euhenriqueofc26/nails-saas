'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { DollarSign, TrendingUp, TrendingDown, Plus, X, ArrowUpCircle, ArrowDownCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

interface FinancialData {
  revenues: any[]
  expenses: any[]
  monthly: {
    totalRevenue: number
    totalExpenses: number
    netProfit: number
    ticketAverage: number
  } | null
}

export default function FinancialPage() {
  const { token, user } = useAuth()
  const [data, setData] = useState<FinancialData>({ revenues: [], expenses: [], monthly: null })
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState<'revenue' | 'expense' | null>(null)
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: '',
    date: format(new Date(), 'yyyy-MM-dd'),
  })

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  const months = [
    { value: 1, label: 'Janeiro' },
    { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' },
    { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' },
    { value: 12, label: 'Dezembro' },
  ]

  useEffect(() => {
    if (token) fetchFinancial()
  }, [token, selectedMonth, selectedYear])

  const fetchFinancial = async () => {
    try {
      const [financialRes, reportRes] = await Promise.all([
        fetch(`/api/financial?month=${selectedMonth}&year=${selectedYear}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`/api/financial/reports?month=${selectedMonth}&year=${selectedYear}`, { 
          headers: { Authorization: `Bearer ${token}` } 
        }),
      ])

      const financialData = await financialRes.json()
      const reportData = await reportRes.json()

      setData({
        revenues: financialData.revenues || [],
        expenses: financialData.expenses || [],
        monthly: reportData.monthly,
      })
    } catch (error) {
      console.error('Error fetching financial:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const type = showModal
      const res = await fetch('/api/financial', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          type,
          amount: parseFloat(formData.amount),
          description: formData.description,
          category: type === 'expense' ? formData.category : null,
          date: formData.date,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error)
      }

      toast.success(type === 'revenue' ? 'Receita registrada!' : 'Despesa registrada!')
      setShowModal(null)
      setFormData({ amount: '', description: '', category: '', date: format(new Date(), 'yyyy-MM-dd') })
      fetchFinancial()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
      </div>
    )
  }

  const { totalRevenue, totalExpenses, netProfit, ticketAverage } = data.monthly || {
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    ticketAverage: 0,
  }

  const stats = [
    {
      label: 'Receita do mês',
      value: formatCurrency(totalRevenue),
      icon: ArrowUpCircle,
      color: 'bg-green-100 text-green-600',
    },
    {
      label: 'Despesas do mês',
      value: formatCurrency(totalExpenses),
      icon: ArrowDownCircle,
      color: 'bg-red-100 text-red-600',
    },
    {
      label: 'Lucro líquido',
      value: formatCurrency(netProfit),
      icon: netProfit >= 0 ? TrendingUp : TrendingDown,
      color: netProfit >= 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600',
    },
    {
      label: 'Ticket médio',
      value: formatCurrency(ticketAverage),
      icon: DollarSign,
      color: 'bg-gold-100 text-gold-600',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-nude-900">Financeiro</h1>
          <div className="flex items-center gap-2 mt-1">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="input py-1 px-2 text-sm w-auto"
            >
              {months.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="input py-1 px-2 text-sm w-auto"
            >
              <option value={2025}>2025</option>
              <option value={2026}>2026</option>
              <option value={2027}>2027</option>
            </select>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowModal('revenue')}
            className="btn bg-green-500 text-white hover:bg-green-600 flex items-center gap-2"
          >
            <Plus size={18} />
            Receita
          </button>
          <button
            onClick={() => setShowModal('expense')}
            className="btn bg-red-500 text-white hover:bg-red-600 flex items-center gap-2"
          >
            <Plus size={18} />
            Despesa
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-nude-600">{stat.label}</p>
                <p className="text-2xl font-bold text-nude-900 mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.color}`}>
                <stat.icon size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-semibold text-nude-900 mb-4">Receitas Recentes</h2>
          {data.revenues.length === 0 ? (
            <p className="text-nude-500 text-center py-4">Nenhuma receita registrada</p>
          ) : (
            <div className="space-y-3">
              {data.revenues.slice(0, 5).map((rev) => {
                const dateStr = new Date(rev.date).toISOString().split('T')[0]
                const [y, m, d] = dateStr.split('-')
                return (
                <div key={rev.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium text-nude-900">{rev.description || 'Receita'}</p>
                    <p className="text-sm text-nude-600">{d}/{m}/{y}</p>
                  </div>
                  <span className="font-semibold text-green-600">+{formatCurrency(rev.amount)}</span>
                </div>
              )})}
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="font-semibold text-nude-900 mb-4">Despesas Recentes</h2>
          {data.expenses.length === 0 ? (
            <p className="text-nude-500 text-center py-4">Nenhuma despesa registrada</p>
          ) : (
            <div className="space-y-3">
              {data.expenses.slice(0, 5).map((exp) => (
                <div key={exp.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <p className="font-medium text-nude-900">{exp.description}</p>
                    <p className="text-sm text-nude-600">{exp.category} • {format(new Date(exp.date), 'dd/MM/yyyy')}</p>
                  </div>
                  <span className="font-semibold text-red-600">-{formatCurrency(exp.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-nude-900">
                {showModal === 'revenue' ? 'Nova Receita' : 'Nova Despesa'}
              </h2>
              <button onClick={() => setShowModal(null)} className="p-2 hover:bg-nude-100 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-nude-700 mb-1">Valor (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  className="input"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-nude-700 mb-1">Descrição</label>
                <input
                  type="text"
                  required
                  className="input"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              {showModal === 'expense' && (
                <div>
                  <label className="block text-sm font-medium text-nude-700 mb-1">Categoria</label>
                  <select
                    required
                    className="input"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="">Selecione</option>
                    <option value="material">Material</option>
                    <option value="equipamento">Equipamento</option>
                    <option value="aluguel">Aluguel</option>
                    <option value="luz">Luz</option>
                    <option value="agua">Água</option>
                    <option value="internet">Internet</option>
                    <option value="marketing">Marketing</option>
                    <option value="outros">Outros</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-nude-700 mb-1">Data</label>
                <input
                  type="date"
                  required
                  className="input"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>

              <button type="submit" className={`btn w-full ${showModal === 'revenue' ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}`}>
                {showModal === 'revenue' ? 'Registrar Receita' : 'Registrar Despesa'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
