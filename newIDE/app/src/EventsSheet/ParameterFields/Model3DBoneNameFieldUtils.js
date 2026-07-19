// @flow

import { t } from '@lingui/macro';
import { type ExpressionAutocompletion } from '../../ExpressionAutocompletion';
import { getUniqueModelBoneNames } from '../../ResourcesList/ResourcePreview/Model3DBoneUtils';

export type Model3DBoneNameLoadingState =
  | {| status: 'idle', names: Array<string> |}
  | {| status: 'loading', names: Array<string> |}
  | {| status: 'loaded', names: Array<string> |}
  | {| status: 'error', names: Array<string> |};

/** Return the sorted intersection of canonical unique bone names. */
export const getCommonModel3DBoneNames = (
  models: Array<any>
): Array<string> => {
  if (models.length === 0) return [];
  const namesByModel = models.map(model =>
    getUniqueModelBoneNames(model.scene)
  );
  const remainingNames = new Set<string>(namesByModel[0]);
  for (let modelIndex = 1; modelIndex < namesByModel.length; modelIndex++) {
    const modelNames = new Set<string>(namesByModel[modelIndex]);
    remainingNames.forEach(name => {
      if (!modelNames.has(name)) remainingNames.delete(name);
    });
  }
  return Array.from(remainingNames).sort();
};

export const getModel3DBoneNameResourceKey = (
  modelResourceNames: Array<string>
): string =>
  modelResourceNames.length > 0 && modelResourceNames.every(Boolean)
    ? modelResourceNames.join('\u0000')
    : '';

export const getModel3DBoneNameAutocompletions = (
  loadingState: Model3DBoneNameLoadingState,
  currentExpression: string
): Array<ExpressionAutocompletion> => {
  const completions: Array<ExpressionAutocompletion> = loadingState.names
    .map(
      (name): ExpressionAutocompletion => ({
        kind: 'Text',
        completion: JSON.stringify(name),
      })
    )
    .filter(({ completion }) => completion.indexOf(currentExpression) === 0);
  if (!currentExpression && loadingState.status === 'loading') {
    completions.push({
      kind: 'Text',
      completion: t`Loading 3D model bone names...`,
      isExact: true,
    });
  } else if (!currentExpression && loadingState.status === 'error') {
    completions.push({
      kind: 'Text',
      completion: t`Unable to load 3D model bone names`,
      isExact: true,
    });
  }
  return completions;
};
