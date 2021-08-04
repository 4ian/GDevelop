import type { RuntimeScene } from '..';

export const getGlobalVolume = function (runtimeScene: RuntimeScene) {
  return runtimeScene.getSoundManager().getGlobalVolume();
};

export const setGlobalVolume = function (
  runtimeScene: RuntimeScene,
  globalVolume: float
) {
  runtimeScene.getSoundManager().setGlobalVolume(globalVolume);
};

export const unloadAllAudio = function (runtimeScene: RuntimeScene) {
  runtimeScene.getSoundManager().unloadAll();
};

// Sounds:
export const playSound = function (
  runtimeScene: RuntimeScene,
  soundFile: string,
  loop: boolean,
  volume: float,
  pitch: float
) {
  runtimeScene.getSoundManager().playSound(soundFile, loop, volume, pitch);
};

export const playSoundOnChannel = function (
  runtimeScene: RuntimeScene,
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
  runtimeScene: RuntimeScene,
  channel: integer
) {
  const sound = runtimeScene.getSoundManager().getSoundOnChannel(channel);
  sound && sound.stop();
};

export const pauseSoundOnChannel = function (
  runtimeScene: RuntimeScene,
  channel: integer
) {
  const sound = runtimeScene.getSoundManager().getSoundOnChannel(channel);
  sound && sound.pause();
};

export const continueSoundOnChannel = function (
  runtimeScene: RuntimeScene,
  channel: integer
) {
  const sound = runtimeScene.getSoundManager().getSoundOnChannel(channel);
  if (sound && !sound.playing()) {
    sound.play();
  }
};

export const isSoundOnChannelPlaying = function (
  runtimeScene: RuntimeScene,
  channel: integer
) {
  const sound = runtimeScene.getSoundManager().getSoundOnChannel(channel);
  return sound ? sound.playing() : false;
};

export const isSoundOnChannelPaused = function (
  runtimeScene: RuntimeScene,
  channel: integer
) {
  const sound = runtimeScene.getSoundManager().getSoundOnChannel(channel);
  return sound ? sound.paused() : false;
};

export const isSoundOnChannelStopped = function (
  runtimeScene: RuntimeScene,
  channel: integer
) {
  const sound = runtimeScene.getSoundManager().getSoundOnChannel(channel);
  return sound ? sound.stopped() : true;
};

export const getSoundOnChannelVolume = function (
  runtimeScene: RuntimeScene,
  channel: integer
) {
  const sound = runtimeScene.getSoundManager().getSoundOnChannel(channel);
  return sound ? sound.getVolume() * 100 : 100;
};

export const setSoundOnChannelVolume = function (
  runtimeScene: RuntimeScene,
  channel: integer,
  volume: float
) {
  const sound = runtimeScene.getSoundManager().getSoundOnChannel(channel);
  sound && sound.setVolume(volume / 100);
};

export const getSoundOnChannelPlayingOffset = function (
  runtimeScene: RuntimeScene,
  channel: integer
) {
  const sound = runtimeScene.getSoundManager().getSoundOnChannel(channel);
  return sound ? sound.getSeek() : 0;
};

export const setSoundOnChannelPlayingOffset = function (
  runtimeScene: RuntimeScene,
  channel: integer,
  playingOffset: float
) {
  const sound = runtimeScene.getSoundManager().getSoundOnChannel(channel);
  sound && sound.setSeek(playingOffset);
};

export const getSoundOnChannelPitch = function (
  runtimeScene: RuntimeScene,
  channel: integer
) {
  const sound = runtimeScene.getSoundManager().getSoundOnChannel(channel);
  return sound ? sound.getRate() : 1;
};

export const setSoundOnChannelPitch = function (
  runtimeScene: RuntimeScene,
  channel: integer,
  pitch: float
) {
  const sound = runtimeScene.getSoundManager().getSoundOnChannel(channel);
  sound && sound.setRate(pitch);
};

