// @ts-check

/**
 * Visual monkey tests of the Sprite object editor, run on the
 * `ObjectEditor/SpriteEditorManipulations` stories - where every manipulation
 * the editor offers can be done, and where the animations of the edited object
 * are exposed so that what the editor displays can be compared with what the
 * object actually contains.
 */

const spriteEditor = require('../helpers/SpriteEditor');

const stories = {
  manipulations: 'objecteditor-spriteeditormanipulations--manipulations',
  serialized:
    'objecteditor-spriteeditormanipulations--manipulations-with-serialization',
  manyAnimations:
    'objecteditor-spriteeditormanipulations--manipulations-with-many-animations',
  manyFrames:
    'objecteditor-spriteeditormanipulations--manipulations-with-many-frames',
  emptyObject:
    'objecteditor-spriteeditormanipulations--manipulations-from-empty-object',
  lockedList:
    'objecteditor-spriteeditormanipulations--manipulations-with-locked-animation-list',
  hostileExternalEditor:
    'objecteditor-spriteeditormanipulations--manipulations-with-hostile-external-editor',
};

module.exports = [
  {
    helper: spriteEditor,
    name: 'sprite-editor/add-animations-and-interact',
    description:
      'Adding animations reallocates the vector holding them: everything ' +
      'resolved before must not be used afterwards.',
    story: stories.serialized,
    steps: [
      ['addAnimation'],
      ['addAnimation'],
      ['addAnimation'],
      ['serialize'],
      ['selectFrames', { row: 0, frames: [0, 1] }],
      ['selectFrames', { row: 1, frames: [2] }],
      ['serialize'],
      ['renameAnimation', { row: 0, name: 'Player walking to the right' }],
      ['addFrames', { row: 0 }],
      ['serialize'],
      ['scrollList', { delta: 600 }],
      ['scrollList', { delta: -600 }],
    ],
  },
  {
    helper: spriteEditor,
    name: 'sprite-editor/delete-animations',
    description:
      'Removing an animation frees its directions and shifts the following ' +
      'animations, down to the last one.',
    story: stories.serialized,
    steps: [
      ['selectFrames', { row: 1, frames: [0, 1] }],
      ['deleteAnimation', { row: 0 }],
      ['serialize'],
      ['selectFrames', { row: 0, frames: [0] }],
      ['deleteAnimation', { row: 2 }],
      ['serialize'],
      ['addFrames', { row: 0 }],
      ['deleteAnimation', { row: 0 }],
      ['deleteAnimation', { row: 0 }],
      ['deleteAnimation', { row: 0 }],
      ['deleteAnimation', { row: 0 }],
      ['deleteAnimation', { row: 0 }],
      ['serialize'],
    ],
  },
  {
    helper: spriteEditor,
    name: 'sprite-editor/move-animations-with-the-menu',
    story: stories.serialized,
    steps: [
      ['selectFrames', { row: 0, frames: [0, 1] }],
      ['moveAnimationWithMenu', { row: 0, item: 'Move to bottom' }],
      ['serialize'],
      ['selectFrames', { row: 0, frames: [0] }],
      ['moveAnimationWithMenu', { row: 5, item: 'Move to top' }],
      ['serialize'],
      ['moveAnimationWithMenu', { row: 2, item: 'Move to position 3' }],
      ['addAnimation'],
      ['addAnimation'],
      ['addAnimation'],
      ['moveAnimationWithMenu', { row: 0, item: 'Move to bottom' }],
      ['serialize'],
    ],
  },
  {
    helper: spriteEditor,
    name: 'sprite-editor/drag-and-drop-animations',
    story: stories.manipulations,
    steps: [
      ['dragAnimation', { from: 0, to: 2 }],
      ['dragAnimation', { from: 2, to: 0 }],
      ['selectFrames', { row: 0, frames: [0, 1] }],
      ['dragAnimation', { from: 0, to: 2 }],
      ['addAnimation'],
      ['addAnimation'],
      ['addAnimation'],
      ['dragAnimation', { from: 1, to: 0 }],
    ],
  },
  {
    helper: spriteEditor,
    name: 'sprite-editor/frames-selection-and-context-menu',
    description:
      'Deleting, duplicating and moving the selected frames must act on ' +
      'exactly the frames the user selected.',
    story: stories.manyFrames,
    steps: [
      ['selectFrames', { row: 0, frames: [1, 2, 3] }],
      ['frameContextMenuAction', { row: 0, frame: 1, item: 'Move to end' }],
      ['selectFrames', { row: 0, frames: [0, 1] }],
      [
        'frameContextMenuAction',
        { row: 0, frame: 0, item: 'Duplicate selection' },
      ],
      ['selectFrames', { row: 0, frames: [5, 6] }],
      [
        'frameContextMenuAction',
        { row: 0, frame: 5, item: 'Move to beginning' },
      ],
      ['selectFrames', { row: 0, frames: [2, 3] }],
      [
        'frameContextMenuAction',
        { row: 0, frame: 2, item: 'Position 4', isSubmenuItem: true },
      ],
      ['selectFrames', { row: 0, frames: [0, 1, 2] }],
      [
        'frameContextMenuAction',
        { row: 0, frame: 0, item: 'Delete selection' },
      ],
      ['addFrames', { row: 0 }],
      ['selectFrames', { row: 0, frames: [0] }],
      [
        'frameContextMenuAction',
        { row: 0, frame: 0, item: 'Delete selection' },
      ],
    ],
  },
  {
    helper: spriteEditor,
    name: 'sprite-editor/selection-after-the-animations-changed',
    description:
      'The selection designates frames by their index, so it must be reset ' +
      'when the animations are changed from outside the sprites list.',
    story: stories.serialized,
    steps: [
      ['selectFrames', { row: 0, frames: [0, 1] }],
      ['moveAnimationWithMenu', { row: 0, item: 'Move to bottom' }],
      ['selectFrames', { row: 0, frames: [1] }],
      [
        'frameContextMenuAction',
        { row: 0, frame: 1, item: 'Delete selection' },
      ],
      ['selectFrames', { row: 1, frames: [0, 2] }],
      ['deleteAnimation', { row: 0 }],
      ['selectFrames', { row: 0, frames: [0] }],
      [
        'frameContextMenuAction',
        { row: 0, frame: 0, item: 'Duplicate selection' },
      ],
      ['selectFrames', { row: 0, frames: [0, 1] }],
      ['addAnimation'],
      [
        'frameContextMenuAction',
        { row: 0, frame: 0, item: 'Delete selection' },
      ],
    ],
  },
  {
    helper: spriteEditor,
    name: 'sprite-editor/drag-and-drop-frames',
    story: stories.manyFrames,
    steps: [
      ['dragFrame', { row: 0, from: 0, to: 3 }],
      ['dragFrame', { row: 0, from: 4, to: 1 }],
      ['selectFrames', { row: 0, frames: [2] }],
      ['dragFrame', { row: 0, from: 2, to: 5 }],
      ['addFrames', { row: 0 }],
      ['dragFrame', { row: 0, from: 1, to: 6 }],
    ],
  },
  {
    helper: spriteEditor,
    name: 'sprite-editor/add-frames-and-import-animations',
    story: stories.manipulations,
    steps: [
      ['addFrames', { row: 0 }],
      ['addFrames', { row: 0 }],
      ['addAnimation'],
      ['addAnimation'],
      ['addAnimation'],
      ['importAnimationsInEmptyAnimation'],
      ['selectFrames', { row: 0, frames: [0, 1] }],
      ['addFrames', { row: 1 }],
      ['scrollList', { delta: 900 }],
      ['scrollList', { delta: -1800 }],
    ],
  },
  {
    helper: spriteEditor,
    name: 'sprite-editor/external-editor',
    story: stories.manipulations,
    steps: [
      ['editWithExternalEditor', { row: 0 }],
      ['selectFrames', { row: 0, frames: [0, 1] }],
      ['editWithExternalEditor', { row: 1 }],
      ['addAnimation'],
      ['addAnimation'],
      ['addAnimation'],
      ['editWithExternalEditor', { row: 2 }],
    ],
  },
  {
    helper: spriteEditor,
    name: 'sprite-editor/external-editor-changing-the-animations',
    description:
      'The animations are changed (and their vector reallocated) while the ' +
      'external editor session is running.',
    story: stories.hostileExternalEditor,
    steps: [
      ['selectFrames', { row: 0, frames: [0, 1] }],
      ['editWithExternalEditor', { row: 3 }],
      ['editWithExternalEditor', { row: 0 }],
      ['editWithExternalEditor', { row: 5 }],
      ['scrollList', { delta: 900 }],
      ['scrollList', { delta: -900 }],
    ],
  },
  {
    helper: spriteEditor,
    name: 'sprite-editor/object-dialogs',
    story: stories.manipulations,
    steps: [
      ['openPointsEditor'],
      ['openCollisionMasksEditor'],
      ['openAdvancedOptions'],
      ['addAnimation'],
      ['addAnimation'],
      ['addAnimation'],
      ['openPointsEditor'],
      ['selectFrames', { row: 0, frames: [0] }],
      ['openPreview', { row: 0 }],
      ['openCollisionMasksEditor'],
    ],
  },
  {
    helper: spriteEditor,
    name: 'sprite-editor/direction-settings',
    story: stories.manipulations,
    steps: [
      ['setTimeBetweenFrames', { row: 0, value: '0.2' }],
      ['toggleLoop', { row: 0 }],
      ['openPreview', { row: 0 }],
      ['addAnimation'],
      ['addAnimation'],
      ['addAnimation'],
      ['setTimeBetweenFrames', { row: 1, value: '0.05' }],
      ['toggleLoop', { row: 1 }],
      ['selectFrames', { row: 0, frames: [0] }],
      ['openPreview', { row: 0 }],
    ],
  },
  {
    helper: spriteEditor,
    name: 'sprite-editor/lazily-mounted-animations',
    description:
      'With many animations, the sprites lists are only mounted when they ' +
      'are scrolled into view - after the animations may have changed.',
    story: stories.manyAnimations,
    steps: [
      ['addAnimation'],
      ['scrollList', { delta: 4000 }],
      ['scrollList', { delta: -2000 }],
      ['deleteAnimation', { row: 0 }],
      ['scrollList', { delta: 3000 }],
      ['scrollList', { delta: -6000 }],
      ['moveAnimationWithMenu', { row: 0, item: 'Move to bottom' }],
      ['scrollList', { delta: 6000 }],
      ['scrollList', { delta: -6000 }],
      ['addFrames', { row: 0 }],
      ['scrollList', { delta: 2500 }],
      ['scrollList', { delta: -2500 }],
    ],
  },
  {
    helper: spriteEditor,
    name: 'sprite-editor/locked-animation-list',
    description:
      'Like the editor of a child object of a custom object: only the frames ' +
      'of each animation can be manipulated.',
    story: stories.lockedList,
    steps: [
      ['selectFrames', { row: 0, frames: [0, 2] }],
      ['frameContextMenuAction', { row: 0, frame: 0, item: 'Move to end' }],
      ['selectFrames', { row: 1, frames: [1] }],
      [
        'frameContextMenuAction',
        { row: 1, frame: 1, item: 'Duplicate selection' },
      ],
      ['addFrames', { row: 2 }],
      ['selectFrames', { row: 2, frames: [0, 1] }],
      [
        'frameContextMenuAction',
        { row: 2, frame: 0, item: 'Delete selection' },
      ],
      ['dragFrame', { row: 0, from: 0, to: 2 }],
      ['setTimeBetweenFrames', { row: 0, value: '0.3' }],
      ['editWithExternalEditor', { row: 1 }],
    ],
  },
  {
    helper: spriteEditor,
    name: 'sprite-editor/empty-object',
    story: stories.emptyObject,
    steps: [
      ['importImagesFromPlaceholder'],
      ['addFrames', { row: 0 }],
      ['addAnimation'],
      ['deleteAnimation', { row: 0 }],
      ['deleteAnimation', { row: 0 }],
      ['deleteAnimation', { row: 0 }],
      ['importImagesFromPlaceholder'],
      ['selectFrames', { row: 0, frames: [0] }],
      [
        'frameContextMenuAction',
        { row: 0, frame: 0, item: 'Delete selection' },
      ],
    ],
  },

  // The random sessions: they do what the scripted tests above do not think of.
  {
    helper: spriteEditor,
    name: 'sprite-editor/monkey-on-a-serialized-object',
    description:
      'Random manipulations on an object serialized on every change, so that ' +
      'the memory freed by a change is reused right away.',
    story: stories.serialized,
    monkey: { seeds: [1, 2, 3], steps: 60 },
  },
  {
    helper: spriteEditor,
    name: 'sprite-editor/monkey-with-many-animations',
    story: stories.manyAnimations,
    monkey: { seeds: [1, 2], steps: 60 },
  },
  {
    helper: spriteEditor,
    name: 'sprite-editor/monkey-with-many-frames',
    story: stories.manyFrames,
    monkey: { seeds: [1, 2], steps: 60 },
  },
  {
    helper: spriteEditor,
    name: 'sprite-editor/monkey-on-a-locked-animation-list',
    story: stories.lockedList,
    monkey: { seeds: [1, 2], steps: 60 },
  },
  {
    helper: spriteEditor,
    name: 'sprite-editor/monkey-from-an-empty-object',
    story: stories.emptyObject,
    monkey: { seeds: [1, 2], steps: 50 },
  },
];
