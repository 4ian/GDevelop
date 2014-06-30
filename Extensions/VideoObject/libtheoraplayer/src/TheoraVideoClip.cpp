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
#include <memory.h>
#include <ogg/ogg.h>
#include <vorbis/vorbisfile.h>
#include <theora/theoradec.h>
#include "TheoraVideoClip.h"
#include "TheoraVideoManager.h"
#include "TheoraVideoFrame.h"
#include "TheoraFrameQueue.h"
#include "TheoraAudioInterface.h"
#include "TheoraTimer.h"
#include "TheoraDataSource.h"
#include "TheoraUtil.h"
#include "TheoraException.h"

class TheoraInfoStruct
{
public:
	// ogg/vorbis/theora variables
	ogg_sync_state   OggSyncState;
	ogg_page         OggPage;
	ogg_stream_state VorbisStreamState;
	ogg_stream_state TheoraStreamState;
	//Theora State
	th_info        TheoraInfo;
	th_comment     TheoraComment;
	th_setup_info* TheoraSetup;
	th_dec_ctx*    TheoraDecoder;
	//Vorbis State
	vorbis_info      VorbisInfo;
	vorbis_dsp_state VorbisDSPState;
	vorbis_block     VorbisBlock;
	vorbis_comment   VorbisComment;

	TheoraInfoStruct()
	{
		TheoraDecoder=0;
		TheoraSetup=0;
	}
};

//! clears a portion of memory with an unsign
void memset_uint(void* buffer,unsigned int colour,unsigned int size_in_bytes)
{
	unsigned int* data=(unsigned int*) buffer;
	for (unsigned int i=0;i<size_in_bytes;i+=4)
	{
		*data=colour;
		data++;
	}
}

TheoraVideoClip::TheoraVideoClip(TheoraDataSource* data_source,
								 TheoraOutputMode output_mode,
								 int nPrecachedFrames,
								 bool usePower2Stride):
	mAudioInterface(NULL),
	mNumDroppedFrames(0),
	mNumDisplayedFrames(0),
	mTheoraStreams(0),
	mVorbisStreams(0),
	mAudioSkipSeekFlag(0),
	mSeekPos(-1),
	mDuration(-1),
    mName(data_source->repr()),
    mStride(usePower2Stride),
    mAudioGain(1),
    mOutputMode(output_mode),
    mRequestedOutputMode(output_mode),
    mAutoRestart(0),
    mEndOfFile(0),
    mRestarted(0),
	mIteration(0),
	mLastIteration(0)
{
	mAudioMutex=new TheoraMutex;

	mTimer=mDefaultTimer=new TheoraTimer();

	mFrameQueue=NULL;
	mAssignedWorkerThread=NULL;
	mNumPrecachedFrames=nPrecachedFrames;

	mInfo=new TheoraInfoStruct;

	load(data_source);
}

TheoraVideoClip::~TheoraVideoClip()
{
	// wait untill a worker thread is done decoding the frame
	while (mAssignedWorkerThread)
	{
		_psleep(1);
	}

	delete mDefaultTimer;

	if (!mStream) delete mStream;


	if (mFrameQueue) delete mFrameQueue;

	if (mInfo->TheoraDecoder)
		th_decode_free(mInfo->TheoraDecoder);

	if (mInfo->TheoraSetup)
		th_setup_free(mInfo->TheoraSetup);
	delete mInfo;

	if (mAudioInterface)
	{
		mAudioMutex->lock(); // ensure a thread isn't using this mutex

	// probably not necesarry because all it does is memset to 0
	//	ogg_stream_clear(&mInfo->VorbisStreamState);
	//	vorbis_block_clear(&mInfo->VorbisBlock);
	//	vorbis_dsp_clear(&mInfo->VorbisDSPState);
	//	vorbis_comment_clear(&mInfo->VorbisComment);
	//	vorbis_info_clear(&mInfo->VorbisInfo);
		mAudioInterface->destroy(); // notify audio interface it's time to call it a day
	}
	delete mAudioMutex;

	//ogg_sync_clear(&mInfo->OggSyncState);
}

TheoraTimer* TheoraVideoClip::getTimer()
{
	return mTimer;
}

void TheoraVideoClip::setTimer(TheoraTimer* timer)
{
	if (!timer) mTimer=mDefaultTimer;
	else mTimer=timer;
}

