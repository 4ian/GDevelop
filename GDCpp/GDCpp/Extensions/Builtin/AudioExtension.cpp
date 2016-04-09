/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#include <iostream>
#include "GDCore/Extensions/Builtin/AllBuiltinExtensions.h"
#include "GDCpp/Extensions/Builtin/AudioExtension.h"
#include "GDCpp/Runtime/RuntimeScene.h"
#include "GDCpp/Runtime/RuntimeGame.h"
#include "GDCpp/Runtime/SoundManager.h"
#include "GDCpp/Runtime/CommonTools.h"
#if defined(GD_IDE_ONLY)
#include "GDCore/IDE/Project/ArbitraryResourceWorker.h"
#include "GDCore/Events/Instruction.h"
#endif
#if !defined(GD_IDE_ONLY)
#include "GDCore/Extensions/Builtin/AudioExtension.cpp"
#endif

AudioExtension::AudioExtension()
{
    gd::BuiltinExtensionsImplementer::ImplementsAudioExtension(*this);

    #if defined(GD_IDE_ONLY)
    GetAllActions()["PlaySoundCanal"].SetFunctionName("PlaySoundOnChannel").SetIncludeFile("GDCpp/Extensions/Builtin/AudioTools.h");
    GetAllActions()["StopSoundCanal"].SetFunctionName("StopSoundOnChannel").SetIncludeFile("GDCpp/Extensions/Builtin/AudioTools.h");
    GetAllActions()["PauseSoundCanal"].SetFunctionName("PauseSoundOnChannel").SetIncludeFile("GDCpp/Extensions/Builtin/AudioTools.h");
    GetAllActions()["RePlaySoundCanal"].SetFunctionName("RePlaySoundOnChannel").SetIncludeFile("GDCpp/Extensions/Builtin/AudioTools.h");
    GetAllActions()["PlayMusicCanal"].SetFunctionName("PlayMusicOnChannel").SetIncludeFile("GDCpp/Extensions/Builtin/AudioTools.h");
    GetAllActions()["StopMusicCanal"].SetFunctionName("StopMusicOnChannel").SetIncludeFile("GDCpp/Extensions/Builtin/AudioTools.h");
    GetAllActions()["PauseMusicCanal"].SetFunctionName("PauseMusicOnChannel").SetIncludeFile("GDCpp/Extensions/Builtin/AudioTools.h");
    GetAllActions()["RePlayMusicCanal"].SetFunctionName("RePlayMusicOnChannel").SetIncludeFile("GDCpp/Extensions/Builtin/AudioTools.h");
    GetAllActions()["ModVolumeSoundCanal"].SetFunctionName("SetSoundVolumeOnChannel").SetManipulatedType("number").SetGetter("GetSoundVolumeOnChannel").SetIncludeFile("GDCpp/Extensions/Builtin/AudioTools.h");
    GetAllActions()["ModVolumeMusicCanal"].SetFunctionName("SetMusicVolumeOnChannel").SetManipulatedType("number").SetGetter("GetMusicVolumeOnChannel").SetIncludeFile("GDCpp/Extensions/Builtin/AudioTools.h");
    GetAllActions()["ModGlobalVolume"].SetFunctionName("SetGlobalVolume").SetGetter("GetGlobalVolume").SetManipulatedType("number").SetIncludeFile("GDCpp/Extensions/Builtin/AudioTools.h");
    GetAllActions()["ModPitchSoundChannel"].SetFunctionName("SetSoundPitchOnChannel").SetGetter("GetSoundPitchOnChannel").SetManipulatedType("number").SetIncludeFile("GDCpp/Extensions/Builtin/AudioTools.h");
    GetAllActions()["ModPitchMusicChannel"].SetFunctionName("SetMusicPitchOnChannel").SetGetter("GetMusicPitchOnChannel").SetManipulatedType("number").SetIncludeFile("GDCpp/Extensions/Builtin/AudioTools.h");
    GetAllActions()["ModPlayingOffsetSoundChannel"].SetFunctionName("SetSoundPlayingOffsetOnChannel").SetGetter("GetSoundPlayingOffsetOnChannel").SetManipulatedType("number").SetIncludeFile("GDCpp/Extensions/Builtin/AudioTools.h");
    GetAllActions()["ModPlayingOffsetMusicChannel"].SetFunctionName("SetMusicPlayingOffsetOnChannel").SetGetter("GetMusicPlayingOffsetOnChannel").SetManipulatedType("number").SetIncludeFile("GDCpp/Extensions/Builtin/AudioTools.h");
    GetAllActions()["PlaySound"].SetFunctionName("PlaySound").SetIncludeFile("GDCpp/Extensions/Builtin/AudioTools.h");
    GetAllActions()["PlayMusic"].SetFunctionName("PlayMusic").SetIncludeFile("GDCpp/Extensions/Builtin/AudioTools.h");

    GetAllConditions()["MusicPlaying"].SetFunctionName("MusicPlaying").SetIncludeFile("GDCpp/Extensions/Builtin/AudioTools.h");
    GetAllConditions()["MusicPaused"].SetFunctionName("MusicPaused").SetIncludeFile("GDCpp/Extensions/Builtin/AudioTools.h");
    GetAllConditions()["MusicStopped"].SetFunctionName("MusicStopped").SetIncludeFile("GDCpp/Extensions/Builtin/AudioTools.h");
    GetAllConditions()["SoundPlaying"].SetFunctionName("SoundPlaying").SetIncludeFile("GDCpp/Extensions/Builtin/AudioTools.h");
    GetAllConditions()["SoundPaused"].SetFunctionName("SoundPaused").SetIncludeFile("GDCpp/Extensions/Builtin/AudioTools.h");
    GetAllConditions()["SoundStopped"].SetFunctionName("SoundStopped").SetIncludeFile("GDCpp/Extensions/Builtin/AudioTools.h");
    GetAllConditions()["SoundCanalVolume"].SetFunctionName("GetSoundVolumeOnChannel").SetManipulatedType("number").SetIncludeFile("GDCpp/Extensions/Builtin/AudioTools.h");
    GetAllConditions()["MusicCanalVolume"].SetFunctionName("GetMusicVolumeOnChannel").SetManipulatedType("number").SetIncludeFile("GDCpp/Extensions/Builtin/AudioTools.h");
    GetAllConditions()["GlobalVolume"].SetFunctionName("GetGlobalVolume").SetManipulatedType("number").SetIncludeFile("GDCpp/Extensions/Builtin/AudioTools.h");
    GetAllConditions()["SoundChannelPitch"].SetFunctionName("GetSoundPitchOnChannel").SetManipulatedType("number").SetIncludeFile("GDCpp/Extensions/Builtin/AudioTools.h");
    GetAllConditions()["MusicChannelPitch"].SetFunctionName("GetMusicPitchOnChannel").SetManipulatedType("number").SetIncludeFile("GDCpp/Extensions/Builtin/AudioTools.h");
    GetAllConditions()["SoundChannelPlayingOffset"].SetFunctionName("GetSoundPlayingOffsetOnChannel").SetManipulatedType("number").SetIncludeFile("GDCpp/Extensions/Builtin/AudioTools.h");
    GetAllConditions()["MusicChannelPlayingOffset"].SetFunctionName("GetMusicPlayingOffsetOnChannel").SetManipulatedType("number").SetIncludeFile("GDCpp/Extensions/Builtin/AudioTools.h");

    GetAllExpressions()["SoundChannelPlayingOffset"].SetFunctionName("GetSoundPlayingOffsetOnChannel").SetIncludeFile("GDCpp/Extensions/Builtin/AudioTools.h");
    GetAllExpressions()["MusicChannelPlayingOffset"].SetFunctionName("GetMusicPlayingOffsetOnChannel").SetIncludeFile("GDCpp/Extensions/Builtin/AudioTools.h");
    GetAllExpressions()["SoundChannelVolume"].SetFunctionName("GetSoundVolumeOnChannel").SetIncludeFile("GDCpp/Extensions/Builtin/AudioTools.h");
    GetAllExpressions()["MusicChannelVolume"].SetFunctionName("GetMusicVolumeOnChannel").SetIncludeFile("GDCpp/Extensions/Builtin/AudioTools.h");
    GetAllExpressions()["SoundChannelPitch"].SetFunctionName("GetSoundPitchOnChannel").SetIncludeFile("GDCpp/Extensions/Builtin/AudioTools.h");
    GetAllExpressions()["MusicChannelPitch"].SetFunctionName("GetMusicPitchOnChannel").SetIncludeFile("GDCpp/Extensions/Builtin/AudioTools.h");
    GetAllExpressions()["GlobalVolume"].SetFunctionName("GetGlobalVolume").SetIncludeFile("GDCpp/Extensions/Builtin/AudioTools.h");
    #endif
}

