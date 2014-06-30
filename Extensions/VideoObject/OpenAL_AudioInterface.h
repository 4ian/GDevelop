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

#ifndef _OpenAL_AudioInterface_h
#define _OpenAL_AudioInterface_h

#include "TheoraAudioInterface.h"
#include "TheoraVideoClip.h"
#include "TheoraTimer.h"

#ifndef __APPLE__
#include <AL/al.h>
#include <AL/alc.h>
#else
#include <OpenAL/al.h>
#include <OpenAL/alc.h>
#endif
#include <queue>

class OpenAL_AudioInterface : public TheoraAudioInterface, TheoraTimer
{
	int mMaxBuffSize;
	int mBuffSize;
	short *mTempBuffer;
	float mTimeOffset;

	struct OpenAL_Buffer
	{
		ALuint id;
		int nSamples;
	}mBuffers[1000];
	std::queue<OpenAL_Buffer> mBufferQueue;

	ALuint mSource;
	int mNumProcessedSamples,mNumPlayedSamples;
public:
	OpenAL_AudioInterface(TheoraVideoClip* owner,int nChannels,int freq);
	~OpenAL_AudioInterface();
	void insertData(float** data,int nSamples);
	void destroy();

	void update(float time_increase);

	void pause();
	void play();
	void seek(float time);
};
class OpenAL_AudioInterfaceFactory : public TheoraAudioInterfaceFactory
{
public:
	OpenAL_AudioInterfaceFactory();
	~OpenAL_AudioInterfaceFactory();
	OpenAL_AudioInterface* createInstance(TheoraVideoClip* owner,int nChannels,int freq);
};

#endif

