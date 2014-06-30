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
#ifndef _TheoraWorkerThread_h
#define _TheoraWorkerThread_h

#include "TheoraAsync.h"

class TheoraVideoClip;

/**
	This is the worker thread, requests work from TheoraVideoManager
	and decodes assigned TheoraVideoClip objects
*/
class TheoraWorkerThread : public TheoraThread
{
	TheoraVideoClip* mClip;
public:
	TheoraWorkerThread();
	~TheoraWorkerThread();

	TheoraVideoClip* getAssignedClip() { return mClip; }

    //! Main Thread Body - do not call directly!
	void executeThread();
};
#endif

