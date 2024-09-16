// @ts-check
/**
 * Tests for gdjs.HotReloader and related.
 */

describe('gdjs.HotReloader.deepEqual', () => {
  it('compares object, arrays, and primitives', () => {
    expect(gdjs.HotReloader.deepEqual('a', 'a')).to.be(true);
    expect(gdjs.HotReloader.deepEqual('a', 'b')).to.be(false);

    expect(gdjs.HotReloader.deepEqual(1, 1)).to.be(true);
    expect(gdjs.HotReloader.deepEqual(1, 2)).to.be(false);

    expect(gdjs.HotReloader.deepEqual(true, true)).to.be(true);
    expect(gdjs.HotReloader.deepEqual(true, false)).to.be(false);

    expect(gdjs.HotReloader.deepEqual({ a: 1 }, { a: 1 })).to.be(true);
    expect(gdjs.HotReloader.deepEqual({ a: 1, b: 2 }, { a: 1, b: 2 })).to.be(
      true
    );
    expect(gdjs.HotReloader.deepEqual({ a: 1 }, { a: 2 })).to.be(false);
    expect(gdjs.HotReloader.deepEqual({ a: 1 }, { b: 2 })).to.be(false);
    expect(gdjs.HotReloader.deepEqual({ a: 1 }, { a: 1, b: 2 })).to.be(false);
    expect(gdjs.HotReloader.deepEqual({ a: 1, b: 2 }, { a: 1 })).to.be(false);

    expect(gdjs.HotReloader.deepEqual([1], [1])).to.be(true);
    expect(gdjs.HotReloader.deepEqual([1, 2], [1, 2])).to.be(true);
    expect(gdjs.HotReloader.deepEqual([1, { a: 1 }], [1, { a: 1 }])).to.be(
      true
    );
    expect(gdjs.HotReloader.deepEqual([1], [2])).to.be(false);
    expect(gdjs.HotReloader.deepEqual([1, 2], [2])).to.be(false);
    expect(gdjs.HotReloader.deepEqual([1, { a: 1 }], [1, { a: 2 }])).to.be(
      false
    );
  });
});

