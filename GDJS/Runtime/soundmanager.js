/*
 * GDevelop JS Platform
 * Copyright 2013-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

/**
 * A thin wrapper around a Howl object.
 * gdjs.Sound just adds `paused`, `stopped`, `rate` and `canBeDestroyed` methods.
 *
 * See https://github.com/goldfire/howler.js/tree/2.0 for the full documentation.
 *
 * @namespace gdjs
 * @class Sound
 * @private
 */
gdjs.Sound = function(o) {
    Howl.call(this, o);
    this._paused = false;
    this._stopped = true;
    this._canBeDestroyed = false;
    this._rate = o.rate || 1; //Read-only

    //Add custom events listener to keep
    //track of the sound status.
    var that = this;
    this.on('end', function() {
		if (!that.loop()) {
			that._canBeDestroyed = true;
			that._paused = false;
			that._stopped = true;
		}
    });
    this.on('play', function() {
		that._paused = false;
		that._stopped = false;
    });
    this.on('pause', function() {
		that._paused = true;
		that._stopped = false;
    });
};
gdjs.Sound.prototype = Object.create(Howl.prototype);

gdjs.Sound.prototype.paused = function() {
	return this._paused;
};
gdjs.Sound.prototype.stopped = function() {
	return this._stopped;
};
gdjs.Sound.prototype.stop = function() {
	this._paused = false;
	this._stopped = true;
	Howl.prototype.stop.call(this);
};
gdjs.Sound.prototype.canBeDestroyed = function() {
	return this._canBeDestroyed;
};
gdjs.Sound.prototype.rate = function() {
	return this._rate;
};

/**
 * SoundManager is used to manage the sounds and musics of a RuntimeScene.
 *
 * It is basically a container to associate channels to sounds and keep a list
 * of all sounds being played.
 *
 * @namespace gdjs
 * @class SoundManager
 * @constructor
 */
gdjs.SoundManager = function()
{
    this._sounds = {};
    this._musics = {};
    this._freeSounds = []; //Sounds without an assigned channel.
    this._freeMusics = []; //Musics without an assigned channel.
};

/**
 * Ensure rate is in a range valid for Howler.js
 * @method clampRate
 * @return The clamped rate
 */
gdjs.SoundManager.clampRate = function(rate) {
	if (rate > 4.0) return 4.0;
	if (rate < 0.5) return 0.5;

	return rate;
};

/**
 * Store the sound in the specified array, put it at the first index that
 * is free, or add it at the end if no element is free
 * ("free" means that the gdjs.Sound can be destroyed).
 *
 * @param {Array} arr The array containing the sounds.
 * @param {gdjs.Sound} arr The gdjs.Sound to add.
 * @method _storeSoundInArray
 * @return The gdjs.Sound that have been added (i.e: the second parameter).
 * @private
 */
gdjs.SoundManager.prototype._storeSoundInArray = function(arr, sound) {
	//Try to recycle an old sound.
	var index = null;
	for(var i = 0, len = arr.length;i<len;++i) {
		if (arr[i] !== null && arr[i].canBeDestroyed() ) {
			arr[index] = sound;
			return sound;
		}
	}

	arr.push(sound);
	return sound;
};

gdjs.SoundManager.prototype.playSound = function(soundFile, loop, volume, pitch) {
	var sound = new gdjs.Sound({
	  src: [soundFile], //TODO: ogg, mp3...
	  loop: loop,
	  volume: volume/100,
	  rate: gdjs.SoundManager.clampRate(pitch)
	});

	this._storeSoundInArray(this._freeSounds, sound).play();
};

gdjs.SoundManager.prototype.playSoundOnChannel = function(soundFile, channel, loop, volume, pitch) {
	var	oldSound = this._sounds[channel];
	if (oldSound) {
		oldSound.stop();
	}

	var sound = new gdjs.Sound({
		src: [soundFile], //TODO: ogg, mp3...
		loop: loop,
		volume: volume/100,
		rate: gdjs.SoundManager.clampRate(pitch)
	});

	sound.play();
	this._sounds[channel] = sound;
};

gdjs.SoundManager.prototype.getSoundOnChannel = function(channel) {
	return this._sounds[channel];
};

gdjs.SoundManager.prototype.playMusic = function(soundFile, loop, volume, pitch) {
	var sound = new gdjs.Sound({
	  src: [soundFile], //TODO: ogg, mp3...
	  loop: loop,
	  volume: volume/100,
	  rate: gdjs.SoundManager.clampRate(pitch)
	});

	this._storeSoundInArray(this._freeMusics, sound).play();
};

gdjs.SoundManager.prototype.playMusicOnChannel = function(soundFile, channel, loop, volume, pitch) {
	var	oldMusic = this._musics[channel];
	if (oldMusic) {
		oldMusic.stop();
	}

	var music = new gdjs.Sound({
		src: [soundFile], //TODO: ogg, mp3...
		loop: loop,
		volume: volume/100,
		rate: gdjs.SoundManager.clampRate(pitch)
	});

	music.play();
	this._musics[channel] = music;
};

gdjs.SoundManager.prototype.getMusicOnChannel = function(channel) {
	return this._musics[channel];
};

gdjs.SoundManager.prototype.setGlobalVolume = function(volume) {
	Howler.volume(volume/100);
};

gdjs.SoundManager.prototype.getGlobalVolume = function() {
	return Howler.volume()*100;
};
