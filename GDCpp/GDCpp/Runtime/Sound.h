/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#ifndef SOUND_H
#define SOUND_H
#include <SFML/Audio.hpp>
#include "GDCpp/Runtime/String.h"

/**
 * \brief Represents a sound to be played
 *
 * \see SoundManager
 * \ingroup SoundEngine
 */
class GD_API Sound : sf::NonCopyable
{
public:
    Sound();
    Sound(gd::String file);
    Sound(const Sound & copy);
    virtual ~Sound() {};

    /**
     * \brief Get the sound status
     * \return sf::Music::Paused, sf::Music::Playing or sf::Music::Stopped.
     */
    inline sf::Sound::Status GetStatus() const { return sound.getStatus(); }

    /**
     * \brief Change the music volume.
     * \param volume The new volume, between 0 and 100.
     */
    void SetVolume(float volume_, float globalVolume);

    /**
     * \brief Get the sound volume.
     */
    inline float GetVolume() const { return volume; }

    /**
     * Change the pitch of the sound.
     */
    void SetPitch(float newPitch) { sound.setPitch(newPitch); };

    /**
     * Get the pitch of the sound.
     */
    float GetPitch() const { return sound.getPitch(); };

    /**
     * Change the current playing position of the sound.
     * \param timeOffset The new playing position, in seconds.
     */
    void SetPlayingOffset(double timeOffset) { sound.setPlayingOffset(sf::seconds(timeOffset)); };

    /**
     * Return the current playing position of the music, in seconds.
     */
    double GetPlayingOffset() const { return sound.getPlayingOffset().asSeconds(); };

    //Order is important :
    sf::SoundBuffer buffer;
    sf::Sound       sound;

    gd::String file;

    /**
     * \brief Internal member functions to update music volume according to global volume.
     *
     * Called by the sound manager when the global volume is updated.
     */
    void UpdateVolume(float globalVolume);

private:
    float volume; ///< Volume is not directly stored in the sf::Sound as GD allows to change global volume.
};

#endif // SOUND_H
