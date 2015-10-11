/*
 * GDevelop C++ Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include "AudioTools.h"
#include <string>
#include "GDCpp/RuntimeScene.h"
#include "GDCpp/SoundManager.h"
#include "GDCpp/ResourcesLoader.h"
#undef PlaySound //Gniark!

/**
 * Test if a music is played
 */
bool GD_API MusicPlaying( RuntimeScene & scene, unsigned int channel )
{
    if ( SoundManager::Get()->GetMusicOnChannel(channel) == std::shared_ptr<Music>() ) return false;

    return (SoundManager::Get()->GetMusicOnChannel(channel)->GetStatus() == sf::Music::Playing);
}

/**
 * Test if a music is paused
 */
bool GD_API MusicPaused( RuntimeScene & scene, unsigned int channel )
{
    if ( SoundManager::Get()->GetMusicOnChannel(channel) == std::shared_ptr<Music>() ) return false;

    return (SoundManager::Get()->GetMusicOnChannel(channel)->GetStatus() == sf::Music::Paused);
}

/**
 * Test if a music is stopped
 */
bool GD_API MusicStopped( RuntimeScene & scene, unsigned int channel )
{
    if ( SoundManager::Get()->GetMusicOnChannel(channel) == std::shared_ptr<Music>() ) return false;

    return (SoundManager::Get()->GetMusicOnChannel(channel)->GetStatus() == sf::Music::Stopped);
}


/**
 * Test if a sound is stopped
 */
bool GD_API SoundPlaying( RuntimeScene & scene, unsigned int channel )
{
    if ( SoundManager::Get()->GetSoundOnChannel(channel) == std::shared_ptr<Sound>() ) return false;

    return (SoundManager::Get()->GetSoundOnChannel(channel)->GetStatus() == sf::Sound::Playing);
}

/**
 * Test if a sound is stopped
 */
bool GD_API SoundPaused( RuntimeScene & scene, unsigned int channel )
{
    if ( SoundManager::Get()->GetSoundOnChannel(channel) == std::shared_ptr<Sound>() ) return false;

    return (SoundManager::Get()->GetSoundOnChannel(channel)->GetStatus() == sf::Sound::Paused);
}

/**
 * Test if a sound is stopped
 */
bool GD_API SoundStopped( RuntimeScene & scene, unsigned int channel )
{
    if ( SoundManager::Get()->GetSoundOnChannel(channel) == std::shared_ptr<Sound>() ) return false;

    return (SoundManager::Get()->GetSoundOnChannel(channel)->GetStatus() == sf::Sound::Stopped);
}

void GD_API PlaySoundOnChannel( RuntimeScene & scene, const gd::String & file, unsigned int channel, bool repeat, float volume, float pitch )
{
    sf::Clock latency;

    //Chargement
    SoundManager * soundManager = SoundManager::Get();

    //Son à jouer
    std::shared_ptr<Sound> sound = std::shared_ptr<Sound>(new Sound(file));
    sound->sound.play();

    soundManager->SetSoundOnChannel(channel, sound);
    soundManager->GetSoundOnChannel(channel)->sound.setLoop(repeat);
    soundManager->GetSoundOnChannel(channel)->SetVolume(volume);
    soundManager->GetSoundOnChannel(channel)->SetPitch(pitch);

    scene.GetTimeManager().NotifyPauseWasMade(latency.getElapsedTime().asMicroseconds());
}

void GD_API PlaySound( RuntimeScene & scene, const gd::String & file, bool repeat, float volume, float pitch )
{
    sf::Clock latency;

    SoundManager * soundManager = SoundManager::Get();
    soundManager->sounds.push_back(std::shared_ptr<Sound>(new Sound(file)));
    soundManager->sounds.back()->sound.play();
    soundManager->sounds.back()->sound.setLoop(repeat);
    soundManager->sounds.back()->SetVolume(volume);
    soundManager->sounds.back()->SetPitch(pitch);

    scene.GetTimeManager().NotifyPauseWasMade(latency.getElapsedTime().asMicroseconds());
}

void GD_API StopSoundOnChannel( RuntimeScene & scene, unsigned int channel )
{
    if ( SoundManager::Get()->GetSoundOnChannel(channel) == std::shared_ptr<Sound>() ) return;

    SoundManager::Get()->GetSoundOnChannel(channel)->sound.stop();
}

void GD_API PauseSoundOnChannel( RuntimeScene & scene, unsigned int channel )
{
    if ( SoundManager::Get()->GetSoundOnChannel(channel) == std::shared_ptr<Sound>() ) return;

    SoundManager::Get()->GetSoundOnChannel(channel)->sound.pause();
}

void GD_API RePlaySoundOnChannel( RuntimeScene & scene, unsigned int channel )
{
    if ( SoundManager::Get()->GetSoundOnChannel(channel) == std::shared_ptr<Sound>() ) return;

    SoundManager::Get()->GetSoundOnChannel(channel)->sound.play();
}

void GD_API PlayMusic( RuntimeScene & scene, const gd::String & file, bool repeat, float volume, float pitch )
{
    SoundManager * soundManager = SoundManager::Get();

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

    soundManager->musics.push_back(music); //Ajout aux soundManager qui prend en charge la musique
    soundManager->musics.back()->Play();

    music->SetLoop(repeat);
    music->SetVolume(volume);
    music->SetPitch(pitch);
}

