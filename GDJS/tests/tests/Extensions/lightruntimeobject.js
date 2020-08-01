/**
 * Tests for Light Object
 */

describe('gdjs.LightRuntimeObject', function () {
  const runtimeScene = new gdjs.RuntimeScene(null);
  const lightObj = new gdjs.LightRuntimeObject(runtimeScene, {
    name: 'obj1',
    type: 'Lighting::LightObject',
    variables: [],
    behaviors: [],
    content: {
      radius: 100,
      color: '#b4b4b4',
      texture: '',
      debugMode: false,
    },
  });
  lightObj.setX(200);
  lightObj.setY(200);

  it('check object properties', function () {
    expect(lightObj.getRadius()).to.be(100);
    expect(lightObj.getColor()).to.eql([180, 180, 180]);
    expect(lightObj.getDebugMode()).to.be(false);
    expect(lightObj.getDrawableX()).to.be(100);
    expect(lightObj.getDrawableY()).to.be(100);
  });

  it('bail out early while raycasting when there is no light obstacle', function () {
    expect(lightObj._renderer._computeLightVertices()).to.eql([]);
    lightObj._renderer._updateBuffers();
    expect(lightObj._renderer._defaultVertexBuffer).to.eql(
      new Float32Array([100, 300, 300, 300, 300, 100, 100, 100])
    );
    expect(gdjs.LightRuntimeObjectPixiRenderer._defaultIndexBuffer).to.eql(
      new Float32Array([0, 1, 2, 0, 2, 3])
    );
  });
});
