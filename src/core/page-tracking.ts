/**
 * Convert a URL pathname to a GA design event ID with colon-separated hierarchy.
 *
 * The prefix occupies level 1. Pathname segments fill levels 2-5.
 * If the path exceeds 4 segments, overflow segments are joined with hyphens.
 *
 * Examples:
 *   '/' -> 'pageView:root'
 *   '/dashboard' -> 'pageView:dashboard'
 *   '/dashboard/analytics' -> 'pageView:dashboard:analytics'
 *   '/a/b/c/d/e/f' -> 'pageView:a:b:c:d-e-f'
 */
export function pathnameToEventId(pathname: string, prefix = 'pageView'): string {
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length === 0) {
    return `${prefix}:root`
  }

  // GA supports max 5 levels. Prefix is level 1, so we have 4 remaining.
  const maxSegments = 4

  if (segments.length <= maxSegments) {
    return `${prefix}:${segments.join(':')}`
  }

  // Overflow: first 3 segments get their own levels, rest joined with hyphens
  const head = segments.slice(0, maxSegments - 1)
  const tail = segments.slice(maxSegments - 1)
  return `${prefix}:${head.join(':')}:${tail.join('-')}`
}

/**
 * Check if a pathname should be tracked based on exclusion patterns.
 *
 * Supports exact matches and simple glob patterns with trailing '*'.
 *
 * Examples:
 *   shouldTrackPath('/admin/settings', ['/admin/*']) -> false
 *   shouldTrackPath('/dashboard', ['/admin/*']) -> true
 *   shouldTrackPath('/login', ['/login']) -> false
 */
export function shouldTrackPath(pathname: string, excludePaths: string[]): boolean {
  for (const pattern of excludePaths) {
    if (pattern.endsWith('/*')) {
      const base = pattern.slice(0, -2)
      if (pathname === base || pathname.startsWith(base + '/')) {
        return false
      }
    } else if (pathname === pattern) {
      return false
    }
  }
  return true
}
