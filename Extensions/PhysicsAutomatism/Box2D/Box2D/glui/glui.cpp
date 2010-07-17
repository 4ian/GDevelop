/****************************************************************************
  
  GLUI User Interface Toolkit (LGPL)
  ---------------------------

     glui.cpp

          --------------------------------------------------

  Copyright (c) 1998 Paul Rademacher

  WWW:    http://sourceforge.net/projects/glui/
  Forums: http://sourceforge.net/forum/?group_id=92496

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
  Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA

*****************************************************************************/
#include "glui_internal_control.h"


/**
 Note: moving this routine here from glui_add_controls.cpp prevents the linker
 from touching glui_add_controls.o in non-deprecated programs, which 
 descreases the linked size of small GLUI programs substantially (100K+). (OSL 2006/06)
*/
void GLUI_Node::add_child_to_control(GLUI_Node *parent,GLUI_Control *child)
{
  GLUI_Control *parent_control;

  /*** Collapsible nodes have to be handled differently, b/c the first and 
    last children are swapped in and out  ***/
  parent_control = ((GLUI_Control*)parent);
  if ( parent_control->collapsible == true ) {
    if ( NOT parent_control->is_open ) {
      /** Swap in the original first and last children **/
      parent_control->child_head  = parent_control->collapsed_node.child_head;
      parent_control->child_tail  = parent_control->collapsed_node.child_tail;

      /*** Link this control ***/
      child->link_this_to_parent_last( parent_control );

      /** Swap the children back out ***/
      parent_control->collapsed_node.child_head = parent_control->child_head;
      parent_control->collapsed_node.child_tail = parent_control->child_tail;
      parent_control->child_head = NULL;
      parent_control->child_tail = NULL;
    }
    else {
      child->link_this_to_parent_last( parent_control );
    }
  }
  else {
    child->link_this_to_parent_last( parent_control );
  }
  child->glui = (GLUI*) parent_control->glui;
  child->update_size();
  child->enabled = parent_control->enabled;
  child->glui->refresh();

  /** Now set the 'hidden' var based on the parent **/
  if ( parent_control->hidden OR 
       (parent_control->collapsible AND NOT parent_control->is_open ) )
  {
    child->hidden = true;
  }
}


/************************************ GLUI_Node::add_control() **************/

int GLUI_Node::add_control( GLUI_Control *child )
{
  add_child_to_control(this,child);
  return true;
}

/************************************ GLUI_Main::add_control() **************/
 
int GLUI_Main::add_control( GLUI_Node *parent, GLUI_Control *control )
{
  add_child_to_control(parent,control);
  return true;
}



/*** This object must be used to create a GLUI ***/

GLUI_Master_Object GLUI_Master;

/************************************ finish_drawing() ***********
  Probably a silly routine.  Called after all event handling callbacks.
*/

static void finish_drawing(void)
{
	glFinish();
}

/************************************ GLUI_CB::operator()() ************/
void GLUI_CB::operator()(GLUI_Control*ctrl) const
{
  if (idCB)  idCB(ctrl->user_id);
  if (objCB) objCB(ctrl);
}


/************************************************ GLUI::GLUI() **********/

int GLUI::init( const char *text, long flags, int x, int y, int parent_window ) 
{
  int old_glut_window;

  this->flags = flags;

  window_name = text;
  
  buffer_mode = buffer_back;  ///< New smooth way
  //buffer_mode = buffer_front; ///< Old flickery way (a bit faster).

  /*** We copy over the current window callthroughs ***/
  /*** (I think this might actually only be needed for subwindows) ***/
  /*  glut_keyboard_CB = GLUI_Master.glut_keyboard_CB;
      glut_reshape_CB  = GLUI_Master.glut_reshape_CB;
      glut_special_CB  = GLUI_Master.glut_special_CB;
      glut_mouse_CB    = GLUI_Master.glut_mouse_CB;*/


  if ( (flags & GLUI_SUBWINDOW) != GLUI_SUBWINDOW ) {  /* not a subwindow, creating a new top-level window */
    old_glut_window = glutGetWindow();

    create_standalone_window( window_name.c_str(), x, y );
    setup_default_glut_callbacks();

    if ( old_glut_window > 0 )
      glutSetWindow( old_glut_window );

    top_level_glut_window_id = glut_window_id;
  } 
  else /* *is* a subwindow */
  {
    old_glut_window = glutGetWindow();

    create_subwindow( parent_window, flags );
    setup_default_glut_callbacks();

    if ( old_glut_window > 0 )
      glutSetWindow( old_glut_window );

    top_level_glut_window_id = parent_window;

    /*
      glutReshapeFunc( glui_parent_window_reshape_func );
      glutSpecialFunc( glui_parent_window_special_func );
      glutKeyboardFunc( glui_parent_window_keyboard_func );
      glutMouseFunc( glui_parent_window_mouse_func );
      */
    
  }

  return true;
}


/**************************** GLUI_Main::create_standalone_window() ********/

void GLUI_Main::create_standalone_window( const char *name, int x, int y )
{
  glutInitWindowSize( 100, 100 );
  if ( x >= 0 OR y >= 0 )
    glutInitWindowPosition( x, y );
  glutInitDisplayMode( GLUT_RGB | GLUT_DOUBLE ); 
  glut_window_id = glutCreateWindow( name );
}


/******************************** GLUI_Main::create_subwindow() **********/

void GLUI_Main::create_subwindow( int parent_window, int window_alignment )
{
  glut_window_id = glutCreateSubWindow(parent_window, 0,0, 100, 100);
  this->parent_window = parent_window;
}


/**************************** GLUI_Main::setup_default_glut_callbacks() *****/

void GLUI_Main::setup_default_glut_callbacks( void )
{
  glutDisplayFunc( glui_display_func );
  glutReshapeFunc( glui_reshape_func );
  glutKeyboardFunc( glui_keyboard_func );
  glutSpecialFunc( glui_special_func );
  glutMouseFunc( glui_mouse_func );
  glutMotionFunc( glui_motion_func );
  glutPassiveMotionFunc( glui_passive_motion_func );
  glutEntryFunc( glui_entry_func );
  glutVisibilityFunc( glui_visibility_func );
  /*  glutIdleFunc( glui_idle_func );    // FIXME!  100% CPU usage!      */
}


/********************************************** glui_display_func() ********/

void glui_display_func(void)
{
  GLUI *glui;

  /*  printf( "display func\n" );          */

  glui = GLUI_Master.find_glui_by_window_id( glutGetWindow() );

  if ( glui ) {
    glui->display(); 
    /* 
       Do not do anything after the above line, b/c the GLUI
       window might have just closed itself 
   */
  }
}


/********************************************** glui_reshape_func() ********/

void glui_reshape_func(int w,int h )
{
  GLUI             *glui;
  GLUI_Glut_Window *glut_window;
  int               current_window;

  /*printf( "glui_reshape_func(): %d  w/h: %d/%d\n", glutGetWindow(), w, h );          */

  current_window = glutGetWindow();

  /***  First check if this is main glut window ***/
  glut_window = GLUI_Master.find_glut_window( current_window );
  if ( glut_window ) {
    if (glut_window->glut_reshape_CB) glut_window->glut_reshape_CB(w,h);

    /***  Now send reshape events to all subwindows  ***/
    glui = (GLUI*) GLUI_Master.gluis.first_child();
    while(glui) {
      if ( TEST_AND( glui->flags, GLUI_SUBWINDOW) AND 
	   glui->parent_window == current_window ) {
	glutSetWindow( glui->get_glut_window_id());
	glui->reshape(w,h);
	/*	glui->check_subwindow_position();          */
      }
      glui = (GLUI*) glui->next();
    }
  }
  else {
    /***  A standalone GLUI window  ***/

    glui = GLUI_Master.find_glui_by_window_id( current_window );

    if ( glui ) {
      glui->reshape(w,h);
    }
  }
}

