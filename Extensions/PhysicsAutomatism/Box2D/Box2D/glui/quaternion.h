/****************************************************************************

  quaternion.h - A quaternion class

  GLUI User Interface Toolkit (LGPL)
  Copyright (c) 1998 Paul Rademacher

  ---------------------------------------------------------------------

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

#ifndef GLUI_QUATERNION_H
#define GLUI_QUATERNION_H

#include "algebra3.h"
#include <cstdio>

/* this line defines a new type: pointer to a function which returns a */
/* float and takes as argument a float */
typedef float (*V_FCT_PTR)(float);

/****************************************************************
 *                    Quaternion                                *
 ****************************************************************/

class quat
{
  /*protected: */
public:

  vec3  v;  /* vector component */
  float s;  /* scalar component */

  /*public: */
  
  /* Constructors */

  quat();
  quat(float x, float y, float z, float w);
  quat(const vec3 &v, float s); 
  quat(float   s, const vec3 &v);
  quat(const float  *d);     /* copy from four-element float array  */
  quat(const double *f);     /* copy from four-element double array */
  quat(const quat   &q);     /* copy from other quat                */

  /* Assignment operators */

  quat  &operator  = (const quat &v);      /* assignment of a quat            */
  quat  &operator += (const quat &v);      /* incrementation by a quat        */
  quat  &operator -= (const quat &v);      /* decrementation by a quat        */
  quat  &operator *= (float d);      /* multiplication by a constant    */
  quat  &operator /= (float d);      /* division by a constant          */
  
  /* special functions */
  
  float  length() const;                   /* length of a quat                */
  float  length2() const;                  /* squared length of a quat        */
  quat  &normalize();                      /* normalize a quat                */
  quat  &apply(V_FCT_PTR fct);             /* apply a func. to each component */
  vec3   xform(const vec3 &v );            /* q*v*q-1                         */
  mat4   to_mat4() const;
  void   set_angle(float f);               /* set rot angle (degrees)         */
  void   scale_angle(float f);             /* scale rot angle (degrees)       */
  float  get_angle() const;                /* set rot angle (degrees)         */
  vec3   get_axis()  const;                /* get axis                        */

  void   print( FILE *file, const char *name ) const;  /* print to a file     */

        float &operator [] (int i);        /* indexing                        */
  const float &operator [] (int i) const;  /* indexing                        */

  void   set(float x, float y, float z);   /* set quat                        */
  void   set(const vec3 &v, float s);      /* set quat                        */

  /* friends */

  friend quat operator - (const quat &v);                   /* -q1            */
  friend quat operator + (const quat &a, const quat &b);    /* q1 + q2        */
  friend quat operator - (const quat &a, const quat &b);    /* q1 - q2        */
  friend quat operator * (const quat &a, float d);          /* q1 * 3.0       */
  friend quat operator * (float d, const quat &a);          /* 3.0 * q1       */
  friend quat operator * (const quat &a, const quat &b);    /* q1 * q2        */
  friend quat operator / (const quat &a, float d);          /* q1 / 3.0       */
  friend int operator == (const quat &a, const quat &b);    /* q1 == q2 ?     */
  friend int operator != (const quat &a, const quat &b);    /* q1 != q2 ?     */
  friend void swap(quat &a, quat &b);                       /* swap q1  &q2   */
  /*friend quat min(const quat &a, const quat &b);          -- min(q1, q2)    */
  /*friend quat max(const quat &a, const quat &b);          -- max(q1, q2)    */
  friend quat prod(const quat &a, const quat &b);          /* term by term mult*/
}; 

/* Utility functions */

quat quat_identity();        /* Returns quaternion identity element */
quat quat_slerp(const quat &from, const quat &to, float t);

#endif
