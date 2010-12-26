#ifndef SON_H
#define SON_H

#include <SFML/Audio.hpp>
#include <string>
#include <vector>

using namespace std;

class GD_API Son : sf::NonCopyable
{
    public:
        Son();
        Son(string file);
        Son(const Son & copy);
        virtual ~Son();

        inline sf::Sound::Status GetStatus() const { return sound.GetStatus(); }

        void SetVolume(float volume_);
        inline float GetVolume() const { return volume; }
        void UpdateVolume();

        void SetPitch(float newPitch) { sound.SetPitch(newPitch); };
        float GetPitch() const { return sound.GetPitch(); };

        //L'ordre de ceux deux là est important :
        sf::SoundBuffer buffer;
        sf::Sound       sound;

        string file;

    protected:
    private:
        float volume; ///< Volume is not directly stored in the sf::Sound as GD allows to change global volume.
};

#endif // SON_H
