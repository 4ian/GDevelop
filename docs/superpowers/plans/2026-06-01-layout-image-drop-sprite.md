# Layout Image Drop Sprite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let saved local projects create Sprite objects by dropping local image files on the layout canvas or pasting an image from the system clipboard.

**Architecture:** Add one focused helper that turns local image files into image resources and Sprite objects, then wire `InstancesEditor` native file drop events and `SceneEditor.paste()` into the existing instance creation path. Keep object creation, instance history, preview sync, and selection updates in `SceneEditor`.

**Tech Stack:** React class/function components, Flow, Jest, Electron clipboard/nativeImage, Node `fs`/`path`, libGDevelop JS bindings.

---

## File Structure

- Create `newIDE/app/src/SceneEditor/CreateSpriteFromImage.js`: local-only helper functions for supported image filtering, project-folder file copying/writing, image resource creation, and Sprite object initialization.
- Create `newIDE/app/src/SceneEditor/CreateSpriteFromImage.spec.js`: Jest tests for the helper.
- Modify `newIDE/app/src/InstancesEditor/index.js`: add native file drag/drop detection and a callback prop with scene coordinates.
- Modify `newIDE/app/src/SceneEditor/EditorsDisplay.flow.js`: add the callback type passed through editor display implementations.
- Modify `newIDE/app/src/SceneEditor/MosaicEditorsDisplay/index.js`: pass the image drop callback to the full-size instances editor.
- Modify `newIDE/app/src/SceneEditor/SwipeableDrawerEditorsDisplay/index.js`: pass the image drop callback to the direct instances editor.
- Modify `newIDE/app/src/SceneEditor/index.js`: create Sprite objects/instances from dropped files and pasted clipboard images, and make Paste fall back to system image data.

---

### Task 1: Helper Tests For Local Image To Sprite Creation

**Files:**
- Create: `newIDE/app/src/SceneEditor/CreateSpriteFromImage.spec.js`

- [ ] **Step 1: Write the failing helper tests**

Create `newIDE/app/src/SceneEditor/CreateSpriteFromImage.spec.js`:

```js
// @flow
import fs from 'fs';
import os from 'os';
import path from 'path';
import {
  createSpriteObjectFromImageFile,
  getSupportedImageFilePaths,
  writeClipboardImageToProjectFolder,
} from './CreateSpriteFromImage';

const gd: libGDevelop = global.gd;

const makeProjectInTempFolder = () => {
  const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'gdevelop-image-drop-'));
  const project = gd.ProjectHelper.createNewGDJSProject();
  project.setProjectFile(path.join(folder, 'game.json'));
  return { folder, project };
};

describe('CreateSpriteFromImage', () => {
  test('keeps only supported image file paths', () => {
    expect(
      getSupportedImageFilePaths([
        'hero.PNG',
        'enemy.jpeg',
        'notes.txt',
        'background.webp',
        '',
        'model.glb',
      ])
    ).toEqual(['hero.PNG', 'enemy.jpeg', 'background.webp']);
  });

  test('creates an image resource and a Sprite object using the image', async () => {
    const { folder, project } = makeProjectInTempFolder();
    const sourceFile = path.join(folder, 'Hero Ship.png');
    fs.writeFileSync(sourceFile, Buffer.from('fake image bytes'));
    const scene = project.insertNewLayout('Scene', 0);

    const object = await createSpriteObjectFromImageFile({
      project,
      objectsContainer: scene.getObjects(),
      imageFilePath: sourceFile,
    });

    expect(object.getName()).toBe('HeroShip');
    expect(project.getResourcesManager().hasResource('Hero Ship.png')).toBe(
      true
    );
    const resource = project.getResourcesManager().getResource('Hero Ship.png');
    expect(resource.getFile()).toBe('Hero Ship.png');
    expect(
      gd
        .asSpriteConfiguration(object.getConfiguration())
        .getAnimations()
        .getAnimation(0)
        .getDirection(0)
        .getSprite(0)
        .getImageName()
    ).toBe('Hero Ship.png');
  });

  test('creates unique resource and object names', async () => {
    const { folder, project } = makeProjectInTempFolder();
    const sourceFile = path.join(folder, 'Hero.png');
    fs.writeFileSync(sourceFile, Buffer.from('fake image bytes'));
    const scene = project.insertNewLayout('Scene', 0);

    await createSpriteObjectFromImageFile({
      project,
      objectsContainer: scene.getObjects(),
      imageFilePath: sourceFile,
    });
    const secondObject = await createSpriteObjectFromImageFile({
      project,
      objectsContainer: scene.getObjects(),
      imageFilePath: sourceFile,
    });

    expect(secondObject.getName()).toBe('Hero2');
    expect(project.getResourcesManager().hasResource('Hero2.png')).toBe(true);
  });

  test('writes clipboard image data to a unique project-local PNG', () => {
    const { folder, project } = makeProjectInTempFolder();
    const firstPath = writeClipboardImageToProjectFolder({
      project,
      imageBuffer: Buffer.from('first'),
    });
    const secondPath = writeClipboardImageToProjectFolder({
      project,
      imageBuffer: Buffer.from('second'),
    });

    expect(path.basename(firstPath)).toBe('PastedImage.png');
    expect(path.basename(secondPath)).toBe('PastedImage2.png');
    expect(fs.readFileSync(firstPath).toString()).toBe('first');
    expect(fs.readFileSync(secondPath).toString()).toBe('second');
    expect(path.dirname(firstPath)).toBe(folder);
  });
});
```

