// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import VariablesEditorDialog from './VariablesEditorDialog';
import { type HotReloadPreviewButtonProps } from '../HotReload/HotReloadPreviewButton';
import EventsRootVariablesFinder from '../Utils/EventsRootVariablesFinder';

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
  const onComputeAllSceneVariableNames = React.useCallback(
    () =>
      EventsRootVariablesFinder.findAllLayoutVariables(
        project.getCurrentPlatform(),
        project,
        layout
      ),
    [layout, project]
  );

  const onComputeAllGlobalVariableNames = React.useCallback(
    () =>
      EventsRootVariablesFinder.findAllGlobalVariables(
        project.getCurrentPlatform(),
        project
      ),
    [project]
  );

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
          onComputeAllVariableNames: onComputeAllSceneVariableNames,
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
          onComputeAllVariableNames: onComputeAllGlobalVariableNames,
        },
      ].filter(Boolean),
    [
      layout,
      onComputeAllGlobalVariableNames,
      onComputeAllSceneVariableNames,
      project,
    ]
  );

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
      preventRefactoringToDeleteInstructions={
        preventRefactoringToDeleteInstructions
      }
      id="global-and-scene-variables-dialog"
    />
  );
};

export default GlobalAndSceneVariablesDialog;
