// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import VariablesEditorDialog, {
  type VariableDialogOpeningProps,
} from './VariablesEditorDialog';
import { type HotReloadPreviewButtonProps } from '../HotReload/HotReloadPreviewButton';
import EventsRootVariablesFinder from '../Utils/EventsRootVariablesFinder';
import { ProjectScopedContainersAccessor } from '../InstructionOrExpression/EventsScope';
import { enumerateObjectVariableTabs } from './UnifiedVariablesDialogTabs';

type Props = {|
  open: boolean,
  projectScopedContainersAccessor: ProjectScopedContainersAccessor,
  onApply: (selectedVariableName: string | null) => void,
  onCancel: () => void,
  hotReloadPreviewButtonProps: HotReloadPreviewButtonProps | null,
  isGlobalTabInitiallyOpen?: boolean,
  initiallySelectedVariable: VariableDialogOpeningProps | null,
  isListLocked: boolean,
|};

const UnifiedVariablesDialog = ({
  projectScopedContainersAccessor,
  open,
  onCancel,
  onApply,
  hotReloadPreviewButtonProps,
  isGlobalTabInitiallyOpen,
  initiallySelectedVariable,
  isListLocked,
}: Props): React.Node => {
  const {
    project,
    layout,
    eventsFunctionsExtension,
    eventsBasedObject,
  } = projectScopedContainersAccessor.getScope();

  const initialInstances =
    (layout && layout.getInitialInstances()) ||
    (eventsBasedObject && eventsBasedObject.getInitialInstances()) ||
    null;

  let globalVariables = null;
  let sceneVariables = null;
  if (layout) {
    globalVariables = project.getVariables();
    sceneVariables = layout.getVariables();
  } else if (eventsFunctionsExtension) {
    globalVariables = eventsFunctionsExtension.getGlobalVariables();
    sceneVariables = eventsFunctionsExtension.getSceneVariables();
  }

  const objectVariableTabs = React.useMemo(
    () =>
      enumerateObjectVariableTabs({
        projectScopedContainersAccessor,
        initialInstances,
      }),
    [projectScopedContainersAccessor, initialInstances]
  );

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
        ...objectVariableTabs.map(
          ({ id, objectName, variablesContainer, initialInstances }) => ({
            id,
            label: objectName,
            objectName,
            initialInstances,
            variablesContainer,
            emptyPlaceholderTitle: (
              <Trans>Add your first object variable</Trans>
            ),
            emptyPlaceholderDescription: (
              <Trans>
                These variables hold additional information on an object.
              </Trans>
            ),
            onComputeAllVariableNames: () =>
              layout
                ? EventsRootVariablesFinder.findAllObjectVariables(
                    project.getCurrentPlatform(),
                    project,
                    layout,
                    objectName
                  )
                : [],
          })
        ),
      ].filter(Boolean),
    [
      sceneVariables,
      onComputeAllSceneVariableNames,
      globalVariables,
      onComputeAllGlobalVariableNames,
      objectVariableTabs,
      layout,
      project,
    ]
  );

  return (
    <VariablesEditorDialog
      projectScopedContainersAccessor={projectScopedContainersAccessor}
      project={project}
      open={open}
      onCancel={onCancel}
      onApply={onApply}
      title={<Trans>Variables</Trans>}
      // $FlowFixMe[incompatible-type]
      tabs={tabs}
      initiallyOpenTabId={
        isGlobalTabInitiallyOpen === false
          ? 'scene-variables'
          : 'global-variables'
      }
      initiallySelectedVariable={initiallySelectedVariable}
      helpPagePath={'/all-features/variables'}
      hotReloadPreviewButtonProps={hotReloadPreviewButtonProps}
      id="unified-variables-dialog"
      isListLocked={isListLocked}
    />
  );
};

export default UnifiedVariablesDialog;
