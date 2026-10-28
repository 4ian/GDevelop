/*
 * GDevelop - Multiplayer Extension
 * Copyright (c) 2013-present Florian Rival (Florian.Rival@gmail.com)
 * This project is released under the MIT License.
 */
namespace gdjs {
  /**
   * Included only in the games running gameplay tests (see
   * `addGameplayTestIncludeFile` in `JsExtension.js`).
   */
  export namespace gameplayTests {
    export interface GameplayTestHarness {
      /**
       * Test a game made with the multiplayer extension: start a lobby game
       * without network, simulate the other players and read what the game
       * sends to them. See `gdjs.MultiplayerGameplayTestHelpers`.
       */
      multiplayer: gdjs.MultiplayerGameplayTestHelpers;
    }
  }

  /** A player of a lobby game started by a gameplay test. */
  export type MultiplayerGameplayTestPlayer = {
    playerNumber: integer;
    username?: string;
  };

  /**
   * A message the game sent to the other players. `type` is the kind of
   * message: `updateInstance`, `changeInstanceOwner`, `destroyInstance`,
   * `customMessage`, `updateScene`, `updateGame`, `heartbeat`...
   */
  export type MultiplayerGameplayTestSentMessage = {
    /** The harness frame during which the message was sent. */
    frame: integer;
    type: string;
    /** The name of a custom message, the object name of an instance
     * message, null otherwise. */
    name: string | null;
    /** For an instance message: the id of the instance in the game, or null
     * when it is not in the scene anymore. */
    instanceId?: integer | null;
    /** For an instance message: its owner (0 for the host). */
    owner?: integer;
    /** The player numbers the message was sent to. */
    to: Array<integer>;
    /** What was sent: the synchronized state for an instance update (`x`,
     * `y`, `z`, `a` for the angle, `beh` for the behaviors, `var` for the
     * variables...), the data of a custom message. */
    data: any;
  };

  /**
   * A message from another player, built when it is delivered to the game,
   * or `'later'` when it can't be delivered yet, or `'never'` when it can't
   * be delivered anymore (it was about a scene that was left).
   */
  type SimulatedIncomingMessage = (runtimeScene: gdjs.RuntimeScene) =>
    | {
        messageName: string;
        data: object;
        senderPeerId: string;
      }
    | 'later'
    | 'never';

  type SimulatedLobby = {
    playerNumber: integer;
    hostPlayerNumber: integer;
    isHost: boolean;
    players: Array<{ playerNumber: integer; username: string }>;
    acknowledgeMessages: boolean;
  };

  const getPeerIdOfPlayer = (playerNumber: integer) =>
    `gameplay-test-player-${playerNumber}`;

  const getPlayerNumberOfPeerId = (peerId: string): integer =>
    parseInt(peerId.replace('gameplay-test-player-', ''), 10);

  /** The prefix of the acknowledgment sent back by a player receiving a
   * message that must be acknowledged (see `MultiplayerMessageManager`). */
  const acknowledgmentPrefixes: { [messageNamePrefix: string]: string } = {
    '#customMessage': '#ackCustomMessage',
    '#changeInstanceOwner': '#instanceOwnerChanged',
    '#destroyInstance': '#instanceDestroyed',
    '#changeVariableOwner': '#variableOwnerChanged',
  };

  const instanceMessageNameRegex = /#owner_(\d+)#object_(.+?)#instance_([^#]+)/;
  const customMessageNameRegex = /^#(?:customMessage|ackCustomMessage)#(.+)$/;

  /** The messages kept by `getSentMessages` (the oldest are dropped). */
  const MAX_SENT_MESSAGES = 5000;

  class SimulatedMessagesList
    implements gdjs.multiplayerPeerJsHelper.IMessagesList
  {
    private readonly _name: string;
    private readonly _messages: Array<gdjs.multiplayerPeerJsHelper.IMessageData> =
      [];

    constructor(name: string) {
      this._name = name;
    }

    getName(): string {
      return this._name;
    }

    getMessages(): Array<gdjs.multiplayerPeerJsHelper.IMessageData> {
      return this._messages;
    }

    pushMessage(data: object, sender: string): void {
      this._messages.push({
        data,
        sender,
        getData: () => data,
        getSender: () => sender,
      });
    }

    clear(): void {
      this._messages.length = 0;
    }
  }

