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
#ifndef _TheoraVideoFrame_h
#define _TheoraVideoFrame_h

#include <TheoraExport.h>

class TheoraVideoClip;
/**

*/
class TheoraPlayerExport TheoraVideoFrame
{
	TheoraVideoClip* mParent;
	unsigned char* mBuffer;
	unsigned long mFrameNumber;

public:
	//! global time in seconds this frame should be displayed on
	float mTimeToDisplay;
	//! whether the frame is ready for display or not
	bool mReady;
	//! indicates the frame is being used by TheoraWorkerThread instance
	bool mInUse;
	//! used to detect when the video restarted to ensure smooth playback
	int mIteration;

	TheoraVideoFrame(TheoraVideoClip* parent);
	~TheoraVideoFrame();

	//! internal function, do not use directly
	void _setFrameNumber(int number) { mFrameNumber=number; }
	//! returns the frame number of this frame in the theora stream
	int getFrameNumber() { return mFrameNumber; }

	void clear();

	int getWidth();
	int getStride();
	int getHeight();

	unsigned char* getBuffer();

	//! Called by TheoraVideoClip to decode a YUV buffer onto itself
	void decode(void* yuv);
};
#endif

