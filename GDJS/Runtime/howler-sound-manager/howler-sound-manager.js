/*
 * GDevelop JS Platform
 * Copyright 2013-present Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

/**
 * A thin wrapper around a Howl object with:
 * * Extra methods `paused`, `stopped`, `getRate`/`setRate` and `canBeDestroyed` methods.
 * * Automatic clamping when calling `setRate` to ensure a valid value is passed to Howler.js.
 *
 * See https://github.com/goldfire/howler.js#methods for the full documentation.
 *
 * @memberof gdjs
 * @class HowlerSound
 */
gdjs.HowlerSound = function (howl) {
  this._howl = howl;
  // Get a unique sound playing ID.
  this.id = howl.play();
  howl.stop(this.id);

  this._paused = false;
  this._stopped = true;
  this._canBeDestroyed = false;
  this._rate = 1;

  //Add custom events listener to keep
  //track of the sound status.
  var that = this;
  this._howl.on('end', function () {
    if (!that._howl.loop()) {
      that._canBeDestroyed = true;
      that._paused = false;
      that._stopped = true;
    }
  });
  this._howl.on('playerror', function (id, error) {
    console.error(
      "Can't play a sound, considering it as stopped. Error is:",
      error
    );
    that._paused = false;
    that._stopped = true;
  });

  // Track play/pause event to be sure the status is
  // sync'ed with the sound - though this should be redundant
  // with `play`/`pause` methods already doing that. Keeping
  // that to be sure that the status is always correct.
  this._howl.on('play', function () {
    that._paused = false;
    that._stopped = false;
  });
  this._howl.on('pause', function () {
    that._paused = true;
    that._stopped = false;
  });
};

for(var item in Howl.prototype) {
  gdjs.HowlerSound.prototype[item] = function() {
    this._howl[item].apply(this, [arguments, this.id]);
  }
}

// Redefine `stop`/`play`/`pause` to ensure the status of the sound
// is immediately updated (so that calling `stopped` just after
// `play` will return false).

gdjs.HowlerSound.prototype.stop = function () {
  this._paused = false;
  this._stopped = true;
  return this._howl.stop(this.id);
};
gdjs.HowlerSound.prototype.play = function () {
  this._paused = false;
  this._stopped = false;
  return this._howl.play(this.id);
};
gdjs.HowlerSound.prototype.pause = function () {
  this._paused = true;
  this._stopped = false;
  return this._howl.pause(this.id);
};

// Add methods to query the status of the sound:

gdjs.HowlerSound.prototype.paused = function () {
  return this._paused;
};
gdjs.HowlerSound.prototype.stopped = function () {
  return this._stopped;
};
gdjs.HowlerSound.prototype.canBeDestroyed = function () {
  return this._canBeDestroyed;
};

// Methods to safely update the rate of the sound:

gdjs.HowlerSound.prototype.getRate = function () {
  return this._rate;
};
gdjs.HowlerSound.prototype.setRate = function (rate) {
  this._rate = gdjs.HowlerSoundManager.clampRate(rate);
  this._howl.rate(this._rate, this.id);
};

/**
 * HowlerSoundManager is used to manage the sounds and musics of a RuntimeScene.
 *
 * It is basically a container to associate channels to sounds and keep a list
 * of all sounds being played.
 *
 * @memberof gdjs
 * @class HowlerSoundManager
 */
