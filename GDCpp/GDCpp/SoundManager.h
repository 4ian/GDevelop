/*
 * GDevelop C++ Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#ifndef SOUNDMANAGER_H
#define SOUNDMANAGER_H

#include <SFML/Audio.hpp>
#include "GDCpp/Sound.h"
#include "GDCpp/Music.h"
#include <memory>
#include <string>
#include <vector>
#include <map>

using namespace std;

/**
 * \brief Manage sounds and musics played by games.
 *
 * \see Sound
 * \see Music
 *
 * \ingroup SoundEngine
 */
class GD_API SoundManager
{
public:
    vector < std::shared_ptr<Music> >  musics;
    vector < std::shared_ptr<Sound> >  sounds;

    /**
     * Return pointer to a music on a channel
     */
    std::shared_ptr<Music> & GetMusicOnChannel(int channel);

    /**
     * Change music on a channel. Automatically destroy the old music.
     */
    void SetMusicOnChannel(int channel, std::shared_ptr<Music> music);

    /**
     * Return pointer to a sound on a channel
     */
    std::shared_ptr<Sound> & GetSoundOnChannel(int channel);

    /**
     * Change sound on a channel. Automatically destroy the old sound.
     */
    void SetSoundOnChannel(int channel, std::shared_ptr<Sound> sound);

    /**
     * Get global game sound volume.
     * Example :
     * \code
     * float currentVolume = SoundManager::Get()->GetGlobalVolume();
     * \endcode
     */
    inline float GetGlobalVolume() const { return globalVolume; }

    /**
     * Change global game sound volume.
     * Example :
     * \code
     * SoundManager::Get()->SetGlobalVolume(50);
     * \endcode
     */
    void SetGlobalVolume(float volume);

    /**
     * Destroy all sounds and musics
     */
    void ClearAllSoundsAndMusics()
    {
        musicsChannel.clear();
        soundsChannel.clear();
        sounds.clear();
        musics.clear();
    }

    /**
     * Ensure sounds and musics without channels and stopped are destroyed.
     */
    void ManageGarbage();

    static SoundManager *Get()
    {
        if ( NULL == _singleton )
        {
            _singleton = new SoundManager;
        }

        return ( static_cast<SoundManager*>( _singleton ) );
    }

    static void DestroySingleton()
    {
        if ( NULL != _singleton )
        {
            delete _singleton;
            _singleton = NULL;
        }
    }

private:

    std::map<std::size_t, std::shared_ptr<Sound> >  soundsChannel;
    std::map<std::size_t, std::shared_ptr<Music> >  musicsChannel;

    float globalVolume;

    SoundManager();
    ~SoundManager();
    static SoundManager *_singleton;
};


#endif // SOUNDMANAGER_H
