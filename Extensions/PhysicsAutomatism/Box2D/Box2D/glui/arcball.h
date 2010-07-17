/**********************************************************************

  arcball.h

  GLUI User Interface Toolkit (LGPL)
  Copyright (c) 1998 Paul Rademacher
     Feb 1998, Paul Rademacher (rademach@cs.unc.edu)
     Oct 2003, Nigel Stewart - GLUI Code Cleaning


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

 ---------------------------------------------------------------------

  A C++ class that implements the Arcball, as described by Ken
  Shoemake in Graphics Gems IV.  
  This class takes as input mouse events (mouse down, mouse drag,
  mouse up), and creates the appropriate quaternions and 4x4 matrices
  to represent the rotation given by the mouse.  
  
  This class is used as follows:
  - initialize [either in the constructor or with set_params()], the
    center position (x,y) of the arcball on the screen, and the radius
  - on mouse down, call mouse_down(x,y) with the mouse position
  - as the mouse is dragged, repeatedly call mouse_motion() with the
    current x and y positions.  One can optionally pass in the current
    state of the SHIFT, ALT, and CONTROL keys (passing zero if keys
    are not pressed, non-zero otherwise), which constrains
    the rotation to certain axes (X for CONTROL, Y for ALT).
  - when the mouse button is released, call mouse_up()

  Axis constraints can also be explicitly set with the 
  set_constraints() function.

  The current rotation is stored in the 4x4 float matrix 'rot'.
  It is also stored in the quaternion 'q_now'.  

**********************************************************************/

#ifndef GLUI_ARCBALL_H
#define GLUI_ARCBALL_H

#include "glui_internal.h"
#include "algebra3.h"
#include "quaternion.h"

class Arcball 
{
public:
    Arcball();
    Arcball(mat4 *mtx);
    Arcball(const vec2 &center, float radius);

    void  set_damping(float d);
    void  idle();
    void  mouse_down(int x, int y);
    void  mouse_up();
    void  mouse_motion(int x, int y, int shift, int ctrl, int alt);
    void  mouse_motion(int x, int y);
    void  set_constraints(bool constrain_x, bool constrain_y);
    void  set_params(const vec2 &center, float radius);  
    void  reset_mouse();
    void  init();

    vec3  constrain_vector(const vec3 &vector, const vec3 &axis);
    vec3  mouse_to_sphere(const vec2 &p);
 
  //public:
    int   is_mouse_down;  /* true for down, false for up */
    int   is_spinning;
    quat  q_now, q_down, q_drag, q_increment;
    vec2  down_pt;
    mat4  rot, rot_increment;
    mat4  *rot_ptr;

    bool  constraint_x, constraint_y;
    vec2  center;
    float radius, damp_factor;
    int   zero_increment;
};

#endif
