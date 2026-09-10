// @flow

import * as React from 'react';
import { t } from '@lingui/macro';

// Keep first as it creates the `global.gd` object:
import { testProject } from '../../GDevelopJsInitializerDecorator';

import paperDecorator from '../../PaperDecorator';
import SpriteEditor from '../../../ObjectEditor/Editors/SpriteEditor';
import SerializedObjectDisplay from '../../SerializedObjectDisplay';
import DragAndDropContextProvider from '../../../UI/DragAndDrop/DragAndDropContextProvider';
import CustomDragLayer from '../../../UI/DragAndDrop/CustomDragLayer';
import FixedHeightFlexContainer from '../../FixedHeightFlexContainer';
import AlertProvider from '../../../UI/Alert/AlertProvider';
import { emptyStorageProvider } from '../../../ProjectsStorage/ProjectStorageProviders';
import {
  type ChooseResourceOptions,
  type ResourceManagementProps,
  type ResourceSource,
} from '../../../ResourcesList/ResourceSource';
import { type ResourceExternalEditor } from '../../../ResourcesList/ResourceExternalEditor';

/**
 * These stories make every manipulation of the Sprite editor usable outside of
 * the app: the confirmation dialogs are shown (`AlertProvider`), frames can be
 * added (the resource chooser is faked and returns resources without any
 * dialog) and animations can be edited with a fake external editor. They also
 * expose the animations of the edited object on
 * `window.spriteEditorManipulations`, so that a test can check that what the
 * editor displays is what the object actually contains.
 */

export default {
  title: 'ObjectEditor/SpriteEditorManipulations',
  component: SpriteEditor,
  decorators: [paperDecorator],
};

// Images existing in `public/res`, so that every frame displays something.
const IMAGE_FILE_NAMES = [
  '1downarrow.png',
  '1leftarrow.png',
  '1rightarrow.png',
  '2uparrow.png',
  'add24.png',
  'addicon.png',
  'behavior24.png',
  'bug24.png',
  'center24.png',
  'close24.png',
  'comment.png',
  'console.png',
];

const getResourceName = (index: number) =>
  'manipulations-' + IMAGE_FILE_NAMES[index % IMAGE_FILE_NAMES.length];

const addImageResourceIfMissing = (resourceName: string, fileName: string) => {
  const gd = global.gd;
  const resourcesManager = testProject.project.getResourcesManager();
  if (resourcesManager.hasResource(resourceName)) return;

  const imageResource = new gd.ImageResource();
  imageResource.setName(resourceName);
  imageResource.setFile('res/' + fileName);
  resourcesManager.addResource(imageResource);
  imageResource.delete();
};

/**
 * Create (once) a sprite object with the given number of animations and frames.
 * The number of animations matters: the C++ vector holding them grows by
 * doubling, so adding an animation to an object having a power of two of them
 * reallocates it - and moves every animation, direction and sprite in memory.
 */
const getOrCreateSpriteObject = ({
  objectName,
  animationsCount,
  framesPerAnimation,
}: {|
  objectName: string,
  animationsCount: number,
  framesPerAnimation: number,
|}): gdObject => {
  const gd = global.gd;
  const objectsContainer = testProject.testLayout.getObjects();
  if (!objectsContainer.hasObjectNamed(objectName)) {
    IMAGE_FILE_NAMES.forEach(fileName =>
      addImageResourceIfMissing('manipulations-' + fileName, fileName)
    );

    const object = objectsContainer.insertNewObject(
      testProject.project,
      'Sprite',
      objectName,
      objectsContainer.getObjectsCount()
    );
    const animations = gd
      .asSpriteConfiguration(object.getConfiguration())
      .getAnimations();
    for (
      let animationIndex = 0;
      animationIndex < animationsCount;
      animationIndex++
    ) {
      const animation = new gd.Animation();
      animation.setName('Animation' + animationIndex);
      animation.setDirectionsCount(1);
      const direction = animation.getDirection(0);
      for (let frameIndex = 0; frameIndex < framesPerAnimation; frameIndex++) {
        const sprite = new gd.Sprite();
        sprite.setImageName(
          getResourceName(animationIndex * framesPerAnimation + frameIndex)
        );
        direction.addSprite(sprite);
        sprite.delete();
      }
      animations.addAnimation(animation);
      animation.delete();
    }
  }

  return objectsContainer.getObject(objectName);
};

