///<reference path='../types/howler'>
/*
 * GDevelop JS Platform
 * Copyright 2013-present Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  const logger = new gdjs.Logger('Audio manager');

  const HowlParameters: HowlOptions = {
    preload: true,
    onplayerror: (_, error) =>
      logger.error("Can't play an audio file: " + error),
    onloaderror: (_, error) =>
      logger.error('Error while loading an audio file: ' + error),
  };

  /**
   * A thin wrapper around a Howl object with:
   * * Handling of callbacks when the sound is not yet loaded.
   * * Automatic clamping when calling `setRate` to ensure a valid value is passed to Howler.js.
   *
   * See https://github.com/goldfire/howler.js#methods for the full documentation.
   *
   * @memberof gdjs
   * @class HowlerSound
   */
  export class HowlerSound {
    /**
     * The ID of the played sound.
     */
    private _id: integer | null = null;

    /**
     * The Howl passed to the constructor.
     * It defines the sound file that is being played.
     */
    private _howl: Howl;

    /**
     * An array of callbacks to call once the sound starts to play.
     */
    private _oncePlay: Array<HowlCallback> = [];

    /**
     * An array of callbacks to call everytime the sound starts to play.
     */
    private _onPlay: Array<HowlCallback> = [];

    constructor(howl: Howl) {
      this._howl = howl;
    }

    /**
     * Returns true if the associated howl is fully loaded.
     */
    isLoaded(): boolean {
      return this._howl.state() === 'loaded';
    }

    /**
     * Begins playback of the sound, or if the Howl is still loading, schedule playing for once it loads.
     * @returns The current instance for chaining.
     */
    play(): this {
      if (this.isLoaded()) {
        const newID = this._howl.play(
          this._id === null ? '__default' : this._id
        );
        this._id = newID;

        // Manually handle the play event before we have an ID.
        // Before loading, howler won't register events as without an ID we cannot set a listener.
        // Once we have an ID, we can transfer control of the events to howler.
        // We also need to call them once as Howler doesn't for the first play event.
        this._onPlay.forEach((func) => {
          // Transfer the event to howler now that we have an ID
          this.on('play', func);
          func(newID);
        });
        this._oncePlay.forEach((func) => func(newID));
        this._onPlay = [];
        this._oncePlay = [];
      } else this._howl.once('load', () => this.play()); // Play only once the howl is fully loaded

      return this;
    }

    /**
     * Pauses playback of the sound, saving the seek of playback.
     * @returns The current instance for chaining.
     */
    pause(): this {
      if (this._id !== null) this._howl.pause(this._id);
      return this;
    }

    /**
     * Stops playback of the sound, resetting seek to 0.
     * @returns The current instance for chaining.
     */
    stop(): this {
      if (this._id !== null) this._howl.stop(this._id);
      return this;
    }

    /**
     * Check if the sound is currently playing.
     */
    playing(): boolean {
      return (
        (this._id !== null ? this._howl.playing(this._id) : true) ||
        !this.isLoaded() // Loading is considered playing
      );
    }

    /**
     * Check if the sound is currently paused.
     */
    paused(): boolean {
      return !this.playing();
    }

    /**
     * Check if the sound is currently stopped.
     */
    stopped(): boolean {
      return this.paused() && this.getSeek() === 0;
    }

    /**
     * Get the sound playback rate.
     */
    getRate(): float {
      if (this._id === null) return 0;
      return this._howl.rate(this._id);
    }

    /**
     * Set the playback rate.
     * @returns The current instance for chaining.
     */
    setRate(rate: float): this {
      if (this._id !== null) {
        rate = gdjs.HowlerSoundManager.clampRate(rate);
        this._howl.rate(rate, this._id);
      }
      return this;
    }

    /**
     * Get if the sound is looping.
     */
    getLoop(): boolean {
      if (this._id === null) return false;
      return this._howl.loop(this._id);
    }

    /**
     * Set if the sound is looping.
     * @returns The current instance for chaining.
     */
    setLoop(loop: boolean): this {
      if (this._id !== null) this._howl.loop(loop, this._id);
      return this;
    }

    //TODO: Replace float type in those 2 methods with RangeOf<0..1> once it is standarized (https://github.com/Microsoft/TypeScript/issues/15480)
    /**
     * Get the sound volume.
     * @returns A float from 0 to 1.
     */
    getVolume(): float {
      if (this._id === null) return 100;
      return this._howl.volume(this._id);
    }

    /**
     * Set the sound volume.
     * @param volume A float from 0 to 1.
     * @returns The current instance for chaining.
     */
    setVolume(volume: float): this {
      if (this._id !== null) this._howl.volume(volume, this._id);
      return this;
    }

    /**
     * Get if the sound is muted.
     */
    getMute(): boolean {
      if (this._id === null) return false;
      return this._howl.mute(this._id);
    }

    /**
     * Set if the sound is muted.
     * @returns The current instance for chaining.
     */
    setMute(mute: boolean): this {
      if (this._id !== null) this._howl.mute(mute, this._id);
      return this;
    }

    /**
     * Get the sound seek.
     */
    getSeek(): float {
      if (this._id === null) return 0;
      return this._howl.seek(this._id);
    }

    /**
     * Set the sound seek.
     * @returns The current instance for chaining.
     */
    setSeek(seek: float): this {
      if (this._id !== null) this._howl.seek(seek, this._id);
      return this;
    }

    /**
     * Get the sound spatial position.
     */
    getSpatialPosition(axis: 'x' | 'y' | 'z'): float {
      if (this._id === null) return 0;
      return this._howl.pos(this._id)[axis === 'x' ? 0 : axis === 'y' ? 1 : 2];
    }

    /**
     * Set the sound spatial position.
     * @returns The current instance for chaining.
     */
    setSpatialPosition(x: float, y: float, z: float): this {
      if (this._id !== null) this._howl.pos(x, y, z, this._id);
      return this;
    }

    /**
     * Fade the volume sound.
     * @returns The current instance for chaining.
     */
    fade(from: float, to: float, duration: float): this {
      if (this._id !== null) this._howl.fade(from, to, duration, this._id);
      return this;
    }

    /**
     * Adds an event listener to the howl.
     */
    on(event: HowlEvent, handler: HowlCallback): this {
      if (event === 'play') {
        if (this._id === null) {
          this._onPlay.push(handler);
        } else {
          this._howl.on(event, handler, this._id);
        }
      } else if (this._id === null)
        this.once('play', () => this.on(event, handler));
      else this._howl.on(event, handler, this._id);

      return this;
    }

    /**
     * Adds an event listener to the howl that removes itself after being called.
     * If the event is `play` and the sound is being played, the handler is
     * called synchronously.
     */
    once(event: HowlEvent, handler: HowlCallback): this {
      if (event === 'play') {
        if (this._id === null) {
          this._oncePlay.push(handler);
        } else if (this.playing()) {
          // Immediately call the handler if the sound is already playing.
          // This is useful for sounds that were just started and have a `.once('play', ...)`
          // handler added on them to set up the volume/rate/loop. If we don't do it
          // synchronously, the sound can play for a tiny bit at the default volume and rate.
          // See https://github.com/4ian/GDevelop/issues/2490.
          handler(this._id);
        } else {
          this._howl.once(event, handler, this._id);
        }
      } else if (this._id === null)
        this.once('play', () => this.once(event, handler));
      else this._howl.once(event, handler, this._id);

      return this;
    }

    /**
     * Removes an event listener to the howl.
     */
    off(event: HowlEvent, handler: HowlCallback): this {
      if (this._id !== null) this._howl.off(event, handler, this._id);
      return this;
    }
  }

  /**
   * HowlerSoundManager is used to manage the sounds and musics of a RuntimeScene.
   *
   * It is basically a container to associate channels to sounds and keep a list
   * of all sounds being played.
   */
  export class HowlerSoundManager {
    _loadedMusics: Record<string, Howl> = {};
    _loadedSounds: Record<string, Howl> = {};
    _resources: ResourceData[];
    _availableResources: Record<string, ResourceData> = {};
    _globalVolume: float = 100;
    _sounds: Record<integer, HowlerSound> = {};
    _musics: Record<integer, HowlerSound> = {};
    _freeSounds: HowlerSound[] = []; // Sounds without an assigned channel.
    _freeMusics: HowlerSound[] = []; // Musics without an assigned channel.

    /** Paused sounds or musics that should be played once the game is resumed.  */
    _pausedSounds: HowlerSound[] = [];
    _paused: boolean = false;

    constructor(resources: ResourceData[]) {
      this._resources = resources;

      const that = this;
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
    static clampRate(rate: float): float {
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
    private _getFileFromSoundName(soundName: string): string {
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
    private _storeSoundInArray(
      arr: Array<HowlerSound>,
      sound: HowlerSound
    ): HowlerSound {
      // Try to recycle an old sound.
      for (var i = 0, len = arr.length; i < len; ++i) {
        if (arr[i] !== null && arr[i].stopped()) {
          arr[i] = sound;
          return sound;
        }
      }

      arr.push(sound);
      return sound;
    }

    /**
     * Creates a new gdjs.HowlerSound using preloaded/cached Howl instances.
     * @param soundName The name of the file or resource to play.
     * @param isMusic True if a music, false if a sound.
     */
    createHowlerSound(soundName: string, isMusic: boolean): HowlerSound {
      const soundFile = this._getFileFromSoundName(soundName);
      const cacheContainer = isMusic ? this._loadedMusics : this._loadedSounds;

      if (!cacheContainer.hasOwnProperty(soundFile)) {
        cacheContainer[soundFile] = new Howl(
          Object.assign(
            {
              src: [soundFile],
              html5: isMusic,
            },
            HowlParameters
          )
        );
      }
      return new gdjs.HowlerSound(cacheContainer[soundFile]);
    }

    /**
     * Preloads a sound or a music in memory.
     * @param soundName The name of the file or resource to preload.
     * @param isMusic True if a music, false if a sound.
     */
    loadAudio(soundName: string, isMusic: boolean) {
      const soundFile = this._getFileFromSoundName(soundName);
      const cacheContainer = isMusic ? this._loadedMusics : this._loadedSounds;

      // Do not reload if it is already loaded.
      if (cacheContainer.hasOwnProperty(soundFile)) return;

      cacheContainer[soundFile] = new Howl(
        Object.assign(
          {
            src: [soundFile],
            html5: isMusic,
          },
          HowlParameters
        )
      );
    }

    /**
     * Unloads a sound or a music from memory. This will stop any sound/music using it.
     * @param soundName The name of the file or resource to unload.
     * @param isMusic True if a music, false if a sound.
     */
    unloadAudio(soundName: string, isMusic: boolean) {
      const soundFile = this._getFileFromSoundName(soundName);
      const cacheContainer = isMusic ? this._loadedMusics : this._loadedSounds;

      if (!cacheContainer[soundFile]) return;

      // Make sure any sound using the howl is deleted so
      // that the howl can be garbage collected
      // and no weird "zombies" using the unloaded howl can exist.
      const howl = cacheContainer[soundFile];
      function clearContainer(howlerSoundContainer: HowlerSound[]) {
        for (let i in howlerSoundContainer) {
          if (
            howlerSoundContainer[i] &&
            //@ts-ignore We really need to access the raw howl here.
            howlerSoundContainer[i]._howl === howl
          ) {
            howlerSoundContainer[i].stop();
            delete howlerSoundContainer[i];
          }
        }
      }

      clearContainer(this._freeMusics);
      clearContainer(this._freeSounds);
      clearContainer(Object.values(this._musics));
      clearContainer(Object.values(this._sounds));
      clearContainer(this._pausedSounds);

      cacheContainer[soundFile].unload();
      delete cacheContainer[soundFile];
    }

    /**
     * Unloads all audio from memory.
     * This will clear the Howl cache.
     * This will also stop any running music or sounds.
     */
    unloadAll() {
      Howler.unload();

      // Clean up old sounds that still have the dead Howl instances.
      this._freeSounds.length = 0;
      this._freeMusics.length = 0;
      this._sounds = {};
      this._musics = {};
      this._pausedSounds.length = 0;
      this._loadedMusics = {};
      this._loadedSounds = {};
    }

    playSound(soundName: string, loop: boolean, volume: float, pitch: float) {
      var sound = this.createHowlerSound(soundName, /* isMusic= */ false);
      this._storeSoundInArray(this._freeSounds, sound).play();

      sound.once('play', () => {
        sound
          .setLoop(loop)
          .setVolume(volume / 100)
          .setRate(pitch);
        if (this._paused) {
          sound.pause();
          this._pausedSounds.push(sound);
        }
      });
    }

    playSoundOnChannel(
      soundName: string,
      channel: integer,
      loop: boolean,
      volume: float,
      pitch: float
    ) {
      if (this._sounds[channel]) this._sounds[channel].stop();

      var sound = this.createHowlerSound(
        soundName,
        /* isMusic= */ false
      ).play();
      this._sounds[channel] = sound;

      sound.once('play', () => {
        sound
          .setLoop(loop)
          .setVolume(volume / 100)
          .setRate(pitch);
        if (this._paused) {
          sound.pause();
          this._pausedSounds.push(sound);
        }
      });
    }

    getSoundOnChannel(channel: integer): HowlerSound {
      return this._sounds[channel];
    }

    playMusic(soundName: string, loop: boolean, volume: float, pitch: float) {
      var music = this.createHowlerSound(soundName, /* isMusic= */ true);
      this._storeSoundInArray(this._freeMusics, music).play();

      music.once('play', () => {
        music
          .setLoop(loop)
          .setVolume(volume / 100)
          .setRate(pitch);
        if (this._paused) {
          music.pause();
          this._pausedSounds.push(music);
        }
      });
    }

    playMusicOnChannel(
      soundName: string,
      channel: integer,
      loop: boolean,
      volume: float,
      pitch: float
    ) {
      if (this._musics[channel]) this._musics[channel].stop();

      const music = this.createHowlerSound(
        soundName,
        /* isMusic= */ true
      ).play();
      this._musics[channel] = music;

      music.once('play', () => {
        music
          .setLoop(loop)
          .setVolume(volume / 100)
          .setRate(pitch);
        if (this._paused) {
          music.pause();
          this._pausedSounds.push(music);
        }
      });
    }

    getMusicOnChannel(channel: integer): HowlerSound {
      return this._musics[channel];
    }

    setGlobalVolume(volume: float): void {
      this._globalVolume = volume;
      if (this._globalVolume > 100) {
        this._globalVolume = 100;
      }
      if (this._globalVolume < 0) {
        this._globalVolume = 0;
      }
      Howler.volume(this._globalVolume / 100);
    }

    getGlobalVolume(): float {
      return this._globalVolume;
    }

    clearAll() {
      Howler.stop();

      this._freeSounds.length = 0;
      this._freeMusics.length = 0;
      this._sounds = {};
      this._musics = {};
      this._pausedSounds.length = 0;
    }

    preloadAudio(
      onProgress: (loadedCount: integer, totalCount: integer) => void,
      onComplete: (totalCount: integer) => void,
      resources?: ResourceData[]
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

      let loadedCount: integer = 0;
      const onLoad = (_?: any, error?: string) => {
        if (error)
          logger.warn(
            'There was an error while preloading an audio file: ' + error
          );

        loadedCount++;
        if (loadedCount === totalCount) return onComplete(totalCount);

        onProgress(loadedCount, totalCount);
      };

      const preloadAudioFile = (
        file: string,
        onLoadCallback: HowlCallback,
        isMusic: boolean
      ) => {
        const container = isMusic ? this._loadedMusics : this._loadedSounds;
        container[file] = new Howl(
          Object.assign({}, HowlParameters, {
            src: [file],
            onload: onLoadCallback,
            onloaderror: onLoadCallback,
            html5: isMusic,
          })
        );
      };

      for (let file in files) {
        if (files.hasOwnProperty(file)) {
          const fileData = files[file][0];
          if (!fileData.preloadAsSound && !fileData.preloadAsMusic) {
            onLoad();
          } else if (fileData.preloadAsSound && fileData.preloadAsMusic) {
            let loadedOnce = false;
            const callback = (_, error) => {
              if (!loadedOnce) {
                loadedOnce = true;
                return;
              }
              onLoad(_, error);
            };

            preloadAudioFile(file, callback, /* isMusic= */ true);
            preloadAudioFile(file, callback, /* isMusic= */ false);
          } else if (fileData.preloadAsSound) {
            preloadAudioFile(file, onLoad, /* isMusic= */ false);
          } else if (fileData.preloadAsMusic)
            preloadAudioFile(file, onLoad, /* isMusic= */ true);
        }
      }
    }
  }

  // Register the class to let the engine use it.
  export const SoundManager = HowlerSoundManager;
  export type SoundManager = HowlerSoundManager;
}
