import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware, AuthRequest } from '@/lib/authMiddleware'

export const dynamic = 'force-dynamic'

export async function GET(req: AuthRequest) {
  const authError = await authMiddleware(req)
  if (authError) return authError

  try {
    const now = new Date()
    const brazilDate = now.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' })
    const today = new Date(brazilDate + 'T00:00:00.000Z')
    const tomorrow = new Date(today)
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59)
    
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1)
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59)

    const [
      todayAppointments,
      monthCompletedAppointments,
      activeClients,
      upcomingAppointments,
      allPendingAppointments,
      allAppointments,
      lastMonthAppointments,
      clients
    ] = await Promise.all([
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
      prisma.appointment.count({
        where: {
          userId: req.user!.userId,
          status: 'pending',
        },
      }),
      prisma.appointment.findMany({
        where: {
          userId: req.user!.userId,
        },
        include: {
          client: true,
          service: true,
        },
        orderBy: { date: 'desc' },
      }),
      prisma.appointment.findMany({
        where: {
          userId: req.user!.userId,
          date: { gte: lastMonthStart, lte: lastMonthEnd },
          status: 'completed',
        },
      }),
      prisma.client.findMany({
        where: {
          userId: req.user!.userId,
        },
        include: {
          appointments: true,
        },
      }),
    ])

    const monthlyRevenueTotal = monthCompletedAppointments.reduce((sum: number, a: any) => sum + a.price, 0)
    const lastMonthRevenue = lastMonthAppointments.reduce((sum: number, a: any) => sum + a.price, 0)
    
    const todayRevenue = todayAppointments
      .filter((a: any) => a.status === 'completed')
      .reduce((sum: number, a: any) => sum + a.price, 0)

    const pendingCount = allPendingAppointments
    const confirmedCount = todayAppointments.filter((a: any) => a.status === 'confirmed').length

    const serviceStats: Record<string, { name: string; count: number; revenue: number }> = {}
    allAppointments.filter((a: any) => a.status === 'completed').forEach((apt: any) => {
      const serviceName = apt.service.name
      if (!serviceStats[serviceName]) {
        serviceStats[serviceName] = { name: serviceName, count: 0, revenue: 0 }
      }
      serviceStats[serviceName].count++
      serviceStats[serviceName].revenue += apt.price
    })
    const topServices = Object.values(serviceStats)
      .sort((a: any, b: any) => b.count - a.count)
      .slice(0, 5)

    const dayStats: Record<string, number> = {}
    allAppointments.filter((a: any) => a.status !== 'cancelled').forEach((apt: any) => {
      const day = new Date(apt.date).toLocaleDateString('pt-BR', { weekday: 'long' })
      dayStats[day] = (dayStats[day] || 0) + 1
    })
    const busiestDays = Object.entries(dayStats)
      .map(([day, count]) => ({ day, count }))
      .sort((a, b) => b.count - a.count)

    const timeStats: Record<string, number> = {}
    allAppointments.filter((a: any) => a.status !== 'cancelled').forEach((apt: any) => {
      const hour = apt.startTime.split(':')[0] + ':00'
      timeStats[hour] = (timeStats[hour] || 0) + 1
    })
    const busiestTimes = Object.entries(timeStats)
      .map(([time, count]) => ({ time, count }))
      .sort((a: any, b: any) => b.count - a.count)

    const clientAppointments: Record<string, number> = {}
    allAppointments.filter((a: any) => a.status === 'completed').forEach((apt: any) => {
      clientAppointments[apt.clientId] = (clientAppointments[apt.clientId] || 0) + 1
    })
    const frequentClients = Object.entries(clientAppointments)
      .map(([clientId, count]) => {
        const client = clients.find((c: any) => c.id === clientId)
        return { name: client?.name || 'Cliente', count }
      })
      .sort((a: any, b: any) => b.count - a.count)
      .slice(0, 5)

    const cancelledCount = allAppointments.filter((a: any) => a.status === 'cancelled').length
    const totalCount = allAppointments.length
    const cancellationRate = totalCount > 0 ? ((cancelledCount / totalCount) * 100).toFixed(1) : '0'

    const newClientsThisMonth = clients.filter((c: any) => {
      const firstAppointment = allAppointments.find((a: any) => a.clientId === c.id)
      return firstAppointment && new Date(firstAppointment.date) >= startOfMonth
    }).length

    const recurringClients = Object.values(clientAppointments).filter(count => count > 1).length

    const avgRatingResult = await prisma.appointment.aggregate({
      where: {
        userId: req.user!.userId,
        rating: { not: null },
        status: 'completed',
      },
      _avg: { rating: true },
    })

    const comparisonPercent = lastMonthRevenue > 0 
      ? (((monthlyRevenueTotal - lastMonthRevenue) / lastMonthRevenue) * 100).toFixed(1)
      : '0'

    return NextResponse.json({
      todayAppointments,
      todayRevenue,
      monthlyRevenue: monthlyRevenueTotal,
      lastMonthRevenue,
      comparisonPercent: parseFloat(comparisonPercent),
      activeClients,
      upcomingAppointments,
      avgRating: avgRatingResult._avg.rating || 0,
      stats: {
        totalToday: todayAppointments.length,
        pending: pendingCount,
        confirmed: confirmedCount,
      },
      analytics: {
        topServices,
        busiestDays,
        busiestTimes,
        frequentClients,
        cancellationRate: parseFloat(cancellationRate),
        newClientsThisMonth,
        recurringClients,
      }
    })
  } catch (error) {
    console.error('Get dashboard error:', error)
    return NextResponse.json({ error: 'Erro ao buscar dados do dashboard' }, { status: 500 })
  }
}
