/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

/**
 * @memberof gdjs
 * @class CocosEffect
 * @private
 */
gdjs.CocosEffect = function(effectId) {
    this._effectId = effectId;
    this._paused = false;
    this._stopped = true;
};

gdjs.CocosEffect.prototype.play = function() {
    this._paused = false;
    this._stopped = false;
    cc.audioEngine.resumeEffect(this._effectId);
};
gdjs.CocosEffect.prototype.playing = function() {
    return !this._paused && !this._stopped;
};
gdjs.CocosEffect.prototype.pause = function() {
    this._paused = true;
    this._stopped = false;
    cc.audioEngine.pauseEffect(this._effectId);
};
gdjs.CocosEffect.prototype.paused = function() {
	return this._paused;
};
gdjs.CocosEffect.prototype.stop = function() {
    this._paused = false;
    this._stopped = true;
	cc.audioEngine.stopEffect(this._effectId);
};
gdjs.CocosEffect.prototype.stopped = function() {
	return this._stopped;
};
gdjs.CocosEffect.prototype.getRate = function() {
	return 1; //Unsupported
};
gdjs.CocosEffect.prototype.setRate = function(rate) { //Unsupported
};
gdjs.CocosEffect.prototype.volume = function() {
	return 1; //Unsupported
};
gdjs.CocosEffect.prototype.seek = function() {
	return 0; //Unsupported
};

/**
 * @memberof gdjs
 * @class CocosSoundManager
 * @constructor
 */
gdjs.CocosSoundManager = function(resources)
{
    this._resources = resources;
    this._availableResources = {}; //Map storing "audio" resources for faster access.

    this._sounds = {};
};

gdjs.SoundManager = gdjs.CocosSoundManager; //Register the class to let the engine use it.

/**
 * Return the file associated to the given sound name.
 *
 * Names and files are loaded from resources when preloadAudio is called. If no
 * file is associated to the given name, then the name will be considered as a
 * filename and will be returned.
 * @return The associated filename
 * @private
 */
gdjs.CocosSoundManager.prototype._getFileFromSoundName = function(soundName) {
	if (this._availableResources.hasOwnProperty(soundName) &&
		this._availableResources[soundName].file) {
		return 'res/' + this._availableResources[soundName].file;
	}

	return 'res/' + soundName;
}

gdjs.CocosSoundManager.prototype.playSound = function(soundName, loop, volume, pitch) {
	var soundFile = this._getFileFromSoundName(soundName);
	cc.audioEngine.playEffect(soundFile, loop);
};

gdjs.CocosSoundManager.prototype.playSoundOnChannel = function(soundName, channel, loop, volume, pitch) {
	var	oldSound = this._sounds[channel];
	if (oldSound) {
		oldSound.stop();
	}

	var soundFile = this._getFileFromSoundName(soundName);
	this._sounds[channel] = new gdjs.CocosEffect(cc.audioEngine.playEffect(soundFile, loop));
};

gdjs.CocosSoundManager.prototype.getSoundOnChannel = function(channel) {
	return this._sounds[channel];
};

gdjs.CocosSoundManager.prototype.playMusic = function(soundName, loop, volume, pitch) {
    var soundFile = this._getFileFromSoundName(soundName);
    cc.audioEngine.playMusic(soundFile, loop); //TODO: no filename extension?
};

gdjs.CocosSoundManager.prototype.playMusicOnChannel = function(soundName, channel, loop, volume, pitch) {
    //TODO
    var soundFile = this._getFileFromSoundName(soundName);
    cc.audioEngine.playMusic(soundFile, loop); //TODO: no filename extension?
};

gdjs.CocosSoundManager.prototype.getMusicOnChannel = function(channel) {
	return undefined; //TODO
};

gdjs.CocosSoundManager.prototype.setGlobalVolume = function(volume) {
	cc.audioEngine.setEffectsVolume(volume / 100);
	cc.audioEngine.setMusicVolume(volume / 100);
};

gdjs.CocosSoundManager.prototype.getGlobalVolume = function() {
    return cc.audioEngine.getEffectsVolume() * 100;
};

gdjs.CocosSoundManager.prototype.clearAll = function() {
	for (var p in this._sounds) {
		if (this._sounds.hasOwnProperty(p) && this._sounds[p]) {
			this._sounds[p].stop();
			delete this._sounds[p];
		}
	}

    cc.audioEngine.stopAllEffects();
    cc.audioEngine.stopMusic();
}

gdjs.CocosSoundManager.prototype.preloadAudio = function(onProgress, onComplete, resources) {
	resources = resources || this._resources;

    var files = [];
    var that = this;
	for(var i = 0, len = resources.length;i<len;++i) {
		var res = resources[i];
        if ( res.file && res.kind === "audio" ) {
        	that._availableResources[res.name] = res;
        }
	}

    //TODO: sound preloading
    onComplete(files.length);
}
