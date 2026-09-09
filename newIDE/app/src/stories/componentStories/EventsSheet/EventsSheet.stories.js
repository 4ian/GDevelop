// @flow

import * as React from 'react';
import { action } from '@storybook/addon-actions';

import EventsSheet from '../../../EventsSheet';
import DragAndDropContextProvider from '../../../UI/DragAndDrop/DragAndDropContextProvider';
import FixedHeightFlexContainer from '../../FixedHeightFlexContainer';
import { testProject } from '../../GDevelopJsInitializerDecorator';
import fakeResourceManagementProps from '../../FakeResourceManagement';
import fakeHotReloadPreviewButtonProps from '../../FakeHotReloadPreviewButtonProps';

const gd: libGDevelop = global.gd;

export default {
  title: 'EventsSheet/EventsSheet',
  component: EventsSheet,
};

export const DefaultNoScope = (): React.Node => (
  <DragAndDropContextProvider>
    <FixedHeightFlexContainer height={500}>
      <EventsSheet
        project={testProject.project}
        scope={{ project: testProject.project, layout: testProject.testLayout }}
        globalObjectsContainer={testProject.project.getObjects()}
        objectsContainer={testProject.testLayout.getObjects()}
        projectScopedContainersAccessor={
          testProject.testSceneProjectScopedContainersAccessor
        }
        events={testProject.testLayout.getEvents()}
        onOpenExternalEvents={action('Open external events')}
        resourceManagementProps={fakeResourceManagementProps}
        onOpenLayout={action('open layout')}
        onOpenSettings={action('open settings')}
        setToolbar={() => {}}
        openInstructionOrExpression={action('open instruction or expression')}
        onCreateEventsFunction={action('create events function')}
        onBeginCreateEventsFunction={action('begin create events function')}
        isActive={true}
        hotReloadPreviewButtonProps={fakeHotReloadPreviewButtonProps}
        onWillInstallExtension={action('extension will be installed')}
        onExtensionInstalled={action('extension installed')}
        onCreateNewExtensionWithBehavior={action(
          'onCreateNewExtensionWithBehavior'
        )}
        editEventsFunctionParameter={action('edit function parameter')}
        openEventsBasedEntityPropertyEditorDialog={action(
          'openEventsBasedEntityPropertyEditorDialog'
        )}
      />
    </FixedHeightFlexContainer>
  </DragAndDropContextProvider>
);

export const EmptyNoScope = (): React.Node => (
  <DragAndDropContextProvider>
    <FixedHeightFlexContainer height={500}>
      <EventsSheet
        project={testProject.project}
        scope={{
          project: testProject.project,
          layout: testProject.emptyLayout,
        }}
        globalObjectsContainer={testProject.project.getObjects()}
        objectsContainer={testProject.emptyLayout.getObjects()}
        projectScopedContainersAccessor={
          testProject.emptySceneProjectScopedContainersAccessor
        }
        events={testProject.emptyLayout.getEvents()}
        onOpenExternalEvents={action('Open external events')}
        resourceManagementProps={fakeResourceManagementProps}
        onOpenLayout={action('open layout')}
        onOpenSettings={action('open settings')}
        setToolbar={() => {}}
        openInstructionOrExpression={action('open instruction or expression')}
        onCreateEventsFunction={action('create events function')}
        onBeginCreateEventsFunction={action('begin create events function')}
        isActive={true}
        hotReloadPreviewButtonProps={fakeHotReloadPreviewButtonProps}
        onWillInstallExtension={action('extension will be installed')}
        onExtensionInstalled={action('extension installed')}
        onCreateNewExtensionWithBehavior={action(
          'onCreateNewExtensionWithBehavior'
        )}
        editEventsFunctionParameter={action('edit function parameter')}
        openEventsBasedEntityPropertyEditorDialog={action(
          'openEventsBasedEntityPropertyEditorDialog'
        )}
      />
    </FixedHeightFlexContainer>
  </DragAndDropContextProvider>
);

/**
 * A sheet with many events, to test scrolling: drag an event close to the
 * top or bottom edge of the sheet, it must scroll smoothly all the way.
 */
export const LongSheetForDragAutoScroll = (): React.Node => {
  const events = React.useMemo(() => {
    const longEvents = new gd.EventsList();
    const testEvents = testProject.testLayout.getEvents();
    for (let i = 0; i < 20; i++) {
      longEvents.insertEvents(
        testEvents,
        0,
        testEvents.getEventsCount(),
        longEvents.getEventsCount()
      );
    }
    return longEvents;
  }, []);

  return (
    <DragAndDropContextProvider>
      <FixedHeightFlexContainer height={700}>
        <EventsSheet
          project={testProject.project}
          scope={{
            project: testProject.project,
            layout: testProject.testLayout,
          }}
          globalObjectsContainer={testProject.project.getObjects()}
          objectsContainer={testProject.testLayout.getObjects()}
          projectScopedContainersAccessor={
            testProject.testSceneProjectScopedContainersAccessor
          }
          events={events}
          onOpenExternalEvents={action('Open external events')}
          resourceManagementProps={fakeResourceManagementProps}
          onOpenLayout={action('open layout')}
          onOpenSettings={action('open settings')}
          setToolbar={() => {}}
          openInstructionOrExpression={action('open instruction or expression')}
          onCreateEventsFunction={action('create events function')}
          onBeginCreateEventsFunction={action('begin create events function')}
          isActive={true}
          hotReloadPreviewButtonProps={fakeHotReloadPreviewButtonProps}
          onWillInstallExtension={action('extension will be installed')}
          onExtensionInstalled={action('extension installed')}
          onCreateNewExtensionWithBehavior={action(
            'onCreateNewExtensionWithBehavior'
          )}
          editEventsFunctionParameter={action('edit function parameter')}
          openEventsBasedEntityPropertyEditorDialog={action(
            'openEventsBasedEntityPropertyEditorDialog'
          )}
        />
      </FixedHeightFlexContainer>
    </DragAndDropContextProvider>
  );
};
