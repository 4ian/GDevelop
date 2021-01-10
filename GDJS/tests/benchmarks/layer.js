// @ts-check

describe('gdjs.Layer', function() {
  var runtimeGame = new gdjs.RuntimeGame({
    variables: [],
    resources: { resources: [] },
    // @ts-expect-error ts-migrate(2740) FIXME: Type '{ windowWidth: number; windowHeight: number;... Remove this comment to see the full error message
    properties: { windowWidth: 800, windowHeight: 600 },
  });
  var runtimeScene = new gdjs.RuntimeScene(runtimeGame);

  it('benchmark convertCoords and convertInverseCoords', function() {
    this.timeout(20000);
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
    benchmarkSuite
      .add('convertCoords', () => {
        layer.convertCoords(350, 450, 0);
      })
      .add('convertInverseCoords', () => {
        layer.convertInverseCoords(350, 450, 0);
      });

    console.log(benchmarkSuite.run());
  });
});
