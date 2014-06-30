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
/* System dependent library loading routines                           */

/* Some things to keep in mind:                                        
   - These functions only work on C function names.  Other languages may
     have name mangling and intrinsic language support that varies from
     compiler to compiler.
   - Make sure you declare your function pointers with the same calling
     convention as the actual library function.  Your code will crash
     mysteriously if you do not do this.
   - Avoid namespace collisions.  If you load a symbol from the library,
     it is not defined whether or not it goes into the global symbol
     namespace for the application.  If it does and it conflicts with
     symbols in your code or other shared libraries, you will not get
     the results you expect. :)
*/


#ifndef _SDL_loadso_h
#define _SDL_loadso_h

#include "SDL_stdinc.h"
#include "SDL_error.h"

#include "begin_code.h"
/* Set up for C function definitions, even when using C++ */
#ifdef __cplusplus
extern "C" {
#endif

/* This function dynamically loads a shared object and returns a pointer
 * to the object handle (or NULL if there was an error).
 * The 'sofile' parameter is a system dependent name of the object file.
 */
extern DECLSPEC void * SDLCALL SDL_LoadObject(const char *sofile);

/* Given an object handle, this function looks up the address of the
 * named function in the shared object and returns it.  This address
 * is no longer valid after calling SDL_UnloadObject().
 */
extern DECLSPEC void * SDLCALL SDL_LoadFunction(void *handle, const char *name);

/* Unload a shared object from memory */
extern DECLSPEC void SDLCALL SDL_UnloadObject(void *handle);

/* Ends C function definitions when using C++ */
#ifdef __cplusplus
}
#endif
#include "close_code.h"

#endif /* _SDL_loadso_h */