bool TheoraVideoClip::_readData()
{
	int audio_eos=0;
	float audio_time=0;
	float time=mTimer->getTime();
	if (mRestarted) time=0;

	for (;;)
	{
		char *buffer = ogg_sync_buffer( &mInfo->OggSyncState, 4096);
		int bytesRead = mStream->read( buffer, 4096 );
		ogg_sync_wrote(&mInfo->OggSyncState, bytesRead);

		if (bytesRead < 4096)
		{
			if (bytesRead == 0)
			{
				if (mAutoRestart) _restart();
				else mEndOfFile=true;
				return 0;
			}
		}
		while ( ogg_sync_pageout( &mInfo->OggSyncState, &mInfo->OggPage ) > 0 )
		{
			ogg_stream_pagein(&mInfo->TheoraStreamState,&mInfo->OggPage);
			if (mAudioInterface &&
				ogg_page_serialno(&mInfo->OggPage) == mInfo->VorbisStreamState.serialno)
			{
				ogg_int64_t g=ogg_page_granulepos(&mInfo->OggPage);
				audio_time=(float) vorbis_granule_time(&mInfo->VorbisDSPState,g);
				audio_eos=ogg_page_eos(&mInfo->OggPage);

				if (mSeekPos == -2 && !mAudioSkipSeekFlag)
				{

					if (g > -1) { mAudioSkipSeekFlag=1; continue; }
					if (g == -1) continue;
				}
				mAudioMutex->lock();
				ogg_stream_pagein(&mInfo->VorbisStreamState,&mInfo->OggPage);
				mAudioMutex->unlock();
			}
		}
		if (!(mAudioInterface && !audio_eos && audio_time < time+1.0f))
			break;
	}
	return 1;
}

void TheoraVideoClip::decodeNextFrame()
{
	if (mEndOfFile) return;

	TheoraVideoFrame* frame=mFrameQueue->requestEmptyFrame();
	if (!frame) return; // max number of precached frames reached
	long nSeekSkippedFrames=0;
	ogg_packet opTheora;
	ogg_int64_t granulePos;
	th_ycbcr_buffer buff;

	//writelog("Decoding video "+mName);

	for(;;)
	{
		int ret=ogg_stream_packetout(&mInfo->TheoraStreamState,&opTheora);

		if (ret > 0)
		{

			if (mSeekPos == -2) // searching for next keyframe
			{
				int keyframe=th_packet_iskeyframe(&opTheora);
				if (!keyframe) { nSeekSkippedFrames++; continue; }
				mSeekPos=-1;
				if (nSeekSkippedFrames > 0)
					th_writelog(mName+"[seek]: skipped "+str(nSeekSkippedFrames)+" frames while searching for keyframe");
			}
			if (th_decode_packetin(mInfo->TheoraDecoder, &opTheora,&granulePos ) != 0) continue; // 0 means success
			float time=(float) th_granule_time(mInfo->TheoraDecoder,granulePos);
			unsigned long frame_number=(unsigned long) th_granule_frame(mInfo->TheoraDecoder,granulePos);
			if (time > mDuration)
				mDuration=time; // duration corrections


			if (time < mTimer->getTime() && !mRestarted)
			{
#ifdef _DEBUG
				th_writelog(mName+": pre-dropped frame "+str(frame_number));
#endif
				mNumDisplayedFrames++;
				mNumDroppedFrames++;
				continue; // drop frame
			}
			frame->mTimeToDisplay=time;
			frame->mIteration=mIteration;
			frame->_setFrameNumber(frame_number);
			th_decode_ycbcr_out(mInfo->TheoraDecoder,buff);
			frame->decode(buff);
			//_psleep(rand()%20); // temp
			break;
		}
		else
		{
			if (!_readData())
			{
				frame->mInUse=0;
				return;
			}
		}
	}
}

