import { Node, mergeAttributes } from '@tiptap/core';
import { v4 as uuidv4 } from 'uuid';

export const ShotNode = Node.create({
  name: 'shot',
  group: 'screenplayBlock',
  content: 'inline*',
  defining: true,

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: element => element.getAttribute('data-node-id') || uuidv4(),
        renderHTML: attributes => ({
          'data-node-id': attributes.id || uuidv4(),
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-element="shot"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-element': 'shot',
        class: 'screenplay-node screenplay-shot',
      }),
      0,
    ];
  },
});
