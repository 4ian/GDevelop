/****************************************************************************
  
  GLUI User Interface Toolkit
  ---------------------------

     glui_translation - GLUI_Translation control class


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

#include "GL/glui.h"
#include "glui_internal.h"
#include "algebra3.h"

/********************** GLUI_Translation::GLUI_Translation() ***/

GLUI_Translation::GLUI_Translation(
  GLUI_Node *parent, const char *name, 
  int trans_t, float *value_ptr,
  int id, GLUI_CB cb )
{
  common_init();

  set_ptr_val( value_ptr );
  user_id    = id;
  set_name( name );
  callback    = cb;
  parent->add_control( this );
  //init_live();

  trans_type = trans_t;

  if ( trans_type == GLUI_TRANSLATION_XY ) {
    float_array_size = 2;
  }
  else if ( trans_type == GLUI_TRANSLATION_X ) {
    float_array_size = 1;
  }
  else if ( trans_type == GLUI_TRANSLATION_Y ) {
    float_array_size = 1;
  }
  else if ( trans_type == GLUI_TRANSLATION_Z ) {
    float_array_size = 1;
  }
  init_live();
}

/********************** GLUI_Translation::iaction_mouse_down_handler() ***/
/*  These are really in local coords (5/10/99)                            */

int    GLUI_Translation::iaction_mouse_down_handler( int local_x, 
						     int local_y )
{
  int center_x, center_y;

  down_x = local_x;
  down_y = local_y;

  if ( trans_type == GLUI_TRANSLATION_XY ) {
    orig_x = float_array_val[0];
    orig_y = float_array_val[1];

    /** Check if the Alt key is down, which means lock to an axis **/

    center_x = w/2;
    center_y = (h-18)/2;

    if ( glui->curr_modifiers & GLUT_ACTIVE_ALT ) {
      if ( ABS(local_y-center_y) > ABS(local_x-center_x) ) {
        locked = GLUI_TRANSLATION_LOCK_Y;
        glutSetCursor( GLUT_CURSOR_UP_DOWN );
      }
      else {
        locked = GLUI_TRANSLATION_LOCK_X;
        glutSetCursor( GLUT_CURSOR_LEFT_RIGHT );
      }
    }
    else {
      locked = GLUI_TRANSLATION_LOCK_NONE;
      glutSetCursor( GLUT_CURSOR_SPRAY );
    }
  }
  else if ( trans_type == GLUI_TRANSLATION_X ) {
    glutSetCursor( GLUT_CURSOR_LEFT_RIGHT );
    orig_x = float_array_val[0];
  }
  else if ( trans_type == GLUI_TRANSLATION_Y ) {
    glutSetCursor( GLUT_CURSOR_UP_DOWN );
    orig_y = float_array_val[0];
  }
  else if ( trans_type == GLUI_TRANSLATION_Z ) {
    glutSetCursor( GLUT_CURSOR_UP_DOWN );
    orig_z = float_array_val[0];
  }

  trans_mouse_code = 1;
  redraw();

  return false;
}


/*********************** GLUI_Translation::iaction_mouse_up_handler() **********/

int    GLUI_Translation::iaction_mouse_up_handler( int local_x, int local_y, 
						   bool inside )
{
  trans_mouse_code = GLUI_TRANSLATION_MOUSE_NONE;
  locked = GLUI_TRANSLATION_LOCK_NONE;

  redraw();

  return false;
}


/******************* GLUI_Translation::iaction_mouse_held_down_handler() ******/

int    GLUI_Translation::iaction_mouse_held_down_handler( int local_x, int local_y,
							  bool inside)
{  
  float x_off, y_off;
  float off_array[2];

  x_off = scale_factor * (float)(local_x - down_x);
  y_off = -scale_factor * (float)(local_y - down_y);

  if ( glui->curr_modifiers & GLUT_ACTIVE_SHIFT ) {
    x_off *= 100.0f;
    y_off *= 100.0f;
  }
  else if ( glui->curr_modifiers & GLUT_ACTIVE_CTRL ) {
    x_off *= .01f;
    y_off *= .01f;
  }
		

  if ( trans_type == GLUI_TRANSLATION_XY ) {

    if ( locked == GLUI_TRANSLATION_LOCK_X )
      y_off = 0.0;
    else if ( locked == GLUI_TRANSLATION_LOCK_Y )
      x_off = 0.0;

    off_array[0] = x_off + orig_x;
    off_array[1] = y_off + orig_y;
  }
  else if ( trans_type == GLUI_TRANSLATION_X ) {
    off_array[0] = x_off + orig_x;
  }
  else if ( trans_type == GLUI_TRANSLATION_Y ) {
    off_array[0] = y_off + orig_y;
  }
  else if ( trans_type == GLUI_TRANSLATION_Z ) {
    off_array[0] = y_off + orig_z;
  }

  set_float_array_val( (float*) &off_array[0] );

  return false;
}


