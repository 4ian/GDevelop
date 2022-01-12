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

    // greater values can be set to benchmark a case
    // where a lot of mouse conditions are used in events.
    const evaluationPerFrame = 8;

    const benchmarkSuite = makeBenchmarkSuite({
      benchmarksCount: 50,
      iterationsCount: 100000,
    });
    benchmarkSuite
      .add('convertCoords translation', (iteration) => {
        // new frame, new translation
        layer.setCameraX(100 + iteration, 0);
        layer.setCameraY(200 + iteration, 0);
        layer.setCameraRotation(0, 0);
        // some mouse conditions
        for (let evaluationIndex = 0; evaluationIndex < evaluationPerFrame; evaluationIndex++) {
          layer.convertCoords(350 + evaluationIndex, 450 + evaluationIndex, 0);
        }
      })
      .add('convertInverseCoords translation', (iteration) => {
        // new frame, new translation
        layer.setCameraX(100 + iteration, 0);
        layer.setCameraY(200 + iteration, 0);
        layer.setCameraRotation(0, 0);
        // some mouse conditions
        for (let evaluationIndex = 0; evaluationIndex < evaluationPerFrame; evaluationIndex++) {
          layer.convertInverseCoords(350 + evaluationIndex, 450 + evaluationIndex, 0);
        }
      })
      .add('convertCoords rotation', (iteration) => {
        // new frame, new rotation
        layer.setCameraX(100, 0);
        layer.setCameraY(200, 0);
        layer.setCameraRotation(1.1 * iteration, 0);
        // some mouse conditions
        for (let evaluationIndex = 0; evaluationIndex < evaluationPerFrame; evaluationIndex++) {
          layer.convertCoords(350 + evaluationIndex, 450 + evaluationIndex, 0);
        }
      })
      .add('convertInverseCoords rotation', (iteration) => {
        // new frame, new rotation
        layer.setCameraX(100, 0);
        layer.setCameraY(200, 0);
        layer.setCameraRotation(1.1 * iteration, 0);
        // some mouse conditions
        for (let evaluationIndex = 0; evaluationIndex < evaluationPerFrame; evaluationIndex++) {
          layer.convertInverseCoords(350 + evaluationIndex, 450 + evaluationIndex, 0);
        }
      });

    console.log(benchmarkSuite.run());
  });
});
