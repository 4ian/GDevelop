/*
 * GDevelop C++ Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#include <iostream>
#include "GDCore/BuiltinExtensions/AllBuiltinExtensions.h"
#include "GDCpp/BuiltinExtensions/AudioExtension.h"
#include "GDCpp/SoundManager.h"
#include "GDCpp/CommonTools.h"
#if defined(GD_IDE_ONLY)
#include "GDCore/IDE/ArbitraryResourceWorker.h"
#include "GDCore/Events/Instruction.h"
#endif
#if !defined(GD_IDE_ONLY)
#include "GDCore/BuiltinExtensions/AudioExtension.cpp"
#endif

AudioExtension::AudioExtension()
{
    gd::BuiltinExtensionsImplementer::ImplementsAudioExtension(*this);

    #if defined(GD_IDE_ONLY)
    GetAllActions()["PlaySoundCanal"].SetFunctionName("PlaySoundOnChannel").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");
    GetAllActions()["StopSoundCanal"].SetFunctionName("StopSoundOnChannel").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");
    GetAllActions()["PauseSoundCanal"].SetFunctionName("PauseSoundOnChannel").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");
    GetAllActions()["RePlaySoundCanal"].SetFunctionName("RePlaySoundOnChannel").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");
    GetAllActions()["PlayMusicCanal"].SetFunctionName("PlayMusicOnChannel").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");
    GetAllActions()["StopMusicCanal"].SetFunctionName("StopMusicOnChannel").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");
    GetAllActions()["PauseMusicCanal"].SetFunctionName("PauseMusicOnChannel").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");
    GetAllActions()["RePlayMusicCanal"].SetFunctionName("RePlayMusicOnChannel").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");
    GetAllActions()["ModVolumeSoundCanal"].SetFunctionName("SetSoundVolumeOnChannel").SetManipulatedType("number").SetGetter("GetSoundVolumeOnChannel").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");
    GetAllActions()["ModVolumeMusicCanal"].SetFunctionName("SetMusicVolumeOnChannel").SetManipulatedType("number").SetGetter("GetMusicVolumeOnChannel").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");
    GetAllActions()["ModGlobalVolume"].SetFunctionName("SetGlobalVolume").SetGetter("GetGlobalVolume").SetManipulatedType("number").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");
    GetAllActions()["ModPitchSoundChannel"].SetFunctionName("SetSoundPitchOnChannel").SetGetter("GetSoundPitchOnChannel").SetManipulatedType("number").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");
    GetAllActions()["ModPitchMusicChannel"].SetFunctionName("SetMusicPitchOnChannel").SetGetter("GetMusicPitchOnChannel").SetManipulatedType("number").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");
    GetAllActions()["ModPlayingOffsetSoundChannel"].SetFunctionName("SetSoundPlayingOffsetOnChannel").SetGetter("GetSoundPlayingOffsetOnChannel").SetManipulatedType("number").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");
    GetAllActions()["ModPlayingOffsetMusicChannel"].SetFunctionName("SetMusicPlayingOffsetOnChannel").SetGetter("GetMusicPlayingOffsetOnChannel").SetManipulatedType("number").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");
    GetAllActions()["PlaySound"].SetFunctionName("PlaySound").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");
    GetAllActions()["PlayMusic"].SetFunctionName("PlayMusic").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");

    GetAllConditions()["MusicPlaying"].SetFunctionName("MusicPlaying").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");
    GetAllConditions()["MusicPaused"].SetFunctionName("MusicPaused").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");
    GetAllConditions()["MusicStopped"].SetFunctionName("MusicStopped").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");
    GetAllConditions()["SoundPlaying"].SetFunctionName("SoundPlaying").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");
    GetAllConditions()["SoundPaused"].SetFunctionName("SoundPaused").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");
    GetAllConditions()["SoundStopped"].SetFunctionName("SoundStopped").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");
    GetAllConditions()["SoundCanalVolume"].SetFunctionName("GetSoundVolumeOnChannel").SetManipulatedType("number").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");
    GetAllConditions()["MusicCanalVolume"].SetFunctionName("GetMusicVolumeOnChannel").SetManipulatedType("number").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");
    GetAllConditions()["GlobalVolume"].SetFunctionName("GetGlobalVolume").SetManipulatedType("number").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");
    GetAllConditions()["SoundChannelPitch"].SetFunctionName("GetSoundPitchOnChannel").SetManipulatedType("number").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");
    GetAllConditions()["MusicChannelPitch"].SetFunctionName("GetMusicPitchOnChannel").SetManipulatedType("number").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");
    GetAllConditions()["SoundChannelPlayingOffset"].SetFunctionName("GetSoundPlayingOffsetOnChannel").SetManipulatedType("number").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");
    GetAllConditions()["MusicChannelPlayingOffset"].SetFunctionName("GetMusicPlayingOffsetOnChannel").SetManipulatedType("number").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");

    GetAllExpressions()["SoundChannelPlayingOffset"].SetFunctionName("GetSoundPlayingOffsetOnChannel").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");
    GetAllExpressions()["MusicChannelPlayingOffset"].SetFunctionName("GetMusicPlayingOffsetOnChannel").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");
    GetAllExpressions()["SoundChannelVolume"].SetFunctionName("GetSoundVolumeOnChannel").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");
    GetAllExpressions()["MusicChannelVolume"].SetFunctionName("GetMusicVolumeOnChannel").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");
    GetAllExpressions()["SoundChannelPitch"].SetFunctionName("GetSoundPitchOnChannel").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");
    GetAllExpressions()["MusicChannelPitch"].SetFunctionName("GetMusicPitchOnChannel").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");
    GetAllExpressions()["GlobalVolume"].SetFunctionName("GetGlobalVolume").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");
    #endif
}

#if defined(GD_IDE_ONLY)
void AudioExtension::ExposeActionsResources(gd::Instruction & action, gd::ArbitraryResourceWorker & worker)
{
    if ( action.GetType() == "PlaySound" || action.GetType() == "PlaySoundCanal" || action.GetType() == "PlayMusic" || action.GetType() == "PlayMusicCanal" )
    {
        gd::String parameter = action.GetParameter(1).GetPlainString();
        worker.ExposeFile(parameter);
        action.SetParameter(1, parameter);
    }
}

void AudioExtension::GetPropertyForDebugger(RuntimeScene & scene, unsigned int propertyNb, gd::String & name, gd::String & value) const
{
    if ( propertyNb == 0 )
    {
        name = GD_T("Global volume:");
        value = gd::String::FromFloat(SoundManager::Get()->GetGlobalVolume());
    }
    else if ( propertyNb < 1+SoundManager::Get()->sounds.size()*3 )
    {
        unsigned int soundNb = ((propertyNb-1)-(propertyNb-1)%3)/3;
        if (soundNb >= SoundManager::Get()->sounds.size()) return;

        if ( propertyNb % 3 == 1)
        {
            sf::Sound::Status soundStatus = SoundManager::Get()->sounds[soundNb]->GetStatus();

            if ( soundStatus == sf::Sound::Playing)
                name = GD_T("Sound played:");
            else if ( soundStatus == sf::Sound::Stopped)
                name = GD_T("Sound stopped:");
            else if ( soundStatus == sf::Sound::Paused)
                name = GD_T("Paused sound:");

            value = SoundManager::Get()->sounds[soundNb]->file;
        }
        else if ( propertyNb % 3 == 2)
        {
            name = GD_T(" -Volume/Pitch:");
            value = gd::String::FromFloat(SoundManager::Get()->sounds[soundNb]->GetVolume())
                    +"/"+gd::String::FromFloat(SoundManager::Get()->sounds[soundNb]->GetPitch());
        }
        else
        {
            name = GD_T(" -Progress (seconds) :");
            value = gd::String::FromFloat(SoundManager::Get()->sounds[soundNb]->GetPlayingOffset());
        }

    }
    else if ( propertyNb < 1+SoundManager::Get()->sounds.size()*3+SoundManager::Get()->musics.size()*3 )
    {
        unsigned int musicNb = ((propertyNb-1-SoundManager::Get()->sounds.size()*3)-(propertyNb-1-SoundManager::Get()->sounds.size()*3)%3)/3;
        if (musicNb >= SoundManager::Get()->musics.size()) return;

        if ( propertyNb % 3 == 1)
        {
            sf::Sound::Status soundStatus = SoundManager::Get()->musics[musicNb]->GetStatus();

            if ( soundStatus == sf::Sound::Playing)
                name = GD_T("Played music:");
            else if ( soundStatus == sf::Sound::Stopped)
                name = GD_T("Stopped music:");
            else if ( soundStatus == sf::Sound::Paused)
                name = GD_T("Paused music:");

            value = SoundManager::Get()->musics[musicNb]->file;
        }
        else if ( propertyNb % 3 == 2)
        {
            name = GD_T(" -Volume/Pitch:");
            value = gd::String::FromFloat(SoundManager::Get()->musics[musicNb]->GetVolume())
                    +"/"+gd::String::FromFloat(SoundManager::Get()->musics[musicNb]->GetPitch());
        }
        else
        {
            name = GD_T(" -Progress (seconds) :");
            value = gd::String::FromFloat(SoundManager::Get()->musics[musicNb]->GetPlayingOffset());
        }
    }
}

bool AudioExtension::ChangeProperty(RuntimeScene & scene, unsigned int propertyNb, gd::String newValue)
{
    if ( propertyNb == 0 )
    {
        SoundManager::Get()->SetGlobalVolume(newValue.ToFloat());
        return true;
    }
    else if ( propertyNb < 1+SoundManager::Get()->sounds.size()*3 )
    {
        unsigned int soundNb = ((propertyNb-1)-(propertyNb-1)%3)/3;
        if (soundNb >= SoundManager::Get()->sounds.size()) return false;

        if ( propertyNb % 3 == 1)
        {
            return false;
        }
        else if ( propertyNb % 3 == 2)
        {
            std::vector<gd::String> values = newValue.Split(U'/');
            if ( values.size() < 2 ) return false;

            SoundManager::Get()->sounds[soundNb]->SetVolume(values[0].ToInt());
            SoundManager::Get()->sounds[soundNb]->SetPitch(values[1].ToFloat());
            return true;
        }
        else
        {
            SoundManager::Get()->sounds[soundNb]->SetPlayingOffset(newValue.ToFloat());
            return true;
        }

    }
    else if ( propertyNb < 1+SoundManager::Get()->sounds.size()*3+SoundManager::Get()->musics.size()*3 )
    {
        unsigned int musicNb = ((propertyNb-1-SoundManager::Get()->sounds.size()*3)-(propertyNb-1-SoundManager::Get()->sounds.size()*3)%3)/3;
        if (musicNb >= SoundManager::Get()->musics.size()) return false;

        if ( propertyNb % 3 == 1)
        {
            return false;
        }
        else if ( propertyNb % 3 == 2)
        {
            std::vector<gd::String> values = newValue.Split(U'/');
            if ( values.size() < 2 ) return false;

            SoundManager::Get()->musics[musicNb]->SetVolume(values[0].ToFloat());
            SoundManager::Get()->musics[musicNb]->SetPitch(values[1].ToFloat());
            return true;
        }
        else
        {
            SoundManager::Get()->musics[musicNb]->SetPlayingOffset(newValue.ToFloat());
            return true;
        }
    }


    return false;
}

unsigned int AudioExtension::GetNumberOfProperties(RuntimeScene & scene) const
{
    return 1+SoundManager::Get()->musics.size()*3+SoundManager::Get()->sounds.size()*3;
}

#endif
