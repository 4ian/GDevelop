/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  export namespace evtTools {
    export namespace sound {
      const logger = new gdjs.Logger('Audio events');

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
        else {
          logger.error(`Cannot stop non-existing sound on channel ${channel}.`);
        }
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
        else {
          logger.error(
            `Cannot pause non-existing sound on channel ${channel}.`
          );
        }
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
        } else {
          logger.error(
            `Cannot continue playing non-existing sound on channel ${channel}.`
          );
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
          logger.error(
            `Cannot check if non-existing sound on channel ${channel} is paused.`
          );
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
          logger.error(
            `Cannot check if non-existing sound on channel ${channel} is stopped.`
          );
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
          logger.error(
            `Cannot get the volume of a non-existing sound on channel ${channel}.`
          );
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
        else {
          logger.error(
            `Cannot set the volume of a non-existing sound on channel ${channel}.`
          );
        }
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
          logger.error(
            `Cannot get the playing offset of a non-existing sound on channel ${channel}.`
          );
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
        else {
          logger.error(
            `Cannot set the playing offset of a non-existing sound on channel ${channel}.`
          );
        }
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
          logger.error(
            `Cannot get the pitch of a non-existing sound on channel ${channel}.`
          );
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
        else {
          logger.error(
            `Cannot get the pitch of a non-existing sound on channel ${channel}.`
          );
        }
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
        else {
          logger.error(
            `Cannot stop a non-existing music on channel ${channel}.`
          );
        }
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
        else {
          logger.error(
            `Cannot pause a non-existing music on channel ${channel}.`
          );
        }
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
        } else {
          logger.error(
            `Cannot stop a non-existing music on channel ${channel}.`
          );
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
          logger.error(
            `Cannot check if non-existing music on channel ${channel} is paused.`
          );
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
          logger.error(
            `Cannot check if non-existing music on channel ${channel} is stopped.`
          );
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
          logger.error(
            `Cannot get the volume of a non-existing music on channel ${channel}.`
          );
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
        else {
          logger.error(
            `Cannot set the volume of a non-existing music on channel ${channel}.`
          );
        }
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
          logger.error(
            `Cannot get the playing offset of a non-existing music on channel ${channel}.`
          );
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
        else {
          logger.error(
            `Cannot set the playing offset of a non-existing music on channel ${channel}.`
          );
        }
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
          logger.error(
            `Cannot get the pitch of a non-existing music on channel ${channel}.`
          );
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
        else {
          logger.error(
            `Cannot get the pitch of a non-existing music on channel ${channel}.`
          );
        }
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
        } else {
          logger.error(
            `Cannot fade the volume of a non-existing sound on channel ${channel}.`
          );
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
        } else {
          logger.error(
            `Cannot fade the volume of a non-existing music on channel ${channel}.`
          );
        }
      };
    }
  }
}