  /**
   * The multiplayer helpers of the gameplay test harness (`harness.multiplayer`).
   *
   * They replace the peer-to-peer connection by a simulated one, and feed the
   * game with the messages the other players would send: everything else
   * goes through the real code of the extension (handling of the messages,
   * `updateFromNetworkSyncData`, ownership, acknowledgments...).
   *
   * Messages from the other players are delivered at the beginning of the
   * next stepped frame, like messages arriving from the network between two
   * frames.
   * @category Multiplayer
   */
  export class MultiplayerGameplayTestHelpers {
    private _harness: gdjs.gameplayTests.GameplayTestHarness;
    private _lobby: SimulatedLobby | null = null;
    private _messagesLists = new Map<string, SimulatedMessagesList>();
    private _incomingMessages: Array<SimulatedIncomingMessage> = [];
    private _sentMessages: Array<
      MultiplayerGameplayTestSentMessage & { instanceNetworkId?: string }
    > = [];
    /** The last clock sent for each instance (see `_clock` in messages). */
    private _clocksByNetworkId = new Map<string, integer>();
    /** The scenes the simulated host already announced (see
     * `_simulateHostOfScene`). */
    private _scenesAnnouncedByHost = new WeakSet<gdjs.RuntimeScene>();

    constructor(harness: gdjs.gameplayTests.GameplayTestHarness) {
      this._harness = harness;
    }

    /**
     * Make the game believe a lobby game is running, with no network: the
     * current player is `playerNumber`, host or not, with the other
     * `players` connected (the host is player 1, or `playerNumber` when
     * `isHost`). Like a real lobby, the connection to the other players
     * is established first, then the game starts: "Lobby game has just
     * started" is true during the next frame. Steps 1 frame.
     *
     * The simulated players acknowledge the messages that must be (custom
     * messages, ownership changes, destructions), unless
     * `acknowledgeMessages` is false.
     */
    async startLobbyGame(options: {
      playerNumber: integer;
      isHost: boolean;
      players: Array<MultiplayerGameplayTestPlayer>;
      acknowledgeMessages?: boolean;
    }): Promise<void> {
      if (this._lobby) {
        throw new Error('A lobby game was already started by this test.');
      }
      if (
        !options ||
        !Number.isInteger(options.playerNumber) ||
        options.playerNumber < 1 ||
        !Array.isArray(options.players)
      ) {
        throw new Error(
          'startLobbyGame expects an object like { playerNumber: 1, isHost: true, players: [{ playerNumber: 1, username: "Alice" }, { playerNumber: 2, username: "Bob" }] }.'
        );
      }
      const players = options.players.map(({ playerNumber, username }) => {
        if (!Number.isInteger(playerNumber) || playerNumber < 1) {
          throw new Error(
            `Invalid player number ${JSON.stringify(
              playerNumber
            )} in the players: they are numbered from 1.`
          );
        }
        return { playerNumber, username: username || 'Player' + playerNumber };
      });
      const hostPlayerNumber = options.isHost ? options.playerNumber : 1;
      for (const playerNumber of [options.playerNumber, hostPlayerNumber]) {
        if (!players.some((player) => player.playerNumber === playerNumber)) {
          players.push({ playerNumber, username: 'Player' + playerNumber });
        }
      }
      if (!options.isHost && options.playerNumber === hostPlayerNumber) {
        throw new Error(
          'Player 1 is the host of the lobby: give another player number to a player who is not the host.'
        );
      }
      const lobby: SimulatedLobby = {
        playerNumber: options.playerNumber,
        hostPlayerNumber,
        isHost: options.isHost,
        players,
        acknowledgeMessages: options.acknowledgeMessages !== false,
      };
      // The current scene, before installing anything: throws if none.
      this._harness.getCurrentRuntimeScene();
      this._lobby = lobby;
      this._install(lobby);

      // Like in a lobby, the players are connected before the game starts:
      // they exchange heartbeats, giving their usernames.
      gdjs.multiplayer.playerNumber = lobby.playerNumber;
      gdjs.multiplayer.hostPeerId = getPeerIdOfPlayer(hostPlayerNumber);
      if (lobby.isHost) {
        for (const player of this._getOtherPlayers()) {
          this._incomingMessages.push(() => ({
            messageName: `#heartbeat#${player.playerNumber}`,
            data: {
              sentAt: performance.now(),
              playerId: `gameplay-test-user-${player.playerNumber}`,
              username: player.username,
            },
            senderPeerId: getPeerIdOfPlayer(player.playerNumber),
          }));
        }
      } else {
        const playersInfo = {};
        for (const player of lobby.players) {
          playersInfo[player.playerNumber] = {
            ping: 0,
            playerId: `gameplay-test-user-${player.playerNumber}`,
            username: player.username,
          };
        }
        this._incomingMessages.push(() => ({
          messageName: `#heartbeat#${hostPlayerNumber}`,
          data: { now: performance.now(), playersInfo },
          senderPeerId: getPeerIdOfPlayer(hostPlayerNumber),
        }));
      }
      await this._harness.stepFrames(1);
      gdjs.multiplayer.startLobbyGameWithoutLobby({
        runtimeScene: this._harness.getCurrentRuntimeScene(),
        currentPlayerNumber: lobby.playerNumber,
        currentHostPeerId: getPeerIdOfPlayer(hostPlayerNumber),
      });
    }

