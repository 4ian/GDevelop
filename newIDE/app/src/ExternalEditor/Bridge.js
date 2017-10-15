import optionalRequire from '../Utils/OptionalRequire.js';
import { timeFunction } from '../Utils/TimeFunction.js';
const electron = optionalRequire('electron');
const Buffer = electron ? electron.remote.require('buffer').Buffer : null;

//TODO: Update to ES6
function Bridge() {
  this.net = optionalRequire('net');

  this.client = null;
  this.connected = false;
  this._onReceiveCb = null;
}

Bridge.prototype.isSupported = function() {
  return !!this.net;
};

Bridge.prototype.connectTo = function(port) {
  if (!this.net) return;

  var that = this;
  this.client = new this.net.Socket();
  this.client.connect(port, 'localhost', function() {
    console.log('Connection made on port', port);
    that.connected = true;
    if (that._onConnected) that._onConnected();
  });

  let data = '';
  const nullCharacterBuffer = Buffer.from([0]);
  this.client.on('data', function(dataBuffer) {
    let startPos = 0;
    let nextNullCharacterPos = dataBuffer.indexOf(nullCharacterBuffer);
    while (startPos < dataBuffer.length) {
      if (nextNullCharacterPos === -1) {
        data += dataBuffer.slice(startPos);
        startPos = dataBuffer.length;
      } else {
        data += dataBuffer.slice(startPos, nextNullCharacterPos);
        that._receive(data);

        data = '';
        startPos = nextNullCharacterPos + 1;
        nextNullCharacterPos = dataBuffer.indexOf(
          nullCharacterBuffer,
          startPos
        );
      }
    }
  });

  this.client.on('close', function() {
    that.connected = false;
  });
};

Bridge.prototype.send = function(command, payload, scope = '') {
  if (!this.connected) return false;

  const json = JSON.stringify({
    command,
    scope,
    payload,
  });
  this.client.write(json + '\0');

  return true;
};

Bridge.prototype._receive = function(data) {
  console.info('Received data');

  // Parse the received JSON
  let dataObject;
  timeFunction(
    () => {
      try {
        dataObject = JSON.parse(data);
      } catch (ex) {
        console.warn('Received invalid data (JSON parse failed)', ex);
      }
    },
    time => console.info(`JSON parse took ${time}ms`)
  );
  if (!dataObject) return;

  if (this._onReceiveCb) {
    this._onReceiveCb(dataObject.command, dataObject.payload, dataObject.scope);
  }
};

Bridge.prototype.onReceive = function(cb) {
  this._onReceiveCb = cb;
};

Bridge.prototype.onConnected = function(cb) {
  this._onConnected = cb;
};

export default Bridge;
