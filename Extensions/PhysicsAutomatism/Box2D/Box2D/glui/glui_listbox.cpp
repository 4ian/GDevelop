/****************************************************************************
  
  GLUI User Interface Toolkit
  ---------------------------

     glui_listbox - GLUI_ListBox control class


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

#include "glui_internal_control.h"

/****************************** GLUI_Listbox::GLUI_Listbox() **********/
GLUI_Listbox::GLUI_Listbox( GLUI_Node *parent,
                            const char *name, int *value_ptr,
                            int id, 
                            GLUI_CB cb)
{
  common_init();
  set_ptr_val( value_ptr );
  user_id    = id;
  set_name( name );
  callback    = cb;

  parent->add_control( this );

  init_live();
}


/****************************** GLUI_Listbox::mouse_down_handler() **********/

int    GLUI_Listbox::mouse_down_handler( int local_x, int local_y )
{
  return false;
}


/****************************** GLUI_Listbox::mouse_up_handler() **********/

int    GLUI_Listbox::mouse_up_handler( int local_x, int local_y, bool inside )
{

  return false;
}


/****************************** GLUI_Listbox::mouse_held_down_handler() ******/

int    GLUI_Listbox::mouse_held_down_handler( int local_x, int local_y,
					      bool inside)
{
  
  return false;
}


/****************************** GLUI_Listbox::key_handler() **********/

int    GLUI_Listbox::key_handler( unsigned char key,int modifiers )
{
  return false;
}


/****************************** GLUI_Listbox::draw() **********/

void    GLUI_Listbox::draw( int x, int y )
{
  GLUI_DRAWINGSENTINAL_IDIOM
  int name_x;

  /*  draw_active_area();              */

  name_x = MAX(text_x_offset - string_width(this->name) - 3,0);
  draw_name( name_x , 13);
  draw_box_inwards_outline( text_x_offset, w,
			    0, h );

  if ( NOT active ) {
    draw_box( text_x_offset+3, w-2, 2, h-2, 1.0, 1.0, 1.0 );
    if ( NOT enabled )
      glColor3b( 32, 32, 32 );
    else
      glColor3f( 0.0, 0.0, 0.0 );
    glRasterPos2i( text_x_offset+5, 13 );
    draw_string( curr_text );
  }
  else {
    draw_box( text_x_offset+3, w-2, 2, h-2, .0, .0, .6 );
    glColor3f( 1.0, 1.0, 1.0 );
    glRasterPos2i( text_x_offset+5, 13 );
    draw_string( curr_text );
  }


  if ( enabled ) {
    glui->std_bitmaps.
      draw(GLUI_STDBITMAP_LISTBOX_UP,
	   w-glui->std_bitmaps.width(GLUI_STDBITMAP_LISTBOX_UP)-1,
	   2 );
  }
  else {
    glui->std_bitmaps.
      draw(GLUI_STDBITMAP_LISTBOX_UP_DIS,
	   w-glui->std_bitmaps.width(GLUI_STDBITMAP_LISTBOX_UP)-1,
	   2 );
  }
}


/************************************ GLUI_Listbox::update_si() **********/
void   GLUI_Listbox::update_size( void )
{
  recalculate_item_width();
}

/********************************* GLUI_Listbox::set_int_val() **************/

void    GLUI_Listbox::set_int_val( int new_val )
{
  /*  int_val = new_val;              */

  do_selection( new_val );

  /*** Update the variable we're (possibly) pointing to, and update the main gfx ***/
  output_live(true);
}

/**************************************** GLUI_Listbox::add_item() **********/

int  GLUI_Listbox::add_item( int id, const char *new_text )
{
  GLUI_Listbox_Item *new_node = new GLUI_Listbox_Item;
  GLUI_Listbox_Item *head;

  new_node->text = new_text;
  new_node->id = id;

  head = (GLUI_Listbox_Item*) items_list.first_child();
  new_node->link_this_to_parent_last( &items_list );

  if ( head == NULL ) {
    /***   This is first item added   ***/

    int_val       = id+1;  /** Different than id **/
    do_selection( id );
    last_live_int = id;

    if( glui )
      glui->post_update_main_gfx();
  }
  if (recalculate_item_width()) glui->refresh();

  return true;
}


/************************************** GLUI_Listbox::delete_item() **********/

int  GLUI_Listbox::delete_item( const char *text )
{
  GLUI_Listbox_Item *node = get_item_ptr(text);

  if (node) 
  {
    node->unlink();
    delete node;
    return true;
  }
  if (recalculate_item_width()) glui->refresh();

  return false;
}


/************************************** GLUI_Listbox::delete_item() **********/

int  GLUI_Listbox::delete_item(int id)
{
  GLUI_Listbox_Item *node = get_item_ptr(id);

  if (node) 
  {
    node->unlink();
    delete node;
    return true;
  }
  if (recalculate_item_width()) glui->refresh();
  
  return false;
}


/************************************** GLUI_Listbox::sort_items() **********/

int  GLUI_Listbox::sort_items( void )
{
  return false;
}


/********************************************* GLUI_Listbox::dump() **********/

void     GLUI_Listbox::dump( FILE *output )
{
  GLUI_Listbox_Item *item;

  /*  printf( "%p\n", (char*) name );              */

  fprintf( output, "Listbox: %s\n", name.c_str() );

  item = (GLUI_Listbox_Item *) items_list.first_child();
  while( item ) {
    fprintf( output, "         %3d : %s\n", item->id, item->text.c_str() );
    
    item = (GLUI_Listbox_Item *) item->next();
  }
}


/************************************ GLUI_Listbox::get_item_ptr() **********/

