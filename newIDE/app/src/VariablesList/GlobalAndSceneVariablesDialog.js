// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import VariablesEditorDialog from './VariablesEditorDialog';
import { type HotReloadPreviewButtonProps } from '../HotReload/HotReloadPreviewButton';

type Props = {|
  open: boolean,
  project: gdProject,
  layout: gdLayout,
  onApply: (selectedVariableName: string | null) => void,
  onCancel: () => void,
  hotReloadPreviewButtonProps?: ?HotReloadPreviewButtonProps,
  /**
   * If set to true, a deleted variable won't trigger a confirmation asking if the
   * project must be refactored to delete any reference to it.
   */
  preventRefactoringToDeleteInstructions?: boolean,
  isGlobalTabInitiallyOpen?: boolean,
  initiallySelectedVariableName?: string,
|};

const GlobalAndSceneVariablesDialog = ({
  project,
  layout,
  open,
  onCancel,
  onApply,
  hotReloadPreviewButtonProps,
  preventRefactoringToDeleteInstructions,
  isGlobalTabInitiallyOpen,
  initiallySelectedVariableName,
}: Props) => {
  const tabs = React.useMemo(
    () =>
      [
        {
          id: 'scene-variables',
          label: <Trans>Scene variables</Trans>,
          variablesContainer: layout.getVariables(),
          emptyPlaceholderTitle: <Trans>Add your first scene variable</Trans>,
          emptyPlaceholderDescription: (
            <Trans>
              These variables hold additional information on a scene.
            </Trans>
          ),
        },
        {
          id: 'global-variables',
          label: <Trans>Global variables</Trans>,
          variablesContainer: project.getVariables(),
          emptyPlaceholderTitle: <Trans>Add your first global variable</Trans>,
          emptyPlaceholderDescription: (
            <Trans>
              These variables hold additional information on a project.
            </Trans>
          ),
        },
      ].filter(Boolean),
    [layout, project]
  );

  const onComputeAllVariableNames = React.useCallback(() => [], []);

  return (
    <VariablesEditorDialog
      project={project}
      open={open}
      onCancel={onCancel}
      onApply={onApply}
      title={<Trans>{layout.getName()} variables</Trans>}
      tabs={tabs}
      initiallyOpenTabId={
        isGlobalTabInitiallyOpen ? 'global-variables' : 'scene-variables'
      }
      initiallySelectedVariableName={initiallySelectedVariableName}
      helpPagePath={'/all-features/variables/scene-variables'}
      hotReloadPreviewButtonProps={hotReloadPreviewButtonProps}
      onComputeAllVariableNames={onComputeAllVariableNames}
      preventRefactoringToDeleteInstructions={
        preventRefactoringToDeleteInstructions
      }
      id="global-and-scene-variables-dialog"
    />
  );
};

export default GlobalAndSceneVariablesDialog;
