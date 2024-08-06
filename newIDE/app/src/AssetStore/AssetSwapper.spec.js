// @flow
import { swapAsset } from './AssetSwapper';

const gd: libGDevelop = global.gd;

describe('swapAsset (Sprite)', () => {
  const makeNewTestProject = (): {|
    project: gdProject,
    object: gdObject,
    assetObject: gdObject,
    objectConfiguration: gdSpriteObject,
    assetConfiguration: gdSpriteObject,
  |} => {
    const project = gd.ProjectHelper.createNewGDJSProject();
    const scene = project.insertNewLayout('Scene', 0);

    const object = scene
      .getObjects()
      .insertNewObject(project, 'Sprite', 'Object', 0);
    const objectConfiguration = gd.asSpriteConfiguration(
      object.getConfiguration()
    );

    const assetObject = scene
      .getObjects()
      .insertNewObject(project, 'Sprite', 'AssetObject', 0);
    const assetConfiguration = gd.asSpriteConfiguration(
      assetObject.getConfiguration()
    );

    return {
      project,
      object,
      assetObject,
      objectConfiguration,
      assetConfiguration,
    };
  };

  const addAnimation = (
    objectConfiguration: gdSpriteObject,
    animationName: string,
    resourceName: string
  ) => {
    const sprite = new gd.Sprite();
    sprite.setImageName(resourceName);

    const animation = new gd.Animation();
    animation.setName(animationName);
    animation.setDirectionsCount(1);
    animation.getDirection(0).addSprite(sprite);

    const objectAnimations = objectConfiguration.getAnimations();
    objectAnimations.addAnimation(animation);
  };

  const getAnimationNameAndResource = (
    objectConfiguration: gdSpriteObject,
    animationIndex
  ) => [
    objectConfiguration
      .getAnimations()
      .getAnimation(animationIndex)
      .getName(),
    objectConfiguration
      .getAnimations()
      .getAnimation(animationIndex)
      .getDirection(0)
      .getSprite(0)
      .getImageName(),
  ];

  test('can copy asset animations', () => {
    const {
      project,
      object,
      assetObject,
      objectConfiguration,
      assetConfiguration,
    } = makeNewTestProject();

    addAnimation(objectConfiguration, 'Idle', 'ObjectIdle');
    addAnimation(objectConfiguration, 'Run', 'ObjectRun');
    addAnimation(objectConfiguration, 'Jump', 'ObjectJump');
    addAnimation(objectConfiguration, 'Fall', 'ObjectFall');

    addAnimation(assetConfiguration, 'Idle', 'AssetIdle');
    addAnimation(assetConfiguration, 'Run', 'AssetRun');
    addAnimation(assetConfiguration, 'Fire', 'AssetFire');

    swapAsset(project, object, assetObject);

    const objectNewConfiguration = gd.asSpriteConfiguration(
      object.getConfiguration()
    );

    expect(getAnimationNameAndResource(objectNewConfiguration, 0)).toEqual([
      'Idle',
      'AssetIdle',
    ]);
    expect(getAnimationNameAndResource(objectNewConfiguration, 1)).toEqual([
      'Run',
      'AssetRun',
    ]);
    // Missing animations default on "idle"
    expect(getAnimationNameAndResource(objectNewConfiguration, 2)).toEqual([
      'Jump',
      'AssetIdle',
    ]);
    expect(getAnimationNameAndResource(objectNewConfiguration, 3)).toEqual([
      'Fall',
      'AssetIdle',
    ]);
    // New animation from the asset
    expect(getAnimationNameAndResource(objectNewConfiguration, 4)).toEqual([
      'Fire',
      'AssetFire',
    ]);

    project.delete();
  });

  test('can keep the object name', () => {
    const { project, object, assetObject } = makeNewTestProject();

    swapAsset(project, object, assetObject);

    expect(object.getName()).toEqual('Object');

    project.delete();
  });

  test('can keep the object variables', () => {
    const { project, object, assetObject } = makeNewTestProject();

    object.getVariables().insertNew('MyVariable', 0);

    swapAsset(project, object, assetObject);

    expect(object.getVariables().has('MyVariable'));

    project.delete();
  });
});

