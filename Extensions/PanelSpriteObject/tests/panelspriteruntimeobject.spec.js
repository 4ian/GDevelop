// @ts-check

/**
 * Basic tests for gdjs.PanelSpriteRuntimeObject
 */
describe('gdjs.PanelSpriteRuntimeObject', function () {
  const { runtimeScene } = gdjs.makeTestRuntimeGameAndRuntimeScene();

  it('should handle scaling properly', function () {
    const object = new gdjs.PanelSpriteRuntimeObject(runtimeScene, {
      name: 'obj1',
      type: '',
      variables: [],
      behaviors: [],
      effects: [],
      rightMargin: 10,
      leftMargin: 10,
      topMargin: 10,
      bottomMargin: 10,
      tiled: true,
      width: 100,
      height: 200,
      texture: '',
    });

    expect(object.getWidth()).to.be(100);
    expect(object.getHeight()).to.be(200);
    object.setWidth(50);
    object.setHeight(75);
    expect(object.getWidth()).to.be(50);
    expect(object.getHeight()).to.be(75);
    object.setWidth(-20);
    object.setHeight(-100);
    expect(object.getWidth()).to.be(0);
    expect(object.getHeight()).to.be(0);
  });
});
