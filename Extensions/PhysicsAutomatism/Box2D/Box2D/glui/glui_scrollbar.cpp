/****************************************************************************
  
  GLUI User Interface Toolkit
  ---------------------------

     glui_scrollbar.cpp - GLUI_Scrollbar class

          --------------------------------------------------

  Copyright (c) 2004 John Kew, 1998 Paul Rademacher

  This program is freely distributable without licensing fees and is
  provided without guarantee or warrantee expressed or implied. This
  program is -not- in the public domain.

*****************************************************************************/

#include "glui_internal_control.h"
#include <cmath>
#include <cassert>

/*static int __debug=0;              */

#define  GLUI_SCROLL_GROWTH_STEPS         800
#define  GLUI_SCROLL_MIN_GROWTH_STEPS     100
#define  GLUI_SCROLL_CALLBACK_INTERVAL    1    /* Execute the user's callback every this many clicks */

enum {
  GLUI_SCROLL_ARROW_UP,
  GLUI_SCROLL_ARROW_DOWN,
  GLUI_SCROLL_ARROW_LEFT,
  GLUI_SCROLL_ARROW_RIGHT
};
  

/****************************** GLUI_Scrollbar::GLUI_Scrollbar() **********/
// Constructor, no live var
GLUI_Scrollbar::GLUI_Scrollbar( GLUI_Node *parent,
                                const char *name, 
                                int horz_vert,
                                int data_type,
                                int id, GLUI_CB callback
                                /*,GLUI_Control *object
                                ,GLUI_InterObject_CB obj_cb*/
                                )
{
  common_construct(parent, name, horz_vert, data_type, NULL, id, callback/*, object, obj_cb*/);
}

/****************************** GLUI_Scrollbar::GLUI_Scrollbar() **********/
// Constructor, int live var
GLUI_Scrollbar::GLUI_Scrollbar( GLUI_Node *parent, const char *name, 
                                int horz_vert,
                                int *live_var,
                                int id, GLUI_CB callback
                                /*,GLUI_Control *object
                                ,GLUI_InterObject_CB obj_cb*/
                                )
{
  common_construct(parent, name, horz_vert, GLUI_SCROLL_INT, live_var, id, callback/*, object, obj_cb*/);
}

/****************************** GLUI_Scrollbar::GLUI_Scrollbar() **********/
// Constructor, float live var
GLUI_Scrollbar::GLUI_Scrollbar( GLUI_Node *parent, const char *name,
                                int horz_vert,
                                float *live_var,
                                int id, GLUI_CB callback
                                /*,GLUI_Control *object
                                ,GLUI_InterObject_CB obj_cb*/
                                )
{
  common_construct(parent, name, horz_vert, GLUI_SCROLL_FLOAT, live_var, id, callback/*, object, obj_cb*/);
}

/****************************** GLUI_Scrollbar::common_init() **********/
void GLUI_Scrollbar::common_init(void)
{
   horizontal	= true;
   h		= GLUI_SCROLL_ARROW_HEIGHT;
   w		= GLUI_TEXTBOX_WIDTH;
   alignment	= GLUI_ALIGN_CENTER;
   x_off	= 0;
   y_off_top	= 0;
   y_off_bot	= 0;
   can_activate = true;
   state	= GLUI_SCROLL_STATE_NONE;
   growth_exp	= GLUI_SCROLL_DEFAULT_GROWTH_EXP;
   callback_count = 0;
   first_callback = true;
   user_speed	= 1.0;
   float_min	= 0.0;
   float_max	= 0.0;
   int_min	= 0;
   int_max	= 0;
   associated_object = NULL;
   last_update_time=0;
   velocity_limit=50.0; /* Change value by at most 50 per second */
   box_length	      = 0;
   box_start_position = 0;
   box_end_position   = 0;
   track_length       = 0;
}

