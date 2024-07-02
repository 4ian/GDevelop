namespace gdjs {
  const logger = new gdjs.Logger('Multiplayer');

  type Lobby = {
    id: string;
    name: string;
    status: string;
    players: { playerId: string; status: string }[];
  };
  export namespace multiplayer {
    /** Set to true in testing to avoid relying on the multiplayer extension. */
    export let disableMultiplayerForTesting = false;

    let _isGameRegistered: boolean | null = null;
    let _isCheckingIfGameIsRegistered = false;
    let _isWaitingForLogin = false;

    let _hasLobbyGameJustStarted = false;
    export let _isLobbyGameRunning = false;
    let _hasLobbyGameJustEnded = false;
    let _lobbyId: string | null = null;
    let _connectionId: string | null = null;
    export let _lobby: Lobby | null = null;
    let _playerPublicProfiles: { id: string; username?: string }[] = [];

    // Communication methods.
    let _lobbiesMessageCallback: ((event: MessageEvent) => void) | null = null;
    let _websocket: WebSocket | null = null;
    let _websocketHeartbeatInterval: NodeJS.Timeout | null = null;
    let _lobbyHeartbeatInterval: NodeJS.Timeout | null = null;

    const DEFAULT_WEBSOCKET_HEARTBEAT_INTERVAL = 10000;
    const DEFAULT_LOBBY_HEARTBEAT_INTERVAL = 30000;
    const DEFAULT_COUNTDOWN_SECONDS_TO_START = 5;

    // Save if we are on dev environment so we don't need to use the runtimeGame every time.
    let isUsingGDevelopDevelopmentEnvironment = false;

    export let playerNumber: number | null = null;

    gdjs.registerRuntimeScenePreEventsCallback(
      (runtimeScene: gdjs.RuntimeScene) => {
        isUsingGDevelopDevelopmentEnvironment = runtimeScene
          .getGame()
          .isUsingGDevelopDevelopmentEnvironment();

        if (disableMultiplayerForTesting) return;

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
        gdjs.multiplayerMessageManager.handleUpdateGameMessagesReceived(
          runtimeScene
        );
        gdjs.multiplayerMessageManager.handleUpdateSceneMessagesReceived(
          runtimeScene
        );
        gdjs.multiplayerMessageManager.handleHeartbeatsToSend();
        gdjs.multiplayerMessageManager.handleDisconnectedPeers(runtimeScene);
      }
    );

    gdjs.registerRuntimeScenePostEventsCallback(
      (runtimeScene: gdjs.RuntimeScene) => {
        if (disableMultiplayerForTesting) return;

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
        gdjs.multiplayerMessageManager.handleHeartbeatsReceived();
        handleLeavingPlayer(runtimeScene);
        gdjs.multiplayerMessageManager.clearDisconnectedPeers();
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

      return url.toString();
    };

    /**
     * Returns true if the game has just started,
     * useful to switch to the game scene.
     */
    export const hasLobbyGameJustStarted = () => _hasLobbyGameJustStarted;

    export const isLobbyGameRunning = () => _isLobbyGameRunning;

    /**
     * Returns true if the game has just ended,
     * useful to switch back to to the main menu.
     */
    export const hasLobbyGameJustEnded = () => _hasLobbyGameJustEnded;

    /**
     * Returns the number of players in the lobby.
     */
    export const getPlayersInLobbyCount = () => {
      // If the game has not started yet, look at the lobby.
      if (!_isLobbyGameRunning && _lobby) {
        return _lobby.players.length;
      }

      // If the game has started, look at the pings received from the players.
      if (_isLobbyGameRunning) {
        return gdjs.multiplayerMessageManager.getNumberOfConnectedPlayers();
      }

      return 0;
    };

    /**
     * Returns the position of the current player in the lobby.
     * Return 0 if the player is not in the lobby.
     * Returns 1, 2, 3, ... if the player is in the lobby.
     */
    export const getCurrentPlayerNumber = () => {
      return playerNumber || 0;
    };

    /**
     * Returns true if the player is the host in the lobby. Here, player 1.
     */
    export const isPlayerHost = () => {
      return playerNumber === 1;
    };

    /**
     * Returns the player ID of the player at the given number in the lobby.
     * The number is shifted by one, so that the first player has number  1.
     */
    const getPlayerId = (playerNumber: number) => {
      if (!_lobby) {
        return '';
      }
      const index = playerNumber - 1;
      if (index < 0 || index >= _lobby.players.length) {
        return '';
      }
      return _lobby.players[index].playerId;
    };

    /**
     * Returns the player username at the given number in the lobby.
     * The number is shifted by one, so that the first player has number 1.
     */
    export const getPlayerUsername = (playerNumber: number) => {
      const playerId = getPlayerId(playerNumber);
      if (!playerId) {
        return '';
      }

      const playerPublicProfile = _playerPublicProfiles.find(
        (profile) => profile.id === playerId
      );

      return playerPublicProfile
        ? playerPublicProfile.username
        : `Player ${playerNumber}`;
    };

    /**
     * Returns the player username of the current player in the lobby.
     */
    export const getCurrentPlayerUsername = () => {
      const currentPlayerNumber = getCurrentPlayerNumber();
      return getPlayerUsername(currentPlayerNumber);
    };

    const handleLeavingPlayer = (runtimeScene: gdjs.RuntimeScene) => {
      const disconnectedPlayers = gdjs.multiplayerMessageManager.getDisconnectedPlayers();
      if (disconnectedPlayers.length > 0) {
        for (const playerNumber of disconnectedPlayers) {
          const playerLeftId = getPlayerId(playerNumber);

          if (!playerLeftId) {
            return;
          }

          const playerLeftPublicProfile = _playerPublicProfiles.find(
            (profile) => profile.id === playerLeftId
          );

          if (playerLeftPublicProfile) {
            gdjs.multiplayerComponents.displayPlayerLeftNotification(
              runtimeScene,
              (playerLeftPublicProfile && playerLeftPublicProfile.username) ||
                'Player'
            );
          }
        }
      }
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
        playerNumber = null;
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
        _websocketHeartbeatInterval = setInterval(() => {
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
              const lobby = messageData.lobby;
              const positionInLobby = messageData.positionInLobby;
              if (!lobby) {
                logger.error('No lobby received');
                return;
              }
              handleLobbyUpdatedEvent({
                runtimeScene,
                updatedLobby: lobby,
                positionInLobby,
              });
              break;
            }
            case 'gameCountdownStarted': {
              const messageData = messageContent.data;
              const compressionMethod = messageData.compressionMethod || 'none';
              const secondsToStart =
                messageData.secondsToStart ||
                DEFAULT_COUNTDOWN_SECONDS_TO_START;
              handleGameCountdownStartedEvent({
                runtimeScene,
                compressionMethod,
                secondsToStart,
              });
              break;
            }
            case 'gameStarted': {
              const messageData = messageContent.data;
              const heartbeatInterval =
                messageData.heartbeatInterval ||
                DEFAULT_LOBBY_HEARTBEAT_INTERVAL;

              handleGameStartedEvent({ runtimeScene, heartbeatInterval });
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

              handlePeerIdEvent({ peerId });
              break;
            }
          }
        }
      };
      _websocket.onclose = () => {
        logger.info(
          'Disconnected from the lobby. Either manually or game started.'
        );

        _connectionId = null;
        _websocket = null;
        if (_websocketHeartbeatInterval) {
          clearInterval(_websocketHeartbeatInterval);
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

    const handleLobbyLeaveEvent = function () {
      if (_websocket) {
        _websocket.close();
      }
      _connectionId = null;
      playerNumber = null;
      _lobbyId = null;
      _lobby = null;
      _websocket = null;
    };

    const handleLobbyUpdatedEvent = function ({
      runtimeScene,
      updatedLobby,
      positionInLobby,
    }: {
      runtimeScene: gdjs.RuntimeScene;
      updatedLobby: Lobby;
      positionInLobby: number;
    }) {
      // Update the object representing the lobby in the extension.
      _lobby = updatedLobby;

      // If the lobby is playing, do not update anything.
      if (updatedLobby.status === 'playing') {
        return;
      }

      // Update the profiles so we can use the usernames of the players.
      updatePlayerPublicProfiles(isUsingGDevelopDevelopmentEnvironment);

      playerNumber = positionInLobby;

      // If the player is in the lobby, tell the lobbies window that the lobby has been updated,
      // as well as the player position.
      const lobbiesIframe = gdjs.multiplayerComponents.getLobbiesIframe(
        runtimeScene
      );

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

    const handleGameCountdownStartedEvent = function ({
      runtimeScene,
      compressionMethod,
      secondsToStart,
    }: {
      runtimeScene: gdjs.RuntimeScene;
      compressionMethod: gdjs.multiplayerPeerJsHelper.CompressionMethod;
      secondsToStart: number;
    }) {
      gdjs.multiplayerPeerJsHelper.setCompressionMethod(compressionMethod);

      // When the countdown starts, if we are player number 1, then send the peerId to others so they can connect via P2P.
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
          secondsToStart,
        },
        '*' // We could restrict to GDevelop games platform but it's not necessary as the message is not sensitive, and it allows easy debugging.
      );

      // Prevent the player from leaving the lobby while the game is starting.
      gdjs.multiplayerComponents.hideLobbiesCloseButtonTemporarily(
        runtimeScene
      );
    };

    /**
     * When the game receives the information that the game has started, close the
     * lobbies window, focus on the game, and set the flag to true.
     */
    const handleGameStartedEvent = function ({
      runtimeScene,
      heartbeatInterval,
    }: {
      runtimeScene: gdjs.RuntimeScene;
      heartbeatInterval: number;
    }) {
      // It is possible the connection to other players didn't work.
      // If that's the case, show an error message and leave the lobby.
      // If we are the host, still start the game, as this allows a player to test the game alone.
      const allConnectedPeers = gdjs.multiplayerPeerJsHelper.getAllPeers();
      if (!isPlayerHost() && allConnectedPeers.length === 0) {
        gdjs.multiplayerComponents.displayConnectionErrorNotification(
          runtimeScene
        );
        // Do as if the player left the lobby.
        handleLobbyLeaveEvent();
        removeLobbiesContainer(runtimeScene);
        focusOnGame(runtimeScene);
        return;
      }

      // If we are the host, start pinging the backend to let it know the lobby is running.
      if (isPlayerHost()) {
        const gameId = gdjs.projectData.properties.projectUuid;
        const playerId = gdjs.playerAuthentication.getUserId();
        const playerToken = gdjs.playerAuthentication.getUserToken();

        if (!gameId || !playerId || !playerToken || !_lobbyId) {
          logger.error(
            'Cannot keep the lobby playing without the game ID or player ID.'
          );
          return;
        }

        _lobbyHeartbeatInterval = setInterval(async () => {
          const rootApi = isUsingGDevelopDevelopmentEnvironment
            ? 'https://api-dev.gdevelop.io'
            : 'https://api.gdevelop.io';
          const headers = {
            'Content-Type': 'application/json',
          };
          let heartbeatUrl = `${rootApi}/play/game/${gameId}/public-lobby/${_lobbyId}/action/heartbeat`;
          headers['Authorization'] = `player-game-token ${playerToken}`;
          heartbeatUrl += `?playerId=${playerId}`;
          await fetch(heartbeatUrl, {
            method: 'POST',
            headers,
          });
        }, heartbeatInterval);
      }

      // If we are connected to players, then the game can start.
      logger.info('Lobby game has started.');
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
      _lobby = null;
      playerNumber = null;
      if (_lobbyHeartbeatInterval) {
        clearInterval(_lobbyHeartbeatInterval);
      }

      // Disconnect from any P2P connections.
      gdjs.multiplayerPeerJsHelper.disconnectFromAllPeers();

      // Clear the expected acknowledgments, as the game is ending.
      gdjs.multiplayerMessageManager.clearExpectedMessageAcknowledgements();
    };

    /**
     * When the game receives the information of the peerId, then
     * the player can connect to the peer.
     */
    const handlePeerIdEvent = function ({ peerId }: { peerId: string }) {
      // When a peerId is received, trigger a P2P connection with the peer.
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

      gdjs.multiplayerPeerJsHelper.connect(peerId);
    };

    /**
     * When the game receives a start countdown message from the lobby, just send it to all
     * players in the lobby via the websocket.
     * It will then trigger an event from the websocket to all players in the lobby.
     */
    const handleGameCountdownStartMessage = function () {
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
    export const endLobbyGame = async function () {
      if (!isLobbyGameRunning()) {
        return;
      }

      if (!isPlayerHost()) {
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
      const playerId = gdjs.playerAuthentication.getUserId();
      const playerToken = gdjs.playerAuthentication.getUserToken();

      if (!gameId || !playerId || !playerToken || !_lobbyId) {
        logger.error('Cannot end the lobby without the game ID or player ID.');
        return;
      }

      const rootApi = isUsingGDevelopDevelopmentEnvironment
        ? 'https://api-dev.gdevelop.io'
        : 'https://api.gdevelop.io';
      const headers = {
        'Content-Type': 'application/json',
      };
      let endGameUrl = `${rootApi}/play/game/${gameId}/public-lobby/${_lobbyId}/action/end`;
      headers['Authorization'] = `player-game-token ${playerToken}`;
      endGameUrl += `?playerId=${playerId}`;
      try {
        await fetch(endGameUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            gameId,
            lobbyId: _lobbyId,
          }),
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
      if (!_websocket || !_lobby) {
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

          handleLobbyJoinEvent(runtimeScene, event.data.lobbyId);
          break;
        }
        case 'startGameCountdown': {
          handleGameCountdownStartMessage();
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
    export const leaveGameLobby = async (runtimeScene: gdjs.RuntimeScene) => {
      // Handle the case where the game has not started yet, so the player is in the lobby.
      handleLobbyLeaveEvent();
      // Handle the case where the game has started, so the player is in the game and connected to other players.
      handleLobbyGameEnded();
    };
  }
}
