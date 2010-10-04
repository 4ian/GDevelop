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

/*

Symbian version Markus Mertama

*/


#ifndef _SDL_CONFIG_SYMBIAN_H
#define _SDL_CONFIG_SYMBIAN_H

#include "SDL_platform.h"

/* This is the minimal configuration that can be used to build SDL */


#include <stdarg.h>
#include <stddef.h>


#ifdef __GCCE__
#define SYMBIAN32_GCCE
#endif

#ifndef _SIZE_T_DEFINED
typedef unsigned int size_t;
#endif

#ifndef _INTPTR_T_DECLARED
typedef unsigned int uintptr_t;
#endif 

#ifndef _INT8_T_DECLARED
typedef signed char int8_t;
#endif 

#ifndef _UINT8_T_DECLARED
typedef unsigned char uint8_t;
#endif

#ifndef _INT16_T_DECLARED
typedef signed short int16_t;
#endif

#ifndef _UINT16_T_DECLARED
typedef unsigned short uint16_t;
#endif

#ifndef _INT32_T_DECLARED
typedef signed int int32_t;
#endif

#ifndef _UINT32_T_DECLARED
typedef unsigned int uint32_t;
#endif

#ifndef _INT64_T_DECLARED
typedef signed long long int64_t;
#endif

#ifndef _UINT64_T_DECLARED
typedef unsigned long long uint64_t;
#endif

#define SDL_AUDIO_DRIVER_EPOCAUDIO	1


/* Enable the stub cdrom driver (src/cdrom/dummy/\*.c) */
#define SDL_CDROM_DISABLED	1

/* Enable the stub joystick driver (src/joystick/dummy/\*.c) */
#define SDL_JOYSTICK_DISABLED	1

/* Enable the stub shared object loader (src/loadso/dummy/\*.c) */
#define SDL_LOADSO_DISABLED	1

#define SDL_THREAD_SYMBIAN 1

#define SDL_VIDEO_DRIVER_EPOC    1

#define SDL_VIDEO_OPENGL 0

#define SDL_HAS_64BIT_TYPE	1

#define HAVE_LIBC	1
#define HAVE_STDIO_H 1
#define STDC_HEADERS 1
#define HAVE_STRING_H 1
#define HAVE_CTYPE_H 1
#define HAVE_MATH_H 1

#define HAVE_MALLOC 1
#define HAVE_CALLOC 1
#define HAVE_REALLOC 1
#define HAVE_FREE 1
/*#define HAVE_ALLOCA 1*/
#define HAVE_QSORT 1
#define HAVE_ABS 1
#define HAVE_MEMSET 1
#define HAVE_MEMCPY 1
#define HAVE_MEMMOVE 1
#define HAVE_MEMCMP 1
#define HAVE_STRLEN 1
#define HAVE__STRUPR 1
#define HAVE_STRCHR 1
#define HAVE_STRRCHR 1
#define HAVE_STRSTR 1
#define HAVE_ITOA 1
#define HAVE_STRTOL 1
#define HAVE_STRTOUL 1
#define HAVE_STRTOLL 1
#define HAVE_STRTOD 1
#define HAVE_ATOI 1
#define HAVE_ATOF 1
#define HAVE_STRCMP 1
#define HAVE_STRNCMP 1
/*#define HAVE__STRICMP 1*/
#define HAVE__STRNICMP 1
#define HAVE_SSCANF 1
#define HAVE_STDARG_H	1
#define HAVE_STDDEF_H	1



#endif /* _SDL_CONFIG_SYMBIAN_H */
