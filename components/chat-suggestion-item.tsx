
'use client';

import { Button } from './ui/button';

interface ChatSuggestionItemProps {
  suggestion: string;
  onSelect: (suggestion: string) => void;
}

export function ChatSuggestionItem({ suggestion, onSelect }: ChatSuggestionItemProps) {
  return (
    <Button
      variant="ghost"
      className="w-full text-left px-3 py-2 text-sm hover:bg-muted/50 rounded-lg"
      onClick={() => onSelect(suggestion)}
    >
      {suggestion}
    </Button>
  );
}
