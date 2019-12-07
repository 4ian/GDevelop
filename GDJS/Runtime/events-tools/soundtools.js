/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

/**
 * Class used by events to interact with the soundManager.
 *
 * @memberof gdjs.evtTools
 * @class sound
 * @static
 * @private
 */
gdjs.evtTools.sound = gdjs.evtTools.sound || {};

gdjs.evtTools.sound.getGlobalVolume = function(runtimeScene) {
    return runtimeScene.getSoundManager().getGlobalVolume();
};

gdjs.evtTools.sound.setGlobalVolume = function(runtimeScene, globalVolume) {
    runtimeScene.getSoundManager().setGlobalVolume(globalVolume);
};

//Sounds:

gdjs.evtTools.sound.playSound = function(runtimeScene, soundFile, loop, volume, pitch) {
    runtimeScene.getSoundManager().playSound(soundFile, loop, volume, pitch);
};

gdjs.evtTools.sound.playSoundOnChannel = function(runtimeScene, soundFile, channel, loop, volume, pitch) {
    runtimeScene.getSoundManager().playSoundOnChannel(soundFile, channel, loop, volume, pitch);
};

gdjs.evtTools.sound.stopSoundOnChannel = function(runtimeScene, channel) {
    var sound = runtimeScene.getSoundManager().getSoundOnChannel(channel);
    sound && sound.stop();
};

gdjs.evtTools.sound.pauseSoundOnChannel = function(runtimeScene, channel) {
    var sound = runtimeScene.getSoundManager().getSoundOnChannel(channel);
    sound && sound.pause();
};

gdjs.evtTools.sound.continueSoundOnChannel = function(runtimeScene, channel) {
    var sound = runtimeScene.getSoundManager().getSoundOnChannel(channel);
    if (sound && !sound.playing()) sound.play();
};

gdjs.evtTools.sound.isSoundOnChannelPlaying = function(runtimeScene, channel) {
    var sound = runtimeScene.getSoundManager().getSoundOnChannel(channel);
    return sound ? sound.playing() : false;
};

gdjs.evtTools.sound.isSoundOnChannelPaused = function(runtimeScene, channel) {
    var sound = runtimeScene.getSoundManager().getSoundOnChannel(channel);
    return sound ? sound.paused() : false;
};

gdjs.evtTools.sound.isSoundOnChannelStopped = function(runtimeScene, channel) {
    var sound = runtimeScene.getSoundManager().getSoundOnChannel(channel);
    return sound ? sound.stopped() : true;
};

gdjs.evtTools.sound.getSoundOnChannelVolume = function(runtimeScene, channel) {
    var sound = runtimeScene.getSoundManager().getSoundOnChannel(channel);
    return sound ? sound.volume() * 100 : 100;
};

gdjs.evtTools.sound.setSoundOnChannelVolume = function(runtimeScene, channel, volume) {
    var sound = runtimeScene.getSoundManager().getSoundOnChannel(channel);
    sound && sound.volume(volume / 100);
};

gdjs.evtTools.sound.getSoundOnChannelPlayingOffset = function(runtimeScene, channel) {
    var sound = runtimeScene.getSoundManager().getSoundOnChannel(channel);
    return sound ? sound.seek() : 0;
};

gdjs.evtTools.sound.setSoundOnChannelPlayingOffset = function(runtimeScene, channel, playingOffset) {
    var sound = runtimeScene.getSoundManager().getSoundOnChannel(channel);
    sound && sound.seek(playingOffset);
};

gdjs.evtTools.sound.getSoundOnChannelPitch = function(runtimeScene, channel) {
    var sound = runtimeScene.getSoundManager().getSoundOnChannel(channel);
    return sound ? sound.getRate() : 1;
};

gdjs.evtTools.sound.setSoundOnChannelPitch = function(runtimeScene, channel, pitch) {
    var sound = runtimeScene.getSoundManager().getSoundOnChannel(channel);
    sound && sound.setRate(pitch);
};

//Musics:

gdjs.evtTools.sound.playMusic = function(runtimeScene, soundFile, loop, volume, pitch) {
    runtimeScene.getSoundManager().playMusic(soundFile, loop, volume, pitch);
};

gdjs.evtTools.sound.playMusicOnChannel = function(runtimeScene, soundFile, channel, loop, volume, pitch) {
    runtimeScene.getSoundManager().playMusicOnChannel(soundFile, channel, loop, volume, pitch);
};

gdjs.evtTools.sound.stopMusicOnChannel = function(runtimeScene, channel) {
    var music = runtimeScene.getSoundManager().getMusicOnChannel(channel);
    music && music.stop();
};

gdjs.evtTools.sound.pauseMusicOnChannel = function(runtimeScene, channel) {
    var music = runtimeScene.getSoundManager().getMusicOnChannel(channel);
    music && music.pause();
};

gdjs.evtTools.sound.continueMusicOnChannel = function(runtimeScene, channel) {
    var music = runtimeScene.getSoundManager().getMusicOnChannel(channel);
    if (music && !music.playing()) music.play();
};

gdjs.evtTools.sound.isMusicOnChannelPlaying = function(runtimeScene, channel) {
    var music = runtimeScene.getSoundManager().getMusicOnChannel(channel);
    return music ? music.playing() : false;
};

gdjs.evtTools.sound.isMusicOnChannelPaused = function(runtimeScene, channel) {
    var music = runtimeScene.getSoundManager().getMusicOnChannel(channel);
    return music ? music.paused() : false;
};

gdjs.evtTools.sound.isMusicOnChannelStopped = function(runtimeScene, channel) {
    var music = runtimeScene.getSoundManager().getMusicOnChannel(channel);
    return music ? music.stopped() : true;
};

gdjs.evtTools.sound.getMusicOnChannelVolume = function(runtimeScene, channel) {
    var music = runtimeScene.getSoundManager().getMusicOnChannel(channel);
    return music ? music.volume() * 100 : 100;
};

gdjs.evtTools.sound.setMusicOnChannelVolume = function(runtimeScene, channel, volume) {
    var music = runtimeScene.getSoundManager().getMusicOnChannel(channel);
    music && music.volume(volume / 100);
};

gdjs.evtTools.sound.getMusicOnChannelPlayingOffset = function(runtimeScene, channel) {
    var music = runtimeScene.getSoundManager().getMusicOnChannel(channel);
    return music ? music.seek() : 0;
};

gdjs.evtTools.sound.setMusicOnChannelPlayingOffset = function(runtimeScene, channel, playingOffset) {
    var music = runtimeScene.getSoundManager().getMusicOnChannel(channel);
    music && music.seek(playingOffset);
};

gdjs.evtTools.sound.getMusicOnChannelPitch = function(runtimeScene, channel) {
    var music = runtimeScene.getSoundManager().getMusicOnChannel(channel);
    return music ? music.getRate() : 1;
};

gdjs.evtTools.sound.setMusicOnChannelPitch = function(runtimeScene, channel, pitch) {
    var music = runtimeScene.getSoundManager().getMusicOnChannel(channel);
    music && music.setRate(pitch);
};
