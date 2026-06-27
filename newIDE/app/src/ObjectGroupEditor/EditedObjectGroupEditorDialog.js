// @flow
import { Trans, t } from '@lingui/macro';
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
import SemiControlledTextField from '../UI/SemiControlledTextField';
import { ColumnStackLayout } from '../UI/Layout';
import { type GroupWithContext } from '../ObjectsList/EnumerateObjects';

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
  isGroupGlobal: boolean,
  onRenameGroup?: (
    groupWithContext: GroupWithContext,
    newName: string,
    done: (boolean) => void
  ) => void,
  getValidatedObjectOrGroupName: (newName: string, global: boolean) => string,
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
  isGroupGlobal,
  onRenameGroup,
  getValidatedObjectOrGroupName,
}: Props): React.Node => {
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
  const [objectGroupName, setObjectGroupName] = React.useState<string>(
    group.getName()
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

  const applyNameChange = React.useCallback(
    (): Promise<boolean> =>
      new Promise(resolve => {
        if (objectGroupName === group.getName()) {
          resolve(true);
          return;
        }

        if (onRenameGroup) {
          const groupWithContext: GroupWithContext = {
            group,
            global: isGroupGlobal,
          };
          onRenameGroup(groupWithContext, objectGroupName, doRename => {
            if (doRename) group.setName(objectGroupName);
            resolve(doRename);
          });
          return;
        }

        group.setName(objectGroupName);
        resolve(true);
      }),
    [group, isGroupGlobal, objectGroupName, onRenameGroup]
  );

  const apply = async () => {
    const wasNameChangeApplied = await applyNameChange();
    if (!wasNameChangeApplied) return;

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
    const { eventsBasedObject } = projectScopedContainersAccessor._scope;
    if (eventsBasedObject) {
      for (const objectName of group.getAllObjectsNames().toJSArray()) {
        gd.ObjectVariableHelper.applyChangesToVariants(
          eventsBasedObject,
          objectName,
          changeset
        );
      }
    }
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
      if (
        isGroupGlobal &&
        (!globalObjectsContainer ||
          !globalObjectsContainer.hasObjectNamed(objectName))
      ) {
        return;
      }
      group.addObject(objectName);
      // Force update to ensure dialog is properly positioned
      forceUpdate();
      notifyOfChange();
    },
    [forceUpdate, globalObjectsContainer, group, isGroupGlobal, notifyOfChange]
  );

  React.useEffect(
    () => {
      if (!isGroupGlobal || !globalObjectsContainer) return;

      const nonGlobalObjectNames = group
        .getAllObjectsNames()
        .toJSArray()
        .filter(
          objectName => !globalObjectsContainer.hasObjectNamed(objectName)
        );
      if (nonGlobalObjectNames.length === 0) return;

      nonGlobalObjectNames.forEach(objectName =>
        group.removeObject(objectName)
      );
      forceUpdate();
      notifyOfChange();
    },
    [forceUpdate, globalObjectsContainer, group, isGroupGlobal, notifyOfChange]
  );

  const { DismissableTutorialMessage } = useDismissableTutorialMessage(
    'intro-variables'
  );

  return (
    <Dialog
      title={<Trans>Edit {objectGroupName}</Trans>}
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
        <ColumnStackLayout noMargin>
          <SemiControlledTextField
            fullWidth
            id="object-group-name"
            commitOnBlur
            floatingLabelText={<Trans>Group name</Trans>}
            floatingLabelFixed
            value={objectGroupName}
            translatableHintText={t`Group name`}
            onChange={newObjectGroupName => {
              if (newObjectGroupName === objectGroupName) return;

              setObjectGroupName(
                getValidatedObjectOrGroupName(newObjectGroupName, isGroupGlobal)
              );
              notifyOfChange();
            }}
            autoFocus="desktop"
          />
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
        </ColumnStackLayout>
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
            isGlobalGroup={isGroupGlobal}
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
