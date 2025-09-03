'use client';

import { Button } from './ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from './ui/dropdown-menu';
import { MoreIcon } from './icons';
import { usePositionPersistence } from '@/hooks/use-position-persistence';

interface ChatInputSettingsProps {
  chatId?: string;
}

export function ChatInputSettings({ chatId }: ChatInputSettingsProps) {
  const {
    state,
    toggleDraggable,
    toggleMinimized,
    resetToDefault,
    setPresetPosition,
  } = usePositionPersistence(chatId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
        >
          <MoreIcon size={14} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={toggleDraggable}>
          {state.isDraggable ? 'Disable' : 'Enable'} Dragging
        </DropdownMenuItem>
        
        {state.isDraggable && (
          <>
            <DropdownMenuItem onClick={toggleMinimized}>
              {state.isMinimized ? 'Expand' : 'Minimize'}
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem onClick={() => setPresetPosition('bottom-left')}>
              Position: Bottom Left
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setPresetPosition('bottom-right')}>
              Position: Bottom Right
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setPresetPosition('center')}>
              Position: Center
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem onClick={resetToDefault}>
              Reset to Default
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}