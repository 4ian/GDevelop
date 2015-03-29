/*
 * GDevelop JS Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include "AudioExtension.h"
#include "GDCore/BuiltinExtensions/AllBuiltinExtensions.h"
#include "GDCore/IDE/ArbitraryResourceWorker.h"
#include "GDCore/Events/EventsCodeGenerator.h"
#include "GDCore/CommonTools.h"
#include "GDCore/Tools/Localization.h"

namespace gdjs
{

AudioExtension::AudioExtension()
{
    gd::BuiltinExtensionsImplementer::ImplementsAudioExtension(*this);

    SetExtensionInformation("BuiltinAudio",
                          GD_T("Audio"),
                          GD_T("Builtin audio extension"),
                          "Florian Rival",
                          "Open source (MIT License)");

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
    GetAllConditions()["MusicPlaying"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.sound.isMusicOnChannelPlaying");
    GetAllConditions()["MusicPaused"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.sound.isMusicOnChannelPaused");
    GetAllConditions()["MusicStopped"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.sound.isMusicOnChannelStopped");
    GetAllConditions()["SoundPlaying"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.sound.isSoundOnChannelPlaying");
    GetAllConditions()["SoundPaused"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.sound.isSoundOnChannelPaused");
    GetAllConditions()["SoundStopped"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.sound.isSoundOnChannelStopped");

    GetAllActions()["ModGlobalVolume"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.sound.setGlobalVolume").SetAssociatedGetter("gdjs.evtTools.sound.getGlobalVolume");
    GetAllConditions()["GlobalVolume"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.sound.getGlobalVolume");
    GetAllExpressions()["GlobalVolume"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.sound.getGlobalVolume");

    GetAllActions()["ModVolumeSoundCanal"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.sound.setSoundOnChannelVolume").SetAssociatedGetter("gdjs.evtTools.sound.getSoundOnChannelVolume");
    GetAllActions()["ModVolumeMusicCanal"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.sound.setMusicOnChannelVolume").SetAssociatedGetter("gdjs.evtTools.sound.getMusicOnChannelVolume");
    GetAllConditions()["SoundCanalVolume"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.sound.getSoundOnChannelVolume");
    GetAllConditions()["MusicCanalVolume"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.sound.getMusicOnChannelVolume");

    GetAllActions()["ModPlayingOffsetSoundChannel"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.sound.setSoundOnChannelPlayingOffset").SetAssociatedGetter("gdjs.evtTools.sound.getSoundOnChannelPlayingOffset");
    GetAllActions()["ModPlayingOffsetMusicChannel"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.sound.setMusicOnChannelPlayingOffset").SetAssociatedGetter("gdjs.evtTools.sound.getMusicOnChannelPlayingOffset");
    GetAllConditions()["SoundChannelPlayingOffset"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.sound.getSoundOnChannelPlayingOffset");
    GetAllConditions()["MusicChannelPlayingOffset"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.sound.getMusicOnChannelPlayingOffset");

    GetAllExpressions()["SoundChannelVolume"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.sound.getSoundOnChannelVolume");
    GetAllExpressions()["MusicChannelVolume"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.sound.getMusicOnChannelVolume");

    GetAllExpressions()["SoundChannelPlayingOffset"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.sound.getSoundOnChannelPlayingOffset");
    GetAllExpressions()["MusicChannelPlayingOffset"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.sound.getMusicOnChannelPlayingOffset");

    StripUnimplementedInstructionsAndExpressions(); //Unimplemented things are listed here:
    /*

    AddAction("ModPitchSoundChannel",
                   GD_T("Pitch of the sound of a channel"),
                   GD_T("This action modify pitch ( speed ) of the sound on a channel.\n1 is the default pitch."),
                   GD_T("Do _PARAM2__PARAM3_ to the pitch of the sound on channel _PARAM1_"),
                   GD_T("Sounds"),
                   "res/actions/son24.png",
                   "res/actions/son.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", GD_T("Canal ( 0 - 15 )"), "",false)
        .AddParameter("operator", GD_T("Modification's sign"), "",false)
        .AddParameter("expression", GD_T("Value"), "",false)
        .codeExtraInformation.SetFunctionName("SetSoundPitchOnChannel").SetAssociatedGetter("GetSoundPitchOnChannel").SetManipulatedType("number").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");


    AddAction("ModPitchMusicChannel",
                   GD_T("Pitch of the music on a channel"),
                   GD_T("This action modify the pitch of the music on the specified channel. 1 is the default pitch"),
                   GD_T("Do _PARAM2__PARAM3_ to the pitch of the music on channel _PARAM1_"),
                   GD_T("Musics"),
                   "res/actions/music24.png",
                   "res/actions/music.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", GD_T("Canal ( 0 - 15 )"), "",false)
        .AddParameter("operator", GD_T("Modification's sign"), "",false)
        .AddParameter("expression", GD_T("Value"), "",false)
        .codeExtraInformation.SetFunctionName("SetMusicPitchOnChannel").SetAssociatedGetter("GetMusicPitchOnChannel").SetManipulatedType("number").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");

    AddCondition("SoundChannelPitch",
                   GD_T("Pitch of the sound of a channel"),
                   GD_T("Test the pitch of the sound on the specified channel. 1 is the default pitch."),
                   GD_T("The pitch of the sound on channel _PARAM1_ is _PARAM2__PARAM3_"),
                   GD_T("Sounds"),
                   "res/conditions/sonVolume24.png",
                   "res/conditions/sonVolume.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", GD_T("Canal ( 0 - 15 )"), "",false)
        .AddParameter("relationalOperator", GD_T("Sign of the test"), "",false)
        .AddParameter("expression", GD_T("Pitch to test"), "",false)
        .codeExtraInformation.SetFunctionName("GetSoundPitchOnChannel").SetManipulatedType("number").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");



    AddCondition("MusicChannelPitch",
                   GD_T("Pitch of the music on a channel"),
                   GD_T("Test the pitch ( speed ) of the music on specified channel. 1 is the default pitch."),
                   GD_T("The volume of the music on channel _PARAM1_ is _PARAM2__PARAM3_"),
                   GD_T("Musics"),
                   "res/conditions/musicVolume24.png",
                   "res/conditions/musicVolume.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", GD_T("Canal ( 0 - 15 )"), "",false)
        .AddParameter("relationalOperator", GD_T("Sign of the test"), "",false)
        .AddParameter("expression", GD_T("Pitch to test"), "",false)
        .codeExtraInformation.SetFunctionName("GetMusicPitchOnChannel").SetManipulatedType("number").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");

    AddExpression("SoundChannelPitch", GD_T("Sound's pitch"), GD_T("Sound's pitch"), GD_T("Sounds"), "res/actions/son.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", GD_T("Channel"), "",false)
        .codeExtraInformation.SetFunctionName("GetSoundPitchOnChannel").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");

    AddExpression("MusicChannelPitch", GD_T("Music's pitch"), GD_T("Music's pitch"), GD_T("Musics"), "res/actions/music.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", GD_T("Channel"), "",false)
        .codeExtraInformation.SetFunctionName("GetMusicPitchOnChannel").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");

    */
}

void AudioExtension::ExposeActionsResources(gd::Instruction & action, gd::ArbitraryResourceWorker & worker)
{
    if ( action.GetType() == "PlaySound" || action.GetType() == "PlaySoundCanal" || action.GetType() == "PlayMusic" || action.GetType() == "PlayMusicCanal" )
    {
        std::string parameter = action.GetParameter(1).GetPlainString();
        worker.ExposeFile(parameter);
        action.SetParameter(1, parameter);
    }
}

}
