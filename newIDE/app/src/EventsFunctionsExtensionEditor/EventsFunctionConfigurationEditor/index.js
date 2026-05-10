// @flow
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';

import * as React from 'react';
import ObjectGroupsListWithObjectGroupEditor from '../../ObjectGroupsList/ObjectGroupsListWithObjectGroupEditor';
import { Tabs } from '../../UI/Tabs';
import CompactEventsFunctionParametersEditor, {
  type CompactEventsFunctionParametersEditorInterface,
} from './CompactEventsFunctionParametersEditor';
import { CompactEventsFunctionPropertiesEditor } from './CompactEventsFunctionPropertiesEditor';
import { Column, Line } from '../../UI/Grid';
import { type GroupWithContext } from '../../ObjectsList/EnumerateObjects';
import { type UnsavedChanges } from '../../MainFrame/UnsavedChangesContext';
import newNameGenerator from '../../Utils/NewNameGenerator';
import { type ExtensionItemConfigurationAttribute } from '../../EventsFunctionsExtensionEditor';
import { ProjectScopedContainersAccessor } from '../../InstructionOrExpression/EventsScope';
import { type VariableDialogOpeningProps } from '../../VariablesList/VariablesEditorDialog';
import useForceUpdate from '../../Utils/UseForceUpdate';

const gd: libGDevelop = global.gd;

export type EventsFunctionConfigurationEditorInterface = {
  editEventsFunctionParameter: VariableDialogOpeningProps => void,
};

type Props = {|
  project: gdProject,
  projectScopedContainersAccessor: ProjectScopedContainersAccessor,
  globalObjectsContainer: gdObjectsContainer | null,
  objectsContainer: gdObjectsContainer,
  eventsFunction: gdEventsFunction,
  eventsBasedBehavior: gdEventsBasedBehavior | null,
  eventsBasedObject: gdEventsBasedObject | null,
  eventsFunctionsContainer: gdEventsFunctionsContainer,
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  onParametersOrGroupsUpdated: () => void,
  helpPagePath?: string,
  onConfigurationUpdated?: (?ExtensionItemConfigurationAttribute) => void,
  freezeParameters?: boolean,
  freezeEventsFunctionType?: boolean,
  onMoveFreeEventsParameter?: (
    eventsFunction: gdEventsFunction,
    oldIndex: number,
    newIndex: number,
    done: (boolean) => void
  ) => void,
  onMoveBehaviorEventsParameter?: (
    eventsBasedBehavior: gdEventsBasedBehavior,
    eventsFunction: gdEventsFunction,
    oldIndex: number,
    newIndex: number,
    done: (boolean) => void
  ) => void,
  onMoveObjectEventsParameter?: (
    eventsBasedObject: gdEventsBasedObject,
    eventsFunction: gdEventsFunction,
    oldIndex: number,
    newIndex: number,
    done: (boolean) => void
  ) => void,
  onFunctionParameterWillBeRenamed: (
    eventsFunction: gdEventsFunction,
    oldName: string,
    newName: string
  ) => void,
  onFunctionParameterTypeChanged: (
    eventsFunction: gdEventsFunction,
    parameterName: string
  ) => void,
  unsavedChanges?: ?UnsavedChanges,
  getFunctionGroupNames?: () => string[],
|};

type TabNames = 'config' | 'parameters' | 'groups';

