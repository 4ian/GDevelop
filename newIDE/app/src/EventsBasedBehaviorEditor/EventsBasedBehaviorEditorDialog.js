// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import Dialog, { DialogPrimaryButton } from '../UI/Dialog';
import EventsBasedBehaviorEditor from './index';
import HelpButton from '../UI/HelpButton';
import { Tabs } from '../UI/Tabs';
import EventsBasedBehaviorPropertiesEditor from './EventsBasedBehaviorPropertiesEditor';

type TabName = 'configuration' | 'behavior-properties' | 'scene-properties';

type Props = {|
  onApply: () => void,
  project: gdProject,
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  eventsBasedBehavior: gdEventsBasedBehavior,
  onRenameProperty: (oldName: string, newName: string) => void,
  onRenameSharedProperty: (oldName: string, newName: string) => void,
|};

type State = {|
  currentTab: TabName,
|};

export default class EventsBasedBehaviorEditorDialog extends React.Component<
  Props,
  State
> {
  state = {
    currentTab: 'configuration',
  };

  _changeTab = (newTab: TabName) => {
    this.setState({
      currentTab: newTab,
    });
  };

  render() {
    const {
      onApply,
      eventsBasedBehavior,
      eventsFunctionsExtension,
      project,
    } = this.props;
    const { currentTab } = this.state;

    return (
      <Dialog
        title={<Trans>Edit {eventsBasedBehavior.getName()}</Trans>}
        secondaryActions={[
          <HelpButton
            key="help"
            helpPagePath="/behaviors/events-based-behaviors"
          />,
        ]}
        actions={[
          <DialogPrimaryButton
            label={<Trans>Apply</Trans>}
            primary
            onClick={onApply}
            key={'Apply'}
          />,
        ]}
        open
        onRequestClose={onApply}
        onApply={onApply}
        fullHeight
        flexBody
        fixedContent={
          <Tabs
            value={currentTab}
            onChange={this._changeTab}
            options={[
              {
                value: 'configuration',
                label: <Trans>Configuration</Trans>,
              },
              {
                value: 'behavior-properties',
                label: <Trans>Behavior properties</Trans>,
              },
              {
                value: 'scene-properties',
                label: <Trans>Scene properties</Trans>,
              },
            ]}
          />
        }
      >
        {currentTab === 'configuration' && (
          <EventsBasedBehaviorEditor
            project={project}
            eventsFunctionsExtension={eventsFunctionsExtension}
            eventsBasedBehavior={eventsBasedBehavior}
          />
        )}
        {currentTab === 'behavior-properties' && (
          <EventsBasedBehaviorPropertiesEditor
            allowRequiredBehavior
            project={project}
            properties={eventsBasedBehavior.getPropertyDescriptors()}
            onPropertiesUpdated={() => {}}
            onRenameProperty={this.props.onRenameProperty}
            behaviorObjectType={eventsBasedBehavior.getObjectType()}
          />
        )}
        {currentTab === 'shared-properties' && (
          <EventsBasedBehaviorPropertiesEditor
            project={project}
            properties={eventsBasedBehavior.getSharedPropertyDescriptors()}
            onPropertiesUpdated={() => {}}
            onRenameProperty={this.props.onRenameSharedProperty}
          />
        )}
      </Dialog>
    );
  }
}
