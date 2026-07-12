import { NextRequest, NextResponse } from 'next/server'
import { adminPasswordMatches, isUsableAdminPassword } from '@/lib/admin-security'

export const ADMIN_PASSWORD_HEADER = 'x-admin-password'

export function requireAdminRequest(request: NextRequest): NextResponse | null {
  const configuredPassword = process.env.ADMIN_PASSWORD

  if (!isUsableAdminPassword(configuredPassword)) {
    return NextResponse.json(
      { error: 'Admin mutations are disabled until ADMIN_PASSWORD is configured securely.' },
      { status: 403 }
    )
  }

  if (!adminPasswordMatches(configuredPassword, request.headers.get(ADMIN_PASSWORD_HEADER))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return null
}
