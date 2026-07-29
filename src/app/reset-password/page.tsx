'use client'

import { Suspense } from 'react'
import { ArrowLeft, Scissors } from 'lucide-react'
import Link from 'next/link'
import ResetPasswordForm from './ResetPasswordForm'

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-nude-50 via-rose-50 to-nude-100 flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-rose-400 via-rose-500 to-rose-600 items-center justify-center p-12">
        <div className="text-white text-center max-w-lg">
          <div className="mb-8 inline-flex items-center justify-center w-24 h-24 bg-white/20 rounded-full">
            <Scissors className="w-12 h-12" />
          </div>
          <h1 className="text-4xl font-bold mb-4">ClubNailsBrasil</h1>
          <p className="text-xl text-white/90 mb-8">
            Sua nova senha, seu novo começo.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-rose-500 rounded-full mb-4">
              <Scissors className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-nude-900">ClubNailsBrasil</h1>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <Suspense fallback={<div className="text-center py-8">Carregando...</div>}>
              <ResetPasswordForm />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}
