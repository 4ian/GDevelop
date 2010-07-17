/****************************************************************************
  
  GLUI User Interface Toolkit
  ---------------------------

     glui_list.cpp - GLUI_List control class


          --------------------------------------------------

  Copyright (c) 2004 John Kew

  This program is freely distributable without licensing fees and is
  provided without guarantee or warrantee expressed or implied. This
  program is -not- in the public domain.

*****************************************************************************/

#include "glui_internal_control.h"
#include <cmath>
#include <sys/timeb.h>

/****************************** GLUI_List::GLUI_List() **********/

GLUI_List::GLUI_List( GLUI_Node *parent, bool scroll,
                      int id, GLUI_CB callback
                      /*,GLUI_Control *object 
                      GLUI_InterObject_CB obj_cb*/)
{
  common_construct(parent, NULL, scroll, id, callback/*, object, obj_cb*/);
}

/****************************** GLUI_List::GLUI_List() **********/

GLUI_List::GLUI_List( GLUI_Node *parent,
                      GLUI_String& live_var, bool scroll, 
                      int id, 
                      GLUI_CB callback 
                      /* ,GLUI_Control *object
                      ,GLUI_InterObject_CB obj_cb*/ )
{
  common_construct(parent, &live_var, scroll, id, callback/*, object, obj_cb*/);
}

/****************************** GLUI_List::common_construct() **********/

void GLUI_List::common_construct(
  GLUI_Node *parent,
  GLUI_String* data, bool scroll, 
  int id, 
  GLUI_CB callback
  /*,GLUI_Control *object
  , GLUI_InterObject_CB obj_cb*/)
{
  common_init();
  GLUI_Node *list_panel = parent;

  if (scroll) {
    GLUI_Panel *p = new GLUI_Panel(parent,"",GLUI_PANEL_NONE);
    p->x_off = 1;
    list_panel = p;
  }
  this->ptr_val     = data;
  if (data) {
    this->live_type = GLUI_LIVE_STRING;
  }
  this->user_id     = id;
  this->callback    = callback;
  this->name        = "list";
  list_panel->add_control( this );
  if (scroll) 
  {
    new GLUI_Column(list_panel, false);
    scrollbar = 
      new GLUI_Scrollbar(list_panel,
                         "scrollbar",
                         GLUI_SCROLL_VERTICAL,
                         GLUI_SCROLL_INT);
    scrollbar->set_object_callback(GLUI_List::scrollbar_callback, this);
    scrollbar->set_alignment(GLUI_ALIGN_LEFT);
    // scrollbar->can_activate = false; //kills ability to mouse drag too
  }
  init_live();
}

/****************************** GLUI_List::mouse_down_handler() **********/
int    GLUI_List::mouse_down_handler( int local_x, int local_y )
{
  int tmp_line;
  unsigned long int ms;
  timeb time;
  ftime(&time);
  ms = time.millitm + (time.time)*1000;

  tmp_line = find_line( local_x-x_abs, local_y-y_abs-5 );  
  if ( tmp_line == -1 ) {
    if ( glui )
      glui->deactivate_current_control(  );
    return false;
  }

  if (tmp_line < num_lines) {
    curr_line = tmp_line;
    if (scrollbar)
      scrollbar->set_int_val(curr_line);
    this->execute_callback();
    if (associated_object != NULL)
      if (cb_click_type == GLUI_SINGLE_CLICK) {
        if (obj_cb) {
          // obj_cb(associated_object, user_id);
          obj_cb(this);
        }
      } else {
        if (last_line == curr_line && (ms - last_click_time) < 300) {
          //obj_cb(associated_object, user_id);
          obj_cb(this);
        } else {
          last_click_time = ms;
          last_line = curr_line;
        }
      }
    if ( can_draw())
      update_and_draw_text();
  }

  return true;
}




/******************************** GLUI_List::mouse_up_handler() **********/

int    GLUI_List::mouse_up_handler( int local_x, int local_y, bool inside )
{
  return false;
}


/***************************** GLUI_List::mouse_held_down_handler() ******/

int    GLUI_List::mouse_held_down_handler( int local_x, int local_y,
                           bool new_inside)
{
  return false;
}


/****************************** GLUI_List::key_handler() **********/

int    GLUI_List::key_handler( unsigned char key,int modifiers )
{


  draw_text_only = false;  /** Well, hack is not yet working **/
  update_and_draw_text();
  draw_text_only = false;

  return true;
}


/****************************** GLUI_List::activate() **********/

void    GLUI_List::activate( int how )
{
//   if ( debug )
//     dump( stdout, "-> ACTIVATE" );
  active = true;

  if ( how == GLUI_ACTIVATE_MOUSE )
    return;  /* Don't select everything if activated with mouse */

}


/****************************** GLUI_List::deactivate() **********/

void    GLUI_List::deactivate( void )
{
  active = false;
  redraw();
}