#if defined(GD_IDE_ONLY)
void AudioExtension::ExposeActionsResources(gd::Instruction & action, gd::ArbitraryResourceWorker & worker)
{
    if ( action.GetType() == "PlaySound" || action.GetType() == "PlaySoundCanal" || action.GetType() == "PlayMusic" || action.GetType() == "PlayMusicCanal" )
    {
        gd::String parameter = action.GetParameter(1).GetPlainString();
        worker.ExposeAudio(parameter);
        action.SetParameter(1, parameter);
    }
}

void AudioExtension::GetPropertyForDebugger(RuntimeScene & scene, std::size_t propertyNb, gd::String & name, gd::String & value) const
{
    SoundManager & manager = scene.game->GetSoundManager();

    if ( propertyNb == 0 )
    {
        name = _("Global volume:");
        value = gd::String::From(manager.GetGlobalVolume());
    }
    else if ( propertyNb < 1+manager.sounds.size()*3 )
    {
        std::size_t soundNb = ((propertyNb-1)-(propertyNb-1)%3)/3;
        if (soundNb >= manager.sounds.size()) return;

        if ( propertyNb % 3 == 1)
        {
            sf::Sound::Status soundStatus = manager.sounds[soundNb]->GetStatus();

            if ( soundStatus == sf::Sound::Playing)
                name = _("Sound played:");
            else if ( soundStatus == sf::Sound::Stopped)
                name = _("Sound stopped:");
            else if ( soundStatus == sf::Sound::Paused)
                name = _("Paused sound:");

            value = manager.sounds[soundNb]->file;
        }
        else if ( propertyNb % 3 == 2)
        {
            name = _(" -Volume/Pitch:");
            value = gd::String::From(manager.sounds[soundNb]->GetVolume())
                    +"/"+gd::String::From(manager.sounds[soundNb]->GetPitch());
        }
        else
        {
            name = _(" -Progress (seconds) :");
            value = gd::String::From(manager.sounds[soundNb]->GetPlayingOffset());
        }

    }
    else if ( propertyNb < 1+manager.sounds.size()*3+manager.musics.size()*3 )
    {
        std::size_t musicNb = ((propertyNb-1-manager.sounds.size()*3)-(propertyNb-1-manager.sounds.size()*3)%3)/3;
        if (musicNb >= manager.musics.size()) return;

        if ( propertyNb % 3 == 1)
        {
            sf::Sound::Status soundStatus = manager.musics[musicNb]->GetStatus();

            if ( soundStatus == sf::Sound::Playing)
                name = _("Played music:");
            else if ( soundStatus == sf::Sound::Stopped)
                name = _("Stopped music:");
            else if ( soundStatus == sf::Sound::Paused)
                name = _("Paused music:");

            value = manager.musics[musicNb]->file;
        }
        else if ( propertyNb % 3 == 2)
        {
            name = _(" -Volume/Pitch:");
            value = gd::String::From(manager.musics[musicNb]->GetVolume())
                    +"/"+gd::String::From(manager.musics[musicNb]->GetPitch());
        }
        else
        {
            name = _(" -Progress (seconds) :");
            value = gd::String::From(manager.musics[musicNb]->GetPlayingOffset());
        }
    }
}

