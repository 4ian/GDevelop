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
  }

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
    const sceneSyncDataTickRate = 1;
    let lastSceneSyncTimestamp = 0;
    let lastSentSceneSyncData: LayoutNetworkSyncData | null = null;
    let numberOfForcedSceneUpdates = 0;

    // The number of times per second the game data should be synchronized.
    const gameSyncDataTickRate = 1;
    let lastGameSyncTimestamp = 0;
    let lastSentGameSyncData: GameNetworkSyncData | null = null;
    let numberOfForcedGameUpdates = 0;

    // Send heartbeat messages to host to ensure the connection is still alive.
    const heartbeatTickRate = 1;
    let lastHeartbeatTimestamp = 0;
    let _playersLastHeartbeatInfo: {
      [playerNumber: number]: {
        lastRoundTripTimes: number[];
      };
    } = {};
    let _peerIdToPlayerNumber: { [peerId: string]: number } = {};
    let _playersPings: { [playerNumber: number]: number } = { 1: 0 };
    let _playerNumbersWhoJustLeft: number[] = [];

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

    const clearExpectedMessageAcknowledgements = () => {
      expectedMessageAcknowledgements = {};
      _lastClockReceivedByInstanceByScene = {};
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
      peerId: string,
      messageName: string,
      data: Object
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
          gdjs.evtTools.p2p.sendDataTo(
            peerId,
            messageName,
            JSON.stringify(data)
          );
        }, SIMULATE_NETWORK_RANDOM_LATENCY_MS);
        return;
      }

      if (SIMULATE_NETWORK_LATENCY_MS > 0) {
        setTimeout(() => {
          gdjs.evtTools.p2p.sendDataTo(
            peerId,
            messageName,
            JSON.stringify(data)
          );
        }, SIMULATE_NETWORK_LATENCY_MS);
        return;
      }

      gdjs.evtTools.p2p.sendDataTo(peerId, messageName, JSON.stringify(data));
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

      if (!instance) {
        debugLogger.info(
          `instance ${objectName} ${instanceNetworkId} not found with network ID, trying to find it with persistent UUID.`
        );
        instance =
          instances.find(
            (instance) =>
              // For objects created from the start, the network ID is not set yet.
              instance.persistentUuid &&
              instance.persistentUuid.substring(0, 8) === instanceNetworkId
          ) || null;

        if (instance) {
          debugLogger.info(
            `instance ${objectName} ${instanceNetworkId} found with persistent UUID. Assigning network ID.`
          );
          // Set the network ID, as it was not set yet.
          instance.networkId = instanceNetworkId;
        }
      }

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
      const p2pMessagesMap = gdjs.evtTools.p2p.getEvents();
      const messageNamesArray = Array.from(p2pMessagesMap.keys());

      // When we receive ownership change messages, update the ownership of the instances in the scene.
      const instanceOwnershipChangeMessageNames = messageNamesArray.filter(
        (messageName) =>
          messageName.startsWith(changeInstanceOwnerMessageNamePrefix)
      );
      instanceOwnershipChangeMessageNames.forEach((messageName) => {
        if (gdjs.evtTools.p2p.onEvent(messageName, false)) {
          const messageData = gdjs.evtTools.p2p.getEventData(messageName);
          let data;
          try {
            data = JSON.parse(messageData);
          } catch (e) {
            logger.error(
              `Error while parsing message ${messageName}: ${e.toString()}`
            );
            return;
          }
          const messageSender = gdjs.evtTools.p2p.getEventSender(messageName);
          if (data) {
            const matches = changeInstanceOwnerMessageNameRegex.exec(
              messageName
            );
            if (!matches) {
              return;
            }
            const objectName = matches[2];
            const instanceNetworkId = matches[3];
            const previousOwner = data.previousOwner;
            const newOwner = data.newOwner;
            const sceneNetworkId = data.sceneNetworkId;

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
              instanceX: data.instanceX,
              instanceY: data.instanceY,
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
            if (gdjs.multiplayer.isPlayerHost() && !ownershipChangeIsCoherent) {
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
            sendDataTo(messageSender, instanceOwnerChangedMessageName, {});

            // If we are the host,
            // so we need to relay the ownership change to others,
            // and expect an acknowledgment from them.
            if (gdjs.multiplayer.isPlayerHost()) {
              const connectedPeerIds = gdjs.evtTools.p2p.getAllPeers();
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
                originalData: data,
                expectedMessageName: instanceOwnerChangedMessageName,
                otherPeerIds,
                // As we are the host, we do not cancel the message if it times out.
                shouldCancelMessageIfTimesOut: false,
              });
              for (const peerId of otherPeerIds) {
                debugLogger.info(
                  `Relaying ownership change of object ${objectName} with instance network ID ${instanceNetworkId} to ${peerId}.`
                );
                sendDataTo(peerId, messageName, data);
              }
            }
          }
        }
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
      const p2pMessagesMap = gdjs.evtTools.p2p.getEvents();
      const messageNamesArray = Array.from(p2pMessagesMap.keys());

      // When we receive update messages, update the instances in the scene.
      const objectUpdateMessageNames = messageNamesArray.filter((messageName) =>
        messageName.startsWith(updateInstanceMessageNamePrefix)
      );
      objectUpdateMessageNames.forEach((messageName) => {
        if (gdjs.evtTools.p2p.onEvent(messageName, true)) {
          const messageData = gdjs.evtTools.p2p.getEventData(messageName);
          let data;
          try {
            data = JSON.parse(messageData);
          } catch (e) {
            logger.error(
              `Error while parsing message ${messageName}: ${e.toString()}`
            );
            return;
          }
          const messageSender = gdjs.evtTools.p2p.getEventSender(messageName);

          if (data) {
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

            const messageInstanceClock = data['_clock'];
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
              instanceX: data.x,
              instanceY: data.y,
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

            instance.updateFromNetworkSyncData(data);

            setLastClockReceivedForInstanceOnScene({
              sceneNetworkId,
              instanceNetworkId,
              clock: messageInstanceClock,
            });

            // If we are are the host,
            // we need to relay the position to others except the player who sent the update message.
            if (gdjs.multiplayer.isPlayerHost()) {
              const connectedPeerIds = gdjs.evtTools.p2p.getAllPeers();
              // We don't need to send the message to the player who sent the update message.
              for (const peerId of connectedPeerIds) {
                if (peerId === messageSender) {
                  continue;
                }

                sendDataTo(peerId, messageName, data);
              }
            }
          }
        }
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
      const p2pMessagesMap = gdjs.evtTools.p2p.getEvents();
      const messageNamesArray = Array.from(p2pMessagesMap.keys());

      // When we receive ownership change messages, find the variable and update its ownership.
      const variableOwnershipChangeMessageNames = messageNamesArray.filter(
        (messageName) =>
          messageName.startsWith(changeVariableOwnerMessageNamePrefix)
      );
      variableOwnershipChangeMessageNames.forEach((messageName) => {
        if (gdjs.evtTools.p2p.onEvent(messageName, false)) {
          const messageData = gdjs.evtTools.p2p.getEventData(messageName);
          let data;
          try {
            data = JSON.parse(messageData);
          } catch (e) {
            logger.error(
              `Error while parsing message ${messageName}: ${e.toString()}`
            );
            return;
          }
          const messageSender = gdjs.evtTools.p2p.getEventSender(messageName);
          if (data) {
            const matches = changeVariableOwnerMessageNameRegex.exec(
              messageName
            );
            if (!matches) {
              return;
            }
            const variableNetworkId = matches[2];
            const previousOwner = data.previousOwner;
            const newOwner = data.newOwner;

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
            if (gdjs.multiplayer.isPlayerHost() && !ownershipChangeIsCoherent) {
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
            sendDataTo(messageSender, variableOwnerChangedMessageName, {});

            // If we are the host,
            // we need to relay the ownership change to others,
            // and expect an acknowledgment from them.
            if (gdjs.multiplayer.isPlayerHost()) {
              const connectedPeerIds = gdjs.evtTools.p2p.getAllPeers();
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
                originalData: data,
                expectedMessageName: variableOwnerChangedMessageName,
                otherPeerIds,
                // As we are the host, we do not cancel the message if it times out.
                shouldCancelMessageIfTimesOut: false,
              });
              for (const peerId of otherPeerIds) {
                debugLogger.info(
                  `Relaying ownership change of variable with Id ${variableNetworkId} to ${peerId}.`
                );
                sendDataTo(peerId, messageName, data);
              }
            }
          }
        }
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
      const p2pMessagesMap = gdjs.evtTools.p2p.getEvents();
      const messageNamesArray = Array.from(p2pMessagesMap.keys());
      // When we receive acknowledgement messages, save it in the extension, to avoid sending the message again.
      const acknowledgedMessageNames = messageNamesArray.filter(
        isMessageAcknowledgement
      );
      acknowledgedMessageNames.forEach((messageName) => {
        if (gdjs.evtTools.p2p.onEvent(messageName, false)) {
          debugLogger.info(
            `Received acknowledgment for message ${messageName}.`
          );
          const message = gdjs.evtTools.p2p.getEvent(messageName);
          let data;
          while ((data = message.getData())) {
            const messageSender = message.getSender();
            const regex = getRegexFromAckMessageName(messageName);
            if (!regex) {
              // This should not happen.
              logger.error(`Invalid acknowledgment message ${messageName}.`);
              message.popData();
              return;
            }

            const matches = regex.exec(messageName);
            if (!matches) {
              // This should not happen.
              logger.error(`Invalid acknowledgment message ${messageName}.`);
              message.popData();
              return;
            }
            if (!expectedMessageAcknowledgements[messageName]) {
              // This should not happen, but if we receive an acknowledgment for a message we did not expect, let's not error
              // and just clear that message.
              message.popData();
              return;
            }
            if (!expectedMessageAcknowledgements[messageName][messageSender]) {
              // This should not happen, but if we receive an acknowledgment from a sender we did not expect, let's not error
              // and just clear that message.
              message.popData();
              return;
            }

            // If a clock is provided in the message, ensure that we only process the message if the clock is newer than the last one received.
            const messageInstanceClock = data['_clock'];
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

            // We've received this acknowledgement from this sender, remove it from the list
            // so that the next getSender() will return the next sender.
            message.popData();
          }
        }
      });
    };

    const resendClearOrCancelAcknowledgedMessages = (
      runtimeScene: gdjs.RuntimeScene
    ) => {
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
              sendDataTo(peerId, originalMessageName, originalData);
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
      const p2pMessagesMap = gdjs.evtTools.p2p.getEvents();
      const messageNamesArray = Array.from(p2pMessagesMap.keys());
      const destroyInstanceMessageNames = messageNamesArray.filter(
        (messageName) =>
          messageName.startsWith(destroyInstanceMessageNamePrefix)
      );
      destroyInstanceMessageNames.forEach((messageName) => {
        if (gdjs.evtTools.p2p.onEvent(messageName, false)) {
          let data;
          const messageData = gdjs.evtTools.p2p.getEventData(messageName);
          try {
            data = JSON.parse(messageData);
          } catch (e) {
            logger.error(
              `Error while parsing message ${messageName}: ${e.toString()}`
            );
            return;
          }
          const messageSender = gdjs.evtTools.p2p.getEventSender(messageName);
          if (data && messageSender) {
            debugLogger.info(
              `Received message ${messageName} with data ${messageData}.`
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
              sendDataTo(messageSender, instanceDestroyedMessageName, {});
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
            sendDataTo(messageSender, instanceDestroyedMessageName, {});

            // If we are the host, we need to relay the destruction to others.
            // And expect an acknowledgment from everyone else as well.
            if (gdjs.multiplayer.isPlayerHost()) {
              const connectedPeerIds = gdjs.evtTools.p2p.getAllPeers();
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
                originalData: data,
                expectedMessageName: instanceDestroyedMessageName,
                otherPeerIds,
                // As we are the host, we do not cancel the message if it times out.
                shouldCancelMessageIfTimesOut: false,
              });
              for (const peerId of otherPeerIds) {
                sendDataTo(peerId, messageName, data);
              }
            }
          }
        }
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
    }: {
      userMessageName: string;
      userMessageData: any;
    }) => {
      const messageId = gdjs.makeUuid();
      return {
        messageName: getCustomMessageNameFromUserMessageName(userMessageName),
        messageData: {
          data: userMessageData,
          uniqueId: messageId,
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
      const connectedPeerIds = gdjs.evtTools.p2p.getAllPeers();
      const { messageName, messageData } = createCustomMessage({
        userMessageName,
        userMessageData,
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
      for (const peerId of connectedPeerIds) {
        sendDataTo(peerId, messageName, messageData);
      }

      // If we are the host, we can consider this messaged as received
      // and add it to the list of custom messages to process on top of the messages received.
      if (gdjs.multiplayer.isPlayerHost()) {
        const message = gdjs.evtTools.p2p.getEvent(messageName);
        message.pushData(
          new gdjs.evtTools.p2p.EventData(
            JSON.stringify(messageData),
            gdjs.evtTools.p2p.getCurrentId()
          )
        );
        // The message is now automatically added to the list of messages to process,
        // and will be removed at the end of the frame.
      }
    };

    const sendCustomVariableMessage = (
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
      const messageName = getCustomMessageNameFromUserMessageName(
        userMessageName
      );
      const messageHasBeenReceived = gdjs.evtTools.p2p.onEvent(
        messageName,
        false
      );
      if (messageHasBeenReceived) {
        const messageData = gdjs.evtTools.p2p.getEventData(messageName);
        let data;
        try {
          data = JSON.parse(messageData);
        } catch (e) {
          logger.error(
            `Error while parsing message ${messageName}: ${e.toString()}`
          );
          return false;
        }
        const uniqueMessageId = data.uniqueId;
        const customMessageCacheKey = `${messageName}#${uniqueMessageId}`;
        if (processedCustomMessagesCache.has(customMessageCacheKey)) {
          // Message has already been processed recently. This can happen if the message is sent multiple times,
          // after not being acknowledged properly.
          return false;
        }
        processedCustomMessagesCache.add(customMessageCacheKey);
        return true;
      }

      return false;
    };

    const getCustomMessageData = (userMessageName: string) => {
      const customMessageName = getCustomMessageNameFromUserMessageName(
        userMessageName
      );
      const messageData = gdjs.evtTools.p2p.getEventData(customMessageName);
      let data;
      try {
        data = JSON.parse(messageData);
      } catch (e) {
        logger.error(
          `Error while parsing message ${userMessageName}: ${e.toString()}`
        );
        return '';
      }

      return data.data;
    };

    const getCustomVariableMessageData = (
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

    const getCustomMessageSender = (userMessageName: string) => {
      const customMessageName = getCustomMessageNameFromUserMessageName(
        userMessageName
      );
      const messageSenderPeerId = gdjs.evtTools.p2p.getEventSender(
        customMessageName
      );
      const messageSenderPlayerNumber =
        _peerIdToPlayerNumber[messageSenderPeerId];
      if (messageSenderPlayerNumber === undefined) {
        return 0;
      }
      return messageSenderPlayerNumber;
    };

    const handleCustomMessagesReceived = (): void => {
      const p2pMessagesMap = gdjs.evtTools.p2p.getEvents();
      const messageNamesArray = Array.from(p2pMessagesMap.keys());
      const customMessageNames = messageNamesArray.filter((messageName) =>
        messageName.startsWith(customMessageNamePrefix)
      );
      customMessageNames.forEach((messageName) => {
        if (gdjs.evtTools.p2p.onEvent(messageName, false)) {
          const event = gdjs.evtTools.p2p.getEvent(messageName);
          const messageData = event.getData();
          let data;
          try {
            data = JSON.parse(messageData);
          } catch (e) {
            logger.error(
              `Error while parsing message ${messageName}: ${e.toString()}`
            );
            return;
          }
          const uniqueMessageId = data.uniqueId;
          const messageSender = event.getSender();
          debugLogger.info(
            `Received custom message ${messageName} with data ${messageData}.`
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
          sendDataTo(messageSender, acknowledgmentMessageName, {});

          // If we are the host,
          // so we need to relay the message to others.
          if (gdjs.multiplayer.isPlayerHost()) {
            // In the case of custom messages, we relay the message to all players, including the sender.
            // This allows the sender to process it the same way others would, when they receive the event.
            const connectedPeerIds = gdjs.evtTools.p2p.getAllPeers();
            if (!connectedPeerIds.length) {
              // No one else to relay the message to.
              return;
            }

            addExpectedMessageAcknowledgement({
              originalMessageName: messageName,
              originalData: data,
              expectedMessageName: acknowledgmentMessageName,
              otherPeerIds: connectedPeerIds,
              // As we are the host, we do not cancel the message if it times out.
              shouldCancelMessageIfTimesOut: false,
            });
            for (const peerId of connectedPeerIds) {
              sendDataTo(peerId, messageName, data);
            }
          }
        }
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
        getTimeNow() - lastSceneSyncTimestamp < 1000 / sceneSyncDataTickRate
      );
    };

    const handleUpdateSceneMessagesToSend = (
      runtimeScene: gdjs.RuntimeScene
    ): void => {
      const sceneNetworkSyncData = runtimeScene.getNetworkSyncData({
        playerNumber: gdjs.multiplayer.getCurrentPlayerNumber(),
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

      const connectedPeerIds = gdjs.evtTools.p2p.getAllPeers();
      const { messageName, messageData } = createUpdateSceneMessage({
        sceneNetworkSyncData,
      });

      for (const peerId of connectedPeerIds) {
        sendDataTo(peerId, messageName, messageData);
      }

      lastSceneSyncTimestamp = getTimeNow();
      lastSentSceneSyncData = sceneNetworkSyncData;
      numberOfForcedSceneUpdates = Math.max(numberOfForcedSceneUpdates - 1, 0);
    };

    const handleUpdateSceneMessagesReceived = (
      runtimeScene: gdjs.RuntimeScene
    ) => {
      const p2pMessagesMap = gdjs.evtTools.p2p.getEvents();
      const messageNamesArray = Array.from(p2pMessagesMap.keys());
      const updateSceneMessageNames = messageNamesArray.filter((messageName) =>
        messageName.startsWith(updateSceneMessageNamePrefix)
      );
      updateSceneMessageNames.forEach((messageName) => {
        if (gdjs.evtTools.p2p.onEvent(messageName, false)) {
          const message = gdjs.evtTools.p2p.getEvent(messageName);
          let messageData;
          while ((messageData = message.getData())) {
            let data;
            try {
              data = JSON.parse(messageData);
            } catch (e) {
              logger.error(
                `Error while parsing message ${messageName}: ${e.toString()}`
              );
              message.popData();
              return;
            }
            const messageSender = gdjs.evtTools.p2p.getEventSender(messageName);
            if (data && messageSender) {
              const sceneNetworkId = data.id;

              if (sceneNetworkId !== runtimeScene.networkId) {
                debugLogger.info(
                  `Received update of scene ${sceneNetworkId}, but we are on ${runtimeScene.networkId}. Skipping.`
                );
                message.popData();
                // The scene is not the current scene.
                return;
              }

              runtimeScene.updateFromNetworkSyncData(data);

              // If we are are the host,
              // we need to relay the scene update to others except the player who sent the update message.
              if (gdjs.multiplayer.isPlayerHost()) {
                const connectedPeerIds = gdjs.evtTools.p2p.getAllPeers();
                for (const peerId of connectedPeerIds) {
                  if (peerId === messageSender) {
                    continue;
                  }
                  sendDataTo(peerId, messageName, data);
                }
              }
            }

            message.popData();
          }
        }
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
      return getTimeNow() - lastGameSyncTimestamp < 1000 / gameSyncDataTickRate;
    };

    const handleUpdateGameMessagesToSend = (
      runtimeScene: gdjs.RuntimeScene
    ): void => {
      const gameNetworkSyncData = runtimeScene.getGame().getNetworkSyncData({
        playerNumber: gdjs.multiplayer.getCurrentPlayerNumber(),
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

      const connectedPeerIds = gdjs.evtTools.p2p.getAllPeers();
      const { messageName, messageData } = createUpdateGameMessage({
        gameNetworkSyncData,
      });

      for (const peerId of connectedPeerIds) {
        sendDataTo(peerId, messageName, messageData);
      }

      lastGameSyncTimestamp = getTimeNow();
      lastSentGameSyncData = gameNetworkSyncData;
      numberOfForcedGameUpdates = Math.max(numberOfForcedGameUpdates - 1, 0);
    };

    const handleUpdateGameMessagesReceived = (
      runtimeScene: gdjs.RuntimeScene
    ) => {
      const p2pMessagesMap = gdjs.evtTools.p2p.getEvents();
      const messageNamesArray = Array.from(p2pMessagesMap.keys());
      const updateGameMessageNames = messageNamesArray.filter((messageName) =>
        messageName.startsWith(updateGameMessageNamePrefix)
      );
      updateGameMessageNames.forEach((messageName) => {
        if (gdjs.evtTools.p2p.onEvent(messageName, false)) {
          const message = gdjs.evtTools.p2p.getEvent(messageName);
          let messageData;
          while ((messageData = message.getData())) {
            let data;
            try {
              data = JSON.parse(messageData);
            } catch (e) {
              logger.error(
                `Error while parsing message ${messageName}: ${e.toString()}`
              );
              message.popData();
              return;
            }
            const messageSender = message.getSender();
            if (data && messageSender) {
              runtimeScene.getGame().updateFromNetworkSyncData(data);

              // If we are are the host,
              // we need to relay the game update to others except the player who sent the update message.
              if (gdjs.multiplayer.isPlayerHost()) {
                const connectedPeerIds = gdjs.evtTools.p2p.getAllPeers();
                for (const peerId of connectedPeerIds) {
                  if (peerId === messageSender) {
                    continue;
                  }

                  sendDataTo(peerId, messageName, data);
                }
              }
            }

            message.popData();
          }
        }
      });
    };

    const heartbeatMessageNamePrefix = '#heartbeat';
    const heartbeastMessageRegex = /#heartbeat#(.+)/;
    const createHeartbeatMessage = (): {
      messageName: string;
      messageData: any;
    } => {
      const playersPings = {
        1: 0, // Player 1 is the host, so we don't need to compute the ping.
      };
      for (const playerNumber in _playersLastHeartbeatInfo) {
        playersPings[playerNumber] = getPlayerPing(parseInt(playerNumber, 10));
      }
      return {
        messageName: `${heartbeatMessageNamePrefix}#${gdjs.multiplayer.getCurrentPlayerNumber()}`,
        messageData: {
          now: getTimeNow(), // we send the current time to compute the ping.
          playersPings,
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
        },
      };
    };
    const hasSentHeartbeatRecently = () => {
      return getTimeNow() - lastHeartbeatTimestamp < 1000 / heartbeatTickRate;
    };
    const handleHeartbeatsToSend = () => {
      // Only host sends heartbeats to all players regularly:
      // - it allows them to send a heartbeat back immediately so that the host can compute the ping.
      // - it allows to pass along the pings of all players to all players.
      if (!gdjs.multiplayer.isPlayerHost()) {
        return;
      }

      const shouldSendHeartbeat = !hasSentHeartbeatRecently();
      if (!shouldSendHeartbeat) {
        return;
      }

      const connectedPeerIds = gdjs.evtTools.p2p.getAllPeers();
      const { messageName, messageData } = createHeartbeatMessage();
      for (const peerId of connectedPeerIds) {
        sendDataTo(peerId, messageName, messageData);
      }

      lastHeartbeatTimestamp = getTimeNow();
    };

    const handleHeartbeatsReceived = () => {
      const p2pMessagesMap = gdjs.evtTools.p2p.getEvents();
      const messageNamesArray = Array.from(p2pMessagesMap.keys());
      const heartbeatMessageNames = messageNamesArray.filter((messageName) =>
        messageName.startsWith(heartbeatMessageNamePrefix)
      );
      heartbeatMessageNames.forEach((messageName) => {
        if (gdjs.evtTools.p2p.onEvent(messageName, false)) {
          const messageData = gdjs.evtTools.p2p.getEventData(messageName);
          let data;
          try {
            data = JSON.parse(messageData);
          } catch (e) {
            logger.error(
              `Error while parsing message ${messageName}: ${e.toString()}`
            );
            return;
          }
          const messageSender = gdjs.evtTools.p2p.getEventSender(messageName);
          if (data && messageSender) {
            const matches = heartbeastMessageRegex.exec(messageName);
            if (!matches) {
              return;
            }
            const playerNumber = parseInt(matches[1], 10);
            // Ensure we know who is who.
            _peerIdToPlayerNumber[messageSender] = playerNumber;

            // If we are not the host, save what the host told us about the pings and respond
            // with a heartbeat immediately.
            if (!gdjs.multiplayer.isPlayerHost()) {
              _playersPings = data.playersPings;
              const {
                messageName: answerMessageName,
                messageData: answerMessageData,
              } = createHeartbeatAnswerMessage({
                heartbeatSentAt: data.now, // We send back the time we received, so that the host can compute the ping.
              });
              sendDataTo(messageSender, answerMessageName, answerMessageData);
              return;
            }

            // If we are the host, compute the pings based on:
            // - the time we received the heartbeat.
            // - the time the heartbeat was sent.
            const now = getTimeNow();
            const heartbeatSentAt = data.sentAt;
            const roundTripTime = Math.round(now - heartbeatSentAt);
            const playerLastHeartbeatInfo =
              _playersLastHeartbeatInfo[playerNumber] || {};
            const playerLastRoundTripTimes =
              playerLastHeartbeatInfo.lastRoundTripTimes || [];
            playerLastRoundTripTimes.push(roundTripTime);
            if (playerLastRoundTripTimes.length > 5) {
              // Keep only the last 5 RTT to compute the average.
              playerLastRoundTripTimes.shift();
            }
            _playersLastHeartbeatInfo[playerNumber] = {
              lastRoundTripTimes: playerLastRoundTripTimes,
            };

            let sum = 0;
            for (const lastRoundTripTime of playerLastRoundTripTimes) {
              sum += lastRoundTripTime;
            }
            const averagePing = Math.round(
              sum / playerLastRoundTripTimes.length / 2 // Divide by 2 to get the one way ping.
            );
            _playersPings[playerNumber] = averagePing;
          }
        }
      });
    };

    const getPlayerPing = (playerNumber: number) => {
      if (playerNumber < 1) {
        // Player 1 is the host, so we don't need to compute the ping.
        // Any negative number is invalid.
        return 0;
      }

      return _playersPings[playerNumber] || 0;
    };

    const getCurrentPlayerPing = () => {
      const currentPlayerNumber = gdjs.multiplayer.getCurrentPlayerNumber();
      return getPlayerPing(currentPlayerNumber);
    };

    const markPlayerAsDisconnected = (playerNumber: number) => {
      logger.info(`Marking player ${playerNumber} as disconnected.`);
      _playerNumbersWhoJustLeft.push(playerNumber);

      // If Player 1 has disconnected, just end the game.
      if (playerNumber === 1) {
        logger.info('Host has disconnected, ending the game.');
        _playersLastHeartbeatInfo = {};
        _playersPings = {};
        gdjs.multiplayer.handleLobbyGameEnded();
        return;
      }

      // Remove the player from the list of players.
      // This will cause the next hearbeat to not include this player
      // and the others will consider them as disconnected.
      delete _playersLastHeartbeatInfo[playerNumber];
      delete _playersPings[playerNumber];
    };

    const handleDisconnectedPeers = (runtimeScene: RuntimeScene) => {
      // If the game is not running, we don't need to handle disconnected peers.
      if (!gdjs.multiplayer.isLobbyGameRunning()) {
        return;
      }

      // Players can disconnect if the P2P connection disconnects
      // or if we don't receive heartbeats for a while.
      const disconnectedPlayerNumbers: number[] = [];

      const disconnectedPeer = gdjs.evtTools.p2p.getDisconnectedPeer();
      if (disconnectedPeer) {
        const disconnectedPlayerNumber =
          _peerIdToPlayerNumber[disconnectedPeer];
        if (!disconnectedPlayerNumber) {
          // This should not happen.
          return;
        }
        logger.info(`Player ${disconnectedPlayerNumber} has disconnected.`);
        disconnectedPlayerNumbers.push(disconnectedPlayerNumber);
      }

      for (const playerNumber of disconnectedPlayerNumbers) {
        // When a player disconnects, as the host, we look at all the instances
        // they own and decide what to do with them.
        if (gdjs.multiplayer.isPlayerHost()) {
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

        markPlayerAsDisconnected(playerNumber);
      }
    };

    const clearDisconnectedPeers = () => {
      _playerNumbersWhoJustLeft = [];
    };

    const hasAnyPlayerLeft = () => {
      return _playerNumbersWhoJustLeft.length > 0;
    };

    const hasPlayerLeft = (playerNumber: number) => {
      return _playerNumbersWhoJustLeft.includes(playerNumber);
    };

    const getDisconnectedPlayers = () => {
      return _playerNumbersWhoJustLeft;
    };

    const getNumberOfConnectedPlayers = () => {
      // Look at the player pings as a way to know how many players are in the lobby.
      return Object.keys(_playersPings).length;
    };

    const isPlayerConnected = (playerNumber: number) => {
      return _playersPings[playerNumber] !== undefined;
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
      if (!gdjs.multiplayer.isPlayerHost()) {
        return;
      }

      const connectedPeerIds = gdjs.evtTools.p2p.getAllPeers();
      const { messageName, messageData } = createEndGameMessage();
      // Note: we don't wait for an acknowledgment here, as the game will end anyway.
      for (const peerId of connectedPeerIds) {
        sendDataTo(peerId, messageName, messageData);
      }
    };
    const handleEndGameMessages = () => {
      if (gdjs.multiplayer.isPlayerHost()) {
        // Only other players need to react to the end game message.
        return;
      }
      const p2pMessagesMap = gdjs.evtTools.p2p.getEvents();
      const messageNamesArray = Array.from(p2pMessagesMap.keys());
      const endGameMessageNames = messageNamesArray.filter(
        (messageName) => messageName === endGameMessageName
      );
      endGameMessageNames.forEach((messageName) => {
        logger.info(`Received endgame message ${messageName}.`);
        if (gdjs.evtTools.p2p.onEvent(messageName, false)) {
          _playersLastHeartbeatInfo = {};
          _playersPings = {};
          gdjs.multiplayer.handleLobbyGameEnded();
        }
      });
    };

    const updatePlayersPingsForTests = (playersPings) => {
      _playersPings = playersPings;
    };

    return {
      sendDataTo,
      // Acks.
      addExpectedMessageAcknowledgement,
      clearExpectedMessageAcknowledgements,
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
      sendCustomVariableMessage,
      hasCustomMessageBeenReceived,
      getCustomMessageData,
      getCustomVariableMessageData,
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
      // Heartbeats.
      handleHeartbeatsToSend,
      handleHeartbeatsReceived,
      // Connection/Disonnection.
      getPlayerPing,
      getCurrentPlayerPing,
      updatePlayersPingsForTests,
      handleDisconnectedPeers,
      clearDisconnectedPeers,
      hasAnyPlayerLeft,
      hasPlayerLeft,
      getDisconnectedPlayers,
      getNumberOfConnectedPlayers,
      isPlayerConnected,
      // End game.
      sendEndGameMessage,
      handleEndGameMessages,
    };
  };

  /**
   * The MultiplayerMessageManager used by the game.
   */
  export let multiplayerMessageManager = makeMultiplayerMessageManager();
}
