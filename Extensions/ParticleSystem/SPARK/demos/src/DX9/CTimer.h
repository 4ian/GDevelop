//////////////////////////////////////////////////////////////////////////////////
// SPARK particle engine														//
// Copyright (C) 2009 - foulon matthieu - stardeath@wanadoo.fr					//
//																				//
// This software is provided 'as-is', without any express or implied			//
// warranty.  In no event will the authors be held liable for any damages		//
// arising from the use of this software.										//
//																				//
// Permission is granted to anyone to use this software for any purpose,		//
// including commercial applications, and to alter it and redistribute it		//
// freely, subject to the following restrictions:								//
//																				//
// 1. The origin of this software must not be misrepresented; you must not		//
//    claim that you wrote the original software. If you use this software		//
//    in a product, an acknowledgment in the product documentation would be		//
//    appreciated but is not required.											//
// 2. Altered source versions must be plainly marked as such, and must not be	//
//    misrepresented as being the original software.							//
// 3. This notice may not be removed or altered from any source distribution.	//
//////////////////////////////////////////////////////////////////////////////////

#pragma once

#include <windows.h>
#include <mmsystem.h>

class CTimer  
{
public:

    CTimer()
	{
		strcpy_s(lastError,"Pas d'erreur");
	}

	~CTimer(){}

	bool Start()
	{
		if ( !QueryPerformanceFrequency(&frequence) )
		{
			LPVOID lpMsgBuf; 
			FormatMessage(FORMAT_MESSAGE_ALLOCATE_BUFFER | FORMAT_MESSAGE_FROM_SYSTEM |	FORMAT_MESSAGE_IGNORE_INSERTS, NULL, ::GetLastError(), 0, (LPTSTR) &lpMsgBuf, 0, NULL); 
			strcpy_s(lastError,(LPCSTR)lpMsgBuf);
			LocalFree( lpMsgBuf );
			return false;
	        
		}
		if( !QueryPerformanceCounter(&debut) )
		{
			LPVOID lpMsgBuf; 
			FormatMessage(FORMAT_MESSAGE_ALLOCATE_BUFFER | FORMAT_MESSAGE_FROM_SYSTEM | FORMAT_MESSAGE_IGNORE_INSERTS, NULL, ::GetLastError(), 0, (LPTSTR) &lpMsgBuf, 0, NULL); 
			strcpy_s(lastError,(LPCSTR)lpMsgBuf);   
			LocalFree( lpMsgBuf );    
			return false;
		}
		if( !QueryPerformanceCounter(&dernier) )
		{
			LPVOID lpMsgBuf; 
			FormatMessage(FORMAT_MESSAGE_ALLOCATE_BUFFER | FORMAT_MESSAGE_FROM_SYSTEM | FORMAT_MESSAGE_IGNORE_INSERTS, NULL, ::GetLastError(), 0, (LPTSTR) &lpMsgBuf, 0, NULL); 
			strcpy_s(lastError,(LPCSTR)lpMsgBuf);   
			LocalFree( lpMsgBuf );    
			return false;
		}
		strcpy_s(lastError,"Pas d'erreur");
		return true;
	}

	bool Reset()
	{
		if( !QueryPerformanceCounter(&debut) )
		{
			LPVOID lpMsgBuf; 
			FormatMessage(FORMAT_MESSAGE_ALLOCATE_BUFFER | FORMAT_MESSAGE_FROM_SYSTEM | FORMAT_MESSAGE_IGNORE_INSERTS, NULL, ::GetLastError(), 0, (LPTSTR) &lpMsgBuf, 0, NULL); 
			strcpy_s(lastError,(LPCSTR)lpMsgBuf);   
			LocalFree( lpMsgBuf );    
			return false;
		}
		strcpy_s(lastError,"Pas d'erreur");
		return true;
	}

	double GetTimeFromStart()
	{
		if (!QueryPerformanceCounter(&fin))
		{
	        
			LPVOID lpMsgBuf; 
			FormatMessage(FORMAT_MESSAGE_ALLOCATE_BUFFER | FORMAT_MESSAGE_FROM_SYSTEM | FORMAT_MESSAGE_IGNORE_INSERTS, NULL, ::GetLastError(), 0, (LPTSTR) &lpMsgBuf, 0, NULL);
			strcpy_s(lastError,(LPCSTR)lpMsgBuf);
			LocalFree( lpMsgBuf );
			return 0;
		}
		strcpy_s(lastError,"Pas d'erreur");
		return ((double)((__int64)fin.QuadPart)-((__int64)debut.QuadPart)) / (double)frequence.QuadPart;
	}

	double GetElapsedTime()
	{
		if (!QueryPerformanceCounter(&fin))
		{
	        
			LPVOID lpMsgBuf; 
			FormatMessage(FORMAT_MESSAGE_ALLOCATE_BUFFER | FORMAT_MESSAGE_FROM_SYSTEM | FORMAT_MESSAGE_IGNORE_INSERTS, NULL, ::GetLastError(), 0, (LPTSTR) &lpMsgBuf, 0, NULL);
			strcpy_s(lastError,(LPCSTR)lpMsgBuf);
			LocalFree( lpMsgBuf );
			return 0;
	        
		}
		double temp = ((double)((__int64)fin.QuadPart)-((__int64)dernier.QuadPart)) / (double)frequence.QuadPart;
		if( !QueryPerformanceCounter(&dernier) )
		{
			LPVOID lpMsgBuf; 
			FormatMessage(FORMAT_MESSAGE_ALLOCATE_BUFFER | FORMAT_MESSAGE_FROM_SYSTEM | FORMAT_MESSAGE_IGNORE_INSERTS, NULL, ::GetLastError(), 0, (LPTSTR) &lpMsgBuf, 0, NULL); 
			strcpy_s(lastError,(LPCSTR)lpMsgBuf);   
			LocalFree( lpMsgBuf );    
			return 0;
		}
		strcpy_s(lastError,"Pas d'erreur");
		return temp;
	}

	char *GetLastError()
	{
		return lastError;
	}

private:

    LARGE_INTEGER frequence, debut, fin, dernier;
    char lastError[264];

};