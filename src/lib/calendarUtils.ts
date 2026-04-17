import { startOfWeek, endOfWeek, eachDayOfInterval, startOfMonth, endOfMonth, addDays, addWeeks, addMonths, subDays, subWeeks, subMonths } from 'date-fns'

export const PROJECT_COLORS = [
  '#DCE4DD', '#EAD6D6', '#D6DEEA', '#EAE3D6', '#DFDCE4',
  '#2C3035', '#345E45', '#305275', '#8A3333', '#8F6A20',
]

export function getWeekDays(date: Date): Date[] {
  const start = startOfWeek(date, { weekStartsOn: 1 })
  return eachDayOfInterval({ start, end: addDays(start, 6) })
}

export function getMonthDays(date: Date): Date[] {
  const start = startOfWeek(startOfMonth(date), { weekStartsOn: 1 })
  const end = endOfWeek(endOfMonth(date), { weekStartsOn: 1 })
  return eachDayOfInterval({ start, end })
}

export function navigateDate(date: Date, view: string, direction: 'prev' | 'next'): Date {
  const fn = direction === 'next'
    ? { day: addDays, week: addWeeks, month: addMonths }
    : { day: subDays, week: subWeeks, month: subMonths }

  if (view === 'day') return fn.day(date, 1)
  if (view === 'week') return fn.week(date, 1)
  return fn.month(date, 1)
}

export function formatHour(hour: number): string {
  const h = Math.floor(hour)
  const m = (hour % 1) * 60
  const period = h >= 12 ? 'pm' : 'am'
  const displayH = h % 12 || 12
  if (m === 0) return `${displayH}${period}`
  return `${displayH}:${String(m).padStart(2, '0')}${period}`
}

export function formatDuration(hours: number): string {
  if (!hours) return '0h'
  const h = Math.floor(hours)
  const m = Math.round((hours % 1) * 60)
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}
