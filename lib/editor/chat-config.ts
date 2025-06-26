import { textblockTypeInputRule } from 'prosemirror-inputrules';
import { Schema } from 'prosemirror-model';
import { schema } from 'prosemirror-schema-basic';
import type { Transaction } from 'prosemirror-state';
import type { EditorView } from 'prosemirror-view';
import type { MutableRefObject } from 'react';

// Simplified schema for chat input - basic formatting only
export const chatSchema = new Schema({
  nodes: {
    doc: schema.spec.nodes.get('doc')!,
    paragraph: schema.spec.nodes.get('paragraph')!,
    text: schema.spec.nodes.get('text')!,
    hard_break: schema.spec.nodes.get('hard_break')!,
  },
  marks: {
    strong: schema.spec.marks.get('strong')!,
    em: schema.spec.marks.get('em')!,
    code: schema.spec.marks.get('code')!,
  },
});

export const handleChatTransaction = ({
  transaction,
  editorRef,
  onContentChange,
}: {
  transaction: Transaction;
  editorRef: MutableRefObject<EditorView | null>;
  onContentChange: (content: string) => void;
}) => {
  if (!editorRef || !editorRef.current) return;

  const newState = editorRef.current.state.apply(transaction);
  editorRef.current.updateState(newState);

  if (transaction.docChanged) {
    // Convert ProseMirror document to plain text for chat input
    const textContent = newState.doc.textContent;
    onContentChange(textContent);
  }
};

// Convert plain text to ProseMirror document
export function buildChatDocumentFromText(text: string) {
  const paragraphs = text.split('\n').map(line => 
    chatSchema.nodes.paragraph.create(null, line ? [chatSchema.text(line)] : [])
  );
  
  return chatSchema.nodes.doc.create(null, paragraphs.length > 0 ? paragraphs : [chatSchema.nodes.paragraph.create()]);
}

// Convert ProseMirror document to plain text
export function buildTextFromChatDocument(doc: any) {
  return doc.textContent;
}
