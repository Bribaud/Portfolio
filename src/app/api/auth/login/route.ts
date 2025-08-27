import { NextRequest, NextResponse } from 'next/server'
import { comparePassword, createToken } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 })
    }

    const admin = await prisma.admin.findUnique({ where: { email } })
    if (!admin) {
      return NextResponse.json({ error: 'Identifiants invalides' }, { status: 401 })
    }

    const isValid = await comparePassword(password, admin.password)
    if (!isValid) {
      return NextResponse.json({ error: 'Identifiants invalides' }, { status: 401 })
    }

    const token = createToken({ adminId: admin.id, email: admin.email })

    const response = NextResponse.json({ success: true })
    response.cookies.set('admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 jours
    })

    return response
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}