/**
 * Read the animations of the object as plain JavaScript, to be compared with
 * what the editor displays.
 */
const readAnimations = (object: gdObject) => {
  const gd = global.gd;
  const animations = gd
    .asSpriteConfiguration(object.getConfiguration())
    .getAnimations();
  const readAnimation = (animationIndex: number) => {
    const animation = animations.getAnimation(animationIndex);
    const directions = [];
    for (
      let directionIndex = 0;
      directionIndex < animation.getDirectionsCount();
      directionIndex++
    ) {
      const direction = animation.getDirection(directionIndex);
      const frames = [];
      for (
        let spriteIndex = 0;
        spriteIndex < direction.getSpritesCount();
        spriteIndex++
      ) {
        frames.push(direction.getSprite(spriteIndex).getImageName());
      }
      directions.push({
        frames,
        timeBetweenFrames: direction.getTimeBetweenFrames(),
        isLooping: direction.isLooping(),
      });
    }
    return { name: animation.getName(), directions };
  };

  const readAnimations = [];
  for (
    let animationIndex = 0;
    animationIndex < animations.getAnimationsCount();
    animationIndex++
  ) {
    readAnimations.push(readAnimation(animationIndex));
  }
  return readAnimations;
};

const delay = (durationInMs: number) =>
  new Promise(resolve => setTimeout(resolve, durationInMs));

// ------------------------------------------------------- Fake resource sources

const makeFakeResourceSource = ({
  name,
  displayName,
  shouldGuessAnimationsFromName,
}: {|
  name: string,
  displayName: any,
  shouldGuessAnimationsFromName: boolean,
|}): ResourceSource => ({
  name,
  displayName,
  displayTab: 'import',
  kind: 'image',
  renderComponent: () => null,
  shouldCreateResource: true,
  shouldGuessAnimationsFromName,
});

const FAKE_IMAGE_CHOOSER = 'fake-image-chooser';
const FAKE_ANIMATIONS_IMPORT = 'fake-animations-import';

// Like in the app, the first source is the one guessing the animations from the
// file names (it's the one used by the main "Add a sprite" and "Import images"
// buttons).
const fakeImageResourceSources: Array<ResourceSource> = [
  makeFakeResourceSource({
    name: FAKE_ANIMATIONS_IMPORT,
    displayName: t`Import fake images named per animation`,
    shouldGuessAnimationsFromName: true,
  }),
  makeFakeResourceSource({
    name: FAKE_IMAGE_CHOOSER,
    displayName: t`Choose 2 fake images`,
    shouldGuessAnimationsFromName: false,
  }),
];

let chosenResourcesCount = 0;

const makeImageResource = (resourceName: string, fileName: string) => {
  const gd = global.gd;
  const resource = new gd.ImageResource();
  resource.setName(resourceName);
  resource.setFile('res/' + fileName);
  return resource;
};

/**
 * Return resources without showing any dialog, so that "Add a sprite" and
 * "Import images" can be used in a test.
 */
const onChooseResource = async ({
  initialSourceName,
}: ChooseResourceOptions) => {
  await delay(50);

  if (initialSourceName === FAKE_ANIMATIONS_IMPORT) {
    // These names are grouped into a "walk" and a "run" animation.
    return {
      selectedResources: [
        'hero_walk_1',
        'hero_walk_2',
        'hero_run_1',
        'hero_run_2',
      ].map((resourceName, index) =>
        makeImageResource(resourceName, IMAGE_FILE_NAMES[index])
      ),
      selectedSourceName: initialSourceName,
    };
  }

  return {
    selectedResources: [0, 1].map(index => {
      chosenResourcesCount++;
      return makeImageResource(
        'chosen-frame-' + chosenResourcesCount,
        IMAGE_FILE_NAMES[chosenResourcesCount % IMAGE_FILE_NAMES.length]
      );
    }),
    selectedSourceName: initialSourceName,
  };
};

