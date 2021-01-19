/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  export namespace evtTools {
    export namespace sound {
      export const getGlobalVolume = function (runtimeScene) {
        return runtimeScene.getSoundManager().getGlobalVolume();
      };
      export const setGlobalVolume = function (runtimeScene, globalVolume) {
        runtimeScene.getSoundManager().setGlobalVolume(globalVolume);
      };

      // Sounds:
      export const playSound = function (
        runtimeScene,
        soundFile,
        loop,
        volume,
        pitch
      ) {
        runtimeScene
          .getSoundManager()
          .playSound(soundFile, loop, volume, pitch);
      };
      export const playSoundOnChannel = function (
        runtimeScene,
        soundFile,
        channel,
        loop,
        volume,
        pitch
      ) {
        runtimeScene
          .getSoundManager()
          .playSoundOnChannel(soundFile, channel, loop, volume, pitch);
      };
      export const stopSoundOnChannel = function (runtimeScene, channel) {
        const sound = runtimeScene.getSoundManager().getSoundOnChannel(channel);
        sound && sound.stop();
      };
      export const pauseSoundOnChannel = function (runtimeScene, channel) {
        const sound = runtimeScene.getSoundManager().getSoundOnChannel(channel);
        sound && sound.pause();
      };
      export const continueSoundOnChannel = function (runtimeScene, channel) {
        const sound = runtimeScene.getSoundManager().getSoundOnChannel(channel);
        if (sound && !sound.playing()) {
          sound.play();
        }
      };
      export const isSoundOnChannelPlaying = function (runtimeScene, channel) {
        const sound = runtimeScene.getSoundManager().getSoundOnChannel(channel);
        return sound ? sound.playing() : false;
      };
      export const isSoundOnChannelPaused = function (runtimeScene, channel) {
        const sound = runtimeScene.getSoundManager().getSoundOnChannel(channel);
        return sound ? sound.paused() : false;
      };
      export const isSoundOnChannelStopped = function (runtimeScene, channel) {
        const sound = runtimeScene.getSoundManager().getSoundOnChannel(channel);
        return sound ? sound.stopped() : true;
      };
      export const getSoundOnChannelVolume = function (runtimeScene, channel) {
        const sound = runtimeScene.getSoundManager().getSoundOnChannel(channel);
        return sound ? sound.volume() * 100 : 100;
      };
      export const setSoundOnChannelVolume = function (
        runtimeScene,
        channel,
        volume
      ) {
        const sound = runtimeScene.getSoundManager().getSoundOnChannel(channel);
        sound && sound.volume(volume / 100);
      };
      export const getSoundOnChannelPlayingOffset = function (
        runtimeScene,
        channel
      ) {
        const sound = runtimeScene.getSoundManager().getSoundOnChannel(channel);
        return sound ? sound.seek() : 0;
      };
      export const setSoundOnChannelPlayingOffset = function (
        runtimeScene,
        channel,
        playingOffset
      ) {
        const sound = runtimeScene.getSoundManager().getSoundOnChannel(channel);
        sound && sound.seek(playingOffset);
      };
      export const getSoundOnChannelPitch = function (runtimeScene, channel) {
        const sound = runtimeScene.getSoundManager().getSoundOnChannel(channel);
        return sound ? sound.getRate() : 1;
      };
      export const setSoundOnChannelPitch = function (
        runtimeScene,
        channel,
        pitch
      ) {
        const sound = runtimeScene.getSoundManager().getSoundOnChannel(channel);
        sound && sound.setRate(pitch);
      };

      // Musics:
      export const playMusic = function (
        runtimeScene,
        soundFile,
        loop,
        volume,
        pitch
      ) {
        runtimeScene
          .getSoundManager()
          .playMusic(soundFile, loop, volume, pitch);
      };
      export const playMusicOnChannel = function (
        runtimeScene,
        soundFile,
        channel,
        loop,
        volume,
        pitch
      ) {
        runtimeScene
          .getSoundManager()
          .playMusicOnChannel(soundFile, channel, loop, volume, pitch);
      };
      export const stopMusicOnChannel = function (runtimeScene, channel) {
        const music = runtimeScene.getSoundManager().getMusicOnChannel(channel);
        music && music.stop();
      };
      export const pauseMusicOnChannel = function (runtimeScene, channel) {
        const music = runtimeScene.getSoundManager().getMusicOnChannel(channel);
        music && music.pause();
      };
      export const continueMusicOnChannel = function (runtimeScene, channel) {
        const music = runtimeScene.getSoundManager().getMusicOnChannel(channel);
        if (music && !music.playing()) {
          music.play();
        }
      };
      export const isMusicOnChannelPlaying = function (runtimeScene, channel) {
        const music = runtimeScene.getSoundManager().getMusicOnChannel(channel);
        return music ? music.playing() : false;
      };
      export const isMusicOnChannelPaused = function (runtimeScene, channel) {
        const music = runtimeScene.getSoundManager().getMusicOnChannel(channel);
        return music ? music.paused() : false;
      };
      export const isMusicOnChannelStopped = function (runtimeScene, channel) {
        const music = runtimeScene.getSoundManager().getMusicOnChannel(channel);
        return music ? music.stopped() : true;
      };
      export const getMusicOnChannelVolume = function (runtimeScene, channel) {
        const music = runtimeScene.getSoundManager().getMusicOnChannel(channel);
        return music ? music.volume() * 100 : 100;
      };
      export const setMusicOnChannelVolume = function (
        runtimeScene,
        channel,
        volume
      ) {
        const music = runtimeScene.getSoundManager().getMusicOnChannel(channel);
        music && music.volume(volume / 100);
      };
      export const getMusicOnChannelPlayingOffset = function (
        runtimeScene,
        channel
      ) {
        const music = runtimeScene.getSoundManager().getMusicOnChannel(channel);
        return music ? music.seek() : 0;
      };
      export const setMusicOnChannelPlayingOffset = function (
        runtimeScene,
        channel,
        playingOffset
      ) {
        const music = runtimeScene.getSoundManager().getMusicOnChannel(channel);
        music && music.seek(playingOffset);
      };
      export const getMusicOnChannelPitch = function (runtimeScene, channel) {
        const music = runtimeScene.getSoundManager().getMusicOnChannel(channel);
        return music ? music.getRate() : 1;
      };
      export const setMusicOnChannelPitch = function (
        runtimeScene,
        channel,
        pitch
      ) {
        const music = runtimeScene.getSoundManager().getMusicOnChannel(channel);
        music && music.setRate(pitch);
      };
    }
  }
}