/******************** GLUI_Translation::iaction_draw_active_area_persp() **************/

void    GLUI_Translation::iaction_draw_active_area_persp( void )
{
}


/******************** GLUI_Translation::iaction_draw_active_area_ortho() **********/

void    GLUI_Translation::iaction_draw_active_area_ortho( void )
{
  /********* Draw emboss circles around arcball control *********/
  float radius;
  radius = (float)(h-22)/2.0;  /*  MIN((float)w/2.0, (float)h/2.0); */
  glLineWidth( 1.0 );

  draw_emboss_box( (int) -radius-2, (int)radius+2, 
		   (int)-radius-2, (int)radius+2 );

  glMatrixMode( GL_MODELVIEW );
  glPushMatrix();
  glTranslatef( .5, .5, .5 );
  /*  glScalef( radius-1.0, radius-1.0, radius-1.0 ); */
  if ( trans_type == GLUI_TRANSLATION_Z )
    draw_2d_z_arrows((int)radius-1);
  else if ( trans_type == GLUI_TRANSLATION_XY )
    draw_2d_xy_arrows((int)radius-1);
  else if ( trans_type == GLUI_TRANSLATION_X )
    draw_2d_x_arrows((int)radius-1);
  else if ( trans_type == GLUI_TRANSLATION_Y )
    draw_2d_y_arrows((int)radius-1);

  glPopMatrix();
}


/******************************** GLUI_Translation::iaction_dump() **********/

void     GLUI_Translation::iaction_dump( FILE *output )
{
}


/******************** GLUI_Translation::iaction_special_handler() **********/

int    GLUI_Translation::iaction_special_handler( int key,int modifiers )
{

  return false;
}



/*************************** GLUI_Translation::draw_2d_z_arrows() **************/

void    GLUI_Translation::draw_2d_z_arrows( int radius )
{
  if ( trans_mouse_code != GLUI_TRANSLATION_MOUSE_NONE ) {
    draw_2d_arrow(radius, true, 2);
    draw_2d_arrow(radius, true, 0);
  }
  else {
    draw_2d_arrow(radius, false, 2);
    draw_2d_arrow(radius, false, 0);
  }
}


/*************************** GLUI_Translation::draw_2d_x_arrows() **************/

void    GLUI_Translation::draw_2d_x_arrows( int radius )
{
  if ( trans_mouse_code != GLUI_TRANSLATION_MOUSE_NONE ) {
    draw_2d_arrow(radius, true, 1);
    draw_2d_arrow(radius, true, 3);
  }
  else {
    draw_2d_arrow(radius, false, 1);
    draw_2d_arrow(radius, false, 3);
  }
}


/*************************** GLUI_Translation::draw_2d_y_arrows() **************/

void    GLUI_Translation::draw_2d_y_arrows( int radius )
{
  if ( trans_mouse_code != GLUI_TRANSLATION_MOUSE_NONE ) {
    draw_2d_arrow(radius, true, 0);
    draw_2d_arrow(radius, true, 2);
  }
  else {
    draw_2d_arrow(radius, false, 0);
    draw_2d_arrow(radius, false, 2);
  }
}


/************************** GLUI_Translation::draw_2d_xy_arrows() **************/

void    GLUI_Translation::draw_2d_xy_arrows( int radius)
{
  if ( trans_mouse_code != GLUI_TRANSLATION_MOUSE_NONE ) {
    if ( locked == GLUI_TRANSLATION_LOCK_X ) {
      draw_2d_arrow(radius, false, 0);
      draw_2d_arrow(radius, false, 2);
      draw_2d_arrow(radius, true, 1);
      draw_2d_arrow(radius, true, 3);
    }
    else if ( locked == GLUI_TRANSLATION_LOCK_Y ) {
      draw_2d_arrow(radius, false, 1);
      draw_2d_arrow(radius, false, 3);
      draw_2d_arrow(radius, true, 0);
      draw_2d_arrow(radius, true, 2);
    }
    else {
      draw_2d_arrow(radius, true, 0);
      draw_2d_arrow(radius, true, 1);
      draw_2d_arrow(radius, true, 2);
      draw_2d_arrow(radius, true, 3);
    }
  }
  else {
    draw_2d_arrow(radius, false, 0);
    draw_2d_arrow(radius, false, 1);
    draw_2d_arrow(radius, false, 2);
    draw_2d_arrow(radius, false, 3);
  }

  return;
}