void TheoraVideoClip::_restart()
{
	long granule=0;
	th_decode_ctl(mInfo->TheoraDecoder,TH_DECCTL_SET_GRANPOS,&granule,sizeof(granule));
	th_decode_free(mInfo->TheoraDecoder);
	mInfo->TheoraDecoder=th_decode_alloc(&mInfo->TheoraInfo,mInfo->TheoraSetup);
	ogg_stream_reset(&mInfo->TheoraStreamState);
	if (mAudioInterface)
	{
		// empty the DSP buffer
		//float **pcm;
		//int len = vorbis_synthesis_pcmout(&mInfo->VorbisDSPState,&pcm);
		//if (len) vorbis_synthesis_read(&mInfo->VorbisDSPState,len);
		ogg_packet opVorbis;
		while (ogg_stream_packetout(&mInfo->VorbisStreamState,&opVorbis) > 0)
		{
			if (vorbis_synthesis(&mInfo->VorbisBlock,&opVorbis) == 0)
				vorbis_synthesis_blockin(&mInfo->VorbisDSPState,&mInfo->VorbisBlock);
		}
		ogg_stream_reset(&mInfo->VorbisStreamState);
	}

	ogg_sync_reset(&mInfo->OggSyncState);
	mStream->seek(0);
	//mTimer->seek(0);
	mEndOfFile=false;

	mRestarted=1;
}

void TheoraVideoClip::restart()
{
	bool end=mEndOfFile;
	mEndOfFile=1; //temp, to prevent threads to decode while restarting
	while (mAssignedWorkerThread) _psleep(1); // wait for assigned thread to do it's work
	_restart();
	mTimer->seek(0);
	mFrameQueue->clear();
	mEndOfFile=0;
	mIteration=0;
	mRestarted=0;
	mSeekPos=-1;
}

void TheoraVideoClip::update(float time_increase)
{
	if (mTimer->isPaused() && mSeekPos != -3) return;
	mTimer->update(time_increase);
	float time=mTimer->getTime();
	if (time >= mDuration)
	{
		if (mAutoRestart && mRestarted)
		{
			mIteration=!mIteration;
			mTimer->seek(time-mDuration);
			mRestarted=0;
			int n=0;
			for (;;)
			{
				TheoraVideoFrame* f=mFrameQueue->getFirstAvailableFrame();
				if (!f) break;
				if (f->mTimeToDisplay > 0.5f)
				{
					if (n == 0)
					{
						f->mTimeToDisplay=time-mDuration;
						f->mIteration=!f->mIteration;
					}
					else
						popFrame();
					n++;
				}
				else break;
			}
			if (n > 0) th_writelog("dropped "+str(n)+" end frames");
		}
		else return;
	}
}

float TheoraVideoClip::updateToNextFrame()
{
	TheoraVideoFrame* f=mFrameQueue->getFirstAvailableFrame();
	if (!f) return 0;

	float time=f->mTimeToDisplay-mTimer->getTime();
	update(time);
	return time;
}

void TheoraVideoClip::popFrame()
{
	mNumDisplayedFrames++;
	mFrameQueue->pop(); // after transfering frame data to the texture, free the frame
						// so it can be used again
}

TheoraVideoFrame* TheoraVideoClip::getNextFrame()
{
	TheoraVideoFrame* frame;
	float time=mTimer->getTime();
	for (;;)
	{
		frame=mFrameQueue->getFirstAvailableFrame();
		if (!frame) return 0;
		if (frame->mTimeToDisplay > time) return 0;
		if (frame->mTimeToDisplay < time-0.1)
		{
			if (mRestarted && frame->mTimeToDisplay < 2) return 0;
#ifdef _DEBUG
			th_writelog(mName+": dropped frame "+str(frame->getFrameNumber()));
#endif
			mNumDroppedFrames++;
			mNumDisplayedFrames++;
			mFrameQueue->pop();
		}
		else break;
	}

	mLastIteration=frame->mIteration;
	return frame;

}

void TheoraVideoClip::decodedAudioCheck()
{
	if (!mAudioInterface || mTimer->isPaused()) return;

	mAudioMutex->lock();

	ogg_packet opVorbis;
	float **pcm;
	int len=0;
	while (1)
	{
		len = vorbis_synthesis_pcmout(&mInfo->VorbisDSPState,&pcm);
		if (!len)
		{
			if (mRestarted) break;
			if (ogg_stream_packetout(&mInfo->VorbisStreamState,&opVorbis) > 0)
			{
				if (vorbis_synthesis(&mInfo->VorbisBlock,&opVorbis) == 0)
					vorbis_synthesis_blockin(&mInfo->VorbisDSPState,&mInfo->VorbisBlock);
				continue;
			}
			else break;
		}
		if (mAudioGain < 1)
		{
			// gain applied, let's attenuate the samples
			for (int i=0;i<len;i++)
			{
				for (int j=0;j<mInfo->VorbisInfo.channels;j++)
				{
					pcm[j][i]*=mAudioGain;
				}
			}
		}
		mAudioInterface->insertData(pcm,len);
		vorbis_synthesis_read(&mInfo->VorbisDSPState,len);
	}

	mAudioMutex->unlock();
}

