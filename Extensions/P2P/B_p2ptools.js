// @ts-check
/// <reference path="peerjs" />

/**
 * Tools for p2p multiplayer.
 * @namespace
 */
gdjs.evtTools.p2p = {
  /**
   * The peer to peer configuration.
   */
  peerConfig: {debug:1}, // Enable logging of critical errors

  /**
   * The p2p client.
   */
  peer: null,

  /**
   * All connected p2p clients, keyed by their id.
   */
  connections: {},

  /**
   * Contains a list of events triggered by other p2p clients.
   */
  triggeredEvents: {},

  /**
   * Contains the latest data sent with each event.
   */
  lastEventData: {},

  /**
   * Tells how to handle an event (with or without data loss)
   */
  eventHandling: {},

  /**
   * True if PeerJS is initialized and ready.
   */
  ready: false,
}

gdjs.evtTools.p2p._reloadPeerJS = function() {
  if (gdjs.evtTools.p2p.peer) gdjs.evtTools.p2p.peer.destroy();
  gdjs.evtTools.p2p.ready = false;
  gdjs.evtTools.p2p.peer = new Peer(gdjs.evtTools.p2p.peerConfig)
  gdjs.evtTools.p2p.peer.on("open", function() {
    gdjs.evtTools.p2p.ready = true;
  });
  gdjs.evtTools.p2p.peer.on("connection", gdjs.evtTools.p2p._onConnection);
  gdjs.evtTools.p2p.peer.on("close", gdjs.evtTools.p2p._reloadPeerJS);
  gdjs.evtTools.p2p.peer.on("disconnected", gdjs.evtTools.p2p.peer.reconnect);
}

gdjs.evtTools.p2p._onConnection = function(connection) {
  gdjs.evtTools.p2p.connections[connection.peer] = connection;
  connection.on("data", function(data) {
    if(data.eventName === undefined) return;
    var dataLoss = gdjs.evtTools.p2p.eventHandling[data.eventName];

    if (typeof dataLoss === "undefined" || dataLoss === false) {
      if(typeof gdjs.evtTools.p2p.lastEventData[data.eventName] !== "object")
        gdjs.evtTools.p2p.lastEventData[data.eventName] = [];
      gdjs.evtTools.p2p.lastEventData[data.eventName].push(data.data);
    } else {
      gdjs.evtTools.p2p.triggeredEvents[data.eventName] = true;
      gdjs.evtTools.p2p.lastEventData[data.eventName] = data.data;
    }
  });
}

/**
 * Connects to another p2p client.
 * @param {string} id - The other client's id.
 */
gdjs.evtTools.p2p.connect = function(id) {
  var connection = gdjs.evtTools.p2p.peer.connect(id);
  connection.on("open", function() { gdjs.evtTools.p2p._onConnection(connection) });
}

/**
 * Returns true when the event got triggered by another p2p client.
 * @param {string} eventName
 * @param {boolean} dataLoss Is data loss allowed (accelerates event handling when true)?
 * @returns {boolean}
 */
gdjs.evtTools.p2p.onEvent = function(eventName, _dataLoss) {
  var dataLoss = gdjs.evtTools.p2p.eventHandling[eventName];
  if (dataLoss == undefined) {
    gdjs.evtTools.p2p.eventHandling[eventName] = _dataLoss;
    return gdjs.evtTools.p2p.onEvent(eventName, _dataLoss);
  }
  if(dataLoss) {
    var returnValue = gdjs.evtTools.p2p.triggeredEvents[eventName];
    if(typeof returnValue === "undefined") return false;
    gdjs.evtTools.p2p.triggeredEvents[eventName] = false;
    return returnValue;
  } else {
    var returnValue = gdjs.evtTools.p2p.lastEventData[eventName];
    if(typeof returnValue === "undefined") return false;
    return returnValue.length !== 0;
  }
}

/**
 * Send an event to one specific connected client.
 * @param {string} id - The id of the client to send the event to.
 * @param {string} eventName - The event to trigger.
 * @param {string} [eventData] - Additional data to send with the event.
 */
gdjs.evtTools.p2p.sendDataTo = function(id, eventName, eventData) {
  if(gdjs.evtTools.p2p.connections[id])
    gdjs.evtTools.p2p.connections[id].send({eventName: eventName, data: eventData});
}

