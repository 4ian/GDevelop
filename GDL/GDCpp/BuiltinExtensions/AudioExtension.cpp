/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#include <iostream>
#include "GDCpp/BuiltinExtensions/AudioExtension.h"
#include "GDCpp/SoundManager.h"
#include "GDCpp/CommonTools.h"
#if defined(GD_IDE_ONLY)
#include "GDCore/IDE/ArbitraryResourceWorker.h"
#include "GDCore/Events/Instruction.h"
#endif

AudioExtension::AudioExtension()
{
    SetExtensionInformation("BuiltinAudio",
                          _("Audio"),
                          _("Builtin audio extension"),
                          "Florian Rival",
                          "Freeware");

    #if defined(GD_IDE_ONLY)
    AddAction("PlaySoundCanal",
                   _("Play a sound on a channel"),
                   _("Play a sound ( small audio file ) on a specific canal,\nso as to be able to manipulate it."),
                   _("Play the sound _PARAM1_ on the channel _PARAM2_"),
                   _("Sounds"),
                   "res/actions/son24.png",
                   "res/actions/son.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("soundfile", _("Audio file"), "",false)
        .AddParameter("expression", _("Canal ( 0 - 15 )"), "",false)
        .AddParameter("yesorno", _("Repeat the sound \?"), "",true).SetDefaultValue("no")
        .AddParameter("expression", _("Volume ( From 0 to 100, 100 by default )"), "",true).SetDefaultValue("100")
        .AddParameter("expression", _("Pitch ( speed ) ( 1 by default )"), "",true).SetDefaultValue("1")
        .codeExtraInformation.SetFunctionName("PlaySoundOnChannel").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");

    AddAction("StopSoundCanal",
                   _("Stop the sound of a channel"),
                   _("Stop the sound on the specified channel."),
                   _("Stop the sound of channel _PARAM1_"),
                   _("Sounds"),
                   "res/actions/son24.png",
                   "res/actions/son.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("Canal ( 0 - 15 )"), "",false)
        .codeExtraInformation.SetFunctionName("StopSoundOnChannel").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");

    AddAction("PauseSoundCanal",
                   _("Pause the sound of a channel"),
                   _("Pause the sound played on the specified channel."),
                   _("Pause the sound of channel _PARAM1_"),
                   _("Sounds"),
                   "res/actions/son24.png",
                   "res/actions/son.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("Canal ( 0 - 15 )"), "",false)
        .codeExtraInformation.SetFunctionName("PauseSoundOnChannel").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");

    AddAction("RePlaySoundCanal",
                   _("Play the sound of a channel"),
                   _("Play the sound of the channel."),
                   _("Play the sound of channel _PARAM1_"),
                   _("Sounds"),
                   "res/actions/son24.png",
                   "res/actions/son.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("Canal ( 0 - 15 )"), "",false)
        .codeExtraInformation.SetFunctionName("RePlaySoundOnChannel").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");

    AddAction("PlayMusicCanal",
                   _("Play a music on a channel"),
                   _("Play a music an on specific channel,\nso as to be able to interact with later."),
                   _("Play the music _PARAM1_ on channel _PARAM2_"),
                   _("Musics"),
                   "res/actions/music24.png",
                   "res/actions/music.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("musicfile", _("Audio file"), "",false)
        .AddParameter("expression", _("Canal ( 0 - 15 )"), "",false)
        .AddParameter("yesorno", _("Repeat the sound \?"), "",true).SetDefaultValue("no")
        .AddParameter("expression", _("Volume ( From 0 to 100, 100 by default )"), "",true).SetDefaultValue("100")
        .AddParameter("expression", _("Pitch ( speed ) ( 1 by default )"), "",true).SetDefaultValue("1")
        .codeExtraInformation.SetFunctionName("PlayMusicOnChannel").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");

    AddAction("StopMusicCanal",
                   _("Stop the music on a channel"),
                   _("Stop the music on the specified channel"),
                   _("Stop the music of channel _PARAM1_"),
                   _("Musics"),
                   "res/actions/music24.png",
                   "res/actions/music.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("Canal ( 0 - 15 )"), "",false)
        .codeExtraInformation.SetFunctionName("StopMusicOnChannel").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");

    AddAction("PauseMusicCanal",
                   _("Pause the music of a channel"),
                   _("Pause the music on the specified channel."),
                   _("Pause the music of channel _PARAM1_"),
                   _("Musics"),
                   "res/actions/music24.png",
                   "res/actions/music.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("Canal ( 0 - 15 )"), "",false)
        .codeExtraInformation.SetFunctionName("PauseMusicOnChannel").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");

    AddAction("RePlayMusicCanal",
                   _("Play the music of a channel"),
                   _("Play the music of the channel."),
                   _("Play the music of channel _PARAM1_"),
                   _("Musics"),
                   "res/actions/music24.png",
                   "res/actions/music.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("Canal ( 0 - 15 )"), "",false)
        .codeExtraInformation.SetFunctionName("RePlayMusicOnChannel").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");

    AddAction("ModVolumeSoundCanal",
                   _("Volume of the sound on a channel"),
                   _("This action modify the volume of the sound on the specified channel. The volume is between 0 and 100."),
                   _("Do _PARAM2__PARAM3_ to the volume of the sound on channel _PARAM1_"),
                   _("Sound level"),
                   "res/actions/sonVolume24.png",
                   "res/actions/sonVolume.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("Canal ( 0 - 15 )"), "",false)
        .AddParameter("operator", _("Modification's sign"), "",false)
        .AddParameter("expression", _("Value"), "",false)
        .codeExtraInformation.SetFunctionName("SetSoundVolumeOnChannel").SetManipulatedType("number").SetAssociatedGetter("GetSoundVolumeOnChannel").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");

    AddAction("ModVolumeMusicCanal",
                   _("Volume of the music on a channel"),
                   _("This action modify the volume of the music on the specified channel. The volume is between 0 and 100."),
                   _("Do _PARAM2__PARAM3_ to the volume of the music on channel _PARAM1_"),
                   _("Sound level"),
                   "res/actions/sonVolume24.png",
                   "res/actions/sonVolume.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("Canal ( 0 - 15 )"), "",false)
        .AddParameter("operator", _("Modification's sign"), "",false)
        .AddParameter("expression", _("Value"), "",false)
        .codeExtraInformation.SetFunctionName("SetMusicVolumeOnChannel").SetManipulatedType("number").SetAssociatedGetter("GetMusicVolumeOnChannel").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");

    AddAction("ModGlobalVolume",
                   _("Game global volume"),
                   _("This action modify the global volumeof the game. The volume is between 0 and 100."),
                   _("Do _PARAM1__PARAM2_ to global sound level"),
                   _("Sound level"),
                   "res/actions/volume24.png",
                   "res/actions/volume.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("operator", _("Modification's sign"), "",false)
        .AddParameter("expression", _("Value"), "",false)
        .codeExtraInformation.SetFunctionName("SetGlobalVolume").SetAssociatedGetter("GetGlobalVolume").SetManipulatedType("number").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");

    AddAction("ModPitchSoundChannel",
                   _("Pitch of the sound of a channel"),
                   _("This action modify pitch ( speed ) of the sound on a channel.\n1 is the default pitch."),
                   _("Do _PARAM2__PARAM3_ to the pitch of the sound on channel _PARAM1_"),
                   _("Sounds"),
                   "res/actions/son24.png",
                   "res/actions/son.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("Canal ( 0 - 15 )"), "",false)
        .AddParameter("operator", _("Modification's sign"), "",false)
        .AddParameter("expression", _("Value"), "",false)
        .codeExtraInformation.SetFunctionName("SetSoundPitchOnChannel").SetAssociatedGetter("GetSoundPitchOnChannel").SetManipulatedType("number").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");


    AddAction("ModPitchMusicChannel",
                   _("Pitch of the music on a channel"),
                   _("This action modify the pitch of the music on the specified channel. 1 is the default pitch"),
                   _("Do _PARAM2__PARAM3_ to the pitch of the music on channel _PARAM1_"),
                   _("Musics"),
                   "res/actions/music24.png",
                   "res/actions/music.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("Canal ( 0 - 15 )"), "",false)
        .AddParameter("operator", _("Modification's sign"), "",false)
        .AddParameter("expression", _("Value"), "",false)
        .codeExtraInformation.SetFunctionName("SetMusicPitchOnChannel").SetAssociatedGetter("GetMusicPitchOnChannel").SetManipulatedType("number").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");


    AddAction("ModPlayingOffsetSoundChannel",
                   _("Playing offset of the sound on a channel"),
                   _("This action modify the playing offset of the sound on a channel"),
                   _("Do _PARAM2__PARAM3_ to the playing offset of the sound on channel _PARAM1_"),
                   _("Sounds"),
                   "res/actions/son24.png",
                   "res/actions/son.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("Canal ( 0 - 15 )"), "",false)
        .AddParameter("operator", _("Modification's sign"), "",false)
        .AddParameter("expression", _("Value"), "",false)
        .codeExtraInformation.SetFunctionName("SetSoundPlayingOffsetOnChannel").SetAssociatedGetter("GetSoundPlayingOffsetOnChannel").SetManipulatedType("number").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");

    AddAction("ModPlayingOffsetMusicChannel",
                   _("Playing offset of the music on a channel"),
                   _("This action modify the playing offset of the music on the specified channel"),
                   _("Do _PARAM2__PARAM3_ to the playing offset of the music on channel _PARAM1_"),
                   _("Musics"),
                   "res/actions/music24.png",
                   "res/actions/music.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("Canal ( 0 - 15 )"), "",false)
        .AddParameter("operator", _("Modification's sign"), "",false)
        .AddParameter("expression", _("Value"), "",false)
        .codeExtraInformation.SetFunctionName("SetMusicPlayingOffsetOnChannel").SetAssociatedGetter("GetMusicPlayingOffsetOnChannel").SetManipulatedType("number").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");

    AddAction("PlaySound",
                   _("Play a sound"),
                   _("Play a sound."),
                   _("Play the sound _PARAM1_"),
                   _("Sounds"),
                   "res/actions/son24.png",
                   "res/actions/son.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("soundfile", _("Audio file"), "",false)
        .AddParameter("yesorno", _("Repeat the sound \?"), "",true).SetDefaultValue("no")
        .AddParameter("expression", _("Volume ( From 0 to 100, 100 by default )"), "",true).SetDefaultValue("100")
        .AddParameter("expression", _("Pitch ( speed ) ( 1 by default )"), "",true).SetDefaultValue("1")
        .codeExtraInformation.SetFunctionName("PlaySound").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");

    AddAction("PlayMusic",
                   _("Play a music"),
                   _("Play a music."),
                   _("Play the music _PARAM1_"),
                   _("Musics"),
                   "res/actions/music24.png",
                   "res/actions/music.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("musicfile", _("Audio file"), "",false)
        .AddParameter("yesorno", _("Repeat the sound \?"), "",true).SetDefaultValue("no")
        .AddParameter("expression", _("Volume ( From 0 to 100, 100 by default )"), "",true).SetDefaultValue("100")
        .AddParameter("expression", _("Pitch ( speed ) ( 1 by default )"), "",true).SetDefaultValue("1")
        .codeExtraInformation.SetFunctionName("PlayMusic").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");

    AddCondition("MusicPlaying",
                   _("A music is being played"),
                   _("Test if the music on a channel is being played"),
                   _("The music on channel _PARAM1_ is being played"),
                   _("Musics"),
                   "res/conditions/musicplaying24.png",
                   "res/conditions/musicplaying.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("Channel"), "",false)
        .codeExtraInformation.SetFunctionName("MusicPlaying").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");



    AddCondition("MusicPaused",
                   _("A music is paused"),
                   _("Test if the music on the specified canal is paused."),
                   _("The music on channel _PARAM1_ is paused"),
                   _("Musics"),
                   "res/conditions/musicpaused24.png",
                   "res/conditions/musicpaused.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("Channel"), "",false)
        .codeExtraInformation.SetFunctionName("MusicPaused").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");



    AddCondition("MusicStopped",
                   _("A music is stopped"),
                   _("Test if the music on the specified canal is stopped."),
                   _("The music on channel _PARAM1_ is stopped"),
                   _("Musics"),
                   "res/conditions/musicstopped24.png",
                   "res/conditions/musicstopped.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("Channel"), "",false)
        .codeExtraInformation.SetFunctionName("MusicStopped").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");


    AddCondition("SoundPlaying",
                   _("A sound is being played"),
                   _("Test if the sound on a channel is being played."),
                   _("Thee sound on channel _PARAM1_ is being played"),
                   _("Sounds"),
                   "res/conditions/sonplaying24.png",
                   "res/conditions/sonplaying.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("Channel"), "",false)
        .codeExtraInformation.SetFunctionName("SoundPlaying").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");



    AddCondition("SoundPaused",
                   _("A sound is paused"),
                   _("Test if the sound on the specified canal is paused."),
                   _("The sound on channel _PARAM1_ is paused"),
                   _("Sounds"),
                   "res/conditions/sonpaused24.png",
                   "res/conditions/sonpaused.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("Channel"), "",false)
        .codeExtraInformation.SetFunctionName("SoundPaused").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");



    AddCondition("SoundStopped",
                   _("A sound is stopped"),
                   _("Test if the sound on the specified canal is stopped."),
                   _("The sound on channel _PARAM1_ is stopped"),
                   _("Sounds"),
                   "res/conditions/sonstopped24.png",
                   "res/conditions/sonstopped.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("Channel"), "",false)
        .codeExtraInformation.SetFunctionName("SoundStopped").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");



    AddCondition("SoundCanalVolume",
                   _("Volume of the sound on a channel"),
                   _("Test the volume of the sound on the specified channel. The volume is between 0 and 100."),
                   _("The volume of the sound on channel _PARAM1_ is _PARAM2__PARAM3_"),
                   _("Sound level"),
                   "res/conditions/sonVolume24.png",
                   "res/conditions/sonVolume.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("Canal ( 0 - 15 )"), "",false)
        .AddParameter("relationalOperator", _("Sign of the test"), "",false)
        .AddParameter("expression", _("Volume to test"), "",false)
        .codeExtraInformation.SetFunctionName("GetSoundVolumeOnChannel").SetManipulatedType("number").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");



    AddCondition("MusicCanalVolume",
                   _("Volume of the music on a channel"),
                   _("Test the volume of the music on specified channel. The volume is between 0 and 100."),
                   _("The volume of the music on channel _PARAM1_ is _PARAM2__PARAM3_"),
                   _("Sound level"),
                   "res/conditions/musicVolume24.png",
                   "res/conditions/musicVolume.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("Canal ( 0 - 15 )"), "",false)
        .AddParameter("relationalOperator", _("Sign of the test"), "",false)
        .AddParameter("expression", _("Volume to test"), "",false)
        .codeExtraInformation.SetFunctionName("GetMusicVolumeOnChannel").SetManipulatedType("number").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");



    AddCondition("GlobalVolume",
                   _("global"),
                   _("Test the global sound level. The volume is between 0 and 100."),
                   _("The global game volume is _PARAM2_ to _PARAM1_"),
                   _("Sound level"),
                   "res/conditions/volume24.png",
                   "res/conditions/volume.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("relationalOperator", _("Sign of the test"), "",false)
        .AddParameter("expression", _("Volume to test"), "",false)
        .codeExtraInformation.SetFunctionName("GetGlobalVolume").SetManipulatedType("number").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");



    AddCondition("SoundChannelPitch",
                   _("Pitch of the sound of a channel"),
                   _("Test the pitch of the sound on the specified channel. 1 is the default pitch."),
                   _("The pitch of the sound on channel _PARAM1_ is _PARAM2__PARAM3_"),
                   _("Sounds"),
                   "res/conditions/sonVolume24.png",
                   "res/conditions/sonVolume.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("Canal ( 0 - 15 )"), "",false)
        .AddParameter("relationalOperator", _("Sign of the test"), "",false)
        .AddParameter("expression", _("Pitch to test"), "",false)
        .codeExtraInformation.SetFunctionName("GetSoundPitchOnChannel").SetManipulatedType("number").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");



    AddCondition("MusicChannelPitch",
                   _("Pitch of the music on a channel"),
                   _("Test the pitch ( speed ) of the music on specified channel. 1 is the default pitch."),
                   _("The volume of the music on channel _PARAM1_ is _PARAM2__PARAM3_"),
                   _("Musics"),
                   "res/conditions/musicVolume24.png",
                   "res/conditions/musicVolume.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("Canal ( 0 - 15 )"), "",false)
        .AddParameter("relationalOperator", _("Sign of the test"), "",false)
        .AddParameter("expression", _("Pitch to test"), "",false)
        .codeExtraInformation.SetFunctionName("GetMusicPitchOnChannel").SetManipulatedType("number").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");



    AddCondition("SoundChannelPlayingOffset",
                   _("Playing offset of the sound on a channel"),
                   _("Test the playing offset of the sound on the specified channel."),
                   _("The playing offset of the sound on channel _PARAM1_ is _PARAM2__PARAM3_"),
                   _("Sounds"),
                   "res/conditions/sonVolume24.png",
                   "res/conditions/sonVolume.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("Canal ( 0 - 15 )"), "",false)
        .AddParameter("relationalOperator", _("Sign of the test"), "",false)
        .AddParameter("expression", _("Position ( in seconds )"), "",false)
        .codeExtraInformation.SetFunctionName("GetSoundPlayingOffsetOnChannel").SetManipulatedType("number").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");



    AddCondition("MusicChannelPlayingOffset",
                   _("Playing offset of the music on a channel"),
                   _("Test the playing offset of the music on the specified channel."),
                   _("The playing offset of the music on channel _PARAM1_ is _PARAM2__PARAM3_"),
                   _("Musics"),
                   "res/conditions/musicVolume24.png",
                   "res/conditions/musicVolume.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("Canal ( 0 - 15 )"), "",false)
        .AddParameter("relationalOperator", _("Sign of the test"), "",false)
        .AddParameter("expression", _("Position ( in seconds )"), "",false)
        .codeExtraInformation.SetFunctionName("GetMusicPlayingOffsetOnChannel").SetManipulatedType("number").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");



    AddExpression("SoundChannelPlayingOffset", _("Sound playing offset"), _("Sound playing offset"), _("Sounds"), "res/actions/son.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("Channel"), "",false)
        .codeExtraInformation.SetFunctionName("GetSoundPlayingOffsetOnChannel").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");

    AddExpression("MusicChannelPlayingOffset", _("Music playing offset"), _("Music playing offset"), _("Musics"), "res/actions/music.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("Channel"), "",false)
        .codeExtraInformation.SetFunctionName("GetMusicPlayingOffsetOnChannel").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");

    AddExpression("SoundChannelVolume", _("Sound volume"), _("Sound volume"), _("Sounds"), "res/actions/son.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("Channel"), "",false)
        .codeExtraInformation.SetFunctionName("GetSoundVolumeOnChannel").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");

    AddExpression("MusicChannelVolume", _("Music volume"), _("Music volume"), _("Musics"), "res/actions/music.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("Channel"), "",false)
        .codeExtraInformation.SetFunctionName("GetMusicVolumeOnChannel").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");

    AddExpression("SoundChannelPitch", _("Sound's pitch"), _("Sound's pitch"), _("Sounds"), "res/actions/son.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("Channel"), "",false)
        .codeExtraInformation.SetFunctionName("GetSoundPitchOnChannel").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");

    AddExpression("MusicChannelPitch", _("Music's pitch"), _("Music's pitch"), _("Musics"), "res/actions/music.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("Channel"), "",false)
        .codeExtraInformation.SetFunctionName("GetMusicPitchOnChannel").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");

    AddExpression("GlobalVolume", _("Global volume"), _("Global volume value"), _("Sound level"), "res/conditions/volume.png")
        .AddCodeOnlyParameter("currentScene", "")
        .codeExtraInformation.SetFunctionName("GetGlobalVolume").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");

    #endif
}

#if defined(GD_IDE_ONLY)
void AudioExtension::ExposeActionsResources(gd::Instruction & action, gd::ArbitraryResourceWorker & worker)
{
    if ( action.GetType() == "PlaySound" || action.GetType() == "PlaySoundCanal" || action.GetType() == "PlayMusic" || action.GetType() == "PlayMusicCanal" )
    {
        std::string parameter = action.GetParameter(1).GetPlainString();
        worker.ExposeResource(parameter);
        action.SetParameter(1, parameter);
    }
}

void AudioExtension::GetPropertyForDebugger(RuntimeScene & scene, unsigned int propertyNb, std::string & name, std::string & value) const
{
    if ( propertyNb == 0 )
    {
        name = _("Global volume:");
        value = ToString(SoundManager::GetInstance()->GetGlobalVolume());
    }
    else if ( propertyNb < 1+SoundManager::GetInstance()->sounds.size()*3 )
    {
        unsigned int soundNb = ((propertyNb-1)-(propertyNb-1)%3)/3;
        if (soundNb >= SoundManager::GetInstance()->sounds.size()) return;

        if ( propertyNb % 3 == 1)
        {
            sf::Sound::Status soundStatus = SoundManager::GetInstance()->sounds[soundNb]->GetStatus();

            if ( soundStatus == sf::Sound::Playing)
                name = _("Sound played:");
            else if ( soundStatus == sf::Sound::Stopped)
                name = _("Sound stopped:");
            else if ( soundStatus == sf::Sound::Paused)
                name = _("Paused sound:");

            value = SoundManager::GetInstance()->sounds[soundNb]->file;
        }
        else if ( propertyNb % 3 == 2)
        {
            name = _(" -Volume/Pitch:");
            value = ToString(SoundManager::GetInstance()->sounds[soundNb]->GetVolume())
                    +"/"+ToString(SoundManager::GetInstance()->sounds[soundNb]->GetPitch());
        }
        else
        {
            name = _(" -Progress (seconds) :");
            value = ToString(SoundManager::GetInstance()->sounds[soundNb]->GetPlayingOffset());
        }

    }
    else if ( propertyNb < 1+SoundManager::GetInstance()->sounds.size()*3+SoundManager::GetInstance()->musics.size()*3 )
    {
        unsigned int musicNb = ((propertyNb-1-SoundManager::GetInstance()->sounds.size()*3)-(propertyNb-1-SoundManager::GetInstance()->sounds.size()*3)%3)/3;
        if (musicNb >= SoundManager::GetInstance()->musics.size()) return;

        if ( propertyNb % 3 == 1)
        {
            sf::Sound::Status soundStatus = SoundManager::GetInstance()->musics[musicNb]->GetStatus();

            if ( soundStatus == sf::Sound::Playing)
                name = _("Played music:");
            else if ( soundStatus == sf::Sound::Stopped)
                name = _("Stopped music:");
            else if ( soundStatus == sf::Sound::Paused)
                name = _("Paused music:");

            value = SoundManager::GetInstance()->musics[musicNb]->file;
        }
        else if ( propertyNb % 3 == 2)
        {
            name = _(" -Volume/Pitch:");
            value = ToString(SoundManager::GetInstance()->musics[musicNb]->GetVolume())
                    +"/"+ToString(SoundManager::GetInstance()->musics[musicNb]->GetPitch());
        }
        else
        {
            name = _(" -Progress (seconds) :");
            value = ToString(SoundManager::GetInstance()->musics[musicNb]->GetPlayingOffset());
        }
    }
}

bool AudioExtension::ChangeProperty(RuntimeScene & scene, unsigned int propertyNb, std::string newValue)
{
    if ( propertyNb == 0 )
    {
        SoundManager::GetInstance()->SetGlobalVolume(ToFloat(newValue));
        return true;
    }
    else if ( propertyNb < 1+SoundManager::GetInstance()->sounds.size()*3 )
    {
        unsigned int soundNb = ((propertyNb-1)-(propertyNb-1)%3)/3;
        if (soundNb >= SoundManager::GetInstance()->sounds.size()) return false;

        if ( propertyNb % 3 == 1)
        {
            return false;
        }
        else if ( propertyNb % 3 == 2)
        {
            std::vector<string> values = SplitString<string>(newValue, '/');
            if ( values.size() < 2 ) return false;

            SoundManager::GetInstance()->sounds[soundNb]->SetVolume(ToFloat(values[0]));
            SoundManager::GetInstance()->sounds[soundNb]->SetPitch(ToFloat(values[1]));
            return true;
        }
        else
        {
            SoundManager::GetInstance()->sounds[soundNb]->SetPlayingOffset(ToFloat(newValue));
            return true;
        }

    }
    else if ( propertyNb < 1+SoundManager::GetInstance()->sounds.size()*3+SoundManager::GetInstance()->musics.size()*3 )
    {
        unsigned int musicNb = ((propertyNb-1-SoundManager::GetInstance()->sounds.size()*3)-(propertyNb-1-SoundManager::GetInstance()->sounds.size()*3)%3)/3;
        if (musicNb >= SoundManager::GetInstance()->musics.size()) return false;

        if ( propertyNb % 3 == 1)
        {
            return false;
        }
        else if ( propertyNb % 3 == 2)
        {
            std::vector<string> values = SplitString<string>(newValue, '/');
            if ( values.size() < 2 ) return false;

            SoundManager::GetInstance()->musics[musicNb]->SetVolume(ToFloat(values[0]));
            SoundManager::GetInstance()->musics[musicNb]->SetPitch(ToFloat(values[1]));
            return true;
        }
        else
        {
            SoundManager::GetInstance()->musics[musicNb]->SetPlayingOffset(ToFloat(newValue));
            return true;
        }
    }


    return false;
}

unsigned int AudioExtension::GetNumberOfProperties(RuntimeScene & scene) const
{
    return 1+SoundManager::GetInstance()->musics.size()*3+SoundManager::GetInstance()->sounds.size()*3;
}

#endif

