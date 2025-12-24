// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import EventsBasedBehaviorEditor from './index';
import {
  EventsBasedBehaviorPropertiesEditor,
  type EventsBasedBehaviorPropertiesEditorInterface,
} from './EventsBasedBehaviorPropertiesEditor';
import Background from '../UI/Background';
import { type UnsavedChanges } from '../MainFrame/UnsavedChangesContext';
import { type ExtensionItemConfigurationAttribute } from '../EventsFunctionsExtensionEditor';
import { ProjectScopedContainersAccessor } from '../InstructionOrExpression/EventsScope';
import Text from '../UI/Text';
import { ColumnStackLayout } from '../UI/Layout';
import ScrollView, { type ScrollViewInterface } from '../UI/ScrollView';

type Props = {|
  project: gdProject,
  projectScopedContainersAccessor: ProjectScopedContainersAccessor,
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  eventsBasedBehavior: gdEventsBasedBehavior,
  onRenameProperty: (oldName: string, newName: string) => void,
  onRenameSharedProperty: (oldName: string, newName: string) => void,
  onPropertyTypeChanged: (propertyName: string) => void,
  onFocusProperty: (propertyName: string) => void,
  onPropertiesUpdated: () => void,
  onEventsFunctionsAdded: () => void,
  unsavedChanges?: ?UnsavedChanges,
  onConfigurationUpdated?: (?ExtensionItemConfigurationAttribute) => void,
|};

export type EventsBasedBehaviorEditorPanelInterface = {|
  forceUpdateProperties: () => void,
  scrollToProperty: (propertyName: string) => void,
|};

export const EventsBasedBehaviorEditorPanel = React.forwardRef<
  Props,
  EventsBasedBehaviorEditorPanelInterface
>(
  (
    {
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
      onPropertiesUpdated,
      onFocusProperty,
    }: Props,
    ref
  ) => {
    const _onPropertiesUpdated = React.useCallback(
      () => {
        if (unsavedChanges) {
          unsavedChanges.triggerUnsavedChanges();
        }
        onPropertiesUpdated();
      },
      [onPropertiesUpdated, unsavedChanges]
    );

    const scrollView = React.useRef<?ScrollViewInterface>(null);
    const propertiesEditor = React.useRef<?EventsBasedBehaviorPropertiesEditorInterface>(
      null
    );

    const scrollToProperty = React.useCallback((propertyName: string) => {
      if (scrollView.current && propertiesEditor.current) {
        scrollView.current.scrollTo(
          propertiesEditor.current.getPropertyEditorRef(propertyName)
        );
      }
    }, []);

    React.useImperativeHandle(ref, () => ({
      forceUpdateProperties: () => {
        if (propertiesEditor.current) {
          propertiesEditor.current.forceUpdate();
        }
      },
      scrollToProperty,
    }));

    return (
      <Background>
        <ScrollView ref={scrollView}>
          <ColumnStackLayout expand useFullHeight noOverflowParent>
            <Text size="block-title">
              <Trans>Configuration</Trans>
            </Text>
            <EventsBasedBehaviorEditor
              project={project}
              eventsFunctionsExtension={eventsFunctionsExtension}
              eventsBasedBehavior={eventsBasedBehavior}
              unsavedChanges={unsavedChanges}
              onConfigurationUpdated={onConfigurationUpdated}
            />
            <Text size="block-title">
              <Trans>Behavior properties</Trans>
            </Text>
            <EventsBasedBehaviorPropertiesEditor
              ref={propertiesEditor}
              project={project}
              projectScopedContainersAccessor={projectScopedContainersAccessor}
              extension={eventsFunctionsExtension}
              eventsBasedBehavior={eventsBasedBehavior}
              properties={eventsBasedBehavior.getPropertyDescriptors()}
              onRenameProperty={onRenameProperty}
              behaviorObjectType={eventsBasedBehavior.getObjectType()}
              onPropertiesUpdated={_onPropertiesUpdated}
              onFocusProperty={onFocusProperty}
              onPropertyTypeChanged={onPropertyTypeChanged}
              onEventsFunctionsAdded={onEventsFunctionsAdded}
            />
            <Text size="block-title">
              <Trans>Scene properties</Trans>
            </Text>
            <EventsBasedBehaviorPropertiesEditor
              isSceneProperties
              project={project}
              projectScopedContainersAccessor={projectScopedContainersAccessor}
              extension={eventsFunctionsExtension}
              eventsBasedBehavior={eventsBasedBehavior}
              properties={eventsBasedBehavior.getSharedPropertyDescriptors()}
              onRenameProperty={onRenameSharedProperty}
              onPropertiesUpdated={_onPropertiesUpdated}
              onFocusProperty={onFocusProperty}
              onPropertyTypeChanged={onPropertyTypeChanged}
              onEventsFunctionsAdded={onEventsFunctionsAdded}
            />
          </ColumnStackLayout>
        </ScrollView>
      </Background>
    );
  }
);
