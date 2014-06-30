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
#include "TheoraAsync.h"

#ifdef _WIN32
#include <windows.h>

unsigned long WINAPI theoraAsync_Call(void* param)
{
#else
void *theoraAsync_Call(void* param)
{
#endif

	TheoraThread* t=(TheoraThread*) param;
	t->executeThread();
#ifndef _WIN32
    pthread_exit(NULL);
#endif
	return 0;
}


TheoraMutex::TheoraMutex()
{
#ifdef _WIN32
	mHandle=0;
#else
    pthread_mutex_init(&mHandle,0);
#endif
}

TheoraMutex::~TheoraMutex()
{
#ifdef _WIN32
	if (mHandle) CloseHandle(mHandle);
#else
    pthread_mutex_destroy(&mHandle);
#endif
}

void TheoraMutex::lock()
{
#ifdef _WIN32
	if (!mHandle) mHandle=CreateMutex(0,0,0);
	WaitForSingleObject(mHandle,INFINITE);
#else
    pthread_mutex_lock(&mHandle);
#endif
}

void TheoraMutex::unlock()
{
#ifdef _WIN32
	ReleaseMutex(mHandle);
#else
    pthread_mutex_unlock(&mHandle);
#endif
}


TheoraThread::TheoraThread()
{
	mThreadRunning=false;
	mHandle=0;
}

TheoraThread::~TheoraThread()
{
#ifdef _WIN32
	if (mHandle) CloseHandle(mHandle);
#endif
}

void TheoraThread::startThread()
{
	mThreadRunning=true;

#ifdef _WIN32
	mHandle=CreateThread(0,0,&theoraAsync_Call,this,0,0);
#else
    int ret=pthread_create(&mHandle,NULL,&theoraAsync_Call,this);
    if (ret) printf("ERROR: Unable to create thread!\n");
#endif
}

void TheoraThread::waitforThread()
{
	mThreadRunning=false;
#ifdef _WIN32
	WaitForSingleObject(mHandle,INFINITE);
	if (mHandle) { CloseHandle(mHandle); mHandle=0; }
#else
    pthread_join(mHandle,0);
#endif
}

