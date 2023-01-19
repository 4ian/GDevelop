// @ts-check

/**
 * Basic tests for gdjs.SpriteRuntimeObject
 */
describe('gdjs.SpriteRuntimeObject', () => {
  const firstAnimationTimeBetweenFrames = 0.25;
  const createObjectWithAnimationInScene = (runtimeScene) => {
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
              ],
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
      ],
    });
    return object;
  };

  describe('Scaling', () => {
    const runtimeGame = new gdjs.RuntimeGame({
      variables: [],
      // @ts-expect-error ts-migrate(2740) FIXME: Type '{ windowWidth: number; windowHeight: number;... Remove this comment to see the full error message
      properties: { windowWidth: 800, windowHeight: 600 },
      resources: { resources: [] },
    });
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
    const runtimeGame = new gdjs.RuntimeGame({
      variables: [],
      // @ts-expect-error ts-migrate(2740) FIXME: Type '{ windowWidth: number; windowHeight: number;... Remove this comment to see the full error message
      properties: { windowWidth: 800, windowHeight: 600 },
      resources: { resources: [] },
    });
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
      object.setAnimationName('unexisting animation');
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

  describe('Animation frames', () => {
    it('should increment time elapsed frame when animation is playing', () => {
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
            effects: [],
            cameras: [],

            ambientLightColorR: 0,
            ambientLightColorG: 0,
            ambientLightColorB: 0,
            isLightingLayer: false,
            followBaseLayerCamera: true,
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
        objects: [],
        instances: [],
      });
      const stepDurationInMilliseconds = 1000 / 60;
      runtimeScene._timeManager.getElapsedTime = function () {
        return stepDurationInMilliseconds;
      };

      const object = createObjectWithAnimationInScene(runtimeScene);
      runtimeScene.addObject(object);

      runtimeScene.renderAndStep(stepDurationInMilliseconds);

      expect(object._frameElapsedTime).to.be(stepDurationInMilliseconds / 1000);

      const minimumStepCountBeforeNextFrame = Math.ceil(
        firstAnimationTimeBetweenFrames / (stepDurationInMilliseconds / 1000)
      );
      new Array(minimumStepCountBeforeNextFrame).fill(0).forEach(() => {
        runtimeScene.renderAndStep(stepDurationInMilliseconds);
      });

      expect(object.getAnimationFrame()).to.be(1);
    });

    it('should reset the elapsed time on a frame when changing animation', () => {
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
            effects: [],
            cameras: [],

            ambientLightColorR: 0,
            ambientLightColorG: 0,
            ambientLightColorB: 0,
            isLightingLayer: false,
            followBaseLayerCamera: true,
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
        objects: [],
        instances: [],
      });
      const stepDurationInMilliseconds = 1000 / 60;
      runtimeScene._timeManager.getElapsedTime = function () {
        return stepDurationInMilliseconds;
      };

      const object = createObjectWithAnimationInScene(runtimeScene);
      runtimeScene.addObject(object);

      runtimeScene.renderAndStep(stepDurationInMilliseconds);

      expect(object._frameElapsedTime).to.not.be(0);

      object.setAnimation(1);

      expect(object.getAnimationFrame()).to.be(0);
      expect(object._frameElapsedTime).to.be(0);

      runtimeScene.renderAndStep(stepDurationInMilliseconds);

      expect(object._frameElapsedTime).to.not.be(0);
    });

    it('should reset the elapsed time on a frame when changing animation frame', () => {
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
            effects: [],
            cameras: [],

            ambientLightColorR: 0,
            ambientLightColorG: 0,
            ambientLightColorB: 0,
            isLightingLayer: false,
            followBaseLayerCamera: true,
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
        objects: [],
        instances: [],
      });
      const stepDurationInMilliseconds = 1000 / 60;
      runtimeScene._timeManager.getElapsedTime = function () {
        return stepDurationInMilliseconds;
      };

      const object = createObjectWithAnimationInScene(runtimeScene);
      runtimeScene.addObject(object);

      runtimeScene.renderAndStep(stepDurationInMilliseconds);

      expect(object._frameElapsedTime).to.not.be(0);

      object.setAnimationFrame(2);

      expect(object.getAnimationFrame()).to.be(2);
      expect(object._frameElapsedTime).to.be(0);

      runtimeScene.renderAndStep(stepDurationInMilliseconds);

      expect(object._frameElapsedTime).to.not.be(0);
    });
  });
});
