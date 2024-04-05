namespace gdjs {
  declare var cordova: any;

  const logger = new gdjs.Logger('Multiplayer');
  const multiplayerComponents = gdjs.multiplayerComponents;
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

    // Communication methods.
    let _lobbiesMessageCallback: ((event: MessageEvent) => void) | null = null;
    let _websocket: WebSocket | null = null;
    let _heartbeatInterval: NodeJS.Timeout | null = null;

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
     * Returns the player ID of the player at the given index in the lobby.
     */
    export const getPlayerId = (index: number) => {
      if (!_lobby) {
        return '';
      }
      if (index >= _lobby.players.length) {
        return '';
      }
      return _lobby.players[index].playerId;
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
              // Once we receive the connectionId, we can consider a lobby is joined,
              // and inform the lobbies window and store the lobby & connection id.
              const messageData = messageContent.data;
              const connectionId = messageData.connectionId;
              if (!connectionId) {
                logger.error('No connectionId received');
                return;
              }

              handleConnectionIdReceived(
                runtimeScene,
                connectionId,
                lobbyId,
                playerId,
                playerToken
              );
              break;
            }
            case 'lobbyUpdated': {
              const messageData = messageContent.data;
              const lobby = messageData.lobby;
              if (!lobby) {
                logger.error('No lobby received');
                return;
              }
              handleLobbyUpdatedEvent(runtimeScene, lobby);
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
        _lobbyId = null;
        _lobby = null;
        _websocket = null;
        if (_heartbeatInterval) {
          clearInterval(_heartbeatInterval);
        }
      };
    };

    const handleConnectionIdReceived = function (
      runtimeScene: gdjs.RuntimeScene,
      connectionId: string,
      lobbyId: string,
      playerId: string,
      playerToken: string
    ) {
      const lobbiesIframe =
        multiplayerComponents.getLobbiesIframe(runtimeScene);

      if (!lobbiesIframe || !lobbiesIframe.contentWindow) {
        logger.error(
          'The lobbies iframe is not opened, cannot send the join message.'
        );
        return;
      }

      // Tell the Lobbies iframe that the lobby has been joined.
      lobbiesIframe.contentWindow.postMessage(
        {
          id: 'lobbyJoined',
          lobbyId,
          playerId,
          playerToken,
          connectionId,
        },
        // Specify the origin to avoid leaking the playerToken.
        // Replace with '*' to test locally.
        // 'https://gd.games'
        '*'
      );

      _lobbyId = lobbyId;
      _connectionId = connectionId;
    };

    const handleLobbyLeaveEvent = function () {
      if (_websocket) {
        _websocket.close();
      }
      _connectionId = null;
      _lobbyId = null;
      _lobby = null;
      _websocket = null;
    };

    const handleLobbyUpdatedEvent = function (
      runtimeScene: gdjs.RuntimeScene,
      lobby
    ) {
      // Update the object representing the lobby in the extension, but also
      // just pass along the message to the iframe so that it can make its own
      // requests to the server.
      _lobby = lobby;

      const lobbiesIframe =
        multiplayerComponents.getLobbiesIframe(runtimeScene);

      if (!lobbiesIframe || !lobbiesIframe.contentWindow) {
        logger.info('The lobbies iframe is not opened, not sending message.');
        return;
      }

      lobbiesIframe.contentWindow.postMessage(
        {
          id: 'lobbyUpdated',
        },
        '*' // We could restrict to GDevelop games platform but it's not necessary as the message is not sensitive, and it allows easy debugging.
      );
    };

    /**
     * When the game receives the information that the game has started, close the
     * lobbies window, focus on the game, and set the flag to true.
     */
    const handleGameStartedEvent = function (runtimeScene: gdjs.RuntimeScene) {
      _hasGameJustStarted = true;
      removeLobbiesContainer(runtimeScene);
      focusOnGame(runtimeScene);
    };

    /**
     * When the game receives the information that the game has ended, set the flag to true,
     * so that the game can switch back to the main menu for instance.
     */
    const handleGameEndedEvent = function (runtimeScene: gdjs.RuntimeScene) {
      _hasGameJustEnded = true;
    };

    /**
     * Action to end the lobby game.
     * This will update the lobby status and inform everyone in the lobby that the game has ended.
     */
    export const endLobbyGame = function (runtimeScene: gdjs.RuntimeScene) {
      if (_websocket) {
        _websocket.send(
          JSON.stringify({
            action: 'endGame',
            connectionType: 'lobby',
            gameId: gdjs.projectData.properties.projectUuid,
            lobbyId: _lobbyId,
          })
        );
      }
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

      console.log('open lobbies iframe');

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
        console.log('Lobbies window is already open');
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
        console.log('onLobbiesContainerDismissed');
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

      console.log('open lobbies window');

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
      console.log('removeLobbiesContainer');
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
