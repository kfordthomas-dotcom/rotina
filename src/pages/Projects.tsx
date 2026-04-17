import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { entities } from '@/api/supabaseClient';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, GripVertical, CheckCircle2, Circle, Clock, Pencil, FolderOpen } from 'lucide-react';
import { formatDuration } from '@/lib/calendarUtils';
import ProjectDialog from '@/components/dialogs/ProjectDialog';
import TaskDialog from '@/components/dialogs/TaskDialog';
import AppLayout from '@/components/AppLayout';

export default function Projects() {
  const queryClient = useQueryClient();
  const [projectDialog, setProjectDialog] = useState({ open: false, project: null });
  const [taskDialog, setTaskDialog] = useState({ open: false, task: null, projectId: null });
  const [selectedProject, setSelectedProject] = useState(null);

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => entities.Project.filter({ status: 'active' }),
  });
  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => entities.Client.list(),
  });
  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => entities.Task.list('-created_date', 500),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['projects'] });
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
  };

  const saveProject = useMutation({
    mutationFn: async ({ id, data }: any) => {
      if (id) return entities.Project.update(id, data);
      return entities.Project.create({ ...data, status: 'active' });
    },
    onSuccess: () => { invalidate(); setProjectDialog({ open: false, project: null }); },
  });

  const deleteProject = useMutation({
    mutationFn: (id: string) => entities.Project.delete(id),
    onSuccess: () => { invalidate(); setProjectDialog({ open: false, project: null }); setSelectedProject(null); },
  });

  const saveTask = useMutation({
    mutationFn: async ({ id, data }: any) => {
      if (id) return entities.Task.update(id, data);
      return entities.Task.create({ ...data, status: 'backlog', scheduled_hours: 0 });
    },
    onSuccess: () => { invalidate(); setTaskDialog({ open: false, task: null, projectId: null }); },
  });

  const deleteTask = useMutation({
    mutationFn: (id: string) => entities.Task.delete(id),
    onSuccess: () => { invalidate(); setTaskDialog({ open: false, task: null, projectId: null }); },
  });

  const toggleTaskStatus = useMutation({
    mutationFn: async (task: any) => {
      const next = task.status === 'completed' ? 'backlog' : 'completed';
      return entities.Task.update(task.id, { status: next });
    },
    onSuccess: () => invalidate(),
  });

  const activeProject = selectedProject ? (projects as any[]).find(p => p.id === (selectedProject as any).id) : null;
  const projectTasks = activeProject ? (tasks as any[]).filter(t => t.project_id === activeProject.id) : [];
  const completedTasks = projectTasks.filter(t => t.status === 'completed');
  const scheduledTasks = projectTasks.filter(t => (t.scheduled_hours || 0) > 0);
  const totalHours = projectTasks.reduce((s, t) => s + (t.estimated_hours || 0), 0);
  const scheduledHours = projectTasks.reduce((s, t) => s + (t.scheduled_hours || 0), 0);

  return (
    <AppLayout>
      <div className="flex h-full">
        <div className="w-72 border-r bg-card flex flex-col">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="text-sm font-semibold">Projects</h2>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setProjectDialog({ open: true, project: null })}>
              <Plus className="w-3.5 h-3.5" />
            </Button>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-1">
              {(projects as any[]).map(project => {
                const pTasks = (tasks as any[]).filter(t => t.project_id === project.id);
                const done = pTasks.filter(t => t.status === 'completed').length;
                const client = (clients as any[]).find(c => c.id === project.client_id);
                return (
                  <button
                    key={project.id}
                    onClick={() => setSelectedProject(project)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg text-left transition-colors ${(selectedProject as any)?.id === project.id ? 'bg-accent' : 'hover:bg-muted'}`}
                  >
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: project.color || '#6C5CE7' }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{project.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{client?.name || project.client || 'No client'}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground">{done}/{pTasks.length}</span>
                  </button>
                );
              })}
              {(projects as any[]).length === 0 && (
                <div className="text-center py-10">
                  <p className="text-xs text-muted-foreground">No projects yet</p>
                  <Button variant="link" size="sm" className="text-xs mt-1" onClick={() => setProjectDialog({ open: true, project: null })}>
                    Create a project
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        <div className="flex-1 overflow-hidden">
          {activeProject ? (
            <div className="h-full flex flex-col">
              <div className="p-6 border-b bg-card">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: (activeProject.color || '#6C5CE7') + '20' }}>
                      <FolderOpen className="w-5 h-5" style={{ color: activeProject.color || '#6C5CE7' }} />
                    </div>
                    <div>
                      <h1 className="text-lg font-semibold">{activeProject.name}</h1>
                      {activeProject.description && <p className="text-sm text-muted-foreground">{activeProject.description}</p>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setProjectDialog({ open: true, project: activeProject })}>
                      <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
                    </Button>
                    <Button size="sm" onClick={() => setTaskDialog({ open: true, task: null, projectId: activeProject.id } as any)}>
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add Task
                    </Button>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-4 gap-3">
                  {[
                    { label: 'Total Tasks', value: projectTasks.length },
                    { label: 'Completed', value: completedTasks.length },
                    { label: 'Scheduled', value: scheduledTasks.length },
                    { label: 'Hours Est.', value: formatDuration(totalHours) },
                  ].map(s => (
                    <div key={s.label} className="text-center p-3 rounded-lg bg-muted/50">
                      <p className="text-lg font-bold">{s.value}</p>
                      <p className="text-[10px] text-muted-foreground">{s.label}</p>
                    </div>
                  ))}
                </div>
                {projectTasks.length > 0 && (
                  <div className="mt-3">
                    <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                      <span>Overall progress</span>
                      <span>{completedTasks.length}/{projectTasks.length} tasks · {formatDuration(scheduledHours)} / {formatDuration(totalHours)} scheduled</span>
                    </div>
                    <Progress value={projectTasks.length > 0 ? (completedTasks.length / projectTasks.length) * 100 : 0} className="h-1.5" />
                  </div>
                )}
              </div>

              <ScrollArea className="flex-1">
                <div className="p-4 space-y-1">
                  {['high', 'medium', 'low'].map(priority => {
                    const group = projectTasks.filter(t => t.priority === priority && t.status !== 'completed');
                    if (group.length === 0) return null;
                    return (
                      <div key={priority} className="mb-4">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium px-2 mb-1">{priority} priority</p>
                        {group.map(task => (
                          <ProjectTaskRow
                            key={task.id}
                            task={task}
                            onToggle={() => toggleTaskStatus.mutate(task)}
                            onEdit={() => setTaskDialog({ open: true, task, projectId: task.project_id } as any)}
                          />
                        ))}
                      </div>
                    );
                  })}
                  {completedTasks.length > 0 && (
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium px-2 mb-1">Completed</p>
                      {completedTasks.map(task => (
                        <ProjectTaskRow
                          key={task.id}
                          task={task}
                          onToggle={() => toggleTaskStatus.mutate(task)}
                          onEdit={() => setTaskDialog({ open: true, task, projectId: task.project_id } as any)}
                        />
                      ))}
                    </div>
                  )}
                  {projectTasks.length === 0 && (
                    <div className="text-center py-16">
                      <p className="text-sm text-muted-foreground">No tasks yet</p>
                      <Button variant="link" size="sm" className="text-xs mt-1" onClick={() => setTaskDialog({ open: true, task: null, projectId: activeProject.id } as any)}>
                        Add the first task
                      </Button>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm">Select a project to view tasks</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <ProjectDialog
        open={projectDialog.open}
        onOpenChange={(open: boolean) => setProjectDialog({ open, project: open ? projectDialog.project : null })}
        project={projectDialog.project}
        clients={clients}
        onSave={(data: any) => saveProject.mutate({ id: (projectDialog.project as any)?.id, data })}
        onDelete={(id: string) => deleteProject.mutate(id)}
      />
      <TaskDialog
        open={taskDialog.open}
        onOpenChange={(open: boolean) => setTaskDialog({ open, task: open ? taskDialog.task : null, projectId: open ? taskDialog.projectId : null })}
        task={taskDialog.task}
        projects={projects}
        defaultProjectId={taskDialog.projectId}
        onSave={(data: any) => saveTask.mutate({
          id: (taskDialog.task as any)?.id,
          data: { ...data, project_id: taskDialog.projectId || data.project_id }
        })}
        onDelete={(id: string) => deleteTask.mutate(id)}
      />
    </AppLayout>
  );
}

function ProjectTaskRow({ task, onToggle, onEdit }: any) {
  const done = task.status === 'completed';
  const scheduled = (task.scheduled_hours || 0) > 0;
  const progress = task.estimated_hours > 0 ? Math.min(((task.scheduled_hours || 0) / task.estimated_hours) * 100, 100) : 0;

  return (
    <div
      draggable
      onDragStart={(e) => { e.dataTransfer.setData('taskId', task.id); e.dataTransfer.effectAllowed = 'copy'; }}
      className="flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-muted group cursor-grab active:cursor-grabbing"
    >
      <button onClick={onToggle} className="flex-shrink-0 text-muted-foreground hover:text-primary transition-colors">
        {done ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Circle className="w-4 h-4" />}
      </button>
      <GripVertical className="w-3.5 h-3.5 text-muted-foreground/30 opacity-0 group-hover:opacity-100 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${done ? 'line-through text-muted-foreground' : ''}`}>{task.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          {task.estimated_hours > 0 && (
            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
              <Clock className="w-2.5 h-2.5" /> {formatDuration(task.estimated_hours)}
            </span>
          )}
          {scheduled && !done && (
            <div className="flex-1 max-w-[60px] h-1 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary/60 rounded-full" style={{ width: `${progress}%` }} />
            </div>
          )}
          {task.due_date && <span className="text-[10px] text-muted-foreground">{task.due_date}</span>}
        </div>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
        {!scheduled && !done && <Badge variant="outline" className="text-[9px] h-4 px-1 text-amber-500 border-amber-300">Unscheduled</Badge>}
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onEdit}>
          <Pencil className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}
