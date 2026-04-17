import { supabase } from '@/lib/supabase'

const nullIfEmpty = (v: any) => (v === '' || v === undefined ? null : v)

export const ClientsAPI = {
  async list() {
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('clients')
      .select('*, tasks(id)')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data.map((c: any) => ({ ...c, taskCount: c.tasks?.length ?? 0 }))
  },

  async filter(filters: Record<string, any>) {
    const { data: { user } } = await supabase.auth.getUser()
    let query = supabase.from('clients').select('*, tasks(id)').eq('user_id', user!.id)
    Object.entries(filters).forEach(([k, v]) => { query = query.eq(k, v) })
    const { data, error } = await query.order('created_at', { ascending: false })
    if (error) throw error
    return data.map((c: any) => ({ ...c, taskCount: c.tasks?.length ?? 0 }))
  },

  async create(data: Record<string, any>) {
    const { data: { user } } = await supabase.auth.getUser()
    const { data: result, error } = await supabase.from('clients').insert({ ...data, user_id: user!.id }).select().single()
    if (error) throw error
    return result
  },

  async update(id: string, data: Record<string, any>) {
    const { data: result, error } = await supabase.from('clients').update({ ...data, updated_at: new Date().toISOString() }).eq('id', id).select().single()
    if (error) throw error
    return result
  },

  async delete(id: string) {
    const { error } = await supabase.from('clients').delete().eq('id', id)
    if (error) throw error
  },
}

export const ProjectsAPI = {
  async list() {
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('projects')
      .select('*, clients(name)')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data.map((p: any) => ({ ...p, client: p.clients?.name ?? p.client ?? '' }))
  },

  async filter(filters: Record<string, any>) {
    const { data: { user } } = await supabase.auth.getUser()
    let query = supabase.from('projects').select('*, clients(name)').eq('user_id', user!.id)
    Object.entries(filters).forEach(([k, v]) => { query = query.eq(k, v) })
    const { data, error } = await query.order('created_at', { ascending: false })
    if (error) throw error
    return data.map((p: any) => ({ ...p, client: p.clients?.name ?? p.client ?? '' }))
  },

  async create(data: Record<string, any>) {
    const { data: { user } } = await supabase.auth.getUser()
    const { data: result, error } = await supabase.from('projects').insert({
      user_id: user!.id,
      name: data.name,
      client_id: nullIfEmpty(data.client_id),
      client: nullIfEmpty(data.client),
      color: data.color,
      status: data.status || 'active',
      description: nullIfEmpty(data.description),
    }).select().single()
    if (error) throw error
    return result
  },

  async update(id: string, data: Record<string, any>) {
    const { data: result, error } = await supabase.from('projects').update({
      ...data,
      client_id: nullIfEmpty(data.client_id),
      updated_at: new Date().toISOString(),
    }).eq('id', id).select().single()
    if (error) throw error
    return result
  },

  async delete(id: string) {
    const { error } = await supabase.from('projects').delete().eq('id', id)
    if (error) throw error
  },
}

