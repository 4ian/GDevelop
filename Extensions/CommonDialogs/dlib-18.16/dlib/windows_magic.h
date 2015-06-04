// Copyright (C) 2006  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_WINDOWS_MAGIc_ 
#define DLIB_WINDOWS_MAGIc_ 

#include "platform.h"

#ifdef WIN32

// This file contains all the magical #defines you have to setup  before you
// include the windows header files.  

#ifndef NOMINMAX
#define NOMINMAX // prevent windows from messing with std::min and std::max
#endif

// Prevent windows from #defining IN or OUT
#ifndef _NO_W32_PSEUDO_MODIFIERS
#define _NO_W32_PSEUDO_MODIFIERS
#endif

// now just for good measure undefine min and max if they are defined
#ifdef min
#undef min
#endif

#ifdef max 
#undef max 
#endif

#ifdef NO_MAKEFILE
// only define this if all the cpp files are going to be sucked into the headers 
// because otherwise we don't need it since everything is isolated in the sockets
// cpp file and this declaration for _WINSOCKAPI_ appears there also.
#ifndef _WINSOCKAPI_
#define _WINSOCKAPI_   /* Prevent inclusion of winsock.h in windows.h */
#endif
#endif

// This is something stupid you have to do to make visual studio include the right
// stuff.  I don't really know what the deal is with this.
#if _WIN32_WINNT < 0x0500
#undef _WIN32_WINNT
#define _WIN32_WINNT 0x0500
#endif

#endif // WIN32

#endif // DLIB_WINDOWS_MAGIc_

