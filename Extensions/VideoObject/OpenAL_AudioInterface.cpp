/************************************************************************************
This source file is part of the Theora Video Playback Library
For latest info, see http://libtheoraplayer.sourceforge.net/
*************************************************************************************
Copyright (c) 2008-2010 Kresimir Spes (kreso@cateia.com)

This program is free software; you can redistribute it and/or modify it under
the terms of the GNU Lesser General Public License (LGPL) as published by the
Free Software Foundation; either version 2 of the License, or (at your option)
any later version.

This program is distributed in the hope that it will be useful, but WITHOUT
ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License along with
this program; if not, write to the Free Software Foundation, Inc., 59 Temple
Place - Suite 330, Boston, MA 02111-1307, USA, or go to
http://www.gnu.org/copyleft/lesser.txt.
*************************************************************************************/

#include <stdio.h>
#include "OpenAL_AudioInterface.h"

ALCdevice* gDevice=0;
ALCcontext* gContext=0;


short float2short(float f)
{
	if      (f >  1) f= 1;
	else if (f < -1) f=-1;
	return (short) (f*32767);
}

OpenAL_AudioInterface::OpenAL_AudioInterface(TheoraVideoClip* owner,int nChannels,int freq) :
	TheoraAudioInterface(owner,nChannels,freq), TheoraTimer()
{
	mMaxBuffSize=freq*mNumChannels*2;
	mBuffSize=0;
	mNumProcessedSamples=0;
	mTimeOffset=0;

	mTempBuffer=new short[mMaxBuffSize];
	alGenSources(1,&mSource);
	owner->setTimer(this);
	mNumPlayedSamples=0;
}

void OpenAL_AudioInterface::destroy()
{
	// todo
}

OpenAL_AudioInterface::~OpenAL_AudioInterface()
{
	// todo: delete buffers and source
	if (mTempBuffer) delete mTempBuffer;
}

void OpenAL_AudioInterface::insertData(float** data,int nSamples)
{
    //Deactivated output
	//printf("got %d bytes, %d buffers queued\n",nSamples,(int)mBufferQueue.size());
	for (int i=0;i<nSamples;i++)
	{
		if (mBuffSize < mMaxBuffSize)
		{
			//mTempBuffer[mBuffSize++]=rand(); debug
			mTempBuffer[mBuffSize++]=float2short(data[0][i]);
			if (mNumChannels == 2)
				mTempBuffer[mBuffSize++]=float2short(data[1][i]);
		}
		if (mBuffSize == mFreq*mNumChannels/4)
		{
			OpenAL_Buffer buff;
			alGenBuffers(1,&buff.id);


			ALuint format = (mNumChannels == 1) ? AL_FORMAT_MONO16 : AL_FORMAT_STEREO16;
			alBufferData(buff.id,format,mTempBuffer,mBuffSize*2,mFreq);
			alSourceQueueBuffers(mSource, 1, &buff.id);
			buff.nSamples=mBuffSize/mNumChannels;
			mNumProcessedSamples+=mBuffSize/mNumChannels;
			mBufferQueue.push(buff);

			mBuffSize=0;

			int state;
			alGetSourcei(mSource,AL_SOURCE_STATE,&state);
			if (state != AL_PLAYING)
			{
				//alSourcef(mSource,AL_PITCH,0.5); // debug
				alSourcef(mSource,AL_SAMPLE_OFFSET,(float) mNumProcessedSamples-mFreq/4);
				alSourcePlay(mSource);
			}

		}
	}
}

void OpenAL_AudioInterface::update(float time_increase)
{
	int i,state,nProcessed;
	OpenAL_Buffer buff;

	// process played buffers

	alGetSourcei(mSource,AL_BUFFERS_PROCESSED,&nProcessed);
	for (i=0;i<nProcessed;i++)
	{
		buff=mBufferQueue.front();
		mBufferQueue.pop();
		mNumPlayedSamples+=buff.nSamples;
		alSourceUnqueueBuffers(mSource,1,&buff.id);
		alDeleteBuffers(1,&buff.id);
	}

	// control playback and return time position
	alGetSourcei(mSource,AL_SOURCE_STATE,&state);
	if (state == AL_PLAYING)
	{
		alGetSourcef(mSource,AL_SEC_OFFSET,&mTime);
		mTime+=(float) mNumPlayedSamples/mFreq;
		mTimeOffset=0;
	}
	else
	{
		mTime=(float) mNumProcessedSamples/mFreq+mTimeOffset;
		mTimeOffset+=time_increase;
	}

    //Deactivated output
	//if (mTimeOffset > 0) printf("%.2f\n",mTimeOffset);

	float duration=mClip->getDuration();
	if (mTime > duration) mTime=duration;
}

void OpenAL_AudioInterface::pause()
{
	alSourcePause(mSource);
	TheoraTimer::pause();
}

void OpenAL_AudioInterface::play()
{
	alSourcePlay(mSource);
	TheoraTimer::play();
}

void OpenAL_AudioInterface::seek(float time)
{
	OpenAL_Buffer buff;

	alSourceStop(mSource);
	while (!mBufferQueue.empty())
	{
		buff=mBufferQueue.front();
		mBufferQueue.pop();
		alSourceUnqueueBuffers(mSource,1,&buff.id);
		alDeleteBuffers(1,&buff.id);
	}
//		int nProcessed;
//		alGetSourcei(mSource,AL_BUFFERS_PROCESSED,&nProcessed);
//		if (nProcessed != 0)
//			nProcessed=nProcessed;
	mBuffSize=0;
	mTimeOffset=0;

	mNumPlayedSamples=mNumProcessedSamples=(int) time*mFreq;
}

OpenAL_AudioInterfaceFactory::OpenAL_AudioInterfaceFactory()
{
	// openal init is here used only to simplify samples for this plugin
	// if you want to use this interface in your own program, you'll
	// probably want to remove the openal init/destory lines
	gDevice = alcOpenDevice("");
	if (alcGetError(gDevice) != ALC_NO_ERROR) goto Fail;
	gContext = alcCreateContext(gDevice, NULL);
	if (alcGetError(gDevice) != ALC_NO_ERROR) goto Fail;
	alcMakeContextCurrent(gContext);
	if (alcGetError(gDevice) != ALC_NO_ERROR) goto Fail;

	return;
Fail:
	gDevice=NULL;
	gContext=NULL;
}

OpenAL_AudioInterfaceFactory::~OpenAL_AudioInterfaceFactory()
{
	if (gDevice)
	{
		alcMakeContextCurrent(NULL);
		alcDestroyContext(gContext);
		alcCloseDevice(gDevice);
	}
}

OpenAL_AudioInterface* OpenAL_AudioInterfaceFactory::createInstance(TheoraVideoClip* owner,int nChannels,int freq)
{
	return new OpenAL_AudioInterface(owner,nChannels,freq);
}

