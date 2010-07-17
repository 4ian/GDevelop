/*

  algebra3.cpp, algebra3.h -  C++ Vector and Matrix Algebra routines

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

/**************************************************************************
    
  There are three vector classes and two matrix classes: vec2, vec3,
  vec4, mat3, and mat4.

  All the standard arithmetic operations are defined, with '*'
  for dot product of two vectors and multiplication of two matrices,
  and '^' for cross product of two vectors.

  Additional functions include length(), normalize(), homogenize for
  vectors, and print(), set(), apply() for all classes.

  There is a function transpose() for matrices, but note that it 
  does not actually change the matrix, 

  When multiplied with a matrix, a vector is treated as a row vector
  if it precedes the matrix (v*M), and as a column vector if it
  follows the matrix (M*v).

  Matrices are stored in row-major form.

  A vector of one dimension (2d, 3d, or 4d) can be cast to a vector
  of a higher or lower dimension.  If casting to a higher dimension,
  the new component is set by default to 1.0, unless a value is
  specified:
     vec3 a(1.0, 2.0, 3.0 );
     vec4 b( a, 4.0 );       // now b == {1.0, 2.0, 3.0, 4.0};
  When casting to a lower dimension, the vector is homogenized in
  the lower dimension.  E.g., if a 4d {X,Y,Z,W} is cast to 3d, the
  resulting vector is {X/W, Y/W, Z/W}.  It is up to the user to 
  insure the fourth component is not zero before casting.

  There are also the following function for building matrices:
     identity2D(), translation2D(), rotation2D(),
     scaling2D(),  identity3D(),    translation3D(),
     rotation3D(), rotation3Drad(),  scaling3D(),
     perspective3D()

 
  ---------------------------------------------------------------------
  
  Author: Jean-Francois DOUEg                   
  Revised: Paul Rademacher                                      
  Version 3.2 - Feb 1998
  Revised: Nigel Stewart (GLUI Code Cleaning)
                                
**************************************************************************/

#include "algebra3.h"
#include "glui_internal.h"
#include <cmath>

#ifdef VEC_ERROR_FATAL
#ifndef VEC_ERROR
#define VEC_ERROR(E) { printf( "VERROR %s\n", E ); exit(1); }
#endif
#else
#ifndef VEC_ERROR
#define VEC_ERROR(E) { printf( "VERROR %s\n", E ); }
#endif
#endif

/****************************************************************
 *                                                              *
 *          vec2 Member functions                               *
 *                                                              *
 ****************************************************************/

/******************** vec2 CONSTRUCTORS ********************/

vec2::vec2() 
{
    n[VX] = n[VY] = 0.0; 
}

vec2::vec2(float x, float y)
{ 
    n[VX] = x; 
    n[VY] = y; 
}

vec2::vec2(const vec2 &v)
{ 
    n[VX] = v.n[VX]; 
    n[VY] = v.n[VY]; 
}

vec2::vec2(const vec3 &v) // it is up to caller to avoid divide-by-zero
{ 
    n[VX] = v.n[VX]/v.n[VZ]; 
    n[VY] = v.n[VY]/v.n[VZ]; 
}

vec2::vec2(const vec3 &v, int dropAxis) 
{
    switch (dropAxis) 
    {
        case VX: n[VX] = v.n[VY]; n[VY] = v.n[VZ]; break;
        case VY: n[VX] = v.n[VX]; n[VY] = v.n[VZ]; break;
        default: n[VX] = v.n[VX]; n[VY] = v.n[VY]; break;
    }
}

/******************** vec2 ASSIGNMENT OPERATORS ******************/

vec2 & vec2::operator=(const vec2 &v)
{ 
    n[VX] = v.n[VX]; 
    n[VY] = v.n[VY]; 
    return *this; 
}

vec2 & vec2::operator+=(const vec2 &v)
{ 
    n[VX] += v.n[VX]; 
    n[VY] += v.n[VY]; 
    return *this; 
}

vec2 & vec2::operator-=(const vec2 &v)
{ 
    n[VX] -= v.n[VX]; 
    n[VY] -= v.n[VY]; 
    return *this; 
}

vec2 &vec2::operator*=(float d)
{ 
    n[VX] *= d; 
    n[VY] *= d; 
    return *this; 
}

vec2 &vec2::operator/=(float d)
{ 
    float d_inv = 1.0f/d; 
    n[VX] *= d_inv; 
    n[VY] *= d_inv; 
    return *this; 
}

float &vec2::operator[](int i) 
{
    if (i < VX || i > VY)
      //VEC_ERROR("vec2 [] operator: illegal access; index = " << i << '\n')
      VEC_ERROR("vec2 [] operator: illegal access" );
    return n[i];
}

const float &vec2::operator[](int i) const
{
    if (i < VX || i > VY)
      //VEC_ERROR("vec2 [] operator: illegal access; index = " << i << '\n')
      VEC_ERROR("vec2 [] operator: illegal access" );

    return n[i];
}

/******************** vec2 SPECIAL FUNCTIONS ********************/

float vec2::length() const 
{ 
    return (float) sqrt(length2()); 
}

float vec2::length2() const 
{ 
    return n[VX]*n[VX] + n[VY]*n[VY]; 
}

vec2 &vec2::normalize() // it is up to caller to avoid divide-by-zero
{ 
    *this /= length(); 
    return *this; 
}

vec2 &vec2::apply(V_FCT_PTR fct)
{ 
    n[VX] = (*fct)(n[VX]); 
    n[VY] = (*fct)(n[VY]); 
    return *this; 
}

void vec2::set( float x, float y )
{
  n[VX] = x;   n[VY] = y; 
}

/******************** vec2 FRIENDS *****************************/

vec2 operator-(const vec2 &a)
{ 
    return vec2(-a.n[VX],-a.n[VY]); 
}

vec2 operator+(const vec2 &a, const vec2& b)
{ 
    return vec2(a.n[VX]+b.n[VX], a.n[VY]+b.n[VY]); 
}