/********************************************** glui_keyboard_func() ********/

void glui_keyboard_func(unsigned char key, int x, int y)
{
  GLUI              *glui;
  int                current_window;
  GLUI_Glut_Window  *glut_window;

  current_window = glutGetWindow();
  glut_window = GLUI_Master.find_glut_window( current_window );

  /*printf( "key: %d\n", current_window );          */

  if ( glut_window ) { /**  Was event in a GLUT window?  **/
    if ( GLUI_Master.active_control_glui AND GLUI_Master.active_control ) {
      glutSetWindow( GLUI_Master.active_control_glui->get_glut_window_id() );
      
      GLUI_Master.active_control_glui->keyboard(key,x,y);    
	  finish_drawing();
      
      glutSetWindow( current_window );
    }
    else {
      if (glut_window->glut_keyboard_CB) 
        glut_window->glut_keyboard_CB( key, x, y );
    } 
  }
  else {   /***  Nope, event was in a standalone GLUI window  **/
    glui = GLUI_Master.find_glui_by_window_id( glutGetWindow() );

    if ( glui ) {
      glui->keyboard(key,x,y);
	  finish_drawing();
    }
  }
}


/************************************************ glui_special_func() ********/

void glui_special_func(int key, int x, int y)
{
  GLUI              *glui;
  int                current_window;
  GLUI_Glut_Window  *glut_window;

  current_window = glutGetWindow();
  glut_window = GLUI_Master.find_glut_window( current_window );

  if (glut_window) /**  Was event in a GLUT window?  **/
  {
    if ( GLUI_Master.active_control_glui AND GLUI_Master.active_control )
    {
      glutSetWindow( GLUI_Master.active_control_glui->get_glut_window_id() );
      
      GLUI_Master.active_control_glui->special(key,x,y);    
      finish_drawing();
      
      glutSetWindow( current_window );
    }
    else
    {
      if (glut_window->glut_special_CB)
        glut_window->glut_special_CB( key, x, y );
    } 
  }
  else /***  Nope, event was in a standalone GLUI window  **/
  {
    glui = GLUI_Master.find_glui_by_window_id(glutGetWindow());

    if ( glui )
    {
      glui->special(key,x,y);
      finish_drawing();
    }
  }
}

/********************************************** glui_mouse_func() ********/

void glui_mouse_func(int button, int state, int x, int y)
{
  GLUI              *glui;
  int                current_window;
  GLUI_Glut_Window  *glut_window;

  current_window = glutGetWindow();
  glut_window = GLUI_Master.find_glut_window( current_window );

  if ( glut_window ) { /**  Was event in a GLUT window?  **/
    if ( GLUI_Master.active_control_glui != NULL ) 
      GLUI_Master.active_control_glui->deactivate_current_control();

    if (glut_window->glut_mouse_CB)
      glut_window->glut_mouse_CB( button, state, x, y );
	finish_drawing();
  }
  else {               /**  Nope - event was in a GLUI standalone window  **/
    glui = GLUI_Master.find_glui_by_window_id( glutGetWindow() );
    if ( glui ) {
      glui->passive_motion( 0,0 );
      glui->mouse( button, state, x, y );
	  finish_drawing();
    }
  }
}


/********************************************** glui_motion_func() ********/

void glui_motion_func(int x, int y)
{
  GLUI *glui;

  glui = GLUI_Master.find_glui_by_window_id( glutGetWindow() );

  if ( glui ) {
    glui->motion(x,y);
	finish_drawing();
  }

}


/**************************************** glui_passive_motion_func() ********/

void glui_passive_motion_func(int x, int y)
{
  GLUI *glui;

  glui = GLUI_Master.find_glui_by_window_id( glutGetWindow() );

  if ( glui ) {
    glui->passive_motion(x,y);
	finish_drawing();
  }
}


/********************************************** glui_entry_func() ********/

void glui_entry_func(int state)
{
  GLUI *glui;

  glui = GLUI_Master.find_glui_by_window_id( glutGetWindow() );

  if ( glui ) {
    glui->entry(state);
  }
}


/******************************************** glui_visibility_func() ********/

void glui_visibility_func(int state)
{
  GLUI *glui;

  /*  printf( "IN GLUI VISIBILITY()\n" );          */
  /*  fflush( stdout );          */

  glui = GLUI_Master.find_glui_by_window_id( glutGetWindow() );

  if ( glui ) {
    glui->visibility(state);
  }
}


/********************************************** glui_idle_func() ********/
/* Send idle event to each glui, then to the main window            */

void glui_idle_func(void)
{
  GLUI *glui;

  glui = (GLUI*) GLUI_Master.gluis.first_child();
  while( glui ) {
    glui->idle();
	finish_drawing();
    
    glui = (GLUI*) glui->next();
  }

  if ( GLUI_Master.glut_idle_CB ) {
    /*** We set the current glut window before calling the user's
      idle function, even though glut explicitly says the window id is 
      undefined in an idle callback.  ***/
    
    /** Check what the current window is first ***/

    /*** Arbitrarily set the window id to the main gfx window of the 
      first glui window ***/
    /*   int current_window, new_window;          */
    /*   current_window = glutGetWindow();          */
    /*   if (GLUI_Master.gluis.first_child() != NULL ) {          */
    /*      new_window = ((GLUI_Main*)GLUI_Master.gluis.first_child())-> */
    /*   main_gfx_window_id;          */
    /*   if ( new_window > 0 AND new_window != old_window ) {          */
    /*   --- Window is changed only if its not already the current window ---*/
    /*  glutSetWindow( new_window );          */
    /* }          */
    /*}          */
    
    GLUI_Master.glut_idle_CB();
  }
}

/*********************************** GLUI_Master_Object::GLUI_Master_Object() ******/

GLUI_Master_Object::GLUI_Master_Object()
:	glui_id_counter(1),
    glut_idle_CB(NULL)
{
}

GLUI_Master_Object::~GLUI_Master_Object()
{
}

/*********************************** GLUI_Master_Object::create_glui() ******/

GLUI *GLUI_Master_Object::create_glui( const char *name, long flags,int x,int y )
{
  GLUI *new_glui = new GLUI;
  new_glui->init( name, flags, x, y, -1 );
  new_glui->link_this_to_parent_last( &this->gluis );
  return new_glui;
}


/************************** GLUI_Master_Object::create_glui_subwindow() ******/

GLUI *GLUI_Master_Object::create_glui_subwindow( int parent_window, 
						   long flags )
{
  GLUI *new_glui = new GLUI;
  GLUI_String new_name;
  glui_format_str( new_name, "subwin_%p", this );

  new_glui->init( new_name.c_str(), flags | GLUI_SUBWINDOW, 0,0,
		    parent_window );
  new_glui->main_panel->set_int_val( GLUI_PANEL_EMBOSSED );
  new_glui->link_this_to_parent_last( &this->gluis );
  return new_glui;
}


/********************** GLUI_Master_Object::find_glui_by_window_id() ********/

GLUI  *GLUI_Master_Object::find_glui_by_window_id( int window_id )
{
  GLUI_Node *node;

  node = gluis.first_child();
  while( node ) {
    if ( ((GLUI*)node)->get_glut_window_id() == window_id ) 
      return (GLUI*) node;
    
    node = node->next();
  }
  return NULL;
}


/******************************************** GLUI_Main::display() **********/