- [ ] **Step 2: Run the helper tests and verify RED**

Run:

```bash
cd newIDE/app
npm test -- --watchAll=false --runInBand src/SceneEditor/CreateSpriteFromImage.spec.js
```

Expected: FAIL because `./CreateSpriteFromImage` does not exist.

---

### Task 2: Implement Local Image Helper

**Files:**
- Create: `newIDE/app/src/SceneEditor/CreateSpriteFromImage.js`
- Test: `newIDE/app/src/SceneEditor/CreateSpriteFromImage.spec.js`

- [ ] **Step 1: Add the minimal helper implementation**

Create `newIDE/app/src/SceneEditor/CreateSpriteFromImage.js`:

```js
// @flow
import newNameGenerator from '../Utils/NewNameGenerator';
import optionalRequire from '../Utils/OptionalRequire';
import {
  applyResourceDefaults,
  copyAllToProjectFolder,
  isPathInProjectFolder,
} from '../ResourcesList/ResourceUtils';

const gd: libGDevelop = global.gd;
const fs = optionalRequire('fs');
const path = optionalRequire('path');

const supportedImageExtensions = ['.png', '.jpg', '.jpeg', '.webp'];

const getProjectFolder = (project: gdProject): string => {
  if (!path) throw new Error('Path module is not available.');
  const projectFile = project.getProjectFile();
  if (!projectFile) {
    throw new Error('The project must be saved locally before importing images.');
  }
  return path.dirname(projectFile);
};

export const isSupportedImageFilePath = (filePath: string): boolean => {
  if (!path || !filePath) return false;
  return supportedImageExtensions.includes(path.extname(filePath).toLowerCase());
};

export const getSupportedImageFilePaths = (
  filePaths: Array<string>
): Array<string> => filePaths.filter(isSupportedImageFilePath);

const getSafeObjectBaseName = (imageFilePath: string): string => {
  if (!path) return 'Sprite';
  const extension = path.extname(imageFilePath);
  const baseName = path.basename(imageFilePath, extension);
  return gd.Project.getSafeName(baseName) || 'Sprite';
};

const getUniqueProjectFilePath = ({
  project,
  baseName,
  extension,
}: {|
  project: gdProject,
  baseName: string,
  extension: string,
|}): string => {
  if (!fs || !path) throw new Error('File system is not available.');
  const projectFolder = getProjectFolder(project);
  const safeBaseName = gd.Project.getSafeName(baseName) || baseName || 'Image';
  const uniqueBaseName = newNameGenerator(safeBaseName, tentativeName =>
    fs.existsSync(path.join(projectFolder, tentativeName + extension))
  );
  return path.join(projectFolder, uniqueBaseName + extension);
};

export const writeClipboardImageToProjectFolder = ({
  project,
  imageBuffer,
}: {|
  project: gdProject,
  imageBuffer: Buffer,
|}): string => {
  if (!fs) throw new Error('File system is not available.');
  const imageFilePath = getUniqueProjectFilePath({
    project,
    baseName: 'PastedImage',
    extension: '.png',
  });
  fs.writeFileSync(imageFilePath, imageBuffer);
  return imageFilePath;
};

const addDefaultFrameToSpriteObject = (
  object: gdObject,
  resourceName: string
) => {
  const spriteConfiguration = gd.asSpriteConfiguration(
    object.getConfiguration()
  );
  const sprite = new gd.Sprite();
  sprite.setImageName(resourceName);

  const animation = new gd.Animation();
  animation.setDirectionsCount(1);
  animation.getDirection(0).addSprite(sprite);
  spriteConfiguration.getAnimations().addAnimation(animation);

  sprite.delete();
  animation.delete();
};

const addImageResource = ({
  project,
  imageFilePath,
}: {|
  project: gdProject,
  imageFilePath: string,
|}): string => {
  if (!path) throw new Error('Path module is not available.');
  const projectFolder = getProjectFolder(project);
  const resourcesManager = project.getResourcesManager();
  const relativeResourceFile = path
    .relative(projectFolder, imageFilePath)
    .replace(/\\/g, '/');
  const extension = path.extname(relativeResourceFile);
  const resourceNameBase = relativeResourceFile.slice(
    0,
    relativeResourceFile.length - extension.length
  );
  const resourceName = newNameGenerator(
    resourceNameBase,
    tentativeName => resourcesManager.hasResource(tentativeName + extension)
  ) + extension;

  const imageResource = new gd.ImageResource();
  imageResource.setFile(relativeResourceFile);
  imageResource.setName(resourceName);
  applyResourceDefaults(project, imageResource);
  resourcesManager.addResource(imageResource);
  imageResource.delete();
  return resourceName;
};

export const ensureImageFileIsInProjectFolder = async ({
  project,
  imageFilePath,
}: {|
  project: gdProject,
  imageFilePath: string,
|}): Promise<string> => {
  if (isPathInProjectFolder(project, imageFilePath)) return imageFilePath;

  const newToOldFilePaths = new Map();
  const copiedFilePaths = await copyAllToProjectFolder(project, [
    imageFilePath,
  ], newToOldFilePaths);
  return copiedFilePaths[0] || imageFilePath;
};

export const createSpriteObjectFromImageFile = async ({
  project,
  objectsContainer,
  imageFilePath,
}: {|
  project: gdProject,
  objectsContainer: gdObjectsContainer,
  imageFilePath: string,
|}): Promise<gdObject> => {
  const localImageFilePath = await ensureImageFileIsInProjectFolder({
    project,
    imageFilePath,
  });
  const resourceName = addImageResource({
    project,
    imageFilePath: localImageFilePath,
  });
  const objectName = newNameGenerator(
    getSafeObjectBaseName(localImageFilePath),
    tentativeName => objectsContainer.hasObjectNamed(tentativeName)
  );
  const object = objectsContainer.insertNewObject(
    project,
    'Sprite',
    objectName,
    objectsContainer.getObjectsCount()
  );
  addDefaultFrameToSpriteObject(object, resourceName);
  return object;
};

export const createSpriteObjectsFromImageFiles = async ({
  project,
  objectsContainer,
  imageFilePaths,
}: {|
  project: gdProject,
  objectsContainer: gdObjectsContainer,
  imageFilePaths: Array<string>,
|}): Promise<Array<gdObject>> => {
  const supportedImageFilePaths = getSupportedImageFilePaths(imageFilePaths);
  const objects = [];
  for (const imageFilePath of supportedImageFilePaths) {
    objects.push(
      await createSpriteObjectFromImageFile({
        project,
        objectsContainer,
        imageFilePath,
      })
    );
  }
  return objects;
};
```

