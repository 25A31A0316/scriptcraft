import { Node, mergeAttributes } from '@tiptap/core';
import { v4 as uuidv4 } from 'uuid';

export const SceneHeadingNode = Node.create({
  name: 'scene_heading',
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
      sceneNumber: {
        default: null,
        parseHTML: element => element.getAttribute('data-scene-number'),
        renderHTML: attributes => attributes.sceneNumber ? {
          'data-scene-number': attributes.sceneNumber,
        } : {},
      },
      environment: {
        default: 'INT.',
        parseHTML: element => element.getAttribute('data-env') || 'INT.',
        renderHTML: attributes => ({
          'data-env': attributes.environment,
        }),
      },
      location: {
        default: '',
        parseHTML: element => element.getAttribute('data-location') || '',
        renderHTML: attributes => ({
          'data-location': attributes.location,
        }),
      },
      timeOfDay: {
        default: 'DAY',
        parseHTML: element => element.getAttribute('data-time') || 'DAY',
        renderHTML: attributes => ({
          'data-time': attributes.timeOfDay,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-element="scene_heading"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-element': 'scene_heading',
        class: 'screenplay-node screenplay-scene-heading',
      }),
      0,
    ];
  },
});