void GD_API PlayMusicOnChannel( RuntimeScene & scene, const gd::String & file, unsigned int channel , bool repeat, float volume, float pitch )
{
    SoundManager * soundManager = SoundManager::Get();

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
    music->Play();

    soundManager->SetMusicOnChannel(channel, music); //Ajout au soundManager qui prend en charge la music
    music->SetLoop(repeat);
    music->SetVolume(volume);
    music->SetPitch(pitch);
}

void GD_API StopMusicOnChannel( RuntimeScene & scene, unsigned int channel )
{
    if ( SoundManager::Get()->GetMusicOnChannel(channel) == std::shared_ptr<Music>() ) return;

    SoundManager::Get()->GetMusicOnChannel(channel)->Stop();
}

void GD_API PauseMusicOnChannel( RuntimeScene & scene, unsigned int channel )
{
    if ( SoundManager::Get()->GetMusicOnChannel(channel) == std::shared_ptr<Music>() ) return;

    SoundManager::Get()->GetMusicOnChannel(channel)->Pause();
}

void GD_API RePlayMusicOnChannel( RuntimeScene & scene, unsigned int channel )
{
    if ( SoundManager::Get()->GetMusicOnChannel(channel) == std::shared_ptr<Music>() ) return;

    SoundManager::Get()->GetMusicOnChannel(channel)->Play();
}

void GD_API SetSoundVolumeOnChannel( RuntimeScene & scene, unsigned int channel, float volume )
{
    if ( SoundManager::Get()->GetSoundOnChannel(channel) == std::shared_ptr<Sound>() ) return;

    SoundManager::Get()->GetSoundOnChannel(channel)->SetVolume(volume);
}

void GD_API SetMusicVolumeOnChannel( RuntimeScene & scene, unsigned int channel, float volume )
{
    if ( SoundManager::Get()->GetMusicOnChannel(channel) == std::shared_ptr<Music>() ) return;

    SoundManager::Get()->GetMusicOnChannel(channel)->SetVolume(volume);
}

double GD_API GetSoundVolumeOnChannel( RuntimeScene & scene, unsigned int channel)
{
    if ( SoundManager::Get()->GetSoundOnChannel(channel) == std::shared_ptr<Sound>() ) return 0;

    return SoundManager::Get()->GetSoundOnChannel(channel)->GetVolume();
}

double GD_API GetMusicVolumeOnChannel( RuntimeScene & scene, unsigned int channel)
{
    if ( SoundManager::Get()->GetMusicOnChannel(channel) == std::shared_ptr<Music>() ) return 0;

    return SoundManager::Get()->GetMusicOnChannel(channel)->GetVolume();
}

void GD_API SetGlobalVolume( RuntimeScene & scene, float volume )
{
    SoundManager::Get()->SetGlobalVolume(volume);
}


double GD_API GetGlobalVolume( RuntimeScene & scene )
{
    return SoundManager::Get()->GetGlobalVolume();
}

void GD_API SetSoundPitchOnChannel( RuntimeScene & scene, unsigned int channel, float pitch )
{
    if ( SoundManager::Get()->GetSoundOnChannel(channel) == std::shared_ptr<Sound>() ) return;

    SoundManager::Get()->GetSoundOnChannel(channel)->SetPitch(pitch);
}

void GD_API SetMusicPitchOnChannel( RuntimeScene & scene, unsigned int channel, float pitch )
{
    if ( SoundManager::Get()->GetMusicOnChannel(channel) == std::shared_ptr<Music>() ) return;

    SoundManager::Get()->GetMusicOnChannel(channel)->SetPitch(pitch);
}

double GD_API GetSoundPitchOnChannel( RuntimeScene & scene, unsigned int channel)
{
    if ( SoundManager::Get()->GetSoundOnChannel(channel) == std::shared_ptr<Sound>() ) return 0;

    return SoundManager::Get()->GetSoundOnChannel(channel)->GetPitch();
}

double GD_API GetMusicPitchOnChannel( RuntimeScene & scene, unsigned int channel)
{
    if ( SoundManager::Get()->GetMusicOnChannel(channel) == std::shared_ptr<Music>() ) return 0;

    return SoundManager::Get()->GetMusicOnChannel(channel)->GetPitch();
}

void GD_API SetSoundPlayingOffsetOnChannel( RuntimeScene & scene, unsigned int channel, float playingOffset )
{
    if ( SoundManager::Get()->GetSoundOnChannel(channel) == std::shared_ptr<Sound>() ) return;

    SoundManager::Get()->GetSoundOnChannel(channel)->SetPlayingOffset(playingOffset);
}

void GD_API SetMusicPlayingOffsetOnChannel( RuntimeScene & scene, unsigned int channel, float playingOffset )
{
    if ( SoundManager::Get()->GetMusicOnChannel(channel) == std::shared_ptr<Music>() ) return;

    SoundManager::Get()->GetMusicOnChannel(channel)->SetPlayingOffset(playingOffset);
}

double GD_API GetSoundPlayingOffsetOnChannel( RuntimeScene & scene, unsigned int channel)
{
    if ( SoundManager::Get()->GetSoundOnChannel(channel) == std::shared_ptr<Sound>() ) return 0;

    return static_cast<double>(SoundManager::Get()->GetSoundOnChannel(channel)->GetPlayingOffset());
}

double GD_API GetMusicPlayingOffsetOnChannel( RuntimeScene & scene, unsigned int channel)
{
    if ( SoundManager::Get()->GetMusicOnChannel(channel) == std::shared_ptr<Music>() ) return 0;

    return static_cast<double>(SoundManager::Get()->GetMusicOnChannel(channel)->GetPlayingOffset());
}
