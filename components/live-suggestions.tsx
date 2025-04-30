
'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Button } from './ui/button';

interface LiveSuggestion {
  suggestedText: string;
  description: string;
}

interface LiveSuggestionsProps {
  suggestions: LiveSuggestion[];
  onApply: (suggestion: string) => void;
  visible: boolean;
}

export function LiveSuggestions({ suggestions, onApply, visible }: LiveSuggestionsProps) {
  if (!visible || suggestions.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="absolute bottom-full mb-2 bg-background p-2 flex flex-col gap-2 rounded-lg border shadow-lg z-50 w-full"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
      >
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            className="flex flex-col gap-1 p-2 hover:bg-muted/50 rounded-md cursor-pointer"
            onClick={() => onApply(suggestion.suggestedText)}
          >
            <div className="text-sm font-medium">{suggestion.suggestedText}</div>
            <div className="text-xs text-muted-foreground">{suggestion.description}</div>
          </div>
        ))}
      </motion.div>
    </AnimatePresence>
  );
}
