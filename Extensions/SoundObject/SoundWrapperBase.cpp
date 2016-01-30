/**

Sound Object Extension
Copyright (c) 2011-2012 Thomas Flecy
This project is released under the MIT License.
*/
#include "SoundWrapperBase.h"

#include "GDCpp/Runtime/Project/Project.h"
#include "GDCpp/Runtime/ResourcesLoader.h"

///////////////// SoundWrapperBase /////////////////

SoundWrapperBase::SoundWrapperBase() : m_filename("")
{

}

SoundWrapperBase::~SoundWrapperBase()
{

}

bool SoundWrapperBase::LoadFromFile(const gd::String &filename, const RuntimeScene &scene)
{
    if(LoadFromFileImpl(filename, scene))
    {
        m_filename = filename;
        return true;
    }
    else
    {
        return false;
    }
}

/////////////////// SoundWrapper ///////////////////

SoundWrapper::SoundWrapper() : SoundWrapperBase(), m_sound(), m_buffer()
{

}

SoundWrapper::~SoundWrapper()
{

}

void SoundWrapper::Play()
{
    m_sound.play();
}

bool SoundWrapper::IsPlaying() const
{
    return (m_sound.getStatus() == sf::SoundSource::Playing);
}

void SoundWrapper::Pause()
{
    m_sound.pause();
}

bool SoundWrapper::IsPausing() const
{
    return (m_sound.getStatus() == sf::SoundSource::Paused);
}

void SoundWrapper::Stop()
{
    m_sound.stop();
}

bool SoundWrapper::IsStopped() const
{
    return (m_sound.getStatus() == sf::SoundSource::Stopped);
}

void SoundWrapper::SetPosition(sf::Vector3f position)
{
    m_sound.setPosition(position);
}

sf::Vector3f SoundWrapper::GetPosition() const
{
    return m_sound.getPosition();
}

void SoundWrapper::SetVolume(float volume)
{
    m_sound.setVolume(volume);
}

float SoundWrapper::GetVolume() const
{
    return m_sound.getVolume();
}

void SoundWrapper::SetAttenuation(float attenuation)
{
    m_sound.setAttenuation(attenuation);
}

float SoundWrapper::GetAttenuation() const
{
    return m_sound.getAttenuation();
}

void SoundWrapper::SetMinDistance(float minDist)
{
    m_sound.setMinDistance(minDist);
}

float SoundWrapper::GetMinDistance() const
{
    return m_sound.getMinDistance();
}

void SoundWrapper::SetLooping(bool is)
{
    m_sound.setLoop(is);
}

bool SoundWrapper::IsLooping() const
{
    return m_sound.getLoop();
}

void SoundWrapper::SetPitch(float pitch)
{
    m_sound.setPitch(pitch);
}

float SoundWrapper::GetPitch() const
{
    return m_sound.getPitch();
}

bool SoundWrapper::LoadFromFileImpl(const gd::String &filename, const RuntimeScene &scene)
{
    #if !defined(GD_IDE_ONLY)
    if(gd::ResourcesLoader::Get()->HasFile(filename))
    {
        if(m_buffer.loadFromMemory(gd::ResourcesLoader::Get()->LoadBinaryFile(filename),
                                   gd::ResourcesLoader::Get()->GetBinaryFileSize(filename)))
        {
            m_sound.setBuffer(m_buffer);
            return true;
        }
    }
    else
    #endif
    {
        if(m_buffer.loadFromFile(filename.ToLocale()))
        {
            m_sound.setBuffer(m_buffer);
        }
    }

    return false;
}

/////////////////// MusicWrapper ///////////////////

MusicWrapper::MusicWrapper() : SoundWrapperBase(), m_music()
{

}

MusicWrapper::~MusicWrapper()
{

}

void MusicWrapper::Play()
{
    m_music.play();
}

bool MusicWrapper::IsPlaying() const
{
    return (m_music.getStatus() == sf::SoundSource::Playing);
}

void MusicWrapper::Pause()
{
    m_music.pause();
}

bool MusicWrapper::IsPausing() const
{
    return (m_music.getStatus() == sf::SoundSource::Paused);
}

void MusicWrapper::Stop()
{
    m_music.stop();
}

bool MusicWrapper::IsStopped() const
{
    return (m_music.getStatus() == sf::SoundSource::Stopped);
}

void MusicWrapper::SetPosition(sf::Vector3f position)
{
    m_music.setPosition(position);
}

sf::Vector3f MusicWrapper::GetPosition() const
{
    return m_music.getPosition();
}

void MusicWrapper::SetVolume(float volume)
{
    m_music.setVolume(volume);
}

float MusicWrapper::GetVolume() const
{
    return m_music.getVolume();
}

void MusicWrapper::SetAttenuation(float attenuation)
{
    m_music.setAttenuation(attenuation);
}

float MusicWrapper::GetAttenuation() const
{
    return m_music.getAttenuation();
}

void MusicWrapper::SetMinDistance(float minDist)
{
    m_music.setMinDistance(minDist);
}

float MusicWrapper::GetMinDistance() const
{
    return m_music.getMinDistance();
}

void MusicWrapper::SetLooping(bool is)
{
    m_music.setLoop(is);
}

bool MusicWrapper::IsLooping() const
{
    return m_music.getLoop();
}

void MusicWrapper::SetPitch(float pitch)
{
    m_music.setPitch(pitch);
}

float MusicWrapper::GetPitch() const
{
    return m_music.getPitch();
}

bool MusicWrapper::LoadFromFileImpl(const gd::String &filename, const RuntimeScene &scene)
{
    #if !defined(GD_IDE_ONLY)
    if(gd::ResourcesLoader::Get()->HasFile(filename))
    {
        if(m_music.openFromMemory(gd::ResourcesLoader::Get()->LoadBinaryFile(filename),
                                  gd::ResourcesLoader::Get()->GetBinaryFileSize(filename)))
        {
            return true;
        }
    }
    else
    #endif
    {
        if(m_music.openFromFile(filename.ToLocale()))
        {
            return true;
        }
    }

    return false;
}
