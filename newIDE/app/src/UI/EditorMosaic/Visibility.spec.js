// @flow
import { getVisibleLeaves, toggleLeafVisibility } from './Visibility';
import { type EditorMosaicNode } from '.';

describe('EditorMosaic visibility', () => {
  describe('toggleLeafVisibility', () => {
    it('hides a visible panel by toggling its enclosing flag', () => {
      const tree: EditorMosaicNode = {
        direction: 'row',
        splitPercentage: 75,
        first: 'central',
        second: {
          direction: 'column',
          splitPercentage: 50,
          first: 'objects-list',
          second: 'groups-list',
        },
      };

      expect(getVisibleLeaves(tree)).toEqual([
        'central',
        'objects-list',
        'groups-list',
      ]);

      toggleLeafVisibility(tree, 'objects-list');

      // objects-list is hidden, the others are untouched.
      expect(getVisibleLeaves(tree)).toEqual(['central', 'groups-list']);
    });

    it('shows a panel hidden by its own parent flag, fixing a collapsed split', () => {
      const tree: EditorMosaicNode = {
        direction: 'row',
        splitPercentage: 0, // collapsed
        first: 'objects-list',
        second: 'central',
        firstHidden: true,
      };

      expect(getVisibleLeaves(tree)).toEqual(['central']);

      toggleLeafVisibility(tree, 'objects-list');

      expect(getVisibleLeaves(tree)).toEqual(['objects-list', 'central']);
      // A collapsed split is restored to a usable size.
      expect((tree: any).splitPercentage).toBe(20);
    });

    // This is the regression test for the "panel won't reopen" bug: a panel can
    // be hidden by an *ancestor* flag while its own parent flag still says
    // "visible". Toggling only the nearest flag would never reveal it.
    it('shows a panel hidden by an ancestor flag (stacked hidden flags)', () => {
      const tree: EditorMosaicNode = {
        direction: 'row',
        splitPercentage: 75,
        first: 'central',
        second: {
          direction: 'column',
          splitPercentage: 50,
          // The panel's own parent flag says it is visible...
          first: 'objects-list',
          second: 'groups-list',
          firstHidden: false,
          secondHidden: false,
        },
        // ...but an ancestor hides the whole right-hand subtree.
        secondHidden: true,
      };

      // The panel is in the tree but not visible to the user.
      expect(getVisibleLeaves(tree)).toEqual(['central']);

      toggleLeafVisibility(tree, 'objects-list');

      // It becomes visible: the ancestor flag was cleared too.
      expect(getVisibleLeaves(tree)).toContain('objects-list');
      expect((tree: any).secondHidden).toBe(false);
    });

    it('clears hidden flags along the whole path for a deeply nested panel', () => {
      const tree: EditorMosaicNode = {
        direction: 'row',
        splitPercentage: 75,
        first: 'central',
        second: {
          direction: 'column',
          splitPercentage: 50,
          first: {
            direction: 'column',
            splitPercentage: 50,
            first: 'objects-list',
            second: 'groups-list',
            firstHidden: false,
            secondHidden: false,
          },
          second: 'other-panel',
          firstHidden: false,
        },
        secondHidden: true, // hides everything on the right, two levels up
      };

      expect(getVisibleLeaves(tree)).toEqual(['central']);

      toggleLeafVisibility(tree, 'objects-list');

      expect(getVisibleLeaves(tree)).toEqual([
        'central',
        'objects-list',
        'groups-list',
        'other-panel',
      ]);
    });

    it('can hide then show the same panel repeatedly (round-trip)', () => {
      const tree: EditorMosaicNode = {
        direction: 'row',
        splitPercentage: 75,
        first: 'central',
        second: {
          direction: 'column',
          splitPercentage: 50,
          first: 'objects-list',
          second: 'groups-list',
        },
      };

      expect(getVisibleLeaves(tree)).toContain('objects-list');

      toggleLeafVisibility(tree, 'objects-list'); // hide
      expect(getVisibleLeaves(tree)).not.toContain('objects-list');

      toggleLeafVisibility(tree, 'objects-list'); // show
      expect(getVisibleLeaves(tree)).toContain('objects-list');

      toggleLeafVisibility(tree, 'objects-list'); // hide again
      expect(getVisibleLeaves(tree)).not.toContain('objects-list');
    });
  });
});
