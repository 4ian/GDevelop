/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#include "AudioTools.h"
#include <string>
#include "GDL/RuntimeScene.h"
#include "GDL/SoundManager.h"
#include "GDL/RessourcesLoader.h"
#undef PlaySound //Gniark!

/**
 * Test if a music is played
 */
bool GD_API MusicPlaying( RuntimeScene & scene, unsigned int channel )
{
    if ( SoundManager::GetInstance()->GetMusicOnChannel(channel) == boost::shared_ptr<Music>() ) return false;

    return (SoundManager::GetInstance()->GetMusicOnChannel(channel)->GetStatus() == sf::Music::Playing);
}

/**
 * Test if a music is paused
 */
bool GD_API MusicPaused( RuntimeScene & scene, unsigned int channel )
{
    if ( SoundManager::GetInstance()->GetMusicOnChannel(channel) == boost::shared_ptr<Music>() ) return false;

    return (SoundManager::GetInstance()->GetMusicOnChannel(channel)->GetStatus() == sf::Music::Paused);
}

/**
 * Test if a music is stopped
 */
bool GD_API MusicStopped( RuntimeScene & scene, unsigned int channel )
{
    if ( SoundManager::GetInstance()->GetMusicOnChannel(channel) == boost::shared_ptr<Music>() ) return false;

    return (SoundManager::GetInstance()->GetMusicOnChannel(channel)->GetStatus() == sf::Music::Stopped);
}


/**
 * Test if a sound is stopped
 */
bool GD_API SoundPlaying( RuntimeScene & scene, unsigned int channel )
{
    if ( SoundManager::GetInstance()->GetSoundOnChannel(channel) == boost::shared_ptr<Sound>() ) return false;

    return (SoundManager::GetInstance()->GetSoundOnChannel(channel)->GetStatus() == sf::Sound::Playing);
}

/**
 * Test if a sound is stopped
 */
bool GD_API SoundPaused( RuntimeScene & scene, unsigned int channel )
{
    if ( SoundManager::GetInstance()->GetSoundOnChannel(channel) == boost::shared_ptr<Sound>() ) return false;

    return (SoundManager::GetInstance()->GetSoundOnChannel(channel)->GetStatus() == sf::Sound::Paused);
}

/**
 * Test if a sound is stopped
 */
bool GD_API SoundStopped( RuntimeScene & scene, unsigned int channel )
{
    if ( SoundManager::GetInstance()->GetSoundOnChannel(channel) == boost::shared_ptr<Sound>() ) return false;

    return (SoundManager::GetInstance()->GetSoundOnChannel(channel)->GetStatus() == sf::Sound::Stopped);
}

void GD_API PlaySoundOnChannel( RuntimeScene & scene, const std::string & file, unsigned int channel, bool repeat, float volume, float pitch )
{
    sf::Clock latency;

    //Chargement
    SoundManager * soundManager = SoundManager::GetInstance();

    //Son à jouer
    boost::shared_ptr<Sound> sound = boost::shared_ptr<Sound>(new Sound(file));
    sound->sound.play();

    soundManager->SetSoundOnChannel(channel, sound);
    soundManager->GetSoundOnChannel(channel)->sound.setLoop(repeat);
    soundManager->GetSoundOnChannel(channel)->SetVolume(volume);
    soundManager->GetSoundOnChannel(channel)->SetPitch(pitch);

    scene.NotifyPauseWasMade(latency.getElapsedTime().asMilliseconds());
}

void GD_API PlaySound( RuntimeScene & scene, const std::string & file, bool repeat, float volume, float pitch )
{
    sf::Clock latency;

    SoundManager * soundManager = SoundManager::GetInstance();
    soundManager->sounds.push_back(boost::shared_ptr<Sound>(new Sound(file)));
    soundManager->sounds.back()->sound.play();
    soundManager->sounds.back()->sound.setLoop(repeat);
    soundManager->sounds.back()->SetVolume(volume);
    soundManager->sounds.back()->SetPitch(pitch);

    scene.NotifyPauseWasMade(latency.getElapsedTime().asMilliseconds());
}

