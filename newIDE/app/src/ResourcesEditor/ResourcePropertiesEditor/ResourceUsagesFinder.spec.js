// @flow
import { findResourceObjectUsages } from './ResourceUsagesFinder';

const gd: libGDevelop = global.gd;

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

describe('ResourceUsagesFinder', () => {
  it('returns an empty list when no object uses the resource', () => {
    const project = gd.ProjectHelper.createNewGDJSProject();
    const resource = new gd.ImageResource();
    resource.setName('unused.png');
    resource.setFile('unused.png');
    project.getResourcesManager().addResource(resource);
    resource.delete();

    const scene = project.insertNewLayout('MainScene', 0);
    const otherSprite = scene
      .getObjects()
      .insertNewObject(project, 'Sprite', 'OtherObject', 0);
    addNewAnimationWithImageToSpriteObject(otherSprite, 'other.png');

    expect(findResourceObjectUsages(project, 'unused.png')).toEqual([]);
    expect(findResourceObjectUsages(project, '')).toEqual([]);

    project.delete();
  });

  it('finds usages across global objects, scenes, and custom objects (default and named variants)', () => {
    const project = gd.ProjectHelper.createNewGDJSProject();

    const sharedImage = new gd.ImageResource();
    sharedImage.setName('hero.png');
    sharedImage.setFile('hero.png');
    project.getResourcesManager().addResource(sharedImage);
    sharedImage.delete();

    // Global object using hero.png
    const globalHero = project
      .getObjects()
      .insertNewObject(project, 'Sprite', 'GlobalHero', 0);
    addNewAnimationWithImageToSpriteObject(globalHero, 'hero.png');

    // Scene 1 with two objects (only one using hero.png)
    const scene1 = project.insertNewLayout('Level1', 0);
    const level1Player = scene1
      .getObjects()
      .insertNewObject(project, 'Sprite', 'Player', 0);
    addNewAnimationWithImageToSpriteObject(level1Player, 'hero.png');
    const level1Enemy = scene1
      .getObjects()
      .insertNewObject(project, 'Sprite', 'Enemy', 1);
    addNewAnimationWithImageToSpriteObject(level1Enemy, 'enemy.png');

    // Scene 2 with another object using hero.png
    const scene2 = project.insertNewLayout('Level2', 1);
    const level2Avatar = scene2
      .getObjects()
      .insertNewObject(project, 'Sprite', 'Avatar', 0);
    addNewAnimationWithImageToSpriteObject(level2Avatar, 'hero.png');

    // Custom object with default variant and a named variant
    const extension = project.insertNewEventsFunctionsExtension('MyExt', 0);
    extension.setFullName('My Extension');
    const customObject = extension
      .getEventsBasedObjects()
      .insertNew('HeroButton', 0);
    customObject.setFullName('Hero Button');

    const defaultChild = customObject
      .getObjects()
      .insertNewObject(project, 'Sprite', 'IconSprite', 0);
    addNewAnimationWithImageToSpriteObject(defaultChild, 'hero.png');

    const darkVariant = customObject
      .getVariants()
      .insertNewVariant('DarkTheme', 0);
    const variantChild = darkVariant
      .getObjects()
      .insertNewObject(project, 'Sprite', 'DarkIconSprite', 0);
    addNewAnimationWithImageToSpriteObject(variantChild, 'hero.png');

    const usages = findResourceObjectUsages(project, 'hero.png');

    expect(
      usages.map(usage => {
        if (usage.kind === 'global') {
          return { kind: usage.kind, objectName: usage.objectName };
        }
        if (usage.kind === 'scene') {
          return {
            kind: usage.kind,
            sceneName: usage.sceneName,
            objectName: usage.objectName,
          };
        }
        return {
          kind: usage.kind,
          extensionName: usage.extensionName,
          extensionFullName: usage.extensionFullName,
          eventsBasedObjectName: usage.eventsBasedObjectName,
          eventsBasedObjectFullName: usage.eventsBasedObjectFullName,
          variantName: usage.variantName,
          objectName: usage.objectName,
        };
      })
    ).toEqual([
      { kind: 'global', objectName: 'GlobalHero' },
      { kind: 'scene', sceneName: 'Level1', objectName: 'Player' },
      { kind: 'scene', sceneName: 'Level2', objectName: 'Avatar' },
      {
        kind: 'custom-object',
        extensionName: 'MyExt',
        extensionFullName: 'My Extension',
        eventsBasedObjectName: 'HeroButton',
        eventsBasedObjectFullName: 'Hero Button',
        variantName: '',
        objectName: 'IconSprite',
      },
      {
        kind: 'custom-object',
        extensionName: 'MyExt',
        extensionFullName: 'My Extension',
        eventsBasedObjectName: 'HeroButton',
        eventsBasedObjectFullName: 'Hero Button',
        variantName: 'DarkTheme',
        objectName: 'DarkIconSprite',
      },
    ]);

    project.delete();
  });
});