vec2 operator-(const vec2 &a, const vec2& b)
{ 
    return vec2(a.n[VX]-b.n[VX], a.n[VY]-b.n[VY]); 
}

vec2 operator*(const vec2 &a, float d)
{ 
    return vec2(d*a.n[VX], d*a.n[VY]); 
}

vec2 operator*(float d, const vec2 &a)
{ 
    return a*d; 
}

vec2 operator*(const mat3 &a, const vec2 &v) 
{
  vec3 av;

  av.n[VX] = a.v[0].n[VX]*v.n[VX] + a.v[0].n[VY]*v.n[VY] + a.v[0].n[VZ];
  av.n[VY] = a.v[1].n[VX]*v.n[VX] + a.v[1].n[VY]*v.n[VY] + a.v[1].n[VZ];
  av.n[VZ] = a.v[2].n[VX]*v.n[VX] + a.v[2].n[VY]*v.n[VY] + a.v[2].n[VZ];

  return av;
}

vec2 operator*(const vec2 &v, const mat3 &a)
{ 
    return a.transpose() * v; 
}

vec3 operator*(const mat3 &a, const vec3 &v) 
{
    vec3 av;

    av.n[VX] = a.v[0].n[VX]*v.n[VX] + a.v[0].n[VY]*v.n[VY] + a.v[0].n[VZ]*v.n[VZ];
    av.n[VY] = a.v[1].n[VX]*v.n[VX] + a.v[1].n[VY]*v.n[VY] + a.v[1].n[VZ]*v.n[VZ];
    av.n[VZ] = a.v[2].n[VX]*v.n[VX] + a.v[2].n[VY]*v.n[VY] + a.v[2].n[VZ]*v.n[VZ];

    return av;
}

vec3 operator*(const vec3 &v, const mat3 &a) 
{ 
    return a.transpose() * v; 
}

float operator*(const vec2 &a, const vec2 &b)
{ 
    return a.n[VX]*b.n[VX] + a.n[VY]*b.n[VY]; 
}

vec2 operator/(const vec2 &a, float d)
{ 
    float d_inv = 1.0f/d; 
    return vec2(a.n[VX]*d_inv, a.n[VY]*d_inv); 
}

vec3 operator^(const vec2 &a, const vec2 &b)
{ 
    return vec3(0.0, 0.0, a.n[VX] * b.n[VY] - b.n[VX] * a.n[VY]); 
}

int operator==(const vec2 &a, const vec2 &b)
{ 
    return (a.n[VX] == b.n[VX]) && (a.n[VY] == b.n[VY]); 
}

int operator!=(const vec2 &a, const vec2 &b)
{ 
    return !(a == b); 
}

/*ostream& operator << (ostream& s, vec2& v)
{ return s << "| " << v.n[VX] << ' ' << v.n[VY] << " |"; }
*/

/*istream& operator >> (istream& s, vec2& v) {
    vec2    v_tmp;
    char    c = ' ';

    while (isspace(c))
    s >> c;
    // The vectors can be formatted either as x y or | x y |
    if (c == '|') {
    s >> v_tmp[VX] >> v_tmp[VY];
    while (s >> c && isspace(c)) ;
    if (c != '|')
        ;//s.set(_bad);
    }
    else {
    s.putback(c);
    s >> v_tmp[VX] >> v_tmp[VY];
    }
    if (s)
    v = v_tmp;
    return s;
}
*/

void swap(vec2 &a, vec2 &b)
{ 
    vec2 tmp(a);
    a = b; 
    b = tmp; 
}

vec2 min_vec(const vec2 &a, const vec2 &b)
{ 
    return vec2(MIN(a.n[VX], b.n[VX]), MIN(a.n[VY], b.n[VY])); 
}

vec2 max_vec(const vec2 &a, const vec2 &b)
{ 
    return vec2(MAX(a.n[VX], b.n[VX]), MAX(a.n[VY], b.n[VY])); 
}

vec2 prod(const vec2 &a, const vec2 &b)
{ 
    return vec2(a.n[VX] * b.n[VX], a.n[VY] * b.n[VY]); 
}

/****************************************************************
 *                                                              *
 *          vec3 Member functions                               *
 *                                                              *
 ****************************************************************/

// CONSTRUCTORS

vec3::vec3() 
{
    n[VX] = n[VY] = n[VZ] = 0.0;
}

vec3::vec3(float x, float y, float z)
{ 
    n[VX] = x; 
    n[VY] = y; 
    n[VZ] = z; 
}

vec3::vec3(const vec3 &v)
{ 
    n[VX] = v.n[VX]; n[VY] = v.n[VY]; n[VZ] = v.n[VZ]; 
}

vec3::vec3(const vec2 &v)
{ 
    n[VX] = v.n[VX]; 
    n[VY] = v.n[VY]; 
    n[VZ] = 1.0; 
}

vec3::vec3(const vec2 &v, float d)
{ 
    n[VX] = v.n[VX]; 
    n[VY] = v.n[VY]; 
    n[VZ] = d; 
}

vec3::vec3(const vec4 &v) // it is up to caller to avoid divide-by-zero
{ 
    n[VX] = v.n[VX] / v.n[VW]; 
    n[VY] = v.n[VY] / v.n[VW];
    n[VZ] = v.n[VZ] / v.n[VW]; 
}

vec3::vec3(const vec4 &v, int dropAxis) 
{
    switch (dropAxis) 
    {
        case VX: n[VX] = v.n[VY]; n[VY] = v.n[VZ]; n[VZ] = v.n[VW]; break;
        case VY: n[VX] = v.n[VX]; n[VY] = v.n[VZ]; n[VZ] = v.n[VW]; break;
        case VZ: n[VX] = v.n[VX]; n[VY] = v.n[VY]; n[VZ] = v.n[VW]; break;
        default: n[VX] = v.n[VX]; n[VY] = v.n[VY]; n[VZ] = v.n[VZ]; break;
    }
}


// ASSIGNMENT OPERATORS

