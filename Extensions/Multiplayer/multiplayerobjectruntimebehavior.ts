/*
  GDevelop - Multiplayer Object Behavior Extension
  Copyright (c) 2013-2016 Florian Rival (Florian.Rival@gmail.com)
*/

namespace gdjs {
  const logger = new gdjs.Logger('Multiplayer');
  /**
   * The MultiplayerObjectRuntimeBehavior represents a behavior that can be added to objects
   * to make them synchronized over the network.
   */
  export class MultiplayerObjectRuntimeBehavior extends gdjs.RuntimeBehavior {
    // Which player is the owner of the object.
    // If 0, then the object is not owned by any player, so the host is the owner.
    _playerNumber: number = 0;

    // The action to be executed when the player disconnects.
    actionOnPlayerDisconnect: string;

    // The last time the object has been synchronized.
    // This is to avoid synchronizing the object too often, see _objectMaxTickRate.
    _lastObjectSyncTimestamp: number = 0;
    // The number of times per second the object should be synchronized if it keeps changing.
    _objectMaxTickRate: number = 60;

    // The last time the basic object info has been synchronized.
    _lastBasicObjectSyncTimestamp: number = 0;
    // The number of times per second the object basic info should be synchronized when it doesn't change.
    _objectBasicInfoTickRate: number = 5;
    // The last data sent to synchronize the basic info of the object.
    _lastSentBasicObjectSyncData: BasicObjectNetworkSyncData | undefined;
    // When we know that the basic info of the object has been updated, we can force sending them
    // on the max tickrate for a number of times to ensure they are received, without the need of an acknowledgment.
    _numberOfForcedBasicObjectUpdates: number = 0;

    // The last time the variables have been synchronized.
    _lastVariablesSyncTimestamp: number = 0;
    // The number of times per second the variables should be synchronized.
    _variablesTickRate: number = 1;
    // The last data sent to synchronize the variables.
    _lastSentVariableSyncData: VariableNetworkSyncData[] | undefined;
    // When we know that the variables have been updated, we can force sending them
    // on the same tickrate as the object update for a number of times
    // to ensure they are received, without the need of an acknowledgment.
    _numberOfForcedVariablesUpdates: number = 0;

    // The last time the effects have been synchronized.
    _lastEffectsSyncTimestamp: number = 0;
    // The number of times per second the effects should be synchronized.
    _effectsTickRate: number = 1;
    // The last data sent to synchronize the effects.
    _lastSentEffectSyncData:
      | { [effectName: string]: EffectNetworkSyncData }
      | undefined;
    // When we know that the effects have been updated, we can force sending them
    // on the same tickrate as the object update for a number of times
    // to ensure they are received, without the need of an acknowledgment.
    _numberOfForcedEffectsUpdates: number = 0;

    // To avoid seeing too many logs.
    _lastLogTimestamp: number = 0;
    _logTickRate: number = 1;
    _getTimeNow: () => number;
    // Clock to be incremented every time we send a message, to ensure they are ordered
    // and old messages are ignored.
    _clock: number = 0;
    _destroyInstanceTimeoutId: NodeJS.Timeout | null = null;
    _timeBeforeDestroyingObjectWithoutNetworkIdInMs = 500;

    constructor(
      instanceContainer: gdjs.RuntimeInstanceContainer,
      behaviorData,
      owner: RuntimeObject
    ) {
      super(instanceContainer, behaviorData, owner);
      this.actionOnPlayerDisconnect = behaviorData.actionOnPlayerDisconnect;
      this._getTimeNow =
        window.performance && typeof window.performance.now === 'function'
          ? window.performance.now.bind(window.performance)
          : Date.now;
      // When a synchronized object is created, we assume it will be assigned a networkId quickly if:
      // - It is a new object created by the current player. -> will be assigned a networkId when sending the update message.
      // - It is an object created by another player. -> will be assigned a networkId when receiving the update message.
      // There is a small risk that the object is created by us after we receive an update message from the host,
      // ending up with 2 objects created, one with a networkId (from the host) and one without (from us).
      // To handle this case and avoid having an object not synchronized, we set a timeout to destroy the object
      // if it has not been assigned a networkId after a short delay.

      this._destroyInstanceTimeoutId = setTimeout(() => {
        if (!owner.networkId) {
          logger.info(
            `Object ${owner.getName()} has not been assigned a networkId after a short delay, destroying it.`
          );
          owner.deleteFromScene(instanceContainer);
        }
      }, this._timeBeforeDestroyingObjectWithoutNetworkIdInMs);
    }

