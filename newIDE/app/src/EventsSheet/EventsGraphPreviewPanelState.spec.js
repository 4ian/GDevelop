// @flow
import { getCollapsedGroupPathsAfterGroupPathChange } from './EventsGraphPreviewPanelState';

const setToArray = (set: Set<string>): Array<string> => Array.from(set).sort();

describe('EventsSheet/EventsGraphPreviewPanelState', () => {
  it('collapses newly discovered groups without collapsing already expanded groups again', () => {
    const previousCollapsedGroupPaths = new Set(['1']);

    const nextCollapsedGroupPaths = getCollapsedGroupPathsAfterGroupPathChange({
      previousCollapsedGroupPaths,
      previousGroupPathStrings: ['0', '1'],
      currentGroupPathStrings: ['0', '1', '2'],
    });

    expect(setToArray(nextCollapsedGroupPaths)).toEqual(['1', '2']);
  });

  it('keeps the same collapsed group set when group paths do not change', () => {
    const previousCollapsedGroupPaths = new Set(['1']);

    const nextCollapsedGroupPaths = getCollapsedGroupPathsAfterGroupPathChange({
      previousCollapsedGroupPaths,
      previousGroupPathStrings: ['0', '1'],
      currentGroupPathStrings: ['0', '1'],
    });

    expect(nextCollapsedGroupPaths).toBe(previousCollapsedGroupPaths);
  });

  it('removes collapsed paths for deleted groups', () => {
    const previousCollapsedGroupPaths = new Set(['0', '1']);

    const nextCollapsedGroupPaths = getCollapsedGroupPathsAfterGroupPathChange({
      previousCollapsedGroupPaths,
      previousGroupPathStrings: ['0', '1'],
      currentGroupPathStrings: ['1'],
    });

    expect(setToArray(nextCollapsedGroupPaths)).toEqual(['1']);
  });
});
