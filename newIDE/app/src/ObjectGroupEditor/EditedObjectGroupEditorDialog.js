// @flow
import { Trans } from '@lingui/macro';
import React from 'react';
import FlatButton from '../UI/FlatButton';
import ObjectGroupEditor from '.';
import Dialog, { DialogPrimaryButton } from '../UI/Dialog';
import { useSerializableObjectCancelableEditor } from '../Utils/SerializableObjectCancelableEditor';
import useForceUpdate from '../Utils/UseForceUpdate';
import { Tabs } from '../UI/Tabs';
import { Column, Line } from '../UI/Grid';
import { ProjectScopedContainersAccessor } from '../InstructionOrExpression/EventsScope';
import useDismissableTutorialMessage from '../Hints/useDismissableTutorialMessage';
import VariablesList from '../VariablesList/VariablesList';
import HelpButton from '../UI/HelpButton';
import useValueWithInit from '../Utils/UseRefInitHook';
import Text from '../UI/Text';

const gd: libGDevelop = global.gd;

export type ObjectGroupEditorTab = 'objects' | 'variables';

type Props = {|
  project: gdProject,
  projectScopedContainersAccessor: ProjectScopedContainersAccessor,
  group: gdObjectGroup,
  onApply: () => void,
  onCancel: () => void,
  globalObjectsContainer: gdObjectsContainer | null,
  objectsContainer: gdObjectsContainer,
  initialInstances: gdInitialInstancesContainer | null,
  initialTab: ?ObjectGroupEditorTab,
  onComputeAllVariableNames?: () => Array<string>,
  isVariableListLocked: boolean,
  isObjectListLocked: boolean,
|};

const EditedObjectGroupEditorDialog = ({
  project,
  projectScopedContainersAccessor,
  group,
  onApply,
  onCancel,
  globalObjectsContainer,
  objectsContainer,
  initialInstances,
  initialTab,
  onComputeAllVariableNames,
  isVariableListLocked,
  isObjectListLocked,
}: Props) => {
  const forceUpdate = useForceUpdate();
  const {
    onCancelChanges,
    notifyOfChange,
  } = useSerializableObjectCancelableEditor({
    serializableObject: group,
    onCancel,
  });

  const [currentTab, setCurrentTab] = React.useState<ObjectGroupEditorTab>(
    initialTab || 'objects'
  );

  const groupVariablesContainer = useValueWithInit(
    // The VariablesContainer is returned by value.
    // Thus, the same instance is reused every time.
    () =>
      gd.ObjectVariableHelper.mergeVariableContainers(
        projectScopedContainersAccessor.get().getObjectsContainersList(),
        group
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
    onApply();
    if (!initialInstances) {
      // This can only happens for legacy function object groups.
      // In this case, we don't do any refactoring.
      return;
    }

    const originalSerializedVariables = getOriginalVariablesSerializedElement();
    const changeset = gd.WholeProjectRefactorer.computeChangesetForVariablesContainer(
      originalSerializedVariables,
      groupVariablesContainer
    );

    gd.WholeProjectRefactorer.applyRefactoringForGroupVariablesContainer(
      project,
      globalObjectsContainer || objectsContainer,
      objectsContainer,
      initialInstances,
      groupVariablesContainer,
      group,
      changeset,
      originalSerializedVariables
    );
    // TODO Apply the changes on variants when it's done on an events-based object.
    groupVariablesContainer.clearPersistentUuid();
  };

  const removeObject = React.useCallback(
    (objectName: string) => {
      group.removeObject(objectName);
      // Force update to ensure dialog is properly positioned
      forceUpdate();
      notifyOfChange();
    },
    [forceUpdate, group, notifyOfChange]
  );

  const addObject = React.useCallback(
    (objectName: string) => {
      group.addObject(objectName);
      // Force update to ensure dialog is properly positioned
      forceUpdate();
      notifyOfChange();
    },
    [forceUpdate, group, notifyOfChange]
  );

  const { DismissableTutorialMessage } = useDismissableTutorialMessage(
    'intro-variables'
  );

  return (
    <Dialog
      title={<Trans>Edit {group.getName()}</Trans>}
      key={group.ptr}
      actions={[
        <FlatButton
          key="cancel"
          label={<Trans>Cancel</Trans>}
          keyboardFocused
          onClick={onCancelChanges}
        />,
        <DialogPrimaryButton
          key="apply"
          label={<Trans>Apply</Trans>}
          primary
          onClick={apply}
        />,
      ]}
      secondaryActions={[
        <HelpButton key="help-button" helpPagePath="/objects/object-group" />,
      ]}
      onRequestClose={onCancelChanges}
      onApply={apply}
      open
      fullHeight
      flexBody
      fixedContent={
        <Tabs
          value={currentTab}
          onChange={setCurrentTab}
          options={[
            {
              label: <Trans>Objects</Trans>,
              value: 'objects',
            },
            {
              label: <Trans>Variables</Trans>,
              value: 'variables',
            },
          ]}
        />
      }
    >
      {currentTab === 'objects' &&
        (isObjectListLocked && group.getAllObjectsNames().size() === 0 ? (
          <Column noMargin expand justifyContent="center">
            <Text size="block-title" align="center">
              {<Trans>Empty group</Trans>}
            </Text>
            <Text align="center" noMargin>
              {<Trans>This object group is empty and locked.</Trans>}
            </Text>
          </Column>
        ) : (
          <ObjectGroupEditor
            project={project}
            projectScopedContainersAccessor={projectScopedContainersAccessor}
            globalObjectsContainer={globalObjectsContainer}
            objectsContainer={objectsContainer}
            groupObjectNames={group.getAllObjectsNames().toJSArray()}
            onObjectAdded={addObject}
            onObjectRemoved={removeObject}
            isObjectListLocked={isObjectListLocked}
          />
        ))}
      {currentTab === 'variables' && (
        <Column expand noMargin>
          {groupVariablesContainer.count() > 0 && DismissableTutorialMessage && (
            <Line>
              <Column noMargin expand>
                {DismissableTutorialMessage}
              </Column>
            </Line>
          )}
          <VariablesList
            projectScopedContainersAccessor={projectScopedContainersAccessor}
            variablesContainer={groupVariablesContainer}
            areObjectVariables
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
            isListLocked={isVariableListLocked}
          />
        </Column>
      )}
    </Dialog>
  );
};

export default EditedObjectGroupEditorDialog;
