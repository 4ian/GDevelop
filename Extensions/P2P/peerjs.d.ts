/**
 * Minimal `EventEmitter` interface that is molded against the Node.js
 * `EventEmitter` interface.
 */
declare class EventEmitter<
  EventTypes extends EventEmitter.ValidEventTypes = string | symbol,
  Context extends any = any
> {
  static prefixed: string | boolean;

  /**
   * Return an array listing the events for which the emitter has registered
   * listeners.
   */
  eventNames(): Array<EventEmitter.EventNames<EventTypes>>;

  /**
   * Return the listeners registered for a given event.
   */
  listeners<T extends EventEmitter.EventNames<EventTypes>>(
    event: T
  ): Array<EventEmitter.EventListener<EventTypes, T>>;

  /**
   * Return the number of listeners listening to a given event.
   */
  listenerCount(event: EventEmitter.EventNames<EventTypes>): number;

  /**
   * Calls each of the listeners registered for a given event.
   */
  emit<T extends EventEmitter.EventNames<EventTypes>>(
    event: T,
    ...args: EventEmitter.EventArgs<EventTypes, T>
  ): boolean;

  /**
   * Add a listener for a given event.
   */
  on<T extends EventEmitter.EventNames<EventTypes>>(
    event: T,
    fn: EventEmitter.EventListener<EventTypes, T>,
    context?: Context
  ): this;
  addListener<T extends EventEmitter.EventNames<EventTypes>>(
    event: T,
    fn: EventEmitter.EventListener<EventTypes, T>,
    context?: Context
  ): this;

  /**
   * Add a one-time listener for a given event.
   */
  once<T extends EventEmitter.EventNames<EventTypes>>(
    event: T,
    fn: EventEmitter.EventListener<EventTypes, T>,
    context?: Context
  ): this;

  /**
   * Remove the listeners of a given event.
   */
  removeListener<T extends EventEmitter.EventNames<EventTypes>>(
    event: T,
    fn?: EventEmitter.EventListener<EventTypes, T>,
    context?: Context,
    once?: boolean
  ): this;
  off<T extends EventEmitter.EventNames<EventTypes>>(
    event: T,
    fn?: EventEmitter.EventListener<EventTypes, T>,
    context?: Context,
    once?: boolean
  ): this;

  /**
   * Remove all listeners, or those of the specified event.
   */
  removeAllListeners(event?: EventEmitter.EventNames<EventTypes>): this;
}

declare namespace EventEmitter {
  export interface ListenerFn<Args extends any[] = any[]> {
    (...args: Args): void;
  }

  export interface EventEmitterStatic {
    new <
      EventTypes extends ValidEventTypes = string | symbol,
      Context = any
    >(): EventEmitter<EventTypes, Context>;
  }

  /**
   * `object` should be in either of the following forms:
   * ```
   * interface EventTypes {
   *   'event-with-parameters': any[]
   *   'event-with-example-handler': (...args: any[]) => void
   * }
   * ```
   */
  export type ValidEventTypes = string | symbol | object;

  export type EventNames<T extends ValidEventTypes> = T extends string | symbol
    ? T
    : keyof T;

  export type ArgumentMap<T extends object> = {
    [K in keyof T]: T[K] extends (...args: any[]) => void
      ? Parameters<T[K]>
      : T[K] extends any[]
      ? T[K]
      : any[];
  };

  export type EventListener<
    T extends ValidEventTypes,
    K extends EventNames<T>
  > = T extends string | symbol
    ? (...args: any[]) => void
    : (
        ...args: ArgumentMap<Exclude<T, string | symbol>>[Extract<K, keyof T>]
      ) => void;

  export type EventArgs<
    T extends ValidEventTypes,
    K extends EventNames<T>
  > = Parameters<EventListener<T, K>>;

  export const EventEmitter: EventEmitterStatic;
}

