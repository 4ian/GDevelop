/*
    SDL - Simple DirectMedia Layer
    Copyright (C) 1997-2006 Sam Lantinga

    This library is free software; you can redistribute it and/or
    modify it under the terms of the GNU Lesser General Public
    License as published by the Free Software Foundation; either
    version 2.1 of the License, or (at your option) any later version.

    This library is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
    Lesser General Public License for more details.

    You should have received a copy of the GNU Lesser General Public
    License along with this library; if not, write to the Free Software
    Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA

    Sam Lantinga
    slouken@libsdl.org
*/

#ifndef _SDL_config_win32_h
#define _SDL_config_win32_h

#include "SDL_platform.h"

/* This is a set of defines to configure the SDL features */

#if defined(__GNUC__) || defined(__DMC__)
#define HAVE_STDINT_H	1
#elif defined(_MSC_VER)
typedef signed __int8		int8_t;
typedef unsigned __int8		uint8_t;
typedef signed __int16		int16_t;
typedef unsigned __int16	uint16_t;
typedef signed __int32		int32_t;
typedef unsigned __int32	uint32_t;
typedef signed __int64		int64_t;
typedef unsigned __int64	uint64_t;
#ifndef _UINTPTR_T_DEFINED
#ifdef  _WIN64
typedef unsigned __int64    uintptr_t;
#else
typedef unsigned int   uintptr_t;
#endif
#define _UINTPTR_T_DEFINED
#endif
/* Older Visual C++ headers don't have the Win64-compatible typedefs... */
#if ((_MSC_VER <= 1200) && (!defined(DWORD_PTR)))
#define DWORD_PTR DWORD
#endif
#if ((_MSC_VER <= 1200) && (!defined(LONG_PTR)))
#define LONG_PTR LONG
#endif
#else	/* !__GNUC__ && !_MSC_VER */
typedef signed char int8_t;
typedef unsigned char uint8_t;
typedef signed short int16_t;
typedef unsigned short uint16_t;
typedef signed int int32_t;
typedef unsigned int uint32_t;
typedef signed long long int64_t;
typedef unsigned long long uint64_t;
#ifndef _SIZE_T_DEFINED_
#define _SIZE_T_DEFINED_
typedef unsigned int size_t;
#endif
typedef unsigned int uintptr_t;
#endif /* __GNUC__ || _MSC_VER */
#define SDL_HAS_64BIT_TYPE	1

/* Enabled for SDL 1.2 (binary compatibility) */
#define HAVE_LIBC	1
#ifdef HAVE_LIBC
/* Useful headers */
#define HAVE_STDIO_H 1
#define STDC_HEADERS 1
#define HAVE_STRING_H 1
#define HAVE_CTYPE_H 1
#define HAVE_MATH_H 1
#ifndef _WIN32_WCE
#define HAVE_SIGNAL_H 1
#endif

/* C library functions */
#define HAVE_MALLOC 1
#define HAVE_CALLOC 1
#define HAVE_REALLOC 1
#define HAVE_FREE 1
#define HAVE_ALLOCA 1
#define HAVE_QSORT 1
#define HAVE_ABS 1
#define HAVE_MEMSET 1
#define HAVE_MEMCPY 1
#define HAVE_MEMMOVE 1
#define HAVE_MEMCMP 1
#define HAVE_STRLEN 1
#define HAVE__STRREV 1
#define HAVE__STRUPR 1
#define HAVE__STRLWR 1
#define HAVE_STRCHR 1
#define HAVE_STRRCHR 1
#define HAVE_STRSTR 1
#define HAVE_ITOA 1
#define HAVE__LTOA 1
#define HAVE__ULTOA 1
#define HAVE_STRTOL 1
#define HAVE_STRTOUL 1
#define HAVE_STRTOLL 1
#define HAVE_STRTOD 1
#define HAVE_ATOI 1
#define HAVE_ATOF 1
#define HAVE_STRCMP 1
#define HAVE_STRNCMP 1
#define HAVE__STRICMP 1
#define HAVE__STRNICMP 1
#define HAVE_SSCANF 1
#else
#define HAVE_STDARG_H	1
#define HAVE_STDDEF_H	1
#endif

/* Enable various audio drivers */
#ifndef _WIN32_WCE
#define SDL_AUDIO_DRIVER_DSOUND	1
#endif
#define SDL_AUDIO_DRIVER_WAVEOUT	1
#define SDL_AUDIO_DRIVER_DISK	1
#define SDL_AUDIO_DRIVER_DUMMY	1

/* Enable various cdrom drivers */
#ifdef _WIN32_WCE
#define SDL_CDROM_DISABLED      1
#else
#define SDL_CDROM_WIN32		1
#endif

/* Enable various input drivers */
#ifdef _WIN32_WCE
#define SDL_JOYSTICK_DISABLED   1
#else
#define SDL_JOYSTICK_WINMM	1
#endif

/* Enable various shared object loading systems */
#define SDL_LOADSO_WIN32	1

/* Enable various threading systems */
#define SDL_THREAD_WIN32	1

/* Enable various timer systems */
#ifdef _WIN32_WCE
#define SDL_TIMER_WINCE	1
#else
#define SDL_TIMER_WIN32	1
#endif

/* Enable various video drivers */
#ifdef _WIN32_WCE
#define SDL_VIDEO_DRIVER_GAPI	1
#endif
#ifndef _WIN32_WCE
#define SDL_VIDEO_DRIVER_DDRAW	1
#endif
#define SDL_VIDEO_DRIVER_DUMMY	1
#define SDL_VIDEO_DRIVER_WINDIB	1

/* Enable OpenGL support */
#ifndef _WIN32_WCE
#define SDL_VIDEO_OPENGL	1
#define SDL_VIDEO_OPENGL_WGL	1
#endif

/* Enable assembly routines (Win64 doesn't have inline asm) */
#ifndef _WIN64
#define SDL_ASSEMBLY_ROUTINES	1
#endif

#endif /* _SDL_config_win32_h */
