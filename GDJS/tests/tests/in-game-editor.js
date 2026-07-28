describe('gdjs.InGameEditor', () => {
  class EditorBehavior extends gdjs.RuntimeBehavior {
    constructor(instanceContainer, behaviorData, owner) {
      super(instanceContainer, behaviorData, owner);
      this.marker = behaviorData.marker;
      this.sharedData = instanceContainer.getInitialSharedDataForBehavior(
        behaviorData.name
      );
    }

    getForwardAngle() {
      return this.sharedData.forwardAngle;
    }
  }

  gdjs.registerBehavior('Test::EditorBehavior', EditorBehavior);

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

  const editorSettings = {
    grid: false,
    gridType: 'rectangular',
    gridWidth: 10,
    gridHeight: 10,
    gridDepth: 10,
    gridOffsetX: 0,
    gridOffsetY: 0,
    gridOffsetZ: 0,
    gridColor: 0,
    gridAlpha: 1,
    snap: false,
  };

  const createSceneData = (behaviorsSharedData) => ({
    layers: [baseLayer],
    variables: [],
    r: 0,
    v: 0,
    b: 0,
    mangledName: 'Scene',
    name: 'Scene',
    stopSoundsOnStartup: false,
    title: '',
    behaviorsSharedData,
    objects: [],
    objectsGroups: [],
    instances: [],
    usedResources: [],
    uiSettings: editorSettings,
  });

  const createEventsBasedObjectData = () => ({
    name: 'MyCustomObject',
    variables: [],
    behaviors: [
      {
        name: 'PhysicsCharacter3D',
        type: 'Test::EditorBehavior',
        marker: 'prefab behavior configuration',
      },
    ],
    instances: [],
    objects: [],
    objectsGroups: [],
    layers: [baseLayer],
    areaMinX: 0,
    areaMinY: 0,
    areaMinZ: 0,
    areaMaxX: 0,
    areaMaxY: 0,
    areaMaxZ: 0,
    _initialInnerArea: null,
    isInnerAreaFollowingParentSize: false,
    variants: [],
    usedResources: [],
    editionSettings: editorSettings,
  });

  it('attaches prefab behaviors and their shared data to the synthetic object', () => {
    const projectData = gdjs.createProjectData({
      layouts: [
        createSceneData([
          {
            name: 'PhysicsCharacter3D',
            type: 'Test::EditorBehavior',
            forwardAngle: 90,
          },
        ]),
      ],
    });
    projectData.eventsFunctionsExtensions.push({
      name: 'MyExtension',
      eventsBasedObjects: [createEventsBasedObjectData()],
      globalVariables: [],
      sceneVariables: [],
    });

    const runtimeGame = new gdjs.RuntimeGame(projectData);
    // Avoid constructing the whole editor while retaining editor-time behavior
    // activation rules for the synthetic scene.
    runtimeGame._isInGameEdition = true;
    const editor = Object.create(gdjs.InGameEditor.prototype);
    editor._runtimeGame = runtimeGame;

    const sceneAndCustomObject = editor._createSceneWithCustomObject(
      'MyExtension::MyCustomObject',
      ''
    );
    expect(sceneAndCustomObject).not.to.be(null);

    const customObject = sceneAndCustomObject.scene.getObjects('Object')[0];
    const behavior = customObject.getBehavior('PhysicsCharacter3D');
    expect(behavior).to.be.an(EditorBehavior);
    expect(behavior.marker).to.be('prefab behavior configuration');
    expect(behavior.activated()).to.be(false);
    expect(behavior.getForwardAngle()).to.be(90);

    // Capability behaviors are still added when the prefab does not declare
    // them, preserving the previous synthetic-object behavior.
    expect(customObject.hasBehavior('Object3D')).to.be(true);

    sceneAndCustomObject.scene.unloadScene();
  });
});