- [ ] **Step 2: Run the helper tests and verify GREEN**

Run:

```bash
cd newIDE/app
npm test -- --watchAll=false --runInBand src/SceneEditor/CreateSpriteFromImage.spec.js
```

Expected: PASS for all tests in `CreateSpriteFromImage.spec.js`.

- [ ] **Step 3: Commit helper and tests**

```bash
git add newIDE/app/src/SceneEditor/CreateSpriteFromImage.js newIDE/app/src/SceneEditor/CreateSpriteFromImage.spec.js
git commit -m "Add local image sprite creation helper"
```

---

### Task 3: Wire Native File Drop From The Layout Canvas

**Files:**
- Modify: `newIDE/app/src/InstancesEditor/index.js`
- Modify: `newIDE/app/src/SceneEditor/EditorsDisplay.flow.js`
- Modify: `newIDE/app/src/SceneEditor/MosaicEditorsDisplay/index.js`
- Modify: `newIDE/app/src/SceneEditor/SwipeableDrawerEditorsDisplay/index.js`

- [ ] **Step 1: Add a failing test target by extending helper coverage**

Update the helper import in `CreateSpriteFromImage.spec.js` to include `getImageFilePathsFromDataTransfer`:

```js
import {
  createSpriteObjectFromImageFile,
  getImageFilePathsFromDataTransfer,
  getSupportedImageFilePaths,
  writeClipboardImageToProjectFolder,
} from './CreateSpriteFromImage';
```

