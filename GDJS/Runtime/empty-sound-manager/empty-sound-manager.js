// @ts-check
/*
 * GDevelop JS Platform
 * Copyright 2013-present Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

/**
 * EmptySoundManager does not play any sound or music.
 *
 * @memberof gdjs
 * @class EmptySoundManager
 */
gdjs.EmptySoundManager = function (resources) {
  this._globalVolume = 100;
  this._resources = resources;
};

gdjs.SoundManager = gdjs.EmptySoundManager; //Register the class to let the engine use it.

/**
 * Update the resources data of the game. Useful for hot-reloading, should not be used otherwise.
 *
 * @param {ResourceData[]} resources The resources data of the game.
 */
gdjs.EmptySoundManager.prototype.setResources = function (resources) {
  this._resources = resources;
};

gdjs.EmptySoundManager.prototype.playSound = function (
  soundName,
  loop,
  volume,
  pitch
) {};

gdjs.EmptySoundManager.prototype.playSoundOnChannel = function (
  soundName,
  channel,
  loop,
  volume,
  pitch
) {
  return null;
};

gdjs.EmptySoundManager.prototype.getSoundOnChannel = function (channel) {
  return null;
};

gdjs.EmptySoundManager.prototype.playMusic = function (
  soundName,
  loop,
  volume,
  pitch
) {};

gdjs.EmptySoundManager.prototype.playMusicOnChannel = function (
  soundName,
  channel,
  loop,
  volume,
  pitch
) {};

gdjs.EmptySoundManager.prototype.getMusicOnChannel = function (channel) {
  return null;
};

gdjs.EmptySoundManager.prototype.setGlobalVolume = function (volume) {
  this._globalVolume = volume;
  if (this._globalVolume > 100) this._globalVolume = 100;
  if (this._globalVolume < 0) this._globalVolume = 0;
};

gdjs.EmptySoundManager.prototype.getGlobalVolume = function () {
  return this._globalVolume;
};

gdjs.EmptySoundManager.prototype.clearAll = function () {};

gdjs.EmptySoundManager.prototype.preloadAudio = function (
  onProgress,
  onComplete
) {
  onComplete(this._resources.length);
};
