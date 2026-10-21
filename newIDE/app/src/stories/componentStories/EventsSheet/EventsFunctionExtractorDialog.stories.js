// @flow
import * as React from 'react';
// Keep first as it creates the `global.gd` object:
import { testProject } from '../../GDevelopJsInitializerDecorator';
import { action } from 'storybook/actions';
import DragAndDropContextProvider from '../../../UI/DragAndDrop/DragAndDropContextProvider';
import EventsFunctionExtractorDialog from '../../../EventsSheet/EventsFunctionExtractor/EventsFunctionExtractorDialog';
import '../../../UI/Theme/Global/Scrollbar.css';
import '../../../UI/Theme/Global/Animation.css';

export default {
  title: 'EventsSheet/EventsFunctionExtractorDialog',
};

const Default = (): React.Node => (
  <DragAndDropContextProvider>
    <EventsFunctionExtractorDialog
      project={testProject.project}
      scope={{
        project: testProject.project,
        layout: testProject.testLayout,
      }}
      globalObjectsContainer={testProject.project.getObjects()}
      objectsContainer={testProject.testLayout.getObjects()}
      serializedEvents={testProject.testSerializedEvents}
      onClose={action('close')}
      onCreate={action('create')}
    />
  </DragAndDropContextProvider>
);

export { Default as __________________Default };
Default.storyName = 'default';

export const WithALotOfParameters = (): React.Node => (
  <DragAndDropContextProvider>
    <EventsFunctionExtractorDialog
      project={testProject.project}
      scope={{
        project: testProject.project,
        layout: testProject.testLayout,
      }}
      globalObjectsContainer={testProject.project.getObjects()}
      objectsContainer={testProject.testLayout.getObjects()}
      serializedEvents={testProject.testSerializedEventsWithLotsOfObjects}
      onClose={action('close')}
      onCreate={action('create')}
    />
  </DragAndDropContextProvider>
);
WithALotOfParameters.storyName = 'with a lot of parameters';