/****************************** GLUI_Scrollbar::common_construct() **********/
void GLUI_Scrollbar::common_construct(
  GLUI_Node *parent,
  const char *name, 
  int horz_vert,
  int data_type,
  void *data,
  int id, GLUI_CB callback
  /*,GLUI_Control *object,
  GLUI_InterObject_CB obj_cb*/
  )
{
  common_init();

  // make sure limits are wide enough to hold live value
  if (data_type==GLUI_SCROLL_FLOAT) {
    float lo = 0.0f, hi=1.0f;
    if (data) {
      float d = *(float*)(data);
      lo = MIN(lo, d);
      hi = MAX(hi, d);
    }
    this->set_float_limits(lo,hi);
    this->set_float_val(lo);
    this->live_type = GLUI_LIVE_FLOAT;
  } else {
    int lo = 0, hi=100;
    if (data) {
      int d = *(int*)(data);
      lo = MIN(lo, d);
      hi = MAX(hi, d);
    }
    this->set_int_limits(lo,hi);
    this->set_int_val(0);
    this->live_type = GLUI_LIVE_INT;
  }
  this->data_type = data_type;
  this->set_ptr_val( data );
  this->set_name(name);
  this->user_id = id;
  this->callback    = callback;
  //this->associated_object = object;
  //this->object_cb = obj_cb;
  this->horizontal=(horz_vert==GLUI_SCROLL_HORIZONTAL);
  if (this->horizontal) {
    this->h = GLUI_SCROLL_ARROW_HEIGHT;
    this->w = GLUI_TEXTBOX_WIDTH;
  } else {
    this->h = GLUI_TEXTBOX_HEIGHT;
    this->w = GLUI_SCROLL_ARROW_WIDTH;
  }
  parent->add_control( this );
  this->init_live();
}
 
/****************************** GLUI_Scrollbar::mouse_down_handler() **********/

int    GLUI_Scrollbar::mouse_down_handler( int local_x, int local_y )
{
  last_update_time=GLUI_Time()-1.0;
  this->state = find_arrow( local_x, local_y );
  GLUI_Master.glui_setIdleFuncIfNecessary();

  /*  printf( "spinner: mouse down  : %d/%d   arrow:%d\n", local_x, local_y,
      find_arrow( local_x, local_y ));
      */

  if ( state != GLUI_SCROLL_STATE_UP AND state != GLUI_SCROLL_STATE_DOWN)
    return true;

  reset_growth();

  /*** ints and floats behave a bit differently.  When you click on
    an int spinner, you expect the value to immediately go up by 1, whereas
    for a float it'll go up only by a fractional amount.  Therefore, we
    go ahead and increment by one for int spinners ***/
#if 1
  if ( data_type == GLUI_SCROLL_INT ) {
    // Allow for possibility of reversed limits
    int lo = MIN(int_min,int_max);
    int hi = MAX(int_min,int_max);
    int increase = int_min < int_max ? 1 : -1;
    int new_val = int_val;
    if ( state == GLUI_SCROLL_STATE_UP ) {
      new_val += increase;
    } else if ( state == GLUI_SCROLL_STATE_DOWN ) {
      new_val -= increase;
    }
    if (new_val >= lo && new_val <= hi && new_val!=int_val) {
      set_int_val(new_val);
      do_callbacks();
    }
  }
#endif
  do_click();  
  redraw();
  
  return false;
}


/******************************** GLUI_Scrollbar::mouse_up_handler() **********/

int    GLUI_Scrollbar::mouse_up_handler( int local_x, int local_y, bool inside )
{
  state = GLUI_SCROLL_STATE_NONE;
  GLUI_Master.glui_setIdleFuncIfNecessary();

  /*  printf("spinner: mouse up  : %d/%d    inside: %d\n",local_x,local_y,inside);              */

  /*glutSetCursor( GLUT_CURSOR_INHERIT );              */
  glutSetCursor( GLUT_CURSOR_LEFT_ARROW );

  redraw();

  /*  do_callbacks(); --- stub               */
  /*  if ( callback )               */
  /*  callback( this->user_id );              */
  
  return false;
}


/***************************** GLUI_Scrollbar::mouse_held_down_handler() ******/

int    GLUI_Scrollbar::mouse_held_down_handler( int local_x, int local_y,
                                                bool new_inside)
{
  int new_state;
  if ( state == GLUI_SCROLL_STATE_NONE )
    return false;
  
  /*  printf("spinner: mouse held: %d/%d    inside: %d\n",local_x,local_y,
      new_inside);
  */

  if ( state == GLUI_SCROLL_STATE_SCROLL) {   /* dragging? */
    do_drag( local_x-x_abs, local_y-y_abs );
  }
  else {                                      /* not dragging */
    new_state = find_arrow( local_x, local_y );

    if ( new_state == state ) {
      /** Still in same arrow **/
      do_click();
    }
  }
  redraw();

  return false;
}


