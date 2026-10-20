import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import Text from '@tiptap/extension-text';
import History from '@tiptap/extension-history';
import {
  ScreenplayKit,
  screenplayDocumentToTiptap,
  tiptapToScreenplayDocument,
} from '@screenplay/engine';
import { ScreenplayDocument, ScreenplayElementType } from '@screenplay/schema';

interface ScreenplayEditorProps {
  initialDocument: ScreenplayDocument;
  onDocumentChange: (updatedDoc: ScreenplayDocument) => void;
  onActiveElementChange?: (elementType: ScreenplayElementType) => void;
}

export const ScreenplayEditor: React.FC<ScreenplayEditorProps> = ({
  initialDocument,
  onDocumentChange,
  onActiveElementChange,
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
        spellcheck: 'false',
      },
    },
    onUpdate: ({ editor: ed }) => {
      const json = ed.getJSON();
      const updated = tiptapToScreenplayDocument(json, initialDocument);
      onDocumentChange(updated);
    },
    onSelectionUpdate: ({ editor: ed }) => {
      if (onActiveElementChange) {
        const { $from } = ed.state.selection;
        const currentType = $from.parent.type.name as ScreenplayElementType;
        onActiveElementChange(currentType);
      }
    },
  });

  // Expose editor for scene navigation
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

  return (
    <div className="screenplay-viewport">
      <div className="screenplay-page">
        {/* Top-right Page Number Marker */}
        <div
          style={{
            position: 'absolute',
            top: '2.5rem',
            right: '4rem',
            fontFamily: 'var(--font-script)',
            fontSize: '14px',
            color: 'var(--ink-muted)',
            letterSpacing: '0.05em',
            userSelect: 'none',
          }}
        >
          1.
        </div>

        <EditorContent editor={editor} />
      </div>
    </div>
  );
};
