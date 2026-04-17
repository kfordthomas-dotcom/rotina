import React, { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Login() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message)
      else setSuccess(true)
    }
    setLoading(false)
  }

  const inputStyle = {
    width: '100%',
    padding: '0.5rem 0.75rem',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--border)',
    backgroundColor: 'var(--background)',
    color: 'var(--foreground)',
    fontSize: '0.875rem',
    outline: 'none',
    boxSizing: 'border-box' as const,
    fontFamily: 'var(--font-family-base)',
    transition: 'border-color 150ms',
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      backgroundColor: 'var(--background)',
      fontFamily: 'var(--font-family-base)',
    }}>
      {/* Left panel */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '3rem',
        backgroundColor: 'var(--sidebar)',
        borderRight: '1px solid var(--border)',
      }}>
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.625rem',
            marginBottom: '4rem',
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <span style={{
                color: 'var(--primary-foreground)',
                fontSize: '13px',
                fontFamily: 'var(--font-family-heading)',
                fontWeight: 700,
                letterSpacing: '-0.5px',
              }}>Ro</span>
            </div>
            <span style={{
              fontSize: '1rem',
              fontWeight: 600,
              fontFamily: 'var(--font-family-heading)',
              color: 'var(--foreground)',
              letterSpacing: '-0.02em',
            }}>Rotina</span>
          </div>

          <h1 style={{
            fontSize: '2.25rem',
            fontWeight: 700,
            fontFamily: 'var(--font-family-heading)',
            color: 'var(--foreground)',
            margin: '0 0 1rem 0',
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
          }}>
            Your work.<br />
            <span style={{ color: 'var(--muted-foreground)', fontWeight: 400 }}>Your rhythm.</span>
          </h1>
          <p style={{
            fontSize: '0.9375rem',
            color: 'var(--muted-foreground)',
            lineHeight: 1.6,
            maxWidth: '320px',
          }}>
            Calendar-first planning for freelancers and agencies. Clients, projects and personal life — all in one place.
          </p>
        </div>

        <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>
          © {new Date().getFullYear()} Rotina
        </p>
      </div>

      {/* Right panel */}
      <div style={{
        width: '420px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem',
        flexShrink: 0,
      }}>
        <div style={{ width: '100%', maxWidth: '340px' }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: 600,
            fontFamily: 'var(--font-family-heading)',
            color: 'var(--foreground)',
            margin: '0 0 0.375rem 0',
            letterSpacing: '-0.02em',
          }}>
            {mode === 'login' ? 'Welcome back.' : 'Create your account.'}
          </h2>
          <p style={{
            fontSize: '0.875rem',
            color: 'var(--muted-foreground)',
            margin: '0 0 1.75rem 0',
          }}>
            {mode === 'login' ? 'Sign in to your workspace.' : 'Get started for free.'}
          </p>

          {/* Mode toggle */}
          <div style={{
            display: 'flex',
            backgroundColor: 'var(--muted)',
            borderRadius: 'var(--radius)',
            padding: '3px',
            marginBottom: '1.5rem',
          }}>
            {(['login', 'register'] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setError(null); setSuccess(false) }} style={{
                flex: 1,
                padding: '0.4rem',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: mode === m ? 'var(--card)' : 'transparent',
                color: mode === m ? 'var(--foreground)' : 'var(--muted-foreground)',
                cursor: 'pointer',
                fontSize: '0.8125rem',
                fontWeight: mode === m ? 500 : 400,
                transition: 'all 150ms',
                boxShadow: mode === m ? 'var(--shadow)' : 'none',
                fontFamily: 'var(--font-family-base)',
              }}>
                {m === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {success ? (
            <div style={{
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--muted)',
              border: '1px solid var(--border)',
              textAlign: 'center',
            }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--foreground)', margin: 0 }}>
                Check your email to confirm your account.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, marginBottom: '0.375rem', color: 'var(--foreground)' }}>
                  Email
                </label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, marginBottom: '0.375rem', color: 'var(--foreground)' }}>
                  Password
                </label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} style={inputStyle} />
              </div>
              {error && (
                <p style={{ fontSize: '0.8125rem', color: 'var(--error)', margin: 0 }}>{error}</p>
              )}
              <button type="submit" disabled={loading} style={{
                padding: '0.5625rem',
                borderRadius: 'var(--radius)',
                border: 'none',
                backgroundColor: 'var(--primary)',
                color: 'var(--primary-foreground)',
                fontSize: '0.875rem',
                fontWeight: 500,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                transition: 'opacity 150ms',
                fontFamily: 'var(--font-family-base)',
                marginTop: '0.25rem',
              }}>
                {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