void    GLUI_Main::display( void )
{
  int       win_w, win_h;

  /* SUBTLE: on freeGLUT, the correct window is always already set.
  But older versions of GLUT need this call, or else subwindows
  don't update properly when resizing or damage-painting.
  */
  glutSetWindow( glut_window_id );
  
  /* Set up OpenGL state for widget drawing */
  glDisable( GL_DEPTH_TEST );
  glCullFace( GL_BACK );
  glDisable( GL_CULL_FACE );
  glDisable( GL_LIGHTING );
  set_current_draw_buffer();

  /**** This function is used as a special place to do 'safe' processing,
    e.g., handling window close requests.
    That is, we can't close the window directly in the callback, so 
    we set a flag, post a redisplay message (which eventually calls
    this function), then close the window safely in here.  ****/
  if ( closing ) {
    close_internal();
    return;
  }

  /*  if ( TEST_AND( this->flags, GLUI_SUBWINDOW ))
      check_subwindow_position();
      */

  win_w = glutGet( GLUT_WINDOW_WIDTH );
  win_h = glutGet( GLUT_WINDOW_HEIGHT );

  /*** Check here if the window needs resizing ***/
  if ( win_w != main_panel->w OR win_h != main_panel->h ) {
    glutReshapeWindow( main_panel->w, main_panel->h );
    return;
  }

  /*******    Draw GLUI window     ******/
  glClearColor( (float) bkgd_color.r / 255.0,
		(float) bkgd_color.g / 255.0,
		(float) bkgd_color.b / 255.0,
		1.0 );
  glClear( GL_COLOR_BUFFER_BIT ); /* | GL_DEPTH_BUFFER_BIT );          */

  set_ortho_projection();

  glMatrixMode( GL_MODELVIEW );
  glLoadIdentity();

  /*** Rotate image so y increases downward.
      In normal OpenGL, y increases upward. ***/
  glTranslatef( (float) win_w/2.0, (float) win_h/2.0, 0.0 );
  glRotatef( 180.0, 0.0, 1.0, 0.0 );
  glRotatef( 180.0, 0.0, 0.0, 1.0 );
  glTranslatef( (float) -win_w/2.0, (float) -win_h/2.0, 0.0 );

  // Recursively draw the main panel
  //  main_panel->draw_bkgd_box( 0, 0, win_w, win_h );
  main_panel->draw_recursive( 0, 0 );

  switch (buffer_mode) {
  case buffer_front: /* Make sure drawing gets to screen */
  	glFlush();
	break;
  case buffer_back: /* Bring back buffer to front */
  	glutSwapBuffers();
	break;
  }
}




/*************************************** _glutBitmapWidthString() **********/

int _glutBitmapWidthString( void *font, const char *s )
{
  const char *p = s;
  int  width = 0;

  while( *p != '\0' )  {
    width += glutBitmapWidth( font, *p );
    p++;
  }

  return width;
}

/************************************ _glutBitmapString *********************/
/* Displays the contents of a string using GLUT's bitmap character function */
/* Does not handle newlines                                             */

void _glutBitmapString( void *font, const char *s )
{
  const char *p = s;

  while( *p != '\0' )  {
    glutBitmapCharacter( font, *p );
    p++;
  }
}



/****************************** GLUI_Main::reshape() **************/

void    GLUI_Main::reshape( int reshape_w, int reshape_h )
{
  int new_w, new_h;

  pack_controls();

  new_w = main_panel->w;/* + 1;          */
  new_h = main_panel->h;/* + 1;          */

  if ( reshape_w != new_w OR reshape_h != new_h ) {
    this->w = new_w;
    this->h = new_h;
    
    glutReshapeWindow( new_w, new_h );
  }
  else {
  }

  if ( TEST_AND( this->flags, GLUI_SUBWINDOW ) ) {
    check_subwindow_position();

    /***** if ( TEST_AND(this->flags,GLUI_SUBWINDOW_LEFT )) {
      }
      else if ( TEST_AND(this->flags,GLUI_SUBWINDOW_LEFT )) {
      }
      else if ( TEST_AND(this->flags,GLUI_SUBWINDOW_LEFT )) {
      }
      else if ( TEST_AND(this->flags,GLUI_SUBWINDOW_RIGHT )) {
      }
      ****/
  }
  
  glViewport( 0, 0, new_w, new_h );

  /*  printf( "%d: %d\n", glutGetWindow(), this->flags );          */

  glutPostRedisplay();
}


/****************************** GLUI_Main::keyboard() **************/

void    GLUI_Main::keyboard(unsigned char key, int x, int y)
{
  GLUI_Control *new_control;

  curr_modifiers = glutGetModifiers();

  /*** If it's a tab or shift tab, we don't pass it on to the controls.
    Instead, we use it to cycle through active controls ***/
  if ( key == '\t' AND !mouse_button_down AND 
       (!active_control || !active_control->wants_tabs())) {
    if ( curr_modifiers & GLUT_ACTIVE_SHIFT ) {
      new_control = find_prev_control( active_control );
    }
    else {
      new_control = find_next_control( active_control );
    }

    /*    if ( new_control )
	  printf( "new_control: %s\n", new_control->name );
	  */

    deactivate_current_control();
    activate_control( new_control, GLUI_ACTIVATE_TAB );
  }
  else if ( key == ' ' AND active_control 
	          AND active_control->spacebar_mouse_click ) { 
    /*** If the user presses the spacebar, and a non-edittext control
      is active, we send it a mouse down event followed by a mouse up
      event (simulated mouse-click) ***/
    
    active_control->mouse_down_handler( 0, 0 );
    active_control->mouse_up_handler( 0, 0, true );
  } else {
    /*** Pass the keystroke onto the active control, if any ***/
    if ( active_control != NULL )
      active_control->key_handler( key, curr_modifiers );
  }
}


/****************************** GLUI_Main::special() **************/

void    GLUI_Main::special(int key, int x, int y)
{
  curr_modifiers = glutGetModifiers();

  /*** Pass the keystroke onto the active control, if any ***/
  if ( active_control != NULL )
    active_control->special_handler( key, glutGetModifiers() );
}



/****************************** GLUI_Main::mouse() **************/

void    GLUI_Main::mouse(int button, int state, int x, int y)
{
  int callthrough;
  GLUI_Control *control;

  /*  printf( "MOUSE: %d %d\n", button, state );          */

  callthrough = true;

  curr_modifiers = glutGetModifiers();

  if ( button == GLUT_LEFT ) {
    control = find_control( x, y );

    /*if ( control ) printf( "control: %s\n", control->name.c_str() );      */
    
    if ( mouse_button_down AND active_control != NULL AND
      	 state == GLUT_UP ) 
    {
      /** We just released the mouse, which was depressed at some control **/

      callthrough = active_control->
        mouse_up_handler( x, y, control==active_control);
      glutSetCursor( GLUT_CURSOR_LEFT_ARROW );

      if ( active_control AND 
           active_control->active_type == GLUI_CONTROL_ACTIVE_MOUSEDOWN AND 0)
      {
        /*** This is a control that needs to be deactivated when the
        mouse button is released ****/
        deactivate_current_control();
      }
    }
    else {
      if ( control ) {
        if ( NOT mouse_button_down AND state == GLUT_DOWN ) {
          /*** We just pressed the mouse down at some control ***/

          if ( active_control != control ) {
            if ( active_control != NULL ) {
              /** There is an active control still - deactivate it ***/
              deactivate_current_control();
            }
          }

          if ( control->enabled ) {
            activate_control( control, GLUI_ACTIVATE_MOUSE );
            callthrough    = control->mouse_down_handler( x, y );
          }
        }
      }
    }

    if ( state == GLUT_DOWN )
      mouse_button_down = true;
    else if ( state == GLUT_UP )
      mouse_button_down = false;
  }

  /**
    NO CALLTHROUGH NEEDED FOR MOUSE EVENTS
    if ( callthrough AND glut_mouse_CB )
    glut_mouse_CB( button, state, x, y );
    **/

  callthrough=callthrough; /* To get rid of compiler warnings */
}