Append this test to `CreateSpriteFromImage.spec.js`:

```js
test('extracts supported local file paths from a native drop data transfer', () => {
  const dataTransfer = {
    files: [
      { path: 'C:\\project\\Hero.png' },
      { path: 'C:\\project\\readme.txt' },
      { path: 'C:\\project\\Enemy.webp' },
      { name: 'browser-file-without-local-path.png' },
    ],
  };

  expect(getImageFilePathsFromDataTransfer(dataTransfer)).toEqual([
    'C:\\project\\Hero.png',
    'C:\\project\\Enemy.webp',
  ]);
});
```

- [ ] **Step 2: Run the test and verify RED**

Run:

```bash
cd newIDE/app
npm test -- --watchAll=false --runInBand src/SceneEditor/CreateSpriteFromImage.spec.js
```

Expected: FAIL because `getImageFilePathsFromDataTransfer` is not exported.

- [ ] **Step 3: Implement dropped file extraction in the helper**

Add to `CreateSpriteFromImage.js`:

```js
export const getImageFilePathsFromDataTransfer = (
  dataTransfer: ?DataTransfer | any
): Array<string> => {
  if (!dataTransfer || !dataTransfer.files) return [];
  const filePaths = [];
  for (let i = 0; i < dataTransfer.files.length; i++) {
    const file = dataTransfer.files[i];
    if (file && typeof file.path === 'string') {
      filePaths.push(file.path);
    }
  }
  return getSupportedImageFilePaths(filePaths);
};
```

- [ ] **Step 4: Run the helper test and verify GREEN**

Run:

```bash
cd newIDE/app
npm test -- --watchAll=false --runInBand src/SceneEditor/CreateSpriteFromImage.spec.js
```

Expected: PASS.

- [ ] **Step 5: Add the canvas callback prop and native event handlers**

In `InstancesEditor/index.js`, import the helper:

```js
import { getImageFilePathsFromDataTransfer } from '../SceneEditor/CreateSpriteFromImage';
```

Add to `InstancesEditorPropsWithoutSizeAndScroll`:

```js
  onImageFilesDropped?: (
    imageFilePaths: Array<string>,
    position: [number, number]
  ) => void | Promise<void>,
```

Add methods to the `InstancesEditor` class:

