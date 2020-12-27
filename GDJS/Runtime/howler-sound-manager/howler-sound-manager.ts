/*
 * GDevelop JS Platform
 * Copyright 2013-present Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  declare var Howl: any;
  declare var Howler: any;

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
  export class HowlerSound extends Howl {
    _paused: boolean = false;
    _stopped: boolean = true;
    _canBeDestroyed: boolean = false;
    _rate: any;

    constructor(o) {
      super(o);
      this._rate = o.rate || 1;

      //Add custom events listener to keep
      //track of the sound status.
      const that = this;
      this.on('end', function () {
        if (!that.loop()) {
          that._canBeDestroyed = true;
          that._paused = false;
          that._stopped = true;
        }
      });
      this.on('playerror', function (id, error) {
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
      this.on('play', function () {
        that._paused = false;
        that._stopped = false;
      });
      this.on('pause', function () {
        that._paused = true;
        that._stopped = false;
      });
    }

    // Redefine `stop`/`play`/`pause` to ensure the status of the sound
    // is immediately updated (so that calling `stopped` just after
    // `play` will return false).
    stop() {
      this._paused = false;
      this._stopped = true;
      return super.stop();
    }

    play() {
      this._paused = false;
      this._stopped = false;
      return super.play();
    }

    pause() {
      this._paused = true;
      this._stopped = false;
      return super.pause();
    }

    // Add methods to query the status of the sound:
    paused() {
      return this._paused;
    }

    stopped() {
      return this._stopped;
    }

    canBeDestroyed() {
      return this._canBeDestroyed;
    }

    // Methods to safely update the rate of the sound:
    getRate() {
      return this._rate;
    }

    setRate(rate): void {
      this._rate = HowlerSoundManager.clampRate(rate);
      this.rate(this._rate);
    }
  }

  /**
   * HowlerSoundManager is used to manage the sounds and musics of a RuntimeScene.
   *
   * It is basically a container to associate channels to sounds and keep a list
   * of all sounds being played.
   *
   * @memberof gdjs
   * @class HowlerSoundManager
   */
  export class HowlerSoundManager {
    _resources: any;
    _availableResources: any = {};
    _globalVolume: number = 100;
    _sounds: any = {};
    _musics: any = {};
    _freeSounds: any = [];

    //Sounds without an assigned channel.
    _freeMusics: any = [];
    _pausedSounds: any = [];
    _paused: boolean = false;
    _checkForPause: any;

    constructor(resources) {
      this._resources = resources;

      //Map storing "audio" resources for faster access.

      //Musics without an assigned channel.
      const that = this;
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
            const soundList = that._freeSounds.concat(that._freeMusics);
            for (let key in that._sounds) {
              if (that._sounds.hasOwnProperty(key)) {
                soundList.push(that._sounds[key]);
              }
            }
            for (let key in that._musics) {
              if (that._musics.hasOwnProperty(key)) {
                soundList.push(that._musics[key]);
              }
            }
            for (let i = 0; i < soundList.length; i++) {
              const sound = soundList[i];
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
            for (let i = 0; i < that._pausedSounds.length; i++) {
              const sound = that._pausedSounds[i];
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
    }

    /**
     * Update the resources data of the game. Useful for hot-reloading, should not be used otherwise.
     *
     * @param resources The resources data of the game.
     */
    setResources(resources: ResourceData[]): void {
      this._resources = resources;
    }

    /**
     * Ensure rate is in a range valid for Howler.js
     * @return The clamped rate
     */
    static clampRate(rate): any {
      if (rate > 4.0) {
        return 4.0;
      }
      if (rate < 0.5) {
        return 0.5;
      }
      return rate;
    }

    /**
     * Return the file associated to the given sound name.
     *
     * Names and files are loaded from resources when preloadAudio is called. If no
     * file is associated to the given name, then the name will be considered as a
     * filename and will be returned.
     *
     * @return The associated filename
     */
    private _getFileFromSoundName(soundName): any {
      if (
        this._availableResources.hasOwnProperty(soundName) &&
        this._availableResources[soundName].file
      ) {
        return this._availableResources[soundName].file;
      }
      return soundName;
    }

    /**
     * Store the sound in the specified array, put it at the first index that
     * is free, or add it at the end if no element is free
     * ("free" means that the gdjs.HowlerSound can be destroyed).
     *
     * @param arr The array containing the sounds.
     * @param arr The gdjs.HowlerSound to add.
     * @return The gdjs.HowlerSound that have been added (i.e: the second parameter).
     */
    private _storeSoundInArray(arr: Array<HowlerSound>, sound): any {
      //Try to recycle an old sound.
      for (let i = 0, len = arr.length; i < len; ++i) {
        if (arr[i] !== null && arr[i].canBeDestroyed()) {
          arr[i] = sound;
          return sound;
        }
      }
      arr.push(sound);
      return sound;
    }

    playSound(soundName, loop, volume, pitch) {
      const soundFile = this._getFileFromSoundName(soundName);
      const sound = new gdjs.HowlerSound({
        src: [soundFile],
        //TODO: ogg, mp3...
        loop: loop,
        volume: volume / 100,
        rate: HowlerSoundManager.clampRate(pitch),
      });
      this._storeSoundInArray(this._freeSounds, sound).play();
      sound.on('play', this._checkForPause);
    }

    playSoundOnChannel(soundName, channel, loop, volume, pitch) {
      const oldSound = this._sounds[channel];
      if (oldSound) {
        oldSound.unload();
      }
      const soundFile = this._getFileFromSoundName(soundName);
      const sound = new gdjs.HowlerSound({
        src: [soundFile],
        //TODO: ogg, mp3...
        loop: loop,
        volume: volume / 100,
        rate: HowlerSoundManager.clampRate(pitch),
      });
      sound.play();
      this._sounds[channel] = sound;
      sound.on('play', this._checkForPause);
    }

    getSoundOnChannel(channel) {
      return this._sounds[channel];
    }

    playMusic(soundName, loop, volume, pitch) {
      const soundFile = this._getFileFromSoundName(soundName);
      const sound = new gdjs.HowlerSound({
        src: [soundFile],
        //TODO: ogg, mp3...
        loop: loop,
        html5: true,
        //Force HTML5 audio so we don't wait for the full file to be loaded on Android.
        volume: volume / 100,
        rate: HowlerSoundManager.clampRate(pitch),
      });
      this._storeSoundInArray(this._freeMusics, sound).play();
      sound.on('play', this._checkForPause);
    }

    playMusicOnChannel(soundName, channel, loop, volume, pitch) {
      const oldMusic = this._musics[channel];
      if (oldMusic) {
        oldMusic.unload();
      }
      const soundFile = this._getFileFromSoundName(soundName);
      const music = new gdjs.HowlerSound({
        src: [soundFile],
        //TODO: ogg, mp3...
        loop: loop,
        html5: true,
        //Force HTML5 audio so we don't wait for the full file to be loaded on Android.
        volume: volume / 100,
        rate: HowlerSoundManager.clampRate(pitch),
      });
      music.play();
      this._musics[channel] = music;
      music.on('play', this._checkForPause);
    }

    getMusicOnChannel(channel) {
      return this._musics[channel];
    }

    setGlobalVolume(volume): void {
      this._globalVolume = volume;
      if (this._globalVolume > 100) {
        this._globalVolume = 100;
      }
      if (this._globalVolume < 0) {
        this._globalVolume = 0;
      }
      Howler.volume(this._globalVolume / 100);
    }

    getGlobalVolume() {
      return this._globalVolume;
    }

    clearAll() {
      for (let i = 0; i < this._freeSounds.length; ++i) {
        if (this._freeSounds[i]) {
          this._freeSounds[i].unload();
        }
      }
      for (let i = 0; i < this._freeMusics.length; ++i) {
        if (this._freeMusics[i]) {
          this._freeMusics[i].unload();
        }
      }
      this._freeSounds.length = 0;
      this._freeMusics.length = 0;
      for (let p in this._sounds) {
        if (this._sounds.hasOwnProperty(p) && this._sounds[p]) {
          this._sounds[p].unload();
          delete this._sounds[p];
        }
      }
      for (let p in this._musics) {
        if (this._musics.hasOwnProperty(p) && this._musics[p]) {
          this._musics[p].unload();
          delete this._musics[p];
        }
      }
      this._pausedSounds.length = 0;
    }

    preloadAudio(onProgress, onComplete, resources) {
      resources = resources || this._resources;

      //Construct the list of files to be loaded.
      //For one loaded file, it can have one or more resources
      //that use it.
      const files = {};
      for (let i = 0, len = resources.length; i < len; ++i) {
        const res = resources[i];
        if (res.file && res.kind === 'audio') {
          if (!!this._availableResources[res.name]) {
            continue;
          }
          this._availableResources[res.name] = res;
          files[res.file] = (files[res.file] || []).concat(res);
        }
      }
      const totalCount = Object.keys(files).length;
      if (totalCount === 0) {
        return onComplete(
          //Nothing to load.
          totalCount
        );
      }
      let loadedCount = 0;
      const that = this;

      function onLoad() {
        loadedCount++;
        if (loadedCount === totalCount) {
          return onComplete(totalCount);
        }
        onProgress(loadedCount, totalCount);
      }
      for (const file in files) {
        if (files.hasOwnProperty(file)) {
          const httpRequest = new XMLHttpRequest();
          httpRequest.addEventListener('load', onLoad);
          httpRequest.addEventListener('error', onLoad);
          httpRequest.addEventListener('abort', onLoad);
          httpRequest.open('GET', file);
          httpRequest.send();
        }
      }
    }
  }

  // Register the class to let the engine use it.
  export const SoundManager = HowlerSoundManager;
  export type SoundManager = HowlerSoundManager;
}