    /**
     * Create an instance owned by another player, the way the game does
     * when it receives the first update of an instance created by this
     * player: the instance gets a network id and the given state. Steps 1
     * frame (2 on the first frames of a scene, while the simulated host
     * gives it its network id), and returns the id of the instance.
     *
     * `owner` is the number of the player owning the instance (0 for the
     * host). `variables` are given as a plain object, like
     * `{ Health: 100, Name: "Bob" }`.
     */
    async addRemoteInstance(
      objectName: string,
      options: {
        owner: integer;
        x: float;
        y: float;
        z?: float;
        angle?: float;
        variables?: { [variableName: string]: any };
      }
    ): Promise<integer> {
      this._getLobby();
      if (!options || !Number.isInteger(options.owner)) {
        throw new Error(
          'addRemoteInstance expects options like { owner: 2, x: 100, y: 200 }.'
        );
      }
      if (this._isOwnedByCurrentPlayer(options.owner)) {
        throw new Error(
          `Player ${options.owner} is the player of the game: the game creates its instances itself. Give the number of another player as the owner.`
        );
      }
      if (
        !this._harness.getCurrentRuntimeScene().isObjectRegistered(objectName)
      ) {
        throw new Error(
          `The object "${objectName}" does not exist in the scene.`
        );
      }
      const instanceNetworkId = gdjs.makeUuid().substring(0, 8);
      const data = {
        x: options.x,
        y: options.y,
        ...(options.z !== undefined ? { z: options.z } : {}),
        a: options.angle || 0,
        ...(options.variables
          ? { var: getVariablesNetworkSyncData(options.variables) }
          : {}),
      };
      this._receiveInstanceUpdate({
        objectName,
        owner: options.owner,
        instanceNetworkId,
        data,
      });

      // On a scene just started, the simulated host gives it its network id
      // during the first frame, and the update is delivered once it is known.
      for (let frame = 0; frame < 3; frame++) {
        await this._harness.stepFrames(1);
        const instance = this._findInstanceByNetworkId(instanceNetworkId);
        if (!instance) continue;
        const behavior = instance.getBehavior(
          'MultiplayerObject'
        ) as gdjs.MultiplayerObjectRuntimeBehavior | null;
        if (behavior && behavior.getPlayerObjectOwnership() !== options.owner) {
          throw new Error(
            `The instance of "${objectName}" was created, but the game ignored the state sent by player ${options.owner}: the object is owned by player ${behavior.getPlayerObjectOwnership()} by default (in its MultiplayerObject behavior), which is the player of the game, and a game ignores the updates of the instances it owns. A real game does the same when another player creates such an instance: make the object owned by the host by default, and change the ownership when an instance is created.`
          );
        }
        return instance.id;
      }
      throw new Error(
        `The instance of "${objectName}" was not created from the update of player ${options.owner}: check that this object has the MultiplayerObject behavior (only synchronized objects are created from the network).`
      );
    }