/****************************** GLUI_Scrollbar::key_handler() **********/

int    GLUI_Scrollbar::key_handler( unsigned char key,int modifiers )
{
  return true;
}


/****************************** GLUI_Scrollbar::draw() **********/

void    GLUI_Scrollbar::draw( int x, int y )
{
  GLUI_DRAWINGSENTINAL_IDIOM

  if ( horizontal ) {
    draw_scroll_arrow(GLUI_SCROLL_ARROW_LEFT,  0, 0);
    draw_scroll_arrow(GLUI_SCROLL_ARROW_RIGHT, w-GLUI_SCROLL_ARROW_WIDTH, 0);
  } else {
    draw_scroll_arrow(GLUI_SCROLL_ARROW_UP,  0, 0);
    draw_scroll_arrow(GLUI_SCROLL_ARROW_DOWN, 0, h-GLUI_SCROLL_ARROW_HEIGHT);
  }
  draw_scroll();
}


/****************************** GLUI_Scrollbar::draw_scroll_arrow() **********/

void GLUI_Scrollbar::draw_scroll_arrow(int arrowtype, int x, int y)
{
  float offset=0;
  float L=3.5f,HC=7.f,R=10.5f;
  float T=4.5f,VC=8.f,B=11.5;
  const float verts[][6]={
    { L,10.5f,     R, 10.5f,      HC, 6.5f }, // up arrow
    { L,6.5f,      R, 6.5f,       HC,10.5f }, // down arrow
    { R-2,T,       R-2, B,        L+1,  VC   }, // left arrow
    { L+2,T,       L+2, B,        R-1,  VC   }  // right arrow
  };

  const float *tri = NULL;

  switch (arrowtype)
  {
    case GLUI_SCROLL_ARROW_UP:
      tri = verts[0];
      if (state & GLUI_SCROLL_STATE_UP) offset = 1;
      break;

    case GLUI_SCROLL_ARROW_DOWN:
      tri = verts[1];
      if (state & GLUI_SCROLL_STATE_DOWN) offset = 1;
      break;

    case GLUI_SCROLL_ARROW_LEFT:
      tri = verts[2];
      if (state & GLUI_SCROLL_STATE_DOWN) offset = 1;
      break;

    case GLUI_SCROLL_ARROW_RIGHT:
      tri = verts[3];
      if (state & GLUI_SCROLL_STATE_UP) offset = 1;
      break;

    default:
      return; /* tri is NULL */
  }

  glColor3ubv(&glui->bkgd_color.r);
  glRecti(x,y,x+GLUI_SCROLL_ARROW_WIDTH,y+GLUI_SCROLL_ARROW_HEIGHT);
  if (!offset) {
    glui->draw_raised_box(x,y+1,GLUI_SCROLL_ARROW_WIDTH-1,GLUI_SCROLL_ARROW_HEIGHT-1);
  } else {
    glColor3ub(128,128,128);
    glBegin(GL_LINE_LOOP);
    int x2=x+GLUI_SCROLL_ARROW_WIDTH, y2=y+GLUI_SCROLL_ARROW_HEIGHT;
    glVertex2i(x ,y); 
    glVertex2i(x2,y);
    glVertex2i(x2,y2); 
    glVertex2i(x ,y2);
    glEnd();
  }
  
  GLubyte black[]={0,0,0};
  GLubyte white[]={255,255,255};
  GLubyte  gray[]={128,128,128};
  GLubyte *color=black;
  if (!enabled) {
    offset = 1;
    color = white;
  }
  glTranslatef(x+offset,y+offset,0);
  glColor3ubv(color);
  glBegin(GL_TRIANGLES);
  glVertex2fv(tri); glVertex2fv(tri+2), glVertex2fv(tri+4);
  glEnd();
  glTranslatef(-(x+offset),-(y+offset),0);
  
  if (!enabled) { // once more!
    glTranslatef(x,y,0);
    glColor3ubv(gray);
    glBegin(GL_TRIANGLES);
    glVertex2fv(tri); glVertex2fv(tri+2), glVertex2fv(tri+4);
    glEnd();
    glTranslatef(-x,-y,0);
  }
}


