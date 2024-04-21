const path = require('path');
const {
  makeFakeAbstractFileSystem,
} = require('../TestUtils/FakeAbstractFileSystem');
const initializeGDevelopJs = require('../../Binaries/embuild/GDevelop.js/libGD.js');
const { makeTestExtensions } = require('../TestUtils/TestExtensions');

describe('libGD.js - GDJS project serialization tests', function () {
  let gd = null;
  beforeAll(async () => {
    gd = await initializeGDevelopJs();
    makeTestExtensions(gd);
  });

  it('should keep TextObject configuration after after a save and reload', function () {
    const checkConfiguration = (project) => {
      const layout = project.getLayout('Scene');
      const object = layout.getObject('MyObject');
      const configuration = gd.asTextObjectConfiguration(
        object.getConfiguration()
      );
      expect(configuration.getText()).toBe('Hello');
    };

    const serializerElement = new gd.SerializerElement();
    {
      const project = gd.ProjectHelper.createNewGDJSProject();
      const layout = project.insertNewLayout('Scene', 0);
      const object = layout.insertNewObject(
        project,
        'TextObject::Text',
        'MyObject',
        0
      );
      const configuration = gd.asTextObjectConfiguration(
        object.getConfiguration()
      );
      configuration.setText('Hello');

      checkConfiguration(project);
      project.serializeTo(serializerElement);
    }
    {
      const project = gd.ProjectHelper.createNewGDJSProject();
      project.unserializeFrom(serializerElement);
      checkConfiguration(project);
    }
    serializerElement.delete();
  });

  it('should keep TiledSpriteObject configuration after a save and reload', function () {
    const checkConfiguration = (project) => {
      const layout = project.getLayout('Scene');
      const object = layout.getObject('MyObject');
      const configuration = gd.asTiledSpriteConfiguration(
        object.getConfiguration()
      );
      expect(configuration.getTexture()).toBe('MyImageName');
    };

    const serializerElement = new gd.SerializerElement();
    {
      const project = gd.ProjectHelper.createNewGDJSProject();
      const layout = project.insertNewLayout('Scene', 0);
      const object = layout.insertNewObject(
        project,
        'TiledSpriteObject::TiledSprite',
        'MyObject',
        0
      );
      const configuration = gd.asTiledSpriteConfiguration(
        object.getConfiguration()
      );
      configuration.setTexture('MyImageName');

      checkConfiguration(project);
      project.serializeTo(serializerElement);
    }
    {
      const project = gd.ProjectHelper.createNewGDJSProject();
      project.unserializeFrom(serializerElement);
      checkConfiguration(project);
    }
    serializerElement.delete();
  });

  it('should keep PanelSpriteObject configuration after a save and reload', function () {
    const checkConfiguration = (project) => {
      const layout = project.getLayout('Scene');
      const object = layout.getObject('MyObject');
      const configuration = gd.asPanelSpriteConfiguration(
        object.getConfiguration()
      );
      expect(configuration.getTexture()).toBe('MyImageName');
    };

    const serializerElement = new gd.SerializerElement();
    {
      const project = gd.ProjectHelper.createNewGDJSProject();
      const layout = project.insertNewLayout('Scene', 0);
      const object = layout.insertNewObject(
        project,
        'PanelSpriteObject::PanelSprite',
        'MyObject',
        0
      );
      const configuration = gd.asPanelSpriteConfiguration(
        object.getConfiguration()
      );
      configuration.setTexture('MyImageName');

      checkConfiguration(project);
      project.serializeTo(serializerElement);
    }
    {
      const project = gd.ProjectHelper.createNewGDJSProject();
      project.unserializeFrom(serializerElement);
      checkConfiguration(project);
    }
    serializerElement.delete();
  });

  it('should keep ShapePainterObject configuration after a save and reload', function () {
    const checkConfiguration = (project) => {
      const layout = project.getLayout('Scene');
      const object = layout.getObject('MyObject');
      const configuration = gd.asShapePainterConfiguration(
        object.getConfiguration()
      );
      expect(configuration.areCoordinatesAbsolute()).toBe(true);
    };

    const serializerElement = new gd.SerializerElement();
    {
      const project = gd.ProjectHelper.createNewGDJSProject();
      const layout = project.insertNewLayout('Scene', 0);
      const object = layout.insertNewObject(
        project,
        'PrimitiveDrawing::Drawer',
        'MyObject',
        0
      );
      const configuration = gd.asShapePainterConfiguration(
        object.getConfiguration()
      );
      // It's relative by default.
      configuration.setCoordinatesAbsolute();

      checkConfiguration(project);
      project.serializeTo(serializerElement);
    }
    {
      const project = gd.ProjectHelper.createNewGDJSProject();
      project.unserializeFrom(serializerElement);
      checkConfiguration(project);
    }
    serializerElement.delete();
  });

  it('should keep ParticleEmitterObject configuration after a save and reload', function () {
    const checkConfiguration = (project) => {
      const layout = project.getLayout('Scene');
      const object = layout.getObject('MyObject');
      const configuration = gd.asParticleEmitterConfiguration(
        object.getConfiguration()
      );
      expect(configuration.getParticleAngle1()).toBe(45);
    };

    const serializerElement = new gd.SerializerElement();
    {
      const project = gd.ProjectHelper.createNewGDJSProject();
      const layout = project.insertNewLayout('Scene', 0);
      const object = layout.insertNewObject(
        project,
        'ParticleSystem::ParticleEmitter',
        'MyObject',
        0
      );
      const configuration = gd.asParticleEmitterConfiguration(
        object.getConfiguration()
      );
      configuration.setParticleAngle1(45);

      checkConfiguration(project);
      project.serializeTo(serializerElement);
    }
    {
      const project = gd.ProjectHelper.createNewGDJSProject();
      project.unserializeFrom(serializerElement);
      checkConfiguration(project);
    }
    serializerElement.delete();
  });

  it('should set behavior properties default values', function () {
    const project = gd.ProjectHelper.createNewGDJSProject();
    const layout = project.insertNewLayout('Scene', 0);
    const object = layout.insertNewObject(project, 'Sprite', 'MyObject', 0);
    const behavior = object.addNewBehavior(
      project,
      'FakeBehaviorWithSharedData::DummyBehaviorWithSharedData',
      'DummyBehaviorWithSharedData'
    );

    expect(behavior.getProperties().get('MyBehaviorProperty').getValue()).toBe(
      'Initial value 1'
    );
  });

  it('should keep behavior properties values after a save and reload', function () {
    const checkConfiguration = (project) => {
      const layout = project.getLayout('Scene');
      const object = layout.getObject('MyObject');
      const behavior = object.getBehavior('DummyBehaviorWithSharedData');
      expect(
        behavior.getProperties().get('MyBehaviorProperty').getValue()
      ).toBe('123');
    };

    const serializerElement = new gd.SerializerElement();
    {
      const project = gd.ProjectHelper.createNewGDJSProject();
      const layout = project.insertNewLayout('Scene', 0);
      const object = layout.insertNewObject(project, 'Sprite', 'MyObject', 0);
      const behavior = object.addNewBehavior(
        project,
        'FakeBehaviorWithSharedData::DummyBehaviorWithSharedData',
        'DummyBehaviorWithSharedData'
      );
      behavior.updateProperty('MyBehaviorProperty', '123');

      checkConfiguration(project);
      project.serializeTo(serializerElement);
    }
    {
      const project = gd.ProjectHelper.createNewGDJSProject();
      project.unserializeFrom(serializerElement);
      checkConfiguration(project);
    }
    serializerElement.delete();
  });

  it('should set behavior shared properties default values', function () {
    const project = gd.ProjectHelper.createNewGDJSProject();
    const layout = project.insertNewLayout('Scene', 0);
    const object = layout.insertNewObject(project, 'Sprite', 'MyObject', 0);
    const behavior = object.addNewBehavior(
      project,
      'FakeBehaviorWithSharedData::DummyBehaviorWithSharedData',
      'DummyBehaviorWithSharedData'
    );
    layout.updateBehaviorsSharedData(project);
    const sharedData = layout.getBehaviorSharedData(
      'DummyBehaviorWithSharedData'
    );

    expect(sharedData.getProperties().get('MySharedProperty').getValue()).toBe(
      'Initial shared value 1'
    );
  });

  it('should keep behavior shared properties values after a save and reload', function () {
    const checkConfiguration = (project) => {
      const layout = project.getLayout('Scene');
      const object = layout.getObject('MyObject');
      const sharedData = layout.getBehaviorSharedData(
        'DummyBehaviorWithSharedData'
      );
      expect(
        sharedData.getProperties().get('MySharedProperty').getValue()
      ).toBe('123');
    };

    const serializerElement = new gd.SerializerElement();
    {
      const project = gd.ProjectHelper.createNewGDJSProject();
      const layout = project.insertNewLayout('Scene', 0);
      const object = layout.insertNewObject(project, 'Sprite', 'MyObject', 0);
      const behavior = object.addNewBehavior(
        project,
        'FakeBehaviorWithSharedData::DummyBehaviorWithSharedData',
        'DummyBehaviorWithSharedData'
      );
      layout.updateBehaviorsSharedData(project);
      const sharedData = layout.getBehaviorSharedData(
        'DummyBehaviorWithSharedData'
      );
      sharedData.updateProperty('MySharedProperty', '123');

      checkConfiguration(project);
      project.serializeTo(serializerElement);
    }
    {
      const project = gd.ProjectHelper.createNewGDJSProject();
      project.unserializeFrom(serializerElement);
      checkConfiguration(project);
    }
    serializerElement.delete();
  });
});
