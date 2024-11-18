// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import EventsBasedObjectEditor from './index';
import { Tabs } from '../UI/Tabs';
import EventsBasedObjectPropertiesEditor from './EventsBasedObjectPropertiesEditor';
import Background from '../UI/Background';
import { Column, Line } from '../UI/Grid';
import { type UnsavedChanges } from '../MainFrame/UnsavedChangesContext';
import { ProjectScopedContainersAccessor } from '../InstructionOrExpression/EventsScope';

type TabName = 'configuration' | 'properties' | 'children';

type Props = {|
  project: gdProject,
  projectScopedContainersAccessor: ProjectScopedContainersAccessor,
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  eventsBasedObject: gdEventsBasedObject,
  onRenameProperty: (oldName: string, newName: string) => void,
  onPropertyTypeChanged: (propertyName: string) => void,
  onEventsFunctionsAdded: () => void,
  onOpenCustomObjectEditor: () => void,
  unsavedChanges?: ?UnsavedChanges,
  onEventsBasedObjectChildrenEdited: () => void,
|};

export default function EventsBasedObjectEditorPanel({
  project,
  projectScopedContainersAccessor,
  eventsFunctionsExtension,
  eventsBasedObject,
  onRenameProperty,
  onPropertyTypeChanged,
  onEventsFunctionsAdded,
  onOpenCustomObjectEditor,
  unsavedChanges,
  onEventsBasedObjectChildrenEdited,
}: Props) {
  const [currentTab, setCurrentTab] = React.useState<TabName>('configuration');

  const onPropertiesUpdated = React.useCallback(
    () => {
      if (unsavedChanges) {
        unsavedChanges.triggerUnsavedChanges();
      }
    },
    [unsavedChanges]
  );

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
              ]}
            />
          </Column>
        </Line>
        {currentTab === 'configuration' && (
          <EventsBasedObjectEditor
            eventsBasedObject={eventsBasedObject}
            unsavedChanges={unsavedChanges}
            onOpenCustomObjectEditor={onOpenCustomObjectEditor}
            onEventsBasedObjectChildrenEdited={
              onEventsBasedObjectChildrenEdited
            }
          />
        )}
        {currentTab === 'properties' && (
          <EventsBasedObjectPropertiesEditor
            project={project}
            projectScopedContainersAccessor={projectScopedContainersAccessor}
            extension={eventsFunctionsExtension}
            eventsBasedObject={eventsBasedObject}
            onRenameProperty={onRenameProperty}
            onPropertiesUpdated={onPropertiesUpdated}
            onPropertyTypeChanged={onPropertyTypeChanged}
            onEventsFunctionsAdded={onEventsFunctionsAdded}
          />
        )}
      </Column>
    </Background>
  );
}
