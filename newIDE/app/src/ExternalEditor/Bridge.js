import optionalRequire from '../Utils/OptionalRequire.js';

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

  var data = '';
  this.client.on('data', function(dataBuffer) {
    data += dataBuffer;

    // eslint-disable-next-line
    if (!dataBuffer.length || dataBuffer[dataBuffer.length - 1] == 0) {
      data = data.slice(0, -1); //Strip ending null character
      that._receive(data);
      data = '';
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
    payload
  });
  this.client.write(json + '\0');

  return true;
};

Bridge.prototype._receive = function(data) {
  console.log('Received data');

  // Parse the received JSON
  var t0 = performance.now();
  var dataObject;
  try {
    dataObject = JSON.parse(data);
  } catch (ex) {
    console.warn('Received invalid data (JSON parse failed)', ex);
    return;
  }
  var t1 = performance.now();

  console.log('JSON parse took ' + (t1 - t0) + ' milliseconds.');

  if (this._onReceiveCb) {
    this._onReceiveCb(
      dataObject.command,
      dataObject.payload,
      dataObject.scope
    );
  }
};

Bridge.prototype.onReceive = function(cb) {
  this._onReceiveCb = cb;
};

Bridge.prototype.onConnected = function(cb) {
  this._onConnected = cb;
};

export default Bridge;
