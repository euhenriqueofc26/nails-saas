import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware, AuthRequest } from '@/lib/authMiddleware'

export async function GET(req: AuthRequest) {
  const authError = await authMiddleware(req)
  if (authError) return authError

  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    include: { plan: true },
  })

  if (!user?.plan.hasFinancial) {
    return NextResponse.json(
      { error: 'Relatórios disponíveis apenas nos planos Pro e Premium' },
      { status: 403 },
    )
  }

  try {
    const { searchParams } = new URL(req.url)
    const reportType = searchParams.get('reportType')
    const month = searchParams.get('month')
    const year = searchParams.get('year')

    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth()

    const targetYear = year ? parseInt(year) : currentYear
    const targetMonth = month ? parseInt(month) - 1 : currentMonth

    const startOfMonth = new Date(targetYear, targetMonth, 1)
    const endOfMonth = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59)

    const whereUser = { userId: req.user!.userId }

    const [completedAppointments, manualRevenues, expenses, clientsCount, appointmentsCount] = await Promise.all([
      prisma.appointment.findMany({
        where: {
          ...whereUser,
          date: { gte: startOfMonth, lte: endOfMonth },
          status: 'completed',
        },
      }),
      prisma.revenue.findMany({
        where: {
          ...whereUser,
          date: { gte: startOfMonth, lte: endOfMonth },
        },
      }),
      prisma.expense.findMany({
        where: {
          ...whereUser,
          date: { gte: startOfMonth, lte: endOfMonth },
        },
      }),
      prisma.client.count({ where: whereUser }),
      prisma.appointment.count({
        where: {
          ...whereUser,
          date: { gte: startOfMonth, lte: endOfMonth },
        },
      }),
    ])

    const appointmentRevenue = completedAppointments.reduce((sum: number, r: any) => sum + r.price, 0)
    const manualRevenueTotal = manualRevenues.reduce((sum: number, r: any) => sum + r.amount, 0)
    const totalRevenue = appointmentRevenue + manualRevenueTotal
    const totalExpenses = expenses.reduce((sum: number, e: any) => sum + e.amount, 0)
    const netProfit = totalRevenue - totalExpenses
    const ticketAverage = completedAppointments.length > 0 
      ? totalRevenue / completedAppointments.length 
      : 0

    let monthlyReport = null
    let yearlyReport = null

    if (reportType === 'monthly' || !reportType) {
      const appointmentFormatted = completedAppointments.slice(0, 10).map((r: any) => ({
        id: r.id,
        amount: r.price,
        date: r.date,
        description: 'Serviço',
        source: 'appointment'
      }))
      const manualFormatted = manualRevenues.slice(0, 10).map((r: any) => ({
        id: r.id,
        amount: r.amount,
        date: r.date,
        description: r.description || 'Receita',
        source: 'manual'
      }))
      const allRevenues = [...appointmentFormatted, ...manualFormatted]
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 10)

      monthlyReport = {
        totalRevenue,
        totalExpenses,
        netProfit,
        ticketAverage,
        appointmentsCount,
        clientsCount,
        revenues: allRevenues,
        expenses: expenses.slice(0, 10),
      }
    }

    if (reportType === 'yearly') {
      const startOfYear = new Date(targetYear, 0, 1)
      const endOfYear = new Date(targetYear, 11, 31, 23, 59, 59)

      const [yearAppointments, yearRevenues, yearExpenses] = await Promise.all([
        prisma.appointment.findMany({
          where: {
            ...whereUser,
            date: { gte: startOfYear, lte: endOfYear },
            status: 'completed',
          },
        }),
        prisma.revenue.findMany({
          where: {
            ...whereUser,
            date: { gte: startOfYear, lte: endOfYear },
          },
        }),
        prisma.expense.findMany({
          where: {
            ...whereUser,
            date: { gte: startOfYear, lte: endOfYear },
          },
        }),
      ])

      const monthlyData = []
      for (let m = 0; m < 12; m++) {
        const monthStart = new Date(targetYear, m, 1)
        const monthEnd = new Date(targetYear, m + 1, 0, 23, 59, 59)

        const monthRev = yearAppointments.filter((r: any) => {
          const d = new Date(r.date)
          return d >= monthStart && d <= monthEnd
        })
        const monthManRev = yearRevenues.filter((r: any) => {
          const d = new Date(r.date)
          return d >= monthStart && d <= monthEnd
        })
        const monthExp = yearExpenses.filter((e: any) => {
          const d = new Date(e.date)
          return d >= monthStart && d <= monthEnd
        })

        const monthRevenue = monthRev.reduce((sum: number, r: any) => sum + r.price, 0) +
          monthManRev.reduce((sum: number, r: any) => sum + r.amount, 0)

        monthlyData.push({
          month: m + 1,
          revenue: monthRevenue,
          expenses: monthExp.reduce((sum: number, e: any) => sum + e.amount, 0),
          profit: monthRevenue - monthExp.reduce((sum: number, e: any) => sum + e.amount, 0),
        })
      }

      const totalYearRevenue = yearAppointments.reduce((sum: number, r: any) => sum + r.price, 0) +
        yearRevenues.reduce((sum: number, r: any) => sum + r.amount, 0)

      yearlyReport = {
        totalRevenue: totalYearRevenue,
        totalExpenses: yearExpenses.reduce((sum: number, e: any) => sum + e.amount, 0),
        netProfit: totalYearRevenue - yearExpenses.reduce((sum: number, e: any) => sum + e.amount, 0),
        monthlyData,
      }
    }

    return NextResponse.json({
      monthly: monthlyReport,
      yearly: yearlyReport,
    })
  } catch (error) {
    console.error('Get report error:', error)
    return NextResponse.json({ error: 'Erro ao gerar relatório' }, { status: 500 })
  }
}
