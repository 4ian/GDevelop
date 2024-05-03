// @ts-check
describe('gdjs.AnchorRuntimeBehavior', function () {
  const runtimeGame = gdjs.getPixiRuntimeGame({
    propertiesOverrides: { windowHeight: 1000, windowWidth: 1000 },
  });
  const anchorBehaviorName = 'Anchor';
  const runtimeScene = new gdjs.RuntimeScene(runtimeGame);
  runtimeScene.loadFromScene({
    layers: [
      {
        name: '',
        visibility: true,
        cameras: [],
        effects: [],
        ambientLightColorR: 127,
        ambientLightColorB: 127,
        ambientLightColorG: 127,
        isLightingLayer: false,
        followBaseLayerCamera: false,
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
    usedResources: [],
  });

  function createObject(behaviorProperties) {
    const object = new gdjs.TestRuntimeObject(runtimeScene, {
      name: 'obj1',
      type: '',
      behaviors: [
        {
          name: anchorBehaviorName,
          type: 'AnchorBehavior::AnchorBehavior',
          // @ts-ignore - properties are not typed
          rightEdgeAnchor: 0,
          leftEdgeAnchor: 0,
          topEdgeAnchor: 0,
          bottomEdgeAnchor: 0,
          relativeToOriginalWindowSize: true,
          useLegacyBottomAndRightAnchors: false,
          ...behaviorProperties,
        },
      ],
      variables: [],
      effects: [],
    });

    object.setCustomWidthAndHeight(10, 10);
    runtimeScene.addObject(object);
    return object;
  }

  describe('(anchor horizontal edge)', function () {
    ['rightEdgeAnchor', 'leftEdgeAnchor'].forEach((objectEdge) => {
      it(`anchors the ${objectEdge} edge of object to window left (fixed)`, function () {
        const object = createObject({ [objectEdge]: 1 });
        runtimeGame.setGameResolutionSize(1000, 1000);
        object.setPosition(500, 500);

        runtimeScene.renderAndStep(1000 / 60);

        runtimeGame.setGameResolutionSize(2000, 2000);
        runtimeScene.renderAndStep(1000 / 60);

        expect(object.getX()).to.equal(500);
        expect(object.getY()).to.equal(500);
        expect(object.getWidth()).to.equal(10);
      });
    });
    ['rightEdgeAnchor', 'leftEdgeAnchor'].forEach((objectEdge) => {
      it(`anchors the ${objectEdge} edge of object to window right (fixed)`, function () {
        const object = createObject({ [objectEdge]: 2 });
        runtimeGame.setGameResolutionSize(1000, 1000);
        object.setPosition(500, 500);

        runtimeScene.renderAndStep(1000 / 60);

        runtimeGame.setGameResolutionSize(2000, 2000);

        runtimeScene.renderAndStep(1000 / 60);
        expect(object.getX()).to.equal(1500);
        expect(object.getY()).to.equal(500);
        expect(object.getWidth()).to.equal(10);
      });
    });

    it('anchors the right and left edge of object (fixed)', function () {
      const object = createObject({ leftEdgeAnchor: 1, rightEdgeAnchor: 2 });
      runtimeGame.setGameResolutionSize(1000, 1000);
      object.setPosition(500, 500);

      runtimeScene.renderAndStep(1000 / 60);

      runtimeGame.setGameResolutionSize(2000, 2000);
      runtimeScene.renderAndStep(1000 / 60);

      expect(object.getX()).to.equal(500);
      expect(object.getY()).to.equal(500);
      expect(object.getWidth()).to.equal(1010);
    });

    it('anchors the left edge of object (proportional)', function () {
      const object = createObject({ leftEdgeAnchor: 3 });
      runtimeGame.setGameResolutionSize(1000, 1000);
      object.setPosition(500, 500);

      runtimeScene.renderAndStep(1000 / 60);

      runtimeGame.setGameResolutionSize(2000, 2000);
      runtimeScene.renderAndStep(1000 / 60);

      expect(object.getX()).to.equal(1000);
      expect(object.getY()).to.equal(500);
      expect(object.getWidth()).to.equal(10);
    });
  });

  describe('(anchor vertical edge)', function () {
    ['topEdgeAnchor', 'bottomEdgeAnchor'].forEach((objectEdge) => {
      it(`anchors the ${objectEdge} edge of object to window top (fixed)`, function () {
        const object = createObject({ [objectEdge]: 1 });
        runtimeGame.setGameResolutionSize(1000, 1000);
        object.setPosition(500, 500);

        runtimeScene.renderAndStep(1000 / 60);

        runtimeGame.setGameResolutionSize(2000, 2000);
        runtimeScene.renderAndStep(1000 / 60);

        expect(object.getX()).to.equal(500);
        expect(object.getY()).to.equal(500);
        expect(object.getWidth()).to.equal(10);
      });
    });
    ['topEdgeAnchor', 'bottomEdgeAnchor'].forEach((objectEdge) => {
      it(`anchors the ${objectEdge} edge of object to window bottom (fixed)`, function () {
        const object = createObject({ [objectEdge]: 2 });
        runtimeGame.setGameResolutionSize(1000, 1000);
        object.setPosition(500, 500);

        runtimeScene.renderAndStep(1000 / 60);

        runtimeGame.setGameResolutionSize(2000, 2000);
        runtimeScene.renderAndStep(1000 / 60);

        expect(object.getX()).to.equal(500);
        expect(object.getY()).to.equal(1500);
        expect(object.getWidth()).to.equal(10);
      });
    });

    it('anchors the top and bottom edge of object (fixed)', function () {
      const object = createObject({ topEdgeAnchor: 1, bottomEdgeAnchor: 2 });
      runtimeGame.setGameResolutionSize(1000, 1000);
      object.setPosition(500, 500);

      runtimeScene.renderAndStep(1000 / 60);

      runtimeGame.setGameResolutionSize(2000, 2000);
      runtimeScene.renderAndStep(1000 / 60);

      expect(object.getX()).to.equal(500);
      expect(object.getY()).to.equal(500);
      expect(object.getHeight()).to.equal(1010);
    });

    it('anchors the top edge of object (proportional)', function () {
      const object = createObject({ topEdgeAnchor: 3 });
      runtimeGame.setGameResolutionSize(1000, 1000);
      object.setPosition(500, 500);

      runtimeScene.renderAndStep(1000 / 60);

      runtimeGame.setGameResolutionSize(2000, 2000);
      runtimeScene.renderAndStep(1000 / 60);

      expect(object.getX()).to.equal(500);
      expect(object.getY()).to.equal(1000);
      expect(object.getWidth()).to.equal(10);
    });
  });
});
