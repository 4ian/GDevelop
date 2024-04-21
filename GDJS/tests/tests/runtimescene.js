// @ts-check
/**
 * Test for gdjs.RuntimeScene
 */

describe('gdjs.RuntimeScene integration tests', function () {
  describe('Object and behavior lifecycles (using TestObject and TestBehavior)', function () {
    it('should properly create and destroy object, including the behaviors', function () {
      const runtimeGame = gdjs.getPixiRuntimeGame();
      const runtimeScene = new gdjs.RuntimeScene(runtimeGame);
      runtimeScene.loadFromScene({
        layers: [
          {
            name: '',
            visibility: true,
            cameras: [],
            effects: [],
            ambientLightColorR: 127,
            ambientLightColorB: 127,
            ambientLightColorG: 127,
            isLightingLayer: false,
            followBaseLayerCamera: false,
          },
        ],
        variables: [],
        r: 0,
        v: 0,
        b: 0,
        mangledName: 'Scene1',
        name: 'Scene1',
        stopSoundsOnStartup: false,
        title: '',
        behaviorsSharedData: [],
        objects: [
          {
            type: 'TestObject::TestObject',
            name: 'Object1',
            behaviors: [
              {
                type: 'TestBehavior::TestBehavior',
                name: 'SomeBehavior',
              },
            ],
            variables: [],
            effects: [],
          },
        ],
        instances: [],
        usedResources: [],
      });

      const object = runtimeScene.createObject('Object1');
      if (!object) {
        throw new Error('object should have been created');
      }

      // Check that the behavior was properly created
      expect(object.getVariables().get('lastState').getAsString()).to.eql(
        'created'
      );

      // Check that the behaviors are properly destroyed
      runtimeScene.markObjectForDeletion(object);
      expect(object.getVariables().get('lastState').getAsString()).to.eql(
        'onDestroy'
      );

      const object2 = runtimeScene.createObject('Object1');
      if (!object2) {
        throw new Error('object should have been created');
      }

      // Check that the behaviors are properly destroyed
      runtimeScene.unloadScene();
      expect(object2.getVariables().get('lastState').getAsString()).to.eql(
        'onDestroy'
      );
    });
  });

  describe('Layers (using a Sprite object)', function () {
    it('should handle objects on layers', () => {
      const runtimeGame = gdjs.getPixiRuntimeGame();
      const runtimeScene = new gdjs.RuntimeScene(runtimeGame);
      runtimeScene.loadFromScene({
        layers: [
          {
            name: '',
            visibility: true,
            cameras: [],
            effects: [],
            ambientLightColorR: 127,
            ambientLightColorB: 127,
            ambientLightColorG: 127,
            isLightingLayer: false,
            followBaseLayerCamera: false,
          },
          {
            name: 'MyLayer',
            visibility: true,
            cameras: [],
            effects: [],
            ambientLightColorR: 127,
            ambientLightColorB: 127,
            ambientLightColorG: 127,
            isLightingLayer: false,
            followBaseLayerCamera: false,
          },
        ],
        variables: [],
        r: 0,
        v: 0,
        b: 0,
        mangledName: 'Scene1',
        name: 'Scene1',
        stopSoundsOnStartup: false,
        title: '',
        behaviorsSharedData: [],
        objects: [
          {
            type: 'Sprite',
            name: 'MyObject',
            behaviors: [],
            effects: [],
            // @ts-expect-error ts-migrate(2322) FIXME: Type '{ type: string; name: string; behaviors: nev... Remove this comment to see the full error message
            animations: [],
            updateIfNotVisible: false,
          },
        ],
        instances: [],
      });

      expect(runtimeScene.hasLayer('')).to.be(true);
      expect(runtimeScene.hasLayer('MyLayer')).to.be(true);
      expect(runtimeScene.hasLayer('MyOtherLayer')).to.be(false);

      const object1 = runtimeScene.createObject('MyObject');
      const object2 = runtimeScene.createObject('MyObject');
      const object3 = runtimeScene.createObject('MyObject');
      if (!object1 || !object2 || !object3) {
        throw new Error('object should have been created');
      }
      object2.setLayer('MyLayer');

      runtimeScene.addLayer({
        name: 'MyOtherLayer',
        visibility: true,
        cameras: [],
        effects: [],
        isLightingLayer: false,
        followBaseLayerCamera: false,
        ambientLightColorR: 128,
        ambientLightColorG: 128,
        ambientLightColorB: 128,
      });
      expect(runtimeScene.hasLayer('')).to.be(true);
      expect(runtimeScene.hasLayer('MyLayer')).to.be(true);
      expect(runtimeScene.hasLayer('MyOtherLayer')).to.be(true);

      object3.setLayer('MyOtherLayer');
      expect(object1.getLayer()).to.be('');
      expect(object2.getLayer()).to.be('MyLayer');
      expect(object3.getLayer()).to.be('MyOtherLayer');

      runtimeScene.removeLayer('MyLayer');

      expect(object1.getLayer()).to.be('');
      expect(object2.getLayer()).to.be('');
      expect(object3.getLayer()).to.be('MyOtherLayer');
      expect(runtimeScene.hasLayer('')).to.be(true);
      expect(runtimeScene.hasLayer('MyLayer')).to.be(false);
      expect(runtimeScene.hasLayer('MyOtherLayer')).to.be(true);
    });
  });
});
