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

#ifndef _TheoraFrameQueue_h
#define _TheoraFrameQueue_h

#include "TheoraAsync.h"
#include <list>

class TheoraVideoFrame;
class TheoraVideoClip;

/**
	This class handles the frame queue. contains frames and handles their alloctation/deallocation
	it is designed to be thread-safe
*/
class TheoraFrameQueue
{
	std::list<TheoraVideoFrame*> mQueue;
	TheoraVideoClip* mParent;
	TheoraMutex mMutex;
public:
	TheoraFrameQueue(int n,TheoraVideoClip* parent);
	~TheoraFrameQueue();

	/**
	    \brief Returns the first available frame in the queue or NULL if no frames are available.

		This function DOES NOT remove the frame from the queue, you have to do it manually
		when you want to mark the frame as used by calling the pop() function.
	*/
	TheoraVideoFrame* getFirstAvailableFrame();

	//! return the number of used (not ready) frames
	int getUsedCount();

	//! return the number of ready frames
	int getReadyCount();

	/**
	    \brief remove the first available frame from the queue.

	    Use this every time you display a frame	so you can get the next one when the time comes.
		This function marks the frame on the front of the queue as unused and it's memory then
		get's used again in the decoding process.
		If you don't call this, the frame queue will fill up with precached frames up to the
		specified amount in the TheoraVideoManager class and you won't be able to advance the video.
	*/
	void pop();
	//! frees all decoded frames for reuse (does not destroy memory, just marks them as free)
	void clear();
	//! Called by WorkerThreads when they need to unload frame data, do not call directly!
	TheoraVideoFrame* requestEmptyFrame();

	/**
	    \brief set's the size of the frame queue.

		Beware, currently stored ready frames will be lost upon this call
	*/
	void setSize(int n);
	//! return the size of the queue
	int getSize();

	//! lock the queue's mutex manually
	void lock();
	//! unlock the queue's mutex manually
	void unlock();
};

#endif

