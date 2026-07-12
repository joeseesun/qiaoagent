export function getAdminAuthHeaders(): Record<string, string> {
  if (typeof window === 'undefined') {
    return {}
  }

  const password = window.sessionStorage.getItem('admin_password')
  return password ? { 'X-Admin-Password': password } : {}
}
