// @ts-check
/**
 * Test for gdjs.RuntimeScene
 */

describe('gdjs.RuntimeScene integration tests', function () {
  describe('Object and behavior lifecycles (using TestObject and TestBehavior)', function () {
    it('should properly create and destroy object, including the behaviors', function () {
      const runtimeGame = new gdjs.RuntimeGame({
        variables: [],
        // @ts-expect-error ts-migrate(2740) FIXME: Type '{ windowWidth: number; windowHeight: number;... Remove this comment to see the full error message
        properties: { windowWidth: 800, windowHeight: 600 },
        resources: { resources: [] },
      });
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
    /** @type {gdjs.RuntimeGame} */
    let runtimeGame;
    /** @type {gdjs.RuntimeScene} */
    let runtimeScene;

    beforeEach(() => {
      runtimeGame = new gdjs.RuntimeGame({
        variables: [],
        // @ts-expect-error ts-migrate(2740) FIXME: Type '{ windowWidth: number; windowHeight: number;... Remove this comment to see the full error message
        properties: { windowWidth: 800, windowHeight: 600 },
        resources: { resources: [] },
      });
      runtimeScene = new gdjs.RuntimeScene(runtimeGame);
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
    });

    it('should handle objects on layers', () => {
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

    it('should compute layers highest z orders correctly', () => {
      expect(runtimeScene.hasLayer('')).to.be(true);
      expect(runtimeScene.hasLayer('MyLayer')).to.be(true);

      const object1 = runtimeScene.createObject('MyObject');
      const object2 = runtimeScene.createObject('MyObject');
      const object3 = runtimeScene.createObject('MyObject');
      if (!object1 || !object2 || !object3) {
        throw new Error('object should have been created');
      }
      expect(object2.getZOrder()).to.be(0);
      object2.setLayer('MyLayer');

      // Layers highest Z orders should stay at 0 if objects did not change Z their order
      runtimeScene._updateObjectsPreRender();
      expect(runtimeScene.getLayer('MyLayer').getHighestZOrder()).to.be(0);
      expect(runtimeScene.getLayer('').getHighestZOrder()).to.be(0);

      object2.setZOrder(8);

      // Check highest Z order has been correctly updated for layers and they are stable
      runtimeScene._updateObjectsPreRender();
      expect(runtimeScene.getLayer('MyLayer').getHighestZOrder()).to.be(8);
      expect(runtimeScene.getLayer('').getHighestZOrder()).to.be(0);
      runtimeScene._updateObjectsPreRender();
      expect(runtimeScene.getLayer('MyLayer').getHighestZOrder()).to.be(8);
      expect(runtimeScene.getLayer('').getHighestZOrder()).to.be(0);

      // Change Z orders for default layer
      object1.setZOrder(13);
      object3.setZOrder(25);

      runtimeScene._updateObjectsPreRender();
      expect(runtimeScene.getLayer('MyLayer').getHighestZOrder()).to.be(8);
      expect(runtimeScene.getLayer('').getHighestZOrder()).to.be(25);

      // Check highest z orders come back to 0 after objects deletion
      runtimeScene.markObjectForDeletion(object1);
      runtimeScene.markObjectForDeletion(object2);
      runtimeScene.markObjectForDeletion(object3);

      runtimeScene._updateObjectsPreRender();
      expect(runtimeScene.getLayer('MyLayer').getHighestZOrder()).to.be(0);
      expect(runtimeScene.getLayer('').getHighestZOrder()).to.be(0);
    });
  });
});
