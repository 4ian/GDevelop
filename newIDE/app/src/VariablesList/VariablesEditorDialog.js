// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import FlatButton from '../UI/FlatButton';
import Dialog, { DialogPrimaryButton } from '../UI/Dialog';
import { useSerializableObjectsCancelableEditor } from '../Utils/SerializableObjectCancelableEditor';
import HotReloadPreviewButton, {
  type HotReloadPreviewButtonProps,
} from '../HotReload/HotReloadPreviewButton';
import useDismissableTutorialMessage from '../Hints/useDismissableTutorialMessage';
import { Column, Line } from '../UI/Grid';
import VariablesList from './VariablesList';
import HelpButton from '../UI/HelpButton';
import { getVariablePathFromNodeId } from './VariableToTreeNodeHandling';
import { Tabs } from '../UI/Tabs';
import { useResponsiveWindowSize } from '../UI/Responsive/ResponsiveWindowMeasurer';
import { ProjectScopedContainersAccessor } from '../InstructionOrExpression/EventsScope';
import { insertInVariablesContainer } from '../Utils/VariablesUtils';
import { getRootVariableName } from '../EventsSheet/ParameterFields/VariableField';
import { getNodeIdFromVariableName } from './VariableToTreeNodeHandling';

const gd: libGDevelop = global.gd;

type TabProps = {
  id: string,
  label: React.Node,
  variablesContainer: gdVariablesContainer,
  inheritedVariablesContainer?: gdVariablesContainer,
  emptyPlaceholderTitle?: React.Node,
  emptyPlaceholderDescription?: React.Node,
  /**
   * Deprecated - will be removed once we don't want to display completions
   * for variables not declared but still used in events.
   */
  onComputeAllVariableNames: () => Array<string>,
};

type Props = {|
  projectScopedContainersAccessor: ProjectScopedContainersAccessor,
  onCancel: () => void,
  onApply: (selectedVariableName: string | null) => void,
  open: boolean,
  onEditObjectVariables?: () => void,
  title: React.Node,
  tabs: Array<TabProps>,
  areObjectVariables?: boolean,
  initiallyOpenTabId?: string,
  initiallySelectedVariableName?: string,
  shouldCreateInitiallySelectedVariable?: boolean,

  project: gdProject,
  hotReloadPreviewButtonProps: HotReloadPreviewButtonProps | null,

  helpPagePath: ?string,
  id?: string,

  /**
   * If set to true, a deleted variable won't trigger a confirmation asking if the
   * project must be refactored to delete any reference to it.
   */
  preventRefactoringToDeleteInstructions?: boolean,
|};

