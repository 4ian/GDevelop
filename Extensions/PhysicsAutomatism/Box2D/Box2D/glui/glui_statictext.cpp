/****************************************************************************
  
  GLUI User Interface Toolkit
  ---------------------------

     glui_statictext.cpp - GLUI_StaticText Control


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

/****************************** GLUI_StaticText::GLUI_StaticText() **********/
GLUI_StaticText::GLUI_StaticText( GLUI_Node *parent, const char *name )
{
  common_init();
  set_name( name );
  parent->add_control( this );
}

/****************************** GLUI_StaticText::draw() **********/

void    GLUI_StaticText::draw( int x, int y )
{
  GLUI_DRAWINGSENTINAL_IDIOM

  draw_text();
}


/****************************** GLUI_StaticText::set_text() **********/

void    GLUI_StaticText::set_text( const char *text )
{
  set_name( text );
  redraw();
}


/************************************ GLUI_StaticText::update_size() **********/

void   GLUI_StaticText::update_size( void )
{
  int text_size;

  if ( NOT glui )
    return;

  text_size = string_width( name );

  if ( w < text_size )
    w = text_size;    
}


/****************************** GLUI_StaticText::draw_text() **********/

void    GLUI_StaticText::draw_text( void )
{
  if ( NOT can_draw() )
    return;

  erase_text();
  draw_name( 0, 9 );
}


/****************************** GLUI_StaticText::erase_text() **********/

void    GLUI_StaticText::erase_text( void )
{
  if ( NOT can_draw() )
    return;

  set_to_bkgd_color();
  glDisable( GL_CULL_FACE );
  glBegin( GL_TRIANGLES );
  glVertex2i( 0,0 );   glVertex2i( w, 0 );  glVertex2i( w, h );  
  glVertex2i( 0, 0 );  glVertex2i( w, h );  glVertex2i( 0, h );   
  glEnd();
}



