/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  /**
   * RuntimeBehavior represents a behavior being used by a RuntimeObject.
   */
  export class RuntimeBehavior {
    name: string;
    type: string;
    _nameId: integer;
    _activated: boolean = true;

    /**
     * @param runtimeScene The scene owning the object of the behavior
     * @param behaviorData The properties used to setup the behavior
     * @param owner The object owning the behavior
     */
    constructor(
      runtimeScene: gdjs.RuntimeScene,
      behaviorData: BehaviorData,
      public owner: gdjs.RuntimeObject
    ) {
      this.name = behaviorData.name || '';
      this.type = behaviorData.type || '';
      this._nameId = gdjs.RuntimeObject.getNameIdentifier(this.name);
    }

    /**
     * Called when the behavior must be updated using the specified behaviorData. This is the
     * case during hot-reload, and is only called if the behavior was modified.
     *
     * @see gdjs.RuntimeBehavior#onObjectHotReloaded
     *
     * @param oldBehaviorData The previous data for the behavior.
     * @param newBehaviorData The new data for the behavior.
     * @returns true if the behavior was updated, false if it could not (i.e: hot-reload is not supported).
     */
    updateFromBehaviorData(
      oldBehaviorData: BehaviorData,
      newBehaviorData: BehaviorData
    ): boolean {
      // If not redefined, mark by default the hot-reload as failed.
      return false;
    }

    /**
     * Get the name of the behavior.
     * @return The behavior's name.
     */
    getName(): string {
      return this.name;
    }

    /**
     * Get the name identifier of the behavior.
     * @return The behavior's name identifier.
     */
    getNameId(): integer {
      return this._nameId;
    }

    /**
     * Called at each frame before events. Call doStepPreEvents.<br>
     * Behaviors writers: Please do not redefine this method. Redefine doStepPreEvents instead.
     * @param runtimeScene The runtimeScene owning the object
     */
    stepPreEvents(runtimeScene: gdjs.RuntimeScene) {
      if (this._activated) {
        const profiler = runtimeScene.getProfiler();
        if (profiler) {
          profiler.begin(this.name);
        }
        this.doStepPreEvents(runtimeScene);
        if (profiler) {
          profiler.end(this.name);
        }
      }
    }

    /**
     * Called at each frame after events. Call doStepPostEvents.<br>
     * Behaviors writers: Please do not redefine this method. Redefine doStepPreEvents instead.
     * @param runtimeScene The runtimeScene owning the object
     */
    stepPostEvents(runtimeScene: gdjs.RuntimeScene) {
      if (this._activated) {
        const profiler = runtimeScene.getProfiler();
        if (profiler) {
          profiler.begin(this.name);
        }
        this.doStepPostEvents(runtimeScene);
        if (profiler) {
          profiler.end(this.name);
        }
      }
    }

    /**
     * De/Activate the behavior
     * @param enable true to enable the behavior, false to disable it
     */
    activate(enable: boolean) {
      if (enable === undefined) {
        enable = true;
      }
      if (!this._activated && enable) {
        this._activated = true;
        this.onActivate();
      } else {
        if (this._activated && !enable) {
          this._activated = false;
          this.onDeActivate();
        }
      }
    }

    /**
     * Reimplement this to do extra work when the behavior is created (i.e: an
     * object using it was created), after the object is fully initialized (so
     * you can use `this.owner` without risk).
     */
    onCreated() {}

    /**
     * Return true if the behavior is activated
     */
    activated() {
      return this._activated;
    }

    /**
     * Reimplement this method to do extra work when the behavior is activated (after
     * it has been deactivated, see `onDeActivate`).
     */
    onActivate() {}

    /**
     * Reimplement this method to do extra work when the behavior is deactivated.
     */
    onDeActivate() {}

    /**
     * This method is called each tick before events are done.
     * @param runtimeScene The runtimeScene owning the object
     */
    doStepPreEvents(runtimeScene: gdjs.RuntimeScene) {}

    /**
     * This method is called each tick after events are done.
     * @param runtimeScene The runtimeScene owning the object
     */
    doStepPostEvents(runtimeScene: gdjs.RuntimeScene) {}

    /**
     * This method is called when the owner of the behavior
     * is being removed from the scene and is about to be destroyed/reused later
     * or when the behavior is removed from an object (can happen in case of
     * hot-reloading only. Otherwise, behaviors are just de-activated,
     * not removed. See `onDeActivate`).
     */
    onDestroy() {}

    /**
     * This method is called when the owner of the behavior
     * was hot reloaded, so its position, angle, size can have been changed outside
     * of events.
     */
    onObjectHotReloaded() {}
  }
  gdjs.registerBehavior('', gdjs.RuntimeBehavior);
}
