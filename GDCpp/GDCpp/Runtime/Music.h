/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#ifndef MUSIC_H
#define MUSIC_H
#include <SFML/Audio.hpp>
#include <string>
#include "GDCpp/Runtime/String.h"

/**
 * \brief Represents a music to be played
 *
 * \see SoundManager
 * \ingroup SoundEngine
 */
class GD_API Music
{
public:
    Music();
    virtual ~Music() {};

    /**
     * \brief Open the music from a file.
     *
     * Example :
     * \code
     * Music myMusic;
     * myMusic.OpenFromFile("sound.ogg");
     * myMusic.Play();
     * \endcode
     */
    bool OpenFromFile(const gd::String & filename);

    /**
     * \brief Change music buffer.
     *
     * You must call OpenFromMemory after to use this buffer.
     */
    void SetBuffer(const char * newbuffer, std::size_t size);

    /**
     * Open music stored in buffer.
     * \param size The buffer size.
     */
    bool OpenFromMemory(std::size_t size);

    sf::Music music; ///< SFML Music
    char * buffer;  ///< Music buffer when music have been loaded from memory

    /**
     * \brief Play the music.
     */
    void Play();

    /**
     * \brief Pause the music.
     */
    void Pause();

    /**
     * \brief Stop the music.
     */
    void Stop();

    /**
     * \brief Get the music status
     * \return sf::Music::Paused, sf::Music::Playing or sf::Music::Stopped.
     */
    inline sf::Music::Status GetStatus() const { return music.getStatus(); };

    /**
     * Make music looping or not.
     * \param loop true to activate looping.
     */
    void SetLoop(bool loop);

    /**
     * \brief Change the music volume.
     * \param volume The new volume, between 0 and 100.
     */
    void SetVolume(float volume_, float globalVolume);

    /**
     * \brief Get the music volume.
     */
    inline float GetVolume() const { return volume; }

    /**
     * \brief Change the music pitch.
     */
    void SetPitch(float newPitch) { music.setPitch(newPitch); };

    /**
     * \brief Get the music pitch.
     */
    float GetPitch() const { return music.getPitch(); };

    /**
     * \brief Change the current playing position of the music.
     * \param timeOffset The new playing position, in seconds.
     */
    void SetPlayingOffset(double timeOffset) { music.setPlayingOffset(sf::seconds(timeOffset)); };

    /**
     * \brief Return the current playing position of the music, in seconds.
     */
    double GetPlayingOffset() const { return music.getPlayingOffset().asSeconds(); };

    /**
     * \brief Internal member functions to update music volume according to global volume.
     *
     * Called by the sound manager when the global volume is updated.
     */
    void UpdateVolume(float globalVolume);

    #if defined(GD_IDE_ONLY)
    gd::String file; ///< Only useful for GD debugger
    #endif

private:
    float volume; ///< Music volume
};

#endif // MUSIC_H
