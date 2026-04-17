import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { CalendarDays, Users, FolderOpen, Star } from 'lucide-react'
import { useAuth } from '@/lib/AuthContext'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const initials = user?.email?.slice(0, 2).toUpperCase() || 'ME'

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      backgroundColor: 'var(--background)',
      fontFamily: 'var(--font-family-base)',
      overflow: 'hidden',
    }}>
      {/* Top nav */}
      <header style={{
        height: '52px',
        minHeight: '52px',
        backgroundColor: 'var(--card)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.25rem',
        zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <div style={{
            width: '32px', height: '32px',
            borderRadius: 'var(--radius)',
            backgroundColor: 'var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginRight: '0.5rem', flexShrink: 0,
          }}>
            <Star size={14} color="var(--primary-foreground)" fill="var(--primary-foreground)" />
          </div>
          <span style={{
            fontSize: '0.9375rem', fontWeight: 600,
            fontFamily: 'var(--font-family-heading)',
            color: 'var(--foreground)', marginRight: '0.5rem',
            letterSpacing: '-0.02em',
          }}>Rotina</span>

          {[
            { to: '/', icon: CalendarDays, label: 'Calendar' },
            { to: '/clients', icon: Users, label: 'Clients' },
            { to: '/projects', icon: FolderOpen, label: 'Projects' },
          ].map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} end={to === '/'} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '0.375rem',
              padding: '0.375rem 0.75rem', borderRadius: 'var(--radius)',
              backgroundColor: isActive ? 'var(--accent)' : 'transparent',
              color: isActive ? 'var(--foreground)' : 'var(--muted-foreground)',
              fontSize: '0.875rem', fontWeight: isActive ? 500 : 400,
              textDecoration: 'none', transition: 'all 150ms',
            })}>
              <Icon size={15} />{label}
            </NavLink>
          ))}
        </div>

        <button onClick={() => navigate('/account')} title="Account" style={{
          width: '32px', height: '32px', borderRadius: '50%',
          backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)',
          border: 'none', cursor: 'pointer', fontSize: '0.6875rem',
          fontWeight: 600, display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontFamily: 'var(--font-family-base)',
        }}>
          {initials}
        </button>
      </header>

      {/* Page content */}
      <main style={{
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        padding: '1.25rem',
        gap: '1rem',
        overflow: 'hidden',
      }}>
        {children}
      </main>
    </div>
  )
}