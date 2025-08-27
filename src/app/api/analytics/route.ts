import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthenticatedAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const admin = await getAuthenticatedAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Statistiques générales
    const totalVisits = await prisma.analytics.count()
    const uniqueVisitors = await prisma.analytics.groupBy({
      by: ['visitorId'],
      _count: { visitorId: true }
    })

    // Visites par jour (30 derniers jours)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const dailyVisits = await prisma.analytics.groupBy({
      by: ['timestamp'],
      where: {
        timestamp: { gte: thirtyDaysAgo }
      },
      _count: { id: true }
    })

    // Pages les plus visitées
    const pageViews = await prisma.analytics.groupBy({
      by: ['page'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } }
    })

    // Projets les plus vus
    const projectViews = await prisma.project.findMany({
      select: {
        id: true,
        title: true,
        viewCount: true
      },
      orderBy: { viewCount: 'desc' },
      take: 10
    })

    // Sessions récentes
    const recentSessions = await prisma.session.findMany({
      take: 20,
      orderBy: { startTime: 'desc' },
      include: {
        _count: {
          select: { id: true }
        }
      }
    })

    // Visiteurs récents
    const recentVisitors = await prisma.analytics.groupBy({
      by: ['visitorId'],
      _count: { id: true },
      _min: { timestamp: true },
      _max: { timestamp: true },
      orderBy: { _max: { timestamp: 'desc' } },
      take: 20
    })

    return NextResponse.json({
      totalVisits,
      uniqueVisitors: uniqueVisitors.length,
      dailyVisits: dailyVisits.map(d => ({
        date: d.timestamp.toISOString().split('T')[0],
        visits: d._count.id
      })),
      pageViews: pageViews.map(p => ({
        page: p.page,
        views: p._count.id
      })),
      projectViews,
      recentSessions: recentSessions.map(s => ({
        sessionId: s.sessionId,
        visitorId: s.visitorId,
        startTime: s.startTime,
        endTime: s.endTime,
        pageViews: s.pageViews,
        lastPage: s.lastPage
      })),
      recentVisitors: recentVisitors.map(v => ({
        visitorId: v.visitorId,
        totalVisits: v._count.id,
        firstVisit: v._min.timestamp,
        lastVisit: v._max.timestamp
      }))
    })
  } catch (error) {
    console.error('Erreur analytics:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}