export const preloadSound = (runtimeScene: RuntimeScene, soundFile: string) =>
  runtimeScene.getSoundManager().loadAudio(soundFile, /* isMusic= */ false);

export const unloadSound = (runtimeScene: RuntimeScene, soundFile: string) =>
  runtimeScene.getSoundManager().unloadAudio(soundFile, /* isMusic= */ false);

// Musics:
export const playMusic = function (
  runtimeScene: RuntimeScene,
  soundFile: string,
  loop: boolean,
  volume: float,
  pitch: float
) {
  runtimeScene.getSoundManager().playMusic(soundFile, loop, volume, pitch);
};

export const playMusicOnChannel = function (
  runtimeScene: RuntimeScene,
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
  runtimeScene: RuntimeScene,
  channel: integer
) {
  const music = runtimeScene.getSoundManager().getMusicOnChannel(channel);
  music && music.stop();
};

export const pauseMusicOnChannel = function (
  runtimeScene: RuntimeScene,
  channel: integer
) {
  const music = runtimeScene.getSoundManager().getMusicOnChannel(channel);
  music && music.pause();
};

export const continueMusicOnChannel = function (
  runtimeScene: RuntimeScene,
  channel: integer
) {
  const music = runtimeScene.getSoundManager().getMusicOnChannel(channel);
  if (music && !music.playing()) {
    music.play();
  }
};

export const isMusicOnChannelPlaying = function (
  runtimeScene: RuntimeScene,
  channel: integer
) {
  const music = runtimeScene.getSoundManager().getMusicOnChannel(channel);
  return music ? music.playing() : false;
};

export const isMusicOnChannelPaused = function (
  runtimeScene: RuntimeScene,
  channel: integer
) {
  const music = runtimeScene.getSoundManager().getMusicOnChannel(channel);
  return music ? music.paused() : false;
};

export const isMusicOnChannelStopped = function (
  runtimeScene: RuntimeScene,
  channel: integer
) {
  const music = runtimeScene.getSoundManager().getMusicOnChannel(channel);
  return music ? music.stopped() : true;
};

export const getMusicOnChannelVolume = function (
  runtimeScene: RuntimeScene,
  channel: integer
) {
  const music = runtimeScene.getSoundManager().getMusicOnChannel(channel);
  return music ? music.getVolume() * 100 : 100;
};

export const setMusicOnChannelVolume = function (
  runtimeScene: RuntimeScene,
  channel: integer,
  volume: float
) {
  const music = runtimeScene.getSoundManager().getMusicOnChannel(channel);
  music && music.setVolume(volume / 100);
};

export const getMusicOnChannelPlayingOffset = function (
  runtimeScene: RuntimeScene,
  channel: integer
) {
  const music = runtimeScene.getSoundManager().getMusicOnChannel(channel);
  return music ? music.getSeek() : 0;
};

export const setMusicOnChannelPlayingOffset = function (
  runtimeScene: RuntimeScene,
  channel: integer,
  playingOffset: float
) {
  const music = runtimeScene.getSoundManager().getMusicOnChannel(channel);
  music && music.setSeek(playingOffset);
};

export const getMusicOnChannelPitch = function (
  runtimeScene: RuntimeScene,
  channel: integer
) {
  const music = runtimeScene.getSoundManager().getMusicOnChannel(channel);
  return music ? music.getRate() : 1;
};

export const setMusicOnChannelPitch = function (
  runtimeScene: RuntimeScene,
  channel: integer,
  pitch: float
) {
  const music = runtimeScene.getSoundManager().getMusicOnChannel(channel);
  music && music.setRate(pitch);
};

export const preloadMusic = (runtimeScene: RuntimeScene, soundFile: string) =>
  runtimeScene.getSoundManager().loadAudio(soundFile, /* isMusic= */ true);

export const unloadMusic = (runtimeScene: RuntimeScene, soundFile: string) =>
  runtimeScene.getSoundManager().unloadAudio(soundFile, /* isMusic= */ true);