void TheoraVideoClip::load(TheoraDataSource* source)
{
	mStream=source;
	readTheoraVorbisHeaders();


	mInfo->TheoraDecoder=th_decode_alloc(&mInfo->TheoraInfo,mInfo->TheoraSetup);

	mWidth=mInfo->TheoraInfo.frame_width;
	mHeight=mInfo->TheoraInfo.frame_height;
	mStride=(mStride == 1) ? mStride=_nextPow2(mWidth) : mWidth;

	mFrameQueue=new TheoraFrameQueue(mNumPrecachedFrames,this);


	// find out the duration of the file by seeking to the end
	// having ogg decode pages, extract the granule pos from
	// the last theora page and seek back to beginning of the file
	for (int i=1;i<=10;i++)
	{
		ogg_sync_reset(&mInfo->OggSyncState);
		mStream->seek(mStream->size()-4096*i);

		char *buffer = ogg_sync_buffer(&mInfo->OggSyncState, 4096*i);
		int bytesRead = mStream->read(buffer, 4096*i);
		ogg_sync_wrote(&mInfo->OggSyncState, bytesRead );
		ogg_sync_pageseek(&mInfo->OggSyncState,&mInfo->OggPage);

		while (1)
		{
			int ret=ogg_sync_pageout( &mInfo->OggSyncState, &mInfo->OggPage );
			if (ret == 0) break;
			// if page is not a theora page, skip it
			if (ogg_page_serialno(&mInfo->OggPage) != mInfo->TheoraStreamState.serialno) continue;

			unsigned long granule=(unsigned long) ogg_page_granulepos(&mInfo->OggPage);
			if (granule >= 0)
			{
				mDuration=(float) th_granule_time(mInfo->TheoraDecoder,granule);
				mNumFrames=(unsigned long) th_granule_frame(mInfo->TheoraDecoder,granule)+1;
			}
		}
		if (mDuration > 0) break;

	}
	if (mDuration < 0)
		th_writelog(mName+": unable to determine file duration!");
	else
		th_writelog(mName+": file duration is "+strf(mDuration)+" seconds");
	// restore to beginning of stream.
	ogg_sync_reset(&mInfo->OggSyncState);
	mStream->seek(0);
	mTheoraStreams=mVorbisStreams=0;
	readTheoraVorbisHeaders();

	if (mVorbisStreams) // if there is no audio interface factory defined, even though the video
		                // clip might have audio, it will be ignored
	{
		vorbis_synthesis_init(&mInfo->VorbisDSPState,&mInfo->VorbisInfo);
		vorbis_block_init(&mInfo->VorbisDSPState,&mInfo->VorbisBlock);
		// create an audio interface instance if available
		TheoraAudioInterfaceFactory* audio_factory=TheoraVideoManager::getSingleton().getAudioInterfaceFactory();
		if (audio_factory) setAudioInterface(audio_factory->createInstance(this,mInfo->VorbisInfo.channels,mInfo->VorbisInfo.rate));
	}
}