```js
  _getSceneCoordinatesFromClientPosition = (
    clientX: number,
    clientY: number
  ): ?[number, number] => {
    const { viewPosition, canvasArea } = this;
    if (!canvasArea || !viewPosition) return null;
    const canvasRect = canvasArea.getBoundingClientRect();
    return viewPosition.toSceneCoordinates(
      clientX - canvasRect.left,
      clientY - canvasRect.top
    );
  };

  _onNativeDragOver = (event: DragEvent) => {
    if (
      event.dataTransfer &&
      Array.from(event.dataTransfer.types || []).includes('Files')
    ) {
      event.preventDefault();
      event.stopPropagation();
      event.dataTransfer.dropEffect = 'copy';
    }
  };

  _onNativeDrop = (event: DragEvent) => {
    const { onImageFilesDropped } = this.props;
    if (!onImageFilesDropped) return;

    const imageFilePaths = getImageFilePathsFromDataTransfer(
      event.dataTransfer
    );
    if (!imageFilePaths.length) return;

    event.preventDefault();
    event.stopPropagation();
    const position = this._getSceneCoordinatesFromClientPosition(
      event.clientX,
      event.clientY
    );
    if (!position) return;
    onImageFilesDropped(imageFilePaths, position);
  };
```

Attach the handlers to the canvas `<div>`:

```js
              onDragOver={this._onNativeDragOver}
              onDrop={this._onNativeDrop}
```

- [ ] **Step 6: Thread the callback through scene editor display props**

Add to `SceneEditorsDisplayProps` in `SceneEditor/EditorsDisplay.flow.js`:

```js
  onImageFilesDropped: (
    imageFilePaths: Array<string>,
    position: [number, number]
  ) => void | Promise<void>,
```

Pass it in both display implementations:

```js
                  onImageFilesDropped={props.onImageFilesDropped}
```

Add the prop to:

- The `FullSizeInstancesEditorWithScrollbars` in `MosaicEditorsDisplay/index.js`.
- The direct `InstancesEditor` in `SwipeableDrawerEditorsDisplay/index.js`.

- [ ] **Step 7: Run helper tests again**

Run:

```bash
cd newIDE/app
npm test -- --watchAll=false --runInBand src/SceneEditor/CreateSpriteFromImage.spec.js
```

Expected: PASS.

- [ ] **Step 8: Commit native drop wiring**

```bash
git add newIDE/app/src/SceneEditor/CreateSpriteFromImage.js newIDE/app/src/SceneEditor/CreateSpriteFromImage.spec.js newIDE/app/src/InstancesEditor/index.js newIDE/app/src/SceneEditor/EditorsDisplay.flow.js newIDE/app/src/SceneEditor/MosaicEditorsDisplay/index.js newIDE/app/src/SceneEditor/SwipeableDrawerEditorsDisplay/index.js
git commit -m "Wire image file drops into layout canvas"
```

---

### Task 4: Create Objects And Instances From Dropped Images

**Files:**
- Modify: `newIDE/app/src/SceneEditor/index.js`

- [ ] **Step 1: Refactor object-created side effects into a reusable method**

In `SceneEditor/index.js`, add a shared object-created method and update `_onObjectCreated`:

```js
  _onObjectsCreated = (
    objects: Array<gdObject>,
    isTheFirstOfItsTypeInProject: boolean
  ) => {
    if (objects.length === 0) return;

    objects.forEach(object => {
      const infoBarDetails = onObjectAdded({
        object,
        layersContainer: this.props.layersContainer,
        globalObjectsContainer: this.props.globalObjectsContainer,
        objectsContainer: this.props.objectsContainer,
      });
      if (infoBarDetails) {
        this.setState({
          additionalWorkInfoBar: infoBarDetails,
          showAdditionalWorkInfoBar: true,
        });
      }
    });
    if (this.props.unsavedChanges)
      this.props.unsavedChanges.triggerUnsavedChanges();

    this.props.onObjectListsModified({
      isNewObjectTypeUsed: isTheFirstOfItsTypeInProject,
    });
  };
```

Replace the body of `_onObjectCreated` with:

```js
    if (objects.length === 0) {
      return;
    }
    this._onObjectsCreated(objects, isTheFirstOfItsTypeInProject);
    this._addInstanceForNewObject(objects[0].getName());
```

- [ ] **Step 2: Add dropped image handler**

Import helpers:

```js
import {
  createSpriteObjectsFromImageFiles,
  getSupportedImageFilePaths,
} from './CreateSpriteFromImage';
```

