/****************************************************************************
  
  GLUI User Interface Toolkit
  ---------------------------

     glui_separator.cpp - GLUI_Separator control class


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

/****************************** GLUI_Separator::GLUI_Separator() **********/

GLUI_Separator::GLUI_Separator( GLUI_Node *parent )
{
  common_init();
  parent->add_control( this );
}

/****************************** GLUI_Separator::draw() **********/

void    GLUI_Separator::draw( int x, int y )
{
  GLUI_DRAWINGSENTINAL_IDIOM
  
  int width, indent;
  int           cont_x, cont_y, cont_w, cont_h, cont_x_off, cont_y_off;

  if ( parent() != NULL ) {
    get_this_column_dims(&cont_x, &cont_y, &cont_w, &cont_h, 
			 &cont_x_off, &cont_y_off);

    width = cont_w - cont_x_off*2;
  }
  else {
    width = this->w;
  }

  indent = (int) floor(width * .05);

  glLineWidth( 1.0 );
  glBegin( GL_LINES );
  glColor3f( .5, .5, .5 );
  glVertex2i( indent,       GLUI_SEPARATOR_HEIGHT/2-1 );    
  glVertex2i( width-indent, GLUI_SEPARATOR_HEIGHT/2-1 );    

  glColor3f( 1., 1., 1. );
  glVertex2i( indent,       GLUI_SEPARATOR_HEIGHT/2 );    
  glVertex2i( width-indent, GLUI_SEPARATOR_HEIGHT/2 );    
  glEnd();
}


