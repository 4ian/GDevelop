// @noflow
import fs from 'fs';
import os from 'os';
import path from 'path';
import {
  addImageFileToProjectResources,
  createSpriteObjectFromImageFile,
  getImageFilePathsFromDataTransfer,
  getSupportedImageFilePaths,
  hasClipboardImage,
  writeClipboardImageToProjectFolder,
} from './CreateSpriteFromImage';

const gd = global.gd;

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

  test('adds a dropped image file to project resources', async () => {
    const { folder, project } = makeProjectInTempFolder();
    const sourceFile = path.join(folder, 'Background.png');
    fs.writeFileSync(sourceFile, Buffer.from('fake image bytes'));

    const resourceName = await addImageFileToProjectResources({
      project,
      imageFilePath: sourceFile,
    });

    expect(resourceName).toBe('assets/Background.png');
    expect(project.getResourcesManager().hasResource(resourceName)).toBe(true);
    expect(fs.existsSync(path.join(folder, 'assets', 'Background.png'))).toBe(
      true
    );
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

    expect(object.getName()).toBe('Hero_Ship');
    expect(
      project.getResourcesManager().hasResource('assets/Hero Ship.png')
    ).toBe(true);
    const resource = project
      .getResourcesManager()
      .getResource('assets/Hero Ship.png');
    expect(resource.getFile()).toBe('assets/Hero Ship.png');
    expect(fs.existsSync(path.join(folder, 'assets', 'Hero Ship.png'))).toBe(
      true
    );
    expect(
      gd
        .asSpriteConfiguration(object.getConfiguration())
        .getAnimations()
        .getAnimation(0)
        .getDirection(0)
        .getSprite(0)
        .getImageName()
    ).toBe('assets/Hero Ship.png');
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
    expect(project.getResourcesManager().hasResource('assets/Hero2.png')).toBe(
      true
    );
  });

  test('writes clipboard image data to a unique asset PNG', () => {
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
    expect(path.dirname(firstPath)).toBe(path.join(folder, 'assets'));
  });

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

  test('extracts supported local file paths through Electron webUtils when file.path is unavailable', () => {
    const heroFile = { name: 'Hero.png' };
    const notesFile = { name: 'notes.txt' };
    const dataTransfer = {
      files: [heroFile, notesFile],
    };
    const webUtils = {
      getPathForFile: file =>
        file === heroFile ? 'C:\\project\\Hero.png' : 'C:\\project\\notes.txt',
    };

    expect(getImageFilePathsFromDataTransfer(dataTransfer, webUtils)).toEqual([
      'C:\\project\\Hero.png',
    ]);
  });

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
});
