// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import EventsBasedObjectEditor from './index';
import HelpButton from '../UI/HelpButton';
import { Tabs } from '../UI/Tabs';
import EventsBasedObjectPropertiesEditor from './EventsBasedObjectPropertiesEditor';
import EventBasedObjectChildrenEditor from './EventBasedObjectChildrenEditor';
import Background from '../UI/Background';
import { Column, Line, Spacer } from '../UI/Grid';
import { type UnsavedChanges } from '../MainFrame/UnsavedChangesContext';

type TabName = 'configuration' | 'properties' | 'children';

type Props = {|
  project: gdProject,
  globalObjectsContainer: gdObjectsContainer,
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  eventsBasedObject: gdEventsBasedObject,
  onRenameProperty: (oldName: string, newName: string) => void,
  unsavedChanges?: ?UnsavedChanges,
|};

export default function EventsBasedObjectEditorDialog({
  project,
  globalObjectsContainer,
  eventsFunctionsExtension,
  eventsBasedObject,
  onRenameProperty,
  // TODO Notify changes.
  unsavedChanges,
}: Props) {
  const [currentTab, setCurrentTab] = React.useState<TabName>('configuration');

  return (
    <Background>
      <Column expand useFullHeight noOverflowParent>
        <Line>
          <Column noMargin expand noOverflowParent>
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
          </Column>
        </Line>
        {currentTab === 'configuration' && (
          <EventsBasedObjectEditor eventsBasedObject={eventsBasedObject} />
        )}
        {currentTab === 'properties' && (
          <EventsBasedObjectPropertiesEditor
            project={project}
            extension={eventsFunctionsExtension}
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
      </Column>
    </Background>
  );
}
