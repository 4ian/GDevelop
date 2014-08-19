/*
 * Game Develop C++ Platform
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
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
    GetAllActions()["PlaySoundCanal"].codeExtraInformation.SetFunctionName("PlaySoundOnChannel").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");
    GetAllActions()["StopSoundCanal"].codeExtraInformation.SetFunctionName("StopSoundOnChannel").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");
    GetAllActions()["PauseSoundCanal"].codeExtraInformation.SetFunctionName("PauseSoundOnChannel").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");
    GetAllActions()["RePlaySoundCanal"].codeExtraInformation.SetFunctionName("RePlaySoundOnChannel").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");
    GetAllActions()["PlayMusicCanal"].codeExtraInformation.SetFunctionName("PlayMusicOnChannel").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");
    GetAllActions()["StopMusicCanal"].codeExtraInformation.SetFunctionName("StopMusicOnChannel").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");
    GetAllActions()["PauseMusicCanal"].codeExtraInformation.SetFunctionName("PauseMusicOnChannel").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");
    GetAllActions()["RePlayMusicCanal"].codeExtraInformation.SetFunctionName("RePlayMusicOnChannel").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");
    GetAllActions()["ModVolumeSoundCanal"].codeExtraInformation.SetFunctionName("SetSoundVolumeOnChannel").SetManipulatedType("number").SetAssociatedGetter("GetSoundVolumeOnChannel").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");
    GetAllActions()["ModVolumeMusicCanal"].codeExtraInformation.SetFunctionName("SetMusicVolumeOnChannel").SetManipulatedType("number").SetAssociatedGetter("GetMusicVolumeOnChannel").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");
    GetAllActions()["ModGlobalVolume"].codeExtraInformation.SetFunctionName("SetGlobalVolume").SetAssociatedGetter("GetGlobalVolume").SetManipulatedType("number").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");
    GetAllActions()["ModPitchSoundChannel"].codeExtraInformation.SetFunctionName("SetSoundPitchOnChannel").SetAssociatedGetter("GetSoundPitchOnChannel").SetManipulatedType("number").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");
    GetAllActions()["ModPitchMusicChannel"].codeExtraInformation.SetFunctionName("SetMusicPitchOnChannel").SetAssociatedGetter("GetMusicPitchOnChannel").SetManipulatedType("number").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");
    GetAllActions()["ModPlayingOffsetSoundChannel"].codeExtraInformation.SetFunctionName("SetSoundPlayingOffsetOnChannel").SetAssociatedGetter("GetSoundPlayingOffsetOnChannel").SetManipulatedType("number").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");
    GetAllActions()["ModPlayingOffsetMusicChannel"].codeExtraInformation.SetFunctionName("SetMusicPlayingOffsetOnChannel").SetAssociatedGetter("GetMusicPlayingOffsetOnChannel").SetManipulatedType("number").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");
    GetAllActions()["PlaySound"].codeExtraInformation.SetFunctionName("PlaySound").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");
    GetAllActions()["PlayMusic"].codeExtraInformation.SetFunctionName("PlayMusic").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");

    GetAllConditions()["MusicPlaying"].codeExtraInformation.SetFunctionName("MusicPlaying").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");
    GetAllConditions()["MusicPaused"].codeExtraInformation.SetFunctionName("MusicPaused").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");
    GetAllConditions()["MusicStopped"].codeExtraInformation.SetFunctionName("MusicStopped").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");
    GetAllConditions()["SoundPlaying"].codeExtraInformation.SetFunctionName("SoundPlaying").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");
    GetAllConditions()["SoundPaused"].codeExtraInformation.SetFunctionName("SoundPaused").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");
    GetAllConditions()["SoundStopped"].codeExtraInformation.SetFunctionName("SoundStopped").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");
    GetAllConditions()["SoundCanalVolume"].codeExtraInformation.SetFunctionName("GetSoundVolumeOnChannel").SetManipulatedType("number").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");
    GetAllConditions()["MusicCanalVolume"].codeExtraInformation.SetFunctionName("GetMusicVolumeOnChannel").SetManipulatedType("number").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");
    GetAllConditions()["GlobalVolume"].codeExtraInformation.SetFunctionName("GetGlobalVolume").SetManipulatedType("number").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");
    GetAllConditions()["SoundChannelPitch"].codeExtraInformation.SetFunctionName("GetSoundPitchOnChannel").SetManipulatedType("number").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");
    GetAllConditions()["MusicChannelPitch"].codeExtraInformation.SetFunctionName("GetMusicPitchOnChannel").SetManipulatedType("number").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");
    GetAllConditions()["SoundChannelPlayingOffset"].codeExtraInformation.SetFunctionName("GetSoundPlayingOffsetOnChannel").SetManipulatedType("number").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");
    GetAllConditions()["MusicChannelPlayingOffset"].codeExtraInformation.SetFunctionName("GetMusicPlayingOffsetOnChannel").SetManipulatedType("number").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");

    GetAllExpressions()["SoundChannelPlayingOffset"].codeExtraInformation.SetFunctionName("GetSoundPlayingOffsetOnChannel").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");
    GetAllExpressions()["MusicChannelPlayingOffset"].codeExtraInformation.SetFunctionName("GetMusicPlayingOffsetOnChannel").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");
    GetAllExpressions()["SoundChannelVolume"].codeExtraInformation.SetFunctionName("GetSoundVolumeOnChannel").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");
    GetAllExpressions()["MusicChannelVolume"].codeExtraInformation.SetFunctionName("GetMusicVolumeOnChannel").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");
    GetAllExpressions()["SoundChannelPitch"].codeExtraInformation.SetFunctionName("GetSoundPitchOnChannel").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");
    GetAllExpressions()["MusicChannelPitch"].codeExtraInformation.SetFunctionName("GetMusicPitchOnChannel").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");
    GetAllExpressions()["GlobalVolume"].codeExtraInformation.SetFunctionName("GetGlobalVolume").SetIncludeFile("GDCpp/BuiltinExtensions/AudioTools.h");
    #endif
}

#if defined(GD_IDE_ONLY)
void AudioExtension::ExposeActionsResources(gd::Instruction & action, gd::ArbitraryResourceWorker & worker)
{
    if ( action.GetType() == "PlaySound" || action.GetType() == "PlaySoundCanal" || action.GetType() == "PlayMusic" || action.GetType() == "PlayMusicCanal" )
    {
        std::string parameter = action.GetParameter(1).GetPlainString();
        worker.ExposeFile(parameter);
        action.SetParameter(1, parameter);
    }
}

void AudioExtension::GetPropertyForDebugger(RuntimeScene & scene, unsigned int propertyNb, std::string & name, std::string & value) const
{
    if ( propertyNb == 0 )
    {
        name = _("Global volume:");
        value = ToString(SoundManager::Get()->GetGlobalVolume());
    }
    else if ( propertyNb < 1+SoundManager::Get()->sounds.size()*3 )
    {
        unsigned int soundNb = ((propertyNb-1)-(propertyNb-1)%3)/3;
        if (soundNb >= SoundManager::Get()->sounds.size()) return;

        if ( propertyNb % 3 == 1)
        {
            sf::Sound::Status soundStatus = SoundManager::Get()->sounds[soundNb]->GetStatus();

            if ( soundStatus == sf::Sound::Playing)
                name = _("Sound played:");
            else if ( soundStatus == sf::Sound::Stopped)
                name = _("Sound stopped:");
            else if ( soundStatus == sf::Sound::Paused)
                name = _("Paused sound:");

            value = SoundManager::Get()->sounds[soundNb]->file;
        }
        else if ( propertyNb % 3 == 2)
        {
            name = _(" -Volume/Pitch:");
            value = ToString(SoundManager::Get()->sounds[soundNb]->GetVolume())
                    +"/"+ToString(SoundManager::Get()->sounds[soundNb]->GetPitch());
        }
        else
        {
            name = _(" -Progress (seconds) :");
            value = ToString(SoundManager::Get()->sounds[soundNb]->GetPlayingOffset());
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
                name = _("Played music:");
            else if ( soundStatus == sf::Sound::Stopped)
                name = _("Stopped music:");
            else if ( soundStatus == sf::Sound::Paused)
                name = _("Paused music:");

            value = SoundManager::Get()->musics[musicNb]->file;
        }
        else if ( propertyNb % 3 == 2)
        {
            name = _(" -Volume/Pitch:");
            value = ToString(SoundManager::Get()->musics[musicNb]->GetVolume())
                    +"/"+ToString(SoundManager::Get()->musics[musicNb]->GetPitch());
        }
        else
        {
            name = _(" -Progress (seconds) :");
            value = ToString(SoundManager::Get()->musics[musicNb]->GetPlayingOffset());
        }
    }
}

bool AudioExtension::ChangeProperty(RuntimeScene & scene, unsigned int propertyNb, std::string newValue)
{
    if ( propertyNb == 0 )
    {
        SoundManager::Get()->SetGlobalVolume(ToFloat(newValue));
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
            std::vector<string> values = SplitString<string>(newValue, '/');
            if ( values.size() < 2 ) return false;

            SoundManager::Get()->sounds[soundNb]->SetVolume(ToFloat(values[0]));
            SoundManager::Get()->sounds[soundNb]->SetPitch(ToFloat(values[1]));
            return true;
        }
        else
        {
            SoundManager::Get()->sounds[soundNb]->SetPlayingOffset(ToFloat(newValue));
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
            std::vector<string> values = SplitString<string>(newValue, '/');
            if ( values.size() < 2 ) return false;

            SoundManager::Get()->musics[musicNb]->SetVolume(ToFloat(values[0]));
            SoundManager::Get()->musics[musicNb]->SetPitch(ToFloat(values[1]));
            return true;
        }
        else
        {
            SoundManager::Get()->musics[musicNb]->SetPlayingOffset(ToFloat(newValue));
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