describe('swapAsset (Model)', () => {
  const makeNewTestProject = (): {|
    project: gdProject,
    object: gdObject,
    assetObject: gdObject,
    objectConfiguration: gdModel3DObjectConfiguration,
    assetConfiguration: gdModel3DObjectConfiguration,
  |} => {
    const project = gd.ProjectHelper.createNewGDJSProject();
    const scene = project.insertNewLayout('Scene', 0);

    const objectConfiguration = new gd.Model3DObjectConfiguration();
    const object = new gd.gdObject(
      'Scene3D::Model3DObject',
      'Object',
      objectConfiguration
    );
    objectConfiguration.setType('Scene3D::Model3DObject');
    scene.getObjects().insertObject(object, 0);

    const assetConfiguration = new gd.Model3DObjectConfiguration();
    const assetObject = new gd.gdObject(
      'Scene3D::Model3DObject',
      'AssetObject',
      assetConfiguration
    );
    assetConfiguration.setType('Scene3D::Model3DObject');
    scene.getObjects().insertObject(assetObject, 0);

    return {
      project,
      object,
      assetObject,
      objectConfiguration,
      assetConfiguration,
    };
  };

  const addAnimation = (
    objectConfiguration: gdModel3DObjectConfiguration,
    animationName: string,
    resourceName: string
  ) => {
    const animation = new gd.Model3DAnimation();
    animation.setName(animationName);
    animation.setSource(resourceName);
    objectConfiguration.addAnimation(animation);
  };

  const getAnimationNameAndResource = (
    objectConfiguration: gdModel3DObjectConfiguration,
    animationIndex
  ) => [
    objectConfiguration.getAnimation(animationIndex).getName(),
    objectConfiguration.getAnimation(animationIndex).getSource(),
  ];

  test('can copy asset animations', () => {
    const {
      project,
      object,
      assetObject,
      objectConfiguration,
      assetConfiguration,
    } = makeNewTestProject();

    addAnimation(objectConfiguration, 'Idle', 'ObjectIdle');
    addAnimation(objectConfiguration, 'Run', 'ObjectRun');
    addAnimation(objectConfiguration, 'Jump', 'ObjectJump');
    addAnimation(objectConfiguration, 'Fall', 'ObjectFall');

    addAnimation(assetConfiguration, 'Idle', 'AssetIdle');
    addAnimation(assetConfiguration, 'Run', 'AssetRun');
    addAnimation(assetConfiguration, 'Fire', 'AssetFire');

    swapAsset(project, object, assetObject);

    const objectNewConfiguration = gd.asModel3DConfiguration(
      object.getConfiguration()
    );

    expect(getAnimationNameAndResource(objectNewConfiguration, 0)).toEqual([
      'Idle',
      'AssetIdle',
    ]);
    expect(getAnimationNameAndResource(objectNewConfiguration, 1)).toEqual([
      'Run',
      'AssetRun',
    ]);
    // Missing animations default on "idle"
    expect(getAnimationNameAndResource(objectNewConfiguration, 2)).toEqual([
      'Jump',
      'AssetIdle',
    ]);
    expect(getAnimationNameAndResource(objectNewConfiguration, 3)).toEqual([
      'Fall',
      'AssetIdle',
    ]);
    // New animation from the asset
    expect(getAnimationNameAndResource(objectNewConfiguration, 4)).toEqual([
      'Fire',
      'AssetFire',
    ]);

    project.delete();
  });

  const getPropertyValue = (
    objectConfiguration: gdObjectConfiguration,
    name: string
  ) =>
    objectConfiguration
      .getProperties()
      .get(name)
      .getValue();

  test('can adapt the dimensions to keep the same volume', () => {
    const {
      project,
      object,
      assetObject,
      objectConfiguration,
      assetConfiguration,
    } = makeNewTestProject();

    objectConfiguration.updateProperty('width', '100');
    objectConfiguration.updateProperty('height', '200');
    objectConfiguration.updateProperty('depth', '50');

    assetConfiguration.updateProperty('width', '100');
    assetConfiguration.updateProperty('height', '25');
    assetConfiguration.updateProperty('depth', '50');

    swapAsset(project, object, assetObject);

    const objectNewConfiguration = gd.asModel3DConfiguration(
      object.getConfiguration()
    );

    expect(getPropertyValue(objectNewConfiguration, 'width')).toEqual('200');
    expect(getPropertyValue(objectNewConfiguration, 'height')).toEqual('50');
    expect(getPropertyValue(objectNewConfiguration, 'depth')).toEqual('100');

    project.delete();
  });

  test('can keep the object origin and center', () => {
    const {
      project,
      object,
      assetObject,
      objectConfiguration,
      assetConfiguration,
    } = makeNewTestProject();

    objectConfiguration.updateProperty('originLocation', 'TopLeft');
    objectConfiguration.updateProperty('centerLocation', 'ObjectCenter');

    assetConfiguration.updateProperty('originLocation', 'ModelOrigin');
    assetConfiguration.updateProperty('centerLocation', 'ModelCenter');

    swapAsset(project, object, assetObject);

    const objectNewConfiguration = gd.asModel3DConfiguration(
      object.getConfiguration()
    );

    expect(getPropertyValue(objectNewConfiguration, 'originLocation')).toEqual(
      'TopLeft'
    );
    expect(getPropertyValue(objectNewConfiguration, 'centerLocation')).toEqual(
      'ObjectCenter'
    );

    project.delete();
  });
});
