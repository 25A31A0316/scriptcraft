import { Extension } from '@tiptap/core';
import { ScreenplayDocumentNode } from '../nodes/ScreenplayDocumentNode';
import { SceneHeadingNode } from '../nodes/SceneHeadingNode';
import { ActionNode } from '../nodes/ActionNode';
import { CharacterNode } from '../nodes/CharacterNode';
import { ParentheticalNode } from '../nodes/ParentheticalNode';
import { DialogueNode } from '../nodes/DialogueNode';
import { TransitionNode } from '../nodes/TransitionNode';
import { ShotNode } from '../nodes/ShotNode';
import { ScreenplayKeyboardNavigation } from './ScreenplayKeyboardNavigation';

export const ScreenplayKit = Extension.create({
  name: 'screenplayKit',

  addExtensions() {
    return [
      ScreenplayDocumentNode,
      SceneHeadingNode,
      ActionNode,
      CharacterNode,
      ParentheticalNode,
      DialogueNode,
      TransitionNode,
      ShotNode,
      ScreenplayKeyboardNavigation,
    ];
  },
});
