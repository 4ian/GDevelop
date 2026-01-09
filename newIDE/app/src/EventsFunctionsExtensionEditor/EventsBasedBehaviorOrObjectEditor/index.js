// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import EventsBasedBehaviorEditor from './EventsBasedBehaviorEditor';
import {
  EventsBasedBehaviorPropertiesEditor,
  type EventsBasedBehaviorPropertiesEditorInterface,
} from './EventsBasedBehaviorOrObjectPropertiesEditor';
import Background from '../../UI/Background';
import { type UnsavedChanges } from '../../MainFrame/UnsavedChangesContext';
import { type ExtensionItemConfigurationAttribute } from '../../EventsFunctionsExtensionEditor';
import { ProjectScopedContainersAccessor } from '../../InstructionOrExpression/EventsScope';
import Text from '../../UI/Text';
import { ColumnStackLayout } from '../../UI/Layout';
import { Column, Line } from '../../UI/Grid';
import ScrollView, { type ScrollViewInterface } from '../../UI/ScrollView';
import EventsBasedObjectEditor from './EventsBasedObjectEditor';
import RaisedButton from '../../UI/RaisedButton';
import AddIcon from '../../UI/CustomSvgIcons/Add';
import { useResponsiveWindowSize } from '../../UI/Responsive/ResponsiveWindowMeasurer';
import useForceUpdate from '../../Utils/UseForceUpdate';
import newNameGenerator from '../../Utils/NewNameGenerator';

type Props = {|
  project: gdProject,
  projectScopedContainersAccessor: ProjectScopedContainersAccessor,
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  eventsBasedBehavior?: ?gdEventsBasedBehavior,
  eventsBasedObject?: ?gdEventsBasedObject,
  onRenameProperty: (oldName: string, newName: string) => void,
  onRenameSharedProperty: (oldName: string, newName: string) => void,
  onPropertyTypeChanged: (propertyName: string) => void,
  onFocusProperty: (propertyName: string, isSharedProperties: boolean) => void,
  onPropertiesUpdated: () => void,
  onEventsFunctionsAdded: () => void,
  unsavedChanges?: ?UnsavedChanges,
  onConfigurationUpdated?: (?ExtensionItemConfigurationAttribute) => void,
  onOpenCustomObjectEditor: () => void,
  onEventsBasedObjectChildrenEdited: (
    eventsBasedObject: gdEventsBasedObject
  ) => void,
|};

export type EventsBasedBehaviorOrObjectEditorInterface = {|
  forceUpdateProperties: () => void,
  scrollToConfiguration: () => void,
  scrollToProperty: (propertyName: string, isSharedProperties: boolean) => void,
|};

export const EventsBasedBehaviorOrObjectEditor = React.forwardRef<
  Props,
  EventsBasedBehaviorOrObjectEditorInterface
