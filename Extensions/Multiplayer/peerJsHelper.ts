/// <reference path="peerjs.d.ts" />
namespace gdjs {
  const logger = new gdjs.Logger('Multiplayer');
  export namespace multiplayerPeerJsHelper {
    /**
     * The type of the data that is sent across peerjs.
     * We use UInt8Array to send compressed data, but we only manipulate objects once received.
     */
    type NetworkMessage = {
      messageName: string;
      data: Uint8Array | string;
    };

    export type CompressionMethod = 'none' | 'cs:gzip' | 'cs:deflate';

    /**
     * Helper to discard invalid messages when received.
     */
    const isValidNetworkMessage = (
      message: unknown
    ): message is NetworkMessage =>
      typeof message === 'object' &&
      message !== null &&
      typeof message['messageName'] === 'string' &&
      typeof message['data'] === 'object';

    export interface IMessageData {
      readonly data: any; // The data sent with the message, an object with unknown content.
      readonly sender: String;
      getData(): any;
      getSender(): string;
    }
    /**
     * The data bound to a message name.
     */
    export class MessageData implements IMessageData {
      public readonly data: any;
      public readonly sender: string;
      constructor(data: object, sender: string) {
        this.data = data;
        this.sender = sender;
      }
      public getData(): any {
        return this.data;
      }
      public getSender(): string {
        return this.sender;
      }
    }

    export interface IMessagesList {
      getName(): string;
      getMessages(): IMessageData[];
      pushMessage(data: object, sender: string): void;
    }
    export class MessagesList implements IMessagesList {
      private readonly data: IMessageData[] = [];
      private readonly messageName: string;

      constructor(messageName: string) {
        this.messageName = messageName;
      }

      public getName(): string {
        return this.messageName;
      }

      public getMessages(): IMessageData[] {
        return this.data;
      }

      public pushMessage(data: object, sender: string): void {
        this.data.push(new MessageData(data, sender));
      }
    }

    /**
     * The peer to peer configuration.
     */
    let peerConfig: Peer.PeerJSOption = { debug: 1 };

    /**
     * The p2p client.
     */
    let peer: Peer<NetworkMessage> | null = null;

    /**
     * All connected p2p clients, keyed by their ID.
     */
    const connections = new Map<string, Peer.DataConnection<NetworkMessage>>();

    /**
     * Contains a map of message triggered by other p2p clients.
     * It is keyed by the event name.
     */
    const allMessages = new Map<string, IMessagesList>();

    /**
     * True if PeerJS is initialized and ready.
     */
    let ready = false;

    /**
     * List of IDs of peers that just disconnected.
     */
    const justDisconnectedPeers: string[] = [];

    /**
     * List of IDs of peers that just remotely initiated a connection.
     */
    const justConnectedPeers: string[] = [];

    /**
     * The compression method used to compress data sent over the network.
     */
    let compressionMethod: CompressionMethod = 'none';
    export const setCompressionMethod = (method: CompressionMethod) => {
      compressionMethod = method;
    };

    /**
     * Helper function to compress data sent over the network.
     */
    async function compressData(data: object): Promise<Uint8Array | string> {
      if (compressionMethod === 'none') {
        // If no compression is used, we just stringify the data,
        // PeerJS will compress it to binary data.
        const jsonString = JSON.stringify(data);
        return jsonString;
      }

      const compressionStreamFormat =
        compressionMethod === 'cs:gzip' ? 'gzip' : 'deflate';

      const jsonString = JSON.stringify(data);
      const encoder = new TextEncoder();
      const array = encoder.encode(jsonString);

      // @ts-ignore - We checked that CompressionStream is available in the browser.
      const cs = new CompressionStream(compressionStreamFormat);
      const writer = cs.writable.getWriter();
      writer.write(array);
      writer.close();

      const compressedStream = cs.readable;
      const reader = compressedStream.getReader();
      const chunks: any[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }

      const compressedData = new Uint8Array(
        chunks.reduce((acc, chunk) => acc.concat(Array.from(chunk)), [])
      );
      return compressedData;
    }

