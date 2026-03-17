// @flow
import { fakeAssetShortHeader1 } from '../fixtures/GDevelopServicesTestData';
import { PixiResourcesLoaderMock } from '../fixtures/TestPixiResourcesLoader';
import { getObjectSizeAndOriginInfo, getObjectDefaultSize } from './Utils';

const gd: libGDevelop = global.gd;

describe('getObjectSizeAndOriginInfo', () => {
  let project: gdProject;

  beforeEach(() => {
    // $FlowFixMe[invalid-constructor]
    project = new gd.ProjectHelper.createNewGDJSProject();
  });

  afterEach(() => {
    project.delete();
  });

  describe('Sprite', () => {
    it('returns origin and center from first frame, and size from the asset short header', () => {
      const objects = project.getObjects();
      const object = objects.insertNewObject(
        project,
        'Sprite',
        'MySprite',
        objects.getObjectsCount()
      );
      const spriteConfig = gd.asSpriteConfiguration(object.getConfiguration());
      const animation = new gd.Animation();
      animation.setDirectionsCount(1);
      const sprite = new gd.Sprite();
      sprite.getOrigin().setX(10);
      sprite.getOrigin().setY(20);
      // Leave center as default (isDefaultCenterPoint = true)
      animation.getDirection(0).addSprite(sprite);
      spriteConfig.getAnimations().addAnimation(animation);

      expect(
        getObjectSizeAndOriginInfo(object, project, fakeAssetShortHeader1)
      ).toEqual({
        size: '36x36',
        origin: '10;20',
        center: '18;18', // fakeAssetShortHeader1 is 36x36, so center = 18;18
      });
    });

    it('returns a custom center when the sprite has one set explicitly', () => {
      const objects = project.getObjects();
      const object = objects.insertNewObject(
        project,
        'Sprite',
        'MySpriteCustomCenter',
        objects.getObjectsCount()
      );
      const spriteConfig = gd.asSpriteConfiguration(object.getConfiguration());
      const animation = new gd.Animation();
      animation.setDirectionsCount(1);
      const sprite = new gd.Sprite();
      sprite.getOrigin().setX(5);
      sprite.getOrigin().setY(5);
      sprite.setDefaultCenterPoint(false);
      sprite.getCenter().setX(40);
      sprite.getCenter().setY(80);
      animation.getDirection(0).addSprite(sprite);
      spriteConfig.getAnimations().addAnimation(animation);

      expect(
        getObjectSizeAndOriginInfo(object, project, fakeAssetShortHeader1)
      ).toEqual({
        size: '36x36',
        origin: '5;5',
        center: '40;80',
      });
    });

    it('returns "unknown" size and "center of image" when no asset short header is provided', () => {
      const objects = project.getObjects();
      const object = objects.insertNewObject(
        project,
        'Sprite',
        'MySpriteNoHeader',
        objects.getObjectsCount()
      );
      const spriteConfig = gd.asSpriteConfiguration(object.getConfiguration());
      const animation = new gd.Animation();
      animation.setDirectionsCount(1);
      const sprite = new gd.Sprite();
      animation.getDirection(0).addSprite(sprite);
      spriteConfig.getAnimations().addAnimation(animation);

      expect(getObjectSizeAndOriginInfo(object, project, null)).toEqual({
        size: 'unknown',
        origin: '0;0',
        center: 'center of image',
      });
    });

    it('returns null when the sprite has no animations', () => {
      const objects = project.getObjects();
      const object = objects.insertNewObject(
        project,
        'Sprite',
        'MySpriteEmpty',
        objects.getObjectsCount()
      );
      // No animations added — getAnimationsCount() === 0

      expect(
        getObjectSizeAndOriginInfo(object, project, fakeAssetShortHeader1)
      ).toBeNull();
    });
  });

  describe('TiledSpriteObject::TiledSprite', () => {
    it('returns origin 0;0, center at image center, and size from the configuration', () => {
      const objects = project.getObjects();
      const object = objects.insertNewObject(
        project,
        'TiledSpriteObject::TiledSprite',
        'MyTiledSprite',
        objects.getObjectsCount()
      );
      const config = gd.asTiledSpriteConfiguration(object.getConfiguration());
      config.setWidth(200);
      config.setHeight(150);

      expect(getObjectSizeAndOriginInfo(object, project, null)).toEqual({
        size: '200x150',
        origin: '0;0',
        center: '100;75',
      });
    });
  });

  describe('PanelSpriteObject::PanelSprite', () => {
    it('returns origin 0;0, center at image center, and size from the configuration', () => {
      const objects = project.getObjects();
      const object = objects.insertNewObject(
        project,
        'PanelSpriteObject::PanelSprite',
        'MyPanelSprite',
        objects.getObjectsCount()
      );
      const config = gd.asPanelSpriteConfiguration(object.getConfiguration());
      config.setWidth(120);
      config.setHeight(390);

      expect(getObjectSizeAndOriginInfo(object, project, null)).toEqual({
        size: '120x390',
        origin: '0;0',
        center: '60;195',
      });
    });
  });

  describe('Events-based (custom) object', () => {
    it('returns size and center derived from the declared area bounds', () => {
      // Register a custom object type in the project.
      const extension = project.insertNewEventsFunctionsExtension('MyExt', 0);
      const eventsBasedObject = extension
        .getEventsBasedObjects()
        .insertNew('MyCustomObject', 0);
      eventsBasedObject.setAreaMinX(0);
      eventsBasedObject.setAreaMaxX(100);
      eventsBasedObject.setAreaMinY(0);
      eventsBasedObject.setAreaMaxY(80);

      const objects = project.getObjects();
      const object = objects.insertNewObject(
        project,
        'MyExt::MyCustomObject',
        'MyCustomObjectInstance',
        objects.getObjectsCount()
      );

      expect(getObjectSizeAndOriginInfo(object, project, null)).toEqual({
        size: '100x80',
        origin: '0;0',
        center: '50;40',
      });
    });

    it('handles a non 0;0 origin based on area min bounds', () => {
      const extension = project.insertNewEventsFunctionsExtension('MyExt2', 0);
      const eventsBasedObject = extension
        .getEventsBasedObjects()
        .insertNew('MyOffsetObject', 0);
      eventsBasedObject.setAreaMinX(-10);
      eventsBasedObject.setAreaMaxX(90);
      eventsBasedObject.setAreaMinY(-20);
      eventsBasedObject.setAreaMaxY(40);

      const objects = project.getObjects();
      const object = objects.insertNewObject(
        project,
        'MyExt2::MyOffsetObject',
        'MyOffsetObjectInstance',
        objects.getObjectsCount()
      );

      expect(getObjectSizeAndOriginInfo(object, project, null)).toEqual({
        size: '100x60',
        origin: '10;20',
        center: '50;30',
      });
    });

    it('uses the variant area bounds when a non-default variant is set', () => {
      const extension = project.insertNewEventsFunctionsExtension(
        'MyExtVariant',
        0
      );
      const eventsBasedObject = extension
        .getEventsBasedObjects()
        .insertNew('MyVariantObject', 0);
      // Set default variant bounds.
      eventsBasedObject.setAreaMinX(0);
      eventsBasedObject.setAreaMaxX(100);
      eventsBasedObject.setAreaMinY(0);
      eventsBasedObject.setAreaMaxY(80);

      // Add a named variant with different bounds.
      const variant = eventsBasedObject
        .getVariants()
        .insertNewVariant('Small', 0);
      variant.setAreaMinX(-5);
      variant.setAreaMaxX(45);
      variant.setAreaMinY(-10);
      variant.setAreaMaxY(30);

      const objects = project.getObjects();
      const object = objects.insertNewObject(
        project,
        'MyExtVariant::MyVariantObject',
        'MyVariantObjectInstance',
        objects.getObjectsCount()
      );
      const customObjectConfiguration = gd.asCustomObjectConfiguration(
        object.getConfiguration()
      );
      customObjectConfiguration.setVariantName('Small');

      expect(getObjectSizeAndOriginInfo(object, project, null)).toEqual({
        size: '50x40',
        origin: '5;10',
        center: '25;20',
      });
    });

    it('handles 3D events-based objects with Z bounds included in size/origin/center', () => {
      const extension = project.insertNewEventsFunctionsExtension('MyExt3', 0);
      const eventsBasedObject = extension
        .getEventsBasedObjects()
        .insertNew('My3DObject', 0);
      eventsBasedObject.setAreaMinX(-10);
      eventsBasedObject.setAreaMaxX(90);
      eventsBasedObject.setAreaMinY(-20);
      eventsBasedObject.setAreaMaxY(40);
      eventsBasedObject.setAreaMinZ(-5);
      eventsBasedObject.setAreaMaxZ(25);
      eventsBasedObject.markAsRenderedIn3D(true);

      const objects = project.getObjects();
      const object = objects.insertNewObject(
        project,
        'MyExt3::My3DObject',
        'My3DObjectInstance',
        objects.getObjectsCount()
      );

      expect(getObjectSizeAndOriginInfo(object, project, null)).toEqual({
        size: '100x60x30',
        origin: '10;20;5',
        center: '50;30;15',
      });
    });
  });

  describe('Unsupported object type', () => {
    it('returns null for object types with no static size info', () => {
      const objects = project.getObjects();
      const object = objects.insertNewObject(
        project,
        'TextObject::Text',
        'MyText',
        objects.getObjectsCount()
      );

      expect(getObjectSizeAndOriginInfo(object, project, null)).toBeNull();
    });
  });
});

