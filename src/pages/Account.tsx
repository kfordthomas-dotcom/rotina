import React, { useState } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { supabase } from '@/lib/supabase'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { entities } from '@/api/supabaseClient'
import { format } from 'date-fns'
import { LogOut, CheckCircle2, Circle, Plus, GripVertical } from 'lucide-react'
import AppLayout from '@/components/AppLayout'
import { formatDuration } from '@/lib/calendarUtils'

export default function Account() {
  const { user, logout } = useAuth()
  const queryClient = useQueryClient()
  const [newPassword, setNewPassword] = useState('')
  const [passwordMsg, setPasswordMsg] = useState('')
  const [newTaskName, setNewTaskName] = useState('')
  const currentMonth = format(new Date(), 'MMMM yyyy')
  const currentMonthPrefix = format(new Date(), 'yyyy-MM')

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => entities.Task.list(),
  })

  // Personal tasks only — no client, no project, not a retainer deliverable
  const personalTasks = (tasks as any[]).filter((t: any) =>
    !t.project_id && !t.client_id && !t.is_retainer_deliverable
  )

  const completedThisMonth = personalTasks.filter((t: any) =>
    t.status === 'completed' &&
    t.updated_at?.startsWith(currentMonthPrefix)
  )

  const activeTasks = personalTasks.filter((t: any) => t.status !== 'completed')

  const createTask = useMutation({
    mutationFn: () => entities.Task.create({
      name: newTaskName,
      status: 'backlog',
      scheduled_hours: 0,
      estimated_hours: 1,
      priority: 'medium',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      setNewTaskName('')
    },
  })

  const toggleTask = useMutation({
    mutationFn: (task: any) => entities.Task.update(task.id, {
      status: task.status === 'completed' ? 'backlog' : 'completed',
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  })

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      setPasswordMsg(error.message)
    } else {
      setPasswordMsg('Password updated successfully.')
      setNewPassword('')
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.5rem 0.75rem',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--border)',
    backgroundColor: 'var(--background)',
    color: 'var(--foreground)',
    fontSize: '0.875rem',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'var(--font-family-base)',
  }

  const cardStyle: React.CSSProperties = {
    backgroundColor: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '1.5rem',
    boxShadow: 'var(--shadow)',
  }

  return (
    <AppLayout>
      <div style={{ maxWidth: '680px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem', overflowY: 'auto', paddingBottom: '2rem' }}>

        {/* Profile */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-foreground)', fontSize: '1rem', fontWeight: 600 }}>
                {user?.email?.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: 600, color: 'var(--foreground)', fontSize: '0.9375rem' }}>{user?.email}</p>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>Account</p>
              </div>
            </div>
            <button onClick={logout} style={{
              display: 'flex', alignItems: 'center', gap: '0.375rem',
              padding: '0.375rem 0.875rem', borderRadius: 'var(--radius)',
              border: '1px solid var(--border)', backgroundColor: 'transparent',
              color: 'var(--muted-foreground)', fontSize: '0.8125rem', cursor: 'pointer',
              fontFamily: 'var(--font-family-base)',
            }}>
              <LogOut size={14} /> Sign out
            </button>
          </div>

          <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <p style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 600, color: 'var(--foreground)' }}>Change Password</p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <input
                type="password"
                placeholder="New password (min 8 characters)"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                minLength={8}
                required
                style={{ ...inputStyle, flex: 1 }}
              />
              <button type="submit" style={{
                padding: '0.5rem 1rem', borderRadius: 'var(--radius)', border: 'none',
                backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)',
                fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer',
                fontFamily: 'var(--font-family-base)', flexShrink: 0,
              }}>Update</button>
            </div>
            {passwordMsg && <p style={{ margin: 0, fontSize: '0.75rem', color: passwordMsg.includes('success') ? 'var(--success)' : 'var(--error)' }}>{passwordMsg}</p>}
          </form>
        </div>

        {/* Personal tasks */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600, color: 'var(--foreground)', fontFamily: 'var(--font-family-heading)' }}>Personal Tasks</h2>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <input
              type="text"
              placeholder="Add a personal task..."
              value={newTaskName}
              onChange={e => setNewTaskName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && newTaskName.trim()) createTask.mutate() }}
              style={{ ...inputStyle, flex: 1 }}
            />
            <button
              onClick={() => { if (newTaskName.trim()) createTask.mutate() }}
              style={{
                width: '36px', height: '36px', borderRadius: 'var(--radius)', border: 'none',
                backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', flexShrink: 0,
              }}
            >
              <Plus size={16} />
            </button>
          </div>

          {activeTasks.length === 0 && completedThisMonth.length === 0 ? (
            <p style={{ fontSize: '0.8125rem', color: 'var(--muted-foreground)', textAlign: 'center', padding: '1rem 0' }}>No personal tasks yet.</p>
          ) : (
            <>
              {activeTasks.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '1rem' }}>
                  {activeTasks.map((task: any) => (
                    <div key={task.id}
                      draggable
                      onDragStart={(e) => { e.dataTransfer.setData('taskId', task.id); e.dataTransfer.effectAllowed = 'copy'; }}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', borderRadius: 'var(--radius)', transition: 'background-color 150ms', cursor: 'grab' }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--muted)')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <button onClick={() => toggleTask.mutate(task)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--muted-foreground)', display: 'flex', flexShrink: 0 }}>
                        <Circle size={15} />
                      </button>
                      <span style={{ flex: 1, fontSize: '0.875rem', color: 'var(--foreground)' }}>{task.name}</span>
                      <GripVertical size={13} style={{ color: 'var(--muted-foreground)', opacity: 0.4 }} />
                    </div>
                  ))}
                </div>
              )}

              {completedThisMonth.length > 0 && (
                <div>
                  <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.6875rem', fontWeight: 600, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Completed — {currentMonth}
                  </p>
                  {completedThisMonth.map((task: any) => (
                    <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 0.5rem', borderRadius: 'var(--radius)' }}>
                      <button onClick={() => toggleTask.mutate(task)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--success)', display: 'flex', flexShrink: 0 }}>
                        <CheckCircle2 size={15} />
                      </button>
                      <span style={{ flex: 1, fontSize: '0.875rem', color: 'var(--muted-foreground)', textDecoration: 'line-through' }}>{task.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AppLayout>
  )
}