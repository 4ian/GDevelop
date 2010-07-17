/****************************************************************************
  
  GLUI User Interface Toolkit
  ---------------------------

     glui_radio.cpp - GLUI_RadioGroup and GLUI_RadioButton control classes


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
#include <cassert>

/****************************** GLUI_RadioGroup::GLUI_RadioGroup() **********/

GLUI_RadioGroup::GLUI_RadioGroup(GLUI_Node *parent,
                                 int *value_ptr,
                                 int id, GLUI_CB cb)
{
  common_init();
  GLUI_String      buf;

  set_ptr_val( value_ptr );
  if ( value_ptr ) {
    int_val = *value_ptr;  /** Can't call set_int_val(), b/c that 
                               function will try to call the 
                               callback, etc */
    /** Actually, maybe not **/
    last_live_int = *value_ptr;
  }

  user_id    = id;
  glui_format_str( buf, "RadioGroup: %p", this );
  set_name( buf.c_str() );
  callback   = cb;

  parent->add_control( this );

  init_live();
}


/****************************** GLUI_RadioGroup::draw() **********/

void    GLUI_RadioGroup::draw( int x, int y )
{
  if ( NOT can_draw() )
    return;

  draw_group(false);
}


/********************* GLUI_RadioGroup::draw_group(int translate) **********/

void    GLUI_RadioGroup::draw_group( int translate )
{
  GLUI_DRAWINGSENTINAL_IDIOM
  GLUI_RadioButton *button;
  this->int_val = int_val;

  glMatrixMode(GL_MODELVIEW );

  button = (GLUI_RadioButton*) first_child();
  while( button != NULL ) {
    glPushMatrix();
    if (translate) {
      button->translate_to_origin();
    }
    else {
      glTranslatef(button->x_abs-x_abs,
                   button->y_abs-y_abs,0.0);
    }

    if ( button->int_val ) 
      button->draw_checked();
    else 
      button->draw_unchecked();
    
    glPopMatrix();

    button = (GLUI_RadioButton*) button->next();
  }
}


/****************************** GLUI_RadioGroup::set_name() **********/

void    GLUI_RadioGroup::set_name( const char *text )
{
  name = text;

  if ( glui )
    glui->refresh();
}


/********************************* GLUI_RadioGroup::set_selected() **********/

void    GLUI_RadioGroup::set_selected( int int_val )
{
  GLUI_RadioButton *button;

  this->int_val = int_val;

  button = (GLUI_RadioButton*) first_child();
  while( button != NULL ) {
    if ( int_val == -1 ) {       /*** All buttons in group are deselected ***/
      button->set_int_val(0);
    }
    else if ( int_val == button->user_id ) { /*** This is selected button ***/
      button->set_int_val(1);
    }
    else {                               /*** This is NOT selected button ***/
      button->set_int_val(0);

    }
    button = (GLUI_RadioButton*) button->next();
  }
  redraw();
}


/************************ GLUI_RadioButton::GLUI_RadioButton() **********/

GLUI_RadioButton::GLUI_RadioButton( GLUI_RadioGroup *grp, const char *name )
{
  common_init();

  set_int_val( 0 );

  /** A radio button's user id is always its ordinal number (zero-indexed)
      within the group */
  user_id    = grp->num_buttons;
  set_name( name );
  group = grp;
  
  group->num_buttons++;   /* Increments radiogroup's button count */
  group->add_control( this );

  /*** Now update button states ***/
  group->set_int_val( group->int_val ); /* This tells the group to
                                           reset itself to its
                                           current value, thereby
                                           updating all its buttons */
}


/************************ GLUI_RadioButton::mouse_down_handler() **********/

int    GLUI_RadioButton::mouse_down_handler( int local_x, int local_y )
{
  if ( NOT group )
    return false;

  orig_value = group->int_val;
  
  currently_inside = true;

  group->set_selected( this->user_id );
  redraw();
  
  return false;
}

/********************** GLUI_RadioButton::mouse_held_down_handler() ******/

int    GLUI_RadioButton::mouse_held_down_handler( int local_x, int local_y,
						  bool inside)
{
  if (inside != currently_inside) {
     if (inside) group->set_selected( this->user_id );
     else group->set_selected( orig_value );
     currently_inside = inside;
     redraw();
  }
  
  return false;
}


