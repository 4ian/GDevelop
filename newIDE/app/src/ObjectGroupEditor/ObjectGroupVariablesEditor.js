// @flow
import { Trans } from '@lingui/macro';
import React from 'react';
import { useSerializableObjectCancelableEditor } from '../Utils/SerializableObjectCancelableEditor';
import VariablesList from '../VariablesList/VariablesList';
import useDismissableTutorialMessage from '../Hints/useDismissableTutorialMessage';
import { Column, Line } from '../UI/Grid';
import { ProjectScopedContainersAccessor } from '../InstructionOrExpression/EventsScope.flow';

const gd: libGDevelop = global.gd;

export type ObjectGroupVariableEditorDialogInterface = {|
  applyChanges: () => void,
|};

type Props = {|
  project: gdProject,
  projectScopedContainersAccessor: ProjectScopedContainersAccessor,
  globalObjectsContainer: gdObjectsContainer | null,
  objectsContainer: gdObjectsContainer,
  group: gdObjectGroup,
|};

const ObjectGroupVariableEditor = React.forwardRef<
  Props,
  ObjectGroupVariableEditorDialogInterface
>(
  (
    {
      project,
      projectScopedContainersAccessor,
      globalObjectsContainer,
      objectsContainer,
      group,
    }: Props,
    ref
  ) => {
    // TODO Is it a memory leak?
    const groupVariablesContainer = React.useRef<gdVariablesContainer | null>(null);
    if (!groupVariablesContainer.current) {
      groupVariablesContainer.current = gd.GroupVariableHelper.mergeVariableContainers(
        projectScopedContainersAccessor.get().getObjectsContainersList(),
        group
      )
    }

    const {
      notifyOfChange,
      getOriginalContentSerializedElement,
    } = useSerializableObjectCancelableEditor({
      serializableObject: groupVariablesContainer.current,
      onCancel: () => {},
      resetThenClearPersistentUuid: true,
    });

    const { DismissableTutorialMessage } = useDismissableTutorialMessage(
      'intro-variables'
    );

    const applyChanges = () => {
      const originalSerializedVariables = getOriginalContentSerializedElement();
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

    React.useImperativeHandle(ref, () => ({
      applyChanges,
    }));

    return (
      <>
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
          emptyPlaceholderTitle={<Trans>Add your first object variable</Trans>}
          emptyPlaceholderDescription={
            <Trans>
              These variables hold additional information on an object.
            </Trans>
          }
          helpPagePath={'/all-features/variables/object-variables'}
          // TODO
          //onComputeAllVariableNames={onComputeAllVariableNames}
          onVariablesUpdated={notifyOfChange}
        />
      </>
    );
  }
);

export default ObjectGroupVariableEditor;
