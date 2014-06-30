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

#ifndef _TheoraVideoManager_h
#define _TheoraVideoManager_h

#include <vector>
#include <string>
#include "TheoraExport.h"
#include "TheoraVideoClip.h"
#ifdef _WIN32
#pragma warning( disable: 4251 ) // MSVC++
#endif
// forward class declarations
class TheoraWorkerThread;
class TheoraMutex;
class TheoraDataSource;
class TheoraAudioInterfaceFactory;
/**
	This is the main singleton class that handles all playback/sync operations
*/
class TheoraPlayerExport TheoraVideoManager
{
protected:
	friend class TheoraWorkerThread;
	typedef std::vector<TheoraVideoClip*> ClipList;
	typedef std::vector<TheoraWorkerThread*> ThreadList;

	//! stores pointers to worker threads which are decoding video and audio
	ThreadList mWorkerThreads;
	//! stores pointers to created video clips
	ClipList mClips;
	int mDefaultNumPrecachedFrames;

	TheoraMutex* mWorkMutex;
	TheoraAudioInterfaceFactory* mAudioFactory;

	void createWorkerThreads(int n);
	void destroyWorkerThreads();

	/**
	 * Called by TheoraWorkerThread to request a TheoraVideoClip instance to work on decoding
	 */
	TheoraVideoClip* requestWork(TheoraWorkerThread* caller);
public:
	TheoraVideoManager(int num_worker_threads=1);
	virtual ~TheoraVideoManager();

	//! get the global reference to the manager instance
	static TheoraVideoManager& getSingleton();
	//! get the global pointer to the manager instance
	static TheoraVideoManager* getSingletonPtr();

	//! search registered clips by name
	TheoraVideoClip* getVideoClipByName(std::string name);

	TheoraVideoClip* createVideoClip(std::string filename,TheoraOutputMode output_mode=TH_RGB,int numPrecachedOverride=0,bool usePower2Stride=0);
	TheoraVideoClip* createVideoClip(TheoraDataSource* data_source,TheoraOutputMode output_mode=TH_RGB,int numPrecachedOverride=0,bool usePower2Stride=0);

	void update(float time_increase);

	void destroyVideoClip(TheoraVideoClip* clip);

	void setAudioInterfaceFactory(TheoraAudioInterfaceFactory* factory);
	TheoraAudioInterfaceFactory* getAudioInterfaceFactory();

	int getNumWorkerThreads();
	void setNumWorkerThreads(int n);

	void setDefaultNumPrecachedFrames(int n) { mDefaultNumPrecachedFrames=n; }
	int getDefaultNumPrecachedFrames() { return mDefaultNumPrecachedFrames; }

	//! used by libtheoraplayer functions
	void logMessage(std::string msg);

	/**
		\brief you can set your own log function to recieve theora's log calls

		This way you can integrate libtheoraplayer's log messages in your own
		logging system, prefix them, mute them or whatever you want
	 */
	static void setLogFunction(void (*fn)(std::string));

	//! get nicely formated version string
	std::string getVersionString();
	/**
	    \brief get version numbers

		if c is negative, it means it's a release candidate -c
	 */
	void getVersion(int* a,int* b,int* c);
};
#endif


