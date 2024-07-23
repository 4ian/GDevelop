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
import { ProjectScopedContainersAccessor } from '../InstructionOrExpression/EventsScope.flow';
import useDismissableTutorialMessage from '../Hints/useDismissableTutorialMessage';
import VariablesList from '../VariablesList/VariablesList';

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

  // TODO Is it a memory leak?
  const groupVariablesContainer = ((React.useRef<gdVariablesContainer | null>(
    null
  ): any): { current: gdVariablesContainer });
  if (!groupVariablesContainer.current) {
    groupVariablesContainer.current = gd.GroupVariableHelper.mergeVariableContainers(
      projectScopedContainersAccessor.get().getObjectsContainersList(),
      group
    );
  }

  const {
    notifyOfChange: notifyOfVariableChange,
    getOriginalContentSerializedElement: getOriginalVariablesSerializedElement,
  } = useSerializableObjectCancelableEditor({
    serializableObject: groupVariablesContainer.current,
    onCancel: () => {},
    resetThenClearPersistentUuid: true,
  });

  const apply = async () => {
    onApply();

    const originalSerializedVariables = getOriginalVariablesSerializedElement();
    const changeset = gd.WholeProjectRefactorer.computeChangesetForVariablesContainer(
      originalSerializedVariables,
      groupVariablesContainer.current
    );

    gd.WholeProjectRefactorer.applyRefactoringForGroupVariablesContainer(
      project,
      globalObjectsContainer || objectsContainer,
      objectsContainer,
      groupVariablesContainer.current,
      group,
      changeset,
      originalSerializedVariables
    );
    groupVariablesContainer.current.clearPersistentUuid();
  };

  const [groupObjectNames, setGroupObjectNames] = React.useState<Array<string>>(
    () => group.getAllObjectsNames().toJSArray()
  );

  const removeObject = React.useCallback(
    (objectName: string) => {
      group.removeObject(objectName);

      setGroupObjectNames(group.getAllObjectsNames().toJSArray());
      // Force update to ensure dialog is properly positioned
      forceUpdate();
      notifyOfChange();
    },
    [forceUpdate, group, notifyOfChange]
  );

  const addObject = React.useCallback(
    (objectName: string) => {
      group.addObject(objectName);

      setGroupObjectNames(group.getAllObjectsNames().toJSArray());
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
          groupObjectNames={groupObjectNames}
          onObjectAdded={addObject}
          onObjectRemoved={removeObject}
        />
      )}
      {currentTab === 'variables' && (
        <Column expand noMargin>
          {groupVariablesContainer.current.count() > 0 &&
            DismissableTutorialMessage && (
              <Line>
                <Column noMargin expand>
                  {DismissableTutorialMessage}
                </Column>
              </Line>
            )}
          <VariablesList
            projectScopedContainersAccessor={projectScopedContainersAccessor}
            variablesContainer={groupVariablesContainer.current}
            areObjectVariables
            emptyPlaceholderTitle={
              <Trans>Add your first object variable</Trans>
            }
            emptyPlaceholderDescription={
              <Trans>
                These variables hold additional information on an object.
              </Trans>
            }
            helpPagePath={'/all-features/variables/object-variables'}
            // TODO
            //onComputeAllVariableNames={onComputeAllVariableNames}
            onVariablesUpdated={notifyOfVariableChange}
          />
        </Column>
      )}
    </Dialog>
  );
};

export default EditedObjectGroupEditorDialog;
