#include "GDCpp/Music.h"
#include <string>
#include <iostream>
#include <stdio.h>
#include <string.h>
#include "GDCpp/SoundManager.h"

using namespace std;

Music::Music() :
    buffer(NULL),
    volume(100)
{
}

bool Music::OpenFromFile(const gd::String & filename)
{
    #if defined(GD_IDE_ONLY)
    file = filename;
    #endif
    return music.openFromFile(filename.ToLocale());
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

void Music::SetVolume(float volume_, float globalVolume)
{
    volume = volume_;
    if ( volume < 0 ) volume = 0;
    if ( volume > 100 ) volume = 100;

    UpdateVolume(globalVolume);
}

void Music::UpdateVolume(float globalVolume)
{
    music.setVolume(volume * globalVolume / 100.f);
}
