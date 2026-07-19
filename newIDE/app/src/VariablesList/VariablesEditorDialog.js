// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import FlatButton from '../UI/FlatButton';
import Dialog, { DialogPrimaryButton } from '../UI/Dialog';
import { useSerializableObjectsCancelableEditor } from '../Utils/SerializableObjectCancelableEditor';
import HotReloadPreviewButton, {
  type HotReloadPreviewButtonProps,
} from '../HotReload/HotReloadPreviewButton';
import UnifiedVariablesList from './UnifiedVariablesList';
import HelpButton from '../UI/HelpButton';
import { getVariablePathFromNodeId } from './VariableToTreeNodeHandling';
import { ProjectScopedContainersAccessor } from '../InstructionOrExpression/EventsScope';
import { insertInVariablesContainer } from '../Utils/VariablesUtils';
import { getRootVariableName } from '../EventsSheet/ParameterFields/VariableField';
import { getNodeIdFromVariableName } from './VariableToTreeNodeHandling';

const gd: libGDevelop = global.gd;

export type VariableDialogOpeningProps = {
  variableName: string,
  shouldCreate: boolean,
  variableType: 'number' | 'string' | 'boolean' | 'enum' | null,
};

type TabProps = {
  id: string,
  label: React.Node,
  variablesContainer: gdVariablesContainer,
  scopeLabel?: string,
  groupLabel?: React.Node,
  objectName?: ?string,
  initialInstances?: ?gdInitialInstancesContainer,
  skipRefactoring?: boolean,
  loopIndexVariableName?: string,
  onRenameLoopIndexVariable?: (newName: string) => void,
  onRemoveLoopIndexVariable?: () => void,
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
  objectName?: ?string,
  initialInstances?: ?gdInitialInstancesContainer,
  initiallyOpenTabId?: string,
  initiallySelectedVariable: VariableDialogOpeningProps | null,
  isListLocked: boolean,

  project: gdProject,
  hotReloadPreviewButtonProps: HotReloadPreviewButtonProps | null,

  helpPagePath: ?string,
  id?: string,
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
  id,
  tabs,
  initiallyOpenTabId,
  initiallySelectedVariable,
  projectScopedContainersAccessor,
  objectName,
  initialInstances,
  isListLocked,
}: Props): React.Node => {
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

  const lastSelectedVariable = React.useRef<?{
    scopeId: string,
    nodeId: string,
  }>(null);
  const onSelectedVariableChange = React.useCallback(
    (scopeId: string, nodeId: string) => {
      lastSelectedVariable.current = { scopeId, nodeId };
    },
    []
  );

  const shouldCreateVariable = React.useRef<boolean>(
    initiallySelectedVariable ? initiallySelectedVariable.shouldCreate : false
  );
  const actualInitiallySelectedVariableName = React.useRef<?string>(
    initiallySelectedVariable ? initiallySelectedVariable.variableName : null
  );
  if (shouldCreateVariable.current) {
    shouldCreateVariable.current = false;
    const tabIndex = Math.max(
      0,
      // $FlowFixMe[missing-local-annot]
      tabs.findIndex(({ id }) => id === initiallyOpenTabId)
    );
    const { variablesContainer } = tabs[tabIndex];
    const { name: actualVariableName } = insertInVariablesContainer(
      variablesContainer,
      initiallySelectedVariable
        ? getRootVariableName(initiallySelectedVariable.variableName)
        : 'Variable',
      null,
      variablesContainer.count(),
      null,
      initiallySelectedVariable ? initiallySelectedVariable.variableType : null
    );
    actualInitiallySelectedVariableName.current = actualVariableName;
    lastSelectedVariable.current = {
      scopeId: tabs[tabIndex].id,
      nodeId: getNodeIdFromVariableName(actualVariableName),
    };
  }

  const onRefactorAndApply = React.useCallback(
    async () => {
      const originalContentSerializedElements = getOriginalContentSerializedElements();
      for (const tab of tabs) {
        const { id, variablesContainer, skipRefactoring } = tab;
        const originalContentSerializedElement = originalContentSerializedElements.get(
          id
        );
        if (
          skipRefactoring ||
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
          const tabObjectName = tab.objectName || objectName;
          const tabInitialInstances = tab.initialInstances || initialInstances;
          if (tabObjectName && tabInitialInstances) {
            gd.WholeProjectRefactorer.applyRefactoringForObjectVariablesContainer(
              project,
              variablesContainer,
              tabInitialInstances,
              tabObjectName,
              changeset,
              originalContentSerializedElement
            );
          } else {
            gd.WholeProjectRefactorer.applyRefactoringForVariablesContainer(
              project,
              variablesContainer,
              changeset,
              originalContentSerializedElement
            );
          }
        }
        variablesContainer.clearPersistentUuid();
      }
      const selectedVariable = lastSelectedVariable.current;
      const tab = selectedVariable
        ? tabs.find(({ id }) => id === selectedVariable.scopeId)
        : null;
      if (tab) {
        onApply(
          selectedVariable &&
            getVariablePathFromNodeId(
              selectedVariable.nodeId,
              tab.variablesContainer
            )
        );
      } else {
        onApply(null);
      }
    },
    [
      getOriginalContentSerializedElements,
      tabs,
      objectName,
      initialInstances,
      project,
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
    >
      <UnifiedVariablesList
        // $FlowFixMe[incompatible-type] - TabProps and UnifiedVariablesScope
        // deliberately share the same public shape.
        scopes={tabs}
        primaryScopeId={tabs.length ? tabs[0].id : undefined}
        initiallyOpenScopeId={initiallyOpenTabId}
        initiallySelectedVariableName={
          actualInitiallySelectedVariableName.current
        }
        helpPagePath={helpPagePath}
        onVariablesUpdated={notifyOfChange}
        onSelectedVariableChange={onSelectedVariableChange}
        isListLocked={isListLocked}
      />
    </Dialog>
  );
};

export default VariablesEditorDialog;
