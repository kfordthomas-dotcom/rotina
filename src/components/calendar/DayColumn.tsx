import React, { useRef } from 'react';
import { format, isToday } from 'date-fns';
import TimeBlockItem from './TimeBlockItem';

const HOUR_HEIGHT = 56;
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function DayColumn({ date, blocks, tasks, projects, onBlockClick, onSlotClick, onDragStart, onResizeStart, onTaskDrop }: any) {
  const today = isToday(date);
  const gridRef = useRef<HTMLDivElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const taskId = e.dataTransfer.getData('taskId');
    if (!taskId || !onTaskDrop) return;
    const rect = gridRef.current?.getBoundingClientRect();
    if (!rect) { onTaskDrop(taskId, date, 9); return; }
    const y = e.clientY - rect.top;
    const hour = Math.max(0, Math.min(23, Math.floor(y / HOUR_HEIGHT)));
    onTaskDrop(taskId, date, hour);
  };

  return (
    <div style={{ flex: 1, minWidth: 0, borderRight: '1px solid var(--border)', position: 'relative' }}>
      <div style={{
        position: 'sticky', top: 0, zIndex: 20, textAlign: 'center',
        padding: '0.5rem 0', borderBottom: '1px solid var(--border)',
        backgroundColor: today ? 'var(--accent)' : 'var(--card)',
      }}>
        <p style={{ fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted-foreground)', margin: 0 }}>{format(date, 'EEE')}</p>
        <p style={{ fontSize: '1.125rem', fontWeight: 600, color: today ? 'var(--primary)' : 'var(--foreground)', margin: 0, lineHeight: 1.2 }}>{format(date, 'd')}</p>
      </div>
      <div
        ref={gridRef}
        style={{ position: 'relative', height: `${24 * HOUR_HEIGHT}px` }}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {HOURS.map(hour => (
          <div
            key={hour}
            style={{ height: `${HOUR_HEIGHT}px`, borderBottom: '1px dashed var(--border)', cursor: 'pointer' }}
            onClick={() => onSlotClick?.(date, hour)}
          />
        ))}
        {(blocks as any[]).map((block: any) => {
          const top = block.start_hour * HOUR_HEIGHT;
          const height = Math.max(block.duration_hours * HOUR_HEIGHT, 20);
          return (
            <div key={block.id} onMouseDown={(e: React.MouseEvent) => {
              if ((e.target as HTMLElement).dataset.resize === 'true') onResizeStart?.(e, block);
              else onDragStart?.(e, block);
            }}>
              <TimeBlockItem
                block={block}
                task={(tasks as any[]).find((t: any) => t.id === block.task_id)}
                project={(projects as any[]).find((p: any) => p.id === block.project_id)}
                onClick={onBlockClick}
                style={{ top: `${top}px`, height: `${height}px` }}
              />
            </div>
          );
        })}
        {today && <CurrentTimeIndicator />}
      </div>
    </div>
  );
}

function CurrentTimeIndicator() {
  const now = new Date();
  const top = (now.getHours() * 60 + now.getMinutes()) / 60 * 56;
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: `${top}px`, zIndex: 30, pointerEvents: 'none' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--foreground)', marginLeft: '-4px' }} />
        <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--foreground)' }} />
      </div>
    </div>
  );
}