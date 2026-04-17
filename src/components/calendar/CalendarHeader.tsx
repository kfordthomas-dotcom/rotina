import React from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { format } from 'date-fns'

export default function CalendarHeader({ currentDate, view, onViewChange, onNavigate, onToday, onNewBlock }: any) {
  const getTitle = () => {
    if (view === 'day') return format(currentDate, 'EEEE, MMMM d, yyyy')
    return format(currentDate, 'MMMM yyyy')
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexShrink: 0,
      marginBottom: '0.75rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <h1 style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          fontFamily: 'var(--font-family-heading)',
          color: 'var(--foreground)',
          margin: 0,
          letterSpacing: '-0.03em',
        }}>Calendar</h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          {(['prev', 'next'] as const).map(dir => (
            <button key={dir} onClick={() => onNavigate(dir)} style={{
              width: '28px', height: '28px', borderRadius: 'var(--radius)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--muted-foreground)',
            }}>
              {dir === 'prev' ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </button>
          ))}
        </div>

        <span style={{
          fontSize: '0.9375rem',
          fontWeight: 500,
          color: 'var(--foreground)',
          minWidth: '120px',
          textAlign: 'center',
        }}>{getTitle()}</span>

        <button onClick={onToday} style={{
          padding: '0.25rem 0.625rem',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          backgroundColor: 'var(--card)',
          color: 'var(--muted-foreground)',
          fontSize: '0.75rem',
          fontWeight: 500,
          cursor: 'pointer',
          fontFamily: 'var(--font-family-base)',
        }}>Today</button>

        <div style={{
          display: 'flex',
          backgroundColor: 'var(--muted)',
          borderRadius: 'var(--radius)',
          padding: '3px',
        }}>
          {['Day', 'Week', 'Month'].map(v => (
            <button key={v} onClick={() => onViewChange(v.toLowerCase())} style={{
              padding: '0.25rem 0.75rem',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: view === v.toLowerCase() ? 'var(--card)' : 'transparent',
              color: view === v.toLowerCase() ? 'var(--foreground)' : 'var(--muted-foreground)',
              fontSize: '0.75rem',
              fontWeight: view === v.toLowerCase() ? 500 : 400,
              cursor: 'pointer',
              boxShadow: view === v.toLowerCase() ? 'var(--shadow)' : 'none',
              fontFamily: 'var(--font-family-base)',
            }}>{v}</button>
          ))}
        </div>

        <button onClick={onNewBlock} style={{
          display: 'flex', alignItems: 'center', gap: '0.375rem',
          padding: '0.5rem 1rem',
          borderRadius: 'var(--radius)',
          border: 'none',
          backgroundColor: 'var(--primary)',
          color: 'var(--primary-foreground)',
          fontSize: '0.8125rem',
          fontWeight: 500,
          cursor: 'pointer',
          fontFamily: 'var(--font-family-base)',
        }}>
          <Plus size={14} /> New Event
        </button>
      </div>
    </div>
  )
}