/****************************** GLUI_Main::motion() **************/

void    GLUI_Main::motion(int x, int y)
{
  int           callthrough;
  GLUI_Control *control;

  /*  printf( "MOTION: %d %d\n", x, y );          */

  callthrough = true;

  control = find_control(x,y);
  
  if ( mouse_button_down AND active_control != NULL ) {
    callthrough = 
      active_control->mouse_held_down_handler(x,y,control==active_control);
  }
  
  /**
    NO CALLTHROUGH NEEDED FOR MOUSE EVENTS

    if ( callthrough AND glut_motion_CB )
    glut_motion_CB(x,y);
    **/

  callthrough=callthrough; /* To get rid of compiler warnings */
}


/*********************** GLUI_Main::passive_motion() **************/

void    GLUI_Main::passive_motion(int x, int y)
{
  GLUI_Control *control;

  control = find_control( x, y );

  /*  printf( "%p %p\n", control, mouse_over_control );          */

  if ( control != mouse_over_control ) {
    if ( mouse_over_control ) {
      mouse_over_control->mouse_over( false, x, y );
    }

    if ( control ) {
      control->mouse_over( true, x, y );
      mouse_over_control = control;
    }
  }

  /*
    if ( curr_cursor != GLUT_CURSOR_INHERIT ) {
    curr_cursor = GLUT_CURSOR_INHERIT;
    glutSetCursor( GLUT_CURSOR_INHERIT );
    }*/

}


/****************************** GLUI_Main::entry() **************/

void    GLUI_Main::entry(int state)
{
  /*if ( NOT active_control OR ( active_control AND ( active_control->type == GLUI_CONTROL_EDITTEXT
    OR active_control->type == GLUI_CONTROL_SPINNER) ) )*/
  glutSetCursor( GLUT_CURSOR_LEFT_ARROW );
}


/****************************** GLUI_Main::visibility() **************/

void    GLUI_Main::visibility(int state)
{
}


/****************************** GLUI_Main::idle() **************/

void    GLUI_Main::idle(void)
{
  /*** Pass the idle event onto the active control, if any ***/

  /*  printf( "IDLE \t" );          */

  if ( active_control != NULL ) {
    /* First we check if the control actually needs the idle right now.
       Otherwise, let's avoid wasting cycles and OpenGL context switching */

    if ( active_control->needs_idle() ) {
      /*** Set the current glut window to the glui window */
      /*** But don't change the window if we're already at that window ***/

      if ( glut_window_id > 0 AND glutGetWindow() != glut_window_id ) {
	glutSetWindow( glut_window_id );
      }
      
      active_control->idle();
    }
  }
}

int  GLUI_Main::needs_idle( void )
{
  return active_control != NULL && active_control->needs_idle();
}


/******************************************* GLUI_Main::find_control() ******/

GLUI_Control  *GLUI_Main::find_control( int x, int y )
{
  GLUI_Control *node, *last_container;

  last_container = NULL;

  node = main_panel;
  while( node != NULL ) {
    if ( !dynamic_cast<GLUI_Column*>(node) AND
         PT_IN_BOX( x, y, 
                    node->x_abs, node->x_abs + node->w, 
                    node->y_abs, node->y_abs + node->h ) 
         ) 
    {
      /*** Point is inside current node ***/
      
      if ( node->first_child() == NULL ) {
        /*** SPECIAL CASE: for edittext boxes, we make sure click is
             in box, and not on name string.  This should be generalized
             for all controls later... ***/
        if ( dynamic_cast<GLUI_EditText*>(node) ) {
          if ( x < node->x_abs + ((GLUI_EditText*)node)->text_x_offset )
            return (GLUI_Control*) node->parent();
        }

        return node;   /* point is inside this node, and node has no children,
                          so return this node as the selected node */
      }
      else {
        /*** This is a container class ***/
        last_container = node;
        node = (GLUI_Control*) node->first_child();  /* Descend into child */
      }
      
    }
    else {
      node = (GLUI_Control*) node->next();
    }
  }
 
  /** No leaf-level nodes found to accept the mouse click, so
      return the last container control found which DOES accept the click **/
  
  if ( last_container ) {
    /*    printf( "ctrl: '%s'\n", last_container->name );          */
  
    return last_container;
  }
  else {
    return NULL;
  }
}


/************************************* GLUI_Main::pack_controls() ***********/

void      GLUI_Main::pack_controls( void )
{
  main_panel->pack(0,0);

  /**** Now align controls within their bounds ****/
  align_controls( main_panel );

  /***  If this is a subwindow, expand panel to fit parent window  ***/
  if ( TEST_AND( this->flags, GLUI_SUBWINDOW ) ) {
    int parent_h, parent_w;
    int orig_window;

    orig_window = glutGetWindow();
    glutSetWindow( this->top_level_glut_window_id );
    parent_h = glutGet( GLUT_WINDOW_HEIGHT );
    parent_w = glutGet( GLUT_WINDOW_WIDTH );

    glutSetWindow( orig_window );

    /*		printf( "%d %d\n", parent_h, parent_w );          */

    if ( 1 ) {
      if ( TEST_AND(this->flags,GLUI_SUBWINDOW_TOP )) {
	main_panel->w = MAX( main_panel->w, parent_w );
      }
      else if ( TEST_AND(this->flags,GLUI_SUBWINDOW_LEFT )) {
	main_panel->h = MAX( main_panel->h, parent_h );
      }
      else if ( TEST_AND(this->flags,GLUI_SUBWINDOW_BOTTOM )) {
	main_panel->w = MAX( main_panel->w, parent_w );
      }
      else if ( TEST_AND(this->flags,GLUI_SUBWINDOW_RIGHT )) {
	main_panel->h = MAX( main_panel->h, parent_h );
      }
    }
  }

  this->w = main_panel->w;
  this->h = main_panel->h;
}


/************************************ GLUI_Main::align_controls() **********/

void    GLUI_Main::align_controls( GLUI_Control *control )
{
  GLUI_Control *child;

  control->align();

  child = (GLUI_Control*) control->first_child();

  while( child != NULL ) {
    align_controls( child );
    
    child = (GLUI_Control*)child->next();
  }  
}



/*********************************** GLUI::set_main_gfx_window() ************/

void   GLUI::set_main_gfx_window( int window_id )
{
  main_gfx_window_id = window_id;
}


/********************************* GLUI_Main::post_update_main_gfx() ********/

void   GLUI_Main::post_update_main_gfx( void )
{
  int old_window;

  if ( main_gfx_window_id > 0 ) {
    old_window = glutGetWindow();
    glutSetWindow( main_gfx_window_id );
    glutPostRedisplay();
    if( old_window > 0 )
      glutSetWindow( old_window );
  }
}

/********************************* GLUI_Main::should_redraw_now() ********/
/** Return true if this control should redraw itself immediately (front buffer);
   Or queue up a redraw and return false if it shouldn't (back buffer).
   
   Called from GLUI_Control::redraw.
*/
bool	     GLUI_Main::should_redraw_now(GLUI_Control *ctl)
{
  switch (buffer_mode) {
  case buffer_front: return true; /* always draw in front-buffer mode */
  case buffer_back: {
    int orig = ctl->set_to_glut_window();
    glutPostRedisplay(); /* redraw soon */
    ctl->restore_window(orig);
    return false; /* don't draw now. */
   }
  }
  return false; /* never executed */
}

/********************************* GLUI_Main::set_current_draw_buffer() ********/

