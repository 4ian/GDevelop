// @ts-check

describe('gdjs.ShapePainterRuntimeObject (using a PixiJS RuntimeGame with assets)', function () {
  /**
   * @param {gdjs.RuntimeScene} runtimeScene
   */
  const makeShapePainterRuntimeObject = (runtimeScene) =>
    new gdjs.ShapePainterRuntimeObject(runtimeScene, {
      name: 'obj1',
      type: 'PrimitiveDrawing::Drawer',
      variables: [],
      behaviors: [],
      effects: [],
      fillColor: { r: 0, g: 0, b: 0 },
      outlineColor: { r: 0, g: 0, b: 0 },
      fillOpacity: 255,
      outlineOpacity: 255,
      outlineSize: 1,
      absoluteCoordinates: false,
      clearBetweenFrames: false,
      antialiasing: 'low',
    });

  /** @param {gdjs.RuntimeScene} runtimeScene */
  const loadScene = (runtimeScene) => {
    runtimeScene.loadFromScene({
      layers: [
        {
          name: '',
          visibility: true,
          effects: [],
          cameras: [],
          ambientLightColorR: 0,
          ambientLightColorG: 0,
          ambientLightColorB: 0,
          isLightingLayer: false,
          followBaseLayerCamera: true,
        },
      ],
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
      variables: [],
      usedResources: [],
    });
  };

  it('properly computes bounds of the object (basics)', async () => {
    const runtimeGame = await gdjs.getPixiRuntimeGameWithAssets();
    const runtimeScene = new gdjs.RuntimeScene(runtimeGame);
    loadScene(runtimeScene);

    const object = makeShapePainterRuntimeObject(runtimeScene);

    expect(object.getWidth()).to.be(0);
    expect(object.getHeight()).to.be(0);

    object.drawLineV2(10, 10, 20, 30, 3);

    // Check the automatically computed bounds:
    const drawableX = 8.658359213500127;
    const drawableY = 9.329179606750063;
    const width = 12.683281572999746;
    const height = 21.341640786499873;
    expect(object.getDrawableX()).to.be(drawableX);
    expect(object.getDrawableY()).to.be(drawableY);
    expect(object.getWidth()).to.be(width);
    expect(object.getHeight()).to.be(height);

    // Check the automatic center positioning:
    expect(object.getCenterXInScene()).to.be(15);
    expect(object.getCenterYInScene()).to.be(20);
    expect(object.getCenterX()).to.be(15 - drawableX);
    expect(object.getCenterY()).to.be(20 - drawableY);

    // Check hit boxes:
    expect(object.getAABB()).to.eql({
      min: [drawableX, drawableY],
      max: [drawableX + width, drawableY + height],
    });

    // Check after scaling (scaling is done from the origin):
    object.setScale(2);
    expect(object.getDrawableX()).to.be(2 * drawableX);
    expect(object.getDrawableY()).to.be(2 * drawableY);
    expect(object.getWidth()).to.be(2 * width);
    expect(object.getHeight()).to.be(2 * height);
    expect(object.getAABB()).to.eql({
      min: [2 * drawableX, 2 * drawableY],
      max: [2 * (drawableX + width), 2 * (drawableY + height)],
    });

    // Check after rotating (rotating is done from the center):
    object.setAngle(45);
    expect(object.getDrawableX()).to.be(2 * drawableX); // Drawable X/Y is not impacted...
    expect(object.getDrawableY()).to.be(2 * drawableY);
    expect(object.getWidth()).to.be(2 * width); // ...Neither is the size
    expect(object.getHeight()).to.be(2 * height);
    expect(object.getAABB()).to.eql({
      // The hit boxes/AABB are rotated:
      min: [5.940746670252036, 15.940746670252032],
      max: [54.05925332974796, 64.05925332974797],
    });
  });

  it('properly computes bounds of the object (custom center)', async () => {
    const runtimeGame = await gdjs.getPixiRuntimeGameWithAssets();
    const runtimeScene = new gdjs.RuntimeScene(runtimeGame);
    loadScene(runtimeScene);

    const object = makeShapePainterRuntimeObject(runtimeScene);

    expect(object.getWidth()).to.be(0);
    expect(object.getHeight()).to.be(0);

    object.drawLineV2(10, 10, 20, 30, 3);
    object.setRotationCenter(10, 9);

    // Check the automatically computed bounds (not impacted by the center):
    const drawableX = 8.658359213500127;
    const drawableY = 9.329179606750063;
    const width = 12.683281572999746;
    const height = 21.341640786499873;
    expect(object.getDrawableX()).to.be(drawableX);
    expect(object.getDrawableY()).to.be(drawableY);
    expect(object.getWidth()).to.be(width);
    expect(object.getHeight()).to.be(height);

    // Check the center positioning:
    expect(object.getCenterXInScene()).to.be(10);
    expect(object.getCenterYInScene()).to.be(9);
    expect(object.getCenterX()).to.be(10 - drawableX);
    expect(object.getCenterY()).to.be(9 - drawableY);

    // Check hit boxes (not impacted by the center, as no rotation is made):
    expect(object.getAABB()).to.eql({
      min: [drawableX, drawableY],
      max: [drawableX + width, drawableY + height],
    });

    // Check after scaling (scaling is done from the origin):
    object.setScale(2);
    expect(object.getDrawableX()).to.be(2 * drawableX);
    expect(object.getDrawableY()).to.be(2 * drawableY);
    expect(object.getWidth()).to.be(2 * width);
    expect(object.getHeight()).to.be(2 * height);
    expect(object.getAABB()).to.eql({
      min: [2 * drawableX, 2 * drawableY],
      max: [2 * (drawableX + width), 2 * (drawableY + height)],
    });

    // Check after rotating (rotating is done from the center):
    object.setAngle(45);
    expect(object.getAABB()).to.eql({
      // The hit boxes/AABB are rotated:
      min: [-12.544534703986535, 16.568163668221555],
      max: [35.57397195550939, 64.6866703277175],
    });

    // Draw outside of the current bounds.
    const oldMinX = object.getAABB().min[0];
    const oldMinY = object.getAABB().min[1];
    const oldMaxX = object.getAABB().max[0];
    const oldMaxY = object.getAABB().max[1];
    const oldCenterX = object.getCenterXInScene();
    const oldCenterY = object.getCenterYInScene();
    object.drawLineV2(-10, -10, 21, 31, 3);

    // Check that the center stays the same.
    expect(object.getCenterXInScene()).to.be(oldCenterX);
    expect(object.getCenterYInScene()).to.be(oldCenterY);

    // Check that the AABB expands.
    const newAABB = object.getAABB();
    expect(newAABB.min[0]).below(oldMinX);
    expect(newAABB.min[1]).below(oldMinY);
    expect(newAABB.max[0]).above(oldMaxX);
    expect(newAABB.max[1]).above(oldMaxY);
  });

  it('can transform points', async () => {
    const runtimeGame = await gdjs.getPixiRuntimeGameWithAssets();
    const runtimeScene = new gdjs.RuntimeScene(runtimeGame);
    loadScene(runtimeScene);

    const object = makeShapePainterRuntimeObject(runtimeScene);

    object.drawLineV2(0, 0, 10, 10, 2);
    expect(object.getWidth()).to.be(11.414213562373096);
    expect(object.getHeight()).to.be(11.414213562373096);

    // Check changes in position/scale are taken into account:
    object.setPosition(50, 100);
    expect(object.transformToScene(10, 20)).to.eql([60, 120]);

    object.setScale(2);
    expect(object.transformToScene(10, 20)).to.eql([70, 140]);

    // Check rotation with the default center:
    expect(object.getCenterXInScene()).to.be(60);
    expect(object.getCenterYInScene()).to.be(110);
    expect(object.transformToScene(5, 5)).to.eql([60, 110]);
    expect(object.transformToScene(10, 20)).to.eql([70, 140]);

    object.setAngle(90);
    expect(object.transformToScene(5, 5)).to.eql([60, 110]);
    expect(object.transformToScene(10, 20)).to.eql([30, 120]);

    // Check rotation with a custom center:
    object.setRotationCenter(20, 9);
    expect(object.transformToScene(10, 20)).to.eql([68, 98]);
    expect(object.transformToDrawing(68, 98)).to.eql([10, 20]);
  });
});
