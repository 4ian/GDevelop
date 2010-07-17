
/****************************************************************************
  
  GLUI User Interface Toolkit (LGPL)
  ---------------------------

     glui_checkbox - GLUI_Checkbox control class


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

/****************************** GLUI_Checkbox::GLUI_Checkbox() **********/

GLUI_Checkbox::GLUI_Checkbox( GLUI_Node *parent,
                              const char *name, int *value_ptr,
                              int id, 
                              GLUI_CB cb )
{
  common_init();

  set_ptr_val( value_ptr );
  set_name( name );
  user_id    = id;
  callback   = cb;

  parent->add_control( this );

  init_live();
}

/****************************** GLUI_Checkbox::mouse_down_handler() **********/

int    GLUI_Checkbox::mouse_down_handler( int local_x, int local_y )
{
  orig_value = int_val;
  int_val = !int_val;

  currently_inside = true;
  redraw();

  return false;
}


/****************************** GLUI_Checkbox::mouse_up_handler() **********/

int    GLUI_Checkbox::mouse_up_handler( int local_x, int local_y, bool inside )
{
  if ( NOT inside ) { /* undo effect on value */
    int_val = orig_value;    
  }
  else {
    set_int_val( int_val );

    /*** Invoke the callback ***/
    execute_callback();
  }

  return false;
}


/****************************** GLUI_Checkbox::mouse_held_down_handler() ******/

int    GLUI_Checkbox::mouse_held_down_handler( int local_x, int local_y,
					       bool inside)
{
  /********** Toggle checked and unchecked bitmap if we're entering or
    leaving the checkbox area **********/
  if ( inside != currently_inside ) {
     int_val = !int_val;
     currently_inside = inside;
     redraw();
  }
  
  return false;
}


/****************************** GLUI_Checkbox::key_handler() **********/

int    GLUI_Checkbox::key_handler( unsigned char key,int modifiers )
{
  return false;
}


/****************************** GLUI_Checkbox::draw() **********/

void    GLUI_Checkbox::draw( int x, int y )
{
  GLUI_DRAWINGSENTINAL_IDIOM

  if ( int_val != 0 ) {
    if ( enabled ) 
      glui->std_bitmaps.draw( GLUI_STDBITMAP_CHECKBOX_ON, 0, 0 );
    else
      glui->std_bitmaps.draw( GLUI_STDBITMAP_CHECKBOX_ON_DIS, 0, 0 );
  }
  else {
    if ( enabled )
      glui->std_bitmaps.draw( GLUI_STDBITMAP_CHECKBOX_OFF, 0, 0 );
    else
      glui->std_bitmaps.draw( GLUI_STDBITMAP_CHECKBOX_OFF_DIS, 0, 0 );      
  }

  draw_active_area();

  draw_name( text_x_offset, 10);
}

/**************************** GLUI_Checkbox::draw_active_area() **************/

void    GLUI_Checkbox::draw_active_area( void )
{
  GLUI_DRAWINGSENTINAL_IDIOM
  int text_width, left, right;

  text_width = _glutBitmapWidthString( glui->font, name.c_str() );
  left       = text_x_offset-3;
  right      = left + 7 + text_width;

  if ( active ) {
    glEnable( GL_LINE_STIPPLE );
    glLineStipple( 1, 0x5555 );
    glColor3f( 0., 0., 0. );
  } else {
    glColor3ub( glui->bkgd_color.r, glui->bkgd_color.g, glui->bkgd_color.b );
  }

  glBegin( GL_LINE_LOOP );
  glVertex2i(left,0);     glVertex2i( right,0);
  glVertex2i(right,h+1);   glVertex2i( left,h+1);
  glEnd();
  
  glDisable( GL_LINE_STIPPLE );
}


/************************************ GLUI_Checkbox::update_size() **********/

void   GLUI_Checkbox::update_size( void )
{
  int text_size;

  if ( NOT glui )
    return;

  text_size = _glutBitmapWidthString( glui->font, name.c_str() );

  /*  if ( w < text_x_offset + text_size + 6 )              */
  w = text_x_offset + text_size + 6 ;
}


/********************************* GLUI_Checkbox::set_int_val() **************/

void    GLUI_Checkbox::set_int_val( int new_val )
{
  int_val = new_val;

  /*** Update the variable we're (possibly) pointing to ***/
  output_live(true);
  redraw();
}
