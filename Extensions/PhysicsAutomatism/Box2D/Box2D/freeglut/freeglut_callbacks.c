/*
 * freeglut_callbacks.c
 *
 * The callbacks setting methods.
 *
 * Copyright (c) 1999-2000 Pawel W. Olszta. All Rights Reserved.
 * Written by Pawel W. Olszta, <olszta@sourceforge.net>
 * Creation date: Fri Dec 3 1999
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
 * OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL
 * PAWEL W. OLSZTA BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

#include <GL/freeglut.h>
#include "freeglut_internal.h"

/* -- INTERFACE FUNCTIONS -------------------------------------------------- */

/*
 * All of the callbacks setting methods can be generalized to this:
 */
#define SET_CALLBACK(a)                                         \
do                                                              \
{                                                               \
    if( fgStructure.CurrentWindow == NULL )                     \
        return;                                                 \
    SET_WCB( ( *( fgStructure.CurrentWindow ) ), a, callback ); \
} while( 0 )

/*
 * Sets the Display callback for the current window
 */
void FGAPIENTRY glutDisplayFunc( void (* callback)( void ) )
{
    FREEGLUT_EXIT_IF_NOT_INITIALISED ( "glutDisplayFunc" );
    if( !callback )
        fgError( "Fatal error in program.  NULL display callback not "
                 "permitted in GLUT 3.0+ or freeglut 2.0.1+" );
    SET_CALLBACK( Display );
}

/*
 * Sets the Reshape callback for the current window
 */
void FGAPIENTRY glutReshapeFunc( void (* callback)( int, int ) )
{
    FREEGLUT_EXIT_IF_NOT_INITIALISED ( "glutReshapeFunc" );
    SET_CALLBACK( Reshape );
}

/*
 * Sets the Keyboard callback for the current window
 */
void FGAPIENTRY glutKeyboardFunc( void (* callback)
                                  ( unsigned char, int, int ) )
{
    FREEGLUT_EXIT_IF_NOT_INITIALISED ( "glutKeyboardFunc" );
    SET_CALLBACK( Keyboard );
}

/*
 * Sets the Special callback for the current window
 */
void FGAPIENTRY glutSpecialFunc( void (* callback)( int, int, int ) )
{
    FREEGLUT_EXIT_IF_NOT_INITIALISED ( "glutSpecialFunc" );
    SET_CALLBACK( Special );
}

/*
 * Sets the global idle callback
 */
void FGAPIENTRY glutIdleFunc( void (* callback)( void ) )
{
    FREEGLUT_EXIT_IF_NOT_INITIALISED ( "glutIdleFunc" );
    fgState.IdleCallback = callback;
}

/*
 * Sets the Timer callback for the current window
 */
void FGAPIENTRY glutTimerFunc( unsigned int timeOut, void (* callback)( int ),
                               int timerID )
{
    SFG_Timer *timer, *node;

    FREEGLUT_EXIT_IF_NOT_INITIALISED ( "glutTimerFunc" );

    if( (timer = fgState.FreeTimers.Last) )
    {
        fgListRemove( &fgState.FreeTimers, &timer->Node );
    }
    else
    {
        if( ! (timer = malloc(sizeof(SFG_Timer))) )
            fgError( "Fatal error: "
                     "Memory allocation failure in glutTimerFunc()" );
    }

    timer->Callback  = callback;
    timer->ID        = timerID;
    timer->TriggerTime = fgElapsedTime() + timeOut;

    for( node = fgState.Timers.First; node; node = node->Node.Next )
    {
        if( node->TriggerTime > timer->TriggerTime )
            break;
    }

    fgListInsert( &fgState.Timers, &node->Node, &timer->Node );
}

/*
 * Sets the Visibility callback for the current window.
 */
static void fghVisibility( int status )
{
    int glut_status = GLUT_VISIBLE;

    FREEGLUT_INTERNAL_ERROR_EXIT_IF_NOT_INITIALISED ( "Visibility Callback" );
    freeglut_return_if_fail( fgStructure.CurrentWindow );

    if( ( GLUT_HIDDEN == status )  || ( GLUT_FULLY_COVERED == status ) )
        glut_status = GLUT_NOT_VISIBLE;
    INVOKE_WCB( *( fgStructure.CurrentWindow ), Visibility, ( glut_status ) );
}

