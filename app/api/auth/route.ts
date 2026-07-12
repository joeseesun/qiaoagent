import { NextRequest, NextResponse } from 'next/server'
import { adminPasswordMatches, isUsableAdminPassword } from '@/lib/admin-security'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { password } = body

    const adminPassword = process.env.ADMIN_PASSWORD

    if (!isUsableAdminPassword(adminPassword)) {
      return NextResponse.json(
        { authorized: false, error: 'Admin access is disabled until ADMIN_PASSWORD is configured securely.' },
        { status: 403 }
      )
    }

    if (adminPasswordMatches(adminPassword, password)) {
      return NextResponse.json({ authorized: true })
    } else {
      return NextResponse.json(
        { authorized: false, error: 'Invalid password' },
        { status: 401 }
      )
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
