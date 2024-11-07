namespace gdjs {
  const logger = new gdjs.Logger('Multiplayer');
  const debugLogger = new gdjs.Logger('Multiplayer - Debug');
  // Comment this to see message logs and ease debugging:
  gdjs.Logger.getDefaultConsoleLoggerOutput().discardGroup(
    'Multiplayer - Debug'
  );

  class RecentlySeenKeys {
    maxSize: number;
    cache: Set<string>;
    keys: string[];

    constructor(maxSize: number) {
      this.maxSize = maxSize;
      this.cache = new Set();
      this.keys = [];
    }

    has(key: string) {
      return this.cache.has(key);
    }

    add(key: string) {
      // If we are at the maximum size, remove the first key.
      if (this.cache.size >= this.maxSize) {
        const keyToRemove = this.keys.shift();
        if (keyToRemove) {
          this.cache.delete(keyToRemove);
        }
      }

      // Add the key to the end of the list.
      this.cache.add(key);
      this.keys.push(key);
    }

    clear = () => {
      this.cache.clear();
      this.keys = [];
    };
  }

  class SavedSyncDataUpdates<T> {
    private _updates: T[] = [];

    store(update: T) {
      this._updates.push(update);
      if (this._updates.length > 10) {
        this._updates.shift();
      }
    }

    getUpdates() {
      return this._updates;
    }

    remove(update: T) {
      const index = this._updates.indexOf(update);
      if (index !== -1) {
        this._updates.splice(index, 1);
      }
    }

    clear() {
      this._updates = [];
    }
  }

  /**
   * Helper function to clone an object without reassigning the target object.
   * It's mainly helpful for tests, where multiple instances of the MultiplayerMessageManager are created,
   * and prevents keeping references to the same object.
   */
  const cloneObjectWithoutOverwriting = ({
    target,
    source,
  }: {
    target: Object;
    source: Object;
  }) => {
    // Add the new properties.
    for (const key in source) {
      if (source.hasOwnProperty(key) && !target.hasOwnProperty(key)) {
        target[key] = source[key];
      }
    }

    // Remove the properties that are not in the source.
    for (const key in target) {
      if (target.hasOwnProperty(key) && !source.hasOwnProperty(key)) {
        delete target[key];
      }
    }
  };

  export type MultiplayerMessageManager = ReturnType<
    typeof makeMultiplayerMessageManager
  >;

  /**
   * Create a new MultiplayerMessageManager.
   *
   * In most cases, you should use the default `gdjs.multiplayerMessageManager` instead.
   *
   * @returns
   */
  export const makeMultiplayerMessageManager = () => {
    // For testing purposes, you can simulate network latency and packet loss.
    // Adds x ms to all network messages, simulating a slow network.
    const SIMULATE_NETWORK_LATENCY_MS = 0; // In ms.
    // Gives a random chance of packet loss, simulating a bad network.
    const SIMULATE_NETWORK_PACKET_LOSS_CHANCE = 0; // Between 0 and 1, % of packets lost.
    // Adds a latency to random network messages, simulating sporadic network issues.
    const SIMULATE_NETWORK_RANDOM_SLOW_PACKET_CHANCE = 0; // Between 0 and 1, % of packets that will be slow.
    const SIMULATE_NETWORK_RANDOM_LATENCY_MS = 0; // In ms.

    const getTimeNow =
      window.performance && typeof window.performance.now === 'function'
        ? window.performance.now.bind(window.performance)
        : Date.now;
    const defaultMessageRetryTime = 200; // Time to wait before retrying a message that was not acknowledged, in ms.
    const defaultMaxRetries = 4; // Maximum number of retries before giving up on a message.

    // Make the processed messages an LRU cache, so that we can limit the number of messages we keep in memory,
    // as well as keep them in order.
    const processedCustomMessagesCache = new RecentlySeenKeys(500);

    let expectedMessageAcknowledgements: {
      [messageName: string]: {
        [peerId: string]: {
          acknowledged: boolean;
          lastMessageSentAt: number;
          originalMessageName: string;
          originalData: any;
          numberOfRetries: number;
          maxNumberOfRetries: number;
          messageRetryTime: number;
          shouldCancelMessageIfTimesOut?: boolean;
        };
      };
    } = {};
    let _lastClockReceivedByInstanceByScene: {
      [sceneId: string]: { [instanceId: string]: number };
    } = {};

    // The number of times per second the scene data should be synchronized.
    const sceneSyncDataSyncRate = 1;
    let lastSceneSyncTimestamp = 0;
    let lastSentSceneSyncData: LayoutNetworkSyncData | null = null;
    let numberOfForcedSceneUpdates = 0;
    let lastReceivedSceneSyncDataUpdates = new SavedSyncDataUpdates<
      LayoutNetworkSyncData
    >();

    // The number of times per second the game data should be synchronized.
    const gameSyncDataSyncRate = 1;
    let lastGameSyncTimestamp = 0;
    let lastSentGameSyncData: GameNetworkSyncData | null = null;
    let numberOfForcedGameUpdates = 0;
    let lastReceivedGameSyncDataUpdates = new SavedSyncDataUpdates<
      GameNetworkSyncData
    >();

    // Send heartbeat messages from host to players, ensuring their connection is still alive,
    // measure the ping, and send other useful info.
    const heartbeatSyncRate = 1;
    let lastHeartbeatSentTimestamp = 0;
    let _playersLastRoundTripTimes: {
      [playerNumber: number]: number[];
    } = {};
    let _peerIdToPlayerNumber: { [peerId: string]: number } = {};
    let _playersInfo: {
      [playerNumber: number]: {
        ping: number;
        playerId: string;
        username: string;
      };
    } = {};
    let _playerNumbersWhoJustLeft: number[] = [];
    let _playerNumbersWhoJustJoined: number[] = [];
    let _temporaryPlayerNumberToUsername: {
      [playerNumber: number]: string;
    } = {};

    const addExpectedMessageAcknowledgement = ({
      originalMessageName,
      originalData,
      expectedMessageName,
      otherPeerIds,
      shouldCancelMessageIfTimesOut,
      maxNumberOfRetries,
      messageRetryTime,
    }: {
      originalMessageName: string;
      originalData: any;
      expectedMessageName: string;
      otherPeerIds: string[];
      shouldCancelMessageIfTimesOut: boolean;
      maxNumberOfRetries?: number;
      messageRetryTime?: number;
    }) => {
      if (!gdjs.multiplayer.isLobbyGameRunning()) {
        // This can happen if objects are destroyed at the end of the scene.
        // We should not add expected messages in this case.
        return;
      }

      if (!expectedMessageAcknowledgements[expectedMessageName]) {
        expectedMessageAcknowledgements[expectedMessageName] = {};
      }

      debugLogger.info(
        `Adding expected message ${expectedMessageName} from ${otherPeerIds.join(
          ', '
        )}.`
      );

      otherPeerIds.forEach((peerId) => {
        expectedMessageAcknowledgements[expectedMessageName][peerId] = {
          acknowledged: false,
          lastMessageSentAt: getTimeNow(),
          originalMessageName,
          originalData,
          shouldCancelMessageIfTimesOut,
          numberOfRetries: 0,
          maxNumberOfRetries: maxNumberOfRetries || defaultMaxRetries,
          messageRetryTime: messageRetryTime || defaultMessageRetryTime,
        };
      });
    };

    const getLastClockReceivedForInstanceOnScene = ({
      sceneNetworkId,
      instanceNetworkId,
    }: {
      sceneNetworkId: string;
      instanceNetworkId: string;
    }) => {
      if (!_lastClockReceivedByInstanceByScene[sceneNetworkId]) {
        _lastClockReceivedByInstanceByScene[sceneNetworkId] = {};
      }

      return (
        _lastClockReceivedByInstanceByScene[sceneNetworkId][
          instanceNetworkId
        ] || 0
      );
    };

    const setLastClockReceivedForInstanceOnScene = ({
      sceneNetworkId,
      instanceNetworkId,
      clock,
    }: {
      sceneNetworkId: string;
      instanceNetworkId: string;
      clock: number;
    }) => {
      if (!_lastClockReceivedByInstanceByScene[sceneNetworkId]) {
        _lastClockReceivedByInstanceByScene[sceneNetworkId] = {};
      }

      _lastClockReceivedByInstanceByScene[sceneNetworkId][
        instanceNetworkId
      ] = clock;
    };

    /**
     * Main function to send messages to other players, via P2P.
     * Takes into account the simulation of network latency and packet loss.
     */
    const sendDataTo = (
      peerIds: string[],
      messageName: string,
      data: object
    ): void => {
      if (
        SIMULATE_NETWORK_PACKET_LOSS_CHANCE > 0 &&
        Math.random() < SIMULATE_NETWORK_PACKET_LOSS_CHANCE
      ) {
        return;
      }

      if (
        SIMULATE_NETWORK_RANDOM_SLOW_PACKET_CHANCE > 0 &&
        Math.random() < SIMULATE_NETWORK_RANDOM_SLOW_PACKET_CHANCE
      ) {
        setTimeout(() => {
          gdjs.multiplayerPeerJsHelper.sendDataTo(peerIds, messageName, data);
        }, SIMULATE_NETWORK_RANDOM_LATENCY_MS);
        return;
      }

      if (SIMULATE_NETWORK_LATENCY_MS > 0) {
        setTimeout(() => {
          gdjs.multiplayerPeerJsHelper.sendDataTo(peerIds, messageName, data);
        }, SIMULATE_NETWORK_LATENCY_MS);
        return;
      }

      gdjs.multiplayerPeerJsHelper.sendDataTo(peerIds, messageName, data);
    };

    const findClosestInstanceWithoutNetworkId = (
      instances: gdjs.RuntimeObject[],
      x: number,
      y: number
    ): gdjs.RuntimeObject | null => {
      if (!instances.length) {
        // No instances, return null.
        return null;
      }

      // Avoid using a reduce function to avoid creating a new object at each iteration.
      let closestInstance: gdjs.RuntimeObject | null = null;
      let closestDistance = Infinity;
      for (let i = 0; i < instances.length; ++i) {
        if (instances[i].networkId) {
          // Skip instances that already have a network ID.
          continue;
        }

        const instance = instances[i];
        const distance =
          Math.pow(instance.getX() - x, 2) + Math.pow(instance.getY() - y, 2);
        if (distance < closestDistance) {
          closestInstance = instance;
          closestDistance = distance;
        }
      }

      return closestInstance;
    };

    const getInstanceFromNetworkId = ({
      runtimeScene,
      objectName,
      instanceNetworkId,
      instanceX,
      instanceY,
      shouldCreateIfNotFound,
    }: {
      runtimeScene: gdjs.RuntimeScene;
      objectName: string;
      instanceNetworkId: string;
      instanceX?: number;
      instanceY?: number;
      shouldCreateIfNotFound?: boolean;
    }): gdjs.RuntimeObject | null => {
      const instances = runtimeScene.getInstancesOf(objectName);
      if (!instances) {
        // object does not exist in the scene, cannot find the instance.
        return null;
      }
      let instance =
        instances.find(
          (instance) => instance.networkId === instanceNetworkId
        ) || null;

      // If we know the position of the object, we can try to find the closest instance not synchronized yet.
      if (!instance && instanceX !== undefined && instanceY !== undefined) {
        debugLogger.info(
          `instance ${objectName} ${instanceNetworkId} not found with network ID, trying to find it with position ${instanceX}/${instanceY}.`
        );
        // Instance not found, it must be a new object.
        // 2 cases :
        // - The object was only created on the other player's game, so we create it and assign it the network ID.
        // - The object may have been created on all sides at the same time, so we try to find instances
        //   of this object, that do not have a network ID yet, pick the one that is the closest to the
        //   position of the object created by the other player, and assign it the network ID to start
        //   synchronizing it.

        // Try to assign the network ID to the instance that is the closest to the position of the object created by the other player.
        const closestInstance = findClosestInstanceWithoutNetworkId(
          instances,
          instanceX,
          instanceY
        );

        if (closestInstance) {
          debugLogger.info(
            `Found closest instance for object ${objectName} ${instanceNetworkId} with no network ID.`
          );

          instance = closestInstance;
          instance.networkId = instanceNetworkId;
        }
      }

      // If we still did not find the instance, and we should create it if not found, then create it.
      if (!instance && shouldCreateIfNotFound) {
        debugLogger.info(
          `Instance ${instanceNetworkId} still not found, Creating instance ${objectName}.`
        );
        const newInstance = runtimeScene.createObject(objectName);
        if (!newInstance) {
          // Object does not exist in the scene, cannot create the instance.
          return null;
        }

        newInstance.networkId = instanceNetworkId;
        instance = newInstance;
      }

      return instance;
    };

    const changeInstanceOwnerMessageNamePrefix = '#changeInstanceOwner';
    const changeInstanceOwnerMessageNameRegex = /#changeInstanceOwner#owner_(\d+)#object_(.+)#instance_(.+)/;
    const createChangeInstanceOwnerMessage = ({
      objectOwner,
      objectName,
      instanceNetworkId,
      newObjectOwner,
      instanceX,
      instanceY,
      sceneNetworkId,
    }: {
      objectOwner: number;
      objectName: string;
      instanceNetworkId: string;
      newObjectOwner: number;
      instanceX: number;
      instanceY: number;
      sceneNetworkId: string;
    }): {
      messageName: string;
      messageData: {
        previousOwner: number;
        newOwner: number;
        instanceX: number;
        instanceY: number;
        sceneNetworkId: string;
      };
    } => {
      return {
        messageName: `${changeInstanceOwnerMessageNamePrefix}#owner_${objectOwner}#object_${objectName}#instance_${instanceNetworkId}`,
        messageData: {
          previousOwner: objectOwner,
          newOwner: newObjectOwner,
          instanceX,
          instanceY,
          sceneNetworkId,
        },
      };
    };
    const instanceOwnerChangedMessageNamePrefix = '#instanceOwnerChanged';
    const instanceOwnerChangedMessageNameRegex = /#instanceOwnerChanged#owner_(\d+)#object_(.+)#instance_(.+)/;
    const createInstanceOwnerChangedMessageNameFromChangeInstanceOwnerMessage = (
      messageName: string
    ): string => {
      return messageName.replace(
        changeInstanceOwnerMessageNamePrefix,
        instanceOwnerChangedMessageNamePrefix
      );
    };
    const handleChangeInstanceOwnerMessagesReceived = (
      runtimeScene: gdjs.RuntimeScene
    ) => {
      if (!gdjs.multiplayer.isReadyToSendOrReceiveGameUpdateMessages()) {
        // Change owner messages do not need to be saved for later use, as the game will automatically change the owner of
        // the instance when receiving an update message with a different owner.
        return;
      }

      const p2pMessagesMap = gdjs.multiplayerPeerJsHelper.getAllMessagesMap();
      const messageNamesArray = Array.from(p2pMessagesMap.keys());

      // When we receive ownership change messages, update the ownership of the instances in the scene.
      const instanceOwnershipChangeMessageNames = messageNamesArray.filter(
        (messageName) =>
          messageName.startsWith(changeInstanceOwnerMessageNamePrefix)
      );
      instanceOwnershipChangeMessageNames.forEach((messageName) => {
        const messagesList = p2pMessagesMap.get(messageName);
        if (!messagesList) return; // Should not happen.
        const messages = messagesList.getMessages();
        if (!messages.length) return; // No messages to process for this name.
        messages.forEach((message) => {
          const messageData = message.getData();
          const messageSender = message.getSender();
          const matches = changeInstanceOwnerMessageNameRegex.exec(messageName);
          if (!matches) {
            return;
          }
          const objectName = matches[2];
          const instanceNetworkId = matches[3];
          const previousOwner = messageData.previousOwner;
          const newOwner = messageData.newOwner;
          const sceneNetworkId = messageData.sceneNetworkId;

          if (sceneNetworkId !== runtimeScene.networkId) {
            debugLogger.info(
              `Object ${objectName} is in scene ${sceneNetworkId}, but we are on ${runtimeScene.networkId}. Skipping.`
            );
            // The object is not in the current scene.
            return;
          }

          const instance = getInstanceFromNetworkId({
            runtimeScene,
            objectName,
            instanceNetworkId,
            instanceX: messageData.instanceX,
            instanceY: messageData.instanceY,
          });

          if (!instance) {
            // Instance not found, it must have been destroyed already.
            debugLogger.info(
              `Instance ${instanceNetworkId} not found, it must have been destroyed.`
            );
            return;
          }

          const behavior = instance.getBehavior(
            'MultiplayerObject'
          ) as MultiplayerObjectRuntimeBehavior | null;
          if (!behavior) {
            debugLogger.info(
              `Object ${objectName} does not have the MultiplayerObjectBehavior, cannot change ownership.`
            );
            return;
          }

          const currentPlayerObjectOwnership = behavior.getPlayerObjectOwnership();
          // Change is coherent if:
          const ownershipChangeIsCoherent =
            // the object is changing ownership from the same owner the host knew about,
            currentPlayerObjectOwnership === previousOwner ||
            // the object is already owned by the new owner. (may have been changed by another player faster)
            currentPlayerObjectOwnership === newOwner;
          if (
            gdjs.multiplayer.isCurrentPlayerHost() &&
            !ownershipChangeIsCoherent
          ) {
            // We received an ownership change message for an object which is in an unexpected state.
            // There may be some lag, and multiple ownership changes may have been sent by the other players.
            // As the host, let's not change the ownership and let the player revert it.
            debugLogger.info(
              `Object ${objectName} with instance network ID ${instanceNetworkId} does not have the expected owner. Wanted to change from ${previousOwner} to ${newOwner}, but object has owner ${currentPlayerObjectOwnership}.`
            );
            return;
          }

          // Force the ownership change.
          debugLogger.info(
            `Changing ownership of object ${objectName} to ${newOwner}.`
          );
          behavior.playerNumber = newOwner;

          const instanceOwnerChangedMessageName = createInstanceOwnerChangedMessageNameFromChangeInstanceOwnerMessage(
            messageName
          );

          debugLogger.info(
            `Sending acknowledgment of ownership change of object ${objectName} from ${previousOwner} to ${newOwner} with instance network ID ${instanceNetworkId} to ${messageSender}.`
          );
          // Once the instance ownership has changed, we need to acknowledge it to the player who sent this message.
          sendDataTo([messageSender], instanceOwnerChangedMessageName, {});

          // If we are the host,
          // so we need to relay the ownership change to others,
          // and expect an acknowledgment from them.
          if (gdjs.multiplayer.isCurrentPlayerHost()) {
            const connectedPeerIds = gdjs.multiplayerPeerJsHelper.getAllPeers();
            // We don't need to send the message to the player who sent the ownership change message.
            const otherPeerIds = connectedPeerIds.filter(
              (peerId) => peerId !== messageSender
            );
            if (!otherPeerIds.length) {
              // No one else to relay the message to.
              return;
            }

            addExpectedMessageAcknowledgement({
              originalMessageName: messageName,
              originalData: messageData,
              expectedMessageName: instanceOwnerChangedMessageName,
              otherPeerIds,
              // As we are the host, we do not cancel the message if it times out.
              shouldCancelMessageIfTimesOut: false,
            });
            debugLogger.info(
              `Relaying ownership change of object ${objectName} with instance network ID ${instanceNetworkId} to ${otherPeerIds.join(
                ', '
              )}.`
            );
            sendDataTo(otherPeerIds, messageName, messageData);
          }
        });
      });
    };

    const updateInstanceMessageNamePrefix = '#updateInstance';
    const updateInstanceMessageNameRegex = /#updateInstance#owner_(\d+)#object_(.+)#instance_(.+)#scene_(.+)/;
    const createUpdateInstanceMessage = ({
      objectOwner,
      objectName,
      instanceNetworkId,
      objectNetworkSyncData,
      sceneNetworkId,
    }: {
      objectOwner: number;
      objectName: string;
      instanceNetworkId: string;
      objectNetworkSyncData: ObjectNetworkSyncData;
      sceneNetworkId: string;
    }): {
      messageName: string;
      messageData: any;
    } => {
      return {
        messageName: `${updateInstanceMessageNamePrefix}#owner_${objectOwner}#object_${objectName}#instance_${instanceNetworkId}#scene_${sceneNetworkId}`,
        messageData: objectNetworkSyncData,
      };
    };
    const handleUpdateInstanceMessagesReceived = (
      runtimeScene: gdjs.RuntimeScene
    ) => {
      if (!gdjs.multiplayer.isReadyToSendOrReceiveGameUpdateMessages()) {
        // Update instance messages do not need to be saved for later use, as the updates are sent pretty often,
        // a new one will be received very quickly.
        return;
      }

      const p2pMessagesMap = gdjs.multiplayerPeerJsHelper.getAllMessagesMap();
      const messageNamesArray = Array.from(p2pMessagesMap.keys());

      // When we receive update messages, update the instances in the scene.
      const objectUpdateMessageNames = messageNamesArray.filter((messageName) =>
        messageName.startsWith(updateInstanceMessageNamePrefix)
      );
      objectUpdateMessageNames.forEach((messageName) => {
        const messagesList = p2pMessagesMap.get(messageName);
        if (!messagesList) return; // Should not happen.
        const messages = messagesList.getMessages();
        if (!messages.length) return; // No messages to process for this name.

        // For object updates, we start from the newest message, as we want to apply the latest update,
        // and the old messages may have an outdated clock.
        // So we reverse the messages array.
        const reversedMessages = messages.slice().reverse();

        reversedMessages.forEach((message) => {
          const messageData = message.getData();
          const messageSender = message.getSender();
          const matches = updateInstanceMessageNameRegex.exec(messageName);
          if (!matches) {
            return;
          }
          const ownerPlayerNumber = parseInt(matches[1], 10);
          if (ownerPlayerNumber === gdjs.multiplayer.playerNumber) {
            // Do not update the instance if we receive an message from ourselves.
            // Should not happen but let's be safe.
            return;
          }
          const objectName = matches[2];
          const instanceNetworkId = matches[3];
          const sceneNetworkId = matches[4];

          if (sceneNetworkId !== runtimeScene.networkId) {
            debugLogger.info(
              `Object ${objectName} is in scene ${sceneNetworkId}, but we are on ${runtimeScene.networkId}. Skipping.`
            );
            // The object is not in the current scene.
            return;
          }

          const messageInstanceClock = messageData['_clock'];
          const lastClock = getLastClockReceivedForInstanceOnScene({
            sceneNetworkId,
            instanceNetworkId,
          });

          if (messageInstanceClock <= lastClock) {
            // Ignore old messages, they may be arriving out of order because of lag.
            return;
          }

          const instance = getInstanceFromNetworkId({
            runtimeScene,
            objectName,
            instanceNetworkId,
            // This can happen if the object was created on the other player's game, and we need to create it.
            shouldCreateIfNotFound: true,
            instanceX: messageData.x,
            instanceY: messageData.y,
          });
          if (!instance) {
            // This should not happen as we should have created the instance if it did not exist.
            logger.error('Instance could not be found or created.');
            return;
          }

          const behavior = instance.getBehavior(
            'MultiplayerObject'
          ) as MultiplayerObjectRuntimeBehavior | null;
          if (!behavior) {
            logger.error(
              `Object ${objectName} does not have the MultiplayerObjectBehavior, cannot update it.`
            );
            // Object does not have the MultiplayerObjectBehavior, cannot update it.
            return;
          }

          // If we receive an update for this object for a different owner than the one we know about,
          // then 2 cases:
          // - If we are the owner of the object, then ignore the message, we assume it's a late update message or a wrong one,
          //   we are confident that we own this object. (it may be reverted if we don't receive an acknowledgment in time)
          // - If we are not the owner of the object, then assume that we missed the ownership change message, so update the object's
          //   ownership and then update the object.
          if (
            behavior.getPlayerObjectOwnership() ===
            gdjs.multiplayer.playerNumber
          ) {
            debugLogger.info(
              `Object ${objectName} with instance network ID ${instanceNetworkId} is owned by us ${gdjs.multiplayer.playerNumber}, ignoring update message from ${ownerPlayerNumber}.`
            );
            return;
          }

          if (behavior.getPlayerObjectOwnership() !== ownerPlayerNumber) {
            debugLogger.info(
              `Object ${objectName} with instance network ID ${instanceNetworkId} is owned by ${behavior.getPlayerObjectOwnership()} on our game, changing ownership to ${ownerPlayerNumber} as part of the update event.`
            );
            behavior.playerNumber = ownerPlayerNumber;
          }

          instance.updateFromNetworkSyncData(messageData);

          setLastClockReceivedForInstanceOnScene({
            sceneNetworkId,
            instanceNetworkId,
            clock: messageInstanceClock,
          });
          // Also update the clock on the behavior of this instance, so that if we take ownership of this object,
          // we can send the correct clock to the other players.
          behavior._clock = messageInstanceClock;

          // If we are are the host,
          // we need to relay the position to others except the player who sent the update message.
          if (gdjs.multiplayer.isCurrentPlayerHost()) {
            const connectedPeerIds = gdjs.multiplayerPeerJsHelper.getAllPeers();
            const otherPeerIds = connectedPeerIds.filter(
              (peerId) => peerId !== messageSender
            );
            if (!otherPeerIds.length) {
              // No one else to relay the message to.
              return;
            }
            sendDataTo(otherPeerIds, messageName, messageData);
          }
        });
      });
    };

    const changeVariableOwnerMessageNamePrefix = '#changeVariableOwner';
    const changeVariableOwnerMessageNameRegex = /#changeVariableOwner#owner_(\d+)#variable_(.+)/;
    const createChangeVariableOwnerMessage = ({
      variableOwner,
      variableNetworkId,
      newVariableOwner,
    }: {
      variableOwner: number;
      variableNetworkId: string;
      newVariableOwner: number;
    }): {
      messageName: string;
      messageData: {
        previousOwner: number;
        newOwner: number;
      };
    } => {
      return {
        messageName: `${changeVariableOwnerMessageNamePrefix}#owner_${variableOwner}#variable_${variableNetworkId}`,
        messageData: {
          previousOwner: variableOwner,
          newOwner: newVariableOwner,
        },
      };
    };
    const variableOwnerChangedMessageNamePrefix = '#variableOwnerChanged';
    const variableOwnerChangedMessageNameRegex = /#variableOwnerChanged#owner_(\d+)#variable_(.+)/;
    const createVariableOwnerChangedMessageNameFromChangeVariableOwnerMessage = (
      messageName: string
    ): string => {
      return messageName.replace(
        changeVariableOwnerMessageNamePrefix,
        variableOwnerChangedMessageNamePrefix
      );
    };
    const handleChangeVariableOwnerMessagesReceived = (
      runtimeScene: gdjs.RuntimeScene
    ) => {
      if (!gdjs.multiplayer.isReadyToSendOrReceiveGameUpdateMessages()) {
        // Change owner messages do not need to be saved for later use, as the game will automatically change the owner of
        // the variable when receiving an update message with a different owner.
        return;
      }

      const p2pMessagesMap = gdjs.multiplayerPeerJsHelper.getAllMessagesMap();
      const messageNamesArray = Array.from(p2pMessagesMap.keys());

      // When we receive ownership change messages, find the variable and update its ownership.
      const variableOwnershipChangeMessageNames = messageNamesArray.filter(
        (messageName) =>
          messageName.startsWith(changeVariableOwnerMessageNamePrefix)
      );
      variableOwnershipChangeMessageNames.forEach((messageName) => {
        const messagesList = p2pMessagesMap.get(messageName);
        if (!messagesList) return; // Should not happen.
        const messages = messagesList.getMessages();
        if (!messages.length) return; // No messages to process for this name.
        messages.forEach((message) => {
          const messageData = message.getData();
          const messageSender = message.getSender();
          const matches = changeVariableOwnerMessageNameRegex.exec(messageName);
          if (!matches) {
            return;
          }
          const variableNetworkId = matches[2];
          const previousOwner = messageData.previousOwner;
          const newOwner = messageData.newOwner;

          const {
            type: variableType,
            name: variableName,
            containerId,
          } = gdjs.multiplayerVariablesManager.getVariableTypeAndNameFromNetworkId(
            variableNetworkId
          );

          // If this is a scene variable and we are not on the right scene, ignore it.
          if (
            variableType === 'scene' &&
            containerId !== runtimeScene.networkId
          ) {
            debugLogger.info(
              `Variable ${variableName} is in scene ${containerId}, but we are on ${runtimeScene.networkId}. Skipping.`
            );
            // The variable is not in the current scene.
            return;
          }

          const variablesContainer =
            containerId === 'game'
              ? runtimeScene.getGame().getVariables()
              : runtimeScene.getVariables();

          if (!variablesContainer.has(variableName)) {
            // Variable not found, this should not happen.
            logger.error(
              `Variable with ID ${variableNetworkId} not found whilst syncing. This should not happen.`
            );
            return;
          }

          const variable = variablesContainer.get(variableName);

          const currentPlayerVariableOwnership = variable.getPlayerOwnership();
          // Change is coherent if:
          const ownershipChangeIsCoherent =
            // the variable is changing ownership from the same owner the host knew about,
            currentPlayerVariableOwnership === previousOwner ||
            // the variable is already owned by the new owner. (may have been changed by another player faster)
            currentPlayerVariableOwnership === newOwner;
          if (
            gdjs.multiplayer.isCurrentPlayerHost() &&
            !ownershipChangeIsCoherent
          ) {
            // We received an ownership change message for a variable which is in an unexpected state.
            // There may be some lag, and multiple ownership changes may have been sent by the other players.
            // As the host, let's not change the ownership and let the player revert it.
            debugLogger.info(
              `Variable with ID ${variableNetworkId} does not have the expected owner. Wanted to change from ${previousOwner} to ${newOwner}, but variable has owner ${currentPlayerVariableOwnership}.`
            );
            return;
          }

          // Force the ownership change.
          debugLogger.info(
            `Changing ownership of variable ${variableName} to ${newOwner}.`
          );
          variable.setPlayerOwnership(newOwner);

          const variableOwnerChangedMessageName = createVariableOwnerChangedMessageNameFromChangeVariableOwnerMessage(
            messageName
          );

          debugLogger.info(
            `Sending acknowledgment of ownership change of variable with ID ${variableNetworkId} from ${previousOwner} to ${newOwner} to ${messageSender}.`
          );
          // Once the variable ownership has changed, we need to acknowledge it to the player who sent this message.
          sendDataTo([messageSender], variableOwnerChangedMessageName, {});

          // If we are the host,
          // we need to relay the ownership change to others,
          // and expect an acknowledgment from them.
          if (gdjs.multiplayer.isCurrentPlayerHost()) {
            const connectedPeerIds = gdjs.multiplayerPeerJsHelper.getAllPeers();
            // We don't need to send the message to the player who sent the ownership change message.
            const otherPeerIds = connectedPeerIds.filter(
              (peerId) => peerId !== messageSender
            );
            if (!otherPeerIds.length) {
              // No one else to relay the message to.
              return;
            }

            addExpectedMessageAcknowledgement({
              originalMessageName: messageName,
              originalData: messageData,
              expectedMessageName: variableOwnerChangedMessageName,
              otherPeerIds,
              // As we are the host, we do not cancel the message if it times out.
              shouldCancelMessageIfTimesOut: false,
            });
            debugLogger.info(
              `Relaying ownership change of variable with Id ${variableNetworkId} to ${otherPeerIds.join(
                ', '
              )}.`
            );
            sendDataTo(otherPeerIds, messageName, messageData);
          }
        });
      });
    };

    const getRegexFromAckMessageName = (messageName: string) => {
      if (messageName.startsWith(instanceDestroyedMessageNamePrefix)) {
        return instanceDestroyedMessageNameRegex;
      } else if (
        messageName.startsWith(instanceOwnerChangedMessageNamePrefix)
      ) {
        return instanceOwnerChangedMessageNameRegex;
      } else if (
        messageName.startsWith(variableOwnerChangedMessageNamePrefix)
      ) {
        return variableOwnerChangedMessageNameRegex;
      } else if (messageName.startsWith(customMessageAcknowledgePrefix)) {
        return customMessageAcknowledgeRegex;
      }
      return null;
    };

    const isMessageAcknowledgement = (messageName: string) => {
      return (
        messageName.startsWith(instanceDestroyedMessageNamePrefix) ||
        messageName.startsWith(instanceOwnerChangedMessageNamePrefix) ||
        messageName.startsWith(variableOwnerChangedMessageNamePrefix) ||
        messageName.startsWith(customMessageAcknowledgePrefix)
      );
    };

    const handleAcknowledgeMessagesReceived = () => {
      if (!gdjs.multiplayer.isReadyToSendOrReceiveGameUpdateMessages()) {
        // Acknowledgment messages are mainly a response for ownership change, destruction, and custom messages,
        // which are not sent when the game is not ready.
        return;
      }

      const p2pMessagesMap = gdjs.multiplayerPeerJsHelper.getAllMessagesMap();
      const messageNamesArray = Array.from(p2pMessagesMap.keys());
      // When we receive acknowledgement messages, save it in the extension, to avoid sending the message again.
      const acknowledgedMessageNames = messageNamesArray.filter(
        isMessageAcknowledgement
      );
      acknowledgedMessageNames.forEach((messageName) => {
        const messagesList = p2pMessagesMap.get(messageName);
        if (!messagesList) return; // Should not happen.
        const messages = messagesList.getMessages();
        if (!messages.length) return; // No messages to process for this name.
        messages.forEach((message) => {
          const messageData = message.getData();
          const messageSender = message.getSender();
          debugLogger.info(
            `Received acknowledgment for message ${messageName}.`
          );
          const regex = getRegexFromAckMessageName(messageName);
          if (!regex) {
            // This should not happen.
            logger.error(`Invalid acknowledgment message ${messageName}.`);
            return;
          }

          const matches = regex.exec(messageName);
          if (!matches) {
            // This should not happen.
            logger.error(`Invalid acknowledgment message ${messageName}.`);
            return;
          }
          if (!expectedMessageAcknowledgements[messageName]) {
            // This should not happen, but if we receive an acknowledgment for a message we did not expect, let's not error.
            return;
          }
          if (!expectedMessageAcknowledgements[messageName][messageSender]) {
            // This should not happen, but if we receive an acknowledgment from a sender we did not expect, let's not error.
            return;
          }

          // If a clock is provided in the message, ensure that we only process the message if the clock is newer than the last one received.
          const messageInstanceClock = messageData['_clock'];
          if (messageInstanceClock !== undefined) {
            const instanceNetworkId = matches[3];
            const sceneNetworkId = matches[4];
            const lastClock = getLastClockReceivedForInstanceOnScene({
              sceneNetworkId,
              instanceNetworkId,
            });
            if (messageInstanceClock <= lastClock) {
              // Ignore old messages.
              return;
            }

            setLastClockReceivedForInstanceOnScene({
              sceneNetworkId,
              instanceNetworkId,
              clock: messageInstanceClock,
            });
          }

          debugLogger.info(
            `Marking message ${messageName} as acknowledged from ${messageSender}.`
          );
          // Mark the acknowledgment as received.
          expectedMessageAcknowledgements[messageName][
            messageSender
          ].acknowledged = true;
        });
      });
    };

    const resendClearOrCancelAcknowledgedMessages = (
      runtimeScene: gdjs.RuntimeScene
    ) => {
      if (!gdjs.multiplayer.isReadyToSendOrReceiveGameUpdateMessages()) {
        // Acknowledgment messages are mainly a response for ownership change, destruction, and custom messages,
        // which are not sent when the game is not ready.
        return;
      }

      // When all acknowledgments are received for an message, we can clear the message from our
      // list of expected acknowledgments.
      const expectedMessageNames = Object.keys(expectedMessageAcknowledgements);
      expectedMessageNames.forEach((acknowledgemessageName) => {
        const acknowledgements =
          expectedMessageAcknowledgements[acknowledgemessageName];
        const peerWhoHaventAcknowledged = Object.keys(acknowledgements).filter(
          (peerId) => !acknowledgements[peerId].acknowledged
        );
        if (!peerWhoHaventAcknowledged.length) {
          // All peers have acknowledged this message, we can clear the object.
          debugLogger.info(
            `All peers have acknowledged message ${acknowledgemessageName}.`
          );
          delete expectedMessageAcknowledgements[acknowledgemessageName];
        } else {
          // Some peers have not acknowledged the message, let's resend it to them.
          for (const peerId of peerWhoHaventAcknowledged) {
            const {
              lastMessageSentAt,
              originalMessageName,
              originalData,
              numberOfRetries: currentNumberOfRetries,
              maxNumberOfRetries,
              messageRetryTime,
            } = acknowledgements[peerId];
            if (getTimeNow() - lastMessageSentAt > messageRetryTime) {
              if (currentNumberOfRetries >= maxNumberOfRetries) {
                // We have retried too many times, let's give up.
                debugLogger.info(
                  `Giving up on message ${acknowledgemessageName} for ${peerId}.`
                );
                if (acknowledgements[peerId].shouldCancelMessageIfTimesOut) {
                  // If we should cancel the message if it times out, then revert it based on the original message.
                  // INSTANCE OWNER CHANGE:
                  if (
                    originalMessageName.startsWith(
                      changeInstanceOwnerMessageNamePrefix
                    )
                  ) {
                    const matches = changeInstanceOwnerMessageNameRegex.exec(
                      originalMessageName
                    );
                    if (!matches) {
                      // This should not happen, if it does, remove the acknowledgment and return.
                      delete expectedMessageAcknowledgements[
                        acknowledgemessageName
                      ];
                      return;
                    }
                    const objectName = matches[2];
                    const instanceNetworkId = matches[3];
                    const instances = runtimeScene.getInstancesOf(objectName);
                    if (!instances) {
                      // object does not exist in the scene, cannot revert ownership.
                      delete expectedMessageAcknowledgements[
                        acknowledgemessageName
                      ];
                      return;
                    }
                    let instance = instances.find(
                      (instance) => instance.networkId === instanceNetworkId
                    );
                    if (!instance) {
                      // Instance not found, it must have been destroyed already, cannot revert ownership.
                      // Should we recreate it?
                      delete expectedMessageAcknowledgements[
                        acknowledgemessageName
                      ];
                      return;
                    }

                    const behavior = instance.getBehavior(
                      'MultiplayerObject'
                    ) as MultiplayerObjectRuntimeBehavior | null;
                    if (!behavior) {
                      logger.error(
                        `Object ${objectName} does not have the MultiplayerObjectBehavior, cannot revert ownership.`
                      );
                      // Object does not have the MultiplayerObjectBehavior, cannot revert ownership.
                      delete expectedMessageAcknowledgements[
                        acknowledgemessageName
                      ];
                      return;
                    }

                    const previousOwner = originalData.previousOwner;
                    if (previousOwner === undefined) {
                      // No previous owner, cannot revert ownership.
                      delete expectedMessageAcknowledgements[
                        acknowledgemessageName
                      ];
                      return;
                    }

                    // Force the ownership change.
                    behavior.playerNumber = previousOwner || 0;
                  }

                  // VARIABLE OWNER CHANGE:
                  if (
                    originalMessageName.startsWith(
                      changeVariableOwnerMessageNamePrefix
                    )
                  ) {
                    const matches = changeVariableOwnerMessageNameRegex.exec(
                      originalMessageName
                    );
                    if (!matches) {
                      // This should not happen, if it does, remove the acknowledgment and return.
                      delete expectedMessageAcknowledgements[
                        acknowledgemessageName
                      ];
                      return;
                    }
                    const variableNetworkId = matches[2];
                    const previousOwner = originalData.previousOwner;

                    const {
                      type: variableType,
                      name: variableName,
                      containerId,
                    } = gdjs.multiplayerVariablesManager.getVariableTypeAndNameFromNetworkId(
                      variableNetworkId
                    );

                    // If this is a scene variable and we are not on the right scene, ignore it.
                    if (
                      variableType === 'scene' &&
                      containerId !== runtimeScene.networkId
                    ) {
                      debugLogger.info(
                        `Variable ${variableName} is in scene ${containerId}, but we are on ${runtimeScene.networkId}. Skipping ownership revert.`
                      );
                      delete expectedMessageAcknowledgements[
                        acknowledgemessageName
                      ];
                      return;
                    }

                    const variablesContainer =
                      containerId === 'game'
                        ? runtimeScene.getGame().getVariables()
                        : runtimeScene.getVariables();

                    if (!variablesContainer.has(variableName)) {
                      // Variable not found, this should not happen.
                      logger.error(
                        `Variable with ID ${variableNetworkId} not found while reverting ownership. This should not happen.`
                      );
                      delete expectedMessageAcknowledgements[
                        acknowledgemessageName
                      ];
                      return;
                    }

                    const variable = variablesContainer.get(variableName);

                    if (previousOwner === undefined) {
                      // No previous owner, cannot revert ownership.
                      delete expectedMessageAcknowledgements[
                        acknowledgemessageName
                      ];
                      return;
                    }

                    // Force the ownership change.
                    variable.setPlayerOwnership(previousOwner || 0);
                  }
                }
                delete expectedMessageAcknowledgements[acknowledgemessageName];
                continue;
              }

              // We have waited long enough for the acknowledgment, let's resend the message.
              sendDataTo([peerId], originalMessageName, originalData);
              // Reset the timestamp so that we wait again for the acknowledgment.
              acknowledgements[peerId].lastMessageSentAt = getTimeNow();
              // Increment the number of retries.
              acknowledgements[peerId].numberOfRetries =
                currentNumberOfRetries + 1;
            }
          }
        }
      });
    };

    const destroyInstanceMessageNamePrefix = '#destroyInstance';
    const destroyInstanceMessageNameRegex = /#destroyInstance#owner_(\d+)#object_(.+)#instance_(.+)#scene_(.+)/;
    const createDestroyInstanceMessage = ({
      objectOwner,
      objectName,
      instanceNetworkId,
      sceneNetworkId,
    }: {
      objectOwner: number;
      objectName: string;
      instanceNetworkId: string;
      sceneNetworkId: string;
    }): {
      messageName: string;
      messageData: any;
    } => {
      return {
        messageName: `${destroyInstanceMessageNamePrefix}#owner_${objectOwner}#object_${objectName}#instance_${instanceNetworkId}#scene_${sceneNetworkId}`,
        messageData: {},
      };
    };
    const instanceDestroyedMessageNamePrefix = '#instanceDestroyed';
    const instanceDestroyedMessageNameRegex = /#instanceDestroyed#owner_(\d+)#object_(.+)#instance_(.+)/;
    const createInstanceDestroyedMessageNameFromDestroyInstanceMessage = (
      messageName: string
    ): string => {
      return messageName.replace(
        destroyInstanceMessageNamePrefix,
        instanceDestroyedMessageNamePrefix
      );
    };
    const handleDestroyInstanceMessagesReceived = (
      runtimeScene: gdjs.RuntimeScene
    ) => {
      if (!gdjs.multiplayer.isReadyToSendOrReceiveGameUpdateMessages()) {
        // Destroy messages do not need to be saved for later use, as the game will automatically destroy
        // the instance if it does not receive an update message from it. So we return early.
        return;
      }

      const p2pMessagesMap = gdjs.multiplayerPeerJsHelper.getAllMessagesMap();
      const messageNamesArray = Array.from(p2pMessagesMap.keys());
      const destroyInstanceMessageNames = messageNamesArray.filter(
        (messageName) =>
          messageName.startsWith(destroyInstanceMessageNamePrefix)
      );
      destroyInstanceMessageNames.forEach((messageName) => {
        const messagesList = p2pMessagesMap.get(messageName);
        if (!messagesList) return; // Should not happen.
        const messages = messagesList.getMessages();
        if (!messages.length) return; // No messages to process for this name.
        messages.forEach((message) => {
          const messageData = message.getData();
          const messageSender = message.getSender();
          debugLogger.info(
            `Received message ${messageName} with data ${JSON.stringify(
              messageData
            )}.`
          );
          const matches = destroyInstanceMessageNameRegex.exec(messageName);
          if (!matches) {
            return;
          }
          const playerNumber = parseInt(matches[1], 10);
          if (playerNumber === gdjs.multiplayer.playerNumber) {
            // Do not destroy the object if we receive an message from ourselves.
            // Should probably never happen.
            return;
          }
          const objectName = matches[2];
          const instanceNetworkId = matches[3];
          const sceneNetworkId = matches[4];

          if (sceneNetworkId !== runtimeScene.networkId) {
            // The object is not in the current scene.
            debugLogger.info(
              `Object ${objectName} is in scene ${sceneNetworkId}, but we are on ${runtimeScene.networkId}. Skipping.`
            );
            return;
          }

          const instance = getInstanceFromNetworkId({
            runtimeScene,
            objectName,
            instanceNetworkId,
          });

          const instanceDestroyedMessageName = createInstanceDestroyedMessageNameFromDestroyInstanceMessage(
            messageName
          );

          if (!instance) {
            debugLogger.info(
              'Instance was not found in the scene, sending acknowledgment anyway.'
            );
            // Instance not found, it must have been destroyed already.
            // Send an acknowledgment to the player who sent the destroy message in case they missed it.
            sendDataTo([messageSender], instanceDestroyedMessageName, {});
            return;
          }

          debugLogger.info(
            `Destroying object ${objectName} with instance network ID ${instanceNetworkId}.`
          );
          instance.deleteFromScene(runtimeScene);

          debugLogger.info(
            `Sending acknowledgment of destruction of object ${objectName} with instance network ID ${instanceNetworkId} to ${messageSender}.`
          );
          // Once the object is destroyed, we need to acknowledge it to the player who sent the destroy message.
          sendDataTo([messageSender], instanceDestroyedMessageName, {});

          // If we are the host, we need to relay the destruction to others.
          // And expect an acknowledgment from everyone else as well.
          if (gdjs.multiplayer.isCurrentPlayerHost()) {
            const connectedPeerIds = gdjs.multiplayerPeerJsHelper.getAllPeers();
            // We don't need to send the message to the player who sent the destroy message.
            const otherPeerIds = connectedPeerIds.filter(
              (peerId) => peerId !== messageSender
            );
            if (!otherPeerIds.length) {
              // No one else to relay the message to.
              return;
            }

            addExpectedMessageAcknowledgement({
              originalMessageName: messageName,
              originalData: messageData,
              expectedMessageName: instanceDestroyedMessageName,
              otherPeerIds,
              // As we are the host, we do not cancel the message if it times out.
              shouldCancelMessageIfTimesOut: false,
            });
            debugLogger.info(
              `Relaying instance destroyed message for object ${objectName} with instance network ID ${instanceNetworkId} to ${otherPeerIds.join(
                ', '
              )}.`
            );
            sendDataTo(otherPeerIds, messageName, messageData);
          }
        });
      });
    };

    const customMessageNamePrefix = '#customMessage';
    const customMessageRegex = /#customMessage#(.+)/;
    const getCustomMessageNameFromUserMessageName = (
      userMessageName: string
    ) => {
      return `${customMessageNamePrefix}#${userMessageName}`;
    };
    const createCustomMessage = ({
      userMessageName,
      userMessageData,
      senderPlayerNumber,
    }: {
      userMessageName: string;
      userMessageData: any;
      senderPlayerNumber: number;
    }) => {
      const messageId = gdjs.makeUuid();
      return {
        messageName: getCustomMessageNameFromUserMessageName(userMessageName),
        messageData: {
          data: userMessageData,
          uniqueId: messageId,
          senderPlayerNumber, // We send the player number, so that other players who are not connected to us can know who sent the message.
        },
      };
    };
    const customMessageAcknowledgePrefix = '#ackCustomMessage';
    const customMessageAcknowledgeRegex = /#ackCustomMessage#(.+)/;
    const createAcknowledgeCustomMessageNameFromCustomMessage = (
      messageName: string
    ): string => {
      return messageName.replace(
        customMessageNamePrefix,
        customMessageAcknowledgePrefix
      );
    };

    const sendCustomMessage = (
      userMessageName: string,
      userMessageData: any // can be a simple string message or a serialized variable.
    ) => {
      const connectedPeerIds = gdjs.multiplayerPeerJsHelper.getAllPeers();
      const currentPlayerNumber = gdjs.multiplayer.getCurrentPlayerNumber();
      const { messageName, messageData } = createCustomMessage({
        userMessageName,
        userMessageData,
        senderPlayerNumber: currentPlayerNumber,
      });
      const acknowledgmentMessageName = createAcknowledgeCustomMessageNameFromCustomMessage(
        messageName
      );
      addExpectedMessageAcknowledgement({
        originalMessageName: messageName,
        originalData: messageData,
        expectedMessageName: acknowledgmentMessageName,
        otherPeerIds: connectedPeerIds, // Expect acknowledgment from all peers.
        // custom messages cannot be reverted.
        shouldCancelMessageIfTimesOut: false,
      });
      debugLogger.info(
        `Sending custom message ${userMessageName} with data ${JSON.stringify(
          userMessageData
        )}.`
      );
      sendDataTo(connectedPeerIds, messageName, messageData);

      // If we are the host, we can consider this messaged as received
      // and add it to the list of custom messages to process on top of the messages received.
      if (gdjs.multiplayer.isCurrentPlayerHost()) {
        const messagesList = gdjs.multiplayerPeerJsHelper.getOrCreateMessagesList(
          messageName
        );
        messagesList.pushMessage(
          messageData,
          gdjs.multiplayerPeerJsHelper.getCurrentId()
        );
        // The message is now automatically added to the list of messages to process,
        // and will be removed at the end of the frame.
      }
    };

    const sendVariableCustomMessage = (
      userMessageName: string,
      variable: gdjs.Variable
    ) => {
      const userMessageData = variable.toJSObject();
      debugLogger.info(
        `Sending custom message ${userMessageName} with data ${JSON.stringify(
          userMessageData
        )}.`
      );
      sendCustomMessage(userMessageName, userMessageData);
    };

    const hasCustomMessageBeenReceived = (userMessageName: string) => {
      const customMessageName = getCustomMessageNameFromUserMessageName(
        userMessageName
      );
      const p2pMessagesMap = gdjs.multiplayerPeerJsHelper.getAllMessagesMap();
      const messagesList = p2pMessagesMap.get(customMessageName);
      if (!messagesList) return; // No message received.
      const messages = messagesList.getMessages();
      if (!messages.length) return; // No messages to process.

      debugLogger.info(`custom message ${userMessageName} has been received.`);

      let customMessageHasNotAlreadyBeenProcessed = false;

      messages.forEach((message) => {
        const messageData = message.getData();
        const uniqueMessageId = messageData.uniqueId;
        const customMessageCacheKey = `${customMessageName}#${uniqueMessageId}`;
        if (processedCustomMessagesCache.has(customMessageCacheKey)) {
          // Message has already been processed recently. This can happen if the message is sent multiple times,
          // after not being acknowledged properly.
          return;
        }
        processedCustomMessagesCache.add(customMessageCacheKey);

        customMessageHasNotAlreadyBeenProcessed = true;
        return;
      });

      return customMessageHasNotAlreadyBeenProcessed;
    };

    const getCustomMessageData = (userMessageName: string) => {
      const customMessageName = getCustomMessageNameFromUserMessageName(
        userMessageName
      );
      const p2pMessagesMap = gdjs.multiplayerPeerJsHelper.getAllMessagesMap();
      const messagesList = p2pMessagesMap.get(customMessageName);
      if (!messagesList) return; // No message received.
      const messages = messagesList.getMessages();
      if (!messages.length) return; // No messages to process.
      // Assume that the last message is the most recent one.
      const message = messages[messages.length - 1];

      const messageData = message.getData();
      return messageData.data;
    };

    const getVariableCustomMessageData = (
      userMessageName: string,
      variable: gdjs.Variable
    ) => {
      const data = getCustomMessageData(userMessageName);
      if (!data) {
        return;
      }
      debugLogger.info(
        `Received custom message ${userMessageName} with data ${JSON.stringify(
          data
        )}.`
      );
      variable.fromJSObject(data);
    };

    const getCustomMessageSender = (userMessageName: string): number => {
      const customMessageName = getCustomMessageNameFromUserMessageName(
        userMessageName
      );
      const p2pMessagesMap = gdjs.multiplayerPeerJsHelper.getAllMessagesMap();
      const messagesList = p2pMessagesMap.get(customMessageName);
      if (!messagesList) return 0;
      const messages = messagesList.getMessages();
      if (!messages.length) return 0;
      // Assume that the last message is the most recent one.
      const message = messages[messages.length - 1];
      const messageData = message.getData();

      return messageData.senderPlayerNumber;
    };

    const handleCustomMessagesReceived = (): void => {
      if (!gdjs.multiplayer.isReadyToSendOrReceiveGameUpdateMessages()) {
        // Assume that the custom messages are not worth saving for later use.
        return;
      }

      const p2pMessagesMap = gdjs.multiplayerPeerJsHelper.getAllMessagesMap();
      const messageNamesArray = Array.from(p2pMessagesMap.keys());
      const customMessageNames = messageNamesArray.filter((messageName) =>
        messageName.startsWith(customMessageNamePrefix)
      );
      customMessageNames.forEach((messageName) => {
        const messagesList = p2pMessagesMap.get(messageName);
        if (!messagesList) {
          logger.error(`No messages list found for ${messageName}.`);
          return; // Should not happen.
        }
        const messages = messagesList.getMessages();
        if (!messages.length) {
          return; // No messages to process for this name.
        }
        messages.forEach((message) => {
          const messageData = message.getData();
          const messageSender = message.getSender();
          const uniqueMessageId = messageData.uniqueId;
          debugLogger.info(
            `Received custom message ${messageName} with data ${JSON.stringify(
              messageData
            )}.`
          );
          const matches = customMessageRegex.exec(messageName);
          if (!matches) {
            // This should not happen.
            logger.error(`Invalid custom message ${messageName}.`);
            return;
          }

          const customMessageCacheKey = `${messageName}#${uniqueMessageId}`;
          if (processedCustomMessagesCache.has(customMessageCacheKey)) {
            // Message has already been processed recently. This can happen if the message is sent multiple times,
            // after not being acknowledged properly.
            debugLogger.info(
              `Message ${messageName} has already been processed, skipping.`
            );
            return;
          }

          const acknowledgmentMessageName = createAcknowledgeCustomMessageNameFromCustomMessage(
            messageName
          );
          debugLogger.info(
            `Sending acknowledgment of custom message ${messageName} to ${messageSender}.`
          );
          sendDataTo([messageSender], acknowledgmentMessageName, {});

          // If we are the host,
          // so we need to relay the message to others.
          if (gdjs.multiplayer.isCurrentPlayerHost()) {
            // In the case of custom messages, we relay the message to all players, including the sender.
            // This allows the sender to process it the same way others would, when they receive the event.
            const connectedPeerIds = gdjs.multiplayerPeerJsHelper.getAllPeers();
            if (!connectedPeerIds.length) {
              // No one else to relay the message to.
              return;
            }

            addExpectedMessageAcknowledgement({
              originalMessageName: messageName,
              originalData: messageData,
              expectedMessageName: acknowledgmentMessageName,
              otherPeerIds: connectedPeerIds,
              // As we are the host, we do not cancel the message if it times out.
              shouldCancelMessageIfTimesOut: false,
            });
            sendDataTo(connectedPeerIds, messageName, messageData);
          }
        });
      });
    };

    const updateSceneMessageNamePrefix = '#updateScene';
    const createUpdateSceneMessage = ({
      sceneNetworkSyncData,
    }: {
      sceneNetworkSyncData: LayoutNetworkSyncData;
    }): {
      messageName: string;
      messageData: LayoutNetworkSyncData;
    } => {
      return {
        messageName: `${updateSceneMessageNamePrefix}`,
        messageData: sceneNetworkSyncData,
      };
    };

    const isSceneDifferentFromLastSync = (
      sceneSyncData: LayoutNetworkSyncData
    ) => {
      if (!sceneSyncData.var) {
        return false;
      }
      if (!lastSentSceneSyncData) {
        return true;
      }
      // Compare the json of the scene sync data to know if it has changed.
      // Not the most efficient way, but it's good enough for now.
      const haveVariableSyncDataChanged =
        JSON.stringify(sceneSyncData.var) !==
        JSON.stringify(lastSentSceneSyncData.var);

      return haveVariableSyncDataChanged;
    };

    const hasSceneBeenSyncedRecently = () => {
      return (
        getTimeNow() - lastSceneSyncTimestamp < 1000 / sceneSyncDataSyncRate
      );
    };

    const handleUpdateSceneMessagesToSend = (
      runtimeScene: gdjs.RuntimeScene
    ): void => {
      if (!gdjs.multiplayer.isReadyToSendOrReceiveGameUpdateMessages()) {
        // Don't send messages if the multiplayer is not ready.
        return;
      }

      const sceneNetworkSyncData = runtimeScene.getNetworkSyncData({
        playerNumber: gdjs.multiplayer.getCurrentPlayerNumber(),
        isHost: gdjs.multiplayer.isCurrentPlayerHost(),
      });
      if (!sceneNetworkSyncData) {
        return;
      }

      const isSceneSyncDataDifferent = isSceneDifferentFromLastSync(
        sceneNetworkSyncData
      );
      const shouldSyncScene =
        !hasSceneBeenSyncedRecently() ||
        isSceneSyncDataDifferent ||
        numberOfForcedSceneUpdates > 0;

      if (isSceneSyncDataDifferent) {
        numberOfForcedSceneUpdates = 3;
      }

      if (!shouldSyncScene) {
        return;
      }

      const connectedPeerIds = gdjs.multiplayerPeerJsHelper.getAllPeers();
      const { messageName, messageData } = createUpdateSceneMessage({
        sceneNetworkSyncData,
      });

      sendDataTo(connectedPeerIds, messageName, messageData);

      lastSceneSyncTimestamp = getTimeNow();
      lastSentSceneSyncData = sceneNetworkSyncData;
      numberOfForcedSceneUpdates = Math.max(numberOfForcedSceneUpdates - 1, 0);
    };

    const handleUpdateSceneMessagesReceived = (
      runtimeScene: gdjs.RuntimeScene
    ) => {
      const p2pMessagesMap = gdjs.multiplayerPeerJsHelper.getAllMessagesMap();
      const messageNamesArray = Array.from(p2pMessagesMap.keys());
      const updateSceneMessageNames = messageNamesArray.filter((messageName) =>
        messageName.startsWith(updateSceneMessageNamePrefix)
      );
      updateSceneMessageNames.forEach((messageName) => {
        const messagesList = p2pMessagesMap.get(messageName);
        if (!messagesList) return; // Should not happen.
        const messages = messagesList.getMessages();
        if (!messages.length) return; // No messages to process for this name.
        messages.forEach((message) => {
          const messageData = message.getData();
          const messageSender = message.getSender();
          const sceneNetworkId = messageData.id;

          if (gdjs.multiplayer.isReadyToSendOrReceiveGameUpdateMessages()) {
            if (sceneNetworkId !== runtimeScene.networkId) {
              debugLogger.info(
                `Received update of scene ${sceneNetworkId}, but we are on ${runtimeScene.networkId}. Skipping.`
              );
              // The scene is not the current scene.
              return;
            }

            runtimeScene.updateFromNetworkSyncData(messageData);
          } else {
            // If the game is not ready to receive game update messages, we need to save the data for later use.
            // This can happen when joining a game that is already running.
            debugLogger.info(
              `Saving scene ${sceneNetworkId} update message for later use.`
            );
            lastReceivedSceneSyncDataUpdates.store(messageData);
            return;
          }

          // If we are are the host,
          // we need to relay the scene update to others except the player who sent the update message.
          if (gdjs.multiplayer.isCurrentPlayerHost()) {
            const connectedPeerIds = gdjs.multiplayerPeerJsHelper.getAllPeers();
            // We don't need to send the message to the player who sent the update message.
            const otherPeerIds = connectedPeerIds.filter(
              (peerId) => peerId !== messageSender
            );

            sendDataTo(otherPeerIds, messageName, messageData);
          }
        });
      });
    };

    const updateGameMessageNamePrefix = '#updateGame';
    const createUpdateGameMessage = ({
      gameNetworkSyncData,
    }: {
      gameNetworkSyncData: GameNetworkSyncData;
    }): {
      messageName: string;
      messageData: any;
    } => {
      return {
        messageName: `${updateGameMessageNamePrefix}`,
        messageData: gameNetworkSyncData,
      };
    };
    const isGameDifferentFromLastSync = (gameSyncData: GameNetworkSyncData) => {
      const variablesToSync = gameSyncData.var;
      const sceneStackToSync = gameSyncData.ss;
      if (!variablesToSync && !sceneStackToSync) {
        // Nothing to sync.
        return false;
      }

      if (
        !lastSentGameSyncData ||
        !lastSentGameSyncData.var ||
        !lastSentGameSyncData.ss
      ) {
        // We have not sent any game sync data yet, probably start of the game, let's do it.
        return true;
      }

      // Compare the json of the game variables sync data to know if it has changed.
      // Not the most efficient way, but it's good enough for now.
      if (
        variablesToSync &&
        JSON.stringify(variablesToSync) !==
          JSON.stringify(lastSentGameSyncData.var)
      ) {
        return true;
      }

      // For the sceneStack, loop through them one by one as it's more efficient.
      if (sceneStackToSync) {
        // If the length has changed, we're sure it's different.
        if (sceneStackToSync.length !== lastSentGameSyncData.ss.length) {
          return true;
        }

        for (let i = 0; i < sceneStackToSync.length; ++i) {
          const sceneToSync = sceneStackToSync[i];
          const lastSceneSent = lastSentGameSyncData.ss[i];
          if (
            sceneToSync.name !== lastSceneSent.name ||
            sceneToSync.networkId !== lastSceneSent.networkId
          ) {
            return true;
          }
        }
      }

      return false;
    };

    const hasGameBeenSyncedRecently = () => {
      return getTimeNow() - lastGameSyncTimestamp < 1000 / gameSyncDataSyncRate;
    };

    const handleUpdateGameMessagesToSend = (
      runtimeScene: gdjs.RuntimeScene
    ): void => {
      if (!gdjs.multiplayer.isReadyToSendOrReceiveGameUpdateMessages()) {
        // Don't send messages if the multiplayer is not ready.
        return;
      }

      const gameNetworkSyncData = runtimeScene.getGame().getNetworkSyncData({
        playerNumber: gdjs.multiplayer.getCurrentPlayerNumber(),
        isHost: gdjs.multiplayer.isCurrentPlayerHost(),
      });
      if (!gameNetworkSyncData) {
        return;
      }

      const isGameSyncDataDifferent = isGameDifferentFromLastSync(
        gameNetworkSyncData
      );
      const shouldSyncGame =
        !hasGameBeenSyncedRecently() ||
        isGameSyncDataDifferent ||
        numberOfForcedGameUpdates > 0;

      if (isGameSyncDataDifferent) {
        numberOfForcedGameUpdates = 3;
      }

      if (!shouldSyncGame) {
        return;
      }

      const connectedPeerIds = gdjs.multiplayerPeerJsHelper.getAllPeers();
      const { messageName, messageData } = createUpdateGameMessage({
        gameNetworkSyncData,
      });

      sendDataTo(connectedPeerIds, messageName, messageData);

      lastGameSyncTimestamp = getTimeNow();
      lastSentGameSyncData = gameNetworkSyncData;
      numberOfForcedGameUpdates = Math.max(numberOfForcedGameUpdates - 1, 0);
    };

    const handleUpdateGameMessagesReceived = (
      runtimeScene: gdjs.RuntimeScene
    ) => {
      const p2pMessagesMap = gdjs.multiplayerPeerJsHelper.getAllMessagesMap();
      const messageNamesArray = Array.from(p2pMessagesMap.keys());
      const updateGameMessageNames = messageNamesArray.filter((messageName) =>
        messageName.startsWith(updateGameMessageNamePrefix)
      );
      updateGameMessageNames.forEach((messageName) => {
        const messagesList = p2pMessagesMap.get(messageName);
        if (!messagesList) return; // Should not happen.
        const messages = messagesList.getMessages();
        if (!messages.length) return; // No messages to process for this name.
        messages.forEach((message) => {
          const messageData = message.getData();
          const messageSender = message.getSender();
          if (gdjs.multiplayer.isReadyToSendOrReceiveGameUpdateMessages()) {
            runtimeScene.getGame().updateFromNetworkSyncData(messageData);
          } else {
            // If the game is not ready to receive game update messages, we need to save the data for later use.
            // This can happen when joining a game that is already running.
            debugLogger.info(`Saving game update message for later use.`);
            lastReceivedGameSyncDataUpdates.store(messageData);
            return;
          }

          // If we are are the host,
          // we need to relay the game update to others except the player who sent the update message.
          if (gdjs.multiplayer.isCurrentPlayerHost()) {
            const connectedPeerIds = gdjs.multiplayerPeerJsHelper.getAllPeers();
            // We don't need to send the message to the player who sent the update message.
            const otherPeerIds = connectedPeerIds.filter(
              (peerId) => peerId !== messageSender
            );

            sendDataTo(otherPeerIds, messageName, messageData);
          }
        });
      });
    };

    const handleSavedUpdateMessages = (runtimeScene: gdjs.RuntimeScene) => {
      // Reapply the game saved updates.
      lastReceivedGameSyncDataUpdates.getUpdates().forEach((messageData) => {
        debugLogger.info(`Reapplying saved update of game.`);
        runtimeScene.getGame().updateFromNetworkSyncData(messageData);
      });
      // Game updates are always applied properly, so we can clear them.
      lastReceivedGameSyncDataUpdates.clear();

      // Then reapply the scene saved updates.
      lastReceivedSceneSyncDataUpdates.getUpdates().forEach((messageData) => {
        const sceneNetworkId = messageData.id;

        if (sceneNetworkId !== runtimeScene.networkId) {
          debugLogger.info(
            `Trying to apply saved update of scene ${sceneNetworkId}, but we are on ${runtimeScene.networkId}. Skipping.`
          );
          // The scene is not the current scene.
          return;
        }

        debugLogger.info(`Reapplying saved update of scene ${sceneNetworkId}.`);

        runtimeScene.updateFromNetworkSyncData(messageData);
        // We only remove the message if it was successfully applied, so it can be reapplied later,
        // in case we were not on the right scene.
        lastReceivedSceneSyncDataUpdates.remove(messageData);
      });
    };

    const heartbeatMessageNamePrefix = '#heartbeat';
    const heartbeastMessageRegex = /#heartbeat#(.+)/;
    const createHeartbeatMessage = (): {
      messageName: string;
      messageData: any;
    } => {
      // If we create the heartbeat meassage, we are the host,
      // Ensure our player number is correctly set when the first heartbeat is sent.
      _playersInfo[gdjs.multiplayer.getCurrentPlayerNumber()] = {
        ping: 0, // we are the host, so we don't need to compute the ping.
        playerId: gdjs.playerAuthentication.getUserId(),
        username: gdjs.playerAuthentication.getUsername(),
      };
      for (const playerNumber in _playersInfo) {
        _playersInfo[playerNumber] = {
          ..._playersInfo[playerNumber],
          ping: getPlayerPing(parseInt(playerNumber, 10)),
        };
      }
      return {
        messageName: `${heartbeatMessageNamePrefix}#${gdjs.multiplayer.getCurrentPlayerNumber()}`,
        messageData: {
          now: getTimeNow(), // we send the current time to compute the ping.
          playersInfo: _playersInfo,
        },
      };
    };
    const createHeartbeatAnswerMessage = ({
      heartbeatSentAt,
    }: {
      heartbeatSentAt: number;
    }): {
      messageName: string;
      messageData: any;
    } => {
      return {
        messageName: `${heartbeatMessageNamePrefix}#${gdjs.multiplayer.getCurrentPlayerNumber()}`,
        messageData: {
          sentAt: heartbeatSentAt,
          playerId: gdjs.playerAuthentication.getUserId(),
          username: gdjs.playerAuthentication.getUsername(),
        },
      };
    };
    const hasSentHeartbeatRecently = () => {
      return (
        !!lastHeartbeatSentTimestamp &&
        getTimeNow() - lastHeartbeatSentTimestamp < 1000 / heartbeatSyncRate
      );
    };
    const handleHeartbeatsToSend = () => {
      // Only host sends heartbeats to all players regularly:
      // - it allows them to send a heartbeat back immediately so that the host can compute the ping.
      // - it allows to pass along the pings of all players to all players.
      if (!gdjs.multiplayer.isCurrentPlayerHost()) {
        return;
      }

      const shouldSendHeartbeat = !hasSentHeartbeatRecently();
      if (!shouldSendHeartbeat) {
        return;
      }

      const connectedPeerIds = gdjs.multiplayerPeerJsHelper.getAllPeers();
      const { messageName, messageData } = createHeartbeatMessage();
      sendDataTo(connectedPeerIds, messageName, messageData);

      lastHeartbeatSentTimestamp = getTimeNow();
    };

    const handleHeartbeatsReceived = () => {
      const p2pMessagesMap = gdjs.multiplayerPeerJsHelper.getAllMessagesMap();
      const messageNamesArray = Array.from(p2pMessagesMap.keys());
      const heartbeatMessageNames = messageNamesArray.filter((messageName) =>
        messageName.startsWith(heartbeatMessageNamePrefix)
      );
      heartbeatMessageNames.forEach((messageName) => {
        const messagesList = p2pMessagesMap.get(messageName);
        if (!messagesList) return; // Should not happen.
        const messages = messagesList.getMessages();
        if (!messages.length) return; // No messages to process for this name.
        messages.forEach((message) => {
          const messageData = message.getData();
          const messageSender = message.getSender();
          const matches = heartbeastMessageRegex.exec(messageName);
          if (!matches) {
            return;
          }
          const playerNumber = parseInt(matches[1], 10);
          // Ensure we know who is who.
          _peerIdToPlayerNumber[messageSender] = playerNumber;

          // If we are not the host, save what the host told us about the other players info
          // and respond with a heartbeat immediately, informing the host of our playerId and username.
          if (!gdjs.multiplayer.isCurrentPlayerHost()) {
            const currentPlayerNumber = gdjs.multiplayer.getCurrentPlayerNumber();
            const currentlyKnownPlayerNumbers = Object.keys(
              _playersInfo
            ).map((playerNumber) => parseInt(playerNumber, 10));
            const receivedPlayerNumbers = Object.keys(
              messageData.playersInfo
            ).map((playerNumber) => parseInt(playerNumber, 10));
            const currentlyKnownPingForCurrentUser =
              _playersInfo[currentPlayerNumber] &&
              _playersInfo[currentPlayerNumber].ping;
            // If there are no players info yet, we're probably just connecting.
            // This can happen when joining a game that is already running.
            // Do not handle this case to avoid displaying too many notifications.
            if (!!currentlyKnownPlayerNumbers.length) {
              // Look at the players info received to know if there are new players who just connected.
              const newPlayerNumbers = receivedPlayerNumbers.filter(
                (playerNumber) =>
                  !currentlyKnownPlayerNumbers.includes(playerNumber) &&
                  playerNumber !== currentPlayerNumber // Do not consider ourselves as a new player.
              );
              _playerNumbersWhoJustJoined.push(...newPlayerNumbers);
              // Or players who have disconnected.
              const playerNumbersWhoHaveDisconnected = currentlyKnownPlayerNumbers.filter(
                (playerNumber) => !receivedPlayerNumbers.includes(playerNumber)
              );
              _playerNumbersWhoJustLeft.push(
                ...playerNumbersWhoHaveDisconnected
              );
              for (const playerNumber of playerNumbersWhoHaveDisconnected) {
                // Temporarily save the username in another variable to be used for the notification,
                // as we're deleting its playerInfo just after.
                _temporaryPlayerNumberToUsername[
                  playerNumber
                ] = getPlayerUsername(playerNumber);
              }
            }

            // Save the players info received from the host.
            // Avoid overwriting the whole object as it can mess up tests that rely on the object reference.
            cloneObjectWithoutOverwriting({
              source: messageData.playersInfo,
              target: _playersInfo,
            });

            const {
              messageName: answerMessageName,
              messageData: answerMessageData,
            } = createHeartbeatAnswerMessage({
              heartbeatSentAt: messageData.now, // We send back the time we received, so that the host can compute the ping.
            });
            sendDataTo([messageSender], answerMessageName, answerMessageData);
            // We have received a heartbeat from the host, informing us of our ping,
            // so we can consider the connection as working.
            if (
              _playersInfo[currentPlayerNumber] !== undefined &&
              _playersInfo[currentPlayerNumber].ping !== undefined
            ) {
              gdjs.multiplayer.markConnectionAsConnected();
              if (currentlyKnownPingForCurrentUser === undefined) {
                // We just connected, let's add ourselves to the list of players who just connected,
                // for the notification and the events.
                _playerNumbersWhoJustJoined.push(currentPlayerNumber);
              }
            }

            return;
          }

          // If we are the host.

          // If this is a new player, we're about to send them their ping, so we can consider them connected.
          if (!_playersInfo[playerNumber]) {
            _playerNumbersWhoJustJoined.push(playerNumber);
          }

          // compute the pings based on:
          // - the time we received the heartbeat.
          // - the time the heartbeat was sent.
          const now = getTimeNow();
          const heartbeatSentAt = messageData.sentAt;
          const roundTripTime = Math.round(now - heartbeatSentAt);
          const playerLastRoundTripTimes =
            _playersLastRoundTripTimes[playerNumber] || [];
          playerLastRoundTripTimes.push(roundTripTime);
          if (playerLastRoundTripTimes.length > 5) {
            // Keep only the last 5 RTT to compute the average.
            playerLastRoundTripTimes.shift();
          }
          _playersLastRoundTripTimes[playerNumber] = playerLastRoundTripTimes;

          let sum = 0;
          for (const lastRoundTripTime of playerLastRoundTripTimes) {
            sum += lastRoundTripTime;
          }
          const averagePing = Math.round(
            sum / playerLastRoundTripTimes.length / 2 // Divide by 2 to get the one way ping.
          );
          _playersInfo[playerNumber] = {
            ping: averagePing,
            playerId: messageData.playerId,
            username: messageData.username,
          };

          // If there are new players, let's resend a heartbeat right away so that everyone is aware of them
          // on approximately the same frame.
          if (_playerNumbersWhoJustJoined.length) {
            const connectedPeerIds = gdjs.multiplayerPeerJsHelper.getAllPeers();
            const { messageName, messageData } = createHeartbeatMessage();
            sendDataTo(connectedPeerIds, messageName, messageData);
            lastHeartbeatSentTimestamp = getTimeNow();
          }
        });
      });
    };

    const hasReceivedHeartbeatFromPlayer = (playerNumber: number) => {
      // Consider that a player has sent a heartbeat if we have been able to calculate
      // at least one round trip time for them.
      const playerLastRoundTripTimes =
        _playersLastRoundTripTimes[playerNumber] || [];
      return playerLastRoundTripTimes.length > 0;
    };

    const getPlayerPing = (playerNumber: number) => {
      const playerInfo = _playersInfo[playerNumber];
      if (!playerInfo) {
        return 0;
      }
      return playerInfo.ping || 0;
    };

    const getCurrentPlayerPing = () => {
      const currentPlayerNumber = gdjs.multiplayer.getCurrentPlayerNumber();
      return getPlayerPing(currentPlayerNumber);
    };

    const markPlayerAsDisconnected = ({
      runtimeScene,
      playerNumber,
      peerId,
    }: {
      runtimeScene: gdjs.RuntimeScene;
      playerNumber: number;
      peerId?: string;
    }) => {
      logger.info(`Marking player ${playerNumber} as disconnected.`);
      _playerNumbersWhoJustLeft.push(playerNumber);
      // Temporarily save the username in another variable to be used for the notification,
      // as we're deleting its playerInfo just after.
      _temporaryPlayerNumberToUsername[playerNumber] = getPlayerUsername(
        playerNumber
      );
      clearPlayerTempData(playerNumber);

      // If Host has disconnected, either switch host or stop the game.
      if (peerId && peerId === gdjs.multiplayer.hostPeerId) {
        const shouldEndLobbyGame = gdjs.multiplayer.shouldEndLobbyWhenHostLeaves();
        if (shouldEndLobbyGame) {
          logger.info('Host has disconnected, ending the game.');

          clearAllMessagesTempData();
          gdjs.multiplayer.handleLobbyGameEnded();
        } else {
          logger.info('Host has disconnected, switching host.');

          gdjs.multiplayer.handleHostDisconnected({ runtimeScene });
          return;
        }
      }

      // If we are the host, send a heartbeat right away so that everyone is aware of the disconnection
      // on approximately the same frame.
      if (gdjs.multiplayer.isCurrentPlayerHost()) {
        const connectedPeerIds = gdjs.multiplayerPeerJsHelper.getAllPeers();
        const { messageName, messageData } = createHeartbeatMessage();
        sendDataTo(connectedPeerIds, messageName, messageData);
        lastHeartbeatSentTimestamp = getTimeNow();
      }
    };

    const getPlayerUsername = (playerNumber: number) => {
      return (
        (_playersInfo[playerNumber] || {}).username ||
        _temporaryPlayerNumberToUsername[playerNumber] ||
        `Player ${playerNumber}`
      );
    };

    const getPlayerId = (playerNumber: number) => {
      return (_playersInfo[playerNumber] || {}).playerId || '';
    };

    const handleJustDisconnectedPeers = (runtimeScene: RuntimeScene) => {
      // If the game is not running, we don't need to handle disconnected peers.
      if (!gdjs.multiplayer.isLobbyGameRunning()) {
        return;
      }

      // We rely on the p2p helper to know who has disconnected.
      const justDisconnectedPlayers: {
        playerNumber: number;
        peerId: string;
      }[] = [];

      const justDisconnectedPeers = gdjs.multiplayerPeerJsHelper.getJustDisconnectedPeers();
      if (justDisconnectedPeers.length) {
        for (const disconnectedPeer of justDisconnectedPeers) {
          const disconnectedPlayerNumber =
            _peerIdToPlayerNumber[disconnectedPeer];
          if (!disconnectedPlayerNumber) {
            // This should not happen.
            return;
          }
          logger.info(`Player ${disconnectedPlayerNumber} has disconnected.`);
          justDisconnectedPlayers.push({
            playerNumber: disconnectedPlayerNumber,
            peerId: disconnectedPeer,
          });
        }
      }

      for (const { playerNumber, peerId } of justDisconnectedPlayers) {
        // When a player disconnects, as the host, we look at all the instances
        // they own and decide what to do with them.
        if (gdjs.multiplayer.isCurrentPlayerHost()) {
          const instances = runtimeScene.getAdhocListOfAllInstances();
          for (const instance of instances) {
            const behavior = instance.getBehavior(
              'MultiplayerObject'
            ) as MultiplayerObjectRuntimeBehavior | null;
            if (
              behavior &&
              behavior.getPlayerObjectOwnership() === playerNumber
            ) {
              const actionOnPlayerDisconnect = behavior.getActionOnPlayerDisconnect();
              if (actionOnPlayerDisconnect === 'DestroyObject') {
                // No need to remove the ownership, as the destroy message will be sent to all players.
                instance.deleteFromScene(runtimeScene);
              } else if (actionOnPlayerDisconnect === 'GiveOwnershipToHost') {
                // Removing the ownership will send a message to all players.
                behavior.removeObjectOwnership();
              } else if (actionOnPlayerDisconnect === 'DoNothing') {
                // Do nothing.
              }
            }
          }
        }

        markPlayerAsDisconnected({ runtimeScene, playerNumber, peerId });
      }
    };

    const hasAnyPlayerJustLeft = (): boolean => {
      return _playerNumbersWhoJustLeft.length > 0;
    };
    const hasPlayerJustLeft = (playerNumber: number): boolean => {
      return _playerNumbersWhoJustLeft.includes(playerNumber);
    };
    const getPlayersWhoJustLeft = (): number[] => {
      return _playerNumbersWhoJustLeft;
    };
    const getLatestPlayerWhoJustLeft = (): number => {
      return _playerNumbersWhoJustLeft[0] || 0;
    };
    const removePlayerWhoJustLeft = (): void => {
      // Avoid using shift for test purposes, as it modifies the reference.
      const playerNumberWhoLeft = _playerNumbersWhoJustLeft[0];
      if (playerNumberWhoLeft !== undefined) {
        _playerNumbersWhoJustLeft = _playerNumbersWhoJustLeft.slice(1);
        delete _temporaryPlayerNumberToUsername[playerNumberWhoLeft];
      }
    };

    const hasAnyPlayerJustJoined = () => {
      return _playerNumbersWhoJustJoined.length > 0;
    };
    const hasPlayerJustJoined = (playerNumber: number): boolean => {
      return _playerNumbersWhoJustJoined.includes(playerNumber);
    };
    const getPlayersWhoJustJoined = () => {
      return _playerNumbersWhoJustJoined;
    };
    const getLatestPlayerWhoJustJoined = (): number => {
      return _playerNumbersWhoJustJoined[0] || 0;
    };
    const removePlayerWhoJustJoined = (): void => {
      // Avoid using shift for test purposes, as it modifies the reference.
      const playerNumberWhoJoined = _playerNumbersWhoJustJoined[0];
      if (playerNumberWhoJoined !== undefined) {
        _playerNumbersWhoJustJoined = _playerNumbersWhoJustJoined.slice(1);
      }
    };

    const getConnectedPlayers = () => {
      return Object.keys(_playersInfo).map((playerNumber) => ({
        playerNumber: parseInt(playerNumber, 10),
        playerId: _playersInfo[playerNumber].playerId,
      }));
    };
    const getNumberOfConnectedPlayers = () => {
      // Look at the player info as a way to know how many players are in the lobby.
      // This object is updated when heartbeats are sent and received.
      return Object.keys(_playersInfo).length;
    };
    const isPlayerConnected = (playerNumber: number) => {
      return _playersInfo[playerNumber] !== undefined;
    };

    const getPlayersInfo = () => {
      return _playersInfo;
    };

    const endGameMessageName = '#endGame';
    const createEndGameMessage = (): {
      messageName: string;
      messageData: any;
    } => {
      return {
        messageName: endGameMessageName,
        messageData: {},
      };
    };
    const sendEndGameMessage = () => {
      // Only the host can end the game.
      if (!gdjs.multiplayer.isCurrentPlayerHost()) {
        return;
      }

      debugLogger.info(`Sending endgame message.`);

      const connectedPeerIds = gdjs.multiplayerPeerJsHelper.getAllPeers();
      const { messageName, messageData } = createEndGameMessage();
      // Note: we don't wait for an acknowledgment here, as the game will end anyway.
      sendDataTo(connectedPeerIds, messageName, messageData);
    };

    const handleEndGameMessagesReceived = () => {
      if (gdjs.multiplayer.isCurrentPlayerHost()) {
        // Only other players need to react to the end game message.
        return;
      }
      const p2pMessagesMap = gdjs.multiplayerPeerJsHelper.getAllMessagesMap();
      const endGameMessagesList = p2pMessagesMap.get(endGameMessageName);
      if (!endGameMessagesList) {
        return; // No end game message received.
      }
      const messages = endGameMessagesList.getMessages();
      if (!messages.length) return; // No messages to process.

      logger.info(`Received endgame message.`);

      // If the message is received more than 1 time, we just ignore it and end the game.

      clearAllMessagesTempData();
      gdjs.multiplayer.handleLobbyGameEnded();
    };

    const resumeGameMessageName = '#resumeGame';
    const createResumeGameMessage = (): {
      messageName: string;
      messageData: any;
    } => {
      return {
        messageName: resumeGameMessageName,
        messageData: {},
      };
    };
    const sendResumeGameMessage = () => {
      // Only the host can inform others that the game is resuming.
      if (!gdjs.multiplayer.isCurrentPlayerHost()) {
        return;
      }

      debugLogger.info(`Sending resumeGame message.`);

      const connectedPeerIds = gdjs.multiplayerPeerJsHelper.getAllPeers();
      const { messageName, messageData } = createResumeGameMessage();
      sendDataTo(connectedPeerIds, messageName, messageData);
    };

    const handleResumeGameMessagesReceived = (
      runtimeScene: gdjs.RuntimeScene
    ) => {
      if (gdjs.multiplayer.isCurrentPlayerHost()) {
        // Only other players need to react to resume game message.
        return;
      }

      const p2pMessagesMap = gdjs.multiplayerPeerJsHelper.getAllMessagesMap();
      const resumeGameMessagesList = p2pMessagesMap.get(resumeGameMessageName);
      if (!resumeGameMessagesList) {
        return; // No resume game message received.
      }
      const messages = resumeGameMessagesList.getMessages();
      if (!messages.length) return; // No messages to process.

      logger.info(`Received resumeGame message.`);

      gdjs.multiplayer.resumeGame(runtimeScene);
    };

    const clearAllMessagesTempData = () => {
      _playersLastRoundTripTimes = {};
      _playersInfo = {};
      lastReceivedGameSyncDataUpdates.clear();
      lastReceivedSceneSyncDataUpdates.clear();
      processedCustomMessagesCache.clear();
      _playerNumbersWhoJustLeft = [];
      _playerNumbersWhoJustJoined = [];
      expectedMessageAcknowledgements = {};
      _lastClockReceivedByInstanceByScene = {};
    };

    const clearPlayerTempData = (playerNumber: number) => {
      // Remove the player from the list of players.
      // This will cause the next hearbeat to not include this player
      // and the others will consider them as disconnected.
      delete _playersLastRoundTripTimes[playerNumber];
      delete _playersInfo[playerNumber];
    };

    return {
      sendDataTo,
      // Acks.
      addExpectedMessageAcknowledgement,
      handleAcknowledgeMessagesReceived,
      resendClearOrCancelAcknowledgedMessages,
      // Instance ownership.
      createChangeInstanceOwnerMessage,
      createInstanceOwnerChangedMessageNameFromChangeInstanceOwnerMessage,
      handleChangeInstanceOwnerMessagesReceived,
      // Instance update.
      createUpdateInstanceMessage,
      handleUpdateInstanceMessagesReceived,
      // Instance destruction.
      createDestroyInstanceMessage,
      createInstanceDestroyedMessageNameFromDestroyInstanceMessage,
      handleDestroyInstanceMessagesReceived,
      // Variable ownership.
      createChangeVariableOwnerMessage,
      createVariableOwnerChangedMessageNameFromChangeVariableOwnerMessage,
      handleChangeVariableOwnerMessagesReceived,
      // Custom messages.
      sendCustomMessage,
      getCustomMessageData,
      sendVariableCustomMessage,
      getVariableCustomMessageData,
      hasCustomMessageBeenReceived,
      handleCustomMessagesReceived,
      getCustomMessageSender,
      // Scene update.
      createUpdateSceneMessage,
      handleUpdateSceneMessagesToSend,
      handleUpdateSceneMessagesReceived,
      // Game update.
      createUpdateGameMessage,
      handleUpdateGameMessagesToSend,
      handleUpdateGameMessagesReceived,
      handleSavedUpdateMessages,
      // Heartbeats.
      handleHeartbeatsToSend,
      handleHeartbeatsReceived,
      hasReceivedHeartbeatFromPlayer,
      // Pings & usernames.
      getPlayerPing,
      getCurrentPlayerPing,
      getPlayerUsername,
      getPlayerId,
      // Connected players.
      handleJustDisconnectedPeers,
      getConnectedPlayers,
      getNumberOfConnectedPlayers,
      isPlayerConnected,
      getPlayersInfo,
      // Leaving players.
      hasAnyPlayerJustLeft,
      hasPlayerJustLeft,
      getPlayersWhoJustLeft,
      getLatestPlayerWhoJustLeft,
      removePlayerWhoJustLeft,
      markPlayerAsDisconnected,
      // Joining players.
      hasAnyPlayerJustJoined,
      hasPlayerJustJoined,
      getPlayersWhoJustJoined,
      getLatestPlayerWhoJustJoined,
      removePlayerWhoJustJoined,
      // End game.
      sendEndGameMessage,
      handleEndGameMessagesReceived,
      clearAllMessagesTempData,
      // Resume game after migration.
      sendResumeGameMessage,
      handleResumeGameMessagesReceived,
    };
  };

  /**
   * The MultiplayerMessageManager used by the game.
   */
  export let multiplayerMessageManager = makeMultiplayerMessageManager();
}
