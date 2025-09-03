'use client';

import { cn } from '@/lib/utils';

interface DragHandleProps {
  className?: string;
  onMouseDown?: (event: React.MouseEvent) => void;
  onTouchStart?: (event: React.TouchEvent) => void;
  isDragging?: boolean;
}

const GripIcon = ({ size = 14 }: { size?: number }) => (
  <svg
    height={size}
    strokeLinejoin="round"
    viewBox="0 0 16 16"
    width={size}
    style={{ color: 'currentcolor' }}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M4.5 3C3.67157 3 3 3.67157 3 4.5C3 5.32843 3.67157 6 4.5 6C5.32843 6 6 5.32843 6 4.5C6 3.67157 5.32843 3 4.5 3ZM4.5 10C3.67157 10 3 10.6716 3 11.5C3 12.3284 3.67157 13 4.5 13C5.32843 13 6 12.3284 6 11.5C6 10.6716 5.32843 10 4.5 10ZM10 4.5C10 3.67157 10.6716 3 11.5 3C12.3284 3 13 3.67157 13 4.5C13 5.32843 12.3284 6 11.5 6C10.6716 6 10 5.32843 10 4.5ZM11.5 10C10.6716 10 10 10.6716 10 11.5C10 12.3284 10.6716 13 11.5 13C12.3284 13 13 12.3284 13 11.5C13 10.6716 12.3284 10 11.5 10Z"
      fill="currentColor"
    />
  </svg>
);

export function DragHandle({ 
  className, 
  onMouseDown, 
  onTouchStart, 
  isDragging = false 
}: DragHandleProps) {
  return (
    <div
      className={cn(
        'drag-handle flex items-center justify-center w-6 h-6 cursor-grab active:cursor-grabbing',
        'hover:bg-muted rounded transition-colors duration-200',
        'touch-none select-none',
        isDragging && 'bg-muted',
        className
      )}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      role="button"
      aria-label="Drag handle"
      tabIndex={0}
      onKeyDown={(e) => {
        // Allow keyboard users to initiate drag with Enter or Space
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          // Could add keyboard drag support here
        }
      }}
    >
      <GripIcon size={14} />
    </div>
  );
}