/**
 * A RuntimeScene that allows to test events side effects.
 */
gdjs.TestRuntimeScene = class TestRuntimeScene extends gdjs.RuntimeScene {

  /**
   * @param {gdjs.RuntimeGame} runtimeGame 
   */
  constructor(runtimeGame) {
    super(runtimeGame);

    this.addLayer({name: "", 
    cameras: [],
    effects: []});
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
  registerObjectWithName(name) {
    this.registerObject({name, type: '', behaviors: [], variables: [], effects: []});
  }
};
