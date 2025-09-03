import { useCallback, useEffect, useRef, useState } from 'react';

export interface Position {
  x: number;
  y: number;
}

export interface DragState {
  isDragging: boolean;
  position: Position;
  offset: Position;
}

export interface UseDraggableOptions {
  initialPosition?: Position;
  onDragStart?: (position: Position) => void;
  onDrag?: (position: Position) => void;
  onDragEnd?: (position: Position) => void;
  constrainToViewport?: boolean;
  disabled?: boolean;
}

export function useDraggable(options: UseDraggableOptions = {}) {
  const {
    initialPosition = { x: 0, y: 0 },
    onDragStart,
    onDrag,
    onDragEnd,
    constrainToViewport = true,
    disabled = false,
  } = options;

  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    position: initialPosition,
    offset: { x: 0, y: 0 },
  });

  const dragRef = useRef<HTMLDivElement>(null);
  const initialMousePos = useRef<Position>({ x: 0, y: 0 });

  const constrainPosition = useCallback((pos: Position, elementRect?: DOMRect): Position => {
    if (!constrainToViewport) return pos;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    const elementWidth = elementRect?.width || 0;
    const elementHeight = elementRect?.height || 0;

    return {
      x: Math.max(0, Math.min(pos.x, viewportWidth - elementWidth)),
      y: Math.max(0, Math.min(pos.y, viewportHeight - elementHeight)),
    };
  }, [constrainToViewport]);

  const handleMouseDown = useCallback((event: MouseEvent | TouchEvent) => {
    if (disabled) return;
    
    event.preventDefault();
    event.stopPropagation();

    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

    initialMousePos.current = { x: clientX, y: clientY };
    
    const rect = dragRef.current?.getBoundingClientRect();
    const offset = {
      x: clientX - (rect?.left || 0),
      y: clientY - (rect?.top || 0),
    };

    setDragState(prev => ({
      ...prev,
      isDragging: true,
      offset,
    }));

    onDragStart?.(dragState.position);
  }, [disabled, onDragStart, dragState.position]);

  const handleMouseMove = useCallback((event: MouseEvent | TouchEvent) => {
    if (!dragState.isDragging) return;

    event.preventDefault();
    
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

    const newPosition = {
      x: clientX - dragState.offset.x,
      y: clientY - dragState.offset.y,
    };

    const constrainedPosition = constrainPosition(
      newPosition, 
      dragRef.current?.getBoundingClientRect()
    );

    setDragState(prev => ({
      ...prev,
      position: constrainedPosition,
    }));

    onDrag?.(constrainedPosition);
  }, [dragState.isDragging, dragState.offset, constrainPosition, onDrag]);

  const handleMouseUp = useCallback(() => {
    if (!dragState.isDragging) return;

    setDragState(prev => ({
      ...prev,
      isDragging: false,
    }));

    onDragEnd?.(dragState.position);
  }, [dragState.isDragging, dragState.position, onDragEnd]);

  // Set up event listeners
  useEffect(() => {
    if (dragState.isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleMouseMove);
      document.addEventListener('touchend', handleMouseUp);

      // Prevent text selection during drag
      document.body.style.userSelect = 'none';
      document.body.style.webkitUserSelect = 'none';

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleMouseMove);
        document.removeEventListener('touchend', handleMouseUp);
        
        document.body.style.userSelect = '';
        document.body.style.webkitUserSelect = '';
      };
    }
    
    return () => {
      // Cleanup function for when effect is not active
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
    };
  }, [dragState.isDragging, handleMouseMove, handleMouseUp]);

  // Update position when initialPosition changes
  useEffect(() => {
    setDragState(prev => ({
      ...prev,
      position: initialPosition,
    }));
  }, [initialPosition]);

  const setPosition = useCallback((position: Position) => {
    const constrainedPosition = constrainPosition(
      position,
      dragRef.current?.getBoundingClientRect()
    );
    setDragState(prev => ({
      ...prev,
      position: constrainedPosition,
    }));
  }, [constrainPosition]);

  return {
    dragRef,
    position: dragState.position,
    isDragging: dragState.isDragging,
    setPosition,
    dragHandlers: {
      onMouseDown: handleMouseDown,
      onTouchStart: handleMouseDown,
    },
  };
}