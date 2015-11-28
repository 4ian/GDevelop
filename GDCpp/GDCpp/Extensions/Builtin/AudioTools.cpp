/*
 * GDevelop C++ Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include "AudioTools.h"
#include <string>
#include "GDCpp/RuntimeGame.h"
#include "GDCpp/RuntimeScene.h"
#include "GDCpp/SoundManager.h"
#undef PlaySound //Avoid a nasty macro from polluting everything

/**
 * Test if a music is played
 */
bool GD_API MusicPlaying( RuntimeScene & scene, unsigned int channel )
{
    if ( scene.game->GetSoundManager().GetMusicOnChannel(channel) == std::shared_ptr<Music>() ) return false;

    return (scene.game->GetSoundManager().GetMusicOnChannel(channel)->GetStatus() == sf::Music::Playing);
}

/**
 * Test if a music is paused
 */
bool GD_API MusicPaused( RuntimeScene & scene, unsigned int channel )
{
    if ( scene.game->GetSoundManager().GetMusicOnChannel(channel) == std::shared_ptr<Music>() ) return false;

    return (scene.game->GetSoundManager().GetMusicOnChannel(channel)->GetStatus() == sf::Music::Paused);
}

/**
 * Test if a music is stopped
 */
bool GD_API MusicStopped( RuntimeScene & scene, unsigned int channel )
{
    if ( scene.game->GetSoundManager().GetMusicOnChannel(channel) == std::shared_ptr<Music>() ) return false;

    return (scene.game->GetSoundManager().GetMusicOnChannel(channel)->GetStatus() == sf::Music::Stopped);
}


/**
 * Test if a sound is stopped
 */
bool GD_API SoundPlaying( RuntimeScene & scene, unsigned int channel )
{
    if ( scene.game->GetSoundManager().GetSoundOnChannel(channel) == std::shared_ptr<Sound>() ) return false;

    return (scene.game->GetSoundManager().GetSoundOnChannel(channel)->GetStatus() == sf::Sound::Playing);
}

/**
 * Test if a sound is stopped
 */
bool GD_API SoundPaused( RuntimeScene & scene, unsigned int channel )
{
    if ( scene.game->GetSoundManager().GetSoundOnChannel(channel) == std::shared_ptr<Sound>() ) return false;

    return (scene.game->GetSoundManager().GetSoundOnChannel(channel)->GetStatus() == sf::Sound::Paused);
}

/**
 * Test if a sound is stopped
 */
bool GD_API SoundStopped( RuntimeScene & scene, unsigned int channel )
{
    if ( scene.game->GetSoundManager().GetSoundOnChannel(channel) == std::shared_ptr<Sound>() ) return false;

    return (scene.game->GetSoundManager().GetSoundOnChannel(channel)->GetStatus() == sf::Sound::Stopped);
}

void GD_API PlaySoundOnChannel( RuntimeScene & scene, const gd::String & file, unsigned int channel, bool repeat, float volume, float pitch )
{
    sf::Clock latency;

    scene.game->GetSoundManager().PlaySoundOnChannel(file, channel, repeat, volume, pitch);

    scene.GetTimeManager().NotifyPauseWasMade(latency.getElapsedTime().asMicroseconds());
}

void GD_API PlaySound( RuntimeScene & scene, const gd::String & file, bool repeat, float volume, float pitch )
{
    sf::Clock latency;

    scene.game->GetSoundManager().PlaySound(file, repeat, volume, pitch);

    scene.GetTimeManager().NotifyPauseWasMade(latency.getElapsedTime().asMicroseconds());
}

void GD_API StopSoundOnChannel( RuntimeScene & scene, unsigned int channel )
{
    if ( scene.game->GetSoundManager().GetSoundOnChannel(channel) == std::shared_ptr<Sound>() ) return;

    scene.game->GetSoundManager().GetSoundOnChannel(channel)->sound.stop();
}

void GD_API PauseSoundOnChannel( RuntimeScene & scene, unsigned int channel )
{
    if ( scene.game->GetSoundManager().GetSoundOnChannel(channel) == std::shared_ptr<Sound>() ) return;

    scene.game->GetSoundManager().GetSoundOnChannel(channel)->sound.pause();
}

void GD_API RePlaySoundOnChannel( RuntimeScene & scene, unsigned int channel )
{
    if ( scene.game->GetSoundManager().GetSoundOnChannel(channel) == std::shared_ptr<Sound>() ) return;

    scene.game->GetSoundManager().GetSoundOnChannel(channel)->sound.play();
}

void GD_API PlayMusic( RuntimeScene & scene, const gd::String & file, bool repeat, float volume, float pitch )
{
    scene.game->GetSoundManager().PlayMusic(file, repeat, volume, pitch);
}

void GD_API PlayMusicOnChannel( RuntimeScene & scene, const gd::String & file, unsigned int channel , bool repeat, float volume, float pitch )
{
    scene.game->GetSoundManager().PlayMusicOnChannel(file, channel, repeat, volume, pitch);
}

void GD_API StopMusicOnChannel( RuntimeScene & scene, unsigned int channel )
{
    if ( scene.game->GetSoundManager().GetMusicOnChannel(channel) == std::shared_ptr<Music>() ) return;

    scene.game->GetSoundManager().GetMusicOnChannel(channel)->Stop();
}

