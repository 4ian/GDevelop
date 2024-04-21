///<reference path='../types/howler'>
/*
 * GDevelop JS Platform
 * Copyright 2013-present Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  const logger = new gdjs.Logger('Audio manager');

  const resourceKinds: Array<ResourceKind> = ['audio'];

  const HowlParameters: HowlOptions = {
    preload: true,
    onplayerror: (_, error) =>
      logger.error("Can't play an audio file: " + error),
    onloaderror: (_, error) =>
      logger.error('Error while loading an audio file: ' + error),
  };

  /**
   * Ensure the volume is between 0 and 1.
   */
  const clampVolume = (volume: float): float => {
    if (volume > 1.0) {
      return 1.0;
    }
    if (volume < 0) {
      return 0;
    }
    return volume;
  };

  /**
   * A thin wrapper around a Howl object with:
   * * Handling of callbacks when the sound is not yet loaded.
   * * Automatic clamping when calling `setRate` to ensure a valid value is passed to Howler.js.
   * * Automatic clamping when calling `setVolume` so that the volume is always between 0 and 1.
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
     * The **initial** volume at which the sound is being played.
     * Once the sound is started, this volume can be not in sync
     * (in the case the sound is faded by Howler), so volume must
     * be gotten from `this._howl` directly.
     *
     * This value is clamped between 0 and 1.
     */
    private _initialVolume: float;

    /**
     * Whether the sound is being played in a loop or not.
     */
    private _loop: boolean;

    /**
     * The rate (speed) the sound is being played at.
     * This value is not clamped, though technically Howler.js will only
     * accepts values between a specific range (so we clamp this when
     * passing it to Howler.js, but keep the original value here).
     */
    private _rate: float;

    /**
     * An array of callbacks to call once the sound starts to play.
     */
    private _oncePlay: Array<HowlCallback> = [];

    /**
     * An array of callbacks to call everytime the sound starts to play.
     */
    private _onPlay: Array<HowlCallback> = [];

    constructor(howl: Howl, volume: float, loop: boolean, rate: float) {
      this._howl = howl;
      this._initialVolume = clampVolume(volume);
      this._loop = loop;
      this._rate = rate;
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

        // Set the howl properties as soon as the sound is played and we have its ID.
        this._howl.volume(this._initialVolume, newID); // this._initialVolume is already clamped between 0 and 1.
        this._howl.loop(this._loop, newID);
        // this._rate is not clamped, but we need to clamp it when passing it to Howler.js as it
        // only supports a specific range.
        this._howl.rate(gdjs.HowlerSoundManager.clampRate(this._rate), newID);

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
     * Note that a loading sound is considered as playing (as it will be
     * played as soon as it's loaded). To avoid loading at runtime, prefer
     * to preload the sounds.
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
     * Get the sound playback rate. This 1 for the default speed.
     * This value is not clamped (any value greater than 0 is valid),
     * but the underlying audio system might not play the sound at the required
     * rate if it's very low or very high.
     */
    getRate(): float {
      return this._rate;
    }

    /**
     * Set the playback rate.
     * This value is not clamped (any value greater than 0 is valid),
     * but the underlying audio system might not play the sound at the required
     * rate if it's very low or very high.
     * @returns The current instance for chaining.
     */
    setRate(rate: float): this {
      this._rate = rate;
      // If the sound has already started playing, then change the value directly.
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
      return this._loop;
    }

    /**
     * Set if the sound is looping.
     * @returns The current instance for chaining.
     */
    setLoop(loop: boolean): this {
      this._loop = loop;
      // If the sound has already started playing, then change the value directly.
      if (this._id !== null) this._howl.loop(loop, this._id);
      return this;
    }

    //TODO: Replace float type in those 2 methods with RangeOf<0..1> once it is standardized (https://github.com/Microsoft/TypeScript/issues/15480)
    /**
     * Get the sound volume.
     * @returns A float from 0 to 1.
     */
    getVolume(): float {
      if (this._id === null) return this._initialVolume;
      return this._howl.volume(this._id);
    }

    /**
     * Set the sound volume.
     * @param volume A float from 0 to 1. The value is clamped if too high or too low.
     * @returns The current instance for chaining.
     */
    setVolume(volume: float): this {
      this._initialVolume = clampVolume(volume);

      // If the sound has already started playing, then change the value directly.
      if (this._id !== null) this._howl.volume(this._initialVolume, this._id);
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
      if (this._id !== null)
        this._howl.fade(clampVolume(from), clampVolume(to), duration, this._id);
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
    _loadedMusics = new gdjs.ResourceCache<Howl>();
    _loadedSounds = new gdjs.ResourceCache<Howl>();
    _availableResources: Record<string, ResourceData> = {};
    _globalVolume: float = 100;
    _sounds: Record<integer, HowlerSound> = {};
    _musics: Record<integer, HowlerSound> = {};
    _freeSounds: HowlerSound[] = []; // Sounds without an assigned channel.
    _freeMusics: HowlerSound[] = []; // Musics without an assigned channel.

    /** Paused sounds or musics that should be played once the game is resumed.  */
    _pausedSounds: HowlerSound[] = [];
    _paused: boolean = false;

    _resourceLoader: gdjs.ResourceLoader;

    /**
     * @param resources The resources data of the game.
     * @param resourceLoader The resources loader of the game.
     */
    constructor(resourceLoader: gdjs.ResourceLoader) {
      this._resourceLoader = resourceLoader;

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

    getResourceKinds(): ResourceKind[] {
      return resourceKinds;
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
     * @return The associated resource
     */
    private _getAudioResource = (resourceName: string): ResourceData => {
      const resource = this._resourceLoader.getResource(resourceName);
      return resource && this.getResourceKinds().includes(resource.kind)
        ? resource
        : ({
            file: resourceName,
            kind: 'audio',
            metadata: '',
            name: resourceName,
          } as ResourceData);
    };

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
      for (let i = 0, len = arr.length; i < len; ++i) {
        if (!arr[i] || arr[i].stopped()) {
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
     * @param volume Between 0 and 1.
     * @param loop True if it should be played looping.
     * @param rate speed at which it is played.
     */
    createHowlerSound(
      soundName: string,
      isMusic: boolean,
      volume: float,
      loop: boolean,
      rate: float
    ): HowlerSound {
      const cacheContainer = isMusic ? this._loadedMusics : this._loadedSounds;
      const resource = this._getAudioResource(soundName);

      let howl = cacheContainer.get(resource);
      if (!howl) {
        const fileName = resource ? resource.file : soundName;
        howl = new Howl(
          Object.assign(
            {
              src: [this._resourceLoader.getFullUrl(fileName)],
              html5: isMusic,
              xhr: {
                withCredentials: this._resourceLoader.checkIfCredentialsRequired(
                  fileName
                ),
              },
              // Cache the sound with no volume. This avoids a bug where it plays at full volume
              // for a split second before setting its correct volume.
              volume: 0,
            },
            HowlParameters
          )
        );
        cacheContainer.set(resource, howl);
      }

      return new gdjs.HowlerSound(howl, volume, loop, rate);
    }

    /**
     * Preloads a sound or a music in memory.
     * @param soundName The name of the file or resource to preload.
     * @param isMusic True if a music, false if a sound.
     */
    loadAudio(soundName: string, isMusic: boolean) {
      const cacheContainer = isMusic ? this._loadedMusics : this._loadedSounds;
      const resource = this._getAudioResource(soundName);

      // Do not reload if it is already loaded.
      if (cacheContainer.get(resource)) {
        return;
      }

      cacheContainer.set(
        resource,
        new Howl(
          Object.assign(
            {
              src: [this._resourceLoader.getFullUrl(resource.file)],
              html5: isMusic,
              xhr: {
                withCredentials: this._resourceLoader.checkIfCredentialsRequired(
                  resource.file
                ),
              },
              // Cache the sound with no volume. This avoids a bug where it plays at full volume
              // for a split second before setting its correct volume.
              volume: 0,
            },
            HowlParameters
          )
        )
      );
    }

    /**
     * Unloads a sound or a music from memory. This will stop any sound/music using it.
     * @param soundName The name of the file or resource to unload.
     * @param isMusic True if a music, false if a sound.
     */
    unloadAudio(soundName: string, isMusic: boolean) {
      const cacheContainer = isMusic ? this._loadedMusics : this._loadedSounds;
      const resource = this._getAudioResource(soundName);

      const howl = cacheContainer.get(resource);
      if (!howl) {
        return;
      }

      // Make sure any sound using the howl is deleted so
      // that the howl can be garbage collected
      // and no weird "zombies" using the unloaded howl can exist.
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

      howl.unload();
      cacheContainer.delete(resource);
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
      this._loadedMusics.clear();
      this._loadedSounds.clear();
    }

    playSound(soundName: string, loop: boolean, volume: float, pitch: float) {
      const sound = this.createHowlerSound(
        soundName,
        /* isMusic= */ false,
        volume / 100,
        loop,
        pitch
      );
      this._storeSoundInArray(this._freeSounds, sound);
      sound.once('play', () => {
        if (this._paused) {
          sound.pause();
          this._pausedSounds.push(sound);
        }
      });
      sound.play();
    }

    playSoundOnChannel(
      soundName: string,
      channel: integer,
      loop: boolean,
      volume: float,
      pitch: float
    ) {
      if (this._sounds[channel]) this._sounds[channel].stop();

      const sound = this.createHowlerSound(
        soundName,
        /* isMusic= */ false,
        volume / 100,
        loop,
        pitch
      );
      this._sounds[channel] = sound;
      sound.once('play', () => {
        if (this._paused) {
          sound.pause();
          this._pausedSounds.push(sound);
        }
      });
      sound.play();
    }

    getSoundOnChannel(channel: integer): HowlerSound | null {
      return this._sounds[channel] || null;
    }

    playMusic(soundName: string, loop: boolean, volume: float, pitch: float) {
      const music = this.createHowlerSound(
        soundName,
        /* isMusic= */ true,
        volume / 100,
        loop,
        pitch
      );
      this._storeSoundInArray(this._freeMusics, music);
      music.once('play', () => {
        if (this._paused) {
          music.pause();
          this._pausedSounds.push(music);
        }
      });
      music.play();
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
        /* isMusic= */ true,
        volume / 100,
        loop,
        pitch
      );
      this._musics[channel] = music;
      music.once('play', () => {
        if (this._paused) {
          music.pause();
          this._pausedSounds.push(music);
        }
      });
      music.play();
    }

    getMusicOnChannel(channel: integer): HowlerSound | null {
      return this._musics[channel] || null;
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

    async processResource(resourceName: string): Promise<void> {
      // Do nothing because sounds are light enough to be parsed in background.
    }

    async loadResource(resourceName: string): Promise<void> {
      const resource = this._resourceLoader.getResource(resourceName);
      if (!resource) {
        logger.warn(
          'Unable to find audio for resource "' + resourceName + '".'
        );
        return;
      }
      if (resource.file) {
        if (this._availableResources[resource.name]) {
          return;
        }

        this._availableResources[resource.name] = resource;
      }

      const preloadAudioFile = (
        file: string,
        isMusic: boolean
      ): Promise<number> => {
        return new Promise((resolve, reject) => {
          const container = isMusic ? this._loadedMusics : this._loadedSounds;
          container[file] = new Howl(
            Object.assign({}, HowlParameters, {
              src: [this._resourceLoader.getFullUrl(file)],
              onload: resolve,
              onloaderror: (soundId: number, error?: string) => reject(error),
              html5: isMusic,
              xhr: {
                withCredentials: this._resourceLoader.checkIfCredentialsRequired(
                  file
                ),
              },
              // Cache the sound with no volume. This avoids a bug where it plays at full volume
              // for a split second before setting its correct volume.
              volume: 0,
            })
          );
        });
      };

      const file = resource.file;
      if (resource.preloadAsMusic) {
        try {
          await preloadAudioFile(file, /* isMusic= */ true);
        } catch (error) {
          logger.warn(
            'There was an error while preloading an audio file: ' + error
          );
        }
      }

      if (resource.preloadAsSound) {
        try {
          await preloadAudioFile(file, /* isMusic= */ false);
        } catch (error) {
          logger.warn(
            'There was an error while preloading an audio file: ' + error
          );
        }
      } else if (
        resource.preloadInCache ||
        // Force downloading of sounds.
        // TODO Decide if sounds should be allowed to be downloaded after the scene starts.
        // - they should be requested automatically at the end of the scene loading
        // - they will be downloaded while the scene is playing
        // - other scenes will be pre-loaded only when all the sounds for the current scene are in cache
        !resource.preloadAsMusic
      ) {
        // preloading as sound already does a XHR request, hence "else if"
        try {
          await new Promise((resolve, reject) => {
            const sound = new XMLHttpRequest();
            sound.withCredentials = this._resourceLoader.checkIfCredentialsRequired(
              file
            );
            sound.addEventListener('load', resolve);
            sound.addEventListener('error', (_) =>
              reject('XHR error: ' + file)
            );
            sound.addEventListener('abort', (_) =>
              reject('XHR abort: ' + file)
            );
            sound.open('GET', this._resourceLoader.getFullUrl(file));
            sound.send();
          });
        } catch (error) {
          logger.warn(
            'There was an error while preloading an audio file: ' + error
          );
        }
      }
    }
  }

  // Register the class to let the engine use it.
  export const SoundManager = HowlerSoundManager;
  export type SoundManager = HowlerSoundManager;
}
