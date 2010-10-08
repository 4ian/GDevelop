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

#ifndef _SDL_config_amiga_h
#define _SDL_config_amiga_h

#include "SDL_platform.h"

/* This is a set of defines to configure the SDL features */

#define SDL_HAS_64BIT_TYPE	1

/* Useful headers */
#define HAVE_SYS_TYPES_H	1
#define HAVE_STDIO_H	1
#define STDC_HEADERS	1
#define HAVE_STRING_H	1
#define HAVE_INTTYPES_H	1
#define HAVE_SIGNAL_H	1

/* C library functions */
#define HAVE_MALLOC	1
#define HAVE_CALLOC	1
#define HAVE_REALLOC	1
#define HAVE_FREE	1
#define HAVE_ALLOCA	1
#define HAVE_GETENV	1
#define HAVE_PUTENV	1
#define HAVE_MEMSET	1
#define HAVE_MEMCPY	1
#define HAVE_MEMMOVE	1
#define HAVE_MEMCMP	1

/* Enable various audio drivers */
#define SDL_AUDIO_DRIVER_AHI	1
#define SDL_AUDIO_DRIVER_DISK	1
#define SDL_AUDIO_DRIVER_DUMMY	1

/* Enable various cdrom drivers */
#define SDL_CDROM_DUMMY	1

/* Enable various input drivers */
#define SDL_JOYSTICK_AMIGA	1

/* Enable various shared object loading systems */
#define SDL_LOADSO_DUMMY	1

/* Enable various threading systems */
#define SDL_THREAD_AMIGA	1

/* Enable various timer systems */
#define SDL_TIMER_AMIGA	1

/* Enable various video drivers */
#define SDL_VIDEO_DRIVER_CYBERGRAPHICS	1
#define SDL_VIDEO_DRIVER_DUMMY	1

/* Enable OpenGL support */
#define SDL_VIDEO_OPENGL	1

#endif /* _SDL_config_amiga_h */
