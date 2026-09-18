// @flow
import { addNode } from './NodesHandling';
import { getVisibleLeaves, toggleLeafVisibility } from './Visibility';

describe('NodesHandling', () => {
  describe('addNode', () => {
    // The layout of the debugger: an inspector on the left of the central
    // node, two panels at the bottom.
    const makeDebuggerNodes = () => ({
      direction: 'column',
      first: {
        direction: 'row',
        first: 'inspector',
        second: 'overview',
        splitPercentage: 75,
      },
      second: {
        direction: 'row',
        first: 'profiler',
        second: 'console',
        splitPercentage: 50,
      },
      splitPercentage: 55,
    });

    it('adds a panel without touching the other ones', () => {
      const nodes = addNode(
        makeDebuggerNodes(),
        'resources',
        'bottom',
        'overview'
      );
      expect(getVisibleLeaves(nodes).sort()).toEqual([
        'console',
        'inspector',
        'overview',
        'profiler',
        'resources',
      ]);
    });

    it('keeps the hidden panels hidden, and only them', () => {
      const nodes = makeDebuggerNodes();
      // What the debugger does: the central node is hidden as soon as a panel
      // is opened, and the user closed the console.
      toggleLeafVisibility(nodes, 'overview');
      toggleLeafVisibility(nodes, 'console');
      expect(getVisibleLeaves(nodes).sort()).toEqual(['inspector', 'profiler']);

      const withResources = addNode(nodes, 'resources', 'bottom', 'overview');
      expect(getVisibleLeaves(withResources).sort()).toEqual([
        'inspector',
        'profiler',
        'resources',
      ]);
    });

    it('does not hide a panel stacked next to a hidden one', () => {
      const nodes = makeDebuggerNodes();
      toggleLeafVisibility(nodes, 'console');

      const withResources = addNode(nodes, 'resources', 'bottom', 'overview');
      const withPerformance = addNode(
        withResources,
        'performance',
        'bottom',
        'overview'
      );
      expect(getVisibleLeaves(withPerformance)).toContain('resources');
      expect(getVisibleLeaves(withPerformance)).toContain('performance');
      expect(getVisibleLeaves(withPerformance)).not.toContain('console');
    });

    it('keeps the bottom panels at the bottom when the central node is hidden', () => {
      const nodes = makeDebuggerNodes();
      // What the debugger does: the central node is hidden as soon as a panel
      // is opened.
      toggleLeafVisibility(nodes, 'overview');

      const withPerformance = addNode(
        nodes,
        'performance',
        'bottom',
        'overview'
      );
      // The tree is a column: the inspector (and the hidden central node) on
      // top, the bottom panels below, spanning the whole width.
      expect(typeof withPerformance).not.toBe('string');
      // $FlowFixMe[prop-missing] - checked just above.
      expect(withPerformance.direction).toBe('column');
      // $FlowFixMe[prop-missing]
      expect(getVisibleLeaves(withPerformance.second).sort()).toEqual([
        'console',
        'performance',
        'profiler',
      ]);
      // $FlowFixMe[prop-missing]
      expect(getVisibleLeaves(withPerformance.first)).toEqual(['inspector']);
    });

    it('can show again a panel that was hidden when another one was added', () => {
      const nodes = makeDebuggerNodes();
      toggleLeafVisibility(nodes, 'inspector');
      const withResources = addNode(nodes, 'resources', 'bottom', 'overview');
      expect(getVisibleLeaves(withResources)).not.toContain('inspector');

      toggleLeafVisibility(withResources, 'inspector');
      expect(getVisibleLeaves(withResources)).toContain('inspector');
      expect(getVisibleLeaves(withResources)).toContain('resources');
    });
  });
});
