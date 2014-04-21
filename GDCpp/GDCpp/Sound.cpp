/** \file
 *  Game Develop
 *  2008-2014 Florian Rival (Florian.Rival@gmail.com)
 */
#include "GDCpp/Sound.h"
#include <SFML/Audio.hpp>
#include <string>
#include <vector>
#include <iostream>
#include "GDCpp/RessourcesLoader.h"
#include "GDCpp/SoundManager.h"

using namespace std;

Sound::Sound(string pFile) :
file(pFile),
volume(100)
{
    buffer = gd::RessourcesLoader::Get()->LoadSoundBuffer(file);
    sound.setBuffer(buffer);
}

Sound::Sound() :
volume(100)
{
    sound.setBuffer(buffer);
}

Sound::~Sound()
{
}

Sound::Sound(const Sound & copy) :
    file(copy.file)
{
    buffer = gd::RessourcesLoader::Get()->LoadSoundBuffer(file);
    sound.setBuffer(buffer);
}

void Sound::SetVolume(float volume_)
{
    volume = volume_;
    if ( volume < 0 ) volume = 0;
    if ( volume > 100 ) volume = 100;

    UpdateVolume();
}

void Sound::UpdateVolume()
{
    SoundManager * soundManager = SoundManager::Get();

    sound.setVolume(volume*soundManager->GetGlobalVolume()/100.f);
}