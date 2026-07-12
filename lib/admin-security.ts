import { timingSafeEqual } from 'crypto'

const INSECURE_ADMIN_PASSWORDS = new Set([
  'ai_admin_2025',
  'your-secure-password-here',
])

export function isUsableAdminPassword(password: string | undefined): password is string {
  return Boolean(password && !INSECURE_ADMIN_PASSWORDS.has(password))
}

export function adminPasswordMatches(
  configuredPassword: string | undefined,
  suppliedPassword: string | null | undefined
): boolean {
  if (!isUsableAdminPassword(configuredPassword) || !suppliedPassword) {
    return false
  }

  const configured = Buffer.from(configuredPassword, 'utf8')
  const supplied = Buffer.from(suppliedPassword, 'utf8')

  return configured.length === supplied.length && timingSafeEqual(configured, supplied)
}
