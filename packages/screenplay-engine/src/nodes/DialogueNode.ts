import { Node, mergeAttributes } from '@tiptap/core';
import { v4 as uuidv4 } from 'uuid';

export const DialogueNode = Node.create({
  name: 'dialogue',
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
      dualSide: {
        default: null,
        parseHTML: element => element.getAttribute('data-dual-side'),
        renderHTML: attributes => attributes.dualSide ? {
          'data-dual-side': attributes.dualSide,
        } : {},
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-element="dialogue"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-element': 'dialogue',
        class: 'screenplay-node screenplay-dialogue',
      }),
      0,
    ];
  },
});
