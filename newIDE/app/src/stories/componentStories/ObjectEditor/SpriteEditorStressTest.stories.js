// @flow

import * as React from 'react';

// Keep first as it creates the `global.gd` object:
import { testProject } from '../../GDevelopJsInitializerDecorator';

import paperDecorator from '../../PaperDecorator';
import SpriteEditor from '../../../ObjectEditor/Editors/SpriteEditor';
import DragAndDropContextProvider from '../../../UI/DragAndDrop/DragAndDropContextProvider';
import FixedHeightFlexContainer from '../../FixedHeightFlexContainer';
import fakeResourceManagementProps from '../../FakeResourceManagement';

export default {
  title: 'ObjectEditor/SpriteEditorStressTest',
  component: SpriteEditor,
  decorators: [paperDecorator],
};

const ANIMATIONS_COUNT = 100;
const FRAMES_PER_ANIMATION = 8;

// Distinct images (all existing in `public/res`) so that, like in a real
// project, every frame resolves to its own resource and URL.
const DISTINCT_IMAGE_FILE_NAMES = [
  '1downarrow.png',
  '1downarrow1.png',
  '1leftarrow.png',
  '1rightarrow.png',
  '2leftarrow.png',
  '2rightarrow.png',
  '2uparrow.png',
  '3downarrow.png',
  'action24.png',
  'actionicon.png',
  'add24.png',
  'addfromimagebanque.png',
  'addFromLibrary24.png',
  'addicon.png',
  'addmore.png',
  'addmore64.png',
  'addobjet.png',
  'addobjet24.png',
  'addobjetdbg.png',
  'addpolygon.png',
  'addquad.png',
  'addtemplate.png',
  'addtemplate24.png',
  'addtemplateicon.png',
  'addvargicon.png',
  'addvaricon.png',
  'addvertice.png',
  'animation16.png',
  'antialiasing.png',
  'antialiasing24.png',
  'back.png',
  'backh.png',
  'bas24.png',
  'behavior16.png',
  'behavior24.png',
  'behavior64.png',
  'bigbug.png',
  'bigextensionbug.png',
  'blankicon.png',
  'bug.png',
  'bug24.png',
  'button_cancel.png',
  'button_ok.png',
  'center.png',
  'center24.png',
  'close24.png',
  'cocoonjslogo.png',
  'coloricon.png',
  'comment.png',
  'commentaire.png',
  'commentaireadd24.png',
  'commentaireaddicon.png',
  'community.png',
  'compilationicon.png',
  'compile128.png',
  'compilicon24.png',
  'condition24.png',
  'conditionicon.png',
  'console.png',
  'contraire.png',
];

const getOrCreateStressTestSpriteObject = () => {
  const gd = global.gd;
  const objectName = 'MyStressTestSpriteObject';
  const objectsContainer = testProject.testLayout.getObjects();
  if (!objectsContainer.hasObjectNamed(objectName)) {
    const resourcesManager = testProject.project.getResourcesManager();
    DISTINCT_IMAGE_FILE_NAMES.forEach(fileName => {
      const resourceName = 'stress-' + fileName;
      if (resourcesManager.hasResource(resourceName)) return;
      const imageResource = new gd.ImageResource();
      imageResource.setName(resourceName);
      imageResource.setFile('res/' + fileName);
      resourcesManager.addResource(imageResource);
      imageResource.delete();
    });
    const object = objectsContainer.insertNewObject(
      testProject.project,
      'Sprite',
      objectName,
      objectsContainer.getObjectsCount()
    );
    const spriteConfiguration = gd.asSpriteConfiguration(
      object.getConfiguration()
    );
    const animations = spriteConfiguration.getAnimations();
    for (let i = 0; i < ANIMATIONS_COUNT; i++) {
      const animation = new gd.Animation();
      animation.setName('Animation' + i);
      animation.setDirectionsCount(1);
      const direction = animation.getDirection(0);
      for (let j = 0; j < FRAMES_PER_ANIMATION; j++) {
        const sprite = new gd.Sprite();
        const imageIndex =
          (i * FRAMES_PER_ANIMATION + j) % DISTINCT_IMAGE_FILE_NAMES.length;
        sprite.setImageName('stress-' + DISTINCT_IMAGE_FILE_NAMES[imageIndex]);
        direction.addSprite(sprite);
        sprite.delete();
      }
      animations.addAnimation(animation);
      animation.delete();
    }
  }
  const object = objectsContainer.getObject(objectName);
  return {
    object,
    configuration: gd.asSpriteConfiguration(object.getConfiguration()),
  };
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