declare namespace Peer {
  export interface UtilSupportsObj {
    browser: boolean;
    webRTC: boolean;
    audioVideo: boolean;
    data: boolean;
    binaryBlob: boolean;
    reliable: boolean;
  }
  class Util {
    noop(): void;
    readonly CLOUD_HOST = '0.peerjs.com';
    readonly CLOUD_PORT = 443;
    readonly chunkedBrowsers: {
      Chrome: number;
      chrome: number;
    };
    readonly chunkedMTU = 16300;
    readonly defaultConfig: {
      iceServers: (
        | {
            urls: string;
            username?: undefined;
            credential?: undefined;
          }
        | {
            urls: string[];
            username: string;
            credential: string;
          }
      )[];
      sdpSemantics: string;
    };
    readonly browser: string;
    readonly browserVersion: number;
    readonly supports: UtilSupportsObj;
    validateId(id: string): boolean;
    pack: any;
    unpack: any;
    chunk(
      blob: Blob
    ): {
      __peerData: number;
      n: number;
      total: number;
      data: Blob;
    }[];
    blobToArrayBuffer(
      blob: Blob,
      cb: (arg: ArrayBuffer | null) => void
    ): FileReader;
    binaryStringToArrayBuffer(binary: string): ArrayBuffer | SharedArrayBuffer;
    randomToken(): string;
    isSecure(): boolean;
  }
  export const util: Util;
  export enum LogLevel {
    Disabled = 0,
    Errors = 1,
    Warnings = 2,
    All = 3,
  }
  export enum ConnectionType {
    Data = 'data',
    Media = 'media',
  }
  export enum PeerErrorType {
    BrowserIncompatible = 'browser-incompatible',
    Disconnected = 'disconnected',
    InvalidID = 'invalid-id',
    InvalidKey = 'invalid-key',
    Network = 'network',
    PeerUnavailable = 'peer-unavailable',
    SslUnavailable = 'ssl-unavailable',
    ServerError = 'server-error',
    SocketError = 'socket-error',
    SocketClosed = 'socket-closed',
    UnavailableID = 'unavailable-id',
    WebRTC = 'webrtc',
  }
  export enum SerializationType {
    Binary = 'binary',
    BinaryUTF8 = 'binary-utf8',
    JSON = 'json',
  }
  export enum SocketEventType {
    Message = 'message',
    Disconnected = 'disconnected',
    Error = 'error',
    Close = 'close',
  }
  export enum ServerMessageType {
    Heartbeat = 'HEARTBEAT',
    Candidate = 'CANDIDATE',
    Offer = 'OFFER',
    Answer = 'ANSWER',
    Open = 'OPEN',
    Error = 'ERROR',
    IdTaken = 'ID-TAKEN',
    InvalidKey = 'INVALID-KEY',
    Leave = 'LEAVE',
    Expire = 'EXPIRE',
  }
  /**
   * An abstraction on top of WebSockets to provide fastest
   * possible connection for peers.
   */
  class Socket extends EventEmitter {
    constructor(
      secure: any,
      host: string,
      port: number,
      path: string,
      key: string,
      pingInterval?: number
    );
    start(id: string, token: string): void;
    /** Exposed send for DC & Peer. */
    send(data: any): void;
    close(): void;
  }
  class ServerMessage {
    type: ServerMessageType;
    payload: any;
    src: string;
  }
  type BaseConnectionEvents = {
    /**
     * Emitted when either you or the remote peer closes the connection.
     */
    close: () => void;
    error: (error: Error) => void;
    iceStateChanged: (state: RTCIceConnectionState) => void;
  };
  abstract class BaseConnection<
    T extends EventEmitter.ValidEventTypes,
    TT
  > extends EventEmitter<T & BaseConnectionEvents> {
    readonly peer: string;
    provider: Peer<TT>;
    readonly options: any;
    protected _open: boolean;
    readonly metadata: any;
    connectionId: string;
    peerConnection: RTCPeerConnection;
    abstract get type(): ConnectionType;
    get open(): boolean;
    constructor(peer: string, provider: Peer<TT>, options: any);
    abstract close(): void;
    abstract handleMessage(message: ServerMessage): void;
  }
  type DataConnectionEvents<T> = {
    /**
     * Emitted when data is received from the remote peer.
     */
    data: (data: T) => void;
    /**
     * Emitted when the connection is established and ready-to-use.
     */
    open: () => void;
  };
  /**
   * Wraps a DataChannel between two Peers.
   */
  export class DataConnection<T> extends BaseConnection<
    DataConnectionEvents<T>,
    T
  > {
    readonly label: string;
    readonly serialization: SerializationType;
    readonly reliable: boolean;
    stringify: (data: any) => string;
    parse: (data: string) => any;
    get type(): ConnectionType;
    get dataChannel(): RTCDataChannel;
    get bufferSize(): number;
    constructor(peerId: string, provider: Peer<T>, options: any);
    /** Called by the Negotiator when the DataChannel is ready. */
    initialize(dc: RTCDataChannel): void;
    /**
     * Exposed functionality for users.
     */
    /** Allows user to close connection. */
    close(): void;
    /** Allows user to send data. */
    send(data: T, chunked?: boolean): void;
    handleMessage(message: ServerMessage): void;
  }
  export interface AnswerOption {
    sdpTransform?: Function;
  }
  export interface PeerJSOption {
    key?: string;
    host?: string;
    port?: number;
    path?: string;
    secure?: boolean;
    token?: string;
    config?: RTCConfiguration;
    debug?: number;
    referrerPolicy?: ReferrerPolicy;
  }
  export interface PeerConnectOption {
    label?: string;
    metadata?: any;
    serialization?: string;
    reliable?: boolean;
  }
  export interface CallOption {
    metadata?: any;
    sdpTransform?: Function;
  }
  type MediaConnectionEvents = {
    /**
     * Emitted when a connection to the PeerServer is established.
     */
    stream: (stream: MediaStream) => void;
  };
  /**
   * Wraps the streaming interface between two Peers.
   */
  export class MediaConnection<T> extends BaseConnection<
    MediaConnectionEvents,
    T
  > {
    get type(): ConnectionType;
    get localStream(): MediaStream;
    get remoteStream(): MediaStream;
    constructor(peerId: string, provider: Peer<T>, options: any);
    addStream(remoteStream: any): void;
    handleMessage(message: ServerMessage): void;
    answer(stream?: MediaStream, options?: AnswerOption): void;
    /**
     * Exposed functionality for users.
     */
    /** Allows user to close connection. */
    close(): void;
  }
  class PeerOptions implements PeerJSOption {
    debug?: LogLevel;
    host?: string;
    port?: number;
    path?: string;
    key?: string;
    token?: string;
    config?: any;
    secure?: boolean;
    pingInterval?: number;
    referrerPolicy?: ReferrerPolicy;
    logFunction?: (logLevel: LogLevel, ...rest: any[]) => void;
  }
  type PeerEvents<T> = {
    /**
     * Emitted when a connection to the PeerServer is established.
     */
    open: (id: string) => void;
    /**
     * Emitted when a new data connection is established from a remote peer.
     */
    connection: (dataConnection: DataConnection<T>) => void;
    /**
     * Emitted when a remote peer attempts to call you.
     */
    call: (mediaConnection: MediaConnection<T>) => void;
    /**
     * Emitted when the peer is destroyed and can no longer accept or create any new connections.
     */
    close: () => void;
    /**
     * Emitted when the peer is disconnected from the signalling server
     */
    disconnected: (currentId: string) => void;
    /**
     * Errors on the peer are almost always fatal and will destroy the peer.
     */
    error: (error: Error) => void;
  };
}

