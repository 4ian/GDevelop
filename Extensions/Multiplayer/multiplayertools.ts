namespace gdjs {
  declare var cordova: any;

  const logger = new gdjs.Logger('Multiplayer');
  const multiplayerComponents = gdjs.multiplayerComponents;
  export namespace multiplayer {
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
    const eventRetryTime = 200; // Time to wait before retrying an event that was not acknowledged, in ms.
    const maxRetries = 4; // Maximum number of retries before giving up on an event.

    let _hasGameJustStarted = false;
    let _isGameRunning = false;
    let _hasGameJustEnded = false;
    let _lobbyId: string | null = null;
    let _connectionId: string | null = null;
    let _playerPositionInLobby: number | null = null;
    let _lobby: {
      id: string;
      name: string;
      status: string;
      players: { playerId: string; status: string }[];
    } | null = null;
    let _playerPublicProfiles: { id: string; username?: string }[] = [];

    // Communication methods.
    let _lobbiesMessageCallback: ((event: MessageEvent) => void) | null = null;
    let _websocket: WebSocket | null = null;
    let _heartbeatInterval: NodeJS.Timeout | null = null;

    let _expectedEventAcknowledgements: {
      [eventName: string]: {
        [peerId: string]: {
          acknowledged: boolean;
          lastEventSentAt: number;
          originalEventName: string;
          originalData: any;
          numberOfRetries?: number;
          shouldCancelEventIfTimesOut?: boolean;
        };
      };
    } = {};
    let _lastClockReceivedByInstance: { [instanceId: string]: number } = {};

    export const addExpectedEventAcknowledgement = ({
      originalEventName,
      originalData,
      expectedEventName,
      otherPeerIds,
      shouldCancelEventIfTimesOut,
    }: {
      originalEventName: string;
      originalData: any;
      expectedEventName: string;
      otherPeerIds: string[];
      shouldCancelEventIfTimesOut?: boolean;
    }) => {
      if (!_isGameRunning) {
        // This can happen if objects are destroyed at the end of the scene.
        // We should not add expected events in this case.
        return;
      }

      if (!_expectedEventAcknowledgements[expectedEventName]) {
        _expectedEventAcknowledgements[expectedEventName] = {};
      }

      logger.info(
        `Adding expected event ${expectedEventName} from ${otherPeerIds.join(
          ', '
        )}.`
      );

      otherPeerIds.forEach((peerId) => {
        _expectedEventAcknowledgements[expectedEventName][peerId] = {
          acknowledged: false,
          lastEventSentAt: getTimeNow(),
          originalEventName,
          originalData,
          shouldCancelEventIfTimesOut,
        };
      });
    };

    /**
     * Main function to send events to other players, via P2P.
     * Takes into account the simulation of network latency and packet loss.
     */
    export const sendDataTo = (
      peerId: string,
      eventName: string,
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
          gdjs.evtTools.p2p.sendDataTo(peerId, eventName, JSON.stringify(data));
        }, SIMULATE_NETWORK_RANDOM_LATENCY_MS);
        return;
      }

      if (SIMULATE_NETWORK_LATENCY_MS > 0) {
        setTimeout(() => {
          gdjs.evtTools.p2p.sendDataTo(peerId, eventName, JSON.stringify(data));
        }, SIMULATE_NETWORK_LATENCY_MS);
        return;
      }

      gdjs.evtTools.p2p.sendDataTo(peerId, eventName, JSON.stringify(data));
    };

    /**
     * Main function to send events to all other players, via P2P.
     * Takes into account the simulation of network latency and packet loss.
     */
    export const sendDataToAll = (eventName: string, data: Object): void => {
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
          gdjs.evtTools.p2p.sendDataToAll(eventName, JSON.stringify(data));
        }, SIMULATE_NETWORK_RANDOM_LATENCY_MS);
        return;
      }

      if (SIMULATE_NETWORK_LATENCY_MS > 0) {
        setTimeout(() => {
          gdjs.evtTools.p2p.sendDataToAll(eventName, JSON.stringify(data));
        }, SIMULATE_NETWORK_LATENCY_MS);
        return;
      }

      gdjs.evtTools.p2p.sendDataToAll(eventName, JSON.stringify(data));
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
        logger.info(
          'instance not found with network ID, trying to find it with persistent UUID.'
        );
        instance =
          instances.find(
            (instance) =>
              // For objects created from the start, the network ID is not set yet.
              instance.persistentUuid &&
              instance.persistentUuid.substring(0, 8) === instanceNetworkId
          ) || null;

        if (instance) {
          // Set the network ID, as it was not set yet.
          instance.networkId = instanceNetworkId;
        }
      }

      // If we know the position of the object, we can try to find the closest instance not synchronized yet.
      if (!instance && instanceX !== undefined && instanceY !== undefined) {
        logger.info(
          `instance not found with network ID, trying to find it with position ${instanceX}/${instanceY}.`
        );
        // Instance not found, it must be a new object.
        // 2 cases :
        // - The object was only created on the other player's game, so we create it and assign it the network ID.
        // - The object may have been created on all sides at the same time, so we try to find instances
        //   of this object, that do not have a network ID yet, pick the one that is the closest to the
        //   position of the object created by the other player, and assign it the network ID to start
        //   synchronizing it.

        // Find all instances that have the MultiplayerObjectRuntimeBehavior and no network ID yet.
        const instancesWithoutNetworkId = instances.filter(
          (instance) =>
            instance.hasBehavior('MultiplayerObject') && !instance.networkId
        );
        if (instancesWithoutNetworkId.length > 0) {
          // Find the instance that is the closest to the position of the object created by the other player.
          const closestInstance = instancesWithoutNetworkId.reduce(
            (closestInstance, instance) => {
              const dx = instance.getX() - instanceX;
              const dy = instance.getY() - instanceY;
              const distance = dx * dx + dy * dy;
              if (distance < closestInstance.distance) {
                return { instance, distance };
              }
              return closestInstance;
            },
            {
              instance: instancesWithoutNetworkId[0],
              distance: Infinity,
            }
          ).instance;

          instance = closestInstance;
        }
      }

      // If we still did not find the instance, and we should create it if not found, then create it.
      if (!instance && shouldCreateIfNotFound) {
        logger.info('instance not found, creating it.');
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

    gdjs.registerRuntimeScenePreEventsCallback(
      (runtimeScene: gdjs.RuntimeScene) => {
        const p2pEventsMap = gdjs.evtTools.p2p.getEvents();
        const objectEventNamesArray = Array.from(p2pEventsMap.keys());

        // When we receive ownership change events, update the ownership of the objects in the scene.
        const objectOwnershipChangeEventNames = objectEventNamesArray.filter(
          (eventName) => eventName.startsWith('#changeOwner')
        );
        objectOwnershipChangeEventNames.forEach((eventName) => {
          if (gdjs.evtTools.p2p.onEvent(eventName, false)) {
            const data = JSON.parse(gdjs.evtTools.p2p.getEventData(eventName));
            logger.info(`Received event ${eventName} with data ${data}.`);
            if (data) {
              const eventSender = gdjs.evtTools.p2p.getEventSender(eventName);
              // event name is like #changeOwner#owner_abc#object_abc#instance_abc, extract owner, object and instance id.
              const regex =
                /#changeOwner#owner_(\d+)#object_(.+)#instance_(.+)/;
              const matches = regex.exec(eventName);
              if (!matches) {
                return;
              }
              const objectName = matches[2];
              const instanceNetworkId = matches[3];
              const previousOwner = data.previousOwner;
              const newOwner = data.newOwner;

              const instance = getInstanceFromNetworkId({
                runtimeScene,
                objectName,
                instanceNetworkId,
                instanceX: data.instanceX,
                instanceY: data.instanceY,
                shouldCreateIfNotFound: true,
              });

              if (!instance) {
                // Instance not found, it must have been destroyed already.
                logger.info(
                  `Instance ${instanceNetworkId} not found, it must have been destroyed.`
                );
                return;
              }

              const behavior = instance.getBehavior(
                'MultiplayerObject'
              ) as MultiplayerObjectRuntimeBehavior | null;
              if (!behavior) {
                logger.warn(
                  `Object ${objectName} does not have the MultiplayerObjectBehavior, cannot change ownership.`
                );
                return;
              }

              const isPlayerTheServer = _playerPositionInLobby === 1;
              const currentPlayerObjectOwnership =
                behavior.getPlayerObjectOwnership();
              if (
                isPlayerTheServer &&
                currentPlayerObjectOwnership !== previousOwner
              ) {
                // We received an ownership change event for an object which thought the previous owner was different.
                // There may be some lag, and multiple ownership changes may have been sent by the other players.
                // As the server, let's not change the ownership and let the player revert it.
                logger.warn(
                  `Object ${objectName} with instance network ID ${instanceNetworkId} does not have the expected previous owner. Expected ${previousOwner}, got ${currentPlayerObjectOwnership}.`
                );
                return;
              }

              // Force the ownership change.
              logger.info(
                `Changing ownership of object ${objectName} to ${newOwner}.`
              );
              behavior._playerNumber = newOwner;

              const ownerChangedEventName = eventName.replace(
                '#changeOwner',
                '#ownerChanged'
              );

              logger.info(
                `Sending acknowledgment of ownership change of object ${objectName} with instance network ID ${instanceNetworkId} to ${eventSender}.`
              );
              // Once the object ownership has changed, we need to acknowledge it to the player who sent this event.
              sendDataTo(eventSender, ownerChangedEventName, {});

              // If we are player number 1, we are the server,
              // so we need to relay the ownership change to others,
              // and expect an acknowledgment from them.
              if (_playerPositionInLobby === 1) {
                const otherPeerIds = gdjs.evtTools.p2p.getAllPeers();
                gdjs.multiplayer.addExpectedEventAcknowledgement({
                  originalEventName: eventName,
                  originalData: data,
                  expectedEventName: ownerChangedEventName,
                  otherPeerIds,
                  // As we are the server, we do not cancel the event if it times out.
                  shouldCancelEventIfTimesOut: false,
                });
                for (const peerId of otherPeerIds) {
                  logger.info(
                    `Relaying ownership change of object ${objectName} with instance network ID ${instanceNetworkId} to ${peerId}.`
                  );
                  sendDataTo(peerId, eventName, data);
                }
              }
            }
          }
        });

        // When we receive update events, update the objects in the scene.
        const objectUpdateEventNames = objectEventNamesArray.filter(
          (eventName) => eventName.startsWith('#update')
        );
        objectUpdateEventNames.forEach((eventName) => {
          if (gdjs.evtTools.p2p.onEvent(eventName, true)) {
            const data = JSON.parse(gdjs.evtTools.p2p.getEventData(eventName));
            if (data) {
              // event name is like #update#owner_abc#object_abc#instance_abc, extract owner, object and instance id.
              const regex = /#update#owner_(\d+)#object_(.+)#instance_(.+)/;
              const matches = regex.exec(eventName);
              if (!matches) {
                return;
              }
              const ownerPlayerNumber = parseInt(matches[1], 10);
              if (ownerPlayerNumber === _playerPositionInLobby) {
                // Do not update the object if we receive an event from ourselves.
                return;
              }
              const objectName = matches[2];
              const instanceNetworkId = matches[3];

              const eventInstanceClock = data['_clock'];
              const lastClock =
                _lastClockReceivedByInstance[instanceNetworkId] || 0;
              if (eventInstanceClock <= lastClock) {
                // Ignore old events.
                logger.info('Ignoring old event.');
                return;
              }

              const instance = getInstanceFromNetworkId({
                runtimeScene,
                objectName,
                instanceNetworkId,
                // This can happen if the object was created on the other player's game, and we need to create it.
                shouldCreateIfNotFound: true,
              });
              if (!instance) {
                // This should not happen as we should have created the instance if it did not exist.
                return;
              }

              // If the instance update is not done by the owner of the object, then something is wrong.
              // We should not update the object until we've received the ownership change event.
              const behavior = instance.getBehavior(
                'MultiplayerObject'
              ) as MultiplayerObjectRuntimeBehavior | null;
              if (!behavior) {
                logger.warn(
                  `Object ${objectName} does not have the MultiplayerObjectBehavior, cannot update it.`
                );
                // Object does not have the MultiplayerObjectBehavior, cannot update it.
                return;
              }

              if (behavior.getPlayerObjectOwnership() !== ownerPlayerNumber) {
                // The object is not owned by the player who sent the update event.
                logger.info(
                  `Object ${objectName} with instance network ID ${instanceNetworkId} is not owned by the player who sent the update event. Expected ${behavior.getPlayerObjectOwnership()}, got ${ownerPlayerNumber}.`
                );
                return;
              }

              instance.updateFromObjectNetworkSyncData(data);
              _lastClockReceivedByInstance[instanceNetworkId] =
                eventInstanceClock;

              // If we are player number 1, we are the server,
              // so we need to relay the position to others.
              if (_playerPositionInLobby === 1) {
                sendDataToAll(eventName, data);
              }
            }
          }
        });

        // When we receive acknowledgement events, save it in the extension, to avoid sending the event again.
        const acknowledgedEventNames = objectEventNamesArray.filter(
          (eventName) =>
            eventName.startsWith('#destroyed') ||
            eventName.startsWith('#ownerChanged')
        );
        acknowledgedEventNames.forEach((eventName) => {
          if (gdjs.evtTools.p2p.onEvent(eventName, false)) {
            logger.info(`Received acknowledgment for event ${eventName}.`);
            const event = gdjs.evtTools.p2p.getEvent(eventName);
            let data;
            while ((data = event.getData())) {
              const eventSender = event.getSender();
              // event name is like #destroyed#owner_abc#object_abc#instance_abc, extract owner, object and instance names.
              const regex = eventName.startsWith('#destroyed')
                ? /#destroyed#owner_(\d+)#object_(.+)#instance_(.+)/
                : /#ownerChanged#owner_(\d+)#object_(.+)#instance_(.+)/;
              const matches = regex.exec(eventName);
              if (!matches) {
                // This should not happen.
                event.popData();
                return;
              }
              if (!_expectedEventAcknowledgements[eventName]) {
                // This should not happen, but if we receive an acknowledgment for an event we did not expect, let's not error
                // and just clear that event.
                event.popData();
                return;
              }
              if (!_expectedEventAcknowledgements[eventName][eventSender]) {
                // This should not happen, but if we receive an acknowledgment from a sender we did not expect, let's not error
                // and just clear that event.
                event.popData();
                return;
              }
              const instanceId = matches[3];

              const eventInstanceClock = data['_clock'];
              const lastClock = _lastClockReceivedByInstance[instanceId] || 0;
              if (eventInstanceClock <= lastClock) {
                // Ignore old events.
                logger.info('Ignoring old event.');
                return;
              }

              logger.info(
                `Marking event ${eventName} as acknowledged from ${eventSender}.`
              );
              // Mark the acknowledgment as received.
              _expectedEventAcknowledgements[eventName][
                eventSender
              ].acknowledged = true;
              _lastClockReceivedByInstance[instanceId] = eventInstanceClock;

              // We've received this acknowledgement from this sender, remove it from the list
              // so that the next getSender() will return the next sender.
              event.popData();
            }
          }
        });

        // When all acknowledgments are received for an event, we can clear the event from our
        // list of expected acknowledgments.
        const expectedEventNames = Object.keys(_expectedEventAcknowledgements);
        expectedEventNames.forEach((acknowledgeEventName) => {
          const acknowledgements =
            _expectedEventAcknowledgements[acknowledgeEventName];
          const peerWhoHaventAcknowledged = Object.keys(
            acknowledgements
          ).filter((peerId) => !acknowledgements[peerId].acknowledged);
          if (!peerWhoHaventAcknowledged.length) {
            // All peers have acknowledged this event, we can clear the object.
            logger.info(
              `All peers have acknowledged event ${acknowledgeEventName}.`
            );
            delete _expectedEventAcknowledgements[acknowledgeEventName];
          } else {
            // Some peers have not acknowledged the event, let's resend it to them.
            for (const peerId of peerWhoHaventAcknowledged) {
              const lastEventSentAt = acknowledgements[peerId].lastEventSentAt;
              const originalEventName =
                acknowledgements[peerId].originalEventName;
              const originalData = acknowledgements[peerId].originalData;
              if (getTimeNow() - lastEventSentAt > eventRetryTime) {
                const currentNumberOfRetries =
                  acknowledgements[peerId].numberOfRetries || 0;
                if (currentNumberOfRetries >= maxRetries) {
                  // We have retried too many times, let's give up.
                  logger.info(
                    `Giving up on event ${acknowledgeEventName} for ${peerId}.`
                  );
                  if (acknowledgements[peerId].shouldCancelEventIfTimesOut) {
                    // If we should cancel the event if it times out, then revert it based on the original event.
                    if (originalEventName.startsWith('#changeOwner')) {
                      const regex =
                        /#changeOwner#owner_(\d+)#object_(.+)#instance_(.+)/;
                      const matches = regex.exec(originalEventName);
                      if (!matches) {
                        // This should not happen, if it does, remove the acknowledgment and return.
                        delete _expectedEventAcknowledgements[
                          acknowledgeEventName
                        ];
                        return;
                      }
                      const objectName = matches[2];
                      const instanceNetworkId = matches[3];
                      const instances = runtimeScene.getInstancesOf(objectName);
                      if (!instances) {
                        // object does not exist in the scene, cannot revert ownership.
                        delete _expectedEventAcknowledgements[
                          acknowledgeEventName
                        ];
                        return;
                      }
                      let instance = instances.find(
                        (instance) => instance.networkId === instanceNetworkId
                      );
                      if (!instance) {
                        // Instance not found, it must have been destroyed already, cannot revert ownership.
                        // Should we recreate it?
                        delete _expectedEventAcknowledgements[
                          acknowledgeEventName
                        ];
                        return;
                      }

                      const behavior = instance.getBehavior(
                        'MultiplayerObject'
                      ) as MultiplayerObjectRuntimeBehavior | null;
                      if (!behavior) {
                        logger.warn(
                          `Object ${objectName} does not have the MultiplayerObjectBehavior, cannot revert ownership.`
                        );
                        // Object does not have the MultiplayerObjectBehavior, cannot revert ownership.
                        delete _expectedEventAcknowledgements[
                          acknowledgeEventName
                        ];
                        return;
                      }

                      const previousOwner = originalData.previousOwner;
                      if (!previousOwner) {
                        // No previous owner, cannot revert ownership.
                        delete _expectedEventAcknowledgements[
                          acknowledgeEventName
                        ];
                        return;
                      }

                      // Force the ownership change.
                      behavior._playerNumber = previousOwner || 0;
                    }
                  }
                  delete _expectedEventAcknowledgements[acknowledgeEventName];
                  continue;
                }

                // We have waited long enough for the acknowledgment, let's resend the event.
                sendDataTo(peerId, originalEventName, originalData);
                // Reset the timestamp so that we wait again for the acknowledgment.
                acknowledgements[peerId].lastEventSentAt = getTimeNow();
                // Increment the number of retries.
                acknowledgements[peerId].numberOfRetries =
                  currentNumberOfRetries + 1;
              }
            }
          }
        });
      }
    );

    gdjs.registerRuntimeScenePostEventsCallback(
      (runtimeScene: gdjs.RuntimeScene) => {
        const p2pEventsMap = gdjs.evtTools.p2p.getEvents();
        const objectEventNamesArray = Array.from(p2pEventsMap.keys());
        const objectDestroyEventNames = objectEventNamesArray.filter(
          (eventName) => eventName.startsWith('#destroy')
        );
        objectDestroyEventNames.forEach((eventName) => {
          if (gdjs.evtTools.p2p.onEvent(eventName, false)) {
            const data = JSON.parse(gdjs.evtTools.p2p.getEventData(eventName));
            const eventSender = gdjs.evtTools.p2p.getEventSender(eventName);
            if (data && eventSender) {
              // event name is like #destroy#owner_abc#object_abc#instance_abc, extract owner, object and instance names.
              const regex = /#destroy#owner_(\d+)#object_(.+)#instance_(.+)/;
              const matches = regex.exec(eventName);
              if (!matches) {
                return;
              }
              const playerNumber = parseInt(matches[1], 10);
              if (playerNumber === _playerPositionInLobby) {
                // Do not destroy the object if we receive an event from ourselves.
                // Should probably never happen.
                return;
              }
              const objectName = matches[2];
              const instanceNetworkId = matches[3];

              const eventInstanceClock = data['_clock'];
              const lastClock =
                _lastClockReceivedByInstance[instanceNetworkId] || 0;
              if (eventInstanceClock <= lastClock) {
                // Ignore old events.
                logger.info('Ignoring old event.');
                return;
              }

              const instance = getInstanceFromNetworkId({
                runtimeScene,
                objectName,
                instanceNetworkId,
              });

              const destroyedEventName = eventName.replace(
                '#destroy',
                '#destroyed'
              );

              if (!instance) {
                logger.info(
                  'Instance was not found in the scene, sending acknowledgment anyway.'
                );
                // Instance not found, it must have been destroyed already.
                // Send an acknowledgment to the player who sent the destroy event in case they missed it.
                sendDataTo(eventSender, destroyedEventName, {});
                return;
              }

              logger.info(
                `Destroying object ${objectName} with instance network ID ${instanceNetworkId}.`
              );
              instance.deleteFromScene(runtimeScene);
              _lastClockReceivedByInstance[instanceNetworkId] =
                eventInstanceClock;

              logger.info(
                `Sending acknowledgment of destruction of object ${objectName} with instance network ID ${instanceNetworkId} to ${eventSender}.`
              );
              // Once the object is destroyed, we need to acknowledge it to the player who sent the destroy event.
              sendDataTo(eventSender, destroyedEventName, {});

              // If we are player number 1, we need to relay the destruction to others.
              // And expect an acknowledgment from everyone else as well.
              if (_playerPositionInLobby === 1) {
                const connectedPeerIds = gdjs.evtTools.p2p.getAllPeers();
                // We don't need to send the event to the player who sent the destroy event.
                const otherPeerIds = connectedPeerIds.filter(
                  (peerId) => peerId !== eventSender
                );
                gdjs.multiplayer.addExpectedEventAcknowledgement({
                  originalEventName: eventName,
                  originalData: data,
                  expectedEventName: destroyedEventName,
                  otherPeerIds,
                });
                for (const peerId of otherPeerIds) {
                  logger.info(
                    `Relaying destruction of object ${objectName} with instance network ID ${instanceNetworkId} to ${peerId}.`
                  );
                  sendDataTo(peerId, eventName, data);
                }
              }
            }
          }
        });
      }
    );

    // Ensure that the condition "game just started" (or ended) is valid only for one frame.
    gdjs.registerRuntimeScenePostEventsCallback(() => {
      _hasGameJustStarted = false;
      _hasGameJustEnded = false;
    });

    const getLobbiesWindowUrl = ({
      runtimeGame,
      gameId,
    }: {
      runtimeGame: gdjs.RuntimeGame;
      gameId: string;
    }) => {
      // Uncomment to test the case of a failing loading:
      // return 'https://gd.games.wronglink';

      const isDev = runtimeGame.isUsingGDevelopDevelopmentEnvironment();
      // const baseUrl = "https://gd.games";
      // Uncomment to test locally:
      const baseUrl = 'http://localhost:4000';

      const url = new URL(
        `${baseUrl}/games/${gameId}/lobbies${_lobbyId ? `/${_lobbyId}` : ''}`
      );

      if (isDev) {
        url.searchParams.set('dev', 'true');
      }
      if (_connectionId) {
        url.searchParams.set('connectionId', _connectionId);
      }
      if (_playerPositionInLobby) {
        url.searchParams.set(
          'positionInLobby',
          _playerPositionInLobby.toString()
        );
      }
      const playerId = gdjs.playerAuthentication.getUserId();
      if (playerId) {
        url.searchParams.set('playerId', playerId);
      }
      const playerToken = gdjs.playerAuthentication.getUserToken();
      if (playerToken) {
        url.searchParams.set('playerToken', playerToken);
      }

      return url.toString();
    };

    /**
     * Returns true if the game has just started,
     * useful to switch to the game scene.
     */
    export const hasGameJustStarted = () => _hasGameJustStarted;

    /**
     * Returns true if the game has just ended,
     * useful to switch back to to the main menu.
     */
    export const hasGameJustEnded = () => _hasGameJustEnded;

    /**
     * Returns true if the player is connected to a lobby, false otherwise.
     */
    export const isConnectedToLobby = () => !!_connectionId;

    /**
     * Returns the number of players in the lobby.
     */
    export const getNumberOfPlayersInLobby = () => {
      if (!_lobby) {
        return 0;
      }
      return _lobby.players.length;
    };

    /**
     * Returns the position of the current player in the lobby.
     * Return 0 if the player is not in the lobby.
     * Returns 1, 2, 3, ... if the player is in the lobby.
     */
    export const getCurrentPlayerPositionInLobby = () => {
      return _playerPositionInLobby || 0;
    };

    /**
     * Returns the player ID of the player at the given position in the lobby.
     * The position is shifted by one, so that the first player has position 1.
     */
    export const getPlayerId = (position: number) => {
      if (!_lobby) {
        return '';
      }
      const index = position - 1;
      if (index < 0 || index >= _lobby.players.length) {
        return '';
      }
      return _lobby.players[index].playerId;
    };

    /**
     * Returns the player ID of the player at the given position in the lobby.
     * The position is shifted by one, so that the first player has position 1.
     */
    export const getPlayerUsername = (position: number) => {
      const playerId = getPlayerId(position);
      if (!playerId) {
        return '';
      }

      const playerPublicProfile = _playerPublicProfiles.find(
        (profile) => profile.id === playerId
      );

      return playerPublicProfile
        ? playerPublicProfile.username
        : `Player ${position}`;
    };

    /**
     * Returns true if the game is registered, false otherwise.
     * Useful to display a message to the user to register the game before logging in.
     */
    const checkIfGameIsRegistered = (
      runtimeGame: gdjs.RuntimeGame,
      gameId: string,
      tries: number = 0
    ): Promise<boolean> => {
      const rootApi = runtimeGame.isUsingGDevelopDevelopmentEnvironment()
        ? 'https://api-dev.gdevelop.io'
        : 'https://api.gdevelop.io';
      const url = `${rootApi}/game/public-game/${gameId}`;
      return fetch(url, { method: 'HEAD' }).then(
        (response) => {
          if (response.status !== 200) {
            logger.warn(
              `Error while fetching the game: ${response.status} ${response.statusText}`
            );

            // If the response is not 404, it may be a timeout, so retry a few times.
            if (response.status === 404 || tries > 2) {
              return false;
            }

            return checkIfGameIsRegistered(runtimeGame, gameId, tries + 1);
          }
          return true;
        },
        (err) => {
          logger.error('Error while fetching game:', err);
          return false;
        }
      );
    };

    const getUserPublicProfile = async (
      userId: string,
      isDev: boolean
    ): Promise<{ id: string; username?: string }> => {
      const rootApi = isDev
        ? 'https://api-dev.gdevelop.io'
        : 'https://api.gdevelop.io';
      const url = `${rootApi}/user/user-public-profile/${userId}`;
      const response = await fetch(url);
      return response.json();
    };

    const updatePlayerPublicProfiles = async (isDev: boolean) => {
      if (!_lobby) {
        return;
      }

      const playerIds = _lobby.players.map((player) => player.playerId);
      const currentPlayerPublicProfileIds = _playerPublicProfiles.map(
        (profile) => profile.id
      );
      const addedPlayerIds = playerIds.filter(
        (id) => !currentPlayerPublicProfileIds.includes(id)
      );
      const removedPlayerIds = currentPlayerPublicProfileIds.filter(
        (id) => !playerIds.includes(id)
      );
      if (addedPlayerIds.length === 0 && removedPlayerIds.length === 0) {
        return;
      }

      if (addedPlayerIds.length > 0) {
        const addedPlayerPublicProfiles = await Promise.all(
          addedPlayerIds.map(async (id) => {
            const userPublicProfile = await getUserPublicProfile(id, isDev);
            return userPublicProfile;
          })
        );

        _playerPublicProfiles = [
          ..._playerPublicProfiles,
          ...addedPlayerPublicProfiles,
        ];
      }

      if (removedPlayerIds.length > 0) {
        const updatedPlayerPublicProfiles = _playerPublicProfiles.filter(
          (profile) => !removedPlayerIds.includes(profile.id)
        );

        _playerPublicProfiles = updatedPlayerPublicProfiles;
      }
    };

    const handleLobbyJoinEvent = function (
      runtimeScene: gdjs.RuntimeScene,
      lobbyId: string
    ) {
      if (_connectionId) {
        logger.info('Already connected to a lobby.');
        return;
      }

      if (_websocket) {
        logger.warn('Already connected to a lobby. Closing the previous one.');
        _websocket.close();
        _connectionId = null;
        _playerPositionInLobby = null;
        _lobbyId = null;
        _lobby = null;
        _websocket = null;
      }

      const gameId = gdjs.projectData.properties.projectUuid;
      const playerId = gdjs.playerAuthentication.getUserId();
      const playerToken = gdjs.playerAuthentication.getUserToken();
      if (!gameId) {
        logger.error('Cannot open lobbies if the project has no ID.');
        return;
      }
      if (!playerId || !playerToken) {
        logger.warn('Cannot open lobbies if the player is not connected.');
        return;
      }
      const wsPlayApi = runtimeScene
        .getGame()
        .isUsingGDevelopDevelopmentEnvironment()
        ? 'wss://api-ws-dev.gdevelop.io/play'
        : 'wss://api-ws.gdevelop.io/play';

      const wsUrl = new URL(wsPlayApi);
      wsUrl.searchParams.set('gameId', gameId);
      wsUrl.searchParams.set('lobbyId', lobbyId);
      wsUrl.searchParams.set('playerId', playerId);
      wsUrl.searchParams.set('connectionType', 'lobby');
      wsUrl.searchParams.set('playerGameToken', playerToken);
      _websocket = new WebSocket(wsUrl.toString());
      _websocket.onopen = () => {
        logger.info('Connected to the lobby.');
        // Register a heartbeat to keep the connection alive.
        _heartbeatInterval = setInterval(() => {
          if (_websocket) {
            logger.info('Heartbeat sent to keep connection alive.');
            _websocket.send(
              JSON.stringify({
                action: 'heartbeat',
                connectionType: 'lobby',
              })
            );
          }
        }, 10000);

        // When socket is open, ask for the connectionId, so that we can inform the lobbies window.
        if (_websocket) {
          _websocket.send(JSON.stringify({ action: 'getConnectionId' }));
        }
      };
      _websocket.onmessage = (event) => {
        logger.info('Message from the lobby:', event.data);
        if (event.data) {
          const messageContent = JSON.parse(event.data);
          switch (messageContent.type) {
            case 'connectionId': {
              const messageData = messageContent.data;
              const connectionId = messageData.connectionId;
              const positionInLobby = messageData.positionInLobby;

              if (!connectionId || !positionInLobby) {
                logger.error('No connectionId or position received');
                return;
              }

              handleConnectionIdReceived({
                runtimeScene,
                connectionId,
                positionInLobby,
                lobbyId,
                playerId,
                playerToken,
              });
              break;
            }
            case 'lobbyUpdated': {
              const messageData = messageContent.data;
              const lobby = messageData.lobby;
              const positionInLobby = messageData.positionInLobby;
              if (!lobby) {
                logger.error('No lobby received');
                return;
              }
              handleLobbyUpdatedEvent(runtimeScene, lobby, positionInLobby);
              break;
            }
            case 'gameCountdownStarted': {
              handleGameCountdownStartedEvent(runtimeScene);
              break;
            }
            case 'gameStarted': {
              handleGameStartedEvent(runtimeScene);
              break;
            }
            case 'gameEnded': {
              handleGameEndedEvent(runtimeScene);
              break;
            }
            case 'peerId': {
              const messageData = messageContent.data;
              if (!messageData) {
                logger.error('No message received');
                return;
              }
              const peerId = messageData.peerId;
              if (!peerId) {
                logger.error('Malformed message received');
                return;
              }

              handlePeerIdEvent(peerId);
              break;
            }
          }
        }
      };
      _websocket.onclose = () => {
        logger.info('Disconnected from the lobby.');

        const lobbiesIframe =
          multiplayerComponents.getLobbiesIframe(runtimeScene);

        if (!lobbiesIframe || !lobbiesIframe.contentWindow) {
          logger.error(
            'The lobbies iframe is not opened, cannot send the join message.'
          );
          return;
        }

        if (!lobbiesIframe || !lobbiesIframe.contentWindow) {
          logger.error(
            'The lobbies iframe is not opened, cannot send the join message.'
          );
          return;
        }

        // Tell the Lobbies iframe that the lobby has been left.
        lobbiesIframe.contentWindow.postMessage(
          {
            id: 'lobbyLeft',
          },
          '*' // We could restrict to GDevelop games platform but it's not necessary as the message is not sensitive, and it allows easy debugging.
        );
        _connectionId = null;
        _playerPositionInLobby = null;
        _lobbyId = null;
        _lobby = null;
        _websocket = null;
        if (_heartbeatInterval) {
          clearInterval(_heartbeatInterval);
        }
      };
    };

    const handleConnectionIdReceived = function ({
      runtimeScene,
      connectionId,
      positionInLobby,
      lobbyId,
      playerId,
      playerToken,
    }: {
      runtimeScene: gdjs.RuntimeScene;
      connectionId: string;
      positionInLobby: number;
      lobbyId: string;
      playerId: string;
      playerToken: string;
    }) {
      // When the connectionId is received, initialise PeerJS so players can connect to each others afterwards.
      gdjs.evtTools.p2p.useDefaultBrokerServer();

      _connectionId = connectionId;
      _playerPositionInLobby = positionInLobby;
      // We save the lobbyId here as this is the moment when the player is really connected to the lobby.
      _lobbyId = lobbyId;

      // Then we inform the lobbies window that the player has joined.
      const lobbiesIframe =
        multiplayerComponents.getLobbiesIframe(runtimeScene);

      if (!lobbiesIframe || !lobbiesIframe.contentWindow) {
        logger.error(
          'The lobbies iframe is not opened, cannot send the join message.'
        );
        return;
      }

      lobbiesIframe.contentWindow.postMessage(
        {
          id: 'lobbyJoined',
          lobbyId,
          playerId,
          playerToken,
          connectionId: _connectionId,
          positionInLobby,
        },
        // Specify the origin to avoid leaking the playerToken.
        // Replace with '*' to test locally.
        // 'https://gd.games'
        '*'
      );
    };

    const handleLobbyLeaveEvent = function () {
      if (_websocket) {
        _websocket.close();
      }
      _connectionId = null;
      _playerPositionInLobby = null;
      _lobbyId = null;
      _lobby = null;
      _websocket = null;
    };

    const handleLobbyUpdatedEvent = function (
      runtimeScene: gdjs.RuntimeScene,
      lobby,
      positionInLobby: number
    ) {
      // Update the object representing the lobby in the extension.
      _lobby = lobby;

      // Update the profiles so we can use the usernames of the players.
      const isDev = runtimeScene
        .getGame()
        .isUsingGDevelopDevelopmentEnvironment();
      updatePlayerPublicProfiles(isDev);

      // If the lobby is playing, do not update the player position as it's probably a player leaving,
      // and we don't want to affect the game.
      if (lobby.status === 'playing') {
        return;
      }

      _playerPositionInLobby = positionInLobby;

      // If the player is in the lobby, tell the lobbies window that the lobby has been updated,
      // as well as the player position.
      const lobbiesIframe =
        multiplayerComponents.getLobbiesIframe(runtimeScene);

      if (!lobbiesIframe || !lobbiesIframe.contentWindow) {
        logger.info('The lobbies iframe is not opened, not sending message.');
        return;
      }

      lobbiesIframe.contentWindow.postMessage(
        {
          id: 'lobbyUpdated',
          positionInLobby,
        },
        '*' // We could restrict to GDevelop games platform but it's not necessary as the message is not sensitive, and it allows easy debugging.
      );
    };

    const handleGameCountdownStartedEvent = function (
      runtimeScene: gdjs.RuntimeScene
    ) {
      // When the countdown starts, if we are player number 1, then send the peerId to others so they can connect via P2P.
      if (getCurrentPlayerPositionInLobby() === 1) {
        sendPeerId();
      }

      // Just pass along the message to the iframe so that it can display the countdown.
      const lobbiesIframe =
        multiplayerComponents.getLobbiesIframe(runtimeScene);

      if (!lobbiesIframe || !lobbiesIframe.contentWindow) {
        logger.info('The lobbies iframe is not opened, not sending message.');
        return;
      }

      lobbiesIframe.contentWindow.postMessage(
        {
          id: 'gameCountdownStarted',
        },
        '*' // We could restrict to GDevelop games platform but it's not necessary as the message is not sensitive, and it allows easy debugging.
      );

      // Prevent the player from leaving the lobby while the game is starting.
      multiplayerComponents.hideLobbiesCloseArrow(runtimeScene);
    };

    /**
     * When the game receives the information that the game has started, close the
     * lobbies window, focus on the game, and set the flag to true.
     */
    const handleGameStartedEvent = function (runtimeScene: gdjs.RuntimeScene) {
      _hasGameJustStarted = true;
      _isGameRunning = true;
      removeLobbiesContainer(runtimeScene);
      focusOnGame(runtimeScene);
    };

    /**
     * When the game receives the information that the game has ended, set the flag to true,
     * so that the game can switch back to the main menu for instance.
     */
    const handleGameEndedEvent = function (runtimeScene: gdjs.RuntimeScene) {
      _hasGameJustEnded = true;
      _isGameRunning = false;

      // Clear the expected acknowledgments, as the game is ending.
      _expectedEventAcknowledgements = {};
    };

    /**
     * When the game receives the information of the peerId, then
     * the player can connect to the peer.
     */
    const handlePeerIdEvent = function (peerId: string) {
      // When a peerId is received, trigger a P2P connection with the peer.
      const currentPeerId = gdjs.evtTools.p2p.getCurrentId();
      if (!currentPeerId) {
        logger.error(
          'No peerId found, the player does not seem connected to the broker server.'
        );
        return;
      }

      if (currentPeerId === peerId) {
        logger.info('Received our own peerId, ignoring.');
        return;
      }

      gdjs.evtTools.p2p.connect(peerId);
    };

    /**
     * When the game receives a start countdown message from the lobby, just send it to all
     * players in the lobby via the websocket.
     * It will then trigger an event from the websocket to all players in the lobby.
     */
    const handleGameCountdownStartMessage = function (
      runtimeScene: gdjs.RuntimeScene
    ) {
      if (!_websocket) {
        logger.error(
          'No connection to send the start countdown message. Are you connected to a lobby?'
        );
        return;
      }

      _websocket.send(
        JSON.stringify({
          action: 'startGameCountdown',
          connectionType: 'lobby',
        })
      );
    };

    /**
     * When the game receives a start game message from the lobby, just send it to all
     * players in the lobby via the websocket.
     * It will then trigger an event from the websocket to all players in the lobby.
     */
    const handleGameStartMessage = function () {
      if (!_websocket) {
        logger.error(
          'No connection to send the start countdown message. Are you connected to a lobby?'
        );
        return;
      }

      _websocket.send(
        JSON.stringify({
          action: 'startGame',
          connectionType: 'lobby',
        })
      );
    };

    /**
     * Action to end the lobby game.
     * This will update the lobby status and inform everyone in the lobby that the game has ended.
     */
    export const endLobbyGame = function () {
      if (!_websocket) {
        logger.error(
          'No connection to send the end game message. Are you connected to a lobby?'
        );
        return;
      }

      _websocket.send(
        JSON.stringify({
          action: 'endGame',
          connectionType: 'lobby',
        })
      );
    };

    /**
     * Helper to send the ID from PeerJS to the lobby players.
     */
    const sendPeerId = function () {
      if (!_websocket || !_lobby) {
        logger.error(
          'No connection to send the message. Are you connected to a lobby?'
        );
        return;
      }

      const peerId = gdjs.evtTools.p2p.getCurrentId();
      if (!peerId) {
        logger.error(
          "No peerId found, the player doesn't seem connected to the broker server."
        );
        return;
      }

      _websocket.send(
        JSON.stringify({
          action: 'sendPeerId',
          connectionType: 'lobby',
          peerId,
        })
      );
    };

    /**
     * Reads the event sent by the lobbies window and
     * react accordingly.
     */
    const receiveLobbiesMessage = function (
      runtimeScene: gdjs.RuntimeScene,
      event: MessageEvent,
      { checkOrigin }: { checkOrigin: boolean }
    ) {
      const allowedOrigins = ['https://gd.games', 'http://localhost:4000'];

      // Check origin of message.
      if (checkOrigin && !allowedOrigins.includes(event.origin)) {
        // Wrong origin. Return silently.
        return;
      }
      // Check that message is not malformed.
      if (!event.data.id) {
        throw new Error('Malformed message');
      }

      // Handle message.
      switch (event.data.id) {
        case 'joinLobby': {
          if (!event.data.lobbyId) {
            throw new Error('Malformed message.');
          }

          handleLobbyJoinEvent(runtimeScene, event.data.lobbyId);
          break;
        }
        case 'startGameCountdown': {
          handleGameCountdownStartMessage(runtimeScene);
          break;
        }
        case 'startGame': {
          handleGameStartMessage();
          break;
        }
        case 'leaveLobby': {
          handleLobbyLeaveEvent();
          break;
        }
      }
    };

    /**
     * Handle any error that can occur as part of displaying the lobbies.
     */
    const handleLobbiesError = function (
      runtimeScene: gdjs.RuntimeScene,
      message: string
    ) {
      logger.error(message);
      removeLobbiesContainer(runtimeScene);
      focusOnGame(runtimeScene);
    };

    /**
     * Helper to handle lobbies iframe.
     * We open an iframe, and listen to messages posted back to the game window.
     */
    const openLobbiesIframe = (
      runtimeScene: gdjs.RuntimeScene,
      gameId: string
    ) => {
      const targetUrl = getLobbiesWindowUrl({
        runtimeGame: runtimeScene.getGame(),
        gameId,
      });

      // Listen to messages posted by the lobbies window, so that we can
      // know when they join or leave a lobby.
      _lobbiesMessageCallback = (event: MessageEvent) => {
        receiveLobbiesMessage(runtimeScene, event, {
          checkOrigin: true,
        });
      };
      window.addEventListener('message', _lobbiesMessageCallback, true);

      multiplayerComponents.displayIframeInsideLobbiesContainer(
        runtimeScene,
        targetUrl
      );
    };

    /**
     * Action to display the lobbies window to the user.
     */
    export const openLobbiesWindow = function (
      runtimeScene: gdjs.RuntimeScene
    ) {
      if (isLobbiesWindowOpen(runtimeScene)) {
        return;
      }

      // Create the lobbies container for the player to wait.
      const domElementContainer = runtimeScene
        .getGame()
        .getRenderer()
        .getDomElementContainer();
      if (!domElementContainer) {
        handleLobbiesError(
          runtimeScene,
          "The div element covering the game couldn't be found, the lobbies window cannot be displayed."
        );
        return;
      }

      const onLobbiesContainerDismissed = () => {
        removeLobbiesContainer(runtimeScene);
      };

      const _gameId = gdjs.projectData.properties.projectUuid;
      if (!_gameId) {
        handleLobbiesError(
          runtimeScene,
          'The game ID is missing, the lobbies window cannot be opened.'
        );
        return;
      }

      const playerId = gdjs.playerAuthentication.getUserId();
      const playerToken = gdjs.playerAuthentication.getUserToken();
      if (!playerId || !playerToken) {
        gdjs.playerAuthentication.openAuthenticationWindow(runtimeScene);
        // Create a callback to open the lobbies window once the player is connected.
        gdjs.playerAuthentication.setLoginCallback(() => {
          openLobbiesWindow(runtimeScene);
        });
        return;
      }

      multiplayerComponents.displayLobbies(
        runtimeScene,
        onLobbiesContainerDismissed
      );

      // If the game is registered, open the lobbies window.
      // Otherwise, open the window indicating that the game is not registered.
      checkIfGameIsRegistered(runtimeScene.getGame(), _gameId)
        .then((isGameRegistered) => {
          const electron = runtimeScene.getGame().getRenderer().getElectron();
          const wikiOpenAction = electron
            ? () =>
                electron.shell.openExternal(
                  'https://wiki.gdevelop.io/gdevelop5/publishing/web'
                )
            : () =>
                window.open(
                  'https://wiki.gdevelop.io/gdevelop5/publishing/web',
                  '_blank'
                );

          multiplayerComponents.addTextsToLoadingContainer(
            runtimeScene,
            isGameRegistered,
            wikiOpenAction
          );

          if (isGameRegistered) {
            openLobbiesIframe(runtimeScene, _gameId);
          }
        })
        .catch((error) => {
          handleLobbiesError(
            runtimeScene,
            'Error while checking if the game is registered.'
          );
          logger.error(error);
        });
    };

    /**
     * Condition to check if the window is open, so that the game can be paused in the background.
     */
    export const isLobbiesWindowOpen = function (
      runtimeScene: gdjs.RuntimeScene
    ): boolean {
      const lobbiesRootContainer =
        multiplayerComponents.getLobbiesRootContainer(runtimeScene);
      return !!lobbiesRootContainer;
    };

    /**
     * Remove the container displaying the lobbies window and the callback.
     */
    export const removeLobbiesContainer = function (
      runtimeScene: gdjs.RuntimeScene
    ) {
      removeLobbiesCallbacks();
      multiplayerComponents.removeLobbiesContainer(runtimeScene);
    };

    /*
     * Remove the lobbies callbacks.
     */
    const removeLobbiesCallbacks = function () {
      // Remove the lobbies callbacks.
      if (_lobbiesMessageCallback) {
        window.removeEventListener('message', _lobbiesMessageCallback, true);
        _lobbiesMessageCallback = null;
      }
    };

    /**
     * Focus on game canvas to allow user to interact with it.
     */
    const focusOnGame = function (runtimeScene: gdjs.RuntimeScene) {
      const gameCanvas = runtimeScene.getGame().getRenderer().getCanvas();
      if (gameCanvas) gameCanvas.focus();
    };
  }
}
