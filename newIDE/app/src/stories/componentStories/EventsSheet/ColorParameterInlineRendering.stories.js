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
  title: 'EventsSheet/ColorParameterInlineRendering',
  component: EventsSheet,
};

// Build a dedicated events list (not attached to the shared test layout)
// with a few "Change the background color" actions, to check how the
// "color" parameter is rendered inline in the events sheet (it should
// show a small color swatch next to the "R;G;B" text).
const makeColorParameterEvents = () => {
  const events = new gd.EventsList();

  const addBackgroundColorEvent = (rgbColor: string) => {
    const event = events.insertNewEvent(
      testProject.project,
      'BuiltinCommonInstructions::Standard',
      events.getEventsCount()
    );
    const standardEvent = gd.asStandardEvent(event);

    const action = new gd.Instruction();
    action.setType('SceneBackground');
    action.setParametersCount(2);
    action.setParameter(1, '"' + rgbColor + '"');
    standardEvent.getActions().push_back(action);
    action.delete();
  };

  addBackgroundColorEvent('255;0;0');
  addBackgroundColorEvent('0;255;0');
  addBackgroundColorEvent('0;0;255');
  addBackgroundColorEvent('120;80;200');
  // Invalid color value, to check the "invalid parameter" rendering.
  addBackgroundColorEvent('not;a;color');

  return events;
};

export const ColorActionInlineRendering = (): React.Node => {
  const events = React.useMemo(() => makeColorParameterEvents(), []);

  return (
    <DragAndDropContextProvider>
      <FixedHeightFlexContainer height={400}>
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
          editEventsFunctionParameter={action('edit function parameter')}
          openEventsBasedEntityPropertyEditorDialog={action(
            'openEventsBasedEntityPropertyEditorDialog'
          )}
        />
      </FixedHeightFlexContainer>
    </DragAndDropContextProvider>
  );
};
