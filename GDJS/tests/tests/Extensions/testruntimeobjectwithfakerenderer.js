/**
 * A test object doing nothing, with a fake getRendererObject method.
 *
 * It's only used for testing: if you want
 * an example to start a new object, take a look at gdjs.DummyRuntimeObject
 * in the Extensions folder.
 */
gdjs.TestRuntimeObjectWithFakeRenderer = class TestRuntimeObjectWithFakeRenderer extends gdjs.RuntimeObject {
  /**
   * @param {gdjs.RuntimeScene} runtimeScene
   * @param {ObjectData} objectData
   */
  constructor(runtimeScene, objectData) {
    // *ALWAYS* call the base gdjs.RuntimeObject constructor.
    super(runtimeScene, objectData);

    // *ALWAYS* call `this.onCreated()` at the very end of your object constructor.
    this.onCreated();
  }

  getRendererObject() {
    return { visible: true };
  }
};

gdjs.registerObject(
  'TestObjectWithFakeRenderer::TestObjectWithFakeRenderer',
  gdjs.TestRuntimeObjectWithFakeRenderer
);
