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

#ifndef _TheoraVideoClip_h
#define _TheoraVideoClip_h

#include <string>
#include "TheoraExport.h"

// forward class declarations
class TheoraInfoStruct;
class TheoraMutex;
class TheoraFrameQueue;
class TheoraTimer;
class TheoraAudioInterface;
class TheoraWorkerThread;
class TheoraDataSource;
class TheoraVideoFrame;

/**
    format of the TheoraVideoFrame pixels. Affects decoding time
 */
enum TheoraOutputMode
{
	// A= full alpha (255), order of letters represents the byte order for a pixel
	TH_RGB=1,
	TH_RGBA=2,
	TH_ARGB=3,
	TH_BGR=4,
	TH_BGRA=5,
	TH_ABGR=6,
	TH_GREY=7,
	TH_GREY3=8, // RGB but all three components are luma
	TH_GREY3A=9,
	TH_AGREY3=10,
	TH_YUV=11,
	TH_YUVA=12,
	TH_AYUV=13
};

/**
	This object contains all data related to video playback, eg. the open source file,
	the frame queue etc.
*/
class TheoraPlayerExport TheoraVideoClip
{
	friend class TheoraWorkerThread;
	friend class TheoraVideoFrame;
	friend class TheoraVideoManager;

	TheoraFrameQueue* mFrameQueue;
	TheoraAudioInterface* mAudioInterface;
	TheoraDataSource* mStream;

	TheoraTimer *mTimer,*mDefaultTimer;

	TheoraWorkerThread* mAssignedWorkerThread;

	// benchmark vars
	int mNumDroppedFrames,mNumDisplayedFrames;

	int mTheoraStreams, mVorbisStreams;	// Keeps track of Theora and Vorbis Streams

	int mNumPrecachedFrames;
	int mAudioSkipSeekFlag;

	float mSeekPos; //! stores desired seek position. next worker thread will do the seeking and reset this var to -1
	float mDuration;
    std::string mName;
	int mWidth,mHeight,mStride;
	unsigned long mNumFrames;

	float mAudioGain; //! multiplier for audio samples. between 0 and 1
	TheoraOutputMode mOutputMode,mRequestedOutputMode;
	bool mAutoRestart;
	bool mEndOfFile,mRestarted;
	int mIteration,mLastIteration; //! used to detect when the video restarted

	float mUserPriority;

	TheoraInfoStruct* mInfo; // a pointer is used to avoid having to include theora & vorbis headers

	TheoraMutex* mAudioMutex; //! syncs audio decoding and extraction

	/**
	 * Get the priority of a video clip. based on a forumula that includes user
	 * priority factor, whether the video is paused or not, how many precached
	 * frames it has etc.
	 * This function is used in TheoraVideoManager to efficiently distribute job
	 * assignments among worker threads
	 * @return priority number of this video clip
	 */
	int calculatePriority();
	void readTheoraVorbisHeaders();
	long seekPage(long targetFrame,bool return_keyframe);
	void doSeek(); //! called by WorkerThread to seek to mSeekPos
	bool _readData();
	bool isBusy();

	void load(TheoraDataSource* source);

	void _restart(); // resets the decoder and stream but leaves the frame queue intact
public:
	TheoraVideoClip(TheoraDataSource* data_source,
		            TheoraOutputMode output_mode,
					int nPrecachedFrames,
					bool usePower2Stride);
	~TheoraVideoClip();

	std::string getName();

	//! benchmark function
	int getNumDisplayedFrames() { return mNumDisplayedFrames; }
	//! benchmark function
	int getNumDroppedFrames() { return mNumDroppedFrames; }

	//! return width in pixels of the video clip
	int getWidth() { return mWidth; }
	//! return height in pixels of the video clip
	int getHeight() { return mHeight; }
	/**
	    \brief return stride in pixels

		If you've specified usePower2Stride when creating the TheoraVideoClip object
		then this value will be the next power of two size compared to width,
		eg: w=376, stride=512.

		Otherwise, stride will be equal to width
	 */
	int getStride() { return mStride; }

	//! retur the timer objet associated with this object
	TheoraTimer* getTimer();
	//! replace the timer object with a new one
	void setTimer(TheoraTimer* timer);

	//! used by TheoraWorkerThread, do not call directly
	void decodeNextFrame();

	//! advance time. TheoraVideoManager calls this
	void update(float time_increase);
	/**
	    \brief update timer to the display time of the next frame

		useful if you want to grab frames instead of regular display
		\return time advanced. 0 if no frames are ready
	*/
	float updateToNextFrame();

	/**
	    \brief pop the frame from the front of the FrameQueue

		see TheoraFrameQueue::pop() for more details
	 */
	void popFrame();

	/**
	    \brief Returns the first available frame in the queue or NULL if no frames are available.

		see TheoraFrameQueue::getFirstAvailableFrame() for more details
	*/
	TheoraVideoFrame* getNextFrame();
	/**
	    check if there is enough audio data decoded to submit to the audio interface

		TheoraWorkerThread calls this
	 */
	void decodedAudioCheck();

	void setAudioInterface(TheoraAudioInterface* iface);
	TheoraAudioInterface* getAudioInterface();

	/**
	    \brief resize the frame queues

		Warning: this call discards ready frames in the frame queue
	 */
	void setNumPrecachedFrames(int n);
	//! returns the size of the frame queue
	int getNumPrecachedFrames();
	//! returns the number of ready frames in the frame queue
	int getNumReadyFrames();

	//! if you want to adjust the audio gain. range [0,1]
	void setAudioGain(float gain);
	float getAudioGain();

	//! if you want the video to automatically and smoothly restart when the last frame is reached
	void setAutoRestart(bool value);
	bool getAutoRestart() { return mAutoRestart; }
	/**
	    TODO: user priority. Useful only when more than one video is being decoded
	 */
	void setPriority(float priority);
	float getPriority();

	//! Used by TheoraVideoManager to schedule work
	float getPriorityIndex();

	//! get the current time index from the timer object
	float getTimePosition();
	//! get the duration of the movie in seconds
	float getDuration();
	//! return the clips' frame rate
	int getFPS();
	//! get the number of frames in this movie
	int getNumFrames() { return mNumFrames; }

	//! return the current output mode for this video object
	TheoraOutputMode getOutputMode();
	/**
	    set a new output mode

		Warning: this discards the frame queue. ready frames will be lost.
	 */
	void setOutputMode(TheoraOutputMode mode);

    bool isDone();
	void play();
	void pause();
	void restart();
	bool isPaused();
	void stop();
    void setPlaybackSpeed(float speed);
    float getPlaybackSpeed();
	//! seek to a given time position
	void seek(float time);
};

#endif

