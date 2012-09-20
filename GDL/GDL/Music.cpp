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
    #if defined(GDE)
    file = filename;
    #endif
    return music.OpenFromFile(filename);
}

void Music::SetBuffer(const char * newbuffer, std::size_t size)
{
    if ( newbuffer == NULL )
    {
        cout << "Tried to change buffer of a music to a NULL buffer";
        return;
    }

    if ( buffer != NULL )
        delete buffer;

    buffer = new char[size];
    memcpy(buffer, newbuffer, size);
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

void Music::SetVolume(float volume_)
{
    volume = volume_;
    if ( volume < 0 ) volume = 0;
    if ( volume > 100 ) volume = 100;

    UpdateVolume(); //Mise à jour du volume réel
}

void Music::UpdateVolume()
{
    SoundManager * soundManager = SoundManager::GetInstance();
    music.SetVolume(volume * soundManager->GetGlobalVolume()/100.f);
}

