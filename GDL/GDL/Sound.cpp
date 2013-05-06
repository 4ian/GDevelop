/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDL/Sound.h"
#include <SFML/Audio.hpp>
#include <string>
#include <vector>
#include <iostream>
#include "GDL/RessourcesLoader.h"
#include "GDL/SoundManager.h"

using namespace std;


Sound::Sound(string pFile) :
file(pFile),
volume(100)
{
    buffer = gd::RessourcesLoader::GetInstance()->LoadSoundBuffer(file);
    sound.setBuffer(buffer);
}

Sound::Sound() :
volume(100)
{
    sound.setBuffer(buffer);
}

Sound::~Sound()
{
    //dtor
}

Sound::Sound(const Sound & copy) :
file(copy.file)
{
    buffer = gd::RessourcesLoader::GetInstance()->LoadSoundBuffer(file);
    sound.setBuffer(buffer);
}

////////////////////////////////////////////////////////////
/// Mise à jour du volume fictif du son
////////////////////////////////////////////////////////////
void Sound::SetVolume(float volume_)
{
    volume = volume_;
    if ( volume < 0 ) volume = 0;
    if ( volume > 100 ) volume = 100;

    UpdateVolume(); //Mise à jour du volume réel.
}

////////////////////////////////////////////////////////////
/// Mise à jour du volume réel du son en fonction du volume
/// global et du son.
////////////////////////////////////////////////////////////
void Sound::UpdateVolume()
{
    SoundManager * soundManager = SoundManager::GetInstance();

    sound.setVolume(volume*soundManager->GetGlobalVolume()/100.f);
}