void TheoraVideoClip::readTheoraVorbisHeaders()
{
	ogg_packet tempOggPacket;
	bool done = false;
	bool decode_audio=TheoraVideoManager::getSingleton().getAudioInterfaceFactory() != NULL;
	//init Vorbis/Theora Layer
	//Ensure all structures get cleared out.
	memset(&mInfo->OggSyncState, 0, sizeof(ogg_sync_state));
	memset(&mInfo->OggPage, 0, sizeof(ogg_page));
	memset(&mInfo->VorbisStreamState, 0, sizeof(ogg_stream_state));
	memset(&mInfo->TheoraStreamState, 0, sizeof(ogg_stream_state));
	memset(&mInfo->TheoraInfo, 0, sizeof(th_info));
	memset(&mInfo->TheoraComment, 0, sizeof(th_comment));
	memset(&mInfo->VorbisInfo, 0, sizeof(vorbis_info));
	memset(&mInfo->VorbisDSPState, 0, sizeof(vorbis_dsp_state));
	memset(&mInfo->VorbisBlock, 0, sizeof(vorbis_block));
	memset(&mInfo->VorbisComment, 0, sizeof(vorbis_comment));

	ogg_sync_init(&mInfo->OggSyncState);
	th_comment_init(&mInfo->TheoraComment);
	th_info_init(&mInfo->TheoraInfo);
	vorbis_info_init(&mInfo->VorbisInfo);
	vorbis_comment_init(&mInfo->VorbisComment);

	while (!done)
	{
		char *buffer = ogg_sync_buffer( &mInfo->OggSyncState, 4096);
		int bytesRead = mStream->read( buffer, 4096 );
		ogg_sync_wrote( &mInfo->OggSyncState, bytesRead );

		if( bytesRead == 0 )
			break;

		while( ogg_sync_pageout( &mInfo->OggSyncState, &mInfo->OggPage ) > 0 )
		{
			ogg_stream_state OggStateTest;

			//is this an initial header? If not, stop
			if( !ogg_page_bos( &mInfo->OggPage ) )
			{
				//This is done blindly, because stream only accept them selfs
				if (mTheoraStreams)
					ogg_stream_pagein( &mInfo->TheoraStreamState, &mInfo->OggPage );
				if (mVorbisStreams)
					ogg_stream_pagein( &mInfo->VorbisStreamState, &mInfo->OggPage );

				done=true;
				break;
			}

			ogg_stream_init( &OggStateTest, ogg_page_serialno( &mInfo->OggPage ) );
			ogg_stream_pagein( &OggStateTest, &mInfo->OggPage );
			ogg_stream_packetout( &OggStateTest, &tempOggPacket );

			//identify the codec
			int ret;
			if( !mTheoraStreams)
			{
				ret=th_decode_headerin( &mInfo->TheoraInfo, &mInfo->TheoraComment, &mInfo->TheoraSetup, &tempOggPacket);

				if (ret > 0)
				{
					//This is the Theora Header
					memcpy( &mInfo->TheoraStreamState, &OggStateTest, sizeof(OggStateTest));
					mTheoraStreams = 1;
					continue;
				}
			}
			if (decode_audio && !mVorbisStreams &&
				vorbis_synthesis_headerin(&mInfo->VorbisInfo, &mInfo->VorbisComment, &tempOggPacket) >=0 )
			{
				//This is vorbis header
				memcpy( &mInfo->VorbisStreamState, &OggStateTest, sizeof(OggStateTest));
				mVorbisStreams = 1;
				continue;
			}
			//Hmm. I guess it's not a header we support, so erase it
			ogg_stream_clear(&OggStateTest);
		}
	}

	while ((mTheoraStreams && (mTheoraStreams < 3)) ||
		   (mVorbisStreams && (mVorbisStreams < 3)) )
	{
		//Check 2nd'dary headers... Theora First
		int iSuccess;
		while( mTheoraStreams &&
			 ( mTheoraStreams < 3) &&
			 ( iSuccess = ogg_stream_packetout( &mInfo->TheoraStreamState, &tempOggPacket)) )
		{
			if( iSuccess < 0 )
				throw TheoraGenericException("Error parsing Theora stream headers.");

			if( !th_decode_headerin(&mInfo->TheoraInfo, &mInfo->TheoraComment, &mInfo->TheoraSetup, &tempOggPacket) )
				throw TheoraGenericException("invalid theora stream");

			mTheoraStreams++;
		} //end while looking for more theora headers

		//look 2nd vorbis header packets
		while(// mVorbisStreams &&
			 ( mVorbisStreams < 3 ) &&
			 ( iSuccess=ogg_stream_packetout( &mInfo->VorbisStreamState, &tempOggPacket)))
		{
			if(iSuccess < 0)
				throw TheoraGenericException("Error parsing vorbis stream headers");

			if(vorbis_synthesis_headerin( &mInfo->VorbisInfo, &mInfo->VorbisComment,&tempOggPacket))
				throw TheoraGenericException("invalid stream");

			mVorbisStreams++;
		} //end while looking for more vorbis headers

		//Not finished with Headers, get some more file data
		if( ogg_sync_pageout( &mInfo->OggSyncState, &mInfo->OggPage ) > 0 )
		{
			if(mTheoraStreams)
				ogg_stream_pagein( &mInfo->TheoraStreamState, &mInfo->OggPage );
			if(mVorbisStreams)
				ogg_stream_pagein( &mInfo->VorbisStreamState, &mInfo->OggPage );
		}
		else
		{
			char *buffer = ogg_sync_buffer( &mInfo->OggSyncState, 4096);
			int bytesRead = mStream->read( buffer, 4096 );
			ogg_sync_wrote( &mInfo->OggSyncState, bytesRead );

			if( bytesRead == 0 )
				throw TheoraGenericException("End of file found prematurely");
		}
	} //end while looking for all headers
//	writelog("Vorbis Headers: " + str(mVorbisHeaders) + " Theora Headers : " + str(mTheoraHeaders));
}

