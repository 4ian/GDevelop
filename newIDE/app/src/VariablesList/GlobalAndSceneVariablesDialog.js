// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import VariablesEditorDialog from './VariablesEditorDialog';
import { type HotReloadPreviewButtonProps } from '../HotReload/HotReloadPreviewButton';
import EventsRootVariablesFinder from '../Utils/EventsRootVariablesFinder';
import { ProjectScopedContainersAccessor } from '../InstructionOrExpression/EventsScope';

type Props = {|
  open: boolean,
  projectScopedContainersAccessor: ProjectScopedContainersAccessor,
  onApply: (selectedVariableName: string | null) => void,
  onCancel: () => void,
  hotReloadPreviewButtonProps: HotReloadPreviewButtonProps | null,
  isGlobalTabInitiallyOpen?: boolean,
  initiallySelectedVariableName?: string,
  shouldCreateInitiallySelectedVariable?: boolean,
|};

const GlobalAndSceneVariablesDialog = ({
  projectScopedContainersAccessor,
  open,
  onCancel,
  onApply,
  hotReloadPreviewButtonProps,
  isGlobalTabInitiallyOpen,
  initiallySelectedVariableName,
  shouldCreateInitiallySelectedVariable,
}: Props) => {
  const {
    project,
    layout,
    eventsFunctionsExtension,
  } = projectScopedContainersAccessor.getScope();

  let globalVariables = null;
  let sceneVariables = null;
  if (layout) {
    globalVariables = project.getVariables();
    sceneVariables = layout.getVariables();
  } else if (eventsFunctionsExtension) {
    globalVariables = eventsFunctionsExtension.getGlobalVariables();
    sceneVariables = eventsFunctionsExtension.getSceneVariables();
  }

  const onComputeAllSceneVariableNames = React.useCallback(
    () =>
      layout
        ? EventsRootVariablesFinder.findAllLayoutVariables(
            project.getCurrentPlatform(),
            project,
            layout
          )
        : [],
    [layout, project]
  );

  const onComputeAllGlobalVariableNames = React.useCallback(
    () =>
      layout
        ? EventsRootVariablesFinder.findAllGlobalVariables(
            project.getCurrentPlatform(),
            project
          )
        : [],
    [layout, project]
  );

  const tabs = React.useMemo(
    () =>
      [
        sceneVariables && {
          id: 'scene-variables',
          label: <Trans>Scene variables</Trans>,
          variablesContainer: sceneVariables,
          emptyPlaceholderTitle: <Trans>Add your first scene variable</Trans>,
          emptyPlaceholderDescription: (
            <Trans>
              These variables hold additional information on a scene.
            </Trans>
          ),
          onComputeAllVariableNames: onComputeAllSceneVariableNames,
        },
        globalVariables && {
          id: 'global-variables',
          label: <Trans>Global variables</Trans>,
          variablesContainer: globalVariables,
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
      sceneVariables,
      onComputeAllGlobalVariableNames,
      onComputeAllSceneVariableNames,
      globalVariables,
    ]
  );

  return (
    <VariablesEditorDialog
      projectScopedContainersAccessor={projectScopedContainersAccessor}
      project={project}
      open={open}
      onCancel={onCancel}
      onApply={onApply}
      title={
        layout ? (
          <Trans>{layout.getName()} variables</Trans>
        ) : (
          <Trans>Extension variables</Trans>
        )
      }
      tabs={tabs}
      initiallyOpenTabId={
        isGlobalTabInitiallyOpen ? 'global-variables' : 'scene-variables'
      }
      initiallySelectedVariableName={initiallySelectedVariableName}
      shouldCreateInitiallySelectedVariable={
        shouldCreateInitiallySelectedVariable
      }
      helpPagePath={'/all-features/variables/scene-variables'}
      hotReloadPreviewButtonProps={hotReloadPreviewButtonProps}
      preventRefactoringToDeleteInstructions={true}
      id="global-and-scene-variables-dialog"
    />
  );
};

export default GlobalAndSceneVariablesDialog;
