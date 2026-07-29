'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Eye, EyeOff, ArrowLeft, Scissors } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!token) {
      toast.error('Link inválido ou expirado.')
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (password.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      toast.error('As senhas não conferem')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/auth/forgot', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao redefinir senha')
      }

      setDone(true)
      toast.success('Senha redefinida com sucesso!')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="text-center space-y-4 py-4">
        <h2 className="text-xl font-bold text-nude-900">Link inválido</h2>
        <p className="text-nude-600">Este link de recuperação é inválido ou expirou.</p>
        <Link
          href="/forgot-password"
          className="text-rose-600 hover:text-rose-700 text-sm inline-flex items-center gap-1"
        >
          <ArrowLeft size={16} />
          Solicitar novo link
        </Link>
      </div>
    )
  }

  if (done) {
    return (
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
          <Scissors className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-nude-900">Senha redefinida!</h2>
        <p className="text-sm text-nude-500">Sua senha foi atualizada com sucesso.</p>
        <Link
          href="/entrar"
          className="btn btn-primary inline-flex items-center gap-2"
        >
          Fazer login
        </Link>
      </div>
    )
  }

  return (
    <>
      <h2 className="text-2xl font-bold text-nude-900 mb-2">Redefinir senha</h2>
      <p className="text-nude-600 mb-6">Escolha uma nova senha para sua conta.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-nude-700 mb-1">Nova senha</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={6}
              className="input pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-nude-400 hover:text-nude-600"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-nude-700 mb-1">Confirmar senha</label>
          <input
            type={showPassword ? 'text' : 'password'}
            required
            minLength={6}
            className="input"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary w-full flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            'Redefinir senha'
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link
          href="/entrar"
          className="text-rose-600 hover:text-rose-700 text-sm inline-flex items-center gap-1"
        >
          <ArrowLeft size={16} />
          Voltar ao login
        </Link>
      </div>
    </>
  )
}
