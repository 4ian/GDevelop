namespace gdjs {
  const logger = new gdjs.Logger('Dummy object');

  /**
   * A dummy object doing showing a text on screen.
   * @ignore
   */
  export class DummyRuntimeObject extends gdjs.RuntimeObject {
    // Load any required data from the object properties.
    _property1: string;

    // Create the renderer (see dummyruntimeobject-pixi-renderer.js)
    _renderer: any;
    // @ts-expect-error ts-migrate(2564) FIXME: Property 'opacity' has no initializer and is not d... Remove this comment to see the full error message
    opacity: float;

    constructor(instanceContainer: gdjs.RuntimeInstanceContainer, objectData) {
      // *ALWAYS* call the base gdjs.RuntimeObject constructor.
      super(instanceContainer, objectData);
      this._property1 = objectData.content.property1;
      this._renderer = new gdjs.DummyRuntimeObjectRenderer(
        this,
        instanceContainer
      );

      // *ALWAYS* call `this.onCreated()` at the very end of your object constructor.
      this.onCreated();
    }

    getRendererObject() {
      return this._renderer.getRendererObject();
    }

    updateFromObjectData(oldObjectData, newObjectData): boolean {
      // Compare previous and new data for the object and update it accordingly.
      // This is useful for "hot-reloading".
      if (oldObjectData.content.property1 !== newObjectData.content.property1) {
        this._property1 = newObjectData.content.property1;
        this._renderer.updateText();
      }
      return true;
    }

    /**
     * Called once during the game loop, before events and rendering.
     * @param instanceContainer The gdjs.RuntimeScene the object belongs to.
     */
    update(instanceContainer: gdjs.RuntimeInstanceContainer): void {
      // This is an example: typically you want to make sure the renderer
      // is up to date with the object.
      this._renderer.ensureUpToDate();
    }

    /**
     * Initialize the extra parameters that could be set for an instance.
     */
    extraInitializationFromInitialInstance(initialInstanceData: InstanceData) {}

    // For example:
    // this.setSomething(initialInstanceData.something);
    /**
     * Update the object position.
     */
    private _updatePosition() {
      // This is an example: typically you want to tell the renderer to update
      // the position of the object.
      this._renderer.updatePosition();
    }

    /**
     * Set object position on X axis.
     */
    setX(x: float): void {
      // Always call the parent method first.
      super.setX(x);
      this._updatePosition();
    }

    /**
     * Set object position on Y axis.
     */
    setY(y: float): void {
      // Always call the parent method first.
      super.setY(y);
      this._updatePosition();
    }

    /**
     * Set the angle of the object.
     * @param angle The new angle of the object
     */
    setAngle(angle: float): void {
      // Always call the parent method first.
      super.setAngle(angle);

      // Tell the renderer to update the rendered object
      this._renderer.updateAngle();
    }

    /**
     * Set object opacity.
     */
    setOpacity(opacity): void {
      if (opacity < 0) {
        opacity = 0;
      }
      if (opacity > 255) {
        opacity = 255;
      }
      this.opacity = opacity;

      // Tell the renderer to update the rendered object
      this._renderer.updateOpacity();
    }

    /**
     * Get object opacity.
     */
    getOpacity() {
      return this.opacity;
    }

    /**
     * Get the text that must be displayed by the dummy object.
     */
    getText() {
      return this._property1;
    }

    /**
     * A dummy method that can be called from events
     */
    myMethod(number1: float, text1: string) {
      logger.log('Congrats, this method was called on a DummyRuntimeObject');
      logger.log('Here is the object:', this);
      logger.log('Here are the arguments passed from events:', number1, text1);
    }
  }
  gdjs.registerObject(
    //Replace by your extension + object name.
    'MyDummyExtension::DummyObject',
    gdjs.DummyRuntimeObject
  );
}
