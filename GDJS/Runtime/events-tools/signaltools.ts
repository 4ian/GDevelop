/*
 * GDevelop JS Platform
 * Copyright 2013-present Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  const logger = new gdjs.Logger('SignalSystem');
  const maxSignalsDispatchedPerFrame = 10000;
  const maxSignalDebugRecordsPerFrame = 24;
  const maxSignalDebugReceiverNamesPerSignal = 4;
  const maxSignalAnimationDebugRecordsPerFrame = 8;
  const maxSignalAnimationDebugPointsPerSignal = 4;
  const maxSignalMonitorDebugRecords = 40;
  const maxSignalMonitorDebugReceiversPerSignal = 40;

  export type SignalDebugStatus = 'delivered' | 'unhandled' | 'throttled';

  type SignalDebugEmitter = {
    objectName: string;
    objectId: integer;
  };

  export type RuntimeSignalTarget =
    | { kind: 'scene' }
    | { kind: 'objectInstance'; objectId: integer };

  export type RuntimeSignal = {
    id: integer;
    name: string;
    payload: string;
    target: RuntimeSignalTarget;
    emittedFrameId: integer;
    deliveredFrameId: integer | null;
  };

  export type SignalDebugPoint = {
    objectName: string;
    objectId: integer;
    x: float;
    y: float;
    layer: string;
  };

  export type SignalAnimationDebugReceiver = SignalDebugPoint & {
    receiverName: string;
    isUnhandled?: boolean;
    isThrottled?: boolean;
  };

  export type SignalDebugReceiver = SignalAnimationDebugReceiver & {
    receiverKind: 'scene' | 'prefab' | 'behavior';
  };

  export type SignalAnimationDebugRecord = {
    id: integer;
    name: string;
    payload: string;
    target: string;
    status: SignalDebugStatus;
    source: SignalDebugPoint;
    receivers: SignalAnimationDebugReceiver[];
  };

  export type SignalDebugRecord = {
    id: integer;
    name: string;
    payload: string;
    target: string;
    emittedFrameId: integer;
    deliveredFrameId: integer | null;
    status: SignalDebugStatus;
    receivers: string[];
    source: SignalDebugPoint | null;
    receiverPositions: SignalDebugReceiver[];
    targetPositions: SignalAnimationDebugReceiver[];
  };

  type InternalSignalDebugRecord = SignalDebugRecord & {
    enableDebugPoints: boolean;
  };

  export type SignalDebugInfo = {
    frameId: integer;
    queuedSignalsCount: integer;
    emittedSignalsCount: integer;
    throttledSignalsCount: integer;
    deliveredSignalsThisFrameCount: integer;
    receiversThisFrameCount: integer;
    signalsThisFrame: SignalDebugRecord[];
    recentSignals: SignalDebugRecord[];
  };

  const makePublicSignalDebugRecord = (
    record: InternalSignalDebugRecord
  ): SignalDebugRecord => ({
    id: record.id,
    name: record.name,
    payload: record.payload,
    target: record.target,
    emittedFrameId: record.emittedFrameId,
    deliveredFrameId: record.deliveredFrameId,
    status: record.status,
    receivers: record.receivers,
    source: record.source,
    receiverPositions: record.receiverPositions,
    targetPositions: record.targetPositions,
  });

  export interface RuntimeScene {
    _signalBus?: gdjs.SignalBus;
    getSignalBus(): gdjs.SignalBus;
    getRuntimeObjectByUniqueId(objectId: integer): gdjs.RuntimeObject | null;
    isSignalAnimationDebugDrawEnabled(): boolean;
    isSignalMonitorDebugEnabled(): boolean;
  }

  type RuntimeSignalReceiver = gdjs.RuntimeObject | gdjs.RuntimeBehavior;

  const getSignalRuntimeScene = (
    instanceContainer: gdjs.RuntimeInstanceContainer
  ): gdjs.RuntimeScene => instanceContainer.getScene();

  const normalizePayload = (payload?: string): string =>
    payload === undefined || payload === null ? '' : '' + payload;

  const makeDebugEmitter = (
    runtimeObject?: gdjs.RuntimeObject | null
  ): SignalDebugEmitter | null =>
    runtimeObject
      ? {
          objectName: runtimeObject.getName(),
          objectId: runtimeObject.getUniqueId(),
        }
      : null;

  const describeSignalTarget = (target: RuntimeSignalTarget): string =>
    target.kind === 'scene' ? 'scene' : 'objectInstance:#' + target.objectId;

  const runtimeObjectHasOnSignal = (
    runtimeObject: gdjs.RuntimeObject
  ): boolean => {
    const handler = (runtimeObject as any).onSignal;
    return (
      typeof handler === 'function' &&
      handler !== gdjs.CustomRuntimeObject.prototype.onSignal
    );
  };

  const runtimeBehaviorHasOnSignal = (
    runtimeBehavior: gdjs.RuntimeBehavior
  ): boolean => {
    const handler = (runtimeBehavior as any).onSignal;
    return (
      typeof handler === 'function' &&
      handler !== gdjs.RuntimeBehavior.prototype.onSignal
    );
  };

  const isRuntimeObjectLiving = (runtimeObject: gdjs.RuntimeObject): boolean =>
    (runtimeObject as any)._livingOnScene !== false;

  const isRuntimeBehavior = (
    receiver: RuntimeSignalReceiver
  ): receiver is gdjs.RuntimeBehavior =>
    receiver instanceof gdjs.RuntimeBehavior;

  const isRuntimeBehaviorAttached = (behavior: gdjs.RuntimeBehavior): boolean =>
    isRuntimeObjectLiving(behavior.owner) &&
    behavior.owner.getBehavior(behavior.getName()) === behavior;

  const getRuntimeObjectSignalDebugPoint = (
    runtimeObject: gdjs.RuntimeObject
  ): SignalDebugPoint => ({
    objectName: runtimeObject.getName(),
    objectId: runtimeObject.getUniqueId(),
    x: runtimeObject.getCenterXInScene(),
    y: runtimeObject.getCenterYInScene(),
    layer: runtimeObject.getLayer(),
  });

  const getSceneSignalDebugPoint = (
    runtimeScene: gdjs.RuntimeScene
  ): SignalDebugPoint => {
    const baseLayer = runtimeScene.getLayer('');
    return {
      objectName: 'scene',
      objectId: -1,
      x: baseLayer.getCameraX(),
      y: baseLayer.getCameraY(),
      layer: '',
    };
  };

  const getVirtualSignalDebugPoint = (
    runtimeScene: gdjs.RuntimeScene,
    objectName: string,
    objectId: integer = -1
  ): SignalDebugPoint => ({
    ...getSceneSignalDebugPoint(runtimeScene),
    objectName,
    objectId,
  });

  const isSignalAnimationDebugDrawEnabled = (
    runtimeScene: gdjs.RuntimeScene
  ): boolean => runtimeScene.isSignalAnimationDebugDrawEnabled();

  const shouldResolveSignalDebugSource = (
    runtimeScene: gdjs.RuntimeScene
  ): boolean =>
    runtimeScene.isSignalAnimationDebugDrawEnabled() ||
    runtimeScene.isSignalMonitorDebugEnabled();

  /**
   * A scene-local, next-frame signal queue.
   *
   * There are exactly two destinations: the scene broadcast channel and one
   * runtime object instance. Scene subscribers are resolved at delivery time.
   */
  export class SignalBus {
    private _queuedSignals: RuntimeSignal[] = [];
    private _deliveredSignalsThisFrame: RuntimeSignal[] = [];
    private _deliveredSceneSignalsThisFrame: RuntimeSignal[] = [];
    private _sceneSubscriptions = new Map<string, RuntimeSignalReceiver[]>();
    private _signalsThisFrameDebugRecords: InternalSignalDebugRecord[] = [];
    private _recentSignalMonitorDebugRecords: InternalSignalDebugRecord[] = [];
    private _signalDebugRecordsById = new Map<
      integer,
      InternalSignalDebugRecord
    >();
    /** Debugger-only metadata, deliberately kept off public RuntimeSignal values. */
    private _signalDebugEmittersById = new Map<integer, SignalDebugEmitter>();
    private _currentSceneSignal: RuntimeSignal | null = null;
    private _nextSignalId: integer = 1;
    private _frameId: integer = 0;
    private _emittedSignalsCount: integer = 0;
    private _throttledSignalsCount: integer = 0;
    private _receiversThisFrameCount: integer = 0;

    emitSignal(
      name: string,
      target: RuntimeSignalTarget,
      payload?: string,
      debugEmitter?: gdjs.RuntimeObject | null
    ): void {
      if (!name) {
        logger.warn('Ignored a signal with an empty name.');
        return;
      }

      const id = this._nextSignalId++;
      const signalDebugEmitter = makeDebugEmitter(debugEmitter);
      if (signalDebugEmitter) {
        this._signalDebugEmittersById.set(id, signalDebugEmitter);
      }
      this._queuedSignals.push({
        id,
        name,
        payload: normalizePayload(payload),
        target,
        emittedFrameId: this._frameId,
        deliveredFrameId: null,
      });
      this._emittedSignalsCount++;
    }

    subscribeToSceneSignal(
      signalName: string,
      receiver: RuntimeSignalReceiver | null | undefined
    ): void {
      if (!signalName) {
        logger.warn('Ignored a scene signal subscription with an empty name.');
        return;
      }
      if (!receiver) {
        logger.warn(
          'Ignored scene signal subscription "' +
            signalName +
            '" because it was not made from a prefab or behavior instance.'
        );
        return;
      }

      let subscribers = this._sceneSubscriptions.get(signalName);
      if (!subscribers) {
        subscribers = [];
        this._sceneSubscriptions.set(signalName, subscribers);
      }
      if (subscribers.indexOf(receiver) === -1) {
        subscribers.push(receiver);
      }
    }

    removeSubscriptionsForObject(runtimeObject: gdjs.RuntimeObject): void {
      this._sceneSubscriptions.forEach((subscribers, signalName) => {
        for (let index = subscribers.length - 1; index >= 0; --index) {
          const receiver = subscribers[index];
          if (
            receiver === runtimeObject ||
            (isRuntimeBehavior(receiver) && receiver.owner === runtimeObject)
          ) {
            subscribers.splice(index, 1);
          }
        }
        if (subscribers.length === 0) {
          this._sceneSubscriptions.delete(signalName);
        }
      });
    }

    removeSubscriptionsForBehavior(
      runtimeBehavior: gdjs.RuntimeBehavior
    ): void {
      this._sceneSubscriptions.forEach((subscribers, signalName) => {
        const index = subscribers.indexOf(runtimeBehavior);
        if (index !== -1) {
          subscribers.splice(index, 1);
        }
        if (subscribers.length === 0) {
          this._sceneSubscriptions.delete(signalName);
        }
      });
    }

    dispatchQueuedSignals(runtimeScene: gdjs.RuntimeScene): void {
      this._frameId++;
      this._currentSceneSignal = null;
      this._deliveredSignalsThisFrame.length = 0;
      this._deliveredSceneSignalsThisFrame.length = 0;
      this._signalsThisFrameDebugRecords.length = 0;
      this._signalDebugRecordsById.clear();
      this._receiversThisFrameCount = 0;

      // Swap queues before dispatch. Anything emitted by a handler is thereby
      // guaranteed to wait for the following frame.
      const deliveryBatch = this._queuedSignals;
      this._queuedSignals = [];
      const deliveryCount = Math.min(
        deliveryBatch.length,
        maxSignalsDispatchedPerFrame
      );

      for (let index = 0; index < deliveryCount; ++index) {
        this._dispatchSignal(runtimeScene, deliveryBatch[index]);
      }

      if (deliveryCount < deliveryBatch.length) {
        const throttledSignals = deliveryBatch.slice(deliveryCount);
        this._throttledSignalsCount += throttledSignals.length;
        logger.warn(
          'Signal dispatch limit reached. Retained ' +
            throttledSignals.length +
            ' signals for the next frame.'
        );
        for (let index = 0; index < throttledSignals.length; ++index) {
          this._recordThrottledSignal(runtimeScene, throttledSignals[index]);
        }
        // Older overflow always stays ahead of signals emitted by handlers.
        this._queuedSignals = throttledSignals.concat(this._queuedSignals);
      }
    }

    getDeliveredSignals(signalName: string): RuntimeSignal[] {
      return this._deliveredSignalsThisFrame.filter(
        (signal) => !signalName || signal.name === signalName
      );
    }

    getDeliveredSceneSignals(signalName: string): RuntimeSignal[] {
      return this._deliveredSceneSignalsThisFrame.filter(
        (signal) => !signalName || signal.name === signalName
      );
    }

    /**
     * Return the scene-signal batch delivered for the current frame without
     * allocating a filtered copy. Generated lifecycle dispatchers must treat
     * this array as read-only.
     */
    getDeliveredSceneSignalBatch(): readonly RuntimeSignal[] {
      return this._deliveredSceneSignalsThisFrame;
    }

    setCurrentSignalForSceneCondition(signal: RuntimeSignal): void {
      this._currentSceneSignal = signal;
    }

    clearCurrentSignalForSceneCondition(): void {
      this._currentSceneSignal = null;
    }

    clearCurrentSignal(): void {
      this._currentSceneSignal = null;
    }

    getCurrentSceneSignal(): RuntimeSignal | null {
      return this._currentSceneSignal;
    }

    isSignalReceived(signalName: string): boolean {
      return !!(
        this._currentSceneSignal &&
        (!signalName || this._currentSceneSignal.name === signalName)
      );
    }

    clear(): void {
      this._queuedSignals.length = 0;
      this._deliveredSignalsThisFrame.length = 0;
      this._deliveredSceneSignalsThisFrame.length = 0;
      this._sceneSubscriptions.clear();
      this._signalsThisFrameDebugRecords.length = 0;
      this._recentSignalMonitorDebugRecords.length = 0;
      this._signalDebugRecordsById.clear();
      this._signalDebugEmittersById.clear();
      this._currentSceneSignal = null;
      this._receiversThisFrameCount = 0;
    }

    getQueuedSignalsCount(): integer {
      return this._queuedSignals.length;
    }

    getDebugInfo(): SignalDebugInfo {
      return {
        frameId: this._frameId,
        queuedSignalsCount: this._queuedSignals.length,
        emittedSignalsCount: this._emittedSignalsCount,
        throttledSignalsCount: this._throttledSignalsCount,
        deliveredSignalsThisFrameCount: this._deliveredSignalsThisFrame.length,
        receiversThisFrameCount: this._receiversThisFrameCount,
        signalsThisFrame: this._signalsThisFrameDebugRecords.map((record) => ({
          ...makePublicSignalDebugRecord(record),
          status: this._getDebugStatus(record),
        })),
        recentSignals: this._recentSignalMonitorDebugRecords.map((record) => ({
          ...makePublicSignalDebugRecord(record),
          status: this._getDebugStatus(record),
        })),
      };
    }

    getSignalAnimationDebugRecords(): SignalAnimationDebugRecord[] {
      const records: SignalAnimationDebugRecord[] = [];
      const startIndex = Math.max(
        0,
        this._signalsThisFrameDebugRecords.length -
          maxSignalAnimationDebugRecordsPerFrame
      );
      for (
        let index = startIndex;
        index < this._signalsThisFrameDebugRecords.length;
        ++index
      ) {
        const record = this._signalsThisFrameDebugRecords[index];
        if (!record.enableDebugPoints || !record.source) continue;
        const status = this._getDebugStatus(record);
        const positions =
          record.receiverPositions.length > 0
            ? record.receiverPositions
            : record.targetPositions;
        if (positions.length === 0) continue;
        records.push({
          id: record.id,
          name: record.name,
          payload: record.payload,
          target: record.target,
          status,
          source: record.source,
          receivers: positions
            .slice(0, maxSignalAnimationDebugPointsPerSignal)
            .map((position) => ({
              ...position,
              isUnhandled: status === 'unhandled',
              isThrottled: status === 'throttled',
            })),
        });
      }
      return records;
    }

    recordSceneSignalReceiver(
      runtimeScene: gdjs.RuntimeScene,
      signal: RuntimeSignal
    ): void {
      const record = this._signalDebugRecordsById.get(signal.id);
      if (record) {
        this._recordReceiverName(record, 'scene');
        this._recordReceiverPosition(
          record,
          getSceneSignalDebugPoint(runtimeScene),
          'scene',
          'scene'
        );
      }
      this._receiversThisFrameCount++;
    }

    private _dispatchSignal(
      runtimeScene: gdjs.RuntimeScene,
      signal: RuntimeSignal
    ): void {
      signal.deliveredFrameId = this._frameId;
      this._deliveredSignalsThisFrame.push(signal);
      const record = this._createDebugRecord(runtimeScene, signal, 'delivered');

      if (signal.target.kind === 'scene') {
        this._deliveredSceneSignalsThisFrame.push(signal);
        this._recordTargetPosition(
          record,
          getSceneSignalDebugPoint(runtimeScene),
          'scene'
        );
        this._dispatchSceneSignal(signal, record);
      } else {
        this._dispatchDirectSignal(runtimeScene, signal, record);
      }
      this._signalDebugEmittersById.delete(signal.id);
    }

    private _dispatchSceneSignal(
      signal: RuntimeSignal,
      record: InternalSignalDebugRecord
    ): void {
      const subscribers = this._sceneSubscriptions.get(signal.name);
      if (!subscribers) return;

      // A receiver subscribing while this signal is delivered must not join
      // this delivery. It can receive subsequent queued signals.
      const snapshot = subscribers.slice();
      for (let index = 0; index < snapshot.length; ++index) {
        const receiver = snapshot[index];
        if (isRuntimeBehavior(receiver)) {
          if (!isRuntimeBehaviorAttached(receiver)) {
            this.removeSubscriptionsForBehavior(receiver);
            continue;
          }
          if (!receiver.activated()) continue;
          if (!runtimeBehaviorHasOnSignal(receiver)) continue;
          (receiver as any).onSignal(signal.name, signal.payload);
          this._recordRuntimeReceiver(
            record,
            receiver.owner,
            receiver.getName(),
            'behavior'
          );
        } else {
          if (!isRuntimeObjectLiving(receiver)) {
            this.removeSubscriptionsForObject(receiver);
            continue;
          }
          if (!runtimeObjectHasOnSignal(receiver)) continue;
          (receiver as any).onSignal(signal.name, signal.payload);
          this._recordRuntimeReceiver(
            record,
            receiver,
            receiver.getName(),
            'prefab'
          );
        }
      }
    }

    private _dispatchDirectSignal(
      runtimeScene: gdjs.RuntimeScene,
      signal: RuntimeSignal,
      record: InternalSignalDebugRecord
    ): void {
      if (signal.target.kind !== 'objectInstance') return;
      const objectId = signal.target.objectId;
      const runtimeObject = runtimeScene.getRuntimeObjectByUniqueId(objectId);
      if (!runtimeObject || !isRuntimeObjectLiving(runtimeObject)) {
        this._recordTargetPosition(
          record,
          getVirtualSignalDebugPoint(
            runtimeScene,
            'instance #' + objectId,
            objectId
          ),
          'instance #' + objectId
        );
        logger.warn(
          'Signal "' +
            signal.name +
            '" targeted missing instance #' +
            objectId +
            ' and was dismissed.'
        );
        return;
      }

      this._recordTargetPosition(
        record,
        getRuntimeObjectSignalDebugPoint(runtimeObject),
        runtimeObject.getName()
      );
      if (!runtimeObjectHasOnSignal(runtimeObject)) {
        logger.warn(
          'Signal "' +
            signal.name +
            '" targeted ' +
            runtimeObject.getName() +
            ' instance #' +
            objectId +
            ', but the prefab does not define onSignal. The signal was dismissed.'
        );
        return;
      }

      // Direct signals deliberately never fan out to attached behaviors.
      (runtimeObject as any).onSignal(signal.name, signal.payload);
      this._recordRuntimeReceiver(
        record,
        runtimeObject,
        runtimeObject.getName(),
        'prefab'
      );
    }

    private _recordRuntimeReceiver(
      record: InternalSignalDebugRecord,
      runtimeObject: gdjs.RuntimeObject,
      receiverName: string,
      receiverKind: 'prefab' | 'behavior'
    ): void {
      this._recordReceiverName(record, receiverName);
      this._recordReceiverPosition(
        record,
        getRuntimeObjectSignalDebugPoint(runtimeObject),
        receiverName,
        receiverKind
      );
      this._receiversThisFrameCount++;
    }

    private _recordReceiverName(
      record: InternalSignalDebugRecord,
      receiverName: string
    ): void {
      if (
        record.receivers.length < maxSignalDebugReceiverNamesPerSignal &&
        record.receivers.indexOf(receiverName) === -1
      ) {
        record.receivers.push(receiverName);
      }
    }

    private _recordReceiverPosition(
      record: InternalSignalDebugRecord,
      point: SignalDebugPoint,
      receiverName: string,
      receiverKind: 'scene' | 'prefab' | 'behavior'
    ): void {
      if (
        !record.enableDebugPoints ||
        !record.source ||
        record.receiverPositions.length >=
          maxSignalMonitorDebugReceiversPerSignal
      ) {
        return;
      }
      record.receiverPositions.push({ ...point, receiverName, receiverKind });
    }

    private _recordTargetPosition(
      record: InternalSignalDebugRecord,
      point: SignalDebugPoint,
      receiverName: string
    ): void {
      if (
        !record.enableDebugPoints ||
        !record.source ||
        record.targetPositions.length >= maxSignalAnimationDebugPointsPerSignal
      ) {
        return;
      }
      record.targetPositions.push({ ...point, receiverName });
    }

    private _createDebugRecord(
      runtimeScene: gdjs.RuntimeScene,
      signal: RuntimeSignal,
      status: SignalDebugStatus
    ): InternalSignalDebugRecord {
      const record: InternalSignalDebugRecord = {
        id: signal.id,
        name: signal.name,
        payload: signal.payload,
        target: describeSignalTarget(signal.target),
        emittedFrameId: signal.emittedFrameId,
        deliveredFrameId: signal.deliveredFrameId,
        status,
        receivers: [],
        source: null,
        receiverPositions: [],
        targetPositions: [],
        enableDebugPoints:
          isSignalAnimationDebugDrawEnabled(runtimeScene) ||
          runtimeScene.isSignalMonitorDebugEnabled(),
      };
      if (
        this._signalsThisFrameDebugRecords.length <
        maxSignalDebugRecordsPerFrame
      ) {
        record.source = this._getDebugSource(runtimeScene, signal);
        this._signalsThisFrameDebugRecords.push(record);
        this._signalDebugRecordsById.set(signal.id, record);
        if (runtimeScene.isSignalMonitorDebugEnabled()) {
          this._recentSignalMonitorDebugRecords.push(record);
          if (
            this._recentSignalMonitorDebugRecords.length >
            maxSignalMonitorDebugRecords
          ) {
            this._recentSignalMonitorDebugRecords.shift();
          }
        }
      }
      return record;
    }

    private _recordThrottledSignal(
      runtimeScene: gdjs.RuntimeScene,
      signal: RuntimeSignal
    ): void {
      const record = this._createDebugRecord(runtimeScene, signal, 'throttled');
      if (signal.target.kind === 'scene') {
        this._recordTargetPosition(
          record,
          getSceneSignalDebugPoint(runtimeScene),
          'scene'
        );
      } else {
        const runtimeObject = runtimeScene.getRuntimeObjectByUniqueId(
          signal.target.objectId
        );
        this._recordTargetPosition(
          record,
          runtimeObject
            ? getRuntimeObjectSignalDebugPoint(runtimeObject)
            : getVirtualSignalDebugPoint(
                runtimeScene,
                'instance #' + signal.target.objectId,
                signal.target.objectId
              ),
          runtimeObject
            ? runtimeObject.getName()
            : 'instance #' + signal.target.objectId
        );
      }
    }

    private _getDebugSource(
      runtimeScene: gdjs.RuntimeScene,
      signal: RuntimeSignal
    ): SignalDebugPoint | null {
      if (!shouldResolveSignalDebugSource(runtimeScene)) return null;
      const signalDebugEmitter = this._signalDebugEmittersById.get(signal.id);
      if (signalDebugEmitter) {
        const runtimeObject = runtimeScene.getRuntimeObjectByUniqueId(
          signalDebugEmitter.objectId
        );
        if (runtimeObject && isRuntimeObjectLiving(runtimeObject)) {
          return getRuntimeObjectSignalDebugPoint(runtimeObject);
        }
        return getVirtualSignalDebugPoint(
          runtimeScene,
          signalDebugEmitter.objectName,
          signalDebugEmitter.objectId
        );
      }
      return getSceneSignalDebugPoint(runtimeScene);
    }

    private _getDebugStatus(
      record: InternalSignalDebugRecord
    ): SignalDebugStatus {
      if (record.status === 'throttled') return 'throttled';
      return record.receivers.length === 0 ? 'unhandled' : 'delivered';
    }
  }

  gdjs.RuntimeScene.prototype.getSignalBus = function (): gdjs.SignalBus {
    if (!this._signalBus) this._signalBus = new gdjs.SignalBus();
    return this._signalBus;
  };

  export namespace evtTools {
    export namespace signal {
      export const emitSceneSignal = function (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        signalName: string,
        payload?: string
      ): void {
        getSignalRuntimeScene(instanceContainer)
          .getSignalBus()
          .emitSignal(signalName, { kind: 'scene' }, payload);
      };

      /** @internal Used by generated events to attach debugger metadata. */
      export const emitSceneSignalFromEvents = function (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        signalName: string,
        payload: string,
        debugEmitter?: gdjs.RuntimeObject
      ): void {
        getSignalRuntimeScene(instanceContainer)
          .getSignalBus()
          .emitSignal(signalName, { kind: 'scene' }, payload, debugEmitter);
      };

      export const emitSignalToInstance = function (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        objectId: number,
        signalName: string,
        payload?: string
      ): void {
        emitSignalToInstanceFromEvents(
          instanceContainer,
          objectId,
          signalName,
          payload || ''
        );
      };

      /** @internal Used by generated events to attach debugger metadata. */
      export const emitSignalToInstanceFromEvents = function (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        objectId: number,
        signalName: string,
        payload: string,
        debugEmitter?: gdjs.RuntimeObject
      ): void {
        if (!isFinite(objectId) || objectId <= 0 || objectId % 1 !== 0) {
          logger.warn(
            'Ignored direct signal "' +
              signalName +
              '" because instance id "' +
              objectId +
              '" is invalid.'
          );
          return;
        }
        getSignalRuntimeScene(instanceContainer)
          .getSignalBus()
          .emitSignal(
            signalName,
            { kind: 'objectInstance', objectId: objectId as integer },
            payload,
            debugEmitter
          );
      };

      export const subscribeSceneSignal = function (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        receiver: gdjs.RuntimeObject | gdjs.RuntimeBehavior | null | undefined,
        signalName: string
      ): void {
        getSignalRuntimeScene(instanceContainer)
          .getSignalBus()
          .subscribeToSceneSignal(signalName, receiver);
      };

      export const isSignalReceived = function (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        signalName: string
      ): boolean {
        return getSignalRuntimeScene(instanceContainer)
          .getSignalBus()
          .isSignalReceived(signalName);
      };

      export const getDeliveredSignals = function (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        signalName: string
      ): RuntimeSignal[] {
        return getSignalRuntimeScene(instanceContainer)
          .getSignalBus()
          .getDeliveredSignals(signalName);
      };

      export const getDeliveredSceneSignals = function (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        signalName: string
      ): RuntimeSignal[] {
        return getSignalRuntimeScene(instanceContainer)
          .getSignalBus()
          .getDeliveredSceneSignals(signalName);
      };

      /** @internal Non-copying view used by generated scene lifecycle code. */
      export const getDeliveredSceneSignalBatch = function (
        instanceContainer: gdjs.RuntimeInstanceContainer
      ): readonly RuntimeSignal[] {
        return getSignalRuntimeScene(instanceContainer)
          .getSignalBus()
          .getDeliveredSceneSignalBatch();
      };

      export const setCurrentSignalForSceneCondition = function (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        signal: RuntimeSignal
      ): void {
        getSignalRuntimeScene(instanceContainer)
          .getSignalBus()
          .setCurrentSignalForSceneCondition(signal);
      };

      export const clearCurrentSignalForSceneCondition = function (
        instanceContainer: gdjs.RuntimeInstanceContainer
      ): void {
        getSignalRuntimeScene(instanceContainer)
          .getSignalBus()
          .clearCurrentSignalForSceneCondition();
      };

      export const recordSceneSignalReceived = function (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        signal: RuntimeSignal
      ): void {
        const runtimeScene = getSignalRuntimeScene(instanceContainer);
        runtimeScene
          .getSignalBus()
          .recordSceneSignalReceiver(runtimeScene, signal);
      };

      export const getSignalName = function (
        instanceContainer: gdjs.RuntimeInstanceContainer
      ): string {
        return (
          getSignalRuntimeScene(instanceContainer)
            .getSignalBus()
            .getCurrentSceneSignal()?.name || ''
        );
      };

      export const getSignalPayload = function (
        instanceContainer: gdjs.RuntimeInstanceContainer
      ): string {
        return (
          getSignalRuntimeScene(instanceContainer)
            .getSignalBus()
            .getCurrentSceneSignal()?.payload || ''
        );
      };
    }
  }

  gdjs.registerObjectDeletedFromSceneCallback((instanceContainer, object) => {
    instanceContainer
      .getScene()
      ._signalBus?.removeSubscriptionsForObject(object);
  });

  gdjs.registerRuntimeScenePreEventsCallback((runtimeScene) => {
    runtimeScene.getSignalBus().dispatchQueuedSignals(runtimeScene);
  });

  gdjs.registerRuntimeScenePostEventsCallback((runtimeScene) => {
    runtimeScene.getSignalBus().clearCurrentSignal();
  });

  gdjs.registerRuntimeSceneUnloadingCallback((runtimeScene) => {
    runtimeScene.getSignalBus().clear();
  });
}
