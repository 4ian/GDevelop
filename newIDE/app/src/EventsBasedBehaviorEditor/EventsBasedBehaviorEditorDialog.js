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

export default function EventsBasedBehaviorEditorDialog({
  onApply,
  eventsBasedBehavior,
  eventsFunctionsExtension,
  project,
  onRenameProperty,
  onRenameSharedProperty,
}: Props) {
  const [currentTab, setCurrentTab] = React.useState<TabName>('configuration');

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
          onChange={setCurrentTab}
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
          project={project}
          extension={this.props.eventsFunctionsExtension}
          eventsBasedBehavior={eventsBasedBehavior}
          properties={eventsBasedBehavior.getPropertyDescriptors()}
          onRenameProperty={onRenameProperty}
          behaviorObjectType={eventsBasedBehavior.getObjectType()}
        />
      )}
      {currentTab === 'scene-properties' && (
        <EventsBasedBehaviorPropertiesEditor
          isSceneProperties
          project={project}
          extension={this.props.eventsFunctionsExtension}
          eventsBasedBehavior={eventsBasedBehavior}
          properties={eventsBasedBehavior.getSharedPropertyDescriptors()}
          onRenameProperty={onRenameSharedProperty}
        />
      )}
    </Dialog>
  );
}
