// @ts-check

describe('Multiplayer lobby joining', () => {
  let clock;
  let originalFetch;
  let originalWebSocket;
  let originalProjectData;
  let originalGetUserId;
  let originalGetUserToken;
  let originalDisplayLoader;
  let originalDisplayConnectionErrorNotification;
  let originalGetLobbiesIframe;
  let originalPeerJsHelper;
  let onPeerUnavailableForTest;
  let originalLobbyGameRunning;
  let loaderStates;
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
    originalFetch = window.fetch;
    originalWebSocket = window.WebSocket;
    originalProjectData = gdjs.projectData;
    originalGetUserId = gdjs.playerAuthentication.getUserId;
    originalGetUserToken = gdjs.playerAuthentication.getUserToken;
    originalDisplayLoader = gdjs.multiplayerComponents.displayLoader;
    originalDisplayConnectionErrorNotification =
      gdjs.multiplayerComponents.displayConnectionErrorNotification;
    originalGetLobbiesIframe = gdjs.multiplayerComponents.getLobbiesIframe;
    originalPeerJsHelper = gdjs.multiplayerPeerJsHelper;
    onPeerUnavailableForTest = null;
    originalLobbyGameRunning = gdjs.multiplayer._isLobbyGameRunning;
    loaderStates = [];

    /** @type {any} */ (gdjs).projectData = {
      properties: { projectUuid: 'test-game-id' },
    };
    /** @type {any} */ (gdjs.playerAuthentication).getUserId = () =>
      'test-player-id';
    /** @type {any} */ (gdjs.playerAuthentication).getUserToken = () =>
      'test-player-token';
    /** @type {any} */ (gdjs.multiplayerComponents).displayLoader = (
      _runtimeScene,
      visible
    ) => {
      loaderStates.push(visible);
    };
    /** @type {any} */ (gdjs.multiplayerComponents).getLobbiesIframe = () =>
      null;
    /** @type {any} */ (
      gdjs.multiplayerComponents
    ).displayConnectionErrorNotification = () => {};
    /** @type {any} */ (gdjs).multiplayerPeerJsHelper = {
      useDefaultBrokerServer: ({ onPeerUnavailable }) => {
        onPeerUnavailableForTest = onPeerUnavailable;
      },
      setCompressionMethod: () => {},
      getCurrentId: () => 'test-client-peer-id',
      connect: () => {},
    };
    gdjs.multiplayer._isLobbyGameRunning = false;
    /** @type {any} */ (window).WebSocket = FakeWebSocket;
    /** @type {any} */ (window).fetch = async () => ({
      ok: true,
      text: async () =>
        JSON.stringify({
          id: 'test-lobby-id',
          minPlayers: 1,
          maxPlayers: 4,
          canJoinAfterStart: true,
          players: [
            { playerId: 'host-player-id', status: 'playing', playerNumber: 1 },
          ],
          status: 'playing',
        }),
    });
  });

  afterEach(() => {
    if (
      onPeerUnavailableForTest &&
      FakeWebSocket.latest &&
      !FakeWebSocket.latest.isClosed
    ) {
      onPeerUnavailableForTest();
    }
    clock.restore();
    window.fetch = originalFetch;
    window.WebSocket = originalWebSocket;
    /** @type {any} */ (gdjs).projectData = originalProjectData;
    /** @type {any} */ (gdjs.playerAuthentication).getUserId =
      originalGetUserId;
    /** @type {any} */ (gdjs.playerAuthentication).getUserToken =
      originalGetUserToken;
    /** @type {any} */ (gdjs.multiplayerComponents).displayLoader =
      originalDisplayLoader;
    /** @type {any} */ (
      gdjs.multiplayerComponents
    ).displayConnectionErrorNotification =
      originalDisplayConnectionErrorNotification;
    /** @type {any} */ (gdjs.multiplayerComponents).getLobbiesIframe =
      originalGetLobbiesIframe;
    /** @type {any} */ (gdjs).multiplayerPeerJsHelper = originalPeerJsHelper;
    gdjs.multiplayer._isLobbyGameRunning = originalLobbyGameRunning;
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