void FGAPIENTRY glutVisibilityFunc( void (* callback)( int ) )
{
    FREEGLUT_EXIT_IF_NOT_INITIALISED ( "glutVisibilityFunc" );
    SET_CALLBACK( Visibility );

    if( callback )
        glutWindowStatusFunc( fghVisibility );
    else
        glutWindowStatusFunc( NULL );
}

/*
 * Sets the keyboard key release callback for the current window
 */
void FGAPIENTRY glutKeyboardUpFunc( void (* callback)
                                    ( unsigned char, int, int ) )
{
    FREEGLUT_EXIT_IF_NOT_INITIALISED ( "glutKeyboardUpFunc" );
    SET_CALLBACK( KeyboardUp );
}

/*
 * Sets the special key release callback for the current window
 */
void FGAPIENTRY glutSpecialUpFunc( void (* callback)( int, int, int ) )
{
    FREEGLUT_EXIT_IF_NOT_INITIALISED ( "glutSpecialUpFunc" );
    SET_CALLBACK( SpecialUp );
}

/*
 * Sets the joystick callback and polling rate for the current window
 */
void FGAPIENTRY glutJoystickFunc( void (* callback)
                                  ( unsigned int, int, int, int ),
                                  int pollInterval )
{
    FREEGLUT_EXIT_IF_NOT_INITIALISED ( "glutJoystickFunc" );
    fgInitialiseJoysticks ();

    SET_CALLBACK( Joystick );
    fgStructure.CurrentWindow->State.JoystickPollRate = pollInterval;

    fgStructure.CurrentWindow->State.JoystickLastPoll =
        fgElapsedTime() - fgStructure.CurrentWindow->State.JoystickPollRate;

    if( fgStructure.CurrentWindow->State.JoystickLastPoll < 0 )
        fgStructure.CurrentWindow->State.JoystickLastPoll = 0;
}

/*
 * Sets the mouse callback for the current window
 */
void FGAPIENTRY glutMouseFunc( void (* callback)( int, int, int, int ) )
{
    FREEGLUT_EXIT_IF_NOT_INITIALISED ( "glutMouseFunc" );
    SET_CALLBACK( Mouse );
}

/*
 * Sets the mouse wheel callback for the current window
 */
void FGAPIENTRY glutMouseWheelFunc( void (* callback)( int, int, int, int ) )
{
    FREEGLUT_EXIT_IF_NOT_INITIALISED ( "glutMouseWheelFunc" );
    SET_CALLBACK( MouseWheel );
}

/*
 * Sets the mouse motion callback for the current window (one or more buttons
 * are pressed)
 */
void FGAPIENTRY glutMotionFunc( void (* callback)( int, int ) )
{
    FREEGLUT_EXIT_IF_NOT_INITIALISED ( "glutMotionFunc" );
    SET_CALLBACK( Motion );
}

/*
 * Sets the passive mouse motion callback for the current window (no mouse
 * buttons are pressed)
 */
void FGAPIENTRY glutPassiveMotionFunc( void (* callback)( int, int ) )
{
    FREEGLUT_EXIT_IF_NOT_INITIALISED ( "glutPassiveMotionFunc" );
    SET_CALLBACK( Passive );
}

/*
 * Window mouse entry/leave callback
 */
void FGAPIENTRY glutEntryFunc( void (* callback)( int ) )
{
    FREEGLUT_EXIT_IF_NOT_INITIALISED ( "glutEntryFunc" );
    SET_CALLBACK( Entry );
}

/*
 * Window destruction callbacks
 */
void FGAPIENTRY glutCloseFunc( void (* callback)( void ) )
{
    FREEGLUT_EXIT_IF_NOT_INITIALISED ( "glutCloseFunc" );
    SET_CALLBACK( Destroy );
}

void FGAPIENTRY glutWMCloseFunc( void (* callback)( void ) )
{
    FREEGLUT_EXIT_IF_NOT_INITIALISED ( "glutWMCloseFunc" );
    glutCloseFunc( callback );
}