Add methods to `SceneEditor`:

```js
  _addInstancesForObjectsAtPosition = (
    objects: Array<gdObject>,
    position: [number, number]
  ) => {
    const { editorDisplay } = this;
    if (!editorDisplay || !objects.length) return;

    const newInstances = [];
    objects.forEach((object, index) => {
      newInstances.push(
        ...editorDisplay.instancesHandlers.addInstances(
          [position[0] + index * 16, position[1] + index * 16],
          [object.getName()],
          this.state.chosenLayer
        )
      );
    });

    this._onInstancesAddedAndSendToEditor3D(newInstances);
    this.instancesSelection.clearSelection();
    this.instancesSelection.selectInstances({
      instances: newInstances,
      multiSelect: true,
      layersLocks: null,
    });
    this._onInstancesSelected(newInstances);
    this.forceUpdatePropertiesEditor();
  };

  _onImageFilesDropped = async (
    imageFilePaths: Array<string>,
    position: [number, number]
  ) => {
    const storageProvider = this.props.resourceManagementProps.getStorageProvider();
    if (storageProvider.internalName !== 'LocalFile') {
      Window.showMessageBox(
        'Images can only be dropped into saved local projects.',
        'info'
      );
      return;
    }

    const supportedImageFilePaths = getSupportedImageFilePaths(imageFilePaths);
    if (!supportedImageFilePaths.length) return;

    const isTheFirstSpriteObjectInProject = !gd.UsedObjectTypeFinder.scanProject(
      this.props.project,
      'Sprite'
    );
    try {
      const objects = await createSpriteObjectsFromImageFiles({
        project: this.props.project,
        objectsContainer: this.props.objectsContainer,
        imageFilePaths: supportedImageFilePaths,
      });
      this._onObjectsCreated(objects, isTheFirstSpriteObjectInProject);
      this._addInstancesForObjectsAtPosition(objects, position);
      if (this.editorDisplay) this.editorDisplay.forceUpdateObjectsList();
      await this.props.resourceManagementProps.onFetchNewlyAddedResources();
      this.props.resourceManagementProps.onNewResourcesAdded();
    } catch (error) {
      console.error('Unable to create Sprite object from dropped image:', error);
      Window.showMessageBox(
        'Unable to create a Sprite object from the dropped image.',
        'error'
      );
    }
  };
```

Pass `onImageFilesDropped={this._onImageFilesDropped}` to the editor display component where `MosaicEditorsDisplay`/`SwipeableDrawerEditorsDisplay` are rendered.

- [ ] **Step 3: Run focused helper tests**

Run:

```bash
cd newIDE/app
npm test -- --watchAll=false --runInBand src/SceneEditor/CreateSpriteFromImage.spec.js
```

Expected: PASS.

- [ ] **Step 4: Commit scene drop creation**

```bash
git add newIDE/app/src/SceneEditor/index.js
git commit -m "Create sprites from dropped layout images"
```

---

### Task 5: Paste System Clipboard Images

**Files:**
- Modify: `newIDE/app/src/SceneEditor/index.js`
- Modify: `newIDE/app/src/SceneEditor/CreateSpriteFromImage.js`
- Test: `newIDE/app/src/SceneEditor/CreateSpriteFromImage.spec.js`

- [ ] **Step 1: Write failing clipboard availability test**

Update the helper import in `CreateSpriteFromImage.spec.js` to include `hasClipboardImage`:

```js
import {
  createSpriteObjectFromImageFile,
  getImageFilePathsFromDataTransfer,
  getSupportedImageFilePaths,
  hasClipboardImage,
  writeClipboardImageToProjectFolder,
} from './CreateSpriteFromImage';
```

Append this test to `CreateSpriteFromImage.spec.js`:

```js
test('detects non-empty clipboard images through an injected clipboard', () => {
  expect(
    hasClipboardImage({
      readImage: () => ({ isEmpty: () => false }),
    })
  ).toBe(true);
  expect(
    hasClipboardImage({
      readImage: () => ({ isEmpty: () => true }),
    })
  ).toBe(false);
});
```

