/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include "GDCpp/Runtime/SoundManager.h"
#include "GDCpp/Runtime/ResourcesLoader.h"
#include "GDCpp/Runtime/Project/ResourcesManager.h"
#include "GDCpp/Runtime/Music.h"
#include "GDCpp/Runtime/Sound.h"
#include "GDCpp/Runtime/String.h"
#include <iostream>
#include <string>
#include <vector>

SoundManager::SoundManager() :
    globalVolume(100),
    resourcesManager(nullptr)
{
}

const gd::String & SoundManager::GetFileFromSoundName(const gd::String & name) const
{
    if (!resourcesManager || !resourcesManager->HasResource(name))
        return name;

    return resourcesManager->GetResource(name).GetFile();
}

void SoundManager::PlaySoundOnChannel(const gd::String & name, unsigned int channel, bool repeat, float volume, float pitch)
{
    std::shared_ptr<Sound> sound = std::make_shared<Sound>(GetFileFromSoundName(name));
    sound->sound.play();

    SetSoundOnChannel(channel, sound);
    GetSoundOnChannel(channel)->sound.setLoop(repeat);
    GetSoundOnChannel(channel)->SetVolume(volume, globalVolume);
    GetSoundOnChannel(channel)->SetPitch(pitch);
}

void SoundManager::PlaySound(const gd::String & name, bool repeat, float volume, float pitch)
{
    sounds.push_back(std::shared_ptr<Sound>(new Sound(GetFileFromSoundName(name))));
    sounds.back()->sound.play();

    sounds.back()->sound.setLoop(repeat);
    sounds.back()->SetVolume(volume, globalVolume);
    sounds.back()->SetPitch(pitch);
}

void SoundManager::PlayMusic(const gd::String & name, bool repeat, float volume, float pitch)
{
    const gd::String & file = GetFileFromSoundName(name);
    std::shared_ptr<Music> music(new Music);
    #if !defined(GD_IDE_ONLY)
    gd::ResourcesLoader * ressourcesLoader = gd::ResourcesLoader::Get();
    if(ressourcesLoader->HasFile(file))
    {
        std::size_t size = ressourcesLoader->GetBinaryFileSize(file);
        music->SetBuffer(ressourcesLoader->LoadBinaryFile(file), size);
        music->OpenFromMemory(size);
    }
    else
    #endif
    {
        music->OpenFromFile(file);
    }

    musics.push_back(music);
    musics.back()->Play();

    music->SetLoop(repeat);
    music->SetVolume(volume, globalVolume);
    music->SetPitch(pitch);
}

void SoundManager::PlayMusicOnChannel(const gd::String & name, unsigned int channel , bool repeat, float volume, float pitch)
{
    const gd::String & file = GetFileFromSoundName(name);
    std::shared_ptr<Music> music(new Music);
    #if !defined(GD_IDE_ONLY)
    gd::ResourcesLoader * ressourcesLoader = gd::ResourcesLoader::Get();
    if(ressourcesLoader->HasFile(file))
    {
        std::size_t size = ressourcesLoader->GetBinaryFileSize(file);
        music->SetBuffer(ressourcesLoader->LoadBinaryFile(file), size);
        music->OpenFromMemory(size);
    }
    else
    #endif
    {
        music->OpenFromFile(file);
    }

    SetMusicOnChannel(channel, music);
    music->Play();

    music->SetLoop(repeat);
    music->SetVolume(volume, globalVolume);
    music->SetPitch(pitch);
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

    for (std::map<std::size_t, std::shared_ptr<Sound> >::iterator it = soundsChannel.begin();it != soundsChannel.end();++it)
    {
        if ( it->second != std::shared_ptr<Sound>() ) (it->second)->UpdateVolume(globalVolume);
    }
    for (std::map<std::size_t, std::shared_ptr<Music> >::iterator it = musicsChannel.begin();it != musicsChannel.end();++it)
    {
        if ( it->second != std::shared_ptr<Music>() ) it->second->UpdateVolume(globalVolume);
    }
    for (std::size_t i =0;i<sounds.size();++i)
    {
        if ( sounds[i] != std::shared_ptr<Sound>() ) sounds[i]->UpdateVolume(globalVolume);
    }
    for (std::size_t i =0;i<musics.size();++i)
    {
        if ( musics[i] != std::shared_ptr<Music>() ) musics[i]->UpdateVolume(globalVolume);
    }
}
