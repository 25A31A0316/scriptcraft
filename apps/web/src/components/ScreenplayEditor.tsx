import React, { useEffect, useMemo } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import Text from '@tiptap/extension-text';
import History from '@tiptap/extension-history';
import {
  ScreenplayKit,
  screenplayDocumentToTiptap,
  tiptapToScreenplayDocument,
} from '@screenplay/engine';
import { ScreenplayDocument, ScreenplayElementType, ScreenplayNode } from '@screenplay/schema';
import { paginateScreenplay } from '@screenplay/formatting';

interface ScreenplayEditorProps {
  initialDocument: ScreenplayDocument;
  spellcheckEnabled?: boolean;
  onDocumentChange: (updatedDoc: ScreenplayDocument) => void;
  onActiveElementChange?: (elementType: ScreenplayElementType) => void;
  onCursorChange?: (nodeId: string, offset: number) => void;
  onPaginationChange?: (totalPages: number) => void;
}

export const ScreenplayEditor: React.FC<ScreenplayEditorProps> = ({
  initialDocument,
  spellcheckEnabled = true,
  onDocumentChange,
  onActiveElementChange,
  onCursorChange,
  onPaginationChange,
}) => {
  const editor = useEditor({
    extensions: [
      Text,
      History.configure({
        depth: 100,
      }),
      ScreenplayKit,
    ],
    content: screenplayDocumentToTiptap(initialDocument),
    editorProps: {
      attributes: {
        class: 'screenplay-prosemirror-editor focus:outline-none',
        spellcheck: spellcheckEnabled ? 'true' : 'false',
      },
    },
    onUpdate: ({ editor: ed }) => {
      const json = ed.getJSON();
      const updated = tiptapToScreenplayDocument(json, initialDocument);
      onDocumentChange(updated);
    },
    onSelectionUpdate: ({ editor: ed }) => {
      const { $from } = ed.state.selection;
      if (onActiveElementChange && $from.parent) {
        const currentType = $from.parent.type.name as ScreenplayElementType;
        onActiveElementChange(currentType);
      }
      if (onCursorChange && $from.parent) {
        const nodeId = $from.parent.attrs?.id;
        if (nodeId) {
          onCursorChange(nodeId, $from.parentOffset);
        }
      }
    },
  });

  // Dynamically calculate pagination
  const paginationResult = useMemo(() => {
    return paginateScreenplay(initialDocument);
  }, [initialDocument]);

  useEffect(() => {
    if (onPaginationChange) {
      onPaginationChange(paginationResult.totalPages);
    }
  }, [paginationResult.totalPages, onPaginationChange]);

  // Synchronize document ID changes (e.g. opening different script or importing)
  useEffect(() => {
    if (editor && initialDocument) {
      const currentDocJson = editor.getJSON();
      const currentDoc = tiptapToScreenplayDocument(currentDocJson, initialDocument);
      if (currentDoc.id !== initialDocument.id) {
        editor.commands.setContent(screenplayDocumentToTiptap(initialDocument));
      }
    }
  }, [initialDocument.id, editor]);

  // Update spellcheck attribute dynamically
  useEffect(() => {
    if (editor?.view?.dom) {
      editor.view.dom.setAttribute('spellcheck', spellcheckEnabled ? 'true' : 'false');
    }
  }, [spellcheckEnabled, editor]);

  // Handle jump-to-scene
  useEffect(() => {
    const handleJumpToScene = (event: CustomEvent<{ sceneId: string }>) => {
      if (!editor) return;
      const targetId = event.detail.sceneId;

      let foundPos: number | null = null;
      editor.state.doc.descendants((node, pos) => {
        if (node.type.name === 'scene_heading' && node.attrs.id === targetId) {
          foundPos = pos;
          return false;
        }
        return true;
      });

      if (foundPos !== null) {
        editor.commands.focus(foundPos + 1);
        const domNode = editor.view.domAtPos(foundPos + 1).node;
        if (domNode instanceof HTMLElement) {
          domNode.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    };

    window.addEventListener('jump-to-scene' as any, handleJumpToScene as any);
    return () => {
      window.removeEventListener('jump-to-scene' as any, handleJumpToScene as any);
    };
  }, [editor]);

  // Insert screenplay nodes at the current cursor / selection position
  useEffect(() => {
    const handleInsertNodes = (event: CustomEvent<{ nodes: ScreenplayNode[] }>) => {
      if (!editor) return;
      const nodesToInsert = event.detail.nodes;
      if (!nodesToInsert || nodesToInsert.length === 0) return;

      const { state, dispatch } = editor.view;
      const { selection } = state;
      const { $from } = selection;

      let insertPos: number;
      if ($from && $from.parent && $from.parent.type.name !== 'doc') {
        insertPos = $from.after();
      } else {
        insertPos = state.doc.content.size;
      }

      const schema = state.schema;
      const pmNodes = nodesToInsert.map(n => {
        const nodeType = schema.nodes[n.type] || schema.nodes['action'];
        return nodeType.create(
          { id: n.id, ...(n.metadata || {}) },
          n.text ? schema.text(n.text) : null
        );
      });

      const tr = state.tr.insert(insertPos, pmNodes);
      dispatch(tr.scrollIntoView());
    };

    window.addEventListener('insert-screenplay-nodes' as any, handleInsertNodes as any);
    return () => {
      window.removeEventListener('insert-screenplay-nodes' as any, handleInsertNodes as any);
    };
  }, [editor]);

  return (
    <div className="screenplay-viewport">
      <div className="screenplay-page relative">
        {/* Dynamic Page Number Indicator */}
        <div
          style={{
            position: 'absolute',
            top: '2.5rem',
            right: '4rem',
            fontFamily: 'var(--font-script)',
            fontSize: '13px',
            color: 'var(--ink-muted)',
            letterSpacing: '0.05em',
            userSelect: 'none',
          }}
          title={`Total Estimated Pages: ${paginationResult.totalPages}`}
          id="editor-page-number-indicator"
        >
          {paginationResult.totalPages > 1 ? `1. (of ${paginationResult.totalPages})` : '1.'}
        </div>

        <EditorContent editor={editor} />
      </div>
    </div>
  );
};
