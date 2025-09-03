'use client';

import type {
  Attachment,
  ChatRequestOptions,
  CreateMessage,
  Message,
} from 'ai';
import { useCallback, useRef, type Dispatch, type SetStateAction } from 'react';
import { useDraggable } from '@/hooks/use-draggable';
import { usePositionPersistence } from '@/hooks/use-position-persistence';
import { FloatingMultimodalInput } from './floating-multimodal-input';
import { MultimodalInput } from './multimodal-input';
import { cn } from '@/lib/utils';

interface DraggableChatInputProps {
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
  isReadonly?: boolean;
  className?: string;
}

export function DraggableChatInput({
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
  isReadonly = false,
  className,
}: DraggableChatInputProps) {
  const {
    state: persistentState,
    updatePosition,
    toggleMinimized,
    toggleDraggable,
  } = usePositionPersistence(chatId);

  const handleDragStart = useCallback(() => {
    // Add any drag start logic here
  }, []);

  const handleDrag = useCallback((position: { x: number; y: number }) => {
    updatePosition(position);
  }, [updatePosition]);

  const handleDragEnd = useCallback(() => {
    // Add any drag end logic here
  }, []);

  const { dragRef, position, isDragging, dragHandlers } = useDraggable({
    initialPosition: persistentState.position,
    onDragStart: handleDragStart,
    onDrag: handleDrag,
    onDragEnd: handleDragEnd,
    constrainToViewport: true,
    disabled: !persistentState.isDraggable,
  });

  // Sync position with persistent state
  const currentPosition = persistentState.isDraggable ? position : persistentState.position;

  if (isReadonly) {
    return null;
  }

  // If draggable mode is disabled, show the traditional input
  if (!persistentState.isDraggable) {
    return (
      <form className={cn("flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl", className)}>
        <MultimodalInput
          chatId={chatId}
          input={input}
          setInput={setInput}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
          stop={stop}
          attachments={attachments}
          setAttachments={setAttachments}
          messages={messages}
          setMessages={setMessages}
          append={append}
        />
      </form>
    );
  }

  // Draggable floating input
  return (
    <>
      <div ref={dragRef}>
        <FloatingMultimodalInput
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
          position={currentPosition}
          isDragging={isDragging}
          isMinimized={persistentState.isMinimized}
          onDragStart={(event) => {
            dragHandlers.onMouseDown?.(event as any);
            dragHandlers.onTouchStart?.(event as any);
          }}
          onToggleMinimized={toggleMinimized}
        />
      </div>

      {/* Settings toggle (can be extended later) */}
      <div className="fixed bottom-4 right-4 z-40">
        <button
          onClick={toggleDraggable}
          className="bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground p-2 rounded-full shadow-lg transition-colors text-xs"
          title={persistentState.isDraggable ? "Disable dragging" : "Enable dragging"}
        >
          {persistentState.isDraggable ? "📌" : "🔒"}
        </button>
      </div>
    </>
  );
}