import crypto from 'crypto'

export function generateId(): string {
  return crypto.randomBytes(8).toString('hex')
}

export function getVisitorId(): string {
  if (typeof window !== 'undefined') {
    let visitorId = localStorage.getItem('visitor_id')
    if (!visitorId) {
      visitorId = generateId()
      localStorage.setItem('visitor_id', visitorId)
    }
    return visitorId
  }
  return generateId()
}

export function getSessionId(): string {
  if (typeof window !== 'undefined') {
    let sessionId = sessionStorage.getItem('session_id')
    if (!sessionId) {
      sessionId = generateId()
      sessionStorage.setItem('session_id', sessionId)
    }
    return sessionId
  }
  return generateId()
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}