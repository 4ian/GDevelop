// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import EventsBasedBehaviorEditor from './index';
import { Tabs } from '../UI/Tabs';
import EventsBasedBehaviorPropertiesEditor from './EventsBasedBehaviorPropertiesEditor';
import Background from '../UI/Background';
import { Column, Line } from '../UI/Grid';
import { type UnsavedChanges } from '../MainFrame/UnsavedChangesContext';
import { type ExtensionItemConfigurationAttribute } from '../EventsFunctionsExtensionEditor';
import { ProjectScopedContainersAccessor } from '../InstructionOrExpression/EventsScope';

type TabName = 'configuration' | 'behavior-properties' | 'scene-properties';

type Props = {|
  project: gdProject,
  projectScopedContainersAccessor: ProjectScopedContainersAccessor,
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  eventsBasedBehavior: gdEventsBasedBehavior,
  onRenameProperty: (oldName: string, newName: string) => void,
  onRenameSharedProperty: (oldName: string, newName: string) => void,
  onPropertyTypeChanged: (propertyName: string) => void,
  onEventsFunctionsAdded: () => void,
  unsavedChanges?: ?UnsavedChanges,
  onConfigurationUpdated?: (?ExtensionItemConfigurationAttribute) => void,
|};

export default function EventsBasedBehaviorEditorPanel({
  eventsBasedBehavior,
  eventsFunctionsExtension,
  project,
  projectScopedContainersAccessor,
  onRenameProperty,
  onRenameSharedProperty,
  onPropertyTypeChanged,
  unsavedChanges,
  onEventsFunctionsAdded,
  onConfigurationUpdated,
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
                  value: 'behavior-properties',
                  label: <Trans>Behavior properties</Trans>,
                },
                {
                  value: 'scene-properties',
                  label: <Trans>Scene properties</Trans>,
                },
              ]}
            />
          </Column>
        </Line>
        {currentTab === 'configuration' && (
          <EventsBasedBehaviorEditor
            project={project}
            eventsFunctionsExtension={eventsFunctionsExtension}
            eventsBasedBehavior={eventsBasedBehavior}
            unsavedChanges={unsavedChanges}
            onConfigurationUpdated={onConfigurationUpdated}
          />
        )}
        {currentTab === 'behavior-properties' && (
          <EventsBasedBehaviorPropertiesEditor
            project={project}
            projectScopedContainersAccessor={projectScopedContainersAccessor}
            extension={eventsFunctionsExtension}
            eventsBasedBehavior={eventsBasedBehavior}
            properties={eventsBasedBehavior.getPropertyDescriptors()}
            onRenameProperty={onRenameProperty}
            behaviorObjectType={eventsBasedBehavior.getObjectType()}
            onPropertiesUpdated={onPropertiesUpdated}
            onPropertyTypeChanged={onPropertyTypeChanged}
            onEventsFunctionsAdded={onEventsFunctionsAdded}
          />
        )}
        {currentTab === 'scene-properties' && (
          <EventsBasedBehaviorPropertiesEditor
            isSceneProperties
            project={project}
            projectScopedContainersAccessor={projectScopedContainersAccessor}
            extension={eventsFunctionsExtension}
            eventsBasedBehavior={eventsBasedBehavior}
            properties={eventsBasedBehavior.getSharedPropertyDescriptors()}
            onRenameProperty={onRenameSharedProperty}
            onPropertiesUpdated={onPropertiesUpdated}
            onPropertyTypeChanged={onPropertyTypeChanged}
            onEventsFunctionsAdded={onEventsFunctionsAdded}
          />
        )}
      </Column>
    </Background>
  );
}
