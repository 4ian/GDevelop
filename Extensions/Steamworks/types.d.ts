declare module 'steamworks.js/client' {
  export function init(appId: number): void;
  export function restartAppIfNecessary(appId: number): boolean;
  export function runCallbacks(): void;
  export interface PlayerSteamId {
    steamId64: bigint;
    steamId32: string;
    accountId: number;
  }
  export namespace achievement {
    export function activate(achievement: string): boolean;
    export function isActivated(achievement: string): boolean;
    export function clear(achievement: string): boolean;
  }
  export namespace apps {
    export function isSubscribedApp(appId: number): boolean;
    export function isAppInstalled(appId: number): boolean;
    export function isDlcInstalled(appId: number): boolean;
    export function isSubscribedFromFreeWeekend(): boolean;
    export function isVacBanned(): boolean;
    export function isCybercafe(): boolean;
    export function isLowViolence(): boolean;
    export function isSubscribed(): boolean;
    export function appBuildId(): number;
    export function appInstallDir(appId: number): string;
    export function appOwner(): PlayerSteamId;
    export function availableGameLanguages(): Array<string>;
    export function currentGameLanguage(): string;
    export function currentBetaName(): string | null;
  }
  export namespace auth {
    /** @param timeoutSeconds - The number of seconds to wait for the ticket to be validated. Default value is 10 seconds. */
    export function getSessionTicket(
      timeoutSeconds?: number | undefined | null
    ): Promise<Ticket>;
    export class Ticket {
      cancel(): void;
      getBytes(): Buffer;
    }
  }

  export const enum ChatMemberStateChange {
    /** This user has joined or is joining the lobby. */
    Entered,
    /** This user has left or is leaving the lobby. */
    Left,
    /** User disconnected without leaving the lobby first. */
    Disconnected,
    /** The user has been kicked. */
    Kicked,
    /** The user has been kicked and banned. */
    Banned,
  }

  export interface CallbackReturns {
    [callback.SteamCallback.PersonaStateChange]: {
      steam_id: bigint;
      flags: { bits: number };
    };
    [callback.SteamCallback.SteamServersConnected]: {};
    [callback.SteamCallback.SteamServersDisconnected]: {
      reason: number;
    };
    [callback.SteamCallback.SteamServerConnectFailure]: {
      reason: number;
      still_retrying: boolean;
    };
    [callback.SteamCallback.LobbyDataUpdate]: {
      lobby: bigint;
      member: bigint;
      success: boolean;
    };
    [callback.SteamCallback.LobbyChatUpdate]: {
      lobby: bigint;
      user_changed: bigint;
      making_change: bigint;
      member_state_change: ChatMemberStateChange;
    };
    [callback.SteamCallback.P2PSessionRequest]: {
      remote: bigint;
    };
    [callback.SteamCallback.P2PSessionConnectFail]: {
      remote: bigint;
      error: number;
    };
    [callback.SteamCallback.GameLobbyJoinRequested]: {
      lobby_steam_id: bigint;
      friend_steam_id: bigint;
    };
    [callback.SteamCallback.MicroTxnAuthorizationResponse]: {
      app_id: number;
      order_id: number | bigint;
      authorized: boolean;
    };
  }

  export namespace callback {
    export const enum SteamCallback {
      PersonaStateChange = 0,
      SteamServersConnected = 1,
      SteamServersDisconnected = 2,
      SteamServerConnectFailure = 3,
      LobbyDataUpdate = 4,
      LobbyChatUpdate = 5,
      P2PSessionRequest = 6,
      P2PSessionConnectFail = 7,
      GameLobbyJoinRequested = 8,
      MicroTxnAuthorizationResponse = 9,
    }
    export function register<C extends keyof CallbackReturns>(
      steamCallback: C,
      handler: (value: CallbackReturns[C]) => void
    ): Handle;
    export class Handle {
      disconnect(): void;
    }
  }
  export namespace cloud {
    export function isEnabledForAccount(): boolean;
    export function isEnabledForApp(): boolean;
    export function readFile(name: string): string;
    export function writeFile(name: string, content: string): boolean;
    export function deleteFile(name: string): boolean;
    export function fileExists(name: string): boolean;
  }
  export namespace input {
    export interface AnalogActionVector {
      x: number;
      y: number;
    }
    export function init(): void;
    export function getControllers(): Array<Controller>;
    export function getActionSet(actionSetName: string): bigint;
    export function getDigitalAction(actionName: string): bigint;
    export function getAnalogAction(actionName: string): bigint;
    export function shutdown(): void;
    export class Controller {
      activateActionSet(actionSetHandle: bigint): void;
      isDigitalActionPressed(actionHandle: bigint): boolean;
      getAnalogActionVector(actionHandle: bigint): AnalogActionVector;
    }
  }
  export namespace localplayer {
    export function getSteamId(): PlayerSteamId;
    export function getName(): string;
    export function getLevel(): number;
    /** @returns the 2 digit ISO 3166-1-alpha-2 format country code which client is running in, e.g. "US" or "UK". */
    export function getIpCountry(): string;
    export function setRichPresence(
      key: string,
      value?: string | undefined | null
    ): void;
  }
  export namespace matchmaking {
    export const enum LobbyType {
      Private = 0,
      FriendsOnly = 1,
      Public = 2,
      Invisible = 3,
    }
    export function createLobby(
      lobbyType: LobbyType,
      maxMembers: number
    ): Promise<Lobby>;
    export function joinLobby(lobbyId: bigint): Promise<Lobby>;
    export function getLobbies(): Promise<Array<Lobby>>;
    export class Lobby {
      id: bigint;
      join(): Promise<Lobby>;
      leave(): void;
      openInviteDialog(): void;
      getMemberCount(): bigint;
      getMemberLimit(): bigint | null;
      getMembers(): Array<PlayerSteamId>;
      getOwner(): PlayerSteamId;
      setJoinable(joinable: boolean): boolean;
      getData(key: string): string | null;
      setData(key: string, value: string): boolean;
      deleteData(key: string): boolean;
      /** Get an object containing all the lobby data */
      getFullData(): Record<string, string>;
      /**
       * Merge current lobby data with provided data in a single batch
       * @returns true if all data was set successfully
       */
      mergeFullData(data: Record<string, string>): boolean;
    }
  }
  export namespace networking {
    export interface P2PPacket {
      data: Buffer;
      size: number;
      steamId: PlayerSteamId;
    }
    /** The method used to send a packet */
    export const enum SendType {
      /**
       * Send the packet directly over udp.
       *
       * Can't be larger than 1200 bytes
       */
      Unreliable = 0,
      /**
       * Like `Unreliable` but doesn't buffer packets
       * sent before the connection has started.
       */
      UnreliableNoDelay = 1,
      /**
       * Reliable packet sending.
       *
       * Can't be larger than 1 megabyte.
       */
      Reliable = 2,
      /**
       * Like `Reliable` but applies the nagle
       * algorithm to packets being sent
       */
      ReliableWithBuffering = 3,
    }
    export function sendP2PPacket(
      steamId64: bigint,
      sendType: SendType,
      data: Buffer
    ): boolean;
    export function isP2PPacketAvailable(): number;
    export function readP2PPacket(size: number): P2PPacket;
    export function acceptP2PSession(steamId64: bigint): void;
  }
  export namespace overlay {
    export const enum Dialog {
      Friends = 0,
      Community = 1,
      Players = 2,
      Settings = 3,
      OfficialGameGroup = 4,
      Stats = 5,
      Achievements = 6,
    }
    export const enum StoreFlag {
      None = 0,
      AddToCart = 1,
      AddToCartAndShow = 2,
    }
    export function activateDialog(dialog: Dialog): void;
    export function activateDialogToUser(
      dialog: Dialog,
      steamId64: bigint
    ): void;
    export function activateInviteDialog(lobbyId: bigint): void;
    export function activateToWebPage(url: string): void;
    export function activateToStore(appId: number, flag: StoreFlag): void;
  }
  export namespace stats {
    export function getInt(name: string): number | null;
    export function setInt(name: string, value: number): boolean;
    export function store(): boolean;
    export function resetAll(achievementsToo: boolean): boolean;
  }
  export namespace utils {
    export function getAppId(): number;
    export function getServerRealTime(): number;
    export function isSteamRunningOnSteamDeck(): boolean;
  }
  export namespace workshop {
    export interface UgcResult {
      itemId: bigint;
      needsToAcceptAgreement: boolean;
    }
    export const enum UgcItemVisibility {
      Public = 0,
      FriendsOnly = 1,
      Private = 2,
      Unlisted = 3,
    }
    export interface UgcUpdate {
      title?: string;
      description?: string;
      changeNote?: string;
      previewPath?: string;
      contentPath?: string;
      tags?: Array<string>;
      visibility?: UgcItemVisibility;
    }
    export interface InstallInfo {
      folder: string;
      sizeOnDisk: bigint;
      timestamp: number;
    }
    export interface DownloadInfo {
      current: bigint;
      total: bigint;
    }
    export function createItem(
      appId?: number | undefined | null
    ): Promise<UgcResult>;
    export function updateItem(
      itemId: bigint,
      updateDetails: UgcUpdate,
      appId?: number | undefined | null
    ): Promise<UgcResult>;
    /**
     * Subscribe to a workshop item. It will be downloaded and installed as soon as possible.
     *
     * {@link https://partner.steamgames.com/doc/api/ISteamUGC#SubscribeItem}
     */
    export function subscribe(itemId: bigint): Promise<void>;
    /**
     * Unsubscribe from a workshop item. This will result in the item being removed after the game quits.
     *
     * {@link https://partner.steamgames.com/doc/api/ISteamUGC#UnsubscribeItem}
     */
    export function unsubscribe(itemId: bigint): Promise<void>;
    /**
     * Gets the current state of a workshop item on this client. States can be combined.
     *
     * @returns a number with the current item state, e.g. 9
     * 9 = 1 (The current user is subscribed to this item) + 8 (The item needs an update)
     *
     * {@link https://partner.steamgames.com/doc/api/ISteamUGC#GetItemState}
     * {@link https://partner.steamgames.com/doc/api/ISteamUGC#EItemState}
     */
    export function state(itemId: bigint): number;
    /**
     * Gets info about currently installed content on the disc for workshop item.
     *
     * @returns an object with the the properties {folder, size_on_disk, timestamp}
     *
     * {@link https://partner.steamgames.com/doc/api/ISteamUGC#GetItemInstallInfo}
     */
    export function installInfo(itemId: bigint): InstallInfo | null;
    /**
     * Get info about a pending download of a workshop item.
     *
     * @returns an object with the properties {current, total}
     *
     * {@link https://partner.steamgames.com/doc/api/ISteamUGC#GetItemDownloadInfo}
     */
    export function downloadInfo(itemId: bigint): DownloadInfo | null;
    /**
     * Download or update a workshop item.
     *
     * @param highPriority - If high priority is true, start the download in high priority mode, pausing any existing in-progress Steam downloads and immediately begin downloading this workshop item.
     * @returns true or false
     *
     * {@link https://partner.steamgames.com/doc/api/ISteamUGC#DownloadItem}
     */
    export function download(itemId: bigint, highPriority: boolean): boolean;
  }
}

declare module 'steamworks.js' {
  export function init(appId?: number): Client;
  export function restartAppIfNecessary(appId: number): boolean;
  export function electronEnableSteamOverlay(
    disableEachFrameInvalidation?: boolean
  ): void;
  export type Client = Omit<
    typeof import('steamworks.js/client'),
    'init' | 'runCallbacks'
  >;
  export const SteamCallback: typeof import('steamworks.js/client').callback.SteamCallback;
}
