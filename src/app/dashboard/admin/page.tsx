'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Search, Filter, MoreVertical, Shield, UserX, UserCheck, Crown, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'

interface User {
  id: string
  name: string
  email: string
  whatsapp: string | null
  studioName: string
  slug: string
  role: string
  planId: string
  isBlocked: boolean
  trialEndsAt: string | null
  subscriptionEndsAt: string | null
  createdAt: string
  _count: {
    clients: number
    appointments: number
  }
}

interface Plan {
  id: string
  name: string
  slug: string
  price: number
}

export default function AdminPage() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [planFilter, setPlanFilter] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    if (currentUser?.role !== 'admin') {
      setLoading(false)
      return
    }
    fetchUsers()
  }, [currentUser, search, statusFilter, planFilter])

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (statusFilter) params.set('status', statusFilter)
      if (planFilter) params.set('plan', planFilter)

      const res = await fetch(`/api/admin/users?${params}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      const data = await res.json()
      if (res.ok) {
        setUsers(data.users)
        setPlans(data.plans)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleBlock = async (user: User) => {
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ isBlocked: !user.isBlocked })
      })

      if (res.ok) {
        toast.success(user.isBlocked ? 'Usuário desbloqueado' : 'Usuário bloqueado')
        fetchUsers()
        setShowModal(false)
      } else {
        toast.error('Erro ao atualizar usuário')
      }
    } catch (error) {
      toast.error('Erro ao atualizar usuário')
    }
  }

  const changePlan = async (userId: string, planId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ planId })
      })

      if (res.ok) {
        toast.success('Plano alterado com sucesso')
        fetchUsers()
        setShowModal(false)
      } else {
        toast.error('Erro ao alterar plano')
      }
    } catch (error) {
      toast.error('Erro ao alterar plano')
    }
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('pt-BR')
  }

  const getStatus = (user: User) => {
    if (user.isBlocked) return { label: 'Bloqueado', color: 'bg-red-100 text-red-700' }
    if (user.trialEndsAt && new Date(user.trialEndsAt) > new Date()) {
      const daysLeft = Math.ceil((new Date(user.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      if (daysLeft <= 3) return { label: `Trial (${daysLeft}d)`, color: 'bg-yellow-100 text-yellow-700' }
      return { label: `Trial (${daysLeft}d)`, color: 'bg-blue-100 text-blue-700' }
    }
    if (user.subscriptionEndsAt) {
      return { label: 'Pago', color: 'bg-green-100 text-green-700' }
    }
    return { label: 'Ativo', color: 'bg-green-100 text-green-700' }
  }

  if (currentUser?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <AlertTriangle className="w-16 h-16 text-yellow-500 mb-4" />
        <h1 className="text-2xl font-bold text-nude-900 mb-2">Acesso negado</h1>
        <p className="text-nude-600">Você não tem permissão para acessar esta página.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-nude-900">Administração</h1>
          <p className="text-nude-600">Gerencie as contas das nails designers</p>
        </div>
        <div className="bg-rose-500 text-white px-4 py-2 rounded-lg font-semibold">
          {users.length} usuários
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-nude-400" />
          <input
            type="text"
            placeholder="Buscar por nome, email ou studio..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input w-full sm:w-48"
        >
          <option value="">Todos os status</option>
          <option value="active">Ativos</option>
          <option value="blocked">Bloqueados</option>
          <option value="trial">Em trial</option>
        </select>

        <select
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value)}
          className="input w-full sm:w-48"
        >
          <option value="">Todos os planos</option>
          {plans.map((plan) => (
            <option key={plan.id} value={plan.id}>{plan.name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12">Carregando...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-nude-100">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-nude-700">Usuário</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-nude-700">Studio</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-nude-700">Plano</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-nude-700">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-nude-700">Clientes</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-nude-700">Criado em</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-nude-700">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-nude-100">
                {users.map((user) => {
                  const status = getStatus(user)
                  const plan = plans.find(p => p.id === user.planId)

                  return (
                    <tr key={user.id} className="hover:bg-nude-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-nude-900">{user.name}</p>
                          <p className="text-sm text-nude-500">{user.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-nude-700">{user.studioName}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-nude-100 rounded-full text-sm">
                          <Crown className="w-3 h-3" />
                          {plan?.name || user.planId}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-nude-700">{user._count.clients}</td>
                      <td className="px-4 py-3 text-nude-600">{formatDate(user.createdAt)}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => { setSelectedUser(user); setShowModal(true) }}
                          className="p-2 hover:bg-nude-100 rounded-lg"
                        >
                          <MoreVertical className="w-5 h-5 text-nude-600" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <div className="text-center py-12 text-nude-500">
              Nenhum usuário encontrado
            </div>
          )}
        </div>
      )}

      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-nude-900 mb-4">{selectedUser.studioName}</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-nude-700 mb-1">Plano</label>
                <select
                  value={selectedUser.planId}
                  onChange={(e) => changePlan(selectedUser.id, e.target.value)}
                  className="input"
                >
                  {plans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} {plan.price > 0 ? `(${plan.price}/mês)` : '(Grátis)'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-nude-600 mb-3">Informações</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-nude-500">Email:</span>
                    <p className="font-medium">{selectedUser.email}</p>
                  </div>
                  <div>
                    <span className="text-nude-500">WhatsApp:</span>
                    <p className="font-medium">{selectedUser.whatsapp || '-'}</p>
                  </div>
                  <div>
                    <span className="text-nude-500">Clientes:</span>
                    <p className="font-medium">{selectedUser._count.clients}</p>
                  </div>
                  <div>
                    <span className="text-nude-500">Agendamentos:</span>
                    <p className="font-medium">{selectedUser._count.appointments}</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <button
                  onClick={() => toggleBlock(selectedUser)}
                  className={`w-full btn ${selectedUser.isBlocked ? 'btn-primary' : 'bg-red-500 hover:bg-red-600 text-white'}`}
                >
                  {selectedUser.isBlocked ? (
                    <><UserCheck className="w-4 h-4 mr-2" /> Desbloquear acesso</>
                  ) : (
                    <><UserX className="w-4 h-4 mr-2" /> Bloquear acesso</>
                  )}
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="mt-4 w-full btn-secondary"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