void GLUI_Scrollbar::draw_scroll() {
  update_scroll_parameters();

  // Draw track using a checkerboard background
  const unsigned char scroll_bg[] = {
    0xD4, 0xD0, 0xC8, 0xFF, 0xFF, 0xFF,
    0xFF, 0xFF, 0xFF, 0xD4, 0xD0, 0xC8
  };
  glColor3f( 1.0, 1.0, 1.0 );
  glPixelStorei( GL_UNPACK_ALIGNMENT, 1 );
  glEnable( GL_TEXTURE_2D);
  glTexEnvf( GL_TEXTURE_ENV, GL_TEXTURE_ENV_MODE, GL_MODULATE );
  glTexParameteri( GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_REPEAT );
  glTexParameteri( GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_REPEAT );
  glTexParameteri( GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST );
  glTexParameteri( GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST );
  glTexImage2D( GL_TEXTURE_2D, 0, GL_RGB, 2, 2, 0, GL_RGB, GL_UNSIGNED_BYTE,
  	  scroll_bg);
  
  float y0 = horizontal? 0 : GLUI_SCROLL_ARROW_HEIGHT;
  float y1 = horizontal? h : h-GLUI_SCROLL_ARROW_HEIGHT;
  float x0 = horizontal? GLUI_SCROLL_ARROW_WIDTH   : 0;
  float x1 = horizontal? w-GLUI_SCROLL_ARROW_WIDTH : w;
  x0-=0.5; y0+=0.5;
  x1-=0.5; y1+=0.5;
  float dy = y1-y0;
  float dx = x1-x0;
  glBegin(GL_QUADS);
  glTexCoord2f(0,     0);        glVertex2f(x0,y0);
  glTexCoord2f(dx*0.5f,0);       glVertex2f(x1,y0);
  glTexCoord2f(dx*0.5f,dy*0.5f); glVertex2f(x1,y1);
  glTexCoord2f(0,      dy*0.5f); glVertex2f(x0,y1);
  glEnd();
  glDisable(GL_TEXTURE_2D);

  // Draw scroll box
  int box = box_start_position;
  if (horizontal) {
    box += GLUI_SCROLL_ARROW_WIDTH;
    draw_scroll_box(box,1,box_length,h);
  } else {
    box += GLUI_SCROLL_ARROW_HEIGHT+1;
    draw_scroll_box(0,box,w,box_length);
  }
}

/****************************** GLUI_Scrollbar::draw_scroll_box() **********/

void GLUI_Scrollbar::draw_scroll_box(int x, int y, int w, int h)
{
  if (!enabled) return;
  glColor3ubv(&glui->bkgd_color.r);
  glRecti(x,y,x+w,y+h);
  glui->draw_raised_box(x,y, w-1, h-1);
  
  if (active) {
    glEnable( GL_LINE_STIPPLE );
    glLineStipple( 1, 0x5555 );
    glColor3f( 0., 0., 0. );
    glBegin(GL_LINE_LOOP);
    int x1 = x+2, y1 = y+2, x2 = x+w-4, y2 = y+h-4;
    glVertex2i(x1,y1);
    glVertex2i(x2,y1);
    glVertex2i(x2,y2);
    glVertex2i(x1,y2);
    glEnd();
    glDisable( GL_LINE_STIPPLE );
  }
}



/**************************** update_scroll_parameters ***********/