int          GLUI_Main::set_current_draw_buffer( void )
{
  /* Save old buffer */
  GLint state;
  glGetIntegerv( GL_DRAW_BUFFER, &state );
  /* Switch to new buffer */
  switch (buffer_mode) {
  case buffer_front: glDrawBuffer(GL_FRONT); break;
  case buffer_back:  glDrawBuffer(GL_BACK);  break; /* might not be needed... */
  }
  return (int)state;
}
 

/********************************* GLUI_Main::restore_draw_buffer() **********/

void         GLUI_Main::restore_draw_buffer( int buffer_state )
{
  glDrawBuffer( buffer_state );
}


/******************************************** GLUI_Main::GLUI_Main() ********/

GLUI_Main::GLUI_Main( void ) 
{
  mouse_button_down       = false;
  w                       = 0;
  h                       = 0;
  active_control          = NULL;
  mouse_over_control      = NULL;
  main_gfx_window_id      = -1;
  glut_window_id          = -1;
  curr_modifiers          = 0;
  closing                 = false;
  parent_window           = -1;
  glui_id                 = GLUI_Master.glui_id_counter;
  GLUI_Master.glui_id_counter++;

  font                    = GLUT_BITMAP_HELVETICA_12;
  curr_cursor             = GLUT_CURSOR_LEFT_ARROW;

  int r=200, g=200, b=200;
  bkgd_color.set( r,g,b );
  bkgd_color_f[0] = r / 255.0;
  bkgd_color_f[1] = g / 255.0;
  bkgd_color_f[2] = b / 255.0;

  /*** Create the main panel ***/
  main_panel              = new GLUI_Panel;
  main_panel->set_int_val( GLUI_PANEL_NONE );
  main_panel->glui        = (GLUI*) this;
  main_panel->name        = "\0";
}

/************************************ GLUI_Main::draw_raised_box() **********/

void      GLUI_Main::draw_raised_box( int x, int y, int w, int h )
{
  w = w+x;
  h = h+y;

  glColor3ub( bkgd_color.r, bkgd_color.g, bkgd_color.b );
  glBegin( GL_LINE_LOOP );
  glVertex2i( x+1, y+1 );  glVertex2i( w-1, y+1 );
  glVertex2i( w-1, h-1 );  glVertex2i( x+1, h-1 );
  glEnd();

  glColor3d( 1.0, 1.0, 1.0 );
  glBegin( GL_LINE_STRIP );
  glVertex2i( x, h );  glVertex2i( x, y );  glVertex2i( w, y );
  glEnd();

  glColor3d( 0.0, 0.0, 0.0 );
  glBegin( GL_LINE_STRIP );
  glVertex2i( w, y );  glVertex2i( w, h );  glVertex2i( x, h );
  glEnd();

  glColor3d( .5, .5, .5 );
  glBegin( GL_LINE_STRIP );
  glVertex2i( w-1, y+1 );  glVertex2i( w-1, h-1 );  glVertex2i( x+1, h-1 );
  glEnd();
}


/************************************ GLUI_Main::draw_lowered_box() **********/
/* Not quite perfect...      **/

void      GLUI_Main::draw_lowered_box( int x, int y, int w, int h )
{
  w = w+x;
  h = h+y;

  glColor3ub( bkgd_color.r, bkgd_color.g, bkgd_color.b );
  glBegin( GL_LINE_LOOP );
  glVertex2i( x+1, y+1 );         glVertex2i( w-1, y+1 );
  glVertex2i( w-1, h-1 );     glVertex2i( x+1, h-1 );
  glEnd();

  glColor3d( 0.0, 0.0, 0.0 );
  glBegin( GL_LINE_STRIP );
  glVertex2i( x, h );  glVertex2i( x, y );  glVertex2i( w, y );
  glEnd();

  glColor3d( 1.0, 1.0, 1.0 );
  glBegin( GL_LINE_STRIP );
  glVertex2i( w, y );  glVertex2i( w, h );  glVertex2i( x, h );
  glEnd();

  glColor3d( .5, .5, .5 );
  glBegin( GL_LINE_STRIP );
  glVertex2i( w-1, y+1 );  glVertex2i( w-1, h-1 );  glVertex2i( x+1, h-1 );
  glEnd();
}


/************************************* GLUI_Main::activate_control() *********/

void         GLUI_Main::activate_control( GLUI_Control *control, int how )
{
  /** Are we not activating a control in the same window as the
    previous active control? */
  if ( GLUI_Master.active_control_glui AND
       this != (GLUI_Main*) GLUI_Master.active_control_glui ) {
    GLUI_Master.active_control_glui->deactivate_current_control();
  }

  /*******      Now activate it      *****/
  if ( control != NULL AND control->can_activate AND control->enabled ) {
    active_control = control;
    
    control->activate(how);

    /*if ( NOT active_control->is_container OR           */
    /*		active_control->type == GLUI_CONTROL_ROLLOUT) {          */
    active_control->redraw();
    /*}          */
  }
  else {
    active_control = NULL;
  }

  /*  printf( "activate: %d\n", glutGetWindow() );          */
  GLUI_Master.active_control      = active_control;
  GLUI_Master.active_control_glui = (GLUI*) this;
}


/************************* GLUI_Main::deactivate_current_control() **********/

void         GLUI_Main::deactivate_current_control( void )
{
  int orig;

  if ( active_control != NULL ) {
    orig = active_control->set_to_glut_window();

    active_control->deactivate();
    
    /** If this isn't a container control, then redraw it in its 
      deactivated state.  Container controls, such as panels, look
      the same activated or not **/

    /*if ( NOT active_control->is_container OR           */
    /*		active_control->type == GLUI_CONTROL_ROLLOUT ) {        */
    active_control->redraw();
    /*}          */

    active_control->restore_window( orig );

    active_control = NULL;
  }

  /*  printf( "deactivate: %d\n", glutGetWindow() );          */
  GLUI_Master.active_control      = NULL;
  GLUI_Master.active_control_glui = NULL;
}


/****************************** GLUI_Main::find_next_control() **************/

GLUI_Control  *GLUI_Main::find_next_control_( GLUI_Control *control )
{
  /*** THIS IS NOT find_next_control()!  This is an unused older
    version (look at the underscore at the end) ***/

  if ( control == NULL )
    return find_next_control_rec( main_panel );
  else
    return find_next_control_rec( control );
}

/****************************** GLUI_Main::find_next_control() **************/

GLUI_Control  *GLUI_Main::find_next_control_rec( GLUI_Control *control )
{
  GLUI_Control *child = NULL, *rec_control, *sibling;

  /*** Recursively investigate children ***/
  child = (GLUI_Control*) control->first_child();
  if ( child ) {
    /*** If we can activate the first child, then do so ***/
    if ( child->can_activate AND child->enabled )
      return child;
    else     /*** Recurse into first child ***/
      rec_control = find_next_control_rec( child );    

    if ( rec_control )
      return rec_control;
  }

  /*** At this point, either we don't have children, or the child cannot
    be activated.  So let's try the next sibling ***/

  sibling = (GLUI_Control*) control->next();
  if ( sibling ) {
    if ( sibling->can_activate AND sibling->enabled )
      return sibling;
    else     /*** Recurse into sibling ***/
      rec_control = find_next_control_rec( sibling );    

    if ( rec_control )
      return rec_control;
  }
  
  return NULL;
}


/****************************** GLUI_Main::find_next_control() **************/

