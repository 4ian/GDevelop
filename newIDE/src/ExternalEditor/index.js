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
	},
	getArguments: function() {
			try {
				//TODO: Factor global['require']
				return global['require']('electron').remote.getGlobal('args');
			} catch(ex) {
				console.warn("Unable to get bridge arguments");
				return {};
			}
	}
};