gdjs.HowlerSoundManager = function (resources) {
  this._resources = resources;
  this._loaded = {
    music: {},
    sound: {},
  };
  this._availableResources = {}; //Map storing "audio" resources for faster access.

  this._globalVolume = 100;

  this._sounds = {};
  this._musics = {};
  this._freeSounds = []; //Sounds without an assigned channel.
  this._freeMusics = []; //Musics without an assigned channel.

  this._pausedSounds = [];
  this._paused = false;

  var that = this;
  this._checkForPause = function () {
    if (that._paused) {
      this.pause();
      that._pausedSounds.push(this);
    }
  };

  document.addEventListener('deviceready', function () {
    // pause/resume sounds in Cordova when the app is being paused/resumed
    document.addEventListener(
      'pause',
      function () {
        var soundList = that._freeSounds.concat(that._freeMusics);
        for (var key in that._sounds) {
          if (that._sounds.hasOwnProperty(key)) {
            soundList.push(that._sounds[key]);
          }
        }
        for (var key in that._musics) {
          if (that._musics.hasOwnProperty(key)) {
            soundList.push(that._musics[key]);
          }
        }
        for (var i = 0; i < soundList.length; i++) {
          var sound = soundList[i];
          if (!sound.paused() && !sound.stopped()) {
            sound.pause();
            that._pausedSounds.push(sound);
          }
        }
        that._paused = true;
      },
      false
    );
    document.addEventListener(
      'resume',
      function () {
        for (var i = 0; i < that._pausedSounds.length; i++) {
          var sound = that._pausedSounds[i];
          if (!sound.stopped()) {
            sound.play();
          }
        }
        that._pausedSounds.length = 0;
        that._paused = false;
      },
      false
    );
  });
};

gdjs.SoundManager = gdjs.HowlerSoundManager; //Register the class to let the engine use it.

/**
 * Update the resources data of the game. Useful for hot-reloading, should not be used otherwise.
 *
 * @param {ResourceData[]} resources The resources data of the game.
 */
gdjs.HowlerSoundManager.prototype.setResources = function (resources) {
  this._resources = resources;
};

/**
 * Ensure rate is in a range valid for Howler.js
 * @return The clamped rate
 * @private
 */
