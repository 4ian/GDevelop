/****************************************************************************
  
  GLUI User Interface Toolkit
  ---------------------------

     glui_rotation - GLUI_Rotation control class


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
#include "arcball.h"
#include "algebra3.h"

/*************************** GLUI_Rotation::iaction_mouse_down_handler() ***/

int    GLUI_Rotation::iaction_mouse_down_handler( int local_x, int local_y )
{
  copy_float_array_to_ball();

  init_ball();

  local_y = (int) floor(2.0 * ball->center[1] - local_y);

  ball->mouse_down( local_x, local_y );

  /*	printf( "%d %d - %f %f\n", local_x, local_y, ball->center[0], ball->center[1] );              */

  copy_ball_to_float_array();

  spinning = false;

  return false;
}


/*********************** GLUI_Rotation::iaction_mouse_up_handler() **********/

int    GLUI_Rotation::iaction_mouse_up_handler( int local_x, int local_y, 
						bool inside )
{
  copy_float_array_to_ball();

  ball->mouse_up();

  return false;
}


/******************* GLUI_Rotation::iaction_mouse_held_down_handler() ******/

int    GLUI_Rotation::iaction_mouse_held_down_handler( int local_x, int local_y,
						       bool inside)
{  
  if ( NOT glui )
    return 0;

  copy_float_array_to_ball();

  local_y = (int) floor(2.0 * ball->center[1] - local_y);

  /*	printf( "%d %d\n", local_x, local_y );              */

  ball->mouse_motion( local_x, local_y, 0, 
		     (glui->curr_modifiers & GLUT_ACTIVE_ALT) != 0, 
		     (glui->curr_modifiers & GLUT_ACTIVE_CTRL) != 0 );
 
  copy_ball_to_float_array();

  if ( can_spin )
    spinning = true;

  return false;
}


/******************** GLUI_Rotation::iaction_draw_active_area_persp() **************/

void    GLUI_Rotation::iaction_draw_active_area_persp( void )
{
  /********** arcball *******/
  copy_float_array_to_ball();

  setup_texture();
  setup_lights();
	
  glEnable(GL_CULL_FACE );

  glMatrixMode( GL_MODELVIEW );
  glPushMatrix();

  mat4 tmp_rot = *ball->rot_ptr;
  glMultMatrixf( (float*) &tmp_rot[0][0] ); 

  /*** Draw the checkered box ***/
  /*glDisable( GL_TEXTURE_2D );              */
  draw_ball(1.35); // 1.96 );

  glPopMatrix();

  glBindTexture(GL_TEXTURE_2D,0); /* unhook our checkerboard texture */
  glDisable( GL_TEXTURE_2D );
  glDisable( GL_LIGHTING );
  glDisable( GL_CULL_FACE );
}


/******************** GLUI_Rotation::iaction_draw_active_area_ortho() **********/

void    GLUI_Rotation::iaction_draw_active_area_ortho( void )
{
  float radius;
  radius = (float)(h-22)/2.0;  /*MIN((float)w/2.0, (float)h/2.0);  */

  /********* Draw emboss circles around arcball control *********/
  int k;     
  glLineWidth( 1.0 );
  glBegin( GL_LINE_LOOP);
  for( k=0; k<60; k++ ) {
    float phi = 2*M_PI*(float)k/60.0;
    vec2 p( cos(phi) * (2.0 + radius), sin(phi) * (2.0 + radius));
    if ( p[1] < -p[0] ) 			glColor3ub( 128,128,128 );
    else					glColor3ub( 255,255,255 );
    glVertex2fv((float*)&p[0]);
  }
  glEnd();

  glBegin( GL_LINE_LOOP);
  for( k=0; k<60; k++ ) {
    float phi = 2*M_PI*(float)k/60.0;
    vec2 p( cos(phi) * (1.0 + radius), sin(phi) * (1.0 + radius));
    if ( enabled ) {
      if ( p[1] < -p[0] ) 			glColor3ub( 0,0,0);
      else					glColor3ub( 192,192,192);
    }
    else
    {
      if ( p[1] < -p[0] ) 			glColor3ub( 180,180,180);
      else					glColor3ub( 192,192,192);
    }
    glVertex2fv((float*)&p[0]);
  }
  glEnd();
}


/******************************** GLUI_Rotation::iaction_dump() **********/

void     GLUI_Rotation::iaction_dump( FILE *output )
{
}


/******************** GLUI_Rotation::iaction_special_handler() **********/

int    GLUI_Rotation::iaction_special_handler( int key,int modifiers )
{

  return false;
}

/********************************** GLUI_Rotation::init_ball() **********/

void  GLUI_Rotation::init_ball( void )
{
  /*printf( "%f %f %f", float( MIN(w/2,h/2)), (float) w/2, (float) h/2 );              */

  ball->set_params( vec2( (float)(w/2), (float)((h-18)/2)), 
		   (float) 2.0*(h-18) );
  /*ball->set_damping( .05 );              */
  /*float( MIN(w/2,h/2))*2.0  );              */
  /*	ball->reset_mouse();              */
}


