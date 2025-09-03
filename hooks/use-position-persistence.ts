import { useCallback, useEffect, useState } from 'react';
import { useLocalStorage } from 'usehooks-ts';
import type { Position } from './use-draggable';

export interface ChatInputState {
  position: Position;
  isMinimized: boolean;
  isDraggable: boolean;
  size: {
    width: number;
    height: number;
  };
}

const DEFAULT_STATE: ChatInputState = {
  position: { x: 20, y: window?.innerHeight - 200 || 400 },
  isMinimized: false,
  isDraggable: true,
  size: {
    width: 400,
    height: 120,
  },
};

export function usePositionPersistence(chatId?: string) {
  const storageKey = `chat-input-state${chatId ? `-${chatId}` : ''}`;
  
  const [storedState, setStoredState] = useLocalStorage<ChatInputState>(
    storageKey,
    DEFAULT_STATE
  );

  const [state, setState] = useState<ChatInputState>(storedState);

  // Update localStorage when state changes
  useEffect(() => {
    setStoredState(state);
  }, [state, setStoredState]);

  // Validate position on window resize
  useEffect(() => {
    const handleResize = () => {
      setState(prevState => {
        const maxX = window.innerWidth - prevState.size.width;
        const maxY = window.innerHeight - prevState.size.height;
        
        const validatedPosition = {
          x: Math.max(0, Math.min(prevState.position.x, maxX)),
          y: Math.max(0, Math.min(prevState.position.y, maxY)),
        };

        if (
          validatedPosition.x !== prevState.position.x ||
          validatedPosition.y !== prevState.position.y
        ) {
          return {
            ...prevState,
            position: validatedPosition,
          };
        }
        
        return prevState;
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const updatePosition = useCallback((position: Position) => {
    setState(prev => ({ ...prev, position }));
  }, []);

  const toggleMinimized = useCallback(() => {
    setState(prev => ({ ...prev, isMinimized: !prev.isMinimized }));
  }, []);

  const toggleDraggable = useCallback(() => {
    setState(prev => ({ ...prev, isDraggable: !prev.isDraggable }));
  }, []);

  const updateSize = useCallback((size: { width: number; height: number }) => {
    setState(prev => ({ ...prev, size }));
  }, []);

  const resetToDefault = useCallback(() => {
    const defaultWithCurrentViewport = {
      ...DEFAULT_STATE,
      position: {
        x: 20,
        y: window.innerHeight - 200,
      },
    };
    setState(defaultWithCurrentViewport);
  }, []);

  const setPresetPosition = useCallback((preset: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right' | 'center') => {
    const { width, height } = state.size;
    let position: Position;

    switch (preset) {
      case 'bottom-left':
        position = { x: 20, y: window.innerHeight - height - 20 };
        break;
      case 'bottom-right':
        position = { x: window.innerWidth - width - 20, y: window.innerHeight - height - 20 };
        break;
      case 'top-left':
        position = { x: 20, y: 20 };
        break;
      case 'top-right':
        position = { x: window.innerWidth - width - 20, y: 20 };
        break;
      case 'center':
        position = { 
          x: (window.innerWidth - width) / 2, 
          y: (window.innerHeight - height) / 2 
        };
        break;
      default:
        position = state.position;
    }

    setState(prev => ({ ...prev, position }));
  }, [state.size, state.position]);

  return {
    state,
    updatePosition,
    toggleMinimized,
    toggleDraggable,
    updateSize,
    resetToDefault,
    setPresetPosition,
  };
}