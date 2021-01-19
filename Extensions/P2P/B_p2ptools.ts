/// <reference path="peerjs.d.ts" />
namespace gdjs {
  export namespace evtTools {
    /**
     * Tools for p2p multiplayer.
     * @namespace
     */
    export namespace p2p {
      /**
       * The peer to peer configuration.
       */
      let peerConfig: Peer.PeerJSOption = { debug: 1 };

      /**
       * The p2p client.
       */
      let peer: Peer | null = null;

      /**
       * All connected p2p clients, keyed by their ID.
       */
      const connections: Record<string, Peer.DataConnection> = {};

      /**
       * Contains a list of events triggered by other p2p clients.
       * Maps an event name (string) to a boolean:
       * true if the event has been triggered, otherwise false.
       * @note This is ignored if the event is in no dataloss mode.
       */
      const triggeredEvents: Record<string, boolean> = {};

      /**
       * Contains the latest data sent with each event.
       * If the event is in dataloss mode, maps an event name
       * to the string sent with that event.
       * If the event is in no dataloss mode, maps an event name
       * to an array containing the data of each call of that event.
       */
      const lastEventData: Record<string, string | string[]> = {};

      /**
       * Tells how to handle an event (with or without data loss).
       * Maps the event name (string) to a boolean:
       * true for dataloss, false for no dataloss.
       */
      const eventHandling: Record<string, boolean> = {};

      /**
       * True if PeerJS is initialized and ready.
       */
      let ready = false;

      /**
       * True if an error occured.
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
       * Internal function called to initialize PeerJS after its
       * broker server has been configured.
       */
      const _loadPeerJS = () => {
        if (peer !== null) return;
        peer = new Peer(peerConfig);
        peer.on('open', () => {
          ready = true;
        });
        peer.on('error', (errorMessage) => {
          error = true;
          lastError = errorMessage;
        });
        peer.on('connection', (connection) => {
          connection.on('open', () => {
            _onConnection(connection);
            connectedPeers.push(connection.peer);
          });
        });
        peer.on('close', () => {
          peer = null;
          _loadPeerJS();
        });
        peer.on('disconnected', peer.reconnect);
      };

      /**
       * Internal function called when a connection with a remote peer is initiated.
       * @param connection The DataConnection of the peer
       */
      const _onConnection = (connection: Peer.DataConnection) => {
        connections[connection.peer] = connection;
        connection.on('data', (data) => {
          if (data.eventName === undefined) {
            return;
          }
          const dataLoss = eventHandling[data.eventName];
          if (typeof dataLoss === 'undefined' || dataLoss === false) {
            if (typeof lastEventData[data.eventName] !== 'object')
              lastEventData[data.eventName] = [];

            (lastEventData[data.eventName] as string[]).push(data.data);
          } else {
            triggeredEvents[data.eventName] = true;
            lastEventData[data.eventName] = data.data;
          }
        });
        connection.on('error', () => {
          // Close event is only for graceful disconnection, also handle error aka ungraceful disconnection
          _onDisconnect(connection.peer);
        });
        connection.on('close', () => {
          _onDisconnect(connection.peer);
        });

        // Regularly check for disconnection as the built in way is not reliable.
        (function disconnectChecker() {
          if (
            connection.peerConnection.connectionState === 'failed' ||
            connection.peerConnection.connectionState === 'disconnected'
          ) {
            _onDisconnect(connection.peer);
          } else {
            setTimeout(disconnectChecker, 500);
          }
        })();
      };

