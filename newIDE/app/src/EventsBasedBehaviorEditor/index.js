// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';

import * as React from 'react';
import TextField from '../UI/TextField';
import SemiControlledTextField from '../UI/SemiControlledTextField';
import ObjectTypeSelector from '../ObjectTypeSelector';
import { Tabs, Tab } from '../UI/Tabs';
import DismissableAlertMessage from '../UI/DismissableAlertMessage';
import AlertMessage from '../UI/AlertMessage';
import EventsBasedBehaviorPropertiesEditor from './EventsBasedBehaviorPropertiesEditor';
import { ColumnStackLayout } from '../UI/Layout';
import { Line } from '../UI/Grid';
const gd: libGDevelop = global.gd;

type TabName = 'configuration' | 'properties';

type Props = {|
  project: gdProject,
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  eventsBasedBehavior: gdEventsBasedBehavior,
  onPropertiesUpdated: () => void,
  onRenameProperty: (oldName: string, newName: string) => void,
  onTabChanged: () => void,
|};

type State = {|
  currentTab: TabName,
|};

export default class EventsBasedBehaviorEditor extends React.Component<
  Props,
  State
> {
  state = {
    currentTab: 'configuration',
  };

  // An array containing all the object types that are using the behavior
  _allObjectTypes: Array<string> = gd.WholeProjectRefactorer.getAllObjectTypesUsingEventsBasedBehavior(
    this.props.project,
    this.props.eventsFunctionsExtension,
    this.props.eventsBasedBehavior
  )
    .toNewVectorString()
    .toJSArray();

  _changeTab = (newTab: TabName) =>
    this.setState(
      {
        currentTab: newTab,
      },
      () => this.props.onTabChanged()
    );

  render() {
    const { currentTab } = this.state;
    const { eventsBasedBehavior, project } = this.props;

    return (
      <React.Fragment>
        <Tabs value={currentTab} onChange={this._changeTab}>
          <Tab label={<Trans>Configuration</Trans>} value="configuration" />
          <Tab label={<Trans>Properties</Trans>} value="properties" />
        </Tabs>
        <Line>
          {currentTab === 'configuration' && (
            <ColumnStackLayout expand>
              <DismissableAlertMessage
                identifier="events-based-behavior-explanation"
                kind="info"
              >
                <Trans>
                  This is the configuration of your behavior. Make sure to
                  choose a proper internal name as it's hard to change it later.
                  Enter a description explaining what the behavior is doing to
                  the object.
                </Trans>
              </DismissableAlertMessage>
              <TextField
                floatingLabelText={<Trans>Internal Name</Trans>}
                value={eventsBasedBehavior.getName()}
                disabled
                fullWidth
              />
              <SemiControlledTextField
                commitOnBlur
                floatingLabelText={<Trans>Name displayed in editor</Trans>}
                value={eventsBasedBehavior.getFullName()}
                onChange={text => {
                  eventsBasedBehavior.setFullName(text);
                  this.forceUpdate();
                }}
                fullWidth
              />
              <SemiControlledTextField
                commitOnBlur
                floatingLabelText={<Trans>Description</Trans>}
                floatingLabelFixed
                translatableHintText={t`The description of the behavior should explain what the behavior is doing to the object, and, briefly, how to use it.`}
                value={eventsBasedBehavior.getDescription()}
                onChange={text => {
                  eventsBasedBehavior.setDescription(text);
                  this.forceUpdate();
                }}
                multiline
                fullWidth
                rows={3}
              />
              <ObjectTypeSelector
                floatingLabelText={
                  <Trans>Object on which this behavior can be used</Trans>
                }
                project={project}
                value={eventsBasedBehavior.getObjectType()}
                onChange={(objectType: string) => {
                  eventsBasedBehavior.setObjectType(objectType);
                  this.forceUpdate();
                }}
                allowedObjectTypes={
                  this._allObjectTypes.length === 0
                    ? undefined /* Allow anything as the behavior is not used */
                    : this._allObjectTypes.length === 1
                    ? [
                        '',
                        this._allObjectTypes[0],
                      ] /* Allow only the type of the objects using the behavior */
                    : [
                        '',
                      ] /* More than one type of object are using the behavior. Only "any object" can be used on this behavior */
                }
              />
              {this._allObjectTypes.length > 1 && (
                <AlertMessage kind="info">
                  <Trans>
                    This behavior is being used by multiple types of objects.
                    Thus, you can't restrict its usage to any particular object
                    type. All the object types using this behavior are listed
                    here:
                    {this._allObjectTypes.join(', ')}
                  </Trans>
                </AlertMessage>
              )}
              {eventsBasedBehavior
                .getEventsFunctions()
                .getEventsFunctionsCount() === 0 && (
                <DismissableAlertMessage
                  identifier="empty-events-based-behavior-explanation"
                  kind="info"
                >
                  <Trans>
                    Once you're done, close this dialog and start adding some
                    functions to the behavior. Then, test the behavior by adding
                    it to an object in a scene.
                  </Trans>
                </DismissableAlertMessage>
              )}
            </ColumnStackLayout>
          )}
          {currentTab === 'properties' && (
            <EventsBasedBehaviorPropertiesEditor
              project={project}
              eventsBasedBehavior={eventsBasedBehavior}
              onPropertiesUpdated={this.props.onPropertiesUpdated}
              onRenameProperty={this.props.onRenameProperty}
            />
          )}
        </Line>
      </React.Fragment>
    );
  }
}
