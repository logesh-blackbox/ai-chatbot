'use client';

import { Schema } from 'prosemirror-model';
import { EditorState, Transaction } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { keymap } from 'prosemirror-keymap';
import { baseKeymap, toggleMark, wrapIn, setBlockType } from 'prosemirror-commands';
import { wrapInList, splitListItem, liftListItem, sinkListItem } from 'prosemirror-schema-list';
import { history, undo, redo } from 'prosemirror-history';
import { InputRule, inputRules, wrappingInputRule, smartQuotes, emDash, ellipsis } from 'prosemirror-inputrules';
import React, { useEffect, useRef, forwardRef, useImperativeHandle, useState } from 'react';
import cx from 'classnames';
import styles from './rich-text-input.module.css';
import { 
  BoldIcon, 
  ItalicIcon, 
  CodeIcon,
  ListIcon,
  ListOrderedIcon,
  QuoteIcon,
  LinkIcon,
  StrikethroughIcon,
  UndoIcon,
  RedoIcon,
  TypeIcon
} from 'lucide-react';

// Define an enhanced schema for rich text editing
const schema = new Schema({
  nodes: {
    doc: {
      content: 'block+'
    },
    paragraph: {
      group: 'block',
      content: 'inline*',
      toDOM() { return ['p', 0] },
      parseDOM: [{ tag: 'p' }]
    },
    blockquote: {
      group: 'block',
      content: 'block+',
      defining: true,
      toDOM() { return ['blockquote', 0] },
      parseDOM: [{ tag: 'blockquote' }]
    },
    ordered_list: {
      group: 'block',
      content: 'list_item+',
      attrs: { order: { default: 1 } },
      toDOM(node) {
        return ['ol', { start: node.attrs.order == 1 ? null : node.attrs.order }, 0];
      },
      parseDOM: [{ 
        tag: 'ol', 
        getAttrs(dom) {
          return { order: (dom as HTMLElement).hasAttribute('start') ? +(dom as HTMLElement).getAttribute('start')! : 1 };
        }
      }]
    },
    bullet_list: {
      group: 'block',
      content: 'list_item+',
      toDOM() { return ['ul', 0] },
      parseDOM: [{ tag: 'ul' }]
    },
    list_item: {
      content: 'paragraph block*',
      toDOM() { return ['li', 0] },
      parseDOM: [{ tag: 'li' }],
      defining: true
    },
    text: {
      group: 'inline'
    },
    hard_break: {
      inline: true,
      group: 'inline',
      selectable: false,
      toDOM() { return ['br'] },
      parseDOM: [{ tag: 'br' }]
    }
  },
  marks: {
    strong: {
      toDOM() { return ['strong', 0] },
      parseDOM: [
        { tag: 'strong' },
        { tag: 'b' },
        { style: 'font-weight', getAttrs: (value) => /^(bold(er)?|[5-9]\d{2,})$/.test(value as string) && null }
      ]
    },
    em: {
      toDOM() { return ['em', 0] },
      parseDOM: [
        { tag: 'i' },
        { tag: 'em' },
        { style: 'font-style=italic' }
      ]
    },
    code: {
      toDOM() { return ['code', { class: 'inline-code' }, 0] },
      parseDOM: [{ tag: 'code' }]
    },
    strikethrough: {
      toDOM() { return ['s', 0] },
      parseDOM: [
        { tag: 's' },
        { tag: 'del' },
        { tag: 'strike' },
        { style: 'text-decoration', getAttrs: value => (value === 'line-through') && null }
      ]
    },
    link: {
      attrs: {
        href: {},
        title: { default: null }
      },
      inclusive: false,
      toDOM(node) {
        const { href, title } = node.attrs;
        return ['a', { href, title, target: '_blank', rel: 'noopener noreferrer' }, 0];
      },
      parseDOM: [{
        tag: 'a[href]',
        getAttrs(dom) {
          return {
            href: (dom as HTMLElement).getAttribute('href'),
            title: (dom as HTMLElement).getAttribute('title')
          };
        }
      }]
    }
  }
});

