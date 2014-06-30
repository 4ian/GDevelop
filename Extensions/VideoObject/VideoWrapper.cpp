/**

Game Develop - Video Object Extension
Copyright (c) 2010-2014 Florian Rival (Florian.Rival@gmail.com)

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

#include "VideoWrapper.h"
#include <SFML/Graphics.hpp>
#include <GDCpp/RessourcesLoader.h>
#include <TheoraPlayer.h>
#include <TheoraVideoManager.h>
#include "OpenAL_AudioInterface.h"
#include "TheoraMemoryLoader.h"
#include <TheoraException.h>
#include <iostream>

VideoWrapper::VideoWrapper() :
renderSprite(new sf::Sprite),
currentFrameImage(new sf::Texture),
clip(NULL),
started(false),
valid(false),
volume(100)
{
    if ( TheoraVideoManager::getSingletonPtr() == NULL )
        new TheoraVideoManager();

    if( TheoraVideoManager::getSingletonPtr()->getAudioInterfaceFactory() == NULL )
    {
        TheoraVideoManager::getSingletonPtr()->setAudioInterfaceFactory(new OpenAL_AudioInterfaceFactory);
    }
}

VideoWrapper::~VideoWrapper()
{
    if ( clip ) TheoraVideoManager::getSingletonPtr()->destroyVideoClip(clip);
    if ( currentFrameImage ) delete currentFrameImage;
    if ( renderSprite ) delete renderSprite;
}

void VideoWrapper::Init(const VideoWrapper & other)
{
    if ( TheoraVideoManager::getSingletonPtr() == NULL )
        new TheoraVideoManager;

    if( TheoraVideoManager::getSingletonPtr()->getAudioInterfaceFactory() == NULL )
    {
        TheoraVideoManager::getSingletonPtr()->setAudioInterfaceFactory(new OpenAL_AudioInterfaceFactory);
    }

    if ( currentFrameImage ) delete currentFrameImage;
    currentFrameImage = new sf::Texture(*other.currentFrameImage);

    if ( renderSprite ) delete renderSprite;
    renderSprite = new sf::Sprite(*other.renderSprite);

    if ( clip ) TheoraVideoManager::getSingletonPtr()->destroyVideoClip(clip);
    clip = NULL;
    started = false;
    volume = other.volume;
}

bool VideoWrapper::Load(std::string filename)
{
    //Destroy old clip if necessary
    if ( clip ) TheoraVideoManager::getSingletonPtr()->destroyVideoClip(clip);
    clip = NULL;
    valid = false;
    started = false;

    //Load new clip
    try
    {
        #if defined(GD_IDE_ONLY)
        clip = TheoraVideoManager::getSingletonPtr()->createVideoClip(filename, TH_RGBA);
        #else
        TheoraMemoryLoader *memLoad = new TheoraMemoryLoader(filename, (unsigned char*)gd::RessourcesLoader::Get()->LoadBinaryFile(filename),
                                                                       gd::RessourcesLoader::Get()->GetBinaryFileSize(filename));
        clip = TheoraVideoManager::getSingletonPtr()->createVideoClip(memLoad, TH_RGBA);
        #endif
    }
    catch(...)
    {
        std::cout << "Error when opening video file " << filename << std::endl;
    }

    if ( clip )
    {
        clip->setAutoRestart(1);
        clip->setAudioGain(static_cast<float>(volume) / 100);
        currentFrameImage->create(clip->getWidth(), clip->getHeight());

        valid = true;
    }

    return true;
}

void VideoWrapper::UpdateTime(float time_increase)
{
    if ( clip == NULL ) return;

	if (started)
	{
		// let's wait until the system caches up a few frames on startup
		if (clip->getNumReadyFrames() < clip->getNumPrecachedFrames()*0.5f)
			return;
		started=false;
	}
	TheoraVideoManager::getSingletonPtr()->update(time_increase);
}

const sf::Texture & VideoWrapper::GetNextFrameImage()
{
    if ( clip != NULL )
    {
        TheoraVideoFrame* f=clip->getNextFrame();
        if (f)
        {
            currentFrameImage->update((sf::Uint8*)f->getBuffer(), (unsigned int)f->getWidth(),  (unsigned int)f->getHeight(),0,0);

            clip->popFrame();
        }
    }

	return *currentFrameImage;
}

void VideoWrapper::SetLooping(bool loop)
{
    if ( clip != NULL ) clip->setAutoRestart(loop);
}

void VideoWrapper::Seek(float time)
{
    if ( clip != NULL ) clip->seek(time);
    if ( dynamic_cast<OpenAL_AudioInterface*>(clip->getAudioInterface()) != NULL ) dynamic_cast<OpenAL_AudioInterface*>(clip->getAudioInterface())->seek(time);
}

void VideoWrapper::SetPause(bool pause)
{
    if ( clip != NULL )
    {
        if ( pause )
        {
            clip->pause();
            dynamic_cast<OpenAL_AudioInterface*>(clip->getAudioInterface())->pause();
        }
        else
        {
            clip->play();
            dynamic_cast<OpenAL_AudioInterface*>(clip->getAudioInterface())->play();
        }
    }
}

unsigned int VideoWrapper::GetVolume()
{
    return volume;
}

void VideoWrapper::SetVolume(unsigned int vol)
{
    volume = vol;
    if(clip != NULL) clip->setAudioGain(static_cast<float>(volume) / 100);
}

void VideoWrapper::Restart()
{
    if ( clip != NULL )
    {
        clip->restart();
        dynamic_cast<OpenAL_AudioInterface*>(clip->getAudioInterface())->play();
    }
}

float VideoWrapper::GetTimePosition() const
{
    if ( clip != NULL ) return clip->getTimePosition();

    return 0;
}

float VideoWrapper::GetDuration() const
{
    if ( clip != NULL ) return clip->getDuration();

    return 0;
}

