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
    // If 0, then the object is not owned by any player, so the server is the owner.
    _playerNumber: number = 0;
    // The last time the object has been synchronized.
    // This is to avoid synchronizing the object too often, see _tickRate.
    _lastSyncTimestamp: number = 0;
    // The number of times per second the object should be synchronized.
    _tickRate: number = 60;
    // To avoid seeing too many logs.
    _lastLogTimestamp: number = 0;
    _logTickRate: number = 1;
    _getTimeNow: () => number;
    // Clock to be incremented every time we send a message, to ensure they are ordered
    // and old messages are ignored.
    _clock: number = 0;
    _destroyInstanceTimeoutId: NodeJS.Timeout | null = null;

    constructor(
      instanceContainer: gdjs.RuntimeInstanceContainer,
      behaviorData,
      owner: RuntimeObject
    ) {
      super(instanceContainer, behaviorData, owner);
      this._getTimeNow =
        window.performance && typeof window.performance.now === 'function'
          ? window.performance.now.bind(window.performance)
          : Date.now;
      // When a synchronized object is created, we assume it will be assigned a networkId quickly if:
      // - It is a new object created by the current player. -> will be assigned a networkId when sending the update message.
      // - It is an object created by another player. -> will be assigned a networkId when receiving the update message.
      // There is a small risk that the object is created by us after we receive an update message from the server,
      // ending up with 2 objects created, one with a networkId (from the server) and one without (from us).
      // To handle this case and avoid having an object not synchronized, we set a timeout to destroy the object
      // if it has not been assigned a networkId after a short delay.

      this._destroyInstanceTimeoutId = setTimeout(() => {
        if (!owner.networkId) {
          logger.info(
            `Object ${owner.getName()} has not been assigned a networkId after a short delay, destroying it.`
          );
          owner.deleteFromScene(instanceContainer);
        }
      }, 500);
    }

    sendDataToPeersWithIncreasedClock(messageName: string, data: Object) {
      this._clock++;
      data['_clock'] = this._clock;
      const connectedPeerIds = gdjs.evtTools.p2p.getAllPeers();
      for (const peerId of connectedPeerIds) {
        gdjs.multiplayerMessageManager.sendDataTo(peerId, messageName, data);
      }
    }

    isOwnerOrServer() {
      const currentPlayerNumber =
        gdjs.multiplayer.getCurrentPlayerPositionInLobby();

      const isOwnerOfObject =
        currentPlayerNumber === this._playerNumber || // Player as owner.
        (currentPlayerNumber === 1 && this._playerNumber === 0); // Server as owner.

      return isOwnerOfObject;
    }

    hasBeenSyncedRecently() {
      return (
        this._getTimeNow() - this._lastSyncTimestamp < 1000 / this._tickRate
      );
    }

    logToConsole(message: string) {
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

    doStepPostEvents() {
      if (!this.isOwnerOrServer()) {
        return;
      }

      // If the object has been synchronized recently, then return.
      if (this.hasBeenSyncedRecently()) {
        return;
      }

      this.logToConsole(
        `Synchronizing object ${this.owner.getName()} (instance ${
          this.owner.networkId
        }) with player ${this._playerNumber}.`
      );

      const instanceNetworkId = this.getOrCreateInstanceNetworkId();
      const objectName = this.owner.getName();
      const { messageName: updateMessageName, messageData: updateMessageData } =
        gdjs.multiplayerMessageManager.createUpdateObjectMessage({
          objectOwner: this._playerNumber,
          objectName,
          instanceNetworkId,
          objectNetworkSyncData: this.owner.getObjectNetworkSyncData(),
        });
      this.sendDataToPeersWithIncreasedClock(
        updateMessageName,
        updateMessageData
      );

      this._lastSyncTimestamp = this._getTimeNow();
    }

    onDestroy() {
      if (this._destroyInstanceTimeoutId) {
        clearTimeout(this._destroyInstanceTimeoutId);
        this._destroyInstanceTimeoutId = null;
      }

      if (!this.isOwnerOrServer()) {
        return;
      }

      const instanceNetworkId = this.getOrCreateInstanceNetworkId();
      const objectName = this.owner.getName();
      // Ensure we send a final update before the object is destroyed.
      logger.info(
        `Sending a final update for object ${objectName} (instance ${instanceNetworkId}) before it is destroyed.`
      );
      const { messageName: updateMessageName, messageData: updateMessageData } =
        gdjs.multiplayerMessageManager.createUpdateObjectMessage({
          objectOwner: this._playerNumber,
          objectName,
          instanceNetworkId,
          objectNetworkSyncData: this.owner.getObjectNetworkSyncData(),
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
      });
      const destroyedMessageName =
        gdjs.multiplayerMessageManager.createObjectDestroyedMessageNameFromDestroyMessage(
          destroyMessageName
        );
      gdjs.multiplayerMessageManager.addExpectedMessageAcknowledgement({
        originalMessageName: destroyMessageName,
        originalData: {
          ...destroyMessageData,
          _clock: this._clock + 1, // Will be incremented by the time the message is sent.
        },
        expectedMessageName: destroyedMessageName,
        otherPeerIds,
      });

      this.sendDataToPeersWithIncreasedClock(
        destroyMessageName,
        destroyMessageData
      );
    }

    setPlayerObjectOwnership(playerNumber: number) {
      logger.info(
        `Setting ownership of object ${this.owner.getName()} to player ${playerNumber}.`
      );
      if (playerNumber < 0) {
        console.error(
          'Invalid player number (' +
            playerNumber +
            ') when setting ownership of an object.'
        );
        return;
      }
      const currentPlayerNumber =
        gdjs.multiplayer.getCurrentPlayerPositionInLobby();

      // When changing the ownership, we send a message to the server to ensure it is aware of the change,
      // and can either accept it and broadcast it to other players, or reject it and do nothing with it.
      // We expect an acknowledgment from the server, if not, we will retry and eventually revert the ownership.
      const objectName = this.owner.getName();
      const instanceNetworkId = this.getOrCreateInstanceNetworkId();
      const { messageName, messageData } =
        gdjs.multiplayerMessageManager.createChangeOwnerMessage({
          objectOwner: this._playerNumber,
          objectName,
          instanceNetworkId,
          newObjectOwner: playerNumber,
          instanceX: this.owner.getX(),
          instanceY: this.owner.getY(),
        });
      // Before sending the changeOwner message, we set up the object representing the peers
      // that we need an acknowledgment from.
      // If we are player 1, we are connected to everyone, so we expect an acknowledgment from everyone.
      // If we are another player, we are only connected to player 1, so we expect an acknowledgment from player 1.
      // In both cases, this represents the list of peers the current user is connected to.
      const otherPeerIds = gdjs.evtTools.p2p.getAllPeers();
      const changeOwnerAcknowledgedMessageName =
        gdjs.multiplayerMessageManager.createObjectOwnerChangedMessageNameFromChangeOwnerMessage(
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
        // If we are not the server, we should revert the ownership if the server does not acknowledge the change.
        shouldCancelMessageIfTimesOut: currentPlayerNumber !== 1,
      });

      this.sendDataToPeersWithIncreasedClock(messageName, messageData);
      // We also update the ownership locally, so the object can be used immediately.
      // This is a prediction to allow snappy interactions.
      // If we are player 1 or server, we will have the ownership immediately anyway.
      // If we are another player, we will have the ownership as soon as the server acknowledges the change.
      // If the server does not send an acknowledgment, we will revert the ownership.
      this._playerNumber = playerNumber;
    }

    getPlayerObjectOwnership(): number {
      return this._playerNumber;
    }

    removeObjectOwnership() {
      // 0 means the server is the owner.
      this.setPlayerObjectOwnership(0);
    }
  }
  gdjs.registerBehavior(
    'Multiplayer::MultiplayerObjectBehavior',
    gdjs.MultiplayerObjectRuntimeBehavior
  );
}
