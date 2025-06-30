'use client';

import { exampleSetup } from 'prosemirror-example-setup';
import { Schema } from 'prosemirror-model';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { keymap } from 'prosemirror-keymap';
import React, { useEffect, useRef, forwardRef, useImperativeHandle, useState } from 'react';
import cx from 'classnames';
import styles from './rich-text-input.module.css';
import { BoldIcon, ItalicIcon, CodeIcon, UnderlineIcon, StrikethroughIcon, HeadingIcon, ListBulletIcon, ListNumberedIcon } from './icons';
import { Node } from 'prosemirror-model';
import { Selection } from 'prosemirror-state';

const findParentNode = (predicate: (node: Node) => boolean) => (selection: Selection) => {
  let depth = selection.$from.depth;
  while (depth > 0) {
    const node = selection.$from.node(depth);
    if (predicate(node)) {
      return {
        pos: selection.$from.start(depth),
        start: selection.$from.start(depth),
        depth,
        node
      };
    }
    depth--;
  }
  return null;
};

// Define a basic schema for chat messages
const schema = new Schema({
  nodes: {
    doc: {
      content: 'block+'
    },
    paragraph: {
      group: 'block',
      content: 'inline*',
      toDOM() { return ['p', 0] }
    },
    heading: {
      attrs: { level: { default: 1 } },
      content: 'inline*',
      group: 'block',
      defining: true,
      toDOM(node) { return [`h${node.attrs.level}`, 0] }
    },
    bullet_list: {
      content: 'list_item+',
      group: 'block',
      toDOM() { return ['ul', 0] }
    },
    ordered_list: {
      content: 'list_item+',
      group: 'block',
      toDOM() { return ['ol', 0] }
    },
    list_item: {
      content: 'paragraph block*',
      toDOM() { return ['li', 0] }
    },
    text: {
      group: 'inline'
    }
  },
  marks: {
    strong: {
      toDOM() { return ['strong', 0] }
    },
    em: {
      toDOM() { return ['em', 0] }
    },
    code: {
      toDOM() { return ['code', 0] }
    },
    underline: {
      toDOM() { return ['u', 0] }
    },
    strike: {
      toDOM() { return ['s', 0] }
    }
  }
});

export type RichTextInputRef = {
  focus: () => void;
  getValue: () => string;
  setValue: (content: string) => void;
  clearContent: () => void;
};

type RichTextInputProps = {
  placeholder?: string;
  onChange?: (value: string) => void;
  onSubmit?: () => void;
  className?: string;
  initialValue?: string;
  isLoading?: boolean;
};