    sendDataToPeersWithIncreasedClock(messageName: string, data: Object) {
      this._clock++;
      data['_clock'] = this._clock;
      const connectedPeerIds = gdjs.evtTools.p2p.getAllPeers();
      for (const peerId of connectedPeerIds) {
        gdjs.multiplayerMessageManager.sendDataTo(peerId, messageName, data);
      }
    }

    isOwnerAsPlayerOrHost() {
      const currentPlayerNumber = gdjs.multiplayer.getPlayerNumber();

      const isOwnerOfObject =
        currentPlayerNumber === this._playerNumber || // Player as owner.
        (currentPlayerNumber === 1 && this._playerNumber === 0); // Host as owner.

      return isOwnerOfObject;
    }

    hasObjectBeenSyncedWithinMaxRate() {
      return (
        this._getTimeNow() - this._lastObjectSyncTimestamp <
        1000 / this._objectMaxTickRate
      );
    }

    hasObjectBasicInfoBeenSyncedRecently() {
      return (
        this._getTimeNow() - this._lastBasicObjectSyncTimestamp <
        1000 / this._objectBasicInfoTickRate
      );
    }

    haveVariablesBeenSyncedRecently() {
      return (
        this._getTimeNow() - this._lastVariablesSyncTimestamp <
        1000 / this._variablesTickRate
      );
    }

    haveEffectsBeenSyncedRecently() {
      return (
        this._getTimeNow() - this._lastEffectsSyncTimestamp <
        1000 / this._effectsTickRate
      );
    }

    logToConsoleWithThrottle(message: string) {
      if (
        this._getTimeNow() - this._lastLogTimestamp >
        1000 / this._logTickRate
      ) {
        logger.info(message);
        this._lastLogTimestamp = this._getTimeNow();
      }
    }

    getOrCreateInstanceNetworkId() {
      if (!this.owner.networkId) {
        // no ID for this object, let's generate one so it can be identified by other players.
        // Either use the persistentUuid if it exists, or generate a new one.
        // Keep it short to avoid sending too much data.
        const newID = this.owner.persistentUuid
          ? this.owner.persistentUuid.substring(0, 8)
          : gdjs.makeUuid().substring(0, 8);
        this.owner.networkId = newID;
      }

      return this.owner.networkId;
    }

    isBasicObjectNetworkSyncDataDifferentFromLastSync(
      basicObjectNetworkSyncData: BasicObjectNetworkSyncData
    ) {
      if (!this._lastSentBasicObjectSyncData) {
        return true;
      }

      // Compare the json of the basicObjectNetworkSyncData to check if they are different.
      // This is not the most efficient way to do it, but it's simple and should work.
      const haveBasicObjectNetworkSyncDataChanged =
        JSON.stringify(basicObjectNetworkSyncData) !==
        JSON.stringify(this._lastSentBasicObjectSyncData);

      return haveBasicObjectNetworkSyncDataChanged;
    }

    areVariablesDifferentFromLastSync(
      variablesSyncData: VariableNetworkSyncData[]
    ) {
      if (!this._lastSentVariableSyncData) {
        return true;
      }

      // Compare the json of the variables to check if they are different.
      // This is not the most efficient way to do it, but it's simple and should work.
      const haveVariableSyncDataChanged =
        JSON.stringify(variablesSyncData) !==
        JSON.stringify(this._lastSentVariableSyncData);

      return haveVariableSyncDataChanged;
    }

    areEffectsDifferentFromLastSync(effectsSyncData: {
      [effectName: string]: EffectNetworkSyncData;
    }) {
      if (!this._lastSentEffectSyncData) {
        return true;
      }

      for (const effectName in effectsSyncData) {
        if (!effectsSyncData.hasOwnProperty(effectName)) {
          continue;
        }

        const effectSyncData = effectsSyncData[effectName];
        const effectEnabled = effectSyncData.ena;
        const effectFilterCreator = effectSyncData.fc;

        const effectInLastSync = this._lastSentEffectSyncData[effectName];

        if (!effectInLastSync || effectInLastSync.ena !== effectEnabled) {
          return true;
        }

        for (const parameterName in effectFilterCreator) {
          if (!effectFilterCreator.hasOwnProperty(parameterName)) {
            continue;
          }

          const parameterValue = effectFilterCreator[parameterName];
          const lastParameterValueSent = effectInLastSync.fc[parameterName];
          if (lastParameterValueSent !== parameterValue) {
            return true;
          }
        }
      }

      return false;
    }

