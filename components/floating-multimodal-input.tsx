'use client';

import type {
  Attachment,
  ChatRequestOptions,
  CreateMessage,
  Message,
} from 'ai';
import { cn } from '@/lib/utils';
import type { Dispatch, SetStateAction } from 'react';
import { MultimodalInput } from './multimodal-input';
import { DragHandle } from './drag-handle';
import { Button } from './ui/button';
import { CrossSmallIcon, PlusIcon } from './icons';
import './draggable-input.css';

interface FloatingMultimodalInputProps {
  chatId: string;
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  stop: () => void;
  attachments: Array<Attachment>;
  setAttachments: Dispatch<SetStateAction<Array<Attachment>>>;
  messages: Array<Message>;
  setMessages: Dispatch<SetStateAction<Array<Message>>>;
  append: (
    message: Message | CreateMessage,
    chatRequestOptions?: ChatRequestOptions,
  ) => Promise<string | null | undefined>;
  handleSubmit: (
    event?: {
      preventDefault?: () => void;
    },
    chatRequestOptions?: ChatRequestOptions,
  ) => void;
  // Dragging props
  position: { x: number; y: number };
  isDragging: boolean;
  isMinimized: boolean;
  onDragStart: (event: React.MouseEvent | React.TouchEvent) => void;
  onToggleMinimized: () => void;
  className?: string;
}

export function FloatingMultimodalInput({
  chatId,
  input,
  setInput,
  isLoading,
  stop,
  attachments,
  setAttachments,
  messages,
  setMessages,
  append,
  handleSubmit,
  position,
  isDragging,
  isMinimized,
  onDragStart,
  onToggleMinimized,
  className,
}: FloatingMultimodalInputProps) {
  return (
    <div
      className={cn(
        'draggable-chat-input fixed z-50 bg-background border border-border rounded-lg shadow-lg',
        'transition-opacity duration-200',
        isDragging && 'dragging opacity-75',
        isMinimized ? 'chat-input-minimized w-16 h-16' : 'chat-input-expanded w-96 min-h-[120px]',
        className
      )}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      {/* Header with drag handle and controls */}
      <div className="flex items-center justify-between p-2 border-b border-border bg-muted/50 rounded-t-lg">
        <div className="flex items-center gap-2">
          <DragHandle
            onMouseDown={onDragStart as (event: React.MouseEvent) => void}
            onTouchStart={onDragStart as (event: React.TouchEvent) => void}
            isDragging={isDragging}
          />
          {!isMinimized && (
            <span className="text-xs text-muted-foreground font-medium">
              Chat Input
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleMinimized}
            className="h-6 w-6 p-0 hover:bg-background"
          >
            {isMinimized ? (
              <PlusIcon size={12} />
            ) : (
              <CrossSmallIcon size={12} />
            )}
          </Button>
        </div>
      </div>

      {/* Content */}
      {!isMinimized && (
        <div className="p-3">
          <MultimodalInput
            chatId={chatId}
            input={input}
            setInput={setInput}
            isLoading={isLoading}
            stop={stop}
            attachments={attachments}
            setAttachments={setAttachments}
            messages={messages}
            setMessages={setMessages}
            append={append}
            handleSubmit={handleSubmit}
            className="bg-background"
          />
        </div>
      )}

      {/* Minimized state - show just send button if input has content */}
      {isMinimized && input.trim() && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Button
            onClick={() => handleSubmit()}
            size="sm"
            className="h-8 w-8 rounded-full p-0"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <span className="text-xs">↵</span>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}