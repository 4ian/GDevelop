// @flow

const gd: libGDevelop = global.gd;
// $FlowFixMe[cannot-resolve-module] - Runtime extensions live outside the IDE Flow root.
const clothExtensionModule = require('../../../../Extensions/ClothSimulation/JsExtension');

describe('ClothSimulation JavaScript extension declaration', () => {
  let extension;

  beforeAll(() => {
    extension = clothExtensionModule.createExtension(message => message, gd);
  });

  afterAll(() => {
    extension.delete();
  });

  test('declares the rendered-in-3D object and stable event API', () => {
    expect(extension.getName()).toBe('ClothSimulation');
    const object = extension.getObjectMetadata(
      'ClothSimulation::Cloth3DObject'
    );
    expect(object.getName()).toBe('ClothSimulation::Cloth3DObject');
    expect(object.getCategory()).toBe('General');
    expect(object.getAssetStoreTag()).toBe('3d cloth');
    expect(object.isRenderedIn3D()).toBe(true);
    expect(
      object.hasDefaultBehavior('ResizableCapability::ResizableBehavior')
    ).toBe(true);
    expect(
      object.hasDefaultBehavior('ScalableCapability::ScalableBehavior')
    ).toBe(true);
    expect(
      object.hasDefaultBehavior('FlippableCapability::FlippableBehavior')
    ).toBe(true);
    expect(object.hasDefaultBehavior('Scene3D::Base3DBehavior')).toBe(true);

    const actions = object.getAllActions();
    expect(
      actions.has('ClothSimulation::Cloth3DObject::SetSimulationEnabled')
    ).toBe(true);
    expect(
      actions
        .get('ClothSimulation::Cloth3DObject::SetGravity')
        .getFunctionName()
    ).toBe('setGravity');
    expect(
      actions.get('ClothSimulation::Cloth3DObject::PinVertex').getFunctionName()
    ).toBe('pinVertex');
    const conditions = object.getAllConditions();
    expect(
      conditions.has('ClothSimulation::Cloth3DObject::IsUsingWebGPU')
    ).toBe(true);
    expect(
      conditions.has('ClothSimulation::Cloth3DObject::IsBudgetPaused')
    ).toBe(true);
    const expressions = object.getAllExpressions();
    expect(expressions.has('ActualSegmentsX')).toBe(true);
    expect(expressions.has('DroppedSimulationTime')).toBe(true);
    expect(object.getAllStrExpressions().has('ActiveBackend')).toBe(true);
  });
});
