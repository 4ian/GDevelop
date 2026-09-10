// @flow

import * as React from 'react';

// Keep first as it creates the `global.gd` object:
import { testProject } from '../../GDevelopJsInitializerDecorator';

import paperDecorator from '../../PaperDecorator';
import SpriteEditor from '../../../ObjectEditor/Editors/SpriteEditor';
import DragAndDropContextProvider from '../../../UI/DragAndDrop/DragAndDropContextProvider';
import CustomDragLayer from '../../../UI/DragAndDrop/CustomDragLayer';
import FixedHeightFlexContainer from '../../FixedHeightFlexContainer';
import fakeResourceManagementProps from '../../FakeResourceManagement';
import { getOrCreateStressTestSpriteObject } from './StressTestSpriteObject';

export default {
  title: 'ObjectEditor/SpriteEditorStressTest',
  component: SpriteEditor,
  decorators: [paperDecorator],
};

const profileData: Array<{|
  phase: string,
  actualDuration: number,
|}> = [];
// Expose measurements for scripted retrieval from the browser console.
window.__spriteEditorProfile = profileData;

const onProfilerRender = (
  id: string,
  phase: string,
  actualDuration: number
) => {
  profileData.push({ phase, actualDuration });
  console.log(
    `[SpriteEditorStressTest] ${phase}: ${actualDuration.toFixed(1)}ms ` +
      `(images in DOM: ${document.querySelectorAll('img').length})`
  );
};

// Enough animations to make the list scrollable, but light enough to load
// fast: useful to test the navigation in the animations list, and drag and
// drop of animations in it.
export const ManyShortAnimations = (): React.Node => {
  const { object } = getOrCreateStressTestSpriteObject(
    'MyManyShortAnimationsSpriteObject',
    12,
    2
  );
  const [, setChangesCount] = React.useState(0);
  const notifyOfChange = React.useCallback(
    () => setChangesCount(count => count + 1),
    []
  );
  const onSizeUpdated = React.useCallback(() => {}, []);
  return (
    <DragAndDropContextProvider>
      <FixedHeightFlexContainer height={700}>
        <SpriteEditor
          renderObjectNameField={() => null}
          objectConfiguration={object.getConfiguration()}
          projectScopedContainersAccessor={
            testProject.testSceneProjectScopedContainersAccessor
          }
          project={testProject.project}
          layout={testProject.testLayout}
          eventsFunctionsExtension={null}
          eventsBasedObject={null}
          resourceManagementProps={fakeResourceManagementProps}
          onSizeUpdated={onSizeUpdated}
          object={object}
          objectName="MyManyShortAnimationsSpriteObject"
          onObjectUpdated={notifyOfChange}
        />
      </FixedHeightFlexContainer>
      <CustomDragLayer />
    </DragAndDropContextProvider>
  );
};

// A single animation with a lot of frames: useful to test the navigation
// in the (scrollable) list of sprites, and drag and drop of sprites in it.
export const ManyFramesInOneAnimation = (): React.Node => {
  const { object } = getOrCreateStressTestSpriteObject(
    'MyManyFramesSpriteObject',
    1,
    30
  );
  const [, setChangesCount] = React.useState(0);
  const notifyOfChange = React.useCallback(
    () => setChangesCount(count => count + 1),
    []
  );
  const onSizeUpdated = React.useCallback(() => {}, []);
  return (
    <DragAndDropContextProvider>
      <FixedHeightFlexContainer height={700}>
        <SpriteEditor
          renderObjectNameField={() => null}
          objectConfiguration={object.getConfiguration()}
          projectScopedContainersAccessor={
            testProject.testSceneProjectScopedContainersAccessor
          }
          project={testProject.project}
          layout={testProject.testLayout}
          eventsFunctionsExtension={null}
          eventsBasedObject={null}
          resourceManagementProps={fakeResourceManagementProps}
          onSizeUpdated={onSizeUpdated}
          object={object}
          objectName="MyManyFramesSpriteObject"
          onObjectUpdated={notifyOfChange}
        />
      </FixedHeightFlexContainer>
      <CustomDragLayer />
    </DragAndDropContextProvider>
  );
};

export const ManyAnimations = (): React.Node => {
  const { object } = getOrCreateStressTestSpriteObject();
  // Mimic ObjectEditorDialog: every change notification re-renders the
  // parent, and the configuration is read again from the object on each
  // render.
  const [, setChangesCount] = React.useState(0);
  const notifyOfChange = React.useCallback(
    () => setChangesCount(count => count + 1),
    []
  );
  const onSizeUpdated = React.useCallback(() => {}, []);
  return (
    <DragAndDropContextProvider>
      <React.Profiler id="SpriteEditor" onRender={onProfilerRender}>
        <FixedHeightFlexContainer height={700}>
          <SpriteEditor
            renderObjectNameField={() => null}
            objectConfiguration={object.getConfiguration()}
            projectScopedContainersAccessor={
              testProject.testSceneProjectScopedContainersAccessor
            }
            project={testProject.project}
            layout={testProject.testLayout}
            eventsFunctionsExtension={null}
            eventsBasedObject={null}
            resourceManagementProps={fakeResourceManagementProps}
            onSizeUpdated={onSizeUpdated}
            object={object}
            objectName="MyStressTestSpriteObject"
            onObjectUpdated={notifyOfChange}
          />
        </FixedHeightFlexContainer>
      </React.Profiler>
    </DragAndDropContextProvider>
  );
};
