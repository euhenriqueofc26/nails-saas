'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Smartphone, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface SessionInfo {
  id: string
  status: string
  phoneNumber: string | null
  instanceName: string
}

export default function WhatsAppConnect() {
  const { token, user } = useAuth()
  const [session, setSession] = useState<SessionInfo | null>(null)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [showQrModal, setShowQrModal] = useState(false)
  const [pollCount, setPollCount] = useState(0)

  const fetchStatus = useCallback(async () => {
    if (!token) return
    try {
      const res = await fetch('/api/whatsapp/status', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.session) {
        setSession(data.session)
      } else {
        setSession(null)
      }
    } catch {
    }
  }, [token])

  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  useEffect(() => {
    if (!showQrModal || !session || session.status === 'CONNECTED') return

    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/whatsapp/status', {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        if (data.session) {
          setSession(data.session)
          if (data.session.status === 'CONNECTED') {
            setShowQrModal(false)
            setQrCode(null)
            toast.success('WhatsApp conectado com sucesso!')
            clearInterval(interval)
          }
        }
        setPollCount((c) => c + 1)
      } catch {
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [showQrModal, session?.status, token])

  const handleConnect = async () => {
    if (!token) return
    setConnecting(true)
    try {
      const res = await fetch('/api/whatsapp/connect', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error)
        return
      }

      setQrCode(data.session.qrCode)
      setSession(data.session)
      setShowQrModal(true)
      setPollCount(0)
    } catch {
      toast.error('Erro ao conectar WhatsApp')
    } finally {
      setConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    if (!token) return
    if (!confirm('Tem certeza que deseja desconectar o WhatsApp?')) return

    setLoading(true)
    try {
      const res = await fetch('/api/whatsapp/disconnect', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) throw new Error()

      setSession(null)
      setQrCode(null)
      toast.success('WhatsApp desconectado')
    } catch {
      toast.error('Erro ao desconectar')
    } finally {
      setLoading(false)
    }
  }

  if (user?.planId !== 'premium') {
    return (
      <div className="card opacity-75">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-nude-100 rounded-lg">
            <Smartphone className="text-nude-400" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-nude-900">WhatsApp Automático</h2>
            <p className="text-sm text-nude-500">Disponível no plano Premium</p>
          </div>
        </div>
        <div className="bg-nude-50 rounded-lg p-4 text-center">
          <p className="text-sm text-nude-500">
            Faça upgrade para o plano Premium e tenha confirmações e lembretes automáticos no WhatsApp.
          </p>
        </div>
      </div>
    )
  }

  if (session?.status === 'CONNECTED') {
    return (
      <div className="card border-green-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-100 rounded-lg">
            <Smartphone className="text-green-600" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-nude-900">WhatsApp Conectado</h2>
            <p className="text-sm text-green-600 flex items-center gap-1">
              <CheckCircle size={14} />
              Online
            </p>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4 mb-4">
          <p className="text-sm text-nude-700">
            <span className="font-medium">Número:</span>{' '}
            {session.phoneNumber || '---'}
          </p>
          <p className="text-sm text-nude-500 mt-1">
            Confirmações e lembretes serão enviados automaticamente.
          </p>
        </div>

        <button
          onClick={handleDisconnect}
          disabled={loading}
          className="btn bg-red-100 text-red-600 hover:bg-red-200"
        >
          {loading ? 'Desconectando...' : 'Desconectar WhatsApp'}
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="card border-dashed border-2 border-nude-300">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-rose-100 rounded-lg">
            <Smartphone className="text-rose-600" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-nude-900">Integração WhatsApp</h2>
            <p className="text-sm text-nude-500">
              Conecte seu WhatsApp para enviar confirmações e lembretes automáticos
            </p>
          </div>
        </div>

        <div className="bg-nude-50 rounded-lg p-4 mb-4">
          <ul className="text-sm text-nude-600 space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle size={16} className="text-green-500 mt-0.5 shrink-0" />
              Confirmação automática ao agendar
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle size={16} className="text-green-500 mt-0.5 shrink-0" />
              Lembretes enviados 1 dia antes
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle size={16} className="text-green-500 mt-0.5 shrink-0" />
              Lembrete no dia do agendamento
            </li>
            <li className="flex items-start gap-2">
              <AlertCircle size={16} className="text-nude-400 mt-0.5 shrink-0" />
              Mensagens enviadas do seu próprio número
            </li>
          </ul>
        </div>

        <button
          onClick={handleConnect}
          disabled={connecting}
          className="btn btn-primary flex items-center gap-2"
        >
          {connecting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Conectando...
            </>
          ) : (
            <>
              <Smartphone size={16} />
              Conectar WhatsApp
            </>
          )}
        </button>
      </div>

      {showQrModal && qrCode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm animate-fade-in text-center">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-nude-900">Conectar WhatsApp</h2>
              <button
                onClick={() => setShowQrModal(false)}
                className="p-2 hover:bg-nude-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-sm text-nude-600 mb-4">
              Abra o WhatsApp no seu celular e escaneie o QR Code abaixo
            </p>

            <div className="bg-white border-2 border-nude-200 rounded-lg p-4 mb-4 inline-block">
              <img
                src={`data:image/png;base64,${qrCode}`}
                alt="QR Code WhatsApp"
                className="w-64 h-64 mx-auto"
              />
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-nude-500 mb-4">
              <Loader2 size={14} className="animate-spin" />
              Aguardando leitura do QR Code...
              {pollCount > 10 && (
                <button
                  onClick={handleConnect}
                  className="text-rose-600 hover:text-rose-700 ml-2 underline"
                >
                  Gerar novo QR Code
                </button>
              )}
            </div>

            <ol className="text-left text-sm text-nude-600 space-y-2">
              <li className="flex items-start gap-2">
                <span className="bg-rose-100 text-rose-600 w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5">1</span>
                Abra o WhatsApp no seu celular
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-rose-100 text-rose-600 w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5">2</span>
                Toque em <strong>Menu</strong> ou <strong>Configurações</strong>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-rose-100 text-rose-600 w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5">3</span>
                Selecione <strong>WhatsApp Web</strong>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-rose-100 text-rose-600 w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5">4</span>
                Escaneie este QR Code
              </li>
            </ol>
          </div>
        </div>
      )}
    </>
  )
}
