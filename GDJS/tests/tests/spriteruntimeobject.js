// @ts-check

/**
 * Basic tests for gdjs.SpriteRuntimeObject
 */
describe('gdjs.SpriteRuntimeObject', () => {
  const firstAnimationTimeBetweenFrames = 0.23;
  const createObjectWithAnimationInScene = (runtimeScene) => {
    const frames = [
      {
        image: 'base/tests-utils/assets/64x64.jpg',
        originPoint: { name: 'Origin', x: 0, y: 0 },
        centerPoint: {
          name: 'Center',
          x: 32,
          y: 32,
          automatic: true,
        },
        points: [],
        hasCustomCollisionMask: false,
        customCollisionMask: [],
      },
      {
        image: 'base/tests-utils/assets/64x64.jpg',
        originPoint: { name: 'Origin', x: 0, y: 0 },
        centerPoint: {
          name: 'Center',
          x: 32,
          y: 32,
          automatic: true,
        },
        points: [],
        hasCustomCollisionMask: false,
        customCollisionMask: [],
      },
      {
        image: 'base/tests-utils/assets/64x64.jpg',
        originPoint: { name: 'Origin', x: 0, y: 0 },
        centerPoint: {
          name: 'Center',
          x: 32,
          y: 32,
          automatic: true,
        },
        points: [],
        hasCustomCollisionMask: false,
        customCollisionMask: [],
      },
    ];
    const object = new gdjs.SpriteRuntimeObject(runtimeScene, {
      name: 'obj1',
      type: '',
      updateIfNotVisible: false,
      behaviors: [],
      variables: [],
      effects: [],
      animations: [
        {
          name: 'firstAnimation',
          useMultipleDirections: false,
          directions: [
            {
              timeBetweenFrames: firstAnimationTimeBetweenFrames,
              looping: false,
              sprites: frames,
            },
          ],
        },
        {
          name: 'secondAnimation',
          useMultipleDirections: false,
          directions: [
            {
              timeBetweenFrames: 0.5,
              looping: false,
              sprites: [
                {
                  image: 'base/tests-utils/assets/64x64.jpg',
                  originPoint: { name: 'Origin', x: 0, y: 0 },
                  centerPoint: {
                    name: 'Center',
                    x: 32,
                    y: 32,
                    automatic: true,
                  },
                  points: [],
                  hasCustomCollisionMask: false,
                  customCollisionMask: [],
                },
              ],
            },
          ],
        },
        {
          name: 'loppedAnimation',
          useMultipleDirections: false,
          directions: [
            {
              timeBetweenFrames: firstAnimationTimeBetweenFrames,
              looping: true,
              sprites: frames,
            },
          ],
        },
      ],
    });
    return object;
  };

  describe('Scaling', () => {
    const runtimeGame = gdjs.getPixiRuntimeGame();
    const runtimeScene = new gdjs.RuntimeScene(runtimeGame);

    it('should handle scaling properly', () => {
      const object = new gdjs.SpriteRuntimeObject(runtimeScene, {
        name: 'obj1',
        type: '',
        updateIfNotVisible: false,
        variables: [],
        behaviors: [],
        animations: [],
        effects: [],
      });

      expect(object.getScaleX()).to.be(1);
      object.flipX(true);
      expect(object.getScaleX()).to.be(1);
      object.setScaleX(0.42);
      expect(object.getScaleX()).to.be(0.42);
      expect(object.isFlippedX()).to.be(true);
      object.flipX(false);
      expect(object.isFlippedX()).to.be(false);
      expect(object.getScaleX()).to.be(0.42);
    });
  });

  describe('Animations', () => {
    const runtimeGame = gdjs.getPixiRuntimeGame();
    const runtimeScene = new gdjs.RuntimeScene(runtimeGame);

    const object = new gdjs.SpriteRuntimeObject(runtimeScene, {
      name: 'obj1',
      type: '',
      updateIfNotVisible: false,
      behaviors: [],
      variables: [],
      effects: [],
      animations: [
        {
          name: 'firstAnimation',
          useMultipleDirections: false,
          directions: [],
        },
        {
          name: 'secondAnimation',
          useMultipleDirections: false,
          directions: [],
        },
        {
          name: '',
          useMultipleDirections: false,
          directions: [],
        },
      ],
    });

    it('can change animation using animation name', () => {
      expect(object.getAnimationName()).to.be('firstAnimation');
      object.setAnimationName('secondAnimation');
      expect(object.getAnimationName()).to.be('secondAnimation');
      expect(object.getAnimation()).to.be(1);
      expect(object.isCurrentAnimationName('secondAnimation')).to.be(true);
      expect(object.isCurrentAnimationName('firstAnimation')).to.be(false);
    });

    it('keeps the same animation when using an invalid/empty name', () => {
      object.setAnimationName('non-existing animation');
      expect(object.getAnimation()).to.be(1);
      object.setAnimationName('');
      expect(object.getAnimation()).to.be(1);
    });

    it('can change animation using animation index', () => {
      object.setAnimation(2);
      expect(object.getAnimationName()).to.be('');
      object.setAnimation(0);
      expect(object.getAnimationName()).to.be('firstAnimation');
    });
  });

  describe('Forward animation', () => {
    it('should increment time elapsed frame when animation is playing', () => {
      const runtimeGame = gdjs.getPixiRuntimeGame();
      const runtimeScene = new gdjs.TestRuntimeScene(runtimeGame);
      const stepDurationInMilliseconds = 1000 / 60;
      runtimeScene._timeManager.getElapsedTime = function () {
        return stepDurationInMilliseconds;
      };

      const object = createObjectWithAnimationInScene(runtimeScene);
      runtimeScene.addObject(object);

      runtimeScene.renderAndStep(stepDurationInMilliseconds);

      expect(object.getAnimationElapsedTime()).to.be(
        stepDurationInMilliseconds / 1000
      );

      const minimumStepCountBeforeNextFrame = Math.ceil(
        firstAnimationTimeBetweenFrames / (stepDurationInMilliseconds / 1000)
      );
      new Array(minimumStepCountBeforeNextFrame).fill(0).forEach(() => {
        runtimeScene.renderAndStep(stepDurationInMilliseconds);
      });

      expect(object.getAnimationFrame()).to.be(1);
    });

    it('should stop when the end of the animation is reached', () => {
      const runtimeGame = gdjs.getPixiRuntimeGame();
      const runtimeScene = new gdjs.TestRuntimeScene(runtimeGame);
      const stepDurationInMilliseconds = 1000 / 60;
      runtimeScene._timeManager.getElapsedTime = function () {
        return stepDurationInMilliseconds;
      };

      const object = createObjectWithAnimationInScene(runtimeScene);
      runtimeScene.addObject(object);

      for (let i = 0; i < 41; i++) {
        runtimeScene.renderAndStep(stepDurationInMilliseconds);
      }

      // Almost at the animation end.
      expect(object.getAnimationElapsedTime()).to.be.within(
        3 * firstAnimationTimeBetweenFrames - stepDurationInMilliseconds / 1000,
        3 * firstAnimationTimeBetweenFrames - 0.001
      );
      expect(object.getAnimationFrame()).to.be(2);

      runtimeScene.renderAndStep(stepDurationInMilliseconds);

      // The animation ended.
      expect(object.getAnimationElapsedTime()).to.be(
        3 * firstAnimationTimeBetweenFrames
      );
      expect(object.getAnimationFrame()).to.be(2);

      runtimeScene.renderAndStep(stepDurationInMilliseconds);

      // No change.
      expect(object.getAnimationElapsedTime()).to.be(
        3 * firstAnimationTimeBetweenFrames
      );
      expect(object.getAnimationFrame()).to.be(2);
    });

    it('should loop to the beginning when the end of the animation is reached', () => {
      const runtimeGame = gdjs.getPixiRuntimeGame();
      const runtimeScene = new gdjs.TestRuntimeScene(runtimeGame);
      const stepDurationInMilliseconds = 1000 / 60;
      runtimeScene._timeManager.getElapsedTime = function () {
        return stepDurationInMilliseconds;
      };

      const object = createObjectWithAnimationInScene(runtimeScene);
      runtimeScene.addObject(object);
      object.setAnimationName('loppedAnimation');

      for (let i = 0; i < 41; i++) {
        runtimeScene.renderAndStep(stepDurationInMilliseconds);
      }

      // Almost at the animation end.
      expect(object.getAnimationElapsedTime()).to.be.within(
        3 * firstAnimationTimeBetweenFrames - stepDurationInMilliseconds / 1000,
        3 * firstAnimationTimeBetweenFrames - 0.001
      );
      expect(object.getAnimationFrame()).to.be(2);

      runtimeScene.renderAndStep(stepDurationInMilliseconds);

      // The animation looped to the beginning.
      expect(object.getAnimationElapsedTime()).to.within(0.01, 0.02);
      expect(object.getAnimationFrame()).to.be(0);
    });
  });

  describe('Backward animation', () => {
    it('should decrement time elapsed frame when animation is playing', () => {
      const runtimeGame = gdjs.getPixiRuntimeGame();
      const runtimeScene = new gdjs.TestRuntimeScene(runtimeGame);
      const stepDurationInMilliseconds = 1000 / 60;
      runtimeScene._timeManager.getElapsedTime = function () {
        return stepDurationInMilliseconds;
      };

      const object = createObjectWithAnimationInScene(runtimeScene);
      runtimeScene.addObject(object);
      object.setAnimationFrame(2);
      object.setAnimationSpeedScale(-1);

      runtimeScene.renderAndStep(stepDurationInMilliseconds);

      expect(object.getAnimationElapsedTime()).to.be(
        2 * firstAnimationTimeBetweenFrames - stepDurationInMilliseconds / 1000
      );
      expect(object.getAnimationFrame()).to.be(1);
    });

    it('should stop when the animation beginning is reached', () => {
      const runtimeGame = gdjs.getPixiRuntimeGame();
      const runtimeScene = new gdjs.TestRuntimeScene(runtimeGame);
      const stepDurationInMilliseconds = 1000 / 60;
      runtimeScene._timeManager.getElapsedTime = function () {
        return stepDurationInMilliseconds;
      };

      const object = createObjectWithAnimationInScene(runtimeScene);
      runtimeScene.addObject(object);
      object.setAnimationFrame(1);
      object.setAnimationSpeedScale(-1);

      for (let i = 0; i < 13; i++) {
        runtimeScene.renderAndStep(stepDurationInMilliseconds);
      }

      // Almost at the animation beginning.
      expect(object.getAnimationElapsedTime()).to.be.within(
        0.001,
        stepDurationInMilliseconds / 60
      );
      expect(object.getAnimationFrame()).to.be(0);

      runtimeScene.renderAndStep(stepDurationInMilliseconds);

      // Reached the animation beginning.
      expect(object.getAnimationElapsedTime()).to.be(0);
      expect(object.getAnimationFrame()).to.be(0);

      runtimeScene.renderAndStep(stepDurationInMilliseconds);

      // No change.
      expect(object.getAnimationElapsedTime()).to.be(0);
      expect(object.getAnimationFrame()).to.be(0);
    });

    it('should loop to the end when the beginning of the animation is reached', () => {
      const runtimeGame = gdjs.getPixiRuntimeGame();
      const runtimeScene = new gdjs.TestRuntimeScene(runtimeGame);
      const stepDurationInMilliseconds = 1000 / 60;
      runtimeScene._timeManager.getElapsedTime = function () {
        return stepDurationInMilliseconds;
      };

      const object = createObjectWithAnimationInScene(runtimeScene);
      runtimeScene.addObject(object);
      object.setAnimationName('loppedAnimation');
      object.setAnimationFrame(1);
      object.setAnimationSpeedScale(-1);

      for (let i = 0; i < 13; i++) {
        runtimeScene.renderAndStep(stepDurationInMilliseconds);
      }

      // Almost at the animation beginning.
      expect(object.getAnimationElapsedTime()).to.be.within(
        0.001,
        stepDurationInMilliseconds / 60
      );
      expect(object.getAnimationFrame()).to.be(0);

      runtimeScene.renderAndStep(stepDurationInMilliseconds);

      // Reached the animation beginning.
      expect(object.getAnimationElapsedTime()).to.be.within(
        3 * firstAnimationTimeBetweenFrames - 0.004,
        3 * firstAnimationTimeBetweenFrames - 0.003
      );
      expect(object.getAnimationFrame()).to.be(2);
    });
  });

  describe('Animation change', () => {
    it('should reset the elapsed time on a frame when changing animation', () => {
      const runtimeGame = gdjs.getPixiRuntimeGame();
      const runtimeScene = new gdjs.TestRuntimeScene(runtimeGame);
      const stepDurationInMilliseconds = 1000 / 60;
      runtimeScene._timeManager.getElapsedTime = function () {
        return stepDurationInMilliseconds;
      };

      const object = createObjectWithAnimationInScene(runtimeScene);
      runtimeScene.addObject(object);

      runtimeScene.renderAndStep(stepDurationInMilliseconds);

      expect(object.getAnimationElapsedTime()).to.not.be(0);

      object.setAnimation(1);

      expect(object.getAnimationFrame()).to.be(0);
      expect(object.getAnimationElapsedTime()).to.be(0);

      runtimeScene.renderAndStep(stepDurationInMilliseconds);

      expect(object.getAnimationElapsedTime()).to.not.be(0);
    });

    it('should reset the elapsed time on a frame when changing animation frame', () => {
      const runtimeGame = gdjs.getPixiRuntimeGame();
      const runtimeScene = new gdjs.TestRuntimeScene(runtimeGame);
      const stepDurationInMilliseconds = 1000 / 60;
      runtimeScene._timeManager.getElapsedTime = function () {
        return stepDurationInMilliseconds;
      };

      const object = createObjectWithAnimationInScene(runtimeScene);
      runtimeScene.addObject(object);

      runtimeScene.renderAndStep(stepDurationInMilliseconds);

      expect(object.getAnimationElapsedTime()).to.not.be(0);

      object.setAnimationFrame(2);

      expect(object.getAnimationFrame()).to.be(2);
      expect(object.getAnimationElapsedTime()).to.be(
        2 * firstAnimationTimeBetweenFrames
      );

      runtimeScene.renderAndStep(stepDurationInMilliseconds);

      expect(object.getAnimationElapsedTime()).to.not.be(0);
    });
  });
});
