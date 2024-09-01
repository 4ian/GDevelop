// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import VariablesEditorDialog from './VariablesEditorDialog';
import { type HotReloadPreviewButtonProps } from '../HotReload/HotReloadPreviewButton';
import EventsRootVariablesFinder from '../Utils/EventsRootVariablesFinder';
import { ProjectScopedContainersAccessor } from '../InstructionOrExpression/EventsScope';

type Props = {|
  open: boolean,
  project: gdProject,
  layout: gdLayout,
  onApply: (selectedVariableName: string | null) => void,
  onCancel: () => void,
  hotReloadPreviewButtonProps: HotReloadPreviewButtonProps | null,
  /**
   * If set to true, a deleted variable won't trigger a confirmation asking if the
   * project must be refactored to delete any reference to it.
   */
  preventRefactoringToDeleteInstructions?: boolean,
  initiallySelectedVariableName?: string,
  shouldCreateInitiallySelectedVariable?: boolean,
|};

const SceneVariablesDialog = ({
  project,
  layout,
  open,
  onCancel,
  onApply,
  hotReloadPreviewButtonProps,
  preventRefactoringToDeleteInstructions,
  initiallySelectedVariableName,
  shouldCreateInitiallySelectedVariable,
}: Props) => {
  const onComputeAllVariableNames = React.useCallback(
    () =>
      EventsRootVariablesFinder.findAllLayoutVariables(
        project.getCurrentPlatform(),
        project,
        layout
      ),
    [layout, project]
  );

  const tabs = React.useMemo(
    () => [
      {
        id: 'scene-variables',
        label: <Trans>Scene variables</Trans>,
        variablesContainer: layout.getVariables(),
        emptyPlaceholderTitle: <Trans>Add your first scene variable</Trans>,
        emptyPlaceholderDescription: (
          <Trans>These variables hold additional information on a scene.</Trans>
        ),
        onComputeAllVariableNames,
      },
    ],
    [layout, onComputeAllVariableNames]
  );

  const projectScopedContainersAccessor = React.useMemo(
    () =>
      new ProjectScopedContainersAccessor({
        project,
        layout,
      }),
    [layout, project]
  );

  return (
    <VariablesEditorDialog
      project={project}
      projectScopedContainersAccessor={projectScopedContainersAccessor}
      open={open}
      onCancel={onCancel}
      onApply={onApply}
      title={<Trans>{layout.getName()} variables</Trans>}
      tabs={tabs}
      initiallySelectedVariableName={initiallySelectedVariableName}
      shouldCreateInitiallySelectedVariable={
        shouldCreateInitiallySelectedVariable
      }
      helpPagePath={'/all-features/variables/scene-variables'}
      hotReloadPreviewButtonProps={hotReloadPreviewButtonProps}
      preventRefactoringToDeleteInstructions={
        preventRefactoringToDeleteInstructions
      }
      id="scene-variables-dialog"
    />
  );
};

export default SceneVariablesDialog;
