// @ts-check
describe('gdjs.evtTools.timeline', () => {
  const createScene = (timeDelta = 1000 / 60) => {
    const runtimeGame = gdjs.getPixiRuntimeGame();
    const runtimeScene = new gdjs.TestRuntimeScene(runtimeGame);
    runtimeScene._timeManager.getElapsedTime = () => timeDelta;
    return runtimeScene;
  };

  const createObject = (runtimeScene) => {
    const object = new gdjs.TestRuntimeObject(runtimeScene, {
      name: 'Hero',
      type: '',
      behaviors: [],
      variables: [],
      effects: [],
    });
    const scalableObject = /** @type {any} */ (object);
    scalableObject._scaleX = 1;
    scalableObject._scaleY = 1;
    scalableObject.setScaleX = (scale) => {
      scalableObject._scaleX = scale;
    };
    scalableObject.setScaleY = (scale) => {
      scalableObject._scaleY = scale;
    };
    scalableObject.getScaleX = () => scalableObject._scaleX;
    scalableObject.getScaleY = () => scalableObject._scaleY;
    runtimeScene.addObject(object);
    return scalableObject;
  };

  const timelineJson = JSON.stringify({
    timelines: [
      {
        name: 'Intro',
        duration: 1,
        tracks: [
          {
            type: 'object',
            target: {
              mode: 'objectName',
              objectName: 'Hero',
              selection: 'first',
            },
            propertyTracks: [
              {
                property: 'position',
                keyframes: [
                  { id: 'a', time: 0, value: { x: 0, y: 0 } },
                  {
                    id: 'b',
                    time: 1,
                    value: { x: 100, y: 50 },
                    ease: 'linear',
                  },
                ],
              },
              {
                property: 'angle',
                keyframes: [
                  { id: 'c', time: 0, value: 0 },
                  { id: 'd', time: 1, value: 90, ease: 'linear' },
                ],
              },
              {
                property: 'scale',
                keyframes: [
                  { id: 'e', time: 0, value: { x: 1, y: 1 } },
                  {
                    id: 'f',
                    time: 1,
                    value: { x: 2, y: 0.5 },
                    ease: 'linear',
                  },
                ],
              },
            ],
          },
        ],
        markers: [{ time: 0.5, name: 'Half' }],
      },
    ],
  });

  it('can play an object timeline', () => {
    const runtimeScene = createScene(500);
    const object = createObject(runtimeScene);

    gdjs.evtTools.timeline.registerTimelineJson(runtimeScene, timelineJson);
    gdjs.evtTools.timeline.playTimeline(runtimeScene, 'Intro');

    expect(object.getX()).to.be(0);
    expect(object.getY()).to.be(0);
    expect(object.getAngle()).to.be(0);
    expect(object.getScaleX()).to.be(1);
    expect(object.getScaleY()).to.be(1);
    expect(
      gdjs.evtTools.timeline.isTimelinePlaying(runtimeScene, 'Intro')
    ).to.be(true);

    runtimeScene.renderAndStep(500);

    expect(object.getX()).to.be(50);
    expect(object.getY()).to.be(25);
    expect(object.getAngle()).to.be(45);
    expect(object.getScaleX()).to.be(1.5);
    expect(object.getScaleY()).to.be(0.75);
    expect(gdjs.evtTools.timeline.getTimelineTime(runtimeScene, 'Intro')).to.be(
      0.5
    );
    expect(
      gdjs.evtTools.timeline.hasTimelineReachedMarker(
        runtimeScene,
        'Intro',
        'Half'
      )
    ).to.be(true);

    runtimeScene.renderAndStep(500);

    expect(object.getX()).to.be(100);
    expect(object.getY()).to.be(50);
    expect(object.getAngle()).to.be(90);
    expect(object.getScaleX()).to.be(2);
    expect(object.getScaleY()).to.be(0.5);
    expect(
      gdjs.evtTools.timeline.isTimelinePlaying(runtimeScene, 'Intro')
    ).to.be(false);
    expect(
      gdjs.evtTools.timeline.hasTimelineFinished(runtimeScene, 'Intro')
    ).to.be(true);
  });

  it('can seek a timeline', () => {
    const runtimeScene = createScene(500);
    const object = createObject(runtimeScene);

    gdjs.evtTools.timeline.registerTimelineJson(runtimeScene, timelineJson);
    gdjs.evtTools.timeline.seekTimeline(runtimeScene, 'Intro', 0.25);

    expect(object.getX()).to.be(25);
    expect(object.getY()).to.be(12.5);
    expect(object.getScaleX()).to.be(1.25);
    expect(object.getScaleY()).to.be(0.875);
    expect(
      gdjs.evtTools.timeline.getTimelineProgress(runtimeScene, 'Intro')
    ).to.be(0.25);
  });

  it('uses implicit initial values before the first visible keyframe', () => {
    const runtimeScene = createScene(500);
    const object = createObject(runtimeScene);

    gdjs.evtTools.timeline.registerTimelineJson(
      runtimeScene,
      JSON.stringify({
        timelines: [
          {
            name: 'ImplicitStart',
            duration: 1,
            tracks: [
              {
                type: 'object',
                target: {
                  mode: 'objectName',
                  objectName: 'Hero',
                  selection: 'first',
                },
                propertyTracks: [
                  {
                    property: 'x',
                    initialValue: 10,
                    keyframes: [{ id: 'x1', time: 1, value: 110 }],
                  },
                  {
                    property: 'y',
                    initialValue: 20,
                    keyframes: [],
                  },
                ],
              },
            ],
          },
        ],
      })
    );

    gdjs.evtTools.timeline.seekTimeline(runtimeScene, 'ImplicitStart', 0);
    expect(object.getX()).to.be(10);
    expect(object.getY()).to.be(20);

    gdjs.evtTools.timeline.seekTimeline(runtimeScene, 'ImplicitStart', 0.5);
    expect(object.getX()).to.be(60);
    expect(object.getY()).to.be(20);

    gdjs.evtTools.timeline.seekTimeline(runtimeScene, 'ImplicitStart', 1);
    expect(object.getX()).to.be(110);
    expect(object.getY()).to.be(20);
  });

  it('normalizes duplicate, near-duplicate and unordered keyframes before sampling', () => {
    const runtimeScene = createScene(500);
    const object = createObject(runtimeScene);

    gdjs.evtTools.timeline.registerTimelineJson(
      runtimeScene,
      JSON.stringify({
        timelines: [
          {
            name: 'MessyKeys',
            duration: 1,
            tracks: [
              {
                type: 'object',
                target: {
                  mode: 'objectName',
                  objectName: 'Hero',
                  selection: 'first',
                },
                propertyTracks: [
                  {
                    property: 'position',
                    keyframes: [
                      { time: 1, value: { x: 100, y: 0 } },
                      { time: 0, value: { x: 0, y: 0 } },
                      { time: 0.5, value: { x: 10, y: 0 } },
                      { time: 0.506, value: { x: 50, y: 0 } },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      })
    );

    gdjs.evtTools.timeline.seekTimeline(runtimeScene, 'MessyKeys', 0.5);
    expect(object.getX()).to.be(50);

    gdjs.evtTools.timeline.seekTimeline(runtimeScene, 'MessyKeys', 0.503);
    expect(object.getX()).to.be.within(50.2, 50.4);

    gdjs.evtTools.timeline.seekTimeline(runtimeScene, 'MessyKeys', 0.75);
    expect(object.getX()).to.be(75);
  });

  it('uses the current keyframe curve for the segment to the next keyframe', () => {
    const runtimeScene = createScene(500);
    const object = createObject(runtimeScene);

    gdjs.evtTools.timeline.registerTimelineJson(
      runtimeScene,
      JSON.stringify({
        timelines: [
          {
            name: 'BezierCurve',
            duration: 1,
            tracks: [
              {
                type: 'object',
                target: {
                  mode: 'objectName',
                  objectName: 'Hero',
                  selection: 'first',
                },
                propertyTracks: [
                  {
                    property: 'position',
                    keyframes: [
                      {
                        time: 0,
                        value: { x: 0, y: 0 },
                        curve: [0, 1, 1, 1],
                      },
                      {
                        time: 1,
                        value: { x: 100, y: 0 },
                        curve: [0, 0, 1, 0],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      })
    );

    gdjs.evtTools.timeline.seekTimeline(runtimeScene, 'BezierCurve', 0.5);

    expect(object.getX()).to.be.within(87.4, 87.6);
  });

  it('keeps values stepped when the current keyframe curve is stepped', () => {
    const runtimeScene = createScene(500);
    const object = createObject(runtimeScene);

    gdjs.evtTools.timeline.registerTimelineJson(
      runtimeScene,
      JSON.stringify({
        timelines: [
          {
            name: 'SteppedCurve',
            duration: 1,
            tracks: [
              {
                type: 'object',
                target: {
                  mode: 'objectName',
                  objectName: 'Hero',
                  selection: 'first',
                },
                propertyTracks: [
                  {
                    property: 'position',
                    keyframes: [
                      {
                        time: 0,
                        value: { x: 0, y: 0 },
                        curve: 'stepped',
                      },
                      { time: 1, value: { x: 100, y: 0 } },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      })
    );

    gdjs.evtTools.timeline.seekTimeline(runtimeScene, 'SteppedCurve', 0.5);
    expect(object.getX()).to.be(0);

    gdjs.evtTools.timeline.seekTimeline(runtimeScene, 'SteppedCurve', 1);
    expect(object.getX()).to.be(100);
  });

  it('falls back to object name when a scene instance uuid is not available at runtime', () => {
    const runtimeScene = createScene(500);
    const object = createObject(runtimeScene);

    gdjs.evtTools.timeline.registerTimelineJson(
      runtimeScene,
      JSON.stringify({
        timelines: [
          {
            name: 'SceneInstanceFallback',
            duration: 1,
            tracks: [
              {
                type: 'object',
                target: {
                  mode: 'sceneInstance',
                  objectName: 'Hero',
                  instancePersistentUuid: 'stale-or-missing-uuid',
                  selection: 'first',
                },
                propertyTracks: [
                  {
                    property: 'position',
                    keyframes: [
                      { time: 0, value: { x: 0, y: 0 } },
                      { time: 1, value: { x: 300, y: 120 } },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      })
    );

    gdjs.evtTools.timeline.seekTimeline(
      runtimeScene,
      'SceneInstanceFallback',
      1
    );

    expect(object.getX()).to.be(300);
    expect(object.getY()).to.be(120);
  });

  it('can apply sprite, text and video style object properties', () => {
    const runtimeScene = createScene(500);
    const object = createObject(runtimeScene);
    object._animationIndex = 0;
    object._animationFrame = 0;
    object._animationSpeedScale = 1;
    object._characterSize = 20;
    object._lineHeight = 1;
    object._volume = 100;
    object._playbackSpeed = 1;
    object._currentTime = 0;
    object.setAnimationIndex = (value) => {
      object._animationIndex = value;
    };
    object.getAnimationIndex = () => object._animationIndex;
    object.setAnimationFrame = (value) => {
      object._animationFrame = value;
    };
    object.getAnimationFrame = () => object._animationFrame;
    object.setAnimationSpeedScale = (value) => {
      object._animationSpeedScale = value;
    };
    object.getAnimationSpeedScale = () => object._animationSpeedScale;
    object.setCharacterSize = (value) => {
      object._characterSize = value;
    };
    object.getCharacterSize = () => object._characterSize;
    object.setLineHeight = (value) => {
      object._lineHeight = value;
    };
    object.getLineHeight = () => object._lineHeight;
    object.setVolume = (value) => {
      object._volume = value;
    };
    object.getVolume = () => object._volume;
    object.setPlaybackSpeed = (value) => {
      object._playbackSpeed = value;
    };
    object.getPlaybackSpeed = () => object._playbackSpeed;
    object.setCurrentTime = (value) => {
      object._currentTime = value;
    };
    object.getCurrentTime = () => object._currentTime;

    gdjs.evtTools.timeline.registerTimelineJson(
      runtimeScene,
      JSON.stringify({
        timelines: [
          {
            name: 'ObjectProperties',
            duration: 1,
            tracks: [
              {
                type: 'object',
                target: {
                  mode: 'objectName',
                  objectName: 'Hero',
                  selection: 'first',
                },
                propertyTracks: [
                  {
                    property: 'animationIndex',
                    keyframes: [
                      { time: 0, value: 0 },
                      { time: 1, value: 2 },
                    ],
                  },
                  {
                    property: 'animationFrame',
                    keyframes: [
                      { time: 0, value: 0 },
                      { time: 1, value: 3 },
                    ],
                  },
                  {
                    property: 'animationSpeedScale',
                    keyframes: [
                      { time: 0, value: 1 },
                      { time: 1, value: 1.5 },
                    ],
                  },
                  {
                    property: 'characterSize',
                    keyframes: [
                      { time: 0, value: 20 },
                      { time: 1, value: 42 },
                    ],
                  },
                  {
                    property: 'lineHeight',
                    keyframes: [
                      { time: 0, value: 1 },
                      { time: 1, value: 1.2 },
                    ],
                  },
                  {
                    property: 'volume',
                    keyframes: [
                      { time: 0, value: 100 },
                      { time: 1, value: 40 },
                    ],
                  },
                  {
                    property: 'playbackSpeed',
                    keyframes: [
                      { time: 0, value: 1 },
                      { time: 1, value: 1.75 },
                    ],
                  },
                  {
                    property: 'currentTime',
                    keyframes: [
                      { time: 0, value: 0 },
                      { time: 1, value: 5 },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      })
    );

    gdjs.evtTools.timeline.seekTimeline(runtimeScene, 'ObjectProperties', 1);

    expect(object._animationIndex).to.be(2);
    expect(object._animationFrame).to.be(3);
    expect(object._animationSpeedScale).to.be(1.5);
    expect(object._characterSize).to.be(42);
    expect(object._lineHeight).to.be(1.2);
    expect(object._volume).to.be(40);
    expect(object._playbackSpeed).to.be(1.75);
    expect(object._currentTime).to.be(5);
  });

  it('smoothly interpolates sprite animation frames between sparse keyframes', () => {
    const runtimeScene = createScene(500);
    const object = createObject(runtimeScene);
    object._animationFrame = 0;
    object.setAnimationFrame = (value) => {
      object._animationFrame = value;
    };
    object.getAnimationFrame = () => object._animationFrame;

    gdjs.evtTools.timeline.registerTimelineJson(
      runtimeScene,
      JSON.stringify({
        timelines: [
          {
            name: 'AnimationFrameStep',
            duration: 1,
            tracks: [
              {
                type: 'object',
                target: {
                  mode: 'objectName',
                  objectName: 'Hero',
                  selection: 'first',
                },
                propertyTracks: [
                  {
                    property: 'animationFrame',
                    keyframes: [
                      { time: 0, value: 0 },
                      { time: 1, value: 10 },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      })
    );

    gdjs.evtTools.timeline.seekTimeline(
      runtimeScene,
      'AnimationFrameStep',
      0.5
    );
    expect(object._animationFrame).to.be(5);

    gdjs.evtTools.timeline.seekTimeline(runtimeScene, 'AnimationFrameStep', 1);
    expect(object._animationFrame).to.be(10);
  });

  it('can apply animation tracks to objects exposing the legacy sprite animation API', () => {
    const runtimeScene = createScene(500);
    const object = createObject(runtimeScene);
    delete object.setAnimationIndex;
    delete object.getAnimationIndex;
    object._animation = 0;
    object.setAnimation = (value) => {
      object._animation = value;
    };
    object.getAnimation = () => object._animation;

    gdjs.evtTools.timeline.registerTimelineJson(
      runtimeScene,
      JSON.stringify({
        timelines: [
          {
            name: 'LegacySpriteAnimation',
            duration: 1,
            tracks: [
              {
                type: 'object',
                target: {
                  mode: 'objectName',
                  objectName: 'Hero',
                  selection: 'first',
                },
                propertyTracks: [
                  {
                    property: 'animationIndex',
                    keyframes: [
                      { time: 0, value: 0 },
                      { time: 1, value: 4 },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      })
    );

    gdjs.evtTools.timeline.seekTimeline(
      runtimeScene,
      'LegacySpriteAnimation',
      1
    );

    expect(object._animation).to.be(4);
  });

  it('can pause and resume a timeline', () => {
    const runtimeScene = createScene(250);
    const object = createObject(runtimeScene);

    gdjs.evtTools.timeline.registerTimelineJson(runtimeScene, timelineJson);
    gdjs.evtTools.timeline.playTimeline(runtimeScene, 'Intro');
    runtimeScene.renderAndStep(250);

    expect(object.getX()).to.be(25);

    gdjs.evtTools.timeline.pauseTimeline(runtimeScene, 'Intro');
    expect(
      gdjs.evtTools.timeline.isTimelinePaused(runtimeScene, 'Intro')
    ).to.be(true);
    runtimeScene.renderAndStep(250);
    expect(object.getX()).to.be(25);

    gdjs.evtTools.timeline.resumeTimeline(runtimeScene, 'Intro');
    runtimeScene.renderAndStep(250);
    expect(object.getX()).to.be(50);
  });

  it('can loop a timeline', () => {
    const runtimeScene = createScene(1250);
    const object = createObject(runtimeScene);

    gdjs.evtTools.timeline.registerTimelineJson(runtimeScene, timelineJson);
    gdjs.evtTools.timeline.setTimelineLoop(runtimeScene, 'Intro', true);
    gdjs.evtTools.timeline.playTimeline(runtimeScene, 'Intro');
    runtimeScene.renderAndStep(1250);

    expect(
      gdjs.evtTools.timeline.isTimelinePlaying(runtimeScene, 'Intro')
    ).to.be(true);
    expect(gdjs.evtTools.timeline.getTimelineTime(runtimeScene, 'Intro')).to.be(
      0.25
    );
    expect(object.getX()).to.be(25);
  });
});
