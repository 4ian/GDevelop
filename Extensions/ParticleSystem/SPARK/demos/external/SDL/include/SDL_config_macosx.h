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

#ifndef _SDL_config_macosx_h
#define _SDL_config_macosx_h

#include "SDL_platform.h"

/* This gets us MAC_OS_X_VERSION_MIN_REQUIRED... */
#include <AvailabilityMacros.h>

/* This is a set of defines to configure the SDL features */

#define SDL_HAS_64BIT_TYPE	1

/* Useful headers */
/* If we specified an SDK or have a post-PowerPC chip, then alloca.h exists. */
#if ( (MAC_OS_X_VERSION_MIN_REQUIRED >= 1030) || (!defined(__POWERPC__)) )
#define HAVE_ALLOCA_H		1
#endif
#define HAVE_SYS_TYPES_H	1
#define HAVE_STDIO_H	1
#define STDC_HEADERS	1
#define HAVE_STRING_H	1
#define HAVE_INTTYPES_H	1
#define HAVE_STDINT_H	1
#define HAVE_CTYPE_H	1
#define HAVE_MATH_H	1
#define HAVE_SIGNAL_H	1

/* C library functions */
#define HAVE_MALLOC	1
#define HAVE_CALLOC	1
#define HAVE_REALLOC	1
#define HAVE_FREE	1
#define HAVE_ALLOCA	1
#define HAVE_GETENV	1
#define HAVE_PUTENV	1
#define HAVE_UNSETENV	1
#define HAVE_QSORT	1
#define HAVE_ABS	1
#define HAVE_BCOPY	1
#define HAVE_MEMSET	1
#define HAVE_MEMCPY	1
#define HAVE_MEMMOVE	1
#define HAVE_MEMCMP	1
#define HAVE_STRLEN	1
#define HAVE_STRLCPY	1
#define HAVE_STRLCAT	1
#define HAVE_STRDUP	1
#define HAVE_STRCHR	1
#define HAVE_STRRCHR	1
#define HAVE_STRSTR	1
#define HAVE_STRTOL	1
#define HAVE_STRTOUL	1
#define HAVE_STRTOLL	1
#define HAVE_STRTOULL	1
#define HAVE_STRTOD	1
#define HAVE_ATOI	1
#define HAVE_ATOF	1
#define HAVE_STRCMP	1
#define HAVE_STRNCMP	1
#define HAVE_STRCASECMP	1
#define HAVE_STRNCASECMP 1
#define HAVE_SSCANF	1
#define HAVE_SNPRINTF	1
#define HAVE_VSNPRINTF	1
#define HAVE_SIGACTION	1
#define HAVE_SETJMP	1
#define HAVE_NANOSLEEP	1

/* Enable various audio drivers */
#define SDL_AUDIO_DRIVER_COREAUDIO	1
#define SDL_AUDIO_DRIVER_SNDMGR	1
#define SDL_AUDIO_DRIVER_DISK	1
#define SDL_AUDIO_DRIVER_DUMMY	1

/* Enable various cdrom drivers */
#define SDL_CDROM_MACOSX	1

/* Enable various input drivers */
#define SDL_JOYSTICK_IOKIT	1

/* Enable various shared object loading systems */
#ifdef __ppc__
/* For Mac OS X 10.2 compatibility */
#define SDL_LOADSO_DLCOMPAT	1
#else
#define SDL_LOADSO_DLOPEN	1
#endif

/* Enable various threading systems */
#define SDL_THREAD_PTHREAD	1
#define SDL_THREAD_PTHREAD_RECURSIVE_MUTEX	1

/* Enable various timer systems */
#define SDL_TIMER_UNIX	1

/* Enable various video drivers */
#define SDL_VIDEO_DRIVER_DUMMY	1
#if ((defined TARGET_API_MAC_CARBON) && (TARGET_API_MAC_CARBON))
#define SDL_VIDEO_DRIVER_TOOLBOX	1
#else
#define SDL_VIDEO_DRIVER_QUARTZ	1
#endif

/* Enable OpenGL support */
#define SDL_VIDEO_OPENGL	1

/* Enable assembly routines */
#define SDL_ASSEMBLY_ROUTINES	1
#ifdef __ppc__
#define SDL_ALTIVEC_BLITTERS	1
#endif

#endif /* _SDL_config_macosx_h */