/**
 * Send an event to all connected clients.
 * @param {string} eventName - The event to trigger.
 * @param {string} [eventData] - Additional data to send with the event.
 */
gdjs.evtTools.p2p.sendDataToAll = function(eventName, eventData) {
  for(var id in gdjs.evtTools.p2p.connections) {
    gdjs.evtTools.p2p.connections[id].send({eventName: eventName, data: eventData});
  }
}

/**
 * Send an event to one specific connected client.
 * @param {string} id - The id of the client to send the event to.
 * @param {string} eventName - The event to trigger.
 * @param {gdjs.Variable} variable - Additional variable to send with the event.
 */
gdjs.evtTools.p2p.sendVariableTo = function(id, eventName, variable) {
  if(gdjs.evtTools.p2p.connections[id])
    gdjs.evtTools.p2p.connections[id].send({
      eventName: eventName, 
      data: gdjs.evtTools.network.variableStructureToJSON(variable)
    });
}

/**
 * Send an event to all connected clients.
 * @param {string} eventName - The event to trigger.
 * @param {gdjs.Variable} variable - Additional variable to send with the event.
 */
gdjs.evtTools.p2p.sendVariableToAll = function(eventName, variable) {
  for(var id in gdjs.evtTools.p2p.connections) {
    gdjs.evtTools.p2p.connections[id].send({
      eventName: eventName, 
      data: gdjs.evtTools.network.variableStructureToJSON(variable)
    });
  }
}

/**
 * Get some data associated to the last trigger of an event.
 * @param {string} eventName - The event to get data from.
 * @returns {string} - The data as JSON.
 */
gdjs.evtTools.p2p.getEventData = function(eventName) {
  var dataLoss = gdjs.evtTools.p2p.eventHandling[eventName];
  if (typeof dataLoss === "undefined" || dataLoss === false) {
    var event = gdjs.evtTools.p2p.lastEventData[eventName];
    return event[event.length - 1];
  } else {
    return gdjs.evtTools.p2p.lastEventData[eventName];
  }
}

/**
 * Get a variable associated to the last trigger of an event.
 * @param {string} eventName - The event to get the variable from.
 * @param {gdjs.Variable} variable - The variable where to store the variable content.
 */
gdjs.evtTools.p2p.getEventVariable = function(eventName, variable) {
  gdjs.evtTools.network.jsonToVariableStructure(gdjs.evtTools.p2p.getEventData(eventName), variable);
}

/**
 * Connects to a custom broker server.
 * @param {string} host The host of the broker server
 * @param {number} port
 * @param {string} path The path (part of the url after the host) to the broker server
 * @param {string} [key] Optional password to connect to the broker server
 * @param {boolean} ssl Use ssl?
 */
gdjs.evtTools.p2p.useCustomBrokerServer = function(host, port, path, key, ssl) {
  key = key.length === 0 ? "peerjs" : key; // All servers have "peerjs" as default key
  gdjs.evtTools.p2p.peerConfig = {
    debug: 1,
    host,
    port,
    path,
    secure: ssl,
    key,
  };
  gdjs.evtTools.p2p._reloadPeerJS();
}

gdjs.evtTools.p2p.getCurrentId = function() {
  if(gdjs.evtTools.p2p.peer == undefined) return false;
  return gdjs.evtTools.p2p.peer.id || "";
}

gdjs.evtTools.p2p.isReady = function() {return gdjs.evtTools.p2p.ready;}

// Initialize PeerJS after running the events a first time to let the user select another server
gdjs.evtTools.p2p._callback = function() {
  gdjs.evtTools.p2p._reloadPeerJS();
  var index = gdjs.callbacksRuntimeScenePostEvents.indexOf(gdjs.evtTools.p2p._callback);
  gdjs.callbacksRuntimeScenePostEvents.splice(index, 1);
}
gdjs.callbacksRuntimeScenePostEvents.push(gdjs.evtTools.p2p._callback);

gdjs.callbacksRuntimeScenePostEvents.push(function() {
  for(var i in gdjs.evtTools.p2p.lastEventData) {
    if(typeof gdjs.evtTools.p2p.lastEventData[i] === "object" && gdjs.evtTools.p2p.lastEventData[i].length > 0)
      gdjs.evtTools.p2p.lastEventData[i].length--;
  }
});
