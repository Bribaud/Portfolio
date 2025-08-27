import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { page, projectId, visitorId, sessionId } = await request.json()

    const userAgent = request.headers.get('user-agent') || undefined
    const forwardedFor = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const ipAddress = forwardedFor?.split(',')[0] || realIp || request.ip || undefined

    // Créer l'entrée analytics
    await prisma.analytics.create({
      data: {
        visitorId: visitorId || 'anonymous',
        sessionId: sessionId || 'session-' + Date.now(),
        page,
        projectId,
        ipAddress,
        userAgent
      }
    })

    // Gérer la session
    await prisma.session.upsert({
      where: { sessionId: sessionId || 'session-' + Date.now() },
      create: {
        sessionId: sessionId || 'session-' + Date.now(),
        visitorId: visitorId || 'anonymous',
        pageViews: 1,
        lastPage: page
      },
      update: {
        pageViews: { increment: 1 },
        lastPage: page,
        endTime: new Date()
      }
    })

    // Incrémenter le compteur de vues du projet si applicable
    if (projectId) {
      await prisma.project.update({
        where: { id: projectId },
        data: { viewCount: { increment: 1 } }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur tracking:', error)
    return NextResponse.json({ error: 'Erreur tracking' }, { status: 500 })
  }
}