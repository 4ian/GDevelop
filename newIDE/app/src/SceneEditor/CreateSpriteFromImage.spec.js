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

    expect(object.getName()).toBe('Hero_Ship');
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
