import { Node, mergeAttributes } from '@tiptap/core';
import { v4 as uuidv4 } from 'uuid';

export const ActionNode = Node.create({
  name: 'action',
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
        tag: 'div[data-element="action"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-element': 'action',
        class: 'screenplay-node screenplay-action',
      }),
      0,
    ];
  },
});
