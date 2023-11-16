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
      if (this.isAwake()) {
        return;
      }
      this._state = gdjs.ObjectSleepState.State.AWake;
      for (const onWakingUp of this._onWakingUpCallbacks) {
        onWakingUp(object);
      }
    }

    registerOnWakingUp(onWakingUp: (object: RuntimeObject) => void) {
      this._onWakingUpCallbacks.push(onWakingUp);
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
      onFallenAsleep: (object: RuntimeObject) => void,
      onWakingUp: (object: RuntimeObject) => void
    ) {
      let writeIndex = 0;
      for (let readIndex = 0; readIndex < awakeObjects.length; readIndex++) {
        const object = awakeObjects[readIndex];
        const sleepState = getSleepState(object);
        sleepState.tryToSleep();
        if (sleepState.canSleep() || !sleepState.isAwake()) {
          if (sleepState.isAwake()) {
            // Avoid onWakingUp to be called if some managers didn't have time
            // to update their awake object list.
            sleepState._onWakingUpCallbacks.length = 0;
          }
          sleepState._state = gdjs.ObjectSleepState.State.ASleep;
          onFallenAsleep(object);
          sleepState._onWakingUpCallbacks.push(onWakingUp);
        } else {
          awakeObjects[writeIndex] = object;
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