vec3 &vec3::operator=(const vec3 &v)
{ 
    n[VX] = v.n[VX]; 
    n[VY] = v.n[VY]; 
    n[VZ] = v.n[VZ]; 
    return *this; 
}

vec3 &vec3::operator+=(const vec3 &v)
{ 
    n[VX] += v.n[VX]; 
    n[VY] += v.n[VY]; 
    n[VZ] += v.n[VZ]; 
    return *this; 
}

vec3 &vec3::operator-=(const vec3& v)
{ 
    n[VX] -= v.n[VX]; 
    n[VY] -= v.n[VY]; 
    n[VZ] -= v.n[VZ];
    return *this; 
}

vec3 &vec3::operator*=(float d)
{ 
    n[VX] *= d; 
    n[VY] *= d; 
    n[VZ] *= d; 
    return *this; 
}

vec3 &vec3::operator/=(float d)
{ 
    float d_inv = 1.0f/d; 
    n[VX] *= d_inv; 
    n[VY] *= d_inv; 
    n[VZ] *= d_inv;
    return *this; 
}

float &vec3::operator[](int i) 
{
    if (i < VX || i > VZ)
        //VEC_ERROR("vec3 [] operator: illegal access; index = " << i << '\n')
        VEC_ERROR("vec3 [] operator: illegal access" );

    return n[i];
}

const float &vec3::operator[](int i) const
{
    if (i < VX || i > VZ)
        //VEC_ERROR("vec3 [] operator: illegal access; index = " << i << '\n')
        VEC_ERROR("vec3 [] operator: illegal access" );

    return n[i];
}

// SPECIAL FUNCTIONS

float vec3::length() const
{  
    return (float) sqrt(length2()); 
}

float vec3::length2() const
{  
    return n[VX]*n[VX] + n[VY]*n[VY] + n[VZ]*n[VZ]; 
}

vec3 &vec3::normalize() // it is up to caller to avoid divide-by-zero
{ 
    *this /= length(); 
    return *this; 
}

vec3 &vec3::homogenize(void) // it is up to caller to avoid divide-by-zero
{ 
    n[VX] /= n[VZ];  
    n[VY] /= n[VZ];  
    n[VZ] = 1.0; 
    return *this; 
}

vec3 &vec3::apply(V_FCT_PTR fct)
{ 
    n[VX] = (*fct)(n[VX]); 
    n[VY] = (*fct)(n[VY]); 
    n[VZ] = (*fct)(n[VZ]);
    return *this; 
}

void vec3::set(float x, float y, float z)   // set vector
{ 
    n[VX] = x; 
    n[VY] = y; 
    n[VZ] = z;  
}

void vec3::print(FILE *file, const char *name) const  // print vector to a file
{
    fprintf( file, "%s: <%f, %f, %f>\n", name, n[VX], n[VY], n[VZ] );
}

// FRIENDS

vec3 operator-(const vec3 &a)
{  
    return vec3(-a.n[VX],-a.n[VY],-a.n[VZ]); 
}

vec3 operator+(const vec3 &a, const vec3 &b)
{ 
    return vec3(a.n[VX]+ b.n[VX], a.n[VY] + b.n[VY], a.n[VZ] + b.n[VZ]); 
}

vec3 operator-(const vec3 &a, const vec3 &b)
{ 
    return vec3(a.n[VX]-b.n[VX], a.n[VY]-b.n[VY], a.n[VZ]-b.n[VZ]); 
}

vec3 operator*(const vec3 &a, float d)
{ 
    return vec3(d*a.n[VX], d*a.n[VY], d*a.n[VZ]); 
}

vec3 operator*(float d, const vec3 &a)
{ 
    return a*d; 
}

vec3 operator*(const mat4 &a, const vec3 &v)
{ 
    return a*vec4(v); 
}

vec3 operator*(const vec3 &v, mat4 &a)
{ 
    return a.transpose()*v; 
}

float operator*(const vec3 &a, const vec3 &b)
{ 
    return a.n[VX]*b.n[VX] + a.n[VY]*b.n[VY] + a.n[VZ]*b.n[VZ]; 
}

vec3 operator/(const vec3 &a, float d)
{ 
    float d_inv = 1.0f/d; 
    return vec3(a.n[VX]*d_inv, a.n[VY]*d_inv, a.n[VZ]*d_inv); 
}

vec3 operator^(const vec3 &a, const vec3 &b) 
{
    return 
        vec3(a.n[VY]*b.n[VZ] - a.n[VZ]*b.n[VY],
             a.n[VZ]*b.n[VX] - a.n[VX]*b.n[VZ],
             a.n[VX]*b.n[VY] - a.n[VY]*b.n[VX]);
}

int operator==(const vec3 &a, const vec3 &b)
{ 
    return (a.n[VX] == b.n[VX]) && (a.n[VY] == b.n[VY]) && (a.n[VZ] == b.n[VZ]);
}

int operator!=(const vec3 &a, const vec3 &b)
{ 
    return !(a == b); 
}

/*ostream& operator << (ostream& s, vec3& v)
{ return s << "| " << v.n[VX] << ' ' << v.n[VY] << ' ' << v.n[VZ] << " |"; }

istream& operator >> (istream& s, vec3& v) {
    vec3    v_tmp;
    char    c = ' ';

    while (isspace(c))
    s >> c;
    // The vectors can be formatted either as x y z or | x y z |
    if (c == '|') {
    s >> v_tmp[VX] >> v_tmp[VY] >> v_tmp[VZ];
    while (s >> c && isspace(c)) ;
    if (c != '|')
        ;//s.set(_bad);
    }
    else {
    s.putback(c);
    s >> v_tmp[VX] >> v_tmp[VY] >> v_tmp[VZ];
    }
    if (s)
    v = v_tmp;
    return s;
}
*/

void swap(vec3 &a, vec3 &b)
{ 
    vec3 tmp(a); 
    a = b; 
    b = tmp; 
}

