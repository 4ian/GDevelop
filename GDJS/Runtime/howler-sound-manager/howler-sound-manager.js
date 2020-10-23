//@ts-check
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
gdjs.HowlerSound = class HowlerSound {
  /**
   * The ID of the played sound.
   * @type {?number}
   * @private
   */
  _id = null;

  /**
   * The Howl passed to the constructor.
   * It defines the sound file that is being played.
   */
  _howl = null;

  /**
   * An internal variable for tracking the paused state.
   * @type {boolean}
   * @private
   */
  _paused = false;

  /**
   * An internal variable for tracking the stopped state.
   * @type {boolean}
   * @private
   */
  _stopped = true;

  /**
   * An internal variable for tracking if the sound can be destroyed.
   * This is used to remove a free sound when it finishes.
   * @type {boolean}
   * @private
   */
  _canBeDestroyed = false;

  /**
   * An internal variable for making sure listeners
   * on the Howl are only being setted up once.
   * @type {boolean}
   * @private
   */
  _hasListeners = false;

  constructor(howl) {
    this._howl = howl;
  }

  /**
   * Begins playback of the sound.
   * @returns {HowlerSound} The current instance for chaining.
   */
  play() {
    this._id = this._howl.play(this._id === null ? undefined : this._id);

    if (this._id === null) {
      this._paused = true;
      this._stopped = true;

      // In case the howl didn't finsih loading, start the sound once it finishes loading.
      this._howl.once('load', () => {
        this._hasListeners = false;
        this.play();
      });
      // Make sure it is loading
      this._howl.load();
      // Directly return to not create unecessary listeners
      return this;
    }

    this._paused = false;
    this._stopped = false;

    if (!this._hasListeners) {
      this._hasListeners = true;
      /*
       * Track events to be sure the status is
       * sync'ed with the sound - though some should be redundant
       * with `play`/`pause` methods already doing that. Keeping
       * that to be sure that the status is always correct.
       *
       * This is done in play as we need the ID to set up those callbacks.
       */

      this.on('play', () => {
        this._paused = false;
        this._stopped = false;
      });

      this.on('pause', () => {
        this._paused = true;
        this._stopped = false;
      });

      this.on('end', () => {
        if (!this._howl.loop()) {
          this._canBeDestroyed = true;
          this._paused = false;
          this._stopped = true;
        }
      });

      this.on('playerror', (id, error) => {
        console.error(
          "Can't play a sound, considering it as stopped. Error is: ",
          error
        );
        this._paused = false;
        this._stopped = true;
      });
    }

    return this;
  }

  /**
   * Pauses playback of the sound, saving the seek of playback.
   * @returns {HowlerSound} The current instance for chaining.
   */
  pause() {
    if (this._id === null) return this;
    this._paused = true;
    this._stopped = false;
    this._howl.pause(this._id);
    return this;
  }

  /**
   * Stops playback of the sound, resetting seek to 0.
   * @returns {HowlerSound} The current instance for chaining.
   */
  stop() {
    if (this._id === null) return this;
    this._paused = false;
    this._stopped = true;
    this._howl.stop(this._id);
    return this;
  }

  /**
   * Check if the sound is currently playing.
   * @returns {boolean}
   */
  playing() {
    if (this._id === null) return false;
    return this._howl.playing(this._id);
  }

  /**
   * Check if the sound is currently paused.
   * @returns {boolean}
   */
  paused() {
    return this._paused;
  }

  /**
   * Check if the sound is currently stopped.
   * @returns {boolean}
   */
  stopped() {
    return this._stopped;
  }

  /**
   * Check if the sound can be deleted to free memory.
   * This becomes true when the sound playback has ended.
   * @returns {boolean}
   */
  canBeDestroyed() {
    return this._canBeDestroyed;
  }

  /**
   * Get the sound playback rate.
   * @returns {number}
   */
  getRate() {
    if (this._id === null) return 0;
    return this._howl.rate(this._id);
  }

  /**
   * Set the playback rate
   * @param {number} rate The new playback rate.
   * @returns {HowlerSound} The current instance for chaining.
   */
  setRate(rate) {
    if (this._id !== null) {
      rate = gdjs.HowlerSoundManager.clampRate(rate);
      this._howl.rate(rate, this._id);
    }
    return this;
  }

  /**
   * Get if the sound is looping.
   * @returns {boolean}
   */
  getLoop() {
    if (this._id === null) return false;
    return this._howl.loop(this._id);
  }

  /**
   * Set if the sound is looping.
   * @param {boolean} loop
   * @returns {HowlerSound} The current instance for chaining.
   */
  setLoop(loop) {
    if (this._id !== null) this._howl.loop(loop, this._id);
    return this;
  }

  /**
   * Get the sound volume.
   * @returns {number} A float from 0 to 1.
   */
  getVolume() {
    if (this._id === null) return 100;
    return this._howl.volume(this._id);
  }

  /**
   * Set the sound volume.
   * @param {number} volume A float from 0 to 1.
   * @returns {HowlerSound} The current instance for chaining.
   */
  setVolume(volume) {
    if (this._id !== null) this._howl.volume(volume, this._id);
    return this;
  }

  /**
   * Get if the sound is muted.
   * @returns {boolean}
   */
  getMute() {
    if (this._id === null) return false;
    return this._howl.mute(this._id);
  }

  /**
   * Set if the sound is muted.
   * @param {boolean} mute
   * @returns {HowlerSound} The current instance for chaining.
   */
  setMute(mute) {
    if (this._id !== null) this._howl.mute(mute, this._id);
    return this;
  }

  /**
   * Get the sound seek.
   * @returns {number}
   */
  getSeek() {
    if (this._id === null) return 0;
    return this._howl.seek(this._id);
  }

  /**
   * Set the sound seek.
   * @param {number} seek The new seek.
   * @returns {HowlerSound} The current instance for chaining.
   */
  setSeek(seek) {
    if (this._id !== null) this._howl.seek(seek, this._id);
    return this;
  }

  /**
   * Fade the volume sound.
   * @returns {HowlerSound} The current instance for chaining.
   */
  fade(from, to, duration) {
    if (this._id === null) return this;
    this._howl.fade(from, to, duration, this._id);
    return this;
  }

  /**
   * @typedef {'load' | 'loaderror' | 'playerror' | 'play' | 'end' | 'pause' | 'stop' | 'mute' | 'volume' | 'rate' | 'seek' | 'fade' | 'unlock'} HowlerEvent
   */

  /**
   * @param {HowlerEvent} event
   * @param {Function} handler
   */
  on(event, handler) {
    if (this._id === null) return;
    return this._howl.on(event, handler, this._id);
  }

  /**
   * @param {HowlerEvent} event
   * @param {Function} handler
   */
  once(event, handler) {
    if (this._id === null) return;
    return this._howl.once(event, handler, this._id);
  }

  /**
   * @param {HowlerEvent} event
   * @param {Function} handler
   */
  off(event, handler) {
    if (this._id === null) return;
    return this._howl.off(event, handler, this._id);
  }
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
  this._loadedMusics = {};
  this._loadedSounds = {};
  this._availableResources = {}; //Map storing "audio" resources for faster access.

  this._globalVolume = 100;

  /** @type {Object<number, gdjs.HowlerSound>} */
  this._sounds = {};
  /** @type {Object<number, gdjs.HowlerSound>} */
  this._musics = {};
  /** @type {Array<gdjs.HowlerSound>} */
  this._freeSounds = []; //Sounds without an assigned channel.
  /** @type {Array<gdjs.HowlerSound>} */
  this._freeMusics = []; //Musics without an assigned channel.

  /** @type {Array<gdjs.HowlerSound>} */
  this._pausedSounds = [];
  this._paused = false;

  const that = this;
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
      //FIXME
      //@ts-ignore
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
gdjs.HowlerSoundManager.prototype.createHowlerSound = function (
  soundName,
  isMusic
) {
  const soundFile = this._getFileFromSoundName(soundName);
  const container = isMusic ? this._loadedMusics : this._loadedSounds;

  if (!container.hasOwnProperty(soundFile)) {
    //@ts-ignore Ts doesn't know about Howler
    container[soundFile] = new Howl({
      src: [soundFile],
      preload: true,
      html5: isMusic,
      onloaderror: (_, error) => {
        console.error('Error while loading sound file: ', error);
      },
    });
  }
  return new gdjs.HowlerSound(container[soundFile]);
};

/**
 * Preloads a sound or a music in memory.
 * @param {string} soundName The name of the file or resource to preload.
 * @param {boolean} isMusic True if a music, false if a sound.
 */
gdjs.HowlerSoundManager.prototype.loadAudio = function (soundName, isMusic) {
  const soundFile = this._getFileFromSoundName(soundName);
  const container = isMusic ? this._loadedMusics : this._loadedSounds;

  //@ts-ignore Ts doesn't know about Howler
  container[soundFile] = new Howl({
    src: [soundFile],
    preload: true,
    html5: isMusic,
  });
};

/**
 * Unloads a sound or a music from memory. This will stop any sound/music using it.
 * @param {string} soundName The name of the file or resource to unload.
 * @param {boolean} isMusic True if a music, false if a sound.
 */
gdjs.HowlerSoundManager.prototype.unloadAudio = function (soundName, isMusic) {
  const soundFile = this._getFileFromSoundName(soundName);
  const container = isMusic ? this._loadedMusics : this._loadedSounds;

  if (!container[soundFile]) return;

  // Make sure any sound using the howl is deleted so that the howl can be garbage collected
  // and no weird "zombies" using the unloaded howl can exist.
  const howl = container[soundFile];
  function removeFromConatiner(soundContainer) {
    for (let i in soundContainer) {
      if (soundContainer[i] && soundContainer[i]._howl === howl) {
        soundContainer[i].stop();
        delete soundContainer[i];
      }
    }
  }

  removeFromConatiner(this._freeMusics);
  removeFromConatiner(this._freeSounds);
  removeFromConatiner(this._musics);
  removeFromConatiner(this._sounds);

  container[soundFile].unload();
  delete container[soundFile];
};

/**
 * Unloads all audio from memory.
 * This will clear the Howl cache.
 * This will also stop any running music or sounds.
 */
gdjs.HowlerSoundManager.prototype.unloadAll = function () {
  //@ts-ignore Ts doesn't know about Howler
  Howler.unload();

  // Clean up old sounds that still have the dead Howl instanes.
  this._freeSounds.length = 0;
  this._freeMusics.length = 0;
  this._sounds = {};
  this._musics = {};
  this._pausedSounds.length = 0;
};

gdjs.HowlerSoundManager.prototype.playSound = function (
  soundName,
  loop,
  volume,
  pitch
) {
  var sound = this.createHowlerSound(soundName, /* isMusic= */ false);

  this._storeSoundInArray(this._freeSounds, sound)
    .play()
    .setLoop(loop)
    .setVolume(volume / 100)
    .setRate(pitch);

  sound.on('play', () => {
    if (this._paused) {
      sound.pause();
      this._pausedSounds.push(sound);
    }
  });
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

  var sound = this.createHowlerSound(soundName, /* isMusic= */ false);
  sound
    .play()
    .setLoop(loop)
    .setVolume(volume / 100)
    .setRate(pitch);

  this._sounds[channel] = sound;

  sound.on('play', () => {
    if (this._paused) {
      sound.pause();
      this._pausedSounds.push(sound);
    }
  });
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
  var music = this.createHowlerSound(soundName, /* isMusic= */ true);
  this._storeSoundInArray(this._freeMusics, music)
    .play()
    .setLoop(loop)
    .setVolume(volume / 100)
    .setRate(pitch);

  music.on('play', () => {
    if (this._paused) {
      music.pause();
      this._pausedSounds.push(music);
    }
  });
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
    oldMusic.stop();
  }

  var music = this.createHowlerSound(soundName, /* isMusic= */ true);
  music
    .play()
    .setLoop(loop)
    .setVolume(volume / 100)
    .setRate(pitch);

  this._musics[channel] = music;

  music.on('play', () => {
    if (this._paused) {
      music.pause();
      this._pausedSounds.push(music);
    }
  });
};

