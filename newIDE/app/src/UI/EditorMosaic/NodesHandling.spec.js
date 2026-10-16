// @flow
import { addNode } from './NodesHandling';
import { getVisibleLeaves, toggleLeafVisibility } from './Visibility';
import { type EditorMosaicNode } from '.';

const makeDefaultTree = (): EditorMosaicNode => ({
  direction: 'row',
  first: 'properties',
  splitPercentage: 23,
  second: {
    direction: 'row',
    first: 'central',
    second: 'objects-list',
    splitPercentage: 77,
  },
});

describe('EditorMosaic nodes handling', () => {
  describe('addNode', () => {
    it('adds a panel in the right stack', () => {
      const tree = addNode(
        makeDefaultTree(),
        'groups-list',
        'right',
        'central'
      );

      expect(getVisibleLeaves(tree)).toEqual([
        'properties',
        'central',
        'objects-list',
        'groups-list',
      ]);
    });

    // Regression test for "opening the layers panel also opens the object groups
    // panel": the new panel used to be nested under the hidden flag of the
    // previous panel, so they were then shown together.
    it('adds a visible panel after a hidden one, keeping them independent', () => {
      let tree = addNode(makeDefaultTree(), 'groups-list', 'right', 'central');
      toggleLeafVisibility(tree, 'groups-list');
      expect(getVisibleLeaves(tree)).toEqual([
        'properties',
        'central',
        'objects-list',
      ]);

      tree = addNode(tree, 'layers-list', 'right', 'central');
      expect(getVisibleLeaves(tree)).toEqual([
        'properties',
        'central',
        'objects-list',
        'layers-list',
      ]);

      toggleLeafVisibility(tree, 'layers-list');
      expect(getVisibleLeaves(tree)).toEqual([
        'properties',
        'central',
        'objects-list',
      ]);

      toggleLeafVisibility(tree, 'groups-list');
      expect(getVisibleLeaves(tree)).toEqual([
        'properties',
        'central',
        'objects-list',
        'groups-list',
      ]);

      toggleLeafVisibility(tree, 'layers-list');
      expect(getVisibleLeaves(tree)).toEqual([
        'properties',
        'central',
        'objects-list',
        'groups-list',
        'layers-list',
      ]);
    });

    it('keeps hidden panels around the central one hidden', () => {
      let tree = makeDefaultTree();
      toggleLeafVisibility(tree, 'properties');
      toggleLeafVisibility(tree, 'objects-list');
      expect(getVisibleLeaves(tree)).toEqual(['central']);

      tree = addNode(tree, 'groups-list', 'right', 'central');
      expect(getVisibleLeaves(tree)).toEqual(['central', 'groups-list']);

      tree = addNode(tree, 'instances-list', 'bottom', 'central');
      expect(getVisibleLeaves(tree)).toEqual([
        'central',
        'instances-list',
        'groups-list',
      ]);

      toggleLeafVisibility(tree, 'instances-list');
      tree = addNode(tree, 'layers-list', 'left', 'central');
      expect(getVisibleLeaves(tree)).toEqual([
        'layers-list',
        'central',
        'groups-list',
      ]);

      toggleLeafVisibility(tree, 'objects-list');
      toggleLeafVisibility(tree, 'properties');
      expect(getVisibleLeaves(tree)).toEqual([
        'properties',
        'layers-list',
        'central',
        'objects-list',
        'groups-list',
      ]);
    });

    it('keeps a hidden panel above the central one hidden when moving it to the bottom', () => {
      const tree: EditorMosaicNode = {
        direction: 'column',
        first: 'instances-list',
        second: 'central',
        splitPercentage: 30,
        firstHidden: true,
      };

      const newTree = addNode(tree, 'groups-list', 'bottom', 'central');
      expect(getVisibleLeaves(newTree)).toEqual(['central', 'groups-list']);
    });
  });
});