GLUI_Control  *GLUI_Main::find_next_control( GLUI_Control *control )
{
  GLUI_Control *tmp_control = NULL;
  int           back_up;
  
  if ( control == NULL )
    control = main_panel;

  while( control != NULL ) {
    /** see if this control has a child **/
    tmp_control = (GLUI_Control*) control->first_child();

    if ( tmp_control != NULL ) {
      if ( tmp_control->can_activate AND tmp_control->enabled )
	return tmp_control;
      
      control = tmp_control;  /* Descend into child */
      continue;
    }
    
    /*** At this point, control has no children ***/

    /** see if this control has a next sibling **/
    tmp_control = (GLUI_Control*) control->next();
    
    if ( tmp_control != NULL ) {
      if ( tmp_control->can_activate AND tmp_control->enabled )
	return tmp_control;
      
      control = tmp_control;  
      continue;
    }

    /** back up until we find a sibling of an ancestor **/
    back_up = true;
    while ( control->parent() AND back_up ) {
      control = (GLUI_Control*) control->parent();

      if ( control->next() ) {
	control = (GLUI_Control*) control->next();  
	if ( control->can_activate AND control->enabled )
	  return control;
	else
	  back_up = false;

	/***	if ( control->is_container ) {
	  tmp_control = control;
	  control     = NULL;
	  break;
	  }
	  else {
	  back_up = false;
	  }
	  ***/
      }
    }

    /** Check if we've cycled back to the top... if so, return NULL **/
    if ( control == main_panel ) {
      return NULL;
    }
  }
  /*
    if ( tmp_control != NULL AND tmp_control->can_activate AND
    tmp_control->enabled ) {
    return tmp_control;
    }*/

  return NULL;
}


/****************************** GLUI_Main::find_prev_control() **************/

GLUI_Control  *GLUI_Main::find_prev_control( GLUI_Control *control )
{
  GLUI_Control *tmp_control, *next_control;

  if ( control == NULL ) {        /* here we find the last valid control */
    next_control = main_panel;
  
    do {
      tmp_control  = next_control;
      next_control = find_next_control( tmp_control ); 
    } while( next_control != NULL );

    return tmp_control;    
  }
  else {                         /* here we find the actual previous control */
    next_control = main_panel;
  
    do {
      tmp_control  = next_control;
      next_control = find_next_control( tmp_control ); 
    } while( next_control != NULL AND next_control != control );
    
    if ( next_control == NULL OR tmp_control == main_panel )
      return NULL;
    else 
      return tmp_control;
  }
}

/************************* GLUI_Master_Object::set_glutIdleFunc() ***********/

void    GLUI_Master_Object::set_glutIdleFunc(void (*f)(void))
{
  glut_idle_CB = f;
  GLUI_Master.glui_setIdleFuncIfNecessary();
}


/**************************************** GLUI::disable() ********************/

void   GLUI::disable( void )
{ 
  deactivate_current_control();
  main_panel->disable(); 
}


/******************************************** GLUI::sync_live() **************/

void   GLUI::sync_live( void )
{
  main_panel->sync_live(true, true);
}


/********************************* GLUI_Master_Object::sync_live_all() *****/

void   GLUI_Master_Object::sync_live_all( void ) 
{
  GLUI *glui;

  glui = (GLUI*) GLUI_Master.gluis.first_child();
  while( glui ) {
   
    glui->sync_live();  /** sync it **/
 
    glui = (GLUI*) glui->next();
  }  
}


/************************************* GLUI_Master_Object::close() **********/

void   GLUI_Master_Object::close_all( void ) 
{
  GLUI *glui;

  glui = (GLUI*) GLUI_Master.gluis.first_child();
  while( glui ) {
   
    glui->close();  /** Set flag to close **/
 
    glui = (GLUI*) glui->next();
  }  
}


/************************************* GLUI_Main::close_internal() **********/

void   GLUI_Main::close_internal( void ) 
{
  glutDestroyWindow(glutGetWindow()); /** Close this window **/

  this->unlink();
  
  if ( GLUI_Master.active_control_glui == this ) {
    GLUI_Master.active_control      = NULL;
    GLUI_Master.active_control_glui = NULL;
  }
    
  if ( parent_window != -1 ) {
    glutSetWindow( parent_window );
    int win_w = glutGet( GLUT_WINDOW_WIDTH );
    int win_h = glutGet( GLUT_WINDOW_HEIGHT );
    glutReshapeWindow(win_w+1, win_h);
    glutReshapeWindow(win_w-1, win_h);
  }

  delete this->main_panel;

  delete this;
}


/************************************************** GLUI::close() **********/

void   GLUI::close( void ) 
{
  int   old_glut_window;

  closing = true;

  old_glut_window = glutGetWindow();
  glutSetWindow( get_glut_window_id() );
  glutPostRedisplay();

  glutSetWindow( old_glut_window );
}


/************************** GLUI_Main::check_subwindow_position() **********/

void   GLUI_Main::check_subwindow_position( void )
{
  /*** Reposition this window if subwindow ***/
  if ( TEST_AND( this->flags, GLUI_SUBWINDOW ) ) {

    int parent_w, parent_h, new_x, new_y;
    int old_window = glutGetWindow();

    glutSetWindow( glut_window_id );

    glutSetWindow( glutGet( GLUT_WINDOW_PARENT ));
    parent_w = glutGet( GLUT_WINDOW_WIDTH );
    parent_h = glutGet( GLUT_WINDOW_HEIGHT );

    glutSetWindow( glut_window_id );

    if ( TEST_AND(this->flags,GLUI_SUBWINDOW_RIGHT )) {
      new_x = parent_w - this->w;
      new_y = 0;
    } 
    else if ( TEST_AND(this->flags,GLUI_SUBWINDOW_LEFT )) {
      new_x = 0;
      new_y = 0;
    } 
    else if ( TEST_AND(this->flags,GLUI_SUBWINDOW_BOTTOM )) {
      new_x = 0;
      new_y = parent_h - this->h;
    } 
    else {    /***   GLUI_SUBWINDOW_TOP    ***/
      new_x = 0;
      new_y = 0;
    }

    /** Now make adjustments based on presence of other subwindows **/
    GLUI *curr_glui;
    curr_glui = (GLUI*) GLUI_Master.gluis.first_child(); 
    while( curr_glui ) {
      if ( TEST_AND( curr_glui->flags, GLUI_SUBWINDOW) AND 
	   curr_glui->parent_window == this->parent_window ) {

	if ( TEST_AND( curr_glui->flags,GLUI_SUBWINDOW_LEFT ) ) {
	}
	else if ( TEST_AND( curr_glui->flags,GLUI_SUBWINDOW_BOTTOM ) ) {
	}
	else if ( TEST_AND( curr_glui->flags,GLUI_SUBWINDOW_RIGHT ) ) {
	}
	else if ( TEST_AND( curr_glui->flags,GLUI_SUBWINDOW_TOP ) AND 
		  ( TEST_AND( this->flags,GLUI_SUBWINDOW_LEFT ) OR
		    TEST_AND( this->flags,GLUI_SUBWINDOW_RIGHT ) ) ) {
	  /** If we are a RIGHT or LEFT subwindow, and there exists some 
	    TOP subwindow, bump our position down  **/

	  new_y += curr_glui->h;
	}

	/** CHeck multiple subwins at same position  **/
	/** We check the glui_id's:  only the glui with the higher
	  ID number (meaning it was created later) gets bumped over **/
	if ( curr_glui != this AND this->glui_id > curr_glui->glui_id ) {
	  if ( TEST_AND( this->flags,GLUI_SUBWINDOW_LEFT ) AND
	       TEST_AND( curr_glui->flags,GLUI_SUBWINDOW_LEFT ) ) {
	    new_x += curr_glui->w;
	  }
	  else if ( TEST_AND( this->flags,GLUI_SUBWINDOW_TOP ) AND
		    TEST_AND( curr_glui->flags,GLUI_SUBWINDOW_TOP ) ) {
	    new_y += curr_glui->h;
	  }
	  else if ( TEST_AND( this->flags,GLUI_SUBWINDOW_BOTTOM ) AND
		    TEST_AND( curr_glui->flags,GLUI_SUBWINDOW_BOTTOM ) ) {
	    new_y -= curr_glui->h;
	  }
	  else if ( TEST_AND( this->flags,GLUI_SUBWINDOW_RIGHT ) AND
		    TEST_AND( curr_glui->flags,GLUI_SUBWINDOW_RIGHT ) ) {
	    new_x -= curr_glui->w;
	  }

	}
      }

      curr_glui = (GLUI*) curr_glui->next();
    }
	

		
    CLAMP( new_x, 0, new_x );
    CLAMP( new_y, 0, new_y );

    glutPositionWindow( new_x, new_y );
    /*		glutPostRedisplay();          */

    glutSetWindow( old_window );
  }
}


