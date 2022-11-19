// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import Dialog, { DialogPrimaryButton } from '../UI/Dialog';
import EventsBasedObjectEditor from './index';
import HelpButton from '../UI/HelpButton';
import { Tabs } from '../UI/Tabs';
import EventsBasedObjectPropertiesEditor from './EventsBasedObjectPropertiesEditor';
import EventBasedObjectChildrenEditor from './EventBasedObjectChildrenEditor';

type TabName = 'configuration' | 'properties' | 'children';

type Props = {|
  onApply: () => void,
  project: gdProject,
  globalObjectsContainer: gdObjectsContainer,
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  eventsBasedObject: gdEventsBasedObject,
  onRenameProperty: (oldName: string, newName: string) => void,
|};

export default function EventsBasedObjectEditorDialog({
  onApply,
  project,
  globalObjectsContainer,
  eventsFunctionsExtension,
  eventsBasedObject,
  onRenameProperty,
}: Props) {
  const [currentTab, setCurrentTab] = React.useState<TabName>('configuration');

  return (
    <Dialog
      title={<Trans>Edit {eventsBasedObject.getName()}</Trans>}
      secondaryActions={[
        <HelpButton key="help" helpPagePath="/objects/events-based-objects" />,
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
              value: 'properties',
              label: <Trans>Properties</Trans>,
            },
            {
              value: 'children',
              label: <Trans>Children</Trans>,
            },
          ]}
        />
      }
    >
      {currentTab === 'configuration' && (
        <EventsBasedObjectEditor eventsBasedObject={eventsBasedObject} />
      )}
      {currentTab === 'properties' && (
        <EventsBasedObjectPropertiesEditor
          project={project}
          eventsBasedObject={eventsBasedObject}
          onRenameProperty={onRenameProperty}
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
    </Dialog>
  );
}