describe('gdjs.HotReloader._hotReloadRuntimeGame', () => {
  /**
   * Create and return a minimum working game.
   * @internal
   * @param {{layouts?: LayoutData[], eventsBasedObjects?: EventsBasedObjectData[], resources?: ResourcesData, propertiesOverrides?: Partial<ProjectPropertiesData>}} data
   * @returns {ProjectData}
   */
  const createProjectData = (data) => {
    const project = gdjs.createProjectData(data);
    project.eventsFunctionsExtensions.push({
      name: 'MyExtension',
      eventsBasedObjects: data.eventsBasedObjects || [],
      globalVariables: [],
      sceneVariables: [],
    });
    return project;
  };

  /** @type {InstanceData} */
  const defaultInstance = {
    persistentUuid: '',
    layer: '',
    locked: false,
    name: 'MyObject',
    x: 0,
    y: 0,
    angle: 0,
    zOrder: 0,
    customSize: false,
    width: 0,
    height: 0,
    numberProperties: [],
    stringProperties: [],
    initialVariables: [],
  };

  /** @type {InstanceData} */
  const defaultChildInstance = {
    persistentUuid: '',
    layer: '',
    locked: false,
    name: 'MyChildObject',
    x: 0,
    y: 0,
    angle: 0,
    zOrder: 0,
    customSize: false,
    width: 0,
    height: 0,
    numberProperties: [],
    stringProperties: [],
    initialVariables: [],
  };

  /** @type {ObjectData & gdjs.CustomObjectConfiguration} */
  const defaultCustomObject = {
    type: 'MyExtension::MyCustomObject',
    name: 'MyCustomObject',
    behaviors: [],
    variables: [],
    effects: [],
    content: {},
    childrenContent: {},
  };

  /** @type {LayerData} */
  const baseLayer = {
    name: '',
    visibility: true,
    cameras: [],
    effects: [],
    ambientLightColorR: 127,
    ambientLightColorB: 127,
    ambientLightColorG: 127,
    isLightingLayer: false,
    followBaseLayerCamera: false,
  };

  /**
   * Create and return a minimum working sprite object data.
   * @internal
   * @param {{name: string, image?: string, variables?: Array<RootVariableData>}} data
   * @returns {gdjs.SpriteObjectData}
   */
  const createSpriteData = ({ name, image, variables }) => {
    return {
      type: 'Sprite',
      name,
      behaviors: [],
      variables: variables || [],
      effects: [],
      animations: [
        {
          name: 'animation',
          directions: [
            {
              sprites: [
                {
                  originPoint: { name: 'Origin', x: 0, y: 0 },
                  centerPoint: {
                    name: 'Center',
                    x: 0,
                    y: 0,
                    automatic: true,
                  },
                  points: [],
                  hasCustomCollisionMask: false,
                  customCollisionMask: [],
                  image: image === undefined ? 'MyImageResource' : image,
                },
              ],
              timeBetweenFrames: 0,
              looping: false,
            },
          ],
          useMultipleDirections: false,
        },
      ],
      updateIfNotVisible: false,
    };
  };

  /**
   * Create and return a minimum working scene data.
   * @internal
   * @param {{instances?: Partial<InstanceData>[], objects?: ObjectData[]}} data
   * @returns {LayoutData}
   */
  const createSceneData = ({ instances, objects }) => {
    return {
      layers: [baseLayer],
      variables: [],
      r: 0,
      v: 0,
      b: 0,
      mangledName: 'Scene1',
      name: 'Scene1',
      stopSoundsOnStartup: false,
      title: '',
      behaviorsSharedData: [],
      objects: objects || [
        createSpriteData({ name: 'MyObject', image: 'ResourceA' }),
      ],
      instances: instances
        ? instances.map((instance) => ({ ...defaultInstance, ...instance }))
        : [],
      usedResources: [],
    };
  };

  /**
   * Create and return a minimum working events-based object data.
   * @internal
   * @param {{name: string, instances?: Partial<InstanceData>[], objects?: ObjectData[]}} data
   * @returns {EventsBasedObjectData}
   */
  const createEventsBasedObjectData = ({ name, instances, objects }) => {
    return {
      name,
      variables: [],
      instances: instances
        ? instances.map((instance) => ({
            ...defaultChildInstance,
            ...instance,
          }))
        : [],
      objects: objects || [
        createSpriteData({ name: 'MyChildObject', image: 'ResourceA' }),
      ],
      layers: [baseLayer],
      areaMinX: 0,
      areaMinY: 0,
      areaMinZ: 0,
      areaMaxX: 0,
      areaMaxY: 0,
      areaMaxZ: 0,
      _initialInnerArea: null,
      isInnerAreaFollowingParentSize: false,
    };
  };

  /**
   * @internal
   * @param {gdjs.RuntimeObject} instance
   * @returns {string | null}
   */
  const getSpriteCurrentFrameImage = (instance) => {
    if (!(instance instanceof gdjs.SpriteRuntimeObject)) {
      throw new Error("Couldn't instantiate a sprite for testing.");
    }
    const currentFrame = instance._animator.getCurrentFrame();
    return currentFrame ? currentFrame.image : null;
  };

  it('can move instances of a scene at hot-reload', async () => {
    const oldProjectData = createProjectData({
      layouts: [
        createSceneData({
          instances: [
            { persistentUuid: '1', x: 111, y: 123 },
            { persistentUuid: '2', x: 222, y: 234 },
          ],
        }),
      ],
    });
    const runtimeGame = new gdjs.RuntimeGame(oldProjectData);
    const hotReloader = new gdjs.HotReloader(runtimeGame);
    await runtimeGame.loadFirstAssetsAndStartBackgroundLoading(
      'Scene1',
      () => {}
    );
    runtimeGame._sceneStack.push('Scene1');
    const scene = runtimeGame.getSceneStack().getCurrentScene();
    if (!scene) throw new Error("Couldn't set a current scene for testing.");

    const newProjectData = createProjectData({
      layouts: [
        createSceneData({
          instances: [
            { persistentUuid: '1', x: 555, y: 678 },
            { persistentUuid: '2', x: 222, y: 234 },
          ],
        }),
      ],
    });

    await hotReloader._hotReloadRuntimeGame(
      oldProjectData,
      newProjectData,
      [],
      runtimeGame
    );

    const instances = scene.getInstancesOf('MyObject');
    expect(instances.length).to.be(2);
    expect(instances[0].getX()).to.be(555);
    expect(instances[0].getY()).to.be(678);
    expect(instances[1].getX()).to.be(222);
    expect(instances[1].getY()).to.be(234);
  });

  it('can change the image of a sprite object of a scene at hot-reload', async () => {
    const oldProjectData = createProjectData({
      layouts: [
        createSceneData({
          instances: [{ persistentUuid: '1' }, { persistentUuid: '2' }],
          objects: [createSpriteData({ name: 'MyObject', image: 'ResourceA' })],
        }),
      ],
    });
    const runtimeGame = new gdjs.RuntimeGame(oldProjectData);
    const hotReloader = new gdjs.HotReloader(runtimeGame);
    await runtimeGame.loadFirstAssetsAndStartBackgroundLoading(
      'Scene1',
      () => {}
    );
    runtimeGame._sceneStack.push('Scene1');
    const scene = runtimeGame.getSceneStack().getCurrentScene();
    if (!scene) throw new Error("Couldn't set a current scene for testing.");

    const newProjectData = createProjectData({
      layouts: [
        createSceneData({
          instances: [{ persistentUuid: '1' }, { persistentUuid: '2' }],
          objects: [createSpriteData({ name: 'MyObject', image: 'ResourceB' })],
        }),
      ],
    });

    await hotReloader._hotReloadRuntimeGame(
      oldProjectData,
      newProjectData,
      [],
      runtimeGame
    );

    const instances = scene.getInstancesOf('MyObject');
    expect(instances.length).to.be(2);
    expect(getSpriteCurrentFrameImage(instances[0])).to.be('ResourceB');
    expect(getSpriteCurrentFrameImage(instances[1])).to.be('ResourceB');
  });

  it('can move instances inside a custom object at hot-reload', async () => {
    const oldProjectData = createProjectData({
      layouts: [
        createSceneData({
          instances: [{ persistentUuid: '1', name: 'MyCustomObject' }],
          objects: [defaultCustomObject],
        }),
      ],
      eventsBasedObjects: [
        createEventsBasedObjectData({
          name: 'MyCustomObject',
          instances: [
            { persistentUuid: '11', x: 111, y: 123 },
            { persistentUuid: '12', x: 222, y: 234 },
          ],
        }),
      ],
    });
    const runtimeGame = new gdjs.RuntimeGame(oldProjectData);
    const hotReloader = new gdjs.HotReloader(runtimeGame);
    await runtimeGame.loadFirstAssetsAndStartBackgroundLoading(
      'Scene1',
      () => {}
    );
    runtimeGame._sceneStack.push('Scene1');
    const scene = runtimeGame.getSceneStack().getCurrentScene();
    if (!scene) throw new Error("Couldn't set a current scene for testing.");

    const newProjectData = createProjectData({
      layouts: [
        createSceneData({
          instances: [{ persistentUuid: '1', name: 'MyCustomObject' }],
          objects: [defaultCustomObject],
        }),
      ],
      eventsBasedObjects: [
        createEventsBasedObjectData({
          name: 'MyCustomObject',
          instances: [
            { persistentUuid: '11', x: 555, y: 678 },
            { persistentUuid: '12', x: 222, y: 234 },
          ],
        }),
      ],
    });

    await hotReloader._hotReloadRuntimeGame(
      oldProjectData,
      newProjectData,
      [],
      runtimeGame
    );

    const sceneInstances = scene.getInstancesOf('MyCustomObject');
    expect(sceneInstances.length).to.be(1);
    const customObject = sceneInstances[0];
    if (!(customObject instanceof gdjs.CustomRuntimeObject)) {
      throw new Error("Couldn't instantiate a custom object for testing.");
    }
    const instances = customObject
      .getChildrenContainer()
      .getInstancesOf('MyChildObject');
    expect(instances.length).to.be(2);
    expect(instances[0].getX()).to.be(555);
    expect(instances[0].getY()).to.be(678);
    expect(instances[1].getX()).to.be(222);
    expect(instances[1].getY()).to.be(234);
  });

  it('can change the image of a sprite object inside a custom object at hot-reload', async () => {
    const oldProjectData = createProjectData({
      layouts: [
        createSceneData({
          instances: [{ persistentUuid: '1', name: 'MyCustomObject' }],
          objects: [defaultCustomObject],
        }),
      ],
      eventsBasedObjects: [
        createEventsBasedObjectData({
          name: 'MyCustomObject',
          instances: [{ persistentUuid: '11' }, { persistentUuid: '12' }],
          objects: [
            createSpriteData({ name: 'MyChildObject', image: 'ResourceA' }),
          ],
        }),
      ],
    });
    const runtimeGame = new gdjs.RuntimeGame(oldProjectData);
    const hotReloader = new gdjs.HotReloader(runtimeGame);
    await runtimeGame.loadFirstAssetsAndStartBackgroundLoading(
      'Scene1',
      () => {}
    );
    runtimeGame._sceneStack.push('Scene1');
    const scene = runtimeGame.getSceneStack().getCurrentScene();
    if (!scene) throw new Error("Couldn't set a current scene for testing.");

    const newProjectData = createProjectData({
      layouts: [
        createSceneData({
          instances: [{ persistentUuid: '1', name: 'MyCustomObject' }],
          objects: [defaultCustomObject],
        }),
      ],
      eventsBasedObjects: [
        createEventsBasedObjectData({
          name: 'MyCustomObject',
          instances: [{ persistentUuid: '11' }, { persistentUuid: '12' }],
          objects: [
            createSpriteData({ name: 'MyChildObject', image: 'ResourceB' }),
          ],
        }),
      ],
    });

    await hotReloader._hotReloadRuntimeGame(
      oldProjectData,
      newProjectData,
      [],
      runtimeGame
    );

    const sceneInstances = scene.getInstancesOf('MyCustomObject');
    expect(sceneInstances.length).to.be(1);
    const customObject = sceneInstances[0];
    if (!(customObject instanceof gdjs.CustomRuntimeObject)) {
      throw new Error("Couldn't instantiate a custom object for testing.");
    }
    const instances = customObject
      .getChildrenContainer()
      .getInstancesOf('MyChildObject');
    expect(instances.length).to.be(2);
    expect(getSpriteCurrentFrameImage(instances[0])).to.be('ResourceB');
    expect(getSpriteCurrentFrameImage(instances[1])).to.be('ResourceB');
  });

  it('can change variable values of initial instances at hot-reload', async () => {
    const oldProjectData = createProjectData({
      layouts: [
        createSceneData({
          instances: [{ persistentUuid: '1' }],
          objects: [
            createSpriteData({
              name: 'MyObject',
              variables: [
                {
                  name: 'MyVariable1',
                  value: '123',
                  type: 'number',
                },
                {
                  name: 'MyVariable2',
                  value: '456',
                  type: 'number',
                },
              ],
            }),
          ],
        }),
      ],
    });
    const runtimeGame = new gdjs.RuntimeGame(oldProjectData);
    const hotReloader = new gdjs.HotReloader(runtimeGame);
    await runtimeGame.loadFirstAssetsAndStartBackgroundLoading(
      'Scene1',
      () => {}
    );
    runtimeGame._sceneStack.push('Scene1');
    const scene = runtimeGame.getSceneStack().getCurrentScene();
    if (!scene) throw new Error("Couldn't set a current scene for testing.");

    const instances = scene.getInstancesOf('MyObject');
    expect(instances.length).to.be(1);
    const variablesContainer = instances[0].getVariables();
    // The variable values are changed by events.
    variablesContainer.get('MyVariable1').setNumber(111);
    variablesContainer.get('MyVariable2').setNumber(222);

    const newProjectData = createProjectData({
      layouts: [
        createSceneData({
          instances: [{ persistentUuid: '1' }],
          objects: [
            createSpriteData({
              name: 'MyObject',
              variables: [
                {
                  name: 'MyVariable1',
                  value: '123',
                  type: 'number',
                },
                {
                  name: 'MyVariable2',
                  value: '789',
                  type: 'number',
                },
              ],
            }),
          ],
        }),
      ],
    });

    await hotReloader._hotReloadRuntimeGame(
      oldProjectData,
      newProjectData,
      [],
      runtimeGame
    );

    // The current value is kept.
    expect(variablesContainer.has('MyVariable1')).to.be(true);
    expect(variablesContainer.get('MyVariable1').getAsNumber()).to.be(111);
    expect(variablesContainer.getFromIndex(0).getAsNumber()).to.be(111);
    // The current value is overridden.
    expect(variablesContainer.has('MyVariable2')).to.be(true);
    expect(variablesContainer.get('MyVariable2').getAsNumber()).to.be(789);
    expect(variablesContainer.getFromIndex(1).getAsNumber()).to.be(789);
  });

  it('can change variable values of instances created at runtime at hot-reload', async () => {
    const oldProjectData = createProjectData({
      layouts: [
        createSceneData({
          instances: [],
          objects: [
            createSpriteData({
              name: 'MyObject',
              variables: [
                {
                  name: 'MyVariable1',
                  value: '123',
                  type: 'number',
                },
                {
                  name: 'MyVariable2',
                  value: '456',
                  type: 'number',
                },
              ],
            }),
          ],
        }),
      ],
    });
    const runtimeGame = new gdjs.RuntimeGame(oldProjectData);
    const hotReloader = new gdjs.HotReloader(runtimeGame);
    await runtimeGame.loadFirstAssetsAndStartBackgroundLoading(
      'Scene1',
      () => {}
    );
    runtimeGame._sceneStack.push('Scene1');
    const scene = runtimeGame.getSceneStack().getCurrentScene();
    if (!scene) throw new Error("Couldn't set a current scene for testing.");

    const instance = scene.createObject('MyObject');
    if (!instance) {
      throw new Error("Couldn't create an object instance for testing.");
    }
    const variablesContainer = instance.getVariables();
    // The variable values are changed by events.
    variablesContainer.get('MyVariable1').setNumber(111);
    variablesContainer.get('MyVariable2').setNumber(222);

    const newProjectData = createProjectData({
      layouts: [
        createSceneData({
          instances: [],
          objects: [
            createSpriteData({
              name: 'MyObject',
              variables: [
                {
                  name: 'MyVariable1',
                  value: '123',
                  type: 'number',
                },
                {
                  name: 'MyVariable2',
                  value: '789',
                  type: 'number',
                },
              ],
            }),
          ],
        }),
      ],
    });

    await hotReloader._hotReloadRuntimeGame(
      oldProjectData,
      newProjectData,
      [],
      runtimeGame
    );

    // The current value is kept.
    expect(variablesContainer.has('MyVariable1')).to.be(true);
    expect(variablesContainer.get('MyVariable1').getAsNumber()).to.be(111);
    expect(variablesContainer.getFromIndex(0).getAsNumber()).to.be(111);
    // The current value is overridden.
    expect(variablesContainer.has('MyVariable2')).to.be(true);
    expect(variablesContainer.get('MyVariable2').getAsNumber()).to.be(789);
    expect(variablesContainer.getFromIndex(1).getAsNumber()).to.be(789);
  });
});