GLUI_Listbox_Item *GLUI_Listbox::get_item_ptr( const char *text )
{
  GLUI_Listbox_Item *item;

  item = (GLUI_Listbox_Item *) items_list.first_child();
  while( item ) {
    if ( item->text == text )
      return item;
    
    item = (GLUI_Listbox_Item *) item->next();
  }

  return NULL;
}


/************************************ GLUI_Listbox::get_item_ptr() **********/

GLUI_Listbox_Item *GLUI_Listbox::get_item_ptr( int id )
{
  GLUI_Listbox_Item *item;

  item = (GLUI_Listbox_Item *) items_list.first_child();
  while( item ) {
    if ( item->id == id )
      return item;
    
    item = (GLUI_Listbox_Item *) item->next();
  }

  return NULL;
}


/************************************ GLUI_Listbox::mouse_over() **********/

static void listbox_callback( int i )
{
  int old_val;

  if ( NOT GLUI_Master.curr_left_button_glut_menu OR 
       !dynamic_cast<GLUI_Listbox*>(GLUI_Master.curr_left_button_glut_menu) ) 
    return;

  old_val = ((GLUI_Listbox*)GLUI_Master.curr_left_button_glut_menu)->int_val;
  ((GLUI_Listbox*)GLUI_Master.curr_left_button_glut_menu)->set_int_val(i);

  /****   If value changed, execute callback   ****/
  if ( old_val != 
       ((GLUI_Listbox*)GLUI_Master.curr_left_button_glut_menu)->int_val ) {
    ((GLUI_Listbox*)GLUI_Master.curr_left_button_glut_menu)->execute_callback();
  }
}


/*************************************** GLUI_Listbox::mouse_over() **********/

int     GLUI_Listbox::mouse_over( int state, int x, int y )
{
  GLUI_Listbox_Item *item;

  /*  printf( "x/y:   %d/%d\n", x, y );              */

  if ( state AND enabled AND x > x_abs + text_x_offset) {
    /****  Build a GLUT menu for this listbox   ***/
    
    /*	printf( "%d %d\n", x, y );              */

    glut_menu_id = glutCreateMenu(listbox_callback);

    item = (GLUI_Listbox_Item *) items_list.first_child();
    while( item ) {
      glutAddMenuEntry( item->text.c_str(), item->id );
      item = (GLUI_Listbox_Item *) item->next();
    }

    glutAttachMenu( GLUT_LEFT_BUTTON);
    
    GLUI_Master.set_left_button_glut_menu_control( this );
  }
  else if ( glut_menu_id != -1 ) {
    /*    printf( "OUT\n" );              */
    glutDetachMenu( GLUT_LEFT_BUTTON );
    glutDestroyMenu( glut_menu_id );
    glut_menu_id = -1;
  }

  return true;
}


/************************************ GLUI_Listbox::do_selection() **********/

int    GLUI_Listbox::do_selection( int item_num )
{
  GLUI_Listbox_Item *item, *sel_item;

  /***  Is this item already selected?  ***/
  if ( item_num == int_val )
    return false;

  sel_item = NULL;
  item     = (GLUI_Listbox_Item *) items_list.first_child();
  while( item ) {
    if ( item->id == item_num ) {
      sel_item = item;
      break;
    }
    
    item = (GLUI_Listbox_Item *) item->next();
  }

  if ( NOT sel_item )
    return false;

  /*  printf( "-> %s\n", (char*) sel_item->text );              */

  int_val = item_num;
  curr_text = sel_item->text;
  redraw();

  return true;
}


/*********************************** GLUI_Listbox::~GLUI_Listbox() **********/

GLUI_Listbox::~GLUI_Listbox()
{
  GLUI_Listbox_Item *item = (GLUI_Listbox_Item *) items_list.first_child();

  while (item) 
  {
    GLUI_Listbox_Item *tmp = item;
    item = (GLUI_Listbox_Item *) item->next();
    delete tmp;
  }
}

/****************************** GLUI_Listbox::special_handler() **********/

int    GLUI_Listbox::special_handler( int key,int modifiers )
{
  GLUI_Listbox_Item *node, *new_node;

  node     = get_item_ptr( int_val );
  new_node = NULL;

  if ( key == GLUT_KEY_DOWN ) {
    new_node = (GLUI_Listbox_Item*) node->next();
  }
  else if ( key == GLUT_KEY_UP ) {
    new_node = (GLUI_Listbox_Item*) node->prev();
  }
  else if ( key == GLUT_KEY_HOME ) {
    new_node = (GLUI_Listbox_Item*) items_list.first_child();
  }
  else if ( key == GLUT_KEY_END ) {
    new_node = (GLUI_Listbox_Item*) items_list.last_child();
  }

  if ( new_node != NULL AND new_node != node ) {
    node = new_node;
    set_int_val( node->id );
    execute_callback();
    return true;
  }
  else {
    return false;
  }
}


/************************* GLUI_Listbox::recalculate_item_width( void ) ***********/
/** Change w and return true if we need to be widened to fit the current items. */
bool    GLUI_Listbox::recalculate_item_width( void )
{
  int item_text_size;

  if ( NOT glui )
    return false;

  /* Find the title size */
  text_x_offset = string_width( name );

  /* Find the longest item string ***/
  item_text_size = 0;   
 
  GLUI_Listbox_Item *item = (GLUI_Listbox_Item *) items_list.first_child();
  while( item ) {
    item_text_size = MAX(item_text_size,string_width(item->text));
    item = (GLUI_Listbox_Item *) item->next();
  }
  
  /* Sum up our layout: name, item, and drop-down marker */
  int new_wid=text_x_offset+MAX(GLUI_EDITTEXT_MIN_TEXT_WIDTH,item_text_size)+20;
  if ( w != new_wid) {
    w = new_wid;
    return true; /* we gotta be shortened or widened */
  }
  else {
    return false; /* our current width is OK */
  }
}