/****************************** GLUI_List::draw() **********/

void    GLUI_List::draw( int x, int y )
{
  int line = 0;
  int box_width;
  GLUI_List_Item *item;
 
  GLUI_DRAWINGSENTINAL_IDIOM

  /* Bevelled Border */
  glBegin( GL_LINES );
  glColor3f( .5, .5, .5 );
  glVertex2i( 0, 0 );     glVertex2i( w, 0 );
  glVertex2i( 0, 0 );     glVertex2i( 0, h );     

  glColor3f( 1., 1., 1. );
  glVertex2i( 0, h );     glVertex2i( w, h );
  glVertex2i( w, h );     glVertex2i( w, 0 );

  if ( enabled )
    glColor3f( 0., 0., 0. );
  else
    glColor3f( .25, .25, .25 );
  glVertex2i( 1, 1 );     glVertex2i( w-1, 1 );
  glVertex2i( 1, 1 );     glVertex2i( 1, h-1 );

  glColor3f( .75, .75, .75 );
  glVertex2i( 1, h-1 );     glVertex2i( w-1, h-1 );
  glVertex2i( w-1, h-1 );   glVertex2i( w-1, 1 );
  glEnd();

  /* Draw Background if enabled*/
  if (enabled) {
    glColor3f( 1., 1., 1. );
    glDisable( GL_CULL_FACE );
    glBegin( GL_QUADS );
    glVertex2i( 2, 2 );     glVertex2i( w-2, 2 );
    glVertex2i( w-2, h-2 );               glVertex2i(2, h-2 );
    glEnd();
  } else {
    glColor3f( .8, .8, .8 );
    glDisable( GL_CULL_FACE );
    glBegin( GL_QUADS );
    glVertex2i( 2, 2 );     glVertex2i( w-2, 2 );
    glVertex2i( w-2, h-2 );               glVertex2i(2, h-2 );
    glEnd();
  }

  /* Figure out how wide the box is */
  box_width = get_box_width();

  /* Figure out which lines are visible*/

  visible_lines = (int)(h-20)/15;

  item = (GLUI_List_Item *) items_list.first_child();

  line = 0;
  while (item) {
    if (line < start_line) {
      line++;
      item = (GLUI_List_Item *) item->next();
      continue;
    }
    if (line >= start_line && line <= (start_line+visible_lines)) {
      if (curr_line == line)
	draw_text(item->text.c_str(),1,0,(line - start_line)*15);
      else
	draw_text(item->text.c_str(),0,0,(line - start_line)*15);
    }
    line++;
    item = (GLUI_List_Item *) item->next();
  }

  if (scrollbar) {
    scrollbar->set_int_limits(MAX(0,num_lines-visible_lines), 0);
    glPushMatrix();
    glTranslatef(scrollbar->x_abs-x_abs, scrollbar->y_abs-y_abs,0.0);
    scrollbar->draw_scroll();
    glPopMatrix();
  }
}

/********************************* GLUI_List::draw_text() ****************/

void    GLUI_List::draw_text(const char *t, int selected, int x, int y )
{
  int text_x, i, x_pos;
  int box_width;

  GLUI_DRAWINGSENTINAL_IDIOM

  /** Find where to draw the text **/

  text_x = 2 + GLUI_LIST_BOXINNERMARGINX;

  /** Draw selection area dark **/
  if ( enabled && selected ) {
    glColor3f( 0.0f, 0.0f, .6f );
    glBegin( GL_QUADS );
    glVertex2i(text_x, y+5 );    glVertex2i( w-text_x, y+5 );
    glVertex2i(w-text_x, y+19 );    glVertex2i(text_x, y+19 );
    glEnd();
  }
  box_width = get_box_width();   

  if ( !selected || !enabled ) {   /* No current selection */
    x_pos = text_x;                /*  or control disabled */
    if ( enabled )
      glColor3b( 0, 0, 0 );
    else
      glColor3b( 32, 32, 32 );
    
    glRasterPos2i( text_x, y+15);
    i = 0;
    while( t[i] != '\0' && substring_width(t,0,i) < box_width) {
      glutBitmapCharacter( get_font(), t[i] );
      x_pos += char_width( t[i] );
      i++;
    }
  }
  else { /* There is a selection */
    i = 0;
    x_pos = text_x;
    glColor3f( 1., 1., 1. );
    glRasterPos2i( text_x, y+15);
    while( t[i] != '\0' && substring_width(t,0,i) < box_width) {
      glutBitmapCharacter( get_font(), t[i] );
      x_pos += char_width( t[i] );
      i++;
    }
  }
}


int GLUI_List::find_line(int x, int y) {
  return start_line + ((int)(y/15));
}

int      GLUI_List::get_box_width() {
   return MAX( this->w 
		   - 6     /*  2 * the two-line box border */ 
		   - 2 * GLUI_LIST_BOXINNERMARGINX, 0 );

}

