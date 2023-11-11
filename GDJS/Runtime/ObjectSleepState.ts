/*
 * GDevelop JS Platform
 * Copyright 2023-2023 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  export class ObjectSleepState {
    private static readonly framesBeforeSleep = 60;
    private _object: RuntimeObject;
    private _isNeedingToBeAwake: () => boolean;
    private _state: ObjectSleepState.State;
    private _lastActivityFrameIndex: integer;
    private _onWakingUpCallbacks: Array<(object: RuntimeObject) => void> = [];

    constructor(
      object: RuntimeObject,
      isNeedingToBeAwake: () => boolean,
      initialSleepState: ObjectSleepState.State
    ) {
      this._object = object;
      this._isNeedingToBeAwake = isNeedingToBeAwake;
      this._state = initialSleepState;
      this._lastActivityFrameIndex = this._object
        .getRuntimeScene()
        .getFrameIndex();
    }

    canSleep(): boolean {
      return (
        this._state === gdjs.ObjectSleepState.State.CanSleepThisFrame ||
        this._object.getRuntimeScene().getFrameIndex() -
          this._lastActivityFrameIndex >=
          ObjectSleepState.framesBeforeSleep
      );
    }

    isAwake(): boolean {
      return this._state !== gdjs.ObjectSleepState.State.ASleep;
    }

    _forceToSleep(): void {
      if (!this.isAwake()) {
        return;
      }
      this._lastActivityFrameIndex = Number.NEGATIVE_INFINITY;
    }

    wakeUp() {
      const object = this._object;
      this._lastActivityFrameIndex = object.getRuntimeScene().getFrameIndex();
      if (!this.isAwake()) {
        this._state = gdjs.ObjectSleepState.State.AWake;
        for (const onWakingUp of this._onWakingUpCallbacks) {
          onWakingUp(object);
        }
      }
    }

    registerOnWakingUp(onWakingUp: (object: RuntimeObject) => void) {
      this._onWakingUpCallbacks.push(onWakingUp);
      if (this.isAwake()) {
        onWakingUp(this._object);
      }
    }

    tryToSleep(): void {
      if (
        this._lastActivityFrameIndex !== Number.NEGATIVE_INFINITY &&
        this._isNeedingToBeAwake()
      ) {
        this._lastActivityFrameIndex = this._object
          .getRuntimeScene()
          .getFrameIndex();
      }
    }

    static updateAwakeObjects(
      awakeObjects: Array<RuntimeObject>,
      getSleepState: (object: RuntimeObject) => ObjectSleepState,
      onFallenAsleep: (object: RuntimeObject) => void
    ) {
      let writeIndex = 0;
      for (let readIndex = 0; readIndex < awakeObjects.length; readIndex++) {
        const object = awakeObjects[readIndex];
        awakeObjects[writeIndex] = object;
        const lifecycleSleepState = getSleepState(object);
        lifecycleSleepState.tryToSleep();
        if (lifecycleSleepState.canSleep()) {
          lifecycleSleepState._state = gdjs.ObjectSleepState.State.ASleep;
          onFallenAsleep(object);
        } else {
          writeIndex++;
        }
      }
      awakeObjects.length = writeIndex;
      return awakeObjects;
    }
  }

  export namespace ObjectSleepState {
    export enum State {
      ASleep,
      CanSleepThisFrame,
      AWake,
    }
  }
}
