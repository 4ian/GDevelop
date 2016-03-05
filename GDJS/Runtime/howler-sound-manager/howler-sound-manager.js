/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

/**
 * A thin wrapper around a Howl object.
 * gdjs.HowlerSound just adds `paused`, `stopped`, `rate` and `canBeDestroyed` methods.
 *
 * See https://github.com/goldfire/howler.js/tree/2.0 for the full documentation.
 *
 * @namespace gdjs
 * @class HowlerSound
 * @private
 */
gdjs.HowlerSound = function(o) {
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
gdjs.HowlerSound.prototype = Object.create(Howl.prototype);

gdjs.HowlerSound.prototype.paused = function() {
	return this._paused;
};
gdjs.HowlerSound.prototype.stopped = function() {
	return this._stopped;
};
gdjs.HowlerSound.prototype.stop = function() {
	this._paused = false;
	this._stopped = true;
	Howl.prototype.stop.call(this);
};
gdjs.HowlerSound.prototype.canBeDestroyed = function() {
	return this._canBeDestroyed;
};
gdjs.HowlerSound.prototype.rate = function() {
	return this._rate;
};

/**
 * HowlerSoundManager is used to manage the sounds and musics of a RuntimeScene.
 *
 * It is basically a container to associate channels to sounds and keep a list
 * of all sounds being played.
 *
 * @namespace gdjs
 * @class HowlerSoundManager
 * @constructor
 */
gdjs.HowlerSoundManager = function(resources)
{
    this._resources = resources;
    this._availableResources = {}; //Map storing "audio" resources for faster access.

    this._sounds = {};
    this._musics = {};
    this._freeSounds = []; //Sounds without an assigned channel.
    this._freeMusics = []; //Musics without an assigned channel.
};

gdjs.SoundManager = gdjs.HowlerSoundManager; //Register the class to let the engine use it.

/**
 * Ensure rate is in a range valid for Howler.js
 * @method clampRate
 * @return The clamped rate
 */
gdjs.HowlerSoundManager.clampRate = function(rate) {
	if (rate > 4.0) return 4.0;
	if (rate < 0.5) return 0.5;

	return rate;
};

/**
 * Return the file associated to the given sound name.
 *
 * Names and files are loaded from resources when preloadAudio is called. If no
 * file is associated to the given name, then the name will be considered as a
 * filename and will be returned.
 * @method _getFileFromSoundName
 * @private
 * @return The associated filename
 */
gdjs.HowlerSoundManager.prototype._getFileFromSoundName = function(soundName) {
	if (this._availableResources.hasOwnProperty(soundName) &&
		this._availableResources[soundName].file) {
		return this._availableResources[soundName].file;
	}

	return soundName;
}

/**
 * Store the sound in the specified array, put it at the first index that
 * is free, or add it at the end if no element is free
 * ("free" means that the gdjs.HowlerSound can be destroyed).
 *
 * @param {Array} arr The array containing the sounds.
 * @param {gdjs.HowlerSound} arr The gdjs.HowlerSound to add.
 * @method _storeSoundInArray
 * @return The gdjs.HowlerSound that have been added (i.e: the second parameter).
 * @private
 */
gdjs.HowlerSoundManager.prototype._storeSoundInArray = function(arr, sound) {
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

gdjs.HowlerSoundManager.prototype.playSound = function(soundName, loop, volume, pitch) {
	var soundFile = this._getFileFromSoundName(soundName);

	var sound = new gdjs.HowlerSound({
	  src: [soundFile], //TODO: ogg, mp3...
	  loop: loop,
	  volume: volume/100,
	  rate: gdjs.HowlerSoundManager.clampRate(pitch)
	});

	this._storeSoundInArray(this._freeSounds, sound).play();
};

gdjs.HowlerSoundManager.prototype.playSoundOnChannel = function(soundName, channel, loop, volume, pitch) {
	var	oldSound = this._sounds[channel];
	if (oldSound) {
		oldSound.stop();
	}

	var soundFile = this._getFileFromSoundName(soundName);

	var sound = new gdjs.HowlerSound({
		src: [soundFile], //TODO: ogg, mp3...
		loop: loop,
		volume: volume/100,
		rate: gdjs.HowlerSoundManager.clampRate(pitch)
	});

	sound.play();
	this._sounds[channel] = sound;
};

gdjs.HowlerSoundManager.prototype.getSoundOnChannel = function(channel) {
	return this._sounds[channel];
};

gdjs.HowlerSoundManager.prototype.playMusic = function(soundName, loop, volume, pitch) {
	var soundFile = this._getFileFromSoundName(soundName);

	var sound = new gdjs.HowlerSound({
	  src: [soundFile], //TODO: ogg, mp3...
	  loop: loop,
	  html5: true, //Force HTML5 audio so we don't wait for the full file to be loaded on Android.
	  volume: volume/100,
	  rate: gdjs.HowlerSoundManager.clampRate(pitch)
	});

	this._storeSoundInArray(this._freeMusics, sound).play();
};

gdjs.HowlerSoundManager.prototype.playMusicOnChannel = function(soundName, channel, loop, volume, pitch) {
	var	oldMusic = this._musics[channel];
	if (oldMusic) {
		oldMusic.stop();
	}

	var soundFile = this._getFileFromSoundName(soundName);

	var music = new gdjs.HowlerSound({
		src: [soundFile], //TODO: ogg, mp3...
		loop: loop,
		html5: true, //Force HTML5 audio so we don't wait for the full file to be loaded on Android.
		volume: volume/100,
		rate: gdjs.HowlerSoundManager.clampRate(pitch)
	});

	music.play();
	this._musics[channel] = music;
};

gdjs.HowlerSoundManager.prototype.getMusicOnChannel = function(channel) {
	return this._musics[channel];
};

gdjs.HowlerSoundManager.prototype.setGlobalVolume = function(volume) {
	Howler.volume(volume/100);
};

gdjs.HowlerSoundManager.prototype.getGlobalVolume = function() {
	return Howler.volume()*100;
};

gdjs.HowlerSoundManager.prototype.clearAll = function() {
	for (var i = 0;i<this._freeSounds.length;++i)  {
		if (this._freeSounds[i]) this._freeSounds[i].stop();
	}
	for (var i = 0;i<this._freeMusics.length;++i)  {
		if (this._freeMusics[i]) this._freeMusics[i].stop();
	}
	this._freeSounds.length = 0;
	this._freeMusics.length = 0;

	for (var p in this._sounds) {
		if (this._sounds.hasOwnProperty(p) && this._sounds[p]) {
			this._sounds[p].stop();
			delete this._sounds[p];
		}
	}
	for (var p in this._musics) {
		if (this._musics.hasOwnProperty(p) && this._musics[p]) {
			this._musics[p].stop();
			delete this._musics[p];
		}
	}
}

gdjs.HowlerSoundManager.prototype.preloadAudio = function(onProgress, onComplete, resources) {
	resources = resources || this._resources;

    var files = [];
    var that = this;
    gdjs.iterateOverArray(resources, function(res) {
        if ( res.file && res.kind === "audio" ) {
        	that._availableResources[res.name] = res;

            if (files.indexOf(res.file) === -1) {
	            files.push(res.file);
	        }
        }
    });

    if (files.length === 0) return onComplete();

    var loaded = 0;
    function onLoad(audioFile) {
        console.log("loaded" + audioFile);
        loaded++;
        if (loaded === files.length) {
            console.log("All audio loaded");
            return onComplete();
        }

        onProgress(loaded, files.length);
    }


    for(var i = 0;i<files.length;++i) {
        (function(audioFile) {
            console.log("Loading" + audioFile)
            var sound = new Howl({
              src: [audioFile], //TODO: ogg, mp3...
              preload: true,
              onload: onLoad.bind(that, audioFile),
              onloaderror: onLoad.bind(that, audioFile)
            });
        })(files[i]);
    }
}