void GLUI_Scrollbar::update_scroll_parameters() {
  track_length = horizontal? 
    this->w-GLUI_SCROLL_ARROW_WIDTH*2 :
    this->h-GLUI_SCROLL_ARROW_HEIGHT*2;
  if (data_type==GLUI_SCROLL_INT) 
  {
    if (int_max==int_min) 
      box_length=track_length;
    else {
      const int MIN_TAB = GLUI_SCROLL_BOX_STD_HEIGHT;
      //box_length = int(track_length/float(visible_range));
      //if (box_length < MIN_TAB)
        box_length = MIN_TAB;
    }
    float pixels_per_unit = (track_length-box_length)/float(int_max-int_min);
    if (horizontal)
      box_start_position = int((int_val-int_min)*pixels_per_unit);
    else 
      box_start_position = int((int_max-int_val)*pixels_per_unit);
    box_end_position = box_start_position+box_length;
  }
  else if (data_type==GLUI_SCROLL_FLOAT) 
  {
    if (float_max==float_min) 
      box_length=track_length;
    else {
      box_length = GLUI_SCROLL_BOX_STD_HEIGHT;
    }
    float pixels_per_unit = (track_length-box_length)/float(float_max-float_min);
    if (horizontal)
      box_start_position = int((float_val-float_min)*pixels_per_unit);
    else 
      box_start_position = int((float_max-float_val)*pixels_per_unit);
    box_end_position = box_start_position+box_length;
  }
}


/********************************* GLUI_Scrollbar::special_handler() **********/

int    GLUI_Scrollbar::special_handler( int key,int modifiers )
{
  if ( !horizontal && key == GLUT_KEY_UP ) {
    mouse_down_handler( x_abs + w - GLUI_SCROLL_ARROW_WIDTH + 1,
      y_abs + 1 );
    mouse_up_handler( x_abs + w - GLUI_SCROLL_ARROW_WIDTH + 1,
      y_abs + 1, true );
  }
  else if ( !horizontal && key == GLUT_KEY_DOWN ) {
    mouse_down_handler(x_abs + w - GLUI_SCROLL_ARROW_WIDTH + 1,
      y_abs+1+GLUI_SCROLL_ARROW_HEIGHT);
    mouse_up_handler( x_abs + w - GLUI_SCROLL_ARROW_WIDTH + 1,
      y_abs+1 +GLUI_SCROLL_ARROW_HEIGHT,
      true );
  }
  if ( horizontal && key == GLUT_KEY_LEFT ) {
    mouse_down_handler( x_abs + 1,y_abs + 1 );
    mouse_up_handler( x_abs + 1,   y_abs + 1, true );
  }
  else if ( horizontal && key == GLUT_KEY_RIGHT ) {
    mouse_down_handler(x_abs + w - GLUI_SCROLL_ARROW_WIDTH + 1,
      y_abs+1);
    mouse_up_handler( x_abs + w - GLUI_SCROLL_ARROW_WIDTH + 1,
      y_abs+1,
      true );
  }
  else if ( key == GLUT_KEY_HOME ) {  /** Set value to limit top - 
                                          or increment by 10 **/
  }
  else if ( key == GLUT_KEY_END ) {  
  }

  return true;
}


/************************************ GLUI_Scrollbar::update_size() **********/

void   GLUI_Scrollbar::update_size( void )
{
  if (horizontal) {
    h = GLUI_SCROLL_ARROW_HEIGHT;
    if (associated_object) {
      this->w = ((GLUI_Control *)associated_object)->w;
    }
  }
  else {
    w = GLUI_SCROLL_ARROW_WIDTH;
    if (associated_object) {
      this->h = ((GLUI_Control *)associated_object)->h;
    }
  }
}
 

/************************************ GLUI_Scrollbar::find_arrow() ************/

int    GLUI_Scrollbar::find_arrow( int local_x, int local_y )
{

  local_x = local_x-x_abs; 
  local_y = local_y-y_abs;

  if (horizontal) 
  {
    if ( local_y >=  h-GLUI_SCROLL_ARROW_HEIGHT-3 && local_y <= h) 
    {
      update_scroll_parameters();
      if ( local_x >= 0 AND local_x <= (GLUI_SCROLL_ARROW_WIDTH+box_start_position) )
      {
        return GLUI_SCROLL_STATE_DOWN;
      }
      if ( local_x >= (GLUI_SCROLL_ARROW_WIDTH+box_end_position)
           AND local_x <= (w+GLUI_SCROLL_ARROW_WIDTH) ) 
      {
        return GLUI_SCROLL_STATE_UP;
      }
      return GLUI_SCROLL_STATE_SCROLL;
    }
  }
  else 
  {
    if ( local_x >=  w-GLUI_SCROLL_ARROW_WIDTH-3 && local_x <= w) 
    {
      update_scroll_parameters();
      if ( local_y >= 0 AND local_y <= (GLUI_SCROLL_ARROW_HEIGHT+box_start_position) )
      {
        return GLUI_SCROLL_STATE_UP;
      }
      if ( local_y >= (GLUI_SCROLL_ARROW_HEIGHT+box_end_position)
           AND local_y <= (h+GLUI_SCROLL_ARROW_HEIGHT) )
      {
        return GLUI_SCROLL_STATE_DOWN;
      }
      return GLUI_SCROLL_STATE_SCROLL;
    }
  }

  return GLUI_SCROLL_STATE_NONE;
}

