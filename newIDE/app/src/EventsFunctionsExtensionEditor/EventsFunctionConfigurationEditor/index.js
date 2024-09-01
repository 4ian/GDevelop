// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import ObjectGroupsListWithObjectGroupEditor from '../../ObjectGroupsList/ObjectGroupsListWithObjectGroupEditor';
import { Tabs } from '../../UI/Tabs';
import { EventsFunctionParametersEditor } from './EventsFunctionParametersEditor';
import { EventsFunctionPropertiesEditor } from './EventsFunctionPropertiesEditor';
import ScrollView from '../../UI/ScrollView';
import { Column, Line } from '../../UI/Grid';
import { type GroupWithContext } from '../../ObjectsList/EnumerateObjects';
import { type UnsavedChanges } from '../../MainFrame/UnsavedChangesContext';
import newNameGenerator from '../../Utils/NewNameGenerator';
import { type ExtensionItemConfigurationAttribute } from '../../EventsFunctionsExtensionEditor';
import { ProjectScopedContainersAccessor } from '../../InstructionOrExpression/EventsScope';

const gd: libGDevelop = global.gd;

type Props = {|
  project: gdProject,
  projectScopedContainersAccessor: ProjectScopedContainersAccessor,
  objectsContainer: gdObjectsContainer,
  eventsFunction: gdEventsFunction,
  eventsBasedBehavior: gdEventsBasedBehavior | null,
  eventsBasedObject: gdEventsBasedObject | null,
  eventsFunctionsContainer: gdEventsFunctionsContainer,
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  onParametersOrGroupsUpdated: () => void,
  helpPagePath?: string,
  onConfigurationUpdated?: (?ExtensionItemConfigurationAttribute) => void,
  renderConfigurationHeader?: () => React.Node,
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
  unsavedChanges?: ?UnsavedChanges,
  getFunctionGroupNames?: () => string[],
|};

type TabNames = 'config' | 'parameters' | 'groups';

type State = {|
  currentTab: TabNames,
|};

export default class EventsFunctionConfigurationEditor extends React.Component<
  Props,
  State
> {
  state = {
    currentTab: 'config',
  };

  _getValidatedObjectOrGroupName = (newName: string) => {
    const { objectsContainer } = this.props;

    const safeAndUniqueNewName = newNameGenerator(
      gd.Project.getSafeName(newName),
      tentativeNewName => {
        if (
          objectsContainer.hasObjectNamed(tentativeNewName) ||
          objectsContainer.getObjectGroups().has(tentativeNewName)
        ) {
          return true;
        }

        return false;
      }
    );

    return safeAndUniqueNewName;
  };

  _onDeleteGroup = (
    groupWithContext: GroupWithContext,
    done: boolean => void
  ) => {
    done(true);
  };

  _onRenameGroup = (
    groupWithContext: GroupWithContext,
    newName: string,
    done: boolean => void
  ) => {
    const { group } = groupWithContext;
    const {
      project,
      projectScopedContainersAccessor,
      eventsFunction,
    } = this.props;

    // newName is supposed to have been already validated

    // Avoid triggering renaming refactoring if name has not really changed
    if (group.getName() !== newName) {
      gd.WholeProjectRefactorer.objectOrGroupRenamedInEventsFunction(
        project,
        projectScopedContainersAccessor.get(),
        eventsFunction,
        group.getName(),
        newName,
        /* isObjectGroup=*/ true
      );
    }

    done(true);
  };

  _chooseTab = (currentTab: TabNames) =>
    this.setState({
      currentTab,
    });

  render() {
    const {
      project,
      projectScopedContainersAccessor,
      objectsContainer,
      eventsFunction,
      eventsBasedBehavior,
      eventsBasedObject,
      freezeEventsFunctionType,
      onConfigurationUpdated,
      onParametersOrGroupsUpdated,
      freezeParameters,
      helpPagePath,
      renderConfigurationHeader,
      onMoveFreeEventsParameter,
      onMoveBehaviorEventsParameter,
      onMoveObjectEventsParameter,
      getFunctionGroupNames,
      eventsFunctionsContainer,
      eventsFunctionsExtension,
    } = this.props;

    return (
      <Column expand useFullHeight noOverflowParent>
        <Line>
          <Column noMargin expand noOverflowParent>
            <Tabs
              value={this.state.currentTab}
              onChange={this._chooseTab}
              options={[
                {
                  value: ('config': TabNames),
                  label: <Trans>Configuration</Trans>,
                },
                {
                  value: ('parameters': TabNames),
                  label: <Trans>Parameters</Trans>,
                },
                {
                  value: ('groups': TabNames),
                  label: <Trans>Object groups</Trans>,
                },
              ]}
            />
          </Column>
        </Line>
        {this.state.currentTab === 'config' ? (
          <ScrollView>
            <Line>
              <EventsFunctionPropertiesEditor
                project={project}
                eventsFunction={eventsFunction}
                eventsBasedBehavior={eventsBasedBehavior}
                eventsBasedObject={eventsBasedObject}
                eventsFunctionsContainer={eventsFunctionsContainer}
                eventsFunctionsExtension={eventsFunctionsExtension}
                helpPagePath={helpPagePath}
                onConfigurationUpdated={onConfigurationUpdated}
                renderConfigurationHeader={renderConfigurationHeader}
                freezeEventsFunctionType={freezeEventsFunctionType}
                getFunctionGroupNames={getFunctionGroupNames}
              />
            </Line>
          </ScrollView>
        ) : null}
        {this.state.currentTab === 'parameters' ? (
          <EventsFunctionParametersEditor
            project={project}
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
            key={eventsFunction ? eventsFunction.ptr : null}
          />
        ) : null}
        {this.state.currentTab === 'groups' ? (
          <ObjectGroupsListWithObjectGroupEditor
            project={project}
            projectScopedContainersAccessor={projectScopedContainersAccessor}
            globalObjectsContainer={null}
            objectsContainer={objectsContainer}
            globalObjectGroups={null}
            objectGroups={eventsFunction.getObjectGroups()}
            getValidatedObjectOrGroupName={this._getValidatedObjectOrGroupName}
            onRenameGroup={this._onRenameGroup}
            onDeleteGroup={this._onDeleteGroup}
            onGroupsUpdated={onParametersOrGroupsUpdated}
            canSetAsGlobalGroup={false}
            unsavedChanges={this.props.unsavedChanges}
          />
        ) : null}
      </Column>
    );
  }
}
