/*

  glui_window.cpp - GLUI_Button control class

  GLUI User Interface Toolkit (LGPL)
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

*/

#include "GL/glui.h"
#include "glui_internal.h"

GLUI_Glut_Window::GLUI_Glut_Window()
:   GLUI_Node(),

	glut_window_id(0),
	glut_keyboard_CB(NULL),
	glut_special_CB(NULL),
	glut_reshape_CB(NULL),
	glut_passive_motion_CB(NULL),
	glut_mouse_CB(NULL),
	glut_visibility_CB(NULL),
	glut_motion_CB(NULL),
	glut_display_CB(NULL),
	glut_entry_CB(NULL)
{
}