    /**
     * Receive an update of an instance owned by another player, as if it was
     * sent by this player: `partialSyncData` is the part of the
     * synchronized state that changed, like `{ x: 100, y: 200 }`, `{ z: 50
     * }`, `{ a: 90 }` (the angle) or `{ var: [...] }`. Delivered at the next
     * stepped frame.
     */
    receiveUpdate(instanceId: integer, partialSyncData: object): void {
      this._getLobby();
      const instance = this._harness.getRuntimeObject(instanceId);
      if (!instance) {
        throw new Error(`No instance with the id ${instanceId}.`);
      }
      const behavior = instance.getBehavior(
        'MultiplayerObject'
      ) as gdjs.MultiplayerObjectRuntimeBehavior | null;
      if (!behavior) {
        throw new Error(
          `The instance ${instanceId} of "${instance.getName()}" has no MultiplayerObject behavior: it is not synchronized.`
        );
      }
      const owner = behavior.getPlayerObjectOwnership();
      if (this._isOwnedByCurrentPlayer(owner)) {
        throw new Error(
          `The instance ${instanceId} of "${instance.getName()}" is owned by the player of the game: the game ignores the updates of its own instances from the network. Update an instance owned by another player.`
        );
      }
      this._receiveInstanceUpdate({
        objectName: instance.getName(),
        owner,
        // An instance with no network id yet is found by its position.
        instanceNetworkId:
          instance.networkId || gdjs.makeUuid().substring(0, 8),
        data: { x: instance.getX(), y: instance.getY(), ...partialSyncData },
        minimumClock: behavior._clock,
      });
    }

    /**
     * Receive a custom message (the "Send message to other players" action)
     * sent by another player. `data` is the text of the message. Delivered
     * at the next stepped frame.
     */
    receiveCustomMessage(
      name: string,
      data: string,
      fromPlayerNumber: integer
    ): void {
      const lobby = this._getLobby();
      if (
        !lobby.players.some(
          (player) => player.playerNumber === fromPlayerNumber
        )
      ) {
        throw new Error(
          `Player ${fromPlayerNumber} is not in the lobby started by \`startLobbyGame\`.`
        );
      }
      if (fromPlayerNumber === lobby.playerNumber) {
        throw new Error(
          `Player ${fromPlayerNumber} is the player of the game: receive a message from another player.`
        );
      }
      const uniqueId = gdjs.makeUuid();
      this._incomingMessages.push(() => ({
        messageName: `#customMessage#${name}`,
        data: { data, uniqueId, senderPlayerNumber: fromPlayerNumber },
        senderPeerId: this._getSenderPeerId(fromPlayerNumber),
      }));
    }

    /**
     * The messages the game sent to the other players, filtered by `type`
     * (`updateInstance`, `changeInstanceOwner`, `destroyInstance`,
     * `customMessage`, `updateScene`, `updateGame`, `heartbeat`...) and by
     * `name` (the name of a custom message, the object name of an instance
     * message).
     */
    getSentMessages(filter?: {
      type?: string;
      name?: string;
    }): Array<MultiplayerGameplayTestSentMessage> {
      const instancesByNetworkId = new Map<string, gdjs.RuntimeObject>();
      for (const instance of this._harness
        .getCurrentRuntimeScene()
        .getAdhocListOfAllInstances()) {
        if (instance.networkId) {
          instancesByNetworkId.set(instance.networkId, instance);
        }
      }
      return this._sentMessages
        .filter(
          (message) =>
            (!filter || !filter.type || message.type === filter.type) &&
            (!filter || !filter.name || message.name === filter.name)
        )
        .map(({ instanceNetworkId, ...message }) => {
          if (!instanceNetworkId) return message;
          const instance = instancesByNetworkId.get(instanceNetworkId);
          return { ...message, instanceId: instance ? instance.id : null };
        });
    }

    /**
     * Let `durationMs` of wall-clock time pass without stepping any frame
     * nor receiving any message, as when a scene is long to load on the
     * device of the player. Call it right after `goToScene`: when the game
     * is not the host, the frame giving the scene its network id is stepped
     * first. The wall-clock timers of the extension fire meanwhile, like the
     * one deleting the synchronized instances that received no network id
     * within 500ms - such as the instances placed in the scene, owned by
     * the host, before the first update of the host arrives.
     */
    async simulateSlowSceneLoad(durationMs: float): Promise<void> {
      const lobby = this._getLobby();
      if (!lobby.isHost && !this._harness.getCurrentRuntimeScene().networkId) {
        await this._harness.stepFrames(1);
      }
      await new Promise((resolve) => setTimeout(resolve, durationMs));
    }

