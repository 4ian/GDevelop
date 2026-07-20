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
import { getRootVariableName } from '../EventsSheet/ParameterFields/VariableField';

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
    eventsBasedBehavior,
    eventsBasedObject,
    eventsFunction,
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
  const extensionVariableLabelPrefix =
    !layout && eventsFunctionsExtension
      ? eventsFunctionsExtension.getName()
      : null;
  const prefabVariables = eventsBasedObject
    ? eventsBasedObject.getVariables()
    : null;
  const behaviorVariables = eventsBasedBehavior
    ? eventsBasedBehavior.getVariables()
    : null;

  const prefabObjectType =
    eventsFunctionsExtension && eventsBasedObject && !eventsFunction
      ? `${eventsFunctionsExtension.getName()}::${eventsBasedObject.getName()}`
      : null;
  const shouldIncludeObjectVariableTab = React.useCallback(
    (object: gdObject) =>
      !prefabObjectType ||
      object.getName() !== 'Object' ||
      object.getType() !== prefabObjectType,
    [prefabObjectType]
  );

  const objectVariableTabs = React.useMemo(
    () =>
      enumerateObjectVariableTabs({
        projectScopedContainersAccessor,
        initialInstances,
        shouldIncludeObject: shouldIncludeObjectVariableTab,
      }),
    [
      projectScopedContainersAccessor,
      initialInstances,
      shouldIncludeObjectVariableTab,
    ]
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

  const onComputeAllPrefabVariableNames = React.useCallback(
    (): Array<string> => [],
    []
  );
  const onComputeAllBehaviorVariableNames = React.useCallback(
    (): Array<string> => [],
    []
  );

  const tabs = React.useMemo(
    () =>
      [
        behaviorVariables && {
          id: 'behavior-variables',
          label: <Trans>Behavior variables</Trans>,
          variablesContainer: behaviorVariables,
          emptyPlaceholderTitle: (
            <Trans>Add your first behavior variable</Trans>
          ),
          emptyPlaceholderDescription: (
            <Trans>These variables hold internal state for the behavior.</Trans>
          ),
          onComputeAllVariableNames: onComputeAllBehaviorVariableNames,
        },
        prefabVariables && {
          id: 'prefab-variables',
          label: <Trans>Prefab variables</Trans>,
          variablesContainer: prefabVariables,
          emptyPlaceholderTitle: <Trans>Add your first prefab variable</Trans>,
          emptyPlaceholderDescription: (
            <Trans>These variables hold internal state for the prefab.</Trans>
          ),
          onComputeAllVariableNames: onComputeAllPrefabVariableNames,
        },
        sceneVariables && {
          id: 'scene-variables',
          label: extensionVariableLabelPrefix ? (
            `[${extensionVariableLabelPrefix}] Scene variables`
          ) : (
            <Trans>Scene variables</Trans>
          ),
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
          label: extensionVariableLabelPrefix ? (
            `[${extensionVariableLabelPrefix}] Global variables`
          ) : (
            <Trans>Global variables</Trans>
          ),
          variablesContainer: globalVariables,
          emptyPlaceholderTitle: <Trans>Add your first global variable</Trans>,
          emptyPlaceholderDescription: (
            <Trans>
              These variables hold additional information on a project.
            </Trans>
          ),
          onComputeAllVariableNames: onComputeAllGlobalVariableNames,
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
      behaviorVariables,
      onComputeAllBehaviorVariableNames,
      prefabVariables,
      onComputeAllPrefabVariableNames,
      sceneVariables,
      extensionVariableLabelPrefix,
      onComputeAllSceneVariableNames,
      globalVariables,
      onComputeAllGlobalVariableNames,
      objectVariableTabs,
      layout,
      project,
    ]
  );

  const initiallyOpenTabId = React.useMemo(
    () => {
      const selectedVariableRootName = initiallySelectedVariable
        ? getRootVariableName(initiallySelectedVariable.variableName)
        : '';

      if (isGlobalTabInitiallyOpen && globalVariables) {
        return 'global-variables';
      }
      if (selectedVariableRootName) {
        if (globalVariables && globalVariables.has(selectedVariableRootName)) {
          return 'global-variables';
        }
        if (sceneVariables && sceneVariables.has(selectedVariableRootName)) {
          return 'scene-variables';
        }
        if (
          behaviorVariables &&
          behaviorVariables.has(selectedVariableRootName)
        ) {
          return 'behavior-variables';
        }
        if (prefabVariables && prefabVariables.has(selectedVariableRootName)) {
          return 'prefab-variables';
        }
        const objectVariableTab = objectVariableTabs.find(
          ({ variablesContainer }) =>
            variablesContainer.has(selectedVariableRootName)
        );
        if (objectVariableTab) {
          return objectVariableTab.id;
        }
      }

      if (behaviorVariables) return 'behavior-variables';
      if (prefabVariables) return 'prefab-variables';
      if (sceneVariables) return 'scene-variables';
      if (globalVariables) return 'global-variables';
      return tabs.length > 0 ? tabs[0].id : undefined;
    },
    [
      initiallySelectedVariable,
      isGlobalTabInitiallyOpen,
      globalVariables,
      sceneVariables,
      behaviorVariables,
      prefabVariables,
      objectVariableTabs,
      tabs,
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
      initiallyOpenTabId={initiallyOpenTabId}
      initiallySelectedVariable={initiallySelectedVariable}
      helpPagePath={'/all-features/variables'}
      hotReloadPreviewButtonProps={hotReloadPreviewButtonProps}
      id="unified-variables-dialog"
      isListLocked={isListLocked}
    />
  );
};

export default UnifiedVariablesDialog;