/****************************** GLUI_Rotation::setup_texture() *********/

void GLUI_Rotation::setup_texture( void )
{
  static GLuint tex=0u;
  GLenum t=GL_TEXTURE_2D;
  glEnable(t);
  glTexEnvf( GL_TEXTURE_ENV, GL_TEXTURE_ENV_MODE, GL_MODULATE );
  glColor3f( 1.0, 1.0, 1.0 );
  if (tex!=0u) {
  /* (OSL 2006/06) Just use glBindTexture to avoid having to re-upload the whole checkerboard every frame. */
    glBindTexture(t,tex);
    return;
  } /* Else need to make a new checkerboard texture */
  glGenTextures(1,&tex);
  glBindTexture(t,tex);
  glEnable(t);
  
  unsigned int i, j;
  int dark, light;   /*** Dark and light colors for ball checkerboard  ***/

/* Note: you can change the number of checkers across there sphere in draw_ball */
#define CHECKBOARD_SIZE 64 /* pixels across whole texture */
#define CHECKBOARD_REPEAT 32u /* pixels across one black/white sector */
  unsigned char texture_image[CHECKBOARD_SIZE] [CHECKBOARD_SIZE] [3];
  unsigned char c;
  for( i=0; i<CHECKBOARD_SIZE; i++ ) 
  {
    for( j=0; j<CHECKBOARD_SIZE; j++ ) 
    {
      dark = 110;
      light = 220;

      if ((((i/CHECKBOARD_REPEAT)&0x1)==0) ^ (((j/CHECKBOARD_REPEAT)&0x1)==0))
        c = light;
      else
        c = dark;

      texture_image[i][j][0] = c;
      texture_image[i][j][1] = c;
      texture_image[i][j][2] = c;
    }    
  }
  
  glPixelStorei( GL_UNPACK_ALIGNMENT, 1 );
  glTexParameteri( t, GL_TEXTURE_WRAP_S, GL_REPEAT );
  glTexParameteri( t, GL_TEXTURE_WRAP_T, GL_REPEAT );
  glTexParameteri( t, GL_TEXTURE_MAG_FILTER, GL_LINEAR );
  glTexParameteri( t, GL_TEXTURE_MIN_FILTER, GL_LINEAR_MIPMAP_LINEAR );
  gluBuild2DMipmaps(t, GL_RGB, CHECKBOARD_SIZE, CHECKBOARD_SIZE,
  	GL_RGB, GL_UNSIGNED_BYTE, texture_image);

/* Add some mipmapping LOD bias, to keep sphere texture sharp */
  float bias=-0.5; 
  /* glTexEnvf(TEXTURE_FILTER_CONTROL_EXT,TEXTURE_LOD_BIAS_EXT,bias); */
  /* glTexParameteri( t, GL_TEXTURE_MAX_LEVEL,1);*/
  glTexEnvf(0x8500,0x8501,bias); /* <- numeric version for older OpenGL headers */
  /* Cap out the mipmap level, to prevent blurring on horizon */
  glTexParameteri(t, 0x813D, 1);
  if (glGetError()) {
  	/* Ignore errors in setting funky texture state-- go with defaults.
	  If somebody knows how to check OpenGL 1.2 before doing this, please do!
	*/
  }
}

/****************************** GLUI_Rotation::setup_lights() ***********/

void    GLUI_Rotation::setup_lights( void )
{
  glEnable( GL_LIGHTING );
  /*  if ( enabled ) 
      glEnable( GL_LIGHTING );
      else
      glDisable( GL_LIGHTING );*/
  glEnable(GL_LIGHT0);
  glColorMaterial(GL_FRONT_AND_BACK,GL_AMBIENT_AND_DIFFUSE );
  glEnable(GL_COLOR_MATERIAL);
  GLfloat light0_position[] = {-1.f, 1.f, 1.0f, 0.0f};
  glLightfv(GL_LIGHT0, GL_POSITION, light0_position);
  if (enabled) { /* enabled colors */
	GLfloat light0_ambient[] =  {0.2f, 0.2f, 0.2f, 1.0f};
	GLfloat light0_diffuse[] =  {1.f, 1.f, 1.0f, 1.0f};
	glLightfv(GL_LIGHT0, GL_AMBIENT, light0_ambient);
	glLightfv(GL_LIGHT0, GL_DIFFUSE, light0_diffuse);
  }
  else { /* disabled colors */
	GLfloat light0_ambient[] =  {0.6f, 0.6f, 0.6f, 1.0f};
	GLfloat light0_diffuse[] =  {0.2f, 0.2f, 0.2f, 1.0f};
	glLightfv(GL_LIGHT0, GL_AMBIENT, light0_ambient);
	glLightfv(GL_LIGHT0, GL_DIFFUSE, light0_diffuse);
  }
  
}


