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

/* Include file for SDL custom system window manager hooks */

#ifndef _SDL_syswm_h
#define _SDL_syswm_h

#include "SDL_stdinc.h"
#include "SDL_error.h"
#include "SDL_version.h"

#include "begin_code.h"
/* Set up for C function definitions, even when using C++ */
#ifdef __cplusplus
extern "C" {
#endif

/* Your application has access to a special type of event 'SDL_SYSWMEVENT',
   which contains window-manager specific information and arrives whenever
   an unhandled window event occurs.  This event is ignored by default, but
   you can enable it with SDL_EventState()
*/
#ifdef SDL_PROTOTYPES_ONLY
struct SDL_SysWMinfo;
typedef struct SDL_SysWMinfo SDL_SysWMinfo;
#else

/* This is the structure for custom window manager events */
#if defined(SDL_VIDEO_DRIVER_X11)
#if defined(__APPLE__) && defined(__MACH__)
/* conflicts with Quickdraw.h */
#define Cursor X11Cursor
#endif

#include <X11/Xlib.h>
#include <X11/Xatom.h>

#if defined(__APPLE__) && defined(__MACH__)
/* matches the re-define above */
#undef Cursor
#endif

/* These are the various supported subsystems under UNIX */
typedef enum {
	SDL_SYSWM_X11
} SDL_SYSWM_TYPE;

/* The UNIX custom event structure */
struct SDL_SysWMmsg {
	SDL_version version;
	SDL_SYSWM_TYPE subsystem;
	union {
	    XEvent xevent;
	} event;
};

/* The UNIX custom window manager information structure.
   When this structure is returned, it holds information about which
   low level system it is using, and will be one of SDL_SYSWM_TYPE.
 */
typedef struct SDL_SysWMinfo {
	SDL_version version;
	SDL_SYSWM_TYPE subsystem;
	union {
	    struct {
	    	Display *display;	/* The X11 display */
	    	Window window;		/* The X11 display window */
		/* These locking functions should be called around
                   any X11 functions using the display variable, 
                   but not the gfxdisplay variable.
                   They lock the event thread, so should not be
		   called around event functions or from event filters.
		 */
		void (*lock_func)(void);
		void (*unlock_func)(void);

		/* Introduced in SDL 1.0.2 */
	    	Window fswindow;	/* The X11 fullscreen window */
	    	Window wmwindow;	/* The X11 managed input window */

		/* Introduced in SDL 1.2.12 */
		Display *gfxdisplay;	/* The X11 display to which rendering is done */
	    } x11;
	} info;
} SDL_SysWMinfo;

#elif defined(SDL_VIDEO_DRIVER_NANOX)
#include <microwin/nano-X.h>

/* The generic custom event structure */
struct SDL_SysWMmsg {
	SDL_version version;
	int data;
};

/* The windows custom window manager information structure */
typedef struct SDL_SysWMinfo {
	SDL_version version ;
	GR_WINDOW_ID window ;	/* The display window */
} SDL_SysWMinfo;

#elif defined(SDL_VIDEO_DRIVER_WINDIB) || defined(SDL_VIDEO_DRIVER_DDRAW) || defined(SDL_VIDEO_DRIVER_GAPI)
#define WIN32_LEAN_AND_MEAN
#include <windows.h>

/* The windows custom event structure */
struct SDL_SysWMmsg {
	SDL_version version;
	HWND hwnd;			/* The window for the message */
	UINT msg;			/* The type of message */
	WPARAM wParam;			/* WORD message parameter */
	LPARAM lParam;			/* LONG message parameter */
};

/* The windows custom window manager information structure */
typedef struct SDL_SysWMinfo {
	SDL_version version;
	HWND window;			/* The Win32 display window */
	HGLRC hglrc;			/* The OpenGL context, if any */
} SDL_SysWMinfo;

#elif defined(SDL_VIDEO_DRIVER_RISCOS)

/* RISC OS custom event structure */
struct SDL_SysWMmsg {
	SDL_version version;
	int eventCode;		/* The window for the message */
	int pollBlock[64];
};

/* The RISC OS custom window manager information structure */
typedef struct SDL_SysWMinfo {
	SDL_version version;
	int wimpVersion;    /* Wimp version running under */
	int taskHandle;     /* The RISC OS task handle */
	int window;		/* The RISC OS display window */
} SDL_SysWMinfo;

#elif defined(SDL_VIDEO_DRIVER_PHOTON)
#include <sys/neutrino.h>
#include <Ph.h>

/* The QNX custom event structure */
struct SDL_SysWMmsg {
	SDL_version version;
	int data;
};

/* The QNX custom window manager information structure */
typedef struct SDL_SysWMinfo {
	SDL_version version;
	int data;
} SDL_SysWMinfo;

#else

/* The generic custom event structure */
struct SDL_SysWMmsg {
	SDL_version version;
	int data;
};

/* The generic custom window manager information structure */
typedef struct SDL_SysWMinfo {
	SDL_version version;
	int data;
} SDL_SysWMinfo;

#endif /* video driver type */

#endif /* SDL_PROTOTYPES_ONLY */

/* Function prototypes */
/*
 * This function gives you custom hooks into the window manager information.
 * It fills the structure pointed to by 'info' with custom information and
 * returns 1 if the function is implemented.  If it's not implemented, or
 * the version member of the 'info' structure is invalid, it returns 0. 
 *
 * You typically use this function like this:
 * SDL_SysWMInfo info;
 * SDL_VERSION(&info.version);
 * if ( SDL_GetWMInfo(&info) ) { ... }
 */
extern DECLSPEC int SDLCALL SDL_GetWMInfo(SDL_SysWMinfo *info);


/* Ends C function definitions when using C++ */
#ifdef __cplusplus
}
#endif
#include "close_code.h"

#endif /* _SDL_syswm_h */
