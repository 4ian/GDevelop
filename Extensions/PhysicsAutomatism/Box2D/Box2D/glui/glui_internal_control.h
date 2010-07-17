/*
 Header file for use by GLUI controls.  
 Everything you need is right here.


*/
#ifndef __GLUI_INTERNAL_CONTROL_H
#define __GLUI_INTERNAL_CONTROL_H

/* This is the main GLUI external header */
#include "GL/glui.h"

/* Here's some utility routines */
#include "glui_internal.h"


/**
  A GLUI_Control-drawing sentinal object.
  On creation, saves the current draw buffer and window.
  On destruction, restores draw buffer and window.
  This is way nicer than calling save/restore manually.
*/
class GLUI_DrawingSentinal {
	int orig_buf, orig_win;
	GLUI_Control *c;
public:
	/** The constructor sets up the drawing system */
	GLUI_DrawingSentinal(GLUI_Control *c_);
	/** The destructor cleans up drawing back how it was */
	~GLUI_DrawingSentinal();
	
	// Do-nothing routine to avoid compiler warning about unused variable
	inline void avoid_warning(void) {}
};
/** Just drop a GLUI_DRAWINGSENTINAL_IDIOM at the start of your draw methods,
and they'll return if we can't be drawn, and 
automatically save and restore all needed state. 
*/
#define GLUI_DRAWINGSENTINAL_IDIOM  if (NOT can_draw()) return; GLUI_DrawingSentinal drawSentinal(this); drawSentinal.avoid_warning();


/** Return the time, in seconds. */
inline double GLUI_Time(void) {return 0.001*glutGet(GLUT_ELAPSED_TIME);}

#endif
