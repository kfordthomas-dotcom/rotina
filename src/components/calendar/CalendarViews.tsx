import React, { useRef, useEffect } from 'react';
import { format, isSameMonth, isToday } from 'date-fns';
import { getWeekDays, getMonthDays, formatHour } from '@/lib/calendarUtils';
import DayColumn from './DayColumn';

const HOUR_HEIGHT = 56;
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function WeekView({ currentDate, blocks, tasks, projects, onBlockClick, onSlotClick, onDragStart, onResizeStart, onTaskDrop }: any) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const days = getWeekDays(currentDate);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 8 * HOUR_HEIGHT;
  }, []);

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <div
        ref={scrollRef}
        style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', overflowX: 'hidden' }}
      >
        {/* Time gutter */}
        <div style={{ width: '52px', flexShrink: 0, borderRight: '1px solid var(--border)', backgroundColor: 'var(--card)', position: 'relative', zIndex: 1 }}>
          <div style={{ height: '52px', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 20, backgroundColor: 'var(--card)' }} />
          <div style={{ position: 'relative', height: `${24 * HOUR_HEIGHT}px` }}>
            {HOURS.map(hour => (
              <div key={hour} style={{ position: 'absolute', right: '0.5rem', top: `${hour * HOUR_HEIGHT - 6}px`, fontSize: '0.625rem', color: 'var(--muted-foreground)', fontWeight: 500 }}>
                {hour === 0 ? '' : formatHour(hour)}
              </div>
            ))}
          </div>
        </div>

        {/* Day columns */}
        <div style={{ display: 'flex', flex: 1, minWidth: 0 }}>
          {days.map((day, i) => (
            <DayColumn
              key={day.toISOString()}
              date={day}
              blocks={(blocks as any[]).filter((b: any) => b.date === format(day, 'yyyy-MM-dd'))}
              tasks={tasks}
              projects={projects}
              onBlockClick={onBlockClick}
              onSlotClick={onSlotClick}
              onDragStart={onDragStart}
              onResizeStart={onResizeStart}
              onTaskDrop={onTaskDrop}
              isLast={i === days.length - 1}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function DayView({ currentDate, blocks, tasks, projects, onBlockClick, onSlotClick, onDragStart, onResizeStart, onTaskDrop }: any) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const dayBlocks = (blocks as any[]).filter((b: any) => b.date === format(currentDate, 'yyyy-MM-dd'));

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 8 * HOUR_HEIGHT;
  }, []);

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <div
        ref={scrollRef}
        style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', overflowX: 'hidden' }}
      >
        {/* Time gutter */}
        <div style={{ width: '52px', flexShrink: 0, borderRight: '1px solid var(--border)', backgroundColor: 'var(--card)', position: 'relative', zIndex: 1 }}>
          <div style={{ height: '52px', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 20, backgroundColor: 'var(--card)' }} />
          <div style={{ position: 'relative', height: `${24 * HOUR_HEIGHT}px` }}>
            {HOURS.map(hour => (
              <div key={hour} style={{ position: 'absolute', right: '0.5rem', top: `${hour * HOUR_HEIGHT - 6}px`, fontSize: '0.625rem', color: 'var(--muted-foreground)', fontWeight: 500 }}>
                {hour === 0 ? '' : formatHour(hour)}
              </div>
            ))}
          </div>
        </div>

        {/* Single day column */}
        <div style={{ display: 'flex', flex: 1, minWidth: 0 }}>
          <DayColumn
            date={currentDate}
            blocks={dayBlocks}
            tasks={tasks}
            projects={projects}
            onBlockClick={onBlockClick}
            onSlotClick={onSlotClick}
            onDragStart={onDragStart}
            onResizeStart={onResizeStart}
            onTaskDrop={onTaskDrop}
            isLast={true}
          />
        </div>
      </div>
    </div>
  );
}

export function MonthView({ currentDate, blocks, tasks, projects, onBlockClick, onSlotClick, onTaskDrop }: any) {
  const days = getMonthDays(currentDate);
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '1rem' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
      }}>
        {weekDays.map(day => (
          <div key={day} style={{ backgroundColor: 'var(--card)', padding: '0.5rem', textAlign: 'center', borderBottom: '1px solid var(--border)', borderRight: '1px solid var(--border)' }}>
            <span style={{ fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500, color: 'var(--muted-foreground)' }}>{day}</span>
          </div>
        ))}
        {days.map((day, idx) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const dayBlocks = (blocks as any[]).filter((b: any) => b.date === dateStr);
          const inMonth = isSameMonth(day, currentDate);
          const today = isToday(day);
          const isLastInRow = (idx + 1) % 7 === 0;
          return (
            <div
              key={day.toISOString()}
              style={{
                backgroundColor: 'var(--card)',
                minHeight: '100px',
                padding: '0.375rem',
                opacity: inMonth ? 1 : 0.4,
                cursor: 'pointer',
                borderBottom: '1px solid var(--border)',
                borderRight: isLastInRow ? 'none' : '1px solid var(--border)',
              }}
              onClick={() => onSlotClick?.(day, 9)}
              onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }}
              onDrop={(e) => { e.preventDefault(); const taskId = e.dataTransfer.getData('taskId'); if (taskId && onTaskDrop) onTaskDrop(taskId, day, 9); }}
            >
              <div style={{ fontSize: '0.75rem', fontWeight: 500, marginBottom: '0.25rem', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', backgroundColor: today ? 'var(--primary)' : 'transparent', color: today ? 'var(--primary-foreground)' : 'var(--muted-foreground)' }}>
                {format(day, 'd')}
              </div>
              {dayBlocks.slice(0, 3).map((block: any) => {
                const project = (projects as any[]).find((p: any) => p.id === block.project_id);
                const color = block.color || project?.color || '#6C5CE7';
                return (
                  <div key={block.id} onClick={(e) => { e.stopPropagation(); onBlockClick?.(block); }}
                    style={{ padding: '2px 6px', borderRadius: '3px', fontSize: '0.625rem', fontWeight: 500, backgroundColor: color + '20', color, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '2px', cursor: 'pointer' }}>
                    {block.title}
                  </div>
                );
              })}
              {dayBlocks.length > 3 && <p style={{ fontSize: '0.625rem', color: 'var(--muted-foreground)', margin: 0, paddingLeft: '4px' }}>+{dayBlocks.length - 3} more</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default WeekView;