/********************************* GLUI_Master_Object::reshape() **********/
/* This gets called by the user from a GLUT reshape callback.  So we look */
/* for subwindows that belong to the current window                   */

void  GLUI_Master_Object::reshape( void )
{
  GLUI *glui;
  int   current_window;

  current_window = glutGetWindow();
  
  glui = (GLUI*) GLUI_Master.gluis.first_child();
  while( glui ) {
    if ( TEST_AND( glui->flags, GLUI_SUBWINDOW) AND 
	 glui->parent_window == current_window ) {
      glutSetWindow( glui->get_glut_window_id());
      glui->check_subwindow_position();
    }
    
    glui = (GLUI*) glui->next();
  }  

  glutSetWindow(current_window);
}


/**************************** GLUI_Master_Object::set_glutReshapeFunc() *****/

void GLUI_Master_Object::set_glutReshapeFunc(void (*f)(int width, int height))
{
  glutReshapeFunc( glui_reshape_func );
  add_cb_to_glut_window( glutGetWindow(), GLUI_GLUT_RESHAPE, (void*) f);
}


/**************************** GLUI_Master_Object::set_glutKeyboardFunc() ****/

void GLUI_Master_Object::set_glutKeyboardFunc(void (*f)(unsigned char key, 
							int x, int y))
{
  glutKeyboardFunc( glui_keyboard_func );
  add_cb_to_glut_window( glutGetWindow(), GLUI_GLUT_KEYBOARD, (void*) f);
}


/*********************** GLUI_Master_Object::set_glutSpecialFunc() **********/

void GLUI_Master_Object::set_glutSpecialFunc(void (*f)(int key, 
						       int x, int y))
{
  glutSpecialFunc( glui_special_func );
  add_cb_to_glut_window( glutGetWindow(), GLUI_GLUT_SPECIAL, (void*) f);
}


/*********************** GLUI_Master_Object::set_glutMouseFunc() **********/

void GLUI_Master_Object::set_glutMouseFunc(void (*f)(int button, int state,
						     int x, int y))
{
  glutMouseFunc( glui_mouse_func );
  add_cb_to_glut_window( glutGetWindow(), GLUI_GLUT_MOUSE, (void*) f);
}


/****************************** glui_parent_window_reshape_func() **********/
/* This is the reshape callback for a window that contains subwindows      */

void glui_parent_window_reshape_func( int w, int h )
{
  int   current_window;
  GLUI  *glui;
  int   first = true;

  /*  printf( "glui_parent_window_reshape_func: %d\n", glutGetWindow() );          */

  current_window = glutGetWindow();

  glui = (GLUI*) GLUI_Master.gluis.first_child();
  while( glui ) {
    if ( TEST_AND( glui->flags, GLUI_SUBWINDOW) AND 
	 glui->parent_window == current_window ) {
      glutSetWindow( glui->get_glut_window_id());
      glui->check_subwindow_position();
      glutSetWindow( current_window );

      if ( first ) {
        if (glui->glut_reshape_CB) glui->glut_reshape_CB( w, h );
	
        first = false;
      }
    }
    
    glui = (GLUI*) glui->next();
  }  
}


/****************************** glui_parent_window_keyboard_func() **********/

void glui_parent_window_keyboard_func(unsigned char key, int x, int y)
{
  /*  printf( "glui_parent_window_keyboard_func: %d\n", glutGetWindow() );          */

  int   current_window;
  GLUI  *glui;

  current_window = glutGetWindow();

  if ( GLUI_Master.active_control_glui AND GLUI_Master.active_control ) {
    glutSetWindow( GLUI_Master.active_control_glui->get_glut_window_id() );

    GLUI_Master.active_control_glui->keyboard(key,x,y);    

    glutSetWindow( current_window );
  }
  else {
    glui = (GLUI*) GLUI_Master.gluis.first_child();
    while( glui ) {
      if ( TEST_AND( glui->flags, GLUI_SUBWINDOW) AND 
           glui->parent_window == current_window AND
           glui->glut_keyboard_CB ) 
      {
        glui->glut_keyboard_CB( key, x, y );
        break;
      }
	
      glui = (GLUI*) glui->next();
    }
  } 
}


/****************************** glui_parent_window_special_func() **********/

void glui_parent_window_special_func(int key, int x, int y)
{
  /*printf( "glui_parent_window_special_func: %d\n", glutGetWindow() );          */

  int   current_window;
  GLUI  *glui;

  /**  If clicking in the main area of a window w/subwindows, 
    deactivate any current control  **/
  if ( GLUI_Master.active_control_glui != NULL ) 
    GLUI_Master.active_control_glui->deactivate_current_control();

  /***   Now pass on the mouse event   ***/

  current_window = glutGetWindow();

  glui = (GLUI*) GLUI_Master.gluis.first_child();
  while( glui ) {
    if ( TEST_AND( glui->flags, GLUI_SUBWINDOW) AND 
         glui->parent_window == current_window ) 
    {
      glutSetWindow( glui->get_glut_window_id());
      if (glui->glut_special_CB) glui->glut_special_CB( key, x, y );
      break;
    }
    
    glui = (GLUI*) glui->next();
  }  
}


/****************************** glui_parent_window_mouse_func() **********/

void glui_parent_window_mouse_func(int button, int state, int x, int y)
{
  int   current_window;
  GLUI  *glui;

  /**  If clicking in the main area of a window w/subwindows, 
    deactivate any current control  **/
  if ( GLUI_Master.active_control_glui != NULL ) 
    GLUI_Master.active_control_glui->deactivate_current_control();


  /***   Now pass on the mouse event   ***/

  current_window = glutGetWindow();

  glui = (GLUI*) GLUI_Master.gluis.first_child();
  while( glui ) {
    if ( TEST_AND( glui->flags, GLUI_SUBWINDOW) AND 
         glui->parent_window == current_window AND
         glui->glut_mouse_CB) 
    {
      glutSetWindow( glui->get_glut_window_id());
      glui->glut_mouse_CB( button, state, x, y );
      break;
    }
    
    glui = (GLUI*) glui->next();
  } 
}


/************************** GLUI_Master_Object::find_glut_window() **********/

GLUI_Glut_Window  *GLUI_Master_Object::find_glut_window( int window_id )
{
  GLUI_Glut_Window *window;

  window = (GLUI_Glut_Window*) glut_windows.first_child();
  while( window ) {
    if ( window->glut_window_id == window_id ) 
      return window;
    
    window = (GLUI_Glut_Window*) window->next();
  }

  /***  Window not found - return NULL ***/
  return NULL;
}


/******************** GLUI_Master_Object::add_cb_to_glut_window() **********/

