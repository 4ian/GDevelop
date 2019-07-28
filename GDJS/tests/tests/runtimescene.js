/**
 * Test for gdjs.RuntimeScene
 */

describe('gdjs.RuntimeScene integration tests', function() {
  describe('Object and behavior lifecycles (using TestObject and TestBehavior)', function () {
    it('should properly create and destroy object, including the behaviors', function() {
	    const runtimeGame = new gdjs.RuntimeGame({variables: [], properties: {windowWidth: 800, windowHeight: 600}});
      const runtimeScene = new gdjs.RuntimeScene(runtimeGame);
      runtimeScene.loadFromScene({
        layers:[{name:"", visibility: true}],
        variables: [],
        behaviorsSharedData: [],
        objects: [{
          type: 'TestObject::TestObject',
          name: 'Object1',
          behaviors: [
            {
              type: 'TestBehavior::TestBehavior',
            },
          ],
        }],
        instances: []
      });

      const object = runtimeScene.createObject('Object1');

      // Check that the behavior was properly created
      expect(
        object
          .getVariables()
          .get('lastState')
          .getAsString()
      ).to.eql('created');

      // Check that the behaviors are properly destroyed
      runtimeScene.markObjectForDeletion(object);
      expect(
        object
          .getVariables()
          .get('lastState')
          .getAsString()
      ).to.eql('onDestroy');

      const object2 = runtimeScene.createObject('Object1');

      // Check that the behaviors are properly destroyed
      runtimeScene.unloadScene();
      expect(
        object2
          .getVariables()
          .get('lastState')
          .getAsString()
      ).to.eql('onDestroy');
    });

  });
});
