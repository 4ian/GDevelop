/*
 * GDevelop C++ Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include "GDCpp/SoundManager.h"
#include "GDCpp/Music.h"
#include "GDCpp/Sound.h"
#include <iostream>
#include <string>
#include <vector>

using namespace std;

SoundManager *SoundManager::_singleton = NULL;

SoundManager::SoundManager() :
globalVolume(100)
{
}

SoundManager::~SoundManager()
{
}

void SoundManager::ManageGarbage()
{
    for ( std::size_t i = 0;i < sounds.size();i++ )
    {
        if ( sounds[i]->sound.getStatus() == sf::Sound::Stopped )
            sounds.erase( sounds.begin() + i );
    }

    for ( std::size_t i = 0;i < musics.size();i++ )
    {
        if ( musics[i]->GetStatus() == sf::Music::Stopped )
            musics.erase( musics.begin() + i );
    }
}

std::shared_ptr<Music> & SoundManager::GetMusicOnChannel(int channel)
{
    return musicsChannel[channel];
}

void SoundManager::SetMusicOnChannel(int channel, std::shared_ptr<Music> music)
{
    musicsChannel[channel] = music;
}

void SoundManager::SetSoundOnChannel(int channel, std::shared_ptr<Sound> sound)
{
    soundsChannel[channel] = sound;
}

std::shared_ptr<Sound> & SoundManager::GetSoundOnChannel(int channel)
{
    return soundsChannel[channel];
}


void SoundManager::SetGlobalVolume(float volume)
{
    globalVolume = volume;

    if ( globalVolume < 0.0 )
        globalVolume = 0.0;

    if ( globalVolume > 100.0 )
        globalVolume = 100.0;

    //Mise � jour des volumes des sons
    for (std::map<std::size_t, std::shared_ptr<Sound> >::iterator it = soundsChannel.begin();it != soundsChannel.end();++it)
    {
        if ( it->second != std::shared_ptr<Sound>() ) (it->second)->UpdateVolume();
    }
    for (std::map<std::size_t, std::shared_ptr<Music> >::iterator it = musicsChannel.begin();it != musicsChannel.end();++it)
    {
        if ( it->second != std::shared_ptr<Music>() ) it->second->UpdateVolume();
    }
    for (std::size_t i =0;i<sounds.size();++i)
    {
        if ( sounds[i] != std::shared_ptr<Sound>() ) sounds[i]->UpdateVolume();
    }
    for (std::size_t i =0;i<musics.size();++i)
    {
        if ( musics[i] != std::shared_ptr<Music>() ) musics[i]->UpdateVolume();
    }
}
