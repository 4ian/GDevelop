// @ts-check

describe('Multiplayer', () => {
  const delay = (ms) => new Promise((res) => setTimeout(res, ms));

  const makeTestRuntimeScene = (timeDelta = 1000 / 60) => {
    const runtimeGame = gdjs.getPixiRuntimeGame();
    const runtimeScene = new gdjs.TestRuntimeScene(runtimeGame);
    runtimeScene.loadFromScene({
      layers: [
        {
          name: '',
          visibility: true,
          effects: [],
          cameras: [],
          ambientLightColorR: 0,
          ambientLightColorG: 0,
          ambientLightColorB: 0,
          isLightingLayer: false,
          followBaseLayerCamera: true,
        },
      ],
      r: 0,
      v: 0,
      b: 0,
      mangledName: 'Scene1',
      name: 'Scene1',
      stopSoundsOnStartup: false,
      title: '',
      behaviorsSharedData: [],
      objects: [
        {
          type: 'Sprite',
          name: 'MySpriteObject',
          behaviors: [
            {
              name: 'MultiplayerObject',
              type: 'Multiplayer::MultiplayerObjectBehavior',
            },
          ],
          effects: [],
          // @ts-expect-error ts-migrate(2322) FIXME: Type '{ type: string; name: string; behaviors: nev... Remove this comment to see the full error message
          animations: [],
          updateIfNotVisible: false,
        },
      ],
      instances: [],
      variables: [],
      usedResources: [],
    });
    runtimeScene._timeManager.getElapsedTime = function () {
      return timeDelta;
    };
    return runtimeScene;
  };

  /**
   * A mocked P2P event data.
   * @implements {gdjs.evtTools.p2p.IEventData}
   */
  class MockedEventData {
    constructor(data, sender) {
      this.data = data;
      this.sender = sender;
    }

    /**
     * The data sent alongside the event.
     */
    data = '';

    /**
     * The ID of the sender of the event.
     */
    sender = '';
  }

  /**
   * A mocked P2P event.
   * @implements {gdjs.evtTools.p2p.IEvent}
   */
  class MockedEvent {
    data = [];
    dataloss = false;

    isTriggered() {
      return this.data.length > 0;
    }

    /**
     * @param {gdjs.evtTools.p2p.IEventData} newData
     */
    pushData(newData) {
      if (this.dataloss && this.data.length > 0) this.data[0] = newData;
      else this.data.push(newData);
    }

    popData() {
      this.data.shift();
    }

    getData() {
      return this.data.length === 0 ? '' : this.data[0].data;
    }

    getSender() {
      return this.data.length === 0 ? '' : this.data[0].sender;
    }
  }

  /**
   * Create a mocked P2P handler.
   * It stores the events sent to/from peers.
   */
  const createP2PAndMultiplayerMessageManagerMock = () => {
    const p2pState = {
      currentPeerId: '',
      otherPeerIds: [],
    };

    /** @type {Record<string, Map<string, MockedEvent>>} */
    const peerEvents = {};

    /** @type {Record<string, gdjs.MultiplayerMessageManager>} */
    const peerMultiplayerMessageManager = {};

    const getPeerEvents = (peerId) =>
      (peerEvents[peerId] = peerEvents[peerId] || new Map());

    /**
     * @param {string} eventName
     * @returns {gdjs.evtTools.p2p.IEvent}
     */
    const getEvent = (eventName) => {
      const events = getPeerEvents(p2pState.currentPeerId);
      let event = events.get(eventName);
      if (!event) events.set(eventName, (event = new MockedEvent()));
      return event;
    };

    /**
     * @param {string} peerId
     * @param {string} eventName
     * @param {string} eventData
     */
    const sendDataTo = (peerId, eventName, eventData) => {
      // console.log(`## SENDING DATA TO ${peerId}:`, eventName, eventData);
      const events = getPeerEvents(peerId);
      let event = events.get(eventName);
      if (!event) events.set(eventName, (event = new MockedEvent()));
      event.pushData(new MockedEventData(eventData, peerId));
    };

    /** @type {typeof gdjs.evtTools.p2p} */
    const p2pMock = {
      // @ts-ignore - this is a mock so private properties can't be the same.
      Event: MockedEvent,
      EventData: MockedEventData,
      sendVariableTo: () => {},
      sendVariableToAll: () => {},
      getEventVariable: (eventName, variable) => {
        variable.fromJSON(getEventData(eventName));
      },
      onEvent: (eventName, dataloss) => {
        const event = getEvent(eventName);
        event.dataloss = dataloss;
        const isTriggered = event.isTriggered();
        return isTriggered;
      },
      getEvent,
      connect: (id) => {},
      disconnectFromPeer: (id) => {},
      disconnectFromAllPeers: () => {},
      disconnectFromAll: () => {},
      disconnectFromBroker: () => {},
      sendDataTo,
      sendDataToAll: (eventName, eventData) => {
        p2pState.otherPeerIds.forEach((peerId) => {
          sendDataTo(peerId, eventName, eventData);
        });
      },
      getEventData: (eventName) => getEvent(eventName).getData(),
      getEventSender: (eventName) => getEvent(eventName).getSender(),
      getEvents: () => getPeerEvents(p2pState.currentPeerId),
      useCustomBrokerServer: () => {},
      useDefaultBrokerServer: () => {},
      useCustomICECandidate: () => {},
      forceUseRelayServer: (shouldUseRelayServer) => {},
      overrideId: (id) => {},
      getCurrentId: () => 'fake-current-id',
      isReady: () => true,
      onError: () => false,
      getLastError: () => '',
      onDisconnect: () => false,
      getDisconnectedPeer: () => '',
      onConnection: () => false,
      getConnectedPeer: () => '',
      getAllPeers: () => p2pState.otherPeerIds,
      getConnectionInstance: () => undefined,
    };

    gdjs.evtTools.p2p = p2pMock;

    return {
      switchToPeer: ({ peerId, otherPeerIds, playerNumber }) => {
        // console.log('## SWITCHING TO PEER', peerId);

        // Switch the state of the P2P mock.
        p2pState.currentPeerId = peerId;
        p2pState.otherPeerIds = otherPeerIds;

        // Switch the state of the MultiplayerMessageManager.
        gdjs.multiplayerMessageManager = peerMultiplayerMessageManager[peerId] =
          peerMultiplayerMessageManager[peerId] ||
          gdjs.makeMultiplayerMessageManager();

        // Switch the state of the game.
        gdjs.multiplayer.playerNumber = playerNumber;
      },
      logEvents: () => {
        Object.keys(peerEvents).forEach((peerId) => {
          console.log(`## PEER ${peerId} events:`);
          for (const [eventName, event] of peerEvents[peerId]) {
            console.log(`${eventName}: ${JSON.stringify(event.data)}`);
          }
        });
      },
      markAllPeerEventsAsProcessed: () => {
        for (const events of Object.values(peerEvents)) {
          for (const event of events.values()) {
            event.popData();
          }
        }
      },
      expectNoEventsToBeProcessed: () => {
        for (const events of Object.values(peerEvents)) {
          for (const event of events.values()) {
            expect(event.isTriggered()).to.be(false);
          }
        }
      },
    };
  };

  let _originalP2pIfAny = undefined;

  beforeEach(() => {
    _originalP2pIfAny = gdjs.evtTools.p2p;
    gdjs.multiplayer.disableMultiplayerForTesting = false;
    gdjs.multiplayer.isGameRunning = true;
  });
  afterEach(() => {
    gdjs.evtTools.p2p = _originalP2pIfAny;
    gdjs.multiplayer.disableMultiplayerForTesting = true;
    gdjs.multiplayer.isGameRunning = false;
  });

  it('synchronizes scene variables from the server to other players', () => {
    let otherPeerIds = [];
    let currentPeerId = '';
    const {
      switchToPeer,
      logEvents,
      markAllPeerEventsAsProcessed,
    } = createP2PAndMultiplayerMessageManagerMock();

    switchToPeer({
      peerId: 'player-1',
      otherPeerIds: ['player-2'],
      playerNumber: 1,
    });

    const remoteRuntimeScene = makeTestRuntimeScene();
    const remoteVariable = new gdjs.Variable();
    remoteVariable.setString('Hello from remote world');
    remoteRuntimeScene.getVariables().add('MyRemoteVariable', remoteVariable);
    remoteRuntimeScene.renderAndStep(1000 / 60);

    switchToPeer({
      peerId: 'player-2',
      otherPeerIds: ['player-1'],
      playerNumber: 2,
    });

    const localRuntimeScene = makeTestRuntimeScene();
    localRuntimeScene.renderAndStep(1000 / 60);
    markAllPeerEventsAsProcessed();
    expect(localRuntimeScene.getVariables().has('MyRemoteVariable')).to.be(
      true
    );
    expect(
      localRuntimeScene.getVariables().get('MyRemoteVariable').getAsString()
    ).to.be('Hello from remote world');
  });

  it('synchronizes objects from the server to other players', () => {
    let otherPeerIds = [];
    let currentPeerId = '';
    const {
      switchToPeer,
      logEvents,
      markAllPeerEventsAsProcessed,
    } = createP2PAndMultiplayerMessageManagerMock();

    // Create an instance on the server:
    switchToPeer({
      peerId: 'player-1',
      otherPeerIds: ['player-2', 'player-3'],
      playerNumber: 1,
    });

    const remoteRuntimeScene = makeTestRuntimeScene();
    const mySpriteObject1 = remoteRuntimeScene.createObject('MySpriteObject');
    mySpriteObject1.setX(142);
    mySpriteObject1.setY(143);

    remoteRuntimeScene.renderAndStep(1000 / 60);

    // Check the object is created on the other peer.
    switchToPeer({
      peerId: 'player-2',
      otherPeerIds: ['player-1'],
      playerNumber: 2,
    });

    const localRuntimeScene = makeTestRuntimeScene();
    expect(localRuntimeScene.getObjects('MySpriteObject').length).to.be(0);
    localRuntimeScene.renderAndStep(1000 / 60);
    markAllPeerEventsAsProcessed();
    expect(localRuntimeScene.getObjects('MySpriteObject').length).to.be(1);
    expect(localRuntimeScene.getObjects('MySpriteObject')[0].getX()).to.be(142);
    expect(localRuntimeScene.getObjects('MySpriteObject')[0].getY()).to.be(143);

    // Move the object on the server:
    switchToPeer({
      peerId: 'player-1',
      otherPeerIds: ['player-2', 'player-3'],
      playerNumber: 1,
    });

    mySpriteObject1.getBehavior(
      'MultiplayerObject'
    )._objectMaxTickRate = Infinity;
    mySpriteObject1.setX(242);
    mySpriteObject1.setY(243);
    remoteRuntimeScene.renderAndStep(1000 / 60);

    // Check the object is moved on the other peer.
    switchToPeer({
      peerId: 'player-2',
      otherPeerIds: ['player-1'],
      playerNumber: 2,
    });
    localRuntimeScene.renderAndStep(1000 / 60);
    markAllPeerEventsAsProcessed();

    expect(localRuntimeScene.getObjects('MySpriteObject').length).to.be(1);
    expect(localRuntimeScene.getObjects('MySpriteObject')[0].getX()).to.be(242);
    expect(localRuntimeScene.getObjects('MySpriteObject')[0].getY()).to.be(243);

    // Destroy the object on the server:
    switchToPeer({
      peerId: 'player-1',
      otherPeerIds: ['player-2', 'player-3'],
      playerNumber: 1,
    });

    mySpriteObject1.deleteFromScene(remoteRuntimeScene);
    remoteRuntimeScene.renderAndStep(1000 / 60);

    // Check the object is deleted on the other peer.
    switchToPeer({
      peerId: 'player-2',
      otherPeerIds: ['player-1'],
      playerNumber: 2,
    });
    localRuntimeScene.renderAndStep(1000 / 60);
    markAllPeerEventsAsProcessed();

    expect(localRuntimeScene.getObjects('MySpriteObject').length).to.be(0);
  });

  it('synchronizes objects from a player to the server to other players', () => {
    let otherPeerIds = [];
    let currentPeerId = '';
    const {
      switchToPeer,
      logEvents,
      markAllPeerEventsAsProcessed,
    } = createP2PAndMultiplayerMessageManagerMock();

    // Create an instance on a player:
    switchToPeer({
      peerId: 'player-2',
      otherPeerIds: ['player-1'],
      playerNumber: 2,
    });

    const p2RuntimeScene = makeTestRuntimeScene();
    const mySpriteObject1 = p2RuntimeScene.createObject('MySpriteObject');
    mySpriteObject1.setX(142);
    mySpriteObject1.setY(143);
    mySpriteObject1
      .getBehavior('MultiplayerObject')
      .setPlayerObjectOwnership(2);

    p2RuntimeScene.renderAndStep(1000 / 60);

    // Check the object is created on the other server.
    switchToPeer({
      peerId: 'player-1',
      otherPeerIds: ['player-2', 'player-3'],
      playerNumber: 1,
    });

    const p1RuntimeScene = makeTestRuntimeScene();
    expect(p1RuntimeScene.getObjects('MySpriteObject').length).to.be(0);
    p1RuntimeScene.renderAndStep(1000 / 60);

    expect(p1RuntimeScene.getObjects('MySpriteObject').length).to.be(1);
    expect(p1RuntimeScene.getObjects('MySpriteObject')[0].getX()).to.be(142);
    expect(p1RuntimeScene.getObjects('MySpriteObject')[0].getY()).to.be(143);

    // Check the object is created on the other player.
    switchToPeer({
      peerId: 'player-3',
      otherPeerIds: ['player-1'],
      playerNumber: 3,
    });

    const p3RuntimeScene = makeTestRuntimeScene();
    expect(p3RuntimeScene.getObjects('MySpriteObject').length).to.be(0);
    p3RuntimeScene.renderAndStep(1000 / 60);

    expect(p3RuntimeScene.getObjects('MySpriteObject').length).to.be(1);
    expect(p3RuntimeScene.getObjects('MySpriteObject')[0].getX()).to.be(142);
    expect(p3RuntimeScene.getObjects('MySpriteObject')[0].getY()).to.be(143);

    markAllPeerEventsAsProcessed();

    // Move the object on the player:
    switchToPeer({
      peerId: 'player-2',
      otherPeerIds: ['player-1'],
      playerNumber: 2,
    });

    mySpriteObject1.getBehavior(
      'MultiplayerObject'
    )._objectMaxTickRate = Infinity;
    mySpriteObject1.setX(242);
    mySpriteObject1.setY(243);
    p2RuntimeScene.renderAndStep(1000 / 60);

    // Check the object is moved on the server.
    switchToPeer({
      peerId: 'player-1',
      otherPeerIds: ['player-2', 'player-3'],
      playerNumber: 1,
    });
    p1RuntimeScene.renderAndStep(1000 / 60);

    expect(p1RuntimeScene.getObjects('MySpriteObject').length).to.be(1);
    expect(p1RuntimeScene.getObjects('MySpriteObject')[0].getX()).to.be(242);
    expect(p1RuntimeScene.getObjects('MySpriteObject')[0].getY()).to.be(243);

    // Check the object is moved on the other player.
    switchToPeer({
      peerId: 'player-3',
      otherPeerIds: ['player-1'],
      playerNumber: 3,
    });
    p1RuntimeScene.renderAndStep(1000 / 60);
    markAllPeerEventsAsProcessed();

    expect(p1RuntimeScene.getObjects('MySpriteObject').length).to.be(1);
    expect(p1RuntimeScene.getObjects('MySpriteObject')[0].getX()).to.be(242);
    expect(p1RuntimeScene.getObjects('MySpriteObject')[0].getY()).to.be(243);

    // Destroy the object (on player 2):
    switchToPeer({
      peerId: 'player-2',
      otherPeerIds: ['player-1'],
      playerNumber: 2,
    });

    mySpriteObject1.deleteFromScene(p2RuntimeScene);
    p2RuntimeScene.renderAndStep(1000 / 60);

    // Check the object is deleted on the server.
    switchToPeer({
      peerId: 'player-1',
      otherPeerIds: ['player-2', 'player-3'],
      playerNumber: 1,
    });

    expect(p1RuntimeScene.getObjects('MySpriteObject').length).to.be(1);
    p1RuntimeScene.renderAndStep(1000 / 60);
    expect(p1RuntimeScene.getObjects('MySpriteObject').length).to.be(0);

    // Check the object is deleted on the other player.
    switchToPeer({
      peerId: 'player-3',
      otherPeerIds: ['player-1'],
      playerNumber: 3,
    });

    expect(p3RuntimeScene.getObjects('MySpriteObject').length).to.be(1);
    p3RuntimeScene.renderAndStep(1000 / 60);
    expect(p3RuntimeScene.getObjects('MySpriteObject').length).to.be(0);

    markAllPeerEventsAsProcessed();
  });

  it('reconciles an instance owned by a player with a "ghost" instance created on other peers without a network ID (as not owned by them)', () => {
    let otherPeerIds = [];
    let currentPeerId = '';
    const {
      switchToPeer,
      logEvents,
      markAllPeerEventsAsProcessed,
    } = createP2PAndMultiplayerMessageManagerMock();

    // Create an instance on a player:
    switchToPeer({
      peerId: 'player-2',
      otherPeerIds: ['player-1'],
      playerNumber: 2,
    });

    const p2RuntimeScene = makeTestRuntimeScene();
    const mySpriteObject1 = p2RuntimeScene.createObject('MySpriteObject');
    mySpriteObject1.setX(142);
    mySpriteObject1.setY(143);
    mySpriteObject1
      .getBehavior('MultiplayerObject')
      .setPlayerObjectOwnership(2);

    p2RuntimeScene.renderAndStep(1000 / 60);

    // Check the object is created on the other server.
    switchToPeer({
      peerId: 'player-1',
      otherPeerIds: ['player-2', 'player-3'],
      playerNumber: 1,
    });

    const p1RuntimeScene = makeTestRuntimeScene();
    expect(p1RuntimeScene.getObjects('MySpriteObject').length).to.be(0);
    p1RuntimeScene.renderAndStep(1000 / 60);

    expect(p1RuntimeScene.getObjects('MySpriteObject').length).to.be(1);
    expect(p1RuntimeScene.getObjects('MySpriteObject')[0].getX()).to.be(142);
    expect(p1RuntimeScene.getObjects('MySpriteObject')[0].getY()).to.be(143);

    // Check the object is created on the other player.
    switchToPeer({
      peerId: 'player-3',
      otherPeerIds: ['player-1'],
      playerNumber: 3,
    });

    const p3RuntimeScene = makeTestRuntimeScene();
    expect(p3RuntimeScene.getObjects('MySpriteObject').length).to.be(0);
    p3RuntimeScene.renderAndStep(1000 / 60);

    expect(p3RuntimeScene.getObjects('MySpriteObject').length).to.be(1);
    expect(p3RuntimeScene.getObjects('MySpriteObject')[0].getX()).to.be(142);
    expect(p3RuntimeScene.getObjects('MySpriteObject')[0].getY()).to.be(143);

    markAllPeerEventsAsProcessed();

    // Now, create a new instance on the server and player 3, but owned by player 2.
    // We call this in this test a "ghost" instance as it would be deleted if not "reconcilied".
    // We can assume it's because there is some common logic running for all players
    // resulting in the creation of this instance everywhere.

    switchToPeer({
      peerId: 'player-1',
      otherPeerIds: ['player-2', 'player-3'],
      playerNumber: 1,
    });
    const p1GhostInstance = p1RuntimeScene.createObject('MySpriteObject');
    p1GhostInstance
      .getBehavior('MultiplayerObject')
      .setPlayerObjectOwnership(2);
    p1RuntimeScene.renderAndStep(1000 / 60);

    expect(p1RuntimeScene.getObjects('MySpriteObject').length).to.be(2);
    expect(p1RuntimeScene.getObjects('MySpriteObject')[0].getX()).to.be(142);
    expect(p1RuntimeScene.getObjects('MySpriteObject')[0].getY()).to.be(143);
    expect(p1RuntimeScene.getObjects('MySpriteObject')[1].getX()).to.be(0);
    expect(p1RuntimeScene.getObjects('MySpriteObject')[1].getY()).to.be(0);

    switchToPeer({
      peerId: 'player-3',
      otherPeerIds: ['player-1'],
      playerNumber: 3,
    });
    const p3GhostInstance = p3RuntimeScene.createObject('MySpriteObject');
    p1GhostInstance
      .getBehavior('MultiplayerObject')
      .setPlayerObjectOwnership(2);
    p3RuntimeScene.renderAndStep(1000 / 60);

    expect(p3RuntimeScene.getObjects('MySpriteObject').length).to.be(2);
    expect(p3RuntimeScene.getObjects('MySpriteObject')[0].getX()).to.be(142);
    expect(p3RuntimeScene.getObjects('MySpriteObject')[0].getY()).to.be(143);
    expect(p3RuntimeScene.getObjects('MySpriteObject')[1].getX()).to.be(0);
    expect(p3RuntimeScene.getObjects('MySpriteObject')[1].getY()).to.be(0);

    // Create an instance on player 2, owned by player 2.
    switchToPeer({
      peerId: 'player-2',
      otherPeerIds: ['player-1'],
      playerNumber: 2,
    });
    const p2NewInstance = p2RuntimeScene.createObject('MySpriteObject');
    p2NewInstance.setX(42);
    p2NewInstance.setY(43);
    p2NewInstance.getBehavior('MultiplayerObject').setPlayerObjectOwnership(2);
    p2RuntimeScene.renderAndStep(1000 / 60);

    // Verify the server and player 3 are notified of the new instance, and that they reuse
    // their "ghost" instance for it.

    switchToPeer({
      peerId: 'player-1',
      otherPeerIds: ['player-2', 'player-3'],
      playerNumber: 1,
    });

    p1RuntimeScene.renderAndStep(1000 / 60);
    expect(p1RuntimeScene.getObjects('MySpriteObject').length).to.be(2);
    expect(p1RuntimeScene.getObjects('MySpriteObject')[0].getX()).to.be(142);
    expect(p1RuntimeScene.getObjects('MySpriteObject')[0].getY()).to.be(143);
    expect(p1RuntimeScene.getObjects('MySpriteObject')[1].getX()).to.be(42);
    expect(p1RuntimeScene.getObjects('MySpriteObject')[1].getY()).to.be(43);

    switchToPeer({
      peerId: 'player-3',
      otherPeerIds: ['player-1'],
      playerNumber: 3,
    });

    p3RuntimeScene.renderAndStep(1000 / 60);
    expect(p3RuntimeScene.getObjects('MySpriteObject').length).to.be(2);
    expect(p3RuntimeScene.getObjects('MySpriteObject')[0].getX()).to.be(142);
    expect(p3RuntimeScene.getObjects('MySpriteObject')[0].getY()).to.be(143);
    expect(p3RuntimeScene.getObjects('MySpriteObject')[1].getX()).to.be(42);
    expect(p3RuntimeScene.getObjects('MySpriteObject')[1].getY()).to.be(43);

    markAllPeerEventsAsProcessed();
  });

  it('deletes an instance owned by another player after a bit (if not "reconciled" in the meantime)', async () => {
    let otherPeerIds = [];
    let currentPeerId = '';
    const {
      switchToPeer,
      logEvents,
      markAllPeerEventsAsProcessed,
    } = createP2PAndMultiplayerMessageManagerMock();

    // Create an instance on a player (2), owned by another player (3).
    // We can assume it's because there is some common logic running for all players
    // resulting in the creation of this instance everywhere.

    switchToPeer({
      peerId: 'player-2',
      otherPeerIds: ['player-1'],
      playerNumber: 2,
    });

    const p2RuntimeScene = makeTestRuntimeScene();
    const mySpriteObject1 = p2RuntimeScene.createObject('MySpriteObject');
    mySpriteObject1.setX(142);
    mySpriteObject1.setY(143);
    mySpriteObject1
      .getBehavior('MultiplayerObject')
      .setPlayerObjectOwnership(3);

    p2RuntimeScene.renderAndStep(1000 / 60);
    expect(p2RuntimeScene.getObjects('MySpriteObject').length).to.be(1);

    await delay(20);

    p2RuntimeScene.renderAndStep(1000 / 60);
    expect(p2RuntimeScene.getObjects('MySpriteObject').length).to.be(1);

    // After some time, the instance should be deleted as it is owned by another player
    // and was never synchronized since then. Player 3 probably created an instance for a logic
    // that was run too early, or never ran on the other players.
    await delay(500);

    p2RuntimeScene.renderAndStep(1000 / 60);
    expect(p2RuntimeScene.getObjects('MySpriteObject').length).to.be(0);
  });

  it('gives priority to the first ownership change and revert the wrong one', async () => {
    let otherPeerIds = [];
    let currentPeerId = '';
    const {
      switchToPeer,
      logEvents,
      markAllPeerEventsAsProcessed,
      expectNoEventsToBeProcessed,
    } = createP2PAndMultiplayerMessageManagerMock();

    // Create an instance on the server:
    switchToPeer({
      peerId: 'player-1',
      otherPeerIds: ['player-2', 'player-3'],
      playerNumber: 1,
    });

    const p1RuntimeScene = makeTestRuntimeScene();
    {
      const mySpriteObject1 = p1RuntimeScene.createObject('MySpriteObject');
      mySpriteObject1.setX(142);
      mySpriteObject1.setY(143);
      mySpriteObject1.getBehavior('MultiplayerObject');
    }
    // No ownership given, it's owned by the server.

    p1RuntimeScene.renderAndStep(1000 / 60);

    // Check the object is created on the other players.
    switchToPeer({
      peerId: 'player-2',
      otherPeerIds: ['player-1'],
      playerNumber: 2,
    });

    const p2RuntimeScene = makeTestRuntimeScene();
    expect(p2RuntimeScene.getObjects('MySpriteObject').length).to.be(0);
    p2RuntimeScene.renderAndStep(1000 / 60);

    expect(p2RuntimeScene.getObjects('MySpriteObject').length).to.be(1);
    expect(p2RuntimeScene.getObjects('MySpriteObject')[0].getX()).to.be(142);
    expect(p2RuntimeScene.getObjects('MySpriteObject')[0].getY()).to.be(143);

    switchToPeer({
      peerId: 'player-3',
      otherPeerIds: ['player-1'],
      playerNumber: 3,
    });

    const p3RuntimeScene = makeTestRuntimeScene();
    expect(p3RuntimeScene.getObjects('MySpriteObject').length).to.be(0);
    p3RuntimeScene.renderAndStep(1000 / 60);

    expect(p3RuntimeScene.getObjects('MySpriteObject').length).to.be(1);
    expect(p3RuntimeScene.getObjects('MySpriteObject')[0].getX()).to.be(142);
    expect(p3RuntimeScene.getObjects('MySpriteObject')[0].getY()).to.be(143);

    markAllPeerEventsAsProcessed();

    // Now, try to change ownership to player 2 and 3 at the "same time".
    switchToPeer({
      peerId: 'player-2',
      otherPeerIds: ['player-1'],
      playerNumber: 2,
    });

    p2RuntimeScene
      .getObjects('MySpriteObject')[0]
      .getBehavior('MultiplayerObject')
      .setPlayerObjectOwnership(2);
    p2RuntimeScene.renderAndStep(1000 / 60);

    switchToPeer({
      peerId: 'player-3',
      otherPeerIds: ['player-1'],
      playerNumber: 3,
    });
    p3RuntimeScene
      .getObjects('MySpriteObject')[0]
      .getBehavior('MultiplayerObject')
      .setPlayerObjectOwnership(3);
    p3RuntimeScene.renderAndStep(1000 / 60);

    // Verify the server honors the first one (ownership change from 0 to 2).
    switchToPeer({
      peerId: 'player-1',
      otherPeerIds: ['player-2', 'player-3'],
      playerNumber: 1,
    });
    expect(
      p1RuntimeScene
        .getObjects('MySpriteObject')[0]
        .getBehavior('MultiplayerObject')
        .getPlayerObjectOwnership()
    ).to.be(0);
    p1RuntimeScene.renderAndStep(1000 / 60);
    expect(
      p1RuntimeScene
        .getObjects('MySpriteObject')[0]
        .getBehavior('MultiplayerObject')
        .getPlayerObjectOwnership()
    ).to.be(2);

    markAllPeerEventsAsProcessed();

    // Wait so that player 3 retries.
    await delay(210);

    // Try 4 times and wait for more than 200ms between each try.
    for (let i = 0; i < 4; i++) {
      switchToPeer({
        peerId: 'player-3',
        otherPeerIds: ['player-1'],
        playerNumber: 3,
      });

      p3RuntimeScene.renderAndStep(1000 / 60);
      expect(
        p3RuntimeScene
          .getObjects('MySpriteObject')[0]
          .getBehavior('MultiplayerObject')
          .getPlayerObjectOwnership()
      ).to.be(3);

      markAllPeerEventsAsProcessed();

      await delay(210);
    }

    // Check ownership was reverted.
    p3RuntimeScene.renderAndStep(1000 / 60);
    expect(
      p3RuntimeScene
        .getObjects('MySpriteObject')[0]
        .getBehavior('MultiplayerObject')
        .getPlayerObjectOwnership()
    ).to.be(0);
    markAllPeerEventsAsProcessed();

    // Move the object on the player 2:
    switchToPeer({
      peerId: 'player-2',
      otherPeerIds: ['player-1'],
      playerNumber: 2,
    });

    {
      const mySpriteObject = p2RuntimeScene.getObjects('MySpriteObject')[0];
      mySpriteObject.getBehavior(
        'MultiplayerObject'
      )._objectMaxTickRate = Infinity;
      mySpriteObject.setX(242);
      mySpriteObject.setY(243);
      p2RuntimeScene.renderAndStep(1000 / 60);
    }

    // Check the object is moved on the server.
    switchToPeer({
      peerId: 'player-1',
      otherPeerIds: ['player-2', 'player-3'],
      playerNumber: 1,
    });
    p1RuntimeScene.renderAndStep(1000 / 60);

    expect(p1RuntimeScene.getObjects('MySpriteObject').length).to.be(1);
    expect(p1RuntimeScene.getObjects('MySpriteObject')[0].getX()).to.be(242);
    expect(p1RuntimeScene.getObjects('MySpriteObject')[0].getY()).to.be(243);

    // Check the object is moved on the other player.
    switchToPeer({
      peerId: 'player-3',
      otherPeerIds: ['player-1'],
      playerNumber: 3,
    });
    p3RuntimeScene.renderAndStep(1000 / 60);

    expect(p3RuntimeScene.getObjects('MySpriteObject').length).to.be(1);
    expect(p3RuntimeScene.getObjects('MySpriteObject')[0].getX()).to.be(242);
    expect(p3RuntimeScene.getObjects('MySpriteObject')[0].getY()).to.be(243);

    // Check that ownership is also updated to the latest up-to-date value.
    expect(
      p3RuntimeScene
        .getObjects('MySpriteObject')[0]
        .getBehavior('MultiplayerObject')
        .getPlayerObjectOwnership()
    ).to.be(2);

    markAllPeerEventsAsProcessed();
  });
});
