
  const makePlatformerTestRuntimeScene = (timeDelta = 1000 / 60) => {
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