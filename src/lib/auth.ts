export function saveToken(token: string) {
  try {
    localStorage.setItem('accessToken', token)
  } catch {}
}

export function loadToken(): string | null {
  try {
    return localStorage.getItem('accessToken')
  } catch {
    return null
  }
}

export function clearToken() {
  try {
    localStorage.removeItem('accessToken')
  } catch {}
}
