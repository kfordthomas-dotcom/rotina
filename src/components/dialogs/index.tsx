import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trash2, Plus, Pencil, Clock, RefreshCw } from 'lucide-react';
import { PROJECT_COLORS, formatHour, formatDuration } from '@/lib/calendarUtils';

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.5rem 0.75rem',
  borderRadius: 'var(--radius)', border: '1px solid var(--border)',
  backgroundColor: 'var(--card)', color: 'var(--foreground)',
  fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box',
  fontFamily: 'var(--font-family-base)',
};

const labelStyle: React.CSSProperties = {
  fontSize: '0.75rem', fontWeight: 500, color: 'var(--muted-foreground)',
  display: 'block', marginBottom: '0.375rem',
};

const selectStyle: React.CSSProperties = {
  width: '100%', padding: '0.5rem 0.75rem',
  borderRadius: 'var(--radius)', border: '1px solid var(--border)',
  backgroundColor: 'var(--card)', color: 'var(--foreground)',
  fontSize: '0.875rem', outline: 'none', cursor: 'pointer',
  fontFamily: 'var(--font-family-base)', appearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B6B66' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center',
  paddingRight: '2.25rem',
};

// ─── Colour Picker ────────────────────────────────────────────────────────

function ColourPicker({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  const [hex, setHex] = useState(value || PROJECT_COLORS[0]);

  useEffect(() => { setHex(value || PROJECT_COLORS[0]); }, [value]);

  const handleHexChange = (v: string) => {
    setHex(v);
    if (/^#[0-9A-Fa-f]{6}$/.test(v)) onChange(v);
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '0.625rem' }}>
        {PROJECT_COLORS.map(c => (
          <button key={c} onClick={() => { setHex(c); onChange(c); }} style={{
            width: '26px', height: '26px', borderRadius: '50%', backgroundColor: c,
            border: value === c ? '2px solid var(--foreground)' : '2px solid transparent',
            outline: value === c ? '2px solid var(--card)' : 'none',
            outlineOffset: '-4px', cursor: 'pointer', transition: 'transform 150ms',
            transform: value === c ? 'scale(1.15)' : 'scale(1)',
          }} />
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius)', backgroundColor: hex, border: '1px solid var(--border)', flexShrink: 0 }} />
        <input
          type="text"
          value={hex}
          onChange={e => handleHexChange(e.target.value)}
          placeholder="#000000"
          style={{ ...inputStyle, flex: 1, fontFamily: 'var(--font-family-monospace)', fontSize: '0.8125rem' }}
        />
        <input type="color" value={hex} onChange={e => { setHex(e.target.value); onChange(e.target.value); }}
          style={{ width: '32px', height: '32px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', cursor: 'pointer', padding: '2px', backgroundColor: 'var(--card)' }} />
      </div>
    </div>
  );
}

// ─── Dialog wrapper ───────────────────────────────────────────────────────

function RotinaDialog({ open, onOpenChange, title, children, footer }: any) {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={() => onOpenChange(false)} style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)' }} />
      <div style={{ position: 'relative', backgroundColor: 'var(--card)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', width: '100%', maxWidth: '480px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', margin: '1rem' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600, color: 'var(--foreground)', fontFamily: 'var(--font-family-heading)' }}>{title}</h2>
          <button onClick={() => onOpenChange(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', fontSize: '1.25rem', lineHeight: 1, padding: '0.25rem' }}>×</button>
        </div>
        <div style={{ padding: '1.25rem 1.5rem', overflowY: 'auto', flex: 1 }}>{children}</div>
        {footer && <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>{footer}</div>}
      </div>
    </div>
  );
}

function Field({ label, children }: any) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

function Row({ children }: any) {
  return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>{children}</div>;
}

// ─── ProjectDialog ────────────────────────────────────────────────────────

export function ProjectDialog({ open, onOpenChange, project, clients = [], onSave, onDelete }: any) {
  const [form, setForm] = useState({ name: '', client_id: '', client: '', color: PROJECT_COLORS[0], description: '' });

  useEffect(() => {
    if (project) {
      setForm({ name: project.name || '', client_id: project.client_id || '', client: project.client || '', color: project.color || PROJECT_COLORS[0], description: project.description || '' });
    } else {
      setForm({ name: '', client_id: '', client: '', color: PROJECT_COLORS[Math.floor(Math.random() * PROJECT_COLORS.length)], description: '' });
    }
  }, [project, open]);

  return (
    <RotinaDialog open={open} onOpenChange={onOpenChange} title={project?.id ? 'Edit Project' : 'New Project'}
      footer={<>
        <div>{project?.id && <button onClick={() => onDelete(project.id)} style={{ color: 'var(--error)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Trash2 size={14} /> Delete</button>}</div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => onOpenChange(false)} style={{ ...inputStyle, width: 'auto', padding: '0.4rem 1rem', cursor: 'pointer' }}>Cancel</button>
          <button onClick={() => onSave({ ...form, name: form.name || 'Untitled Project' })} style={{ padding: '0.4rem 1rem', borderRadius: 'var(--radius)', border: 'none', backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)', fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-family-base)' }}>Save</button>
        </div>
      </>}
    >
      <Field label="Project Name">
        <input style={inputStyle} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Project name" autoFocus />
      </Field>
      {clients.length > 0 ? (
        <Field label="Client">
          <select style={selectStyle} value={form.client_id || ''} onChange={e => {
            const c = clients.find((cl: any) => cl.id === e.target.value);
            setForm({ ...form, client_id: e.target.value, client: c?.name || '' });
          }}>
            <option value="">No client</option>
            {clients.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>
      ) : (
        <Field label="Client (optional)">
          <input style={inputStyle} value={form.client} onChange={e => setForm({ ...form, client: e.target.value })} placeholder="Client name" />
        </Field>
      )}
      <Field label="Colour">
        <ColourPicker value={form.color} onChange={c => setForm({ ...form, color: c })} />
      </Field>
      <Field label="Description">
        <input style={inputStyle} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Brief description" />
      </Field>
    </RotinaDialog>
  );
}

export default ProjectDialog;

// ─── TaskDialog ───────────────────────────────────────────────────────────

export function TaskDialog({ open, onOpenChange, task, projects, clients = [], defaultProjectId, defaultClientId, isRetainerDeliverable, onSave, onDelete }: any) {
  const [form, setForm] = useState({ name: '', estimated_hours: 1, project_id: '', client_id: '', assigned_to: '', priority: 'medium', due_date: '', notes: '' });

  useEffect(() => {
    if (task) {
      setForm({ name: task.name || '', estimated_hours: task.estimated_hours || 1, project_id: task.project_id || defaultProjectId || '', client_id: task.client_id || defaultClientId || '', assigned_to: task.assigned_to || '', priority: task.priority || 'medium', due_date: task.due_date || '', notes: task.notes || '' });
    } else {
      setForm({ name: '', estimated_hours: 1, project_id: defaultProjectId || '', client_id: defaultClientId || '', assigned_to: '', priority: 'medium', due_date: '', notes: '' });
    }
  }, [task, open, defaultProjectId, defaultClientId]);

  return (
    <RotinaDialog open={open} onOpenChange={onOpenChange} title={task?.id ? 'Edit Task' : isRetainerDeliverable ? 'New Deliverable' : 'New Task'}
      footer={<>
        <div>{task?.id && <button onClick={() => onDelete(task.id)} style={{ color: 'var(--error)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Trash2 size={14} /> Delete</button>}</div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => onOpenChange(false)} style={{ ...inputStyle, width: 'auto', padding: '0.4rem 1rem', cursor: 'pointer' }}>Cancel</button>
          <button onClick={() => onSave({ ...form, name: form.name || 'Untitled Task' })} style={{ padding: '0.4rem 1rem', borderRadius: 'var(--radius)', border: 'none', backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)', fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-family-base)' }}>Save</button>
        </div>
      </>}
    >
      <Field label="Task Name">
        <input style={inputStyle} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="What needs to be done?" autoFocus />
      </Field>
      <Row>
        <div>
          <label style={labelStyle}>Estimated Hours</label>
          <input type="number" min="0.25" step="0.25" style={inputStyle} value={form.estimated_hours} onChange={e => setForm({ ...form, estimated_hours: parseFloat(e.target.value) || 1 })} />
        </div>
        <div>
          <label style={labelStyle}>Priority</label>
          <select style={selectStyle} value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </Row>
      {!isRetainerDeliverable && (
        <Row>
          <div>
            <label style={labelStyle}>Project</label>
            <select style={selectStyle} value={form.project_id || ''} onChange={e => setForm({ ...form, project_id: e.target.value })}>
              <option value="">No project</option>
              {(projects as any[]).map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Client</label>
            <select style={selectStyle} value={form.client_id || ''} onChange={e => setForm({ ...form, client_id: e.target.value })}>
              <option value="">No client</option>
              {(clients as any[]).map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </Row>
      )}
      <Row>
        <div>
          <label style={labelStyle}>Due Date</label>
          <input type="date" style={inputStyle} value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} />
        </div>
        <div>
          <label style={labelStyle}>Assign To</label>
          <input style={inputStyle} value={form.assigned_to} onChange={e => setForm({ ...form, assigned_to: e.target.value })} placeholder="user@email.com" />
        </div>
      </Row>
      <Field label="Notes">
        <textarea style={{ ...inputStyle, height: '80px', resize: 'vertical' } as any} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Any additional notes..." />
      </Field>
    </RotinaDialog>
  );
}

// ─── TimeBlockDialog ──────────────────────────────────────────────────────

const HOURS_OPTIONS = Array.from({ length: 48 }, (_, i) => i * 0.5);
const EVENT_TYPES = ['task', 'meeting', 'personal', 'admin', 'other'];

export function TimeBlockDialog({ open, onOpenChange, block, tasks, projects, onSave, onDelete }: any) {
  const [form, setForm] = useState({ title: '', date: '', start_hour: 9, duration_hours: 1, event_type: 'task', task_id: '', project_id: '', assigned_to: '', notes: '' });

  useEffect(() => {
    if (block) {
      setForm({ title: block.title || '', date: block.date || '', start_hour: block.start_hour ?? 9, duration_hours: block.duration_hours ?? 1, event_type: block.event_type || 'task', task_id: block.task_id || '', project_id: block.project_id || '', assigned_to: block.assigned_to || '', notes: block.notes || '' });
    }
  }, [block]);

  const handleTaskChange = (taskId: string) => {
    const task = (tasks as any[]).find((t: any) => t.id === taskId);
    setForm(prev => ({ ...prev, task_id: taskId, title: task ? task.name : prev.title, project_id: task?.project_id || prev.project_id, event_type: 'task' }));
  };

  const isNonTask = form.event_type !== 'task';

  return (
    <RotinaDialog open={open} onOpenChange={onOpenChange} title={block?.id ? 'Edit Block' : 'New Block'}
      footer={<>
        <div>{block?.id && <button onClick={() => onDelete(block.id)} style={{ color: 'var(--error)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Trash2 size={14} /> Delete</button>}</div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => onOpenChange(false)} style={{ ...inputStyle, width: 'auto', padding: '0.4rem 1rem', cursor: 'pointer' }}>Cancel</button>
          <button onClick={() => onSave({ ...form, title: form.title || 'Untitled' })} style={{ padding: '0.4rem 1rem', borderRadius: 'var(--radius)', border: 'none', backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)', fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-family-base)' }}>Save</button>
        </div>
      </>}
    >
      <Field label="Type">
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {EVENT_TYPES.map(et => (
            <button key={et} onClick={() => setForm({ ...form, event_type: et })} style={{
              padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer', textTransform: 'capitalize', fontFamily: 'var(--font-family-base)',
              border: form.event_type === et ? 'none' : '1px solid var(--border)',
              backgroundColor: form.event_type === et ? 'var(--primary)' : 'transparent',
              color: form.event_type === et ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
            }}>{et}</button>
          ))}
        </div>
      </Field>
      <Field label="Title">
        <input style={inputStyle} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder={isNonTask ? 'Event title' : 'What are you working on?'} />
      </Field>
      <Row>
        <div>
          <label style={labelStyle}>Date</label>
          <input type="date" style={inputStyle} value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
        </div>
        <div>
          <label style={labelStyle}>Duration (hours)</label>
          <input type="number" min="0.25" step="0.25" style={inputStyle} value={form.duration_hours} onChange={e => setForm({ ...form, duration_hours: parseFloat(e.target.value) || 0.5 })} />
        </div>
      </Row>
      <Field label="Start Time">
        <select style={selectStyle} value={String(form.start_hour)} onChange={e => setForm({ ...form, start_hour: parseFloat(e.target.value) })}>
          {HOURS_OPTIONS.map(h => <option key={h} value={String(h)}>{formatHour(h)}</option>)}
        </select>
      </Field>
      {!isNonTask && (
        <Field label="Link to Task (optional)">
          <select style={selectStyle} value={form.task_id || ''} onChange={e => handleTaskChange(e.target.value)}>
            <option value="">No task</option>
            {(tasks as any[]).map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </Field>
      )}
      {!isNonTask && (
        <Field label="Project (optional)">
          <select style={selectStyle} value={form.project_id || ''} onChange={e => setForm({ ...form, project_id: e.target.value })}>
            <option value="">No project</option>
            {(projects as any[]).map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </Field>
      )}
      <Row>
        <div>
          <label style={labelStyle}>Assign To</label>
          <input style={inputStyle} value={form.assigned_to} onChange={e => setForm({ ...form, assigned_to: e.target.value })} placeholder="user@email.com" />
        </div>
      </Row>
      <Field label="Notes">
        <textarea style={{ ...inputStyle, height: '72px', resize: 'vertical' } as any} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Notes about this block..." />
      </Field>
    </RotinaDialog>
  );
}

// ─── RecurringTaskDialog ──────────────────────────────────────────────────

export function RecurringTaskDialog({ open, onOpenChange, recurringTask, projects, onSave }: any) {
  const [form, setForm] = useState({ name: '', estimated_hours: 1, frequency: 'monthly', project_id: '', assigned_to: '', priority: 'medium' });

  useEffect(() => {
    if (recurringTask) {
      setForm({ name: recurringTask.name || '', estimated_hours: recurringTask.estimated_hours || 1, frequency: recurringTask.frequency || 'monthly', project_id: recurringTask.project_id || '', assigned_to: recurringTask.assigned_to || '', priority: recurringTask.priority || 'medium' });
    } else {
      setForm({ name: '', estimated_hours: 1, frequency: 'monthly', project_id: '', assigned_to: '', priority: 'medium' });
    }
  }, [recurringTask, open]);

  return (
    <RotinaDialog open={open} onOpenChange={onOpenChange} title={recurringTask?.id ? 'Edit Recurring Task' : 'New Recurring Task'}
      footer={<>
        <div />
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => onOpenChange(false)} style={{ ...inputStyle, width: 'auto', padding: '0.4rem 1rem', cursor: 'pointer' }}>Cancel</button>
          <button onClick={() => onSave({ ...form, name: form.name || 'Untitled Recurring', active: true })} style={{ padding: '0.4rem 1rem', borderRadius: 'var(--radius)', border: 'none', backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)', fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-family-base)' }}>Save</button>
        </div>
      </>}
    >
      <Field label="Name">
        <input style={inputStyle} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Monthly report" autoFocus />
      </Field>
      <Row>
        <div>
          <label style={labelStyle}>Hours per occurrence</label>
          <input type="number" min="0.25" step="0.25" style={inputStyle} value={form.estimated_hours} onChange={e => setForm({ ...form, estimated_hours: parseFloat(e.target.value) || 1 })} />
        </div>
        <div>
          <label style={labelStyle}>Frequency</label>
          <select style={selectStyle} value={form.frequency} onChange={e => setForm({ ...form, frequency: e.target.value })}>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="biweekly">Biweekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
      </Row>
      <Field label="Project">
        <select style={selectStyle} value={form.project_id || ''} onChange={e => setForm({ ...form, project_id: e.target.value })}>
          <option value="">No project</option>
          {(projects as any[]).map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </Field>
      <Field label="Assign To">
        <input style={inputStyle} value={form.assigned_to} onChange={e => setForm({ ...form, assigned_to: e.target.value })} placeholder="user@email.com" />
      </Field>
    </RotinaDialog>
  );
}

// ─── ProjectsPanel ────────────────────────────────────────────────────────

export function ProjectsPanel({ open, onOpenChange, projects, tasks, recurringTasks, onNewProject, onEditProject, onNewRecurring, onEditRecurring, onDeleteRecurring, onGenerateRecurring }: any) {
  const [tab, setTab] = useState('projects');
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', justifyContent: 'flex-end' }}>
      <div onClick={() => onOpenChange(false)} style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)' }} />
      <div style={{ position: 'relative', backgroundColor: 'var(--card)', width: '420px', height: '100%', display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600, color: 'var(--foreground)', fontFamily: 'var(--font-family-heading)' }}>Projects & Recurring</h2>
          <button onClick={() => onOpenChange(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', fontSize: '1.25rem' }}>×</button>
        </div>
        <div style={{ display: 'flex', gap: '2px', padding: '0.75rem', borderBottom: '1px solid var(--border)' }}>
          {['projects', 'recurring'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: '0.375rem', borderRadius: 'var(--radius)', border: 'none', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: tab === t ? 500 : 400, textTransform: 'capitalize', fontFamily: 'var(--font-family-base)',
              backgroundColor: tab === t ? 'var(--accent)' : 'transparent',
              color: tab === t ? 'var(--foreground)' : 'var(--muted-foreground)',
            }}>{t}</button>
          ))}
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
          {tab === 'projects' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {(projects as any[]).map((project: any) => {
                const projectTasks = (tasks as any[]).filter((t: any) => t.project_id === project.id);
                const totalHours = projectTasks.reduce((s: number, t: any) => s + (t.estimated_hours || 0), 0);
                const scheduledHours = projectTasks.reduce((s: number, t: any) => s + (t.scheduled_hours || 0), 0);
                return (
                  <div key={project.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', backgroundColor: 'var(--card)' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: project.color || '#6C5CE7', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 500, color: 'var(--foreground)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{project.name}</p>
                      <p style={{ margin: 0, fontSize: '0.6875rem', color: 'var(--muted-foreground)' }}>{project.client && `${project.client} · `}{formatDuration(scheduledHours)} / {formatDuration(totalHours)} · {projectTasks.length} tasks</p>
                    </div>
                    <button onClick={() => onEditProject(project)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', padding: '0.25rem' }}><Pencil size={13} /></button>
                  </div>
                );
              })}
              <button onClick={onNewProject} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem', padding: '0.625rem', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border)', backgroundColor: 'transparent', color: 'var(--muted-foreground)', fontSize: '0.8125rem', cursor: 'pointer', fontFamily: 'var(--font-family-base)', width: '100%' }}>
                <Plus size={14} /> New Project
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {(recurringTasks as any[]).map((rt: any) => {
                const project = (projects as any[]).find((p: any) => p.id === rt.project_id);
                return (
                  <div key={rt.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', backgroundColor: 'var(--card)' }}>
                    {project && <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: project.color || '#6C5CE7', flexShrink: 0 }} />}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 500, color: 'var(--foreground)' }}>{rt.name}</p>
                      <p style={{ margin: 0, fontSize: '0.6875rem', color: 'var(--muted-foreground)', textTransform: 'capitalize' }}>{rt.frequency} · {formatDuration(rt.estimated_hours)}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      <button onClick={() => onGenerateRecurring(rt)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', padding: '0.25rem' }}><RefreshCw size={13} /></button>
                      <button onClick={() => onEditRecurring(rt)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', padding: '0.25rem' }}><Pencil size={13} /></button>
                      <button onClick={() => onDeleteRecurring(rt.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error)', padding: '0.25rem' }}><Trash2 size={13} /></button>
                    </div>
                  </div>
                );
              })}
              <button onClick={onNewRecurring} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem', padding: '0.625rem', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border)', backgroundColor: 'transparent', color: 'var(--muted-foreground)', fontSize: '0.8125rem', cursor: 'pointer', fontFamily: 'var(--font-family-base)', width: '100%' }}>
                <Plus size={14} /> New Recurring Task
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}