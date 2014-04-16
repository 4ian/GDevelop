/** \file
 *  Game Develop
 *  2008-2014 Florian Rival (Florian.Rival@gmail.com)
 */
#if !defined(EMSCRIPTEN)
#ifndef SOUND_H
#define SOUND_H
#include <SFML/Audio.hpp>
#include <string>

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
    Sound(std::string file);
    Sound(const Sound & copy);
    virtual ~Sound();

    /**
     * Get Music SFML Status ( Paused, Playing, Stopped )
     */
    inline sf::Sound::Status GetStatus() const { return sound.getStatus(); }

    /**
     * Change sound volume
     */
    void SetVolume(float volume_);

    /**
     * Get sound volume
     */
    inline float GetVolume() const { return volume; }

    /**
     * Change the pitch of the sound
     */
    void SetPitch(float newPitch) { sound.setPitch(newPitch); };

    /**
     * Get the pitch of the sound
     */
    float GetPitch() const { return sound.getPitch(); };

    /**
     * Change the current playing position of the sound.
     */
    void SetPlayingOffset(unsigned int timeOffset) { sound.setPlayingOffset(sf::milliseconds(timeOffset)); };

    /**
     * Return the current playing position of the music, in milliseconds.
     */
    unsigned int GetPlayingOffset() const { return sound.getPlayingOffset().asMilliseconds(); };

    //Order is important :
    sf::SoundBuffer buffer;
    sf::Sound       sound;

    std::string file;

    /**
     * Internal member functions to update music volume according to global volume.
     */
    void UpdateVolume();

private:
    float volume; ///< Volume is not directly stored in the sf::Sound as GD allows to change global volume.
};

#endif // SOUND_H
#endif