void GD_API StopSoundOnChannel( RuntimeScene & scene, unsigned int channel )
{
    if ( SoundManager::GetInstance()->GetSoundOnChannel(channel) == boost::shared_ptr<Sound>() ) return;

    SoundManager::GetInstance()->GetSoundOnChannel(channel)->sound.stop();
}

void GD_API PauseSoundOnChannel( RuntimeScene & scene, unsigned int channel )
{
    if ( SoundManager::GetInstance()->GetSoundOnChannel(channel) == boost::shared_ptr<Sound>() ) return;

    SoundManager::GetInstance()->GetSoundOnChannel(channel)->sound.pause();
}

void GD_API RePlaySoundOnChannel( RuntimeScene & scene, unsigned int channel )
{
    if ( SoundManager::GetInstance()->GetSoundOnChannel(channel) == boost::shared_ptr<Sound>() ) return;

    SoundManager::GetInstance()->GetSoundOnChannel(channel)->sound.play();
}

void GD_API PlayMusic( RuntimeScene & scene, const std::string & file, bool repeat, float volume, float pitch )
{
    SoundManager * soundManager = SoundManager::GetInstance();
    RessourcesLoader * ressourcesLoader = RessourcesLoader::GetInstance();

    boost::shared_ptr<Music> music = boost::shared_ptr<Music>(ressourcesLoader->LoadMusic(file)); //Chargement

    soundManager->musics.push_back(music); //Ajout aux soundManager qui prend en charge la musique
    soundManager->musics.back()->Play();

    music->SetLoop(repeat);
    music->SetVolume(volume);
    music->SetPitch(pitch);
}

void GD_API PlayMusicOnChannel( RuntimeScene & scene, const std::string & file, unsigned int channel , bool repeat, float volume, float pitch )
{
    SoundManager * soundManager = SoundManager::GetInstance();
    RessourcesLoader * ressourcesLoader = RessourcesLoader::GetInstance();

    boost::shared_ptr<Music> music = boost::shared_ptr<Music>(ressourcesLoader->LoadMusic(file)); //Chargement
    music->Play();

    soundManager->SetMusicOnChannel(channel, music); //Ajout au soundManager qui prend en charge la music
    music->SetLoop(repeat);
    music->SetVolume(volume);
    music->SetPitch(pitch);
}

void GD_API StopMusicOnChannel( RuntimeScene & scene, unsigned int channel )
{
    if ( SoundManager::GetInstance()->GetMusicOnChannel(channel) == boost::shared_ptr<Music>() ) return;

    SoundManager::GetInstance()->GetMusicOnChannel(channel)->Stop();
}

void GD_API PauseMusicOnChannel( RuntimeScene & scene, unsigned int channel )
{
    if ( SoundManager::GetInstance()->GetMusicOnChannel(channel) == boost::shared_ptr<Music>() ) return;

    SoundManager::GetInstance()->GetMusicOnChannel(channel)->Pause();
}

void GD_API RePlayMusicOnChannel( RuntimeScene & scene, unsigned int channel )
{
    if ( SoundManager::GetInstance()->GetMusicOnChannel(channel) == boost::shared_ptr<Music>() ) return;

    SoundManager::GetInstance()->GetMusicOnChannel(channel)->Play();
}

void GD_API SetSoundVolumeOnChannel( RuntimeScene & scene, unsigned int channel, float volume )
{
    if ( SoundManager::GetInstance()->GetSoundOnChannel(channel) == boost::shared_ptr<Sound>() ) return;

    SoundManager::GetInstance()->GetSoundOnChannel(channel)->SetVolume(volume);
}

void GD_API SetMusicVolumeOnChannel( RuntimeScene & scene, unsigned int channel, float volume )
{
    if ( SoundManager::GetInstance()->GetMusicOnChannel(channel) == boost::shared_ptr<Music>() ) return;

    SoundManager::GetInstance()->GetMusicOnChannel(channel)->SetVolume(volume);
}

