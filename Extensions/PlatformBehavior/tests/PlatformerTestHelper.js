
  const makePlatformerTestRuntimeScene = (timeDelta = 1000 / 60) => {
    const runtimeGame = gdjs.getPixiRuntimeGame();
    const runtimeScene = new gdjs.TestRuntimeScene(runtimeGame);
    runtimeScene.loadFromScene({
      layers: [{ name: '', visibility: true, effects: [] }],
      variables: [],
      behaviorsSharedData: [],
      objects: [],
      instances: [],
    });
    runtimeScene._timeManager.getElapsedTime = function () {
      return timeDelta;
    };
    return runtimeScene;
  };

  const addPlatformObject = (runtimeScene) => {
    const platform = new gdjs.TestRuntimeObject(runtimeScene, {
      name: 'obj2',
      type: '',
      behaviors: [
        {
          type: 'PlatformBehavior::PlatformBehavior',
          name: 'Platform',
          canBeGrabbed: true,
        },
      ],
      effects: [],
    });
    platform.setCustomWidthAndHeight(60, 32);
    runtimeScene.addObject(platform);

    return platform;
  };

  const addUpSlopePlatformObject = (runtimeScene) => {
    const platform = new gdjs.TestSpriteRuntimeObject(runtimeScene, {
      name: 'slope',
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
                  customCollisionMask: [
                    [
                      { x: 100, y: 100 },
                      { x: 0, y: 100 },
                      { x: 100, y: 0 },
                    ],
                  ],
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

  const addDownSlopePlatformObject = (runtimeScene) => {
    const platform = new gdjs.TestSpriteRuntimeObject(runtimeScene, {
      name: 'slope',
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
                  customCollisionMask: [
                    [
                      { x: 100, y: 100 },
                      { x: 0, y: 100 },
                      { x: 0, y: 0 },
                    ],
                  ],
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

  const addTunnelPlatformObject = (runtimeScene) => {
    const platform = new gdjs.TestSpriteRuntimeObject(runtimeScene, {
      name: 'tunnel',
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
                  customCollisionMask: [
                    [
                      { x: 0, y: 0 },
                      { x: 0, y: 100 },
                      { x: 100, y: 100 },
                      { x: 100, y: 0 },
                    ],
                    [
                      { x: 0, y: 200 },
                      { x: 0, y: 300 },
                      { x: 100, y: 300 },
                      { x: 100, y: 200 },
                    ],
                  ],
                },
              ],
            },
          ],
        },
      ],
    });
    runtimeScene.addObject(platform);
    platform.setUnscaledWidthAndHeight(100, 300);
    platform.setCustomWidthAndHeight(100, 300);

    return platform;
  };

  /**
   * @returns A platform with 2 hitboxes that can act as a floor and a wall at
   * the same time.
   * It can happen when a tile map collision mask object is used because all
   * the platforms are part of the same object instance.
   */
  const addFloorAndWallPlatformObject = (runtimeScene) => {
    const platform = new gdjs.TestSpriteRuntimeObject(runtimeScene, {
      name: 'elbow',
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
                    { name: 'Origin', x: 0, y: 0 },
                    { name: 'Center', x: 50, y: 50 },
                  ],
                  hasCustomCollisionMask: true,
                  customCollisionMask: [
                    // Wall
                    [
                      { x: 80, y: 0 },
                      { x: 80, y: 100 },
                      { x: 100, y: 100 },
                      { x: 100, y: 0 },
                    ],
                    // Floor
                    [
                      { x: 0, y: 80 },
                      { x: 0, y: 100 },
                      { x: 100, y: 100 },
                      { x: 100, y: 80 },
                    ],
                  ],
                },
              ],
            },
          ],
        },
      ],
    });
    runtimeScene.addObject(platform);
    platform.setUnscaledWidthAndHeight(100, 300);
    platform.setCustomWidthAndHeight(100, 300);

    return platform;
  };

  const addJumpThroughPlatformObject = (runtimeScene) => {
    const platform = new gdjs.TestRuntimeObject(runtimeScene, {
      name: 'obj2',
      type: '',
      behaviors: [
        {
          type: 'PlatformBehavior::PlatformBehavior',
          name: 'Platform',
          platformType: 'Jumpthru',
          canBeGrabbed: false,
        },
      ],
      effects: [],
    });
    platform.setCustomWidthAndHeight(60, 32);
    runtimeScene.addObject(platform);

    return platform;
  };

  const addLadderObject = (runtimeScene) => {
    const ladder = new gdjs.TestRuntimeObject(runtimeScene, {
      name: 'obj3',
      type: '',
      behaviors: [
        {
          type: 'PlatformBehavior::PlatformBehavior',
          name: 'Platform',
          canBeGrabbed: false,
          platformType: 'Ladder',
        },
      ],
      effects: [],
    });
    ladder.setCustomWidthAndHeight(20, 60);
    runtimeScene.addObject(ladder);

    return ladder;
  };