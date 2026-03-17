// @flow
import { fakeAssetShortHeader1 } from '../fixtures/GDevelopServicesTestData';
import { PixiResourcesLoaderMock } from '../fixtures/TestPixiResourcesLoader';
import { getObjectSizeInfo } from './Utils';

const gd: libGDevelop = global.gd;

describe('getObjectSizeInfo', () => {
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
        getObjectSizeInfo(object, project, PixiResourcesLoaderMock)
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
        getObjectSizeInfo(object, project, PixiResourcesLoaderMock)
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
        getObjectSizeInfo(object, project, PixiResourcesLoaderMock)
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

    it('returns 0 dimensions when texture is not valid/loaded', () => {
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
        getObjectSizeInfo(object, project, PixiResourcesLoaderMock)
      ).toEqual({
        width: 0,
        height: 0,
        depth: 0,
        originX: 0,
        originY: 0,
        originZ: 0,
        centerX: 0,
        centerY: 0,
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
        getObjectSizeInfo(object, project, PixiResourcesLoaderMock, {
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

    it('returns 0 dimensions when sprite has no animations', () => {
      const objects = project.getObjects();
      const object = objects.insertNewObject(
        project,
        'Sprite',
        'MySpriteEmpty',
        objects.getObjectsCount()
      );

      expect(
        getObjectSizeInfo(object, project, PixiResourcesLoaderMock)
      ).toEqual({
        width: 0,
        height: 0,
        depth: 0,
        originX: 0,
        originY: 0,
        originZ: 0,
        centerX: 0,
        centerY: 0,
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
        getObjectSizeInfo(object, project, PixiResourcesLoaderMock)
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
        getObjectSizeInfo(object, project, PixiResourcesLoaderMock)
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
        getObjectSizeInfo(object, project, PixiResourcesLoaderMock)
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

      expect(getObjectSizeInfo(object, project, null)).toEqual({
        width: 100,
        height: 60,
        depth: 0,
        originX: 10,
        originY: 20,
        originZ: 0,
        centerX: 50,
        centerY: 30,
        centerZ: 0,
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
      eventsBasedObject.setAreaMinX(0);
      eventsBasedObject.setAreaMaxX(100);
      eventsBasedObject.setAreaMinY(0);
      eventsBasedObject.setAreaMaxY(80);

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
      gd.asCustomObjectConfiguration(object.getConfiguration()).setVariantName(
        'Small'
      );

      expect(
        getObjectSizeInfo(object, project, PixiResourcesLoaderMock)
      ).toEqual({
        width: 50,
        height: 40,
        depth: 0,
        originX: 5,
        originY: 10,
        originZ: 0,
        centerX: 25,
        centerY: 20,
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
        getObjectSizeInfo(object, project, PixiResourcesLoaderMock)
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
    it('returns 0 dimensions for unknown types', () => {
      const objects = project.getObjects();
      const object = objects.insertNewObject(
        project,
        'TextObject::Text',
        'MyText',
        objects.getObjectsCount()
      );

      expect(
        getObjectSizeInfo(object, project, PixiResourcesLoaderMock)
      ).toEqual({
        width: 0,
        height: 0,
        depth: 0,
        originX: 0,
        originY: 0,
        originZ: 0,
        centerX: 0,
        centerY: 0,
        centerZ: 0,
      });
    });
  });
});
