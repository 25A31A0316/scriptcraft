import { Node } from '@tiptap/core';

export const ScreenplayDocumentNode = Node.create({
  name: 'doc',
  topNode: true,
  content: 'screenplayBlock+',
});
