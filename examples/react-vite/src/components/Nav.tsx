import { Link, useLocation } from 'react-router-dom'

const links = [
  { to: '/', label: 'Home' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/settings', label: 'Settings' },
  { to: '/onboarding', label: 'Onboarding' },
]

export function Nav() {
  const location = useLocation()

  return (
    <nav style={{ display: 'flex', gap: 8, borderBottom: '1px solid #ddd', paddingBottom: 8 }}>
      {links.map(({ to, label }) => (
        <Link
          key={to}
          to={to}
          style={{
            padding: '4px 12px',
            borderRadius: 4,
            textDecoration: 'none',
            background: location.pathname === to ? '#1976d2' : '#f0f0f0',
            color: location.pathname === to ? '#fff' : '#333',
          }}
        >
          {label}
        </Link>
      ))}
    </nav>
  )
}