describe('gdjs.HotReloader._hotReloadVariablesContainer', () => {
  /**
   * When `current` is not set `oldInit` is used instead.
   * It's as if the hot-reload happened before any variable has been changed by events.
   * @param {{oldInit: RootVariableData[], current?: RootVariableData[], newInit: RootVariableData[]}} parameters
   * @returns {gdjs.VariablesContainer}
   */
  const hotReloadVariablesContainer = ({ oldInit, current, newInit }) => {
    const runtimeGame = gdjs.getPixiRuntimeGame();
    const hotReloader = new gdjs.HotReloader(runtimeGame);
    const variablesContainer = new gdjs.VariablesContainer([]);
    variablesContainer.initFrom(current || oldInit);
    hotReloader._hotReloadVariablesContainer(
      oldInit,
      newInit,
      variablesContainer
    );
    return variablesContainer;
  };

  it('can modify a variable at hot-reload', () => {
    const variablesContainer = hotReloadVariablesContainer({
      oldInit: [
        {
          name: 'MyVariable1',
          value: '123',
          type: 'number',
        },
        {
          name: 'MyVariable2',
          value: '456',
          type: 'number',
        },
      ],
      // The variable values have been changed by events.
      current: [
        {
          name: 'MyVariable1',
          value: '111',
          type: 'number',
        },
        {
          name: 'MyVariable2',
          value: '222',
          type: 'number',
        },
      ],
      newInit: [
        // It's the same initial value as before.
        {
          name: 'MyVariable1',
          value: '123',
          type: 'number',
        },
        // The initial value has changed.
        {
          name: 'MyVariable2',
          value: '789',
          type: 'number',
        },
      ],
    });
    // The current value is kept.
    expect(variablesContainer.has('MyVariable1')).to.be(true);
    expect(variablesContainer.get('MyVariable1').getAsNumber()).to.be(111);
    expect(variablesContainer.getFromIndex(0).getAsNumber()).to.be(111);
    // The current value is overridden.
    expect(variablesContainer.has('MyVariable2')).to.be(true);
    expect(variablesContainer.get('MyVariable2').getAsNumber()).to.be(789);
    expect(variablesContainer.getFromIndex(1).getAsNumber()).to.be(789);
  });

  // In the following cases, current === oldInit.

  it('can add a variable at hot-reload', () => {
    const variablesContainer = hotReloadVariablesContainer({
      oldInit: [],
      newInit: [
        {
          name: 'MyVariable',
          value: '123',
          type: 'number',
        },
      ],
    });
    expect(variablesContainer.has('MyVariable')).to.be(true);
    expect(variablesContainer.get('MyVariable').getAsNumber()).to.be(123);
    expect(variablesContainer.getFromIndex(0).getAsNumber()).to.be(123);
  });

  it('can add a variable before another one at hot-reload', () => {
    const variablesContainer = hotReloadVariablesContainer({
      oldInit: [
        {
          name: 'MyVariable2',
          value: 'Hello World',
          type: 'string',
        },
      ],
      newInit: [
        {
          name: 'MyVariable1',
          value: '123',
          type: 'number',
        },
        {
          name: 'MyVariable2',
          value: 'Hello World',
          type: 'string',
        },
      ],
    });
    expect(variablesContainer.has('MyVariable1')).to.be(true);
    expect(variablesContainer.get('MyVariable1').getAsNumber()).to.be(123);
    expect(variablesContainer.getFromIndex(0).getAsNumber()).to.be(123);
    expect(variablesContainer.has('MyVariable2')).to.be(true);
    expect(variablesContainer.get('MyVariable2').getAsString()).to.be(
      'Hello World'
    );
    expect(variablesContainer.getFromIndex(1).getAsString()).to.be(
      'Hello World'
    );
  });

  it('can remove a variable at hot-reload', () => {
    const variablesContainer = hotReloadVariablesContainer({
      oldInit: [
        {
          name: 'MyVariable',
          value: '123',
          type: 'number',
        },
      ],
      newInit: [],
    });
    expect(variablesContainer.has('MyVariable')).to.be(false);
  });

  it('can change a variable from number to string at hot-reload', () => {
    const variablesContainer = hotReloadVariablesContainer({
      oldInit: [
        {
          name: 'MyVariable',
          value: '123',
          type: 'number',
        },
      ],
      newInit: [
        {
          name: 'MyVariable',
          value: 'Hello World',
          type: 'string',
        },
      ],
    });
    expect(variablesContainer.has('MyVariable')).to.be(true);
    expect(variablesContainer.get('MyVariable').getAsString()).to.be(
      'Hello World'
    );
  });

  it('can change a variable from number to boolean at hot-reload', () => {
    const variablesContainer = hotReloadVariablesContainer({
      oldInit: [
        {
          name: 'MyVariable',
          value: '123',
          type: 'number',
        },
      ],
      newInit: [
        {
          name: 'MyVariable',
          value: 'true',
          type: 'boolean',
        },
      ],
    });
    expect(variablesContainer.has('MyVariable')).to.be(true);
    expect(variablesContainer.get('MyVariable').getAsBoolean()).to.be(true);
  });

  it('can change a variable from number to structure at hot-reload', () => {
    const variablesContainer = hotReloadVariablesContainer({
      oldInit: [
        {
          name: 'MyVariable',
          value: '123',
          type: 'number',
        },
      ],
      newInit: [
        {
          name: 'MyVariable',
          type: 'structure',
          children: [
            {
              name: 'MyChild1',
              value: '123',
              type: 'number',
            },
            {
              name: 'MyChild2',
              value: 'Hello World',
              type: 'string',
            },
          ],
        },
      ],
    });
    expect(variablesContainer.has('MyVariable')).to.be(true);
    expect(variablesContainer.get('MyVariable').isStructure()).to.be(true);
    expect(variablesContainer.get('MyVariable').hasChild('MyChild1')).to.be(
      true
    );
    expect(variablesContainer.get('MyVariable').hasChild('MyChild2')).to.be(
      true
    );
    expect(
      variablesContainer.get('MyVariable').getChild('MyChild1').getAsNumber()
    ).to.be(123);
    expect(
      variablesContainer.get('MyVariable').getChild('MyChild2').getAsString()
    ).to.be('Hello World');
  });

  it('can modify a child variable value at hot-reload', () => {
    const variablesContainer = hotReloadVariablesContainer({
      oldInit: [
        {
          name: 'MyVariable',
          type: 'structure',
          children: [
            {
              name: 'MyChild1',
              value: '123',
              type: 'number',
            },
            {
              name: 'MyChild2',
              value: 'Hello World',
              type: 'string',
            },
          ],
        },
      ],
      newInit: [
        {
          name: 'MyVariable',
          type: 'structure',
          children: [
            {
              name: 'MyChild1',
              value: '124',
              type: 'number',
            },
            {
              name: 'MyChild2',
              value: 'Hello World 2',
              type: 'string',
            },
          ],
        },
      ],
    });
    expect(variablesContainer.has('MyVariable')).to.be(true);
    expect(variablesContainer.get('MyVariable').isStructure()).to.be(true);
    expect(variablesContainer.get('MyVariable').hasChild('MyChild1')).to.be(
      true
    );
    expect(variablesContainer.get('MyVariable').hasChild('MyChild2')).to.be(
      true
    );
    expect(
      variablesContainer.get('MyVariable').getChild('MyChild1').getAsNumber()
    ).to.be(124);
    expect(
      variablesContainer.get('MyVariable').getChild('MyChild2').getAsString()
    ).to.be('Hello World 2');
  });

  it('can remove a child variable at hot-reload', () => {
    const variablesContainer = hotReloadVariablesContainer({
      oldInit: [
        {
          name: 'MyVariable',
          type: 'structure',
          children: [
            {
              name: 'MyChild1',
              value: '123',
              type: 'number',
            },
            {
              name: 'MyChild2',
              value: 'Hello World',
              type: 'string',
            },
          ],
        },
      ],
      newInit: [
        {
          name: 'MyVariable',
          type: 'structure',
          children: [
            {
              name: 'MyChild2',
              value: 'Hello World',
              type: 'string',
            },
          ],
        },
      ],
    });
    expect(variablesContainer.has('MyVariable')).to.be(true);
    expect(variablesContainer.get('MyVariable').isStructure()).to.be(true);
    expect(variablesContainer.get('MyVariable').hasChild('MyChild1')).to.be(
      false
    );
    expect(variablesContainer.get('MyVariable').hasChild('MyChild2')).to.be(
      true
    );
    expect(
      variablesContainer.get('MyVariable').getChild('MyChild2').getAsString()
    ).to.be('Hello World');
  });

  it('can add a child variable as a structure at hot-reload', () => {
    const variablesContainer = hotReloadVariablesContainer({
      oldInit: [
        {
          name: 'MyVariable',
          type: 'structure',
          children: [
            {
              name: 'MyChild1',
              value: '123',
              type: 'number',
            },
            {
              name: 'MyChild2',
              value: 'Hello World',
              type: 'string',
            },
          ],
        },
      ],
      newInit: [
        {
          name: 'MyVariable',
          type: 'structure',
          children: [
            {
              name: 'MyChild1',
              type: 'structure',
              children: [
                {
                  name: 'MyGrandChild1',
                  value: '456',
                  type: 'number',
                },
              ],
            },
            {
              name: 'MyChild2',
              value: 'Hello World',
              type: 'string',
            },
          ],
        },
      ],
    });
    expect(variablesContainer.has('MyVariable')).to.be(true);
    expect(variablesContainer.get('MyVariable').isStructure()).to.be(true);
    expect(variablesContainer.get('MyVariable').hasChild('MyChild1')).to.be(
      true
    );
    expect(variablesContainer.get('MyVariable').hasChild('MyChild2')).to.be(
      true
    );
    expect(
      variablesContainer.get('MyVariable').getChild('MyChild2').getAsString()
    ).to.be('Hello World');
    expect(
      variablesContainer.get('MyVariable').getChild('MyChild1').isStructure()
    ).to.be(true);
    expect(
      variablesContainer
        .get('MyVariable')
        .getChild('MyChild1')
        .hasChild('MyGrandChild1')
    ).to.be(true);
    expect(
      variablesContainer
        .get('MyVariable')
        .getChild('MyChild1')
        .getChild('MyGrandChild1')
        .getAsNumber()
    ).to.be(456);
  });

  it('can modify a gand child variable at hot-reload', () => {
    const variablesContainer = hotReloadVariablesContainer({
      oldInit: [
        {
          name: 'MyVariable',
          type: 'structure',
          children: [
            {
              name: 'MyChild1',
              type: 'structure',
              children: [
                {
                  name: 'MyGrandChild1',
                  value: '456',
                  type: 'number',
                },
              ],
            },
            {
              name: 'MyChild2',
              value: 'Hello World',
              type: 'string',
            },
          ],
        },
      ],
      newInit: [
        {
          name: 'MyVariable',
          type: 'structure',
          children: [
            {
              name: 'MyChild1',
              type: 'structure',
              children: [
                {
                  name: 'MyGrandChild1',
                  value: '789',
                  type: 'number',
                },
              ],
            },
            {
              name: 'MyChild2',
              value: 'Hello World',
              type: 'string',
            },
          ],
        },
      ],
    });
    expect(variablesContainer.has('MyVariable')).to.be(true);
    expect(variablesContainer.get('MyVariable').isStructure()).to.be(true);
    expect(variablesContainer.get('MyVariable').hasChild('MyChild1')).to.be(
      true
    );
    expect(variablesContainer.get('MyVariable').hasChild('MyChild2')).to.be(
      true
    );
    expect(
      variablesContainer.get('MyVariable').getChild('MyChild2').getAsString()
    ).to.be('Hello World');
    expect(
      variablesContainer.get('MyVariable').getChild('MyChild1').isStructure()
    ).to.be(true);
    expect(
      variablesContainer
        .get('MyVariable')
        .getChild('MyChild1')
        .hasChild('MyGrandChild1')
    ).to.be(true);
    expect(
      variablesContainer
        .get('MyVariable')
        .getChild('MyChild1')
        .getChild('MyGrandChild1')
        .getAsNumber()
    ).to.be(789);
  });

  it('can remove a grand child variable and add another at hot-reload', () => {
    const variablesContainer = hotReloadVariablesContainer({
      oldInit: [
        {
          name: 'MyVariable',
          type: 'structure',
          children: [
            {
              name: 'MyChild1',
              type: 'structure',
              children: [
                {
                  name: 'MyGrandChild1',
                  value: '456',
                  type: 'number',
                },
              ],
            },
            {
              name: 'MyChild2',
              value: 'Hello World',
              type: 'string',
            },
          ],
        },
      ],
      newInit: [
        {
          name: 'MyVariable',
          type: 'structure',
          children: [
            {
              name: 'MyChild1',
              type: 'structure',
              children: [
                {
                  name: 'MyGrandChild2',
                  value: 'Hello World 3',
                  type: 'string',
                },
              ],
            },
            {
              name: 'MyChild2',
              value: 'Hello World',
              type: 'string',
            },
          ],
        },
      ],
    });
    expect(variablesContainer.has('MyVariable')).to.be(true);
    expect(variablesContainer.get('MyVariable').isStructure()).to.be(true);
    expect(variablesContainer.get('MyVariable').hasChild('MyChild1')).to.be(
      true
    );
    expect(variablesContainer.get('MyVariable').hasChild('MyChild2')).to.be(
      true
    );
    expect(
      variablesContainer.get('MyVariable').getChild('MyChild2').getAsString()
    ).to.be('Hello World');
    expect(
      variablesContainer.get('MyVariable').getChild('MyChild1').isStructure()
    ).to.be(true);
    expect(
      variablesContainer
        .get('MyVariable')
        .getChild('MyChild1')
        .hasChild('MyGrandChild1')
    ).to.be(false);
    expect(
      variablesContainer
        .get('MyVariable')
        .getChild('MyChild1')
        .hasChild('MyGrandChild2')
    ).to.be(true);
    expect(
      variablesContainer
        .get('MyVariable')
        .getChild('MyChild1')
        .getChild('MyGrandChild2')
        .getAsString()
    ).to.be('Hello World 3');
  });

  it('can change a variable from structure to array at hot-reload', () => {
    const variablesContainer = hotReloadVariablesContainer({
      oldInit: [
        {
          name: 'MyVariable',
          type: 'structure',
          children: [
            {
              name: 'MyChild1',
              value: '123',
              type: 'number',
            },
            {
              name: 'MyChild2',
              value: 'Hello World',
              type: 'string',
            },
          ],
        },
      ],
      newInit: [
        {
          name: 'MyVariable',
          type: 'array',
          children: [
            {
              value: '123',
              type: 'number',
            },
            {
              value: 'Hello World',
              type: 'string',
            },
          ],
        },
      ],
    });
    expect(variablesContainer.has('MyVariable')).to.be(true);
    expect(variablesContainer.get('MyVariable').getType()).to.be('array');
    expect(variablesContainer.get('MyVariable').getChildrenCount()).to.be(2);
    const array = variablesContainer.get('MyVariable');
    expect(array.getChild('0').getType()).to.be('number');
    expect(array.getChild('0').getAsNumber()).to.be(123);
    expect(array.getChild('1').getType()).to.be('string');
    expect(array.getChild('1').getAsString()).to.be('Hello World');
  });
});
