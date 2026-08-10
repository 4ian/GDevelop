// @flow
import { getGameplayTestProjectItemName } from '../GameplayTests/GameplayTestRunner';
import { getEditorTabKey } from './EditorTabs/EditorTabKey';

export type ProjectGameplayTestRecentEditorItem = {|
  id: string,
  testName: string,
|};

export const getProjectGameplayTestRecentEditorItems = (
  project: gdProject
): Array<ProjectGameplayTestRecentEditorItem> => {
  const items: Array<ProjectGameplayTestRecentEditorItem> = [];
  const testsContainer = project.getTests();

  for (
    let testIndex = 0;
    testIndex < testsContainer.getTestsCount();
    testIndex++
  ) {
    const testName = testsContainer.getTestAt(testIndex).getName();
    const projectItemName = getGameplayTestProjectItemName(
      { type: 'project' },
      testName
    );
    items.push({
      id: getEditorTabKey('gameplay-test', projectItemName),
      testName,
    });
  }

  return items;
};