void GD_API PauseMusicOnChannel( RuntimeScene & scene, unsigned int channel )
{
    if ( scene.game->GetSoundManager().GetMusicOnChannel(channel) == std::shared_ptr<Music>() ) return;

    scene.game->GetSoundManager().GetMusicOnChannel(channel)->Pause();
}

void GD_API RePlayMusicOnChannel( RuntimeScene & scene, unsigned int channel )
{
    if ( scene.game->GetSoundManager().GetMusicOnChannel(channel) == std::shared_ptr<Music>() ) return;

    scene.game->GetSoundManager().GetMusicOnChannel(channel)->Play();
}

void GD_API SetSoundVolumeOnChannel( RuntimeScene & scene, unsigned int channel, float volume )
{
    if ( scene.game->GetSoundManager().GetSoundOnChannel(channel) == std::shared_ptr<Sound>() ) return;

    scene.game->GetSoundManager().GetSoundOnChannel(channel)->SetVolume(volume, scene.game->GetSoundManager().GetGlobalVolume());
}

void GD_API SetMusicVolumeOnChannel( RuntimeScene & scene, unsigned int channel, float volume )
{
    if ( scene.game->GetSoundManager().GetMusicOnChannel(channel) == std::shared_ptr<Music>() ) return;

    scene.game->GetSoundManager().GetMusicOnChannel(channel)->SetVolume(volume, scene.game->GetSoundManager().GetGlobalVolume());
}

double GD_API GetSoundVolumeOnChannel( RuntimeScene & scene, unsigned int channel)
{
    if ( scene.game->GetSoundManager().GetSoundOnChannel(channel) == std::shared_ptr<Sound>() ) return 0;

    return scene.game->GetSoundManager().GetSoundOnChannel(channel)->GetVolume();
}

double GD_API GetMusicVolumeOnChannel( RuntimeScene & scene, unsigned int channel)
{
    if ( scene.game->GetSoundManager().GetMusicOnChannel(channel) == std::shared_ptr<Music>() ) return 0;

    return scene.game->GetSoundManager().GetMusicOnChannel(channel)->GetVolume();
}

void GD_API SetGlobalVolume( RuntimeScene & scene, float volume )
{
    scene.game->GetSoundManager().SetGlobalVolume(volume);
}

double GD_API GetGlobalVolume( RuntimeScene & scene )
{
    return scene.game->GetSoundManager().GetGlobalVolume();
}

void GD_API SetSoundPitchOnChannel( RuntimeScene & scene, unsigned int channel, float pitch )
{
    if ( scene.game->GetSoundManager().GetSoundOnChannel(channel) == std::shared_ptr<Sound>() ) return;

    scene.game->GetSoundManager().GetSoundOnChannel(channel)->SetPitch(pitch);
}

void GD_API SetMusicPitchOnChannel( RuntimeScene & scene, unsigned int channel, float pitch )
{
    if ( scene.game->GetSoundManager().GetMusicOnChannel(channel) == std::shared_ptr<Music>() ) return;

    scene.game->GetSoundManager().GetMusicOnChannel(channel)->SetPitch(pitch);
}

double GD_API GetSoundPitchOnChannel( RuntimeScene & scene, unsigned int channel)
{
    if ( scene.game->GetSoundManager().GetSoundOnChannel(channel) == std::shared_ptr<Sound>() ) return 0;

    return scene.game->GetSoundManager().GetSoundOnChannel(channel)->GetPitch();
}

double GD_API GetMusicPitchOnChannel( RuntimeScene & scene, unsigned int channel)
{
    if ( scene.game->GetSoundManager().GetMusicOnChannel(channel) == std::shared_ptr<Music>() ) return 0;

    return scene.game->GetSoundManager().GetMusicOnChannel(channel)->GetPitch();
}

void GD_API SetSoundPlayingOffsetOnChannel( RuntimeScene & scene, unsigned int channel, float playingOffset )
{
    if ( scene.game->GetSoundManager().GetSoundOnChannel(channel) == std::shared_ptr<Sound>() ) return;

    scene.game->GetSoundManager().GetSoundOnChannel(channel)->SetPlayingOffset(playingOffset);
}

void GD_API SetMusicPlayingOffsetOnChannel( RuntimeScene & scene, unsigned int channel, float playingOffset )
{
    if ( scene.game->GetSoundManager().GetMusicOnChannel(channel) == std::shared_ptr<Music>() ) return;

    scene.game->GetSoundManager().GetMusicOnChannel(channel)->SetPlayingOffset(playingOffset);
}

double GD_API GetSoundPlayingOffsetOnChannel( RuntimeScene & scene, unsigned int channel)
{
    if ( scene.game->GetSoundManager().GetSoundOnChannel(channel) == std::shared_ptr<Sound>() ) return 0;

    return static_cast<double>(scene.game->GetSoundManager().GetSoundOnChannel(channel)->GetPlayingOffset());
}

double GD_API GetMusicPlayingOffsetOnChannel( RuntimeScene & scene, unsigned int channel)
{
    if ( scene.game->GetSoundManager().GetMusicOnChannel(channel) == std::shared_ptr<Music>() ) return 0;

    return static_cast<double>(scene.game->GetSoundManager().GetMusicOnChannel(channel)->GetPlayingOffset());
}