/*************************** GLUI_Translation::draw_2d_arrow() **************/
/* ori: 0=up, 1=left, 2=down, 3=right                                       */
/*                                                                          */
/*                                                                          */
/*                           0, y2                                          */
/*                      /            \                                      */
/*                     /              \                                     */
/*                    /                \                                    */
/*                   /                  \                                   */
/*                  /                    \                                  */
/*                 /                      \                                 */
/*                /                        \                                */
/*               /                          \                               */
/*            -x2,y1   -x1b,y1   x1b,y1     x2,y1                           */
/*                        |        |                                        */
/*                        |        |                                        */
/*                        |        |                                        */
/*                        |        |                                        */
/*                        |        |                                        */
/*                    -x1a,y0    x1a,y0                                     */
/*                                                                          */


void    GLUI_Translation::draw_2d_arrow( int radius, int filled, int orientation )
{
  float x1 = .2, x2 = .4, y1 = .54, y2 = .94, y0;
  float x1a, x1b;
/*
  vec3  col1( 0.0, 0.0, 0.0 ), col2( .45, .45, .45 ), 
    col3( .7, .7, .7 ), col4( 1.0, 1.0, 1.0 );
  vec3  c1, c2, c3, c4, c5, c6;
*/
  vec3  white(1.0,1.0,1.0), black(0.0,0.0,0.0), gray(.45,.45,.45), 
    bkgd(.7,.7,.7);
  int   c_off=0; /* color index offset */

  if ( glui )
    bkgd.set(glui->bkgd_color_f[0],
	     glui->bkgd_color_f[1],
	     glui->bkgd_color_f[2]);

  /*	bkgd[0] = 255.0; bkgd[1] = 0;              */

  /** The following 8 colors define the shading of an octagon, in
    clockwise order, starting from the upstroke on the left  **/
  /** This is for an outside and inside octagons **/
  vec3 colors_out[]={white, white, white, gray, black, black, black, gray};
  vec3 colors_in[] ={bkgd,white,bkgd,gray,gray,gray,gray,gray};

#define SET_COL_OUT(i) glColor3fv((float*) &colors_out[(i)%8][0]);
#define SET_COL_IN(i) glColor3fv((float*) &colors_in[(i)%8][0]);

  x1 = (float)radius * .2;
  x2 = x1 * 2;
  y1 = (float)radius * .54;
  y2 = y1 + x2;
  x1a = x1;
  x1b = x1;

  glMatrixMode(GL_MODELVIEW);
  glPushMatrix();

#define DRAW_SEG( xa,ya,xb,yb ) glVertex2f(xa,ya); glVertex2f(xb,yb);

  glScalef( -1.0, 1.0, 1.0 );
	
  if ( orientation == 2 ) {
    c_off = 4;
  }
  else if ( orientation == 0 ) {
    c_off = 0;
    glRotatef( 180.0, 0.0, 0.0, 1.0 );
  }
  else if ( orientation == 1 ) {
    c_off = 2;
    glRotatef( 90.0, 0.0, 0.0, 1.0 );
  }
  else if ( orientation == 3 ) {
    c_off = 6;
    glRotatef( -90.0, 0.0, 0.0, 1.0 );
  }

  if ( trans_type == GLUI_TRANSLATION_Z )
    y0 = 0.0;
  else if ( trans_type == GLUI_TRANSLATION_XY )
    y0 = x1;
  else
    y0 = 0.0;

	
  if ( trans_type == GLUI_TRANSLATION_Z ) {
    if ( orientation == 0 ) {
      y1 += 2.0;
      y2 += 0.0;

      x1b -= 2.0;
      x2  -= 2.0;
      x1a += 2.0;
    }
    else if ( orientation == 2 ) {
      y1 -= 6.0;
      x1a += 2.0;
      x1b += 4.0;
      x2  += 6.0; 
    }
  }

  /*** Fill in inside of arrow  ***/
  if ( NOT filled ) {  /*** Means button is up - control is not clicked ***/
    /*glColor3f( .8, .8, .8 );              */
    set_to_bkgd_color();
    glColor3f( bkgd[0]+.07, bkgd[1]+.07, bkgd[2]+.07 );
  }
  else {               /*** Button is down on control ***/
    glColor3f( .6, .6, .6 );
    c_off += 4;  /* Indents the shadows - goes from a raised look to embossed */
  }

  /*** Check if control is enabled or not ***/
  if ( NOT enabled ) {
    set_to_bkgd_color();
    /*c_off += 4;  -- Indents the shadows - goes from a raised look to embossed */              
    colors_out[0] = colors_out[1] = colors_out[2] = colors_out[7] = gray;
    colors_out[3] = colors_out[4] = colors_out[5] = colors_out[6] = white;
    colors_in[0] = colors_in[1] = colors_in[2] = colors_in[7] = white;
    colors_in[3] = colors_in[4] = colors_in[5] = colors_in[6] = gray;
	
  }

  glBegin( GL_POLYGON );
  glVertex2f( 0.0, 0.0  );  glVertex2f( -x1a, 0.0 );
  glVertex2f( -x1a, 0.0   );  glVertex2f( -x1b, y1 );
  glVertex2f( x1b, y1);      glVertex2f( x1a, 0.0 );
  glVertex2f( x1a, 0.0 );     glVertex2f( 0.0, 0.0  );
  glEnd();
  glBegin( GL_TRIANGLES );
  glVertex2f( -x2, y1 ); glVertex2f( 0.0, y2 ); glVertex2f( x2, y1 );
  glEnd();

  glLineWidth( 1.0 );
  /*** Draw arrow outline ***/
  glBegin( GL_LINES );

  SET_COL_IN(1+c_off);  DRAW_SEG( 0.0, y2-1.0, -x2, y1-1.0 );
  SET_COL_IN(6+c_off);	DRAW_SEG( -x2+2.0, y1+1.0, -x1b+1.0, y1+1.0 );
  SET_COL_IN(0+c_off);	DRAW_SEG( -x1b+1.0, y1+1.0, -x1a+1.0, y0 );
  SET_COL_IN(3+c_off);	DRAW_SEG( 0.0, y2-1.0, x2, y1-1.0 );
  SET_COL_IN(6+c_off);	DRAW_SEG( x2-1.0, y1+1.0, x1b-1.0, y1+1.0 );
  SET_COL_IN(4+c_off);	DRAW_SEG( x1b-1.0, y1+1.0, x1a-1.0, y0 );

  SET_COL_OUT(0+c_off);  DRAW_SEG( -x1a, y0, -x1b, y1  );
  SET_COL_OUT(6+c_off);  DRAW_SEG( -x1b, y1,  -x2, y1  );
  SET_COL_OUT(1+c_off);  DRAW_SEG( -x2, y1,  0.0, y2  );
  SET_COL_OUT(3+c_off);  DRAW_SEG( 0.0, y2,   x2, y1  );
  SET_COL_OUT(6+c_off);  DRAW_SEG(  x2, y1,   x1b, y1  );
  SET_COL_OUT(4+c_off);  DRAW_SEG(  x1b, y1,   x1a, y0 );

  glEnd();

#undef DRAW_SEG

  glPopMatrix();
}


