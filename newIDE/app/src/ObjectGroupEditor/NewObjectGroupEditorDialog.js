// @flow
import { t, Trans } from '@lingui/macro';
import React from 'react';
import FlatButton from '../UI/FlatButton';
import ObjectGroupEditor from '.';
import Dialog, { DialogPrimaryButton } from '../UI/Dialog';
import useForceUpdate from '../Utils/UseForceUpdate';
import { ProjectScopedContainersAccessor } from '../InstructionOrExpression/EventsScope';
import SemiControlledTextField from '../UI/SemiControlledTextField';
import { ColumnStackLayout } from '../UI/Layout';
import Checkbox from '../UI/Checkbox';
import HelpButton from '../UI/HelpButton';

export type ObjectGroupEditorTab = 'objects' | 'variables';

type Props = {|
  project: gdProject,
  projectScopedContainersAccessor: ProjectScopedContainersAccessor,
  onApply: (
    objectGroupName: string,
    shouldAnyVariables: boolean,
    groupObjectNames: Array<string>
  ) => void,
  onCancel: () => void,
  globalObjectsContainer: gdObjectsContainer | null,
  objectsContainer: gdObjectsContainer,
  isGroupAlreadyAdded: boolean,
|};

const NewObjectGroupEditorDialog = ({
  project,
  projectScopedContainersAccessor,
  onApply,
  onCancel,
  globalObjectsContainer,
  objectsContainer,
  isGroupAlreadyAdded,
}: Props) => {
  const forceUpdate = useForceUpdate();

  const [objectGroupName, setObjectGroupName] = React.useState<string>('');
  const [
    shouldSpreadAnyVariables,
    setShouldSpreadAnyVariables,
  ] = React.useState<boolean>(false);
  const [groupObjectNames, setGroupObjectNames] = React.useState<Array<string>>(
    []
  );

  const removeObject = React.useCallback(
    (removedObjectName: string) => {
      setGroupObjectNames(groupObjects =>
        groupObjects.filter(objectName => objectName !== removedObjectName)
      );

      // Force update to ensure dialog is properly positioned
      forceUpdate();
    },
    [forceUpdate]
  );

  const addObject = React.useCallback(
    (objectName: string) => {
      setGroupObjectNames(groupObjectNames => [
        ...groupObjectNames,
        objectName,
      ]);

      // Force update to ensure dialog is properly positioned
      forceUpdate();
    },
    [forceUpdate]
  );

  const apply = React.useCallback(
    () => {
      onApply(objectGroupName, shouldSpreadAnyVariables, groupObjectNames);
    },
    [groupObjectNames, objectGroupName, onApply, shouldSpreadAnyVariables]
  );

  return (
    <Dialog
      title={<Trans>Create a new group</Trans>}
      id="create-group-dialog"
      actions={[
        <FlatButton
          key="cancel"
          label={<Trans>Cancel</Trans>}
          onClick={onCancel}
        />,
        <DialogPrimaryButton
          key="apply"
          label={<Trans>Create</Trans>}
          primary
          onClick={apply}
        />,
      ]}
      secondaryActions={[
        <HelpButton key="help-button" helpPagePath="/objects/object-group" />,
      ]}
      onRequestClose={onCancel}
      onApply={apply}
      open
      maxWidth="sm"
      fixedContent={
        <ColumnStackLayout noMargin>
          {!isGroupAlreadyAdded && (
            <SemiControlledTextField
              fullWidth
              id="group-name"
              commitOnBlur
              floatingLabelText={<Trans>Group name</Trans>}
              floatingLabelFixed
              value={objectGroupName}
              translatableHintText={t`Group name`}
              onChange={setObjectGroupName}
              autoFocus="desktop"
            />
          )}
          <Checkbox
            label={<Trans>Add any object variable to the group</Trans>}
            checked={shouldSpreadAnyVariables}
            onCheck={(e, checked) => setShouldSpreadAnyVariables(checked)}
          />
        </ColumnStackLayout>
      }
    >
      <ObjectGroupEditor
        project={project}
        projectScopedContainersAccessor={projectScopedContainersAccessor}
        globalObjectsContainer={globalObjectsContainer}
        objectsContainer={objectsContainer}
        groupObjectNames={groupObjectNames}
        onObjectAdded={addObject}
        onObjectRemoved={removeObject}
      />
    </Dialog>
  );
};

export default NewObjectGroupEditorDialog;
