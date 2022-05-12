// @ts-check
describe.only('gdjs.AnchorRuntimeBehavior', function () {
  var runtimeGame = new gdjs.RuntimeGame({
    variables: [],
    resources: { resources: [] },
    // @ts-ignore
    properties: { windowWidth: 1000, windowHeight: 1000 },
  });
  const anchorBehaviorName = 'Anchor';
  var runtimeScene = new gdjs.RuntimeScene(runtimeGame);
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
  });

  function createObject() {
    var object = new gdjs.TestRuntimeObject(runtimeScene, {
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
        },
      ],
      variables: [],
      effects: [],
    });

    object.setCustomWidthAndHeight(10, 10);
    runtimeScene.addObject(object);
    return object;
  }

  function getAnchorBehavior(object) {
    const behavior = object.getBehavior(anchorBehaviorName);
    if (!(behavior instanceof gdjs.AnchorRuntimeBehavior)) {
      throw new Error(
        'Expected behavior to be an instance of gdjs.AnchorBehavior'
      );
    }
    return behavior;
  }

  describe('(anchor horizontal edge)', function () {
    ['right', 'left'].forEach((objectEdge) => {
      it(`anchors the ${objectEdge} edge of object to window left (fixed)`, function () {
        var object = createObject();
        runtimeGame.setGameResolutionSize(1000, 1000);
        object.setPosition(500, 500);

        getAnchorBehavior(object).setAnchor(objectEdge, 1);

        runtimeScene.renderAndStep(1000 / 60);

        runtimeGame.setGameResolutionSize(2000, 2000);
        runtimeScene.renderAndStep(1000 / 60);

        expect(object.getX()).to.equal(500);
        expect(object.getY()).to.equal(500);
        expect(object.getWidth()).to.equal(10);
      });
    });
    ['right', 'left'].forEach((objectEdge) => {
      it(`anchors the ${objectEdge} edge of object to window right (fixed)`, function () {
        var object = createObject();
        runtimeGame.setGameResolutionSize(1000, 1000);
        object.setPosition(500, 500);

        getAnchorBehavior(object).setAnchor(objectEdge, 2);

        runtimeScene.renderAndStep(1000 / 60);

        runtimeGame.setGameResolutionSize(2000, 2000);

        runtimeScene.renderAndStep(1000 / 60);
        expect(object.getX()).to.equal(1500);
        expect(object.getY()).to.equal(500);
        expect(object.getWidth()).to.equal(10);
      });
    });

    it('anchors the right and left edge of object (fixed)', function () {
      var object = createObject();
      runtimeGame.setGameResolutionSize(1000, 1000);
      object.setPosition(500, 500);

      getAnchorBehavior(object).setAnchor('left', 1);
      getAnchorBehavior(object).setAnchor('right', 2);

      runtimeScene.renderAndStep(1000 / 60);

      runtimeGame.setGameResolutionSize(2000, 2000);
      runtimeScene.renderAndStep(1000 / 60);

      expect(object.getX()).to.equal(500);
      expect(object.getY()).to.equal(500);
      expect(object.getWidth()).to.equal(1010);
    });

    it('anchors the right edge of object (proportional)', function () {
      var object = createObject();
      runtimeGame.setGameResolutionSize(1000, 1000);
      object.setPosition(500, 500);

      getAnchorBehavior(object).setAnchor('left', 3);

      runtimeScene.renderAndStep(1000 / 60);

      runtimeGame.setGameResolutionSize(2000, 2000);
      runtimeScene.renderAndStep(1000 / 60);

      expect(object.getX()).to.equal(1000);
      expect(object.getY()).to.equal(500);
      expect(object.getWidth()).to.equal(10);
    });
  });

  describe('(anchor vertical edge)', function () {
    ['top', 'bottom'].forEach((objectEdge) => {
      it(`anchors the ${objectEdge} edge of object to window top (fixed)`, function () {
        var object = createObject();
        runtimeGame.setGameResolutionSize(1000, 1000);
        object.setPosition(500, 500);

        getAnchorBehavior(object).setAnchor('top', 1);

        runtimeScene.renderAndStep(1000 / 60);

        runtimeGame.setGameResolutionSize(2000, 2000);
        runtimeScene.renderAndStep(1000 / 60);

        expect(object.getX()).to.equal(500);
        expect(object.getY()).to.equal(500);
        expect(object.getWidth()).to.equal(10);
      });
    });
    ['top', 'bottom'].forEach((objectEdge) => {
      it(`anchors the ${objectEdge} edge of object to window bottom (fixed)`, function () {
        var object = createObject();
        runtimeGame.setGameResolutionSize(1000, 1000);
        object.setPosition(500, 500);

        getAnchorBehavior(object).setAnchor('bottom', 2);

        runtimeScene.renderAndStep(1000 / 60);

        runtimeGame.setGameResolutionSize(2000, 2000);
        runtimeScene.renderAndStep(1000 / 60);

        expect(object.getX()).to.equal(500);
        expect(object.getY()).to.equal(1500);
        expect(object.getWidth()).to.equal(10);
      });
    });

    it('anchors the top and bottom edge of object (fixed)', function () {
      var object = createObject();
      runtimeGame.setGameResolutionSize(1000, 1000);
      object.setPosition(500, 500);

      getAnchorBehavior(object).setAnchor('top', 1);
      getAnchorBehavior(object).setAnchor('bottom', 2);

      runtimeScene.renderAndStep(1000 / 60);

      runtimeGame.setGameResolutionSize(2000, 2000);
      runtimeScene.renderAndStep(1000 / 60);

      expect(object.getX()).to.equal(500);
      expect(object.getY()).to.equal(500);
      expect(object.getHeight()).to.equal(1010);
    });

    it('anchors the bottom edge of object (proportional)', function () {
      var object = createObject();
      runtimeGame.setGameResolutionSize(1000, 1000);
      object.setPosition(500, 500);

      getAnchorBehavior(object).setAnchor('top', 3);

      runtimeScene.renderAndStep(1000 / 60);

      runtimeGame.setGameResolutionSize(2000, 2000);
      runtimeScene.renderAndStep(1000 / 60);

      expect(object.getX()).to.equal(500);
      expect(object.getY()).to.equal(1000);
      expect(object.getWidth()).to.equal(10);
    });
  });
});
