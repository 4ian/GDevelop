/*
 * freeglut_glutfont_definitions.c
 *
 * Bitmap and stroke fonts displaying.
 *
 * Copyright (c) 2003 Stephen J. Baker (whether he wants it or not).
 * All Rights Reserved.
 * Written by John F. Fay <fayjf@sourceforge.net>, who releases the
 * copyright over to the "freeglut" project lead.
 * Creation date: Mon July 21 2003
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
 * OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL
 * PAWEL W. OLSZTA BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/*
 * This file is necessary for the *nix version of "freeglut" because the
 * original GLUT defined its font variables in rather an unusual way.
 * Publicly, in "glut.h", they were defined as "void *".  Privately,
 * in one of the source code files, they were defined as pointers to a
 * structure.  Most compilers and linkers are satisfied with the "void *"
 * and don't go any farther, but some of them balked.  In particular,
 * when compiling with "freeglut" and then trying to run using the GLUT
 * ".so" library, some of them would give an error.  So we are having to
 * create this file to define the variables as pointers to an unusual
 * structure to match GLUT.
 */

/*
 * freeglut_internal.h uses some GL types, but including the GL header portably
 * is a bit tricky, so we include freeglut_std.h here, which contains the
 * necessary machinery. But this poses another problem, caused by the ugly
 * original defintion of the font constants in "classic" GLUT: They are defined
 * as void* externally, so we move them temporarily out of the way by AN EXTREME
 * CPP HACK.
 */

#define glutStrokeRoman glutStrokeRomanIGNOREME
#define glutStrokeMonoRoman glutStrokeMonoRomanIGNOREME
#define glutBitmap9By15 glutBitmap9By15IGNOREME
#define glutBitmap8By13 glutBitmap8By13IGNOREME
#define glutBitmapTimesRoman10 glutBitmapTimesRoman10IGNOREME
#define glutBitmapTimesRoman24 glutBitmapTimesRoman24IGNOREME
#define glutBitmapHelvetica10 glutBitmapHelvetica10IGNOREME
#define glutBitmapHelvetica12 glutBitmapHelvetica12IGNOREME
#define glutBitmapHelvetica18 glutBitmapHelvetica18IGNOREME

#include <GL/freeglut_std.h>

#undef glutStrokeRoman
#undef glutStrokeMonoRoman
#undef glutBitmap9By15
#undef glutBitmap8By13
#undef glutBitmapTimesRoman10
#undef glutBitmapTimesRoman24
#undef glutBitmapHelvetica10
#undef glutBitmapHelvetica12
#undef glutBitmapHelvetica18

#include "freeglut_internal.h"

#if TARGET_HOST_POSIX_X11

struct freeglutStrokeFont
{
  const char *name ;
  int num_chars ;
  void *ch ;
  float top ;
  float bottom ;
};

struct freeglutBitmapFont
{
  const char *name ;
  const int num_chars ;
  const int first ;
  const void *ch ;
};


struct freeglutStrokeFont glutStrokeRoman ;
struct freeglutStrokeFont glutStrokeMonoRoman ;

struct freeglutBitmapFont glutBitmap9By15 ;
struct freeglutBitmapFont glutBitmap8By13 ;
struct freeglutBitmapFont glutBitmapTimesRoman10 ;
struct freeglutBitmapFont glutBitmapTimesRoman24 ;
struct freeglutBitmapFont glutBitmapHelvetica10 ;
struct freeglutBitmapFont glutBitmapHelvetica12 ;
struct freeglutBitmapFont glutBitmapHelvetica18 ;

#endif