const VariablesEditorDialog = ({
  onCancel,
  onApply,
  open,
  onEditObjectVariables,
  title,
  project,
  hotReloadPreviewButtonProps,
  helpPagePath,
  preventRefactoringToDeleteInstructions,
  id,
  tabs,
  initiallyOpenTabId,
  initiallySelectedVariableName,
  shouldCreateInitiallySelectedVariable,
  projectScopedContainersAccessor,
  areObjectVariables,
}: Props) => {
  const serializableObjects = React.useMemo(
    () =>
      new Map(
        tabs.map(({ id, variablesContainer }) => [id, variablesContainer])
      ),
    [tabs]
  );
  const {
    onCancelChanges,
    notifyOfChange,
    getOriginalContentSerializedElements,
  } = useSerializableObjectsCancelableEditor({
    serializableObjects,
    onCancel,
    resetThenClearPersistentUuid: true,
  });

  const lastSelectedVariableNodeId = React.useRef<string | null>(null);
  const onSelectedVariableChange = React.useCallback((nodes: Array<string>) => {
    lastSelectedVariableNodeId.current =
      nodes.length > 0 ? nodes[nodes.length - 1] : null;
  }, []);

  const shouldCreateVariable = React.useRef<boolean>(
    shouldCreateInitiallySelectedVariable || false
  );
  const actualInitiallySelectedVariableName = React.useRef<?string>(
    initiallySelectedVariableName
  );
  if (shouldCreateVariable.current) {
    shouldCreateVariable.current = false;
    const tabIndex = Math.max(
      0,
      tabs.indexOf(({ id }) => id === initiallyOpenTabId)
    );
    const { variablesContainer, inheritedVariablesContainer } = tabs[tabIndex];
    const { name: actualVariableName } = insertInVariablesContainer(
      variablesContainer,
      initiallySelectedVariableName
        ? getRootVariableName(initiallySelectedVariableName)
        : 'Variable',
      null,
      variablesContainer.count(),
      inheritedVariablesContainer
    );
    actualInitiallySelectedVariableName.current = actualVariableName;
    lastSelectedVariableNodeId.current = getNodeIdFromVariableName(
      actualVariableName
    );
  }

  const { isMobile } = useResponsiveWindowSize();
  const { DismissableTutorialMessage } = useDismissableTutorialMessage(
    'intro-variables'
  );
  const [currentTab, setCurrentTab] = React.useState(
    initiallyOpenTabId || tabs[0].id
  );

  const onRefactorAndApply = React.useCallback(
    async () => {
      const originalContentSerializedElements = getOriginalContentSerializedElements();
      for (const {
        id,
        variablesContainer,
        inheritedVariablesContainer,
      } of tabs) {
        const originalContentSerializedElement = originalContentSerializedElements.get(
          id
        );
        if (
          inheritedVariablesContainer ||
          // It can't actually happen.
          !originalContentSerializedElement
        ) {
          // No refactoring to do - this is a variable container of an instance
          // (or something else that overrides variables from another container),
          // which does not have an impact on the rest of the project.
        } else {
          const changeset = gd.WholeProjectRefactorer.computeChangesetForVariablesContainer(
            originalContentSerializedElement,
            variablesContainer
          );

          if (
            preventRefactoringToDeleteInstructions ||
            // While we support refactoring that would remove all references (actions, conditions...)
            // it's both a bit dangerous for the user and we would need to show the user what
            // will be removed before doing so. For now, just clear the removed variables so they don't
            // trigger any refactoring.
            true
          ) {
            // Clear the removed variables from the changeset, so they do not trigger
            // deletion of actions/conditions or events using them.
            changeset.clearRemovedVariables();
          }
          gd.WholeProjectRefactorer.applyRefactoringForVariablesContainer(
            project,
            variablesContainer,
            changeset,
            originalContentSerializedElement
          );
        }
        variablesContainer.clearPersistentUuid();
      }
      const tab = tabs.find(({ id }) => id === currentTab);
      if (tab) {
        onApply(
          lastSelectedVariableNodeId.current &&
            getVariablePathFromNodeId(
              lastSelectedVariableNodeId.current,
              tab.variablesContainer
            )
        );
      }
    },
    [
      tabs,
      project,
      getOriginalContentSerializedElements,
      preventRefactoringToDeleteInstructions,
      currentTab,
      onApply,
    ]
  );

  return (
    <Dialog
      title={title}
      actions={[
        <FlatButton
          label={<Trans>Cancel</Trans>}
          onClick={onCancelChanges}
          key="Cancel"
        />,
        <DialogPrimaryButton
          label={<Trans>Apply</Trans>}
          primary
          onClick={onRefactorAndApply}
          key="Apply"
          id="apply-button"
        />,
      ]}
      secondaryActions={[
        onEditObjectVariables ? (
          <FlatButton
            key="edit-object-variables"
            label={<Trans>Edit Object Variables</Trans>}
            primary={false}
            onClick={onEditObjectVariables}
          />
        ) : null,
        hotReloadPreviewButtonProps ? (
          <HotReloadPreviewButton
            key="hot-reload-preview-button"
            {...hotReloadPreviewButtonProps}
            // Code generation is required because the code access to variables
            // with a number identifier that may change.
            isCodeGenerationRequired
          />
        ) : null,
        helpPagePath ? (
          <HelpButton helpPagePath={helpPagePath} key="help" />
        ) : null,
      ]}
      onRequestClose={onCancelChanges}
      onApply={onRefactorAndApply}
      open={open}
      flexBody
      fullHeight
      id={id}
      fixedContent={
        tabs.length > 1 ? (
          <Tabs
            value={currentTab}
            onChange={setCurrentTab}
            options={tabs.map(({ label, id }) => ({
              label,
              value: id,
              id,
            }))}
            // Enforce scroll on mobile, because the tabs have long names.
            variant={isMobile ? 'scrollable' : undefined}
          />
        ) : null
      }
    >
      {tabs.map(
        ({
          id,
          variablesContainer,
          inheritedVariablesContainer,
          emptyPlaceholderTitle,
          emptyPlaceholderDescription,
          onComputeAllVariableNames,
        }) => {
          return (
            currentTab === id && (
              <Column expand noMargin noOverflowParent id={id} key={id}>
                {variablesContainer.count() > 0 && DismissableTutorialMessage && (
                  <Line>
                    <Column expand>{DismissableTutorialMessage}</Column>
                  </Line>
                )}
                <VariablesList
                  projectScopedContainersAccessor={
                    projectScopedContainersAccessor
                  }
                  variablesContainer={variablesContainer}
                  areObjectVariables={areObjectVariables}
                  initiallySelectedVariableName={
                    actualInitiallySelectedVariableName.current
                  }
                  inheritedVariablesContainer={inheritedVariablesContainer}
                  emptyPlaceholderTitle={emptyPlaceholderTitle || null}
                  emptyPlaceholderDescription={
                    emptyPlaceholderDescription || null
                  }
                  onComputeAllVariableNames={onComputeAllVariableNames}
                  helpPagePath={helpPagePath}
                  onVariablesUpdated={notifyOfChange}
                  onSelectedVariableChange={onSelectedVariableChange}
                />
              </Column>
            )
          );
        }
      )}
    </Dialog>
  );
};

export default VariablesEditorDialog;
