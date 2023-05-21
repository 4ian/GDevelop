// @ts-check

describe('gdjs.Layer', function() {
  const runtimeGame = gdjs.getPixiRuntimeGame();
  var runtimeScene = new gdjs.RuntimeScene(runtimeGame);

  it('benchmark convertCoords and convertInverseCoords', function() {
    this.timeout(30000);
    var layer = new gdjs.Layer(
      { name: 'My layer',
        visibility: true,
        effects: [],
        cameras: [],
        isLightingLayer: false,
        followBaseLayerCamera: false,
        ambientLightColorR: 128,
        ambientLightColorG: 128,
        ambientLightColorB: 128,
      },
      runtimeScene
    );
    layer.setCameraX(100, 0);
    layer.setCameraY(200, 0);
    layer.setCameraRotation(90, 0);

    const benchmarkSuite = makeBenchmarkSuite();
    /** @type {FloatPoint} */
    const workingPoint = [0, 0];
    benchmarkSuite
      .add('convertCoords', () => {
        layer.convertCoords(350, 450, 0, workingPoint);
      })
      .add('convertInverseCoords', () => {
        layer.convertInverseCoords(350, 450, 0, workingPoint);
      });

    console.log(benchmarkSuite.run());
  });
});
