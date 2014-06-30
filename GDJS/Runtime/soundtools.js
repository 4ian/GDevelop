/*
 * Game Develop JS Platform
 * Copyright 2013-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
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
};

gdjs.evtTools.sound.playSoundOnChannel = function(runtimeScene, soundFile, channel, loop, volume, pitch) {
    runtimeScene.getSoundManager().playSoundOnChannel(soundFile, channel, loop, volume, pitch);
};

gdjs.evtTools.sound.stopSoundOnChannel = function(runtimeScene, channel) {
    runtimeScene.getSoundManager().stopSoundOnChannel(channel);
};

gdjs.evtTools.sound.pauseSoundOnChannel = function(runtimeScene, channel) {
    runtimeScene.getSoundManager().pauseSoundOnChannel(channel);
};

gdjs.evtTools.sound.continueSoundOnChannel = function(runtimeScene, channel) {
    runtimeScene.getSoundManager().continueSoundOnChannel(channel);
};

gdjs.evtTools.sound.isSoundOnChannelPlaying = function(runtimeScene, channel) {
    return runtimeScene.getSoundManager().isSoundOnChannelPlaying(channel);
};

gdjs.evtTools.sound.isSoundOnChannelPaused = function(runtimeScene, channel) {
    return runtimeScene.getSoundManager().isSoundOnChannelPaused(channel);
};

gdjs.evtTools.sound.isSoundOnChannelStopped = function(runtimeScene, channel) {
    return runtimeScene.getSoundManager().isSoundOnChannelStopped(channel);
};

gdjs.evtTools.sound.playMusic = function(runtimeScene, soundFile, loop, volume, pitch) {
    runtimeScene.getSoundManager().playMusic(soundFile, loop, volume, pitch);
};

gdjs.evtTools.sound.playMusicOnChannel = function(runtimeScene, soundFile, channel, loop, volume, pitch) {
    runtimeScene.getSoundManager().playMusicOnChannel(soundFile, channel, loop, volume, pitch);
};

gdjs.evtTools.sound.stopMusicOnChannel = function(runtimeScene, channel) {
    runtimeScene.getSoundManager().stopMusicOnChannel(channel);
};

gdjs.evtTools.sound.pauseMusicOnChannel = function(runtimeScene, channel) {
    runtimeScene.getSoundManager().pauseMusicOnChannel(channel);
};

gdjs.evtTools.sound.continueMusicOnChannel = function(runtimeScene, channel) {
    runtimeScene.getSoundManager().continueMusicOnChannel(channel);
};

gdjs.evtTools.sound.isMusicOnChannelPlaying = function(runtimeScene, channel) {
    return runtimeScene.getSoundManager().isMusicOnChannelPlaying(channel);
};

gdjs.evtTools.sound.isMusicOnChannelPaused = function(runtimeScene, channel) {
    return runtimeScene.getSoundManager().isMusicOnChannelPaused(channel);
};

gdjs.evtTools.sound.isMusicOnChannelStopped = function(runtimeScene, channel) {
    return runtimeScene.getSoundManager().isMusicOnChannelStopped(channel);
};

gdjs.evtTools.sound.getMusicOnChannelVolume = function(runtimeScene, channel) {
    runtimeScene.getSoundManager().getMusicOnChannelVolume(channel);
};

gdjs.evtTools.sound.setMusicOnChannelVolume = function(runtimeScene, channel, volume) {
    runtimeScene.getSoundManager().setMusicOnChannelVolume(channel, volume);
};

gdjs.evtTools.sound.getMusicOnChannelPlayingOffset = function(runtimeScene, channel) {
    runtimeScene.getSoundManager().getMusicOnChannelPlayingOffset(channel);
};

gdjs.evtTools.sound.setMusicOnChannelPlayingOffset = function(runtimeScene, channel, playingOffset) {
    runtimeScene.getSoundManager().setMusicOnChannelPlayingOffset(channel, playingOffset);
};

gdjs.evtTools.sound.getSoundOnChannelVolume = function(runtimeScene, channel) {
    runtimeScene.getSoundManager().getSoundOnChannelVolume(channel);
};

gdjs.evtTools.sound.setSoundOnChannelVolume = function(runtimeScene, channel, volume) {
    runtimeScene.getSoundManager().setSoundOnChannelVolume(channel, volume);
};

gdjs.evtTools.sound.getSoundOnChannelPlayingOffset = function(runtimeScene, channel) {
    runtimeScene.getSoundManager().getSoundOnChannelPlayingOffset(channel);
};

gdjs.evtTools.sound.setSoundOnChannelPlayingOffset = function(runtimeScene, channel, playingOffset) {
    runtimeScene.getSoundManager().setSoundOnChannelPlayingOffset(channel, playingOffset);
};

gdjs.evtTools.sound.getGlobalVolume = function(runtimeScene) {
    return runtimeScene.getSoundManager().getGlobalVolume();
};

gdjs.evtTools.sound.setGlobalVolume = function(runtimeScene, globalVolume) {
    runtimeScene.getSoundManager().setGlobalVolume(globalVolume);
};
