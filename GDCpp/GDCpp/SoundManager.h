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
#undef PlaySound //Avoid a nasty macro from polluting everything

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
    SoundManager();
    ~SoundManager() {};

    vector < std::shared_ptr<Music> >  musics;
    vector < std::shared_ptr<Sound> >  sounds;

    void PlaySound(const gd::String & file, bool repeat, float volume, float pitch);

    void PlayMusic(const gd::String & file, bool repeat, float volume, float pitch);

    void PlaySoundOnChannel(const gd::String & file, unsigned int channel, bool repeat, float volume, float pitch);

    void PlayMusicOnChannel(const gd::String & file, unsigned int channel, bool repeat, float volume, float pitch);

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
     * float currentVolume = game.GetSoundManager().GetGlobalVolume();
     * \endcode
     */
    inline float GetGlobalVolume() const { return globalVolume; }

    /**
     * Change global game sound volume.
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

private:
    std::map<std::size_t, std::shared_ptr<Sound> >  soundsChannel;
    std::map<std::size_t, std::shared_ptr<Music> >  musicsChannel;

    float globalVolume;
};


#endif // SOUNDMANAGER_H