export type RichTextInputRef = {
  focus: () => void;
  getValue: () => string;
  getMarkdownValue: () => string;
  setValue: (content: string) => void;
  clearContent: () => void;
};

type RichTextInputProps = {
  placeholder?: string;
  onChange?: (value: string, markdown: string) => void;
  onSubmit?: () => void;
  className?: string;
  initialValue?: string;
  isLoading?: boolean;
};

// Helper function to serialize doc to markdown
function serializeToMarkdown(doc: any): string {
  let markdown = '';
  
  function serializeNode(node: any): string {
    let result = '';
    
    switch (node.type.name) {
      case 'paragraph':
        node.content?.forEach((child: any) => {
          result += serializeNode(child);
        });
        result += '\n\n';
        break;
        
      case 'blockquote':
        node.content?.forEach((child: any) => {
          const childContent = serializeNode(child).trim();
          result += '> ' + childContent.replace(/\n/g, '\n> ') + '\n';
        });
        break;
        
      case 'bullet_list':
        node.content?.forEach((item: any) => {
          result += '- ' + serializeNode(item).trim() + '\n';
        });
        result += '\n';
        break;
        
      case 'ordered_list':
        let order = node.attrs?.order || 1;
        node.content?.forEach((item: any) => {
          result += `${order}. ` + serializeNode(item).trim() + '\n';
          order++;
        });
        result += '\n';
        break;
        
      case 'list_item':
        node.content?.forEach((child: any) => {
          result += serializeNode(child).trim();
        });
        break;
        
      case 'text':
        let text = node.text;
        
        // Apply marks
        if (node.marks) {
          node.marks.forEach((mark: any) => {
            switch (mark.type.name) {
              case 'strong':
                text = `**${text}**`;
                break;
              case 'em':
                text = `*${text}*`;
                break;
              case 'code':
                text = `\`${text}\``;
                break;
              case 'strikethrough':
                text = `~~${text}~~`;
                break;
              case 'link':
                text = `[${text}](${mark.attrs.href}${mark.attrs.title ? ` "${mark.attrs.title}"` : ''})`;
                break;
            }
          });
        }
        result = text;
        break;
        
      case 'hard_break':
        result = '\n';
        break;
    }
    
    return result;
  }
  
  doc.content?.forEach((node: any) => {
    markdown += serializeNode(node);
  });
  
  return markdown.trim();
}

