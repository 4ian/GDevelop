#ifndef MUSIC_H
#define MUSIC_H

#include <SFML/Audio.hpp>
#include <string>

using namespace std;

class GD_API Music
{
    public:
        Music();
        virtual ~Music();

        sf::Music music;
        char * buffer;

        void Play();
        void Pause();
        void Stop();
        inline sf::Music::Status GetStatus() const { return music.GetStatus(); };
        void SetLoop(bool loop);

        void SetVolume(float volume_);
        inline float GetVolume() const { return volume; }
        void UpdateVolume();

        void SetPitch(float newPitch) { music.SetPitch(newPitch); };
        float GetPitch() const { return music.GetPitch(); };


        bool OpenFromFile(const string & filename);
        void SetBuffer(const char * newbuffer, std::size_t size);
        bool OpenFromMemory(std::size_t size);

    protected:
    private:
        float volume;
};

#endif // MUSIC_H
