// @ts-check

describe('Multiplayer', () => {
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
  const createP2PMock = () => {
    const state = {
      currentPeerId: '',
      otherPeerIds: [],
    };

    /** @type {Record<string, Map<string, MockedEvent>>} */
    const peerEvents = {};

    const getPeerEvents = (peerId) =>
      (peerEvents[peerId] = peerEvents[peerId] || new Map());

    /**
     * @param {string} eventName
     * @returns {gdjs.evtTools.p2p.IEvent}
     */
    const getEvent = (eventName) => {
      const events = getPeerEvents(state.currentPeerId);
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
      onEvent: (eventName) => {
        const event = getEvent(eventName);
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
        state.otherPeerIds.forEach((peerId) => {
          sendDataTo(peerId, eventName, eventData);
        });
      },
      getEventData: (eventName) => getEvent(eventName).getData(),
      getEventSender: (eventName) => getEvent(eventName).getSender(),
      getEvents: () => getPeerEvents(state.currentPeerId),
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
      getAllPeers: () => state.otherPeerIds,
      getConnectionInstance: () => undefined,
    };

    gdjs.evtTools.p2p = p2pMock;

    return {
      switchToPeer: ({ peerId, otherPeerIds, playerNumber }) => {
        state.currentPeerId = peerId;
        state.otherPeerIds = otherPeerIds;
        gdjs.multiplayer.playerNumber = playerNumber;
      },
      logEvents: () => {
        Object.keys(peerEvents).forEach((peerId) => {
          console.log(peerId, [...peerEvents[peerId].keys()]);
        });
      },
      markAllPeerEventsAsProcessed: () => {
        for (const events of Object.values(peerEvents)) {
          for (const event of events.values()) {
            event.popData();
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

  it('properly synchronize scene variables from the server to other players', () => {
    let otherPeerIds = [];
    let currentPeerId = '';
    const { switchToPeer, logEvents, markAllPeerEventsAsProcessed } =
      createP2PMock();

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

  it('properly synchronize objects from the server to other players', () => {
    let otherPeerIds = [];
    let currentPeerId = '';
    const { switchToPeer, logEvents, markAllPeerEventsAsProcessed } =
      createP2PMock();

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
      otherPeerIds: ['player-1', 'player-3'],
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

    mySpriteObject1.getBehavior('MultiplayerObject')._objectMaxTickRate =
      Infinity;
    mySpriteObject1.setX(242);
    mySpriteObject1.setY(243);
    remoteRuntimeScene.renderAndStep(1000 / 60);

    // Check the object is moved on the other peer.
    switchToPeer({
      peerId: 'player-2',
      otherPeerIds: ['player-1', 'player-3'],
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
      otherPeerIds: ['player-1', 'player-3'],
      playerNumber: 2,
    });
    localRuntimeScene.renderAndStep(1000 / 60);
    markAllPeerEventsAsProcessed();

    expect(localRuntimeScene.getObjects('MySpriteObject').length).to.be(0);
  });
});