export const RichTextInput = forwardRef<RichTextInputRef, RichTextInputProps>(
  ({ placeholder = 'Send a message...', onChange, onSubmit, className, initialValue = '', isLoading = false }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const editorRef = useRef<EditorView | null>(null);

    useImperativeHandle(ref, () => ({
      focus: () => {
        editorRef.current?.focus();
      },
      getValue: () => {
        if (!editorRef.current) return '';
        const content = editorRef.current.state.doc.textContent;
        return content;
      },
      setValue: (content: string) => {
        if (!editorRef.current) return;
        const state = EditorState.create({
          schema,
          doc: schema.node('doc', null, [
            schema.node('paragraph', null, content ? [schema.text(content)] : [])
          ]),
          plugins: setupPlugins()
        });
        editorRef.current.updateState(state);
      },
      clearContent: () => {
        if (!editorRef.current) return;
        const state = EditorState.create({
          schema,
          doc: schema.node('doc', null, [schema.node('paragraph')]),
          plugins: setupPlugins()
        });
        editorRef.current.updateState(state);
      }
    }));

    const toggleMark = (markType: string) => {
      if (!editorRef.current) return false;
      const { state, dispatch } = editorRef.current;
      const { schema, selection, tr } = state;
      const mark = schema.marks[markType];
      
      if (!mark) return false;
      
      if (selection.empty) {
        // Toggle mark on/off at cursor position
        const marks = selection.$from.marks();
        const has = marks.some(m => m.type === mark);
        tr.addStoredMark(mark, has ? null : mark.create());
      } else {
        // Toggle mark on/off in selection
        const has = state.doc.rangeHasMark(selection.from, selection.to, mark);
        if (has) {
          tr.removeMark(selection.from, selection.to, mark);
        } else {
          tr.addMark(selection.from, selection.to, mark.create());
        }
      }
      
      dispatch(tr);
      
      // Update toolbar state
      switch (markType) {
        case 'strong':
          setIsBold(!isBold);
          break;
        case 'em':
          setIsItalic(!isItalic);
          break;
        case 'code':
          setIsCode(!isCode);
          break;
        case 'underline':
          setIsUnderline(!isUnderline);
          break;
        case 'strike':
          setIsStrike(!isStrike);
          break;
      }
      return true;
    };

    const setupPlugins = () => {
      return [
        ...exampleSetup({ 
          schema,
          menuBar: false,
          history: true,
          keymap: true
        }),
        keymap({
          'Mod-b': () => toggleMark('strong'),
          'Mod-i': () => toggleMark('em'),
          'Mod-`': () => toggleMark('code'),
          'Mod-u': () => toggleMark('underline'),
          'Mod-Shift-x': () => toggleMark('strike'),
          'Mod-Shift-7': () => toggleList('ordered_list'),
          'Mod-Shift-8': () => toggleList('bullet_list'),
          'Mod-Alt-2': () => toggleHeading(2)
        })
      ];
    };

    useEffect(() => {
      if (containerRef.current && !editorRef.current) {
        const state = EditorState.create({
          schema,
          doc: schema.node('doc', null, [
            schema.node('paragraph', null, initialValue ? [schema.text(initialValue)] : [])
          ]),
          plugins: setupPlugins()
        });

        editorRef.current = new EditorView(containerRef.current, {
          state,
          dispatchTransaction: transaction => {
            if (!editorRef.current) return;
            
            const newState = editorRef.current.state.apply(transaction);
            editorRef.current.updateState(newState);
            
             // Update toolbar state based on marks at cursor position
             const marks = newState.selection.$from.marks();
             setIsBold(marks.some(m => m.type === schema.marks.strong));
             setIsItalic(marks.some(m => m.type === schema.marks.em));
             setIsCode(marks.some(m => m.type === schema.marks.code));
             setIsUnderline(marks.some(m => m.type === schema.marks.underline));
             setIsStrike(marks.some(m => m.type === schema.marks.strike));
             
             // Update block-level formatting states
             const { $from } = newState.selection;
             const currentBlock = $from.parent;
             setIsHeading(currentBlock.type === schema.nodes.heading);
             setIsBulletList(!!findParentNode(node => node.type === schema.nodes.bullet_list)(newState.selection));
             setIsNumberedList(!!findParentNode(node => node.type === schema.nodes.ordered_list)(newState.selection));
             
              const content = newState.doc.textContent;
              onChange(content);
            }
          },
          handleKeyDown: (view, event) => {
            if (event.key === 'Enter' && !event.shiftKey && onSubmit && !isLoading) {
              event.preventDefault();
              onSubmit();
              return true;
            }
            return false;
          }
        });

        // Set placeholder
        const placeholder = document.createElement('span');
        placeholder.className = 'placeholder';
        placeholder.textContent = 'Send a message...';
        containerRef.current.appendChild(placeholder);
      }

      return () => {
        if (editorRef.current) {
          editorRef.current.destroy();
          editorRef.current = null;
        }
      };
    }, []);

    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [isCode, setIsCode] = useState(false);
    const [isUnderline, setIsUnderline] = useState(false);
    const [isStrike, setIsStrike] = useState(false);
    const [isHeading, setIsHeading] = useState(false);
    const [isBulletList, setIsBulletList] = useState(false);
    const [isNumberedList, setIsNumberedList] = useState(false);

    const toggleList = (listType: 'bullet_list' | 'ordered_list') => {
      if (!editorRef.current) return false;
      const { state, dispatch } = editorRef.current;
      const { schema, selection, tr } = state;
      const listNode = schema.nodes[listType];
      const paragraphNode = schema.nodes.paragraph;
      
      if (!listNode || !paragraphNode) return false;
      
      const { $from, $to } = selection;
      const range = $from.blockRange($to);
      
      if (!range) return false;
      
      const parentList = findParentNode(node => node.type === listNode)(selection);
      
      if (parentList) {
        // If already in a list, convert back to paragraphs
        tr.setBlockType(range.start, range.end, paragraphNode);
      } else {
        // Convert to list
        const listItem = schema.nodes.list_item;
        tr.wrap(range, [{ type: listNode }, { type: listItem }]);
      }
      
      dispatch(tr);
      return true;
    };

    const toggleHeading = (level: number) => {
      if (!editorRef.current) return false;
      const { state, dispatch } = editorRef.current;
      const { schema, selection, tr } = state;
      const headingType = schema.nodes.heading;
      const paragraphType = schema.nodes.paragraph;
      
      if (!headingType) return false;
      
      const { $from, $to } = selection;
      const range = $from.blockRange($to);
      
      if (!range) return false;
      
      const isHeading = $from.parent.type === headingType && $from.parent.attrs.level === level;
      
      tr.setBlockType(
        range.start,
        range.end,
        isHeading ? paragraphType : headingType,
        isHeading ? {} : { level }
      );
      
      dispatch(tr);
      setIsHeading(!isHeading);
      return true;
    };

    return (
      <div className="relative">
        <div className={styles.toolbar}>
          <div className={styles['toolbar-group']}>
            <button
              type="button"
              className={cx(styles.button, { [styles.active]: isBold })}
              onClick={() => toggleMark('strong')}
              title="Bold (Ctrl+B)"
            >
              <BoldIcon size={16} />
            </button>
            <button
              type="button"
              className={cx(styles.button, { [styles.active]: isItalic })}
              onClick={() => toggleMark('em')}
              title="Italic (Ctrl+I)"
            >
              <ItalicIcon size={16} />
            </button>
            <button
              type="button"
              className={cx(styles.button, { [styles.active]: isUnderline })}
              onClick={() => toggleMark('underline')}
              title="Underline (Ctrl+U)"
            >
              <UnderlineIcon size={16} />
            </button>
            <button
              type="button"
              className={cx(styles.button, { [styles.active]: isStrike })}
              onClick={() => toggleMark('strike')}
              title="Strikethrough (Ctrl+Shift+X)"
            >
              <StrikethroughIcon size={16} />
            </button>
            <button
              type="button"
              className={cx(styles.button, { [styles.active]: isCode })}
              onClick={() => toggleMark('code')}
              title="Code (Ctrl+`)"
            >
              <CodeIcon size={16} />
            </button>
          </div>
          <div className={styles['toolbar-group']}>
            <button
              type="button"
              className={cx(styles.button, { [styles.active]: isHeading })}
              onClick={() => toggleHeading(2)}
              title="Heading"
            >
              <HeadingIcon size={16} />
            </button>
            <button
              type="button"
              className={cx(styles.button, { [styles.active]: isBulletList })}
              onClick={() => toggleList('bullet_list')}
              title="Bullet List"
            >
              <ListBulletIcon size={16} />
            </button>
            <button
              type="button"
              className={cx(styles.button, { [styles.active]: isNumberedList })}
              onClick={() => toggleList('ordered_list')}
              title="Numbered List"
            >
              <ListNumberedIcon size={16} />
            </button>
          </div>
        </div>
        <div 
          className={cx(
            'prosemirror-editor min-h-[24px] max-h-[calc(75dvh)] overflow-y-auto resize-none rounded-2xl !text-base bg-muted pb-10 dark:border-zinc-700 px-3 py-2',
            className
          )}
          ref={containerRef}
        />
      </div>
    );
  }
);

RichTextInput.displayName = 'RichTextInput';
