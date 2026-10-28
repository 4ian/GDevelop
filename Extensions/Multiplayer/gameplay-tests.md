## Multiplayer games: `harness.multiplayer`

Simulates a lobby game and the other players, without network. Everything else goes through the real code of the multiplayer extension (message handling, network sync, ownership): never stub `gdjs.multiplayer` or `gdjs.multiplayerMessageManager` in a test. Messages from other players are delivered at the beginning of the next stepped frame.

```typescript
interface Harness {
  multiplayer: {
    /** The game believes a lobby game runs: the current player is `playerNumber`, the host is player 1 (or `playerNumber` with `isHost`), the other `players` are connected. Steps 1 frame; "lobby game has just started" is true during the next one. The other players acknowledge what must be (custom messages, ownership changes, destructions) unless `acknowledgeMessages: false`. */
    startLobbyGame(options: { playerNumber: number; isHost: boolean; players: Array<{ playerNumber: number; username?: string }>; acknowledgeMessages?: boolean }): Promise<void>;
    /** Create an instance owned by another player (0 = host) as its first network update does: it gets a network id. Steps 1-3 frames, returns its id. */
    addRemoteInstance(objectName: string, options: { owner: number; x: number; y: number; z?: number; angle?: number; variables?: { [name: string]: any } }): Promise<number>;
    /** Receive an update of an instance owned by another player: `{ x, y, z, a (angle), var: [...] }`, only what changed. */
    receiveUpdate(instanceId: number, partialSyncData: object): void;
    /** Receive a custom message ("Send message to other players") from another player. */
    receiveCustomMessage(name: string, data: string, fromPlayerNumber: number): void;
    /** What the game sent: `type` is 'updateInstance', 'changeInstanceOwner', 'destroyInstance', 'customMessage', 'ackCustomMessage', 'updateScene', 'updateGame', 'heartbeat'...; `name` is the custom message name or the object name. `data` of an instance update: `{ x, y, z, a, beh: { [behaviorName]: ... }, var: [...] }`. */
    getSentMessages(filter?: { type?: string; name?: string }): Array<{ frame: number; type: string; name: string | null; instanceId?: number | null; owner?: number; to: number[]; data: any }>;
    /** Right after `goToScene`: let wall-clock time pass as when the scene is long to load on this player's device (instances owned by the host and placed in the scene, still without network id after 500ms, are deleted by the extension). */
    simulateSlowSceneLoad(durationMs: number): Promise<void>;
  };
}
```

Rules:

- Test the instances of the current player and the copies of the other players' instances separately: the game must move its own player, and only apply the updates received for the others (`addRemoteInstance` + `receiveUpdate`).
- A player's objects are usually created at runtime by that player: on the host, create the other players' bodies with `addRemoteInstance`, not with `spawn`. An object owned by a given player by default is ignored when another player creates it (`addRemoteInstance` throws why): objects are owned by the host by default.
- Check what is sent to the others with `getSentMessages`, e.g. that a control behavior is not in `data.beh` of the 'updateInstance' messages of the player. Messages are sent at a wall-clock rate: assert what they contain, never how many there are.
- Test as a player who is not the host too (`isHost: false`): the simulated host plays the same scenes and gives their instances their network ids, like a real host.