    private _getLobby(): SimulatedLobby {
      if (!this._lobby) {
        throw new Error(
          'No lobby game is running: call `await harness.multiplayer.startLobbyGame(...)` first.'
        );
      }
      return this._lobby;
    }

    private _getOtherPlayers() {
      const lobby = this._getLobby();
      return lobby.players.filter(
        (player) => player.playerNumber !== lobby.playerNumber
      );
    }

    /** Whether an instance with this owner (0 for the host) is owned by the
     * player of the game. */
    private _isOwnedByCurrentPlayer(owner: integer): boolean {
      const lobby = this._getLobby();
      return owner === lobby.playerNumber || (owner === 0 && lobby.isHost);
    }

    /**
     * The peer a message of a player comes from: the host relays the
     * messages of the other players to the players who are not the host.
     */
    private _getSenderPeerId(playerNumber: integer): string {
      const lobby = this._getLobby();
      return getPeerIdOfPlayer(
        lobby.isHost || playerNumber === lobby.hostPlayerNumber
          ? playerNumber
          : lobby.hostPlayerNumber
      );
    }

    private _receiveInstanceUpdate({
      objectName,
      owner,
      instanceNetworkId,
      data,
      minimumClock,
      framesAfterSceneNetworkId,
    }: {
      objectName: string;
      owner: integer;
      instanceNetworkId: string;
      data: object;
      minimumClock?: integer;
      /** How many frames the update arrives after the scene got its
       * network id (0 by default: as soon as it has one). */
      framesAfterSceneNetworkId?: integer;
    }): void {
      const clock =
        Math.max(
          this._clocksByNetworkId.get(instanceNetworkId) || 0,
          minimumClock || 0
        ) + 1;
      this._clocksByNetworkId.set(instanceNetworkId, clock);
      const senderPeerId = this._getSenderPeerId(
        owner === 0 ? this._getLobby().hostPlayerNumber : owner
      );
      let framesWithSceneNetworkId = 0;
      const instanceScene = this._harness.getCurrentRuntimeScene();
      this._incomingMessages.push((runtimeScene) => {
        if (runtimeScene !== instanceScene) return 'never';
        // The scene must have its network id, given by the host.
        if (!runtimeScene.networkId) return 'later';
        if (framesWithSceneNetworkId++ < (framesAfterSceneNetworkId || 0)) {
          return 'later';
        }
        return {
          messageName: `#updateInstance#owner_${owner}#object_${objectName}#instance_${instanceNetworkId}#scene_${runtimeScene.networkId}`,
          data: { ...data, _clock: clock },
          senderPeerId,
        };
      });
    }

    private _findInstanceByNetworkId(
      instanceNetworkId: string
    ): gdjs.RuntimeObject | null {
      return (
        this._harness
          .getCurrentRuntimeScene()
          .getAdhocListOfAllInstances()
          .find((instance) => instance.networkId === instanceNetworkId) || null
      );
    }

    private _getOrCreateMessagesList(
      messageName: string
    ): SimulatedMessagesList {
      let messagesList = this._messagesLists.get(messageName);
      if (!messagesList) {
        messagesList = new SimulatedMessagesList(messageName);
        this._messagesLists.set(messageName, messagesList);
      }
      return messagesList;
    }

