/// <reference path="peerjs.d.ts" />
namespace gdjs {
  export namespace evtTools {
    /**
     * Tools for p2p multiplayer.
     * @namespace
     */
    export namespace p2p {
      /**
       * The type of the data that is sent across peerjs.
       */
      type NetworkEvent = {
        eventName: string;
        data: string;
      };

      const isValidNetworkEvent = (event: unknown): event is NetworkEvent =>
        typeof event === 'object' &&
        event !== null &&
        typeof event['eventName'] === 'string' &&
        typeof event['data'] === 'string';

      /**
       * The data bound to an event that got triggered.
       */
      class EventData {
        constructor(data: string, sender: string) {
          this.data = data;
          this.sender = sender;
        }

        /**
         * The data sent alongside the event.
         */
        public readonly data: string = '';

        /**
         * The ID of the sender of the event.
         */
        public readonly sender: string = '';
      }

      /**
       * An event that can be listened to.
       */
      class Event {
        private readonly data: EventData[] = [];
        public dataloss = false;

        /**
         * Returns true if the event is triggered.
         */
        isTriggered() {
          return this.data.length > 0;
        }

        /**
         * Add new data, to be called with the event data each time the event is triggered.
         */
        pushData(newData: EventData) {
          if (this.dataloss && this.data.length > 0) this.data[0] = newData;
          else this.data.push(newData);
        }

        /**
         * Deleted the last event data, to be called when it is sure the event was processed thoroughly.
         */
        popData() {
          this.data.shift();
        }

        /**
         * Get the data sent with the last event triggering.
         */
        getData() {
          return this.data.length === 0 ? '' : this.data[0].data;
        }

        /**
         * Get the sender of the last event triggering.
         */
        getSender() {
          return this.data.length === 0 ? '' : this.data[0].sender;
        }
      }

      /**
       * The optional peer ID. Only used if explicitly overridden.
       */
      let peerId: string | null = null;

      /**
       * The peer to peer configuration.
       */
      let peerConfig: Peer.PeerJSOption = { debug: 1 };

      /**
       * The p2p client.
       */
      let peer: Peer<NetworkEvent> | null = null;

      /**
       * All connected p2p clients, keyed by their ID.
       */
      const connections = new Map<string, Peer.DataConnection<NetworkEvent>>();

      /**
       * Contains a map of events triggered by other p2p clients.
       * It is keyed by the event name.
       */
      const events = new Map<string, Event>();

      /**
       * True if PeerJS is initialized and ready.
       */
      let ready = false;

      /**
       * True if an error occurred.
       */
      let error = false;

      /**
       * Last error's message.
       */
      let lastError = '';

      /**
       * List of IDs of peers that just disconnected.
       */
      const disconnectedPeers: string[] = [];

      /**
       * List of IDs of peers that just remotely initiated a connection.
       */
      const connectedPeers: string[] = [];

      /**
       * Internal function called to initialize PeerJS after it
       * has been configured.
       */
      const loadPeerJS = () => {
        if (peer !== null) return;
        if (peerId !== null) {
          peer = new Peer(peerId, peerConfig);
        } else {
          peer = new Peer(peerConfig);
        }
        peer.on('open', () => {
          ready = true;
        });
        peer.on('error', (errorMessage) => {
          error = true;
          lastError = errorMessage.message;
        });
        peer.on('connection', (connection) => {
          connection.on('open', () => {
            _onConnection(connection);
            connectedPeers.push(connection.peer);
          });
        });
        peer.on('close', () => {
          peer = null;
          loadPeerJS();
        });
        peer.on('disconnected', peer.reconnect);
      };

