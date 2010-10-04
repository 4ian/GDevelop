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

/* This is the CD-audio control API for Simple DirectMedia Layer */

#ifndef _SDL_cdrom_h
#define _SDL_cdrom_h

#include "SDL_stdinc.h"
#include "SDL_error.h"

#include "begin_code.h"
/* Set up for C function definitions, even when using C++ */
#ifdef __cplusplus
extern "C" {
#endif

/* In order to use these functions, SDL_Init() must have been called
   with the SDL_INIT_CDROM flag.  This causes SDL to scan the system
   for CD-ROM drives, and load appropriate drivers.
*/

/* The maximum number of CD-ROM tracks on a disk */
#define SDL_MAX_TRACKS	99

/* The types of CD-ROM track possible */
#define SDL_AUDIO_TRACK	0x00
#define SDL_DATA_TRACK	0x04

/* The possible states which a CD-ROM drive can be in. */
typedef enum {
	CD_TRAYEMPTY,
	CD_STOPPED,
	CD_PLAYING,
	CD_PAUSED,
	CD_ERROR = -1
} CDstatus;

/* Given a status, returns true if there's a disk in the drive */
#define CD_INDRIVE(status)	((int)(status) > 0)

typedef struct SDL_CDtrack {
	Uint8 id;		/* Track number */
	Uint8 type;		/* Data or audio track */
	Uint16 unused;
	Uint32 length;		/* Length, in frames, of this track */
	Uint32 offset;		/* Offset, in frames, from start of disk */
} SDL_CDtrack;

/* This structure is only current as of the last call to SDL_CDStatus() */
typedef struct SDL_CD {
	int id;			/* Private drive identifier */
	CDstatus status;	/* Current drive status */

	/* The rest of this structure is only valid if there's a CD in drive */
	int numtracks;		/* Number of tracks on disk */
	int cur_track;		/* Current track position */
	int cur_frame;		/* Current frame offset within current track */
	SDL_CDtrack track[SDL_MAX_TRACKS+1];
} SDL_CD;

/* Conversion functions from frames to Minute/Second/Frames and vice versa */
#define CD_FPS	75
#define FRAMES_TO_MSF(f, M,S,F)	{					\
	int value = f;							\
	*(F) = value%CD_FPS;						\
	value /= CD_FPS;						\
	*(S) = value%60;						\
	value /= 60;							\
	*(M) = value;							\
}
#define MSF_TO_FRAMES(M, S, F)	((M)*60*CD_FPS+(S)*CD_FPS+(F))

/* CD-audio API functions: */

/* Returns the number of CD-ROM drives on the system, or -1 if
   SDL_Init() has not been called with the SDL_INIT_CDROM flag.
 */
extern DECLSPEC int SDLCALL SDL_CDNumDrives(void);

/* Returns a human-readable, system-dependent identifier for the CD-ROM.
   Example:
	"/dev/cdrom"
	"E:"
	"/dev/disk/ide/1/master"
*/
extern DECLSPEC const char * SDLCALL SDL_CDName(int drive);

/* Opens a CD-ROM drive for access.  It returns a drive handle on success,
   or NULL if the drive was invalid or busy.  This newly opened CD-ROM
   becomes the default CD used when other CD functions are passed a NULL
   CD-ROM handle.
   Drives are numbered starting with 0.  Drive 0 is the system default CD-ROM.
*/
extern DECLSPEC SDL_CD * SDLCALL SDL_CDOpen(int drive);

/* This function returns the current status of the given drive.
   If the drive has a CD in it, the table of contents of the CD and current
   play position of the CD will be stored in the SDL_CD structure.
*/
extern DECLSPEC CDstatus SDLCALL SDL_CDStatus(SDL_CD *cdrom);

/* Play the given CD starting at 'start_track' and 'start_frame' for 'ntracks'
   tracks and 'nframes' frames.  If both 'ntrack' and 'nframe' are 0, play 
   until the end of the CD.  This function will skip data tracks.
   This function should only be called after calling SDL_CDStatus() to 
   get track information about the CD.
   For example:
	// Play entire CD:
	if ( CD_INDRIVE(SDL_CDStatus(cdrom)) )
		SDL_CDPlayTracks(cdrom, 0, 0, 0, 0);
	// Play last track:
	if ( CD_INDRIVE(SDL_CDStatus(cdrom)) ) {
		SDL_CDPlayTracks(cdrom, cdrom->numtracks-1, 0, 0, 0);
	}
	// Play first and second track and 10 seconds of third track:
	if ( CD_INDRIVE(SDL_CDStatus(cdrom)) )
		SDL_CDPlayTracks(cdrom, 0, 0, 2, 10);

   This function returns 0, or -1 if there was an error.
*/
extern DECLSPEC int SDLCALL SDL_CDPlayTracks(SDL_CD *cdrom,
		int start_track, int start_frame, int ntracks, int nframes);

/* Play the given CD starting at 'start' frame for 'length' frames.
   It returns 0, or -1 if there was an error.
*/
extern DECLSPEC int SDLCALL SDL_CDPlay(SDL_CD *cdrom, int start, int length);

/* Pause play -- returns 0, or -1 on error */
extern DECLSPEC int SDLCALL SDL_CDPause(SDL_CD *cdrom);

/* Resume play -- returns 0, or -1 on error */
extern DECLSPEC int SDLCALL SDL_CDResume(SDL_CD *cdrom);

/* Stop play -- returns 0, or -1 on error */
extern DECLSPEC int SDLCALL SDL_CDStop(SDL_CD *cdrom);

/* Eject CD-ROM -- returns 0, or -1 on error */
extern DECLSPEC int SDLCALL SDL_CDEject(SDL_CD *cdrom);

/* Closes the handle for the CD-ROM drive */
extern DECLSPEC void SDLCALL SDL_CDClose(SDL_CD *cdrom);


/* Ends C function definitions when using C++ */
#ifdef __cplusplus
}
#endif
#include "close_code.h"

#endif /* _SDL_video_h */