std::string TheoraVideoClip::getName()
{
	return mName;
}

bool TheoraVideoClip::isBusy()
{
	return mAssignedWorkerThread || mOutputMode != mRequestedOutputMode;
}

TheoraOutputMode TheoraVideoClip::getOutputMode()
{
	return mOutputMode;
}

void TheoraVideoClip::setOutputMode(TheoraOutputMode mode)
{
	if (mOutputMode == mode) return;
	mRequestedOutputMode=mode;
	while (mAssignedWorkerThread) _psleep(1);
	// discard current frames and recreate them
	mFrameQueue->setSize(mFrameQueue->getSize());
	mOutputMode=mRequestedOutputMode;
}

float TheoraVideoClip::getTimePosition()
{
	return mTimer->getTime();
}
int TheoraVideoClip::getNumPrecachedFrames()
{
	return mFrameQueue->getSize();
}

void TheoraVideoClip::setNumPrecachedFrames(int n)
{
	if (mFrameQueue->getSize() != n)
		mFrameQueue->setSize(n);
}

int TheoraVideoClip::getNumReadyFrames()
{
	return mFrameQueue->getReadyCount();
}

float TheoraVideoClip::getDuration()
{
	return mDuration;
}

int TheoraVideoClip::getFPS()
{
	return mInfo->TheoraInfo.fps_numerator;
}

void TheoraVideoClip::play()
{
	mTimer->play();
}

void TheoraVideoClip::pause()
{
	mTimer->pause();
}

bool TheoraVideoClip::isPaused()
{
	return mTimer->isPaused();
}

bool TheoraVideoClip::isDone()
{
    return mEndOfFile && !mFrameQueue->getFirstAvailableFrame();
}

void TheoraVideoClip::stop()
{
	pause();
	seek(0);
}

void TheoraVideoClip::setPlaybackSpeed(float speed)
{
    mTimer->setSpeed(speed);
}

float TheoraVideoClip::getPlaybackSpeed()
{
    return mTimer->getSpeed();
}

long TheoraVideoClip::seekPage(long targetFrame,bool return_keyframe)
{
	int i,seek_min=0, seek_max=mStream->size();
	long frame;
	ogg_int64_t granule=0;
	bool fineseek=0;

	for (i=0;i<100;i++)
	{
		ogg_sync_reset( &mInfo->OggSyncState );
		mStream->seek((seek_min+seek_max)/2);
		memset(&mInfo->OggPage, 0, sizeof(ogg_page));
		ogg_sync_pageseek(&mInfo->OggSyncState,&mInfo->OggPage);

		for (;;)
		{
			int ret=ogg_sync_pageout( &mInfo->OggSyncState, &mInfo->OggPage );
			if (ret == 1)
			{
				int serno=ogg_page_serialno(&mInfo->OggPage);
				if (serno == mInfo->TheoraStreamState.serialno)
				{
					granule=ogg_page_granulepos(&mInfo->OggPage);
					if (granule >= 0)
					{
						frame=(long) th_granule_frame(mInfo->TheoraDecoder,granule);
						if (frame < targetFrame-1 && targetFrame-frame < 10)
						{
							fineseek=1;
							if (!return_keyframe) break;
						}
						if (fineseek && frame >= targetFrame)
							break;

						if (fineseek) continue;
						if (targetFrame-1 > frame) seek_min=(seek_min+seek_max)/2;
						else				       seek_max=(seek_min+seek_max)/2;
						break;
					}
				}
			}
			else
			{
				char *buffer = ogg_sync_buffer( &mInfo->OggSyncState, 4096);
				int bytesRead = mStream->read( buffer, 4096);
				if (bytesRead == 0) break;
				ogg_sync_wrote( &mInfo->OggSyncState, bytesRead );
			}
		}
		if (fineseek) break;
	}
	if (return_keyframe) return (long) (granule >> mInfo->TheoraInfo.keyframe_granule_shift);

	ogg_stream_pagein(&mInfo->TheoraStreamState,&mInfo->OggPage);
	//granule=frame << mInfo->TheoraInfo.keyframe_granule_shift;
	th_decode_ctl(mInfo->TheoraDecoder,TH_DECCTL_SET_GRANPOS,&granule,sizeof(granule));

	return -1;
}

