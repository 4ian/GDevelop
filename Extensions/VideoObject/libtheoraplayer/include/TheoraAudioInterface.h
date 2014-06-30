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
#ifndef _TheoraAudioInterface_h
#define _TheoraAudioInterface_h

#include "TheoraExport.h"

class TheoraVideoClip;


/**
    This is the class that serves as an interface between the library's audio
    output and the audio playback library of your choice.
    The class gets mono or stereo PCM data in in floating point data
 */
class TheoraPlayerExport TheoraAudioInterface
{
public:
	//! PCM frequency, usualy 44100 Hz
	int mFreq;
	//! Mono or stereo
	int mNumChannels;
	//! Pointer to the parent TheoraVideoClip object
	TheoraVideoClip* mClip;

	TheoraAudioInterface(TheoraVideoClip* owner,int nChannels,int freq);
	virtual ~TheoraAudioInterface();

    //! A function that the TheoraVideoClip object calls once more audio packets are decoded
    /*!
      \param data contains one or two channels of float PCM data in the range [-1,1]
      \param nSamples contains the number of samples that the data parameter contains in each channel
    */
	virtual void insertData(float** data,int nSamples)=0;

	virtual void destroy() = 0;

};

class TheoraPlayerExport TheoraAudioInterfaceFactory
{
public:
	//! VideoManager calls this when creating a new TheoraVideoClip object
	virtual TheoraAudioInterface* createInstance(TheoraVideoClip* owner,int nChannels,int freq)=0;
};


#endif


