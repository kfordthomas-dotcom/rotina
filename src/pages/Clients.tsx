import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { entities } from '@/api/supabaseClient';
import { format, subMonths } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Plus, Users, GripVertical, CheckCircle2, Circle, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDuration } from '@/lib/calendarUtils';
import ClientDialog from '@/components/dialogs/ClientDialog';
import TaskDialog from '@/components/dialogs/TaskDialog';
import AppLayout from '@/components/AppLayout';

export default function Clients() {
  const queryClient = useQueryClient();
  const [clientDialog, setClientDialog] = useState<any>({ open: false, client: null });
  const [taskDialog, setTaskDialog] = useState<any>({ open: false, task: null, clientId: null });
  const [selectedClient, setSelectedClient] = useState<any>(null);

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => entities.Client.filter({ status: 'active' }),
  });
  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => entities.Project.filter({ status: 'active' }),
  });
  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => entities.Task.list(),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['clients'] });
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
    queryClient.invalidateQueries({ queryKey: ['projects'] });
  };

  const saveClient = useMutation({
    mutationFn: async ({ id, data }: any) => {
      if (id) return entities.Client.update(id, data);
      return entities.Client.create({ ...data, status: 'active' });
    },
    onSuccess: (result: any) => {
      invalidate();
      setClientDialog({ open: false, client: null });
      if (!clientDialog.client?.id) setSelectedClient(result);
    },
  });

  const saveTask = useMutation({
    mutationFn: async ({ id, data }: any) => {
      if (id) return entities.Task.update(id, data);
      return entities.Task.create({ ...data, status: 'backlog', scheduled_hours: 0 });
    },
    onSuccess: () => { invalidate(); setTaskDialog({ open: false, task: null, clientId: null }); },
  });

  const deleteTask = useMutation({
    mutationFn: (id: string) => entities.Task.delete(id),
    onSuccess: () => { invalidate(); setTaskDialog({ open: false, task: null, clientId: null }); },
  });

  const toggleTaskStatus = useMutation({
    mutationFn: async (task: any) => {
      const next = task.status === 'completed' ? 'backlog' : 'completed';
      return entities.Task.update(task.id, { status: next });
    },
    onSuccess: () => invalidate(),
  });

  const retainerClients = (clients as any[]).filter((c: any) => c.is_retainer);
  const regularClients = (clients as any[]).filter((c: any) => !c.is_retainer);
  const activeClient = selectedClient ? (clients as any[]).find((c: any) => c.id === selectedClient.id) || selectedClient : null;

  const getClientTasks = (clientId: string) =>
    (tasks as any[]).filter((t: any) => t.client_id === clientId);

  const getClientProjects = (clientId: string) =>
    (projects as any[]).filter((p: any) => p.client_id === clientId);

  return (
    <AppLayout>
      <div style={{ display: 'flex', height: '100%', gap: '0', overflow: 'hidden' }}>
        {/* Client list sidebar */}
        <div style={{ width: '260px', flexShrink: 0, borderRight: '1px solid var(--border)', backgroundColor: 'var(--card)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: 'var(--foreground)' }}>Clients</h2>
            <button onClick={() => setClientDialog({ open: true, client: null })} style={{ width: '28px', height: '28px', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)' }}>
              <Plus size={15} />
            </button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
            {retainerClients.length > 0 && (
              <p style={{ padding: '0.25rem 0.5rem', fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted-foreground)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Star size={10} /> Retainer Clients
              </p>
            )}
            {retainerClients.map((client: any) => {
              const clientTasks = getClientTasks(client.id).filter((t: any) => t.retainer_month === format(new Date(), 'yyyy-MM'));
              const completed = clientTasks.filter((t: any) => t.status === 'completed').length;
              return (
                <button key={client.id} onClick={() => setSelectedClient(client)} style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '0.625rem',
                  padding: '0.5rem 0.625rem', borderRadius: 'var(--radius)', textAlign: 'left',
                  backgroundColor: selectedClient?.id === client.id ? 'var(--accent)' : 'transparent',
                  border: 'none', cursor: 'pointer', transition: 'background-color 150ms',
                }}
                  onMouseEnter={e => { if (selectedClient?.id !== client.id) e.currentTarget.style.backgroundColor = 'var(--muted)' }}
                  onMouseLeave={e => { if (selectedClient?.id !== client.id) e.currentTarget.style.backgroundColor = 'transparent' }}
                >
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: client.color || '#6C5CE7', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 500, color: 'var(--foreground)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{client.name}</p>
                    {client.company && <p style={{ margin: 0, fontSize: '0.6875rem', color: 'var(--muted-foreground)' }}>{client.company}</p>}
                  </div>
                  {clientTasks.length > 0 && <span style={{ fontSize: '0.6875rem', color: 'var(--muted-foreground)', flexShrink: 0 }}>{completed}/{clientTasks.length}</span>}
                </button>
              );
            })}
            {regularClients.length > 0 && (
              <p style={{ padding: '0.5rem 0.5rem 0.25rem', fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted-foreground)', fontWeight: 600, marginTop: '0.5rem' }}>Clients</p>
            )}
            {regularClients.map((client: any) => (
              <button key={client.id} onClick={() => setSelectedClient(client)} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '0.625rem',
                padding: '0.5rem 0.625rem', borderRadius: 'var(--radius)', textAlign: 'left',
                backgroundColor: selectedClient?.id === client.id ? 'var(--accent)' : 'transparent',
                border: 'none', cursor: 'pointer', transition: 'background-color 150ms',
              }}
                onMouseEnter={e => { if (selectedClient?.id !== client.id) e.currentTarget.style.backgroundColor = 'var(--muted)' }}
                onMouseLeave={e => { if (selectedClient?.id !== client.id) e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: client.color || '#6C5CE7', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 500, color: 'var(--foreground)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{client.name}</p>
                  {client.company && <p style={{ margin: 0, fontSize: '0.6875rem', color: 'var(--muted-foreground)' }}>{client.company}</p>}
                </div>
              </button>
            ))}
            {(clients as any[]).length === 0 && (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <p style={{ fontSize: '0.8125rem', color: 'var(--muted-foreground)', marginBottom: '0.5rem' }}>No clients yet</p>
                <button onClick={() => setClientDialog({ open: true, client: null })} style={{ fontSize: '0.8125rem', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer' }}>Add your first client</button>
              </div>
            )}
          </div>
        </div>

        {/* Client detail */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {activeClient ? (
            <ClientDetail
              client={activeClient}
              projects={getClientProjects(activeClient.id)}
              tasks={tasks}
              onEdit={() => setClientDialog({ open: true, client: activeClient })}
              onNewTask={(clientId: string) => setTaskDialog({ open: true, task: null, clientId })}
              onEditTask={(task: any) => setTaskDialog({ open: true, task, clientId: task.client_id })}
              onToggleTask={(task: any) => toggleTaskStatus.mutate(task)}
            />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--muted-foreground)' }}>
              <div style={{ textAlign: 'center' }}>
                <Users size={48} style={{ margin: '0 auto 0.75rem', opacity: 0.2 }} />
                <p style={{ fontSize: '0.875rem' }}>Select a client to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <ClientDialog
        open={clientDialog.open}
        onOpenChange={(open: boolean) => setClientDialog({ open, client: open ? clientDialog.client : null })}
        client={clientDialog.client}
        onSave={(data: any) => saveClient.mutate({ id: clientDialog.client?.id, data })}
        onDelete={(id: string) => {
          entities.Client.delete(id).then(() => {
            invalidate();
            setClientDialog({ open: false, client: null });
            setSelectedClient(null);
          });
        }}
      />
      <TaskDialog
        open={taskDialog.open}
        onOpenChange={(open: boolean) => setTaskDialog({ open, task: open ? taskDialog.task : null, clientId: open ? taskDialog.clientId : null })}
        task={taskDialog.task}
        projects={projects}
        defaultClientId={taskDialog.clientId}
        isRetainerDeliverable={true}
        onSave={(data: any) => saveTask.mutate({
          id: taskDialog.task?.id,
          data: { ...data, client_id: taskDialog.clientId, is_retainer_deliverable: true, retainer_month: format(new Date(), 'yyyy-MM') }
        })}
        onDelete={(id: string) => deleteTask.mutate(id)}
      />
    </AppLayout>
  );
}

function ClientDetail({ client, projects, tasks, onEdit, onNewTask, onEditTask, onToggleTask }: any) {
  const [viewMonth, setViewMonth] = useState(new Date());
  const monthKey = format(viewMonth, 'yyyy-MM');
  const monthLabel = format(viewMonth, 'MMMM yyyy');

  const retainerTasks = (tasks as any[]).filter((t: any) =>
    t.client_id === client.id && t.is_retainer_deliverable && t.retainer_month === monthKey
  );
  const otherTasks = (tasks as any[]).filter((t: any) =>
    t.client_id === client.id && !t.is_retainer_deliverable
  );
  const completedRetainer = retainerTasks.filter((t: any) => t.status === 'completed').length;
  const scheduled = retainerTasks.filter((t: any) => (t.scheduled_hours || 0) > 0).length;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--card)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: client.color || '#6C5CE7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600 }}>
              {client.name[0].toUpperCase()}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h1 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600, color: 'var(--foreground)', fontFamily: 'var(--font-family-heading)' }}>{client.name}</h1>
                {client.is_retainer && <span style={{ fontSize: '0.6875rem', padding: '0.125rem 0.5rem', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--secondary)', color: 'var(--secondary-foreground)', fontWeight: 500 }}>Retainer</span>}
              </div>
              {client.company && <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>{client.company}</p>}
            </div>
          </div>
          <button onClick={onEdit} style={{ padding: '0.375rem 0.875rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'transparent', color: 'var(--foreground)', fontSize: '0.8125rem', cursor: 'pointer', fontFamily: 'var(--font-family-base)' }}>Edit</button>
        </div>

        {client.is_retainer && (
          <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
            {[{ label: 'Deliverables', value: retainerTasks.length }, { label: 'Scheduled', value: scheduled }, { label: 'Completed', value: completedRetainer }].map((s: any) => (
              <div key={s.label} style={{ textAlign: 'center', padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--muted)' }}>
                <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--foreground)' }}>{s.value}</p>
                <p style={{ margin: 0, fontSize: '0.6875rem', color: 'var(--muted-foreground)' }}>{s.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* Retainer deliverables with month navigation */}
        {client.is_retainer && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600, color: 'var(--foreground)' }}>Monthly Deliverables</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <button onClick={() => setViewMonth(subMonths(viewMonth, 1))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', display: 'flex', padding: '2px' }}>
                    <ChevronLeft size={14} />
                  </button>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--muted-foreground)', minWidth: '100px', textAlign: 'center' }}>{monthLabel}</span>
                  <button onClick={() => setViewMonth(subMonths(viewMonth, -1))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', display: 'flex', padding: '2px' }}>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
              {monthKey === format(new Date(), 'yyyy-MM') && (
                <button onClick={() => onNewTask(client.id)} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.375rem 0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'transparent', color: 'var(--foreground)', fontSize: '0.8125rem', cursor: 'pointer', fontFamily: 'var(--font-family-base)' }}>
                  <Plus size={13} /> Add Deliverable
                </button>
              )}
            </div>

            {retainerTasks.length > 0 && (
              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: 'var(--muted-foreground)', marginBottom: '0.375rem' }}>
                  <span>Progress</span><span>{completedRetainer}/{retainerTasks.length}</span>
                </div>
                <div style={{ height: '6px', backgroundColor: 'var(--muted)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(completedRetainer / retainerTasks.length) * 100}%`, backgroundColor: 'var(--primary)', borderRadius: '3px', transition: 'width 300ms' }} />
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {retainerTasks.map((task: any) => (
                <TaskRow key={task.id} task={task} onToggle={onToggleTask} onEdit={onEditTask} />
              ))}
              {retainerTasks.length === 0 && (
                <p style={{ fontSize: '0.8125rem', color: 'var(--muted-foreground)', textAlign: 'center', padding: '1.5rem 0' }}>No deliverables for {monthLabel}.</p>
              )}
            </div>
          </div>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <div>
            <h2 style={{ margin: '0 0 0.75rem', fontSize: '0.9375rem', fontWeight: 600, color: 'var(--foreground)' }}>Projects</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {projects.map((p: any) => {
                const pTasks = (tasks as any[]).filter((t: any) => t.project_id === p.id);
                const done = pTasks.filter((t: any) => t.status === 'completed').length;
                return (
                  <div key={p.id} style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: p.color || '#6C5CE7' }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 500, color: 'var(--foreground)' }}>{p.name}</p>
                      <p style={{ margin: 0, fontSize: '0.6875rem', color: 'var(--muted-foreground)' }}>{done}/{pTasks.length} tasks done</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Other tasks */}
        {otherTasks.length > 0 && (
          <div>
            <h2 style={{ margin: '0 0 0.75rem', fontSize: '0.9375rem', fontWeight: 600, color: 'var(--foreground)' }}>Other Tasks</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {otherTasks.map((task: any) => (
                <TaskRow key={task.id} task={task} onToggle={onToggleTask} onEdit={onEditTask} />
              ))}
            </div>
          </div>
        )}

        {client.notes && (
          <div>
            <h2 style={{ margin: '0 0 0.5rem', fontSize: '0.9375rem', fontWeight: 600, color: 'var(--foreground)' }}>Notes</h2>
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>{client.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function TaskRow({ task, onToggle, onEdit }: any) {
  const done = task.status === 'completed';
  const scheduled = (task.scheduled_hours || 0) > 0;
  return (
    <div
      draggable
      onDragStart={(e) => { e.dataTransfer.setData('taskId', task.id); e.dataTransfer.effectAllowed = 'copy'; }}
      style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.5rem 0.625rem', borderRadius: 'var(--radius)', cursor: 'grab', transition: 'background-color 150ms' }}
      onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--muted)')}
      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
    >
      <button onClick={() => onToggle(task)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', flexShrink: 0, color: done ? 'var(--success)' : 'var(--muted-foreground)' }}>
        {done ? <CheckCircle2 size={15} /> : <Circle size={15} />}
      </button>
      <GripVertical size={13} style={{ color: 'var(--muted-foreground)', opacity: 0.3, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: '0.875rem', color: done ? 'var(--muted-foreground)' : 'var(--foreground)', textDecoration: done ? 'line-through' : 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.name}</p>
        {task.estimated_hours > 0 && <p style={{ margin: 0, fontSize: '0.6875rem', color: 'var(--muted-foreground)' }}>{formatDuration(task.estimated_hours)}</p>}
      </div>
      {scheduled && !done && <span style={{ fontSize: '0.625rem', padding: '0.125rem 0.375rem', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--secondary)', color: 'var(--secondary-foreground)', flexShrink: 0 }}>Scheduled</span>}
      <button onClick={() => onEdit(task)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', color: 'var(--muted-foreground)', opacity: 0, transition: 'opacity 150ms', flexShrink: 0, fontSize: '0.75rem' }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '0')}
      >•••</button>
    </div>
  );
}