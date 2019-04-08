// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import ObjectGroupsListWithObjectGroupEditor from '../../ObjectGroupsList/ObjectGroupsListWithObjectGroupEditor';
import { Tabs, Tab } from 'material-ui/Tabs';
import EventsFunctionParametersEditor from './EventsFunctionParametersEditor';
import EventsFunctionPropertiesEditor from './EventsFunctionPropertiesEditor';

type Props = {|
  project: gdProject,
  globalObjectsContainer: gdObjectsContainer,
  objectsContainer: gdObjectsContainer,
  eventsFunction: gdEventsFunction,
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

const styles = {
  scrollView: {
    overflowY: 'scroll',
  },
};

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
      freezeEventsFunctionType,
      onConfigurationUpdated,
      onParametersOrGroupsUpdated,
      freezeParameters,
      helpPagePath,
      renderConfigurationHeader,
    } = this.props;

    return (
      // TODO: ScrollView
      <div style={styles.scrollView}>
        <Tabs
          value={this.state.currentTab}
          onChange={this._chooseTab}
          // contentContainerStyle={{ display: 'flex', flex: 1 }}
          // tabTemplateStyle={{ display: 'flex', flex: 1 }}
        >
          <Tab
            label={<Trans>Configuration</Trans>}
            value={('config': TabNames)}
          >
            <EventsFunctionPropertiesEditor
              eventsFunction={eventsFunction}
              helpPagePath={helpPagePath}
              onConfigurationUpdated={onConfigurationUpdated}
              renderConfigurationHeader={renderConfigurationHeader}
              freezeEventsFunctionType={freezeEventsFunctionType}
            />
          </Tab>
          <Tab
            label={<Trans>Parameters</Trans>}
            value={('parameters': TabNames)}
          >
            <EventsFunctionParametersEditor
              project={project}
              eventsFunction={eventsFunction}
              onParametersUpdated={onParametersOrGroupsUpdated}
              helpPagePath={helpPagePath}
              freezeParameters={freezeParameters}
            />
          </Tab>
          <Tab
            label={<Trans>Object groups</Trans>}
            value={('groups': TabNames)}
          >
            <div style={{ height: 400 }}>
              <ObjectGroupsListWithObjectGroupEditor
                globalObjectsContainer={globalObjectsContainer}
                objectsContainer={objectsContainer}
                globalObjectGroups={globalObjectsContainer.getObjectGroups()}
                objectGroups={eventsFunction.getObjectGroups()}
                onGroupsUpdated={onParametersOrGroupsUpdated}
              />
            </div>
          </Tab>
        </Tabs>
      </div>
    );
  }
}
