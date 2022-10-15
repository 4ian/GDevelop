/*
 * GDevelop JS Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "AudioExtension.h"
#include "GDCore/CommonTools.h"
#include "GDCore/Events/CodeGeneration/EventsCodeGenerator.h"
#include "GDCore/Extensions/Builtin/AllBuiltinExtensions.h"
#include "GDCore/IDE/Project/ArbitraryResourceWorker.h"
#include "GDCore/Tools/Localization.h"

namespace gdjs {

AudioExtension::AudioExtension() {
  gd::BuiltinExtensionsImplementer::ImplementsAudioExtension(*this);

  GetAllActions()["PlaySound"].SetFunctionName("gdjs.evtTools.sound.playSound");
  GetAllActions()["PlaySoundCanal"].SetFunctionName(
      "gdjs.evtTools.sound.playSoundOnChannel");
  GetAllActions()["PlayMusic"].SetFunctionName("gdjs.evtTools.sound.playMusic");
  GetAllActions()["PlayMusicCanal"].SetFunctionName(
      "gdjs.evtTools.sound.playMusicOnChannel");
  GetAllActions()["StopSoundCanal"].SetFunctionName(
      "gdjs.evtTools.sound.stopSoundOnChannel");
  GetAllActions()["PauseSoundCanal"].SetFunctionName(
      "gdjs.evtTools.sound.pauseSoundOnChannel");
  GetAllActions()["RePlaySoundCanal"].SetFunctionName(
      "gdjs.evtTools.sound.continueSoundOnChannel");
  GetAllActions()["StopMusicCanal"].SetFunctionName(
      "gdjs.evtTools.sound.stopMusicOnChannel");
  GetAllActions()["PauseMusicCanal"].SetFunctionName(
      "gdjs.evtTools.sound.pauseMusicOnChannel");
  GetAllActions()["RePlayMusicCanal"].SetFunctionName(
      "gdjs.evtTools.sound.continueMusicOnChannel");
        GetAllActions()["FadeMusicVolume"].SetFunctionName(
      "gdjs.evtTools.sound.fadeMusicVolume");

  GetAllActions()["PreloadMusic"].SetFunctionName(
      "gdjs.evtTools.sound.preloadMusic");
  GetAllActions()["PreloadSound"].SetFunctionName(
      "gdjs.evtTools.sound.preloadSound");
  GetAllActions()["UnloadMusic"].SetFunctionName(
      "gdjs.evtTools.sound.unloadMusic");
  GetAllActions()["UnloadSound"].SetFunctionName(
      "gdjs.evtTools.sound.unloadSound");
  GetAllActions()["UnloadAllAudio"].SetFunctionName(
      "gdjs.evtTools.sound.unloadAllAudio");
  GetAllActions()["FadeSoundVolume"].SetFunctionName(
      "gdjs.evtTools.sound.fadeSoundVolume");
      

  GetAllConditions()["MusicPlaying"].SetFunctionName(
      "gdjs.evtTools.sound.isMusicOnChannelPlaying");
  GetAllConditions()["MusicPaused"].SetFunctionName(
      "gdjs.evtTools.sound.isMusicOnChannelPaused");
  GetAllConditions()["MusicStopped"].SetFunctionName(
      "gdjs.evtTools.sound.isMusicOnChannelStopped");
  GetAllConditions()["SoundPlaying"].SetFunctionName(
      "gdjs.evtTools.sound.isSoundOnChannelPlaying");
  GetAllConditions()["SoundPaused"].SetFunctionName(
      "gdjs.evtTools.sound.isSoundOnChannelPaused");
  GetAllConditions()["SoundStopped"].SetFunctionName(
      "gdjs.evtTools.sound.isSoundOnChannelStopped");

  GetAllActions()["ModGlobalVolume"]
      .SetFunctionName("gdjs.evtTools.sound.setGlobalVolume")
      .SetGetter("gdjs.evtTools.sound.getGlobalVolume");
  GetAllConditions()["GlobalVolume"].SetFunctionName(
      "gdjs.evtTools.sound.getGlobalVolume");
  GetAllExpressions()["GlobalVolume"].SetFunctionName(
      "gdjs.evtTools.sound.getGlobalVolume");

  GetAllActions()["ModVolumeSoundCanal"]
      .SetFunctionName("gdjs.evtTools.sound.setSoundOnChannelVolume")
      .SetGetter("gdjs.evtTools.sound.getSoundOnChannelVolume");
  GetAllActions()["ModVolumeMusicCanal"]
      .SetFunctionName("gdjs.evtTools.sound.setMusicOnChannelVolume")
      .SetGetter("gdjs.evtTools.sound.getMusicOnChannelVolume");
  GetAllConditions()["SoundCanalVolume"].SetFunctionName(
      "gdjs.evtTools.sound.getSoundOnChannelVolume");
  GetAllConditions()["MusicCanalVolume"].SetFunctionName(
      "gdjs.evtTools.sound.getMusicOnChannelVolume");

  GetAllActions()["ModPlayingOffsetSoundChannel"]
      .SetFunctionName("gdjs.evtTools.sound.setSoundOnChannelPlayingOffset")
      .SetGetter("gdjs.evtTools.sound.getSoundOnChannelPlayingOffset");
  GetAllActions()["ModPlayingOffsetMusicChannel"]
      .SetFunctionName("gdjs.evtTools.sound.setMusicOnChannelPlayingOffset")
      .SetGetter("gdjs.evtTools.sound.getMusicOnChannelPlayingOffset");
  GetAllConditions()["SoundChannelPlayingOffset"].SetFunctionName(
      "gdjs.evtTools.sound.getSoundOnChannelPlayingOffset");
  GetAllConditions()["MusicChannelPlayingOffset"].SetFunctionName(
      "gdjs.evtTools.sound.getMusicOnChannelPlayingOffset");

  GetAllActions()["ModPitchSoundChannel"]
      .SetFunctionName("gdjs.evtTools.sound.setSoundOnChannelPitch")
      .SetGetter("gdjs.evtTools.sound.getSoundOnChannelPitch");
  GetAllActions()["ModPitchMusicChannel"]
      .SetFunctionName("gdjs.evtTools.sound.setMusicOnChannelPitch")
      .SetGetter("gdjs.evtTools.sound.getMusicOnChannelPitch");
  GetAllConditions()["SoundChannelPitch"].SetFunctionName(
      "gdjs.evtTools.sound.getSoundOnChannelPitch");
  GetAllConditions()["MusicChannelPitch"].SetFunctionName(
      "gdjs.evtTools.sound.getMusicOnChannelPitch");

  GetAllExpressions()["SoundChannelVolume"].SetFunctionName(
      "gdjs.evtTools.sound.getSoundOnChannelVolume");
  GetAllExpressions()["MusicChannelVolume"].SetFunctionName(
      "gdjs.evtTools.sound.getMusicOnChannelVolume");

  GetAllExpressions()["SoundChannelPlayingOffset"].SetFunctionName(
      "gdjs.evtTools.sound.getSoundOnChannelPlayingOffset");
  GetAllExpressions()["MusicChannelPlayingOffset"].SetFunctionName(
      "gdjs.evtTools.sound.getMusicOnChannelPlayingOffset");

  GetAllExpressions()["SoundChannelPitch"].SetFunctionName(
      "gdjs.evtTools.sound.getSoundOnChannelPitch");
  GetAllExpressions()["MusicChannelPitch"].SetFunctionName(
      "gdjs.evtTools.sound.getMusicOnChannelPitch");

  StripUnimplementedInstructionsAndExpressions();
}

}  // namespace gdjs
