import React, { useState } from 'react'
import { Plus, GripVertical, Clock, CheckCircle2, Circle, AlertCircle } from 'lucide-react'
import { formatDuration } from '@/lib/calendarUtils'
import { format } from 'date-fns'

export default function BacklogSidebar({ tasks, projects, clients, onNewTask, onToggleComplete }: any) {
  const [filter, setFilter] = useState<'all' | 'project' | 'retainer'>('all')
  const today = format(new Date(), 'yyyy-MM-dd')

  const overdueTasks = (tasks as any[]).filter((t: any) =>
    t.status !== 'completed' && t.due_date && t.due_date < today
  )

  const dueTodayTasks = (tasks as any[]).filter((t: any) =>
    t.status !== 'completed' && t.due_date === today
  )

  const backlogTasks = (tasks as any[]).filter((t: any) => {
    if (t.status === 'completed') return false
    if (t.due_date && t.due_date <= today) return false
    if (filter === 'project') return !t.is_retainer_deliverable
    if (filter === 'retainer') return t.is_retainer_deliverable
    return true
  })

  const TaskRow = ({ task, showDue = false }: any) => {
    const project = (projects as any[]).find((p: any) => p.id === task.project_id)
    const client = (clients as any[]).find((c: any) => c.id === task.client_id)
    const color = project?.color || client?.color || 'var(--chart-color-3)'
    const isOverdue = task.due_date && task.due_date < today

    return (
      <div
        draggable
        onDragStart={(e: React.DragEvent) => {
          e.dataTransfer.setData('taskId', task.id)
          e.dataTransfer.effectAllowed = 'copy'
        }}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.375rem 0.5rem', borderRadius: 'var(--radius)',
          cursor: 'grab', transition: 'background-color 150ms', userSelect: 'none',
        }}
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--muted)')}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
      >
        <button
          onClick={(e) => { e.stopPropagation(); onToggleComplete?.(task); }}
          style={{ flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--muted-foreground)', display: 'flex' }}
        >
          <Circle size={14} />
        </button>
        <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: color, flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--foreground)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {task.name}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '1px' }}>
            {project && <span style={{ fontSize: '0.6875rem', color: 'var(--muted-foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{project.name}</span>}
            {showDue && (
              <span style={{ fontSize: '0.6875rem', fontWeight: 500, color: isOverdue ? 'var(--error)' : 'var(--warning)' }}>
                {isOverdue ? 'Overdue' : 'Today'}
              </span>
            )}
            {task.estimated_hours > 0 && (
              <span style={{ fontSize: '0.6875rem', color: 'var(--muted-foreground)', display: 'flex', alignItems: 'center', gap: '2px', flexShrink: 0 }}>
                <Clock size={9} />{formatDuration(task.estimated_hours)}
              </span>
            )}
          </div>
        </div>
        <GripVertical size={12} style={{ color: 'var(--muted-foreground)', opacity: 0.4, flexShrink: 0 }} />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header - just filter pills + add button, no title */}
      <div style={{ padding: '0.75rem 0.875rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{ display: 'flex', gap: '3px', flex: 1 }}>
          {(['all', 'project', 'retainer'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              flex: 1, padding: '0.25rem 0', borderRadius: 'var(--radius-sm)', border: 'none',
              backgroundColor: filter === f ? 'var(--accent)' : 'transparent',
              color: filter === f ? 'var(--accent-foreground)' : 'var(--muted-foreground)',
              fontSize: '0.6875rem', fontWeight: filter === f ? 500 : 400,
              cursor: 'pointer', textTransform: 'capitalize', fontFamily: 'var(--font-family-base)',
            }}>{f}</button>
          ))}
        </div>
        <button onClick={onNewTask} style={{
          width: '22px', height: '22px', borderRadius: 'var(--radius-sm)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', flexShrink: 0,
        }}>
          <Plus size={13} />
        </button>
      </div>

      {/* Task list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
        {overdueTasks.length > 0 && (
          <div style={{ marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.5rem' }}>
              <AlertCircle size={10} style={{ color: 'var(--error)' }} />
              <span style={{ fontSize: '0.625rem', fontWeight: 600, color: 'var(--error)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Overdue</span>
            </div>
            {overdueTasks.map((task: any) => <TaskRow key={task.id} task={task} showDue />)}
          </div>
        )}

        {dueTodayTasks.length > 0 && (
          <div style={{ marginBottom: '0.75rem' }}>
            <div style={{ padding: '0.25rem 0.5rem' }}>
              <span style={{ fontSize: '0.625rem', fontWeight: 600, color: 'var(--warning)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Due Today</span>
            </div>
            {dueTodayTasks.map((task: any) => <TaskRow key={task.id} task={task} showDue />)}
          </div>
        )}

        {backlogTasks.length === 0 && overdueTasks.length === 0 && dueTodayTasks.length === 0 ? (
          <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', textAlign: 'center', padding: '2rem 0.5rem' }}>
            No unscheduled tasks. You're all caught up!
          </p>
        ) : (
          <div>
            {(overdueTasks.length > 0 || dueTodayTasks.length > 0) && backlogTasks.length > 0 && (
              <div style={{ padding: '0.25rem 0.5rem' }}>
                <span style={{ fontSize: '0.625rem', fontWeight: 600, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Unscheduled</span>
              </div>
            )}
            {backlogTasks.map((task: any) => <TaskRow key={task.id} task={task} />)}
          </div>
        )}
      </div>
    </div>
  )
}