/***************************************** GLUI_Scrollbar::do_click() **********/

void    GLUI_Scrollbar::do_click( void )
{
  int    direction = 0;

  if ( state == GLUI_SCROLL_STATE_UP )
    direction = +1;
  else if ( state == GLUI_SCROLL_STATE_DOWN )
    direction = -1;

  if (data_type==GLUI_SCROLL_INT&&int_min>int_max) direction*=-1;
  if (data_type==GLUI_SCROLL_FLOAT&&float_min>float_max) direction*=-1;

  increase_growth();

  float modifier_factor = 1.0;
  float incr = growth * modifier_factor * user_speed ;
  
  double frame_time=GLUI_Time()-last_update_time;
  double frame_limit=velocity_limit*frame_time;
  if (incr>frame_limit) incr=frame_limit; /* don't scroll faster than limit */
  last_update_time=GLUI_Time();

  float new_val = float_val;

  new_val += direction * incr;
  if (1 || data_type==GLUI_SCROLL_FLOAT) set_float_val(new_val);
  if (0 && data_type==GLUI_SCROLL_INT) set_int_val((int)new_val);
  //printf("do_click: incr %f  val=%f  float_val=%f\n",incr,new_val,float_val);

  /*** Now update live variable and do callback.  We don't want
    to do the callback on each iteration of this function, just on every 
    i^th iteration, where i is given by GLUI_SCROLL_CALLBACK_INTERVAL ****/
  callback_count++;
  if ( (callback_count % GLUI_SCROLL_CALLBACK_INTERVAL ) == 0 )
    do_callbacks();

}


/***************************************** GLUI_Scrollbar::do_drag() **********/

void    GLUI_Scrollbar::do_drag( int x, int y )
{
  int   direction = 0;
  float incr, modifier_factor;
  /* int delta_x;              */
  int new_int_val = int_val;
  float new_float_val = float_val;

  int free_len = track_length-box_length;
  if (free_len == 0) return;

  modifier_factor = 1.0;
  if ( state == GLUI_SCROLL_STATE_SCROLL) {
    update_scroll_parameters();

    int hbox = box_length/2;
    if (horizontal) {
      int track_v = x-GLUI_SCROLL_ARROW_WIDTH;
      new_int_val = int_min + (track_v-hbox)*(int_max-int_min)/free_len;
      new_float_val = float_min + (track_v-hbox)*(float_max-float_min)/float(free_len); 
    } else {
      int track_v = y-GLUI_SCROLL_ARROW_HEIGHT;
      new_int_val = int_max - (track_v-hbox)*(int_max-int_min)/free_len;
      new_float_val = float_max - (track_v-hbox)*(float_max-float_min)/float(free_len); 
    }
  }
  else {
    if ( state == GLUI_SCROLL_STATE_UP )
      direction = +1;
    else if ( state == GLUI_SCROLL_STATE_DOWN )
      direction = -1;
    incr = growth * direction * modifier_factor * user_speed;
    new_int_val += direction;
    new_float_val += direction * (float_max-float_min)/free_len;
  }
  last_y = y;
  last_x = x;

  /*** Now update live variable and do callback.  We don't want
    to do the callback on each iteration of this function, just on every 
    i^th iteration, where i is given by GLUI_SCROLL_CALLBACK_INTERVAL ****/
  if(data_type==GLUI_SCROLL_INT)
    set_int_val(new_int_val);
  else if (data_type==GLUI_SCROLL_FLOAT)
    set_float_val(new_float_val);

  callback_count++;
  if ( (callback_count % GLUI_SCROLL_CALLBACK_INTERVAL ) == 0 )
    do_callbacks();
}