/******************************** GLUI_List::substring_width() *********/
int  GLUI_List::substring_width( const char *t, int start, int end )
{
  int i, width;

  width = 0;

  for( i=start; i<=end; i++ )
    width += char_width( t[i] ); 

  return width;
}
 

/***************************** GLUI_List::update_and_draw_text() ********/

void   GLUI_List::update_and_draw_text( void )
{
  if ( NOT can_draw() )
    return;

  //update_substring_bounds();
  /*  printf( "ss: %d/%d\n", substring_start, substring_end );                  */

  redraw();
}


/********************************* GLUI_List::special_handler() **********/

int    GLUI_List::special_handler( int key,int modifiers )
{
  if ( NOT glui )
    return false;

  if ( key == GLUT_KEY_DOWN ) {
     if (curr_line < num_lines) {
       curr_line++;
       if (curr_line > start_line+visible_lines)
	 start_line++;
     }
  } else if ( key == GLUT_KEY_UP ) {
     if (curr_line > 0) {
       curr_line--;
       if (curr_line < start_line)
	 start_line--;
     }
  }

  if (scrollbar)
    scrollbar->set_int_val(curr_line);
  redraw();
  return true;
}


/************************************ GLUI_List::update_size() **********/

void   GLUI_List::update_size( void )
{
  if ( NOT glui )
    return;

  if ( w < GLUI_LIST_MIN_TEXT_WIDTH )
      w = GLUI_LIST_MIN_TEXT_WIDTH;
}

/**************************************** GLUI_Listbox::add_item() **********/

int  GLUI_List::add_item( int id, const char *new_text )
{
  GLUI_List_Item *new_node = new GLUI_List_Item;
  GLUI_List_Item *head;

  new_node->text = new_text;
  new_node->id = id;

  head = (GLUI_List_Item*) items_list.first_child();
  new_node->link_this_to_parent_last( &items_list );

  if ( head == NULL ) {
    /***   This is first item added   ***/

    int_val       = id+1;  /** Different than id **/
    //    do_selection( id );
    last_live_int = id;

    if( glui )
      glui->post_update_main_gfx();
  }
  num_lines++;
  if (scrollbar)
    scrollbar->set_int_limits(MAX(num_lines-visible_lines,0), 0);

  return true;
}

/************************************** GLUI_Listbox::delete_() **********/

int  GLUI_List::delete_all()
{
  GLUI_List_Item *item;

  item = (GLUI_List_Item *) items_list.first_child();
  while( item ) {
    item->unlink();
    delete item;
    item = (GLUI_List_Item *) items_list.first_child();
  }

  num_lines = 0;
  curr_line = 0;

  return true;
}


/************************************** GLUI_Listbox::delete_item() **********/

int  GLUI_List::delete_item( const char *text )
{
  GLUI_List_Item *node = get_item_ptr( text );

  if ( node ) {
    node->unlink();
    delete node;
    num_lines--;
    return true;
  }
  else {
    return false;
  }
}


/************************************** GLUI_Listbox::delete_item() **********/

int  GLUI_List::delete_item( int id )
{
  GLUI_List_Item *node = get_item_ptr( id );

  if ( node ) {
    node->unlink();
    delete node;
    num_lines--;
    return true;
  }
  else {
    return false;
  }
}


/************************************ GLUI_Listbox::get_item_ptr() **********/

GLUI_List_Item *GLUI_List::get_item_ptr( const char *text )
{
  GLUI_List_Item *item;

  item = (GLUI_List_Item *) items_list.first_child();
  while( item ) {
    if ( item->text == text )
      return item;
    
    item = (GLUI_List_Item *) item->next();
  }

  return NULL;
}


/************************************ GLUI_Listbox::get_item_ptr() **********/

GLUI_List_Item *GLUI_List::get_item_ptr( int id )
{
  GLUI_List_Item *item;

  item = (GLUI_List_Item *) items_list.first_child();
  while( item ) {
    if ( item->id == id )
      return item;
    
    item = (GLUI_List_Item *) item->next();
  }

  return NULL;
}

/**************************************** GLUI_List::mouse_over() ********/

int    GLUI_List::mouse_over( int state, int x, int y )
{
  glutSetCursor( GLUT_CURSOR_LEFT_ARROW );

  return true;
}

void GLUI_List::scrollbar_callback(GLUI_Control *my_scrollbar) {
  GLUI_Scrollbar *sb = dynamic_cast<GLUI_Scrollbar*>(my_scrollbar);
  if (!sb) return;
  GLUI_List* me = (GLUI_List*) sb->associated_object;
  if (me->scrollbar == NULL)
    return;
  int new_start_line = sb->get_int_val(); // TODO!!
  me->start_line = new_start_line;

  if ( me->can_draw() )
    me->update_and_draw_text();
}
