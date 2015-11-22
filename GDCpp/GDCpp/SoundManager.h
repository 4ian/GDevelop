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
namespace gd { class ResourcesManager; }
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

    /**
     * \brief Set the gd::ResourcesManager used by the SoundManager.
     */
    void SetResourcesManager(gd::ResourcesManager * resourcesManager_) { resourcesManager = resourcesManager_; }

    vector < std::shared_ptr<Music> >  musics;
    vector < std::shared_ptr<Sound> >  sounds;

    /**
     * \brief Play a sound (wav files).
     * \param file The resource name, or filename to load.
     * \param repeat true to loop the sound
     * \param volume The volume, between 0 and 100.
     * \param pitch The pithc, 1 by default
     */
    void PlaySound(const gd::String & name, bool repeat, float volume, float pitch);

    /**
     * \brief Play a music (ogg files).
     * \param file The resource name, or filename to load.
     * \param repeat true to loop the music
     * \param volume The volume, between 0 and 100.
     * \param pitch The pithc, 1 by default
     */
    void PlayMusic(const gd::String & name, bool repeat, float volume, float pitch);

    /**
     * \brief Play a sound (wav files) on a channel.
     * \param file The resource name, or filename to load.
     * \param channel The channel to use. The previous sound, if any, will be stopped.
     * \param repeat true to loop the sound
     * \param volume The volume, between 0 and 100.
     * \param pitch The pithc, 1 by default
     */
    void PlaySoundOnChannel(const gd::String & name, unsigned int channel, bool repeat, float volume, float pitch);

    /**
     * \brief Play a music (wav files) on a channel.
     * \param file The resource name, or filename to load.
     * \param channel The channel to use. The previous music, if any, will be stopped.
     * \param repeat true to loop the music
     * \param volume The volume, between 0 and 100.
     * \param pitch The pithc, 1 by default
     */
    void PlayMusicOnChannel(const gd::String & name, unsigned int channel, bool repeat, float volume, float pitch);

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
    const gd::String &  GetFileFromSoundName(const gd::String & name) const;

    std::map<std::size_t, std::shared_ptr<Sound> >  soundsChannel;
    std::map<std::size_t, std::shared_ptr<Music> >  musicsChannel;

    float globalVolume;
    gd::ResourcesManager * resourcesManager;
};


#endif // SOUNDMANAGER_H