vec3 min_vec(const vec3 &a, const vec3 &b)
{ 
    return vec3(
        MIN(a.n[VX], b.n[VX]), 
        MIN(a.n[VY], b.n[VY]), 
        MIN(a.n[VZ], b.n[VZ])); 
}

vec3 max_vec(const vec3 &a, const vec3 &b)
{ 
    return vec3(
        MAX(a.n[VX], b.n[VX]), 
        MAX(a.n[VY], b.n[VY]), 
        MAX(a.n[VZ], b.n[VZ])); 
}

vec3 prod(const vec3 &a, const vec3 &b)
{ 
    return vec3(a.n[VX]*b.n[VX], a.n[VY]*b.n[VY], a.n[VZ]*b.n[VZ]); 
}

/****************************************************************
 *                                                              *
 *          vec4 Member functions                               *
 *                                                              *
 ****************************************************************/

// CONSTRUCTORS

vec4::vec4() 
{
    n[VX] = n[VY] = n[VZ] = 0.0; 
    n[VW] = 1.0; 
}

vec4::vec4(float x, float y, float z, float w)
{ 
    n[VX] = x; 
    n[VY] = y; 
    n[VZ] = z; 
    n[VW] = w; 
}

vec4::vec4(const vec4 &v)
{ 
    n[VX] = v.n[VX]; 
    n[VY] = v.n[VY]; 
    n[VZ] = v.n[VZ]; 
    n[VW] = v.n[VW]; 
}

vec4::vec4(const vec3 &v)
{ 
    n[VX] = v.n[VX]; 
    n[VY] = v.n[VY]; 
    n[VZ] = v.n[VZ]; 
    n[VW] = 1.0; 
}

vec4::vec4(const vec3 &v, float d)
{ 
    n[VX] = v.n[VX]; 
    n[VY] = v.n[VY]; 
    n[VZ] = v.n[VZ];  
    n[VW] = d; 
}

// ASSIGNMENT OPERATORS

vec4 &vec4::operator=(const vec4 &v)
{ 
    n[VX] = v.n[VX]; 
    n[VY] = v.n[VY]; 
    n[VZ] = v.n[VZ]; 
    n[VW] = v.n[VW];
    return *this; 
}

vec4 &vec4::operator+=(const vec4 &v)
{ 
    n[VX] += v.n[VX]; 
    n[VY] += v.n[VY]; 
    n[VZ] += v.n[VZ]; 
    n[VW] += v.n[VW];
    return *this; 
}

vec4 &vec4::operator-=(const vec4 &v)
{ 
    n[VX] -= v.n[VX]; 
    n[VY] -= v.n[VY]; 
    n[VZ] -= v.n[VZ]; 
    n[VW] -= v.n[VW];
    return *this; 
}

vec4 &vec4::operator*=(float d)
{ 
    n[VX] *= d; 
    n[VY] *= d; 
    n[VZ] *= d; 
    n[VW] *= d; 
    return *this; 
}

vec4 &vec4::operator/=(float d)
{ 
    float d_inv = 1.0f/d; 
    n[VX] *= d_inv; 
    n[VY] *= d_inv; 
    n[VZ] *= d_inv;
    n[VW] *= d_inv; 
    return *this; 
}

float &vec4::operator[](int i) 
{
    if (i < VX || i > VW)
        //VEC_ERROR("vec4 [] operator: illegal access; index = " << i << '\n')
        VEC_ERROR("vec4 [] operator: illegal access" );

    return n[i];
}

const float &vec4::operator[](int i) const
{
    if (i < VX || i > VW)
        //VEC_ERROR("vec4 [] operator: illegal access; index = " << i << '\n')
        VEC_ERROR("vec4 [] operator: illegal access" );

    return n[i];
}

// SPECIAL FUNCTIONS

float vec4::length() const
{ 
    return (float) sqrt(length2()); 
}

float vec4::length2() const
{ 
    return n[VX]*n[VX] + n[VY]*n[VY] + n[VZ]*n[VZ] + n[VW]*n[VW]; 
}

vec4 &vec4::normalize() // it is up to caller to avoid divide-by-zero
{ 
    *this /= length(); 
    return *this; 
}

vec4 &vec4::homogenize() // it is up to caller to avoid divide-by-zero
{ 
    n[VX] /= n[VW];  
    n[VY] /= n[VW];  
    n[VZ] /= n[VW]; 
    n[VW] = 1.0;  
    return *this; 
}

vec4 &vec4::apply(V_FCT_PTR fct)
{ 
    n[VX] = (*fct)(n[VX]); 
    n[VY] = (*fct)(n[VY]); 
    n[VZ] = (*fct)(n[VZ]);
    n[VW] = (*fct)(n[VW]); 
    return *this; 
}

void vec4::print(FILE *file, const char *name) const // print vector to a file
{
    fprintf( file, "%s: <%f, %f, %f, %f>\n", name, n[VX], n[VY], n[VZ], n[VW]);
}

void vec4::set(float x, float y, float z, float a)
{
    n[0] = x; 
    n[1] = y; 
    n[2] = z; 
    n[3] = a;
}


// FRIENDS

vec4 operator-(const vec4 &a)
{ 
    return vec4(-a.n[VX],-a.n[VY],-a.n[VZ],-a.n[VW]);
}

vec4 operator+(const vec4 &a, const vec4 &b)
{ 
    return vec4(
        a.n[VX] + b.n[VX], 
        a.n[VY] + b.n[VY], 
        a.n[VZ] + b.n[VZ],
        a.n[VW] + b.n[VW]); 
}

vec4 operator-(const vec4 &a, const vec4 &b)
{  
    return vec4(
        a.n[VX] - b.n[VX], 
        a.n[VY] - b.n[VY], 
        a.n[VZ] - b.n[VZ],
        a.n[VW] - b.n[VW]); 
}

vec4 operator*(const vec4 &a, float d)
{ 
    return vec4(d*a.n[VX], d*a.n[VY], d*a.n[VZ], d*a.n[VW]); 
}

