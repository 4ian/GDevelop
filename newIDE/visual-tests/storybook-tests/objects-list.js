// @ts-check

/**
 * Multi-selection in the objects list, on a story holding the selection like
 * SceneEditor does. The story contains, on top of a "GlobalPlayer" global
 * object: Player, Enemy1, a folder "Enemies" (containing EnemyBoss and Wall)
 * and Background.
 *
 * After every manipulation, the helper checks that the rows shown as selected
 * are exactly the selection the app holds.
 */

const objectsList = require('../helpers/ObjectsList');

const STORY = 'layouteditor-objectslist--selection-playground';

module.exports = [
  {
    name: 'objects-list/click-inside-a-selected-folder',
    description:
      'Clicking (or arrow-navigating to) the child of a selected folder ' +
      'selects the child - it must not clear the selection - and re-clicking ' +
      'the selected row notifies the app again (for the properties panel).',
    helper: objectsList,
    story: STORY,
    steps: [
      ['clickRow', { name: 'Enemies', expectedSelection: ['Enemies'] }],
      ['toggleFolder', { name: 'Enemies' }],
      ['clickRow', { name: 'EnemyBoss', expectedSelection: ['EnemyBoss'] }],
      ['clickRow', { name: 'Enemies', expectedSelection: ['Enemies'] }],
      ['pressKey', { key: 'ArrowDown', expectedSelection: ['EnemyBoss'] }],
      [
        'clickRow',
        {
          name: 'EnemyBoss',
          expectedSelection: ['EnemyBoss'],
          expectNewNotification: true,
        },
      ],
    ],
  },
  {
    name: 'objects-list/ctrl-click-multi-selection',
    description:
      'Ctrl+click toggles rows in and out of the selection; deselecting a ' +
      'folder also drops its selected descendants, and the selection stays ' +
      'within one section (scene or global objects).',
    helper: objectsList,
    story: STORY,
    steps: [
      ['clickRow', { name: 'Player', expectedSelection: ['Player'] }],
      [
        'ctrlClickRow',
        { name: 'Enemy1', expectedSelection: ['Player', 'Enemy1'] },
      ],
      ['toggleFolder', { name: 'Enemies' }],
      [
        'ctrlClickRow',
        { name: 'Enemies', expectedSelection: ['Player', 'Enemy1', 'Enemies'] },
      ],
      [
        'ctrlClickRow',
        {
          name: 'EnemyBoss',
          expectedSelection: ['Player', 'Enemy1', 'Enemies', 'EnemyBoss'],
        },
      ],
      // Deselecting the folder must also deselect EnemyBoss inside it.
      [
        'ctrlClickRow',
        { name: 'Enemies', expectedSelection: ['Player', 'Enemy1'] },
      ],
      ['ctrlClickRow', { name: 'Enemy1', expectedSelection: ['Player'] }],
      // A global object cannot join a scene objects selection.
      ['ctrlClickRow', { name: 'GlobalPlayer', expectedSelection: ['Player'] }],
    ],
  },
  {
    name: 'objects-list/selection-while-searching',
    description:
      'Every visible row stays selectable while searching, and Ctrl+A only ' +
      'selects the items matching the search.',
    helper: objectsList,
    story: STORY,
    steps: [
      [
        'setSearchText',
        {
          text: 'enemy',
          expectedVisibleRows: ['Enemy1', 'Enemies', 'EnemyBoss'],
        },
      ],
      // "Enemies" matches but contains the non-matching "Wall": its visible
      // row must still be selectable.
      ['clickRow', { name: 'Enemies', expectedSelection: ['Enemies'] }],
      ['clickRow', { name: 'EnemyBoss', expectedSelection: ['EnemyBoss'] }],
      // Select All is implicit: it must skip "Enemies" (its hidden child
      // "Wall" does not match) and anything not displayed.
      ['selectAll', { expectedSelection: ['Enemy1', 'EnemyBoss'] }],
    ],
  },
];
