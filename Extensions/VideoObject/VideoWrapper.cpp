#include "VideoWrapper.h"
#include <iostream>

VideoWrapper::VideoWrapper() :
clip(NULL),
started(false)
{
    if ( TheoraVideoManager::getSingletonPtr() == NULL )
        new TheoraVideoManager;

    currentFrameImage.Create(100,100, sf::Color(100,100,100));
}

VideoWrapper::~VideoWrapper()
{
    if ( clip ) TheoraVideoManager::getSingletonPtr()->destroyVideoClip(clip);
}

void VideoWrapper::Init(const VideoWrapper & other)
{
    if ( TheoraVideoManager::getSingletonPtr() == NULL )
        new TheoraVideoManager;

    if ( clip ) TheoraVideoManager::getSingletonPtr()->destroyVideoClip(clip);
    clip = NULL;
    started = false;
}

bool VideoWrapper::Load(std::string filename)
{
    //Destroy old clip if necessary
    if ( clip ) TheoraVideoManager::getSingletonPtr()->destroyVideoClip(clip);

    //Load new clip
    clip = TheoraVideoManager::getSingletonPtr()->createVideoClip(filename, TH_RGBA);
    if ( clip )
    {
        clip->setAutoRestart(1);
        currentFrameImage.Create(clip->getWidth(), clip->getHeight(), sf::Color(0,0,0));
    }
    else //Something failed
    {
        currentFrameImage.Create(50, 50, sf::Color(255,0,0));
        return false;
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

const sf::Image & VideoWrapper::GetNextFrameImage()
{
    if ( clip != NULL )
    {
        TheoraVideoFrame* f=clip->getNextFrame();
        if (f)
        {
            currentFrameImage.LoadFromPixels(f->getWidth(), f->getHeight(), f->getBuffer());

            clip->popFrame();
        }
    }

	return currentFrameImage;
}
