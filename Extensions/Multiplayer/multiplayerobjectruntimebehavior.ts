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
    _getTimeNow: () => number;
    // Clock to be incremented every time we send an event, to ensure they are ordered
    // and old events are ignored.
    _clock: number = 0;

    constructor(
      instanceContainer: gdjs.RuntimeInstanceContainer,
      behaviorData,
      owner
    ) {
      super(instanceContainer, behaviorData, owner);
      this._getTimeNow =
        window.performance && typeof window.performance.now === 'function'
          ? window.performance.now.bind(window.performance)
          : Date.now;
    }

    sendDataToPeersWithIncreasedClock(eventName: string, data: Object) {
      this._clock++;
      data['_clock'] = this._clock;
      gdjs.multiplayer.sendDataToAll(eventName, data);
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

      const instanceNetworkId = this.getOrCreateInstanceNetworkId();
      const objectName = this.owner.getName();
      const eventName = `#update#owner_${this._playerNumber}#object_${objectName}#instance_${instanceNetworkId}`;

      const networkSyncData = this.owner.getObjectNetworkSyncData();
      this.sendDataToPeersWithIncreasedClock(eventName, networkSyncData);

      this._lastSyncTimestamp = this._getTimeNow();
    }

    onDestroy() {
      if (!this.isOwnerOrServer()) {
        return;
      }

      const instanceNetworkId = this.getOrCreateInstanceNetworkId();
      const objectName = this.owner.getName();

      const updateEventName = `#update#owner_${this._playerNumber}#object_${objectName}#instance_${instanceNetworkId}`;
      // Ensure we send a final update before the object is destroyed.
      const networkSyncData = this.owner.getObjectNetworkSyncData();
      logger.info(
        `Sending a final update for object ${objectName} (instance ${instanceNetworkId}) before it is destroyed.`
      );
      this.sendDataToPeersWithIncreasedClock(updateEventName, networkSyncData);

      // Before sending the destroy event, we set up the object representing the peers
      // that we need an acknowledgment from.
      // If we are player 1, we are connected to everyone, so we expect an acknowledgment from everyone.
      // If we are another player, we are only connected to player 1, so we expect an acknowledgment from player 1.
      // In both cases, this represents the list of peers the current user is connected to.
      const otherPeerIds = gdjs.evtTools.p2p.getAllPeers();
      const destroyEventName = `#destroy#owner_${this._playerNumber}#object_${objectName}#instance_${instanceNetworkId}`;
      const destroyedEventName = destroyEventName.replace(
        '#destroy',
        '#destroyed'
      );
      gdjs.multiplayer.addExpectedEventAcknowledgement({
        originalEventName: destroyEventName,
        originalData: { _clock: this._clock + 1 }, // Will be incremented by the time the event is sent.
        expectedEventName: destroyedEventName,
        otherPeerIds,
      });

      this.sendDataToPeersWithIncreasedClock(destroyEventName, {});
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
      const eventName = `#changeOwner#owner_${this._playerNumber}#object_${objectName}#instance_${instanceNetworkId}`;
      const data = {
        previousOwner: this._playerNumber,
        newOwner: playerNumber,
        instanceX: this.owner.getX(),
        instanceY: this.owner.getY(),
      };
      // Before sending the changeOwner message, we set up the object representing the peers
      // that we need an acknowledgment from.
      // If we are player 1, we are connected to everyone, so we expect an acknowledgment from everyone.
      // If we are another player, we are only connected to player 1, so we expect an acknowledgment from player 1.
      // In both cases, this represents the list of peers the current user is connected to.
      const otherPeerIds = gdjs.evtTools.p2p.getAllPeers();
      const changeOwnerAcknowledgedEventName = eventName.replace(
        '#changeOwner',
        '#ownerChanged'
      );
      gdjs.multiplayer.addExpectedEventAcknowledgement({
        originalEventName: eventName,
        originalData: {
          ...data,
          _clock: this._clock + 1, // Will be incremented by the time the message is sent.
        },
        expectedEventName: changeOwnerAcknowledgedEventName,
        otherPeerIds,
        // If we are not the server, we should revert the ownership if the server does not acknowledge the change.
        shouldCancelEventIfTimesOut: currentPlayerNumber !== 1,
      });

      this.sendDataToPeersWithIncreasedClock(eventName, data);
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

    getNetworkSyncData() {
      return {
        playerNumber: this._playerNumber,
      };
    }

    updateFromBehaviorNetworkSyncData(networkSyncData) {
      if (networkSyncData.playerNumber !== undefined) {
        this._playerNumber = networkSyncData.playerNumber;
      }
    }
  }
  gdjs.registerBehavior(
    'Multiplayer::MultiplayerObjectBehavior',
    gdjs.MultiplayerObjectRuntimeBehavior
  );
}
