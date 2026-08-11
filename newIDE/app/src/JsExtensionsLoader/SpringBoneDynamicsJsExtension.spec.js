// @flow

const gd: libGDevelop = global.gd;
// $FlowFixMe[cannot-resolve-module] - Runtime extensions live outside the IDE Flow root.
const springBoneExtensionModule = require('../../../../Extensions/SpringBoneDynamics/JsExtension');

describe('SpringBoneDynamics JavaScript extension declaration', () => {
  let extension;

  beforeAll(() => {
    extension = springBoneExtensionModule.createExtension(
      message => message,
      gd
    );
  });

  afterAll(() => {
    extension.delete();
  });

  test('declares the model-only behavior and stable event API', () => {
    expect(extension.getName()).toBe('SpringBoneDynamics');
    const behavior = extension.getBehaviorMetadata(
      'SpringBoneDynamics::SpringBone3DBehavior'
    );
    expect(behavior.getObjectType()).toBe('Scene3D::Model3DObject');
    expect(
      behavior
        .getAllActions()
        .has('SpringBoneDynamics::SetSimulationEnabled')
    ).toBe(true);
    expect(
      behavior
        .getAllConditions()
        .has('SpringBoneDynamics::IsUsingWebGPU')
    ).toBe(true);
    expect(
      behavior
        .getAllConditions()
        .has('SpringBoneDynamics::HasChain')
    ).toBe(true);
    expect(
      behavior.getAllStrExpressions().has('ActiveBackend')
    ).toBe(true);
    expect(
      behavior.getAllStrExpressions().has('ConfigurationStatus')
    ).toBe(
      true
    );
    expect(
      behavior.getAllExpressions().has('SimulatedBoneCount')
    ).toBe(true);
  });
});
