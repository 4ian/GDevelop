namespace gdjs {
  declare var cordova: any;

  const logger = new gdjs.Logger('Multiplayer');
  const multiplayerComponents = gdjs.multiplayerComponents;
  export namespace multiplayer {
    /** Set to true in testing to avoid relying on the multiplayer extension. */
    export let disableMultiplayerForTesting = false;

    let _isGameRegistered: boolean | null = null;
    let _isCheckingIfGameIsRegistered = false;
    let _isWaitingForLoginCallback = false;

    let _hasGameJustStarted = false;
    export let _isGameRunning = false;
    let _hasGameJustEnded = false;
    let _lobbyId: string | null = null;
    let _connectionId: string | null = null;
    export let _lobby: {
      id: string;
      name: string;
      status: string;
      players: { playerId: string; status: string }[];
    } | null = null;
    let _lobbyOnGameStart: {
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

    export let playerNumber: number | null = null;

    gdjs.registerRuntimeScenePreEventsCallback(
      (runtimeScene: gdjs.RuntimeScene) => {
        if (disableMultiplayerForTesting) return;

        gdjs.multiplayerMessageManager.handleChangeOwnerMessages(runtimeScene);
        gdjs.multiplayerMessageManager.handleUpdateObjectMessages(runtimeScene);
        gdjs.multiplayerMessageManager.handleCustomMessages();
        gdjs.multiplayerMessageManager.handleAcknowledgeMessages();
        gdjs.multiplayerMessageManager.resendClearOrCancelAcknowledgedMessages(
          runtimeScene
        );
        gdjs.multiplayerMessageManager.handleGameUpdatedMessages(runtimeScene);
        gdjs.multiplayerMessageManager.handleSceneUpdatedMessages(runtimeScene);
        gdjs.multiplayerMessageManager.handleHeartbeats();
        gdjs.multiplayerMessageManager.handleDisconnectedPeers(runtimeScene);
      }
    );

    gdjs.registerRuntimeScenePostEventsCallback(
      (runtimeScene: gdjs.RuntimeScene) => {
        if (disableMultiplayerForTesting) return;

        gdjs.multiplayerMessageManager.handleDestroyObjectMessages(
          runtimeScene
        );
        gdjs.multiplayerMessageManager.handleUpdateGameMessages(runtimeScene);
        gdjs.multiplayerMessageManager.handleUpdateSceneMessages(runtimeScene);
        gdjs.multiplayerMessageManager.handleHeartbeatsReceived();
        handleLeavingPlayer(runtimeScene);
        gdjs.multiplayerMessageManager.clearDisconnectedPeers();
      }
    );

    // Ensure that the condition "game just started" (or ended) is valid only for one frame.
    gdjs.registerRuntimeScenePostEventsCallback(() => {
      if (disableMultiplayerForTesting) return;

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
      if (isDev) {
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
    export const hasGameJustStarted = () => _hasGameJustStarted;

    export const isGameRunning = () => _isGameRunning;

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
      // If the game has not started yet, look at the lobby.
      if (!_isGameRunning && _lobby) {
        return _lobby.players.length;
      }

      // If the game has started, look at the pings received from the players.
      if (_isGameRunning) {
        return gdjs.multiplayerMessageManager.getNumberOfConnectedPlayers();
      }

      return 0;
    };

    /**
     * Returns the position of the current player in the lobby.
     * Return 0 if the player is not in the lobby.
     * Returns 1, 2, 3, ... if the player is in the lobby.
     */
    export const getPlayerNumber = () => {
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
      if (!_lobbyOnGameStart) {
        return '';
      }
      const index = playerNumber - 1;
      if (index < 0 || index >= _lobbyOnGameStart.players.length) {
        return '';
      }
      return _lobbyOnGameStart.players[index].playerId;
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
            multiplayerComponents.displayPlayerLeftNotification(
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
        playerNumber = null;
        _lobbyId = null;
        _lobby = null;
        _lobbyOnGameStart = null;
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
              const validIceServers = messageData.validIceServers || [];

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
                validIceServers,
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
              handleGameEndedEvent();
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

        _connectionId = null;
        playerNumber = null;
        _lobbyId = null;
        _lobby = null;
        _lobbyOnGameStart = null;
        _websocket = null;
        if (_heartbeatInterval) {
          clearInterval(_heartbeatInterval);
        }

        const lobbiesIframe = multiplayerComponents.getLobbiesIframe(
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
    }) {
      // When the connectionId is received, initialise PeerJS so players can connect to each others afterwards.
      if (validIceServers.length) {
        console.info('Using custom servers:', validIceServers);
        for (const server of validIceServers) {
          gdjs.evtTools.p2p.useCustomICECandidate(
            server.urls,
            server.username,
            server.credential
          );
        }
      }
      gdjs.evtTools.p2p.useDefaultBrokerServer();
      // gdjs.evtTools.p2p.useCustomBrokerServer(
      //   'gdevelop-services.uc.r.appspot.com',
      //   80,
      //   '/',
      //   '',
      //   false
      // );

      _connectionId = connectionId;
      playerNumber = positionInLobby;
      // We save the lobbyId here as this is the moment when the player is really connected to the lobby.
      _lobbyId = lobbyId;

      // Then we inform the lobbies window that the player has joined.
      const lobbiesIframe = multiplayerComponents.getLobbiesIframe(
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
      _lobbyOnGameStart = null;
      _websocket = null;
    };

    const handleLobbyUpdatedEvent = function (
      runtimeScene: gdjs.RuntimeScene,
      updatedLobby,
      positionInLobby: number
    ) {
      // Update the object representing the lobby in the extension.
      _lobby = updatedLobby;

      // If the lobby is playing, do not update anything.
      if (updatedLobby.status === 'playing') {
        return;
      }

      // Update the profiles so we can use the usernames of the players.
      const isDev = runtimeScene
        .getGame()
        .isUsingGDevelopDevelopmentEnvironment();
      updatePlayerPublicProfiles(isDev);

      playerNumber = positionInLobby;

      // If the player is in the lobby, tell the lobbies window that the lobby has been updated,
      // as well as the player position.
      const lobbiesIframe = multiplayerComponents.getLobbiesIframe(
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

    const handleGameCountdownStartedEvent = function (
      runtimeScene: gdjs.RuntimeScene
    ) {
      // When the countdown starts, if we are player number 1, then send the peerId to others so they can connect via P2P.
      if (getPlayerNumber() === 1) {
        sendPeerId();
      }

      // Just pass along the message to the iframe so that it can display the countdown.
      const lobbiesIframe = multiplayerComponents.getLobbiesIframe(
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
      multiplayerComponents.hideLobbiesCloseButtonTemporarily(runtimeScene);
    };

    /**
     * When the game receives the information that the game has started, close the
     * lobbies window, focus on the game, and set the flag to true.
     */
    const handleGameStartedEvent = function (runtimeScene: gdjs.RuntimeScene) {
      // It is possible the connection to other players didn't work.
      // If that's the case, show an error message and leave the lobby.
      // If we are the host, still start the game, as this allows a player to test the game alone.
      const allConnectedPeers = gdjs.evtTools.p2p.getAllPeers();
      if (!isPlayerHost() && allConnectedPeers.length === 0) {
        multiplayerComponents.displayConnectionErrorNotification(runtimeScene);
        // Do as if the player left the lobby.
        handleLobbyLeaveEvent();
        removeLobbiesContainer(runtimeScene);
        focusOnGame(runtimeScene);
        return;
      }

      // If we are connected to players, then the game can start.
      _hasGameJustStarted = true;
      _isGameRunning = true;
      _lobbyOnGameStart = _lobby;
      removeLobbiesContainer(runtimeScene);
      focusOnGame(runtimeScene);
    };

    /**
     * When the game receives the information that the game has ended, set the flag to true,
     * so that the game can switch back to the main menu for instance.
     */
    const handleGameEndedEvent = function () {
      _hasGameJustEnded = true;
      _isGameRunning = false;

      // Disconnect from any P2P connections.
      gdjs.evtTools.p2p.disconnectFromAllPeers();

      // Clear the expected acknowledgments, as the game is ending.
      gdjs.multiplayerMessageManager.clearExpectedMessageAcknowledgements();
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
    export const endLobbyGame = function () {
      if (!_websocket) {
        logger.error(
          'No connection to send the end game message. Are you connected to a lobby?'
        );
        return;
      }

      if (!isConnectedToLobby() || !isGameRunning()) {
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

      if (_isCheckingIfGameIsRegistered || _isWaitingForLoginCallback) {
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
        _isWaitingForLoginCallback = true;
        const {
          status,
        } = await gdjs.playerAuthentication.openAuthenticationWindow(
          runtimeScene
        ).promise;
        _isWaitingForLoginCallback = false;

        if (status === 'logged') {
          openLobbiesWindow(runtimeScene);
        }

        return;
      }

      multiplayerComponents.displayLobbies(
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
          logger.error(error);
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

      multiplayerComponents.addTextsToLoadingContainer(
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
      const lobbiesRootContainer = multiplayerComponents.getLobbiesRootContainer(
        runtimeScene
      );
      return !!lobbiesRootContainer;
    };

    export const showLobbiesCloseButton = function (
      runtimeScene: gdjs.RuntimeScene,
      visible: boolean
    ) {
      multiplayerComponents.changeLobbiesWindowCloseActionVisibility(
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