export const RichTextInput = forwardRef<RichTextInputRef, RichTextInputProps>(
  ({ placeholder = 'Send a message...', onChange, onSubmit, className, initialValue = '', isLoading = false }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const editorRef = useRef<EditorView | null>(null);
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [isCode, setIsCode] = useState(false);
    const [isStrikethrough, setIsStrikethrough] = useState(false);
    const [isLink, setIsLink] = useState(false);
    const [isList, setIsList] = useState(false);
    const [isOrderedList, setIsOrderedList] = useState(false);
    const [isBlockquote, setIsBlockquote] = useState(false);

    useImperativeHandle(ref, () => ({
      focus: () => {
        editorRef.current?.focus();
      },
      getValue: () => {
        if (!editorRef.current) return '';
        return editorRef.current.state.doc.textContent;
      },
      getMarkdownValue: () => {
        if (!editorRef.current) return '';
        return serializeToMarkdown(editorRef.current.state.doc);
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
        updateToolbarState(state);
      }
    }));

    const updateToolbarState = (state: EditorState) => {
      const { from, $from } = state.selection;
      const marks = $from.marks();
      
      setIsBold(marks.some(m => m.type === schema.marks.strong));
      setIsItalic(marks.some(m => m.type === schema.marks.em));
      setIsCode(marks.some(m => m.type === schema.marks.code));
      setIsStrikethrough(marks.some(m => m.type === schema.marks.strikethrough));
      setIsLink(marks.some(m => m.type === schema.marks.link));
      
      // Check for list nodes
      let node = $from.node($from.depth);
      let inList = false;
      let inOrderedList = false;
      let inBlockquote = false;
      
      for (let i = $from.depth; i >= 0; i--) {
        const n = $from.node(i);
        if (n.type === schema.nodes.bullet_list) {
          inList = true;
        } else if (n.type === schema.nodes.ordered_list) {
          inOrderedList = true;
        } else if (n.type === schema.nodes.blockquote) {
          inBlockquote = true;
        }
      }
      
      setIsList(inList);
      setIsOrderedList(inOrderedList);
      setIsBlockquote(inBlockquote);
    };

    const toggleMarkCommand = (markType: string) => {
      if (!editorRef.current) return;
      const { state, dispatch } = editorRef.current;
      const mark = schema.marks[markType];
      if (!mark) return;
      
      toggleMark(mark)(state, dispatch);
      editorRef.current.focus();
      updateToolbarState(editorRef.current.state);
    };

    const toggleList = (listType: 'bullet' | 'ordered') => {
      if (!editorRef.current) return;
      const { state, dispatch } = editorRef.current;
      const nodeType = listType === 'bullet' ? schema.nodes.bullet_list : schema.nodes.ordered_list;
      
      wrapInList(nodeType)(state, dispatch);
      editorRef.current.focus();
      updateToolbarState(editorRef.current.state);
    };

    const toggleBlockquote = () => {
      if (!editorRef.current) return;
      const { state, dispatch } = editorRef.current;
      
      wrapIn(schema.nodes.blockquote)(state, dispatch);
      editorRef.current.focus();
      updateToolbarState(editorRef.current.state);
    };

    const insertLink = () => {
      const url = prompt('Enter URL:');
      if (!url || !editorRef.current) return;
      
      const { state, dispatch } = editorRef.current;
      const { from, to } = state.selection;
      const mark = schema.marks.link.create({ href: url });
      
      if (from === to) {
        // No selection, insert URL as text with link
        const node = schema.text(url, [mark]);
        dispatch(state.tr.replaceSelectionWith(node));
      } else {
        // Apply link to selection
        dispatch(state.tr.addMark(from, to, mark));
      }
      
      editorRef.current.focus();
      updateToolbarState(editorRef.current.state);
    };

    const clearFormatting = () => {
      if (!editorRef.current) return;
      const { state, dispatch } = editorRef.current;
      const { from, to } = state.selection;
      
      // Remove all marks
      const tr = state.tr;
      Object.values(schema.marks).forEach(mark => {
        tr.removeMark(from, to, mark);
      });
      
      dispatch(tr);
      editorRef.current.focus();
      updateToolbarState(editorRef.current.state);
    };

    const handleUndo = () => {
      if (!editorRef.current) return;
      undo(editorRef.current.state, editorRef.current.dispatch);
      editorRef.current.focus();
    };

    const handleRedo = () => {
      if (!editorRef.current) return;
      redo(editorRef.current.state, editorRef.current.dispatch);
      editorRef.current.focus();
    };

    // Setup input rules for markdown shortcuts
    const buildInputRules = () => {
      const rules = smartQuotes.concat(ellipsis, emDash);
      
      // Bold: **text** or __text__
      rules.push(
        new InputRule(/(?:^|[^*])(\*\*|__)([^*_]+)(\*\*|__)$/, (state, match, start, end) => {
          const [, , text] = match;
          const tr = state.tr.delete(start + match.index! + match[0].indexOf(match[1]), end);
          const markStart = start + match.index! + match[0].indexOf(match[1]);
          const markEnd = markStart + text.length;
          return tr.addMark(markStart, markEnd, schema.marks.strong.create());
        })
      );
      
      // Italic: *text* or _text_
      rules.push(
        new InputRule(/(?:^|[^*_])([*_])([^*_]+)\1$/, (state, match, start, end) => {
          const [, delimiter, text] = match;
          const delimiterPos = match[0].lastIndexOf(delimiter);
          const tr = state.tr.delete(start + match.index! + delimiterPos, end);
          const markStart = start + match.index! + delimiterPos;
          const markEnd = markStart + text.length;
          return tr.addMark(markStart, markEnd, schema.marks.em.create());
        })
      );
      
      // Code: `text`
      rules.push(
        new InputRule(/`([^`]+)`$/, (state, match, start, end) => {
          const [, text] = match;
          const tr = state.tr.delete(start + match.index!, end);
          return tr.addMark(start + match.index!, start + match.index! + text.length, schema.marks.code.create());
        })
      );
      
      // Blockquote: > at start of line
      rules.push(wrappingInputRule(/^\s*>\s$/, schema.nodes.blockquote));
      
      // Bullet list: -, *, or + at start of line
      rules.push(
        wrappingInputRule(/^\s*([-+*])\s$/, schema.nodes.bullet_list)
      );
      
      // Ordered list: 1. at start of line
      rules.push(
        wrappingInputRule(/^\s*(\d+)\.\s$/, schema.nodes.ordered_list, match => ({order: +match[1]}),
          (match, node) => node.childCount + node.attrs.order === +match[1])
      );
      
      return inputRules({ rules });
    };

    const setupPlugins = () => {
      return [
        buildInputRules(),
        keymap({
          'Mod-b': () => { toggleMarkCommand('strong'); return true; },
          'Mod-i': () => { toggleMarkCommand('em'); return true; },
          'Mod-`': () => { toggleMarkCommand('code'); return true; },
          'Mod-Shift-s': () => { toggleMarkCommand('strikethrough'); return true; },
          'Mod-k': () => { insertLink(); return true; },
          'Mod-z': () => { handleUndo(); return true; },
          'Mod-y': () => { handleRedo(); return true; },
          'Mod-Shift-z': () => { handleRedo(); return true; },
          'Mod-\\': () => { clearFormatting(); return true; },
          'Tab': () => {
            if (!editorRef.current) return false;
            const { state } = editorRef.current;
            const { $from } = state.selection;
            
            // Check if we're in a list
            for (let i = $from.depth; i >= 0; i--) {
              const node = $from.node(i);
              if (node.type === schema.nodes.list_item) {
                sinkListItem(schema.nodes.list_item)(state, editorRef.current.dispatch);
                return true;
              }
            }
            return false;
          },
          'Shift-Tab': () => {
            if (!editorRef.current) return false;
            const { state } = editorRef.current;
            const { $from } = state.selection;
            
            // Check if we're in a list
            for (let i = $from.depth; i >= 0; i--) {
              const node = $from.node(i);
              if (node.type === schema.nodes.list_item) {
                liftListItem(schema.nodes.list_item)(state, editorRef.current.dispatch);
                return true;
              }
            }
            return false;
          },
          'Enter': () => {
            if (!editorRef.current) return false;
            const { state } = editorRef.current;
            const { $from } = state.selection;
            
            // Check if we're in a list
            for (let i = $from.depth; i >= 0; i--) {
              const node = $from.node(i);
              if (node.type === schema.nodes.list_item) {
                return splitListItem(schema.nodes.list_item)(state, editorRef.current.dispatch);
              }
            }
            return false;
          }
        }),
        keymap(baseKeymap),
        history()
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
            
            updateToolbarState(newState);
            
            if (onChange) {
              const content = newState.doc.textContent;
              const markdown = serializeToMarkdown(newState.doc);
              onChange(content, markdown);
            }
          },
          handleKeyDown: (view, event) => {
            if (event.key === 'Enter' && !event.shiftKey && onSubmit && !isLoading) {
              // Check if the content is not empty
              const content = view.state.doc.textContent.trim();
              if (content) {
                event.preventDefault();
                onSubmit();
                return true;
              }
            }
            return false;
          },
          attributes: {
            class: 'prose prose-sm max-w-none focus:outline-none',
            spellcheck: 'true'
          }
        });

        // Add placeholder functionality
        const updatePlaceholder = () => {
          if (!containerRef.current || !editorRef.current) return;
          const isEmpty = editorRef.current.state.doc.textContent.trim() === '';
          
          if (isEmpty) {
            containerRef.current.setAttribute('data-placeholder', placeholder);
          } else {
            containerRef.current.removeAttribute('data-placeholder');
          }
        };

        updatePlaceholder();
        
        // Update placeholder on changes
        const originalDispatch = editorRef.current.dispatch;
        editorRef.current.dispatch = (tr: Transaction) => {
          originalDispatch(tr);
          updatePlaceholder();
        };
      }

      return () => {
        if (editorRef.current) {
          editorRef.current.destroy();
          editorRef.current = null;
        }
      };
    }, [placeholder, onChange, onSubmit, isLoading, initialValue]);

    return (
      <div className="relative">
        <div className={styles.toolbar}>
          <div className={styles['toolbar-group']}>
            <button
              type="button"
              className={cx(styles.button, { [styles.active]: isBold })}
              onClick={() => toggleMarkCommand('strong')}
              title="Bold (Ctrl+B)"
              disabled={isLoading}
            >
              <BoldIcon size={16} />
            </button>
            <button
              type="button"
              className={cx(styles.button, { [styles.active]: isItalic })}
              onClick={() => toggleMarkCommand('em')}
              title="Italic (Ctrl+I)"
              disabled={isLoading}
            >
              <ItalicIcon size={16} />
            </button>
            <button
              type="button"
              className={cx(styles.button, { [styles.active]: isStrikethrough })}
              onClick={() => toggleMarkCommand('strikethrough')}
              title="Strikethrough (Ctrl+Shift+S)"
              disabled={isLoading}
            >
              <StrikethroughIcon size={16} />
            </button>
            <button
              type="button"
              className={cx(styles.button, { [styles.active]: isCode })}
              onClick={() => toggleMarkCommand('code')}
              title="Code (Ctrl+`)"
              disabled={isLoading}
            >
              <CodeIcon size={16} />
            </button>
          </div>
          
          <div className={styles['toolbar-group']}>
            <button
              type="button"
              className={cx(styles.button, { [styles.active]: isList })}
              onClick={() => toggleList('bullet')}
              title="Bullet List"
              disabled={isLoading}
            >
              <ListIcon size={16} />
            </button>
            <button
              type="button"
              className={cx(styles.button, { [styles.active]: isOrderedList })}
              onClick={() => toggleList('ordered')}
              title="Numbered List"
              disabled={isLoading}
            >
              <ListOrderedIcon size={16} />
            </button>
            <button
              type="button"
              className={cx(styles.button, { [styles.active]: isBlockquote })}
              onClick={toggleBlockquote}
              title="Quote"
              disabled={isLoading}
            >
              <QuoteIcon size={16} />
            </button>
          </div>
          
          <div className={styles['toolbar-group']}>
            <button
              type="button"
              className={cx(styles.button, { [styles.active]: isLink })}
              onClick={insertLink}
              title="Insert Link (Ctrl+K)"
              disabled={isLoading}
            >
              <LinkIcon size={16} />
            </button>
          </div>
          
          <div className={styles['toolbar-group']}>
            <button
              type="button"
              className={styles.button}
              onClick={clearFormatting}
              title="Clear Formatting (Ctrl+\)"
              disabled={isLoading}
            >
              <TypeIcon size={16} />
            </button>
          </div>
          
          <div className={styles['toolbar-group']}>
            <button
              type="button"
              className={styles.button}
              onClick={handleUndo}
              title="Undo (Ctrl+Z)"
              disabled={isLoading}
            >
              <UndoIcon size={16} />
            </button>
            <button
              type="button"
              className={styles.button}
              onClick={handleRedo}
              title="Redo (Ctrl+Y)"
              disabled={isLoading}
            >
              <RedoIcon size={16} />
            </button>
          </div>
        </div>
        <div 
          className={cx(
            'prosemirror-editor min-h-[60px] max-h-[calc(75dvh)] overflow-y-auto resize-none rounded-b-2xl !text-base bg-muted pb-10 dark:border-zinc-700 px-4 py-3',
            styles.editor,
            className
          )}
          ref={containerRef}
        />
      </div>
    );
  }
);

RichTextInput.displayName = 'RichTextInput';
