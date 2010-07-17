/**********************************************************************

  arcball.cpp


          --------------------------------------------------

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

**********************************************************************/

#include "arcball.h"

#include <cstdio>


/**************************************** Arcball::Arcball() ****/
/* Default (void) constructor for Arcball                         */

Arcball::Arcball() 
{
    rot_ptr = &rot;
    init();
}

/**************************************** Arcball::Arcball() ****/
/* Takes as argument a mat4 to use instead of the internal rot  */

Arcball::Arcball(mat4 *mtx) 
{
    rot_ptr = mtx;
}


/**************************************** Arcball::Arcball() ****/
/* A constructor that accepts the screen center and arcball radius*/

Arcball::Arcball(const vec2 &_center, float _radius)
{
    rot_ptr = &rot;
    init();
    set_params(_center, _radius);
}


/************************************** Arcball::set_params() ****/

void Arcball::set_params(const vec2 &_center, float _radius)
{
    center      = _center;
    radius      = _radius;
}

/*************************************** Arcball::init() **********/

void Arcball::init()
{
    center.set( 0.0, 0.0 );
    radius         = 1.0;
    q_now          = quat_identity();
    *rot_ptr       = identity3D();
    q_increment    = quat_identity();
    rot_increment  = identity3D();
    is_mouse_down  = false;
    is_spinning    = false;
    damp_factor    = 0.0;
    zero_increment = true;
}

/*********************************** Arcball::mouse_to_sphere() ****/

vec3 Arcball::mouse_to_sphere(const vec2 &p)
{
    float mag;
    vec2  v2 = (p - center) / radius;
    vec3  v3( v2[0], v2[1], 0.0 );

    mag = v2*v2;

    if ( mag > 1.0 ) 
        v3.normalize();
    else 
        v3[VZ] = (float) sqrt( 1.0 - mag );

    /* Now we add constraints - X takes precedence over Y */
    if ( constraint_x ) 
    {
        v3 = constrain_vector( v3, vec3( 1.0, 0.0, 0.0 ));
    } 
    else if ( constraint_y ) 
        {
            v3 = constrain_vector( v3, vec3( 0.0, 1.0, 0.0 ));
        }

    return v3;
}


/************************************ Arcball::constrain_vector() ****/

vec3 Arcball::constrain_vector(const vec3 &vector, const vec3 &axis)
{
    return (vector-(vector*axis)*axis).normalize();
}

/************************************ Arcball::mouse_down() **********/

void Arcball::mouse_down(int x, int y)
{
    down_pt.set( (float)x, (float) y );
    is_mouse_down = true;

    q_increment   = quat_identity();
    rot_increment = identity3D();
    zero_increment = true;
}


/************************************ Arcball::mouse_up() **********/

void Arcball::mouse_up()
{
    q_now = q_drag * q_now;
    is_mouse_down = false;
}


/********************************** Arcball::mouse_motion() **********/

void Arcball::mouse_motion(int x, int y, int shift, int ctrl, int alt)
{
    /* Set the X constraint if CONTROL key is pressed, Y if ALT key */
    set_constraints( ctrl != 0, alt != 0 );

    vec2 new_pt( (float)x, (float) y );
    vec3 v0 = mouse_to_sphere( down_pt );
    vec3 v1 = mouse_to_sphere( new_pt );

    vec3 cross = v0^v1;

    q_drag.set( cross, v0 * v1 );

    //    *rot_ptr = (q_drag * q_now).to_mat4();
    mat4 temp = q_drag.to_mat4();
    *rot_ptr = *rot_ptr * temp;

    down_pt = new_pt;

    /* We keep a copy of the current incremental rotation (= q_drag) */
    q_increment   = q_drag;
    rot_increment = q_increment.to_mat4();

    set_constraints(false, false);

    if ( q_increment.s < .999999 ) 
    {
        is_spinning = true;
        zero_increment = false;
    }
    else 
    {
        is_spinning = false;
        zero_increment = true;
    }
}


/********************************** Arcball::mouse_motion() **********/

void Arcball::mouse_motion(int x, int y)
{
    mouse_motion(x, y, 0, 0, 0);
}


/***************************** Arcball::set_constraints() **********/

void Arcball::set_constraints(bool _constraint_x, bool _constraint_y)
{
    constraint_x = _constraint_x;
    constraint_y = _constraint_y;
}

/***************************** Arcball::idle() *********************/

void Arcball::idle()
{
    if (is_mouse_down) 
    {
        is_spinning = false;
        zero_increment = true;
    }

    if (damp_factor < 1.0f) 
        q_increment.scale_angle(1.0f - damp_factor);

    rot_increment = q_increment.to_mat4();

    if (q_increment.s >= .999999f) 
    {
        is_spinning = false;
        zero_increment = true;
    }
}


/************************ Arcball::set_damping() *********************/

void Arcball::set_damping(float d)
{
    damp_factor = d;
}