/* A. Donev: Destruction callback for menus */
void FGAPIENTRY glutMenuDestroyFunc( void (* callback)( void ) )
{
    FREEGLUT_EXIT_IF_NOT_INITIALISED ( "glutMenuDestroyFunc" );
    if( fgStructure.CurrentMenu )
        fgStructure.CurrentMenu->Destroy = callback;
}

/*
 * Deprecated version of glutMenuStatusFunc callback setting method
 */
void FGAPIENTRY glutMenuStateFunc( void (* callback)( int ) )
{
    FREEGLUT_EXIT_IF_NOT_INITIALISED ( "glutMenuStateFunc" );
    fgState.MenuStateCallback = callback;
}

/*
 * Sets the global menu status callback for the current window
 */
void FGAPIENTRY glutMenuStatusFunc( void (* callback)( int, int, int ) )
{
    FREEGLUT_EXIT_IF_NOT_INITIALISED ( "glutMenuStatusFunc" );
    fgState.MenuStatusCallback = callback;
}

/*
 * Sets the overlay display callback for the current window
 */
void FGAPIENTRY glutOverlayDisplayFunc( void (* callback)( void ) )
{
    FREEGLUT_EXIT_IF_NOT_INITIALISED ( "glutOverlayDisplayFunc" );
    SET_CALLBACK( OverlayDisplay );
}

/*
 * Sets the window status callback for the current window
 */
void FGAPIENTRY glutWindowStatusFunc( void (* callback)( int ) )
{
    FREEGLUT_EXIT_IF_NOT_INITIALISED ( "glutWindowStatusFunc" );
    SET_CALLBACK( WindowStatus );
}

/*
 * Sets the spaceball motion callback for the current window
 */
void FGAPIENTRY glutSpaceballMotionFunc( void (* callback)( int, int, int ) )
{
    FREEGLUT_EXIT_IF_NOT_INITIALISED ( "glutSpaceballMotionFunc" );
    fgInitialiseSpaceball();

    SET_CALLBACK( SpaceMotion );
}

/*
 * Sets the spaceball rotate callback for the current window
 */
void FGAPIENTRY glutSpaceballRotateFunc( void (* callback)( int, int, int ) )
{
    FREEGLUT_EXIT_IF_NOT_INITIALISED ( "glutSpaceballRotateFunc" );
    fgInitialiseSpaceball();

    SET_CALLBACK( SpaceRotation );
}

/*
 * Sets the spaceball button callback for the current window
 */
void FGAPIENTRY glutSpaceballButtonFunc( void (* callback)( int, int ) )
{
    FREEGLUT_EXIT_IF_NOT_INITIALISED ( "glutSpaceballButtonFunc" );
    fgInitialiseSpaceball();

    SET_CALLBACK( SpaceButton );
}

/*
 * Sets the button box callback for the current window
 */
void FGAPIENTRY glutButtonBoxFunc( void (* callback)( int, int ) )
{
    FREEGLUT_EXIT_IF_NOT_INITIALISED ( "glutButtonBoxFunc" );
    SET_CALLBACK( ButtonBox );
}

/*
 * Sets the dials box callback for the current window
 */
void FGAPIENTRY glutDialsFunc( void (* callback)( int, int ) )
{
    FREEGLUT_EXIT_IF_NOT_INITIALISED ( "glutDialsFunc" );
    SET_CALLBACK( Dials );
}

/*
 * Sets the tablet motion callback for the current window
 */
void FGAPIENTRY glutTabletMotionFunc( void (* callback)( int, int ) )
{
    FREEGLUT_EXIT_IF_NOT_INITIALISED ( "glutTabletMotionFunc" );
    SET_CALLBACK( TabletMotion );
}

/*
 * Sets the tablet buttons callback for the current window
 */
void FGAPIENTRY glutTabletButtonFunc( void (* callback)( int, int, int, int ) )
{
    FREEGLUT_EXIT_IF_NOT_INITIALISED ( "glutTabletButtonFunc" );
    SET_CALLBACK( TabletButton );
}

/*** END OF FILE ***/