- [ ] **Step 2: Run test and verify RED**

Run:

```bash
cd newIDE/app
npm test -- --watchAll=false --runInBand src/SceneEditor/CreateSpriteFromImage.spec.js
```

Expected: FAIL because `hasClipboardImage` is not exported.

- [ ] **Step 3: Implement clipboard helpers**

Add to `CreateSpriteFromImage.js`:

```js
const electron = optionalRequire('electron');
const electronClipboard = electron ? electron.clipboard : null;

export const hasClipboardImage = (clipboard: any = electronClipboard): boolean => {
  if (!clipboard) return false;
  const image = clipboard.readImage();
  return !!image && !image.isEmpty();
};

export const writeImageFromClipboardToProjectFolder = (
  project: gdProject
): ?string => {
  if (!hasClipboardImage()) return null;
  const image = electronClipboard.readImage();
  return writeClipboardImageToProjectFolder({
    project,
    imageBuffer: image.toPNG(),
  });
};
```

- [ ] **Step 4: Update SceneEditor paste fallback**

Import:

```js
import {
  createSpriteObjectFromImageFile,
  createSpriteObjectsFromImageFiles,
  getSupportedImageFilePaths,
  hasClipboardImage,
  writeImageFromClipboardToProjectFolder,
} from './CreateSpriteFromImage';
```

Extract the current instance paste implementation into `_pasteInstancesFromClipboard`:

```js
  _pasteInstancesFromClipboard = ({
    clipboardContent,
    useLastCursorPosition,
  }: {|
    clipboardContent: any,
    useLastCursorPosition?: boolean,
  |}) => {
    const instancesContent = SafeExtractor.extractArrayProperty(
      clipboardContent,
      'instances'
    );
    const x = SafeExtractor.extractNumberProperty(clipboardContent, 'x');
    const y = SafeExtractor.extractNumberProperty(clipboardContent, 'y');
    const pasteInTheForeground =
      SafeExtractor.extractBooleanProperty(
        clipboardContent,
        'pasteInTheForeground'
      ) || false;
    if (x === null || y === null || instancesContent === null) return false;

    const newInstances = addSerializedInstances({
      project: this.props.project,
      instancesContainer: this.props.initialInstances,
      copyReferential: [x, y],
      serializedInstances: instancesContent,
      addInstancesInTheForeground: pasteInTheForeground,
      doesObjectExistInContext: objectName =>
        this.props.projectScopedContainersAccessor
          .get()
          .getObjectsContainersList()
          .hasObjectNamed(objectName),
    });

    this._onInstancesAddedAndSendToEditor3D(newInstances);
    this.instancesSelection.clearSelection();
    this.instancesSelection.selectInstances({
      instances: newInstances,
      multiSelect: true,
      layersLocks: null,
    });

    const { editorDisplay } = this;
    if (editorDisplay) {
      const viewPosition = editorDisplay.viewControls.getViewPosition();
      if (viewPosition) {
        const lastPosition = useLastCursorPosition
          ? editorDisplay.viewControls.getLastCursorSceneCoordinates()
          : editorDisplay.viewControls.getLastContextMenuSceneCoordinates();
        const position = viewPosition.containsPoint(
          lastPosition[0],
          lastPosition[1]
        )
          ? lastPosition
          : [viewPosition.getViewX(), viewPosition.getViewY()];
        for (const instance of newInstances) {
          instance.setX(instance.getX() + position[0]);
          instance.setY(instance.getY() + position[1]);
        }
        editorDisplay.instancesHandlers.snapSelection(newInstances);
        this._sendUpdatedInstances(newInstances);
      }
    }

    this.forceUpdatePropertiesEditor();
    return true;
  };
```

Then make `paste` async and keep instance paste as first priority:

```js
  paste = async ({ useLastCursorPosition }: CopyCutPasteOptions = {}) => {
    const clipboardContent = Clipboard.get(INSTANCES_CLIPBOARD_KIND);
    const didPasteInstances = this._pasteInstancesFromClipboard({
      clipboardContent,
      useLastCursorPosition,
    });
    if (didPasteInstances) return;

    await this._pasteImageFromClipboard({ useLastCursorPosition });
  };
```

