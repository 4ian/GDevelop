// @ts-check
describe('gdjs.AnchorRuntimeBehavior', () => {
  it('can fill a custom object with a child', async () => {
    const runtimeGame = await gdjs.getPixiRuntimeGameWithAssets();
    const runtimeScene = new gdjs.TestRuntimeScene(runtimeGame);
    // The corresponding event-based object declaration is done by
    // getPixiRuntimeGame.
    const customObject = new gdjs.CustomRuntimeObject2D(runtimeScene, {
      name: 'MyCustomObject',
      type: 'MyExtension::MyLayoutedEventsBasedObject',
      variant: '',
      variables: [],
      behaviors: [],
      effects: [],
      content: {},
      childrenContent: {},
      isInnerAreaFollowingParentSize: false,
    });
    runtimeScene.addObject(customObject);
    customObject.setPosition(500, 250);

    const childObjects = customObject
      .getChildrenContainer()
      .getObjects('MySprite');
    if (!childObjects || childObjects.length === 0) {
      throw new Error("Can't get child objects.");
    }
    const childObject = childObjects[0];

    runtimeScene.renderAndStep(1000 / 60);

    // The child object keeps its initial location.
    expect(childObject.getX()).to.equal(0);
    expect(childObject.getY()).to.equal(0);
    expect(childObject.getWidth()).to.equal(64);
    expect(childObject.getHeight()).to.equal(64);

    customObject.setWidth(2000);
    customObject.setHeight(3000);
    runtimeScene.renderAndStep(1000 / 60);

    expect(childObject.getX()).to.equal(0);
    expect(childObject.getY()).to.equal(0);
    expect(childObject.getWidth()).to.equal(2000);
    expect(childObject.getHeight()).to.equal(3000);
  });

  it('can anchor 2 instances of the same object left and right', async () => {
    const runtimeGame = await gdjs.getPixiRuntimeGameWithAssets({
      customObjectInstances: [
        {
          angle: 0,
          customSize: true,
          height: 64,
          layer: '',
          name: 'MySprite',
          persistentUuid: '668db48d-4e12-4b6f-aa6b-f73b74bf608e',
          width: 32,
          x: 0,
          y: 0,
          zOrder: 1,
          numberProperties: [],
          stringProperties: [],
          initialVariables: [],
          behaviorOverridings: [
            // Magnet on the left
            {
              name: 'AnchorBehavior',
              type: 'AnchorBehavior::AnchorBehavior',
              rightEdgeAnchor: 0,
            },
          ],
        },
        {
          angle: 0,
          customSize: true,
          height: 64,
          layer: '',
          name: 'MySprite',
          persistentUuid: '668db48d-4e12-4b6f-aa6b-f73b74bf608e',
          width: 32,
          x: 32,
          y: 0,
          zOrder: 1,
          numberProperties: [],
          stringProperties: [],
          initialVariables: [],
          behaviorOverridings: [
            // Magnet on the right
            {
              name: 'AnchorBehavior',
              type: 'AnchorBehavior::AnchorBehavior',
              leftEdgeAnchor: 0,
            },
          ],
        },
      ],
    });
    const runtimeScene = new gdjs.TestRuntimeScene(runtimeGame);
    // The corresponding event-based object declaration is done by
    // getPixiRuntimeGame.
    const customObject = new gdjs.CustomRuntimeObject2D(runtimeScene, {
      name: 'MyCustomObject',
      type: 'MyExtension::MyLayoutedEventsBasedObject',
      variant: '',
      variables: [],
      behaviors: [],
      effects: [],
      content: {},
      childrenContent: {},
      isInnerAreaFollowingParentSize: false,
    });
    runtimeScene.addObject(customObject);
    customObject.setPosition(500, 250);

    const childObjects = customObject
      .getChildrenContainer()
      .getObjects('MySprite');
    if (!childObjects || childObjects.length === 0) {
      throw new Error("Can't get child objects.");
    }
    const leftChildObject = childObjects[0];
    const rightChildObject = childObjects[1];

    runtimeScene.renderAndStep(1000 / 60);

    // The child object keeps its initial location.
    expect(leftChildObject.getX()).to.equal(0);
    expect(leftChildObject.getY()).to.equal(0);
    expect(leftChildObject.getWidth()).to.equal(32);
    expect(leftChildObject.getHeight()).to.equal(64);

    expect(rightChildObject.getX()).to.equal(32);
    expect(rightChildObject.getY()).to.equal(0);
    expect(rightChildObject.getWidth()).to.equal(32);
    expect(rightChildObject.getHeight()).to.equal(64);

    customObject.setWidth(200);
    customObject.setHeight(300);
    runtimeScene.renderAndStep(1000 / 60);

    expect(leftChildObject.getX()).to.equal(0);
    expect(leftChildObject.getY()).to.equal(0);
    expect(leftChildObject.getWidth()).to.equal(32);
    expect(leftChildObject.getHeight()).to.equal(300);

    expect(rightChildObject.getX()).to.equal(32 + 200 - 64);
    expect(rightChildObject.getY()).to.equal(0);
    expect(rightChildObject.getWidth()).to.equal(32);
    expect(rightChildObject.getHeight()).to.equal(300);
  });
});