    /**
     * Helper function to decompress data received over the network.
     * It returns the parsed JSON object, if valid, or undefined.
     */
    async function decompressData(
      receivedData: Uint8Array | string
    ): Promise<object | undefined> {
      if (compressionMethod === 'none') {
        // If no compression is used, we just parse the data.
        if (typeof receivedData !== 'string') {
          logger.error(
            `Error while parsing message using compressionMethod ${compressionMethod}: received data is not a string.`
          );
          return;
        }

        try {
          const parsedData = JSON.parse(receivedData);
          return parsedData;
        } catch (e) {
          logger.error(`Error while parsing message: ${e.toString()}`);
          return;
        }
      }
      const compressionStreamFormat =
        compressionMethod === 'cs:gzip' ? 'gzip' : 'deflate';

      // @ts-ignore - We checked that DecompressionStream is available in the browser.
      const ds = new DecompressionStream(compressionStreamFormat);
      const writer = ds.writable.getWriter();
      writer.write(receivedData);
      writer.close();

      const decompressedStream = ds.readable;
      const reader = decompressedStream.getReader();
      const chunks: any[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }

      const decompressedData = new Uint8Array(
        chunks.reduce((acc, chunk) => acc.concat(Array.from(chunk)), [])
      );
      const decoder = new TextDecoder();
      const jsonStringData = decoder.decode(decompressedData); // Convert Uint8Array back to string
      try {
        const parsedData = JSON.parse(jsonStringData);
        return parsedData;
      } catch (e) {
        logger.error(`Error while parsing message: ${e.toString()}`);
        return;
      }
    }

    /**
     * Helper function to get the messages list for a given message name.
     */
    export const getOrCreateMessagesList = (
      messageName: string
    ): IMessagesList => {
      const messagesList = allMessages.get(messageName);
      if (messagesList) return messagesList;
      const newMessagesList = new MessagesList(messageName);
      allMessages.set(messageName, newMessagesList);
      return newMessagesList;
    };

    /**
     * Internal function called when a connection with a remote peer is initiated.
     * @param connection The DataConnection of the peer
     */
    const _onConnect = (connection: Peer.DataConnection<NetworkMessage>) => {
      connections.set(connection.peer, connection);
      connection.on('data', async (data) => {
        if (isValidNetworkMessage(data)) {
          const messagesList = getOrCreateMessagesList(data.messageName);
          const messageSender = connection.peer;
          const decompressedData = await decompressData(data.data);
          if (!decompressedData) return;

          messagesList.pushMessage(decompressedData, messageSender);
        }
      });

      // Close event is only for graceful disconnection,
      // but we want onDisconnect to trigger for any type of disconnection,
      // so we register a listener for both event types.
      connection.on('error', () => {
        _onDisconnect(connection.peer);
      });
      connection.on('close', () => {
        _onDisconnect(connection.peer);
      });
      connection.on('iceStateChanged', (state) => {
        if (state === 'disconnected') {
          _onDisconnect(connection.peer);
        }
      });

      // Regularly check for disconnection as the built in way is not reliable.
      (function disconnectChecker() {
        if (
          connection.peerConnection &&
          (connection.peerConnection.connectionState === 'failed' ||
            connection.peerConnection.connectionState === 'disconnected' ||
            connection.peerConnection.connectionState === 'closed')
        ) {
          _onDisconnect(connection.peer);
        } else {
          setTimeout(disconnectChecker, 1000);
        }
      })();
    };

    /**
     * Internal function called when a remote client disconnects.
     * @param connectionID The ID of the peer that disconnected.
     */
    const _onDisconnect = (connectionID: string) => {
      if (!connections.has(connectionID)) return;
      justDisconnectedPeers.push(connectionID);
      connections.delete(connectionID);
    };

    /**
     * Internal function called to initialize PeerJS after it
     * has been configured.
     */
    const loadPeerJS = () => {
      if (peer !== null) return;
      peer = new Peer(peerConfig);
      peer.on('open', () => {
        ready = true;
      });
      peer.on('error', (errorMessage) => {
        logger.error('PeerJS error:', errorMessage);
      });
      peer.on('connection', (connection) => {
        connection.on('open', () => {
          _onConnect(connection);
          justConnectedPeers.push(connection.peer);
        });
      });
      peer.on('close', () => {
        peer = null;
        loadPeerJS();
      });
      peer.on('disconnected', peer.reconnect);
    };

