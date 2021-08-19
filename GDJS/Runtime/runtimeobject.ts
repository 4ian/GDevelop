/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  /** An axis-aligned bounding box. Used to represents a box around an object for example. */
  export type AABB = {
    /** The [x,y] coordinates of the top left point */
    min: FloatPoint;
    /** The [x,y] coordinates of the bottom right point */
    max: FloatPoint;
  };

  /**
   * Return the squared bounding radius of an object given its width/height and its center of rotation
   * (relative to the top-left of the object). The radius is relative to the center of rotation.
   */
  const computeSqBoundingRadius = (
    width: float,
    height: float,
    centerX: float,
    centerY: float
  ) => {
    const radiusX = Math.max(centerX, width - centerX);
    const radiusY = Math.max(centerY, height - centerY);
    return Math.pow(radiusX, 2) + Math.pow(radiusY, 2);
  };

  /**
   * RuntimeObject represents an object being used on a RuntimeScene.
   *
   * A `gdjs.RuntimeObject` should not be instantiated directly, always a child class
   * (because gdjs.RuntimeObject don't call onCreated at the end of its constructor).
   */
  export class RuntimeObject {
    name: string;
    type: string;
    x: float = 0;
    y: float = 0;
    angle: float = 0;
    zOrder: integer = 0;
    hidden: boolean = false;
    layer: string = '';
    protected _nameId: integer;
    protected _livingOnScene: boolean = true;

    readonly id: integer;
    _runtimeScene: gdjs.RuntimeScene;

    /**
     * An optional UUID associated to the object to be used
     * for hot reload. Don't modify or use otherwise.
     */
    persistentUuid: string | null = null;

    /**
     * A property to be used by external algorithms to indicate if the
     * object is picked or not in an object selection. By construction, this is
     * not "thread safe" or "re-entrant algorithm" safe.
     */
    pick: boolean = false;

    //Hit boxes:
    protected _defaultHitBoxes: gdjs.Polygon[] = [];
    protected hitBoxes: gdjs.Polygon[];
    protected hitBoxesDirty: boolean = true;
    protected aabb: AABB = { min: [0, 0], max: [0, 0] };

    //Variables:
    protected _variables: gdjs.VariablesContainer;

    //Effects:
    protected _rendererEffects: Record<string, PixiFiltersTools.Filter> = {};

    //Forces:
    protected _forces: gdjs.Force[] = [];
    _averageForce: gdjs.Force;

    /**
     * Contains the behaviors of the object.
     */
    protected _behaviors: gdjs.RuntimeBehavior[] = [];
    protected _behaviorsTable: Hashtable<gdjs.RuntimeBehavior>;
    protected _timers: Hashtable<gdjs.Timer>;

    /**
     * @param runtimeScene The scene the object belongs to..
     * @param objectData The initial properties of the object.
     */
    constructor(runtimeScene: gdjs.RuntimeScene, objectData: ObjectData) {
      this.name = objectData.name || '';
      this.type = objectData.type || '';
      this._nameId = RuntimeObject.getNameIdentifier(this.name);
      this.id = runtimeScene.createNewUniqueId();
      this._runtimeScene = runtimeScene;
      this._defaultHitBoxes.push(gdjs.Polygon.createRectangle(0, 0));
      this.hitBoxes = this._defaultHitBoxes;
      this._variables = new gdjs.VariablesContainer(
        objectData ? objectData.variables : undefined
      );
      this._averageForce = new gdjs.Force(0, 0, 0);
      this._behaviorsTable = new Hashtable();
      for (let i = 0; i < objectData.effects.length; ++i) {
        this.initializeEffect(objectData.effects[i]);
        this.updateAllEffectParameters(objectData.effects[i]);
      }

      //Also contains the behaviors: Used when a behavior is accessed by its name ( see getBehavior ).
      for (let i = 0, len = objectData.behaviors.length; i < len; ++i) {
        const autoData = objectData.behaviors[i];
        const Ctor = gdjs.getBehaviorConstructor(autoData.type);
        this._behaviors.push(new Ctor(runtimeScene, autoData, this));
        this._behaviorsTable.put(autoData.name, this._behaviors[i]);
      }
      this._timers = new Hashtable();
    }

    //Common members functions related to the object and its runtimeScene :
    /**
     * To be called by the child classes in their constructor, at the very end.
     * Notify the behaviors that they have been constructed (this must be done when
     * the object is ready, otherwise behaviors can do operations on the object which
     * could be not initialized yet).
     *
     * If you redefine this function, **make sure to call the original method**
     * (`RuntimeObject.prototype.onCreated.call(this);`).
     */
    onCreated(): void {
      for (let i = 0; i < this._behaviors.length; ++i) {
        this._behaviors[i].onCreated();
      }

      const objectEffectsManager = this._runtimeScene
        .getGame()
        .getObjectEffectsManager();
      for (const filterName in this._rendererEffects) {
        objectEffectsManager.applyEffect(
          this.getRendererObject(),
          this._rendererEffects[filterName]
        );
      }
    }

    /**
     * Called to reset the object to its default state. This is used for objects that are
     * "recycled": they are dismissed (at which point `onDestroyFromScene` is called) but still
     * stored in a cache to be reused next time an object must be created. At this point,
     * `reinitialize` will be called. The object must then work as if it was a newly constructed
     * object.
     *
     * To implement this in your object:
     * * Set `gdjs.YourRuntimeObject.supportsReinitialization = true;` to declare support for recycling.
     * * Implement `reinitialize`. It **must** call the `reinitialize` of `gdjs.RuntimeObject`, and call `this.onCreated();`
     * at the end of `reinitizalize`.
     * * It must reset the object as if it was newly constructed (be careful about your renderers and any global state).
     * * The `_runtimeScene`, `_nameId`, `name` and `type` are guaranteed to stay the same and do not
     * need to be set again.
     *
     */
    reinitialize(objectData: ObjectData): void {
      const runtimeScene = this._runtimeScene;
      this.x = 0;
      this.y = 0;
      this.angle = 0;
      this.zOrder = 0;
      this.hidden = false;
      this.layer = '';
      this._livingOnScene = true;
      //@ts-ignore Reinitialize is like a constructor, it can overwrite the readonly property.
      this.id = runtimeScene.createNewUniqueId();
      this.persistentUuid = null;
      this.pick = false;
      this.hitBoxesDirty = true;
      this.aabb.min[0] = 0;
      this.aabb.min[1] = 0;
      this.aabb.max[0] = 0;
      this.aabb.max[1] = 0;
      this._variables = new gdjs.VariablesContainer(objectData.variables);
      this.clearForces();
      this._behaviorsTable.clear();
      let i = 0;
      for (const len = objectData.behaviors.length; i < len; ++i) {
        const behaviorData = objectData.behaviors[i];
        const Ctor = gdjs.getBehaviorConstructor(behaviorData.type);
        if (i < this._behaviors.length) {
          // TODO: Add support for behavior recycling with a `reinitialize` method.
          this._behaviors[i] = new Ctor(runtimeScene, behaviorData, this);
        } else {
          this._behaviors.push(new Ctor(runtimeScene, behaviorData, this));
        }
        this._behaviorsTable.put(behaviorData.name, this._behaviors[i]);
      }
      this._behaviors.length = i;

      // Make sure to delete already existing behaviors which are not used anymore.
      this._timers.clear();
    }

    static supportsReinitialization = false;

    /**
     * Return the time elapsed since the last frame,
     * in milliseconds, for the object.
     *
     * Objects can have different elapsed time if they are on layers with different time scales.
     *
     * @param runtimeScene The RuntimeScene the object belongs to.
     */
    getElapsedTime(runtimeScene: gdjs.RuntimeScene): float {
      //TODO: Memoize?
      const theLayer = runtimeScene.getLayer(this.layer);
      return theLayer.getElapsedTime();
    }

    /**
     * Called once during the game loop, before events and rendering.
     * @param runtimeScene The gdjs.RuntimeScene the object belongs to.
     */
    update(runtimeScene: gdjs.RuntimeScene): void {
      const layer = this._runtimeScene.getLayer(this.layer);
      this._runtimeScene
        .getGame()
        .getObjectEffectsManager()
        .update(this._rendererEffects, layer);
    }

    /**
     * Called once during the game loop, after events and before rendering.
     * @param runtimeScene The gdjs.RuntimeScene the object belongs to.
     */
    updatePreRender(runtimeScene: gdjs.RuntimeScene): void {}

    //Nothing to do.
    /**
     * Called when the object is created from an initial instance at the startup of the scene.<br>
     * Note that common properties (position, angle, z order...) have already been setup.
     *
     * @param initialInstanceData The data of the initial instance.
     */
    extraInitializationFromInitialInstance(
      initialInstanceData: InstanceData
    ): void {}

    /**
     * Update the effects during hot-reload
     * @param oldEffectData Old effect data
     * @param newEffectData New effect data
     * @returns
     */
    _hotReloadRuntimeObjectEffects(
      oldEffectData: EffectData[],
      newEffectData: EffectData[]
    ): boolean {
      for (let i = 0; i < oldEffectData.length; ++i) {
        this.removeEffect(oldEffectData[i].name);
      }
      for (let i = 0; i < newEffectData.length; ++i) {
        this.addEffect(newEffectData[i]);
      }
      return true;
    }

    //Nothing to do.
    /**
     * Called when the object must be updated using the specified objectData. This is the
     * case during hot-reload, and is only called if the object was modified.
     *
     * @param oldObjectData The previous data for the object.
     * @param newObjectData The new data for the object.
     * @returns true if the object was updated, false if it could not (i.e: hot-reload is not supported).
     */
    updateFromObjectData(
      oldObjectData: ObjectData,
      newObjectData: ObjectData
    ): boolean {
      return this._hotReloadRuntimeObjectEffects(
        oldObjectData.effects,
        newObjectData.effects
      );
    }

    /**
     * Remove an object from a scene.
     *
     * Do not change/redefine this method. Instead, redefine the onDestroyFromScene method.
     * @param runtimeScene The RuntimeScene owning the object.
     */
    deleteFromScene(runtimeScene: gdjs.RuntimeScene): void {
      if (this._livingOnScene) {
        runtimeScene.markObjectForDeletion(this);
        this._livingOnScene = false;
      }
    }

    /**
     * Called when the object is destroyed (because it is removed from a scene or the scene
     * is being unloaded). If you redefine this function, **make sure to call the original method**
     * (`RuntimeObject.prototype.onDestroyFromScene.call(this, runtimeScene);`).
     *
     * @param runtimeScene The scene owning the object.
     */
    onDestroyFromScene(runtimeScene: gdjs.RuntimeScene): void {
      const theLayer = runtimeScene.getLayer(this.layer);
      const rendererObject = this.getRendererObject();
      if (rendererObject) {
        theLayer.getRenderer().removeRendererObject(rendererObject);
      }
      for (let j = 0, lenj = this._behaviors.length; j < lenj; ++j) {
        this._behaviors[j].onDestroy();
      }
    }

    //Rendering:
    /**
     * Called with a callback function that should be called with the internal
     * object used for rendering by the object (PIXI.DisplayObject...)
     *
     * @return The internal rendered object (PIXI.DisplayObject...)
     */
    getRendererObject(): any {
      return undefined;
    }

    //Common properties:
    /**
     * Get the name of the object.
     * @return The object's name.
     */
    getName(): string {
      return this.name;
    }

    /**
     * Get the name identifier of the object.
     * @return The object's name identifier.
     */
    getNameId(): integer {
      return this._nameId;
    }

    /**
     * Get the unique identifier of the object.<br>
     * The identifier is set by the runtimeScene owning the object.<br>
     * You can also use the id property (this._object.id) for increased efficiency instead of
     * calling this method.
     *
     * @return The object identifier
     */
    getUniqueId(): integer {
      return this.id;
    }

    /**
     * Set the position of the object.
     *
     * @param x The new X position
     * @param y The new Y position
     */
    setPosition(x: float, y: float): void {
      this.setX(x);
      this.setY(y);
    }

    /**
     * Set the X position of the object.
     *
     * @param x The new X position
     */
    setX(x: float): void {
      if (x === this.x) {
        return;
      }
      this.x = x;
      this.hitBoxesDirty = true;
    }

    /**
     * Get the X position of the object.
     *
     * @return The X position of the object
     */
    getX(): float {
      return this.x;
    }

    /**
     * Set the Y position of the object.
     *
     * @param y The new Y position
     */
    setY(y: float): void {
      if (y === this.y) {
        return;
      }
      this.y = y;
      this.hitBoxesDirty = true;
    }

    /**
     * Get the Y position of the object.
     *
     * @return The Y position of the object
     */
    getY(): float {
      return this.y;
    }

    /**
     * Get the X position of the rendered object.
     *
     * For most objects, this will returns the same value as getX(). But if the object
     * has an origin that is not the same as the point (0,0) of the object displayed,
     * getDrawableX will differ.
     *
     * @return The X position of the rendered object.
     */
    getDrawableX(): float {
      return this.getX();
    }

    /**
     * Get the Y position of the rendered object.
     *
     * For most objects, this will returns the same value as getY(). But if the object
     * has an origin that is not the same as the point (0,0) of the object displayed,
     * getDrawableY will differ.
     *
     * @return The Y position of the rendered object.
     */
    getDrawableY(): float {
      return this.getY();
    }

    rotateTowardPosition(
      x: float,
      y: float,
      speed: float,
      scene: gdjs.RuntimeScene
    ): void {
      this.rotateTowardAngle(
        gdjs.toDegrees(
          Math.atan2(
            y - (this.getDrawableY() + this.getCenterY()),
            x - (this.getDrawableX() + this.getCenterX())
          )
        ),
        speed,
        scene
      );
    }

    rotateTowardAngle(
      angle: float,
      speed: float,
      runtimeScene: gdjs.RuntimeScene
    ): void {
      if (speed === 0) {
        this.setAngle(angle);
        return;
      }
      const angularDiff = gdjs.evtTools.common.angleDifference(
        this.getAngle(),
        angle
      );
      const diffWasPositive = angularDiff >= 0;
      let newAngle =
        this.getAngle() +
        ((diffWasPositive ? -1.0 : 1.0) *
          speed *
          this.getElapsedTime(runtimeScene)) /
          1000;

      if (
        // @ts-ignore
        (gdjs.evtTools.common.angleDifference(newAngle, angle) > 0) ^
        diffWasPositive
      ) {
        newAngle = angle;
      }
      this.setAngle(newAngle);
      if (
        //Objects like sprite in 8 directions does not handle small increments...
        this.getAngle() !== newAngle
      ) {
        this.setAngle(
          //...so force them to be in the path angle anyway.
          angle
        );
      }
    }

    /**
     * Rotate the object at the given speed
     *
     * @param speed The speed, in degrees per second.
     * @param runtimeScene The scene where the object is displayed.
     */
    rotate(speed: float, runtimeScene: gdjs.RuntimeScene): void {
      this.setAngle(
        this.getAngle() + (speed * this.getElapsedTime(runtimeScene)) / 1000
      );
    }

    /**
     * Set the angle of the object.
     *
     * @param angle The new angle of the object
     */
    setAngle(angle: float): void {
      if (this.angle === angle) {
        return;
      }
      this.angle = angle;
      this.hitBoxesDirty = true;
    }

    /**
     * Get the rotation of the object.
     *
     * @return The rotation of the object, in degrees.
     */
    getAngle(): float {
      return this.angle;
    }

    /**
     * Set the layer of the object.
     *
     * @param layer The new layer of the object
     */
    setLayer(layer: string): void {
      if (layer === this.layer) {
        return;
      }
      const oldLayer = this._runtimeScene.getLayer(this.layer);
      this.layer = layer;
      const newLayer = this._runtimeScene.getLayer(this.layer);
      const rendererObject = this.getRendererObject();
      if (rendererObject) {
        oldLayer.getRenderer().removeRendererObject(rendererObject);
        newLayer.getRenderer().addRendererObject(rendererObject, this.zOrder);
      }
    }

    /**
     * Get the layer of the object.
     *
     * @return The layer of the object
     */
    getLayer(): string {
      return this.layer;
    }

    /**
     * Return true if the object is on the specified layer
     *
     * @param layer The layer to be tested.
     * @return true if the object is on the specified layer
     */
    isOnLayer(layer: string): boolean {
      return this.layer === layer;
    }

    /**
     * Set the Z order of the object.
     *
     * @param z The new Z order position of the object
     */
    setZOrder(z: integer): void {
      if (z === this.zOrder) {
        return;
      }
      this.zOrder = z;
      if (this.getRendererObject()) {
        const theLayer = this._runtimeScene.getLayer(this.layer);
        theLayer
          .getRenderer()
          .changeRendererObjectZOrder(this.getRendererObject(), z);
      }
    }

    /**
     * Get the Z order of the object.
     *
     * @return The Z order of the object
     */
    getZOrder(): float {
      return this.zOrder;
    }

    /**
     * Get the container of the object variables
     * @return The variables of the object
     */
    getVariables(): gdjs.VariablesContainer {
      return this._variables;
    }

    /**
     * Get the value of a variable considered as a number. Equivalent of variable.getAsNumber()
     * @param variable The variable to be accessed
     * @return The value of the specified variable
     * @static
     */
    static getVariableNumber(variable: gdjs.Variable): number {
      return variable.getAsNumber();
    }

    /**
     * Return the variable passed as argument without any change.
     * Only for usage by events.
     *
     * @param variable The variable to be accessed
     * @return The specified variable
     * @static
     */
    static returnVariable(variable: gdjs.Variable): gdjs.Variable {
      return variable;
    }

    /**
     * Get the value of a variable considered as a string. Equivalent of variable.getAsString()
     * @param variable The variable to be accessed
     * @return The string of the specified variable
     * @static
     */
    static getVariableString(variable: gdjs.Variable): string {
      return variable.getAsString();
    }

    /**
     * Shortcut to set the value of a variable considered as a boolean.
     * This shortcut function is needed for events code generation.
     *
     * @private
     * @param {gdjs.Variable} variable
     * @param {boolean} newValue
     */
    static setVariableBoolean = function (
      variable: gdjs.Variable,
      newValue: boolean
    ) {
      variable.setBoolean(newValue);
    };

    /**
     * Shortcut to compare the value of a variable considered as a boolean.
     * This shortcut function is needed for events code generation.
     *
     * @private
     * @param {gdjs.Variable} variable
     * @param {boolean} compareWith
     * @returns {boolean}
     */
    static getVariableBoolean = function (
      variable: gdjs.Variable,
      compareWith: boolean
    ): boolean {
      return gdjs.evtTools.common.getVariableBoolean(variable, compareWith);
    };

    /**
     * Toggles a variable.
     * This shortcut function is needed for events code generation.
     *
     * @private
     * @param {gdjs.Variable} variable
     * @see {gdjs.evtTools.common.toggleVariableBoolean}
     */
    static toggleVariableBoolean = function (variable: gdjs.Variable) {
      gdjs.evtTools.common.toggleVariableBoolean(variable);
    };

    /**
     * Get the number of children from a variable
     * @param variable The variable to be accessed
     * @return The number of children
     * @static
     */
    static getVariableChildCount(variable: gdjs.Variable): integer {
      return variable.getChildrenCount();
    }

    /**
     * Shortcut to set the value of a variable considered as a number
     * @param variable The variable to be changed
     * @param newValue The value to be set
     */
    static setVariableNumber(variable: gdjs.Variable, newValue: float): void {
      variable.setNumber(newValue);
    }

    /**
     * Shortcut to set the value of a variable considered as a string
     * @param variable The variable to be changed
     * @param newValue {String} The value to be set
     */
    static setVariableString(variable: gdjs.Variable, newValue: string) {
      variable.setString(newValue);
    }

    /**
     * @static
     * @param variable The variable to be tested
     * @param childName The name of the child
     */
    private static variableChildExists(
      variable: gdjs.Variable,
      childName: string
    ): boolean {
      return variable.hasChild(childName);
    }

    /**
     * @static
     * @param variable The variable to be changed
     * @param childName The name of the child
     */
    private static variableRemoveChild(
      variable: gdjs.Variable,
      childName: string
    ): void {
      variable.removeChild(childName);
    }

    /**
     * @static
     * @param variable The variable to be cleared
     */
    private static variableClearChildren(variable: gdjs.Variable): void {
      variable.clearChildren();
    }

    /**
     * This shortcut function is needed for events code generation.
     * @private
     */
    static variablePushCopy = function (
      array: gdjs.Variable,
      variable: gdjs.Variable
    ) {
      array.pushVariableCopy(variable);
    };

    /**
     * This shortcut function is needed for events code generation.
     * @private
     */
    static valuePush = function (
      array: gdjs.Variable,
      value: string | float | boolean
    ) {
      array.pushValue(value);
    };

    /**
     * This shortcut function is needed for events code generation.
     * @private
     */
    static variableRemoveAt = function (array: gdjs.Variable, index: number) {
      array.removeAtIndex(index);
    };

    /**
     * Shortcut to test if a variable exists for the object.
     * @param name The variable to be tested
     * @return true if the variable exists.
     */
    hasVariable(name: string): boolean {
      return this._variables.has(name);
    }

    /**
     * Returns the collection of effects to be rendered
     * by the underlying renderer.
     * @returns The render effects.
     */
    getRendererEffects() {
      return this._rendererEffects;
    }

    initializeEffect(effectsData: EffectData) {
      const layer = this._runtimeScene.getLayer(this.layer);
      this._runtimeScene
        .getGame()
        .getObjectEffectsManager()
        .initializeEffect(effectsData, this._rendererEffects, layer);
    }

    /**
     * Add a new effect, or replace the one with the same name.
     * @param effectData The data of the effect to add.
     */
    addEffect(effectData: EffectData): boolean {
      const layer = this._runtimeScene.getLayer(this.layer);
      return this._runtimeScene
        .getGame()
        .getObjectEffectsManager()
        .addEffect(
          effectData,
          this._rendererEffects,
          this.getRendererObject(),
          layer
        );
    }

    /**
     * Remove the effect with the specified name
     * @param effectName The name of the effect.
     */
    removeEffect(effectName: string): boolean {
      return this._runtimeScene
        .getGame()
        .getObjectEffectsManager()
        .removeEffect(
          this._rendererEffects,
          this.getRendererObject(),
          effectName
        );
    }

    /**
     * Change an effect parameter value (for parameters that are numbers).
     * @param name The name of the effect to update.
     * @param parameterName The name of the parameter to update.
     * @param value The new value (number).
     */
    setEffectDoubleParameter(
      name: string,
      parameterName: string,
      value: float
    ): boolean {
      return this._runtimeScene
        .getGame()
        .getObjectEffectsManager()
        .setEffectDoubleParameter(
          this._rendererEffects,
          name,
          parameterName,
          value
        );
    }

    /**
     * Change an effect parameter value (for parameters that are strings).
     * @param name The name of the effect to update.
     * @param parameterName The name of the parameter to update.
     * @param value The new value (string).
     */
    setEffectStringParameter(
      name: string,
      parameterName: string,
      value: string
    ): boolean {
      return this._runtimeScene
        .getGame()
        .getObjectEffectsManager()
        .setEffectStringParameter(
          this._rendererEffects,
          name,
          parameterName,
          value
        );
    }

    /**
     * Change an effect parameter value (for parameters that are booleans).
     * @param name The name of the effect to update.
     * @param parameterName The name of the parameter to update.
     * @param value The new value (boolean).
     */
    setEffectBooleanParameter(
      name: string,
      parameterName: string,
      value: boolean
    ): boolean {
      return this._runtimeScene
        .getGame()
        .getObjectEffectsManager()
        .setEffectBooleanParameter(
          this._rendererEffects,
          name,
          parameterName,
          value
        );
    }

    /**
     * Updates all the effect parameters.
     * @param effectData
     */
    updateAllEffectParameters(effectData: EffectData): boolean {
      return this._runtimeScene
        .getGame()
        .getObjectEffectsManager()
        .updateAllEffectParameters(this._rendererEffects, effectData);
    }

    /**
     * Enable or disable an effect.
     * @param name The name of the effect to enable or disable.
     * @param enable true to enable, false to disable
     */
    enableEffect(name: string, enable: boolean): void {
      this._runtimeScene
        .getGame()
        .getObjectEffectsManager()
        .enableEffect(this._rendererEffects, name, enable);
    }

    /**
     * Check if an effect is enabled
     * @param name The name of the effect
     * @return true if the effect is enabled, false otherwise.
     */
    isEffectEnabled(name: string): boolean {
      return this._runtimeScene
        .getGame()
        .getObjectEffectsManager()
        .isEffectEnabled(this._rendererEffects, name);
    }

    /**
     * Check if an effect exists on this object
     * @param name The name of the effect
     * @return true if the effect exists, false otherwise.
     */
    hasEffect(name: string): boolean {
      return this._runtimeScene
        .getGame()
        .getObjectEffectsManager()
        .hasEffect(this._rendererEffects, name);
    }

    /**
     * Hide (or show) the object.
     * @param enable Set it to true to hide the object, false to show it.
     */
    hide(enable: boolean): void {
      if (enable === undefined) {
        enable = true;
      }
      this.hidden = enable;
    }

    /**
     * Return true if the object is not hidden.
     *
     * Note: This is unrelated to the actual visibility of the object on the screen.
     * For this, see `getVisibilityAABB` to get the bounding boxes of the object as displayed
     * on the scene.
     *
     * @return true if the object is not hidden.
     */
    isVisible(): boolean {
      return !this.hidden;
    }

    /**
     * Return true if the object is hidden.
     * @return true if the object is hidden.
     */
    isHidden(): boolean {
      return this.hidden;
    }

    /**
     * Set the width of the object, if applicable.
     * @param width The new width in pixels.
     */
    setWidth(width: float): void {}

    /**
     * Set the height of the object, if applicable.
     * @param height The new height in pixels.
     */
    setHeight(height: float): void {}

    /**
     * Return the width of the object.
     * @return The width of the object
     */
    getWidth(): float {
      return 0;
    }

    /**
     * Return the width of the object.
     * @return The height of the object
     */
    getHeight(): float {
      return 0;
    }

    /**
     * Return the X position of the object center, **relative to the object X position** (`getDrawableX`).
     * Use `getCenterXInScene` to get the position of the center in the scene.
     *
     * @return the X position of the object center, relative to `getDrawableX()`.
     */
    getCenterX(): float {
      return this.getWidth() / 2;
    }

    /**
     * Return the Y position of the object center, **relative to the object position** (`getDrawableY`).
     * Use `getCenterYInScene` to get the position of the center in the scene.
     *
     * @return the Y position of the object center, relative to `getDrawableY()`.
     */
    getCenterY(): float {
      return this.getHeight() / 2;
    }

    /**
     * Return the X position of the object center, **relative to the scene origin**.
     * @returns the X position of the object center, **relative to the scene origin**.
     */
    getCenterXInScene(): float {
      return this.getDrawableX() + this.getCenterX();
    }

    /**
     * Return the Y position of the object center, **relative to the scene origin**.
     * @returns the Y position of the object center, **relative to the scene origin**.
     */
    getCenterYInScene(): float {
      return this.getDrawableY() + this.getCenterY();
    }

    /**
     * Change the object center position in the scene.
     * @param x The new X position of the center in the scene.
     * @param y The new Y position of the center in the scene.
     */
    setCenterPositionInScene(x: float, y: float): void {
      this.setX(x + this.x - (this.getDrawableX() + this.getCenterX()));
      this.setY(y + this.y - (this.getDrawableY() + this.getCenterY()));
    }

    /**
     * Change the object center X position in the scene.
     * @param x The new X position of the center in the scene.
     */
    setCenterXInScene(x: float): void {
      this.setX(x + this.x - (this.getDrawableX() + this.getCenterX()));
    }

    /**
     * Change the object center Y position in the scene.
     * @param x The new Y position of the center in the scene.
     */
    setCenterYInScene(y: float): void {
      this.setY(y + this.y - (this.getDrawableY() + this.getCenterY()));
    }

    //Forces :
    /**
     * Get a force from the garbage, or create a new force is garbage is empty.<br>
     * To be used each time a force is created so as to avoid temporaries objects.
     *
     * @param x The x coordinates of the force
     * @param y The y coordinates of the force
     * @param multiplier Set the force multiplier
     */
    private _getRecycledForce(
      x: float,
      y: float,
      multiplier: integer
    ): gdjs.Force {
      if (RuntimeObject.forcesGarbage.length === 0) {
        return new gdjs.Force(x, y, multiplier);
      } else {
        const recycledForce = RuntimeObject.forcesGarbage.pop() as gdjs.Force;
        recycledForce.setX(x);
        recycledForce.setY(y);
        recycledForce.setMultiplier(multiplier);
        return recycledForce;
      }
    }

    /**
     * Add a force to the object to move it.
     * @param x The x coordinates of the force
     * @param y The y coordinates of the force
     * @param multiplier Set the force multiplier
     */
    addForce(x: float, y: float, multiplier: integer): void {
      this._forces.push(this._getRecycledForce(x, y, multiplier));
    }

    /**
     * Add a force using polar coordinates.
     * @param angle The angle of the force, in degrees.
     * @param len The length of the force, in pixels.
     * @param multiplier Set the force multiplier
     */
    addPolarForce(angle: float, len: float, multiplier: integer): void {
      const angleInRadians = gdjs.toRad(angle);

      //TODO: Benchmark with Math.PI
      const forceX = Math.cos(angleInRadians) * len;
      const forceY = Math.sin(angleInRadians) * len;
      this._forces.push(this._getRecycledForce(forceX, forceY, multiplier));
    }

    /**
     * Add a force oriented toward a position
     * @param x The target x position
     * @param y The target y position
     * @param len The force length, in pixels.
     * @param multiplier Set the force multiplier
     */
    addForceTowardPosition(
      x: float,
      y: float,
      len: float,
      multiplier: integer
    ): void {
      const angleInRadians = Math.atan2(
        y - (this.getDrawableY() + this.getCenterY()),
        x - (this.getDrawableX() + this.getCenterX())
      );
      const forceX = Math.cos(angleInRadians) * len;
      const forceY = Math.sin(angleInRadians) * len;
      this._forces.push(this._getRecycledForce(forceX, forceY, multiplier));
    }

    /**
     * Add a force oriented toward another object.<br>
     * (Shortcut for addForceTowardPosition)
     * @param object The target object
     * @param len The force length, in pixels.
     * @param multiplier Set the force multiplier
     */
    addForceTowardObject(
      object: gdjs.RuntimeObject,
      len: float,
      multiplier: integer
    ): void {
      if (object == null) {
        return;
      }
      this.addForceTowardPosition(
        object.getDrawableX() + object.getCenterX(),
        object.getDrawableY() + object.getCenterY(),
        len,
        multiplier
      );
    }

    /**
     * Deletes all forces applied on the object
     */
    clearForces(): void {
      RuntimeObject.forcesGarbage.push.apply(
        RuntimeObject.forcesGarbage,
        this._forces
      );
      this._forces.length = 0;
    }

    /**
     * Return true if no forces are applied on the object.
     * @return true if no forces are applied on the object.
     */
    hasNoForces(): boolean {
      return this._forces.length === 0;
    }

    /**
     * Called once a step by runtimeScene to update forces magnitudes and
     * remove null ones.
     */
    updateForces(elapsedTime: float): void {
      for (let i = 0; i < this._forces.length; ) {
        const force = this._forces[i];
        const multiplier = force.getMultiplier();
        if (multiplier === 1) {
          // Permanent force
          ++i;
        } else {
          if (
            multiplier === 0 ||
            // Instant or force disappearing
            force.getLength() <= 0.001
          ) {
            RuntimeObject.forcesGarbage.push(force);
            this._forces.splice(i, 1);
          } else {
            // Deprecated way of updating forces progressively.
            force.setLength(
              force.getLength() -
                force.getLength() * (1 - multiplier) * elapsedTime
            );
            ++i;
          }
        }
      }
    }

    /**
     * Return a force which is the sum of all forces applied on the object.
     *
     * @return A force object.
     */
    getAverageForce(): gdjs.Force {
      let averageX = 0;
      let averageY = 0;
      for (let i = 0, len = this._forces.length; i < len; ++i) {
        averageX += this._forces[i].getX();
        averageY += this._forces[i].getY();
      }
      this._averageForce.setX(averageX);
      this._averageForce.setY(averageY);
      return this._averageForce;
    }

    /**
     * Return true if the average angle of the forces applied on the object
     * is in a given range.
     *
     * @param angle The angle to be tested.
     * @param toleranceInDegrees The length of the range :
     * @return true if the difference between the average angle of the forces
     * and the angle parameter is inferior to toleranceInDegrees parameter.
     */
    averageForceAngleIs(angle: float, toleranceInDegrees: float): boolean {
      let averageAngle = this.getAverageForce().getAngle();
      if (averageAngle < 0) {
        averageAngle += 360;
      }
      return Math.abs(angle - averageAngle) < toleranceInDegrees / 2;
    }

    //Hit boxes and collision :
    /**
     * Get the hit boxes for the object.<br>
     * The default implementation returns a basic bouding box based the size (getWidth and
     * getHeight) and the center point of the object (getCenterX and getCenterY).
     *
     * You should probably redefine updateHitBoxes instead of this function.
     *
     * @return An array composed of polygon.
     */
    getHitBoxes(): gdjs.Polygon[] {
      //Avoid a naive implementation requiring to recreate temporaries each time
      //the function is called:
      //(var rectangle = gdjs.Polygon.createRectangle(this.getWidth(), this.getHeight());
      //...)
      if (this.hitBoxesDirty) {
        this.updateHitBoxes();
        this.updateAABB();
        this.hitBoxesDirty = false;
      }
      return this.hitBoxes;
    }

    /**
     * Update the hit boxes for the object.
     *
     * The default implementation set a basic bounding box based on the size (getWidth and
     * getHeight) and the center point of the object (getCenterX and getCenterY).
     * Result is cached until invalidated (by a position change, angle change...).
     *
     * You should not call this function by yourself, it is called when necessary by getHitBoxes method.
     * However, you can redefine it if your object need custom hit boxes.
     */
    updateHitBoxes(): void {
      this.hitBoxes = this._defaultHitBoxes;
      const width = this.getWidth();
      const height = this.getHeight();
      const centerX = this.getCenterX();
      const centerY = this.getCenterY();
      if (centerX === width / 2 && centerY === height / 2) {
        this.hitBoxes[0].vertices[0][0] = -centerX;
        this.hitBoxes[0].vertices[0][1] = -centerY;
        this.hitBoxes[0].vertices[1][0] = +centerX;
        this.hitBoxes[0].vertices[1][1] = -centerY;
        this.hitBoxes[0].vertices[2][0] = +centerX;
        this.hitBoxes[0].vertices[2][1] = +centerY;
        this.hitBoxes[0].vertices[3][0] = -centerX;
        this.hitBoxes[0].vertices[3][1] = +centerY;
      } else {
        this.hitBoxes[0].vertices[0][0] = 0 - centerX;
        this.hitBoxes[0].vertices[0][1] = 0 - centerY;
        this.hitBoxes[0].vertices[1][0] = width - centerX;
        this.hitBoxes[0].vertices[1][1] = 0 - centerY;
        this.hitBoxes[0].vertices[2][0] = width - centerX;
        this.hitBoxes[0].vertices[2][1] = height - centerY;
        this.hitBoxes[0].vertices[3][0] = 0 - centerX;
        this.hitBoxes[0].vertices[3][1] = height - centerY;
      }
      this.hitBoxes[0].rotate(gdjs.toRad(this.getAngle()));
      this.hitBoxes[0].move(
        this.getDrawableX() + centerX,
        this.getDrawableY() + centerY
      );
    }

    /**
     * Get the AABB (axis aligned bounding box) for the object.
     *
     * The default implementation uses either the position/size of the object (when angle is 0) or
     * hitboxes (when angle is not 0) to compute the bounding box.
     * Result is cached until invalidated (by a position change, angle change...).
     *
     * You should probably redefine updateAABB instead of this function.
     *
     * @return The bounding box
     */
    getAABB(): AABB {
      if (this.hitBoxesDirty) {
        this.updateHitBoxes();
        this.updateAABB();
        this.hitBoxesDirty = false;
      }
      return this.aabb;
    }

    /**
     * Get the AABB (axis aligned bounding box) to be used to determine if the object
     * is visible on screen. The gdjs.RuntimeScene will hide the renderer object if
     * the object is not visible on screen ("culling").
     *
     * The default implementation uses the AABB returned by getAABB.
     *
     * If `null` is returned, the object is assumed to be always visible.
     *
     * @return The bounding box or `null`.
     */
    getVisibilityAABB(): AABB | null {
      return this.getAABB();
    }

    /**
     * Update the AABB (axis aligned bounding box) for the object.
     *
     * Default implementation uses either the position/size of the object (when angle is 0) or
     * hitboxes (when angle is not 0) to compute the bounding box.
     *
     * You should not call this function by yourself, it is called when necessary by getAABB method.
     * However, you can redefine it if your object can have a faster implementation.
     */
    updateAABB(): void {
      if (this.getAngle() === 0) {
        // Fast/simple computation of AABB for non rotated object
        // (works even for object with non default center/origin
        // because we're using getDrawableX/Y)
        this.aabb.min[0] = this.getDrawableX();
        this.aabb.min[1] = this.getDrawableY();
        this.aabb.max[0] = this.aabb.min[0] + this.getWidth();
        this.aabb.max[1] = this.aabb.min[1] + this.getHeight();
      } else {
        // Use hitboxes if object is rotated to ensure that the AABB
        // is properly bounding the whole object.
        // Slower (10-15% slower).
        let first = true;
        for (let i = 0; i < this.hitBoxes.length; i++) {
          for (let j = 0; j < this.hitBoxes[i].vertices.length; j++) {
            const vertex = this.hitBoxes[i].vertices[j];
            if (first) {
              this.aabb.min[0] = vertex[0];
              this.aabb.max[0] = vertex[0];
              this.aabb.min[1] = vertex[1];
              this.aabb.max[1] = vertex[1];
              first = false;
            } else {
              this.aabb.min[0] = Math.min(this.aabb.min[0], vertex[0]);
              this.aabb.max[0] = Math.max(this.aabb.max[0], vertex[0]);
              this.aabb.min[1] = Math.min(this.aabb.min[1], vertex[1]);
              this.aabb.max[1] = Math.max(this.aabb.max[1], vertex[1]);
            }
          }
        }
      }
    }

    //Behaviors:
    /**
     * Call each behavior stepPreEvents method.
     */
    stepBehaviorsPreEvents(runtimeScene): void {
      for (let i = 0, len = this._behaviors.length; i < len; ++i) {
        this._behaviors[i].stepPreEvents(runtimeScene);
      }
    }

    /**
     * Call each behavior stepPostEvents method.
     */
    stepBehaviorsPostEvents(runtimeScene): void {
      for (let i = 0, len = this._behaviors.length; i < len; ++i) {
        this._behaviors[i].stepPostEvents(runtimeScene);
      }
    }

    /**
     * Called when the object was hot reloaded, to notify behaviors
     * that the object was modified. Useful for behaviors that
     */
    notifyBehaviorsObjectHotReloaded(): void {
      for (let i = 0, len = this._behaviors.length; i < len; ++i) {
        this._behaviors[i].onObjectHotReloaded();
      }
    }

    /**
     * Get a behavior from its name.
     * If the behavior does not exists, `undefined` is returned.
     *
     * **Never keep a reference** to a behavior, as they can be hot-reloaded. Instead,
     * always call getBehavior on the object.
     *
     * @param name {String} The behavior name.
     * @return The behavior with the given name, or undefined.
     */
    getBehavior(name: string): gdjs.RuntimeBehavior | null {
      return this._behaviorsTable.get(name);
    }

    /**
     * Check if a behavior is used by the object.
     *
     * @param name {String} The behavior name.
     */
    hasBehavior(name: string): boolean {
      return this._behaviorsTable.containsKey(name);
    }

    /**
     * De/activate a behavior of the object.
     *
     * @param name {String} The behavior name.
     * @param enable {boolean} true to activate the behavior
     */
    activateBehavior(name: string, enable: boolean): void {
      if (this._behaviorsTable.containsKey(name)) {
        this._behaviorsTable.get(name).activate(enable);
      }
    }

    /**
     * Check if a behavior is activated
     *
     * @param name The behavior name.
     * @return true if the behavior is activated.
     */
    behaviorActivated(name: string): boolean {
      if (this._behaviorsTable.containsKey(name)) {
        return this._behaviorsTable.get(name).activated();
      }
      return false;
    }

    /**
     * Remove the behavior with the given name. Usually only used by
     * hot-reloading, as performance of this operation is not guaranteed
     * (in the future, this could lead to re-organization of arrays
     * holding behaviors).
     *
     * @param name The name of the behavior to remove.
     * @returns true if the behavior was properly removed, false otherwise.
     */
    removeBehavior(name: string): boolean {
      const behavior = this._behaviorsTable.get(name);
      if (!behavior) {
        return false;
      }
      behavior.onDestroy();
      const behaviorIndex = this._behaviors.indexOf(behavior);
      if (behaviorIndex !== -1) {
        this._behaviors.splice(behaviorIndex, 1);
      }
      this._behaviorsTable.remove(name);
      return true;
    }

    /**
     * Create the behavior decribed by the given BehaviorData
     *
     * @param behaviorData The data to be used to construct the behavior.
     * @returns true if the behavior was properly created, false otherwise.
     */
    addNewBehavior(behaviorData: BehaviorData): boolean {
      const Ctor = gdjs.getBehaviorConstructor(behaviorData.type);
      if (!Ctor) {
        return false;
      }
      const newRuntimeBehavior = new Ctor(
        this._runtimeScene,
        behaviorData,
        this
      );
      this._behaviors.push(newRuntimeBehavior);
      this._behaviorsTable.put(behaviorData.name, newRuntimeBehavior);
      return true;
    }

    //Timers:
    /**
     * Updates the object timers. Called once during the game loop, before events and rendering.
     * @param elapsedTime The elapsed time since the previous frame in milliseconds.
     */
    updateTimers(elapsedTime: float): void {
      for (const name in this._timers.items) {
        if (this._timers.items.hasOwnProperty(name)) {
          this._timers.items[name].updateTime(elapsedTime);
        }
      }
    }

    /**
     * Test a timer elapsed time, if the timer doesn't exist it is created
     * @param timerName The timer name
     * @param timeInSeconds The time value to check in seconds
     * @return True if the timer exists and its value is greater than or equal than the given time, false otherwise
     */
    timerElapsedTime(timerName: string, timeInSeconds: float): boolean {
      if (!this._timers.containsKey(timerName)) {
        this._timers.put(timerName, new gdjs.Timer(timerName));
        return false;
      }
      return this.getTimerElapsedTimeInSeconds(timerName) >= timeInSeconds;
    }

    /**
     * Test a if a timer is paused
     * @param timerName The timer name
     * @return True if the timer exists and is paused, false otherwise
     */
    timerPaused(timerName: string): boolean {
      if (!this._timers.containsKey(timerName)) {
        return false;
      }
      return this._timers.get(timerName).isPaused();
    }

    /**
     * Reset a timer, if the timer doesn't exist it is created
     * @param timerName The timer name
     */
    resetTimer(timerName: string): void {
      if (!this._timers.containsKey(timerName)) {
        this._timers.put(timerName, new gdjs.Timer(timerName));
      }
      this._timers.get(timerName).reset();
    }

    /**
     * Pause a timer, if the timer doesn't exist it is created
     * @param timerName The timer name
     */
    pauseTimer(timerName: string): void {
      if (!this._timers.containsKey(timerName)) {
        this._timers.put(timerName, new gdjs.Timer(timerName));
      }
      this._timers.get(timerName).setPaused(true);
    }

    /**
     * Unpause a timer, if the timer doesn't exist it is created
     * @param timerName The timer name
     */
    unpauseTimer(timerName: string): void {
      if (!this._timers.containsKey(timerName)) {
        this._timers.put(timerName, new gdjs.Timer(timerName));
      }
      this._timers.get(timerName).setPaused(false);
    }

    /**
     * Remove a timer
     * @param timerName The timer name
     */
    removeTimer(timerName: string): void {
      if (this._timers.containsKey(timerName)) {
        this._timers.remove(timerName);
      }
    }

    /**
     * Get a timer elapsed time.
     * @param timerName The timer name
     * @return The timer elapsed time in seconds, 0 if the timer doesn't exist
     */
    getTimerElapsedTimeInSeconds(timerName: string): float {
      if (!this._timers.containsKey(timerName)) {
        return 0;
      }
      return this._timers.get(timerName).getTime() / 1000.0;
    }

    //Other :
    /**
     * Separate the object from others objects, using their hitboxes.
     * @param objects Objects
     * @param ignoreTouchingEdges If true, then edges that are touching each other, without the hitbox polygons actually overlapping, won't be considered in collision.
     * @return true if the object was moved
     */
    separateFromObjects(
      objects: RuntimeObject[],
      ignoreTouchingEdges: boolean
    ): boolean {
      let moved = false;
      let xMove = 0;
      let yMove = 0;
      const hitBoxes = this.getHitBoxes();

      //Check if their is a collision with each object
      for (let i = 0, len = objects.length; i < len; ++i) {
        if (objects[i].id != this.id) {
          const otherHitBoxes = objects[i].getHitBoxes();
          for (let k = 0, lenk = hitBoxes.length; k < lenk; ++k) {
            for (let l = 0, lenl = otherHitBoxes.length; l < lenl; ++l) {
              const result = gdjs.Polygon.collisionTest(
                hitBoxes[k],
                otherHitBoxes[l],
                ignoreTouchingEdges
              );
              if (result.collision) {
                xMove += result.move_axis[0];
                yMove += result.move_axis[1];
                moved = true;
              }
            }
          }
        }
      }

      //Move according to the results returned by the collision algorithm.
      this.setPosition(this.getX() + xMove, this.getY() + yMove);
      return moved;
    }

    /**
     * Separate the object from others objects, using their hitboxes.
     * @param objectsLists Tables of objects
     * @param ignoreTouchingEdges If true, then edges that are touching each other, without the hitbox polygons actually overlapping, won't be considered in collision.
     * @return true if the object was moved
     */
    separateFromObjectsList(
      objectsLists: ObjectsLists,
      ignoreTouchingEdges: boolean
    ): boolean {
      let moved = false;
      let xMove = 0;
      let yMove = 0;
      const hitBoxes = this.getHitBoxes();
      for (const name in objectsLists.items) {
        if (objectsLists.items.hasOwnProperty(name)) {
          const objects = objectsLists.items[name];

          //Check if their is a collision with each object
          for (let i = 0, len = objects.length; i < len; ++i) {
            if (objects[i].id != this.id) {
              const otherHitBoxes = objects[i].getHitBoxes();
              for (let k = 0, lenk = hitBoxes.length; k < lenk; ++k) {
                for (let l = 0, lenl = otherHitBoxes.length; l < lenl; ++l) {
                  const result = gdjs.Polygon.collisionTest(
                    hitBoxes[k],
                    otherHitBoxes[l],
                    ignoreTouchingEdges
                  );
                  if (result.collision) {
                    xMove += result.move_axis[0];
                    yMove += result.move_axis[1];
                    moved = true;
                  }
                }
              }
            }
          }
        }
      }

      //Move according to the results returned by the collision algorithm.
      this.setPosition(this.getX() + xMove, this.getY() + yMove);
      return moved;
    }

    /**
     * Get the distance, in pixels, between *the center* of this object and another object.
     * @param otherObject The other object
     */
    getDistanceToObject(otherObject: gdjs.RuntimeObject): float {
      return Math.sqrt(this.getSqDistanceToObject(otherObject));
    }

    /**
     * Get the squared distance, in pixels, between *the center* of this object and another object.
     * @param otherObject The other object
     */
    getSqDistanceToObject(otherObject: gdjs.RuntimeObject): float {
      if (otherObject === null) {
        return 0;
      }
      const x =
        this.getDrawableX() +
        this.getCenterX() -
        (otherObject.getDrawableX() + otherObject.getCenterX());
      const y =
        this.getDrawableY() +
        this.getCenterY() -
        (otherObject.getDrawableY() + otherObject.getCenterY());
      return x * x + y * y;
    }

    /**
     * Get the distance, in pixels, between *the center* of this object and a position.
     * @param targetX Target X position
     * @param targetY Target Y position
     */
    getDistanceToPosition(targetX: float, targetY: float): float {
      return Math.sqrt(this.getSqDistanceToPosition(targetX, targetY));
    }

    /**
     * Get the squared distance, in pixels, between *the center* of this object and a position.
     * @param targetX Target X position
     * @param targetY Target Y position
     */
    getSqDistanceToPosition(targetX: float, targetY: float): float {
      const x = this.getDrawableX() + this.getCenterX() - targetX;
      const y = this.getDrawableY() + this.getCenterY() - targetY;
      return x * x + y * y;
    }

    /**
     * Get the angle, in degrees, from the *object center* to another object.
     * @param otherObject The other object
     */
    getAngleToObject(otherObject: gdjs.RuntimeObject): float {
      if (otherObject === null) {
        return 0;
      }
      const x =
        this.getDrawableX() +
        this.getCenterX() -
        (otherObject.getDrawableX() + otherObject.getCenterX());
      const y =
        this.getDrawableY() +
        this.getCenterY() -
        (otherObject.getDrawableY() + otherObject.getCenterY());
      return gdjs.toDegrees(Math.atan2(-y, -x));
    }

    /**
     * Compute the X position when given an angle and distance relative to the starting object.
     * This is also known as getting the cartesian coordinates of a 2D vector, using its polar coordinates.
     * @param angle The angle, in degrees.
     * @param distance The distance from the object, in pixels
     */
    getXFromAngleAndDistance(angle: float, distance: float): float {
      return (
        this.getDrawableX() +
        this.getCenterX() +
        distance * Math.cos(gdjs.toRad(angle))
      );
    }

    /**
     * Compute the Y position when given an angle and distance relative to the starting object.
     * This is also known as getting the cartesian coordinates of a 2D vector, using its polar coordinates.
     * @param angle The angle, in degrees.
     * @param distance The distance from the object, in pixels
     */
    getYFromAngleAndDistance(angle: float, distance: float): float {
      return (
        this.getDrawableY() +
        this.getCenterY() +
        distance * Math.sin(gdjs.toRad(angle))
      );
    }

    /**
     * Get the angle, in degrees, from the *object center* to a position.
     * @param targetX Target X position
     * @param targetY Target Y position
     */
    getAngleToPosition(targetX: float, targetY: float): float {
      const x = this.getDrawableX() + this.getCenterX() - targetX;
      const y = this.getDrawableY() + this.getCenterY() - targetY;
      return gdjs.toDegrees(Math.atan2(-y, -x));
    }

    /**
     * Put the object around a position, with a specific distance and angle.
     * The distance and angle are computed between the position and *the center of the object*.
     *
     * @param x The x position of the target
     * @param y The y position of the target
     * @param distance The distance between the object and the target, in pixels.
     * @param angleInDegrees The angle between the object and the target, in degrees.
     */
    putAround(
      x: float,
      y: float,
      distance: float,
      angleInDegrees: float
    ): void {
      const angleInRadians = gdjs.toRad(angleInDegrees);

      this.setCenterXInScene(x + Math.cos(angleInRadians) * distance);
      this.setCenterYInScene(y + Math.sin(angleInRadians) * distance);
    }

    /**
     * Put the object around another object, with a specific distance and angle.
     * The distance and angle are computed between *the centers of the objects*.
     *
     * @param obj The target object
     * @param distance The distance between the object and the target
     * @param angleInDegrees The angle between the object and the target, in degrees.
     */
    putAroundObject(
      obj: gdjs.RuntimeObject,
      distance: float,
      angleInDegrees: float
    ): void {
      this.putAround(
        obj.getDrawableX() + obj.getCenterX(),
        obj.getDrawableY() + obj.getCenterY(),
        distance,
        angleInDegrees
      );
    }

    /**
     * @deprecated
     * @param objectsLists Tables of objects
     */
    separateObjectsWithoutForces(objectsLists: ObjectsLists): void {
      //Prepare the list of objects to iterate over.
      const objects = gdjs.staticArray(
        RuntimeObject.prototype.separateObjectsWithoutForces
      );
      objects.length = 0;
      const lists = gdjs.staticArray2(
        RuntimeObject.prototype.separateObjectsWithoutForces
      );
      objectsLists.values(lists);
      for (let i = 0, len = lists.length; i < len; ++i) {
        objects.push.apply(objects, lists[i]);
      }
      for (let i = 0, len = objects.length; i < len; ++i) {
        if (objects[i].id != this.id) {
          if (this.getDrawableX() < objects[i].getDrawableX()) {
            this.setX(objects[i].getDrawableX() - this.getWidth());
          } else {
            if (
              this.getDrawableX() + this.getWidth() >
              objects[i].getDrawableX() + objects[i].getWidth()
            ) {
              this.setX(objects[i].getDrawableX() + objects[i].getWidth());
            }
          }
          if (this.getDrawableY() < objects[i].getDrawableY()) {
            this.setY(objects[i].getDrawableY() - this.getHeight());
          } else {
            if (
              this.getDrawableY() + this.getHeight() >
              objects[i].getDrawableY() + objects[i].getHeight()
            ) {
              this.setY(objects[i].getDrawableY() + objects[i].getHeight());
            }
          }
        }
      }
    }

    /**
     * @deprecated
     * @param objectsLists Tables of objects
     */
    separateObjectsWithForces(objectsLists: ObjectsLists): void {
      //Prepare the list of objects to iterate over.
      const objects = gdjs.staticArray(
        RuntimeObject.prototype.separateObjectsWithForces
      );
      objects.length = 0;
      const lists = gdjs.staticArray2(
        RuntimeObject.prototype.separateObjectsWithForces
      );
      objectsLists.values(lists);
      for (let i = 0, len = lists.length; i < len; ++i) {
        objects.push.apply(objects, lists[i]);
      }
      for (let i = 0, len = objects.length; i < len; ++i) {
        if (objects[i].id != this.id) {
          if (
            this.getDrawableX() + this.getCenterX() <
            objects[i].getDrawableX() + objects[i].getCenterX()
          ) {
            let av = this.hasNoForces() ? 0 : this.getAverageForce().getX();
            this.addForce(-av - 10, 0, 0);
          } else {
            let av = this.hasNoForces() ? 0 : this.getAverageForce().getX();
            this.addForce(-av + 10, 0, 0);
          }
          if (
            this.getDrawableY() + this.getCenterY() <
            objects[i].getDrawableY() + objects[i].getCenterY()
          ) {
            let av = this.hasNoForces() ? 0 : this.getAverageForce().getY();
            this.addForce(0, -av - 10, 0);
          } else {
            let av = this.hasNoForces() ? 0 : this.getAverageForce().getY();
            this.addForce(0, -av + 10, 0);
          }
        }
      }
    }

    /**
     * Return true if the hitboxes of two objects are overlapping
     * @static
     * @param obj1 The first runtimeObject
     * @param obj2 The second runtimeObject
     * @param ignoreTouchingEdges If true, then edges that are touching each other, without the hitbox polygons actually overlapping, won't be considered in collision.
     * @return true if obj1 and obj2 are in collision
     */
    static collisionTest(
      obj1: gdjs.RuntimeObject,
      obj2: gdjs.RuntimeObject,
      ignoreTouchingEdges: boolean
    ): boolean {
      //First check if bounding circle are too far.
      const o1centerX = obj1.getCenterX();
      const o1centerY = obj1.getCenterY();
      const obj1BoundingRadius = Math.sqrt(
        computeSqBoundingRadius(
          obj1.getWidth(),
          obj1.getHeight(),
          o1centerX,
          o1centerY
        )
      );

      const o2centerX = obj2.getCenterX();
      const o2centerY = obj2.getCenterY();
      const obj2BoundingRadius = Math.sqrt(
        computeSqBoundingRadius(
          obj2.getWidth(),
          obj2.getHeight(),
          o2centerX,
          o2centerY
        )
      );

      const diffX =
        obj1.getDrawableX() + o1centerX - (obj2.getDrawableX() + o2centerX);
      const diffY =
        obj1.getDrawableY() + o1centerY - (obj2.getDrawableY() + o2centerY);
      if (
        Math.sqrt(diffX * diffX + diffY * diffY) >
        obj1BoundingRadius + obj2BoundingRadius
      ) {
        return false;
      }

      // Do a real check if necessary.
      const hitBoxes1 = obj1.getHitBoxes();
      const hitBoxes2 = obj2.getHitBoxes();
      for (let k = 0, lenBoxes1 = hitBoxes1.length; k < lenBoxes1; ++k) {
        for (let l = 0, lenBoxes2 = hitBoxes2.length; l < lenBoxes2; ++l) {
          if (
            gdjs.Polygon.collisionTest(
              hitBoxes1[k],
              hitBoxes2[l],
              ignoreTouchingEdges
            ).collision
          ) {
            return true;
          }
        }
      }
      return false;
    }

    /**
     * @param x The raycast source X
     * @param y The raycast source Y
     * @param endX The raycast end position X
     * @param endY The raycast end position Y
     * @param closest Get the closest or farthest collision mask result?
     * @return A raycast result with the contact points and distances
     */
    raycastTest(
      x: float,
      y: float,
      endX: float,
      endY: float,
      closest: boolean
    ): RaycastTestResult {
      // First check if bounding circles are too far
      const objCenterX = this.getCenterX();
      const objCenterY = this.getCenterY();
      const objSqBoundingRadius = computeSqBoundingRadius(
        this.getWidth(),
        this.getHeight(),
        objCenterX,
        objCenterY
      );

      const rayCenterWorldX = (x + endX) / 2;
      const rayCenterWorldY = (y + endY) / 2;
      const raySqBoundingRadius =
        (endX - x) * (endX - x) + (endY - y) * (endY - y);

      const diffX = this.getDrawableX() + objCenterX - rayCenterWorldX;
      const diffY = this.getDrawableY() + objCenterY - rayCenterWorldY;

      // @ts-ignore
      let result = gdjs.Polygon.raycastTestStatics.result;
      result.collision = false;
      if (
        // As an optimization, avoid computing the square root of the two boundings radius
        // and the distance by comparing the squared values instead.
        diffX * diffX + diffY * diffY >
        objSqBoundingRadius +
          raySqBoundingRadius +
          2 * Math.sqrt(raySqBoundingRadius * objSqBoundingRadius)
      ) {
        return result;
      }

      // Do a real check if necessary.
      let testSqDist = closest ? raySqBoundingRadius : 0;
      const hitBoxes = this.getHitBoxes();
      for (let i = 0; i < hitBoxes.length; i++) {
        const res = gdjs.Polygon.raycastTest(hitBoxes[i], x, y, endX, endY);
        if (res.collision) {
          if (closest && res.closeSqDist < testSqDist) {
            testSqDist = res.closeSqDist;
            result = res;
          } else {
            if (
              !closest &&
              res.farSqDist > testSqDist &&
              res.farSqDist <= raySqBoundingRadius
            ) {
              testSqDist = res.farSqDist;
              result = res;
            }
          }
        }
      }
      return result;
    }

    /**
     * Return true if the specified position is inside object bounding box.
     *
     * The position should be in "world" coordinates, i.e use gdjs.Layer.convertCoords
     * if you need to pass the mouse or a touch position that you get from gdjs.InputManager.
     *
     */
    insideObject(x: float, y: float): boolean {
      if (this.hitBoxesDirty) {
        this.updateHitBoxes();
        this.updateAABB();
        this.hitBoxesDirty = false;
      }
      return (
        this.aabb.min[0] <= x &&
        this.aabb.max[0] >= x &&
        this.aabb.min[1] <= y &&
        this.aabb.max[1] >= y
      );
    }

    /**
     * Check the distance between two objects.
     * @static
     */
    static distanceTest(
      obj1: RuntimeObject,
      obj2: RuntimeObject,
      distance: float
    ): boolean {
      return obj1.getSqDistanceToObject(obj2) <= distance;
    }

    /**
     * Return true if the cursor, or any touch, is on the object.
     *
     * @return true if the cursor, or any touch, is on the object.
     */
    cursorOnObject(runtimeScene: RuntimeScene): boolean {
      const inputManager = runtimeScene.getGame().getInputManager();
      const layer = runtimeScene.getLayer(this.layer);
      const mousePos = layer.convertCoords(
        inputManager.getMouseX(),
        inputManager.getMouseY()
      );
      if (this.insideObject(mousePos[0], mousePos[1])) {
        return true;
      }
      const touchIds = inputManager.getAllTouchIdentifiers();
      for (let i = 0; i < touchIds.length; ++i) {
        const touchPos = layer.convertCoords(
          inputManager.getTouchX(touchIds[i]),
          inputManager.getTouchY(touchIds[i])
        );
        if (this.insideObject(touchPos[0], touchPos[1])) {
          return true;
        }
      }
      return false;
    }

    /**
     * Check if a point is inside the object collision hitboxes.
     * @param pointX The point x coordinate.
     * @param pointY The point y coordinate.
     * @return true if the point is inside the object collision hitboxes.
     */
    isCollidingWithPoint(pointX: float, pointY: float): boolean {
      const hitBoxes = this.getHitBoxes();
      for (let i = 0; i < this.hitBoxes.length; ++i) {
        if (gdjs.Polygon.isPointInside(hitBoxes[i], pointX, pointY)) {
          return true;
        }
      }
      return false;
    }

    /**
     * Get the identifier associated to an object name.
     * Some features may want to compare objects name a large number of time. In this case,
     * it may be more efficient to compare objects name identifiers.
     *
     * @static
     */
    static getNameIdentifier(name: string): integer {
      if (RuntimeObject._identifiers.containsKey(name)) {
        return RuntimeObject._identifiers.get(name);
      }
      RuntimeObject._newId = (RuntimeObject._newId || 0) + 1;
      const newIdentifier = RuntimeObject._newId;
      RuntimeObject._identifiers.put(name, newIdentifier);
      return newIdentifier;
    }

    /**
     * Table containing the id corresponding to an object name. Do not use directly or modify.
     * @static
     */
    static _identifiers = new Hashtable<integer>();

    /**
     * The next available unique identifier for an object. Do not use directly or modify.
     * @static
     */
    static _newId = 0;

    /**
     * Global container for unused forces, avoiding recreating forces each tick.
     * @static
     */
    static forcesGarbage: Array<gdjs.Force> = [];

    getVariableNumber = RuntimeObject.getVariableNumber;
    returnVariable = RuntimeObject.returnVariable;
    getVariableString = RuntimeObject.getVariableString;
    setVariableNumber = RuntimeObject.setVariableNumber;
    setVariableString = RuntimeObject.setVariableString;
    getVariableBoolean = RuntimeObject.getVariableBoolean;
    setVariableBoolean = RuntimeObject.setVariableBoolean;
    toggleVariableBoolean = RuntimeObject.toggleVariableBoolean;
    variableChildExists = RuntimeObject.variableChildExists;
    variableRemoveChild = RuntimeObject.variableRemoveChild;
    variableClearChildren = RuntimeObject.variableClearChildren;
    variablePushCopy = RuntimeObject.variablePushCopy;
    valuePush = RuntimeObject.valuePush;
    variableRemoveAt = RuntimeObject.variableRemoveAt;

    /**
     * Get the squared distance, in pixels, from the *object center* to a position.
     * @param pointX X position
     * @param pointY Y position
     * @deprecated Use `getSqDistanceToPosition` instead.
     */
    getSqDistanceTo = RuntimeObject.prototype.getSqDistanceToPosition;
  }
  gdjs.registerObject('', gdjs.RuntimeObject);
}
