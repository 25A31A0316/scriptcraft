import { Extension } from '@tiptap/core';
import { TextSelection } from '@tiptap/pm/state';
import { v4 as uuidv4 } from 'uuid';
import {
  getNextElementTypeOnEnter,
  getNextElementTypeOnTab,
  ScreenplayElementType,
} from '@screenplay/schema';

export const ScreenplayKeyboardNavigation = Extension.create({
  name: 'screenplayKeyboardNavigation',

  addKeyboardShortcuts() {
    return {
      Enter: ({ editor }) => {
        const { state, dispatch } = editor.view;
        const { selection } = state;
        const { $from } = selection;

        // Current parent node containing the cursor
        const currentNode = $from.parent;
        const currentType = currentNode.type.name as ScreenplayElementType;

        const isScreenplayBlock = [
          'scene_heading',
          'action',
          'character',
          'parenthetical',
          'dialogue',
          'transition',
          'shot',
        ].includes(currentType);

        if (!isScreenplayBlock) {
          return false;
        }

        const isEmpty = currentNode.textContent.trim().length === 0;
        const targetType = getNextElementTypeOnEnter(currentType, isEmpty);
        const schema = state.schema;
        const targetNodeType = schema.nodes[targetType];

        if (!targetNodeType) {
          return false;
        }

        // Check if cursor is at the very end of current node
        const isAtEnd = $from.parentOffset === currentNode.content.size;

        if (isAtEnd) {
          const tr = state.tr;
          const pos = $from.after();
          const newNode = targetNodeType.createAndFill({
            id: uuidv4(),
          });

          if (!newNode) return false;

          tr.insert(pos, newNode);
          // Move cursor inside the new node using TextSelection
          tr.setSelection(TextSelection.create(tr.doc, pos + 1));
          dispatch(tr.scrollIntoView());
          return true;
        }

        // If in middle of line, split the block
        const tr = state.tr;
        tr.split($from.pos, 1, [{ type: targetNodeType, attrs: { id: uuidv4() } }]);
        dispatch(tr.scrollIntoView());
        return true;
      },

      Tab: ({ editor }) => {
        const { state, dispatch } = editor.view;
        const { selection } = state;
        const { $from } = selection;
        const currentNode = $from.parent;
        const currentType = currentNode.type.name as ScreenplayElementType;

        const targetType = getNextElementTypeOnTab(currentType, false);
        const targetNodeType = state.schema.nodes[targetType];

        if (!targetNodeType) {
          return false;
        }

        const tr = state.tr;
        const fromPos = $from.before();

        tr.setNodeMarkup(fromPos, targetNodeType, {
          ...currentNode.attrs,
          id: currentNode.attrs.id || uuidv4(),
        });

        dispatch(tr.scrollIntoView());
        return true;
      },

      'Shift-Tab': ({ editor }) => {
        const { state, dispatch } = editor.view;
        const { selection } = state;
        const { $from } = selection;
        const currentNode = $from.parent;
        const currentType = currentNode.type.name as ScreenplayElementType;

        const targetType = getNextElementTypeOnTab(currentType, true);
        const targetNodeType = state.schema.nodes[targetType];

        if (!targetNodeType) {
          return false;
        }

        const tr = state.tr;
        const fromPos = $from.before();

        tr.setNodeMarkup(fromPos, targetNodeType, {
          ...currentNode.attrs,
          id: currentNode.attrs.id || uuidv4(),
        });

        dispatch(tr.scrollIntoView());
        return true;
      },

      Backspace: ({ editor }) => {
        const { state, dispatch } = editor.view;
        const { selection } = state;
        const { $from, empty } = selection;
        const currentNode = $from.parent;
        const currentType = currentNode.type.name;

        // If at start of empty non-action element, revert it to Action
        if (
          empty &&
          $from.parentOffset === 0 &&
          currentNode.textContent.length === 0 &&
          currentType !== 'action' &&
          currentType !== 'doc'
        ) {
          const actionNodeType = state.schema.nodes['action'];
          if (actionNodeType) {
            const tr = state.tr;
            tr.setNodeMarkup($from.before(), actionNodeType, {
              id: currentNode.attrs.id || uuidv4(),
            });
            dispatch(tr.scrollIntoView());
            return true;
          }
        }

        return false;
      },
    };
  },
});
