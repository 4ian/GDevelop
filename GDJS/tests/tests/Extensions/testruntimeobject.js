/**
 * A test object doing nothing. It's only used for testing: if you want
 * an example to start a new object, take a look at gdjs.DummyRuntimeObject
 * in the Extensions folder.
 *
 * @memberof gdjs
 * @class TestRuntimeObject
 * @extends RuntimeObject
 */
gdjs.TestRuntimeObject = function(runtimeScene, objectData) {
  // *ALWAYS* call the base gdjs.RuntimeObject constructor.
  gdjs.RuntimeObject.call(this, runtimeScene, objectData);

  // *ALWAYS* call `this.onCreated()` at the very end of your object constructor.
  this.onCreated();
};

gdjs.TestRuntimeObject.prototype = Object.create(gdjs.RuntimeObject.prototype);
gdjs.TestRuntimeObject.thisIsARuntimeObjectConstructor =
  'TestObject::TestObject';

gdjs.TestRuntimeObject.prototype.getRendererObject = function() {
  return {};
};
