/*
 * GDevelop JS Platform
 * Copyright 2013-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

/**
 * A wrapper around an Audio object.
 * @namespace gdjs
 * @class Sound
 * @private
 */
gdjs.Sound = function(soundFile) {
	this.audio = new Audio(soundFile || "");
	this._volume = 100;
	this._requestedCurrentTime = null; //Can be set to the requested playing offset, when the audio is not ready yet. See below:

	//Extra work when the audio is ready:
	//Setting its playing offset to the request one, if any.
	var that = this;
	this.audio.addEventListener("canplay", function() {
		if ( that._requestedCurrentTime != null ) { //The sound must start playing at the request offset.
			that.audio.currentTime = that._requestedCurrentTime;
			that._requestedCurrentTime = null;
		}
	});
};

gdjs.Sound.prototype.setSrc = function(soundFile) {
	if (!gdjs.SoundManager.canUseOgg &&
		(soundFile.length >= 4 && soundFile.substr(soundFile.length-4, 4).toLowerCase() === ".ogg")) {
		soundFile = soundFile.substr(0, soundFile.length-4)+".mp3";
	}

	this.audio.src = soundFile;
}

gdjs.Sound.prototype.setVolume = function(volume, globalVolume) {
	if ( volume < 0 ) volume = 0;
	if ( volume > 100 ) volume = 100;
	if ( globalVolume < 0 ) globalVolume = 0;
	if ( globalVolume > 100 ) globalVolume = 100;

	this._volume = volume;
	this.updateVolume(globalVolume);
};

gdjs.Sound.prototype.updateVolume = function(globalVolume) {
	if ( globalVolume < 0 ) globalVolume = 0;
	this.audio.volume = this._volume/100*globalVolume/100;
};

gdjs.Sound.prototype.getVolume = function() {
	return this._volume;
};

gdjs.Sound.prototype.hasEnded = function() {
	return !this.audio.loop && this.audio.currentTime == this.audio.duration;
};

gdjs.Sound.prototype.play = function() {
	this.audio.play();
};

gdjs.Sound.prototype.pause = function() {
	this.audio.pause();
};

gdjs.Sound.prototype.stop = function() {
	if ( this.audio.readyState == 4 ) this.audio.currentTime = 0;
	this.audio.pause();
};

gdjs.Sound.prototype.isPlaying = function() {
	return this.audio && !this.audio.paused;
};

gdjs.Sound.prototype.isPaused = function() {
	return this.audio && this.audio.paused && this.audio.readyState == 4 && this.audio.currentTime !== 0;
};

gdjs.Sound.prototype.isStopped = function() {
	return !this.audio || (this.audio.paused && (this.audio.readyState != 4 || this.audio.currentTime === 0));
};

gdjs.Sound.prototype.getPlayingOffset = function() {
	return this.audio.readyState == 4 ? this.audio.currentTime : 0;
};

gdjs.Sound.prototype.setPlayingOffset = function(playingOffset) {
	if ( this.audio.readyState == 4 )
		this.audio.currentTime = playingOffset;
	else
		this._requestedCurrentTime = playingOffset;
};

/**
 * SoundManager is used to manage the sounds and musics of a RuntimeScene.
 *
 * @namespace gdjs
 * @class SoundManager
 * @constructor
 */
gdjs.SoundManager = function()
{
    this._sounds = [];
    this._musics = [];
    this._freeSounds = []; //Sounds without an assigned channel.
    this._freeMusics = []; //Musics without an assigned channel.
    this._globalVolume = 100;

    //Check if ogg is supported. If not, fallback to mp3.
    try {
		gdjs.SoundManager.canUseOgg = !!(new Audio().canPlayType('audio/ogg; codecs="vorbis"'));
	}
	catch (e) {}
};
gdjs.SoundManager.canUseOgg = false; //Static boolean to know if we can play ogg files or not.

