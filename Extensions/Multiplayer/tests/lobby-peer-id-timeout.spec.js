// @ts-check

describe('Multiplayer lobby joining', () => {
  let clock;
  let loaderStates;
  let showConnectionError;
  // Quick-join throttling stores its timestamp across tests.
  let nextClockTime = Date.now() + 100000;

  class FakeWebSocket {
    static latest;

    constructor(url) {
      this.url = url;
      this.sentMessages = [];
      this.isClosed = false;
      FakeWebSocket.latest = this;
    }

    /** @type {any} */
    onopen = null;
    /** @type {any} */
    onmessage = null;
    /** @type {any} */
    onclose = null;

    open() {
      this.onopen();
    }

    send(message) {
      this.sentMessages.push(JSON.parse(message));
    }

    receive(message) {
      this.onmessage({ data: JSON.stringify(message) });
    }

    close() {
      this.isClosed = true;
      this.onclose();
    }
  }

  const runtimeScene = /** @type {any} */ ({
    getGame: () => ({
      isInGameEdition: () => false,
      isPreview: () => true,
      getGameData: () => ({ properties: { version: 'test-version' } }),
      getAdditionalOptions: () => ({}),
      getRenderer: () => ({
        getDomElementContainer: () => ({}),
        getElectron: () => null,
      }),
      getPlatformInfo: () => ({
        isCordova: false,
        devicePlatform: 'desktop',
        navigatorPlatform: 'test',
        hasTouch: false,
        supportedCompressionMethods: ['none'],
      }),
    }),
  });

  beforeEach(() => {
    clock = sinon.useFakeTimers({ now: nextClockTime });
    nextClockTime += 1000;
    loaderStates = [];
    showConnectionError = sinon.fake();

    sinon.replace(
      gdjs,
      'projectData',
      /** @type {any} */ ({
        properties: { projectUuid: 'test-game-id' },
      })
    );
    sinon.replace(
      gdjs.playerAuthentication,
      'getUserId',
      () => 'test-player-id'
    );
    sinon.replace(
      gdjs.playerAuthentication,
      'getUserToken',
      () => 'test-player-token'
    );
    sinon.replace(
      gdjs.playerAuthentication,
      'isAuthenticationWindowOpen',
      () => false
    );
    sinon.replace(
      gdjs.multiplayerComponents,
      'displayLoader',
      (_scene, visible) => loaderStates.push(visible)
    );
    sinon.replace(gdjs.multiplayerComponents, 'getLobbiesIframe', () => null);
    sinon.replace(
      gdjs.multiplayerComponents,
      'getLobbiesRootContainer',
      () => null
    );
    sinon.replace(gdjs.multiplayerComponents, 'displayLobbies', () => {});
    sinon.replace(
      gdjs.multiplayerComponents,
      'displayIframeInsideLobbiesContainer',
      () => {}
    );
    sinon.replace(
      gdjs.multiplayerComponents,
      'addTextsToLoadingContainer',
      () => {}
    );
    sinon.replace(
      gdjs.multiplayerComponents,
      'displayConnectionErrorNotification',
      showConnectionError
    );
    sinon.replace(
      gdjs,
      'multiplayerPeerJsHelper',
      /** @type {any} */ ({
        useDefaultBrokerServer: () => {},
        setCompressionMethod: () => {},
        getCurrentId: () => 'test-client-peer-id',
        connect: () => {},
      })
    );
    sinon.replace(gdjs.multiplayer, '_isLobbyGameRunning', false);
    sinon.replace(window, 'WebSocket', /** @type {any} */ (FakeWebSocket));
    sinon.replace(
      window,
      'fetch',
      /** @type {any} */ (
        async () => ({
          ok: true,
          status: 200,
          text: async () =>
            JSON.stringify({
              id: 'test-lobby-id',
              minPlayers: 1,
              maxPlayers: 4,
              canJoinAfterStart: true,
              players: [
                {
                  playerId: 'host-player-id',
                  status: 'playing',
                  playerNumber: 1,
                },
              ],
              status: 'playing',
            }),
        })
      )
    );
  });

  afterEach(() => {
    gdjs.multiplayer.leaveGameLobby();
    clock.restore();
    sinon.restore();
  });

  it('leaves and shows an error when a lobbies-page join times out', async () => {
    await gdjs.multiplayer.openLobbiesWindow(runtimeScene);
    window.dispatchEvent(
      new MessageEvent('message', {
        origin: 'https://gd.games',
        data: { id: 'joinLobby', lobbyId: 'test-lobby-id' },
      })
    );
    const websocket = FakeWebSocket.latest;
    websocket.open();
    websocket.receive({
      type: 'connectionId',
      data: { connectionId: 'test-connection-id', positionInLobby: 2 },
    });
    window.dispatchEvent(
      new MessageEvent('message', {
        origin: 'https://gd.games',
        data: { id: 'joinGame' },
      })
    );
    clock.tick(10000);
    expect(showConnectionError.calledOnce).to.be(true);
    expect(websocket.isClosed).to.be(true);
    expect(gdjs.multiplayer.hasQuickJoinJustFailed(runtimeScene)).to.be(false);
  });

  it('fails a quick join when the lobby never sends a peer ID', async () => {
    await gdjs.multiplayer.authenticateAndQuickJoinWithLobbyID(
      runtimeScene,
      'test-lobby-id',
      true,
      false
    );
    expect(gdjs.multiplayer.isSearchingForLobbyToJoin(runtimeScene)).to.be(
      true
    );

    const websocket = FakeWebSocket.latest;
    websocket.open();
    websocket.receive({
      type: 'connectionId',
      data: { connectionId: 'test-connection-id', positionInLobby: 2 },
    });
    expect(
      websocket.sentMessages.some(({ action }) => action === 'joinGame')
    ).to.be(true);

    clock.tick(10000);

    expect(gdjs.multiplayer.isSearchingForLobbyToJoin(runtimeScene)).to.be(
      false
    );
    expect(gdjs.multiplayer.hasQuickJoinJustFailed(runtimeScene)).to.be(true);
    expect(gdjs.multiplayer.getQuickJoinFailureReason()).to.be('TIMEOUT');
    expect(loaderStates[loaderStates.length - 1]).to.be(false);
    expect(websocket.isClosed).to.be(true);
  });

  it('stops the peer ID timeout after the lobby sends the peer ID', async () => {
    await gdjs.multiplayer.authenticateAndQuickJoinWithLobbyID(
      runtimeScene,
      'test-lobby-id',
      true,
      false
    );
    const websocket = FakeWebSocket.latest;
    websocket.open();
    websocket.receive({
      type: 'connectionId',
      data: { connectionId: 'test-connection-id', positionInLobby: 2 },
    });
    websocket.receive({
      type: 'peerId',
      data: { peerId: 'test-host-peer-id', compressionMethod: 'none' },
    });

    clock.tick(10000);

    expect(gdjs.multiplayer.isSearchingForLobbyToJoin(runtimeScene)).to.be(
      true
    );
    expect(websocket.isClosed).to.be(false);
  });
});
