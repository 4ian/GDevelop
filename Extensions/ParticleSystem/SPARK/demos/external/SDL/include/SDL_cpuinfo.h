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

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
/* CPU feature detection for SDL                                       */

#ifndef _SDL_cpuinfo_h
#define _SDL_cpuinfo_h

#include "SDL_stdinc.h"

#include "begin_code.h"
/* Set up for C function definitions, even when using C++ */
#ifdef __cplusplus
extern "C" {
#endif

/* This function returns true if the CPU has the RDTSC instruction
 */
extern DECLSPEC SDL_bool SDLCALL SDL_HasRDTSC(void);

/* This function returns true if the CPU has MMX features
 */
extern DECLSPEC SDL_bool SDLCALL SDL_HasMMX(void);

/* This function returns true if the CPU has MMX Ext. features
 */
extern DECLSPEC SDL_bool SDLCALL SDL_HasMMXExt(void);

/* This function returns true if the CPU has 3DNow features
 */
extern DECLSPEC SDL_bool SDLCALL SDL_Has3DNow(void);

/* This function returns true if the CPU has 3DNow! Ext. features
 */
extern DECLSPEC SDL_bool SDLCALL SDL_Has3DNowExt(void);

/* This function returns true if the CPU has SSE features
 */
extern DECLSPEC SDL_bool SDLCALL SDL_HasSSE(void);

/* This function returns true if the CPU has SSE2 features
 */
extern DECLSPEC SDL_bool SDLCALL SDL_HasSSE2(void);

/* This function returns true if the CPU has AltiVec features
 */
extern DECLSPEC SDL_bool SDLCALL SDL_HasAltiVec(void);

/* Ends C function definitions when using C++ */
#ifdef __cplusplus
}
#endif
#include "close_code.h"

#endif /* _SDL_cpuinfo_h */
