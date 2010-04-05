#include "GDL/Music.h"
#include <string>
#include <iostream>
#include <stdio.h>
#include <string.h>
#include "GDL/SoundManager.h"


using namespace std;

Music::Music() :
buffer(NULL),
volume(100)
{
    //ctor
}

Music::~Music()
{
    //dtor
}

bool Music::OpenFromFile(const string & filename)
{
    return music.OpenFromFile(filename);
}

void Music::SetBuffer(const char * newbuffer, std::size_t size)
{
    if ( buffer != NULL )
        delete buffer;

    buffer = new char[size];
    *buffer = *newbuffer;
}

bool Music::OpenFromMemory(std::size_t size)
{
    music.OpenFromMemory(buffer, size);

    return true;
}

void Music::Play()
{
    music.Play();
}

void Music::Pause()
{
    music.Pause();
}

void Music::Stop()
{
    music.Stop();
}

void Music::SetLoop(bool loop)
{
    music.SetLoop(loop);
}

////////////////////////////////////////////////////////////
/// Mise à jour du volume fictif de la musique
////////////////////////////////////////////////////////////
void Music::SetVolume(float volume_)
{
    volume = volume_;
    if ( volume < 0 ) volume = 0;
    if ( volume > 100 ) volume = 100;

    UpdateVolume(); //Mise à jour du volume réel
}

////////////////////////////////////////////////////////////
/// Mise à jour du volume réel de la musique en fonction du volume
/// global et de la musique
////////////////////////////////////////////////////////////
void Music::UpdateVolume()
{
    SoundManager * soundManager = SoundManager::getInstance();
    music.SetVolume(volume * soundManager->GetGlobalVolume()/100.f);
}