/*************************** GLUI_RadioButton::mouse_up_handler() **********/

int    GLUI_RadioButton::mouse_up_handler( int local_x, int local_y, 
					   bool inside )
{
  if ( NOT group )
    return false;

  if ( NOT inside ) {
    group->set_selected( orig_value );
    redraw();
  }
  else {
    /** Now we update the radio button group.  We tell the group
      handler to set the currently-selected item to this button, which
      is reference by its user_id/ordinal number within group **/
      
    group->set_selected( this->user_id );
    redraw();

    /*** Now update the linked variable, and call the callback,
      but ONLY if the value of the radio group actually changed ***/
    if ( group->int_val != orig_value ) {
      group->output_live(true); /** Output live and update gfx ***/
      
      group->execute_callback();
    }
  }

  return false;
}

/****************************** GLUI_RadioButton::draw() **********/

void    GLUI_RadioButton::draw( int x, int y )
{
  GLUI_DRAWINGSENTINAL_IDIOM

  if ( NOT group OR NOT can_draw() )
    return;

  /*** See if we're the currently-selected button.  If so, draw ***/
  if ( group->int_val == this->user_id ) {
    if ( enabled )
      glui->std_bitmaps.draw( GLUI_STDBITMAP_RADIOBUTTON_ON, 0, 0 );
    else
      glui->std_bitmaps.draw( GLUI_STDBITMAP_RADIOBUTTON_ON_DIS, 0, 0 );
  }
  else {
    if ( enabled ) 
      glui->std_bitmaps.draw( GLUI_STDBITMAP_RADIOBUTTON_OFF, 0, 0 );
    else
      glui->std_bitmaps.draw( GLUI_STDBITMAP_RADIOBUTTON_OFF_DIS, 0, 0 );
  }

  draw_active_area();

  draw_name( text_x_offset, 10 );
}


/************************************ GLUI_RadioButton::draw_checked() ******/

void   GLUI_RadioButton::draw_checked( void )
{
  GLUI_DRAWINGSENTINAL_IDIOM
  if ( enabled )
    glui->std_bitmaps.draw( GLUI_STDBITMAP_RADIOBUTTON_ON, 0, 0 );
  else
    glui->std_bitmaps.draw( GLUI_STDBITMAP_RADIOBUTTON_ON_DIS, 0, 0 );    
  draw_active_area();
}


/*********************************** GLUI_RadioButton::draw_unchecked() ******/

void   GLUI_RadioButton::draw_unchecked( void )
{
  GLUI_DRAWINGSENTINAL_IDIOM
  
  if ( enabled )
    glui->std_bitmaps.draw( GLUI_STDBITMAP_RADIOBUTTON_OFF, 0, 0 );
  else
    glui->std_bitmaps.draw( GLUI_STDBITMAP_RADIOBUTTON_OFF_DIS, 0, 0 );
  draw_active_area();
}


/**************************************** GLUI_RadioButton::draw_O() ********/

void   GLUI_RadioButton::draw_O( void )
{
  GLUI_DRAWINGSENTINAL_IDIOM
  int i, j;

  glBegin( GL_POINTS );
  for(i=3; i<=GLUI_RADIOBUTTON_SIZE-3; i++ )
    for(j=3; j<=GLUI_RADIOBUTTON_SIZE-3; j++ )
      glVertex2i(i,j);
  glEnd();
}


/******************************** GLUI_RadioButton::update_size() **********/

void   GLUI_RadioButton::update_size( void )
{
  int text_size;

  if ( NOT glui )
    return;

  text_size = _glutBitmapWidthString( glui->font, name.c_str() );

  /*  if ( w < text_x_offset + text_size + 6 )              */
  w = text_x_offset + text_size + 6 ;
}


/************************* GLUI_RadioButton::draw_active_area() **************/

void    GLUI_RadioButton::draw_active_area( void )
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


/********************************* GLUI_RadioGroup::set_int_val() **********/

void    GLUI_RadioGroup::set_int_val( int new_val )
{
  if ( new_val == int_val )
    return;

  set_selected( new_val );
  redraw();  

  output_live(true);
     
}
