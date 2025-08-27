import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { NextRequest } from 'next/server'
import { prisma } from './db'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function createToken(payload: { adminId: string; email: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): { adminId: string; email: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { adminId: string; email: string }
  } catch (error) {
    return null
  }
}

export async function getAuthenticatedAdmin(request: NextRequest) {
  const token = request.cookies.get('admin-token')?.value

  if (!token) return null

  const payload = verifyToken(token)
  if (!payload) return null

  const admin = await prisma.admin.findUnique({
    where: { id: payload.adminId },
    select: { id: true, email: true }
  })

  return admin
}