/***************************************** GLUI_Scrollbar::needs_idle() ******/

bool GLUI_Scrollbar::needs_idle( void ) const
{
  if  (state == GLUI_SCROLL_STATE_UP OR state == GLUI_SCROLL_STATE_DOWN ) {
    return true;
  }
  else {
    return false;
  }
}

/***************************************** GLUI_Scrollbar::idle() **********/

void    GLUI_Scrollbar::idle( void )
{
  if ( NOT needs_idle() )
    return;
  else
    do_click();
}


/************************************ GLUI_Scrollbar::do_callbacks() **********/

void    GLUI_Scrollbar::do_callbacks( void )
{

  /*    *******************************************/

  if ( NOT first_callback ) {
    if ( data_type == GLUI_SCROLL_INT AND int_val == last_int_val ) {
      return;
    }
    if ( data_type == GLUI_SPINNER_FLOAT AND float_val == last_float_val ) {
      return;
    }
  }

  if (associated_object == NULL) {
    this->execute_callback();
  }
  else  {                      // Use internal Callbacks
    if (object_cb) {
      //object_cb(associated_object, int_val);
      object_cb(this);
    }
  }
  last_int_val   = int_val;
  last_float_val = float_val;
  first_callback = false;
}


/********************************** GLUI_Scrollbar::set_float_val() ************/

void   GLUI_Scrollbar::set_float_val( float new_val )
{
  // Allow for the possibility that the limits are reversed
  float hi = MAX(float_min,float_max);
  float lo = MIN(float_min,float_max);
  if (new_val > hi)
    new_val = hi;
  if (new_val < lo)
    new_val = lo;
  last_float_val = float_val;
  float_val = new_val;
  int_val = (int)new_val;

  redraw();

  /*** Now update the live variable ***/
  output_live(true);
}


/********************************** GLUI_Scrollbar::set_int_val() ************/

void   GLUI_Scrollbar::set_int_val( int new_val )
{
  // Allow for the possibility that the limits are reversed
  int hi = MAX(int_min,int_max);
  int lo = MIN(int_min,int_max);
  if (new_val > hi)
    new_val = hi;
  if (new_val < lo)
    new_val = lo;
  last_int_val = int_val;
  float_val = int_val = new_val;

  redraw();

  /*** Now update the live variable ***/
  output_live(true);
}

/*********************************** GLUI_Scrollbar::set_float_limits() *********/

void   GLUI_Scrollbar::set_float_limits( float low, float high, int limit_type )
{
  if (limit_type != GLUI_LIMIT_CLAMP) {
    // error!
  }
  float_min = low;
  float_max = high;
  // Allow for possiblitly of reversed limits
  float lo = MIN(low,high);
  float hi = MAX(low,high);
  if (float_val<lo) set_float_val(lo);
  if (float_val>hi) set_float_val(hi);
}
 

/*********************************** GLUI_Scrollbar::set_int_limits() *********/

void   GLUI_Scrollbar::set_int_limits( int low, int high, int limit_type )
{
  if (limit_type != GLUI_LIMIT_CLAMP) {
    // error!
  }
  int_min = low;
  int_max = high;    
  // Allow for possiblitly of reversed limits
  int lo = MIN(low,high);
  int hi = MAX(low,high);
  if (int_val<lo) set_int_val(lo);
  if (int_val>hi) set_int_val(hi);
  float_min = low;
  float_max = high;
}
 

/*********************************** GLUI_Scrollbar::reset_growth() *************/

void    GLUI_Scrollbar::reset_growth( void )
{
  growth = fabs(float_max - float_min) / float(GLUI_SCROLL_GROWTH_STEPS);
  if (data_type == GLUI_SCROLL_INT && growth<1) growth=1;
}


/******************************* GLUI_Scrollbar::increase_growth() *************/

void    GLUI_Scrollbar::increase_growth( void )
{
  float range=0;
  if (data_type==GLUI_SCROLL_FLOAT)
    range = fabs(float_max-float_min);
  else 
    range = fabs(float(int_max-int_min));
  if ( growth < (range / float(GLUI_SCROLL_MIN_GROWTH_STEPS)) )
    growth *= growth_exp;
  return;
}



