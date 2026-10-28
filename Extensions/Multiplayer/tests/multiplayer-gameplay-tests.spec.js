// @ts-check

describe('Multiplayer gameplay test helpers (harness.multiplayer)', () => {
  /** What the events of the scene saw, frame after frame. */
  let eventsLog = {
    /** @type {Array<string>} */
    receivedCustomMessages: [],
    lobbyGameJustStartedCount: 0,
  };

  beforeEach(() => {
    eventsLog = { receivedCustomMessages: [], lobbyGameJustStartedCount: 0 };
    gdjs.multiplayer.disableMultiplayerForTesting = false;
    // The events of the scene.
    gdjs['MultiplayerTestSceneCode'] = {
      func: () => {
        if (
          gdjs.multiplayerMessageManager.hasCustomMessageBeenReceived('Hello')
        ) {
          eventsLog.receivedCustomMessages.push(
            gdjs.multiplayerMessageManager.getCustomMessageData('Hello')
          );
        }
        if (gdjs.multiplayer.hasLobbyGameJustStarted()) {
          eventsLog.lobbyGameJustStartedCount++;
        }
      },
    };
  });

  afterEach(() => {
    gdjs.multiplayer.disableMultiplayerForTesting = true;
    delete gdjs['MultiplayerTestSceneCode'];
  });

  /**
   * @param {string} name
   * @param {string | number} playerNumber
   * @param {Array<BehaviorData>} otherBehaviors
   * @returns {ObjectData}
   */
  const createSynchronizedObjectData = (name, playerNumber, otherBehaviors) =>
    /** @type {any} */ ({
      name,
      type: '',
      variables: [{ name: 'Name', type: 'string', value: '' }],
      effects: [],
      behaviors: [
        {
          name: 'MultiplayerObject',
          type: 'Multiplayer::MultiplayerObjectBehavior',
          playerNumber,
          actionOnPlayerDisconnect: 'DestroyObject',
        },
        ...otherBehaviors,
      ],
    });

  /**
   * A scene with a "Player" object owned by player 1 (with a platformer
   * behavior, synchronized like any other behavior), a "Crate" owned by the
   * host, placed in the scene, and a "Token" owned by the host.
   * @returns {LayoutData}
   */
  const createSceneData = () =>
    /** @type {any} */ ({
      name: 'MultiplayerTestScene',
      mangledName: 'MultiplayerTestScene',
      title: '',
      r: 0,
      v: 0,
      b: 0,
      stopSoundsOnStartup: false,
      variables: [],
      behaviorsSharedData: [],
      usedResources: [],
      objectsGroups: [],
      layers: [{ name: '', visibility: true, effects: [], cameras: [] }],
      objects: [
        createSynchronizedObjectData('Player', 1, [
          /** @type {any} */ ({
            name: 'PlatformerObject',
            type: 'PlatformBehavior::PlatformerObjectBehavior',
            gravity: 1500,
            maxFallingSpeed: 1500,
            acceleration: 500,
            deceleration: 1500,
            maxSpeed: 500,
            jumpSpeed: 900,
            canGrabPlatforms: false,
            ignoreDefaultControls: false,
            slopeMaxAngle: 60,
            jumpSustainTime: 0.2,
            useLegacyTrajectory: false,
            useRepeatedJump: false,
          }),
        ]),
        createSynchronizedObjectData('Crate', 'Host', []),
        createSynchronizedObjectData('Token', 'Host', []),
      ],
      instances: [
        {
          persistentUuid: 'crate-1',
          layer: '',
          locked: false,
          name: 'Crate',
          x: 400,
          y: 300,
          angle: 0,
          zOrder: 0,
          customSize: false,
          width: 0,
          height: 0,
          numberProperties: [],
          stringProperties: [],
          initialVariables: [],
        },
      ],
    });

  /**
   * @param {string} source
   */
  const runTestScript = (source) =>
    gdjs.gameplayTests.runGameplayTest(
      gdjs.getPixiRuntimeGame({ layouts: [createSceneData()] }),
      { testName: 'Test', source, timeoutMs: 10000 }
    );

  const startAsHostSource = `
    await harness.goToScene('MultiplayerTestScene');
    await harness.multiplayer.startLobbyGame({
      playerNumber: 1,
      isHost: true,
      players: [{ playerNumber: 1, username: 'Alice' }, { playerNumber: 2, username: 'Bob' }],
    });
  `;

  const startAsPlayer2Source = `
    await harness.goToScene('MultiplayerTestScene');
    await harness.multiplayer.startLobbyGame({
      playerNumber: 2,
      isHost: false,
      players: [{ playerNumber: 1, username: 'Alice' }, { playerNumber: 2, username: 'Bob' }],
    });
  `;

  /** @param {gdjs.gameplayTests.GameplayTestResult} result */
  const expectPassed = (result) => {
    expect(result.errors).to.eql([]);
    expect(result.status).to.be('passed');
  };

  it('starts a lobby game as the host, with the other players connected', async () => {
    const result = await runTestScript(`
      ${startAsHostSource}
      harness.assert(gdjs.multiplayer.isLobbyGameRunning(), 'The lobby game is running.');
      harness.assert(gdjs.multiplayer.isCurrentPlayerHost(), 'The player is the host.');
      harness.assert(gdjs.multiplayer.getCurrentPlayerNumber() === 1, 'The player is player 1.');
      harness.assert(gdjs.multiplayer.getPlayersInLobbyCount() === 2, 'Two players are connected, not ' + gdjs.multiplayer.getPlayersInLobbyCount() + '.');
      harness.assert(gdjs.multiplayer.getPlayerUsername(2) === 'Bob', 'Player 2 is Bob.');
      harness.assert(gdjs.multiplayer.getCurrentPlayerUsername() === 'Alice', 'The player is Alice.');
      await harness.stepFrames(2);
    `);

    expectPassed(result);
    expect(eventsLog.lobbyGameJustStartedCount).to.be(1);
    // Everything is put back at the end of the test.
    expect(gdjs.multiplayer.isLobbyGameRunning()).to.be(false);
    expect(gdjs.multiplayer.getCurrentPlayerNumber()).to.be(0);
  });

  it('starts a lobby game as a player who is not the host', async () => {
    const result = await runTestScript(`
      ${startAsPlayer2Source}
      harness.assert(!gdjs.multiplayer.isCurrentPlayerHost(), 'The player is not the host.');
      harness.assert(gdjs.multiplayer.getCurrentPlayerNumber() === 2, 'The player is player 2.');
      harness.assert(gdjs.multiplayer.getPlayerUsername(1) === 'Alice', 'Player 1 is Alice.');
      harness.assert(gdjs.multiplayer.getCurrentPlayerUsername() === 'Bob', 'The player is Bob.');
    `);

    expectPassed(result);
  });

  it('creates and updates the instances of other players through the network messages', async () => {
    const result = await runTestScript(`
      ${startAsHostSource}
      const id = await harness.multiplayer.addRemoteInstance('Token', { owner: 2, x: 100, y: 200, variables: { Name: 'Bob' } });
      let token = harness.getObjects('Token').find((object) => object.id === id);
      const runtimeToken = harness.getRuntimeObject(id);
      harness.assert(token.x === 100 && token.y === 200, 'The instance is where player 2 put it.');
      harness.assert(harness.getObjectVariable(id, 'Name').value === 'Bob', 'The instance has the variables of player 2.');
      harness.assert(runtimeToken.getBehavior('MultiplayerObject').getPlayerObjectOwnership() === 2, 'The instance is owned by player 2.');
      harness.assert(!!runtimeToken.networkId, 'The instance has a network id.');

      harness.multiplayer.receiveUpdate(id, { x: 300 });
      await harness.stepFrames(1);
      token = harness.getObjects('Token').find((object) => object.id === id);
      harness.assert(token.x === 300 && token.y === 200, 'The instance is moved by the update of player 2.');
    `);

    expectPassed(result);
  });

  it('tells when the game ignores the instance created by another player, as it owns the object by default', async () => {
    const result = await runTestScript(`
      ${startAsHostSource}
      await harness.multiplayer.addRemoteInstance('Player', { owner: 2, x: 100, y: 200 });
    `);

    expect(result.status).to.be('error');
    expect(result.errors[0]).to.contain(
      'The instance of "Player" was created, but the game ignored the state sent by player 2: the object is owned by player 1 by default'
    );
  });

  it('refuses to update an instance owned by the player of the game', async () => {
    const result = await runTestScript(`
      ${startAsHostSource}
      harness.multiplayer.receiveUpdate(harness.getObjects('Crate')[0].id, { x: 0 });
    `);

    expect(result.status).to.be('error');
    expect(result.errors[0]).to.contain(
      'is owned by the player of the game: the game ignores the updates of its own instances from the network.'
    );
  });

  it('lists the messages sent to the other players', async () => {
    const result = await runTestScript(`
      ${startAsHostSource}
      const player = harness.getCurrentRuntimeScene().createObject('Player');
      player.setPosition(50, 60);
      await harness.stepFrames(3);
      const updates = harness.multiplayer.getSentMessages({ type: 'updateInstance', name: 'Player' });
      harness.assert(updates.length > 0, 'The instance of the player is sent to the others.');
      harness.assert(updates[0].instanceId === player.id && updates[0].owner === 1, 'The updates are about this instance: ' + JSON.stringify(updates[0]));
      harness.assert(JSON.stringify(updates[0].to) === '[2]', 'The updates are sent to player 2.');
      harness.assert(updates[0].data.x === 50 && !!updates[0].data.beh.PlatformerObject, 'The updates hold the state and the behaviors: ' + JSON.stringify(updates[0].data));
    `);

    expectPassed(result);
  });

  it('receives custom messages, acknowledges them and relays them as the host', async () => {
    const result = await runTestScript(`
      ${startAsHostSource}
      harness.multiplayer.receiveCustomMessage('Hello', 'world', 2);
      await harness.stepFrames(1);
      const acknowledgments = harness.multiplayer.getSentMessages({ type: 'ackCustomMessage', name: 'Hello' });
      harness.assert(acknowledgments.length === 1 && JSON.stringify(acknowledgments[0].to) === '[2]', 'The message is acknowledged to player 2: ' + JSON.stringify(acknowledgments));
      const relayedMessages = harness.multiplayer.getSentMessages({ type: 'customMessage', name: 'Hello' });
      harness.assert(relayedMessages.length === 1 && relayedMessages[0].data === 'world', 'The host relays the message: ' + JSON.stringify(relayedMessages));
    `);

    expectPassed(result);
    expect(eventsLog.receivedCustomMessages).to.eql(['world']);
  });

  it('gives the instances owned by the host and placed in the scene their network id, for a player who is not the host', async () => {
    const result = await runTestScript(`
      ${startAsPlayer2Source}
      await harness.goToScene('MultiplayerTestScene');
      const crate = harness.getObjects('Crate')[0];
      await harness.stepFrames(3);
      // Longer than the delay after which the extension deletes the
      // synchronized instances without network id.
      await new Promise((resolve) => setTimeout(resolve, 600));
      await harness.stepFrames(1);
      const crates = harness.getObjects('Crate');
      harness.assert(crates.length === 1 && crates[0].id === crate.id, 'The crate is kept.');
      harness.assert(!!harness.getRuntimeObject(crate.id).networkId, 'The crate has a network id.');
    `);

    expectPassed(result);
  }).timeout(5000);

  it('reproduces the instances placed in the scene deleted when the scene is slow to load', async () => {
    const result = await runTestScript(`
      ${startAsPlayer2Source}
      await harness.goToScene('MultiplayerTestScene');
      const crate = harness.getObjects('Crate')[0];
      await harness.multiplayer.simulateSlowSceneLoad(600);
      await harness.stepFrames(3);
      harness.assert(!harness.getRuntimeObject(crate.id), 'The crate placed in the scene was deleted.');
      harness.assert(harness.getObjects('Crate').length === 1, 'The crate of the host was created again from its update.');
    `);

    expectPassed(result);
  }).timeout(5000);

  it('puts back the multiplayer extension as it was at the end of the test', async () => {
    const peerJsHelper = gdjs.multiplayerPeerJsHelper;
    const sendDataTo = peerJsHelper.sendDataTo;
    const messageManager = gdjs.multiplayerMessageManager;

    const result = await runTestScript(`
      ${startAsHostSource}
      harness.fail('Failing in the middle of the test');
    `);

    expect(result.status).to.be('failed');
    expect(gdjs.multiplayerPeerJsHelper.sendDataTo).to.be(sendDataTo);
    expect(gdjs.multiplayerMessageManager).to.be(messageManager);
    expect(gdjs.multiplayer.isLobbyGameRunning()).to.be(false);
    expect(gdjs.multiplayer.hasLobbyGameJustEnded()).to.be(false);
  });

  it('asks to start a lobby game first', async () => {
    const result = await runTestScript(`
      await harness.goToScene('MultiplayerTestScene');
      harness.multiplayer.receiveCustomMessage('Hello', 'world', 2);
    `);

    expect(result.status).to.be('error');
    expect(result.errors[0]).to.contain(
      'No lobby game is running: call `await harness.multiplayer.startLobbyGame(...)` first.'
    );
  });
});
