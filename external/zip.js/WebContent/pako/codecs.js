/// wrapper for pako (https://github.com/nodeca/pako)

/* globals pako */
(function(global) {
	"use strict";

	function Codec(isDeflater, options) {
		var newOptions = { raw: true, chunkSize: 1024 * 1024 };
		if (options && typeof options.level === 'number')
			newOptions.level = options.level;
		this._backEnd = isDeflater?
			new pako.Deflate(newOptions) :
			new pako.Inflate(newOptions);
		this._chunks = [];
		this._dataLength = 0;
		this._backEnd.onData = this._onData.bind(this);
	}
	Codec.prototype._onData = function _onData(chunk) {
		this._chunks.push(chunk);
		this._dataLength += chunk.length;
	};
	Codec.prototype._fetchData = function _fetchData() {
		var be = this._backEnd;
		if (be.err !== 0)
			throw new Error(be.msg);
		var chunks = this._chunks;
		var data;
		if (chunks.length === 1)
			data = chunks[0];
		else if (chunks.length > 1) {
			data = new Uint8Array(this._dataLength);
			for (var i = 0, n = chunks.length, off = 0; i < n; i++) {
				var chunk = chunks[i];
				data.set(chunk, off);
				off += chunk.length;
			}
		}
		chunks.length = 0;
		this._dataLength = 0;
		return data;
	};
	Codec.prototype.append = function append(bytes, onprogress) {
		this._backEnd.push(bytes, false);
		return this._fetchData();
	};
	Codec.prototype.flush = function flush() {
		this._backEnd.push(new Uint8Array(0), true);
		return this._fetchData();
	};

	function Deflater(options) {
		Codec.call(this, true, options);
	}
	Deflater.prototype = Object.create(Codec.prototype);
	function Inflater() {
		Codec.call(this, false);
	}
	Inflater.prototype = Object.create(Codec.prototype);

	// 'zip' may not be defined in z-worker and some tests
	var env = global.zip || global;
	env.Deflater = env._pako_Deflater = Deflater;
	env.Inflater = env._pako_Inflater = Inflater;
})(this);