void     GLUI_Master_Object::add_cb_to_glut_window(int window_id,
						   int cb_type,void *cb)
{
  GLUI_Glut_Window *window;

  window = find_glut_window( window_id );
  if ( NOT window ) {
    /***  Allocate new window structure  ***/
    
    window                 = new GLUI_Glut_Window;
    window->glut_window_id = window_id;
    window->link_this_to_parent_last( (GLUI_Node*) &this->glut_windows );
  }

  switch( cb_type ) {
  case GLUI_GLUT_RESHAPE:
    window->glut_reshape_CB   = (void(*)(int,int)) cb;
    break;
  case GLUI_GLUT_DISPLAY:
    window->glut_display_CB   = (void(*)()) cb;
    break;
  case GLUI_GLUT_KEYBOARD:
    window->glut_keyboard_CB  = (void(*)(unsigned char,int,int)) cb;
    break;
  case GLUI_GLUT_SPECIAL:
    window->glut_special_CB   = (void(*)(int,int,int)) cb;
    break;
  case GLUI_GLUT_MOUSE:
    window->glut_mouse_CB     = (void(*)(int,int,int,int)) cb;
    break;
  case GLUI_GLUT_MOTION:
    window->glut_motion_CB    = (void(*)(int,int)) cb;
    break;
  case GLUI_GLUT_PASSIVE_MOTION:
    window->glut_passive_motion_CB = (void(*)(int,int)) cb;
    break;
  case GLUI_GLUT_ENTRY:
    window->glut_entry_CB     = (void(*)(int)) cb;
    break;
  case GLUI_GLUT_VISIBILITY:
    window->glut_visibility_CB= (void(*)(int)) cb;
    break;
  }
}


/************* GLUI_Master_Object::set_left_button_glut_menu_control() *****/

void  GLUI_Master_Object::set_left_button_glut_menu_control( 
							    GLUI_Control *control )
{
  curr_left_button_glut_menu = control;
}


/******************************* GLUI_Main::set_ortho_projection() **********/

void  GLUI_Main::set_ortho_projection( void )
{
  int win_h, win_w;

  win_w = glutGet( GLUT_WINDOW_WIDTH );
  win_h = glutGet( GLUT_WINDOW_HEIGHT );

  glMatrixMode( GL_PROJECTION );
  glLoadIdentity();
  /*  gluOrtho2D( 0.0, (float) win_w, 0.0, (float) win_h );          */
  glOrtho( 0.0, (float)win_w, 0.0, (float) win_h, -1000.0, 1000.0 );

  glMatrixMode( GL_MODELVIEW );
 
  return; /****-----------------------------------------------***/

  glMatrixMode( GL_MODELVIEW );
  glLoadIdentity();

  /*** Rotate image so y increases upwards, contrary to OpenGL axes ***/
  glTranslatef( (float) win_w/2.0, (float) win_h/2.0, 0.0 );
  glRotatef( 180.0, 0.0, 1.0, 0.0 );
  glRotatef( 180.0, 0.0, 0.0, 1.0 );
  glTranslatef( (float) -win_w/2.0, (float) -win_h/2.0, 0.0 );
}


/******************************* GLUI_Main::set_viewport() **********/

void  GLUI_Main::set_viewport( void )
{
  glViewport( 0, 0, main_panel->w, main_panel->h );
}


/****************************** GLUI_Main::refresh() ****************/

void    GLUI_Main::refresh( void )
{
  int orig;

  /******  GLUI_Glut_Window *glut_window;
    int              current_window;
    current_window = glutGetWindow();
    glut_window    = GLUI_Master.find_glut_window( current_window );
    if ( glut_window ) {
    glut_window->glut_reshape_CB(w,h);
    ******/

  orig  = glutGetWindow();

  pack_controls();

  if ( glut_window_id > 0 )
    glutSetWindow( glut_window_id );


  if ( TEST_AND( this->flags, GLUI_SUBWINDOW ) ) {
    /*** GLUI subwindow ***/

    check_subwindow_position();
  }
  else {
    /*** Standalone GLUI window ***/

    glutReshapeWindow( this->h, this->w );

  }

  glutPostRedisplay();
  glutSetWindow( orig);
}



/***************** GLUI_Master_Object::get_main_gfx_viewport() ***********/

void     GLUI_Master_Object::get_viewport_area( int *x, int *y, 
						int *w, int *h )
{
  GLUI *curr_glui;
  int   curr_x, curr_y, curr_w, curr_h;
  int   curr_window;

  curr_window = glutGetWindow();
  curr_x = 0;
  curr_y = 0;
  curr_w = glutGet( GLUT_WINDOW_WIDTH );
  curr_h = glutGet( GLUT_WINDOW_HEIGHT );

  curr_glui = (GLUI*) gluis.first_child(); 
  while( curr_glui ) {
    if ( TEST_AND( curr_glui->flags, GLUI_SUBWINDOW) AND 
	 curr_glui->parent_window == curr_window ) {

      /*			printf( "%s -> %d   %d %d\n", curr_glui->window_name.c_str(), curr_glui->flags,
				curr_glui->w, curr_glui->h );*/

      if ( TEST_AND( curr_glui->flags,GLUI_SUBWINDOW_LEFT ) ) {
	curr_x += curr_glui->w;
	curr_w -= curr_glui->w;
      }
      else if ( TEST_AND( curr_glui->flags,GLUI_SUBWINDOW_BOTTOM ) ) {
	curr_y += curr_glui->h;
	curr_h -= curr_glui->h;
      }
      else if ( TEST_AND( curr_glui->flags,GLUI_SUBWINDOW_RIGHT ) ) {
	curr_w -= curr_glui->w;
      }
      else if ( TEST_AND( curr_glui->flags,GLUI_SUBWINDOW_TOP ) ) {
	curr_h -= curr_glui->h;
      }
    }

    curr_glui = (GLUI*) curr_glui->next();
  }

  curr_x = MAX( 0, curr_x );
  curr_y = MAX( 0, curr_y );
  curr_w = MAX( 0, curr_w );
  curr_h = MAX( 0, curr_h );

  *x = curr_x;
  *y = curr_y;
  *w = curr_w;
  *h = curr_h;
}


/*****************GLUI_Master_Object::auto_set_main_gfx_viewport() **********/

void           GLUI_Master_Object::auto_set_viewport( void )
{
  int x, y, w, h;

  get_viewport_area( &x, &y, &w, &h );
  glViewport( MAX(x,0), MAX(y,0), MAX(w,0), MAX(h,0) );
}



/***************************************** GLUI::show() **********************/

void            GLUI::show( void )
{
  int orig_window;

  orig_window = main_panel->set_to_glut_window();

  glutShowWindow();

  main_panel->restore_window(orig_window);
}



/***************************************** GLUI::hide() **********************/

void            GLUI::hide( void )
{
  int orig_window;

  this->deactivate_current_control();

  orig_window = main_panel->set_to_glut_window();

  glutHideWindow();

  main_panel->restore_window(orig_window);
}


/**************** GLUI_DrawingSentinal **************/
GLUI_DrawingSentinal::GLUI_DrawingSentinal(GLUI_Control *c_) 
	:c(c_)
{
	orig_win = c->set_to_glut_window();
	orig_buf = c->glui->set_current_draw_buffer();
}
GLUI_DrawingSentinal::~GLUI_DrawingSentinal() {
	c->glui->restore_draw_buffer(orig_buf);
	c->restore_window(orig_win);
}


void GLUI_Master_Object::glui_setIdleFuncIfNecessary( void )
{
  GLUI *glui;

  glui = (GLUI*) GLUI_Master.gluis.first_child();
  int necessary;
  if (this->glut_idle_CB) 
    necessary = true;
  else {
    necessary = false;
    while( glui ) {
      if( glui->needs_idle() ) {
	necessary = true;
	break;
      }
      glui = (GLUI*) glui->next();
    }
  }
  if( necessary )
    glutIdleFunc( glui_idle_func );  
  else
    glutIdleFunc( NULL );  
}