    doStepPostEvents() {
      if (!this.isOwnerAsPlayerOrHost()) {
        return;
      }

      // If the object has been synchronized recently at the max rate, then return.
      // This is to avoid sending data on every frame, which would be too much.
      if (this.hasObjectBeenSyncedWithinMaxRate()) {
        return;
      }

      // this.logToConsoleWithThrottle(
      //   `Synchronizing object ${this.owner.getName()} (instance ${
      //     this.owner.networkId
      //   }) with player ${this._playerNumber}`
      // );

      const instanceNetworkId = this.getOrCreateInstanceNetworkId();
      const objectName = this.owner.getName();
      const objectNetworkSyncData = this.owner.getObjectNetworkSyncData();

      const areBasicObjectNetworkSyncDataDifferent = this.isBasicObjectNetworkSyncDataDifferentFromLastSync(
        {
          x: objectNetworkSyncData.x,
          y: objectNetworkSyncData.y,
          z: objectNetworkSyncData.z,
          a: objectNetworkSyncData.a,
          hid: objectNetworkSyncData.hid,
          if: objectNetworkSyncData.if,
          pfx: objectNetworkSyncData.pfx,
          pfy: objectNetworkSyncData.pfy,
        }
      );
      const shouldSyncObjectBasicInfo =
        !this.hasObjectBasicInfoBeenSyncedRecently() ||
        areBasicObjectNetworkSyncDataDifferent ||
        this._numberOfForcedBasicObjectUpdates > 0;
      if (areBasicObjectNetworkSyncDataDifferent) {
        this._numberOfForcedBasicObjectUpdates = 3;
      }
      if (!shouldSyncObjectBasicInfo) {
        // If the basic info has not changed, assume we don't need to sync the whole object data at a high rate.
        // TODO: allow sending the variables, behaviors and effects still?
        return;
      }

      const areVariablesDifferent =
        objectNetworkSyncData.var &&
        this.areVariablesDifferentFromLastSync(objectNetworkSyncData.var);
      const shouldSyncVariables =
        !this.haveVariablesBeenSyncedRecently() ||
        areVariablesDifferent ||
        this._numberOfForcedVariablesUpdates > 0;
      if (areVariablesDifferent) {
        this._numberOfForcedVariablesUpdates = 3;
      }
      if (!shouldSyncVariables) {
        delete objectNetworkSyncData.var;
      }

      const areEffectsDifferent =
        objectNetworkSyncData.eff &&
        this.areEffectsDifferentFromLastSync(objectNetworkSyncData.eff);
      const shoundSyncEffects =
        !this.haveEffectsBeenSyncedRecently() ||
        areEffectsDifferent ||
        this._numberOfForcedEffectsUpdates > 0;
      if (areEffectsDifferent) {
        this._numberOfForcedEffectsUpdates = 3;
      }
      if (!shoundSyncEffects) {
        delete objectNetworkSyncData.eff;
      }

      const sceneNetworkId = this.owner.getRuntimeScene().networkId;
      if (!sceneNetworkId) {
        // No networkId for the scene yet, it will be set soon, let's not sync the object yet.
        return;
      }

      const {
        messageName: updateMessageName,
        messageData: updateMessageData,
      } = gdjs.multiplayerMessageManager.createUpdateObjectMessage({
        objectOwner: this._playerNumber,
        objectName,
        instanceNetworkId,
        objectNetworkSyncData,
        sceneNetworkId,
      });
      this.sendDataToPeersWithIncreasedClock(
        updateMessageName,
        updateMessageData
      );

      const now = this._getTimeNow();

      this._lastObjectSyncTimestamp = now;
      if (shouldSyncObjectBasicInfo) {
        this._lastBasicObjectSyncTimestamp = now;
        this._lastSentBasicObjectSyncData = {
          x: objectNetworkSyncData.x,
          y: objectNetworkSyncData.y,
          z: objectNetworkSyncData.z,
          a: objectNetworkSyncData.a,
          hid: objectNetworkSyncData.hid,
          if: objectNetworkSyncData.if,
          pfx: objectNetworkSyncData.pfx,
          pfy: objectNetworkSyncData.pfy,
        };
        this._numberOfForcedBasicObjectUpdates = Math.max(
          this._numberOfForcedBasicObjectUpdates - 1,
          0
        );
      }
      if (shouldSyncVariables) {
        this._lastVariablesSyncTimestamp = now;
        this._lastSentVariableSyncData = objectNetworkSyncData.var;
        this._numberOfForcedVariablesUpdates = Math.max(
          this._numberOfForcedVariablesUpdates - 1,
          0
        );
      }
      if (shoundSyncEffects) {
        this._lastEffectsSyncTimestamp = now;
        this._lastSentEffectSyncData = objectNetworkSyncData.eff;
        this._numberOfForcedEffectsUpdates = Math.max(
          this._numberOfForcedEffectsUpdates - 1,
          0
        );
      }
    }

