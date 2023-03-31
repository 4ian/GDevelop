/**
 * A RuntimeScene that allows to test events side effects.
 */
gdjs.TestRuntimeScene = class TestRuntimeScene extends gdjs.RuntimeScene {
  /**
   * @param {gdjs.RuntimeGame} runtimeGame
   */
  constructor(runtimeGame) {
    super(runtimeGame);

    this.addLayer({ name: '', cameras: [], effects: [] });
  }

  /**
   * @param {float} elapsedTime
   * @param {() => void} eventsFunction
   */
  renderAndStepWithEventsFunction(elapsedTime, eventsFunction) {
    const runtimeScene = this;
    this._eventsFunction = (runtimeScene) => eventsFunction();
    this.renderAndStep(elapsedTime);
    this._eventsFunction = null;
  }

  /**
   * @param {string} name
   */
  registerEmptyObjectWithName(name) {
    this.registerObject({
      name,
      type: '',
      behaviors: [],
      variables: [],
      effects: [],
    });
  }

  /**
   * @param {string} name
   * @return {gdjs.RuntimeObject} Created object.
   */
  createObject(name) {
    const object = super.createObject(name);
    if (!object) {
      throw new Error('Can not create an instance of the object: ' + name);
    }
    return object;
  }
};
