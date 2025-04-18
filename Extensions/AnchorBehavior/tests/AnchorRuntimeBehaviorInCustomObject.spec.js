// @ts-check
describe.only('gdjs.AnchorRuntimeBehavior', () => {
  it('can fill a custom object with an child', async () => {
    const runtimeGame = await gdjs.getPixiRuntimeGameWithAssets();
    const runtimeScene = new gdjs.TestRuntimeScene(runtimeGame);
    // The corresponding event-based object declaration is done by
    // getPixiRuntimeGame.
    const customObject = new gdjs.CustomRuntimeObject2D(runtimeScene, {
      name: 'MyCustomObject',
      type: 'MyExtension::MyLayoutedEventsBasedObject',
      variables: [],
      behaviors: [],
      effects: [],
      content: {},
      childrenContent: {},
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
});
