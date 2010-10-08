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

#ifndef _SDL_mutex_h
#define _SDL_mutex_h

/* Functions to provide thread synchronization primitives

	These are independent of the other SDL routines.
*/

#include "SDL_stdinc.h"
#include "SDL_error.h"

#include "begin_code.h"
/* Set up for C function definitions, even when using C++ */
#ifdef __cplusplus
extern "C" {
#endif

/* Synchronization functions which can time out return this value
   if they time out.
*/
#define SDL_MUTEX_TIMEDOUT	1

/* This is the timeout value which corresponds to never time out */
#define SDL_MUTEX_MAXWAIT	(~(Uint32)0)


/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
/* Mutex functions                                               */
/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

/* The SDL mutex structure, defined in SDL_mutex.c */
struct SDL_mutex;
typedef struct SDL_mutex SDL_mutex;

/* Create a mutex, initialized unlocked */
extern DECLSPEC SDL_mutex * SDLCALL SDL_CreateMutex(void);

/* Lock the mutex  (Returns 0, or -1 on error) */
#define SDL_LockMutex(m)	SDL_mutexP(m)
extern DECLSPEC int SDLCALL SDL_mutexP(SDL_mutex *mutex);

/* Unlock the mutex  (Returns 0, or -1 on error)
   It is an error to unlock a mutex that has not been locked by
   the current thread, and doing so results in undefined behavior.
 */
#define SDL_UnlockMutex(m)	SDL_mutexV(m)
extern DECLSPEC int SDLCALL SDL_mutexV(SDL_mutex *mutex);

/* Destroy a mutex */
extern DECLSPEC void SDLCALL SDL_DestroyMutex(SDL_mutex *mutex);


/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
/* Semaphore functions                                           */
/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

/* The SDL semaphore structure, defined in SDL_sem.c */
struct SDL_semaphore;
typedef struct SDL_semaphore SDL_sem;

/* Create a semaphore, initialized with value, returns NULL on failure. */
extern DECLSPEC SDL_sem * SDLCALL SDL_CreateSemaphore(Uint32 initial_value);

/* Destroy a semaphore */
extern DECLSPEC void SDLCALL SDL_DestroySemaphore(SDL_sem *sem);

/* This function suspends the calling thread until the semaphore pointed 
 * to by sem has a positive count. It then atomically decreases the semaphore
 * count.
 */
extern DECLSPEC int SDLCALL SDL_SemWait(SDL_sem *sem);

/* Non-blocking variant of SDL_SemWait(), returns 0 if the wait succeeds,
   SDL_MUTEX_TIMEDOUT if the wait would block, and -1 on error.
*/
extern DECLSPEC int SDLCALL SDL_SemTryWait(SDL_sem *sem);

/* Variant of SDL_SemWait() with a timeout in milliseconds, returns 0 if
   the wait succeeds, SDL_MUTEX_TIMEDOUT if the wait does not succeed in
   the allotted time, and -1 on error.
   On some platforms this function is implemented by looping with a delay
   of 1 ms, and so should be avoided if possible.
*/
extern DECLSPEC int SDLCALL SDL_SemWaitTimeout(SDL_sem *sem, Uint32 ms);

/* Atomically increases the semaphore's count (not blocking), returns 0,
   or -1 on error.
 */
extern DECLSPEC int SDLCALL SDL_SemPost(SDL_sem *sem);

/* Returns the current count of the semaphore */
extern DECLSPEC Uint32 SDLCALL SDL_SemValue(SDL_sem *sem);


/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
/* Condition variable functions                                  */
/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

/* The SDL condition variable structure, defined in SDL_cond.c */
struct SDL_cond;
typedef struct SDL_cond SDL_cond;

/* Create a condition variable */
extern DECLSPEC SDL_cond * SDLCALL SDL_CreateCond(void);

/* Destroy a condition variable */
extern DECLSPEC void SDLCALL SDL_DestroyCond(SDL_cond *cond);

/* Restart one of the threads that are waiting on the condition variable,
   returns 0 or -1 on error.
 */
extern DECLSPEC int SDLCALL SDL_CondSignal(SDL_cond *cond);

/* Restart all threads that are waiting on the condition variable,
   returns 0 or -1 on error.
 */
extern DECLSPEC int SDLCALL SDL_CondBroadcast(SDL_cond *cond);

/* Wait on the condition variable, unlocking the provided mutex.
   The mutex must be locked before entering this function!
   The mutex is re-locked once the condition variable is signaled.
   Returns 0 when it is signaled, or -1 on error.
 */
extern DECLSPEC int SDLCALL SDL_CondWait(SDL_cond *cond, SDL_mutex *mut);

/* Waits for at most 'ms' milliseconds, and returns 0 if the condition
   variable is signaled, SDL_MUTEX_TIMEDOUT if the condition is not
   signaled in the allotted time, and -1 on error.
   On some platforms this function is implemented by looping with a delay
   of 1 ms, and so should be avoided if possible.
*/
extern DECLSPEC int SDLCALL SDL_CondWaitTimeout(SDL_cond *cond, SDL_mutex *mutex, Uint32 ms);

/* Ends C function definitions when using C++ */
#ifdef __cplusplus
}
#endif
#include "close_code.h"

#endif /* _SDL_mutex_h */
