import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateReferralCode } from '@/lib/referral'
import { hashPassword, generateToken, generateSlug, verifyToken } from '@/lib/auth'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, password, whatsapp, studioName, instagram } = body

    if (!name || !email || !password || !whatsapp || !studioName) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email já cadastrado' },
        { status: 400 }
      )
    }

    let slug = generateSlug(studioName)
    const existingSlug = await prisma.user.findUnique({ where: { slug } })
    if (existingSlug) {
      slug = `${slug}-${crypto.randomBytes(2).toString('hex')}`
    }

    const freePlan = await prisma.plan.findFirst({ where: { slug: 'free' } })
    
    const hashedPassword = await hashPassword(password)

    // Generate referral code for the new user (ensuring uniqueness)
    const refCode = await generateReferralCode(name)

    const trialEndsAt = new Date()
    trialEndsAt.setDate(trialEndsAt.getDate() + 15)

    const userData: any = {
      name,
      email,
      password: hashedPassword,
      whatsapp,
      studioName,
      slug,
      planId: freePlan?.id || 'free',
      trialEndsAt,
      instagram,
    }
    userData.refCode = refCode
    const user = await prisma.user.create({ data: userData })

    await prisma.publicProfile.create({
      data: { userId: user.id }
    })

    const token = generateToken({
      userId: user.id,
      email: user.email,
      planId: user.planId,
      role: user.role,
    })

    // Handle referral cookie (optional)
    const referralCodeCookie = req.cookies.get('ref_code')?.value
    if (referralCodeCookie) {
      const referrer = await (prisma as any).user.findFirst({ where: { refCode: referralCodeCookie } })
      if (referrer) {
        // Save who referred this new user
        await prisma.user.update({ where: { id: user.id }, data: { referredBy: referralCodeCookie } } as any)
        // Create referral record se ainda não existe (evita duplicação)
        const existingReferral = await (prisma as any).referral.findFirst({
          where: { referrerId: referrer.id, referredUserId: user.id }
        })
        if (!existingReferral) {
          await (prisma as any).referral.create({
            data: {
              referrerId: referrer.id,
              referredUserId: user.id,
              status: 'trial',
            }
          })
        }
      }
    }

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        studioName: user.studioName,
        slug: user.slug,
        planId: user.planId,
        trialEndsAt: user.trialEndsAt,
      },
    })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json(
      { error: 'Erro ao criar conta' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const payload = verifyToken(token)
    
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        name: true,
        email: true,
        whatsapp: true,
        studioName: true,
        slug: true,
        planId: true,
        plan: true,
        createdAt: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json({ error: 'Erro ao buscar usuário' }, { status: 500 })
  }
}
