/****************************************************************************
  GLUI User Interface Toolkit
  ---------------------------

     glui_column.cpp - GLUI_Column control class


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

/******************************** GLUI_Column::GLUI_Column() ************/

GLUI_Column::GLUI_Column( GLUI_Node *parent, int draw_bar )
{
  common_init();
  int_val = draw_bar; /* Whether to draw vertical bar or not */

  parent->add_control( this );
}

/**************************************** GLUI_Column::draw() ************/

void  GLUI_Column::draw( int x, int y )
{
  int   panel_x, panel_y, panel_w, panel_h, panel_x_off, panel_y_off;
  int   y_diff;

  if ( int_val == 1 ) {  /* Draw a vertical bar */
    GLUI_DRAWINGSENTINAL_IDIOM
    if ( parent() != NULL ) {
      get_this_column_dims(&panel_x, &panel_y, &panel_w, &panel_h, 
			   &panel_x_off, &panel_y_off);

      y_diff = y_abs - panel_y;

      if ( 0 ) {
	glLineWidth(1.0);
	glBegin( GL_LINES );
	glColor3f( .5, .5, .5 );
	glVertex2i( -GLUI_XOFF+1, -y_diff + GLUI_SEPARATOR_HEIGHT/2 );
	glVertex2i( -GLUI_XOFF+1, -y_diff + panel_h - GLUI_SEPARATOR_HEIGHT/2);

	glColor3f( 1.0, 1.0, 1.0 );
	glVertex2i( -GLUI_XOFF+2, -y_diff + GLUI_SEPARATOR_HEIGHT/2 );
	glVertex2i( -GLUI_XOFF+2, -y_diff + panel_h - GLUI_SEPARATOR_HEIGHT/2);
	glEnd();
      }
      else {
	glLineWidth(1.0);
	glBegin( GL_LINES );
	glColor3f( .5, .5, .5 );
	glVertex2i( -2, 0 );
	glVertex2i( -2, h );
	/*glVertex2i( 0, -y_diff + GLUI_SEPARATOR_HEIGHT/2 );              */
	/*glVertex2i( 0, -y_diff + panel_h - GLUI_SEPARATOR_HEIGHT/2);              */

	glColor3f( 1.0, 1.0, 1.0 );
	glVertex2i( -1, 0 );
	glVertex2i( -1, h );
	/*glVertex2i( 1, -y_diff + GLUI_SEPARATOR_HEIGHT/2 );              */
	/*glVertex2i( 1, -y_diff + panel_h - GLUI_SEPARATOR_HEIGHT/2);              */
	glEnd();
      }		
    } 
  }
}

