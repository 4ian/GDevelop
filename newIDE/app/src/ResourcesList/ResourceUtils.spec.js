// @flow
import {
  copyAllToProjectFolder,
  parseLocalFilePathOrExtensionFromMetadata,
  removeAllUnusedResources,
  renameResourcesInProject,
  updateResourceJsonMetadata,
} from './ResourceUtils';
import optionalRequire from '../Utils/OptionalRequire';
const gd: libGDevelop = global.gd;
const fs = optionalRequire('fs');
const os = optionalRequire('os');
const path = optionalRequire('path');

const addNewAnimationWithImageToSpriteObject = (
  object: gdObject,
  imageName: string
) => {
  const spriteObject = gd.asSpriteConfiguration(object.getConfiguration());
  const animations = spriteObject.getAnimations();

  const animation = new gd.Animation();
  animation.setDirectionsCount(1);
  const sprite = new gd.Sprite();
  sprite.setImageName(imageName);
  animation.getDirection(0).addSprite(sprite);
  animations.addAnimation(animation);
};

describe('ResourceUtils', () => {
  describe('copyAllToProjectFolder', () => {
    let tempDir: ?string = null;

    afterEach(() => {
      if (tempDir) {
        fs.rmSync(tempDir, { recursive: true, force: true });
        tempDir = null;
      }
    });

    it('copies files to the requested imported resources folder', async () => {
      const createdTempDir = fs.mkdtempSync(
        path.join(os.tmpdir(), 'gd-resource-utils-')
      );
      tempDir = createdTempDir;
      const projectFolder = path.join(createdTempDir, 'project');
      fs.mkdirSync(projectFolder);
      const project = gd.ProjectHelper.createNewGDJSProject();
      project.setProjectFile(path.join(projectFolder, 'game.json'));

      const spriteSheetPath = path.join(projectFolder, 'sheet.png');
      fs.writeFileSync(spriteSheetPath, 'fake image content');

      const newToOldFilePaths = new Map<string, string>();
      const copiedPaths = await copyAllToProjectFolder(
        project,
        [spriteSheetPath],
        newToOldFilePaths,
        'assets'
      );

      const expectedCopiedPath = path.join(
        projectFolder,
        'assets',
        'sheet.png'
      );
      expect(copiedPaths).toEqual([expectedCopiedPath]);
      expect(fs.existsSync(expectedCopiedPath)).toBe(true);
      expect(newToOldFilePaths.get(expectedCopiedPath)).toBe(spriteSheetPath);

      project.delete();
    });
  });

  it('can remove unused resources for every kind in the project', () => {
    const project = gd.ProjectHelper.createNewGDJSProject();

    const usedImage = new gd.ImageResource();
    const unusedImage = new gd.ImageResource();
    const unusedAudio = new gd.AudioResource();
    usedImage.setName('UsedImage');
    unusedImage.setName('UnusedImage');
    unusedAudio.setName('UnusedAudio');
    project.getResourcesManager().addResource(usedImage);
    project.getResourcesManager().addResource(unusedImage);
    project.getResourcesManager().addResource(unusedAudio);

    const object = project
      .getObjects()
      .insertNewObject(project, 'Sprite', 'MyObject', 0);
    addNewAnimationWithImageToSpriteObject(object, 'UsedImage');

    const removedResourceNames = removeAllUnusedResources(project).sort();

    expect(removedResourceNames).toEqual(['UnusedAudio', 'UnusedImage']);
    expect(project.getResourcesManager().hasResource('UsedImage')).toBe(true);
    expect(project.getResourcesManager().hasResource('UnusedImage')).toBe(
      false
    );
    expect(project.getResourcesManager().hasResource('UnusedAudio')).toBe(
      false
    );

    project.delete();
  });

  it('can rename a resource in the whole project', () => {
    const project = gd.ProjectHelper.createNewGDJSProject();

    // Add some fake resources
    const resource1 = new gd.ImageResource();
    const resource2 = new gd.ImageResource();
    const audioResource1 = new gd.AudioResource();
    const audioResource2 = new gd.AudioResource();
    resource1.setName('fake-image1.png');
    resource1.setFile('fake-image1.png');
    resource2.setName('fake-image2.png');
    resource2.setFile('fake-image2.png');
    audioResource1.setName('fake-audio1.mp3');
    audioResource1.setFile('fake-audio1.mp3');
    audioResource2.setName('fake-audio2.mp3');
    audioResource2.setFile('fake-audio2.mp3');
    project.getResourcesManager().addResource(resource1);
    project.getResourcesManager().addResource(resource2);
    project.getResourcesManager().addResource(audioResource1);
    project.getResourcesManager().addResource(audioResource2);

    // Add objects using these resources
    const globalObject = project
      .getObjects()
      .insertNewObject(project, 'Sprite', 'MyGlobalObject', 0);
    addNewAnimationWithImageToSpriteObject(globalObject, 'fake-image1.png');

    const scene = project.insertNewLayout('MyScene', 0);
    const object = scene
      .getObjects()
      .insertNewObject(project, 'Sprite', 'MyObject', 0);
    addNewAnimationWithImageToSpriteObject(object, 'fake-image1.png');

    // Also add an event referring to these resources.
    const event = new gd.StandardEvent();
    const action = new gd.Instruction();
    action.setType('PlaySound');
    action.setParametersCount(5);
    action.setParameter(0, ''); // The runtime scene passed as parameter
    action.setParameter(1, 'fake-audio1.mp3');
    action.setParameter(2, 'no');
    action.setParameter(3, '100');
    action.setParameter(4, '1');
    event.getActions().insert(action, 0);
    scene.getEvents().insertEvent(event, 0);

    // Rename some resources
    project.getResourcesManager().renameResource('fake-image1.png', 'Image1');
    project.getResourcesManager().renameResource('fake-audio1.mp3', 'Audio1');
    renameResourcesInProject(project, {
      'fake-image1.png': 'Image1',
      'fake-audio1.mp3': 'Audio1',
    });

    expect(project.getResourcesManager().hasResource('fake-image1.png')).toBe(
      false
    );
    expect(project.getResourcesManager().hasResource('Image1')).toBe(true);
    expect(project.getResourcesManager().hasResource('fake-audio1.mp3')).toBe(
      false
    );
    expect(project.getResourcesManager().hasResource('Audio1')).toBe(true);

    // Verify files have not changed:
    expect(
      project
        .getResourcesManager()
        .getResource('Image1')
        .getFile()
    ).toBe('fake-image1.png');
    expect(
      project
        .getResourcesManager()
        .getResource('Audio1')
        .getFile()
    ).toBe('fake-audio1.mp3');

    // Verify renaming was done in objects and in events.
    expect(
      gd
        .asSpriteConfiguration(globalObject.getConfiguration())
        .getAnimations()
        .getAnimation(0)
        .getDirection(0)
        .getSprite(0)
        .getImageName()
    ).toBe('Image1');
    expect(
      gd
        .asSpriteConfiguration(object.getConfiguration())
        .getAnimations()
        .getAnimation(0)
        .getDirection(0)
        .getSprite(0)
        .getImageName()
    ).toBe('Image1');
    expect(
      gd
        .asStandardEvent(scene.getEvents().getEventAt(0))
        .getActions()
        .get(0)
        .getParameter(1)
        .getPlainString()
    ).toBe('Audio1');
  });

  describe('Resource metadata', () => {
    let resource = null;
    afterEach(() => {
      if (resource) resource.delete();
      resource = null;
    });

    it('can update a resource metadata', () => {
      resource = new gd.Resource();
      updateResourceJsonMetadata(resource, { test: 123, test2: { '4': '56' } });
      // $FlowFixMe[incompatible-use]
      expect(resource.getMetadata()).toMatchInlineSnapshot(
        `"{\\"test\\":123,\\"test2\\":{\\"4\\":\\"56\\"}}"`
      );
      // $FlowFixMe[incompatible-type]
      updateResourceJsonMetadata(resource, { test2: 789 });
      // $FlowFixMe[incompatible-use]
      expect(resource.getMetadata()).toMatchInlineSnapshot(
        `"{\\"test\\":123,\\"test2\\":789}"`
      );

      // $FlowFixMe[incompatible-use]
      resource.setMetadata('invalid json');
      // $FlowFixMe[incompatible-type]
      updateResourceJsonMetadata(resource, {
        test3: 'this overwrote everything',
      });
      // $FlowFixMe[incompatible-use]
      expect(resource.getMetadata()).toMatchInlineSnapshot(
        `"{\\"test3\\":\\"this overwrote everything\\"}"`
      );
    });

    it('can extract "localFilePath" and "extension" from the metadata (used for Blob uploads)', () => {
      resource = new gd.Resource();

      // No extension and no localFilePath found.
      updateResourceJsonMetadata(resource, { other: 'thing' });
      // $FlowFixMe[incompatible-type]
      expect(parseLocalFilePathOrExtensionFromMetadata(resource))
        .toMatchInlineSnapshot(`
        Object {
          "extension": null,
          "localFilePath": null,
        }
      `);

      // Just an extension found.
      // $FlowFixMe[incompatible-type]
      updateResourceJsonMetadata(resource, {
        extension: '.png',
        other: 'thing',
      });
      // $FlowFixMe[incompatible-type]
      expect(parseLocalFilePathOrExtensionFromMetadata(resource))
        .toMatchInlineSnapshot(`
        Object {
          "extension": ".png",
          "localFilePath": null,
        }
      `);

      // Both found.
      // $FlowFixMe[incompatible-type]
      updateResourceJsonMetadata(resource, {
        localFilePath: 'test',
        extension: '.png',
        other: 'thing',
      });
      // $FlowFixMe[incompatible-type]
      expect(parseLocalFilePathOrExtensionFromMetadata(resource))
        .toMatchInlineSnapshot(`
        Object {
          "extension": ".png",
          "localFilePath": "test",
        }
      `);

      // Both found but not the proper type.
      // $FlowFixMe[incompatible-type]
      updateResourceJsonMetadata(resource, {
        localFilePath: 456,
        extension: 123,
        other: 'thing',
      });
      // $FlowFixMe[incompatible-type]
      expect(parseLocalFilePathOrExtensionFromMetadata(resource))
        .toMatchInlineSnapshot(`
        Object {
          "extension": null,
          "localFilePath": null,
        }
      `);
    });
  });
});
