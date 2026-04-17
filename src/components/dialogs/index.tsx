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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle className="text-base">{project?.id ? 'Edit Project' : 'New Project'}</DialogTitle></DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Project Name</Label>
            <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Project name" className="h-9" autoFocus />
          </div>
          {clients.length > 0 ? (
            <div className="space-y-1.5">
              <Label className="text-xs">Client</Label>
              <Select value={form.client_id || 'none'} onValueChange={v => {
                const c = clients.find((cl: any) => cl.id === v);
                setForm({ ...form, client_id: v === 'none' ? '' : v, client: (c as any)?.name || '' });
              }}>
                <SelectTrigger className="h-9"><SelectValue placeholder="No client" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No client</SelectItem>
                  {clients.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label className="text-xs">Client (optional)</Label>
              <Input value={form.client} onChange={e => setForm({ ...form, client: e.target.value })} placeholder="Client name" className="h-9" />
            </div>
          )}
          <div className="space-y-1.5">
            <Label className="text-xs">Colour</Label>
            <div className="flex gap-2 flex-wrap">
              {PROJECT_COLORS.map(c => (
                <button key={c} onClick={() => setForm({ ...form, color: c })}
                  className={`w-7 h-7 rounded-full transition-all ${form.color === c ? 'ring-2 ring-offset-2 ring-primary scale-110' : 'hover:scale-105'}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Description</Label>
            <Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Brief description" className="h-9" />
          </div>
        </div>
        <DialogFooter className="flex justify-between">
          <div>{project?.id && <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => onDelete(project.id)}><Trash2 className="w-4 h-4 mr-1" /> Delete</Button>}</div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button size="sm" onClick={() => onSave({ ...form, name: form.name || 'Untitled Project' })}>Save</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ProjectDialog;

// ─── TaskDialog ───────────────────────────────────────────────────────────

export function TaskDialog({ open, onOpenChange, task, projects, defaultProjectId, defaultClientId, isRetainerDeliverable, onSave, onDelete }: any) {
  const [form, setForm] = useState({ name: '', estimated_hours: 1, project_id: '', assigned_to: '', priority: 'medium', due_date: '' });

  useEffect(() => {
    if (task) {
      setForm({ name: task.name || '', estimated_hours: task.estimated_hours || 1, project_id: task.project_id || defaultProjectId || '', assigned_to: task.assigned_to || '', priority: task.priority || 'medium', due_date: task.due_date || '' });
    } else {
      setForm({ name: '', estimated_hours: 1, project_id: defaultProjectId || '', assigned_to: '', priority: 'medium', due_date: '' });
    }
  }, [task, open, defaultProjectId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle className="text-base">{task?.id ? 'Edit Task' : isRetainerDeliverable ? 'New Deliverable' : 'New Task'}</DialogTitle></DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Task Name</Label>
            <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="What needs to be done?" className="h-9" autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Estimated Hours</Label>
              <Input type="number" min="0.25" step="0.25" value={form.estimated_hours} onChange={e => setForm({ ...form, estimated_hours: parseFloat(e.target.value) || 1 })} className="h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Priority</Label>
              <Select value={form.priority} onValueChange={v => setForm({ ...form, priority: v })}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {!isRetainerDeliverable && (
            <div className="space-y-1.5">
              <Label className="text-xs">Project</Label>
              <Select value={form.project_id || 'none'} onValueChange={v => setForm({ ...form, project_id: v === 'none' ? '' : v })}>
                <SelectTrigger className="h-9"><SelectValue placeholder="No project" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No project</SelectItem>
                  {(projects as any[]).map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Due Date</Label>
              <Input type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} className="h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Assign To</Label>
              <Input value={form.assigned_to} onChange={e => setForm({ ...form, assigned_to: e.target.value })} placeholder="user@email.com" className="h-9" />
            </div>
          </div>
        </div>
        <DialogFooter className="flex justify-between">
          <div>{task?.id && <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => onDelete(task.id)}><Trash2 className="w-4 h-4 mr-1" /> Delete</Button>}</div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button size="sm" onClick={() => onSave({ ...form, name: form.name || 'Untitled Task' })}>Save</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── TimeBlockDialog ──────────────────────────────────────────────────────

const HOURS_OPTIONS = Array.from({ length: 48 }, (_, i) => i * 0.5);
const EVENT_TYPES = [
  { value: 'task', label: 'Task' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'personal', label: 'Personal' },
  { value: 'admin', label: 'Admin' },
  { value: 'other', label: 'Other' },
];

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle className="text-base">{block?.id ? 'Edit Block' : 'New Block'}</DialogTitle></DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Type</Label>
            <div className="flex gap-1.5 flex-wrap">
              {EVENT_TYPES.map(et => (
                <button key={et.value} onClick={() => setForm({ ...form, event_type: et.value })}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${form.event_type === et.value ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:border-primary/50'}`}>
                  {et.label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Title</Label>
            <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder={isNonTask ? 'Event title' : 'What are you working on?'} className="h-9" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Date</Label>
              <Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Duration (hours)</Label>
              <Input type="number" min="0.25" step="0.25" value={form.duration_hours} onChange={e => setForm({ ...form, duration_hours: parseFloat(e.target.value) || 0.5 })} className="h-9" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Start Time</Label>
            <Select value={String(form.start_hour)} onValueChange={v => setForm({ ...form, start_hour: parseFloat(v) })}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>{HOURS_OPTIONS.map(h => <SelectItem key={h} value={String(h)}>{formatHour(h)}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          {!isNonTask && (
            <div className="space-y-1.5">
              <Label className="text-xs">Link to Task (optional)</Label>
              <Select value={form.task_id || 'none'} onValueChange={v => handleTaskChange(v === 'none' ? '' : v)}>
                <SelectTrigger className="h-9"><SelectValue placeholder="No task" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No task</SelectItem>
                  {(tasks as any[]).map((t: any) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
          {!isNonTask && (
            <div className="space-y-1.5">
              <Label className="text-xs">Project (optional)</Label>
              <Select value={form.project_id || 'none'} onValueChange={v => setForm({ ...form, project_id: v === 'none' ? '' : v })}>
                <SelectTrigger className="h-9"><SelectValue placeholder="No project" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No project</SelectItem>
                  {(projects as any[]).map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <DialogFooter className="flex justify-between">
          <div>{block?.id && <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => onDelete(block.id)}><Trash2 className="w-4 h-4 mr-1" /> Delete</Button>}</div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button size="sm" onClick={() => onSave({ ...form, title: form.title || 'Untitled' })}>Save</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── RecurringTaskDialog ──────────────────────────────────────────────────

export function RecurringTaskDialog({ open, onOpenChange, recurringTask, projects, onSave }: any) {
  const [form, setForm] = useState({ name: '', estimated_hours: 1, frequency: 'weekly', project_id: '', assigned_to: '', priority: 'medium' });

  useEffect(() => {
    if (recurringTask) {
      setForm({ name: recurringTask.name || '', estimated_hours: recurringTask.estimated_hours || 1, frequency: recurringTask.frequency || 'weekly', project_id: recurringTask.project_id || '', assigned_to: recurringTask.assigned_to || '', priority: recurringTask.priority || 'medium' });
    } else {
      setForm({ name: '', estimated_hours: 1, frequency: 'weekly', project_id: '', assigned_to: '', priority: 'medium' });
    }
  }, [recurringTask, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle className="text-base">{recurringTask?.id ? 'Edit Recurring Task' : 'New Recurring Task'}</DialogTitle></DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Name</Label>
            <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Weekly report" className="h-9" autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Hours per occurrence</Label>
              <Input type="number" min="0.25" step="0.25" value={form.estimated_hours} onChange={e => setForm({ ...form, estimated_hours: parseFloat(e.target.value) || 1 })} className="h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Frequency</Label>
              <Select value={form.frequency} onValueChange={v => setForm({ ...form, frequency: v })}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="biweekly">Biweekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Project</Label>
            <Select value={form.project_id || 'none'} onValueChange={v => setForm({ ...form, project_id: v === 'none' ? '' : v })}>
              <SelectTrigger className="h-9"><SelectValue placeholder="No project" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No project</SelectItem>
                {(projects as any[]).map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button size="sm" onClick={() => onSave({ ...form, name: form.name || 'Untitled Recurring', active: true })}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── ProjectsPanel ────────────────────────────────────────────────────────

export function ProjectsPanel({ open, onOpenChange, projects, tasks, recurringTasks, onNewProject, onEditProject, onNewRecurring, onEditRecurring, onDeleteRecurring, onGenerateRecurring }: any) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[420px] sm:max-w-[420px] p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="text-base">Projects & Recurring</SheetTitle>
        </SheetHeader>
        <Tabs defaultValue="projects" className="flex flex-col h-[calc(100%-57px)]">
          <TabsList className="mx-4 mt-2 grid grid-cols-2 w-auto">
            <TabsTrigger value="projects" className="text-xs">Projects</TabsTrigger>
            <TabsTrigger value="recurring" className="text-xs">Recurring</TabsTrigger>
          </TabsList>
          <TabsContent value="projects" className="flex-1 overflow-hidden mt-0">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-2">
                {(projects as any[]).map((project: any) => {
                  const projectTasks = (tasks as any[]).filter((t: any) => t.project_id === project.id);
                  const totalHours = projectTasks.reduce((s: number, t: any) => s + (t.estimated_hours || 0), 0);
                  const scheduledHours = projectTasks.reduce((s: number, t: any) => s + (t.scheduled_hours || 0), 0);
                  return (
                    <div key={project.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors group">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: project.color || '#6C5CE7' }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{project.name}</p>
                        <div className="flex items-center gap-3 mt-0.5">
                          {project.client && <span className="text-[10px] text-muted-foreground">{project.client}</span>}
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />{formatDuration(scheduledHours)} / {formatDuration(totalHours)}
                          </span>
                          <Badge variant="secondary" className="text-[10px] h-4 px-1.5">{projectTasks.length} tasks</Badge>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100" onClick={() => onEditProject(project)}>
                        <Pencil className="w-3 h-3" />
                      </Button>
                    </div>
                  );
                })}
                <Button variant="outline" size="sm" className="w-full text-xs gap-1.5 mt-2" onClick={onNewProject}>
                  <Plus className="w-3.5 h-3.5" /> New Project
                </Button>
              </div>
            </ScrollArea>
          </TabsContent>
          <TabsContent value="recurring" className="flex-1 overflow-hidden mt-0">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-2">
                {(recurringTasks as any[]).map((rt: any) => {
                  const project = (projects as any[]).find((p: any) => p.id === rt.project_id);
                  return (
                    <div key={rt.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors group">
                      {project && <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: project.color || '#6C5CE7' }} />}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{rt.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="secondary" className="text-[10px] h-4 px-1.5 capitalize">{rt.frequency}</Badge>
                          <span className="text-[10px] text-muted-foreground">{formatDuration(rt.estimated_hours)}</span>
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onGenerateRecurring(rt)}><RefreshCw className="w-3 h-3" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEditRecurring(rt)}><Pencil className="w-3 h-3" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => onDeleteRecurring(rt.id)}><Trash2 className="w-3 h-3" /></Button>
                      </div>
                    </div>
                  );
                })}
                <Button variant="outline" size="sm" className="w-full text-xs gap-1.5 mt-2" onClick={onNewRecurring}>
                  <Plus className="w-3.5 h-3.5" /> New Recurring Task
                </Button>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
