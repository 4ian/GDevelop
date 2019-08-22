// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import ObjectGroupsListWithObjectGroupEditor from '../../ObjectGroupsList/ObjectGroupsListWithObjectGroupEditor';
import { Tabs, Tab } from '../../UI/Tabs';
import EventsFunctionParametersEditor from './EventsFunctionParametersEditor';
import EventsFunctionPropertiesEditor from './EventsFunctionPropertiesEditor';
import ScrollView from '../../UI/ScrollView';
import { Column } from '../../UI/Grid';

type Props = {|
  project: gdProject,
  globalObjectsContainer: gdObjectsContainer,
  objectsContainer: gdObjectsContainer,
  eventsFunction: gdEventsFunction,
  eventsBasedBehavior: ?gdEventsBasedBehavior,
  onParametersOrGroupsUpdated: () => void,
  helpPagePath?: string,
  onConfigurationUpdated?: () => void,
  renderConfigurationHeader?: () => React.Node,
  freezeParameters?: boolean,
  freezeEventsFunctionType?: boolean,
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

  _chooseTab = (currentTab: TabNames) =>
    this.setState({
      currentTab,
    });

  render() {
    const {
      project,
      globalObjectsContainer,
      objectsContainer,
      eventsFunction,
      eventsBasedBehavior,
      freezeEventsFunctionType,
      onConfigurationUpdated,
      onParametersOrGroupsUpdated,
      freezeParameters,
      helpPagePath,
      renderConfigurationHeader,
    } = this.props;

    return (
      <Column expand noMargin>
        <Tabs value={this.state.currentTab} onChange={this._chooseTab}>
          <Tab
            label={<Trans>Configuration</Trans>}
            value={('config': TabNames)}
          />
          <Tab
            label={<Trans>Parameters</Trans>}
            value={('parameters': TabNames)}
          />
          <Tab
            label={<Trans>Object groups</Trans>}
            value={('groups': TabNames)}
          >
            {/* Manually display tabs to support flex */}
          </Tab>
        </Tabs>
        {this.state.currentTab === 'config' ? (
          <ScrollView>
            <EventsFunctionPropertiesEditor
              eventsFunction={eventsFunction}
              eventsBasedBehavior={eventsBasedBehavior}
              helpPagePath={helpPagePath}
              onConfigurationUpdated={onConfigurationUpdated}
              renderConfigurationHeader={renderConfigurationHeader}
              freezeEventsFunctionType={freezeEventsFunctionType}
            />
          </ScrollView>
        ) : null}
        {this.state.currentTab === 'parameters' ? (
          <ScrollView>
            <EventsFunctionParametersEditor
              project={project}
              eventsFunction={eventsFunction}
              eventsBasedBehavior={eventsBasedBehavior}
              onParametersUpdated={onParametersOrGroupsUpdated}
              helpPagePath={helpPagePath}
              freezeParameters={freezeParameters}
            />
          </ScrollView>
        ) : null}
        {this.state.currentTab === 'groups' ? (
          <ObjectGroupsListWithObjectGroupEditor
            project={project}
            globalObjectsContainer={globalObjectsContainer}
            objectsContainer={objectsContainer}
            globalObjectGroups={globalObjectsContainer.getObjectGroups()}
            objectGroups={eventsFunction.getObjectGroups()}
            onGroupsUpdated={onParametersOrGroupsUpdated}
          />
        ) : null}
      </Column>
    );
  }
}
