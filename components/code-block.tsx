'use client';

import { useState } from 'react';
import { Button } from './ui/button';

interface CodeBlockProps {
  node: any;
  inline: boolean;
  className: string;
  children: any;
}

export function CodeBlock({
  node,
  inline,
  className,
  children,
  ...props
}: CodeBlockProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!inline) {
    const content = children.toString();
    const lines = content.split('\n');
    const shouldMinimize = lines.length > 3;
    const displayedLines = isExpanded ? lines : lines.slice(0, 3);
    
    return (
      <div className="not-prose flex flex-col relative group">
        <pre
          {...props}
          className={`text-sm w-full overflow-x-auto dark:bg-zinc-900 p-4 border border-zinc-200 dark:border-zinc-700 rounded-xl dark:text-zinc-50 text-zinc-900 ${
            !isExpanded && shouldMinimize ? 'max-h-[120px]' : ''
          }`}
        >
          <code className="whitespace-pre-wrap break-words">
            {displayedLines.join('\n')}
            {!isExpanded && shouldMinimize && '...'}
          </code>
        </pre>
        {shouldMinimize && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </Button>
        )}
        {shouldMinimize && !isExpanded && (
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white dark:from-zinc-900 to-transparent pointer-events-none" />
        )}
      </div>
    );
  } else {
    return (
      <code
        className={`${className} text-sm bg-zinc-100 dark:bg-zinc-800 py-0.5 px-1 rounded-md`}
        {...props}
      >
        {children}
      </code>
    );
  }
}
