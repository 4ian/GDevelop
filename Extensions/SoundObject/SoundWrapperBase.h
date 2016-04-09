/**

Sound Object Extension
Copyright (c) 2011-2012 Thomas Flecy
This project is released under the MIT License.
*/
#ifndef SOUNDWRAPPERBASE_H
#define SOUNDWRAPPERBASE_H

#include <SFML/System/Vector3.hpp>
#include <SFML/Audio/Sound.hpp>
#include <SFML/Audio/SoundBuffer.hpp>
#include <SFML/Audio/Music.hpp>

#include "GDCpp/Runtime/RuntimeScene.h"

class SoundWrapperBase
{
    public:
        SoundWrapperBase();
        virtual ~SoundWrapperBase();

        bool LoadFromFile(const gd::String &filename, const RuntimeScene &scene);

        virtual void Play() = 0;
        virtual bool IsPlaying() const = 0;

        virtual void Pause() = 0;
        virtual bool IsPausing() const = 0;

        virtual void Stop() = 0;
        virtual bool IsStopped() const = 0;

        virtual void SetPosition(sf::Vector3f position) = 0;
        virtual sf::Vector3f GetPosition() const = 0;

        virtual void SetVolume(float volume) = 0;
        virtual float GetVolume() const = 0;

        virtual void SetAttenuation(float attenuation) = 0;
        virtual float GetAttenuation() const = 0;

        virtual void SetMinDistance(float minDist) = 0;
        virtual float GetMinDistance() const = 0;

        virtual void SetLooping(bool is) = 0;
        virtual bool IsLooping() const = 0;

        virtual void SetPitch(float pitch) = 0;
        virtual float GetPitch() const = 0;

        virtual gd::String GetType() const = 0;

        gd::String GetFileName() const {return m_filename;}
        void SetFileName(const gd::String &filename) {m_filename = filename;}


    protected:
        virtual bool LoadFromFileImpl(const gd::String &filename, const RuntimeScene &scene) = 0;

        gd::String m_filename;

    private:
};

class SoundWrapper : public SoundWrapperBase
{
    public:
        SoundWrapper();
        virtual ~SoundWrapper();

        virtual void Play();
        virtual bool IsPlaying() const;

        virtual void Pause();
        virtual bool IsPausing() const ;

        virtual void Stop();
        virtual bool IsStopped() const;

        virtual void SetPosition(sf::Vector3f position);
        virtual sf::Vector3f GetPosition() const;

        virtual void SetVolume(float volume);
        virtual float GetVolume() const;

        virtual void SetAttenuation(float attenuation);
        virtual float GetAttenuation() const;

        virtual void SetMinDistance(float minDist);
        virtual float GetMinDistance() const;

        virtual void SetLooping(bool is);
        virtual bool IsLooping() const;

        virtual void SetPitch(float pitch);
        virtual float GetPitch() const;

        virtual gd::String GetType() const {return "Sound";}

    protected:
        virtual bool LoadFromFileImpl(const gd::String &filename, const RuntimeScene &scene);

    private:
        sf::Sound m_sound;
        sf::SoundBuffer m_buffer;
};

class MusicWrapper : public SoundWrapperBase
{
    public:
        MusicWrapper();
        virtual ~MusicWrapper();

        virtual void Play();
        virtual bool IsPlaying() const;

        virtual void Pause();
        virtual bool IsPausing() const ;

        virtual void Stop();
        virtual bool IsStopped() const;

        virtual void SetPosition(sf::Vector3f position);
        virtual sf::Vector3f GetPosition() const;

        virtual void SetVolume(float volume);
        virtual float GetVolume() const;

        virtual void SetAttenuation(float attenuation);
        virtual float GetAttenuation() const;

        virtual void SetMinDistance(float minDist);
        virtual float GetMinDistance() const;

        virtual void SetLooping(bool is);
        virtual bool IsLooping() const;

        virtual void SetPitch(float pitch);
        virtual float GetPitch() const;

        virtual gd::String GetType() const {return "Music";}

    protected:
        virtual bool LoadFromFileImpl(const gd::String &filename, const RuntimeScene &scene);

    private:
        sf::Music m_music;

};

#endif // SOUNDWRAPPERBASE_H