gdjs.SoundManager.prototype._getRecyledResource = function(arr) {
	//Try to recycle an old sound.
	for(var i = 0, len = arr.length;i<len;++i) {
		if (arr[i] !== null && arr[i].hasEnded() ) {
			return arr[i];
		}
	}

	theSound = new gdjs.Sound();
	arr.push(theSound);
	return theSound;
};

gdjs.SoundManager.prototype.playSound = function(soundFile, loop, volume, pitch) {
	var theSound = this._getRecyledResource(this._freeSounds);

	theSound.setSrc(soundFile);
	theSound.audio.loop = loop;
	theSound.setVolume(volume, this._globalVolume);
	theSound.audio.play();
};

gdjs.SoundManager.prototype.playSoundOnChannel = function(soundFile, channel, loop, volume, pitch) {
	if ( this._sounds[channel] === null || this._sounds[channel] === undefined ) {
		this._sounds[channel] = new gdjs.Sound();
	}

	var theSound = this._sounds[channel];

	theSound.stop();
	theSound.setSrc(soundFile);
	theSound.audio.loop = loop;
	theSound.setVolume(volume, this._globalVolume);
	theSound.audio.play();
};

gdjs.SoundManager.prototype.stopSoundOnChannel = function(channel) {
	var theSound = this._sounds[channel];
	if ( theSound !== null && theSound !== undefined ) theSound.stop();
};

gdjs.SoundManager.prototype.pauseSoundOnChannel = function(channel) {
	var theSound = this._sounds[channel];
	if ( theSound !== null && theSound !== undefined ) theSound.pause();
};

gdjs.SoundManager.prototype.continueSoundOnChannel = function(channel) {
	var theSound = this._sounds[channel];
	if ( theSound !== null && theSound !== undefined ) theSound.play();
};

gdjs.SoundManager.prototype.isSoundOnChannelPlaying = function(channel) {
	var theSound = this._sounds[channel];
	if ( theSound !== null && theSound !== undefined ) return theSound.isPlaying();

	return false;
};

gdjs.SoundManager.prototype.isSoundOnChannelPaused = function(channel) {
	var theSound = this._sounds[channel];
	if ( theSound !== null && theSound !== undefined ) return theSound.isPaused();

	return false;
};

gdjs.SoundManager.prototype.isSoundOnChannelStopped = function(channel) {
	var theSound = this._sounds[channel];
	if ( theSound !== null && theSound !== undefined ) return theSound.isStopped();

	return true;
};

gdjs.SoundManager.prototype.getSoundOnChannelVolume = function(channel) {
	var theSound = this._sounds[channel];
	if ( theSound !== null && theSound !== undefined ) return theSound.getVolume();
	return 0;
};

gdjs.SoundManager.prototype.setSoundOnChannelVolume = function(channel, volume) {
	var theSound = this._sounds[channel];
	if ( theSound !== null && theSound !== undefined ) theSound.setVolume(volume, this._globalVolume);
};

gdjs.SoundManager.prototype.getSoundOnChannelPlayingOffset = function(channel) {
	var theSound = this._sounds[channel];
	if ( theSound !== null && theSound !== undefined ) return theSound.getPlayingOffset();
	return 0;
};

gdjs.SoundManager.prototype.setSoundOnChannelPlayingOffset = function(channel, playingOffset) {
	var theSound = this._sounds[channel];
	if ( theSound !== null && theSound !== undefined ) theSound.setPlayingOffset(playingOffset);
};

gdjs.SoundManager.prototype.playMusic = function(soundFile, loop, volume, pitch) {
	var theMusic = this._getRecyledResource(this._freeMusics);

	theMusic.setSrc(soundFile);
	theMusic.audio.loop = loop;
	theMusic.setVolume(volume, this._globalVolume);
	theMusic.audio.play();
};

