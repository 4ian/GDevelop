#ifndef SON_H
#define SON_H

#include <SFML/Audio.hpp>
#include <string>
#include <vector>

using namespace std;

class GD_API Sound : sf::NonCopyable
{
    public:
        Sound();
        Sound(string file);
        Sound(const Sound & copy);
        virtual ~Sound();

        /**
         * Get Music SFML Status ( Paused, Playing, Stopped )
         */
        inline sf::Sound::Status GetStatus() const { return sound.GetStatus(); }

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
        void SetPitch(float newPitch) { sound.SetPitch(newPitch); };

        /**
         * Get the pitch of the sound
         */
        float GetPitch() const { return sound.GetPitch(); };

        /**
         * Change the current playing position of the sound.
         */
        void SetPlayingOffset(float timeOffset) { sound.SetPlayingOffset(timeOffset); };

        /**
         * Change the current playing position of the sound.
         */
        float GetPlayingOffset() const { return sound.GetPlayingOffset(); };

        //Order is important :
        sf::SoundBuffer buffer;
        sf::Sound       sound;

        string file;

        /**
         * Internal member functions to update music volume according to global volume.
         */
        void UpdateVolume();

    private:
        float volume; ///< Volume is not directly stored in the sf::Sound as GD allows to change global volume.
};

#endif // SON_H
