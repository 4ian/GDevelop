/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include "AllBuiltinExtensions.h"
#include "GDCore/Tools/Localization.h"

using namespace std;
namespace gd
{

void GD_CORE_API BuiltinExtensionsImplementer::ImplementsAudioExtension(gd::PlatformExtension & extension)
{
    extension.SetExtensionInformation("BuiltinAudio",
                          _("Audio"),
                          _("Builtin audio extension"),
                          "Florian Rival",
                          "Open source (MIT License)");

    #if defined(GD_IDE_ONLY)
    extension.AddAction("PlaySoundCanal",
                   _("Play a sound on a channel"),
                   _("Play a sound (small audio file) on a specific channel,\nso you'll be able to manipulate it."),
                   _("Play the sound _PARAM1_ on the channel _PARAM2_, vol.: _PARAM4_, loop: _PARAM3_"),
                   _("Audio/Sounds on channels"),
                   "res/actions/son24.png",
                   "res/actions/son.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("soundfile", _("Audio file (or audio resource name)"))
        .AddParameter("expression", _("Channel identifier"))
        .AddParameter("yesorno", _("Repeat the sound"), "",true).SetDefaultValue("no")
        .AddParameter("expression", _("Volume (from 0 to 100, 100 by default)"), "",true).SetDefaultValue("100")
        .AddParameter("expression", _("Pitch (speed) (1 by default)"), "",true).SetDefaultValue("1")
        .MarkAsAdvanced();

    extension.AddAction("StopSoundCanal",
                   _("Stop the sound of a channel"),
                   _("Stop the sound on the specified channel."),
                   _("Stop the sound of channel _PARAM1_"),
                   _("Audio/Sounds on channels"),
                   "res/actions/son24.png",
                   "res/actions/son.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("Channel identifier"))
        .MarkAsAdvanced();

    extension.AddAction("PauseSoundCanal",
                   _("Pause the sound of a channel"),
                   _("Pause the sound played on the specified channel."),
                   _("Pause the sound of channel _PARAM1_"),
                   _("Audio/Sounds on channels"),
                   "res/actions/son24.png",
                   "res/actions/son.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("Channel identifier"))
        .MarkAsAdvanced();

    extension.AddAction("RePlaySoundCanal",
                   _("Play the sound of a channel"),
                   _("Play the sound of the channel."),
                   _("Play the sound of channel _PARAM1_"),
                   _("Audio/Sounds on channels"),
                   "res/actions/son24.png",
                   "res/actions/son.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("Channel identifier"))
        .MarkAsAdvanced();

    extension.AddAction("PlayMusicCanal",
                   _("Play a music file on a channel"),
                   _("Play a music file on a specific channel,\nso you'll be able to interact with it later."),
                   _("Play the music _PARAM1_ on channel _PARAM2_, vol.: _PARAM4_, loop: _PARAM3_"),
                   _("Audio/Music on channels"),
                   "res/actions/music24.png",
                   "res/actions/music.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("musicfile", _("Audio file (or audio resource name)"))
        .AddParameter("expression", _("Channel identifier"))
        .AddParameter("yesorno", _("Repeat the sound"), "",true).SetDefaultValue("no")
        .AddParameter("expression", _("Volume (from 0 to 100, 100 by default)"), "",true).SetDefaultValue("100")
        .AddParameter("expression", _("Pitch (speed) (1 by default)"), "",true).SetDefaultValue("1")
        .MarkAsAdvanced();

    extension.AddAction("StopMusicCanal",
                   _("Stop the music on a channel"),
                   _("Stop the music on the specified channel"),
                   _("Stop the music of channel _PARAM1_"),
                   _("Audio/Music on channels"),
                   "res/actions/music24.png",
                   "res/actions/music.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("Channel identifier"))
        .MarkAsAdvanced();

    extension.AddAction("PauseMusicCanal",
                   _("Pause the music of a channel"),
                   _("Pause the music on the specified channel."),
                   _("Pause the music of channel _PARAM1_"),
                   _("Audio/Music on channels"),
                   "res/actions/music24.png",
                   "res/actions/music.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("Channel identifier"))
        .MarkAsAdvanced();

    extension.AddAction("RePlayMusicCanal",
                   _("Play the music of a channel"),
                   _("Play the music of the channel."),
                   _("Play the music of channel _PARAM1_"),
                   _("Audio/Music on channels"),
                   "res/actions/music24.png",
                   "res/actions/music.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("Channel identifier"))
        .MarkAsAdvanced();

    extension.AddAction("ModVolumeSoundCanal",
                   _("Volume of the sound on a channel"),
                   _("This action modifies the volume of the sound on the specified channel. The volume is between 0 and 100."),
                   _("Do _PARAM2__PARAM3_ to the volume of the sound on channel _PARAM1_"),
                   _("Audio/Sounds on channels"),
                   "res/actions/sonVolume24.png",
                   "res/actions/sonVolume.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("Channel identifier"))
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"))
        .MarkAsAdvanced()
        .SetManipulatedType("number");

    extension.AddAction("ModVolumeMusicCanal",
                   _("Volume of the music on a channel"),
                   _("This action modifies the volume of the music on the specified channel. The volume is between 0 and 100."),
                   _("Do _PARAM2__PARAM3_ to the volume of the music on channel _PARAM1_"),
                   _("Audio/Music on channels"),
                   "res/actions/musicVolume24.png",
                   "res/actions/musicVolume.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("Channel identifier"))
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"))
        .MarkAsAdvanced()
        .SetManipulatedType("number");

    extension.AddAction("ModGlobalVolume",
                   _("Game global volume"),
                   _("This action modifies the global volume of the game. The volume is between 0 and 100."),
                   _("Do _PARAM1__PARAM2_ to global sound level"),
                   _("Audio"),
                   "res/actions/volume24.png",
                   "res/actions/volume.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"))
        .MarkAsSimple()
        .SetManipulatedType("number");

    extension.AddAction("ModPitchSoundChannel",
                   _("Pitch of the sound of a channel"),
                   _("This action modifies the pitch (speed) of the sound on a channel.\n1 is the default pitch."),
                   _("Do _PARAM2__PARAM3_ to the pitch of the sound on channel _PARAM1_"),
                   _("Audio/Sounds on channels"),
                   "res/actions/son24.png",
                   "res/actions/son.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("Channel identifier"))
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"))
        .MarkAsAdvanced()
        .SetManipulatedType("number");

    extension.AddAction("ModPitchMusicChannel",
                   _("Pitch of the music on a channel"),
                   _("This action modifies the pitch of the music on the specified channel. 1 is the default pitch"),
                   _("Do _PARAM2__PARAM3_ to the pitch of the music on channel _PARAM1_"),
                   _("Audio/Music on channels"),
                   "res/actions/music24.png",
                   "res/actions/music.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("Channel identifier"))
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"))
        .MarkAsAdvanced()
        .SetManipulatedType("number");

    extension.AddAction("ModPlayingOffsetSoundChannel",
                   _("Playing offset of the sound on a channel"),
                   _("This action modifies the playing offset of the sound on a channel"),
                   _("Do _PARAM2__PARAM3_ to the playing offset of the sound on channel _PARAM1_"),
                   _("Audio/Sounds on channels"),
                   "res/actions/son24.png",
                   "res/actions/son.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("Channel identifier"))
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"))
        .MarkAsAdvanced()
        .SetManipulatedType("number");

    extension.AddAction("ModPlayingOffsetMusicChannel",
                   _("Playing offset of the music on a channel"),
                   _("This action modifies the playing offset of the music on the specified channel"),
                   _("Do _PARAM2__PARAM3_ to the playing offset of the music on channel _PARAM1_"),
                   _("Audio/Music on channels"),
                   "res/actions/music24.png",
                   "res/actions/music.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("Channel identifier"))
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"))
        .MarkAsAdvanced()
        .SetManipulatedType("number");

    extension.AddAction("PlaySound",
                   _("Play a sound"),
                   _("Play a sound."),
                   _("Play the sound _PARAM1_, vol.: _PARAM3_, loop: _PARAM2_)"),
                   _("Audio"),
                   "res/actions/son24.png",
                   "res/actions/son.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("soundfile", _("Audio file (or audio resource name)"))
        .AddParameter("yesorno", _("Repeat the sound"), "",true).SetDefaultValue("no")
        .AddParameter("expression", _("Volume (from 0 to 100, 100 by default)"), "",true).SetDefaultValue("100")
        .AddParameter("expression", _("Pitch (speed) (1 by default)"), "",true).SetDefaultValue("1")
        .MarkAsSimple();

    extension.AddAction("PlayMusic",
                   _("Play a music file"),
                   _("Play a music file."),
                   _("Play the music _PARAM1_, vol.: _PARAM3_, loop: _PARAM2_)"),
                   _("Audio"),
                   "res/actions/music24.png",
                   "res/actions/music.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("musicfile", _("Audio file (or audio resource name)"))
        .AddParameter("yesorno", _("Repeat the sound"), "",true).SetDefaultValue("no")
        .AddParameter("expression", _("Volume (from 0 to 100, 100 by default)"), "",true).SetDefaultValue("100")
        .AddParameter("expression", _("Pitch (speed) (1 by default)"), "",true).SetDefaultValue("1")
        .MarkAsSimple();

    extension.AddCondition("MusicPlaying",
                   _("A music file is being played"),
                   _("Test if the music on a channel is being played"),
                   _("Music on channel _PARAM1_ is being played"),
                   _("Audio/Music on channels"),
                   "res/conditions/musicplaying24.png",
                   "res/conditions/musicplaying.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("Channel"))
        .MarkAsAdvanced();

    extension.AddCondition("MusicPaused",
                   _("A music file is paused"),
                   _("Test if the music on the specified channel is paused."),
                   _("Music on channel _PARAM1_ is paused"),
                   _("Audio/Music on channels"),
                   "res/conditions/musicpaused24.png",
                   "res/conditions/musicpaused.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("Channel"))
        .MarkAsAdvanced();

    extension.AddCondition("MusicStopped",
                   _("A music file is stopped"),
                   _("Test if the music on the specified channel is stopped."),
                   _("Music on channel _PARAM1_ is stopped"),
                   _("Audio/Music on channels"),
                   "res/conditions/musicstopped24.png",
                   "res/conditions/musicstopped.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("Channel"))
        .MarkAsAdvanced();

    extension.AddCondition("SoundPlaying",
                   _("A sound is being played"),
                   _("Test if the sound on a channel is being played."),
                   _("Sound on channel _PARAM1_ is being played"),
                   _("Audio/Sounds on channels"),
                   "res/conditions/sonplaying24.png",
                   "res/conditions/sonplaying.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("Channel"))
        .MarkAsAdvanced();

    extension.AddCondition("SoundPaused",
                   _("A sound is paused"),
                   _("Test if the sound on the specified channel is paused."),
                   _("Sound on channel _PARAM1_ is paused"),
                   _("Audio/Sounds on channels"),
                   "res/conditions/sonpaused24.png",
                   "res/conditions/sonpaused.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("Channel"))
        .MarkAsAdvanced();

    extension.AddCondition("SoundStopped",
                   _("A sound is stopped"),
                   _("Test if the sound on the specified channel is stopped."),
                   _("Sound on channel _PARAM1_ is stopped"),
                   _("Audio/Sounds on channels"),
                   "res/conditions/sonstopped24.png",
                   "res/conditions/sonstopped.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("Channel"))
        .MarkAsAdvanced();

    extension.AddCondition("SoundCanalVolume",
                   _("Volume of the sound on a channel"),
                   _("Test the volume of the sound on the specified channel. The volume is between 0 and 100."),
                   _("The volume of the sound on channel _PARAM1_ is _PARAM2__PARAM3_"),
                   _("Audio/Sounds on channels"),
                   "res/conditions/sonVolume24.png",
                   "res/conditions/sonVolume.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("Channel identifier"))
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Volume to test"))
        .MarkAsAdvanced()
        .SetManipulatedType("number");

    extension.AddCondition("MusicCanalVolume",
                   _("Volume of the music on a channel"),
                   _("Test the volume of the music on a specified channel. The volume is between 0 and 100."),
                   _("The volume of the music on channel _PARAM1_ is _PARAM2__PARAM3_"),
                   _("Audio/Music on channels"),
                   "res/conditions/musicVolume24.png",
                   "res/conditions/musicVolume.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("Channel identifier"))
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Volume to test"))
        .MarkAsAdvanced()
        .SetManipulatedType("number");

    extension.AddCondition("GlobalVolume",
                   _("Global volume"),
                   _("Test the global sound level. The volume is between 0 and 100."),
                   _("The global game volume is _PARAM2_ to _PARAM1_"),
                   _("Audio"),
                   "res/conditions/volume24.png",
                   "res/conditions/volume.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Volume to test"))
        .SetManipulatedType("number");

    extension.AddCondition("SoundChannelPitch",
                   _("Pitch of the sound of a channel"),
                   _("Test the pitch of the sound on the specified channel. 1 is the default pitch."),
                   _("The pitch of the sound on channel _PARAM1_ is _PARAM2__PARAM3_"),
                   _("Audio/Sounds on channels"),
                   "res/conditions/sonVolume24.png",
                   "res/conditions/sonVolume.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("Channel identifier"))
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Pitch to test"))
        .MarkAsAdvanced()
        .SetManipulatedType("number");

    extension.AddCondition("MusicChannelPitch",
                   _("Pitch of the music on a channel"),
                   _("Test the pitch (speed) of the music on a specified channel. 1 is the default pitch."),
                   _("The pitch of the music on channel _PARAM1_ is _PARAM2__PARAM3_"),
                   _("Audio/Music on channels"),
                   "res/conditions/musicVolume24.png",
                   "res/conditions/musicVolume.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("Channel identifier"))
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Pitch to test"))
        .MarkAsAdvanced()
        .SetManipulatedType("number");

    extension.AddCondition("SoundChannelPlayingOffset",
                   _("Playing offset of the sound on a channel"),
                   _("Test the playing offset of the sound on the specified channel."),
                   _("The playing offset of the sound on channel _PARAM1_ is _PARAM2__PARAM3_"),
                   _("Audio/Sounds on channels"),
                   "res/conditions/sonVolume24.png",
                   "res/conditions/sonVolume.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("Channel identifier"))
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Playing position (in seconds)"))
        .MarkAsAdvanced()
        .SetManipulatedType("number");

    extension.AddCondition("MusicChannelPlayingOffset",
                   _("Playing offset of the music on a channel"),
                   _("Test the playing offset of the music on the specified channel."),
                   _("The playing offset of the music on channel _PARAM1_ is _PARAM2__PARAM3_"),
                   _("Audio/Music on channels"),
                   "res/conditions/musicVolume24.png",
                   "res/conditions/musicVolume.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("Channel identifier"))
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Playing position (in seconds)"))
        .MarkAsAdvanced()
        .SetManipulatedType("number");

    extension.AddExpression("SoundChannelPlayingOffset", _("Sound playing offset"), _("Sound playing offset"), _("Sounds"), "res/actions/son.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("Channel"));

    extension.AddExpression("MusicChannelPlayingOffset", _("Music playing offset"), _("Music playing offset"), _("Music"), "res/actions/music.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("Channel"));

    extension.AddExpression("SoundChannelVolume", _("Sound volume"), _("Sound volume"), _("Sounds"), "res/actions/son.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("Channel"));

    extension.AddExpression("MusicChannelVolume", _("Music volume"), _("Music volume"), _("Music"), "res/actions/music.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("Channel"));

    extension.AddExpression("SoundChannelPitch", _("Sound's pitch"), _("Sound's pitch"), _("Sounds"), "res/actions/son.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("Channel"));

    extension.AddExpression("MusicChannelPitch", _("Music's pitch"), _("Music's pitch"), _("Music"), "res/actions/music.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("Channel"));

    extension.AddExpression("GlobalVolume", _("Global volume"), _("Global volume value"), _("Sound level"), "res/conditions/volume.png")
        .AddCodeOnlyParameter("currentScene", "");

    #endif
}

}
