namespace gdjs {
  const logger = new gdjs.Logger('Multiplayer');

  type LobbyChangeHostRequest = {
    lobbyId: string;
    gameId: string;
    peerId: string;
    playerId: string;
    ping: number;
    createdAt: number;
    ttl: number;
    newLobbyId?: string;
    newHostPeerId?: string;
    newPlayers?: {
      playerNumber: number;
      playerId: string;
    }[];
  };

  const getTimeNow =
    window.performance && typeof window.performance.now === 'function'
      ? window.performance.now.bind(window.performance)
      : Date.now;

  const fetchAsPlayer = async ({
    relativeUrl,
    method,
    body,
    dev,
  }: {
    relativeUrl: string;
    method: 'GET' | 'POST';
    body?: string;
    dev: boolean;
  }) => {
    const playerId = gdjs.playerAuthentication.getUserId();
    const playerToken = gdjs.playerAuthentication.getUserToken();
    if (!playerId || !playerToken) {
      logger.warn('Cannot fetch as a player if the player is not connected.');
      throw new Error(
        'Cannot fetch as a player if the player is not connected.'
      );
    }

    const rootApi = dev
      ? 'https://api-dev.gdevelop.io'
      : 'https://api.gdevelop.io';
    const url = new URL(`${rootApi}${relativeUrl}`);
    url.searchParams.set('playerId', playerId);
    const formattedUrl = url.toString();

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `player-game-token ${playerToken}`,
    };
    const response = await fetch(formattedUrl, {
      method,
      headers,
      body,
    });
    if (!response.ok) {
      throw new Error(
        `Error while fetching as a player: ${response.status} ${response.statusText}`
      );
    }

    // Response can either be 'OK' or a JSON object. Get the content before trying to parse it.
    const responseText = await response.text();
    if (responseText === 'OK') {
      return;
    }

