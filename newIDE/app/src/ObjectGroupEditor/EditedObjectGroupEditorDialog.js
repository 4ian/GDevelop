// @flow
import { Trans, t } from '@lingui/macro';
import React from 'react';
import FlatButton from '../UI/FlatButton';
import ObjectGroupEditor from '.';
import ObjectGroupRequiredBehaviorsEditor from './ObjectGroupRequiredBehaviorsEditor';
import ObjectGroupCommonFunctions from './ObjectGroupCommonFunctions';
import Dialog, { DialogPrimaryButton } from '../UI/Dialog';
import { useSerializableObjectCancelableEditor } from '../Utils/SerializableObjectCancelableEditor';
import useForceUpdate from '../Utils/UseForceUpdate';
import { Tabs } from '../UI/Tabs';
import { Column } from '../UI/Grid';
import { ProjectScopedContainersAccessor } from '../InstructionOrExpression/EventsScope';
import HelpButton from '../UI/HelpButton';
import Text from '../UI/Text';
import SemiControlledTextField from '../UI/SemiControlledTextField';
import { ColumnStackLayout } from '../UI/Layout';
import { type GroupWithContext } from '../ObjectsList/EnumerateObjects';

export type ObjectGroupEditorTab =
  | 'objects'
  | 'commonFunctions'
  | 'requiredBehaviors';

type Props = {|
  project: gdProject,
  projectScopedContainersAccessor: ProjectScopedContainersAccessor,
  group: gdObjectGroup,
  onApply: () => void,
  onCancel: () => void,
  globalObjectsContainer: gdObjectsContainer | null,
  objectsContainer: gdObjectsContainer,
  initialTab: ?ObjectGroupEditorTab,
  isObjectListLocked: boolean,
  isGroupGlobal: boolean,
  objectNameFilter?: string => boolean,
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
  initialTab,
  isObjectListLocked,
  isGroupGlobal,
  objectNameFilter,
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
  const requiredBehaviorTypes = group.getAllRequiredBehaviorTypes().toJSArray();

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

  const addRequiredBehavior = React.useCallback(
    (behaviorType: string) => {
      group.addRequiredBehavior(behaviorType);
      // Force update to ensure dialog is properly positioned.
      forceUpdate();
      notifyOfChange();
    },
    [forceUpdate, group, notifyOfChange]
  );

  const removeRequiredBehavior = React.useCallback(
    (behaviorType: string) => {
      group.removeRequiredBehavior(behaviorType);
      // Force update to ensure dialog is properly positioned.
      forceUpdate();
      notifyOfChange();
    },
    [forceUpdate, group, notifyOfChange]
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

  return (
    <Dialog
      title={
        <>
          <Trans>Edit</Trans> {objectGroupName}
        </>
      }
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
                label: <Trans>Common functions</Trans>,
                value: 'commonFunctions',
              },
              {
                label: <Trans>Required behaviors</Trans>,
                value: 'requiredBehaviors',
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
            objectNameFilter={objectNameFilter}
            requiredBehaviorTypes={requiredBehaviorTypes}
            groupName={group.getName()}
          />
        ))}
      {currentTab === 'commonFunctions' && (
        <ObjectGroupCommonFunctions
          project={project}
          projectScopedContainersAccessor={projectScopedContainersAccessor}
          globalObjectsContainer={globalObjectsContainer}
          objectsContainer={objectsContainer}
          groupName={group.getName()}
        />
      )}
      {currentTab === 'requiredBehaviors' && (
        <ObjectGroupRequiredBehaviorsEditor
          project={project}
          requiredBehaviorTypes={requiredBehaviorTypes}
          onRequiredBehaviorAdded={addRequiredBehavior}
          onRequiredBehaviorRemoved={removeRequiredBehavior}
        />
      )}
    </Dialog>
  );
};

export default EditedObjectGroupEditorDialog;
