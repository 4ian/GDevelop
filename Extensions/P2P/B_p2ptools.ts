// @ts-nocheck - TODO: convert this file to use TypeScript namespaces
/// <reference path="peerjs" />

namespace gdjs {
  /**
   * Tools for p2p multiplayer.
   * @namespace
   */
  gdjs.evtTools.p2p = {
    /**
     * The peer to peer configuration.
     */
    peerConfig: { debug: 1 },
    // Enable logging of critical errors
    /**
     * The p2p client.
     */
    peer: null,
    /**
     * All connected p2p clients, keyed by their ID.
     */
    connections: {},
    /**
     * Contains a list of events triggered by other p2p clients.
     * Maps an event name (string) to a boolean:
     * true if the event has been triggered, otherwise false.
     * @note This is ignored if the event is in no dataloss mode.
     */
    triggeredEvents: {},
    /**
     * Contains the latest data sent with each event.
     * If the event is in dataloss mode, maps an event name (string)
     * to the string sent with that event.
     * If the event is in no dataloss mode, maps an event name (string)
     * to an array containing the data of each call of that event.
     */
    lastEventData: {},
    /**
     * Tells how to handle an event (with or without data loss).
     * Maps the event name (string) to a boolean:
     * true for dataloss, false for no dataloss.
     */
    eventHandling: {},
    /**
     * True if PeerJS is initialized and ready.
     */
    ready: false,
    /**
     * True if an error occured.
     */
    error: false,
    /**
     * Last error's message.
     */
    lastError: '',
    /**
     * List of IDs of peers that just disconnected.
     */
    disconnectedPeers: [],
    /**
     * List of IDs of peers that just remotely initiated a connection.
     */
    connectedPeers: [],
  };

  /**
   * Internal function called to initialize PeerJS after its
   * broker server has been configured.
   */
  gdjs.evtTools.p2p._loadPeerJS = function () {
    if (gdjs.evtTools.p2p.peer != null) {
      return;
    }
    gdjs.evtTools.p2p.peer = new Peer(gdjs.evtTools.p2p.peerConfig);
    gdjs.evtTools.p2p.peer.on('open', function () {
      gdjs.evtTools.p2p.ready = true;
    });
    gdjs.evtTools.p2p.peer.on('error', function (errorMessage) {
      gdjs.evtTools.p2p.error = true;
      gdjs.evtTools.p2p.lastError = errorMessage;
    });
    gdjs.evtTools.p2p.peer.on('connection', function (connection) {
      connection.on('open', function () {
        gdjs.evtTools.p2p._onConnection(connection);
        gdjs.evtTools.p2p.connectedPeers.push(connection.peer);
      });
    });
    gdjs.evtTools.p2p.peer.on('close', function () {
      gdjs.evtTools.p2p.peer = null;
      gdjs.evtTools.p2p._loadPeerJS();
    });
    gdjs.evtTools.p2p.peer.on('disconnected', gdjs.evtTools.p2p.peer.reconnect);
  };

  /**
   * Internal function called when a connection with a remote peer is initiated.
   * @param connection The DataConnection of the peer
   */
  gdjs.evtTools.p2p._onConnection = function (connection: Peer.DataConnection) {
    gdjs.evtTools.p2p.connections[connection.peer] = connection;
    connection.on('data', function (data) {
      if (data.eventName === undefined) {
        return;
      }
      const dataLoss = gdjs.evtTools.p2p.eventHandling[data.eventName];
      if (typeof dataLoss === 'undefined' || dataLoss === false) {
        if (
          typeof gdjs.evtTools.p2p.lastEventData[data.eventName] !== 'object'
        ) {
          gdjs.evtTools.p2p.lastEventData[data.eventName] = [];
        }
        gdjs.evtTools.p2p.lastEventData[data.eventName].push(data.data);
      } else {
        gdjs.evtTools.p2p.triggeredEvents[data.eventName] = true;
        gdjs.evtTools.p2p.lastEventData[data.eventName] = data.data;
      }
    });
    connection.on('error', function () {
      // Close event is only for graceful disconnection, also handle error aka ungraceful disconnection
      gdjs.evtTools.p2p._onDisconnect(connection.peer);
    });
    connection.on('close', function () {
      gdjs.evtTools.p2p._onDisconnect(connection.peer);
    });

    // Regularly check for disconnection as the built in way is not reliable.
    function disconnectChecker() {
      if (
        connection.peerConnection.connectionState === 'failed' ||
        connection.peerConnection.connectionState === 'disconnected'
      ) {
        gdjs.evtTools.p2p._onDisconnect(connection.peer);
      } else {
        setTimeout(disconnectChecker, 500);
      }
    }
    disconnectChecker();
  };