gdjs.HowlerSoundManager.prototype.getMusicOnChannel = function (channel) {
  return this._musics[channel];
};

gdjs.HowlerSoundManager.prototype.setGlobalVolume = function (volume) {
  this._globalVolume = volume;
  if (this._globalVolume > 100) this._globalVolume = 100;
  if (this._globalVolume < 0) this._globalVolume = 0;
  //@ts-ignore Ts doesn't know about Howler
  Howler.volume(this._globalVolume / 100);
};

gdjs.HowlerSoundManager.prototype.getGlobalVolume = function () {
  return this._globalVolume;
};

/**
 * Stops all sounds. Does not unload the Howl cache from memory.
 */
gdjs.HowlerSoundManager.prototype.clearAll = function () {
  //@ts-ignore Ts doesn't know about Howler
  Howler.stop();

  this._freeSounds.length = 0;
  this._freeMusics.length = 0;
  this._sounds = {};
  this._musics = {};
  this._pausedSounds.length = 0;
};

gdjs.HowlerSoundManager.prototype.preloadAudio = function (
  onProgress,
  onComplete,
  resources
) {
  resources = resources || this._resources;

  // Construct the list of files to be loaded.
  // For one loaded file, it can have one or more resources
  // that use it.
  const files = {};
  for (var i = 0, len = resources.length; i < len; ++i) {
    let res = resources[i];
    if (res.file && res.kind === 'audio') {
      if (!!this._availableResources[res.name]) {
        continue;
      }

      this._availableResources[res.name] = res;

      files[res.file] = (files[res.file] || []).concat(res);
    }
  }

  const totalCount = Object.keys(files).length;
  if (totalCount === 0) return onComplete(totalCount); // Nothing to load.

  let loadedCount = 0;
  const that = this;
  function onLoad(_, error) {
    if (error)
      console.error('There was an error while loading an audio file:', error);

    loadedCount++;
    if (loadedCount === totalCount) {
      return onComplete(totalCount);
    }

    onProgress(loadedCount, totalCount);
  }

  function preloadAudioFile(file, onLoadCallback, isMusic) {
    const container = isMusic ? that._loadedMusics : that._loadedSounds;
    //@ts-ignore Ts doesn't know about Howler
    const audio = new Howl({
      src: [file],
      preload: true,
      onload: onLoadCallback,
      onloaderror: onLoadCallback,
      html5: isMusic,
    });
    container[file] = audio;
  }

  for (let file in files) {
    if (files.hasOwnProperty(file)) {
      const fileData = files[file][0];
      if (!fileData.preloadAsSound && !fileData.preloadAsMusic) {
        onLoad();
      } else if (fileData.preloadAsSound && fileData.preloadAsMusic) {
        let loadedOnce = false;
        function callback(_, error) {
          if (!loadedOnce) {
            loadedOnce = true;
            return;
          }
          onLoad(_, error);
        }

        preloadAudioFile(file, callback, /* isMusic= */ true);
        preloadAudioFile(file, callback, /* isMusic= */ false);
      } else if (fileData.preloadAsSound) {
        preloadAudioFile(file, onLoad, /* isMusic= */ false);
      } else if (fileData.preloadAsMusic)
        preloadAudioFile(file, onLoad, /* isMusic= */ true);
    }
  }
};
