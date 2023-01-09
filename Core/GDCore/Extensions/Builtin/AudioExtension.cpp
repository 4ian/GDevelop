/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "AllBuiltinExtensions.h"
#include "GDCore/Tools/Localization.h"

using namespace std;
namespace gd {

void GD_CORE_API BuiltinExtensionsImplementer::ImplementsAudioExtension(
    gd::PlatformExtension& extension) {
  extension
      .SetExtensionInformation(
          "BuiltinAudio",
          _("Sounds and music"),
          _("GDevelop provides several conditions and actions to play audio "
            "files. They can be either long music or short sound effects."),
          "Florian Rival",
          "Open source (MIT License)")
      .SetExtensionHelpPath("/all-features/audio")
      .SetCategory("Audio");
  extension.AddInstructionOrExpressionGroupMetadata(_("Sounds and music"))
      .SetIcon("res/actions/music24.png");
  extension.AddInstructionOrExpressionGroupMetadata(_("Sounds on channels"))
      .SetIcon("res/actions/son24.png");

  extension
      .AddAction("PlaySoundCanal",
                 _("Play a sound on a channel"),
                 _("Play a sound (small audio file) on a specific channel,\nso "
                   "you'll be able to manipulate it."),
                 _("Play the sound _PARAM1_ on the channel _PARAM2_, vol.: "
                   "_PARAM4_, loop: _PARAM3_"),
                 _("Sounds on channels"),
                 "res/actions/son24.png",
                 "res/actions/son.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("soundfile", _("Audio file (or audio resource name)"))
      .AddParameter("expression", _("Channel identifier"))
      .AddParameter("yesorno", _("Repeat the sound"), "", true)
      .SetDefaultValue("no")
      .AddParameter("expression", _("Volume"), "", true)
      .SetParameterLongDescription(_("From 0 to 100, 100 by default."))
      .SetDefaultValue("100")
      .AddParameter("expression", _("Pitch (speed)"), "", true)
      .SetParameterLongDescription(_("1 by default."))
      .SetDefaultValue("1")
      .MarkAsAdvanced();

  extension
      .AddAction("StopSoundCanal",
                 _("Stop the sound of a channel"),
                 _("Stop the sound on the specified channel."),
                 _("Stop the sound of channel _PARAM1_"),
                 _("Sounds on channels"),
                 "res/actions/son24.png",
                 "res/actions/son.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("expression", _("Channel identifier"))
      .MarkAsAdvanced();

  extension
      .AddAction("PauseSoundCanal",
                 _("Pause the sound of a channel"),
                 _("Pause the sound played on the specified channel."),
                 _("Pause the sound of channel _PARAM1_"),
                 _("Sounds on channels"),
                 "res/actions/son24.png",
                 "res/actions/son.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("expression", _("Channel identifier"))
      .MarkAsAdvanced();

  extension
      .AddAction("RePlaySoundCanal",
                 _("Resume playing a sound on a channel"),
                 _("Resume playing a sound on a channel that was paused."),
                 _("Resume the sound of channel _PARAM1_"),
                 _("Sounds on channels"),
                 "res/actions/son24.png",
                 "res/actions/son.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("expression", _("Channel identifier"))
      .MarkAsAdvanced();

  extension
      .AddAction("PlayMusicCanal",
                 _("Play a music file on a channel"),
                 _("Play a music file on a specific channel,\nso you'll be "
                   "able to interact with it later."),
                 _("Play the music _PARAM1_ on channel _PARAM2_, vol.: "
                   "_PARAM4_, loop: _PARAM3_"),
                 _("Music on channels"),
                 "res/actions/music24.png",
                 "res/actions/music.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("musicfile", _("Audio file (or audio resource name)"))
      .AddParameter("expression", _("Channel identifier"))
      .AddParameter("yesorno", _("Repeat the sound"), "", true)
      .SetDefaultValue("no")
      .AddParameter("expression", _("Volume"), "", true)
      .SetParameterLongDescription(_("From 0 to 100, 100 by default."))
      .SetDefaultValue("100")
      .AddParameter("expression", _("Pitch (speed)"), "", true)
      .SetParameterLongDescription(_("1 by default."))
      .SetDefaultValue("1")
      .MarkAsAdvanced();

  extension
      .AddAction("StopMusicCanal",
                 _("Stop the music on a channel"),
                 _("Stop the music on the specified channel"),
                 _("Stop the music of channel _PARAM1_"),
                 _("Music on channels"),
                 "res/actions/music24.png",
                 "res/actions/music.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("expression", _("Channel identifier"))
      .MarkAsAdvanced();

  extension
      .AddAction("PauseMusicCanal",
                 _("Pause the music of a channel"),
                 _("Pause the music on the specified channel."),
                 _("Pause the music of channel _PARAM1_"),
                 _("Music on channels"),
                 "res/actions/music24.png",
                 "res/actions/music.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("expression", _("Channel identifier"))
      .MarkAsAdvanced();

  extension
      .AddAction("RePlayMusicCanal",
                 _("Resume playing a music on a channel"),
                 _("Resume playing a music on a channel that was paused."),
                 _("Resume the music of channel _PARAM1_"),
                 _("Music on channels"),
                 "res/actions/music24.png",
                 "res/actions/music.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("expression", _("Channel identifier"))
      .MarkAsAdvanced();

  extension
      .AddAction("ModVolumeSoundCanal",
                 _("Volume of the sound on a channel"),
                 _("This action modifies the volume of the sound on the "
                   "specified channel."),
                 _("the volume of the sound on channel _PARAM1_"),
                 _("Sounds on channels"),
                 "res/actions/sonVolume24.png",
                 "res/actions/sonVolume.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("expression", _("Channel identifier"))
      .UseStandardOperatorParameters(
          "number",
          ParameterOptions::MakeNewOptions().SetDescription(
              _("Volume (0-100)")))
      .MarkAsAdvanced();

  extension
      .AddAction("ModVolumeMusicCanal",
                 _("Volume of the music on a channel"),
                 _("This action modifies the volume of the music on the "
                   "specified channel."),
                 _("the volume of the music on channel _PARAM1_"),
                 _("Music on channels"),
                 "res/actions/musicVolume24.png",
                 "res/actions/musicVolume.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("expression", _("Channel identifier"))
      .UseStandardOperatorParameters(
          "number",
          ParameterOptions::MakeNewOptions().SetDescription(
              _("Volume (0-100)")))
      .MarkAsAdvanced();

  extension
      .AddAction("ModGlobalVolume",
                 _("Game global volume"),
                 _("This action modifies the global volume of the game."),
                 _("the global sound level"),
                 "",
                 "res/actions/volume24.png",
                 "res/actions/volume.png")
      .AddCodeOnlyParameter("currentScene", "")
      .UseStandardOperatorParameters(
          "number",
          ParameterOptions::MakeNewOptions().SetDescription(
              _("Volume (0-100)")))
      .MarkAsSimple();

  extension
      .AddAction("ModPitchSoundChannel",
                 _("Pitch of the sound of a channel"),
                 _("This action modifies the pitch (speed) of the sound on a "
                   "channel."),
                 _("the pitch of the sound on channel _PARAM1_"),
                 _("Sounds on channels"),
                 "res/actions/son24.png",
                 "res/actions/son.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("expression", _("Channel identifier"))
      .UseStandardOperatorParameters(
          "number",
          ParameterOptions::MakeNewOptions().SetDescription(
              _("Pitch (1 by default)")))
      .MarkAsAdvanced();

  extension
      .AddAction("ModPitchMusicChannel",
                 _("Pitch of the music on a channel"),
                 _("This action modifies the pitch of the music on the "
                   "specified channel."),
                 _("the pitch of the music on channel _PARAM1_"),
                 _("Music on channels"),
                 "res/actions/music24.png",
                 "res/actions/music.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("expression", _("Channel identifier"))
      .UseStandardOperatorParameters(
          "number",
          ParameterOptions::MakeNewOptions().SetDescription(
              _("Pitch (1 by default)")))
      .MarkAsAdvanced();

  extension
      .AddAction("ModPlayingOffsetSoundChannel",
                 _("Playing offset of the sound on a channel"),
                 _("This action modifies the playing offset of the sound on a "
                   "channel"),
                 _("the playing offset of the sound on channel _PARAM1_"),
                 _("Sounds on channels"),
                 "res/actions/son24.png",
                 "res/actions/son.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("expression", _("Channel identifier"))
      .UseStandardOperatorParameters(
          "number",
          ParameterOptions::MakeNewOptions().SetDescription(
              _("Position (in seconds)")))
      .MarkAsAdvanced();

  extension
      .AddAction("ModPlayingOffsetMusicChannel",
                 _("Playing offset of the music on a channel"),
                 _("This action modifies the playing offset of the music on "
                   "the specified channel"),
                 _("the playing offset of the music on channel _PARAM1_"),
                 _("Music on channels"),
                 "res/actions/music24.png",
                 "res/actions/music.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("expression", _("Channel identifier"))
      .UseStandardOperatorParameters(
          "number",
          ParameterOptions::MakeNewOptions().SetDescription(
              _("Position (in seconds)")))
      .MarkAsAdvanced();

  extension
      .AddAction("PlaySound",
                 _("Play a sound"),
                 _("Play a sound."),
                 _("Play the sound _PARAM1_, vol.: _PARAM3_, loop: _PARAM2_"),
                 "",
                 "res/actions/son24.png",
                 "res/actions/son.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("soundfile", _("Audio file (or audio resource name)"))
      .AddParameter("yesorno", _("Repeat the sound"), "", true)
      .SetDefaultValue("no")
      .AddParameter("expression", _("Volume"), "", true)
      .SetParameterLongDescription(_("From 0 to 100, 100 by default."))
      .SetDefaultValue("100")
      .AddParameter("expression", _("Pitch (speed)"), "", true)
      .SetParameterLongDescription(_("1 by default."))
      .SetDefaultValue("1")
      .MarkAsSimple();

  extension
      .AddAction("PlayMusic",
                 _("Play a music file"),
                 _("Play a music file."),
                 _("Play the music _PARAM1_, vol.: _PARAM3_, loop: _PARAM2_"),
                 "",
                 "res/actions/music24.png",
                 "res/actions/music.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("musicfile", _("Audio file (or audio resource name)"))
      .AddParameter("yesorno", _("Repeat the sound"), "", true)
      .SetDefaultValue("no")
      .AddParameter("expression", _("Volume"), "", true)
      .SetParameterLongDescription(_("From 0 to 100, 100 by default."))
      .SetDefaultValue("100")
      .AddParameter("expression", _("Pitch (speed)"), "", true)
      .SetParameterLongDescription(_("1 by default."))
      .SetDefaultValue("1")
      .MarkAsSimple();

  extension
      .AddAction("PreloadMusic",
                 _("Preload a music file"),
                 _("Preload a music file in memory."),
                 _("Preload the music file _PARAM1_"),
                 _("Loading"),
                 "res/actions/music24.png",
                 "res/actions/music.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("musicfile", _("Audio file (or audio resource name)"))
      .MarkAsComplex();

  extension
      .AddAction("PreloadSound",
                 _("Preload a sound file"),
                 _("Preload a sound file in memory."),
                 _("Preload the sound file _PARAM1_"),
                 _("Loading"),
                 "res/actions/son24.png",
                 "res/actions/son.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("soundfile", _("Sound file (or sound resource name)"))
      .MarkAsComplex();

  extension
      .AddAction(
          "UnloadMusic",
          _("Unload a music file"),
          _("Unload a music file from memory. "
            "Unloading a music file will cause any music playing it to stop."),
          _("Unload the music file _PARAM1_"),
          _("Loading"),
          "res/actions/music24.png",
          "res/actions/music.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("musicfile", _("Audio file (or audio resource name)"))
      .MarkAsComplex();

  extension
      .AddAction(
          "UnloadSound",
          _("Unload a sound file"),
          _("Unload a sound file from memory. "
            "Unloading a sound file will cause any sounds playing it to stop."),
          _("Unload the sound file _PARAM1_"),
          _("Loading"),
          "res/actions/son24.png",
          "res/actions/son.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("soundfile", _("Sound file (or sound resource name)"))
      .MarkAsComplex();

  extension
      .AddAction(
          "UnloadAllAudio",
          _("Unload all audio"),
          _("Unload all the audio in memory. "
            "This will cause every sound and music of the game to stop."),
          _("Unload all audio files"),
          _("Loading"),
          "res/actions/music24.png",
          "res/actions/music.png")
      .AddCodeOnlyParameter("currentScene", "")
      .MarkAsComplex();
  extension
      .AddAction(
          "FadeSoundVolume",
          _("Fade the volume of a sound played on a channel."),
          _("Fade the volume of a sound played on a channel to the specified volume within the specified duration."),
          _("Fade the sound on channel _PARAM1_ to volume _PARAM2_ within _PARAM3_ seconds"),
          _("Sounds on channels"),
          "res/actions/son24.png",
          "res/actions/son.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("expression", _("Channel identifier"))
      .AddParameter("expression", _("Final volume (0-100)"))
      .AddParameter("expression", _("Fading time in seconds"))
      .MarkAsAdvanced();
  extension
      .AddAction(
          "FadeMusicVolume",
          _("Fade the volume of a music played on a channel."),
          _("Fade the volume of a music played on a channel to the specified volume within the specified duration."),
          _("Fade the music on channel _PARAM1_ to volume _PARAM2_ within _PARAM3_ seconds"),
          _("Music on channels"),
          "res/actions/music24.png",
          "res/actions/music.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("expression", _("Channel identifier"))
      .AddParameter("expression", _("Final volume (0-100)"))
      .AddParameter("expression", _("Fading time in seconds"))
      .MarkAsAdvanced();

  extension
      .AddCondition("MusicPlaying",
                    _("A music file is being played"),
                    _("Test if the music on a channel is being played"),
                    _("Music on channel _PARAM1_ is being played"),
                    _("Music on channels"),
                    "res/conditions/musicplaying24.png",
                    "res/conditions/musicplaying.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("expression", _("Channel"))
      .MarkAsAdvanced();

  extension
      .AddCondition("MusicPaused",
                    _("A music file is paused"),
                    _("Test if the music on the specified channel is paused."),
                    _("Music on channel _PARAM1_ is paused"),
                    _("Music on channels"),
                    "res/conditions/musicpaused24.png",
                    "res/conditions/musicpaused.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("expression", _("Channel"))
      .MarkAsAdvanced();

  extension
      .AddCondition("MusicStopped",
                    _("A music file is stopped"),
                    _("Test if the music on the specified channel is stopped."),
                    _("Music on channel _PARAM1_ is stopped"),
                    _("Music on channels"),
                    "res/conditions/musicstopped24.png",
                    "res/conditions/musicstopped.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("expression", _("Channel"))
      .MarkAsAdvanced();

  extension
      .AddCondition("SoundPlaying",
                    _("A sound is being played"),
                    _("Test if the sound on a channel is being played."),
                    _("Sound on channel _PARAM1_ is being played"),
                    _("Sounds on channels"),
                    "res/conditions/sonplaying24.png",
                    "res/conditions/sonplaying.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("expression", _("Channel"))
      .MarkAsAdvanced();

  extension
      .AddCondition("SoundPaused",
                    _("A sound is paused"),
                    _("Test if the sound on the specified channel is paused."),
                    _("Sound on channel _PARAM1_ is paused"),
                    _("Sounds on channels"),
                    "res/conditions/sonpaused24.png",
                    "res/conditions/sonpaused.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("expression", _("Channel"))
      .MarkAsAdvanced();

  extension
      .AddCondition("SoundStopped",
                    _("A sound is stopped"),
                    _("Test if the sound on the specified channel is stopped."),
                    _("Sound on channel _PARAM1_ is stopped"),
                    _("Sounds on channels"),
                    "res/conditions/sonstopped24.png",
                    "res/conditions/sonstopped.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("expression", _("Channel"))
      .MarkAsAdvanced();

  extension
      .AddCondition(
          "SoundCanalVolume",
          _("Volume of the sound on a channel"),
          _("Test the volume of the sound on the specified channel."),
          _("the volume of the sound on channel _PARAM1_"),
          _("Sounds on channels"),
          "res/conditions/sonVolume24.png",
          "res/conditions/sonVolume.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("expression", _("Channel identifier"))
      .UseStandardRelationalOperatorParameters(
          "number",
          ParameterOptions::MakeNewOptions().SetDescription(
              _("Volume to compare to (0-100)")))
      .MarkAsAdvanced();

  extension
      .AddCondition(
          "MusicCanalVolume",
          _("Volume of the music on a channel"),
          _("Test the volume of the music on a specified channel. The volume "
            "is between 0 and 100."),
          _("the volume of the music on channel _PARAM1_"),
          _("Music on channels"),
          "res/conditions/musicVolume24.png",
          "res/conditions/musicVolume.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("expression", _("Channel identifier"))
      .UseStandardRelationalOperatorParameters(
          "number",
          ParameterOptions::MakeNewOptions().SetDescription(
              _("Volume to compare to (0-100)")))
      .MarkAsAdvanced();

  extension
      .AddCondition(
          "GlobalVolume",
          _("Global volume"),
          _("Test the global sound level. The volume is between 0 and 100."),
          _("the global game volume"),
          "",
          "res/conditions/volume24.png",
          "res/conditions/volume.png")
      .AddCodeOnlyParameter("currentScene", "")
      .UseStandardRelationalOperatorParameters(
          "number",
          ParameterOptions::MakeNewOptions().SetDescription(
              _("Volume to compare to (0-100)")));

  extension
      .AddCondition(
          "SoundChannelPitch",
          _("Pitch of the sound of a channel"),
          _("Test the pitch of the sound on the specified channel. 1 is the "
            "default pitch."),
          _("the pitch of the sound on channel _PARAM1_"),
          _("Sounds on channels"),
          "res/conditions/sonVolume24.png",
          "res/conditions/sonVolume.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("expression", _("Channel identifier"))
      .UseStandardRelationalOperatorParameters(
          "number",
          ParameterOptions::MakeNewOptions().SetDescription(
              _("Pitch to compare to (1 by default)")))
      .MarkAsAdvanced();

  extension
      .AddCondition(
          "MusicChannelPitch",
          _("Pitch of the music on a channel"),
          _("Test the pitch (speed) of the music on a specified channel."),
          _("the pitch of the music on channel _PARAM1_"),
          _("Music on channels"),
          "res/conditions/musicVolume24.png",
          "res/conditions/musicVolume.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("expression", _("Channel identifier"))
      .UseStandardRelationalOperatorParameters(
          "number",
          ParameterOptions::MakeNewOptions().SetDescription(
              _("Pitch to compare to (1 by default)")))
      .MarkAsAdvanced();

  extension
      .AddCondition(
          "SoundChannelPlayingOffset",
          _("Playing offset of the sound on a channel"),
          _("Test the playing offset of the sound on the specified channel."),
          _("the playing offset of the sound on channel _PARAM1_"),
          _("Sounds on channels"),
          "res/conditions/sonVolume24.png",
          "res/conditions/sonVolume.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("expression", _("Channel identifier"))
      .UseStandardRelationalOperatorParameters(
          "number",
          ParameterOptions::MakeNewOptions().SetDescription(
              _("Position to compare to (in seconds)")))
      .MarkAsAdvanced();

  extension
      .AddCondition(
          "MusicChannelPlayingOffset",
          _("Playing offset of the music on a channel"),
          _("Test the playing offset of the music on the specified channel."),
          _("the playing offset of the music on channel _PARAM1_"),
          _("Music on channels"),
          "res/conditions/musicVolume24.png",
          "res/conditions/musicVolume.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("expression", _("Channel identifier"))
      .UseStandardRelationalOperatorParameters(
          "number",
          ParameterOptions::MakeNewOptions().SetDescription(
              _("Position to compare to (in seconds)")))
      .MarkAsAdvanced();

  extension
      .AddExpression("SoundChannelPlayingOffset",
                     _("Sound playing offset"),
                     _("Sound playing offset"),
                     _("Sounds"),
                     "res/actions/son.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("expression", _("Channel"));

  extension
      .AddExpression("MusicChannelPlayingOffset",
                     _("Music playing offset"),
                     _("Music playing offset"),
                     _("Music"),
                     "res/actions/music.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("expression", _("Channel"));

  extension
      .AddExpression("SoundChannelVolume",
                     _("Sound volume"),
                     _("Sound volume"),
                     _("Sounds"),
                     "res/actions/son.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("expression", _("Channel"));

  extension
      .AddExpression("MusicChannelVolume",
                     _("Music volume"),
                     _("Music volume"),
                     _("Music"),
                     "res/actions/music.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("expression", _("Channel"));

  extension
      .AddExpression("SoundChannelPitch",
                     _("Sound's pitch"),
                     _("Sound's pitch"),
                     _("Sounds"),
                     "res/actions/son.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("expression", _("Channel"));

  extension
      .AddExpression("MusicChannelPitch",
                     _("Music's pitch"),
                     _("Music's pitch"),
                     _("Music"),
                     "res/actions/music.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("expression", _("Channel"));

  extension
      .AddExpression("GlobalVolume",
                     _("Global volume"),
                     _("Global volume value"),
                     _("Sound level"),
                     "res/conditions/volume.png")
      .AddCodeOnlyParameter("currentScene", "");
}

}  // namespace gd
