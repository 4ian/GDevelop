// @flow
import { Trans } from '@lingui/macro';
import React from 'react';
import FlatButton from '../UI/FlatButton';
import ObjectGroupEditor from '.';
import ObjectGroupVariablesEditor, {
  type ObjectGroupVariableEditorDialogInterface,
} from './ObjectGroupVariablesEditor';
import Dialog, { DialogPrimaryButton } from '../UI/Dialog';
import { useSerializableObjectCancelableEditor } from '../Utils/SerializableObjectCancelableEditor';
import useForceUpdate from '../Utils/UseForceUpdate';
import { Tabs } from '../UI/Tabs';
import { Column } from '../UI/Grid';
import { ProjectScopedContainersAccessor } from '../InstructionOrExpression/EventsScope.flow';

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

  const objectGroupVariablesEditorInterface = React.useRef<ObjectGroupVariableEditorDialogInterface | null>(
    null
  );

  const apply = async () => {
    onApply();
    if (objectGroupVariablesEditorInterface.current) {
      objectGroupVariablesEditorInterface.current.applyChanges();
    }
  };

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
          group={group}
          globalObjectsContainer={globalObjectsContainer}
          objectsContainer={objectsContainer}
          onSizeUpdated={
            forceUpdate /*Force update to ensure dialog is properly positioned*/
          }
          onObjectGroupUpdated={notifyOfChange}
        />
      )}
      {currentTab === 'variables' && (
        <Column expand noMargin>
          <ObjectGroupVariablesEditor
            ref={objectGroupVariablesEditorInterface}
            project={project}
            projectScopedContainersAccessor={projectScopedContainersAccessor}
            globalObjectsContainer={globalObjectsContainer}
            objectsContainer={objectsContainer}
            group={group}
          />
        </Column>
      )}
    </Dialog>
  );
};

export default EditedObjectGroupEditorDialog;
