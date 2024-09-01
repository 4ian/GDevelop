// @flow
import { swapAsset } from './AssetSwapper';

const gd: libGDevelop = global.gd;

const PixiResourcesLoaderMock = {
  getPIXITexture: (project: gdProject, resourceName: string) => {
    switch (resourceName) {
      case 'Frame100x240':
        return { valid: true, width: 100, height: 240 };
      case 'Frame50x120':
        return { valid: true, width: 50, height: 120 };
      default:
        return { valid: false, width: 0, height: 0 };
    }
  },
};

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

    sprite.delete();
    animation.delete();
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

    swapAsset(project, PixiResourcesLoaderMock, object, assetObject);

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

    swapAsset(project, PixiResourcesLoaderMock, object, assetObject);

    expect(object.getName()).toEqual('Object');

    project.delete();
  });

  test('can keep the object variables', () => {
    const { project, object, assetObject } = makeNewTestProject();

    object.getVariables().insertNew('MyVariable', 0);

    swapAsset(project, PixiResourcesLoaderMock, object, assetObject);

    expect(object.getVariables().has('MyVariable'));

    project.delete();
  });

  test('can keep the object points', () => {
    const {
      project,
      object,
      assetObject,
      objectConfiguration,
      assetConfiguration,
    } = makeNewTestProject();

    addAnimation(objectConfiguration, 'Idle', 'Frame50x120');
    const frame = objectConfiguration
      .getAnimations()
      .getAnimation(0)
      .getDirection(0)
      .getSprite(0);

    const origin = frame.getOrigin();
    origin.setXY(8, 16);

    frame.setDefaultCenterPoint(false);
    const center = frame.getCenter();
    center.setXY(24, 32);

    const customPoint = new gd.Point('');
    customPoint.setName('CustomPointA');
    customPoint.setXY(40, 48);
    frame.addPoint(customPoint);

    customPoint.setName('CustomPointB');
    customPoint.setXY(56, 64);
    frame.addPoint(customPoint);
    customPoint.delete();

    addAnimation(assetConfiguration, 'Idle', 'Frame100x240');

    swapAsset(project, PixiResourcesLoaderMock, object, assetObject);

    const objectNewConfiguration = gd.asSpriteConfiguration(
      object.getConfiguration()
    );
    const newFrame = objectNewConfiguration
      .getAnimations()
      .getAnimation(0)
      .getDirection(0)
      .getSprite(0);

    // The coordinates are multiplied by 2 according to the images dimensions
    // given by PixiResourcesLoaderMock.
    expect(newFrame.getOrigin().getX()).toEqual(16);
    expect(newFrame.getOrigin().getY()).toEqual(32);

    expect(!newFrame.isDefaultCenterPoint());
    expect(newFrame.getCenter().getX()).toEqual(48);
    expect(newFrame.getCenter().getY()).toEqual(64);

    expect(newFrame.hasPoint('CustomPointA'));
    expect(newFrame.getPoint('CustomPointA').getX()).toEqual(80);
    expect(newFrame.getPoint('CustomPointA').getY()).toEqual(96);

    expect(newFrame.hasPoint('CustomPointB'));
    expect(newFrame.getPoint('CustomPointB').getX()).toEqual(112);
    expect(newFrame.getPoint('CustomPointB').getY()).toEqual(128);

    project.delete();
  });

  test('can keep the object points when the object has less frames than the asset', () => {
    const {
      project,
      object,
      assetObject,
      objectConfiguration,
      assetConfiguration,
    } = makeNewTestProject();

    // The object only has 1 frame in the Idle animation.
    addAnimation(objectConfiguration, 'Idle', 'Frame50x120');
    objectConfiguration
      .getAnimations()
      .getAnimation(0)
      .getDirection(0)
      .getSprite(0)
      .getOrigin()
      .setXY(8, 16);

    // The asset has a 2nd frame in the Idle animation.
    addAnimation(assetConfiguration, 'Idle', 'Frame100x240');
    const frame2 = new gd.Sprite();
    frame2.setImageName('AssetIdle2');
    assetConfiguration
      .getAnimations()
      .getAnimation(0)
      .getDirection(0)
      .addSprite(frame2);
    frame2.delete();

    swapAsset(project, PixiResourcesLoaderMock, object, assetObject);

    const objectNewConfiguration = gd.asSpriteConfiguration(
      object.getConfiguration()
    );
    const newDirection = objectNewConfiguration
      .getAnimations()
      .getAnimation(0)
      .getDirection(0);
    const frame0 = newDirection.getSprite(0);
    const frame1 = newDirection.getSprite(0);

    // The coordinates are multiplied by 2 according to the images dimensions
    // given by PixiResourcesLoaderMock.
    expect(frame0.getOrigin().getX()).toEqual(16);
    expect(frame0.getOrigin().getY()).toEqual(32);
    // The points from the 1st frame is used for every frame because points
    // defined frame by frame will likely become irrelevant with the new asset
    // animations.
    expect(frame1.getOrigin().getX()).toEqual(16);
    expect(frame1.getOrigin().getY()).toEqual(32);

    project.delete();
  });

  test('can keep the object default size similar (smaller asset)', () => {
    const {
      project,
      object,
      assetObject,
      objectConfiguration,
      assetConfiguration,
    } = makeNewTestProject();

    addAnimation(objectConfiguration, 'Idle', 'Frame100x240');
    addAnimation(assetConfiguration, 'Idle', 'Frame50x120');

    swapAsset(project, PixiResourcesLoaderMock, object, assetObject);

    const objectNewConfiguration = gd.asSpriteConfiguration(
      object.getConfiguration()
    );

    expect(objectNewConfiguration.getPreScale()).toEqual(2);

    project.delete();
  });

  test('can keep the object default size similar (bigger asset)', () => {
    const {
      project,
      object,
      assetObject,
      objectConfiguration,
      assetConfiguration,
    } = makeNewTestProject();

    addAnimation(objectConfiguration, 'Idle', 'Frame50x120');
    addAnimation(assetConfiguration, 'Idle', 'Frame100x240');

    swapAsset(project, PixiResourcesLoaderMock, object, assetObject);

    const objectNewConfiguration = gd.asSpriteConfiguration(
      object.getConfiguration()
    );

    expect(objectNewConfiguration.getPreScale()).toEqual(0.5);

    project.delete();
  });

  test('can keep the object default size similar (smaller asset and object already up-scaled)', () => {
    const {
      project,
      object,
      assetObject,
      objectConfiguration,
      assetConfiguration,
    } = makeNewTestProject();

    gd.asSpriteConfiguration(object.getConfiguration()).setPreScale(2);
    addAnimation(objectConfiguration, 'Idle', 'Frame100x240');
    addAnimation(assetConfiguration, 'Idle', 'Frame50x120');

    swapAsset(project, PixiResourcesLoaderMock, object, assetObject);

    const objectNewConfiguration = gd.asSpriteConfiguration(
      object.getConfiguration()
    );

    expect(objectNewConfiguration.getPreScale()).toEqual(4);

    project.delete();
  });

  test('can keep the object default size similar (bigger asset, but object already up-scaled)', () => {
    const {
      project,
      object,
      assetObject,
      objectConfiguration,
      assetConfiguration,
    } = makeNewTestProject();

    gd.asSpriteConfiguration(object.getConfiguration()).setPreScale(2);
    addAnimation(objectConfiguration, 'Idle', 'Frame50x120');
    addAnimation(assetConfiguration, 'Idle', 'Frame100x240');

    swapAsset(project, PixiResourcesLoaderMock, object, assetObject);

    const objectNewConfiguration = gd.asSpriteConfiguration(
      object.getConfiguration()
    );

    expect(objectNewConfiguration.getPreScale()).toEqual(1);

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

    swapAsset(project, PixiResourcesLoaderMock, object, assetObject);

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

    swapAsset(project, PixiResourcesLoaderMock, object, assetObject);

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

    swapAsset(project, PixiResourcesLoaderMock, object, assetObject);

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
