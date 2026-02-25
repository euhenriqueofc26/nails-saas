import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware, AuthRequest } from '@/lib/authMiddleware'

export async function GET(req: AuthRequest) {
  const authError = await authMiddleware(req)
  if (authError) return authError

  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59)

    const [todayAppointments, monthCompletedAppointments, activeClients, upcomingAppointments] = await Promise.all([
      prisma.appointment.findMany({
        where: {
          userId: req.user!.userId,
          date: { gte: today, lt: tomorrow },
          status: { notIn: ['cancelled'] },
        },
        include: {
          client: true,
          service: true,
        },
        orderBy: { startTime: 'asc' },
      }),
      prisma.appointment.findMany({
        where: {
          userId: req.user!.userId,
          date: { gte: startOfMonth, lte: endOfMonth },
          status: 'completed',
        },
      }),
      prisma.client.count({
        where: {
          userId: req.user!.userId,
        },
      }),
      prisma.appointment.findMany({
        where: {
          userId: req.user!.userId,
          date: { gte: tomorrow },
          status: { notIn: ['cancelled'] },
        },
        include: {
          client: true,
          service: true,
        },
        orderBy: [
          { date: 'asc' },
          { startTime: 'asc' },
        ],
        take: 5,
      }),
    ])

    // Calcular faturamento do mês dinamicamente baseado em agendamentos concluídos
    const monthlyRevenueTotal = monthCompletedAppointments.reduce((sum, a) => sum + a.price, 0)
    
    const todayRevenue = todayAppointments
      .filter(a => a.status === 'completed')
      .reduce((sum, a) => sum + a.price, 0)

    const pendingCount = todayAppointments.filter(a => a.status === 'pending').length
    const confirmedCount = todayAppointments.filter(a => a.status === 'confirmed').length

    return NextResponse.json({
      todayAppointments,
      todayRevenue,
      monthlyRevenue: monthlyRevenueTotal,
      activeClients,
      upcomingAppointments,
      stats: {
        totalToday: todayAppointments.length,
        pending: pendingCount,
        confirmed: confirmedCount,
      }
    })
  } catch (error) {
    console.error('Get dashboard error:', error)
    return NextResponse.json({ error: 'Erro ao buscar dados do dashboard' }, { status: 500 })
  }
}
