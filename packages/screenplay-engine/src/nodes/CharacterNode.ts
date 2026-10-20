import { Node, mergeAttributes } from '@tiptap/core';
import { v4 as uuidv4 } from 'uuid';

export const CharacterNode = Node.create({
  name: 'character',
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
      characterName: {
        default: '',
        parseHTML: element => element.getAttribute('data-character-name') || '',
        renderHTML: attributes => attributes.characterName ? {
          'data-character-name': attributes.characterName,
        } : {},
      },
      extension: {
        default: null,
        parseHTML: element => element.getAttribute('data-extension'),
        renderHTML: attributes => attributes.extension ? {
          'data-extension': attributes.extension,
        } : {},
      },
      isDualDialogue: {
        default: false,
        parseHTML: element => element.getAttribute('data-dual') === 'true',
        renderHTML: attributes => attributes.isDualDialogue ? {
          'data-dual': 'true',
        } : {},
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-element="character"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-element': 'character',
        class: 'screenplay-node screenplay-character',
      }),
      0,
    ];
  },
});