    /**
     * Connects to another p2p client.
     * @param id - The other client's ID.
     */
    export const connect = (id: string) => {
      if (peer === null) return;
      const connection = peer.connect(id);
      connection.on('open', () => {
        _onConnect(connection);
      });
    };

    /**
     * Disconnects from all other p2p clients.
     */
    export const disconnectFromAllPeers = () => {
      for (const connection of connections.values()) connection.close();
    };

    /**
     * Send a message to a specific peer.
     * @param ids - The IDs of the clients to send the event to.
     * @param messageName - The event to trigger.
     * @param eventData - Additional data to send with the event.
     */
    export const sendDataTo = async (
      ids: string[],
      messageName: string,
      messageData: object
    ) => {
      if (!ids.length) return;

      const compressedData = await compressData(messageData);

      for (const id of ids) {
        const connection = connections.get(id);
        if (connection) {
          connection.send({
            messageName,
            data: compressedData,
          });
        }
      }
    };

    export const getAllMessagesMap = () => allMessages;

    /**
     * Connects to a custom broker server.
     * @param host The host of the broker server.
     * @param port The port of the broker server.
     * @param path The path (part of the url after the host) to the broker server.
     * @param key Optional password to connect to the broker server.
     * @param ssl Use ssl?
     */
    export const useCustomBrokerServer = (
      host: string,
      port: number,
      path: string,
      key: string,
      ssl: boolean
    ) => {
      Object.assign(peerConfig, {
        host,
        port,
        path,
        secure: ssl,
        // All servers have "peerjs" as default key
        key: key.length === 0 ? 'peerjs' : key,
      });
      loadPeerJS();
    };

    export const useDefaultBrokerServer = loadPeerJS;

    /**
     * Adds an ICE server candidate, and removes the default ones provided by PeerJs. Must be called before connecting to a broker.
     * @param urls The URL of the STUN/TURN server.
     * @param username An optional username to send to the server.
     * @param credential An optional password to send to the server.
     */
    export const useCustomICECandidate = (
      urls: string,
      username?: string,
      credential?: string
    ) => {
      peerConfig.config = peerConfig.config || {};
      peerConfig.config.iceServers = peerConfig.config.iceServers || [];
      peerConfig.config.iceServers.push({
        urls,
        username,
        credential,
      });
    };

    /**
     * Forces the usage of a relay (TURN) server, to avoid sharing IP addresses with the other peers.
     * @param shouldUseRelayServer Whether relay-only should be enabled or disabled.
     */
    export const forceUseRelayServer = (shouldUseRelayServer: boolean) => {
      peerConfig.config = peerConfig.config || {};
      peerConfig.config.iceTransportPolicy = shouldUseRelayServer
        ? 'relay'
        : 'all';
    };

    /**
     * Returns the own current peer ID.
     * @see Peer.id
     */
    export const getCurrentId = (): string => {
      if (peer == undefined) return '';
      return peer.id || '';
    };

    /**
     * Returns true once PeerJS finished initialization.
     * @see ready
     */
    export const isReady = () => ready;

    /**
     * Return peers that have disconnected in the frame.
     */
    export const getJustDisconnectedPeers = () => justDisconnectedPeers;

    /**
     * Returns the list of all currently connected peers.
     */
    export const getAllPeers = () => Array.from(connections.keys());

    gdjs.callbacksRuntimeScenePostEvents.push(() => {
      // Clear the list of messages at the end of the frame, assuming they've been all processed.
      for (const messagesList of allMessages.values()) {
        messagesList.getMessages().length = 0;
      }
      // Clear the list of just connected and disconnected peers.
      if (justDisconnectedPeers.length > 0) {
        justDisconnectedPeers.length = 0;
      }
      if (justConnectedPeers.length > 0) {
        justConnectedPeers.length = 0;
      }
    });
  }
}