      /**
       * Internal function called when a remote client disconnects.
       * @param connectionID The ID of the peer that disconnected.
       */
      const _onDisconnect = (connectionID: string) => {
        disconnectedPeers.push(connectionID);
        delete connections[connectionID];
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
       * Returns true when the event got triggered by another p2p client.
       * @param defaultDataLoss Is data loss allowed (accelerates event handling when true)?
       */
      export const onEvent = (
        eventName: string,
        defaultDataLoss: boolean
      ): boolean => {
        const dataLoss = eventHandling[eventName];
        if (dataLoss == undefined) {
          eventHandling[eventName] = defaultDataLoss;
          return onEvent(eventName, defaultDataLoss);
        }
        if (dataLoss) {
          let returnValue = triggeredEvents[eventName];
          if (typeof returnValue === 'undefined') {
            return false;
          }
          triggeredEvents[eventName] = false;
          return returnValue;
        } else {
          let returnValue = lastEventData[eventName];
          if (typeof returnValue === 'undefined') {
            return false;
          }
          return returnValue.length !== 0;
        }
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
        eventData?: string
      ) => {
        if (connections[id]) {
          connections[id].send({
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
      export const sendDataToAll = (eventName: string, eventData?: string) => {
        for (const id in connections) {
          connections[id].send({
            eventName: eventName,
            data: eventData,
          });
        }
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
        sendDataTo(
          id,
          eventName,
          gdjs.evtTools.network.variableStructureToJSON(variable)
        );
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
        sendDataToAll(
          eventName,
          gdjs.evtTools.network.variableStructureToJSON(variable)
        );
      };

      /**
       * Get some data associated to the last trigger of an event.
       * @param eventName - The event to get data from.
       * @returns - The data as JSON.
       */
      export const getEventData = (eventName: string): string => {
        const dataLoss = eventHandling[eventName];
        if (typeof dataLoss === 'undefined' || dataLoss === false) {
          const event = lastEventData[eventName];
          return event[event.length - 1];
        } else {
          return lastEventData[eventName] as string;
        }
      };

      /**
       * Get a variable associated to the last trigger of an event.
       * @param eventName - The event to get the variable from.
       * @param variable - The variable where to store the variable content.
       */
      export const getEventVariable = (
        eventName: string,
        variable: gdjs.Variable
      ) => {
        gdjs.evtTools.network.jsonToVariableStructure(
          getEventData(eventName),
          variable
        );
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
        // All servers have "peerjs" as default key
        peerConfig = {
          debug: 1,
          host,
          port,
          path,
          secure: ssl,
          key: key.length === 0 ? 'peerjs' : key,
        };
        _loadPeerJS();
      };

      /**
       * Use default broker server.
       * This is not recommended for published games,
       * this server should only be used for quick testing in development.
       */
      export const useDefaultBrokerServer = _loadPeerJS;

      /**
       * Returns the own current peer ID.
       * @see Peer.id
       */
      export const getCurrentId = (): string => {
        if (peer == undefined) {
          return '';
        }
        return peer.id || '';
      };

      /**
       * Returns true once PeerJS finished initialization.
       * @see ready
       */
      export const isReady = (): boolean => {
        return ready;
      };

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
      export const getLastError = (): string => {
        return lastError;
      };

      /**
       * Returns true once a peer disconnected.
       */
      export const onDisconnect = (): boolean => {
        return disconnectedPeers.length > 0;
      };

      /**
       * Get the ID of the peer that triggered onDisconnect.
       */
      export const getDisconnectedPeer = (): string => {
        return disconnectedPeers[disconnectedPeers.length - 1] || '';
      };

      /**
       * Returns true once if a remote peer just initiated a connection.
       */
      export const onConnection = (): boolean => {
        return connectedPeers.length > 0;
      };

      /**
       * Get the ID of the peer that triggered onConnection.
       */
      export const getConnectedPeer = (): string => {
        return connectedPeers[connectedPeers.length - 1] || '';
      };

      gdjs.callbacksRuntimeScenePostEvents.push(() => {
        for (const i in lastEventData) {
          if (
            typeof lastEventData[i] === 'object' &&
            lastEventData[i].length > 0
          ) {
            (lastEventData[i] as string[]).pop();
          }
        }
        if (disconnectedPeers.length > 0) {
          disconnectedPeers.pop();
        }
        if (connectedPeers.length > 0) {
          connectedPeers.pop();
        }
      });
    }
  }
}