gdjs.SoundManager.prototype.playMusicOnChannel = function(soundFile, channel, loop, volume, pitch) {
	if ( this._musics[channel] === null || this._musics[channel] === undefined ) {
		this._musics[channel] = new gdjs.Sound();
	}

	var theMusic = this._musics[channel];

	theMusic.stop();
	theMusic.setSrc(soundFile);
	theMusic.audio.loop = loop;
	theMusic.setVolume(volume, this._globalVolume);
	theMusic.audio.play();
};

gdjs.SoundManager.prototype.stopMusicOnChannel = function(channel) {
	var theMusic = this._musics[channel];
	if ( theMusic !== null && theMusic !== undefined ) theMusic.stop();
};

gdjs.SoundManager.prototype.pauseMusicOnChannel = function(channel) {
	var theMusic = this._musics[channel];
	if ( theMusic !== null && theMusic !== undefined ) theMusic.pause();
};

gdjs.SoundManager.prototype.continueMusicOnChannel = function(channel) {
	var theMusic = this._musics[channel];
	if ( theMusic !== null && theMusic !== undefined ) theMusic.play();
};

gdjs.SoundManager.prototype.isMusicOnChannelPlaying = function(channel) {
	var theMusic = this._musics[channel];
	if ( theMusic !== null && theMusic !== undefined ) return theMusic.isPlaying();

	return false;
};

gdjs.SoundManager.prototype.isMusicOnChannelPaused = function(channel) {
	var theMusic = this._musics[channel];
	if ( theMusic !== null && theMusic !== undefined ) return theMusic.isPaused();

	return false;
};

gdjs.SoundManager.prototype.isMusicOnChannelStopped = function(channel) {
	var theMusic = this._musics[channel];
	if ( theMusic !== null && theMusic !== undefined ) return theMusic.isStopped();

	return true;
};

gdjs.SoundManager.prototype.getMusicOnChannelVolume = function(channel) {
	var theMusic = this._musics[channel];
	if ( theMusic !== null && theMusic !== undefined ) return theMusic.getVolume();
	return 0;
};

gdjs.SoundManager.prototype.setMusicOnChannelVolume = function(channel, volume) {
	var theMusic = this._musics[channel];
	if ( theMusic !== null && theMusic !== undefined ) theMusic.setVolume(volume, this._globalVolume);
};

gdjs.SoundManager.prototype.getMusicOnChannelPlayingOffset = function(channel) {
	var theMusic = this._musics[channel];
	if ( theMusic !== null && theMusic !== undefined ) return theMusic.getPlayingOffset();
	return 0;
};

gdjs.SoundManager.prototype.setMusicOnChannelPlayingOffset = function(channel, playingOffset) {
	var theMusic = this._musics[channel];
	if ( theMusic !== null && theMusic !== undefined ) theMusic.setPlayingOffset(playingOffset);
};

gdjs.SoundManager.prototype.setGlobalVolume = function(volume) {
	this._globalVolume = volume;

	//Update the volumes of sounds.
	for(var i = 0, len = this._freeSounds.length;i<len;++i) {
		if ( this._freeSounds[i] !== null && this._freeSounds[i] !== undefined ) {
			this._freeSounds[i].updateVolume(this._globalVolume);
		}
	}
	for(var i = 0, len = this._freeMusics.length;i<len;++i) {
		if ( this._freeMusics[i] !== null && this._freeMusics[i] !== undefined ) {
			this._freeMusics[i].updateVolume(this._globalVolume);
		}
	}
	for(var i = 0, len = this._sounds.length;i<len;++i) {
		if ( this._sounds[i] !== null && this._sounds[i] !== undefined ) {
			this._sounds[i].updateVolume(this._globalVolume);
		}
	}
	for(var i = 0, len = this._musics.length;i<len;++i) {
		if ( this._musics[i] !== null && this._musics[i] !== undefined ) {
			this._musics[i].updateVolume(this._globalVolume);
		}
	}
};

gdjs.SoundManager.prototype.getGlobalVolume = function() {
	return this._globalVolume;
};
