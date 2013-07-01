/*
 * Game Develop JS Platform
 * Copyright 2013 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */

/**
 * Class used by events to interact with the soundManager.
 *
 * @namespace gdjs.evtTools
 * @class sound
 * @static
 * @private
 */
gdjs.evtTools.sound = gdjs.evtTools.sound || {};

gdjs.evtTools.sound.playSound = function(runtimeScene, soundFile, loop, volume, pitch) {
    runtimeScene.getSoundManager().playSound(soundFile, loop, volume, pitch);
}

gdjs.evtTools.sound.playSoundOnChannel = function(runtimeScene, soundFile, channel, loop, volume, pitch) {
    runtimeScene.getSoundManager().playSoundOnChannel(soundFile, channel, loop, volume, pitch);
}

gdjs.evtTools.sound.stopSoundOnChannel = function(runtimeScene, soundFile, channel, loop, volume, pitch) {
    runtimeScene.getSoundManager().stopSoundOnChannel(channel);
}

gdjs.evtTools.sound.pauseSoundOnChannel = function(runtimeScene, soundFile, channel, loop, volume, pitch) {
    runtimeScene.getSoundManager().pauseSoundOnChannel(channel);
}

gdjs.evtTools.sound.continueSoundOnChannel = function(runtimeScene, soundFile, channel, loop, volume, pitch) {
    runtimeScene.getSoundManager().continueSoundOnChannel(channel);
}

gdjs.evtTools.sound.playMusic = function(runtimeScene, soundFile, loop, volume, pitch) {
    runtimeScene.getSoundManager().playMusic(soundFile, loop, volume, pitch);
}

gdjs.evtTools.sound.playMusicOnChannel = function(runtimeScene, soundFile, channel, loop, volume, pitch) {
    runtimeScene.getSoundManager().playMusicOnChannel(soundFile, channel, loop, volume, pitch);
}

gdjs.evtTools.sound.stopMusicOnChannel = function(runtimeScene, soundFile, channel, loop, volume, pitch) {
    runtimeScene.getSoundManager().stopMusicOnChannel(channel);
}

gdjs.evtTools.sound.pauseMusicOnChannel = function(runtimeScene, soundFile, channel, loop, volume, pitch) {
    runtimeScene.getSoundManager().pauseMusicOnChannel(channel);
}

gdjs.evtTools.sound.continueMusicOnChannel = function(runtimeScene, soundFile, channel, loop, volume, pitch) {
    runtimeScene.getSoundManager().continueMusicOnChannel(channel);
}

gdjs.evtTools.sound.getGlobalVolume = function(runtimeScene) {
    runtimeScene.getSoundManager().getGlobalVolume();
}

gdjs.evtTools.sound.setGlobalVolume = function(runtimeScene, globalVolume) {
    runtimeScene.getSoundManager().setGlobalVolume(globalVolume);
}