void TheoraVideoClip::doSeek()
{
	int frame,targetFrame=(int) (mNumFrames*mSeekPos/mDuration);

	if (targetFrame == 0)
	{
		_restart();
		mTimer->seek(0);
		mFrameQueue->clear();
		return;
	}

	mEndOfFile=0;
	mRestarted=0;

	mFrameQueue->clear();
	ogg_stream_reset(&mInfo->TheoraStreamState);
	th_decode_free(mInfo->TheoraDecoder);
	mInfo->TheoraDecoder=th_decode_alloc(&mInfo->TheoraInfo,mInfo->TheoraSetup);

	if (mAudioInterface)
	{
		mAudioMutex->lock();
		ogg_stream_reset(&mInfo->VorbisStreamState);
		vorbis_synthesis_restart(&mInfo->VorbisDSPState);
	}

	// first seek to desired frame, then figure out the location of the
	// previous keyframe and seek to it.
	// then by setting the correct time, the decoder will skip N frames untill
	// we get the frame we want.
	frame=seekPage(targetFrame,1);
	if (frame != -1) seekPage(std::max(0,frame),0);

	float time=((float) targetFrame/mNumFrames)*mDuration;

	if (mAudioInterface)
	{
		// let's decode some pages and seek to the appropriate PCM sample
		ogg_int64_t granule=0;
		float last_page_time=time;
		for (;;)
		{
			int ret=ogg_sync_pageout( &mInfo->OggSyncState, &mInfo->OggPage );
			if (ret == 1)
			{
				int serno=ogg_page_serialno(&mInfo->OggPage);
				if (serno == mInfo->VorbisStreamState.serialno)
				{
					granule=ogg_page_granulepos(&mInfo->OggPage);
					float g_time=(float) vorbis_granule_time(&mInfo->VorbisDSPState,granule);
					if (g_time > time)
					{
						float **pcm;
						int len = vorbis_synthesis_pcmout(&mInfo->VorbisDSPState,&pcm);
						if (len > 0)
							break;
						//ogg_stream_pagein(&mInfo->VorbisStreamState,&mInfo->OggPage);
						time=g_time;
						break;
					}
					last_page_time=g_time;
				}
				else ogg_stream_pagein(&mInfo->TheoraStreamState,&mInfo->OggPage);
			}
			else
			{
				char *buffer = ogg_sync_buffer( &mInfo->OggSyncState, 4096);
				int bytesRead = mStream->read( buffer, 4096);
				if (bytesRead == 0) break;
				ogg_sync_wrote( &mInfo->OggSyncState, bytesRead );
			}
		}
	}

	mTimer->seek(time);
	mSeekPos=-2; // tell the decoder to discard frames until the keyframe is found
	if (mAudioInterface) mAudioMutex->unlock();
}

void TheoraVideoClip::seek(float time)
{
	mSeekPos=time;
	mEndOfFile=false;
}

float TheoraVideoClip::getPriority()
{
	// TODO
	return getNumPrecachedFrames()*10.0f;
}

float TheoraVideoClip::getPriorityIndex()
{
	float priority=(float) getNumReadyFrames();
	if (mTimer->isPaused()) priority+=getNumPrecachedFrames()/2;
	return priority;
}

void TheoraVideoClip::setAudioInterface(TheoraAudioInterface* iface)
{
	mAudioInterface=iface;
}

TheoraAudioInterface* TheoraVideoClip::getAudioInterface()
{
	return mAudioInterface;
}

void TheoraVideoClip::setAudioGain(float gain)
{
	if (gain > 1) mAudioGain=1;
	if (gain < 0) mAudioGain=0;
	else          mAudioGain=gain;
}

float TheoraVideoClip::getAudioGain()
{
	return mAudioGain;
}

void TheoraVideoClip::setAutoRestart(bool value)
{
	mAutoRestart=value;
	if (value) mEndOfFile=false;
}