// ----------------------------------------------------- Fake external editors

/**
 * A fake external editor (like Piskel) that gives back the frames it was given,
 * plus a new one. `onSessionEnded` is called before returning, to be able to
 * simulate the animations being changed while the editor was opened.
 */
const makeFakeImageExternalEditor = ({
  name,
  displayName,
  onSessionEnded,
}: {|
  name: string,
  displayName: string,
  onSessionEnded?: () => void,
|}): ResourceExternalEditor => ({
  name,
  createDisplayName: displayName,
  editDisplayName: displayName,
  kind: 'image',
  edit: async options => {
    await delay(200);
    if (onSessionEnded) onSessionEnded();

    chosenResourcesCount++;
    const newResourceName = 'edited-frame-' + chosenResourcesCount;
    addImageResourceIfMissing(
      newResourceName,
      IMAGE_FILE_NAMES[chosenResourcesCount % IMAGE_FILE_NAMES.length]
    );

    return {
      newMetadata: { fakeExternalEditorData: chosenResourcesCount },
      newName: null,
      resources: [
        ...options.resourceNames.map((resourceName, index) => ({
          name: resourceName,
          originalIndex: index,
        })),
        { name: newResourceName, originalIndex: null },
      ],
    };
  },
});

const makeResourceManagementProps = (
  resourceExternalEditors: Array<ResourceExternalEditor>
): ResourceManagementProps => ({
  getStorageProvider: () => emptyStorageProvider,
  onFetchNewlyAddedResources: async () => {},
  resourceSources: fakeImageResourceSources,
  onChooseResource,
  resourceExternalEditors,
  getStorageProviderResourceOperations: () => null,
  canInstallPrivateAsset: () => false,
  onNewResourcesAdded: () => {},
  onResourceUsageChanged: () => {},
  resourceCustomPropertyConfigs: [],
});

// ------------------------------------------------------------------- Stories

type SpriteEditorPlaygroundProps = {|
  objectName: string,
  animationsCount: number,
  framesPerAnimation: number,
  /** Serialize the object on every change, like saving the project does. */
  serializeOnChange?: boolean,
  /** Change the animations while the external editor is opened. */
  changeAnimationsDuringExternalEditorSession?: boolean,
  /** Like the editor of a child object of a custom object. */
  isAnimationListLocked?: boolean,
|};

