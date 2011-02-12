/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDL/Son.h"
#include <SFML/Audio.hpp>
#include "GDL/MemTrace.h"
#include "GDL/RessourcesLoader.h"
#include <string>
#include <vector>
#include <iostream>
#include "GDL/SoundManager.h"

using namespace std;


Son::Son(string pFile) :
file(pFile),
volume(100)
{
    RessourcesLoader * ressourcesLoader = RessourcesLoader::GetInstance();

    buffer = ressourcesLoader->LoadSoundBuffer(file);
    sound.SetBuffer(buffer);
}

Son::Son() :
volume(100)
{
    sound.SetBuffer(buffer);
}

Son::~Son()
{
    //dtor
}

Son::Son(const Son & copy) :
file(copy.file)
{
    RessourcesLoader * ressourcesLoader = RessourcesLoader::GetInstance();

    buffer = ressourcesLoader->LoadSoundBuffer(file);
    sound.SetBuffer(buffer);
}

////////////////////////////////////////////////////////////
/// Mise à jour du volume fictif du son
////////////////////////////////////////////////////////////
void Son::SetVolume(float volume_)
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
void Son::UpdateVolume()
{
    SoundManager * soundManager = SoundManager::GetInstance();

    sound.SetVolume(volume*soundManager->GetGlobalVolume()/100.f);
}