vec4 operator*(float d, const vec4 &a)
{ 
    return a*d; 
}

vec4 operator*(const mat4 &a, const vec4 &v) 
{
    #define ROWCOL(i) \
        a.v[i].n[0]*v.n[VX] + \
        a.v[i].n[1]*v.n[VY] + \
        a.v[i].n[2]*v.n[VZ] + \
        a.v[i].n[3]*v.n[VW]

    return vec4(ROWCOL(0), ROWCOL(1), ROWCOL(2), ROWCOL(3));

    #undef ROWCOL
}

vec4 operator*(const vec4 &v, const mat4 &a)
{ 
    return a.transpose()*v; 
}

float operator*(const vec4 &a, const vec4 &b)
{ 
    return 
        a.n[VX]*b.n[VX] + 
        a.n[VY]*b.n[VY] + 
        a.n[VZ]*b.n[VZ] +
        a.n[VW]*b.n[VW]; 
}

vec4 operator/(const vec4 &a, float d)
{ 
    float d_inv = 1.0f/d; 
    return vec4(
        a.n[VX]*d_inv, 
        a.n[VY]*d_inv, 
        a.n[VZ]*d_inv,
        a.n[VW]*d_inv); 
}

int operator==(const vec4 &a, const vec4 &b)
{ 
    return 
        (a.n[VX] == b.n[VX]) && 
        (a.n[VY] == b.n[VY]) && 
        (a.n[VZ] == b.n[VZ]) && 
        (a.n[VW] == b.n[VW]); 
}

int operator!=(const vec4 &a, const vec4 &b)
{ 
    return !(a == b); 
}

/*ostream& operator << (ostream& s, vec4& v)
{ return s << "| " << v.n[VX] << ' ' << v.n[VY] << ' ' << v.n[VZ] << ' '
  << v.n[VW] << " |"; }

istream& operator >> (istream& s, vec4& v) {
    vec4    v_tmp;
    char    c = ' ';

    while (isspace(c))
    s >> c;
    // The vectors can be formatted either as x y z w or | x y z w |
    if (c == '|') {
    s >> v_tmp[VX] >> v_tmp[VY] >> v_tmp[VZ] >> v_tmp[VW];
    while (s >> c && isspace(c)) ;
    if (c != '|')
        ;//s.set(_bad);
    }
    else {
    s.putback(c);
    s >> v_tmp[VX] >> v_tmp[VY] >> v_tmp[VZ] >> v_tmp[VW];
    }
    if (s)
    v = v_tmp;
    return s;
}
*/

void swap(vec4 &a, vec4 &b)
{ 
    vec4 tmp(a); 
    a = b; 
    b = tmp; 
}

vec4 min_vec(const vec4 &a, const vec4 &b)
{ 
    return vec4(
        MIN(a.n[VX], b.n[VX]), 
        MIN(a.n[VY], b.n[VY]), 
        MIN(a.n[VZ], b.n[VZ]), 
        MIN(a.n[VW], b.n[VW])); 
}

vec4 max_vec(const vec4 &a, const vec4 &b)
{ 
    return vec4(
        MAX(a.n[VX], b.n[VX]), 
        MAX(a.n[VY], b.n[VY]), 
        MAX(a.n[VZ], b.n[VZ]), 
        MAX(a.n[VW], b.n[VW])); 
}

vec4 prod(const vec4 &a, const vec4 &b)
{ 
    return vec4(
        a.n[VX] * b.n[VX], 
        a.n[VY] * b.n[VY], 
        a.n[VZ] * b.n[VZ],
        a.n[VW] * b.n[VW]); 
}

/****************************************************************
 *                                                              *
 *          mat3 member functions                               *
 *                                                              *
 ****************************************************************/

// CONSTRUCTORS

mat3::mat3() 
{ 
    *this = identity2D(); 
}

mat3::mat3(const vec3 &v0, const vec3 &v1, const vec3 &v2)
{ 
    set(v0, v1, v2); 
}

mat3::mat3(const mat3 &m)
{ 
    v[0] = m.v[0]; 
    v[1] = m.v[1]; 
    v[2] = m.v[2]; 
}

// ASSIGNMENT OPERATORS

mat3 &mat3::operator=(const mat3 &m)
{ 
    v[0] = m.v[0]; 
    v[1] = m.v[1]; 
    v[2] = m.v[2]; 
    return *this; 
}

mat3 &mat3::operator+=(const mat3& m)
{ 
    v[0] += m.v[0]; 
    v[1] += m.v[1]; 
    v[2] += m.v[2]; 
    return *this; 
}

mat3 &mat3::operator-=(const mat3& m)
{ 
    v[0] -= m.v[0]; 
    v[1] -= m.v[1]; 
    v[2] -= m.v[2]; 
    return *this; 
}

mat3 &mat3::operator*=(float d)
{ 
    v[0] *= d; 
    v[1] *= d; 
    v[2] *= d;
    return *this; 
}

mat3 &mat3::operator/=(float d)
{ 
    v[0] /= d; 
    v[1] /= d; 
    v[2] /= d; 
    return *this; 
}

vec3 &mat3::operator[](int i) 
{
    if (i < VX || i > VZ)
      //VEC_ERROR("mat3 [] operator: illegal access; index = " << i << '\n')
      VEC_ERROR("mat3 [] operator: illegal access" );

    return v[i];
}

const vec3 &mat3::operator[](int i) const
{
    if (i < VX || i > VZ)
      //VEC_ERROR("mat3 [] operator: illegal access; index = " << i << '\n')
      VEC_ERROR("mat3 [] operator: illegal access" );

    return v[i];
}

void mat3::set(const vec3 &v0, const vec3 &v1, const vec3 &v2) 
{
    v[0] = v0; 
    v[1] = v1; 
    v[2] = v2; 
}

// SPECIAL FUNCTIONS

mat3 mat3::transpose() const 
{
    return mat3(
        vec3(v[0][0], v[1][0], v[2][0]),
        vec3(v[0][1], v[1][1], v[2][1]),
        vec3(v[0][2], v[1][2], v[2][2]));
}

