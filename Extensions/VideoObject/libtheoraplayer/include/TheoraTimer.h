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

#ifndef _TheoraTimer_h
#define _TheoraTimer_h

#include "TheoraExport.h"

/**
    This is a Timer object, it is used to control the playback of a TheoraVideoClip.

	You can inherit this class and make a timer that eg. plays twice as fast,
	or playbacks an audio track and uses it's time offset for syncronizing Video etc.
 */
class TheoraPlayerExport TheoraTimer
{
protected:
	//! Current time in seconds
	float mTime,mSpeed;
	//! Is the timer paused or not
	bool mPaused;
public:
	TheoraTimer();
	virtual ~TheoraTimer();

	virtual float getTime();
	/**
	    \brief advance the time.

		If you're using another synronization system, eg. an audio track,
		then you can ignore this call or use it to perform other updates.

		NOTE: this is called by TheoraVideoManager from the main thread
	 */
	virtual void update(float time_increase);

	virtual void pause();
	virtual void play();
	virtual bool isPaused();
	virtual void stop();
	/**
	    \brief set's playback speed

        1.0 is the default. The speed factor multiplies time advance, thus
        setting the value higher will increase playback speed etc.

        NOTE: depending on Timer implementation, it may not support setting the speed

	 */
    virtual void setSpeed(float speed);
    //! return the update speed 1.0 is the default
    virtual float getSpeed();

	/**
	    \brief change the current time.

		if you're using another syncronization mechanism, make sure to adjust
		the time offset there
	 */
	virtual void seek(float time);
};
#endif