const EventsFunctionConfigurationEditor: React.ComponentType<{
  ...Props,
  +ref?: React.RefSetter<EventsFunctionConfigurationEditorInterface>,
}> = React.forwardRef<Props, EventsFunctionConfigurationEditorInterface>(
  (
    {
      project,
      projectScopedContainersAccessor,
      globalObjectsContainer,
      objectsContainer,
      eventsFunction,
      eventsBasedBehavior,
      eventsBasedObject,
      eventsFunctionsContainer,
      eventsFunctionsExtension,
      onParametersOrGroupsUpdated,
      helpPagePath,
      onConfigurationUpdated,
      freezeParameters,
      freezeEventsFunctionType,
      onMoveFreeEventsParameter,
      onMoveBehaviorEventsParameter,
      onMoveObjectEventsParameter,
      onFunctionParameterWillBeRenamed,
      onFunctionParameterTypeChanged,
      unsavedChanges,
      getFunctionGroupNames,
    },
    ref
  ) => {
    const forceUpdate = useForceUpdate();
    const [currentTab, setCurrentTab] = React.useState<TabNames>('config');
    const parametersEditor = React.useRef<?CompactEventsFunctionParametersEditorInterface>(
      null
    );

    React.useImperativeHandle(ref, () => ({
      editEventsFunctionParameter: (props: VariableDialogOpeningProps) => {
        if (parametersEditor.current) {
          parametersEditor.current.editEventsFunctionParameter(props);
        }
      },
    }));

    const _getValidatedObjectOrGroupName = (newName: string): any => {
      const objectsContainersList = projectScopedContainersAccessor
        .get()
        .getObjectsContainersList();

      const safeAndUniqueNewName = newNameGenerator(
        gd.Project.getSafeName(newName),
        tentativeNewName =>
          objectsContainersList.hasObjectOrGroupNamed(tentativeNewName)
      );

      return safeAndUniqueNewName;
    };

    const _onDeleteGroup = (
      groupWithContext: GroupWithContext,
      done: boolean => void
    ) => {
      done(true);
    };

    const _onRenameGroup = (
      groupWithContext: GroupWithContext,
      newName: string,
      done: boolean => void
    ) => {
      const { group } = groupWithContext;

      // newName is supposed to have been already validated

      // Avoid triggering renaming refactoring if name has not really changed
      if (group.getName() !== newName) {
        gd.WholeProjectRefactorer.objectOrGroupRenamedInEventsFunction(
          project,
          projectScopedContainersAccessor.get(),
          eventsFunction,
          // This is the ObjectsContainer generated from parameters
          objectsContainer,
          group.getName(),
          newName,
          /* isObjectGroup=*/ true
        );
      }

      done(true);
    };

    const _chooseTab = (currentTab: TabNames): any => setCurrentTab(currentTab);

    const hasLegacyFunctionObjectGroups =
      eventsFunction.getObjectGroups().count() > 0;

    return (
      <I18n>
        {({ i18n }) => (
          <Column expand useFullHeight noOverflowParent>
            {hasLegacyFunctionObjectGroups ? (
              <Line>
                <Column noMargin expand noOverflowParent>
                  <Tabs
                    value={currentTab}
                    onChange={_chooseTab}
                    options={[
                      {
                        value: ('config': TabNames),
                        label: <Trans>Configuration</Trans>,
                      },
                      {
                        value: ('groups': TabNames),
                        label: <Trans>Object groups</Trans>,
                      },
                    ]}
                  />
                </Column>
              </Line>
            ) : null}
            {currentTab === 'config' ? (
              <CompactEventsFunctionParametersEditor
                ref={parametersEditor}
                project={project}
                projectScopedContainersAccessor={
                  projectScopedContainersAccessor
                }
                eventsFunction={eventsFunction}
                eventsBasedBehavior={eventsBasedBehavior}
                eventsBasedObject={eventsBasedObject}
                eventsFunctionsContainer={eventsFunctionsContainer}
                eventsFunctionsExtension={eventsFunctionsExtension}
                onParametersUpdated={onParametersOrGroupsUpdated}
                helpPagePath={helpPagePath}
                freezeParameters={freezeParameters}
                onMoveFreeEventsParameter={onMoveFreeEventsParameter}
                onMoveBehaviorEventsParameter={onMoveBehaviorEventsParameter}
                onMoveObjectEventsParameter={onMoveObjectEventsParameter}
                onFunctionParameterWillBeRenamed={
                  onFunctionParameterWillBeRenamed
                }
                onFunctionParameterTypeChanged={onFunctionParameterTypeChanged}
                key={eventsFunction ? eventsFunction.ptr : null}
              >
                <CompactEventsFunctionPropertiesEditor
                  project={project}
                  eventsFunction={eventsFunction}
                  eventsBasedBehavior={eventsBasedBehavior}
                  eventsBasedObject={eventsBasedObject}
                  eventsFunctionsContainer={eventsFunctionsContainer}
                  eventsFunctionsExtension={eventsFunctionsExtension}
                  helpPagePath={helpPagePath}
                  onConfigurationUpdated={extensionItemConfigurationAttribute => {
                    onConfigurationUpdated &&
                      onConfigurationUpdated(
                        extensionItemConfigurationAttribute
                      );
                    // A function configuration change may impact the parameters.
                    forceUpdate();
                  }}
                  freezeEventsFunctionType={freezeEventsFunctionType}
                  getFunctionGroupNames={getFunctionGroupNames}
                />
              </CompactEventsFunctionParametersEditor>
            ) : null}
            {currentTab === 'groups' ? (
              <ObjectGroupsListWithObjectGroupEditor
                project={project}
                projectScopedContainersAccessor={
                  projectScopedContainersAccessor
                }
                globalObjectsContainer={globalObjectsContainer}
                objectsContainer={objectsContainer}
                globalObjectGroups={null}
                objectGroups={eventsFunction.getObjectGroups()}
                getValidatedObjectOrGroupName={_getValidatedObjectOrGroupName}
                onRenameGroup={_onRenameGroup}
                onDeleteGroup={_onDeleteGroup}
                onGroupsUpdated={onParametersOrGroupsUpdated}
                canSetAsGlobalGroup={false}
                unsavedChanges={unsavedChanges}
              />
            ) : null}
          </Column>
        )}
      </I18n>
    );
  }
);

export default EventsFunctionConfigurationEditor;
