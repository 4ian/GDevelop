/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  export namespace evtTools {
    export namespace sound {
      export const getGlobalVolume = function (
        runtimeScene: gdjs.RuntimeScene
      ) {
        return runtimeScene.getSoundManager().getGlobalVolume();
      };

      export const setGlobalVolume = function (
        runtimeScene: gdjs.RuntimeScene,
        globalVolume: float
      ) {
        runtimeScene.getSoundManager().setGlobalVolume(globalVolume);
      };

      export const unloadAllAudio = function (runtimeScene: gdjs.RuntimeScene) {
        runtimeScene.getSoundManager().unloadAll();
      };

      // Sounds:
      export const playSound = function (
        runtimeScene: gdjs.RuntimeScene,
        soundFile: string,
        loop: boolean,
        volume: float,
        pitch: float
      ) {
        runtimeScene
          .getSoundManager()
          .playSound(soundFile, loop, volume, pitch);
      };

      export const playSoundOnChannel = function (
        runtimeScene: gdjs.RuntimeScene,
        soundFile: string,
        channel: integer,
        loop: boolean,
        volume: float,
        pitch: float
      ) {
        runtimeScene
          .getSoundManager()
          .playSoundOnChannel(soundFile, channel, loop, volume, pitch);
      };

      export const stopSoundOnChannel = function (
        runtimeScene: gdjs.RuntimeScene,
        channel: integer
      ) {
        const sound = runtimeScene.getSoundManager().getSoundOnChannel(channel);
        sound && sound.stop();
      };

      export const pauseSoundOnChannel = function (
        runtimeScene: gdjs.RuntimeScene,
        channel: integer
      ) {
        const sound = runtimeScene.getSoundManager().getSoundOnChannel(channel);
        sound && sound.pause();
      };

      export const continueSoundOnChannel = function (
        runtimeScene: gdjs.RuntimeScene,
        channel: integer
      ) {
        const sound = runtimeScene.getSoundManager().getSoundOnChannel(channel);
        if (sound && !sound.playing()) {
          sound.play();
        }
      };

      export const isSoundOnChannelPlaying = function (
        runtimeScene: gdjs.RuntimeScene,
        channel: integer
      ) {
        const sound = runtimeScene.getSoundManager().getSoundOnChannel(channel);
        return sound ? sound.playing() : false;
      };

      export const isSoundOnChannelPaused = function (
        runtimeScene: gdjs.RuntimeScene,
        channel: integer
      ) {
        const sound = runtimeScene.getSoundManager().getSoundOnChannel(channel);
        return sound ? sound.paused() : false;
      };

      export const isSoundOnChannelStopped = function (
        runtimeScene: gdjs.RuntimeScene,
        channel: integer
      ) {
        const sound = runtimeScene.getSoundManager().getSoundOnChannel(channel);
        return sound ? sound.stopped() : true;
      };

      export const getSoundOnChannelVolume = function (
        runtimeScene: gdjs.RuntimeScene,
        channel: integer
      ) {
        const sound = runtimeScene.getSoundManager().getSoundOnChannel(channel);
        return sound ? sound.getVolume() * 100 : 100;
      };

      export const setSoundOnChannelVolume = function (
        runtimeScene: gdjs.RuntimeScene,
        channel: integer,
        volume: float
      ) {
        const sound = runtimeScene.getSoundManager().getSoundOnChannel(channel);
        sound && sound.setVolume(volume / 100);
      };

      export const getSoundOnChannelPlayingOffset = function (
        runtimeScene: gdjs.RuntimeScene,
        channel: integer
      ) {
        const sound = runtimeScene.getSoundManager().getSoundOnChannel(channel);
        return sound ? sound.getSeek() : 0;
      };

      export const setSoundOnChannelPlayingOffset = function (
        runtimeScene: gdjs.RuntimeScene,
        channel: integer,
        playingOffset: float
      ) {
        const sound = runtimeScene.getSoundManager().getSoundOnChannel(channel);
        sound && sound.setSeek(playingOffset);
      };

      export const getSoundOnChannelPitch = function (
        runtimeScene: gdjs.RuntimeScene,
        channel: integer
      ) {
        const sound = runtimeScene.getSoundManager().getSoundOnChannel(channel);
        return sound ? sound.getRate() : 1;
      };

      export const setSoundOnChannelPitch = function (
        runtimeScene: gdjs.RuntimeScene,
        channel: integer,
        pitch: float
      ) {
        const sound = runtimeScene.getSoundManager().getSoundOnChannel(channel);
        sound && sound.setRate(pitch);
      };

      export const preloadSound = (
        runtimeScene: gdjs.RuntimeScene,
        soundFile: string
      ) =>
        runtimeScene
          .getSoundManager()
          .loadAudio(soundFile, /* isMusic= */ false);

      export const unloadSound = (
        runtimeScene: gdjs.RuntimeScene,
        soundFile: string
      ) =>
        runtimeScene
          .getSoundManager()
          .unloadAudio(soundFile, /* isMusic= */ false);

      // Musics:
      export const playMusic = function (
        runtimeScene: gdjs.RuntimeScene,
        soundFile: string,
        loop: boolean,
        volume: float,
        pitch: float
      ) {
        runtimeScene
          .getSoundManager()
          .playMusic(soundFile, loop, volume, pitch);
      };

      export const playMusicOnChannel = function (
        runtimeScene: gdjs.RuntimeScene,
        soundFile: string,
        channel: integer,
        loop: boolean,
        volume: float,
        pitch: float
      ) {
        runtimeScene
          .getSoundManager()
          .playMusicOnChannel(soundFile, channel, loop, volume, pitch);
      };

      export const stopMusicOnChannel = function (
        runtimeScene: gdjs.RuntimeScene,
        channel: integer
      ) {
        const music = runtimeScene.getSoundManager().getMusicOnChannel(channel);
        music && music.stop();
      };

      export const pauseMusicOnChannel = function (
        runtimeScene: gdjs.RuntimeScene,
        channel: integer
      ) {
        const music = runtimeScene.getSoundManager().getMusicOnChannel(channel);
        music && music.pause();
      };

      export const continueMusicOnChannel = function (
        runtimeScene: gdjs.RuntimeScene,
        channel: integer
      ) {
        const music = runtimeScene.getSoundManager().getMusicOnChannel(channel);
        if (music && !music.playing()) {
          music.play();
        }
      };

      export const isMusicOnChannelPlaying = function (
        runtimeScene: gdjs.RuntimeScene,
        channel: integer
      ) {
        const music = runtimeScene.getSoundManager().getMusicOnChannel(channel);
        return music ? music.playing() : false;
      };

      export const isMusicOnChannelPaused = function (
        runtimeScene: gdjs.RuntimeScene,
        channel: integer
      ) {
        const music = runtimeScene.getSoundManager().getMusicOnChannel(channel);
        return music ? music.paused() : false;
      };

      export const isMusicOnChannelStopped = function (
        runtimeScene: gdjs.RuntimeScene,
        channel: integer
      ) {
        const music = runtimeScene.getSoundManager().getMusicOnChannel(channel);
        return music ? music.stopped() : true;
      };

      export const getMusicOnChannelVolume = function (
        runtimeScene: gdjs.RuntimeScene,
        channel: integer
      ) {
        const music = runtimeScene.getSoundManager().getMusicOnChannel(channel);
        return music ? music.getVolume() * 100 : 100;
      };

      export const setMusicOnChannelVolume = function (
        runtimeScene: gdjs.RuntimeScene,
        channel: integer,
        volume: float
      ) {
        const music = runtimeScene.getSoundManager().getMusicOnChannel(channel);
        music && music.setVolume(volume / 100);
      };

      export const getMusicOnChannelPlayingOffset = function (
        runtimeScene: gdjs.RuntimeScene,
        channel: integer
      ) {
        const music = runtimeScene.getSoundManager().getMusicOnChannel(channel);
        return music ? music.getSeek() : 0;
      };

      export const setMusicOnChannelPlayingOffset = function (
        runtimeScene: gdjs.RuntimeScene,
        channel: integer,
        playingOffset: float
      ) {
        const music = runtimeScene.getSoundManager().getMusicOnChannel(channel);
        music && music.setSeek(playingOffset);
      };

      export const getMusicOnChannelPitch = function (
        runtimeScene: gdjs.RuntimeScene,
        channel: integer
      ) {
        const music = runtimeScene.getSoundManager().getMusicOnChannel(channel);
        return music ? music.getRate() : 1;
      };

      export const setMusicOnChannelPitch = function (
        runtimeScene: gdjs.RuntimeScene,
        channel: integer,
        pitch: float
      ) {
        const music = runtimeScene.getSoundManager().getMusicOnChannel(channel);
        music && music.setRate(pitch);
      };

      export const preloadMusic = (
        runtimeScene: gdjs.RuntimeScene,
        soundFile: string
      ) =>
        runtimeScene
          .getSoundManager()
          .loadAudio(soundFile, /* isMusic= */ true);

      export const unloadMusic = (
        runtimeScene: gdjs.RuntimeScene,
        soundFile: string
      ) =>
        runtimeScene
          .getSoundManager()
          .unloadAudio(soundFile, /* isMusic= */ true);
    }
  }
}
