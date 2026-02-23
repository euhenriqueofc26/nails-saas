import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware, AuthRequest } from '@/lib/authMiddleware'

export async function GET(req: AuthRequest) {
  const authError = await authMiddleware(req)
  if (authError) return authError

  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const endOfDay = new Date(today)
    endOfDay.setHours(23, 59, 59, 999)

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59)

    const [todayAppointments, monthRevenue, activeClients, upcomingAppointments] = await Promise.all([
      prisma.appointment.findMany({
        where: {
          userId: req.user!.userId,
          date: { gte: today, lte: endOfDay },
          status: { notIn: ['cancelled'] },
        },
        include: {
          client: true,
          service: true,
        },
        orderBy: { startTime: 'asc' },
      }),
      prisma.revenue.aggregate({
        where: {
          userId: req.user!.userId,
          date: { gte: startOfMonth, lte: endOfMonth },
        },
        _sum: { amount: true },
      }),
      prisma.client.count({
        where: {
          userId: req.user!.userId,
        },
      }),
      prisma.appointment.findMany({
        where: {
          userId: req.user!.userId,
          date: { gt: endOfDay },
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

    const monthlyRevenueTotal = monthRevenue._sum.amount || 0
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
