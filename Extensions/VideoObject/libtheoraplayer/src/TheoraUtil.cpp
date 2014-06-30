#include <stdio.h>
#include <algorithm>
#include <math.h>
#include <map>
#include "TheoraUtil.h"
#include "TheoraException.h"

#ifdef _WIN32
#include <windows.h>
#pragma warning( disable: 4996 ) // MSVC++
#else
#include <unistd.h>
#endif

std::string str(int i)
{
    char s[32];
    sprintf(s,"%d",i);
    return std::string(s);
}

std::string strf(float i)
{
    char s[32];
    sprintf(s,"%.3f",i);
    return std::string(s);
}

void _psleep(int milliseconds)
{
#ifndef _WIN32
    usleep(milliseconds*1000);
#else
	Sleep(milliseconds);
#endif
}


int _nextPow2(int x)
{
	int y;
	for (y=1;y<x;y*=2);
	return y;
}

