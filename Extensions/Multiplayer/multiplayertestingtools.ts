namespace gdjs {
  const logger = new gdjs.Logger('Multiplayer testing');

  /**
   * Tools to run a multiplayer game entirely in memory, without any lobby,
   * backend or network: useful to write gameplay tests (and used by the
   * Multiplayer unit tests).
   *
   * Nothing here runs unless {@link startFakeLobbyGame} is called, so a normal
   * game is not impacted at all. It's also only shipped during previews, never
   * in an exported game.
   *
   * @category Multiplayer
   */
  export namespace multiplayerTesting {
    /**
     * Everything of the multiplayer state that is swapped while a fake lobby
     * game runs, and restored when it ends.
     */
    type SavedMultiplayerState = {
      peerJsHelper: typeof gdjs.multiplayerPeerJsHelper;
      messageManager: gdjs.MultiplayerMessageManager;
      variablesManager: gdjs.MultiplayerVariablesManager;
      disableMultiplayerForTesting: boolean;
      isLobbyGameRunning: boolean;
      isReadyToSendOrReceiveGameUpdateMessages: boolean;
      playerNumber: number | null;
      hostPeerId: string | null;
      objectMaxSyncRate: number;
    };

    /**
     * The state of the running fake lobby game, or null when none is running.
     */
    type FakeLobbyGame = {
      /** The players currently in the lobby. Player 1 is always the host. */
      connectedPlayerNumbers: number[];
      currentPlayerNumber: number;
      /** The in-memory inbox of each peer, keyed by peer id then message name. */
      messagesByPeerId: Record<
        string,
        Map<string, gdjs.multiplayerPeerJsHelper.IMessagesList>
      >;
      messageManagerByPeerId: Record<string, gdjs.MultiplayerMessageManager>;
      variablesManagerByPeerId: Record<
        string,
        gdjs.MultiplayerVariablesManager
      >;
      justDisconnectedPeerIds: string[];
      savedState: SavedMultiplayerState;
    };

    let fakeLobbyGame: FakeLobbyGame | null = null;

    /**
     * `gdjs.multiplayerPeerJsHelper` is a namespace, which TypeScript
     * considers read-only. It's swapped for an in-memory transport while a
     * fake lobby game is running.
     */
    const mutableGdjs = gdjs as {
      multiplayerPeerJsHelper: typeof gdjs.multiplayerPeerJsHelper;
    };

    /**
     * The peer id given to a player of the fake lobby. Stable, so a test can
     * assert on object ownership by peer id.
     */
    export const getFakePlayerPeerId = (playerNumber: number): string =>
      `fake-player-${playerNumber}`;

    const getRunningFakeLobbyGame = (): FakeLobbyGame => {
      if (!fakeLobbyGame) {
        throw new Error(
          'No fake lobby game is running: call `gdjs.multiplayerTesting.startFakeLobbyGame` first.'
        );
      }
      return fakeLobbyGame;
    };

    /**
     * A message received by a peer. Same shape as the PeerJS one, but defined
     * here so this module stands on its own.
     */
    class FakeMessageData implements gdjs.multiplayerPeerJsHelper.IMessageData {
      readonly data: any;
      readonly sender: string;

      constructor(data: object, sender: string) {
        this.data = data;
        this.sender = sender;
      }

      getData(): any {
        return this.data;
      }

      getSender(): string {
        return this.sender;
      }
    }

    /**
     * The messages received by a peer for a given message name.
     */
    class FakeMessagesList
      implements gdjs.multiplayerPeerJsHelper.IMessagesList
    {
      private readonly data: gdjs.multiplayerPeerJsHelper.IMessageData[] = [];
      private readonly messageName: string;

      constructor(messageName: string) {
        this.messageName = messageName;
      }

      getName(): string {
        return this.messageName;
      }

      getMessages(): gdjs.multiplayerPeerJsHelper.IMessageData[] {
        return this.data;
      }

      pushMessage(data: object, sender: string): void {
        this.data.push(new FakeMessageData(data, sender));
      }

      clearMessages(): void {
        this.data.length = 0;
      }
    }

    const getPeerMessages = (
      peerId: string
    ): Map<string, gdjs.multiplayerPeerJsHelper.IMessagesList> => {
      const runningGame = getRunningFakeLobbyGame();
      const messages =
        runningGame.messagesByPeerId[peerId] ||
        new Map<string, gdjs.multiplayerPeerJsHelper.IMessagesList>();
      runningGame.messagesByPeerId[peerId] = messages;
      return messages;
    };

    const getOrCreateMessagesListForPeer = (
      peerId: string,
      messageName: string
    ): gdjs.multiplayerPeerJsHelper.IMessagesList => {
      const allMessagesMap = getPeerMessages(peerId);
      const existingMessagesList = allMessagesMap.get(messageName);
      if (existingMessagesList) return existingMessagesList;

      const messagesList = new FakeMessagesList(messageName);
      allMessagesMap.set(messageName, messagesList);
      return messagesList;
    };

    const getCurrentPeerId = (): string =>
      getFakePlayerPeerId(getRunningFakeLobbyGame().currentPlayerNumber);

    /**
     * The peers the current player is connected to: the host (player 1) is
     * connected to everyone, everyone else is connected to the host only.
     */
    const getPeersConnectedToCurrentPlayer = (): string[] => {
      const runningGame = getRunningFakeLobbyGame();
      return runningGame.connectedPlayerNumbers
        .filter((playerNumber) =>
          runningGame.currentPlayerNumber === 1
            ? playerNumber !== 1
            : playerNumber === 1
        )
        .map(getFakePlayerPeerId);
    };

    /**
     * An in-memory replacement for `gdjs.multiplayerPeerJsHelper`: a message
     * is pushed straight into the recipient inbox, so no network, no broker
     * server and no PeerJS connection is involved.
     */
    const createInMemoryPeerJsHelper =
      (): typeof gdjs.multiplayerPeerJsHelper => ({
        MessageData:
          FakeMessageData as unknown as typeof gdjs.multiplayerPeerJsHelper.MessageData,
        // The fake messages list only adds a way to clear the messages.
        MessagesList:
          FakeMessagesList as unknown as typeof gdjs.multiplayerPeerJsHelper.MessagesList,
        setCompressionMethod: () => {},
        getOrCreateMessagesList: (messageName: string) =>
          getOrCreateMessagesListForPeer(getCurrentPeerId(), messageName),
        connect: () => {},
        disconnectFromAllPeers: () => {},
        sendDataTo: async (
          peerIds: string[],
          messageName: string,
          messageData: object
        ) => {
          const senderPeerId = getCurrentPeerId();
          for (const peerId of peerIds) {
            // Clone the data, as it would be if it went through the network:
            // the sender must not be able to mutate what the receiver reads.
            const clonedMessageData = JSON.parse(JSON.stringify(messageData));
            getOrCreateMessagesListForPeer(peerId, messageName).pushMessage(
              clonedMessageData,
              senderPeerId
            );
          }
        },
        getAllMessagesMap: () => getPeerMessages(getCurrentPeerId()),
        useCustomBrokerServer: () => {},
        useDefaultBrokerServer: () => {},
        useCustomICECandidate: () => {},
        forceUseRelayServer: () => {},
        getCurrentId: () => getCurrentPeerId(),
        isReady: () => true,
        getJustDisconnectedPeers: () =>
          getRunningFakeLobbyGame().justDisconnectedPeerIds,
        getAllPeers: () => getPeersConnectedToCurrentPlayer(),
      });

    /**
     * Give a player its own message and variables managers, as it would have
     * in its own game, if it doesn't have them yet.
     */
    const createManagersForPlayerIfNeeded = (playerNumber: number): void => {
      const runningGame = getRunningFakeLobbyGame();
      const peerId = getFakePlayerPeerId(playerNumber);
      if (!runningGame.messageManagerByPeerId[peerId]) {
        runningGame.messageManagerByPeerId[peerId] =
          gdjs.makeMultiplayerMessageManager();
      }
      if (!runningGame.variablesManagerByPeerId[peerId]) {
        runningGame.variablesManagerByPeerId[peerId] =
          gdjs.makeMultiplayerVariablesManager();
      }
    };

    /**
     * Start a game as if a lobby was running, with player 1 as the host and no
     * network involved.
     *
     * The heartbeats are exchanged right away, so every player already knows
     * about the others when this returns.
     *
     * @param options.playersCount The number of players in the fake lobby (at least 1).
     * @param options.playerNumbers The player numbers in the fake lobby, when they are
     * not simply 1 to `playersCount`. Must contain 1 (the host).
     * @param options.myPlayerNumber The player the game is played as. Default: 1 (the host).
     */
    export const startFakeLobbyGame = ({
      playersCount,
      playerNumbers,
      myPlayerNumber = 1,
    }: {
      playersCount?: number;
      playerNumbers?: number[];
      myPlayerNumber?: number;
    }): void => {
      if (fakeLobbyGame) {
        throw new Error(
          'A fake lobby game is already running: call `gdjs.multiplayerTesting.endFakeLobbyGame` first.'
        );
      }

      const connectedPlayerNumbers =
        playerNumbers ||
        Array.from({ length: playersCount || 0 }, (_, index) => index + 1);
      if (!connectedPlayerNumbers.includes(1)) {
        throw new Error(
          'A fake lobby game needs a player 1, which is always the host.'
        );
      }
      if (!connectedPlayerNumbers.includes(myPlayerNumber)) {
        throw new Error(
          `Invalid myPlayerNumber (${myPlayerNumber}): it must be one of the players of the lobby (${connectedPlayerNumbers.join(
            ', '
          )}).`
        );
      }

      fakeLobbyGame = {
        connectedPlayerNumbers,
        // Set up as the host first, so that it sends the first heartbeat.
        currentPlayerNumber: 1,
        messagesByPeerId: {},
        messageManagerByPeerId: {},
        variablesManagerByPeerId: {},
        justDisconnectedPeerIds: [],
        savedState: {
          peerJsHelper: gdjs.multiplayerPeerJsHelper,
          messageManager: gdjs.multiplayerMessageManager,
          variablesManager: gdjs.multiplayerVariablesManager,
          disableMultiplayerForTesting:
            gdjs.multiplayer.disableMultiplayerForTesting,
          isLobbyGameRunning: gdjs.multiplayer._isLobbyGameRunning,
          isReadyToSendOrReceiveGameUpdateMessages:
            gdjs.multiplayer._isReadyToSendOrReceiveGameUpdateMessages,
          playerNumber: gdjs.multiplayer.playerNumber,
          hostPeerId: gdjs.multiplayer.hostPeerId,
          objectMaxSyncRate: gdjs.multiplayer._objectMaxSyncRate,
        },
      };
      connectedPlayerNumbers.forEach(createManagersForPlayerIfNeeded);

      mutableGdjs.multiplayerPeerJsHelper = createInMemoryPeerJsHelper();
      gdjs.multiplayer.disableMultiplayerForTesting = false;
      gdjs.multiplayer.hostPeerId = getFakePlayerPeerId(1);
      gdjs.multiplayer._isLobbyGameRunning = true;
      gdjs.multiplayer._isReadyToSendOrReceiveGameUpdateMessages = true;
      gdjs.multiplayer._hasLobbyGameJustStarted = true;

      exchangeHeartbeats();

      switchToPlayer(myPlayerNumber);
      logger.info(
        `Fake lobby game started with players ${connectedPlayerNumbers.join(
          ', '
        )}, playing as player ${myPlayerNumber}.`
      );
    };

    /**
     * Make every player send and receive its heartbeats, so that the host
     * knows all the players and every player knows the others.
     *
     * This does what a few game frames would do, but without needing a scene.
     */
    const exchangeHeartbeats = (): void => {
      const runningGame = getRunningFakeLobbyGame();
      const otherPlayerNumbers = runningGame.connectedPlayerNumbers.filter(
        (playerNumber) => playerNumber !== 1
      );

      // The host sends a first heartbeat to everyone.
      switchToPlayer(1);
      gdjs.multiplayerMessageManager.handleHeartbeatsToSend();

      // The other players answer it.
      for (const playerNumber of otherPlayerNumbers) {
        switchToPlayer(playerNumber);
        gdjs.multiplayerMessageManager.handleHeartbeatsReceived();
      }

      // The host computes the pings and tells everyone about the players.
      switchToPlayer(1);
      gdjs.multiplayerMessageManager.handleHeartbeatsReceived();

      // The other players read the updated players info.
      for (const playerNumber of otherPlayerNumbers) {
        switchToPlayer(playerNumber);
        gdjs.multiplayerMessageManager.handleHeartbeatsReceived();
      }

      markAllMessagesAsProcessed();
    };

    /**
     * Play the rest of the test as another player of the fake lobby: the
     * message and variables managers are swapped for the ones of this player,
     * so ownership and synchronization are seen from their point of view.
     *
     * @param options.justDisconnectedPlayers The players this one should see as
     * having just disconnected. Reset on the next switch, like a real frame would.
     */
    export const switchToPlayer = (
      playerNumber: number,
      { justDisconnectedPlayers }: { justDisconnectedPlayers?: number[] } = {}
    ): void => {
      const runningGame = getRunningFakeLobbyGame();
      if (!runningGame.connectedPlayerNumbers.includes(playerNumber)) {
        throw new Error(
          `Player ${playerNumber} is not in the fake lobby game (players: ${runningGame.connectedPlayerNumbers.join(
            ', '
          )}).`
        );
      }
      const peerId = getFakePlayerPeerId(playerNumber);

      runningGame.currentPlayerNumber = playerNumber;
      runningGame.justDisconnectedPeerIds = (justDisconnectedPlayers || []).map(
        getFakePlayerPeerId
      );
      gdjs.multiplayerMessageManager =
        runningGame.messageManagerByPeerId[peerId];
      gdjs.multiplayerVariablesManager =
        runningGame.variablesManagerByPeerId[peerId];
      gdjs.multiplayer.playerNumber = playerNumber;
    };

    /**
     * Change who is in the lobby, to simulate players joining or leaving. A
     * player who joins gets its own managers; a player who leaves keeps its
     * state, in case it joins back.
     *
     * A player leaving is only *seen* by the others once they are told about
     * it: pass `justDisconnectedPlayers` to {@link switchToPlayer} for the host.
     */
    export const setConnectedPlayers = (playerNumbers: number[]): void => {
      const runningGame = getRunningFakeLobbyGame();
      if (!playerNumbers.includes(1)) {
        throw new Error(
          'The host (player 1) can not leave the fake lobby game.'
        );
      }
      runningGame.connectedPlayerNumbers = playerNumbers;
      playerNumbers.forEach(createManagersForPlayerIfNeeded);
    };

    /** The players currently in the fake lobby. */
    export const getConnectedPlayers = (): number[] =>
      getRunningFakeLobbyGame().connectedPlayerNumbers.slice();

    /**
     * The player the game is currently played as, or 0 if no fake lobby game
     * is running.
     */
    export const getCurrentPlayerNumber = (): number =>
      fakeLobbyGame ? fakeLobbyGame.currentPlayerNumber : 0;

    /** True if a fake lobby game was started and not ended yet. */
    export const isFakeLobbyGameRunning = (): boolean => !!fakeLobbyGame;

    /**
     * Empty every peer inbox, as if all the pending messages had been read by
     * their recipient.
     */
    export const markAllMessagesAsProcessed = (): void => {
      const runningGame = getRunningFakeLobbyGame();
      for (const allMessagesMap of Object.values(
        runningGame.messagesByPeerId
      )) {
        for (const messagesList of allMessagesMap.values()) {
          (messagesList as FakeMessagesList).clearMessages();
        }
      }
    };

    /**
     * The messages waiting in the peer inboxes, by peer id then message name:
     * useful to assert that nothing was left unprocessed.
     */
    export const getPendingMessages = (): Record<
      string,
      Record<string, gdjs.multiplayerPeerJsHelper.IMessageData[]>
    > => {
      const runningGame = getRunningFakeLobbyGame();
      const pendingMessages: Record<
        string,
        Record<string, gdjs.multiplayerPeerJsHelper.IMessageData[]>
      > = {};
      for (const peerId in runningGame.messagesByPeerId) {
        for (const [messageName, messagesList] of runningGame.messagesByPeerId[
          peerId
        ]) {
          const messages = messagesList.getMessages();
          if (!messages.length) continue;

          pendingMessages[peerId] = pendingMessages[peerId] || {};
          pendingMessages[peerId][messageName] = messages;
        }
      }
      return pendingMessages;
    };

    /** Log the messages waiting in the peer inboxes. Useful when debugging. */
    export const logPendingMessages = (): void => {
      logger.info(JSON.stringify(getPendingMessages()));
    };

    /**
     * Synchronize objects and variables on every frame instead of at the
     * default rate: a gameplay test usually only steps a handful of frames.
     * Restored by {@link endFakeLobbyGame}.
     */
    export const setSynchronizeAsFastAsPossible = (
      enable: boolean = true
    ): void => {
      gdjs.multiplayer._objectMaxSyncRate = enable
        ? Infinity
        : gdjs.multiplayer.DEFAULT_OBJECT_MAX_SYNC_RATE;
    };

    /**
     * End the fake lobby game and restore everything that was swapped, so the
     * game is back to a state where multiplayer is not used.
     */
    export const endFakeLobbyGame = (): void => {
      if (!fakeLobbyGame) return;

      const { savedState } = fakeLobbyGame;
      mutableGdjs.multiplayerPeerJsHelper = savedState.peerJsHelper;
      gdjs.multiplayerMessageManager = savedState.messageManager;
      gdjs.multiplayerVariablesManager = savedState.variablesManager;
      gdjs.multiplayer.disableMultiplayerForTesting =
        savedState.disableMultiplayerForTesting;
      gdjs.multiplayer._isLobbyGameRunning = savedState.isLobbyGameRunning;
      gdjs.multiplayer._isReadyToSendOrReceiveGameUpdateMessages =
        savedState.isReadyToSendOrReceiveGameUpdateMessages;
      gdjs.multiplayer.playerNumber = savedState.playerNumber;
      gdjs.multiplayer.hostPeerId = savedState.hostPeerId;
      gdjs.multiplayer._objectMaxSyncRate = savedState.objectMaxSyncRate;
      gdjs.multiplayer._hasLobbyGameJustStarted = false;

      fakeLobbyGame = null;
      logger.info('Fake lobby game ended.');
    };
  }
}
