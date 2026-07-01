/*
 * GDevelop JS Platform
 * Copyright 2013-present Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  const logger = new gdjs.Logger('SignalSystem');
  const maxSignalsDispatchedPerFrame = 10000;

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

  export type RuntimeSignalTarget =
    | { kind: 'scene' }
    | { kind: 'object'; objectName: string }
    | { kind: 'objectGroup'; objectGroupName: string }
    | {
        kind: 'pickedObjects';
        pickedObjects: gdjs.LongLivedObjectsList;
      }
    | {
        kind: 'behavior';
        objectName: string;
        behaviorName: string;
      };

  export type RuntimeSignal = {
    id: integer;
    name: string;
    payload: gdjs.Variable | null;
    target: RuntimeSignalTarget;
    sender: RuntimeSignalSender | null;
    emittedFrameId: integer;
    deliveredFrameId: integer | null;
  };

  export type SignalDebugRecord = {
    id: integer;
    name: string;
    target: string;
    emittedFrameId: integer;
    deliveredFrameId: integer;
    receivers: string[];
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

  const clonePayload = (
    payload: gdjs.Variable | gdjs.VariablesContainer | null | undefined
  ): gdjs.Variable | null => {
    if (!payload || (payload as gdjs.Variable)._undefinedInContainer) {
      return null;
    }
    if (payload instanceof gdjs.Variable) {
      return payload.clone();
    }

    const payloadAsContainer = payload as gdjs.VariablesContainer;
    if (!payloadAsContainer._variables) {
      return null;
    }
    const rootVariable = new gdjs.Variable({ type: 'structure' });
    const variables = payloadAsContainer._variables.items;
    for (const variableName in variables) {
      if (variables.hasOwnProperty(variableName)) {
        rootVariable.addChild(variableName, variables[variableName].clone());
      }
    }
    return rootVariable;
  };

  const getSignalPayloadChild = (
    signal: RuntimeSignal | null,
    childName?: string
  ): gdjs.Variable | null => {
    if (!signal || !signal.payload) {
      return null;
    }
    if (!childName) {
      return signal.payload;
    }
    if (signal.payload.getType() === 'structure') {
      return signal.payload.hasChild(childName)
        ? signal.payload.getChild(childName)
        : null;
    }
    if (signal.payload.getType() === 'array') {
      return signal.payload.getChild(childName);
    }
    return null;
  };

  const clonePayloadForReceiver = (signal: RuntimeSignal): gdjs.Variable => {
    return signal.payload
      ? signal.payload.clone()
      : new gdjs.Variable({ type: 'structure' });
  };

  const getSenderObjectName = (signal: RuntimeSignal): string => {
    return signal.sender?.objectName || '';
  };

  const getSenderInstanceId = (signal: RuntimeSignal): integer => {
    return signal.sender?.objectId ?? -1;
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
    if (target.kind === 'objectGroup')
      return 'objectGroup:' + target.objectGroupName;
    if (target.kind === 'behavior')
      return 'behavior:' + target.objectName + '.' + target.behaviorName;
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

  const objectCtorHasOnSignal = (Ctor: typeof gdjs.RuntimeObject) => {
    const handler = (Ctor.prototype as any).onSignal;
    return (
      typeof handler === 'function' &&
      handler !== gdjs.CustomRuntimeObject.prototype.onSignal
    );
  };

  const behaviorCtorHasOnSignal = (Ctor: typeof gdjs.RuntimeBehavior) => {
    const handler = Ctor.prototype.onSignal;
    return (
      typeof handler === 'function' &&
      handler !== gdjs.RuntimeBehavior.prototype.onSignal
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
    private _receiverObjectNames: string[] = [];
    private _receiverBehaviorNamesByObjectName = new Map<string, string[]>();
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
      this._receiverBehaviorNamesByObjectName.clear();

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

        const behaviorReceiverNames: string[] = [];
        const behaviorsData = objectDataItems[objectName].behaviors || [];
        for (let i = 0, len = behaviorsData.length; i < len; ++i) {
          const behaviorData = behaviorsData[i];
          const behaviorCtor = gdjs.getBehaviorConstructor(behaviorData.type);
          if (behaviorCtorHasOnSignal(behaviorCtor)) {
            behaviorReceiverNames.push(behaviorData.name);
          }
        }
        if (behaviorReceiverNames.length > 0) {
          this._receiverBehaviorNamesByObjectName.set(
            objectName,
            behaviorReceiverNames
          );
        }
      }
    }

    emitSignal(
      name: string,
      target: RuntimeSignalTarget,
      payload?: gdjs.Variable | gdjs.VariablesContainer | null,
      sender?: RuntimeSignalSenderInput
    ): void {
      this._queuedSignals.push({
        id: this._nextSignalId++,
        name: name || '',
        payload: clonePayload(payload),
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
        if (!signalName || signal.name === signalName) {
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
      this._receiverObjectNames.length = 0;
      this._receiverBehaviorNamesByObjectName.clear();
      this._currentSignal = null;
      this._isDispatchingSignalReceivers = false;
      this._isSceneSignalConditionContext = false;
      this._receiversThisFrameCount = 0;
    }

    getDebugInfo(): SignalDebugInfo {
      return {
        frameId: this._frameId,
        queuedSignalsCount: this._queuedSignals.length,
        emittedSignalsCount: this._emittedSignalsCount,
        droppedSignalsCount: this._droppedSignalsCount,
        deliveredSignalsThisFrameCount: this._deliveredSignalsThisFrame.length,
        receiversThisFrameCount: this._receiversThisFrameCount,
        signalsThisFrame: this._signalsThisFrameDebugRecords.slice(),
      };
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
        target: describeSignalTarget(signal.target),
        emittedFrameId: signal.emittedFrameId,
        deliveredFrameId: signal.deliveredFrameId,
        receivers: [],
      };

      this._isDispatchingSignalReceivers = true;
      try {
        if (signal.target.kind === 'scene') {
          this._dispatchToSceneReceivers(runtimeScene, signal, debugRecord);
        } else if (signal.target.kind === 'object') {
          this._dispatchToObjects(
            runtimeScene,
            signal.target.objectName,
            signal,
            debugRecord
          );
        } else if (signal.target.kind === 'objectGroup') {
          const objectNames = runtimeScene.getObjectNamesInGroup(
            signal.target.objectGroupName
          );
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
            signal.target.pickedObjects,
            signal,
            debugRecord
          );
        } else {
          this._dispatchToBehavior(
            runtimeScene,
            signal.target.objectName,
            signal.target.behaviorName,
            signal,
            debugRecord
          );
        }
      } finally {
        this._isDispatchingSignalReceivers = false;
        this._currentSignal = null;
      }

      this._signalsThisFrameDebugRecords.push(debugRecord);
      this._signalDebugRecordsById.set(signal.id, debugRecord);
      this._receiversThisFrameCount += debugRecord.receivers.length;
    }

    recordSceneSignalReceiver(signal: RuntimeSignal): void {
      const debugRecord = this._signalDebugRecordsById.get(signal.id);
      if (!debugRecord) {
        return;
      }
      debugRecord.receivers.push('scene');
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
      this._receiverBehaviorNamesByObjectName.forEach(
        (_behaviorNames, objectName) => objectNames.add(objectName)
      );

      objectNames.forEach((objectName) => {
        this._dispatchToObjects(runtimeScene, objectName, signal, debugRecord, {
          onlyIndexedObjectReceivers: true,
          behaviorNames:
            this._receiverBehaviorNamesByObjectName.get(objectName),
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
        behaviorNames?: string[];
      }
    ): void {
      const runtimeObjects = runtimeScene.getObjects(objectName).slice();
      for (let i = 0, len = runtimeObjects.length; i < len; ++i) {
        this._dispatchToRuntimeObject(
          runtimeObjects[i],
          signal,
          debugRecord,
          options
        );
      }
    }

    private _dispatchToPickedObjects(
      pickedObjects: gdjs.LongLivedObjectsList,
      signal: RuntimeSignal,
      debugRecord: SignalDebugRecord
    ): void {
      const objectNames = pickedObjects.getObjectNames();
      for (let i = 0, len = objectNames.length; i < len; ++i) {
        const objectName = objectNames[i];
        const runtimeObjects = pickedObjects.getObjects(objectName).slice();
        for (let j = 0, lenj = runtimeObjects.length; j < lenj; ++j) {
          this._dispatchToRuntimeObject(runtimeObjects[j], signal, debugRecord);
        }
      }
    }

    private _dispatchToBehavior(
      runtimeScene: gdjs.RuntimeScene,
      objectName: string,
      behaviorName: string,
      signal: RuntimeSignal,
      debugRecord: SignalDebugRecord
    ): void {
      const runtimeObjects = runtimeScene.getObjects(objectName).slice();
      for (let i = 0, len = runtimeObjects.length; i < len; ++i) {
        this._dispatchToRuntimeObject(runtimeObjects[i], signal, debugRecord, {
          skipObjectReceiver: true,
          behaviorNames: [behaviorName],
        });
      }
    }

    private _dispatchToRuntimeObject(
      runtimeObject: gdjs.RuntimeObject,
      signal: RuntimeSignal,
      debugRecord: SignalDebugRecord,
      options?: {
        skipObjectReceiver?: boolean;
        onlyIndexedObjectReceivers?: boolean;
        behaviorNames?: string[];
      }
    ): void {
      if (!isRuntimeObjectLiving(runtimeObject)) {
        return;
      }

      if (
        !options?.skipObjectReceiver &&
        (!options?.onlyIndexedObjectReceivers ||
          runtimeObjectCanReceiveObjectSignal(runtimeObject)) &&
        runtimeObjectHasOnSignal(runtimeObject)
      ) {
        (runtimeObject as any).onSignal(
          signal.name,
          clonePayloadForReceiver(signal),
          getSenderObjectName(signal),
          getSenderInstanceId(signal)
        );
        debugRecord.receivers.push(runtimeObject.getName());
      }

      if (options?.behaviorNames) {
        for (let i = 0, len = options.behaviorNames.length; i < len; ++i) {
          const behaviorName = options.behaviorNames[i];
          if (
            runtimeObject.signalBehaviorsOnSignal(
              signal.name,
              clonePayloadForReceiver(signal),
              getSenderObjectName(signal),
              getSenderInstanceId(signal),
              behaviorName
            ) > 0
          ) {
            debugRecord.receivers.push(
              runtimeObject.getName() + '.' + behaviorName
            );
          }
        }
      } else {
        const behaviorReceiverCount = runtimeObject.signalBehaviorsOnSignal(
          signal.name,
          clonePayloadForReceiver(signal),
          getSenderObjectName(signal),
          getSenderInstanceId(signal)
        );
        if (behaviorReceiverCount > 0) {
          debugRecord.receivers.push(
            runtimeObject.getName() + '.*(' + behaviorReceiverCount + ')'
          );
        }
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
        payload?: gdjs.Variable | gdjs.VariablesContainer | null,
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
        payload?: gdjs.Variable | gdjs.VariablesContainer | null,
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

      export const emitSignalToPickedObjects = function (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        objectsLists: Hashtable<gdjs.RuntimeObject[]>,
        signalName: string,
        payload?: gdjs.Variable | gdjs.VariablesContainer | null,
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
        payload?: gdjs.Variable | gdjs.VariablesContainer | null,
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

      export const emitSignalToBehavior = function (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        objectName: string,
        behaviorName: string,
        signalName: string,
        payload?: gdjs.Variable | gdjs.VariablesContainer | null,
        sender?: RuntimeSignalSenderInput
      ) {
        const runtimeScene = getSignalRuntimeScene(instanceContainer);
        runtimeScene
          .getSignalBus()
          .emitSignal(
            signalName,
            { kind: 'behavior', objectName, behaviorName },
            payload,
            sender
          );
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
        runtimeScene.getSignalBus().recordSceneSignalReceiver(signal);
      };

      export const getSignalName = function (
        instanceContainer: gdjs.RuntimeInstanceContainer
      ): string {
        const runtimeScene = getSignalRuntimeScene(instanceContainer);
        return runtimeScene.getSignalBus().getCurrentSignal()?.name || '';
      };

      export const getSignalPayloadNumber = function (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        childName?: string
      ): number {
        const runtimeScene = getSignalRuntimeScene(instanceContainer);
        return (
          getSignalPayloadChild(
            runtimeScene.getSignalBus().getCurrentSignal(),
            childName
          )?.getAsNumber() || 0
        );
      };

      export const getSignalPayloadString = function (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        childName?: string
      ): string {
        const runtimeScene = getSignalRuntimeScene(instanceContainer);
        return (
          getSignalPayloadChild(
            runtimeScene.getSignalBus().getCurrentSignal(),
            childName
          )?.getAsString() || ''
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