mat3 mat3::inverse() const       // Gauss-Jordan elimination with partial pivoting
{
    mat3 a(*this);          // As a evolves from original mat into identity
    mat3 b(identity2D());   // b evolves from identity into inverse(a)
    int  i, j, i1;

    // Loop over cols of a from left to right, eliminating above and below diag
    for (j=0; j<3; j++)     // Find largest pivot in column j among rows j..2
    {
        i1 = j;         // Row with largest pivot candidate
        for (i=j+1; i<3; i++)
            if (fabs(a.v[i].n[j]) > fabs(a.v[i1].n[j]))
                i1 = i;

        // Swap rows i1 and j in a and b to put pivot on diagonal
        swap(a.v[i1], a.v[j]);
        swap(b.v[i1], b.v[j]);

        // Scale row j to have a unit diagonal
        if (a.v[j].n[j]==0.)
            VEC_ERROR("mat3::inverse: singular matrix; can't invert\n");

        b.v[j] /= a.v[j].n[j];
        a.v[j] /= a.v[j].n[j];

        // Eliminate off-diagonal elems in col j of a, doing identical ops to b
        for (i=0; i<3; i++)
            if (i!=j) 
            {
                b.v[i] -= a.v[i].n[j]*b.v[j];
                a.v[i] -= a.v[i].n[j]*a.v[j];
            }
    }

    return b;
}

mat3 &mat3::apply(V_FCT_PTR fct) 
{
    v[VX].apply(fct);
    v[VY].apply(fct);
    v[VZ].apply(fct);
    return *this;
}


// FRIENDS

mat3 operator-(const mat3 &a)
{ 
    return mat3(-a.v[0], -a.v[1], -a.v[2]); 
}

mat3 operator+(const mat3 &a, const mat3 &b)
{ 
    return mat3(a.v[0]+b.v[0], a.v[1]+b.v[1], a.v[2]+b.v[2]); 
}

mat3 operator-(const mat3 &a, const mat3 &b)
{ 
    return mat3(a.v[0]-b.v[0], a.v[1]-b.v[1], a.v[2]-b.v[2]); 
}

mat3 operator*(const mat3 &a, const mat3 &b) 
{
    #define ROWCOL(i, j) \
    a.v[i].n[0]*b.v[0][j] + a.v[i].n[1]*b.v[1][j] + a.v[i].n[2]*b.v[2][j]

    return mat3(
        vec3(ROWCOL(0,0), ROWCOL(0,1), ROWCOL(0,2)),
        vec3(ROWCOL(1,0), ROWCOL(1,1), ROWCOL(1,2)),
        vec3(ROWCOL(2,0), ROWCOL(2,1), ROWCOL(2,2)));
    
    #undef ROWCOL
}

mat3 operator*(const mat3 &a, float d)
{ 
    return mat3(a.v[0]*d, a.v[1]*d, a.v[2]*d); 
}

mat3 operator*(float d, const mat3 &a)
{ 
    return a*d; 
}

mat3 operator/(const mat3 &a, float d)
{ 
    return mat3(a.v[0]/d, a.v[1]/d, a.v[2]/d); 
}

int operator==(const mat3 &a, const mat3 &b)
{ 
    return 
        (a.v[0] == b.v[0]) && 
        (a.v[1] == b.v[1]) && 
        (a.v[2] == b.v[2]); 
}

int operator!=(const mat3 &a, const mat3 &b)
{ 
    return !(a == b); 
}

/*ostream& operator << (ostream& s, mat3& m)
{ return s << m.v[VX] << '\n' << m.v[VY] << '\n' << m.v[VZ]; }

istream& operator >> (istream& s, mat3& m) {
    mat3    m_tmp;

    s >> m_tmp[VX] >> m_tmp[VY] >> m_tmp[VZ];
    if (s)
    m = m_tmp;
    return s;
}
*/

void swap(mat3 &a, mat3 &b)
{ 
    mat3 tmp(a); 
    a = b; 
    b = tmp; 
}

void mat3::print(FILE *file, const char *name) const 
{
    int i, j;

    fprintf( stderr, "%s:\n", name );

    for( i = 0; i < 3; i++ )
    {
        fprintf( stderr, "   " );
        for( j = 0; j < 3; j++ )
        {
            fprintf( stderr, "%f  ", v[i][j] );
        }
        fprintf( stderr, "\n" );
    }
}



/****************************************************************
 *                                                              *
 *          mat4 member functions                               *
 *                                                              *
 ****************************************************************/

// CONSTRUCTORS

mat4::mat4() 
{ 
    *this = identity3D();
}

mat4::mat4(const vec4& v0, const vec4& v1, const vec4& v2, const vec4& v3)
{ 
    v[0] = v0; 
    v[1] = v1; 
    v[2] = v2; 
    v[3] = v3; 
}

mat4::mat4(const mat4 &m)
{ 
    v[0] = m.v[0]; 
    v[1] = m.v[1]; 
    v[2] = m.v[2]; 
    v[3] = m.v[3]; 
}

mat4::mat4(
     float a00, float a01, float a02, float a03,
     float a10, float a11, float a12, float a13,
     float a20, float a21, float a22, float a23,
     float a30, float a31, float a32, float a33 )
{
  v[0][0] = a00;  v[0][1] = a01;  v[0][2] = a02;  v[0][3] = a03;
  v[1][0] = a10;  v[1][1] = a11;  v[1][2] = a12;  v[1][3] = a13;
  v[2][0] = a20;  v[2][1] = a21;  v[2][2] = a22;  v[2][3] = a23;
  v[3][0] = a30;  v[3][1] = a31;  v[3][2] = a32;  v[3][3] = a33;
}

// ASSIGNMENT OPERATORS

mat4 &mat4::operator=(const mat4 &m)
{ 
    v[0] = m.v[0]; 
    v[1] = m.v[1]; 
    v[2] = m.v[2]; 
    v[3] = m.v[3];
    return *this; 
}

