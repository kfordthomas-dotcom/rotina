import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { entities } from '@/api/supabaseClient';
import { format } from 'date-fns';
import { navigateDate } from '@/lib/calendarUtils';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

import AppLayout from '@/components/AppLayout';
import CalendarHeader from '@/components/calendar/CalendarHeader';
import { WeekView, DayView, MonthView } from '@/components/calendar/CalendarViews';
import BacklogSidebar from '@/components/sidebar/BacklogSidebar';
import TimeBlockDialog from '@/components/dialogs/TimeBlockDialog';
import TaskDialog from '@/components/dialogs/TaskDialog';
import ProjectDialog from '@/components/dialogs/ProjectDialog';
import ProjectsPanel from '@/components/dialogs/ProjectsPanel';
import RecurringTaskDialog from '@/components/dialogs/RecurringTaskDialog';

export default function Calendar() {
  const queryClient = useQueryClient();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('week');

  const [blockDialog, setBlockDialog] = useState<{ open: boolean; block: any }>({ open: false, block: null });
  const [taskDialog, setTaskDialog] = useState<{ open: boolean; task: any }>({ open: false, task: null });
  const [projectDialog, setProjectDialog] = useState<{ open: boolean; project: any }>({ open: false, project: null });
  const [projectsPanel, setProjectsPanel] = useState(false);
  const [recurringDialog, setRecurringDialog] = useState<{ open: boolean; recurringTask: any }>({ open: false, recurringTask: null });

  const { data: blocks = [] } = useQuery({ queryKey: ['timeblocks'], queryFn: () => entities.TimeBlock.list() });
  const { data: tasks = [] } = useQuery({ queryKey: ['tasks'], queryFn: () => entities.Task.list() });
  const { data: projects = [] } = useQuery({ queryKey: ['projects'], queryFn: () => entities.Project.filter({ status: 'active' }) });
  const { data: clients = [] } = useQuery({ queryKey: ['clients'], queryFn: () => entities.Client.list() });
  const { data: recurringTasks = [] } = useQuery({ queryKey: ['recurringtasks'], queryFn: () => entities.RecurringTask.list() });

  const invalidateAll = () => {
    ['timeblocks', 'tasks', 'projects', 'recurringtasks', 'clients'].forEach(k =>
      queryClient.invalidateQueries({ queryKey: [k] })
    );
  };

  const recalcTaskHours = async (taskId: string) => {
    if (!taskId) return;
    const allBlocks = await entities.TimeBlock.filter({ task_id: taskId });
    const totalScheduled = allBlocks.reduce((s: number, b: any) => s + (b.duration_hours || 0), 0);
    const task = (tasks as any[]).find((t: any) => t.id === taskId) as any;
    if (!task) return;
    const status = totalScheduled >= (task.estimated_hours || 0) ? 'completed' : totalScheduled > 0 ? 'in_progress' : 'backlog';
    await entities.Task.update(taskId, { scheduled_hours: totalScheduled, status });
  };

  const saveBlock = useMutation({
    mutationFn: async ({ id, data }: any) => {
      const oldBlock = id ? (blocks as any[]).find((b: any) => b.id === id) : null;
      const result = id ? await entities.TimeBlock.update(id, data) : await entities.TimeBlock.create(data);
      await recalcTaskHours(data.task_id);
      if (oldBlock?.task_id && oldBlock.task_id !== data.task_id) await recalcTaskHours(oldBlock.task_id);
      return result;
    },
    onSuccess: () => { invalidateAll(); setBlockDialog({ open: false, block: null }); },
  });

  const deleteBlock = useMutation({
    mutationFn: async (id: string) => {
      const block = (blocks as any[]).find((b: any) => b.id === id);
      await entities.TimeBlock.delete(id);
      if (block?.task_id) await recalcTaskHours(block.task_id);
    },
    onSuccess: () => { invalidateAll(); setBlockDialog({ open: false, block: null }); },
  });

  const saveTask = useMutation({
    mutationFn: async ({ id, data }: any) => id ? entities.Task.update(id, data) : entities.Task.create({ ...data, status: 'backlog', scheduled_hours: 0 }),
    onSuccess: () => { invalidateAll(); setTaskDialog({ open: false, task: null }); },
  });

  const deleteTask = useMutation({
    mutationFn: (id: string) => entities.Task.delete(id),
    onSuccess: () => { invalidateAll(); setTaskDialog({ open: false, task: null }); },
  });

  const toggleTaskComplete = useMutation({
    mutationFn: async (task: any) => entities.Task.update(task.id, { status: task.status === 'completed' ? 'backlog' : 'completed' }),
    onSuccess: () => invalidateAll(),
  });

  const saveProject = useMutation({
    mutationFn: async ({ id, data }: any) => id ? entities.Project.update(id, data) : entities.Project.create({ ...data, status: 'active' }),
    onSuccess: () => { invalidateAll(); setProjectDialog({ open: false, project: null }); },
  });

  const deleteProject = useMutation({
    mutationFn: (id: string) => entities.Project.delete(id),
    onSuccess: () => { invalidateAll(); setProjectDialog({ open: false, project: null }); },
  });

  const saveRecurring = useMutation({
    mutationFn: async ({ id, data }: any) => id ? entities.RecurringTask.update(id, data) : entities.RecurringTask.create(data),
    onSuccess: () => { invalidateAll(); setRecurringDialog({ open: false, recurringTask: null }); },
  });

  const deleteRecurring = useMutation({
    mutationFn: (id: string) => entities.RecurringTask.delete(id),
    onSuccess: () => invalidateAll(),
  });

  const generateRecurring = async (rt: any) => {
    await entities.Task.create({
      name: `${rt.name} – ${format(new Date(), 'MMM d')}`,
      estimated_hours: rt.estimated_hours,
      project_id: rt.project_id || null,
      priority: rt.priority || 'medium',
      status: 'backlog',
      scheduled_hours: 0,
    });
    await entities.RecurringTask.update(rt.id, { last_generated_date: format(new Date(), 'yyyy-MM-dd') });
    invalidateAll();
    toast.success(`Task generated from "${rt.name}"`);
  };

  const handleTaskDropOnDate = async (taskId: string, date: Date, hour: number) => {
    const task = (tasks as any[]).find((t: any) => t.id === taskId) as any;
    if (!task) return;
    const remaining = Math.max(0.5, (task.estimated_hours || 1) - (task.scheduled_hours || 0));
    await saveBlock.mutateAsync({
      id: null,
      data: {
        date: format(date, 'yyyy-MM-dd'),
        start_hour: hour,
        duration_hours: Math.min(remaining, 2),
        task_id: taskId,
        project_id: task.project_id || null,
        title: task.name,
        event_type: 'task',
      }
    });
    toast.success(`"${task.name}" scheduled`);
  };

  const handleSlotClick = (date: Date, hour: number) => {
    setBlockDialog({ open: true, block: { date: format(date, 'yyyy-MM-dd'), start_hour: hour, duration_hours: 1 } });
  };

  const viewProps = {
    currentDate, blocks, tasks, projects,
    onBlockClick: (block: any) => setBlockDialog({ open: true, block }),
    onSlotClick: handleSlotClick,
    onTaskDrop: handleTaskDropOnDate,
    onDragStart: () => {},
    onResizeStart: () => {},
  };

  return (
    <AppLayout>
      <CalendarHeader
        currentDate={currentDate}
        view={view}
        onViewChange={setView}
        onNavigate={(dir: 'prev' | 'next') => setCurrentDate(navigateDate(currentDate, view, dir))}
        onToday={() => setCurrentDate(new Date())}
        onNewBlock={() => setBlockDialog({ open: true, block: { date: format(currentDate, 'yyyy-MM-dd'), start_hour: 9, duration_hours: 1 } })}
      />

      <div style={{ display: 'flex', gap: '1rem', flex: 1, overflow: 'hidden', minHeight: 0 }}>
        {/* Unscheduled work panel */}
        <div style={{
          width: '240px',
          flexShrink: 0,
          backgroundColor: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow)',
        }}>
          <BacklogSidebar
            tasks={tasks}
            projects={projects}
            clients={clients}
            onNewTask={() => setTaskDialog({ open: true, task: null })}
            onToggleComplete={(task: any) => toggleTaskComplete.mutate(task)}
          />
        </div>

        {/* Calendar panel */}
        <div style={{
          flex: 1,
          backgroundColor: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          boxShadow: 'var(--shadow)',
        }}>
          {view === 'week' && <WeekView {...viewProps} />}
          {view === 'day' && <DayView {...viewProps} />}
          {view === 'month' && <MonthView {...viewProps} />}
        </div>
      </div>

      <TimeBlockDialog
        open={blockDialog.open}
        onOpenChange={(open: boolean) => setBlockDialog({ open, block: open ? blockDialog.block : null })}
        block={blockDialog.block}
        tasks={tasks}
        projects={projects}
        onSave={(data: any) => saveBlock.mutate({ id: blockDialog.block?.id, data })}
        onDelete={(id: string) => deleteBlock.mutate(id)}
      />
      <TaskDialog
        open={taskDialog.open}
        onOpenChange={(open: boolean) => setTaskDialog({ open, task: open ? taskDialog.task : null })}
        task={taskDialog.task}
        projects={projects}
        clients={clients}
        onSave={(data: any) => saveTask.mutate({ id: taskDialog.task?.id, data })}
        onDelete={(id: string) => deleteTask.mutate(id)}
      />
      <ProjectDialog
        open={projectDialog.open}
        onOpenChange={(open: boolean) => setProjectDialog({ open, project: open ? projectDialog.project : null })}
        project={projectDialog.project}
        clients={clients}
        onSave={(data: any) => saveProject.mutate({ id: projectDialog.project?.id, data })}
        onDelete={(id: string) => deleteProject.mutate(id)}
      />
      <ProjectsPanel
        open={projectsPanel}
        onOpenChange={setProjectsPanel}
        projects={projects}
        tasks={tasks}
        recurringTasks={recurringTasks}
        onNewProject={() => { setProjectsPanel(false); setProjectDialog({ open: true, project: null }); }}
        onEditProject={(p: any) => { setProjectsPanel(false); setProjectDialog({ open: true, project: p }); }}
        onNewRecurring={() => { setProjectsPanel(false); setRecurringDialog({ open: true, recurringTask: null }); }}
        onEditRecurring={(rt: any) => { setProjectsPanel(false); setRecurringDialog({ open: true, recurringTask: rt }); }}
        onDeleteRecurring={(id: string) => deleteRecurring.mutate(id)}
        onGenerateRecurring={generateRecurring}
      />
      <RecurringTaskDialog
        open={recurringDialog.open}
        onOpenChange={(open: boolean) => setRecurringDialog({ open, recurringTask: open ? recurringDialog.recurringTask : null })}
        recurringTask={recurringDialog.recurringTask}
        projects={projects}
        onSave={(data: any) => saveRecurring.mutate({ id: recurringDialog.recurringTask?.id, data })}
      />
    </AppLayout>
  );
}