/****************************** GLUI_Rotation::draw_ball() **************/

void    GLUI_Rotation::draw_ball( float radius )
{
  if ( NOT can_draw() )
    return;

  if (quadObj == NULL)	quadObj = gluNewQuadric();
  if (quadObj) {
    gluQuadricDrawStyle(quadObj, GLU_FILL);
    gluQuadricNormals(quadObj, GLU_SMOOTH);
    gluQuadricTexture(quadObj, true );
    glMatrixMode(GL_TEXTURE);
    glLoadIdentity();
    double checkerTiles=2.0; /* black-white checker tiles across whole sphere */
    glScalef(checkerTiles,checkerTiles,1.0);
    gluSphere(quadObj, radius, 32, 16);
    glLoadIdentity();
    glMatrixMode(GL_MODELVIEW);
  }
}


/****************************** GLUI_Rotation::reset() **********/

void  GLUI_Rotation::reset( void )
{
  ball->init(); /** reset quaternion, etc. **/
  ball->set_params( vec2( (float)(w/2), (float)((h-18)/2)), 
		   (float) 2.0*(h-18) );

  set_spin( this->damping );	

  copy_ball_to_float_array();

  translate_and_draw_front();

  output_live(true); /*** Output live and draw main grx window ***/
}


/****************************** GLUI_Rotation::needs_idle() *********/

bool GLUI_Rotation::needs_idle( void ) const
{
  return can_spin;
}


/****************************** GLUI_Rotation::idle() ***************/

void        GLUI_Rotation::idle( void )
{
  spinning = ball->is_spinning?true:false;

  if ( can_spin AND spinning ) {
    copy_float_array_to_ball();
    ball->idle();

    *ball->rot_ptr = *ball->rot_ptr * ball->rot_increment;

    mat4 tmp_rot;
    tmp_rot = *ball->rot_ptr;

    copy_ball_to_float_array();

    draw_active_area_only = true;
    translate_and_draw_front();
    draw_active_area_only = false;

    output_live(true); /** output live and update gfx **/
  }
  else { 
  }
}


/********************** GLUI_Rotation::copy_float_array_to_ball() *********/

void     GLUI_Rotation::copy_float_array_to_ball( void )
{
  int i;
  float *fp_src, *fp_dst;

  fp_src = &float_array_val[0];
  fp_dst = &((*ball->rot_ptr)[0][0]);

  for( i=0; i<16; i++ ) {
    *fp_dst = *fp_src;

    fp_src++;
    fp_dst++;
  }
}


/********************** GLUI_Rotation::copy_ball_to_float_array() *********/

void     GLUI_Rotation::copy_ball_to_float_array( void )
{
  mat4 tmp_rot;
  tmp_rot = *ball->rot_ptr;

  set_float_array_val( (float*) &tmp_rot[0][0] );
}


/************************ GLUI_Rotation::set_spin() **********************/

void   GLUI_Rotation::set_spin( float damp_factor )
{
  if ( damp_factor == 0.0 ) 
    can_spin = false;
  else
    can_spin = true;

  ball->set_damping( 1.0 - damp_factor );

  this->damping = damp_factor;
}


/************** GLUI_Rotation::GLUI_Rotation() ********************/

GLUI_Rotation::GLUI_Rotation( GLUI_Node *parent,
                              const char *name, float *value_ptr,
                              int id, 
                              GLUI_CB cb )
{
  common_init();
  set_ptr_val( value_ptr );
  user_id    = id;
  set_name( name );
  callback    = cb;
  parent->add_control( this );
  init_live();
  
  /*** Init the live 4x4 matrix.  This is different than the standard
       live variable behavior, since the original value of the 4x4 matrix
       is ignored and reset to Identity  ***/
/*
NO! WVB
    if ( value_ptr != NULL ) {
      int i, j, index;
      for( i=0; i<4; i++ ) {
	for( j=0; j<4; j++ ) {
	  index = i*4+j;
	  if ( i==j )
	    value_ptr[index] = 1.0;
	  else
	    value_ptr[index] = 0.0;
	}
      }
    }
*/
    /*init_ball();              */
		

}


/************** GLUI_Rotation::common_init() ********************/

void GLUI_Rotation::common_init( void ) 
{
  glui_format_str( name, "Rotation: %p", this );
//  type                = GLUI_CONTROL_ROTATION;
  w                   = GLUI_ROTATION_WIDTH;
  h                   = GLUI_ROTATION_HEIGHT;
  can_activate        = true;
  live_type           = GLUI_LIVE_FLOAT_ARRAY;
  float_array_size    = 16;
  quadObj             = NULL;
  alignment           = GLUI_ALIGN_CENTER;
  can_spin            = false;
  spinning            = false;
  damping             = 0.0;
  ball                = new Arcball;

  reset();
}
