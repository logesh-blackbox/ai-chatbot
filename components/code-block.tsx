'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Play, Copy, ChevronDown, ChevronRight, Loader2 } from 'lucide-react';

interface CodeBlockProps {
  node: any;
  inline: boolean;
  className: string;
  children: any;
}

interface ExecutionResult {
  success: boolean;
  output: string;
  error: string | null;
}

export function CodeBlock({
  node,
  inline,
  className,
  children,
  ...props
}: CodeBlockProps) {
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [showOutput, setShowOutput] = useState(false);

  // Extract language from className (e.g., "language-python" -> "python")
  const language = className?.replace('language-', '') || '';
  const isExecutable = language === 'python' || language === 'javascript';
  const codeContent = String(children).replace(/\n$/, '');

  const executeCode = async () => {
    if (!isExecutable) return;

    setIsExecuting(true);
    setExecutionResult(null);
    setShowOutput(true);

    try {
      const response = await fetch(`/api/execute/${language}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: codeContent }),
      });

      const result = await response.json();
      setExecutionResult(result);
    } catch (error) {
      setExecutionResult({
        success: false,
        output: '',
        error: 'Failed to execute code. Please try again.',
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(codeContent);
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = codeContent;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  };

  if (!inline) {
    return (
      <div className="not-prose flex flex-col">
        <div className="flex items-center justify-between bg-zinc-100 dark:bg-zinc-800 px-4 py-2 border border-zinc-200 dark:border-zinc-700 rounded-t-xl">
          <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            {language || 'code'}
          </span>
          <div className="flex items-center gap-2">
            {isExecutable && (
              <Button
                size="sm"
                variant="ghost"
                onClick={executeCode}
                disabled={isExecuting}
                className="h-6 px-2 text-xs"
              >
                {isExecuting ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Play className="h-3 w-3" />
                )}
                {isExecuting ? 'Running...' : 'Run'}
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={copyCode}
              className="h-6 px-2 text-xs"
            >
              <Copy className="h-3 w-3" />
              Copy
            </Button>
          </div>
        </div>
        <pre
          {...props}
          className={`text-sm w-full overflow-x-auto dark:bg-zinc-900 p-4 border-x border-zinc-200 dark:border-zinc-700 ${
            executionResult || isExecutable ? 'border-b-0 rounded-b-none' : 'border-b rounded-b-xl'
          } dark:text-zinc-50 text-zinc-900`}
        >
          <code className="whitespace-pre-wrap break-words">{children}</code>
        </pre>
        
        {isExecutable && (executionResult || isExecuting) && (
          <div className="border border-t-0 border-zinc-200 dark:border-zinc-700 rounded-b-xl">
            <button
              onClick={() => setShowOutput(!showOutput)}
              className="flex items-center gap-2 w-full px-4 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              {showOutput ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
              Output
            </button>
            
            {showOutput && (
              <div className="border-t border-zinc-200 dark:border-zinc-700 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-b-xl">
                {isExecuting ? (
                  <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Executing code...
                  </div>
                ) : executionResult ? (
                  <div className="space-y-2">
                    {executionResult.output && (
                      <div>
                        <div className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                          Output:
                        </div>
                        <pre className="text-sm bg-white dark:bg-zinc-800 p-2 rounded border border-zinc-200 dark:border-zinc-700 overflow-x-auto">
                          <code>{executionResult.output}</code>
                        </pre>
                      </div>
                    )}
                    {executionResult.error && (
                      <div>
                        <div className="text-xs font-medium text-red-600 dark:text-red-400 mb-1">
                          Error:
                        </div>
                        <pre className="text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded border border-red-200 dark:border-red-800 overflow-x-auto text-red-700 dark:text-red-300">
                          <code>{executionResult.error}</code>
                        </pre>
                      </div>
                    )}
                    {!executionResult.output && !executionResult.error && (
                      <div className="text-sm text-zinc-500 dark:text-zinc-400">
                        No output
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            )}
          </div>
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
