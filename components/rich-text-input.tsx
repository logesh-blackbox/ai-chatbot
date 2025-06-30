'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { Schema } from 'prosemirror-model';
import { keymap } from 'prosemirror-keymap';
import { baseKeymap } from 'prosemirror-commands';
import cx from 'classnames';
import { BoldIcon, ItalicIcon, CodeIcon } from './icons';
import styles from './rich-text-input.module.css';

const schema = new Schema({
  nodes: {
    doc: { content: 'block+' },
    paragraph: { group: 'block', content: 'inline*' },
    text: { group: 'inline' },
    hard_break: { group: 'inline', inline: true, selectable: false },
  },
  marks: {
    strong: {},
    em: {},
    code: {},
  },
});

export function RichTextInput({
  placeholder = 'Type a message...',
  onChange,
  onSubmit,
  className,
  initialValue = '',
  isLoading = false,
}: {
  placeholder?: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  className?: string;
  initialValue?: string;
  isLoading?: boolean;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView>();
  const [activeMarks, setActiveMarks] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!editorRef.current || viewRef.current) return;

    const state = EditorState.create({
      schema,
      doc: schema.node('doc', null, [
        schema.node('paragraph', null, initialValue ? [schema.text(initialValue)] : []),
      ]),
      plugins: [
        keymap({
          'Mod-b': toggleMark(schema.marks.strong),
          'Mod-i': toggleMark(schema.marks.em),
          'Mod-`': toggleMark(schema.marks.code),
          'Enter': () => {
            if (!isLoading) {
              onSubmit();
              return true;
            }
            return false;
          },
        }),
        keymap(baseKeymap),
      ],
    });

    const view = new EditorView(editorRef.current, {
      state,
      dispatchTransaction(transaction) {
        const newState = view.state.apply(transaction);
        view.updateState(newState);
        
        const doc = newState.doc;
        const content = [];
        doc.forEach(node => {
          node.forEach(child => {
            if (child.text) {
              content.push(child.text);
            }
          });
        });
        
        onChange(content.join('\n'));
        
        // Update active marks
        const { from, to } = newState.selection;
        const marks = new Set<string>();
        
        if (from === to) {
          // Cursor position - get marks from stored marks
          const storedMarks = newState.storedMarks || newState.selection.$from.marks();
          storedMarks.forEach(mark => marks.add(mark.type.name));
        } else {
          // Text selection - get marks from the selection
          newState.doc.nodesBetween(from, to, node => {
            node.marks.forEach(mark => marks.add(mark.type.name));
          });
        }
        
        setActiveMarks(marks);
      },
    });

    viewRef.current = view;

    return () => {
      view.destroy();
    };
  }, [onChange, onSubmit, initialValue, isLoading]);

  const toggleMark = useCallback((markType: any) => {
    return (state: EditorState, dispatch?: (tr: any) => void) => {
      const { empty, from, to } = state.selection;
      
      if (dispatch) {
        if (empty) {
          // Toggle mark in stored marks
          const marks = state.storedMarks || state.selection.$from.marks();
          const hasMatch = marks.some(mark => mark.type === markType);
          
          dispatch(state.tr.setStoredMarks(
            hasMatch
              ? marks.filter(mark => mark.type !== markType)
              : marks.concat(markType.create())
          ));
        } else {
          // Toggle mark in selection
          dispatch(state.tr.toggleMark(markType));
        }
      }
      return true;
    };
  }, []);

  return (
    <div className={cx('relative', className)}>
      <div className={styles.toolbar}>
        <div className={styles.toolbarGroup}>
          <button
            type="button"
            className={cx(styles.button, { [styles.active]: activeMarks.has('strong') })}
            onClick={() => toggleMark(schema.marks.strong)(viewRef.current!.state, viewRef.current!.dispatch)}
          >
            <BoldIcon />
          </button>
          <button
            type="button"
            className={cx(styles.button, { [styles.active]: activeMarks.has('em') })}
            onClick={() => toggleMark(schema.marks.em)(viewRef.current!.state, viewRef.current!.dispatch)}
          >
            <ItalicIcon />
          </button>
          <button
            type="button"
            className={cx(styles.button, { [styles.active]: activeMarks.has('code') })}
            onClick={() => toggleMark(schema.marks.code)(viewRef.current!.state, viewRef.current!.dispatch)}
          >
            <CodeIcon />
          </button>
        </div>
      </div>
      <div
        ref={editorRef}
        className="p-3 min-h-[100px] focus:outline-none"
        placeholder={placeholder}
      />
    </div>
  );
}
