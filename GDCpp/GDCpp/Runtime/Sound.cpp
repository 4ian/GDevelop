/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include "GDCpp/Runtime/Sound.h"
#include <SFML/Audio.hpp>
#include <string>
#include <vector>
#include <iostream>
#include "GDCpp/Runtime/ResourcesLoader.h"
#include "GDCpp/Runtime/SoundManager.h"

using namespace std;

Sound::Sound(gd::String pFile) :
file(pFile),
volume(100)
{
    buffer = gd::ResourcesLoader::Get()->LoadSoundBuffer(file);
    sound.setBuffer(buffer);
}

Sound::Sound() :
volume(100)
{
    sound.setBuffer(buffer);
}

Sound::Sound(const Sound & copy) :
    file(copy.file)
{
    buffer = gd::ResourcesLoader::Get()->LoadSoundBuffer(file);
    sound.setBuffer(buffer);
}

void Sound::SetVolume(float volume_, float globalVolume)
{
    volume = volume_;
    if ( volume < 0 ) volume = 0;
    if ( volume > 100 ) volume = 100;

    UpdateVolume(globalVolume);
}

void Sound::UpdateVolume(float globalVolume)
{
    sound.setVolume(volume * globalVolume / 100.f);
}
