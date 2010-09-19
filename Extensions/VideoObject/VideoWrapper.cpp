#include "VideoWrapper.h"
#include <TheoraException.h>
#include <iostream>

VideoWrapper::VideoWrapper() :
clip(NULL),
started(false),
valid(false)
{
    if ( TheoraVideoManager::getSingletonPtr() == NULL )
        new TheoraVideoManager;
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
    clip = NULL;
    valid = false;
    started = false;

    //Load new clip
    try
    {
        clip = TheoraVideoManager::getSingletonPtr()->createVideoClip(filename, TH_RGBA);
    }
    catch(...)
    {
        std::cout << "Error when opening video file " << filename << std::endl;
    }

    if ( clip )
    {
        clip->setAutoRestart(1);
        currentFrameImage.Create(clip->getWidth(), clip->getHeight(), sf::Color(0,0,0));
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

void VideoWrapper::SetLooping(bool loop)
{
    if ( clip != NULL ) clip->setAutoRestart(loop);
}

void VideoWrapper::Seek(float time)
{
    if ( clip != NULL ) clip->seek(time);
}

void VideoWrapper::SetPause(bool pause)
{
    if ( clip != NULL )
    {
        if ( pause ) clip->pause();
        else clip->play();
    }
}

void VideoWrapper::Restart()
{
    if ( clip != NULL ) return clip->restart();
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
