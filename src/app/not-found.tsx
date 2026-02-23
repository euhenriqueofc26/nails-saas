export const dynamic = 'force-dynamic'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-nude-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-rose-500 mb-4">404</h1>
        <p className="text-nude-600 text-xl">Página não encontrada</p>
      </div>
    </div>
  )
}