/**
 * A peer who can initiate connections with other peers.
 */
declare class Peer<T> extends EventEmitter<Peer.PeerEvents<T>> {
  /**
   * The brokering ID of this peer
   */
  get id(): string;
  get options(): Peer.PeerOptions;
  get open(): boolean;
  get socket(): Peer.Socket;
  /**
   * A hash of all connections associated with this peer, keyed by the remote peer's ID.
   * @deprecated
   * Return type will change from Object to Map<string,[]>
   */
  get connections(): Object;
  /**
   * true if this peer and all of its connections can no longer be used.
   */
  get destroyed(): boolean;
  /**
   * false if there is an active connection to the PeerServer.
   */
  get disconnected(): boolean;
  /**
   * A peer can connect to other peers and listen for connections.
   */
  constructor();
  /**
   * A peer can connect to other peers and listen for connections.
   * @param options for specifying details about PeerServer
   */
  constructor(options: Peer.PeerOptions);
  /**
   * A peer can connect to other peers and listen for connections.
   * @param id Other peers can connect to this peer using the provided ID.
   *     If no ID is given, one will be generated by the brokering server.
   * @param options for specifying details about PeerServer
   */
  constructor(id: string, options?: Peer.PeerOptions);
  /** Retrieve messages from lost message store */
  _getMessages(connectionId: string): Peer.ServerMessage[];
  /**
   * Connects to the remote peer specified by id and returns a data connection.
   * @param peer The brokering ID of the remote peer (their peer.id).
   * @param options for specifying details about Peer Connection
   */
  connect(
    peer: string,
    options?: Peer.PeerConnectOption
  ): Peer.DataConnection<T>;
  /**
   * Calls the remote peer specified by id and returns a media connection.
   * @param peer The brokering ID of the remote peer (their peer.id).
   * @param stream The caller's media stream
   * @param options Metadata associated with the connection, passed in by whoever initiated the connection.
   */
  call(
    peer: string,
    stream: MediaStream,
    options?: Peer.CallOption
  ): Peer.MediaConnection<T>;
  _removeConnection(
    connection: Peer.DataConnection<T> | Peer.MediaConnection<T>
  ): void;
  /** Retrieve a data/media connection for this peer. */
  getConnection(
    peerId: string,
    connectionId: string
  ): null | Peer.DataConnection<T> | Peer.MediaConnection<T>;
  /** Emits a typed error message. */
  emitError(type: Peer.PeerErrorType, err: string | Error): void;
  /**
   * Destroys the Peer: closes all active connections as well as the connection
   *  to the server.
   * Warning: The peer can no longer create or accept connections after being
   *  destroyed.
   */
  destroy(): void;
  /**
   * Disconnects the Peer's connection to the PeerServer. Does not close any
   *  active connections.
   * Warning: The peer can no longer create or accept connections after being
   *  disconnected. It also cannot reconnect to the server.
   */
  disconnect(): void;
  /** Attempts to reconnect with the same ID. */
  reconnect(): void;
  /**
   * Get a list of available peer IDs. If you're running your own server, you'll
   * want to set allow_discovery: true in the PeerServer options. If you're using
   * the cloud server, email team@peerjs.com to get the functionality enabled for
   * your key.
   */
  listAllPeers(cb?: (_: any[]) => void): void;
}