Add `_pasteImageFromClipboard`:

```js
  _pasteImageFromClipboard = async ({
    useLastCursorPosition,
  }: CopyCutPasteOptions = {}) => {
    const storageProvider = this.props.resourceManagementProps.getStorageProvider();
    if (storageProvider.internalName !== 'LocalFile' || !hasClipboardImage()) {
      return;
    }

    const imageFilePath = writeImageFromClipboardToProjectFolder(
      this.props.project
    );
    if (!imageFilePath) return;

    const object = await createSpriteObjectFromImageFile({
      project: this.props.project,
      objectsContainer: this.props.objectsContainer,
      imageFilePath,
    });
    this._onObjectsCreated([object], false);

    const { editorDisplay } = this;
    if (!editorDisplay) return;
    const viewPosition = editorDisplay.viewControls.getViewPosition();
    const position = viewPosition
      ? useLastCursorPosition
        ? editorDisplay.viewControls.getLastCursorSceneCoordinates()
        : editorDisplay.viewControls.getLastContextMenuSceneCoordinates()
      : [0, 0];
    this._addInstancesForObjectsAtPosition([object], position);
    if (this.editorDisplay) this.editorDisplay.forceUpdateObjectsList();
    await this.props.resourceManagementProps.onFetchNewlyAddedResources();
    this.props.resourceManagementProps.onNewResourcesAdded();
  };
```

In `buildContextMenu`, update Paste enabled state:

```js
          enabled:
            Clipboard.has(INSTANCES_CLIPBOARD_KIND) || hasClipboardImage(),
```

- [ ] **Step 5: Run helper tests**

Run:

```bash
cd newIDE/app
npm test -- --watchAll=false --runInBand src/SceneEditor/CreateSpriteFromImage.spec.js
```

Expected: PASS.

- [ ] **Step 6: Commit clipboard paste**

```bash
git add newIDE/app/src/SceneEditor/index.js newIDE/app/src/SceneEditor/CreateSpriteFromImage.js newIDE/app/src/SceneEditor/CreateSpriteFromImage.spec.js
git commit -m "Paste clipboard images as sprite objects"
```

---

### Task 6: Full Verification

**Files:**
- No code changes unless verification exposes issues.

- [ ] **Step 1: Run focused tests**

Run:

```bash
cd newIDE/app
npm test -- --watchAll=false --runInBand src/SceneEditor/CreateSpriteFromImage.spec.js
```

Expected: PASS.

- [ ] **Step 2: Run Flow on touched files**

Run:

```bash
cd newIDE/app
npm run flow -- --include-warnings
```

Expected: Flow completes without errors introduced by these changes.

- [ ] **Step 3: Run formatting check on touched JS files**

Run:

```bash
cd newIDE/app
npm run check-format -- src/SceneEditor/CreateSpriteFromImage.js src/SceneEditor/CreateSpriteFromImage.spec.js src/InstancesEditor/index.js src/SceneEditor/index.js src/SceneEditor/EditorsDisplay.flow.js src/SceneEditor/MosaicEditorsDisplay/index.js src/SceneEditor/SwipeableDrawerEditorsDisplay/index.js
```

Expected: No listed files need formatting. If formatting fails because `check-format` does not accept file args in this project, run `npx prettier --list-different` on the same file list.

- [ ] **Step 4: Manual verification**

Run the local Electron app, open a saved local project, and verify:

- Drag a `.png`, `.jpg`, and `.webp` file into the layout canvas.
- A new Sprite object appears for each image.
- Each dropped image creates an instance at the drop location.
- Copy an image to the OS clipboard and press `Ctrl+V` or `Cmd+V` on the layout canvas.
- A `PastedImage.png` resource and Sprite object are created in the project folder.
- Existing GDevelop instance paste still works when the internal instance clipboard is populated.
- Undo removes newly added instances.

- [ ] **Step 5: Final status**

Run:

```bash
git status --short
```

Expected: Only intended files are modified, or clean after final commit.
