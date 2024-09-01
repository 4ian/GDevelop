// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import FlatButton from '../UI/FlatButton';
import Dialog, { DialogPrimaryButton } from '../UI/Dialog';
import { useSerializableObjectCancelableEditor } from '../Utils/SerializableObjectCancelableEditor';
import HotReloadPreviewButton, {
  type HotReloadPreviewButtonProps,
} from '../HotReload/HotReloadPreviewButton';
import useDismissableTutorialMessage from '../Hints/useDismissableTutorialMessage';
import { Column, Line } from '../UI/Grid';
import VariablesList from './VariablesList';
import HelpButton from '../UI/HelpButton';
import { getVariablePathFromNodeId } from './VariableToTreeNodeHandling';
import { ProjectScopedContainersAccessor } from '../InstructionOrExpression/EventsScope';
import { insertInVariablesContainer } from '../Utils/VariablesUtils';
import { getRootVariableName } from '../EventsSheet/ParameterFields/VariableField';
import { getNodeIdFromVariableName } from './VariableToTreeNodeHandling';
import useValueWithInit from '../Utils/UseRefInitHook';

const gd: libGDevelop = global.gd;

type Props = {|
  project: gdProject,
  projectScopedContainersAccessor: ProjectScopedContainersAccessor,
  globalObjectsContainer: gdObjectsContainer | null,
  objectsContainer: gdObjectsContainer,
  objectGroup: gdObjectGroup,
  onCancel: () => void,
  onApply: (selectedVariableName: string | null) => void,
  open: boolean,
  initiallySelectedVariableName?: string,
  shouldCreateInitiallySelectedVariable?: boolean,
  hotReloadPreviewButtonProps?: ?HotReloadPreviewButtonProps,
  onComputeAllVariableNames: () => Array<string>,
|};

const ObjectGroupVariablesDialog = ({
  project,
  projectScopedContainersAccessor,
  globalObjectsContainer,
  objectsContainer,
  objectGroup,
  onCancel,
  onApply,
  open,
  hotReloadPreviewButtonProps,
  initiallySelectedVariableName,
  shouldCreateInitiallySelectedVariable,
  onComputeAllVariableNames,
}: Props) => {
  const groupVariablesContainer = useValueWithInit(
    // The VariablesContainer is returned by value.
    // Thus, the same instance is reused every time.
    () =>
      gd.GroupVariableHelper.mergeVariableContainers(
        projectScopedContainersAccessor.get().getObjectsContainersList(),
        objectGroup
      )
  );

  const {
    notifyOfChange: notifyOfVariableChange,
    getOriginalContentSerializedElement: getOriginalVariablesSerializedElement,
  } = useSerializableObjectCancelableEditor({
    serializableObject: groupVariablesContainer,
    onCancel: () => {},
    resetThenClearPersistentUuid: true,
  });

  const apply = async () => {
    onApply(
      lastSelectedVariableNodeId.current &&
        getVariablePathFromNodeId(
          lastSelectedVariableNodeId.current,
          groupVariablesContainer
        )
    );

    const originalSerializedVariables = getOriginalVariablesSerializedElement();
    const changeset = gd.WholeProjectRefactorer.computeChangesetForVariablesContainer(
      originalSerializedVariables,
      groupVariablesContainer
    );

    gd.WholeProjectRefactorer.applyRefactoringForGroupVariablesContainer(
      project,
      globalObjectsContainer || objectsContainer,
      objectsContainer,
      groupVariablesContainer,
      objectGroup,
      changeset,
      originalSerializedVariables
    );
    groupVariablesContainer.clearPersistentUuid();
  };

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
    const { name: actualVariableName } = insertInVariablesContainer(
      groupVariablesContainer,
      initiallySelectedVariableName
        ? getRootVariableName(initiallySelectedVariableName)
        : 'Variable',
      null,
      groupVariablesContainer.count(),
      null
    );
    actualInitiallySelectedVariableName.current = actualVariableName;
    lastSelectedVariableNodeId.current = getNodeIdFromVariableName(
      actualVariableName
    );
  }

  const { DismissableTutorialMessage } = useDismissableTutorialMessage(
    'intro-variables'
  );

  return (
    <Dialog
      title={<Trans>{objectGroup.getName()} variables</Trans>}
      actions={[
        <FlatButton
          label={<Trans>Cancel</Trans>}
          onClick={onCancel}
          key="Cancel"
        />,
        <DialogPrimaryButton
          label={<Trans>Apply</Trans>}
          primary
          onClick={apply}
          key="Apply"
          id="apply-button"
        />,
      ]}
      secondaryActions={[
        hotReloadPreviewButtonProps ? (
          <HotReloadPreviewButton
            key="hot-reload-preview-button"
            {...hotReloadPreviewButtonProps}
          />
        ) : null,
        <HelpButton
          helpPagePath={'/all-features/variables/object-variables'}
          key="help"
        />,
      ]}
      onRequestClose={onCancel}
      onApply={apply}
      open={open}
      flexBody
      fullHeight
      id="object-group-variables-dialog"
    >
      <Column expand noMargin noOverflowParent>
        {groupVariablesContainer.count() > 0 && DismissableTutorialMessage && (
          <Line>
            <Column expand>{DismissableTutorialMessage}</Column>
          </Line>
        )}
        <VariablesList
          projectScopedContainersAccessor={projectScopedContainersAccessor}
          variablesContainer={groupVariablesContainer}
          areObjectVariables
          initiallySelectedVariableName={
            actualInitiallySelectedVariableName.current
          }
          emptyPlaceholderTitle={
            <Trans>Add your first object group variable</Trans>
          }
          emptyPlaceholderDescription={
            <Trans>
              These variables hold additional information and are available on
              all objects of the group.
            </Trans>
          }
          helpPagePath={'/all-features/variables/object-variables'}
          onComputeAllVariableNames={onComputeAllVariableNames}
          onVariablesUpdated={notifyOfVariableChange}
          onSelectedVariableChange={onSelectedVariableChange}
        />
      </Column>
    </Dialog>
  );
};

export default ObjectGroupVariablesDialog;
