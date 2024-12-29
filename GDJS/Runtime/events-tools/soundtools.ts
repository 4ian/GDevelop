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
      ): float {
        return runtimeScene.getScene().getSoundManager().getGlobalVolume();
      };

      export const setGlobalVolume = function (
        runtimeScene: gdjs.RuntimeScene,
        globalVolume: float
      ): void {
        runtimeScene.getScene().getSoundManager().setGlobalVolume(globalVolume);
      };

      export const unloadAllAudio = function (
        runtimeScene: gdjs.RuntimeScene
      ): void {
        runtimeScene.getScene().getSoundManager().unloadAll();
      };

      // Sounds:
      export const playSound = function (
        runtimeScene: gdjs.RuntimeScene,
        soundFile: string,
        loop: boolean,
        volume: float,
        pitch: float
      ): void {
        runtimeScene
          .getScene()
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
      ): void {
        runtimeScene
          .getScene()
          .getSoundManager()
          .playSoundOnChannel(soundFile, channel, loop, volume, pitch);
      };

      export const stopSoundOnChannel = function (
        runtimeScene: gdjs.RuntimeScene,
        channel: integer
      ): void {
        const sound = runtimeScene
          .getScene()
          .getSoundManager()
          .getSoundOnChannel(channel);
        if (sound) sound.stop();
      };

      export const pauseSoundOnChannel = function (
        runtimeScene: gdjs.RuntimeScene,
        channel: integer
      ): void {
        const sound = runtimeScene
          .getScene()
          .getSoundManager()
          .getSoundOnChannel(channel);
        if (sound) sound.pause();
      };

      export const continueSoundOnChannel = function (
        runtimeScene: gdjs.RuntimeScene,
        channel: integer
      ): void {
        const sound = runtimeScene
          .getScene()
          .getSoundManager()
          .getSoundOnChannel(channel);
        if (sound) {
          if (!sound.playing()) sound.play();
        }
      };

      export const isSoundOnChannelPlaying = function (
        runtimeScene: gdjs.RuntimeScene,
        channel: integer
      ): boolean {
        const sound = runtimeScene
          .getScene()
          .getSoundManager()
          .getSoundOnChannel(channel);
        return sound ? sound.playing() : false;
      };

      export const isSoundOnChannelPaused = function (
        runtimeScene: gdjs.RuntimeScene,
        channel: integer
      ): boolean {
        const sound = runtimeScene
          .getScene()
          .getSoundManager()
          .getSoundOnChannel(channel);
        if (sound) return sound.paused();
        else {
          return false;
        }
      };

      export const isSoundOnChannelStopped = function (
        runtimeScene: gdjs.RuntimeScene,
        channel: integer
      ): boolean {
        const sound = runtimeScene
          .getScene()
          .getSoundManager()
          .getSoundOnChannel(channel);
        if (sound) return sound.stopped();
        else {
          return true;
        }
      };

      export const getSoundOnChannelVolume = function (
        runtimeScene: gdjs.RuntimeScene,
        channel: integer
      ): float {
        const sound = runtimeScene
          .getScene()
          .getSoundManager()
          .getSoundOnChannel(channel);
        if (sound) return sound.getVolume() * 100;
        else {
          return 100;
        }
      };

      export const setSoundOnChannelVolume = function (
        runtimeScene: gdjs.RuntimeScene,
        channel: integer,
        volume: float
      ): void {
        const sound = runtimeScene
          .getScene()
          .getSoundManager()
          .getSoundOnChannel(channel);
        if (sound) sound.setVolume(volume / 100);
      };

      export const getSoundOnChannelPlayingOffset = function (
        runtimeScene: gdjs.RuntimeScene,
        channel: integer
      ): float {
        const sound = runtimeScene
          .getScene()
          .getSoundManager()
          .getSoundOnChannel(channel);
        if (sound) return sound.getSeek();
        else {
          return 0;
        }
      };

      export const setSoundOnChannelPlayingOffset = function (
        runtimeScene: gdjs.RuntimeScene,
        channel: integer,
        playingOffset: float
      ): void {
        const sound = runtimeScene
          .getScene()
          .getSoundManager()
          .getSoundOnChannel(channel);
        if (sound) sound.setSeek(playingOffset);
      };

      export const getSoundOnChannelPitch = function (
        runtimeScene: gdjs.RuntimeScene,
        channel: integer
      ): float {
        const sound = runtimeScene
          .getScene()
          .getSoundManager()
          .getSoundOnChannel(channel);
        if (sound) return sound.getRate();
        else {
          return 1;
        }
      };

      export const setSoundOnChannelPitch = function (
        runtimeScene: gdjs.RuntimeScene,
        channel: integer,
        pitch: float
      ): void {
        const sound = runtimeScene
          .getScene()
          .getSoundManager()
          .getSoundOnChannel(channel);
        if (sound) sound.setRate(pitch);
      };

      export const preloadSound = (
        runtimeScene: gdjs.RuntimeScene,
        soundFile: string
      ) =>
        runtimeScene
          .getScene()
          .getSoundManager()
          .loadAudio(soundFile, /* isMusic= */ false);

      export const unloadSound = (
        runtimeScene: gdjs.RuntimeScene,
        soundFile: string
      ) =>
        runtimeScene
          .getScene()
          .getSoundManager()
          .unloadAudio(soundFile, /* isMusic= */ false);

      // Musics:
      export const playMusic = function (
        runtimeScene: gdjs.RuntimeScene,
        soundFile: string,
        loop: boolean,
        volume: float,
        pitch: float
      ): void {
        runtimeScene
          .getScene()
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
      ): void {
        runtimeScene
          .getScene()
          .getSoundManager()
          .playMusicOnChannel(soundFile, channel, loop, volume, pitch);
      };

      export const stopMusicOnChannel = function (
        runtimeScene: gdjs.RuntimeScene,
        channel: integer
      ): void {
        const music = runtimeScene
          .getScene()
          .getSoundManager()
          .getMusicOnChannel(channel);
        if (music) music.stop();
      };

      export const pauseMusicOnChannel = function (
        runtimeScene: gdjs.RuntimeScene,
        channel: integer
      ): void {
        const music = runtimeScene
          .getScene()
          .getSoundManager()
          .getMusicOnChannel(channel);
        if (music) music.pause();
      };

      export const continueMusicOnChannel = function (
        runtimeScene: gdjs.RuntimeScene,
        channel: integer
      ): void {
        const music = runtimeScene
          .getScene()
          .getSoundManager()
          .getMusicOnChannel(channel);
        if (music) {
          if (!music.playing()) music.play();
        }
      };

      export const isMusicOnChannelPlaying = function (
        runtimeScene: gdjs.RuntimeScene,
        channel: integer
      ): boolean {
        const music = runtimeScene
          .getScene()
          .getSoundManager()
          .getMusicOnChannel(channel);
        return music ? music.playing() : false;
      };

      export const isMusicOnChannelPaused = function (
        runtimeScene: gdjs.RuntimeScene,
        channel: integer
      ): boolean {
        const music = runtimeScene
          .getScene()
          .getSoundManager()
          .getMusicOnChannel(channel);
        if (music) return music.paused();
        else {
          return false;
        }
      };

      export const isMusicOnChannelStopped = function (
        runtimeScene: gdjs.RuntimeScene,
        channel: integer
      ): boolean {
        const music = runtimeScene
          .getScene()
          .getSoundManager()
          .getMusicOnChannel(channel);
        if (music) return music.stopped();
        else {
          return true;
        }
      };

      export const getMusicOnChannelVolume = function (
        runtimeScene: gdjs.RuntimeScene,
        channel: integer
      ): float {
        const music = runtimeScene
          .getScene()
          .getSoundManager()
          .getMusicOnChannel(channel);
        if (music) return music.getVolume() * 100;
        else {
          return 100;
        }
      };

      export const setMusicOnChannelVolume = function (
        runtimeScene: gdjs.RuntimeScene,
        channel: integer,
        volume: float
      ): void {
        const music = runtimeScene
          .getScene()
          .getSoundManager()
          .getMusicOnChannel(channel);
        if (music) music.setVolume(volume / 100);
      };

      export const getMusicOnChannelPlayingOffset = function (
        runtimeScene: gdjs.RuntimeScene,
        channel: integer
      ): float {
        const music = runtimeScene
          .getScene()
          .getSoundManager()
          .getMusicOnChannel(channel);
        if (music) return music.getSeek();
        else {
          return 0;
        }
      };

      export const setMusicOnChannelPlayingOffset = function (
        runtimeScene: gdjs.RuntimeScene,
        channel: integer,
        playingOffset: float
      ): void {
        const music = runtimeScene
          .getScene()
          .getSoundManager()
          .getMusicOnChannel(channel);
        if (music) music.setSeek(playingOffset);
      };

      export const getMusicOnChannelPitch = function (
        runtimeScene: gdjs.RuntimeScene,
        channel: integer
      ): float {
        const music = runtimeScene
          .getScene()
          .getSoundManager()
          .getMusicOnChannel(channel);
        if (music) return music.getRate();
        else {
          return 1;
        }
      };

      export const setMusicOnChannelPitch = function (
        runtimeScene: gdjs.RuntimeScene,
        channel: integer,
        pitch: float
      ): void {
        const music = runtimeScene
          .getScene()
          .getSoundManager()
          .getMusicOnChannel(channel);
        if (music) music.setRate(pitch);
      };

      export const preloadMusic = (
        runtimeScene: gdjs.RuntimeScene,
        soundFile: string
      ) =>
        runtimeScene
          .getScene()
          .getSoundManager()
          .loadAudio(soundFile, /* isMusic= */ true);

      export const unloadMusic = (
        runtimeScene: gdjs.RuntimeScene,
        soundFile: string
      ) =>
        runtimeScene
          .getScene()
          .getSoundManager()
          .unloadAudio(soundFile, /* isMusic= */ true);

      export const fadeSoundVolume = (
        runtimeScene: gdjs.RuntimeScene,
        channel: integer,
        toVolume: float,
        timeOfFade: float /* in seconds */
      ) => {
        const sound = runtimeScene
          .getScene()
          .getSoundManager()
          .getSoundOnChannel(channel);
        if (sound) {
          sound.fade(sound.getVolume(), toVolume / 100, timeOfFade * 1000);
        }
      };
      export const fadeMusicVolume = (
        runtimeScene: gdjs.RuntimeScene,
        channel: integer,
        toVolume: float,
        timeOfFade: float /* in seconds */
      ) => {
        const music = runtimeScene
          .getScene()
          .getSoundManager()
          .getMusicOnChannel(channel);
        if (music) {
          music.fade(music.getVolume(), toVolume / 100, timeOfFade * 1000);
        }
      };
    }
  }
}
