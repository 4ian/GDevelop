/*
 * GDevelop JS Platform
 * Copyright 2013-present Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  const logger = new gdjs.Logger('SignalSystem');
  const maxSignalsDispatchedPerFrame = 10000;
  const maxDroppedSignalDebugRecordsPerFrame = 24;
  const maxSignalDebugRecordsPerFrame = 24;
  const maxSignalDebugReceiverNamesPerSignal = 4;
  const maxSignalAnimationDebugRecordsPerFrame = 8;
  const maxSignalAnimationDebugPointsPerSignal = 4;

  export type SignalDebugStatus = 'delivered' | 'unhandled' | 'dropped';

  export type RuntimeSignalSender = {
    objectName?: string;
    objectId?: integer;
  };

  export type RuntimeSignalSenderInput =
    | gdjs.RuntimeObject
    | RuntimeSignalSender
    | Hashtable<gdjs.RuntimeObject[]>
    | null
    | undefined;

  export type RuntimeSignalPayloadInput =
    | string
    | number
    | boolean
    | gdjs.Variable
    | gdjs.VariablesContainer
    | null
    | undefined;

  export type RuntimeSignalTarget =
    | { kind: 'scene' }
    | { kind: 'object'; objectName: string }
    | {
        kind: 'objectInstance';
        objectId: integer;
      }
    | { kind: 'objectGroup'; objectGroupName: string }
    | {
        kind: 'pickedObjects';
        pickedObjects: gdjs.LongLivedObjectsList;
      };

  export type RuntimeSignal = {
    id: integer;
    name: string;
    payload: string;
    target: RuntimeSignalTarget;
    sender: RuntimeSignalSender | null;
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
    isDropped?: boolean;
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
    receiverPositions: SignalAnimationDebugReceiver[];
    targetPositions: SignalAnimationDebugReceiver[];
  };

  export type SignalDebugInfo = {
    frameId: integer;
    queuedSignalsCount: integer;
    emittedSignalsCount: integer;
    droppedSignalsCount: integer;
    deliveredSignalsThisFrameCount: integer;
    receiversThisFrameCount: integer;
    signalsThisFrame: SignalDebugRecord[];
  };

  export interface RuntimeScene {
    _signalBus?: gdjs.SignalBus;
    getSignalBus(): gdjs.SignalBus;
    getObjectNamesInGroup(objectGroupName: string): string[];
    isSignalAnimationDebugDrawEnabled(): boolean;
  }

  const getRuntimeObjectListsItems = (
    objectsLists: Hashtable<gdjs.RuntimeObject[]> | null | undefined
  ): { [objectName: string]: gdjs.RuntimeObject[] } => {
    return objectsLists ? objectsLists.items : {};
  };

  const getSignalRuntimeScene = (
    instanceContainer: gdjs.RuntimeInstanceContainer
  ): gdjs.RuntimeScene => {
    return instanceContainer.getScene();
  };

  const normalizePayload = (payload?: RuntimeSignalPayloadInput): string => {
    if (payload === null || payload === undefined) {
      return '';
    }
    if (
      typeof payload === 'string' ||
      typeof payload === 'number' ||
      typeof payload === 'boolean'
    ) {
      return '' + payload;
    }
    if ((payload as gdjs.Variable)._undefinedInContainer) {
      return '';
    }
    if (payload instanceof gdjs.Variable) {
      return payload.getAsString();
    }

    const payloadAsContainer = payload as gdjs.VariablesContainer;
    if (!payloadAsContainer._variables) {
      return '';
    }
    return '';
  };

  const getSignalPayloadAsString = (signal: RuntimeSignal | null): string => {
    return signal ? signal.payload : '';
  };

  const normalizeSender = (
    sender?: RuntimeSignalSenderInput
  ): RuntimeSignalSender | null => {
    if (!sender) {
      return null;
    }
    if (sender instanceof gdjs.RuntimeObject) {
      return {
        objectName: sender.getName(),
        objectId: sender.getUniqueId(),
      };
    }

    const senderAsObjectLists = sender as Hashtable<gdjs.RuntimeObject[]>;
    if (senderAsObjectLists.items) {
      const objectListsItems = getRuntimeObjectListsItems(senderAsObjectLists);
      for (const objectName in objectListsItems) {
        if (!objectListsItems.hasOwnProperty(objectName)) {
          continue;
        }
        const runtimeObjects = objectListsItems[objectName];
        if (runtimeObjects.length > 0) {
          const runtimeObject = runtimeObjects[0];
          return {
            objectName: runtimeObject.getName(),
            objectId: runtimeObject.getUniqueId(),
          };
        }
      }
      return null;
    }

    const senderAsRecord = sender as RuntimeSignalSender;
    return {
      objectName: senderAsRecord.objectName,
      objectId: senderAsRecord.objectId,
    };
  };

  const describeSignalTarget = (target: RuntimeSignalTarget): string => {
    if (target.kind === 'scene') return 'scene';
    if (target.kind === 'object') return 'object:' + target.objectName;
    if (target.kind === 'objectInstance')
      return 'objectInstance:#' + target.objectId;
    if (target.kind === 'objectGroup')
      return 'objectGroup:' + target.objectGroupName;
    return 'pickedObjects';
  };

  const runtimeObjectHasOnSignal = (runtimeObject: gdjs.RuntimeObject) => {
    const handler = (runtimeObject as any).onSignal;
    return (
      typeof handler === 'function' &&
      handler !== gdjs.CustomRuntimeObject.prototype.onSignal
    );
  };

  const runtimeObjectCanReceiveObjectSignal = (
    runtimeObject: gdjs.RuntimeObject
  ) => {
    return runtimeObjectHasOnSignal(runtimeObject);
  };

  const isRuntimeObjectLiving = (runtimeObject: gdjs.RuntimeObject) => {
    return (runtimeObject as any)._livingOnScene !== false;
  };

  const isSignalAnimationDebugDrawEnabled = (
    runtimeScene: gdjs.RuntimeScene
  ): boolean => {
    const isEnabled = runtimeScene.isSignalAnimationDebugDrawEnabled;
    return typeof isEnabled === 'function' && isEnabled.call(runtimeScene);
  };

  const getRuntimeObjectSignalDebugPoint = (
    runtimeObject: gdjs.RuntimeObject
  ): SignalDebugPoint => {
    return {
      objectName: runtimeObject.getName(),
      objectId: runtimeObject.getUniqueId(),
      x: runtimeObject.getCenterXInScene(),
      y: runtimeObject.getCenterYInScene(),
      layer: runtimeObject.getLayer(),
    };
  };

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
    objectName: string
  ): SignalDebugPoint => {
    const scenePoint = getSceneSignalDebugPoint(runtimeScene);
    return {
      ...scenePoint,
      objectName,
      objectId: -1,
    };
  };

  const findRuntimeObjectBySignalSender = (
    runtimeScene: gdjs.RuntimeScene,
    sender: RuntimeSignalSender | null
  ): gdjs.RuntimeObject | null => {
    if (!sender || !sender.objectName) {
      return null;
    }

    const runtimeObjects = getRuntimeObjectsWithoutCreating(
      runtimeScene,
      sender.objectName
    );
    if (!runtimeObjects) {
      return null;
    }
    for (let i = 0, len = runtimeObjects.length; i < len; ++i) {
      const runtimeObject = runtimeObjects[i];
      if (!isRuntimeObjectLiving(runtimeObject)) {
        continue;
      }
      if (
        sender.objectId === undefined ||
        runtimeObject.getUniqueId() === sender.objectId
      ) {
        return runtimeObject;
      }
    }

    return null;
  };

  const getRuntimeObjectsWithoutCreating = (
    runtimeScene: gdjs.RuntimeScene,
    objectName: string
  ): gdjs.RuntimeObject[] | null => {
    if (runtimeScene._instances.containsKey(objectName)) {
      return runtimeScene._instances.get(objectName);
    }
    if (runtimeScene._objects.containsKey(objectName)) {
      return [];
    }
    return null;
  };

  const objectCtorHasOnSignal = (Ctor: typeof gdjs.RuntimeObject) => {
    const handler = (Ctor.prototype as any).onSignal;
    return (
      typeof handler === 'function' &&
      handler !== gdjs.CustomRuntimeObject.prototype.onSignal
    );
  };

  /**
   * A scene-level signal queue.
   *
   * Signals are always queued. Signals emitted during frame N are delivered by
   * the scene pre-events callback of frame N+1.
   */
  export class SignalBus {
    private _queuedSignals: RuntimeSignal[] = [];
    private _deliveredSignalsThisFrame: RuntimeSignal[] = [];
    private _signalsThisFrameDebugRecords: SignalDebugRecord[] = [];
    private _signalDebugRecordsById = new Map<integer, SignalDebugRecord>();
    private _signalDebugSourcesBySenderKey = new Map<
      string,
      SignalDebugPoint | null
    >();
    private _receiverObjectNames: string[] = [];
    private _currentSignal: RuntimeSignal | null = null;
    private _isDispatchingSignalReceivers = false;
    private _isSceneSignalConditionContext = false;
    private _nextSignalId: integer = 1;
    private _frameId: integer = 0;
    private _emittedSignalsCount: integer = 0;
    private _droppedSignalsCount: integer = 0;
    private _receiversThisFrameCount: integer = 0;

    refreshReceiverIndex(runtimeScene: gdjs.RuntimeScene) {
      this._receiverObjectNames.length = 0;

      const objectDataItems = runtimeScene._objects.items;
      const objectCtorItems = runtimeScene._objectsCtor.items;
      for (const objectName in objectDataItems) {
        if (!objectDataItems.hasOwnProperty(objectName)) {
          continue;
        }

        const objectCtor = objectCtorItems[objectName];
        if (objectCtor && objectCtorHasOnSignal(objectCtor)) {
          this._receiverObjectNames.push(objectName);
        }
      }
    }

    emitSignal(
      name: string,
      target: RuntimeSignalTarget,
      payload?: RuntimeSignalPayloadInput,
      sender?: RuntimeSignalSenderInput
    ): void {
      if (!name) {
        logger.warn('Ignored a signal with an empty name.');
        return;
      }

      this._queuedSignals.push({
        id: this._nextSignalId++,
        name,
        payload: normalizePayload(payload),
        target,
        sender: normalizeSender(sender),
        emittedFrameId: this._frameId,
        deliveredFrameId: null,
      });
      this._emittedSignalsCount++;
    }

    dispatchQueuedSignals(runtimeScene: gdjs.RuntimeScene): void {
      this._frameId++;
      this._currentSignal = null;
      this._isDispatchingSignalReceivers = false;
      this._isSceneSignalConditionContext = false;
      this._deliveredSignalsThisFrame.length = 0;
      this._signalsThisFrameDebugRecords.length = 0;
      this._signalDebugRecordsById.clear();
      this._signalDebugSourcesBySenderKey.clear();
      this._receiversThisFrameCount = 0;

      if (this._queuedSignals.length === 0) {
        return;
      }

      let signalIndex = 0;
      const lastDispatchedSignalNames: string[] = [];
      while (
        signalIndex < this._queuedSignals.length &&
        signalIndex < maxSignalsDispatchedPerFrame
      ) {
        const signal = this._queuedSignals[signalIndex++];
        this._dispatchSignal(runtimeScene, signal);
        lastDispatchedSignalNames.push(signal.name);
        if (lastDispatchedSignalNames.length > 5) {
          lastDispatchedSignalNames.shift();
        }
        if (signal.target.kind === 'pickedObjects') {
          signal.target.pickedObjects.clear();
        }
      }

      if (signalIndex < this._queuedSignals.length) {
        const droppedSignals = this._queuedSignals.length - signalIndex;
        this._droppedSignalsCount += droppedSignals;
        logger.warn(
          'Signal dispatch limit reached after: ' +
            lastDispatchedSignalNames.join(', ') +
            '. Dropped ' +
            droppedSignals +
            ' queued signals.'
        );
        for (let i = signalIndex; i < this._queuedSignals.length; ++i) {
          const signal = this._queuedSignals[i];
          if (i - signalIndex < maxDroppedSignalDebugRecordsPerFrame) {
            this._recordDroppedSignal(runtimeScene, signal);
          }
          if (signal.target.kind === 'pickedObjects') {
            signal.target.pickedObjects.clear();
          }
        }
      }
      this._queuedSignals.length = 0;
    }

    getDeliveredSignalsThisFrame(): RuntimeSignal[] {
      return this._deliveredSignalsThisFrame;
    }

    getDeliveredSignals(signalName: string): RuntimeSignal[] {
      if (!signalName) {
        return this._deliveredSignalsThisFrame.slice();
      }

      const matchingSignals: RuntimeSignal[] = [];
      for (
        let i = 0, len = this._deliveredSignalsThisFrame.length;
        i < len;
        ++i
      ) {
        const signal = this._deliveredSignalsThisFrame[i];
        if (signal.name === signalName) {
          matchingSignals.push(signal);
        }
      }
      return matchingSignals;
    }

    getDeliveredSceneSignals(signalName: string): RuntimeSignal[] {
      const matchingSignals: RuntimeSignal[] = [];
      for (
        let i = 0, len = this._deliveredSignalsThisFrame.length;
        i < len;
        ++i
      ) {
        const signal = this._deliveredSignalsThisFrame[i];
        if (
          signal.target.kind === 'scene' &&
          (!signalName || signal.name === signalName)
        ) {
          matchingSignals.push(signal);
        }
      }
      return matchingSignals;
    }

    getCurrentSignal(): RuntimeSignal | null {
      return this._currentSignal;
    }

    setCurrentSignal(signal: RuntimeSignal | null): void {
      this._currentSignal = signal;
    }

    clearCurrentSignal(): void {
      this._currentSignal = null;
      this._isSceneSignalConditionContext = false;
    }

    setCurrentSignalForSceneCondition(signal: RuntimeSignal): void {
      this._currentSignal = signal;
      this._isSceneSignalConditionContext = true;
    }

    clearCurrentSignalForSceneCondition(): void {
      this._currentSignal = null;
      this._isSceneSignalConditionContext = false;
    }

    isSignalReceived(signalName: string): boolean {
      if (
        (this._isDispatchingSignalReceivers ||
          this._isSceneSignalConditionContext) &&
        this._currentSignal
      ) {
        return !signalName || this._currentSignal.name === signalName;
      }

      for (
        let i = 0, len = this._deliveredSignalsThisFrame.length;
        i < len;
        ++i
      ) {
        const signal = this._deliveredSignalsThisFrame[i];
        if (
          signal.target.kind === 'scene' &&
          (!signalName || signal.name === signalName)
        ) {
          this._currentSignal = signal;
          return true;
        }
      }
      return false;
    }

    clear(): void {
      for (let i = 0; i < this._queuedSignals.length; ++i) {
        const signal = this._queuedSignals[i];
        if (signal.target.kind === 'pickedObjects') {
          signal.target.pickedObjects.clear();
        }
      }
      this._queuedSignals.length = 0;
      this._deliveredSignalsThisFrame.length = 0;
      this._signalsThisFrameDebugRecords.length = 0;
      this._signalDebugRecordsById.clear();
      this._signalDebugSourcesBySenderKey.clear();
      this._receiverObjectNames.length = 0;
      this._currentSignal = null;
      this._isDispatchingSignalReceivers = false;
      this._isSceneSignalConditionContext = false;
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
        droppedSignalsCount: this._droppedSignalsCount,
        deliveredSignalsThisFrameCount: this._deliveredSignalsThisFrame.length,
        receiversThisFrameCount: this._receiversThisFrameCount,
        signalsThisFrame: this._signalsThisFrameDebugRecords.map(
          (debugRecord) => ({
            ...debugRecord,
            status: this._getSignalDebugRecordStatus(debugRecord),
          })
        ),
      };
    }

    private _getSignalDebugRecordStatus(
      debugRecord: SignalDebugRecord
    ): SignalDebugStatus {
      if (debugRecord.status === 'dropped') {
        return 'dropped';
      }
      return debugRecord.receivers.length === 0 ? 'unhandled' : 'delivered';
    }

    getSignalAnimationDebugRecords(): SignalAnimationDebugRecord[] {
      const signalAnimationDebugRecords: SignalAnimationDebugRecord[] = [];
      const startIndex = Math.max(
        0,
        this._signalsThisFrameDebugRecords.length -
          maxSignalAnimationDebugRecordsPerFrame
      );
      for (
        let i = startIndex, len = this._signalsThisFrameDebugRecords.length;
        i < len;
        ++i
      ) {
        const debugRecord = this._signalsThisFrameDebugRecords[i];
        const status = this._getSignalDebugRecordStatus(debugRecord);
        const receiverPositions =
          debugRecord.receiverPositions.length > 0
            ? debugRecord.receiverPositions
            : debugRecord.targetPositions;
        if (!debugRecord.source || receiverPositions.length === 0) {
          continue;
        }

        signalAnimationDebugRecords.push({
          id: debugRecord.id,
          name: debugRecord.name,
          payload: debugRecord.payload,
          target: debugRecord.target,
          status,
          source: debugRecord.source,
          receivers: receiverPositions.map((receiverPosition) => ({
            ...receiverPosition,
            isUnhandled: status === 'unhandled',
            isDropped: status === 'dropped',
          })),
        });
      }
      return signalAnimationDebugRecords;
    }

    private _getSignalDebugSource(
      runtimeScene: gdjs.RuntimeScene,
      signal: RuntimeSignal
    ): SignalDebugPoint | null {
      if (!isSignalAnimationDebugDrawEnabled(runtimeScene)) {
        return null;
      }

      const sender = signal.sender;
      const senderKey = sender?.objectName
        ? sender.objectName + ':' + (sender.objectId ?? '')
        : 'scene';
      if (this._signalDebugSourcesBySenderKey.has(senderKey)) {
        return this._signalDebugSourcesBySenderKey.get(senderKey)!;
      }

      const sourceRuntimeObject = findRuntimeObjectBySignalSender(
        runtimeScene,
        sender
      );
      if (sourceRuntimeObject) {
        const source = getRuntimeObjectSignalDebugPoint(sourceRuntimeObject);
        this._signalDebugSourcesBySenderKey.set(senderKey, source);
        return source;
      }

      if (sender?.objectName) {
        const virtualSource = getVirtualSignalDebugPoint(
          runtimeScene,
          sender.objectName
        );
        virtualSource.objectId = sender.objectId ?? -1;
        this._signalDebugSourcesBySenderKey.set(senderKey, virtualSource);
        return virtualSource;
      }

      const sceneSource = getSceneSignalDebugPoint(runtimeScene);
      this._signalDebugSourcesBySenderKey.set(senderKey, sceneSource);
      return sceneSource;
    }

    private _trackSignalDebugRecord(
      signal: RuntimeSignal,
      debugRecord: SignalDebugRecord
    ): boolean {
      if (
        this._signalsThisFrameDebugRecords.length >=
        maxSignalDebugRecordsPerFrame
      ) {
        return false;
      }

      this._signalsThisFrameDebugRecords.push(debugRecord);
      this._signalDebugRecordsById.set(signal.id, debugRecord);
      return true;
    }

    private _isSignalDebugRecordTracked(
      debugRecord: SignalDebugRecord
    ): boolean {
      return this._signalDebugRecordsById.get(debugRecord.id) === debugRecord;
    }

    private _recordSignalAnimationTarget(
      debugRecord: SignalDebugRecord,
      runtimeObject: gdjs.RuntimeObject,
      receiverName: string
    ): void {
      if (
        !this._isSignalDebugRecordTracked(debugRecord) ||
        !debugRecord.source ||
        debugRecord.target === 'scene' ||
        debugRecord.targetPositions.length >=
          maxSignalAnimationDebugPointsPerSignal
      ) {
        return;
      }

      debugRecord.targetPositions.push({
        ...getRuntimeObjectSignalDebugPoint(runtimeObject),
        receiverName,
      });
    }

    private _recordVirtualSignalAnimationTarget(
      runtimeScene: gdjs.RuntimeScene,
      debugRecord: SignalDebugRecord,
      receiverName: string,
      objectName?: string
    ): void {
      if (
        !this._isSignalDebugRecordTracked(debugRecord) ||
        !debugRecord.source ||
        debugRecord.target === 'scene' ||
        debugRecord.targetPositions.length >=
          maxSignalAnimationDebugPointsPerSignal
      ) {
        return;
      }

      const virtualObjectName = objectName || receiverName;
      if (
        debugRecord.targetPositions.some(
          (targetPosition) =>
            targetPosition.objectName === virtualObjectName &&
            targetPosition.receiverName === receiverName &&
            targetPosition.objectId < 0
        )
      ) {
        return;
      }

      debugRecord.targetPositions.push({
        ...getVirtualSignalDebugPoint(runtimeScene, virtualObjectName),
        receiverName,
      });
    }

    private _recordSceneSignalAnimationTarget(
      runtimeScene: gdjs.RuntimeScene,
      debugRecord: SignalDebugRecord
    ): void {
      if (
        !this._isSignalDebugRecordTracked(debugRecord) ||
        !debugRecord.source ||
        debugRecord.targetPositions.length >=
          maxSignalAnimationDebugPointsPerSignal
      ) {
        return;
      }

      if (
        debugRecord.targetPositions.some(
          (targetPosition) => targetPosition.receiverName === 'scene'
        )
      ) {
        return;
      }

      debugRecord.targetPositions.push({
        ...getSceneSignalDebugPoint(runtimeScene),
        receiverName: 'scene',
      });
    }

    private _recordSignalAnimationTargetsForObjects(
      runtimeScene: gdjs.RuntimeScene,
      objectName: string,
      debugRecord: SignalDebugRecord
    ): gdjs.RuntimeObject[] | null {
      const runtimeObjects = getRuntimeObjectsWithoutCreating(
        runtimeScene,
        objectName
      );
      if (!runtimeObjects) {
        this._recordVirtualSignalAnimationTarget(
          runtimeScene,
          debugRecord,
          objectName
        );
        return null;
      }

      const runtimeObjectsSnapshot = runtimeObjects.slice();
      if (!this._isSignalDebugRecordTracked(debugRecord)) {
        return runtimeObjectsSnapshot;
      }

      let hasLivingTarget = false;
      for (let i = 0, len = runtimeObjectsSnapshot.length; i < len; ++i) {
        const runtimeObject = runtimeObjectsSnapshot[i];
        if (!isRuntimeObjectLiving(runtimeObject)) {
          continue;
        }
        hasLivingTarget = true;
        this._recordSignalAnimationTarget(
          debugRecord,
          runtimeObject,
          objectName
        );
      }
      if (!hasLivingTarget) {
        this._recordVirtualSignalAnimationTarget(
          runtimeScene,
          debugRecord,
          objectName
        );
      }

      return runtimeObjectsSnapshot;
    }

    private _recordSignalAnimationTargetForObjectInstance(
      runtimeScene: gdjs.RuntimeScene,
      objectId: integer,
      debugRecord: SignalDebugRecord
    ): gdjs.RuntimeObject | null {
      const runtimeObjects = runtimeScene.getAdhocListOfAllInstances();
      for (let i = 0, len = runtimeObjects.length; i < len; ++i) {
        const runtimeObject = runtimeObjects[i];
        if (!isRuntimeObjectLiving(runtimeObject)) {
          continue;
        }
        if (runtimeObject.getUniqueId() === objectId) {
          this._recordSignalAnimationTarget(
            debugRecord,
            runtimeObject,
            runtimeObject.getName()
          );
          return runtimeObject;
        }
      }

      this._recordVirtualSignalAnimationTarget(
        runtimeScene,
        debugRecord,
        'instance #' + objectId
      );
      return null;
    }

    private _recordSignalAnimationTargetsForPickedObjects(
      runtimeScene: gdjs.RuntimeScene,
      pickedObjects: gdjs.LongLivedObjectsList,
      debugRecord: SignalDebugRecord
    ): {
      objectNames: string[];
      runtimeObjects: { [objectName: string]: gdjs.RuntimeObject[] };
    } {
      const pickedObjectSnapshots: {
        [objectName: string]: gdjs.RuntimeObject[];
      } = {};
      const objectNames = pickedObjects.getObjectNames();
      let hasLivingTarget = false;
      const isDebugRecordTracked =
        this._isSignalDebugRecordTracked(debugRecord);
      for (let i = 0, len = objectNames.length; i < len; ++i) {
        const objectName = objectNames[i];
        const runtimeObjects = pickedObjects.getObjects(objectName).slice();
        pickedObjectSnapshots[objectName] = runtimeObjects;
        if (!isDebugRecordTracked) {
          continue;
        }

        for (let j = 0, lenj = runtimeObjects.length; j < lenj; ++j) {
          const runtimeObject = runtimeObjects[j];
          if (!isRuntimeObjectLiving(runtimeObject)) {
            continue;
          }
          hasLivingTarget = true;
          this._recordSignalAnimationTarget(
            debugRecord,
            runtimeObject,
            objectName
          );
        }
      }

      if (!hasLivingTarget) {
        this._recordVirtualSignalAnimationTarget(
          runtimeScene,
          debugRecord,
          'picked objects',
          'pickedObjects'
        );
      }

      return {
        objectNames,
        runtimeObjects: pickedObjectSnapshots,
      };
    }

    private _recordDroppedSignalTarget(
      runtimeScene: gdjs.RuntimeScene,
      signal: RuntimeSignal,
      debugRecord: SignalDebugRecord
    ): void {
      if (signal.target.kind === 'scene') {
        this._recordSceneSignalAnimationTarget(runtimeScene, debugRecord);
      } else if (signal.target.kind === 'object') {
        this._recordSignalAnimationTargetsForObjects(
          runtimeScene,
          signal.target.objectName,
          debugRecord
        );
      } else if (signal.target.kind === 'objectInstance') {
        this._recordSignalAnimationTargetForObjectInstance(
          runtimeScene,
          signal.target.objectId,
          debugRecord
        );
      } else if (signal.target.kind === 'objectGroup') {
        const objectNames = runtimeScene.getObjectNamesInGroup(
          signal.target.objectGroupName
        );
        if (objectNames.length === 0) {
          this._recordVirtualSignalAnimationTarget(
            runtimeScene,
            debugRecord,
            'object group ' + signal.target.objectGroupName,
            'objectGroup:' + signal.target.objectGroupName
          );
        }
        for (let i = 0, len = objectNames.length; i < len; ++i) {
          this._recordSignalAnimationTargetsForObjects(
            runtimeScene,
            objectNames[i],
            debugRecord
          );
        }
      } else if (signal.target.kind === 'pickedObjects') {
        this._recordSignalAnimationTargetsForPickedObjects(
          runtimeScene,
          signal.target.pickedObjects,
          debugRecord
        );
      }
    }

    private _recordDroppedSignal(
      runtimeScene: gdjs.RuntimeScene,
      signal: RuntimeSignal
    ): void {
      const debugRecord: SignalDebugRecord = {
        id: signal.id,
        name: signal.name,
        payload: signal.payload,
        target: describeSignalTarget(signal.target),
        emittedFrameId: signal.emittedFrameId,
        deliveredFrameId: null,
        status: 'dropped',
        receivers: [],
        source: null,
        receiverPositions: [],
        targetPositions: [],
      };

      if (this._trackSignalDebugRecord(signal, debugRecord)) {
        debugRecord.source = this._getSignalDebugSource(runtimeScene, signal);
        this._recordDroppedSignalTarget(runtimeScene, signal, debugRecord);
      }
    }

    private _dispatchSignal(
      runtimeScene: gdjs.RuntimeScene,
      signal: RuntimeSignal
    ): void {
      signal.deliveredFrameId = this._frameId;
      this._deliveredSignalsThisFrame.push(signal);
      this._currentSignal = signal;

      const debugRecord: SignalDebugRecord = {
        id: signal.id,
        name: signal.name,
        payload: signal.payload,
        target: describeSignalTarget(signal.target),
        emittedFrameId: signal.emittedFrameId,
        deliveredFrameId: signal.deliveredFrameId,
        status: 'delivered',
        receivers: [],
        source: null,
        receiverPositions: [],
        targetPositions: [],
      };
      if (this._trackSignalDebugRecord(signal, debugRecord)) {
        debugRecord.source = this._getSignalDebugSource(runtimeScene, signal);
      }

      this._isDispatchingSignalReceivers = true;
      try {
        if (signal.target.kind === 'scene') {
          this._recordSceneSignalAnimationTarget(runtimeScene, debugRecord);
          this._dispatchToSceneReceivers(runtimeScene, signal, debugRecord);
        } else if (signal.target.kind === 'object') {
          this._dispatchToObjects(
            runtimeScene,
            signal.target.objectName,
            signal,
            debugRecord
          );
        } else if (signal.target.kind === 'objectInstance') {
          this._dispatchToObjectInstance(
            runtimeScene,
            signal.target.objectId,
            signal,
            debugRecord
          );
        } else if (signal.target.kind === 'objectGroup') {
          const objectNames = runtimeScene.getObjectNamesInGroup(
            signal.target.objectGroupName
          );
          if (objectNames.length === 0) {
            this._recordVirtualSignalAnimationTarget(
              runtimeScene,
              debugRecord,
              'object group ' + signal.target.objectGroupName,
              'objectGroup:' + signal.target.objectGroupName
            );
          }
          for (let i = 0, len = objectNames.length; i < len; ++i) {
            this._dispatchToObjects(
              runtimeScene,
              objectNames[i],
              signal,
              debugRecord
            );
          }
        } else if (signal.target.kind === 'pickedObjects') {
          this._dispatchToPickedObjects(
            runtimeScene,
            signal.target.pickedObjects,
            signal,
            debugRecord
          );
        }
      } finally {
        this._isDispatchingSignalReceivers = false;
        this._currentSignal = null;
      }

      if (!this._isSignalDebugRecordTracked(debugRecord)) {
        debugRecord.receiverPositions.length = 0;
        debugRecord.targetPositions.length = 0;
      }
    }

    private _recordSignalAnimationReceiver(
      debugRecord: SignalDebugRecord,
      runtimeObject: gdjs.RuntimeObject,
      receiverName: string
    ): void {
      if (
        !this._isSignalDebugRecordTracked(debugRecord) ||
        !debugRecord.source ||
        debugRecord.target === 'scene' ||
        debugRecord.receiverPositions.length >=
          maxSignalAnimationDebugPointsPerSignal
      ) {
        return;
      }

      debugRecord.receiverPositions.push({
        ...getRuntimeObjectSignalDebugPoint(runtimeObject),
        receiverName,
      });
    }

    recordSceneSignalReceiver(
      runtimeScene: gdjs.RuntimeScene,
      signal: RuntimeSignal
    ): void {
      const debugRecord = this._signalDebugRecordsById.get(signal.id);
      if (!debugRecord) {
        this._receiversThisFrameCount++;
        return;
      }
      if (debugRecord.receivers.length < maxSignalDebugReceiverNamesPerSignal) {
        debugRecord.receivers.push('scene');
      }
      if (
        debugRecord.source &&
        debugRecord.target === 'scene' &&
        debugRecord.receiverPositions.length <
          maxSignalAnimationDebugPointsPerSignal &&
        !debugRecord.receiverPositions.some(
          (receiverPosition) => receiverPosition.receiverName === 'scene'
        )
      ) {
        debugRecord.receiverPositions.push({
          ...getSceneSignalDebugPoint(runtimeScene),
          receiverName: 'scene',
        });
      }
      this._receiversThisFrameCount++;
    }

    private _dispatchToSceneReceivers(
      runtimeScene: gdjs.RuntimeScene,
      signal: RuntimeSignal,
      debugRecord: SignalDebugRecord
    ): void {
      const objectNames = new Set<string>();
      for (let i = 0, len = this._receiverObjectNames.length; i < len; ++i) {
        objectNames.add(this._receiverObjectNames[i]);
      }

      objectNames.forEach((objectName) => {
        this._dispatchToObjects(runtimeScene, objectName, signal, debugRecord, {
          onlyIndexedObjectReceivers: true,
        });
      });
    }

    private _dispatchToObjects(
      runtimeScene: gdjs.RuntimeScene,
      objectName: string,
      signal: RuntimeSignal,
      debugRecord: SignalDebugRecord,
      options?: {
        onlyIndexedObjectReceivers?: boolean;
      }
    ): void {
      const runtimeObjectsSnapshot =
        this._recordSignalAnimationTargetsForObjects(
          runtimeScene,
          objectName,
          debugRecord
        );
      if (!runtimeObjectsSnapshot) {
        logger.warn(
          'Signal "' +
            signal.name +
            '" targeted a non-existing object "' +
            objectName +
            '". The target was ignored.'
        );
        return;
      }

      for (let i = 0, len = runtimeObjectsSnapshot.length; i < len; ++i) {
        this._dispatchToRuntimeObject(
          runtimeObjectsSnapshot[i],
          signal,
          debugRecord,
          options
        );
      }
    }

    private _dispatchToObjectInstance(
      runtimeScene: gdjs.RuntimeScene,
      objectId: integer,
      signal: RuntimeSignal,
      debugRecord: SignalDebugRecord
    ): void {
      const runtimeObject = this._recordSignalAnimationTargetForObjectInstance(
        runtimeScene,
        objectId,
        debugRecord
      );
      if (runtimeObject) {
        this._dispatchToRuntimeObject(runtimeObject, signal, debugRecord);
      }
    }

    private _dispatchToPickedObjects(
      runtimeScene: gdjs.RuntimeScene,
      pickedObjects: gdjs.LongLivedObjectsList,
      signal: RuntimeSignal,
      debugRecord: SignalDebugRecord
    ): void {
      const pickedObjectTargets =
        this._recordSignalAnimationTargetsForPickedObjects(
          runtimeScene,
          pickedObjects,
          debugRecord
        );
      const objectNames = pickedObjectTargets.objectNames;
      for (let i = 0, len = objectNames.length; i < len; ++i) {
        const objectName = objectNames[i];
        const runtimeObjects = pickedObjectTargets.runtimeObjects[objectName];
        for (let j = 0, lenj = runtimeObjects.length; j < lenj; ++j) {
          this._dispatchToRuntimeObject(runtimeObjects[j], signal, debugRecord);
        }
      }
    }

    private _dispatchToRuntimeObject(
      runtimeObject: gdjs.RuntimeObject,
      signal: RuntimeSignal,
      debugRecord: SignalDebugRecord,
      options?: {
        onlyIndexedObjectReceivers?: boolean;
      }
    ): void {
      if (!isRuntimeObjectLiving(runtimeObject)) {
        return;
      }

      if (
        (!options?.onlyIndexedObjectReceivers ||
          runtimeObjectCanReceiveObjectSignal(runtimeObject)) &&
        runtimeObjectHasOnSignal(runtimeObject)
      ) {
        (runtimeObject as any).onSignal(signal.name, signal.payload);
        this._receiversThisFrameCount++;
        if (!this._isSignalDebugRecordTracked(debugRecord)) {
          return;
        }

        const runtimeObjectName = runtimeObject.getName();
        if (
          debugRecord.receivers.length < maxSignalDebugReceiverNamesPerSignal
        ) {
          debugRecord.receivers.push(runtimeObjectName);
        }
        this._recordSignalAnimationReceiver(
          debugRecord,
          runtimeObject,
          runtimeObjectName
        );
      }
    }
  }

  gdjs.RuntimeScene.prototype.getSignalBus = function (): gdjs.SignalBus {
    if (!this._signalBus) {
      this._signalBus = new gdjs.SignalBus();
    }
    return this._signalBus;
  };

  export namespace evtTools {
    export namespace signal {
      const capturePickedObjects = (
        objectsLists: Hashtable<gdjs.RuntimeObject[]>
      ): gdjs.LongLivedObjectsList => {
        const pickedObjects = new gdjs.LongLivedObjectsList();
        const objectsListsItems = getRuntimeObjectListsItems(objectsLists);
        for (const objectName in objectsListsItems) {
          if (!objectsListsItems.hasOwnProperty(objectName)) {
            continue;
          }
          const runtimeObjects = objectsListsItems[objectName];
          for (let i = 0, len = runtimeObjects.length; i < len; ++i) {
            pickedObjects.addObject(objectName, runtimeObjects[i]);
          }
        }
        return pickedObjects;
      };

      export const emitSceneSignal = function (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        signalName: string,
        payload?: RuntimeSignalPayloadInput,
        sender?: RuntimeSignalSenderInput
      ) {
        const runtimeScene = getSignalRuntimeScene(instanceContainer);
        runtimeScene
          .getSignalBus()
          .emitSignal(signalName, { kind: 'scene' }, payload, sender);
      };

      export const emitSignalToObject = function (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        objectNameOrObjectsLists:
          | string
          | Hashtable<gdjs.RuntimeObject[]>
          | null
          | undefined,
        signalName: string,
        payload?: RuntimeSignalPayloadInput,
        sender?: RuntimeSignalSenderInput
      ) {
        const runtimeScene = getSignalRuntimeScene(instanceContainer);
        if (typeof objectNameOrObjectsLists !== 'string') {
          emitSignalToPickedObjects(
            runtimeScene,
            objectNameOrObjectsLists || new Hashtable<gdjs.RuntimeObject[]>(),
            signalName,
            payload,
            sender
          );
          return;
        }
        runtimeScene
          .getSignalBus()
          .emitSignal(
            signalName,
            { kind: 'object', objectName: objectNameOrObjectsLists },
            payload,
            sender
          );
      };

      export const emitSignalToObjects = emitSignalToObject;

      export const emitSignalToObjectInstance = function (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        objectId: number,
        signalName: string,
        payload?: RuntimeSignalPayloadInput,
        sender?: RuntimeSignalSenderInput
      ) {
        const runtimeScene = getSignalRuntimeScene(instanceContainer);
        if (!isFinite(objectId) || objectId <= 0) {
          logger.warn(
            'Ignored object instance signal "' +
              signalName +
              '" because instance id "' +
              objectId +
              '" is invalid.'
          );
          return;
        }
        runtimeScene.getSignalBus().emitSignal(
          signalName,
          {
            kind: 'objectInstance',
            objectId: objectId as integer,
          },
          payload,
          sender
        );
      };

      export const emitSignalToPickedObjects = function (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        objectsLists: Hashtable<gdjs.RuntimeObject[]>,
        signalName: string,
        payload?: RuntimeSignalPayloadInput,
        sender?: RuntimeSignalSenderInput
      ) {
        const runtimeScene = getSignalRuntimeScene(instanceContainer);
        runtimeScene.getSignalBus().emitSignal(
          signalName,
          {
            kind: 'pickedObjects',
            pickedObjects: capturePickedObjects(objectsLists),
          },
          payload,
          sender
        );
      };

      export const emitSignalToObjectGroup = function (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        objectGroupName: string,
        signalName: string,
        payload?: RuntimeSignalPayloadInput,
        sender?: RuntimeSignalSenderInput
      ) {
        const runtimeScene = getSignalRuntimeScene(instanceContainer);
        runtimeScene
          .getSignalBus()
          .emitSignal(
            signalName,
            { kind: 'objectGroup', objectGroupName },
            payload,
            sender
          );
      };

      export const getSenderFromContext = function (
        eventsFunctionContext?: EventsFunctionContext | null
      ): RuntimeSignalSenderInput {
        if (!eventsFunctionContext) {
          return undefined;
        }
        const ownerObjects = eventsFunctionContext.getObjects('Object');
        return ownerObjects.length > 0 ? ownerObjects[0] : undefined;
      };

      export const isSignalReceived = function (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        signalName: string
      ): boolean {
        const runtimeScene = getSignalRuntimeScene(instanceContainer);
        return runtimeScene.getSignalBus().isSignalReceived(signalName);
      };

      export const getDeliveredSignals = function (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        signalName: string
      ): RuntimeSignal[] {
        const runtimeScene = getSignalRuntimeScene(instanceContainer);
        return runtimeScene.getSignalBus().getDeliveredSignals(signalName);
      };

      export const getDeliveredSceneSignals = function (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        signalName: string
      ): RuntimeSignal[] {
        const runtimeScene = getSignalRuntimeScene(instanceContainer);
        return runtimeScene.getSignalBus().getDeliveredSceneSignals(signalName);
      };

      export const setCurrentSignalForSceneCondition = function (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        signal: RuntimeSignal
      ): void {
        const runtimeScene = getSignalRuntimeScene(instanceContainer);
        runtimeScene.getSignalBus().setCurrentSignalForSceneCondition(signal);
      };

      export const clearCurrentSignalForSceneCondition = function (
        instanceContainer: gdjs.RuntimeInstanceContainer
      ): void {
        const runtimeScene = getSignalRuntimeScene(instanceContainer);
        runtimeScene.getSignalBus().clearCurrentSignalForSceneCondition();
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
        const runtimeScene = getSignalRuntimeScene(instanceContainer);
        return runtimeScene.getSignalBus().getCurrentSignal()?.name || '';
      };

      export const getSignalPayload = function (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        _childName?: string
      ): string {
        const runtimeScene = getSignalRuntimeScene(instanceContainer);
        return getSignalPayloadAsString(
          runtimeScene.getSignalBus().getCurrentSignal()
        );
      };

      export const getSignalSenderObjectName = function (
        instanceContainer: gdjs.RuntimeInstanceContainer
      ): string {
        const runtimeScene = getSignalRuntimeScene(instanceContainer);
        return (
          runtimeScene.getSignalBus().getCurrentSignal()?.sender?.objectName ||
          ''
        );
      };

      export const getSignalSenderInstanceId = function (
        instanceContainer: gdjs.RuntimeInstanceContainer
      ): number {
        const runtimeScene = getSignalRuntimeScene(instanceContainer);
        return (
          runtimeScene.getSignalBus().getCurrentSignal()?.sender?.objectId || -1
        );
      };

      export const getSignalDiagnostics = function (
        instanceContainer: gdjs.RuntimeInstanceContainer
      ): SignalDebugInfo {
        const runtimeScene = getSignalRuntimeScene(instanceContainer);
        return runtimeScene.getSignalBus().getDebugInfo();
      };
    }
  }

  gdjs.registerRuntimeSceneLoadedCallback((runtimeScene) => {
    runtimeScene.getSignalBus().refreshReceiverIndex(runtimeScene);
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