    try {
      return JSON.parse(responseText);
    } catch (error) {
      throw new Error(`Error while parsing the response: ${error}`);
    }
  };

  export namespace multiplayer {
    /** Set to true in testing to avoid relying on the multiplayer extension. */
    export let disableMultiplayerForTesting = false;

    export let _isReadyToSendOrReceiveGameUpdateMessages = false;

    let _isGameRegistered: boolean | null = null;
    let _isCheckingIfGameIsRegistered = false;
    let _isWaitingForLogin = false;

    let _hasLobbyGameJustStarted = false;
    export let _isLobbyGameRunning = false;
    let _hasLobbyGameJustEnded = false;
    let _lobbyId: string | null = null;
    let _connectionId: string | null = null;

    let _shouldEndLobbyWhenHostLeaves = false;
    let _lobbyChangeHostRequest: LobbyChangeHostRequest | null = null;
    let _lobbyChangeHostRequestInitiatedAt: number | null = null;
    let _isChangingHost = false;
    let _lobbyNewHostPickedAt: number | null = null;

    // Communication methods.
    let _lobbiesMessageCallback: ((event: MessageEvent) => void) | null = null;
    let _websocket: WebSocket | null = null;
    let _websocketHeartbeatIntervalFunction: NodeJS.Timeout | null = null;
    let _lobbyHeartbeatIntervalFunction: NodeJS.Timeout | null = null;

    const DEFAULT_WEBSOCKET_HEARTBEAT_INTERVAL = 10000;
    const DEFAULT_LOBBY_HEARTBEAT_INTERVAL = 30000;
    let currentLobbyHeartbeatInterval = DEFAULT_LOBBY_HEARTBEAT_INTERVAL;
    const DEFAULT_LOBBY_CHANGE_HOST_REQUEST_CHECK_INTERVAL = 1000;
    // 10 seconds to be safe, but the backend will answer in less.
    const DEFAULT_LOBBY_CHANGE_HOST_REQUEST_TIMEOUT = 10000;
    const DEFAULT_LOBBY_EXPECTED_CONNECTED_PLAYERS_CHECK_INTERVAL = 1000;
    const DEFAULT_LOBBY_EXPECTED_CONNECTED_PLAYERS_TIMEOUT = 10000;
    let _resumeTimeout: NodeJS.Timeout | null = null;
    const DEFAULT_LOBBY_EXPECTED_RESUME_TIMEOUT = 12000;

    export const DEFAULT_OBJECT_MAX_SYNC_RATE = 30;
    // The number of times per second an object should be synchronized if it keeps changing.
    export let _objectMaxSyncRate = DEFAULT_OBJECT_MAX_SYNC_RATE;

    // Save if we are on dev environment so we don't need to use the runtimeGame every time.
    let isUsingGDevelopDevelopmentEnvironment = false;

    export let playerNumber: number | null = null;
    export let hostPeerId: string | null = null;

    gdjs.registerRuntimeScenePreEventsCallback(
      (runtimeScene: gdjs.RuntimeScene) => {
        isUsingGDevelopDevelopmentEnvironment = runtimeScene
          .getGame()
          .isUsingGDevelopDevelopmentEnvironment();

        if (disableMultiplayerForTesting) return;

        gdjs.multiplayerMessageManager.handleHeartbeatsToSend();
        gdjs.multiplayerMessageManager.handleJustDisconnectedPeers(
          runtimeScene
        );

        gdjs.multiplayerMessageManager.handleChangeInstanceOwnerMessagesReceived(
          runtimeScene
        );
        gdjs.multiplayerMessageManager.handleUpdateInstanceMessagesReceived(
          runtimeScene
        );
        gdjs.multiplayerMessageManager.handleCustomMessagesReceived();
        gdjs.multiplayerMessageManager.handleAcknowledgeMessagesReceived();
        gdjs.multiplayerMessageManager.resendClearOrCancelAcknowledgedMessages(
          runtimeScene
        );
        gdjs.multiplayerMessageManager.handleChangeVariableOwnerMessagesReceived(
          runtimeScene
        );
        // In case we're joining an existing lobby, it's possible we haven't
        // fully caught up with the game state yet, especially if a scene is loading.
        // We look at them every frame, from the moment the lobby has started,
        // to ensure we don't miss any.
        if (_isLobbyGameRunning) {
          gdjs.multiplayerMessageManager.handleSavedUpdateMessages(
            runtimeScene
          );
        }
        gdjs.multiplayerMessageManager.handleUpdateGameMessagesReceived(
          runtimeScene
        );
        gdjs.multiplayerMessageManager.handleUpdateSceneMessagesReceived(
          runtimeScene
        );
      }
    );

    gdjs.registerRuntimeScenePostEventsCallback(
      (runtimeScene: gdjs.RuntimeScene) => {
        if (disableMultiplayerForTesting) return;

        // Handle joining and leaving players to show notifications accordingly.
        handleLeavingPlayer(runtimeScene);
        handleJoiningPlayer(runtimeScene);

        // Then look at the heartbeats received to know if a new player has joined/left.
        gdjs.multiplayerMessageManager.handleHeartbeatsReceived();

        gdjs.multiplayerMessageManager.handleEndGameMessagesReceived();
        gdjs.multiplayerMessageManager.handleResumeGameMessagesReceived(
          runtimeScene
        );

        gdjs.multiplayerMessageManager.handleDestroyInstanceMessagesReceived(
          runtimeScene
        );
        gdjs.multiplayerVariablesManager.handleChangeVariableOwnerMessagesToSend();
        gdjs.multiplayerMessageManager.handleUpdateGameMessagesToSend(
          runtimeScene
        );
        gdjs.multiplayerMessageManager.handleUpdateSceneMessagesToSend(
          runtimeScene
        );
      }
    );

    // Ensure that the condition "game just started" (or ended) is valid only for one frame.
    gdjs.registerRuntimeScenePostEventsCallback(() => {
      if (disableMultiplayerForTesting) return;

      _hasLobbyGameJustStarted = false;
      _hasLobbyGameJustEnded = false;
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

      const baseUrl = 'https://gd.games';
      // Uncomment to test locally:
      // const baseUrl = 'http://localhost:4000';

      const url = new URL(
        `${baseUrl}/games/${gameId}/lobbies${_lobbyId ? `/${_lobbyId}` : ''}`
      );
      url.searchParams.set(
        'gameVersion',
        runtimeGame.getGameData().properties.version
      );
      if (runtimeGame.getAdditionalOptions().nativeMobileApp) {
        url.searchParams.set('nativeMobileApp', 'true');
      }
      url.searchParams.set(
        'isPreview',
        runtimeGame.isPreview() ? 'true' : 'false'
      );
      if (isUsingGDevelopDevelopmentEnvironment) {
        url.searchParams.set('dev', 'true');
      }
      if (_connectionId) {
        url.searchParams.set('connectionId', _connectionId);
      }
      if (playerNumber) {
        url.searchParams.set('positionInLobby', playerNumber.toString());
      }
      const playerId = gdjs.playerAuthentication.getUserId();
      if (playerId) {
        url.searchParams.set('playerId', playerId);
      }
      const playerToken = gdjs.playerAuthentication.getUserToken();
      if (playerToken) {
        url.searchParams.set('playerToken', playerToken);
      }
      // Increment this value when a new feature is introduced so we can
      // adapt the interface of the lobbies.
      url.searchParams.set('multiplayerVersion', '2');

      return url.toString();
    };

    export const setObjectsSynchronizationRate = (rate: number) => {
      if (rate < 1 || rate > 60) {
        logger.warn(
          `Invalid rate ${rate} for object synchronization. Defaulting to ${DEFAULT_OBJECT_MAX_SYNC_RATE}.`
        );
        _objectMaxSyncRate = DEFAULT_OBJECT_MAX_SYNC_RATE;
      } else {
        _objectMaxSyncRate = rate;
      }
    };

    export const getObjectsSynchronizationRate = () => _objectMaxSyncRate;

    /**
     * Returns true if the game has just started,
     * useful to switch to the game scene.
     */
    export const hasLobbyGameJustStarted = () => _hasLobbyGameJustStarted;

    export const isLobbyGameRunning = () => _isLobbyGameRunning;

    export const isReadyToSendOrReceiveGameUpdateMessages = () =>
      _isReadyToSendOrReceiveGameUpdateMessages;

    /**
     * Returns true if the game has just ended,
     * useful to switch back to to the main menu.
     */
    export const hasLobbyGameJustEnded = () => _hasLobbyGameJustEnded;

    /**
     * Returns the number of players in the lobby.
     */
    export const getPlayersInLobbyCount = (): number => {
      // Whether the lobby game has started or not, the number of players in the lobby
      // is the number of connected players.
      return gdjs.multiplayerMessageManager.getNumberOfConnectedPlayers();
    };

    /**
     * Returns true if the player at this position is connected to the lobby.
     */
    export const isPlayerConnected = (playerNumber: number): boolean => {
      return gdjs.multiplayerMessageManager.isPlayerConnected(playerNumber);
    };

    /**
     * Returns the position of the current player in the lobby.
     * Return 0 if the player is not in the lobby.
     * Returns 1, 2, 3, ... if the player is in the lobby.
     */
    export const getCurrentPlayerNumber = (): number => {
      return playerNumber || 0;
    };

    /**
     * Returns true if the player is the host in the lobby.
     * This can change during the game.
     */
    export const isCurrentPlayerHost = (): boolean => {
      return (
        !!hostPeerId &&
        hostPeerId === gdjs.multiplayerPeerJsHelper.getCurrentId()
      );
    };

    /**
     * Returns true if the host left and the game is either:
     * - picking a new host
     * - waiting for everyone to connect to the new host
     */
    export const isMigratingHost = (): boolean => {
      return !!_isChangingHost;
    };

    /**
     * If this is set, instead of migrating the host, the lobby will end when the host leaves.
     */
    export const endLobbyWhenHostLeaves = (enable: boolean) => {
      _shouldEndLobbyWhenHostLeaves = enable;
    };

    export const shouldEndLobbyWhenHostLeaves = () =>
      _shouldEndLobbyWhenHostLeaves;

    /**
     * Returns the player username at the given number in the lobby.
     * The number is shifted by one, so that the first player has number 1.
     */
    export const getPlayerUsername = (playerNumber: number): string => {
      return gdjs.multiplayerMessageManager.getPlayerUsername(playerNumber);
    };

    /**
     * Returns the player username of the current player in the lobby.
     */
    export const getCurrentPlayerUsername = (): string => {
      const currentPlayerNumber = getCurrentPlayerNumber();
      return getPlayerUsername(currentPlayerNumber);
    };

    const handleLeavingPlayer = (runtimeScene: gdjs.RuntimeScene) => {
      const lastestPlayerWhoJustLeft = gdjs.multiplayerMessageManager.getLatestPlayerWhoJustLeft();
      if (lastestPlayerWhoJustLeft) {
        const playerUsername = getPlayerUsername(lastestPlayerWhoJustLeft);
        gdjs.multiplayerComponents.displayPlayerLeftNotification(
          runtimeScene,
          playerUsername
        );
        // We remove the players who just left 1 by 1, so that they can be treated in different frames.
        // This is especially important if the expression to know the latest player who just left is used,
        // to avoid missing a player leaving.
        gdjs.multiplayerMessageManager.removePlayerWhoJustLeft();

        // When a player leaves, we send a heartbeat to the backend so that they're aware of the players in the lobby.
        // Do not await as we want don't want to block the execution of the of the rest of the logic.
        if (
          isCurrentPlayerHost() &&
          isReadyToSendOrReceiveGameUpdateMessages()
        ) {
          sendHeartbeatToBackend();
        }
      }
    };

    const handleJoiningPlayer = (runtimeScene: gdjs.RuntimeScene) => {
      const lastestPlayerWhoJustJoined = gdjs.multiplayerMessageManager.getLatestPlayerWhoJustJoined();
      if (lastestPlayerWhoJustJoined) {
        const playerUsername = getPlayerUsername(lastestPlayerWhoJustJoined);
        gdjs.multiplayerComponents.displayPlayerJoinedNotification(
          runtimeScene,
          playerUsername
        );

        // We also send a heartbeat to the backend right away, so that they're aware of the players in the lobby.
        // Do not await as we want don't want to block the execution of the of the rest of the logic.
        if (
          isCurrentPlayerHost() &&
          isReadyToSendOrReceiveGameUpdateMessages()
        ) {
          sendHeartbeatToBackend();
        }
      }
      // We remove the players who just joined 1 by 1, so that they can be treated in different frames.
      // This is especially important if the expression to know the latest player who just joined is used,
      // to avoid missing a player joining.
      gdjs.multiplayerMessageManager.removePlayerWhoJustJoined();
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
      const rootApi = isUsingGDevelopDevelopmentEnvironment
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

    const handleJoinLobbyEvent = function (
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
        playerNumber = null;
        hostPeerId = null;
        _lobbyId = null;
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
      const wsPlayApi = isUsingGDevelopDevelopmentEnvironment
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
        _websocketHeartbeatIntervalFunction = setInterval(() => {
          if (_websocket) {
            _websocket.send(
              JSON.stringify({
                action: 'heartbeat',
                connectionType: 'lobby',
              })
            );
          }
        }, DEFAULT_WEBSOCKET_HEARTBEAT_INTERVAL);

        // When socket is open, ask for the connectionId and send more session info, so that we can inform the lobbies window.
        if (_websocket) {
          _websocket.send(JSON.stringify({ action: 'getConnectionId' }));
          const platformInfo = runtimeScene.getGame().getPlatformInfo();
          _websocket.send(
            JSON.stringify({
              action: 'sessionInformation',
              connectionType: 'lobby',
              isCordova: platformInfo.isCordova,
              devicePlatform: platformInfo.devicePlatform,
              navigatorPlatform: platformInfo.navigatorPlatform,
              hasTouch: platformInfo.hasTouch,
              supportedCompressionMethods:
                platformInfo.supportedCompressionMethods,
            })
          );
        }
      };
      _websocket.onmessage = (event) => {
        if (event.data) {
          const messageContent = JSON.parse(event.data);
          switch (messageContent.type) {
            case 'connectionId': {
              const messageData = messageContent.data;
              const connectionId = messageData.connectionId;
              const positionInLobby = messageData.positionInLobby;
              const validIceServers = messageData.validIceServers || [];
              const brokerServerConfig = messageData.brokerServerConfig;

              if (!connectionId || !positionInLobby) {
                logger.error('No connectionId or position received');
                gdjs.multiplayerComponents.displayErrorNotification(
                  runtimeScene
                );
                // Close the websocket as something wrong happened.
                if (_websocket) _websocket.close();
                return;
              }

              handleConnectionIdReceived({
                runtimeScene,
                connectionId,
                positionInLobby,
                lobbyId,
                playerId,
                playerToken,
                validIceServers,
                brokerServerConfig,
              });
              break;
            }
            case 'lobbyUpdated': {
              const messageData = messageContent.data;
              const positionInLobby = messageData.positionInLobby;
              handleLobbyUpdatedEvent({
                runtimeScene,
                positionInLobby,
              });
              break;
            }
            case 'gameCountdownStarted': {
              const messageData = messageContent.data;
              const compressionMethod = messageData.compressionMethod || 'none';
              handleGameCountdownStartedEvent({
                runtimeScene,
                compressionMethod,
              });
              break;
            }
            case 'gameStarted': {
              const messageData = messageContent.data;
              currentLobbyHeartbeatInterval =
                messageData.heartbeatInterval ||
                DEFAULT_LOBBY_HEARTBEAT_INTERVAL;

              handleGameStartedEvent({
                runtimeScene,
              });
              break;
            }
            case 'peerId': {
              const messageData = messageContent.data;
              if (!messageData) {
                logger.error('No message received');
                return;
              }
              const peerId = messageData.peerId;
              const compressionMethod = messageData.compressionMethod;
              if (!peerId || !compressionMethod) {
                logger.error('Malformed message received');
                return;
              }

              handlePeerIdEvent({ peerId, compressionMethod });
              break;
            }
          }
        }
      };
      _websocket.onclose = () => {
        if (!_isLobbyGameRunning) {
          logger.info('Disconnected from the lobby.');
        }

        _connectionId = null;
        _websocket = null;
        if (_websocketHeartbeatIntervalFunction) {
          clearInterval(_websocketHeartbeatIntervalFunction);
        }

        // If the game is running, then all good.
        // Otherwise, the player left the lobby.
        if (_isLobbyGameRunning) {
          return;
        }

        const lobbiesIframe = gdjs.multiplayerComponents.getLobbiesIframe(
          runtimeScene
        );

        if (!lobbiesIframe || !lobbiesIframe.contentWindow) {
          return;
        }

        // Tell the Lobbies iframe that the lobby has been left.
        lobbiesIframe.contentWindow.postMessage(
          {
            id: 'lobbyLeft',
          },
          '*' // We could restrict to GDevelop games platform but it's not necessary as the message is not sensitive, and it allows easy debugging.
        );
      };
    };

    const handleConnectionIdReceived = function ({
      runtimeScene,
      connectionId,
      positionInLobby,
      lobbyId,
      playerId,
      playerToken,
      validIceServers,
      brokerServerConfig,
    }: {
      runtimeScene: gdjs.RuntimeScene;
      connectionId: string;
      positionInLobby: number;
      lobbyId: string;
      playerId: string;
      playerToken: string;
      validIceServers: {
        urls: string;
        username?: string;
        credential?: string;
      }[];
      brokerServerConfig?: {
        hostname: string;
        port: number;
        path: string;
        key: string;
        secure: boolean;
      };
    }) {
      // When the connectionId is received, initialise PeerJS so players can connect to each others afterwards.
      if (validIceServers.length) {
        for (const server of validIceServers) {
          gdjs.multiplayerPeerJsHelper.useCustomICECandidate(
            server.urls,
            server.username,
            server.credential
          );
        }
      }
      if (brokerServerConfig) {
        gdjs.multiplayerPeerJsHelper.useCustomBrokerServer(
          brokerServerConfig.hostname,
          brokerServerConfig.port,
          brokerServerConfig.path,
          brokerServerConfig.key,
          brokerServerConfig.secure
        );
      } else {
        gdjs.multiplayerPeerJsHelper.useDefaultBrokerServer();
      }

      _connectionId = connectionId;
      playerNumber = positionInLobby;
      // We save the lobbyId here as this is the moment when the player is really connected to the lobby.
      _lobbyId = lobbyId;

      // Then we inform the lobbies window that the player has joined.
      const lobbiesIframe = gdjs.multiplayerComponents.getLobbiesIframe(
        runtimeScene
      );

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
        'https://gd.games'
        // '*'
      );
    };

    const handleLeaveLobbyEvent = function () {
      if (_websocket) {
        _websocket.close();
      }
      _connectionId = null;
      playerNumber = null;
      hostPeerId = null;
      _lobbyId = null;
      _websocket = null;
    };

    const handleLobbyUpdatedEvent = function ({
      runtimeScene,
      positionInLobby,
    }: {
      runtimeScene: gdjs.RuntimeScene;
      positionInLobby: number;
    }) {
      // This is mainly useful when joining a lobby, or when the lobby is updated before the game starts.
      // The position in lobby should never change after the game has started (the WS is closed anyway).
      playerNumber = positionInLobby;

      // If the player is in the lobby, tell the lobbies window that the lobby has been updated,
      // as well as the player position.
      const lobbiesIframe = gdjs.multiplayerComponents.getLobbiesIframe(
        runtimeScene
      );

      if (!lobbiesIframe || !lobbiesIframe.contentWindow) {
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

    const handleGameCountdownStartedEvent = function ({
      runtimeScene,
      compressionMethod,
    }: {
      runtimeScene: gdjs.RuntimeScene;
      compressionMethod: gdjs.multiplayerPeerJsHelper.CompressionMethod;
    }) {
      gdjs.multiplayerPeerJsHelper.setCompressionMethod(compressionMethod);

      // When the countdown starts, if we are player number 1, we are chosen as the host.
      // We then send the peerId to others so they can connect via P2P.
      if (getCurrentPlayerNumber() === 1) {
        sendPeerId();
      }

      // Just pass along the message to the iframe so that it can display the countdown.
      const lobbiesIframe = gdjs.multiplayerComponents.getLobbiesIframe(
        runtimeScene
      );

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
      gdjs.multiplayerComponents.hideLobbiesCloseButtonTemporarily(
        runtimeScene
      );
    };

    const sendHeartbeatToBackend = async function () {
      const gameId = gdjs.projectData.properties.projectUuid;
      if (!gameId || !_lobbyId) {
        logger.error(
          'Cannot keep the lobby playing without the game ID or lobby ID.'
        );
        return;
      }

      const heartbeatRelativeUrl = `/play/game/${gameId}/public-lobby/${_lobbyId}/action/heartbeat`;
      const players = gdjs.multiplayerMessageManager.getConnectedPlayers();
      try {
        await fetchAsPlayer({
          relativeUrl: heartbeatRelativeUrl,
          method: 'POST',
          body: JSON.stringify({
            players,
          }),
          dev: isUsingGDevelopDevelopmentEnvironment,
        });
      } catch (error) {
        logger.error('Error while sending heartbeat, retrying:', error);
        try {
          await fetchAsPlayer({
            relativeUrl: heartbeatRelativeUrl,
            method: 'POST',
            body: JSON.stringify({
              players,
            }),
            dev: isUsingGDevelopDevelopmentEnvironment,
          });
        } catch (error) {
          logger.error(
            'Error while sending heartbeat a second time. Giving up:',
            error
          );
        }
      }
    };

    /**
     * When the game receives the information that the game has started, close the
     * lobbies window, focus on the game, and set the flag to true.
     */
    const handleGameStartedEvent = function ({
      runtimeScene,
    }: {
      runtimeScene: gdjs.RuntimeScene;
    }) {
      // It is possible the connection to other players didn't work.
      // If that's the case, show an error message and leave the lobby.
      // If we are the host, still start the game, as this allows a player to test the game alone.
      const allConnectedPeers = gdjs.multiplayerPeerJsHelper.getAllPeers();
      if (!isCurrentPlayerHost() && allConnectedPeers.length === 0) {
        gdjs.multiplayerComponents.displayConnectionErrorNotification(
          runtimeScene
        );
        // Do as if the player left the lobby.
        handleLeaveLobbyEvent();
        removeLobbiesContainer(runtimeScene);
        focusOnGame(runtimeScene);
        return;
      }

      // If we are the host, start pinging the backend to let it know the lobby is running.
      if (isCurrentPlayerHost()) {
        _lobbyHeartbeatIntervalFunction = setInterval(async () => {
          await sendHeartbeatToBackend();
        }, currentLobbyHeartbeatInterval);
      }

      // If we are connected to players, then the game can start.
      logger.info('Lobby game has started.');
      // In case we're joining an existing lobby, read the saved messages to catch-up with the game state.
      gdjs.multiplayerMessageManager.handleSavedUpdateMessages(runtimeScene);
      _isReadyToSendOrReceiveGameUpdateMessages = true;
      _hasLobbyGameJustStarted = true;
      _isLobbyGameRunning = true;
      removeLobbiesContainer(runtimeScene);
      // Close the websocket, as we don't need it anymore.
      if (_websocket) {
        _websocket.close();
      }
      focusOnGame(runtimeScene);
    };

    /**
     * When the game receives the information that the game has ended, set the flag to true,
     * so that the game can switch back to the main menu for instance.
     */
    export const handleLobbyGameEnded = function () {
      logger.info('Lobby game has ended.');
      _hasLobbyGameJustEnded = true;
      _isLobbyGameRunning = false;
      _lobbyId = null;
      playerNumber = null;
      hostPeerId = null;
      _isReadyToSendOrReceiveGameUpdateMessages = false;
      if (_lobbyHeartbeatIntervalFunction) {
        clearInterval(_lobbyHeartbeatIntervalFunction);
        _lobbyHeartbeatIntervalFunction = null;
      }

      // Disconnect from any P2P connections.
      gdjs.multiplayerPeerJsHelper.disconnectFromAllPeers();

      // Clear the expected acknowledgments, as the game is ending.
      gdjs.multiplayerMessageManager.clearAllMessagesTempData();
    };

    /**
     * When the game receives the information of the peerId, then
     * the player can connect to the peer.
     */
    const handlePeerIdEvent = function ({
      peerId,
      compressionMethod,
    }: {
      peerId: string;
      compressionMethod: gdjs.multiplayerPeerJsHelper.CompressionMethod;
    }) {
      // When a peerId is received, trigger a P2P connection with the peer, just after setting the compression method.
      gdjs.multiplayerPeerJsHelper.setCompressionMethod(compressionMethod);
      const currentPeerId = gdjs.multiplayerPeerJsHelper.getCurrentId();
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

      hostPeerId = peerId;
      gdjs.multiplayerPeerJsHelper.connect(peerId);
    };

    /**
     * When the game receives a start countdown message from the lobby, just send it to all
     * players in the lobby via the websocket.
     * It will then trigger an event from the websocket to all players in the lobby.
     */
    const handleStartGameCountdownMessage = function () {
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
    const handleStartGameMessage = function () {
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

      // As the host, start sending messages to the players.
      _isReadyToSendOrReceiveGameUpdateMessages = true;
    };

    /**
     * When the game receives a join game message from the lobby, send it via the WS
     * waiting for a peerId to be received and that the connection happens automatically.
     */
    const handleJoinGameMessage = function () {
      if (!_websocket) {
        logger.error(
          'No connection to send the start countdown message. Are you connected to a lobby?'
        );
        return;
      }

      _websocket.send(
        JSON.stringify({
          action: 'joinGame',
          connectionType: 'lobby',
        })
      );
    };

    /**
     * When the first heartbeat is received, we consider the connection to the host as working,
     * we inform the backend services that the connection is ready, so it can start the game when
     * everyone is ready.
     */
    export const markConnectionAsConnected = function () {
      if (!_websocket) {
        return;
      }

      _websocket.send(
        JSON.stringify({
          action: 'updateConnection',
          connectionType: 'lobby',
          status: 'connected',
          peerId: gdjs.multiplayerPeerJsHelper.getCurrentId(),
        })
      );
    };

    const clearChangeHostRequestData = function (
      runtimeScene: gdjs.RuntimeScene
    ) {
      _lobbyChangeHostRequest = null;
      _lobbyChangeHostRequestInitiatedAt = null;
      _lobbyNewHostPickedAt = null;
      if (_resumeTimeout) {
        clearTimeout(_resumeTimeout);
        _resumeTimeout = null;
      }
      _isChangingHost = false;
      if (hostPeerId) {
        gdjs.multiplayerComponents.showHostMigrationFinishedNotification(
          runtimeScene
        );
      } else {
        gdjs.multiplayerComponents.showHostMigrationFailedNotification(
          runtimeScene
        );
      }
    };

    export const resumeGame = async function (runtimeScene: gdjs.RuntimeScene) {
      if (isCurrentPlayerHost()) {
        // Send message to other players to indicate the game is resuming.
        gdjs.multiplayerMessageManager.sendResumeGameMessage();

        // Start sending heartbeats to the backend.
        await sendHeartbeatToBackend();
        _lobbyHeartbeatIntervalFunction = setInterval(async () => {
          await sendHeartbeatToBackend();
        }, currentLobbyHeartbeatInterval);
      }

      // Migration is finished.
      clearChangeHostRequestData(runtimeScene);
    };

    /**
     * When a host is being changed, multiple cases can happen:
     * - We are the new host and the only one in the lobby. Unpause the game right away.
     * - We are the new host and there are other players in the new lobby. Wait for them to connect:
     *   - if they are all connected, unpause the game.
     *   - if we reach a timeout, a player may have disconnected at the same time, unpause the game.
     * - We are not the new host. Connect to the new host peerId.
     *   - If we cannot connect, leave the lobby.
     *   - when we receive a message to unpause the game, unpause it.
     *   - if we reach a timeout without the message, leave the lobby, something wrong happened.
     */
    const checkHostChangeRequestRegularly = async function ({
      runtimeScene,
    }: {
      runtimeScene: gdjs.RuntimeScene;
    }) {
      if (!_lobbyChangeHostRequest || !_lobbyChangeHostRequestInitiatedAt) {
        return;
      }

      // Refresh the request to get the latest information.
      try {
        const changeHostRelativeUrl = `/play/game/${
          _lobbyChangeHostRequest.gameId
        }/public-lobby/${
          _lobbyChangeHostRequest.lobbyId
        }/lobby-change-host-request?peerId=${gdjs.multiplayerPeerJsHelper.getCurrentId()}`;

        const lobbyChangeHostRequest = await fetchAsPlayer({
          relativeUrl: changeHostRelativeUrl,
          method: 'GET',
          dev: isUsingGDevelopDevelopmentEnvironment,
        });
        _lobbyChangeHostRequest = lobbyChangeHostRequest;
      } catch (error) {
        logger.error(
          'Error while trying to retrieve the lobby change host request:',
          error
        );
        handleLobbyGameEnded();
        clearChangeHostRequestData(runtimeScene);
        return;
      }

      if (!_lobbyChangeHostRequest) {
        throw new Error('No lobby change host request received.');
      }

      const newHostPeerId = _lobbyChangeHostRequest.newHostPeerId;
      if (!newHostPeerId) {
        logger.info('No new host picked yet.');
        if (
          getTimeNow() - _lobbyChangeHostRequestInitiatedAt >
          DEFAULT_LOBBY_CHANGE_HOST_REQUEST_TIMEOUT
        ) {
          logger.error(
            'Timeout while waiting for the lobby host change. Giving up.'
          );
          handleLobbyGameEnded();
          clearChangeHostRequestData(runtimeScene);
          return;
        }

        logger.info('Retrying...');
        setTimeout(() => {
          checkHostChangeRequestRegularly({ runtimeScene });
        }, DEFAULT_LOBBY_CHANGE_HOST_REQUEST_CHECK_INTERVAL);
        return;
      }

      try {
        const newLobbyId = _lobbyChangeHostRequest.newLobbyId;
        const newPlayers = _lobbyChangeHostRequest.newPlayers;
        if (!newLobbyId || !newPlayers) {
          logger.error(
            'Change host request is incomplete. Cannot change host.'
          );
          handleLobbyGameEnded();
          clearChangeHostRequestData(runtimeScene);
          return;
        }
        hostPeerId = newHostPeerId;
        _lobbyNewHostPickedAt = getTimeNow();
        _lobbyId = newLobbyId;

        if (newHostPeerId === gdjs.multiplayerPeerJsHelper.getCurrentId()) {
          logger.info(
            `We are the new host. Switching to lobby ${newLobbyId} and awaiting for ${
              newPlayers.length - 1
            } player(s) to connect.`
          );
          await checkExpectedConnectedPlayersRegularly({
            runtimeScene,
          });
        } else {
          logger.info(
            `Connecting to new host and switching lobby to ${newLobbyId}.`
          );
          gdjs.multiplayerPeerJsHelper.connect(newHostPeerId);
          _resumeTimeout = setTimeout(() => {
            logger.error(
              'Timeout while waiting for the game to resume. Leaving the lobby.'
            );
            handleLobbyGameEnded();
            clearChangeHostRequestData(runtimeScene);
          }, DEFAULT_LOBBY_EXPECTED_RESUME_TIMEOUT);
        }
      } catch (error) {
        logger.error('Error while trying to change host:', error);
        handleLobbyGameEnded();
        clearChangeHostRequestData(runtimeScene);
      }
    };

    /**
     * Helper for the new host, to check if they have all the expected players connected.
     */
    const checkExpectedConnectedPlayersRegularly = async function ({
      runtimeScene,
    }: {
      runtimeScene: gdjs.RuntimeScene;
    }) {
      if (!_lobbyChangeHostRequest) {
        return;
      }

      const expectedNewPlayers = _lobbyChangeHostRequest.newPlayers;
      if (!expectedNewPlayers) {
        logger.error('No expected players in the lobby change host request.');
        handleLobbyGameEnded();
        clearChangeHostRequestData(runtimeScene);
        return;
      }
      const expectedNewOtherPlayerNumbers = expectedNewPlayers.map(
        (player) => player.playerNumber
      );

      // First look for players who left during the migration.
      const playerNumbersConnectedBeforeMigration = gdjs.multiplayerMessageManager
        .getConnectedPlayers()
        .map((player) => player.playerNumber);
      const playerNumbersWhoLeftDuringMigration = playerNumbersConnectedBeforeMigration.filter(
        (playerNumberBeforeMigration) =>
          !expectedNewOtherPlayerNumbers.includes(playerNumberBeforeMigration)
      );
      playerNumbersWhoLeftDuringMigration.map((playerNumberWhoLeft) => {
        logger.info(
          `Player ${playerNumberWhoLeft} left during the host migration. Marking as disconnected.`
        );
        gdjs.multiplayerMessageManager.markPlayerAsDisconnected({
          runtimeScene,
          playerNumber: playerNumberWhoLeft,
        });
      });

      // Then check if all expected players are connected.
      const playerNumbersWhoDidNotConnect = expectedNewOtherPlayerNumbers.filter(
        (otherPlayerNumber) =>
          otherPlayerNumber !== playerNumber && // We don't look for ourselves
          !gdjs.multiplayerMessageManager.hasReceivedHeartbeatFromPlayer(
            otherPlayerNumber
          )
      );

      if (playerNumbersWhoDidNotConnect.length === 0) {
        logger.info('All expected players are connected. Resuming the game.');
        await resumeGame(runtimeScene);
        return;
      }

      if (
        _lobbyNewHostPickedAt &&
        getTimeNow() - _lobbyNewHostPickedAt >
          DEFAULT_LOBBY_EXPECTED_CONNECTED_PLAYERS_TIMEOUT &&
        playerNumbersWhoDidNotConnect.length > 0
      ) {
        logger.error(
          `Timeout while waiting for players ${playerNumbersWhoDidNotConnect.join(
            ', '
          )} to connect. Assume they disconnected.`
        );
        playerNumbersWhoDidNotConnect.map((missingPlayerNumber) => {
          gdjs.multiplayerMessageManager.markPlayerAsDisconnected({
            runtimeScene,
            playerNumber: missingPlayerNumber,
          });
        });
        await resumeGame(runtimeScene);
        return;
      }

      setTimeout(() => {
        checkExpectedConnectedPlayersRegularly({
          runtimeScene,
        });
      }, DEFAULT_LOBBY_EXPECTED_CONNECTED_PLAYERS_CHECK_INTERVAL);
    };

    /**
     * When the host disconnects, we inform the backend we lost the connection and we need a new lobby/host.
     */
    export const handleHostDisconnected = async function ({
      runtimeScene,
    }: {
      runtimeScene: gdjs.RuntimeScene;
    }) {
      if (!_isLobbyGameRunning) {
        // This can happen when the game ends. Nothing to do here.
        return;
      }

      if (_lobbyChangeHostRequest) {
        // The new host disconnected while we are already changing host.
        // Let's end the lobby game to avoid weird situations.
        handleLobbyGameEnded();
        clearChangeHostRequestData(runtimeScene);
      }

      const gameId = gdjs.projectData.properties.projectUuid;

      if (!gameId || !_lobbyId) {
        logger.error(
          'Cannot ask for a host change without the game ID or lobby ID.'
        );
        return;
      }

      try {
        _isChangingHost = true;
        gdjs.multiplayerComponents.displayHostMigrationNotification(
          runtimeScene
        );

        const changeHostRelativeUrl = `/play/game/${gameId}/public-lobby/${_lobbyId}/lobby-change-host-request`;
        const playersInfo = gdjs.multiplayerMessageManager.getPlayersInfo();
        const playersInfoForHostChange = Object.keys(playersInfo).map(
          (playerNumber) => {
            return {
              playerNumber: parseInt(playerNumber, 10),
              playerId: playersInfo[playerNumber].playerId,
              ping: playersInfo[playerNumber].ping,
            };
          }
        );
        const body = JSON.stringify({
          playersInfo: playersInfoForHostChange,
          peerId: gdjs.multiplayerPeerJsHelper.getCurrentId(),
        });
        const lobbyChangeHostRequest = await fetchAsPlayer({
          relativeUrl: changeHostRelativeUrl,
          method: 'POST',
          body,
          dev: isUsingGDevelopDevelopmentEnvironment,
        });

        _lobbyChangeHostRequest = lobbyChangeHostRequest;
        _lobbyChangeHostRequestInitiatedAt = getTimeNow();

        await checkHostChangeRequestRegularly({ runtimeScene });
      } catch (error) {
        logger.error('Error while trying to change host:', error);
        handleLobbyGameEnded();
        clearChangeHostRequestData(runtimeScene);
      }
    };

    /**
     * Action to end the lobby game.
     * This will update the lobby status and inform everyone in the lobby that the game has ended.
     */
    export const endLobbyGame = async function () {
      if (!isLobbyGameRunning()) {
        return;
      }

      if (!isCurrentPlayerHost()) {
        logger.error('Only the host can end the game.');
        return;
      }

      // Consider the game is ended, so that we don't listen to other players disconnecting.
      _isLobbyGameRunning = false;

      logger.info('Ending the lobby game.');

      // Inform the players that the game has ended.
      gdjs.multiplayerMessageManager.sendEndGameMessage();

      // Also call backend to end the game.
      const gameId = gdjs.projectData.properties.projectUuid;
      if (!gameId || !_lobbyId) {
        logger.error('Cannot end the lobby without the game ID or lobby ID.');
        return;
      }

      const endGameRelativeUrl = `/play/game/${gameId}/public-lobby/${_lobbyId}/action/end`;
      try {
        await fetchAsPlayer({
          relativeUrl: endGameRelativeUrl,
          method: 'POST',
          body: JSON.stringify({}),
          dev: isUsingGDevelopDevelopmentEnvironment,
        });
      } catch (error) {
        logger.error('Error while ending the game:', error);
      }

      // Do as if everyone left the lobby.
      handleLobbyGameEnded();
    };

    /**
     * Helper to send the ID from PeerJS to the lobby players.
     */
    const sendPeerId = function () {
      if (!_websocket) {
        logger.error(
          'No connection to send the message. Are you connected to a lobby?'
        );
        return;
      }

      const peerId = gdjs.multiplayerPeerJsHelper.getCurrentId();
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
      // We are the host.
      hostPeerId = peerId;
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
        case 'lobbiesListenerReady': {
          sendSessionInformation(runtimeScene);
          break;
        }
        case 'joinLobby': {
          if (!event.data.lobbyId) {
            throw new Error('Malformed message.');
          }

          handleJoinLobbyEvent(runtimeScene, event.data.lobbyId);
          break;
        }
        case 'startGameCountdown': {
          handleStartGameCountdownMessage();
          break;
        }
        case 'startGame': {
          handleStartGameMessage();
          break;
        }
        case 'leaveLobby': {
          handleLeaveLobbyEvent();
          break;
        }
        case 'joinGame': {
          handleJoinGameMessage();
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

    const sendSessionInformation = (runtimeScene: gdjs.RuntimeScene) => {
      const lobbiesIframe = gdjs.multiplayerComponents.getLobbiesIframe(
        runtimeScene
      );
      if (!lobbiesIframe || !lobbiesIframe.contentWindow) {
        // Cannot send the message if the iframe is not opened.
        return;
      }

      const platformInfo = runtimeScene.getGame().getPlatformInfo();

      lobbiesIframe.contentWindow.postMessage(
        {
          id: 'sessionInformation',
          isCordova: platformInfo.isCordova,
          devicePlatform: platformInfo.devicePlatform,
          navigatorPlatform: platformInfo.navigatorPlatform,
          hasTouch: platformInfo.hasTouch,
        },
        '*'
      );
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

      gdjs.multiplayerComponents.displayIframeInsideLobbiesContainer(
        runtimeScene,
        targetUrl
      );
    };

    /**
     * Action to display the lobbies window to the user.
     */
    export const openLobbiesWindow = async (
      runtimeScene: gdjs.RuntimeScene
    ) => {
      if (
        isLobbiesWindowOpen(runtimeScene) ||
        gdjs.playerAuthentication.isAuthenticationWindowOpen()
      ) {
        return;
      }

      const _gameId = gdjs.projectData.properties.projectUuid;
      if (!_gameId) {
        handleLobbiesError(
          runtimeScene,
          'The game ID is missing, the lobbies window cannot be opened.'
        );
        return;
      }

      if (_isCheckingIfGameIsRegistered || _isWaitingForLogin) {
        // The action is called multiple times, let's prevent that.
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

      const playerId = gdjs.playerAuthentication.getUserId();
      const playerToken = gdjs.playerAuthentication.getUserToken();
      if (!playerId || !playerToken) {
        _isWaitingForLogin = true;
        const {
          status,
        } = await gdjs.playerAuthentication.openAuthenticationWindow(
          runtimeScene
        ).promise;
        _isWaitingForLogin = false;

        if (status === 'logged') {
          openLobbiesWindow(runtimeScene);
        }

        return;
      }

      gdjs.multiplayerComponents.displayLobbies(
        runtimeScene,
        onLobbiesContainerDismissed
      );

      // If the game is registered, open the lobbies window.
      // Otherwise, open the window indicating that the game is not registered.
      if (_isGameRegistered === null) {
        _isCheckingIfGameIsRegistered = true;
        try {
          const isGameRegistered = await checkIfGameIsRegistered(
            runtimeScene.getGame(),
            _gameId
          );
          _isGameRegistered = isGameRegistered;
        } catch (error) {
          _isGameRegistered = false;
          logger.error(
            'Error while checking if the game is registered:',
            error
          );
          handleLobbiesError(
            runtimeScene,
            'Error while checking if the game is registered.'
          );
          return;
        } finally {
          _isCheckingIfGameIsRegistered = false;
        }
      }
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

      gdjs.multiplayerComponents.addTextsToLoadingContainer(
        runtimeScene,
        _isGameRegistered,
        wikiOpenAction
      );

      if (_isGameRegistered) {
        openLobbiesIframe(runtimeScene, _gameId);
      }
    };

    /**
     * Condition to check if the window is open, so that the game can be paused in the background.
     */
    export const isLobbiesWindowOpen = function (
      runtimeScene: gdjs.RuntimeScene
    ): boolean {
      const lobbiesRootContainer = gdjs.multiplayerComponents.getLobbiesRootContainer(
        runtimeScene
      );
      return !!lobbiesRootContainer;
    };

    export const showLobbiesCloseButton = function (
      runtimeScene: gdjs.RuntimeScene,
      visible: boolean
    ) {
      gdjs.multiplayerComponents.changeLobbiesWindowCloseActionVisibility(
        runtimeScene,
        visible
      );
    };

    /**
     * Remove the container displaying the lobbies window and the callback.
     */
    export const removeLobbiesContainer = function (
      runtimeScene: gdjs.RuntimeScene
    ) {
      removeLobbiesCallbacks();
      gdjs.multiplayerComponents.removeLobbiesContainer(runtimeScene);
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

    /**
     * Action to allow the player to leave the lobby in-game.
     */
    export const leaveGameLobby = async () => {
      // Handle the case where the game has not started yet, so the player is in the lobby.
      handleLeaveLobbyEvent();
      // Handle the case where the game has started, so the player is in the game and connected to other players.
      handleLobbyGameEnded();
    };
  }
}
