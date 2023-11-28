// @ts-check
describe.only('gdjs.RuntimeScene active objects tests', () => {

    const spriteConfiguration = {
        name: 'MySprite',
        type: 'Sprite',
        behaviors: [],
        effects: [],
        animations: [
          {
            name: 'animation',
            directions: [
              {
                sprites: [
                  {
                    originPoint: { x: 0, y: 0 },
                    centerPoint: { x: 0, y: 0 },
                    points: [
                      { name: 'Center', x: 0, y: 0 },
                      { name: 'Origin', x: 0, y: 0 },
                    ],
                    hasCustomCollisionMask: false,
                  },
                ],
              },
            ],
          },
        ],
      }
  
    it('can recycle a sprite without duplication in the active objects', () => {
      const game = gdjs.getPixiRuntimeGame();
      const scene = new gdjs.TestRuntimeScene(game);
  
      scene.registerObject(spriteConfiguration);
      let object = scene.createObject('MySprite');
      object.resetTimer("MyTimer");
  
      scene.renderAndStep(1000 / 60);
      expect(scene._activeInstances.length).to.be(1);

      object.deleteFromScene(scene);
      scene.renderAndStep(1000 / 60);
      expect(scene._activeInstances.length).to.be(0);
      // The object is not destroyed because it is recycled.
      expect(object.getLifecycleSleepState()._onWakingUpCallbacks.length).to.be(1);

      let object2 = scene.createObject('MySprite');
      expect(object === object2).to.be(true);
      object.resetTimer("MyTimer");

      expect(scene._activeInstances.length).to.be(1);
      expect(object.getLifecycleSleepState()._onWakingUpCallbacks.length).to.be(1);
    });

    it('can keep an object awake to handle its timer', () => {
        const game = gdjs.getPixiRuntimeGame();
        const scene = new gdjs.TestRuntimeScene(game);
    
        scene.registerObject(spriteConfiguration);
        let object = scene.createObject('MySprite');
        object.resetTimer("MyTimer");
    
        for (let index = 0; index < 60; index++) {
          scene.renderAndStep(1000 / 60);
          expect(scene._activeInstances.length).to.be(1);
        }
  
        object.removeTimer("MyTimer");
        for (let index = 0; index < 59; index++) {
          scene.renderAndStep(1000 / 60);
          expect(scene._activeInstances.length).to.be(1);
        }
        scene.renderAndStep(1000 / 60);
        expect(scene._activeInstances.length).to.be(0);
    });
});
  