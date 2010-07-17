/****************************************************************************
  
  GLUI User Interface Toolkit
  ---------------------------

     glui_button.cpp - GLUI_Button control class


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

/****************************** GLUI_Button::GLUI_Button() **********/

GLUI_Button::GLUI_Button( GLUI_Node *parent, const char *name,
                          int id, GLUI_CB cb )
{
  common_init();
  user_id     = id;
  callback    = cb;
  set_name( name );
  currently_inside = false; 
  
  parent->add_control( this );
}


/****************************** GLUI_Button::mouse_down_handler() **********/

int    GLUI_Button::mouse_down_handler( int local_x, int local_y )
{
  int_val = 1;   /** A button always in unpressed before here, so
		   now we invariably set it to 'depressed' **/

  currently_inside = true;
  redraw();

  return false;
}


/****************************** GLUI_Button::mouse_up_handler() **********/

int    GLUI_Button::mouse_up_handler( int local_x, int local_y, bool inside )
{
  set_int_val( 0 );   /** A button always turns off after you press it **/

  currently_inside = false; 
  redraw();

  if ( inside ) { 
    /*** Invoke the user's callback ***/
    execute_callback();
  }

  return false;
}


/****************************** GLUI_Button::mouse_held_down_handler() ******/

int    GLUI_Button::mouse_held_down_handler( int local_x, int local_y,
					     bool new_inside)
{
  if (new_inside != currently_inside) {
    currently_inside = new_inside;
    redraw();
  }
  
  return false;
}


/****************************** GLUI_Button::key_handler() **********/

int    GLUI_Button::key_handler( unsigned char key,int modifiers )
{
  return false;
}

/********************************************** GLUI_Button::draw() **********/

void    GLUI_Button::draw( int x, int y )
{
  if (currently_inside) draw_pressed();
  else {
    glui->draw_raised_box( 0, 0, w, h );
    draw_text( 0 );
  }
}


/************************************** GLUI_Button::draw_pressed() ******/

void   GLUI_Button::draw_pressed( void )
{
  glColor3f( 0.0, 0.0, 0.0 );

  draw_text( 1 );

  glBegin( GL_LINE_LOOP );
  glVertex2i( 0, 0 );         glVertex2i( w, 0 );
  glVertex2i( w, h );         glVertex2i( 0, h );
  glEnd();

  glBegin( GL_LINE_LOOP );
  glVertex2i( 1, 1 );         glVertex2i( w-1, 1 );
  glVertex2i( w-1, h-1 );     glVertex2i( 1, h-1 );
  glEnd();
}


/**************************************** GLUI_Button::draw_text() **********/

void     GLUI_Button::draw_text( int sunken )
{
  int string_width;

  glColor3ub( glui->bkgd_color.r, glui->bkgd_color.g, glui->bkgd_color.b );
  glDisable( GL_CULL_FACE );
  glBegin( GL_QUADS );
  glVertex2i( 2, 2 );         glVertex2i( w-2, 2 );
  glVertex2i( w-2, h-2 );     glVertex2i( 2, h-2 );
  glEnd();

  glColor3ub( 0,0,0 );
  
  string_width = _glutBitmapWidthString( glui->font,
					 this->name.c_str() );
  if ( NOT sunken ) {
    draw_name( MAX((w-string_width),0)/2, 13);
  }
  else {
    draw_name( MAX((w-string_width),0)/2 + 1, 13 + 1);
  }

  if ( active ) {
    glEnable( GL_LINE_STIPPLE );
    glLineStipple( 1, 0x5555 );
    
    glColor3f( 0., 0., 0. );
    
    glBegin( GL_LINE_LOOP );
    glVertex2i( 3, 3 );         glVertex2i( w-3, 3 );
    glVertex2i( w-3, h-3 );     glVertex2i( 3, h-3 );
    glEnd();
    
    glDisable( GL_LINE_STIPPLE );
  }
}


/************************************** GLUI_Button::update_size() **********/

void   GLUI_Button::update_size( void )
{
  int text_size;

  if ( NOT glui )
    return;

  text_size = string_width( name );

  if ( w < text_size + 16 )
    w = text_size + 16 ;
}
