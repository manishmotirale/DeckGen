export const AUTH_LOGIN_PATH = '/login'

export const AUTH_API_PREFIX = '/api/auth'

export const INNGEST_API_PATH = '/api/inngest'

/**
 * Routes that can be accessed without authentication.
 */
const PUBLIC_EXACT_PATHS = ['/', '/about', '/contact', AUTH_LOGIN_PATH]

/**
 * API paths that must remain publicly accessible.
 */
const PUBLIC_PREFIXES = [AUTH_API_PREFIX, INNGEST_API_PATH]

export function isPublicPath(pathname: string) {
  if (PUBLIC_EXACT_PATHS.includes(pathname)) {
    return true
  }

  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}

export function isLoginPath(pathname: string) {
  return pathname === AUTH_LOGIN_PATH
}
