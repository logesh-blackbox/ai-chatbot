'use client';

import { keymap } from 'prosemirror-keymap';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { toggleMark } from 'prosemirror-commands';
import { baseKeymap } from 'prosemirror-commands';
import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import cx from 'classnames';

import {
  chatSchema,
  handleChatTransaction,
  buildChatDocumentFromText,
} from '@/lib/editor/chat-config';

interface RichTextChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  autoFocus?: boolean;
}

export interface RichTextChatInputRef {
  focus: () => void;
  blur: () => void;
}

const RichTextChatInput = forwardRef<RichTextChatInputRef, RichTextChatInputProps>(
  ({ value, onChange, onSubmit, placeholder = "Send a message...", className, disabled = false, autoFocus = false }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const editorRef = useRef<EditorView | null>(null);

    useImperativeHandle(ref, () => ({
      focus: () => {
        if (editorRef.current) {
          editorRef.current.focus();
        }
      },
      blur: () => {
        if (editorRef.current) {
          editorRef.current.dom.blur();
        }
      },
    }));

    useEffect(() => {
      if (containerRef.current && !editorRef.current) {
        const doc = buildChatDocumentFromText(value || '');
        
        const state = EditorState.create({
          doc,
          plugins: [
            keymap({
              ...baseKeymap,
              'Enter': (state, dispatch) => {
                if (disabled) return false;
                onSubmit();
                return true;
              },
              'Shift-Enter': (state, dispatch) => {
                // Insert line break
                if (dispatch) {
                  dispatch(state.tr.replaceSelectionWith(chatSchema.nodes.hard_break.create()));
                }
                return true;
              },
              'Mod-b': toggleMark(chatSchema.marks.strong),
              'Mod-i': toggleMark(chatSchema.marks.em),
              'Mod-`': toggleMark(chatSchema.marks.code),
            }),
          ],
        });

        editorRef.current = new EditorView(containerRef.current, {
          state,
          dispatchTransaction: (transaction) => {
            handleChatTransaction({
              transaction,
              editorRef,
              onContentChange: onChange,
            });
          },
          editable: () => !disabled,
          attributes: {
            class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none',
            'data-placeholder': placeholder,
          },
        });

        if (autoFocus) {
          editorRef.current.focus();
        }
      }

      return () => {
        if (editorRef.current) {
          editorRef.current.destroy();
          editorRef.current = null;
        }
      };
    }, []);

    // Update editor content when value prop changes
    useEffect(() => {
      if (editorRef.current && value !== editorRef.current.state.doc.textContent) {
        const newDoc = buildChatDocumentFromText(value || '');
        const transaction = editorRef.current.state.tr.replaceWith(
          0,
          editorRef.current.state.doc.content.size,
          newDoc.content,
        );
        transaction.setMeta('no-save', true);
        editorRef.current.dispatch(transaction);
      }
    }, [value]);

    // Update disabled state
    useEffect(() => {
      if (editorRef.current) {
        editorRef.current.setProps({
          editable: () => !disabled,
        });
      }
    }, [disabled]);

    return (
      <div
        ref={containerRef}
        className={cx(
          'min-h-[24px] max-h-[calc(75dvh)] overflow-hidden resize-none rounded-2xl bg-muted pb-10 dark:border-zinc-700 border p-3',
          '[&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[24px] [&_.ProseMirror]:max-h-[calc(75dvh-24px)] [&_.ProseMirror]:overflow-y-auto',
          '[&_.ProseMirror]:text-base [&_.ProseMirror]:leading-6',
          '[&_.ProseMirror]:empty:before:content-[attr(data-placeholder)] [&_.ProseMirror]:empty:before:text-muted-foreground [&_.ProseMirror]:empty:before:pointer-events-none [&_.ProseMirror]:empty:before:absolute',
          disabled && 'opacity-50 cursor-not-allowed',
          className,
        )}
      />
    );
  }
);

RichTextChatInput.displayName = 'RichTextChatInput';

export { RichTextChatInput };
