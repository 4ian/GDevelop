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
    return music.openFromFile(filename);
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
    music.openFromMemory(buffer, size);

    return true;
}

void Music::Play()
{
    music.play();
}

void Music::Pause()
{
    music.pause();
}

void Music::Stop()
{
    music.stop();
}

void Music::SetLoop(bool loop)
{
    music.setLoop(loop);
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
    music.setVolume(volume * SoundManager::GetInstance()->GetGlobalVolume()/100.f);
}