const SpriteEditorPlayground = ({
  objectName,
  animationsCount,
  framesPerAnimation,
  serializeOnChange,
  changeAnimationsDuringExternalEditorSession,
  isAnimationListLocked,
}: SpriteEditorPlaygroundProps) => {
  const object = getOrCreateSpriteObject({
    objectName,
    animationsCount,
    framesPerAnimation,
  });

  // Mimic ObjectEditorDialog: every change notification re-renders the parent,
  // and the configuration is read again from the object on each render.
  const [, setChangesCount] = React.useState(0);
  const notifyOfChange = React.useCallback(
    () => setChangesCount(count => count + 1),
    []
  );
  const onSizeUpdated = React.useCallback(() => {}, []);

  React.useEffect(
    () => {
      window.spriteEditorManipulations = {
        readAnimations: () => readAnimations(object),
      };
    },
    [object]
  );

  const resourceManagementProps = React.useMemo(
    () =>
      makeResourceManagementProps([
        makeFakeImageExternalEditor({
          name: 'fake-image-editor',
          displayName: 'Edit with the fake image editor',
          onSessionEnded: changeAnimationsDuringExternalEditorSession
            ? () => {
                // Simulate another part of the app changing the animations
                // while the external editor was opened: removing one shifts
                // all the following ones, and adding enough of them
                // reallocates the vector holding them - so anything resolved
                // before the session is now dangling.
                const gd = global.gd;
                const animations = gd
                  .asSpriteConfiguration(object.getConfiguration())
                  .getAnimations();
                if (animations.getAnimationsCount() > 1) {
                  animations.removeAnimation(0);
                }
                for (let index = 0; index < 4; index++) {
                  const animation = new gd.Animation();
                  animation.setName('AddedDuringSession' + index);
                  animation.setDirectionsCount(1);
                  animations.addAnimation(animation);
                  animation.delete();
                }
              }
            : undefined,
        }),
      ]),
    [changeAnimationsDuringExternalEditorSession, object]
  );

  const editor = (
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
      resourceManagementProps={resourceManagementProps}
      onSizeUpdated={onSizeUpdated}
      object={object}
      objectName={objectName}
      onObjectUpdated={notifyOfChange}
      isAnimationListLocked={isAnimationListLocked}
    />
  );

  const editorWithFixedHeight = (
    <FixedHeightFlexContainer height={700}>{editor}</FixedHeightFlexContainer>
  );

  return (
    <AlertProvider>
      <DragAndDropContextProvider>
        {serializeOnChange ? (
          <SerializedObjectDisplay object={object.getConfiguration()}>
            {editorWithFixedHeight}
          </SerializedObjectDisplay>
        ) : (
          editorWithFixedHeight
        )}
        <CustomDragLayer />
      </DragAndDropContextProvider>
    </AlertProvider>
  );
};

// 6 animations: the C++ vector has a capacity of 8, so adding 3 animations
// reallocates it.
export const Manipulations = (): React.Node => (
  <SpriteEditorPlayground
    objectName="MyManipulationsSpriteObject"
    animationsCount={6}
    framesPerAnimation={4}
  />
);

// The object is serialized on every change, like saving the project or pushing
// to the undo history does: the memory freed by a change is then reused, which
// is what makes reading it afterwards fatal rather than unnoticed.
export const ManipulationsWithSerialization = (): React.Node => (
  <SpriteEditorPlayground
    objectName="MySerializedManipulationsSpriteObject"
    animationsCount={6}
    framesPerAnimation={4}
    serializeOnChange
  />
);

// Enough animations for most of the sprites lists to be mounted only once
// scrolled into view.
export const ManipulationsWithManyAnimations = (): React.Node => (
  <SpriteEditorPlayground
    objectName="MyManyAnimationsManipulationsSpriteObject"
    animationsCount={32}
    framesPerAnimation={4}
  />
);

// A single animation with many frames, to manipulate the frames themselves.
export const ManipulationsWithManyFrames = (): React.Node => (
  <SpriteEditorPlayground
    objectName="MyManyFramesManipulationsSpriteObject"
    animationsCount={1}
    framesPerAnimation={16}
  />
);

// An object without any animation, to start from the empty placeholder.
export const ManipulationsFromEmptyObject = (): React.Node => (
  <SpriteEditorPlayground
    objectName="MyEmptyManipulationsSpriteObject"
    animationsCount={0}
    framesPerAnimation={0}
  />
);

// The animations can't be added, removed or moved (like for a child object of a
// custom object): only the frames of each animation can be manipulated.
export const ManipulationsWithLockedAnimationList = (): React.Node => (
  <SpriteEditorPlayground
    objectName="MyLockedManipulationsSpriteObject"
    animationsCount={3}
    framesPerAnimation={4}
    isAnimationListLocked
  />
);

// The animations are changed while the external editor session is running,
// which leaves any direction or sprite resolved before the session dangling.
export const ManipulationsWithHostileExternalEditor = (): React.Node => (
  <SpriteEditorPlayground
    objectName="MyHostileExternalEditorSpriteObject"
    animationsCount={6}
    framesPerAnimation={4}
    serializeOnChange
    changeAnimationsDuringExternalEditorSession
  />
);
