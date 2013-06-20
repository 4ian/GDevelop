#include "AudioExtension.h"
#include "GDCore/IDE/ArbitraryResourceWorker.h"
#include "GDCore/Events/EventsCodeGenerator.h"
#include "GDCore/CommonTools.h"
#include <wx/intl.h>
//Ensure the wxWidgets macro "_" returns a std::string
#if defined(_)
    #undef _
#endif
#define _(s) std::string(wxGetTranslation((s)).mb_str())


AudioExtension::AudioExtension()
{
    SetExtensionInformation("BuiltinAudio",
                          _("Audio"),
                          _("Builtin audio extension"),
                          "Compil Games",
                          "Freeware");

    CloneExtension("Game Develop C++ platform", "BuiltinAudio");

    GetAllActions()["PlaySound"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.sound.playSound");
    GetAllActions()["PlaySoundCanal"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.sound.playSoundOnChannel");
    GetAllActions()["PlayMusic"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.sound.playMusic");
    GetAllActions()["PlayMusicCanal"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.sound.playMusicOnChannel");
    GetAllActions()["StopSoundCanal"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.sound.stopSoundOnChannel");
    GetAllActions()["PauseSoundCanal"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.sound.pauseSoundOnChannel");
    GetAllActions()["RePlaySoundCanal"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.sound.continueSoundOnChannel");
    GetAllActions()["StopMusicCanal"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.sound.stopMusicOnChannel");
    GetAllActions()["PauseMusicCanal"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.sound.pauseMusicOnChannel");
    GetAllActions()["RePlayMusicCanal"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.sound.continueMusicOnChannel");

    GetAllActions()["ModGlobalVolume"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.sound.setGlobalVolume").SetAssociatedGetter("gdjs.evtTools.sound.getGlobalVolume");
    GetAllConditions()["GlobalVolume"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.sound.getGlobalVolume");
    GetAllExpressions()["GlobalVolume"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.sound.getGlobalVolume");

    StripUnimplementedInstructionsAndExpressions(); //Unimplemented things are listed here:
    /*

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
        .codeExtraInformation.SetFunctionName("SetSoundVolumeOnChannel").SetManipulatedType("number").SetAssociatedGetter("GetSoundVolumeOnChannel").SetIncludeFile("GDL/BuiltinExtensions/AudioTools.h");

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
        .codeExtraInformation.SetFunctionName("SetMusicVolumeOnChannel").SetManipulatedType("number").SetAssociatedGetter("GetMusicVolumeOnChannel").SetIncludeFile("GDL/BuiltinExtensions/AudioTools.h");

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
        .codeExtraInformation.SetFunctionName("SetSoundPitchOnChannel").SetAssociatedGetter("GetSoundPitchOnChannel").SetManipulatedType("number").SetIncludeFile("GDL/BuiltinExtensions/AudioTools.h");


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
        .codeExtraInformation.SetFunctionName("SetMusicPitchOnChannel").SetAssociatedGetter("GetMusicPitchOnChannel").SetManipulatedType("number").SetIncludeFile("GDL/BuiltinExtensions/AudioTools.h");


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
        .codeExtraInformation.SetFunctionName("SetSoundPlayingOffsetOnChannel").SetAssociatedGetter("GetSoundPlayingOffsetOnChannel").SetManipulatedType("number").SetIncludeFile("GDL/BuiltinExtensions/AudioTools.h");

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
        .codeExtraInformation.SetFunctionName("SetMusicPlayingOffsetOnChannel").SetAssociatedGetter("GetMusicPlayingOffsetOnChannel").SetManipulatedType("number").SetIncludeFile("GDL/BuiltinExtensions/AudioTools.h");

    AddCondition("MusicPlaying",
                   _("A music is being played"),
                   _("Test if the music on a channel is being played"),
                   _("The music on channel _PARAM1_ is being played"),
                   _("Musics"),
                   "res/conditions/musicplaying24.png",
                   "res/conditions/musicplaying.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("Channel"), "",false)
        .codeExtraInformation.SetFunctionName("MusicPlaying").SetIncludeFile("GDL/BuiltinExtensions/AudioTools.h");



    AddCondition("MusicPaused",
                   _("A music is paused"),
                   _("Test if the music on the specified canal is paused."),
                   _("The music on channel _PARAM1_ is paused"),
                   _("Musics"),
                   "res/conditions/musicpaused24.png",
                   "res/conditions/musicpaused.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("Channel"), "",false)
        .codeExtraInformation.SetFunctionName("MusicPaused").SetIncludeFile("GDL/BuiltinExtensions/AudioTools.h");



    AddCondition("MusicStopped",
                   _("A music is stopped"),
                   _("Test if the music on the specified canal is stopped."),
                   _("The music on channel _PARAM1_ is stopped"),
                   _("Musics"),
                   "res/conditions/musicstopped24.png",
                   "res/conditions/musicstopped.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("Channel"), "",false)
        .codeExtraInformation.SetFunctionName("MusicStopped").SetIncludeFile("GDL/BuiltinExtensions/AudioTools.h");


    AddCondition("SoundPlaying",
                   _("A sound is being played"),
                   _("Test if the sound on a channel is being played."),
                   _("Thee sound on channel _PARAM1_ is being played"),
                   _("Sounds"),
                   "res/conditions/sonplaying24.png",
                   "res/conditions/sonplaying.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("Channel"), "",false)
        .codeExtraInformation.SetFunctionName("SoundPlaying").SetIncludeFile("GDL/BuiltinExtensions/AudioTools.h");



    AddCondition("SoundPaused",
                   _("A sound is paused"),
                   _("Test if the sound on the specified canal is paused."),
                   _("The sound on channel _PARAM1_ is paused"),
                   _("Sounds"),
                   "res/conditions/sonpaused24.png",
                   "res/conditions/sonpaused.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("Channel"), "",false)
        .codeExtraInformation.SetFunctionName("SoundPaused").SetIncludeFile("GDL/BuiltinExtensions/AudioTools.h");



    AddCondition("SoundStopped",
                   _("A sound is stopped"),
                   _("Test if the sound on the specified canal is stopped."),
                   _("The sound on channel _PARAM1_ is stopped"),
                   _("Sounds"),
                   "res/conditions/sonstopped24.png",
                   "res/conditions/sonstopped.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("Channel"), "",false)
        .codeExtraInformation.SetFunctionName("SoundStopped").SetIncludeFile("GDL/BuiltinExtensions/AudioTools.h");



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
        .codeExtraInformation.SetFunctionName("GetSoundVolumeOnChannel").SetManipulatedType("number").SetIncludeFile("GDL/BuiltinExtensions/AudioTools.h");



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
        .codeExtraInformation.SetFunctionName("GetMusicVolumeOnChannel").SetManipulatedType("number").SetIncludeFile("GDL/BuiltinExtensions/AudioTools.h");



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
        .codeExtraInformation.SetFunctionName("GetSoundPitchOnChannel").SetManipulatedType("number").SetIncludeFile("GDL/BuiltinExtensions/AudioTools.h");



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
        .codeExtraInformation.SetFunctionName("GetMusicPitchOnChannel").SetManipulatedType("number").SetIncludeFile("GDL/BuiltinExtensions/AudioTools.h");



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
        .codeExtraInformation.SetFunctionName("GetSoundPlayingOffsetOnChannel").SetManipulatedType("number").SetIncludeFile("GDL/BuiltinExtensions/AudioTools.h");



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
        .codeExtraInformation.SetFunctionName("GetMusicPlayingOffsetOnChannel").SetManipulatedType("number").SetIncludeFile("GDL/BuiltinExtensions/AudioTools.h");



    AddExpression("SoundChannelPlayingOffset", _("Sound playing offset"), _("Sound playing offset"), _("Sounds"), "res/actions/son.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("Channel"), "",false)
        .codeExtraInformation.SetFunctionName("GetSoundPlayingOffsetOnChannel").SetIncludeFile("GDL/BuiltinExtensions/AudioTools.h");

    AddExpression("MusicChannelPlayingOffset", _("Music playing offset"), _("Music playing offset"), _("Musics"), "res/actions/music.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("Channel"), "",false)
        .codeExtraInformation.SetFunctionName("GetMusicPlayingOffsetOnChannel").SetIncludeFile("GDL/BuiltinExtensions/AudioTools.h");

    AddExpression("SoundChannelVolume", _("Sound volume"), _("Sound volume"), _("Sounds"), "res/actions/son.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("Channel"), "",false)
        .codeExtraInformation.SetFunctionName("GetSoundVolumeOnChannel").SetIncludeFile("GDL/BuiltinExtensions/AudioTools.h");

    AddExpression("MusicChannelVolume", _("Music volume"), _("Music volume"), _("Musics"), "res/actions/music.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("Channel"), "",false)
        .codeExtraInformation.SetFunctionName("GetMusicVolumeOnChannel").SetIncludeFile("GDL/BuiltinExtensions/AudioTools.h");

    AddExpression("SoundChannelPitch", _("Sound's pitch"), _("Sound's pitch"), _("Sounds"), "res/actions/son.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("Channel"), "",false)
        .codeExtraInformation.SetFunctionName("GetSoundPitchOnChannel").SetIncludeFile("GDL/BuiltinExtensions/AudioTools.h");

    AddExpression("MusicChannelPitch", _("Music's pitch"), _("Music's pitch"), _("Musics"), "res/actions/music.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("Channel"), "",false)
        .codeExtraInformation.SetFunctionName("GetMusicPitchOnChannel").SetIncludeFile("GDL/BuiltinExtensions/AudioTools.h");

    */
}

void AudioExtension::ExposeActionsResources(gd::Instruction & action, gd::ArbitraryResourceWorker & worker)
{
    if ( action.GetType() == "PlaySound" || action.GetType() == "PlaySoundCanal" || action.GetType() == "PlayMusic" || action.GetType() == "PlayMusicCanal" )
    {
        std::string parameter = action.GetParameter(1).GetPlainString();
        worker.ExposeResource(parameter);
        action.SetParameter(1, parameter);
    }
}