    /** Record a message sent by the game, and acknowledge it if needed. */
    private _onMessageSent(
      peerIds: Array<string>,
      messageName: string,
      messageData: object
    ): void {
      const lobby = this._getLobby();
      // Cloned, as it would be by the network.
      const data = JSON.parse(JSON.stringify(messageData));
      const type = messageName.split('#')[1] || messageName;
      const instanceMatches = instanceMessageNameRegex.exec(messageName);
      const customMessageMatches = customMessageNameRegex.exec(messageName);
      this._sentMessages.push({
        frame: this._harness._framesExecuted,
        type,
        name: instanceMatches
          ? instanceMatches[2]
          : customMessageMatches
            ? customMessageMatches[1]
            : null,
        ...(instanceMatches
          ? {
              owner: parseInt(instanceMatches[1], 10),
              instanceNetworkId: instanceMatches[3],
            }
          : {}),
        to: peerIds.map(getPlayerNumberOfPeerId),
        data: type === 'customMessage' ? data.data : data,
      });
      if (this._sentMessages.length > MAX_SENT_MESSAGES) {
        this._sentMessages.shift();
      }

      if (!lobby.acknowledgeMessages) return;
      for (const messageNamePrefix in acknowledgmentPrefixes) {
        if (!messageName.startsWith(messageNamePrefix)) continue;
        const acknowledgmentMessageName = messageName.replace(
          messageNamePrefix,
          acknowledgmentPrefixes[messageNamePrefix]
        );
        for (const peerId of peerIds) {
          this._incomingMessages.push(() => ({
            messageName: acknowledgmentMessageName,
            data: {},
            senderPeerId: peerId,
          }));
        }
      }
    }

    /**
     * When the game is not the host, the simulated host plays the same
     * scenes: it gives them their network id (with the scene stack it
     * sends, applied by the game at the beginning of the next frame), and
     * sends the first update of the instances it owns that are placed in
     * the scene, received one frame later. They are then matched with the
     * ones of the game (by their position) and get their network id.
     */
    private _simulateHostOfScene(runtimeScene: gdjs.RuntimeScene): void {
      const lobby = this._getLobby();
      if (lobby.isHost || this._scenesAnnouncedByHost.has(runtimeScene)) {
        return;
      }
      this._scenesAnnouncedByHost.add(runtimeScene);
      // Access the scenes of the stack, to give the same network ids to the
      // scenes that have one.
      const scenes: Array<gdjs.RuntimeScene> = (
        this._harness.getRuntimeGame().getSceneStack() as any
      )._stack;
      const hostPeerId = getPeerIdOfPlayer(lobby.hostPlayerNumber);
      const sceneStackSyncData = scenes.map((scene) => ({
        name: scene.getName(),
        networkId: scene.networkId || gdjs.makeUuid().substring(0, 8),
      }));
      this._getOrCreateMessagesList('#updateGame').pushMessage(
        { ss: sceneStackSyncData },
        hostPeerId
      );
      for (const instance of runtimeScene.getAdhocListOfAllInstances()) {
        const behavior = instance.getBehavior(
          'MultiplayerObject'
        ) as gdjs.MultiplayerObjectRuntimeBehavior | null;
        if (!behavior || instance.networkId || behavior.playerNumber !== 0) {
          continue;
        }
        const data: object = { x: instance.getX(), y: instance.getY() };
        this._receiveInstanceUpdate({
          objectName: instance.getName(),
          owner: 0,
          instanceNetworkId: gdjs.makeUuid().substring(0, 8),
          data,
          framesAfterSceneNetworkId: 1,
        });
      }
    }

    /** Give the game the messages of the other players. */
    private _deliverIncomingMessages(runtimeScene: gdjs.RuntimeScene): void {
      this._simulateHostOfScene(runtimeScene);
      const undeliveredMessages: Array<SimulatedIncomingMessage> = [];
      for (const makeMessage of this._incomingMessages) {
        const message = makeMessage(runtimeScene);
        if (message === 'never') continue;
        if (message === 'later') {
          undeliveredMessages.push(makeMessage);
          continue;
        }
        this._getOrCreateMessagesList(message.messageName).pushMessage(
          message.data,
          message.senderPeerId
        );
      }
      this._incomingMessages = undeliveredMessages;
    }