    onDestroy() {
      if (this._destroyInstanceTimeoutId) {
        clearTimeout(this._destroyInstanceTimeoutId);
        this._destroyInstanceTimeoutId = null;
      }

      // For desruction of objects, we allow the host to destroy the object even if it is not the owner.
      // This is particularly helpful when a player disconnects, so the host can destroy the object they were owning.
      if (!this.isOwnerAsPlayerOrHost() && !gdjs.multiplayer.isPlayerHost()) {
        return;
      }

      const instanceNetworkId = this.owner.networkId;
      const objectName = this.owner.getName();

      // If it had no networkId, then it was not synchronized and we don't need to send a message.
      if (!instanceNetworkId) {
        logger.info(
          `Destroying object ${objectName} without networkId, no need to send a message.`
        );
        return;
      }

      const sceneNetworkId = this.owner.getRuntimeScene().networkId;
      if (!sceneNetworkId) {
        // No networkId for the scene yet, it will be set soon, let's not sync the object yet.
        return;
      }

      // Ensure we send a final update before the object is destroyed, if it had a networkId.
      const {
        messageName: updateMessageName,
        messageData: updateMessageData,
      } = gdjs.multiplayerMessageManager.createUpdateObjectMessage({
        objectOwner: this._playerNumber,
        objectName,
        instanceNetworkId,
        objectNetworkSyncData: this.owner.getObjectNetworkSyncData(),
        sceneNetworkId,
      });
      this.sendDataToPeersWithIncreasedClock(
        updateMessageName,
        updateMessageData
      );

      // Before sending the destroy message, we set up the object representing the peers
      // that we need an acknowledgment from.
      // If we are player 1, we are connected to everyone, so we expect an acknowledgment from everyone.
      // If we are another player, we are only connected to player 1, so we expect an acknowledgment from player 1.
      // In both cases, this represents the list of peers the current user is connected to.
      const otherPeerIds = gdjs.evtTools.p2p.getAllPeers();
      const {
        messageName: destroyMessageName,
        messageData: destroyMessageData,
      } = gdjs.multiplayerMessageManager.createDestroyObjectMessage({
        objectOwner: this._playerNumber,
        objectName,
        instanceNetworkId,
        sceneNetworkId,
      });
      const destroyedMessageName = gdjs.multiplayerMessageManager.createObjectDestroyedMessageNameFromDestroyMessage(
        destroyMessageName
      );
      gdjs.multiplayerMessageManager.addExpectedMessageAcknowledgement({
        originalMessageName: destroyMessageName,
        originalData: {
          ...destroyMessageData,
          // As the method `sendDataToPeersWithIncreasedClock` will increment the clock,
          // we increment it here to ensure we can resend the same message if we don't receive an acknowledgment.
          _clock: this._clock + 1,
        },
        expectedMessageName: destroyedMessageName,
        otherPeerIds,
      });

      this.sendDataToPeersWithIncreasedClock(
        destroyMessageName,
        destroyMessageData
      );
    }

