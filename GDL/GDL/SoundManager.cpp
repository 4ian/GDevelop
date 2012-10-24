/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDL/SoundManager.h"
#include "GDL/Music.h"
#include "GDL/Sound.h"
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
    for ( unsigned int i = 0;i < sounds.size();i++ )
    {
        if ( sounds[i]->sound.getStatus() == sf::Sound::Stopped )
            sounds.erase( sounds.begin() + i );
    }

    for ( unsigned int i = 0;i < musics.size();i++ )
    {
        if ( musics[i]->GetStatus() == sf::Music::Stopped )
            musics.erase( musics.begin() + i );
    }
}

boost::shared_ptr<Music> & SoundManager::GetMusicOnChannel(int channel)
{
    return musicsChannel[channel];
}

void SoundManager::SetMusicOnChannel(int channel, boost::shared_ptr<Music> music)
{
    musicsChannel[channel] = music;
}

void SoundManager::SetSoundOnChannel(int channel, boost::shared_ptr<Sound> sound)
{
    soundsChannel[channel] = sound;
}

boost::shared_ptr<Sound> & SoundManager::GetSoundOnChannel(int channel)
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

    //Mise à jour des volumes des sons
    for (std::map<unsigned int, boost::shared_ptr<Sound> >::iterator it = soundsChannel.begin();it != soundsChannel.end();++it)
    {
        if ( it->second != boost::shared_ptr<Sound>() ) (it->second)->UpdateVolume();
    }
    for (std::map<unsigned int, boost::shared_ptr<Music> >::iterator it = musicsChannel.begin();it != musicsChannel.end();++it)
    {
        if ( it->second != boost::shared_ptr<Music>() ) it->second->UpdateVolume();
    }
    for (unsigned int i =0;i<sounds.size();++i)
    {
        if ( sounds[i] != boost::shared_ptr<Sound>() ) sounds[i]->UpdateVolume();
    }
    for (unsigned int i =0;i<musics.size();++i)
    {
        if ( musics[i] != boost::shared_ptr<Music>() ) musics[i]->UpdateVolume();
    }
}

