// @flow
import { getProjectGameplayTestRecentEditorItems } from './GameplayTestRecentEditorItems';

describe('getProjectGameplayTestRecentEditorItems', () => {
  it('lists every test script by name with its gameplay test editor key', () => {
    const testNames = ['Player can jump', 'Player reaches the exit'];
    const project: any = ({
      getTests: () => ({
        getTestsCount: () => testNames.length,
        getTestAt: index => ({ getName: () => testNames[index] }),
      }),
    }: any);

    expect(getProjectGameplayTestRecentEditorItems(project)).toEqual([
      {
        id: 'gameplay-test Player can jump',
        testName: 'Player can jump',
      },
      {
        id: 'gameplay-test Player reaches the exit',
        testName: 'Player reaches the exit',
      },
    ]);
  });
});
