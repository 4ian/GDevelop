// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';

import * as React from 'react';
import TextField from '../UI/TextField';
import SemiControlledTextField from '../UI/SemiControlledTextField';
import { Tabs, Tab } from '../UI/Tabs';
import DismissableAlertMessage from '../UI/DismissableAlertMessage';
import EventsBasedObjectPropertiesEditor from './EventsBasedObjectPropertiesEditor';
import EventBasedObjectChildrenEditor from './EventBasedObjectChildrenEditor';
import { ColumnStackLayout } from '../UI/Layout';
import { Line } from '../UI/Grid';

type TabName = 'configuration' | 'properties' | 'children';

type Props = {|
  project: gdProject,
  globalObjectsContainer: gdObjectsContainer,
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  eventsBasedObject: gdEventsBasedObject,
  onPropertiesUpdated: () => void,
  onRenameProperty: (oldName: string, newName: string) => void,
  onTabChanged: () => void,
|};

type State = {|
  currentTab: TabName,
|};

export default class EventsBasedObjectEditor extends React.Component<
  Props,
  State
> {
  state = {
    currentTab: 'configuration',
  };

  _changeTab = (newTab: TabName) =>
    this.setState(
      {
        currentTab: newTab,
      },
      () => this.props.onTabChanged()
    );

  render() {
    const { currentTab } = this.state;
    const {
      eventsBasedObject,
      project,
      globalObjectsContainer,
      eventsFunctionsExtension,
    } = this.props;

    return (
      <React.Fragment>
        <Tabs value={currentTab} onChange={this._changeTab}>
          <Tab label={<Trans>Configuration</Trans>} value="configuration" />
          <Tab label={<Trans>Properties</Trans>} value="properties" />
          <Tab label={<Trans>Children</Trans>} value="children" />
        </Tabs>
        <Line expand useFullHeight>
          {currentTab === 'configuration' && (
            <ColumnStackLayout expand>
              <DismissableAlertMessage
                identifier="events-based-object-explanation"
                kind="info"
              >
                <Trans>
                  This is the configuration of your object. Make sure to choose
                  a proper internal name as it's hard to change it later. Enter
                  a description explaining how the object works.
                </Trans>
              </DismissableAlertMessage>
              <TextField
                floatingLabelText={<Trans>Internal Name</Trans>}
                value={eventsBasedObject.getName()}
                disabled
                fullWidth
              />
              <SemiControlledTextField
                commitOnBlur
                floatingLabelText={<Trans>Name displayed in editor</Trans>}
                value={eventsBasedObject.getFullName()}
                onChange={text => {
                  eventsBasedObject.setFullName(text);
                  this.forceUpdate();
                }}
                fullWidth
              />
              <SemiControlledTextField
                commitOnBlur
                floatingLabelText={<Trans>Description</Trans>}
                floatingLabelFixed
                translatableHintText={t`The description of the object should explain what the object is doing, and, briefly, how to use it.`}
                value={eventsBasedObject.getDescription()}
                onChange={text => {
                  eventsBasedObject.setDescription(text);
                  this.forceUpdate();
                }}
                multiline
                fullWidth
                rows={3}
              />
              {eventsBasedObject
                .getEventsFunctions()
                .getEventsFunctionsCount() === 0 && (
                <DismissableAlertMessage
                  identifier="empty-events-based-object-explanation"
                  kind="info"
                >
                  <Trans>
                    Once you're done, close this dialog and start adding some
                    functions to the object. Then, test the object by adding to
                    a scene.
                  </Trans>
                </DismissableAlertMessage>
              )}
            </ColumnStackLayout>
          )}
          {currentTab === 'properties' && (
            <EventsBasedObjectPropertiesEditor
              project={project}
              eventsBasedObject={eventsBasedObject}
              onPropertiesUpdated={this.props.onPropertiesUpdated}
              onRenameProperty={this.props.onRenameProperty}
            />
          )}
          {currentTab === 'children' && (
            <EventBasedObjectChildrenEditor
              project={project}
              globalObjectsContainer={globalObjectsContainer}
              eventsFunctionsExtension={eventsFunctionsExtension}
              eventsBasedObject={eventsBasedObject}
            />
          )}
        </Line>
      </React.Fragment>
    );
  }
}
