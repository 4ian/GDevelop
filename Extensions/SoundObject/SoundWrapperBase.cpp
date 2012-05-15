/**

Sound Object Extension
Copyright (c) 2011-2012 Thomas Flecy

This software is provided 'as-is', without any express or implied
warranty. In no event will the authors be held liable for any damages
arising from the use of this software.

Permission is granted to anyone to use this software for any purpose,
including commercial applications, and to alter it and redistribute it
freely, subject to the following restrictions:

    1. The origin of this software must not be misrepresented; you must not
    claim that you wrote the original software. If you use this software
    in a product, an acknowledgment in the product documentation would be
    appreciated but is not required.

    2. Altered source versions must be plainly marked as such, and must not be
    misrepresented as being the original software.

    3. This notice may not be removed or altered from any source
    distribution.

*/
#include "SoundWrapperBase.h"

#include "GDL/RuntimeGame.h"
#include "GDL/RessourcesLoader.h"

///////////////// SoundWrapperBase /////////////////

SoundWrapperBase::SoundWrapperBase() : m_filename("")
{

}

SoundWrapperBase::~SoundWrapperBase()
{

}

bool SoundWrapperBase::LoadFromFile(const std::string &filename, const RuntimeScene &scene)
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
    m_sound.Play();
}

bool SoundWrapper::IsPlaying() const
{
    return (m_sound.GetStatus() == sf::SoundSource::Playing);
}

void SoundWrapper::Pause()
{
    m_sound.Pause();
}

bool SoundWrapper::IsPausing() const
{
    return (m_sound.GetStatus() == sf::SoundSource::Paused);
}

void SoundWrapper::Stop()
{
    m_sound.Stop();
}

bool SoundWrapper::IsStopped() const
{
    return (m_sound.GetStatus() == sf::SoundSource::Stopped);
}

void SoundWrapper::SetPosition(sf::Vector3f position)
{
    m_sound.SetPosition(position);
}

sf::Vector3f SoundWrapper::GetPosition() const
{
    return m_sound.GetPosition();
}

void SoundWrapper::SetVolume(float volume)
{
    m_sound.SetVolume(volume);
}

float SoundWrapper::GetVolume() const
{
    return m_sound.GetVolume();
}

void SoundWrapper::SetAttenuation(float attenuation)
{
    m_sound.SetAttenuation(attenuation);
}

float SoundWrapper::GetAttenuation() const
{
    return m_sound.GetAttenuation();
}

void SoundWrapper::SetMinDistance(float minDist)
{
    m_sound.SetMinDistance(minDist);
}

float SoundWrapper::GetMinDistance() const
{
    return m_sound.GetMinDistance();
}

void SoundWrapper::SetLooping(bool is)
{
    m_sound.SetLoop(is);
}

bool SoundWrapper::IsLooping() const
{
    return m_sound.GetLoop();
}

void SoundWrapper::SetPitch(float pitch)
{
    m_sound.SetPitch(pitch);
}

float SoundWrapper::GetPitch() const
{
    return m_sound.GetPitch();
}

bool SoundWrapper::LoadFromFileImpl(const std::string &filename, const RuntimeScene &scene)
{
    #if defined(GD_IDE_ONLY)
    if(m_buffer.LoadFromFile(filename))
    {
        m_sound.SetBuffer(m_buffer);
    }
    #else
    if(RessourcesLoader::GetInstance()->HasFile(filename))
    {
        if(m_buffer.LoadFromMemory(RessourcesLoader::GetInstance()->LoadBinaryFile(filename),
                                   RessourcesLoader::GetInstance()->GetBinaryFileSize(filename)))
        {
            m_sound.SetBuffer(m_buffer);
            return true;
        }
    }
    #endif

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
    m_music.Play();
}

bool MusicWrapper::IsPlaying() const
{
    return (m_music.GetStatus() == sf::SoundSource::Playing);
}

void MusicWrapper::Pause()
{
    m_music.Pause();
}

bool MusicWrapper::IsPausing() const
{
    return (m_music.GetStatus() == sf::SoundSource::Paused);
}

void MusicWrapper::Stop()
{
    m_music.Stop();
}

bool MusicWrapper::IsStopped() const
{
    return (m_music.GetStatus() == sf::SoundSource::Stopped);
}

void MusicWrapper::SetPosition(sf::Vector3f position)
{
    m_music.SetPosition(position);
}

sf::Vector3f MusicWrapper::GetPosition() const
{
    return m_music.GetPosition();
}

void MusicWrapper::SetVolume(float volume)
{
    m_music.SetVolume(volume);
}

float MusicWrapper::GetVolume() const
{
    return m_music.GetVolume();
}

void MusicWrapper::SetAttenuation(float attenuation)
{
    m_music.SetAttenuation(attenuation);
}

float MusicWrapper::GetAttenuation() const
{
    return m_music.GetAttenuation();
}

void MusicWrapper::SetMinDistance(float minDist)
{
    m_music.SetMinDistance(minDist);
}

float MusicWrapper::GetMinDistance() const
{
    return m_music.GetMinDistance();
}

void MusicWrapper::SetLooping(bool is)
{
    m_music.SetLoop(is);
}

bool MusicWrapper::IsLooping() const
{
    return m_music.GetLoop();
}

void MusicWrapper::SetPitch(float pitch)
{
    m_music.SetPitch(pitch);
}

float MusicWrapper::GetPitch() const
{
    return m_music.GetPitch();
}

bool MusicWrapper::LoadFromFileImpl(const std::string &filename, const RuntimeScene &scene)
{
    #if defined(GD_IDE_ONLY)
    if(m_music.OpenFromFile(filename))
    {
        return true;
    }
    #else
    if(RessourcesLoader::GetInstance()->HasFile(filename))
    {
        if(m_music.OpenFromMemory(RessourcesLoader::GetInstance()->LoadBinaryFile(filename),
                                  RessourcesLoader::GetInstance()->GetBinaryFileSize(filename)))
        {
            return true;
        }
    }
    #endif

    return false;
}