    setPlayerObjectOwnership(newPlayerNumber: number) {
      logger.info(
        `Setting ownership of object ${this.owner.getName()} (networkId: ${
          this.owner.networkId
        } to player ${newPlayerNumber}.`
      );
      if (newPlayerNumber < 0) {
        logger.error(
          'Invalid player number (' +
            newPlayerNumber +
            ') when setting ownership of an object.'
        );
        return;
      }

      let instanceNetworkId = this.owner.networkId;

      if (!instanceNetworkId) {
        logger.info(
          'Object has no networkId, we change the ownership locally, but it will not be synchronized yet if we are not the owner.'
        );
        this._playerNumber = newPlayerNumber;
        if (newPlayerNumber !== gdjs.multiplayer.getPlayerNumber()) {
          // If we are not the new owner, we should not send a message to the host to change the ownership.
          // Just return and wait to receive an update message to reconcile this object.
          return;
        }
      }

      const sceneNetworkId = this.owner.getRuntimeScene().networkId;
      if (!sceneNetworkId) {
        // No networkId for the scene yet, it will be set soon, let's not sync the object yet.
        return;
      }

      const currentPlayerNumber = gdjs.multiplayer.getPlayerNumber();
      const objectName = this.owner.getName();

      if (instanceNetworkId) {
        // When changing the ownership of an object with a networkId, we send a message to the host to ensure it is aware of the change,
        // and can either accept it and broadcast it to other players, or reject it and do nothing with it.
        // We expect an acknowledgment from the host, if not, we will retry and eventually revert the ownership.
        const {
          messageName,
          messageData,
        } = gdjs.multiplayerMessageManager.createChangeOwnerMessage({
          objectOwner: this._playerNumber,
          objectName,
          instanceNetworkId,
          newObjectOwner: newPlayerNumber,
          instanceX: this.owner.getX(),
          instanceY: this.owner.getY(),
          sceneNetworkId,
        });
        // Before sending the changeOwner message, if we are becoming the new owner,
        // we want to ensure this message is acknowledged, by everyone we're connected to.
        // If we are player 1, we are connected to everyone, so we expect an acknowledgment from everyone.
        // If we are another player, we are only connected to player 1, so we expect an acknowledgment from player 1.
        // In both cases, this represents the list of peers the current user is connected to.
        if (newPlayerNumber === currentPlayerNumber) {
          const otherPeerIds = gdjs.evtTools.p2p.getAllPeers();
          const changeOwnerAcknowledgedMessageName = gdjs.multiplayerMessageManager.createObjectOwnerChangedMessageNameFromChangeOwnerMessage(
            messageName
          );
          gdjs.multiplayerMessageManager.addExpectedMessageAcknowledgement({
            originalMessageName: messageName,
            originalData: {
              ...messageData,
              _clock: this._clock + 1, // Will be incremented by the time the message is sent.
            },
            expectedMessageName: changeOwnerAcknowledgedMessageName,
            otherPeerIds,
            // If we are not the host, we should revert the ownership if the host does not acknowledge the change.
            shouldCancelMessageIfTimesOut: currentPlayerNumber !== 1,
          });
        }

        logger.info('Sending change owner message', messageName);
        this.sendDataToPeersWithIncreasedClock(messageName, messageData);
      }

      // We also update the ownership locally, so the object can be used immediately.
      // This is a prediction to allow snappy interactions.
      // If we are player 1 or host, we will have the ownership immediately anyway.
      // If we are another player, we will have the ownership as soon as the host acknowledges the change.
      // If the host does not send an acknowledgment, we will revert the ownership.
      this._playerNumber = newPlayerNumber;

      // If we are the new owner, also send directly an update of the position,
      // so that the object is immediately moved on the screen and we don't wait for the next tick.
      if (newPlayerNumber === currentPlayerNumber) {
        if (!instanceNetworkId) {
          // If we don't have a networkId, we need to create one now that we are the owner.
          // We are probably in a case where we created the object and then changed the ownership.
          instanceNetworkId = this.getOrCreateInstanceNetworkId();
        }

        const objectNetworkSyncData = this.owner.getObjectNetworkSyncData();
        const {
          messageName: updateMessageName,
          messageData: updateMessageData,
        } = gdjs.multiplayerMessageManager.createUpdateObjectMessage({
          objectOwner: this._playerNumber,
          objectName,
          instanceNetworkId,
          objectNetworkSyncData,
          sceneNetworkId,
        });
        this.sendDataToPeersWithIncreasedClock(
          updateMessageName,
          updateMessageData
        );
      }
    }

    getPlayerObjectOwnership(): number {
      return this._playerNumber;
    }

    isObjectOwnedByCurrentPlayer(): boolean {
      return this.isOwnerAsPlayerOrHost();
    }

    removeObjectOwnership() {
      // 0 means the host is the owner.
      this.setPlayerObjectOwnership(0);
    }

    takeObjectOwnership() {
      this.setPlayerObjectOwnership(gdjs.multiplayer.getPlayerNumber());
    }

    getActionOnPlayerDisconnect() {
      return this.actionOnPlayerDisconnect;
    }
  }
  gdjs.registerBehavior(
    'Multiplayer::MultiplayerObjectBehavior',
    gdjs.MultiplayerObjectRuntimeBehavior
  );
}