gdjs.HowlerSoundManager.clampRate = function (rate) {
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
 *
 * @private
 * @return The associated filename
 */
gdjs.HowlerSoundManager.prototype._getFileFromSoundName = function (soundName) {
  if (
    this._availableResources.hasOwnProperty(soundName) &&
    this._availableResources[soundName].file
  ) {
    return this._availableResources[soundName].file;
  }

  return soundName;
};

/**
 * Store the sound in the specified array, put it at the first index that
 * is free, or add it at the end if no element is free
 * ("free" means that the gdjs.HowlerSound can be destroyed).
 *
 * @param {Array} arr The array containing the sounds.
 * @param {gdjs.HowlerSound} arr The gdjs.HowlerSound to add.
 * @return The gdjs.HowlerSound that have been added (i.e: the second parameter).
 * @private
 */
gdjs.HowlerSoundManager.prototype._storeSoundInArray = function (arr, sound) {
  //Try to recycle an old sound.
  var index = null;
  for (var i = 0, len = arr.length; i < len; ++i) {
    if (arr[i] !== null && arr[i].canBeDestroyed()) {
      arr[index] = sound;
      return sound;
    }
  }

  arr.push(sound);
  return sound;
};

/**
 * Creates a new gdjs.HowlerSound using preloaded/cached Howl instances.
 * @param {string} soundName The name of the file or resource to play.
 * @param {boolean} isMusic True if a music, false if a sound.
 * @returns {gdjs.HowlerSound}
 */
gdjs.HowlerSoundManager.prototype.createHowlerSound = function (soundName, isMusic) {
  var soundFile = this._getFileFromSoundName(soundName);
  var container = this._loaded[isMusic ? "music" : "sound"];

  if (
    container.hasOwnProperty(soundFile)
  ) {
    return new gdjs.HowlerSound(container[soundFile]);
  } else {
    container[soundFile] = new Howl({
      src: [soundFile],
      preload: true,
      html5: isMusic
    });
    return new gdjs.HowlerSound(container[soundFile]);
  }
};

gdjs.HowlerSoundManager.prototype.playSound = function (
  soundName,
  loop,
  volume,
  pitch
) {
  var sound = this.createHowlerSound(soundName, false /*: isMusic */);
  sound.loop(loop);
  sound.volume(volume / 100);
  sound.rate(gdjs.HowlerSoundManager.clampRate(pitch))

  this._storeSoundInArray(this._freeSounds, sound).play();

  sound.on('play', this._checkForPause);
};

gdjs.HowlerSoundManager.prototype.playSoundOnChannel = function (
  soundName,
  channel,
  loop,
  volume,
  pitch
) {
  var oldSound = this._sounds[channel];
  if (oldSound) {
    oldSound.stop();
  }

  var sound = this.createHowlerSound(soundName, false /*: isMusic */);
  sound.loop(loop);
  sound.volume(volume / 100);
  sound.rate(gdjs.HowlerSoundManager.clampRate(pitch))

  sound.play();
  this._sounds[channel] = sound;

  sound.on('play', this._checkForPause);
};

gdjs.HowlerSoundManager.prototype.getSoundOnChannel = function (channel) {
  return this._sounds[channel];
};

gdjs.HowlerSoundManager.prototype.playMusic = function (
  soundName,
  loop,
  volume,
  pitch
) {
  var music = this.createHowlerSound(soundName, true /*: isMusic */);
  music.loop(loop);
  music.volume(volume / 100);
  music.rate(gdjs.HowlerSoundManager.clampRate(pitch))

  this._storeSoundInArray(this._freeMusics, sound).play();

  sound.on('play', this._checkForPause);
};

gdjs.HowlerSoundManager.prototype.playMusicOnChannel = function (
  soundName,
  channel,
  loop,
  volume,
  pitch
) {
  var oldMusic = this._musics[channel];
  if (oldMusic) {
    oldMusic.unload();
  }

  var music = this.createHowlerSound(soundName, true /*: isMusic */);
  music.loop(loop);
  music.volume(volume / 100);
  music.rate(gdjs.HowlerSoundManager.clampRate(pitch))

  music.play();
  this._musics[channel] = music;

  music.on('play', this._checkForPause);
};

gdjs.HowlerSoundManager.prototype.getMusicOnChannel = function (channel) {
  return this._musics[channel];
};

gdjs.HowlerSoundManager.prototype.setGlobalVolume = function (volume) {
  this._globalVolume = volume;
  if (this._globalVolume > 100) this._globalVolume = 100;
  if (this._globalVolume < 0) this._globalVolume = 0;
  Howler.volume(this._globalVolume / 100);
};

gdjs.HowlerSoundManager.prototype.getGlobalVolume = function () {
  return this._globalVolume;
};

gdjs.HowlerSoundManager.prototype.clearAll = function () {
  for (var i = 0; i < this._freeSounds.length; ++i) {
    if (this._freeSounds[i]) this._freeSounds[i].stop();
  }
  for (var i = 0; i < this._freeMusics.length; ++i) {
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
  this._pausedSounds.length = 0;
};

gdjs.HowlerSoundManager.prototype.preloadAudio = function (
  onProgress,
  onComplete,
  resources
) {
  window.s = this;
  resources = resources || this._resources;

  //Construct the list of files to be loaded.
  //For one loaded file, it can have one or more resources
  //that use it.
  var files = {};
  for (var i = 0, len = resources.length; i < len; ++i) {
    var res = resources[i];
    if (res.file && res.kind === 'audio') {
      if (!!this._availableResources[res.name]) {
        continue;
      }

      this._availableResources[res.name] = res;

      files[res.file] = (files[res.file] || []).concat(res);
    }
  }

  var totalCount = Object.keys(files).length;
  if (totalCount === 0) return onComplete(totalCount); //Nothing to load.

  var loadedCount = 0;
  var that = this;
  function onLoad(_, error) {
    if(error) console.error(error);

    loadedCount++;
    if (loadedCount === totalCount) {
      return onComplete(totalCount);
    }

    onProgress(loadedCount, totalCount);
  }

  for (var file in files) {
    if (files.hasOwnProperty(file)) {
      // Load as sound
      var sound = new Howl({
        src: [file],
        preload: true,
        onload: onLoad,
        onloaderror: onLoad,
      })
      that._loaded.sound[file] = sound;

      // Load as music
      var music = new Howl({
        src: [file],
        preload: true,
        onload: onLoad,
        onloaderror: onLoad,
        html5: true,
      })
      that._loaded.music[file] = music
    }
  }
};