describe('getObjectDefaultSize', () => {
  let project: gdProject;

  beforeEach(() => {
    // $FlowFixMe[invalid-constructor]
    project = new gd.ProjectHelper.createNewGDJSProject();
  });

  afterEach(() => {
    project.delete();
  });

  describe('Sprite', () => {
    it('returns texture dimensions × preScale with origin and center when texture is valid', () => {
      const objects = project.getObjects();
      const object = objects.insertNewObject(
        project,
        'Sprite',
        'MySprite',
        objects.getObjectsCount()
      );
      const spriteConfig = gd.asSpriteConfiguration(object.getConfiguration());
      const animation = new gd.Animation();
      animation.setDirectionsCount(1);
      const sprite = new gd.Sprite();
      sprite.setImageName('Frame100x240');
      sprite.getOrigin().setX(10);
      sprite.getOrigin().setY(20);
      // Leave center as default (isDefaultCenterPoint = true) → center = texture dimensions / 2
      animation.getDirection(0).addSprite(sprite);
      spriteConfig.getAnimations().addAnimation(animation);

      expect(
        getObjectDefaultSize(object, project, PixiResourcesLoaderMock)
      ).toEqual({
        width: 100,
        height: 240,
        depth: 0,
        originX: 10,
        originY: 20,
        originZ: 0,
        centerX: 50,
        centerY: 120,
        centerZ: 0,
      });
    });

    it('uses explicit center point when set', () => {
      const objects = project.getObjects();
      const object = objects.insertNewObject(
        project,
        'Sprite',
        'MySpriteCustomCenter',
        objects.getObjectsCount()
      );
      const spriteConfig = gd.asSpriteConfiguration(object.getConfiguration());
      const animation = new gd.Animation();
      animation.setDirectionsCount(1);
      const sprite = new gd.Sprite();
      sprite.setImageName('Frame100x240');
      sprite.setDefaultCenterPoint(false);
      sprite.getCenter().setX(40);
      sprite.getCenter().setY(80);
      animation.getDirection(0).addSprite(sprite);
      spriteConfig.getAnimations().addAnimation(animation);

      expect(
        getObjectDefaultSize(object, project, PixiResourcesLoaderMock)
      ).toEqual({
        width: 100,
        height: 240,
        depth: 0,
        originX: 0,
        originY: 0,
        originZ: 0,
        centerX: 40,
        centerY: 80,
        centerZ: 0,
      });
    });

    it('applies preScale to texture dimensions and center', () => {
      const objects = project.getObjects();
      const object = objects.insertNewObject(
        project,
        'Sprite',
        'MyScaledSprite',
        objects.getObjectsCount()
      );
      const spriteConfig = gd.asSpriteConfiguration(object.getConfiguration());
      spriteConfig.setPreScale(2);
      const animation = new gd.Animation();
      animation.setDirectionsCount(1);
      const sprite = new gd.Sprite();
      sprite.setImageName('Frame50x120');
      animation.getDirection(0).addSprite(sprite);
      spriteConfig.getAnimations().addAnimation(animation);

      expect(
        getObjectDefaultSize(object, project, PixiResourcesLoaderMock)
      ).toEqual({
        width: 100,
        height: 240,
        depth: 0,
        originX: 0,
        originY: 0,
        originZ: 0,
        centerX: 50,
        centerY: 120,
        centerZ: 0,
      });
    });

    it('returns 32×32 fallback when texture is not valid/loaded', () => {
      const objects = project.getObjects();
      const object = objects.insertNewObject(
        project,
        'Sprite',
        'MySpriteUnknownTexture',
        objects.getObjectsCount()
      );
      const spriteConfig = gd.asSpriteConfiguration(object.getConfiguration());
      const animation = new gd.Animation();
      animation.setDirectionsCount(1);
      const sprite = new gd.Sprite();
      sprite.setImageName('UnknownImage');
      animation.getDirection(0).addSprite(sprite);
      spriteConfig.getAnimations().addAnimation(animation);

      expect(
        getObjectDefaultSize(object, project, PixiResourcesLoaderMock)
      ).toEqual({
        width: 32,
        height: 32,
        depth: 0,
        originX: 0,
        originY: 0,
        originZ: 0,
        centerX: 16,
        centerY: 16,
        centerZ: 0,
      });
    });

    it('uses assetShortHeader dimensions when provided (asset store case)', () => {
      const objects = project.getObjects();
      const object = objects.insertNewObject(
        project,
        'Sprite',
        'MySpriteFromStore',
        objects.getObjectsCount()
      );
      const spriteConfig = gd.asSpriteConfiguration(object.getConfiguration());
      const animation = new gd.Animation();
      animation.setDirectionsCount(1);
      const sprite = new gd.Sprite();
      // Image name not in mock loader — but assetShortHeader provides the dimensions
      sprite.setImageName('UnknownImage');
      animation.getDirection(0).addSprite(sprite);
      spriteConfig.getAnimations().addAnimation(animation);

      expect(
        getObjectDefaultSize(object, project, PixiResourcesLoaderMock, {
          ...fakeAssetShortHeader1,
          width: 200,
          height: 300,
        })
      ).toEqual({
        width: 200,
        height: 300,
        depth: 0,
        originX: 0,
        originY: 0,
        originZ: 0,
        centerX: 100,
        centerY: 150,
        centerZ: 0,
      });
    });

    it('returns 32×32 fallback when sprite has no animations', () => {
      const objects = project.getObjects();
      const object = objects.insertNewObject(
        project,
        'Sprite',
        'MySpriteEmpty',
        objects.getObjectsCount()
      );

      expect(
        getObjectDefaultSize(object, project, PixiResourcesLoaderMock)
      ).toEqual({
        width: 32,
        height: 32,
        depth: 0,
        originX: 0,
        originY: 0,
        originZ: 0,
        centerX: 16,
        centerY: 16,
        centerZ: 0,
      });
    });
  });

  describe('TiledSpriteObject::TiledSprite', () => {
    it('returns configuration width and height with centered origin', () => {
      const objects = project.getObjects();
      const object = objects.insertNewObject(
        project,
        'TiledSpriteObject::TiledSprite',
        'MyTiledSprite',
        objects.getObjectsCount()
      );
      const config = gd.asTiledSpriteConfiguration(object.getConfiguration());
      config.setWidth(200);
      config.setHeight(150);

      expect(
        getObjectDefaultSize(object, project, PixiResourcesLoaderMock)
      ).toEqual({
        width: 200,
        height: 150,
        depth: 0,
        originX: 0,
        originY: 0,
        originZ: 0,
        centerX: 100,
        centerY: 75,
        centerZ: 0,
      });
    });
  });

  describe('PanelSpriteObject::PanelSprite', () => {
    it('returns configuration width and height with centered origin', () => {
      const objects = project.getObjects();
      const object = objects.insertNewObject(
        project,
        'PanelSpriteObject::PanelSprite',
        'MyPanelSprite',
        objects.getObjectsCount()
      );
      const config = gd.asPanelSpriteConfiguration(object.getConfiguration());
      config.setWidth(120);
      config.setHeight(390);

      expect(
        getObjectDefaultSize(object, project, PixiResourcesLoaderMock)
      ).toEqual({
        width: 120,
        height: 390,
        depth: 0,
        originX: 0,
        originY: 0,
        originZ: 0,
        centerX: 60,
        centerY: 195,
        centerZ: 0,
      });
    });
  });

  describe('Events-based (custom) object', () => {
    it('returns size and origin derived from the declared area bounds', () => {
      const extension = project.insertNewEventsFunctionsExtension('MyExt', 0);
      const eventsBasedObject = extension
        .getEventsBasedObjects()
        .insertNew('MyCustomObject', 0);
      eventsBasedObject.setAreaMinX(0);
      eventsBasedObject.setAreaMaxX(100);
      eventsBasedObject.setAreaMinY(0);
      eventsBasedObject.setAreaMaxY(80);

      const objects = project.getObjects();
      const object = objects.insertNewObject(
        project,
        'MyExt::MyCustomObject',
        'MyCustomObjectInstance',
        objects.getObjectsCount()
      );

      expect(
        getObjectDefaultSize(object, project, PixiResourcesLoaderMock)
      ).toEqual({
        width: 100,
        height: 80,
        depth: 0,
        originX: 0,
        originY: 0,
        originZ: 0,
        centerX: 50,
        centerY: 40,
        centerZ: 0,
      });
    });

    it('includes depth and 3D origin for 3D events-based objects', () => {
      const extension = project.insertNewEventsFunctionsExtension('MyExt3D', 0);
      const eventsBasedObject = extension
        .getEventsBasedObjects()
        .insertNew('My3DObject', 0);
      eventsBasedObject.setAreaMinX(-10);
      eventsBasedObject.setAreaMaxX(90);
      eventsBasedObject.setAreaMinY(-20);
      eventsBasedObject.setAreaMaxY(40);
      eventsBasedObject.setAreaMinZ(-5);
      eventsBasedObject.setAreaMaxZ(25);
      eventsBasedObject.markAsRenderedIn3D(true);

      const objects = project.getObjects();
      const object = objects.insertNewObject(
        project,
        'MyExt3D::My3DObject',
        'My3DObjectInstance',
        objects.getObjectsCount()
      );

      expect(
        getObjectDefaultSize(object, project, PixiResourcesLoaderMock)
      ).toEqual({
        width: 100,
        height: 60,
        depth: 30,
        originX: 10,
        originY: 20,
        originZ: 5,
        centerX: 50,
        centerY: 30,
        centerZ: 15,
      });
    });
  });

  describe('Unsupported object type', () => {
    it('returns 32×32×0 fallback with centered origin for unknown types', () => {
      const objects = project.getObjects();
      const object = objects.insertNewObject(
        project,
        'TextObject::Text',
        'MyText',
        objects.getObjectsCount()
      );

      expect(
        getObjectDefaultSize(object, project, PixiResourcesLoaderMock)
      ).toEqual({
        width: 32,
        height: 32,
        depth: 0,
        originX: 0,
        originY: 0,
        originZ: 0,
        centerX: 16,
        centerY: 16,
        centerZ: 0,
      });
    });
  });
});
