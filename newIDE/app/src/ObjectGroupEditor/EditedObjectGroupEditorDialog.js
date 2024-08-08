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
  initialTab: ?ObjectGroupEditorTab,
  onComputeAllVariableNames?: () => Array<string>,
|};

const EditedObjectGroupEditorDialog = ({
  project,
  projectScopedContainersAccessor,
  group,
  onApply,
  onCancel,
  globalObjectsContainer,
  objectsContainer,
  initialTab,
  onComputeAllVariableNames,
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
      gd.GroupVariableHelper.mergeVariableContainers(
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
      group,
      changeset,
      originalSerializedVariables
    );
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
      {currentTab === 'objects' && (
        <ObjectGroupEditor
          project={project}
          projectScopedContainersAccessor={projectScopedContainersAccessor}
          globalObjectsContainer={globalObjectsContainer}
          objectsContainer={objectsContainer}
          groupObjectNames={group.getAllObjectsNames().toJSArray()}
          onObjectAdded={addObject}
          onObjectRemoved={removeObject}
        />
      )}
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
          />
        </Column>
      )}
    </Dialog>
  );
};

export default EditedObjectGroupEditorDialog;
