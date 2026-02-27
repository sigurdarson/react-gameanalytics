'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/', label: 'Home' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/dashboard/analytics', label: 'Analytics' },
  { href: '/settings', label: 'Settings' },
  { href: '/onboarding', label: 'Onboarding' },
]

export function Nav() {
  const pathname = usePathname()

  return (
    <nav style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid #eee' }}>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          style={{
            color: pathname === link.href ? '#1976d2' : '#333',
            fontWeight: pathname === link.href ? 700 : 400,
            textDecoration: 'none',
          }}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  )
}