/*************************** GLUI_Translation::get_mouse_code() *************/

int    GLUI_Translation::get_mouse_code( int x, int y )
{
  if ( x == 0 AND y < 0 )
    return GLUI_TRANSLATION_MOUSE_DOWN;
  else if ( x == 0 AND y > 0 )
    return GLUI_TRANSLATION_MOUSE_UP;		
  else if ( x > 0 AND y == 0 )
    return GLUI_TRANSLATION_MOUSE_LEFT;		
  else if ( x < 0 AND y == 0 )
    return GLUI_TRANSLATION_MOUSE_RIGHT;		
  else if ( x < 0 AND y < 0 )
    return GLUI_TRANSLATION_MOUSE_DOWN_LEFT;		
  else if ( x < 0 AND y > 0 )
    return GLUI_TRANSLATION_MOUSE_DOWN_RIGHT;
  else if ( x > 0 AND y < 0 )
    return GLUI_TRANSLATION_MOUSE_UP_LEFT;
  else if ( x > 0 AND y > 0 )
    return GLUI_TRANSLATION_MOUSE_UP_RIGHT;	


  return GLUI_TRANSLATION_MOUSE_NONE;
}


/*********************************** GLUI_Translation::set_x() ******/

void  GLUI_Translation::set_x( float val )
{
  set_one_val( val, 0 );
}


/*********************************** GLUI_Translation::set_y() ******/

void  GLUI_Translation::set_y( float val )
{
  if ( trans_type == GLUI_TRANSLATION_XY )			
    set_one_val( val, 1 );
  else
    set_one_val( val, 0 );
}


/*********************************** GLUI_Translation::set_z() ******/

void  GLUI_Translation::set_z( float val )
{
  set_one_val( val, 0 );
}


/******************************* GLUI_Translation::set_one_val() ****/

void  GLUI_Translation::set_one_val( float val, int index )
{
  float *fp;

  float_array_val[index] = val;	  /* set value in array              */

  /*** The code below is like output_live, except it only operates on
    a single member of the float array (given by 'index') instead of
    outputting the entire array   ****/
	
  if ( ptr_val == NULL OR NOT live_inited )
    return;
 
  fp = (float*) ptr_val;
  fp[index]                    = float_array_val[index];
  last_live_float_array[index] = float_array_val[index];

  /** Update the main gfx window? **/
  if ( this->glui != NULL ) {
    this->glui->post_update_main_gfx();
  }
}
