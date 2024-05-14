namespace gdjs {
  declare var cordova: any;

  const logger = new gdjs.Logger('Multiplayer');
  const multiplayerComponents = gdjs.multiplayerComponents;
  const multiplayerMessageManager = gdjs.multiplayerMessageManager;
  export namespace multiplayer {
    let _hasGameJustStarted = false;
    let _hasGameJustEnded = false;
    let _lobbyId: string | null = null;
    let _connectionId: string | null = null;
    let _lobby: {
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
    export let isGameRunning = false;

    gdjs.registerRuntimeScenePreEventsCallback(
      (runtimeScene: gdjs.RuntimeScene) => {
        multiplayerMessageManager.handleChangeOwnerMessages(runtimeScene);
        multiplayerMessageManager.handleUpdateObjectMessages(runtimeScene);
        multiplayerMessageManager.handleCustomMessages();
        multiplayerMessageManager.handleAcknowledgeMessages();
        multiplayerMessageManager.resendClearOrCancelAcknowledgedMessages(
          runtimeScene
        );
        multiplayerMessageManager.handleSceneUpdatedMessages(runtimeScene);
        multiplayerMessageManager.handleGameUpdatedMessages(runtimeScene);
      }
    );

    gdjs.registerRuntimeScenePostEventsCallback(
      (runtimeScene: gdjs.RuntimeScene) => {
        multiplayerMessageManager.handleDestroyObjectMessages(runtimeScene);
        multiplayerMessageManager.handleUpdateSceneMessages(runtimeScene);
        multiplayerMessageManager.handleUpdateGameMessages(runtimeScene);
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
      const baseUrl = 'https://gd.games';
      // Uncomment to test locally:
      // const baseUrl = 'http://localhost:4000';

      const url = new URL(
        `${baseUrl}/games/${gameId}/lobbies${_lobbyId ? `/${_lobbyId}` : ''}`
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
    export const getPlayerNumber = () => {
      return playerNumber || 0;
    };

    /**
     * Returns true if the player is the server in the lobby. Here, player 1.
     */
    export const isPlayerServer = () => {
      return playerNumber === 1;
    };

    /**
     * Returns the player ID of the player at the given number in the lobby.
     * The number is shifted by one, so that the first player has number  1.
     */
    export const getPlayerId = (number: number) => {
      if (!_lobbyOnGameStart) {
        return '';
      }
      const index = number - 1;
      if (index < 0 || index >= _lobbyOnGameStart.players.length) {
        return '';
      }
      return _lobbyOnGameStart.players[index].playerId;
    };

    /**
     * Returns the player username at the given number in the lobby.
     * The number is shifted by one, so that the first player has number 1.
     */
    export const getPlayerUsername = (number: number) => {
      const playerId = getPlayerId(number);
      if (!playerId) {
        return '';
      }

      const playerPublicProfile = _playerPublicProfiles.find(
        (profile) => profile.id === playerId
      );

      return playerPublicProfile
        ? playerPublicProfile.username
        : `Player ${number}`;
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

        const lobbiesIframe = multiplayerComponents.getLobbiesIframe(
          runtimeScene
        );

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
        playerNumber = null;
        _lobbyId = null;
        _lobby = null;
        _lobbyOnGameStart = null;
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
      const lobbyBeforeUpdate = _lobby;
      // Update the object representing the lobby in the extension.
      _lobby = updatedLobby;

      // If the lobby is playing, do not update the player position or usernames as it's probably a player leaving,
      // and we want to keep that info.
      if (updatedLobby.status === 'playing') {
        // But we do want to let the player know if another player has left the lobby.
        if (
          _lobbyOnGameStart &&
          lobbyBeforeUpdate &&
          lobbyBeforeUpdate.players.length > updatedLobby.players.length
        ) {
          // Find the missing player. Note: we can have multiple players with the same playerId, when testing.
          // So, we loop through the players one by one until one is not the same (as they are in order).
          let playerLeft: { playerId: string; status: string } | null = null;
          for (let i = 0; i < lobbyBeforeUpdate.players.length; i++) {
            // If the last player is missing, then it's the last one.
            if (!updatedLobby.players[i]) {
              playerLeft = lobbyBeforeUpdate.players[i];
              break;
            }

            // If the player is not the same, then it's the missing one, we can break.
            if (
              updatedLobby.players[i] &&
              updatedLobby.players[i].playerId !==
                lobbyBeforeUpdate.players[i].playerId
            ) {
              playerLeft = lobbyBeforeUpdate.players[i];
              break;
            }
          }

          if (!playerLeft) {
            return;
          }

          const playerLeftPublicProfile = _playerPublicProfiles.find(
            (profile) => profile.id === playerLeft.playerId
          );

          if (playerLeftPublicProfile) {
            multiplayerComponents.displayPlayerLeftNotification(
              runtimeScene,
              (playerLeftPublicProfile && playerLeftPublicProfile.username) ||
                'Player'
            );
          }
        }
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
      multiplayerComponents.hideLobbiesCloseArrow(runtimeScene);
    };

    /**
     * When the game receives the information that the game has started, close the
     * lobbies window, focus on the game, and set the flag to true.
     */
    const handleGameStartedEvent = function (runtimeScene: gdjs.RuntimeScene) {
      _hasGameJustStarted = true;
      isGameRunning = true;
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
      isGameRunning = false;

      // Disconnect from any P2P connections.
      gdjs.evtTools.p2p.disconnectFromAllPeers();

      // Clear the expected acknowledgments, as the game is ending.
      multiplayerMessageManager.clearExpectedMessageAcknowledgements();
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
      const lobbiesRootContainer = multiplayerComponents.getLobbiesRootContainer(
        runtimeScene
      );
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