mat4 &mat4::operator+=(const mat4 &m)
{ 
    v[0] += m.v[0]; 
    v[1] += m.v[1]; 
    v[2] += m.v[2]; 
    v[3] += m.v[3];
    return *this; 
}

mat4 &mat4::operator-=(const mat4 &m)
{ 
    v[0] -= m.v[0]; 
    v[1] -= m.v[1]; 
    v[2] -= m.v[2]; 
    v[3] -= m.v[3];
    return *this; 
}

mat4 &mat4::operator*=(float d)
{ 
    v[0] *= d; 
    v[1] *= d; 
    v[2] *= d; 
    v[3] *= d; 
    return *this; 
}

mat4 &mat4::operator/=(float d)
{ 
    v[0] /= d; 
    v[1] /= d; 
    v[2] /= d; 
    v[3] /= d; 
    return *this; 
}

vec4 &mat4::operator[](int i) 
{
    if (i < VX || i > VW)
        //VEC_ERROR("mat4 [] operator: illegal access; index = " << i << '\n')
        VEC_ERROR("mat4 [] operator: illegal access" );
    return v[i];
}

const vec4 &mat4::operator[](int i) const
{
    if (i < VX || i > VW)
        //VEC_ERROR("mat4 [] operator: illegal access; index = " << i << '\n')
        VEC_ERROR("mat4 [] operator: illegal access" );
    return v[i];
}

// SPECIAL FUNCTIONS;

mat4 mat4::transpose() const  
{
    return mat4(
        vec4(v[0][0], v[1][0], v[2][0], v[3][0]),
        vec4(v[0][1], v[1][1], v[2][1], v[3][1]),
        vec4(v[0][2], v[1][2], v[2][2], v[3][2]),
        vec4(v[0][3], v[1][3], v[2][3], v[3][3]));
}

mat4 mat4::inverse() const       // Gauss-Jordan elimination with partial pivoting
{
    mat4 a(*this);          // As a evolves from original mat into identity
    mat4 b(identity3D());   // b evolves from identity into inverse(a)
    int i, j, i1;

    // Loop over cols of a from left to right, eliminating above and below diag
    for (j=0; j<4; j++)    // Find largest pivot in column j among rows j..3
    {
        i1 = j;         // Row with largest pivot candidate
        for (i=j+1; i<4; i++)
            if (fabs(a.v[i].n[j]) > fabs(a.v[i1].n[j]))
                i1 = i;

        // Swap rows i1 and j in a and b to put pivot on diagonal
        swap(a.v[i1], a.v[j]);
        swap(b.v[i1], b.v[j]);

        // Scale row j to have a unit diagonal
        if (a.v[j].n[j]==0.)
            VEC_ERROR("mat4::inverse: singular matrix; can't invert\n");

        b.v[j] /= a.v[j].n[j];
        a.v[j] /= a.v[j].n[j];

        // Eliminate off-diagonal elems in col j of a, doing identical ops to b
        for (i=0; i<4; i++)
            if (i!=j) 
            {
                b.v[i] -= a.v[i].n[j]*b.v[j];
                a.v[i] -= a.v[i].n[j]*a.v[j];
            }
    }

    return b;
}

mat4 &mat4::apply(V_FCT_PTR fct)
{ 
    v[VX].apply(fct); 
    v[VY].apply(fct); 
    v[VZ].apply(fct); 
    v[VW].apply(fct);
    return *this; 
}

void mat4::print(FILE *file, const char *name) const 
{
    int i, j;

    fprintf( stderr, "%s:\n", name );

    for( i = 0; i < 4; i++ )
    {
        fprintf( stderr, "   " );
        for( j = 0; j < 4; j++ )
        {
            fprintf( stderr, "%f  ", v[i][j] );
        }
        fprintf( stderr, "\n" );
    }
}

void mat4::swap_rows(int i, int j)
{
    vec4 t;

    t    = v[i];
    v[i] = v[j];
    v[j] = t;
}

void mat4::swap_cols(int i, int j)
{
    float t;
    int k;

    for (k=0; k<4; k++) 
    {
        t       = v[k][i];
        v[k][i] = v[k][j];
        v[k][j] = t;
    }
}


// FRIENDS

mat4 operator-(const mat4 &a)
{ 
    return mat4(-a.v[0],-a.v[1],-a.v[2],-a.v[3]); 
}

mat4 operator+(const mat4 &a, const mat4 &b)
{ 
    return mat4(
        a.v[0] + b.v[0], 
        a.v[1] + b.v[1], 
        a.v[2] + b.v[2],
        a.v[3] + b.v[3]);
}

mat4 operator-(const mat4 &a, const mat4 &b)
{ 
    return mat4(
        a.v[0] - b.v[0], 
        a.v[1] - b.v[1], 
        a.v[2] - b.v[2], 
        a.v[3] - b.v[3]); 
}

mat4 operator*(const mat4 &a, const mat4 &b) 
{
    #define ROWCOL(i, j) \
        a.v[i].n[0]*b.v[0][j] + \
        a.v[i].n[1]*b.v[1][j] + \
        a.v[i].n[2]*b.v[2][j] + \
        a.v[i].n[3]*b.v[3][j]
    
    return mat4(
        vec4(ROWCOL(0,0), ROWCOL(0,1), ROWCOL(0,2), ROWCOL(0,3)),
        vec4(ROWCOL(1,0), ROWCOL(1,1), ROWCOL(1,2), ROWCOL(1,3)),
        vec4(ROWCOL(2,0), ROWCOL(2,1), ROWCOL(2,2), ROWCOL(2,3)),
        vec4(ROWCOL(3,0), ROWCOL(3,1), ROWCOL(3,2), ROWCOL(3,3))
        );

    #undef ROWCOL
}

mat4 operator*(const mat4 &a, float d)
{ 
    return mat4(a.v[0]*d, a.v[1]*d, a.v[2]*d, a.v[3]*d); 
}