bool AudioExtension::ChangeProperty(RuntimeScene & scene, std::size_t propertyNb, gd::String newValue)
{
    SoundManager & manager = scene.game->GetSoundManager();

    if ( propertyNb == 0 )
    {
        manager.SetGlobalVolume(newValue.To<float>());
        return true;
    }
    else if ( propertyNb < 1+manager.sounds.size()*3 )
    {
        std::size_t soundNb = ((propertyNb-1)-(propertyNb-1)%3)/3;
        if (soundNb >= manager.sounds.size()) return false;

        if ( propertyNb % 3 == 1)
        {
            return false;
        }
        else if ( propertyNb % 3 == 2)
        {
            std::vector<gd::String> values = newValue.Split(U'/');
            if ( values.size() < 2 ) return false;

            manager.sounds[soundNb]->SetVolume(values[0].To<float>(), manager.GetGlobalVolume());
            manager.sounds[soundNb]->SetPitch(values[1].To<float>());
            return true;
        }
        else
        {
            manager.sounds[soundNb]->SetPlayingOffset(newValue.To<float>());
            return true;
        }

    }
    else if ( propertyNb < 1+manager.sounds.size()*3+manager.musics.size()*3 )
    {
        std::size_t musicNb = ((propertyNb-1-manager.sounds.size()*3)-(propertyNb-1-manager.sounds.size()*3)%3)/3;
        if (musicNb >= manager.musics.size()) return false;

        if ( propertyNb % 3 == 1)
        {
            return false;
        }
        else if ( propertyNb % 3 == 2)
        {
            std::vector<gd::String> values = newValue.Split(U'/');
            if ( values.size() < 2 ) return false;

            manager.musics[musicNb]->SetVolume(values[0].To<float>(), manager.GetGlobalVolume());
            manager.musics[musicNb]->SetPitch(values[1].To<float>());
            return true;
        }
        else
        {
            manager.musics[musicNb]->SetPlayingOffset(newValue.To<float>());
            return true;
        }
    }


    return false;
}

std::size_t AudioExtension::GetNumberOfProperties(RuntimeScene & scene) const
{
    SoundManager & manager = scene.game->GetSoundManager();

    return 1+manager.musics.size()*3+manager.sounds.size()*3;
}

#endif
