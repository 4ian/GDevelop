/*
 * GDevelop JS Platform
 * Copyright 2023-2023 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  export class ObjectSleepState {
    private _object: RuntimeObject;
    private _isNeedingToBeAwake: () => boolean;
    private _lastActivityFrameIndex: integer;
    private _onWakingUpCallbacks: Array<(object: RuntimeObject) => void> = [];

    constructor(object: RuntimeObject, isNeedingToBeAwake: () => boolean) {
      this._object = object;
      this._isNeedingToBeAwake = isNeedingToBeAwake;
      this._lastActivityFrameIndex = Number.MIN_SAFE_INTEGER;
    }

    _forceToSleep(): void {
      if (!this.isAwake()) {
        return;
      }
      this._lastActivityFrameIndex = Number.NEGATIVE_INFINITY;
    }

    wakeUp() {
      const object = this._object;
      const wasAwake = this.isAwake();
      this._lastActivityFrameIndex = object.getRuntimeScene().getFrameIndex();
      if (!wasAwake) {
        for (const onWakingUp of this._onWakingUpCallbacks) {
          onWakingUp(object);
        }
      }
    }

    registerOnWakingUp(onWakingUp: (object: RuntimeObject) => void) {
      this._onWakingUpCallbacks.push(onWakingUp);
    }

    isAwake(): boolean {
      return (
        this._object.getRuntimeScene().getFrameIndex() -
          this._lastActivityFrameIndex <
        60
      );
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
        if (lifecycleSleepState.isAwake()) {
          writeIndex++;
        } else {
          onFallenAsleep(object);
        }
      }
      awakeObjects.length = writeIndex;
      return awakeObjects;
    }
  }
}
