/**
 * A test object doing nothing. It's only used for testing: if you want
 * an example to start a new object, take a look at gdjs.DummyRuntimeObject
 * in the Extensions folder.
 */
gdjs.TestRuntimeObject = class TestRuntimeObject extends (
  gdjs.RuntimeObject
) {
  constructor(runtimeScene, objectData) {
    // *ALWAYS* call the base gdjs.RuntimeObject constructor.
    super(runtimeScene, objectData);

    // *ALWAYS* call `this.onCreated()` at the very end of your object constructor.
    this.onCreated();
  }

  getRendererObject() {
    return {};
  }
};

gdjs.registerObject('TestObject::TestObject', gdjs.TestRuntimeObject);
