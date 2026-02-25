import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware, AuthRequest } from '@/lib/authMiddleware'

export async function GET(req: AuthRequest) {
  const authError = await authMiddleware(req)
  if (authError) return authError

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

    const [completedAppointments, expenses, clientsCount, appointmentsCount] = await Promise.all([
      prisma.appointment.findMany({
        where: {
          ...whereUser,
          date: { gte: startOfMonth, lte: endOfMonth },
          status: 'completed',
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

    const totalRevenue = completedAppointments.reduce((sum, r) => sum + r.price, 0)
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
    const netProfit = totalRevenue - totalExpenses
    const ticketAverage = completedAppointments.length > 0 
      ? totalRevenue / completedAppointments.length 
      : 0

    let monthlyReport = null
    let yearlyReport = null

    if (reportType === 'monthly' || !reportType) {
      monthlyReport = {
        totalRevenue,
        totalExpenses,
        netProfit,
        ticketAverage,
        appointmentsCount,
        clientsCount,
        revenues: completedAppointments.slice(0, 10).map(r => ({
          id: r.id,
          amount: r.price,
          date: r.date,
          description: 'Serviço',
        })),
        expenses: expenses.slice(0, 10),
      }
    }

    if (reportType === 'yearly') {
      const startOfYear = new Date(targetYear, 0, 1)
      const endOfYear = new Date(targetYear, 11, 31, 23, 59, 59)

      const [yearAppointments, yearExpenses] = await Promise.all([
        prisma.appointment.findMany({
          where: {
            ...whereUser,
            date: { gte: startOfYear, lte: endOfYear },
            status: 'completed',
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

        const monthRev = yearAppointments.filter(r => {
          const d = new Date(r.date)
          return d >= monthStart && d <= monthEnd
        })
        const monthExp = yearExpenses.filter(e => {
          const d = new Date(e.date)
          return d >= monthStart && d <= monthEnd
        })

        monthlyData.push({
          month: m + 1,
          revenue: monthRev.reduce((sum: number, r: any) => sum + r.price, 0),
          expenses: monthExp.reduce((sum: number, e: any) => sum + e.amount, 0),
          profit: monthRev.reduce((sum: number, r: any) => sum + r.price, 0) - monthExp.reduce((sum: number, e: any) => sum + e.amount, 0),
        })
      }

      yearlyReport = {
        totalRevenue: yearAppointments.reduce((sum: number, r: any) => sum + r.price, 0),
        totalExpenses: yearExpenses.reduce((sum: number, e: any) => sum + e.amount, 0),
        netProfit: yearAppointments.reduce((sum: number, r: any) => sum + r.price, 0) - yearExpenses.reduce((sum: number, e: any) => sum + e.amount, 0),
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