>(
  (
    {
      eventsBasedBehavior,
      eventsBasedObject,
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
      onOpenCustomObjectEditor,
      onEventsBasedObjectChildrenEdited,
    }: Props,
    ref
  ) => {
    const forceUpdate = useForceUpdate();

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
    const scenePropertiesEditor = React.useRef<?EventsBasedBehaviorPropertiesEditorInterface>(
      null
    );

    const scrollToProperty = React.useCallback(
      (propertyName: string, isSharedProperties: boolean) => {
        if (!scrollView.current) {
          return;
        }
        if (isSharedProperties) {
          if (scenePropertiesEditor.current) {
            scrollView.current.scrollTo(
              scenePropertiesEditor.current.getPropertyEditorRef(propertyName)
            );
          }
        } else {
          if (propertiesEditor.current) {
            scrollView.current.scrollTo(
              propertiesEditor.current.getPropertyEditorRef(propertyName)
            );
          }
        }
      },
      []
    );

    React.useImperativeHandle(ref, () => ({
      forceUpdateProperties: () => {
        if (propertiesEditor.current) {
          propertiesEditor.current.forceUpdate();
        }
        if (scenePropertiesEditor.current) {
          scenePropertiesEditor.current.forceUpdate();
        }
      },
      scrollToConfiguration: () => {
        if (scrollView.current) {
          scrollView.current.scrollToPosition(0);
        }
      },
      scrollToProperty,
    }));

    const eventsBasedEntity = eventsBasedBehavior || eventsBasedObject;

    const addProperty = React.useCallback(
      () => {
        if (!eventsBasedEntity) {
          return;
        }
        const properties = eventsBasedEntity.getPropertyDescriptors();
        const newName = newNameGenerator('Property', name =>
          properties.has(name)
        );
        const property = properties.insertNew(newName, properties.getCount());
        property.setType('Number');
        forceUpdate();
        onPropertiesUpdated && onPropertiesUpdated();

        // Scroll to the selected property.
        // Ideally, we'd wait for the list to be updated to scroll, but
        // to simplify the code, we just wait a few ms for a new render
        // to be done.
        setTimeout(() => {
          scrollToProperty(newName, false);
        }, 100); // A few ms is enough for a new render to be done.
      },
      [eventsBasedEntity, forceUpdate, onPropertiesUpdated, scrollToProperty]
    );

    const { windowSize } = useResponsiveWindowSize();

    return (
      <Background>
        <ScrollView ref={scrollView}>
          <ColumnStackLayout expand useFullHeight noOverflowParent>
            {eventsBasedBehavior ? (
              <EventsBasedBehaviorEditor
                project={project}
                eventsFunctionsExtension={eventsFunctionsExtension}
                eventsBasedBehavior={eventsBasedBehavior}
                unsavedChanges={unsavedChanges}
                onConfigurationUpdated={onConfigurationUpdated}
              />
            ) : eventsBasedObject ? (
              <EventsBasedObjectEditor
                eventsFunctionsExtension={eventsFunctionsExtension}
                eventsBasedObject={eventsBasedObject}
                unsavedChanges={unsavedChanges}
                onOpenCustomObjectEditor={onOpenCustomObjectEditor}
                onEventsBasedObjectChildrenEdited={
                  onEventsBasedObjectChildrenEdited
                }
              />
            ) : null}
            <Text size="block-title">
              {eventsBasedObject ? (
                <Trans>Object properties</Trans>
              ) : (
                <Trans>Behavior properties</Trans>
              )}
            </Text>
            {eventsBasedEntity && (
              <EventsBasedBehaviorPropertiesEditor
                ref={propertiesEditor}
                project={project}
                projectScopedContainersAccessor={
                  projectScopedContainersAccessor
                }
                extension={eventsFunctionsExtension}
                eventsBasedBehavior={eventsBasedBehavior}
                properties={eventsBasedEntity.getPropertyDescriptors()}
                behaviorObjectType={
                  eventsBasedBehavior ? eventsBasedBehavior.getObjectType() : ''
                }
                onRenameProperty={onRenameProperty}
                onPropertiesUpdated={_onPropertiesUpdated}
                onFocusProperty={propertyName =>
                  onFocusProperty(propertyName, false)
                }
                onPropertyTypeChanged={onPropertyTypeChanged}
                onEventsFunctionsAdded={onEventsFunctionsAdded}
              />
            )}
            {eventsBasedBehavior && (
              <Text size="block-title">
                <Trans>Scene properties</Trans>
              </Text>
            )}
            {eventsBasedBehavior && (
              <EventsBasedBehaviorPropertiesEditor
                ref={scenePropertiesEditor}
                isSharedProperties
                project={project}
                projectScopedContainersAccessor={
                  projectScopedContainersAccessor
                }
                extension={eventsFunctionsExtension}
                eventsBasedBehavior={eventsBasedBehavior}
                properties={eventsBasedBehavior.getSharedPropertyDescriptors()}
                behaviorObjectType={
                  eventsBasedBehavior ? eventsBasedBehavior.getObjectType() : ''
                }
                onRenameProperty={onRenameSharedProperty}
                onPropertiesUpdated={_onPropertiesUpdated}
                onFocusProperty={propertyName =>
                  onFocusProperty(propertyName, true)
                }
                onPropertyTypeChanged={onPropertyTypeChanged}
                onEventsFunctionsAdded={onEventsFunctionsAdded}
              />
            )}
          </ColumnStackLayout>
        </ScrollView>
        {windowSize === 'small' && (
          <Column>
            <Line noMargin justifyContent="flex-end" expand>
              <RaisedButton
                primary
                label={<Trans>Add a property</Trans>}
                onClick={addProperty}
                icon={<AddIcon />}
              />
            </Line>
          </Column>
        )}
      </Background>
    );
  }
);
