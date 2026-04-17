import React from 'react';
import { formatHour, formatDuration } from '@/lib/calendarUtils';
import { GripVertical } from 'lucide-react';

const EVENT_TYPE_COLORS: Record<string, string> = {
  meeting: '#0984E3',
  personal: '#6C5CE7',
  admin: '#E17055',
  other: '#636E72',
};

export default function TimeBlockItem({ block, task, project, onClick, style, isDragging }: any) {
  const eventTypeColor = block.event_type && block.event_type !== 'task' ? EVENT_TYPE_COLORS[block.event_type] : null;
  const bgColor = block.color || eventTypeColor || project?.color || '#6C5CE7';

  return (
    <div
      onClick={(e) => { e.stopPropagation(); onClick?.(block); }}
      style={{ ...style, backgroundColor: bgColor + '18', borderLeft: `3px solid ${bgColor}` }}
      className={`absolute left-1 right-1 rounded-md px-2 py-1 cursor-pointer group overflow-hidden transition-shadow ${isDragging ? 'shadow-lg ring-2 ring-primary/30 z-50' : 'hover:shadow-md z-10'}`}
    >
      <div className="flex items-start justify-between gap-1">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold truncate" style={{ color: bgColor }}>{block.title}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {formatHour(block.start_hour)} · {formatDuration(block.duration_hours)}
          </p>
          {block.event_type && block.event_type !== 'task' && (
            <p className="text-[10px] capitalize" style={{ color: bgColor + 'aa' }}>{block.event_type}</p>
          )}
          {project && (!block.event_type || block.event_type === 'task') && (
            <p className="text-[10px] text-muted-foreground truncate">{project.name}</p>
          )}
        </div>
        <GripVertical className="w-3 h-3 text-muted-foreground/40 opacity-0 group-hover:opacity-100 mt-0.5 flex-shrink-0" />
      </div>
      <div
        className="absolute bottom-0 left-0 right-0 h-2 cursor-s-resize opacity-0 group-hover:opacity-100"
        style={{ background: `linear-gradient(transparent, ${bgColor}30)` }}
        data-resize="true"
      />
    </div>
  );
}