export const TasksAPI = {
  async list(_sort?: string, _limit?: number) {
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  async filter(filters: Record<string, any>) {
    const { data: { user } } = await supabase.auth.getUser()
    let query = supabase.from('tasks').select('*').eq('user_id', user!.id)
    Object.entries(filters).forEach(([k, v]) => { query = query.eq(k, v) })
    const { data, error } = await query.order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  async create(data: Record<string, any>) {
    const { data: { user } } = await supabase.auth.getUser()
    const { data: result, error } = await supabase.from('tasks').insert({
      user_id: user!.id,
      name: data.name,
      project_id: nullIfEmpty(data.project_id),
      client_id: nullIfEmpty(data.client_id),
      estimated_hours: data.estimated_hours || 1,
      scheduled_hours: data.scheduled_hours || 0,
      status: data.status || 'backlog',
      assigned_to: nullIfEmpty(data.assigned_to),
      priority: data.priority || 'medium',
      due_date: nullIfEmpty(data.due_date),
      is_retainer_deliverable: data.is_retainer_deliverable || false,
      retainer_month: nullIfEmpty(data.retainer_month),
    }).select().single()
    if (error) throw error
    return result
  },

  async update(id: string, data: Record<string, any>) {
    const { data: result, error } = await supabase.from('tasks').update({
      ...data,
      project_id: nullIfEmpty(data.project_id),
      client_id: nullIfEmpty(data.client_id),
      assigned_to: nullIfEmpty(data.assigned_to),
      due_date: nullIfEmpty(data.due_date),
      updated_at: new Date().toISOString(),
    }).eq('id', id).select().single()
    if (error) throw error
    return result
  },

  async delete(id: string) {
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (error) throw error
  },
}

export const TimeBlocksAPI = {
  async list(_sort?: string, _limit?: number) {
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('time_blocks')
      .select('*')
      .eq('user_id', user!.id)
      .order('date', { ascending: false })
    if (error) throw error
    return data
  },

  async filter(filters: Record<string, any>) {
    const { data: { user } } = await supabase.auth.getUser()
    let query = supabase.from('time_blocks').select('*').eq('user_id', user!.id)
    Object.entries(filters).forEach(([k, v]) => { query = query.eq(k, v) })
    const { data, error } = await query
    if (error) throw error
    return data
  },

  async create(data: Record<string, any>) {
    const { data: { user } } = await supabase.auth.getUser()
    const { data: result, error } = await supabase.from('time_blocks').insert({
      user_id: user!.id,
      title: data.title,
      date: data.date,
      start_hour: data.start_hour,
      duration_hours: data.duration_hours,
      event_type: data.event_type || 'task',
      task_id: nullIfEmpty(data.task_id),
      project_id: nullIfEmpty(data.project_id),
      client_id: nullIfEmpty(data.client_id),
      assigned_to: nullIfEmpty(data.assigned_to),
      color: nullIfEmpty(data.color),
      notes: nullIfEmpty(data.notes),
    }).select().single()
    if (error) throw error
    return result
  },

  async update(id: string, data: Record<string, any>) {
    const { data: result, error } = await supabase.from('time_blocks').update({
      ...data,
      task_id: nullIfEmpty(data.task_id),
      project_id: nullIfEmpty(data.project_id),
      client_id: nullIfEmpty(data.client_id),
      assigned_to: nullIfEmpty(data.assigned_to),
    }).eq('id', id).select().single()
    if (error) throw error
    return result
  },

  async delete(id: string) {
    const { error } = await supabase.from('time_blocks').delete().eq('id', id)
    if (error) throw error
  },
}

export const RecurringTasksAPI = {
  async list() {
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('recurring_tasks')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  async create(data: Record<string, any>) {
    const { data: { user } } = await supabase.auth.getUser()
    const { data: result, error } = await supabase.from('recurring_tasks').insert({
      user_id: user!.id,
      name: data.name,
      project_id: nullIfEmpty(data.project_id),
      estimated_hours: data.estimated_hours || 1,
      frequency: data.frequency || 'weekly',
      assigned_to: nullIfEmpty(data.assigned_to),
      priority: data.priority || 'medium',
      active: data.active !== false,
    }).select().single()
    if (error) throw error
    return result
  },

  async update(id: string, data: Record<string, any>) {
    const { data: result, error } = await supabase.from('recurring_tasks').update({
      ...data,
      project_id: nullIfEmpty(data.project_id),
    }).eq('id', id).select().single()
    if (error) throw error
    return result
  },

  async delete(id: string) {
    const { error } = await supabase.from('recurring_tasks').delete().eq('id', id)
    if (error) throw error
  },
}

export const entities = {
  Client: ClientsAPI,
  Project: ProjectsAPI,
  Task: TasksAPI,
  TimeBlock: TimeBlocksAPI,
  RecurringTask: RecurringTasksAPI,
}