double GD_API GetSoundVolumeOnChannel( RuntimeScene & scene, unsigned int channel)
{
    if ( SoundManager::GetInstance()->GetSoundOnChannel(channel) == boost::shared_ptr<Sound>() ) return 0;

    return SoundManager::GetInstance()->GetSoundOnChannel(channel)->GetVolume();
}

double GD_API GetMusicVolumeOnChannel( RuntimeScene & scene, unsigned int channel)
{
    if ( SoundManager::GetInstance()->GetMusicOnChannel(channel) == boost::shared_ptr<Music>() ) return 0;

    return SoundManager::GetInstance()->GetMusicOnChannel(channel)->GetVolume();
}

void GD_API SetGlobalVolume( RuntimeScene & scene, float volume )
{
    SoundManager::GetInstance()->SetGlobalVolume(volume);
}


double GD_API GetGlobalVolume( RuntimeScene & scene )
{
    return SoundManager::GetInstance()->GetGlobalVolume();
}

void GD_API SetSoundPitchOnChannel( RuntimeScene & scene, unsigned int channel, float pitch )
{
    if ( SoundManager::GetInstance()->GetSoundOnChannel(channel) == boost::shared_ptr<Sound>() ) return;

    SoundManager::GetInstance()->GetSoundOnChannel(channel)->SetPitch(pitch);
}

void GD_API SetMusicPitchOnChannel( RuntimeScene & scene, unsigned int channel, float pitch )
{
    if ( SoundManager::GetInstance()->GetMusicOnChannel(channel) == boost::shared_ptr<Music>() ) return;

    SoundManager::GetInstance()->GetMusicOnChannel(channel)->SetPitch(pitch);
}

double GD_API GetSoundPitchOnChannel( RuntimeScene & scene, unsigned int channel)
{
    if ( SoundManager::GetInstance()->GetSoundOnChannel(channel) == boost::shared_ptr<Sound>() ) return 0;

    return SoundManager::GetInstance()->GetSoundOnChannel(channel)->GetPitch();
}

double GD_API GetMusicPitchOnChannel( RuntimeScene & scene, unsigned int channel)
{
    if ( SoundManager::GetInstance()->GetMusicOnChannel(channel) == boost::shared_ptr<Music>() ) return 0;

    return SoundManager::GetInstance()->GetMusicOnChannel(channel)->GetPitch();
}

void GD_API SetSoundPlayingOffsetOnChannel( RuntimeScene & scene, unsigned int channel, float playingOffset )
{
    if ( SoundManager::GetInstance()->GetSoundOnChannel(channel) == boost::shared_ptr<Sound>() ) return;

    SoundManager::GetInstance()->GetSoundOnChannel(channel)->SetPlayingOffset(playingOffset*1000.0);
}

void GD_API SetMusicPlayingOffsetOnChannel( RuntimeScene & scene, unsigned int channel, float playingOffset )
{
    if ( SoundManager::GetInstance()->GetMusicOnChannel(channel) == boost::shared_ptr<Music>() ) return;

    SoundManager::GetInstance()->GetMusicOnChannel(channel)->SetPlayingOffset(playingOffset*1000.0);
}

double GD_API GetSoundPlayingOffsetOnChannel( RuntimeScene & scene, unsigned int channel)
{
    if ( SoundManager::GetInstance()->GetSoundOnChannel(channel) == boost::shared_ptr<Sound>() ) return 0;

    return static_cast<double>(SoundManager::GetInstance()->GetSoundOnChannel(channel)->GetPlayingOffset())/1000.0;
}

double GD_API GetMusicPlayingOffsetOnChannel( RuntimeScene & scene, unsigned int channel)
{
    if ( SoundManager::GetInstance()->GetMusicOnChannel(channel) == boost::shared_ptr<Music>() ) return 0;

    return static_cast<double>(SoundManager::GetInstance()->GetMusicOnChannel(channel)->GetPlayingOffset())/1000.0;
}

