import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const response = NextResponse.json({ success: true })
    response.cookies.delete('admin-token')
    return response
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}