      /**
       * Internal function called when a connection with a remote peer is initiated.
       * @param connection The DataConnection of the peer
       */
      const _onConnection = (connection: Peer.DataConnection<NetworkEvent>) => {
        connections.set(connection.peer, connection);
        connection.on('data', (data) => {
          if (isValidNetworkEvent(data))
            getEvent(data.eventName).pushData(
              new EventData(data.data, connection.peer)
            );
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

        // Regularly check for disconnection as the built in way is not reliable.
        (function disconnectChecker() {
          if (
            connection.peerConnection.connectionState === 'failed' ||
            connection.peerConnection.connectionState === 'disconnected' ||
            connection.peerConnection.connectionState === 'closed'
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
        disconnectedPeers.push(connectionID);
        connections.delete(connectionID);
      };

      /**
       * Get an event, and creates it if it doesn't exist.
       */
      export const getEvent = (name: string): Event => {
        let event = events.get(name);
        if (!event) events.set(name, (event = new Event()));
        return event;
      };

      /**
       * Connects to another p2p client.
       * @param id - The other client's ID.
       */
      export const connect = (id: string) => {
        if (peer === null) return;
        const connection = peer.connect(id);
        connection.on('open', () => {
          _onConnection(connection);
        });
      };

      /**
       * Disconnects from another p2p client.
       * @param id - The other client's ID.
       */
      export const disconnectFromPeer = (id: string) => {
        const connection = connections.get(id);
        if (connection) connection.close();
      };

      /**
       * Disconnects from all other p2p clients.
       */
      export const disconnectFromAllPeers = () => {
        for (const connection of connections.values()) connection.close();
      };

      /**
       * Disconnects from all peers and the broker server.
       */
      export const disconnectFromAll = () => {
        if (peer) {
          peer.destroy();
          peer = null;
        }
      };

      /**
       * Disconnects from the broker server, leaving the connections intact.
       */
      export const disconnectFromBroker = () => {
        if (peer) {
          peer.disconnect();
          peer = null;
        }
      };

      /**
       * Returns true when the event got triggered by another p2p client.
       * @param defaultDataLoss Is data loss allowed (accelerates event handling when true)?
       */
      export const onEvent = (
        eventName: string,
        defaultDataLoss: boolean
      ): boolean => {
        const event = getEvent(eventName);
        event.dataloss = defaultDataLoss;
        return event.isTriggered();
      };

      /**
       * Send an event to one specific connected client.
       * @param id - The ID of the client to send the event to.
       * @param eventName - The event to trigger.
       * @param [eventData] - Additional data to send with the event.
       */
      export const sendDataTo = (
        id: string,
        eventName: string,
        eventData: string
      ) => {
        const connection = connections.get(id);
        if (connection) {
          connection.send({
            eventName: eventName,
            data: eventData,
          });
        }
      };

      /**
       * Send an event to all connected clients.
       * @param eventName - The event to trigger.
       * @param [eventData] - Additional data to send with the event.
       */
      export const sendDataToAll = (eventName: string, eventData: string) => {
        for (const connection of connections.values())
          connection.send({
            eventName: eventName,
            data: eventData,
          });
      };

      /**
       * Send an event to one specific connected client.
       * @param id - The ID of the client to send the event to.
       * @param eventName - The event to trigger.
       * @param variable - Additional variable to send with the event.
       */
      export const sendVariableTo = (
        id: string,
        eventName: string,
        variable: gdjs.Variable
      ) => {
        sendDataTo(id, eventName, JSON.stringify(variable.toJSObject()));
      };

      /**
       * Send an event to all connected clients.
       * @param eventName - The event to trigger.
       * @param variable - Additional variable to send with the event.
       */
      export const sendVariableToAll = (
        eventName: string,
        variable: gdjs.Variable
      ) => {
        sendDataToAll(eventName, JSON.stringify(variable.toJSObject()));
      };

      /**
       * Get some data associated to the last trigger of an event.
       * @param eventName - The event to get data from.
       * @returns - The data as JSON.
       */
      export const getEventData = (eventName: string) =>
        getEvent(eventName).getData();

      /**
       * Get the id of peer that caused the last trigger of an event.
       * @param eventName - The event to get the sender from.
       */
      export const getEventSender = (eventName: string) =>
        getEvent(eventName).getSender();

      /**
       * Get a variable associated to the last trigger of an event.
       * @param eventName - The event to get the variable from.
       * @param variable - The variable where to store the variable content.
       */
      export const getEventVariable = (
        eventName: string,
        variable: gdjs.Variable
      ) => {
        variable.fromJSON(getEventData(eventName));
      };

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

      /**
       * Use default broker server.
       * This is not recommended for published games,
       * this server should only be used for quick testing in development.
       */
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
       * Overrides the default peer ID. Must be called before connecting to a broker.
       * Overriding the ID may have unwanted consequences. Do not use this feature
       * unless you really know what you are doing.
       * @param id The peer ID to use when connecting to a broker.
       */
      export const overrideId = (id: string) => {
        peerId = id;
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
       * Returns true once when there is an error.
       */
      export const onError = (): boolean => {
        const returnValue = error;
        error = false;
        return returnValue;
      };

      /**
       * Returns the latest error message.
       */
      export const getLastError = () => lastError;

      /**
       * Returns true once a peer disconnected.
       */
      export const onDisconnect = () => disconnectedPeers.length > 0;

      /**
       * Get the ID of the peer that triggered onDisconnect.
       */
      export const getDisconnectedPeer = () => disconnectedPeers[0] || '';

      /**
       * Returns true once if a remote peer just initiated a connection.
       */
      export const onConnection = () => connectedPeers.length > 0;

      /**
       * Get the ID of the peer that triggered onConnection.
       */
      export const getConnectedPeer = (): string => connectedPeers[0] || '';

      /**
       * A JavaScript-only function to get the raw P2P DataConnection.
       * This can be useful for example when you want to use a binary protocol
       * instead of GDevelop variables for high-performance networking.
       */
      export const getConnectionInstance = (peerID: string) =>
        connections.get(peerID);

      gdjs.callbacksRuntimeScenePostEvents.push(() => {
        for (const event of events.values()) {
          event.popData();
        }
        if (disconnectedPeers.length > 0) {
          disconnectedPeers.shift();
        }
        if (connectedPeers.length > 0) {
          connectedPeers.shift();
        }
      });
    }
  }
}
