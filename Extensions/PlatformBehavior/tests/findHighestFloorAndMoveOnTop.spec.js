describe('gdjs.PlatformerObjectRuntimeBehavior.findHighestFloorAndMoveOnTop', function () {
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
    bottomLeftTriangle: [
      [
        { x: 0, y: 0 },
        { x: 0, y: 100 },
        { x: 100, y: 100 },
      ],
    ],
    bottomRightTriangle: [
      [
        { x: 100, y: 0 },
        { x: 0, y: 100 },
        { x: 100, y: 100 },
      ],
    ],
    topLeftTriangle: [
      [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 100 },
      ],
    ],
    topRightTriangle: [
      [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 0, y: 100 },
      ],
    ],
    bottomTriangle: [
      [
        { x: 50, y: 0 },
        { x: 0, y: 100 },
        { x: 100, y: 100 },
      ],
    ],
    topTriangle: [
      [
        { x: 50, y: 100 },
        { x: 0, y: 0 },
        { x: 100, y: 0 },
      ],
    ],
    leftTriangle: [
      [
        { x: 100, y: 50 },
        { x: 0, y: 0 },
        { x: 0, y: 100 },
      ],
    ],
    rightTriangle: [
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

  const checkMoveOn = (
    characterBehavior,
    platformBehavior,
    upwardDeltaY,
    downwardDeltaY
  ) => {
    const result = characterBehavior._findHighestFloorAndMoveOnTop(
      [platformBehavior],
      upwardDeltaY,
      downwardDeltaY
    );
    expect(result.highestGround).to.be(platformBehavior);
  };

  const checkNoFloor = (
    characterBehavior,
    platformBehavior,
    upwardDeltaY,
    downwardDeltaY
  ) => {
    const oldY = characterBehavior.owner.getY();
    const result = characterBehavior._findHighestFloorAndMoveOnTop(
      [platformBehavior],
      upwardDeltaY,
      downwardDeltaY
    );
    expect(result.highestGround).to.be(null);
    expect(result.isCollidingAnyPlatform).to.be(false);
    expect(characterBehavior.owner.getY()).to.be(oldY);
  };

  const checkObstacle = (
    characterBehavior,
    platformBehavior,
    upwardDeltaY,
    downwardDeltaY
  ) => {
    const oldY = characterBehavior.owner.getY();
    const result = characterBehavior._findHighestFloorAndMoveOnTop(
      [platformBehavior],
      upwardDeltaY,
      downwardDeltaY
    );
    expect(result.highestGround).to.be(null);
    expect(result.isCollidingAnyPlatform).to.be(true);
    expect(characterBehavior.owner.getY()).to.be(oldY);
  };

  const noCollision = gdjs.PlatformerObjectRuntimeBehavior._noCollision;
  const floorIsTooHigh = gdjs.PlatformerObjectRuntimeBehavior._floorIsTooHigh;

  [
    {
      description: '(An edge crossing from the left to the right)',
      mask: collisionMasks.square,
    },
    {
      description: '(An edge crossing from the left to the bottom)',
      mask: collisionMasks.bottomLeftTriangle,
    },
    {
      description: '(An edge crossing from the right to the bottom)',
      mask: collisionMasks.bottomRightTriangle,
    },
    {
      description: '(A vertex inside and edges crossing at the bottom)',
      mask: collisionMasks.bottomTriangle,
    },
  ].forEach(({ description, mask }) => {
    describe(description, function () {
      const runtimeScene = makeTestRuntimeScene();
      const character = addCharacter(runtimeScene);
      const behavior = character.getBehavior('auto1');

      const platform = addPlatform(runtimeScene, mask);
      platform.setCustomWidthAndHeight(300, 300);
      if (
        mask === collisionMasks.square ||
        mask === collisionMasks.bottomTriangle
      ) {
        platform.setPosition(200, -100);
      } else if (
        mask === collisionMasks.bottomLeftTriangle ||
        mask === collisionMasks.bottomRightTriangle
      ) {
        platform.setPosition(200, -200);
      }
      const platformBehavior = platform.getBehavior('Platform');

      it('can detect that the platform away upward', function () {
        character.setPosition(300, -210.1);
        checkNoFloor(behavior, platformBehavior, -10, 10);
      });

      it('can detect a floor to follow up', function () {
        character.setPosition(300, -210);
        checkMoveOn(behavior, platformBehavior, -10, 10);
        expect(character.getY()).to.be(-200);
      });

      it('can detect a floor when right on it', function () {
        character.setPosition(300, -200);
        checkMoveOn(behavior, platformBehavior, -10, 10);
        expect(character.getY()).to.be(-200);
      });

      it('can detect a floor to follow down', function () {
        character.setPosition(300, -190);
        checkMoveOn(behavior, platformBehavior, -10, 10);
        expect(character.getY()).to.be(-200);
      });

      it('can detect an obstacle a bit too high to follow', function () {
        character.setPosition(300, -189.9);
        checkObstacle(behavior, platformBehavior, -10, 10);
      });
    });
  });

  [
    {
      description: '(An edge crossing from the left to the right)',
      mask: collisionMasks.square,
    },
    {
      description: '(A vertex inside and edges crossing at the top)',
      mask: collisionMasks.topTriangle,
    },
    {
      description: '(An edge crossing from the left to the top)',
      mask: collisionMasks.topLeftTriangle,
    },
    {
      description: '(An edge crossing from the right to the top)',
      mask: collisionMasks.topRightTriangle,
    },
  ].forEach(({ description, mask }) => {
    describe(description, function () {
      const runtimeScene = makeTestRuntimeScene();
      const character = addCharacter(runtimeScene);
      const behavior = character.getBehavior('auto1');

      const platform = addPlatform(runtimeScene, mask);
      platform.setCustomWidthAndHeight(300, 300);
      if (
        mask === collisionMasks.square ||
        mask === collisionMasks.topTriangle
      ) {
        platform.setPosition(200, -100);
      } else if (
        mask === collisionMasks.topLeftTriangle ||
        mask === collisionMasks.topRightTriangle
      ) {
        platform.setPosition(200, 0);
      }
      const platformBehavior = platform.getBehavior('Platform');

      it.only('can detect an obstacle overlapping the top', function () {
        character.setPosition(300, 199.9);
        checkObstacle(behavior, platformBehavior, -10, 10);
      });

      it('can detect that the platform is away downward', function () {
        character.setPosition(300, 200);
        checkNoFloor(behavior, platformBehavior, -10, 10);
      });
    });
  });

  describe('(A vertex inside and edges crossing at the left)', function () {});

  describe('(A vertex inside and edges crossing at the right)', function () {});

  describe('(An platform with an hitbox under and another one above)', function () {});

  describe('(An platform with an hitbox on the left and another one on the right)', function () {});
});