  /**
   * Internal function called when a remote client disconnects.
   * @param connectionID The ID of the peer that disconnected.
   */
  gdjs.evtTools.p2p._onDisconnect = function (connectionID: string) {
    gdjs.evtTools.p2p.disconnectedPeers.push(connectionID);
    delete gdjs.evtTools.p2p.connections[connectionID];
  };

  /**
   * Connects to another p2p client.
   * @param id - The other client's ID.
   */
  gdjs.evtTools.p2p.connect = function (id: string) {
    const connection = gdjs.evtTools.p2p.peer.connect(id);
    connection.on('open', function () {
      gdjs.evtTools.p2p._onConnection(connection);
    });
  };

  /**
   * Returns true when the event got triggered by another p2p client.
   * @param defaultDataLoss Is data loss allowed (accelerates event handling when true)?
   */
  gdjs.evtTools.p2p.onEvent = function (
    eventName: string,
    defaultDataLoss: boolean
  ): boolean {
    const dataLoss = gdjs.evtTools.p2p.eventHandling[eventName];
    if (dataLoss == undefined) {
      gdjs.evtTools.p2p.eventHandling[eventName] = defaultDataLoss;
      return gdjs.evtTools.p2p.onEvent(eventName, defaultDataLoss);
    }
    if (dataLoss) {
      let returnValue = gdjs.evtTools.p2p.triggeredEvents[eventName];
      if (typeof returnValue === 'undefined') {
        return false;
      }
      gdjs.evtTools.p2p.triggeredEvents[eventName] = false;
      return returnValue;
    } else {
      let returnValue = gdjs.evtTools.p2p.lastEventData[eventName];
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
  gdjs.evtTools.p2p.sendDataTo = function (
    id: string,
    eventName: string,
    eventData?: string
  ) {
    if (gdjs.evtTools.p2p.connections[id]) {
      gdjs.evtTools.p2p.connections[id].send({
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
  gdjs.evtTools.p2p.sendDataToAll = function (
    eventName: string,
    eventData?: string
  ) {
    for (const id in gdjs.evtTools.p2p.connections) {
      gdjs.evtTools.p2p.connections[id].send({
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
  gdjs.evtTools.p2p.sendVariableTo = function (
    id: string,
    eventName: string,
    variable: gdjs.Variable
  ) {
    gdjs.evtTools.p2p.sendDataTo(
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
  gdjs.evtTools.p2p.sendVariableToAll = function (
    eventName: string,
    variable: gdjs.Variable
  ) {
    gdjs.evtTools.p2p.sendDataToAll(
      eventName,
      gdjs.evtTools.network.variableStructureToJSON(variable)
    );
  };

  /**
   * Get some data associated to the last trigger of an event.
   * @param eventName - The event to get data from.
   * @returns - The data as JSON.
   */
  gdjs.evtTools.p2p.getEventData = function (eventName: string): string {
    const dataLoss = gdjs.evtTools.p2p.eventHandling[eventName];
    if (typeof dataLoss === 'undefined' || dataLoss === false) {
      const event = gdjs.evtTools.p2p.lastEventData[eventName];
      return event[event.length - 1];
    } else {
      return gdjs.evtTools.p2p.lastEventData[eventName];
    }
  };

  /**
   * Get a variable associated to the last trigger of an event.
   * @param eventName - The event to get the variable from.
   * @param variable - The variable where to store the variable content.
   */
  gdjs.evtTools.p2p.getEventVariable = function (
    eventName: string,
    variable: gdjs.Variable
  ) {
    gdjs.evtTools.network.jsonToVariableStructure(
      gdjs.evtTools.p2p.getEventData(eventName),
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
  gdjs.evtTools.p2p.useCustomBrokerServer = function (
    host: string,
    port: number,
    path: string,
    key: string,
    ssl: boolean
  ) {
    key = key.length === 0 ? 'peerjs' : key;

    // All servers have "peerjs" as default key
    gdjs.evtTools.p2p.peerConfig = {
      debug: 1,
      host,
      port,
      path,
      secure: ssl,
      key,
    };
    gdjs.evtTools.p2p._loadPeerJS();
  };

  /**
   * Use default broker server.
   * This is not recommended for published games,
   * this server should only be used for quick testing in development.
   */
  gdjs.evtTools.p2p.useDefaultBrokerServer = function () {
    gdjs.evtTools.p2p._loadPeerJS();
  };

  /**
   * Returns the own current peer ID.
   * @see Peer.id
   */
  gdjs.evtTools.p2p.getCurrentId = function (): string {
    if (gdjs.evtTools.p2p.peer == undefined) {
      return '';
    }
    return gdjs.evtTools.p2p.peer.id || '';
  };

  /**
   * Returns true once PeerJS finished initialization.
   * @see gdjs.evtTools.p2p.ready
   */
  gdjs.evtTools.p2p.isReady = function (): boolean {
    return gdjs.evtTools.p2p.ready;
  };

  /**
   * Returns true once when there is an error.
   */
  gdjs.evtTools.p2p.onError = function (): boolean {
    const returnValue = gdjs.evtTools.p2p.error;
    gdjs.evtTools.p2p.error = false;
    return returnValue;
  };

  /**
   * Returns the latest error message.
   */
  gdjs.evtTools.p2p.getLastError = function (): boolean {
    return gdjs.evtTools.p2p.lastError;
  };

  /**
   * Returns true once a peer disconnected.
   */
  gdjs.evtTools.p2p.onDisconnect = function (): boolean {
    return gdjs.evtTools.p2p.disconnectedPeers.length > 0;
  };

  /**
   * Get the ID of the peer that triggered onDisconnect.
   */
  gdjs.evtTools.p2p.getDisconnectedPeer = function (): string {
    return (
      gdjs.evtTools.p2p.disconnectedPeers[
        gdjs.evtTools.p2p.disconnectedPeers.length - 1
      ] || ''
    );
  };

  /**
   * Returns true once if a remote peer just initiated a connection.
   */
  gdjs.evtTools.p2p.onConnection = function (): boolean {
    return gdjs.evtTools.p2p.connectedPeers.length > 0;
  };

  /**
   * Get the ID of the peer that triggered onConnection.
   */
  gdjs.evtTools.p2p.getConnectedPeer = function (): string {
    return (
      gdjs.evtTools.p2p.connectedPeers[
        gdjs.evtTools.p2p.connectedPeers.length - 1
      ] || ''
    );
  };
  gdjs.callbacksRuntimeScenePostEvents.push(function () {
    for (const i in gdjs.evtTools.p2p.lastEventData) {
      if (
        typeof gdjs.evtTools.p2p.lastEventData[i] === 'object' &&
        gdjs.evtTools.p2p.lastEventData[i].length > 0
      ) {
        gdjs.evtTools.p2p.lastEventData[i].pop();
      }
    }
    if (gdjs.evtTools.p2p.disconnectedPeers.length > 0) {
      gdjs.evtTools.p2p.disconnectedPeers.pop();
    }
    if (gdjs.evtTools.p2p.connectedPeers.length > 0) {
      gdjs.evtTools.p2p.connectedPeers.pop();
    }
  });
}
