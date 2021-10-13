describe('gdjs.PlatformerObjectRuntimeBehavior.findPlatformHighestRelativeYUnderObject', function () {

  const makeTestRuntimeScene = () => {
    const runtimeGame = new gdjs.RuntimeGame({
      variables: [],
      resources: {
        resources: [],
      },
      properties: { windowWidth: 800, windowHeight: 600 },
    });
    const runtimeScene = new gdjs.RuntimeScene(runtimeGame);
    runtimeScene.loadFromScene({
      layers: [{ name: '', visibility: true, effects: [] }],
      variables: [],
      behaviorsSharedData: [],
      objects: [],
      instances: [],
    });
    runtimeScene._timeManager.getElapsedTime = function () {
      return (1 / 60) * 1000;
    };
    return runtimeScene;
  };

  const addCharacter = (runtimeScene) => {
  const character = new gdjs.TestRuntimeObject(runtimeScene, {
    name: 'obj1',
    type: '',
    behaviors: [
      {
        type: 'PlatformBehavior::PlatformerObjectBehavior',
        name: 'auto1',
        gravity: 900,
        maxFallingSpeed: 1500,
        acceleration: 500,
        deceleration: 1500,
        maxSpeed: 500,
        jumpSpeed: 1500,
        canGrabPlatforms: true,
        ignoreDefaultControls: true,
        slopeMaxAngle: 60,
      },
    ],
    effects: [],
  });
  character.setCustomWidthAndHeight(100, 100);
  runtimeScene.addObject(character);
  return character;
};

  const addPlatform = (runtimeScene, collisionMask) => {
    const platform = new gdjs.TestSpriteRuntimeObject(runtimeScene, {
      name: 'platform',
      type: '',
      behaviors: [
        {
          type: 'PlatformBehavior::PlatformBehavior',
          name: 'Platform',
          canBeGrabbed: true,
        },
      ],
      effects: [],
      animations: [
        {
          name: 'animation',
          directions: [
            {
              sprites: [
                {
                  originPoint: { x: 0, y: 0 },
                  centerPoint: { x: 50, y: 50 },
                  points: [
                    { name: 'Center', x: 0, y: 0 },
                    { name: 'Origin', x: 50, y: 50 },
                  ],
                  hasCustomCollisionMask: true,
                  customCollisionMask: collisionMask,
                },
              ],
            },
          ],
        },
      ],
    });
    runtimeScene.addObject(platform);
    platform.setUnscaledWidthAndHeight(100, 100);
    platform.setCustomWidthAndHeight(100, 100);

    return platform;
  };

  const collisionMasks = {
    square: [
      [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 100 },
        { x: 0, y: 100 },
      ],
    ],
    triangleLeftBottom: [
      [
        { x: 0, y: 0 },
        { x: 0, y: 100 },
        { x: 100, y: 100 },
      ],
    ],
    triangleRightBottom: [
      [
        { x: 100, y: 0 },
        { x: 0, y: 100 },
        { x: 100, y: 100 },
      ],
    ],
    triangleLeftTop: [
      [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 100 },
      ],
    ],
    triangleRightTop: [
      [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 0, y: 100 },
      ],
    ],
    triangleBottom: [
      [
        { x: 50, y: 0 },
        { x: 0, y: 100 },
        { x: 100, y: 100 },
      ],
    ],
    triangleTop: [
      [
        { x: 50, y: 100 },
        { x: 0, y: 0 },
        { x: 100, y: 0 },
      ],
    ],
    triangleLeft: [
      [
        { x: 100, y: 50 },
        { x: 0, y: 0 },
        { x: 0, y: 100 },
      ],
    ],
    triangleRight: [
      [
        { x: 0, y: 50 },
        { x: 100, y: 0 },
        { x: 100, y: 100 },
      ],
    ],
    horizontalTunnel: [
      [
        { x: 0, y: 0 },
        { x: 0, y: 25 },
        { x: 100, y: 25 },
        { x: 100, y: 0 },
      ],
      [
        { x: 0, y: 75 },
        { x: 0, y: 100 },
        { x: 100, y: 100 },
        { x: 100, y: 75 },
      ],
    ],
    verticalTunnel: [
      [
        { x: 25, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 100 },
        { x: 25, y: 100 },
      ],
      [
        { x: 75, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 100 },
        { x: 75, y: 100 },
      ],
    ],
  };

  const evaluate = (characterBehavior, platformBehavior) =>
    characterBehavior._findPlatformHighestRelativeYUnderObject(
      platformBehavior,
      -10,
      10
    );
  
  const noCollision = gdjs.PlatformerObjectRuntimeBehavior._noCollision;
  const floorIsTooHigh = gdjs.PlatformerObjectRuntimeBehavior._floorIsTooHigh;

  describe('(An edge crossing from the left to the right)', function () {
    const runtimeScene = makeTestRuntimeScene();
    const character = addCharacter(runtimeScene);
    const behavior = character.getBehavior('auto1');

    const platform = addPlatform(runtimeScene, collisionMasks.square);
    platform.setCustomWidthAndHeight(300, 100);
    platform.setPosition(200, -100);
    const platformBehavior = platform.getBehavior('Platform');

    it('can detect that the platform away upward', function () {
      character.setPosition(300, -210.1);
      expect(evaluate(behavior, platformBehavior)).to.be(noCollision);
    });

    it('can detect a floor to follow up', function () {
      character.setPosition(300, -210);
      expect(evaluate(behavior, platformBehavior)).to.be(10);
    });
    
    it('can detect a floor when right on it', function () {
      character.setPosition(300, -200);
      expect(evaluate(behavior, platformBehavior)).to.be(0);
    });
    
    it('can detect a floor to follow down', function () {
      character.setPosition(300, -190);
      expect(evaluate(behavior, platformBehavior)).to.be(-10);
    });

    it('can detect an obstacle a bit too high to follow', function () {
      character.setPosition(300, -189.9);
      expect(evaluate(behavior, platformBehavior)).to.be(floorIsTooHigh);
    });

    it('can detect an obstacle overlapping the top', function () {
      character.setPosition(300, -0.1);
      expect(evaluate(behavior, platformBehavior)).to.be(floorIsTooHigh);
    });

    it('can detect that the platform is away downward', function () {
      character.setPosition(300, 0);
      expect(evaluate(behavior, platformBehavior)).to.be(noCollision);
    });
  });

  describe('(An edge crossing from the left to the bottom)', function () {
  });

  describe('(An edge crossing from the right to the bottom)', function () {
  });

  describe('(An edge crossing from the left to the top)', function () {
  });

  describe('(An edge crossing from the right to the top)', function () {
  });


  describe('(A vertex inside and edges crossing at the left)', function () {
  });

  describe('(A vertex inside and edges crossing at the right)', function () {
  });

  describe('(A vertex inside and edges crossing at the top)', function () {
  });

  describe('(A vertex inside and edges crossing at the bottom)', function () {
  });

  describe('(A vertex inside and edges crossing at the left)', function () {
  });


  describe('(An platform with an hitbox under and another one above)', function () {
  });

  describe('(An platform with an hitbox on the left and another one on the right)', function () {
  });
});
