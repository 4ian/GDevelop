/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef MUSIC_H
#define MUSIC_H

#include <SFML/Audio.hpp>
#include <string>

using namespace std;

/**
 * \brief Used to play a music
 *
 * \ingroup SoundEngine
 */
class GD_API Music
{
    public:
        Music();
        virtual ~Music();

        /**
         * Open the music from a file.
         * Example :
         * \code
         * Music myMusic;
         * myMusic.OpenFromFile("sound.ogg");
         * myMusic.Play();
         * \endcode
         */
        bool OpenFromFile(const string & filename);

        /**
         * Change music buffer. Call OpenFromMemory after to use this buffer
         */
        void SetBuffer(const char * newbuffer, std::size_t size);

        /**
         * Open sound stored in buffer.
         * \param size The buffer size.
         */
        bool OpenFromMemory(std::size_t size);

        sf::Music music; ///< SFML Music
        char * buffer;  ///< Music buffer when music have been loaded from memory

        /**
         * Play music.
         */
        void Play();

        /**
         * Pause music.
         */
        void Pause();

        /**
         * Stop music.
         */
        void Stop();

        /**
         * Get Music SFML Status ( Paused, Playing, Stopped )
         */
        inline sf::Music::Status GetStatus() const { return music.GetStatus(); };

        /**
         * Make music looping or not.
         */
        void SetLoop(bool loop);

        /**
         * Change music volume
         */
        void SetVolume(float volume_);

        /**
         * Get music volume
         */
        inline float GetVolume() const { return volume; }

        /**
         * Change the pitch.
         */
        void SetPitch(float newPitch) { music.SetPitch(newPitch); };

        /**
         * Get music pitch.
         */
        float GetPitch() const { return music.GetPitch(); };

        /**
         * Change the current playing position of the music.
         */
        void SetPlayingOffset(unsigned int timeOffset) { music.SetPlayingOffset(timeOffset); };

        /**
         * Return the current playing position of the music, in milliseconds.
         */
        unsigned int GetPlayingOffset() const
        {
            if ( music.GetChannelsCount() == 0 || music.GetSampleRate() == 0 )
                return 0; //Avoid a bug in GetPlayingOffset.

            return music.GetPlayingOffset();
        };

        /**
         * Internal member functions to update music volume according to global volume.
         */
        void UpdateVolume();

        #if defined(GD_IDE_ONLY)
        std::string file; ///< Only useful for GD debugger
        #endif

    private:
        float volume; ///< Music volume
};

#endif // MUSIC_H
