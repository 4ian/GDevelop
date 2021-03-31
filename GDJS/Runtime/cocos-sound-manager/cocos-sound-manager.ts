/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  export class CocosEffect {
    _effectId: any;
    _paused: boolean = false;
    _stopped: boolean = true;

    constructor(effectId) {
      this._effectId = effectId;
    }

    play() {
      this._paused = false;
      this._stopped = false;
      cc.audioEngine.resumeEffect(this._effectId);
    }

    playing() {
      return !this._paused && !this._stopped;
    }

    pause() {
      this._paused = true;
      this._stopped = false;
      cc.audioEngine.pauseEffect(this._effectId);
    }

    paused() {
      return this._paused;
    }

    stop() {
      this._paused = false;
      this._stopped = true;
      cc.audioEngine.stopEffect(this._effectId);
    }

    stopped() {
      return this._stopped;
    }

    getRate() {
      return 1;
    }

    //Unsupported
    setRate(rate): void {}

    //Unsupported
    volume() {
      return 1;
    }

    //Unsupported
    seek() {
      return 0;
    }
  }

  //Unsupported

  export class CocosSoundManager {
    _resources: any;
    _availableResources: any = {};
    _sounds: any = {};

    constructor(resources) {
      this._resources = resources;

      //Map storing "audio" resources for faster access.
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
     * Return the file associated to the given sound name.
     *
     * Names and files are loaded from resources when preloadAudio is called. If no
     * file is associated to the given name, then the name will be considered as a
     * filename and will be returned.
     * @return The associated filename
     */
    private _getFileFromSoundName(soundName): any {
      if (
        this._availableResources.hasOwnProperty(soundName) &&
        this._availableResources[soundName].file
      ) {
        return 'res/' + this._availableResources[soundName].file;
      }
      return 'res/' + soundName;
    }

    playSound(soundName, loop, volume, pitch) {
      const soundFile = this._getFileFromSoundName(soundName);
      cc.audioEngine.playEffect(soundFile, loop);
    }

    playSoundOnChannel(soundName, channel, loop, volume, pitch) {
      const oldSound = this._sounds[channel];
      if (oldSound) {
        oldSound.stop();
      }
      const soundFile = this._getFileFromSoundName(soundName);
      this._sounds[channel] = new gdjs.CocosEffect(
        cc.audioEngine.playEffect(soundFile, loop)
      );
    }

    getSoundOnChannel(channel) {
      return this._sounds[channel];
    }

    playMusic(soundName, loop, volume, pitch) {
      const soundFile = this._getFileFromSoundName(soundName);
      cc.audioEngine.playMusic(
        soundFile,
        //TODO: no filename extension?
        loop
      );
    }

    playMusicOnChannel(soundName, channel, loop, volume, pitch) {
      //TODO
      const soundFile = this._getFileFromSoundName(soundName);
      cc.audioEngine.playMusic(
        soundFile,
        //TODO: no filename extension?
        loop
      );
    }

    getMusicOnChannel(channel) {
      return undefined;
    }

    //TODO
    setGlobalVolume(volume): void {
      cc.audioEngine.setEffectsVolume(volume / 100);
      cc.audioEngine.setMusicVolume(volume / 100);
    }

    getGlobalVolume() {
      return cc.audioEngine.getEffectsVolume() * 100;
    }

    clearAll() {
      for (const p in this._sounds) {
        if (this._sounds.hasOwnProperty(p) && this._sounds[p]) {
          this._sounds[p].stop();
          delete this._sounds[p];
        }
      }
      cc.audioEngine.stopAllEffects();
      cc.audioEngine.stopMusic();
    }

    preloadAudio(onProgress, onComplete, resources) {
      resources = resources || this._resources;
      const files = [];
      const that = this;
      for (let i = 0, len = resources.length; i < len; ++i) {
        const res = resources[i];
        if (res.file && res.kind === 'audio') {
          that._availableResources[res.name] = res;
        }
      }

      //TODO: sound preloading
      onComplete(files.length);
    }
  }
  //Register the class to let the engine use it.
  gdjs.SoundManager = gdjs.CocosSoundManager;
}