    /**
     * Replace the peer-to-peer connection by the simulated one, and use new
     * message and variable managers for the test, until its end.
     */
    private _install(lobby: SimulatedLobby): void {
      const peerJsHelper = gdjs.multiplayerPeerJsHelper;
      const otherPeerIds = this._getOtherPlayers().map((player) =>
        getPeerIdOfPlayer(player.playerNumber)
      );
      const simulatedPeerJsHelper = {
        getCurrentId: () => getPeerIdOfPlayer(lobby.playerNumber),
        // The host is connected to everyone, the others only to the host.
        getAllPeers: () =>
          lobby.isHost
            ? otherPeerIds
            : [getPeerIdOfPlayer(lobby.hostPlayerNumber)],
        getJustDisconnectedPeers: () => [],
        getOrCreateMessagesList: (messageName: string) =>
          this._getOrCreateMessagesList(messageName),
        getAllMessagesMap: () => this._messagesLists,
        sendDataTo: async (
          peerIds: Array<string>,
          messageName: string,
          messageData: object
        ) => this._onMessageSent(peerIds, messageName, messageData),
        connect: () => {},
        disconnectFromAllPeers: () => {},
        isReady: () => true,
      };
      const originalPeerJsHelperFunctions = {};
      for (const functionName in simulatedPeerJsHelper) {
        originalPeerJsHelperFunctions[functionName] =
          peerJsHelper[functionName];
        peerJsHelper[functionName] = simulatedPeerJsHelper[functionName];
      }

      const originalMessageManager = gdjs.multiplayerMessageManager;
      const originalVariablesManager = gdjs.multiplayerVariablesManager;
      gdjs.multiplayerMessageManager = gdjs.makeMultiplayerMessageManager();
      gdjs.multiplayerVariablesManager = gdjs.makeMultiplayerVariablesManager();

      // The player of the game is the authenticated player.
      const playerAuthentication = gdjs.playerAuthentication as {
        getUsername: () => string;
        getUserId: () => string;
      };
      const originalGetUsername = playerAuthentication.getUsername;
      const originalGetUserId = playerAuthentication.getUserId;
      const currentPlayer = lobby.players.find(
        (player) => player.playerNumber === lobby.playerNumber
      );
      playerAuthentication.getUsername = () =>
        currentPlayer ? currentPlayer.username : '';
      playerAuthentication.getUserId = () =>
        `gameplay-test-user-${lobby.playerNumber}`;

      // The messages of the other players arrive before the extension reads
      // them (first callback before the events), and the messages are
      // forgotten once read by everything (last callback after the events).
      const deliverIncomingMessages = (runtimeScene: gdjs.RuntimeScene) =>
        this._deliverIncomingMessages(runtimeScene);
      const clearMessages = () => {
        for (const messagesList of this._messagesLists.values()) {
          messagesList.clear();
        }
      };
      gdjs.callbacksRuntimeScenePreEvents.unshift(deliverIncomingMessages);
      gdjs.callbacksRuntimeScenePostEvents.push(clearMessages);

      this._harness.onTestEnded(() => {
        const removeCallback = (
          callbacks: Array<(runtimeScene: gdjs.RuntimeScene) => void>,
          callback: (runtimeScene: gdjs.RuntimeScene) => void
        ) => {
          const index = callbacks.indexOf(callback);
          if (index !== -1) callbacks.splice(index, 1);
        };
        removeCallback(
          gdjs.callbacksRuntimeScenePreEvents,
          deliverIncomingMessages
        );
        removeCallback(gdjs.callbacksRuntimeScenePostEvents, clearMessages);
        gdjs.multiplayer.endLobbyGameWithoutLobby();
        playerAuthentication.getUsername = originalGetUsername;
        playerAuthentication.getUserId = originalGetUserId;
        gdjs.multiplayerMessageManager = originalMessageManager;
        gdjs.multiplayerVariablesManager = originalVariablesManager;
        for (const functionName in originalPeerJsHelperFunctions) {
          peerJsHelper[functionName] =
            originalPeerJsHelperFunctions[functionName];
        }
      });
    }
  }

  /** The network form of variables given as a plain object. */
  const getVariablesNetworkSyncData = (variables: {
    [variableName: string]: any;
  }): Array<VariableNetworkSyncData> => {
    const variablesContainer = new gdjs.VariablesContainer();
    for (const variableName in variables) {
      variablesContainer.add(
        variableName,
        new gdjs.Variable().fromJSObject(variables[variableName])
      );
    }
    return variablesContainer.getNetworkSyncData({});
  };

  gdjs.gameplayTests.registerHarnessExtension(
    'multiplayer',
    (harness) => new gdjs.MultiplayerGameplayTestHelpers(harness)
  );
}
