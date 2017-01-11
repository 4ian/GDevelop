import Bridge from './Bridge.js';
let bridge = new Bridge();

export default {
	isSupported: function() {
		return bridge.isSupported();
	},
	connectTo: function(port) {
		return bridge.connectTo(port);
	},
	onUpdateReceived: function(cb) {
		return bridge.onReceive(function(command, object) {
			cb(object);
		});
	},
	send: function(object) {
		return bridge.send("update", object);
	},
	requestUpdate: function() {
		return bridge.send("requestUpdate");
	}
};
