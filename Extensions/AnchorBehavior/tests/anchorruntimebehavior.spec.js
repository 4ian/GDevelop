// @ts-check
describe('gdjs.AnchorRuntimeBehavior', () => {
  const anchorBehaviorName = 'Anchor';

  /** @type {gdjs.RuntimeGame} */
  let runtimeGame;
  /** @type {gdjs.RuntimeScene} */
  let runtimeScene;
  /** @type {gdjs.RuntimeLayer} */
  let layer;
  beforeEach(() => {
    runtimeGame = gdjs.getPixiRuntimeGame({
      propertiesOverrides: { windowHeight: 1000, windowWidth: 1000 },
    });
    runtimeScene = new gdjs.RuntimeScene(runtimeGame);
    runtimeScene.loadFromScene({
      sceneData: {
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
        uiSettings: {
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
        },
      },
      usedExtensionsWithVariablesData: [],
    });
    layer = runtimeScene.getLayer('');
  });

  const setGameResolutionSizeAndStep = (width, height) => {
    runtimeGame.setGameResolutionSize(width, height);
    // This method is called by the main loop:
    runtimeScene.onGameResolutionResized();
    runtimeScene.renderAndStep(1000 / 60);
  };

  const setCamera = (x, y) => {
    layer.setCameraX(x);
    layer.setCameraY(y);
  };

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

  const createSpriteWithOriginAtCenter = (behaviorProperties) => {
    const object = new gdjs.TestSpriteRuntimeObject(runtimeScene, {
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
          relativeToOriginalWindowSize: false,
          useLegacyBottomAndRightAnchors: false,
          ...behaviorProperties,
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
                  originPoint: { x: 50, y: 50 },
                  centerPoint: { x: 50, y: 50 },
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
    object.setUnscaledWidthAndHeight(100, 100);
    object.setCustomWidthAndHeight(10, 10);
    runtimeScene.addObject(object);
    return object;
  };

  describe('(anchor horizontal edge)', () => {
    describe('(basic)', () => {
      ['rightEdgeAnchor', 'leftEdgeAnchor'].forEach((objectEdge) => {
        it(`anchors the ${objectEdge} edge of an object to window left (fixed)`, () => {
          const object = createObject({ [objectEdge]: 1 });
          object.setPosition(500, 500);
          runtimeScene.renderAndStep(1000 / 60);

          setGameResolutionSizeAndStep(2000, 2000);

          expect(object.getX()).to.equal(500);
          expect(object.getY()).to.equal(500);
          expect(object.getWidth()).to.equal(10);
        });
      });
      ['rightEdgeAnchor', 'leftEdgeAnchor'].forEach((objectEdge) => {
        it(`anchors the ${objectEdge} edge of an object to window right (fixed)`, () => {
          const object = createObject({ [objectEdge]: 2 });
          object.setPosition(500, 500);
          runtimeScene.renderAndStep(1000 / 60);

          setGameResolutionSizeAndStep(2000, 2000);

          expect(object.getX()).to.equal(1500);
          expect(object.getY()).to.equal(500);
          expect(object.getWidth()).to.equal(10);
        });
      });
      ['rightEdgeAnchor', 'leftEdgeAnchor'].forEach((objectEdge) => {
        it(`anchors the ${objectEdge} edge of an object to window center (fixed)`, () => {
          const object = createObject({ [objectEdge]: 4 });
          object.setPosition(500, 500);
          runtimeScene.renderAndStep(1000 / 60);

          setGameResolutionSizeAndStep(2000, 2000);

          expect(object.getX()).to.equal(1000);
          expect(object.getY()).to.equal(500);
          expect(object.getWidth()).to.equal(10);
        });
      });

      it('anchors the right and left edge of an object (fixed)', () => {
        const object = createObject({ leftEdgeAnchor: 1, rightEdgeAnchor: 2 });
        object.setPosition(500, 500);
        runtimeScene.renderAndStep(1000 / 60);

        setGameResolutionSizeAndStep(2000, 2000);

        expect(object.getX()).to.equal(500);
        expect(object.getY()).to.equal(500);
        expect(object.getWidth()).to.equal(1010);
      });

      it('anchors the left edge of an object (proportional)', () => {
        const object = createObject({ leftEdgeAnchor: 3 });
        object.setPosition(500, 500);
        runtimeScene.renderAndStep(1000 / 60);

        setGameResolutionSizeAndStep(2000, 2000);

        expect(object.getX()).to.equal(1000);
        expect(object.getY()).to.equal(500);
        expect(object.getWidth()).to.equal(10);
      });
    });
    describe('(moving object)', () => {
      ['rightEdgeAnchor', 'leftEdgeAnchor'].forEach((objectEdge) => {
        it(`anchors the ${objectEdge} edge of an object to window left (fixed)`, () => {
          const object = createObject({ [objectEdge]: 1 });
          object.setPosition(500, 500);
          runtimeScene.renderAndStep(1000 / 60);

          object.setPosition(600, 700);
          setGameResolutionSizeAndStep(2000, 2000);

          expect(object.getX()).to.equal(600);
          expect(object.getY()).to.equal(700);
          expect(object.getWidth()).to.equal(10);
        });
      });
      ['rightEdgeAnchor', 'leftEdgeAnchor'].forEach((objectEdge) => {
        it(`anchors the ${objectEdge} edge of an object to window right (fixed)`, () => {
          const object = createObject({ [objectEdge]: 2 });
          object.setPosition(500, 500);
          runtimeScene.renderAndStep(1000 / 60);

          object.setPosition(600, 700);
          setGameResolutionSizeAndStep(2000, 2000);

          expect(object.getX()).to.equal(1600);
          expect(object.getY()).to.equal(700);
          expect(object.getWidth()).to.equal(10);
        });
      });
      ['rightEdgeAnchor', 'leftEdgeAnchor'].forEach((objectEdge) => {
        it(`anchors the ${objectEdge} edge of an object to window center (fixed)`, () => {
          const object = createObject({ [objectEdge]: 4 });
          object.setPosition(500, 500);
          runtimeScene.renderAndStep(1000 / 60);

          object.setPosition(600, 700);
          setGameResolutionSizeAndStep(2000, 2000);

          expect(object.getX()).to.equal(1100);
          expect(object.getY()).to.equal(700);
          expect(object.getWidth()).to.equal(10);
        });
      });

      it('anchors the right and left edge of an object (fixed)', () => {
        const object = createObject({ leftEdgeAnchor: 1, rightEdgeAnchor: 2 });
        object.setPosition(500, 500);
        runtimeScene.renderAndStep(1000 / 60);

        object.setPosition(600, 700);
        setGameResolutionSizeAndStep(2000, 2000);

        expect(object.getX()).to.equal(600);
        expect(object.getY()).to.equal(700);
        expect(object.getWidth()).to.equal(1010);
      });

      it('anchors the left edge of an object (proportional)', () => {
        const object = createObject({ leftEdgeAnchor: 3 });
        object.setPosition(500, 500);
        runtimeScene.renderAndStep(1000 / 60);

        object.setPosition(600, 700);
        setGameResolutionSizeAndStep(2000, 2000);

        expect(object.getX()).to.equal(1200);
        expect(object.getY()).to.equal(700);
        expect(object.getWidth()).to.equal(10);
      });
    });
    describe('(moving camera)', () => {
      ['rightEdgeAnchor', 'leftEdgeAnchor'].forEach((objectEdge) => {
        it(`anchors the ${objectEdge} edge of an object to window left (fixed)`, () => {
          const object = createObject({ [objectEdge]: 1 });
          object.setPosition(500, 500);
          runtimeScene.renderAndStep(1000 / 60);

          setCamera(1300, 1400);
          setGameResolutionSizeAndStep(2000, 2000);

          expect(object.getX()).to.equal(800);
          expect(object.getY()).to.equal(500);
          expect(object.getWidth()).to.equal(10);
        });
      });
      ['rightEdgeAnchor', 'leftEdgeAnchor'].forEach((objectEdge) => {
        it(`anchors the ${objectEdge} edge of an object to window right (fixed)`, () => {
          const object = createObject({ [objectEdge]: 2 });
          object.setPosition(500, 500);
          runtimeScene.renderAndStep(1000 / 60);

          setCamera(1300, 1400);
          setGameResolutionSizeAndStep(2000, 2000);

          expect(object.getX()).to.equal(1800);
          expect(object.getY()).to.equal(500);
          expect(object.getWidth()).to.equal(10);
        });
      });
      ['rightEdgeAnchor', 'leftEdgeAnchor'].forEach((objectEdge) => {
        it(`anchors the ${objectEdge} edge of an object to window center (fixed)`, () => {
          const object = createObject({ [objectEdge]: 4 });
          object.setPosition(500, 500);
          runtimeScene.renderAndStep(1000 / 60);

          setCamera(1300, 1400);
          setGameResolutionSizeAndStep(2000, 2000);

          expect(object.getX()).to.equal(1300);
          expect(object.getY()).to.equal(500);
          expect(object.getWidth()).to.equal(10);
        });
      });

      it('anchors the right and left edge of an object (fixed)', () => {
        const object = createObject({ leftEdgeAnchor: 1, rightEdgeAnchor: 2 });
        object.setPosition(500, 500);
        runtimeScene.renderAndStep(1000 / 60);

        setCamera(1300, 1400);
        setGameResolutionSizeAndStep(2000, 2000);

        expect(object.getX()).to.equal(800);
        expect(object.getY()).to.equal(500);
        expect(object.getWidth()).to.equal(1010);
      });

      it('anchors the left edge of an object (proportional)', () => {
        const object = createObject({ leftEdgeAnchor: 3 });
        object.setPosition(500, 500);
        runtimeScene.renderAndStep(1000 / 60);

        setCamera(1300, 1400);
        setGameResolutionSizeAndStep(2000, 2000);

        expect(object.getX()).to.equal(1300);
        expect(object.getY()).to.equal(500);
        expect(object.getWidth()).to.equal(10);
      });
    });
    describe('(moving object and camera)', () => {
      ['rightEdgeAnchor', 'leftEdgeAnchor'].forEach((objectEdge) => {
        it(`anchors the ${objectEdge} edge of an object to window left (fixed)`, () => {
          const object = createObject({ [objectEdge]: 1 });
          object.setPosition(500, 500);
          runtimeScene.renderAndStep(1000 / 60);

          object.setPosition(600, 700);
          setCamera(1300, 1400);
          setGameResolutionSizeAndStep(2000, 2000);

          expect(object.getX()).to.equal(900);
          expect(object.getY()).to.equal(700);
          expect(object.getWidth()).to.equal(10);
        });
      });
      ['rightEdgeAnchor', 'leftEdgeAnchor'].forEach((objectEdge) => {
        it(`anchors the ${objectEdge} edge of an object to window right (fixed)`, () => {
          const object = createObject({ [objectEdge]: 2 });
          object.setPosition(500, 500);
          runtimeScene.renderAndStep(1000 / 60);

          object.setPosition(600, 700);
          setCamera(1300, 1400);
          setGameResolutionSizeAndStep(2000, 2000);

          expect(object.getX()).to.equal(1900);
          expect(object.getY()).to.equal(700);
          expect(object.getWidth()).to.equal(10);
        });
      });
      ['rightEdgeAnchor', 'leftEdgeAnchor'].forEach((objectEdge) => {
        it(`anchors the ${objectEdge} edge of an object to window center (fixed)`, () => {
          const object = createObject({ [objectEdge]: 4 });
          object.setPosition(500, 500);
          runtimeScene.renderAndStep(1000 / 60);

          object.setPosition(600, 700);
          setCamera(1300, 1400);
          setGameResolutionSizeAndStep(2000, 2000);

          expect(object.getX()).to.equal(1400);
          expect(object.getY()).to.equal(700);
          expect(object.getWidth()).to.equal(10);
        });
      });

      it('anchors the right and left edge of an object (fixed)', () => {
        const object = createObject({ leftEdgeAnchor: 1, rightEdgeAnchor: 2 });
        object.setPosition(500, 500);
        runtimeScene.renderAndStep(1000 / 60);

        object.setPosition(600, 700);
        setCamera(1300, 1400);
        setGameResolutionSizeAndStep(2000, 2000);

        expect(object.getX()).to.equal(900);
        expect(object.getY()).to.equal(700);
        expect(object.getWidth()).to.equal(1010);
      });

      it('anchors the left edge of an object (proportional)', () => {
        const object = createObject({ leftEdgeAnchor: 3 });
        object.setPosition(500, 500);
        runtimeScene.renderAndStep(1000 / 60);

        object.setPosition(600, 700);
        setCamera(1300, 1400);
        setGameResolutionSizeAndStep(2000, 2000);

        expect(object.getX()).to.equal(1500);
        expect(object.getY()).to.equal(700);
        expect(object.getWidth()).to.equal(10);
      });
    });
  });

  describe('(anchor vertical edge)', () => {
    describe('(basic)', () => {
      ['topEdgeAnchor', 'bottomEdgeAnchor'].forEach((objectEdge) => {
        it(`anchors the ${objectEdge} edge of object to window top (fixed)`, () => {
          const object = createObject({ [objectEdge]: 1 });
          object.setPosition(500, 500);
          runtimeScene.renderAndStep(1000 / 60);

          setGameResolutionSizeAndStep(2000, 2000);

          expect(object.getX()).to.equal(500);
          expect(object.getY()).to.equal(500);
          expect(object.getWidth()).to.equal(10);
        });
      });
      ['topEdgeAnchor', 'bottomEdgeAnchor'].forEach((objectEdge) => {
        it(`anchors the ${objectEdge} edge of object to window bottom (fixed)`, () => {
          const object = createObject({ [objectEdge]: 2 });
          object.setPosition(500, 500);
          runtimeScene.renderAndStep(1000 / 60);

          setGameResolutionSizeAndStep(2000, 2000);

          expect(object.getX()).to.equal(500);
          expect(object.getY()).to.equal(1500);
          expect(object.getWidth()).to.equal(10);
        });
      });
      ['topEdgeAnchor', 'bottomEdgeAnchor'].forEach((objectEdge) => {
        it(`anchors the ${objectEdge} edge of object to window center (fixed)`, () => {
          const object = createObject({ [objectEdge]: 4 });
          object.setPosition(500, 500);
          runtimeScene.renderAndStep(1000 / 60);

          setGameResolutionSizeAndStep(2000, 2000);

          expect(object.getX()).to.equal(500);
          expect(object.getY()).to.equal(1000);
          expect(object.getWidth()).to.equal(10);
        });
      });

      it('anchors the top and bottom edge of object (fixed)', () => {
        const object = createObject({ topEdgeAnchor: 1, bottomEdgeAnchor: 2 });
        object.setPosition(500, 500);
        runtimeScene.renderAndStep(1000 / 60);

        setGameResolutionSizeAndStep(2000, 2000);

        expect(object.getX()).to.equal(500);
        expect(object.getY()).to.equal(500);
        expect(object.getHeight()).to.equal(1010);
      });

      it('anchors the top edge of object (proportional)', () => {
        const object = createObject({ topEdgeAnchor: 3 });
        object.setPosition(500, 500);
        runtimeScene.renderAndStep(1000 / 60);

        setGameResolutionSizeAndStep(2000, 2000);

        expect(object.getX()).to.equal(500);
        expect(object.getY()).to.equal(1000);
        expect(object.getWidth()).to.equal(10);
      });
    });
    describe('(moving object)', () => {
      ['topEdgeAnchor', 'bottomEdgeAnchor'].forEach((objectEdge) => {
        it(`anchors the ${objectEdge} edge of object to window top (fixed)`, () => {
          const object = createObject({ [objectEdge]: 1 });
          object.setPosition(500, 500);
          runtimeScene.renderAndStep(1000 / 60);

          object.setPosition(600, 700);
          setGameResolutionSizeAndStep(2000, 2000);

          expect(object.getX()).to.equal(600);
          expect(object.getY()).to.equal(700);
          expect(object.getWidth()).to.equal(10);
        });
      });
      ['topEdgeAnchor', 'bottomEdgeAnchor'].forEach((objectEdge) => {
        it(`anchors the ${objectEdge} edge of object to window bottom (fixed)`, () => {
          const object = createObject({ [objectEdge]: 2 });
          object.setPosition(500, 500);
          runtimeScene.renderAndStep(1000 / 60);

          object.setPosition(600, 700);
          setGameResolutionSizeAndStep(2000, 2000);

          expect(object.getX()).to.equal(600);
          expect(object.getY()).to.equal(1700);
          expect(object.getWidth()).to.equal(10);
        });
      });
      ['topEdgeAnchor', 'bottomEdgeAnchor'].forEach((objectEdge) => {
        it(`anchors the ${objectEdge} edge of object to window center (fixed)`, () => {
          const object = createObject({ [objectEdge]: 4 });
          object.setPosition(500, 500);
          runtimeScene.renderAndStep(1000 / 60);

          object.setPosition(600, 700);
          setGameResolutionSizeAndStep(2000, 2000);

          expect(object.getX()).to.equal(600);
          expect(object.getY()).to.equal(1200);
          expect(object.getWidth()).to.equal(10);
        });
      });

      it('anchors the top and bottom edge of object (fixed)', () => {
        const object = createObject({ topEdgeAnchor: 1, bottomEdgeAnchor: 2 });
        object.setPosition(500, 500);
        runtimeScene.renderAndStep(1000 / 60);

        object.setPosition(600, 700);
        setGameResolutionSizeAndStep(2000, 2000);

        expect(object.getX()).to.equal(600);
        expect(object.getY()).to.equal(700);
        expect(object.getHeight()).to.equal(1010);
      });

      it('anchors the top edge of object (proportional)', () => {
        const object = createObject({ topEdgeAnchor: 3 });
        object.setPosition(500, 500);
        runtimeScene.renderAndStep(1000 / 60);

        object.setPosition(600, 700);
        setGameResolutionSizeAndStep(2000, 2000);

        expect(object.getX()).to.equal(600);
        expect(object.getY()).to.equal(1400);
        expect(object.getWidth()).to.equal(10);
      });
    });
    describe('(moving camera)', () => {
      ['topEdgeAnchor', 'bottomEdgeAnchor'].forEach((objectEdge) => {
        it(`anchors the ${objectEdge} edge of object to window top (fixed)`, () => {
          const object = createObject({ [objectEdge]: 1 });
          object.setPosition(500, 500);
          runtimeScene.renderAndStep(1000 / 60);

          setCamera(1300, 1400);
          setGameResolutionSizeAndStep(2000, 2000);

          expect(object.getX()).to.equal(500);
          expect(object.getY()).to.equal(900);
          expect(object.getWidth()).to.equal(10);
        });
      });
      ['topEdgeAnchor', 'bottomEdgeAnchor'].forEach((objectEdge) => {
        it(`anchors the ${objectEdge} edge of object to window bottom (fixed)`, () => {
          const object = createObject({ [objectEdge]: 2 });
          object.setPosition(500, 500);
          runtimeScene.renderAndStep(1000 / 60);

          setCamera(1300, 1400);
          setGameResolutionSizeAndStep(2000, 2000);

          expect(object.getX()).to.equal(500);
          expect(object.getY()).to.equal(1900);
          expect(object.getWidth()).to.equal(10);
        });
      });
      ['topEdgeAnchor', 'bottomEdgeAnchor'].forEach((objectEdge) => {
        it(`anchors the ${objectEdge} edge of object to window center (fixed)`, () => {
          const object = createObject({ [objectEdge]: 4 });
          object.setPosition(500, 500);
          runtimeScene.renderAndStep(1000 / 60);

          setCamera(1300, 1400);
          setGameResolutionSizeAndStep(2000, 2000);

          expect(object.getX()).to.equal(500);
          expect(object.getY()).to.equal(1400);
          expect(object.getWidth()).to.equal(10);
        });
      });

      it('anchors the top and bottom edge of object (fixed)', () => {
        const object = createObject({ topEdgeAnchor: 1, bottomEdgeAnchor: 2 });
        object.setPosition(500, 500);
        runtimeScene.renderAndStep(1000 / 60);

        setCamera(1300, 1400);
        setGameResolutionSizeAndStep(2000, 2000);

        expect(object.getX()).to.equal(500);
        expect(object.getY()).to.equal(900);
        expect(object.getHeight()).to.equal(1010);
      });

      it('anchors the top edge of object (proportional)', () => {
        const object = createObject({ topEdgeAnchor: 3 });
        object.setPosition(500, 500);
        runtimeScene.renderAndStep(1000 / 60);

        setCamera(1300, 1400);
        setGameResolutionSizeAndStep(2000, 2000);

        expect(object.getX()).to.equal(500);
        expect(object.getY()).to.equal(1400);
        expect(object.getWidth()).to.equal(10);
      });
    });
    describe('(moving object and camera)', () => {
      ['topEdgeAnchor', 'bottomEdgeAnchor'].forEach((objectEdge) => {
        it(`anchors the ${objectEdge} edge of object to window top (fixed)`, () => {
          const object = createObject({ [objectEdge]: 1 });
          object.setPosition(500, 500);
          runtimeScene.renderAndStep(1000 / 60);

          object.setPosition(600, 700);
          setCamera(1300, 1400);
          setGameResolutionSizeAndStep(2000, 2000);

          expect(object.getX()).to.equal(600);
          expect(object.getY()).to.equal(1100);
          expect(object.getWidth()).to.equal(10);
        });
      });
      ['topEdgeAnchor', 'bottomEdgeAnchor'].forEach((objectEdge) => {
        it(`anchors the ${objectEdge} edge of object to window bottom (fixed)`, () => {
          const object = createObject({ [objectEdge]: 2 });
          object.setPosition(500, 500);
          runtimeScene.renderAndStep(1000 / 60);

          object.setPosition(600, 700);
          setCamera(1300, 1400);
          setGameResolutionSizeAndStep(2000, 2000);

          expect(object.getX()).to.equal(600);
          expect(object.getY()).to.equal(2100);
          expect(object.getWidth()).to.equal(10);
        });
      });
      ['topEdgeAnchor', 'bottomEdgeAnchor'].forEach((objectEdge) => {
        it(`anchors the ${objectEdge} edge of object to window center (fixed)`, () => {
          const object = createObject({ [objectEdge]: 4 });
          object.setPosition(500, 500);
          runtimeScene.renderAndStep(1000 / 60);

          object.setPosition(600, 700);
          setCamera(1300, 1400);
          setGameResolutionSizeAndStep(2000, 2000);

          expect(object.getX()).to.equal(600);
          expect(object.getY()).to.equal(1600);
          expect(object.getWidth()).to.equal(10);
        });
      });

      it('anchors the top and bottom edge of object (fixed)', () => {
        const object = createObject({ topEdgeAnchor: 1, bottomEdgeAnchor: 2 });
        object.setPosition(500, 500);
        runtimeScene.renderAndStep(1000 / 60);

        object.setPosition(600, 700);
        setCamera(1300, 1400);
        setGameResolutionSizeAndStep(2000, 2000);

        expect(object.getX()).to.equal(600);
        expect(object.getY()).to.equal(1100);
        expect(object.getHeight()).to.equal(1010);
      });

      it('anchors the top edge of object (proportional)', () => {
        const object = createObject({ topEdgeAnchor: 3 });
        object.setPosition(500, 500);
        runtimeScene.renderAndStep(1000 / 60);

        object.setPosition(600, 700);
        setCamera(1300, 1400);
        setGameResolutionSizeAndStep(2000, 2000);

        expect(object.getX()).to.equal(600);
        expect(object.getY()).to.equal(1800);
        expect(object.getWidth()).to.equal(10);
      });
    });
  });

  it('can fill the screen with an object (with custom origin)', () => {
    setGameResolutionSizeAndStep(1000, 500);

    const object = createSpriteWithOriginAtCenter({
      leftEdgeAnchor: 1,
      topEdgeAnchor: 1,
      rightEdgeAnchor: 2,
      bottomEdgeAnchor: 2,
    });
    object.setCustomWidthAndHeight(1000, 500);
    object.setPosition(500, 250);
    runtimeScene.renderAndStep(1000 / 60);

    setGameResolutionSizeAndStep(2000, 3000);

    expect(object.getX()).to.equal(1000);
    expect(object.getY()).to.equal(1500);
    expect(object.getWidth()).to.equal(2000);
    expect(object.getHeight()).to.equal(3000);
  });

  it('can fill the screen with an object using proportional anchors (with custom origin)', () => {
    setGameResolutionSizeAndStep(1000, 500);

    const object = createSpriteWithOriginAtCenter({
      leftEdgeAnchor: 3,
      topEdgeAnchor: 3,
      rightEdgeAnchor: 3,
      bottomEdgeAnchor: 3,
    });
    object.setCustomWidthAndHeight(1000, 500);
    object.setPosition(500, 250);
    runtimeScene.renderAndStep(1000 / 60);

    setGameResolutionSizeAndStep(2000, 3000);

    expect(object.getX()).to.equal(1000);
    expect(object.getY()).to.equal(1500);
    expect(object.getWidth()).to.equal(2000);
    expect(object.getHeight()).to.equal(3000);
  });
});