mat4 operator*(float d, const mat4 &a)
{ 
    return a*d; 
}

mat4 operator/(const mat4 &a, float d)
{ 
    return mat4(a.v[0]/d, a.v[1]/d, a.v[2]/d, a.v[3]/d); 
}

int operator==(const mat4 &a, const mat4 &b)
{ 
    return
        (a.v[0] == b.v[0]) && 
        (a.v[1] == b.v[1]) && 
        (a.v[2] == b.v[2]) &&
        (a.v[3] == b.v[3]); 
}

int operator!=(const mat4 &a, const mat4 &b)
{ 
    return !(a == b); 
}

/*ostream& operator << (ostream& s, mat4& m)
{ return s << m.v[VX] << '\n' << m.v[VY] << '\n' << m.v[VZ] << '\n' << m.v[VW]; }

istream& operator >> (istream& s, mat4& m)
{
    mat4    m_tmp;

    s >> m_tmp[VX] >> m_tmp[VY] >> m_tmp[VZ] >> m_tmp[VW];
    if (s)
    m = m_tmp;
    return s;
}
*/

void swap(mat4 &a, mat4 &b)
{ 
    mat4 tmp(a); 
    a = b; 
    b = tmp; 
}

/****************************************************************
 *                                                              *
 *         2D functions and 3D functions                        *
 *                                                              *
 ****************************************************************/

mat3 identity2D()
{   
    return mat3(
        vec3(1.0, 0.0, 0.0),
        vec3(0.0, 1.0, 0.0),
        vec3(0.0, 0.0, 1.0)); 
}

mat3 translation2D(const vec2 &v)
{   
    return mat3(
        vec3(1.0, 0.0, v[VX]),
        vec3(0.0, 1.0, v[VY]),
        vec3(0.0, 0.0, 1.0)); 
}

mat3 rotation2D(const vec2 &Center, float angleDeg) 
{
    float angleRad = (float) (angleDeg * M_PI / 180.0);
    float c = (float) cos(angleRad);
    float s = (float) sin(angleRad);

    return mat3(
        vec3(c,    -s, Center[VX] * (1.0f-c) + Center[VY] * s),
        vec3(s,     c, Center[VY] * (1.0f-c) - Center[VX] * s),
        vec3(0.0, 0.0, 1.0));
}

mat3 scaling2D(const vec2 &scaleVector)
{   
    return mat3(
        vec3(scaleVector[VX], 0.0, 0.0),
        vec3(0.0, scaleVector[VY], 0.0),
        vec3(0.0, 0.0, 1.0)); 
}

mat4 identity3D()
{   
    return mat4(
        vec4(1.0, 0.0, 0.0, 0.0),
        vec4(0.0, 1.0, 0.0, 0.0),
        vec4(0.0, 0.0, 1.0, 0.0),
        vec4(0.0, 0.0, 0.0, 1.0)); 
}

mat4 translation3D(const vec3 &v)
{   
    return mat4(
        vec4(1.0, 0.0, 0.0, v[VX]),
        vec4(0.0, 1.0, 0.0, v[VY]),
        vec4(0.0, 0.0, 1.0, v[VZ]),
        vec4(0.0, 0.0, 0.0, 1.0)); 
}

mat4 rotation3D(const vec3 &Axis, float angleDeg) 
{
    float angleRad = (float) (angleDeg * M_PI / 180.0);
    float c = (float) cos(angleRad);
    float s = (float) sin(angleRad);
    float t = 1.0f - c;

    vec3 axis(Axis);
    axis.normalize();

    return mat4(
        vec4(t * axis[VX] * axis[VX] + c,
             t * axis[VX] * axis[VY] - s * axis[VZ],
             t * axis[VX] * axis[VZ] + s * axis[VY],
             0.0),
        vec4(t * axis[VX] * axis[VY] + s * axis[VZ],
             t * axis[VY] * axis[VY] + c,
             t * axis[VY] * axis[VZ] - s * axis[VX],
             0.0),
        vec4(t * axis[VX] * axis[VZ] - s * axis[VY],
             t * axis[VY] * axis[VZ] + s * axis[VX],
             t * axis[VZ] * axis[VZ] + c,
             0.0),
        vec4(0.0, 0.0, 0.0, 1.0));
}

mat4 rotation3Drad(const vec3 &Axis, float angleRad) 
{
    float c = (float) cos(angleRad);
    float s = (float) sin(angleRad);
    float t = 1.0f - c;

    vec3 axis(Axis);
    axis.normalize();

    return mat4(
        vec4(t * axis[VX] * axis[VX] + c,
             t * axis[VX] * axis[VY] - s * axis[VZ],
             t * axis[VX] * axis[VZ] + s * axis[VY],
             0.0),
        vec4(t * axis[VX] * axis[VY] + s * axis[VZ],
             t * axis[VY] * axis[VY] + c,
             t * axis[VY] * axis[VZ] - s * axis[VX],
             0.0),
        vec4(t * axis[VX] * axis[VZ] - s * axis[VY],
             t * axis[VY] * axis[VZ] + s * axis[VX],
             t * axis[VZ] * axis[VZ] + c,
             0.0),
        vec4(0.0, 0.0, 0.0, 1.0));
}

mat4 scaling3D(const vec3 &scaleVector)
{   
    return mat4(
        vec4(scaleVector[VX], 0.0, 0.0, 0.0),
        vec4(0.0, scaleVector[VY], 0.0, 0.0),
        vec4(0.0, 0.0, scaleVector[VZ], 0.0),
        vec4(0.0, 0.0, 0.0, 1.0)); 
}

mat4 perspective3D(float d)
{   
    return mat4(
        vec4(1.0f, 0.0f, 0.0f,   0.0f),
        vec4(0.0f, 1.0f, 0.0f,   0.0f),
        vec4(0.0f, 0.0f, 1.0f,   0.0f),
        vec4(0.0f, 0.0f, 1.0f/d, 0.0f)); 
}
