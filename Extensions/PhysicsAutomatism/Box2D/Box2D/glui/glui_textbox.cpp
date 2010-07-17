/****************************************************************************
  
  GLUI User Interface Toolkit
  ---------------------------

     glui_textbox.cpp - GLUI_TextBox control class


          --------------------------------------------------

  Copyright (c) 1998 Paul Rademacher, 2004 John Kew

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
#include <cmath>


static const int LINE_HEIGHT = 15;

/****************************** GLUI_TextBox::GLUI_TextBox() **********/

GLUI_TextBox::GLUI_TextBox(GLUI_Node *parent, GLUI_String &live_var,
                           bool scroll, int id, GLUI_CB callback )
{
  common_construct(parent, &live_var, scroll, id, callback);
}

/****************************** GLUI_TextBox::GLUI_TextBox() **********/

GLUI_TextBox::GLUI_TextBox( GLUI_Node *parent, bool scroll, int id,
                            GLUI_CB callback )
{
  common_construct(parent, NULL, scroll, id, callback);
}

/****************************** GLUI_TextBox::common_construct() **********/
void GLUI_TextBox::common_construct(
  GLUI_Node *parent, GLUI_String *data, 
  bool scroll, int id, GLUI_CB callback)
{
  common_init();

  GLUI_Node *tb_panel = parent;

  if (scroll) {
    GLUI_Panel *p = new GLUI_Panel(parent,"",GLUI_PANEL_NONE);
    p->x_off = 1;
    tb_panel = p;
  }
  this->ptr_val     = data;
  if (data) {
    this->live_type = GLUI_LIVE_STRING;
  } else {
    this->live_type = GLUI_LIVE_NONE;
  }
  this->user_id     = id;
  this->callback    = callback;
  this->name        = "textbox";
  tb_panel->add_control( this );
  if (scroll) {
    new GLUI_Column(tb_panel, false);
    scrollbar = 
      new GLUI_Scrollbar(tb_panel,
                         "scrollbar",
                         GLUI_SCROLL_VERTICAL,
                         GLUI_SCROLL_INT);
    scrollbar->set_object_callback(GLUI_TextBox::scrollbar_callback, this);
    scrollbar->set_alignment(GLUI_ALIGN_LEFT);
    // scrollbar->can_activate = false; //kills ability to mouse drag too
  }
  init_live();
}

/****************************** GLUI_TextBox::mouse_down_handler() **********/

int    GLUI_TextBox::mouse_down_handler( int local_x, int local_y )
{
  int tmp_insertion_pt;

  if ( debug )    dump( stdout, "-> MOUSE DOWN" );

  tmp_insertion_pt = find_insertion_pt( local_x, local_y );  
  if ( tmp_insertion_pt == -1 ) {
    if ( glui )
      glui->deactivate_current_control(  );
    return false;
  }

  insertion_pt = tmp_insertion_pt;

  sel_start = sel_end = insertion_pt;
 
  keygoal_x = insert_x;

  if ( can_draw())
    update_and_draw_text();

  if ( debug )    dump( stdout, "<- MOUSE UP" );

  return true;
}


/******************************** GLUI_TextBox::mouse_up_handler() **********/

int    GLUI_TextBox::mouse_up_handler( int local_x, int local_y, bool inside )
{
  return false;
}


/***************************** GLUI_TextBox::mouse_held_down_handler() ******/

int    GLUI_TextBox::mouse_held_down_handler( int local_x, int local_y,
                           bool new_inside)
{
  int tmp_pt;

  if ( NOT new_inside )     return false;

  if ( debug )    dump( stdout, "-> HELD DOWN" );
  
  tmp_pt = find_insertion_pt( local_x, local_y );
  keygoal_x = insert_x;
  
  if ( tmp_pt == -1 AND sel_end != 0 ) {    /* moved mouse past left edge */
    special_handler( GLUT_KEY_LEFT, GLUT_ACTIVE_SHIFT );
  }
  else if ( tmp_pt == substring_end+1 AND sel_end != (int) text.length()) {    
    /* moved mouse past right edge */
    special_handler( GLUT_KEY_RIGHT, GLUT_ACTIVE_SHIFT );    
  }
  else if ( tmp_pt != -1 AND tmp_pt != sel_end ) {
    sel_end = insertion_pt = tmp_pt;
    
    update_and_draw_text();
  }

  if ( debug )
    dump( stdout, "<- HELD DOWN" );

  return false;
}


/****************************** GLUI_TextBox::key_handler() **********/
int    GLUI_TextBox::key_handler( unsigned char key,int modifiers )
{
  int regular_key;
  /* int has_selection;              */

  if ( NOT glui )
    return false;

  if ( debug )
    dump( stdout, "-> KEY HANDLER" );

  regular_key = false;
  bool ctrl_down = (modifiers & GLUT_ACTIVE_CTRL)!=0;
  /*  has_selection = (sel_start != sel_end);              */

  if ( key  == CTRL('[')) {         /* ESCAPE */
    glui->deactivate_current_control();
    return true;
  }
  else if ( (key == 127 AND !ctrl_down) OR  /* FORWARD DELETE */
            ( key == CTRL('d') AND modifiers == GLUT_ACTIVE_CTRL) ) 
  {
    if ( sel_start == sel_end ) {   /* no selection */
      if ( insertion_pt < (int)text.length() ) {
        text.erase(insertion_pt,1);
      }
    }
    else {                         /* There is a selection */
      clear_substring( MIN(sel_start,sel_end), MAX(sel_start,sel_end ));
      insertion_pt = MIN(sel_start,sel_end);
      sel_start = sel_end = insertion_pt;
    }
  }
  else if ( ((key == 127) AND ctrl_down) OR   // Delete word forward
            ((key == 'd') AND (modifiers == GLUT_ACTIVE_ALT)) )
  {
    if ( sel_start == sel_end ) {   /* no selection */
      sel_start = insertion_pt;
      sel_end = find_word_break( insertion_pt, +1 );
    }

    clear_substring( MIN(sel_start,sel_end), MAX(sel_start,sel_end ));
    insertion_pt = MIN(sel_start,sel_end);
    sel_start = sel_end = insertion_pt;
  }
  else if ( key == CTRL('h') ) {       /* BACKSPACE */
    if ( sel_start == sel_end ) {   /* no selection */
      if ( insertion_pt > 0 ) {
        insertion_pt--;
        text.erase(insertion_pt,1);
      }
    }
    else {                         /* There is a selection */
      clear_substring( MIN(sel_start,sel_end), MAX(sel_start,sel_end ));
      insertion_pt = MIN(sel_start,sel_end);
      sel_start = sel_end = insertion_pt;
    }
  }
  else if ( modifiers == GLUT_ACTIVE_CTRL )  /* CTRL ONLY */ 
  {
    /* Ctrl-key bindings */
    if ( key == CTRL('a') ) {
      return special_handler( GLUT_KEY_HOME, 0 );
    }
    else if ( key == CTRL('e') ) {
      return special_handler( GLUT_KEY_END, 0 );
    }
    else if ( key == CTRL('b') ) {
      return special_handler( GLUT_KEY_LEFT, 0 );
    }
    else if ( key == CTRL('f') ) {
      return special_handler( GLUT_KEY_RIGHT, 0 );
    }
    else if ( key == CTRL('p') ) {
      return special_handler( GLUT_KEY_UP, 0 );
    }
    else if ( key == CTRL('n') ) {
      return special_handler( GLUT_KEY_DOWN, 0 );
    }
    else if ( key == CTRL('u') ) { /* ERASE LINE */
      insertion_pt = 0;  
      text.erase(0,text.length());
      sel_start = sel_end = 0;
    }
    else if ( key == CTRL('k') ) { /* KILL TO END OF LINE */
      sel_start = sel_end = insertion_pt;
      text.erase(insertion_pt,GLUI_String::npos);
    }
  }
  else if ( modifiers == GLUT_ACTIVE_ALT ) /* ALT ONLY */
  {
    if ( key == 'b' ) { // Backward word
      return special_handler ( GLUT_KEY_LEFT, GLUT_ACTIVE_CTRL );
    }
    if ( key == 'f' ) { // Forward word
      return special_handler ( GLUT_KEY_RIGHT, GLUT_ACTIVE_CTRL );
    }
  }
  else if ( (modifiers & GLUT_ACTIVE_CTRL) OR
            (modifiers & GLUT_ACTIVE_ALT) ) 
  {
    /** ignore other keys with modifiers */
    return true;
  }
  else { /* Regular key */    
    if ( key == 13 )           /* RETURNS are written as newlines*/
      key = '\n';

    regular_key = true;

    /** This is just to get rid of warnings - the flag regular_key is 
        set if the key was not a backspace, return, whatever.  But I
        believe if we're here, we know it was a regular key anyway */
    if ( regular_key ) {
    }

    /**** If there's a current selection, erase it ******/
    if ( sel_start != sel_end ) {
      clear_substring( MIN(sel_start,sel_end), MAX(sel_start,sel_end ));
      insertion_pt = MIN(sel_start,sel_end);
      sel_start = sel_end = insertion_pt;
    }

    /******** We insert the character into the string ***/

    text.insert(insertion_pt,1,key);

    /******** Move the insertion point and substring_end one over ******/
    insertion_pt++;
    substring_end++;

    sel_start = sel_end = insertion_pt;
  }

  /******** Now redraw text ***********/
  /* Hack to prevent text box from being cleared first **/  
  /**  int substring_change =  update_substring_bounds();
       draw_text_only = 
       (NOT substring_change AND NOT has_selection AND regular_key ); 
  */

  draw_text_only = false;  /** Well, hack is not yet working **/
  update_and_draw_text();
  draw_text_only = false;


  if ( debug )
    dump( stdout, "<- KEY HANDLER" );

  return true;
}

/****************************** GLUI_TextBox::enable() **********/

void GLUI_TextBox::enable( void )
{
  GLUI_Control::enable();
  scrollbar->enable();
}

/****************************** GLUI_TextBox::disable() **********/

void GLUI_TextBox::disable( void )
{
  GLUI_Control::disable();
  scrollbar->disable();
}

/****************************** GLUI_TextBox::activate() **********/

void    GLUI_TextBox::activate( int how )
{
  if ( debug )
    dump( stdout, "-> ACTIVATE" );
  active = true;

  if ( how == GLUI_ACTIVATE_MOUSE )
    return;  /* Don't select everything if activated with mouse */

  orig_text = text;

  sel_start    = 0;
  sel_end      = text.length();
  insertion_pt = 0;
  if ( debug )
    dump( stdout, "<- ACTIVATE" );
}


/****************************** GLUI_TextBox::deactivate() **********/

void    GLUI_TextBox::deactivate( void )
{
  active = false;

  if ( NOT glui )
    return;

  if ( debug )
    dump( stdout, "-> DISACTIVATE" );

  sel_start = sel_end = insertion_pt = -1; 

  /***** Retrieve the current value from the text *****/
  /***** The live variable will be updated by set_text() ****/
  set_text(text.c_str()); /* This will force callbacks and gfx refresh */

  update_substring_bounds();

  /******** redraw text without insertion point ***********/
  redraw();

  /***** Now do callbacks if value changed ******/
  if ( orig_text != text ) {
    this->execute_callback();
    

  }


  if ( debug )
    dump( stdout, "<- DISACTIVATE" );
}

/****************************** GLUI_TextBox::draw() **********/

void    GLUI_TextBox::draw( int x, int y )
{
  GLUI_DRAWINGSENTINAL_IDIOM
  int line = 0;
  int text_length;
  int box_width;
  int i;

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

  /* Begin Drawing Lines of Text */
  substring_start = 0;
  substring_end = 0;
  text_length = text.length()-1;

  /* Figure out how wide the box is */
  box_width = get_box_width();

  /* Get the first line substring */
  while (substring_width(substring_start, substring_end+1 ) < box_width && 
	 substring_end < text_length && text[substring_end+1] != '\n')
    substring_end++;

  /* Figure out which lines are visible*/

  visible_lines = (int)(h-20)/LINE_HEIGHT;
  if (start_line < (curr_line-visible_lines)) {
    for (i = 0; ((curr_line-i)*LINE_HEIGHT+20) > h; i++);
    start_line = i;
  } else if ( start_line > curr_line) {
    start_line = curr_line;
  }
  line = 0;
  do {
    if (line && substring_end < text_length) {
      substring_start = substring_end+1;
      while (substring_width(substring_start, substring_end+1 ) < box_width && 
	     substring_end < text_length && text[substring_end+1] != '\n')
	substring_end++; 
    }
    if (text[substring_end+1] == '\n') { /* Skip newline */
      substring_end++;
    }
    if (line < start_line || (line > curr_line && curr_line > (start_line + visible_lines))) {
      line++;
      continue;
    }
    if ((line - start_line) <= visible_lines)
      draw_text(0,(line - start_line)*LINE_HEIGHT); /* tabs and other nasties are handled by substring_width */
    line++;
  } while (substring_end < text_length);

  num_lines = line;

  draw_insertion_pt();
  if (scrollbar) {
    scrollbar->set_int_limits(MAX(0,num_lines/*-1*/-visible_lines),0);
    glPushMatrix();
    glTranslatef(scrollbar->x_abs-x_abs, scrollbar->y_abs-y_abs,0.0);
    scrollbar->draw_scroll();
    glPopMatrix();
  }
}



/************************** GLUI_TextBox::update_substring_bounds() *********/

int    GLUI_TextBox::update_substring_bounds( void )
{
  int box_width;
  int text_len = text.length();
  int old_start, old_end;

  old_start = substring_start;
  old_end = substring_end;

  /*** Calculate the width of the usable area of the edit box ***/
  box_width = get_box_width();

  CLAMP( substring_end, 0, MAX(text_len-1,0) );
  CLAMP( substring_start, 0, MAX(text_len-1,0) );

  if ( debug )    dump( stdout, "-> UPDATE SS" );

  if ( insertion_pt >= 0 AND 
       insertion_pt < substring_start ) {   /* cursor moved left */
    substring_start = insertion_pt;

    while ( substring_width( substring_start, substring_end ) > box_width )
      substring_end--;
  }
  else if ( insertion_pt > substring_end ) {  /* cursor moved right */
    substring_end = insertion_pt-1;

    while ( substring_width( substring_start, substring_end ) > box_width )
      substring_start++;
  }
  else {   /* cursor is within old substring bounds */
    if ( last_insertion_pt > insertion_pt ) {  /* cursor moved left */
    }
    else {
      while ( substring_width( substring_start, substring_end ) > box_width )
    substring_end--;

      while(substring_width( substring_start, substring_end+1 ) <= box_width
        AND substring_end < text_len-1 )
        substring_end++;
    }
  }

  while ( substring_width( substring_start, substring_end ) > box_width )
    substring_end--;

  last_insertion_pt = insertion_pt;

  /*** No selection if not enabled ***/
  if ( NOT enabled ) {
    sel_start = sel_end = 0;
  }

  if ( debug )    dump( stdout, "<- UPDATE SS" );

  if ( substring_start == old_start AND substring_end == old_end )
    return false;  /*** bounds did not change ***/
  else 
    return true;   /*** bounds did change ***/
  
}


/********************************* GLUI_TextBox::update_x_offsets() *********/

void    GLUI_TextBox::update_x_offsets( void )
{
}
 

/********************************* GLUI_TextBox::draw_text() ****************/

void    GLUI_TextBox::draw_text( int x, int y )
{
  GLUI_DRAWINGSENTINAL_IDIOM
  int text_x, i, sel_lo, sel_hi, x_pos;

  if ( debug )    dump( stdout, "-> DRAW_TEXT" );

  /** Find where to draw the text **/

  text_x = 2 + GLUI_TEXTBOX_BOXINNERMARGINX;

  /** Find lower and upper selection bounds **/
  sel_lo = MIN(sel_start, sel_end );
  sel_hi = MAX(sel_start, sel_end );

  int sel_x_start, sel_x_end, delta;

  /** Draw selection area dark **/
  if ( sel_start != sel_end ) {
    sel_x_start = text_x;
    sel_x_end   = text_x;
    delta = 0;
    for( i=substring_start; sel_x_end < (w - text_x) && i<=substring_end; i++ ) {
      delta = 0;
      if (text[i] == '\t') // Character is a tab, go to next tab stop
        while (((delta + sel_x_end) < (w - text_x)) && 
          (delta == 0 || delta % tab_width))
          delta++;
        else
          delta = char_width( text[i] );
        
        if ( i < sel_lo ) {
          sel_x_start += delta;
          sel_x_end   += delta;
        }
        else if ( i < sel_hi ) {
          sel_x_end   += delta;
        }
    }
    
    glColor3f( 0.0f, 0.0f, .6f );
    glRecti(sel_x_start, y+5, sel_x_end, y+20);
  }
  

  if ( sel_start == sel_end ) {   // No current selection 
    x_pos = text_x;
    if ( enabled )
      glColor3b( 0, 0, 0 );
    else
      glColor3b( 32, 32, 32 );
      
    glRasterPos2i( text_x, y+LINE_HEIGHT);
    for( i=substring_start; i<=substring_end; i++ ) {
      if (this->text[i] == '\t') { // Character is a tab, go to next tab stop
        x_pos = ((x_pos-text_x)/tab_width)*tab_width+tab_width+text_x;
        glRasterPos2i( x_pos, y+LINE_HEIGHT); // Reposition pen after tab
      } else {
        glutBitmapCharacter( get_font(), this->text[i] );
        x_pos += char_width( this->text[i] );
      }
    }
  }
  else {                        // There is a selection
    x_pos = text_x;
    for( i=substring_start; i<=substring_end; i++ ) {
      if ( IN_BOUNDS( i, sel_lo, sel_hi-1)) { // This character is selected
        glColor3f( 1., 1., 1. );
        glRasterPos2i( x_pos, y+LINE_HEIGHT);
        if (this->text[i] == '\t') { // Character is a tab, go to next tab stop
         x_pos = ((x_pos-text_x)/tab_width)*tab_width+tab_width+text_x;
        } 
        else
          glutBitmapCharacter( get_font(), this->text[i] );
      }
      else {
        glColor3f( 0., 0., 0. );
        glRasterPos2i( x_pos, y+LINE_HEIGHT);
        if (this->text[i] == '\t') { // Character is a tab, go to next tab stop
          x_pos = ((x_pos-text_x)/tab_width)*tab_width+tab_width+text_x;
          glRasterPos2i( x_pos, y+LINE_HEIGHT); // Reposition pen after tab 
        } else
          glutBitmapCharacter( get_font(), this->text[i] );
      }
      
      x_pos += char_width( text[i] );
    }
  }

  if ( debug )    dump( stdout, "<- DRAW_TEXT" );  
}


/******************************** GLUI_TextBox::find_insertion_pt() *********/
/* This function returns the character number *before which* the insertion  */
/* point goes                                                               */

int  GLUI_TextBox::find_insertion_pt( int x, int y )
{
  /*** See if we clicked outside box ***/
  if ( x < this->x_abs || y < this->y_abs)
    return -1;
  
  /*** See if we clicked in an empty box ***/
  if ( text.empty() ) 
    return 0;
  
  /* update insert variables */
  insert_x = x;
  insert_y = y;

  int text_length = text.length()-1;
  int box_width = get_box_width();

  int sol = 0;
  int eol = 0;
  int line = 0;

  int y_off = y - (y_abs + 2 + GLUI_TEXTBOX_BOXINNERMARGINX);
  int x_off = x - (x_abs + 2 + GLUI_TEXTBOX_BOXINNERMARGINX);

  /* Find the line clicked, 
     The possibility of long lines getting wrapped complicates this. */
  while ((line-start_line+1)*LINE_HEIGHT < y_off && eol < text_length) 
  {
    while (eol < text_length && text[eol] != '\n' && 
           substring_width(sol, eol+1) <= box_width)
    {
      eol++;
    }
    if (text[eol]=='\n' && eol<text_length) { eol++; }
    line++;
    sol = eol;
  }
  curr_line = line;
  // Now search to the end of this line for the closest insertion point
  int prev_w=0,total_w=0,prev_eol=eol;
  while (eol <= text_length 
         && (total_w=substring_width(prev_eol,eol,prev_w))< x_off 
         && (eol==text_length||text[eol]!='\n')) 
  {
    prev_w=total_w;
    eol++;
    prev_eol=eol;
  }
  if (total_w>=x_off) {  
    // did we go far enough? (see if click was >1/2 width of last char)
    int decision_pt = prev_w+(total_w-prev_w)/2;
    if (x_off>decision_pt) eol++;
  }
  return eol;

#if 0
  while (eol < text_length && text[eol] != '\n' && 
         substring_width(sol, eol+1) < box_width )
  {
    eol++;
  }


  /* We move from right to left, looking to see if the mouse was clicked
     to the right of the ith character */
#if 0
  int curr_x = this->x_abs 
    + substring_width( sol, eol )
    + 2                             /* The edittext box has a 2-pixel margin */
    + GLUI_TEXTBOX_BOXINNERMARGINX;   /** plus this many pixels blank space
                     between the text and the box       **/
#endif
  
  /** find mouse click in text **/

  if (x_off > substring_width(sol, eol))
    return eol;

  for(i = sol; i <= eol+1; i++) {
    if (x_off <= substring_width(sol, i))
	    return i+1;
  }
  return 0;
#endif
}


int GLUI_TextBox::get_box_width() 
{
  return MAX( this->w 
              - 4     /*  2 * the two-line box border */ 
              - 2 * GLUI_TEXTBOX_BOXINNERMARGINX, 0 );

}

/******************************** GLUI_TextBox::draw_insertion_pt() *********/

void     GLUI_TextBox::draw_insertion_pt( void )
{
  int curr_x, box_width, text_length, eol, sol, line;

  if ( NOT can_draw() )
    return;

  /*** Don't draw insertion pt if control is disabled ***/
  if ( NOT enabled )
    return;

  if ( sel_start != sel_end OR insertion_pt < 0 ) {
    return;  /* Don't draw insertion point if there is a current selection */
  }

  if ( debug )    dump( stdout, "-> DRAW_INS_PT" );

  /*    printf( "insertion pt: %d\n", insertion_pt );              */

  box_width = get_box_width();

  // This function is unable to distinguish whether an insertion
  // point on a line break should be drawn on the line before or the line after.
  // This depends on the sequence of operations used to get there, and this
  // function just doesn't have that information.  If curr_line were kept up
  // to date elsewhere that could be used here to disambiguate, but arrow keys
  // and such do not update it.

  sol = 0;
  eol = 0;
  text_length = text.length()-1;

  //while (eol < text_length && text[eol] != '\n' 
  //       && substring_width(sol, eol + 1) < box_width )
  //  eol++;
  line = 0;
  while (eol < insertion_pt && eol <= text_length) 
  {
    if (text[eol] == '\n' || substring_width(sol, eol + 1) >= box_width) 
    {
      eol++;
      if (text[eol]=='\n'||eol!=insertion_pt
          ||(eol==insertion_pt && eol>0 && text[eol-1]=='\n')) {
        sol = eol;
        line++;
      }
    } 
    else {
      eol++;
    }
  }

  //glColor3f(1,0,0);
  //glRecti(0, curr_line*LINE_HEIGHT, 3, (curr_line+1)*LINE_HEIGHT);

  curr_line = line;

  if (scrollbar)
    scrollbar->set_int_val(start_line);
  if (curr_line < start_line || curr_line > (start_line + visible_lines)) /* Insertion pt out of draw area */
    return;

  curr_x = this->x_abs 
    + 2                               /* The edittext box has a 2-pixel margin */
    + GLUI_TEXTBOX_BOXINNERMARGINX;   /** plus this many pixels blank space
                                          between the text and the box       **/
  
  curr_x += substring_width(sol,insertion_pt-1);
  if (insertion_pt == text.length() && text[text.length()-1] == '\n'
      || curr_x-this->x_abs > (w - 2 - GLUI_TEXTBOX_BOXINNERMARGINX)) { // Insert on the next line 
    curr_x = this->x_abs + GLUI_TEXTBOX_BOXINNERMARGINX;
    line++;
  } 
  /* update insertion coordinates */
  insert_x = curr_x+5; /* I hate magic numbers too, these offset the imagined insertion point */
  insert_y = (curr_line-start_line+2)*LINE_HEIGHT;


  glColor3f( 0.0, 0.0, 0.0 );
  glBegin( GL_LINE_LOOP );

  curr_x -= x_abs;
  glVertex2i( curr_x+1, (curr_line-start_line)*LINE_HEIGHT + 4 );
  glVertex2i( curr_x,   (curr_line-start_line)*LINE_HEIGHT + 4 );
  glVertex2i( curr_x+1, (curr_line-start_line)*LINE_HEIGHT + 16 );
  glVertex2i( curr_x,   (curr_line-start_line)*LINE_HEIGHT + 16 );
  glEnd();


  if ( debug )    dump( stdout, "-> DRAW_INS_PT" );
}




/******************************** GLUI_TextBox::substring_width() *********/
int  GLUI_TextBox::substring_width( int start, int end, int initial_width )
{
  // This function only works properly if start is really the start of a line.
  // Otherwise tabs will be messed up.
  int i, width = initial_width;

  for( i=start; i<=end; i++ )
    if (text[i] == '\t') { // Character is a tab, jump to next tab stop
      width += tab_width-(width%tab_width);
      //while (width == 0 || width % tab_width) 
	    //  width++;
    }
    else
      width += char_width( text[i] ); 

  return width;
}
 

/***************************** GLUI_TextBox::update_and_draw_text() ********/

void   GLUI_TextBox::update_and_draw_text( void )
{
  //update_substring_bounds();
  /*  printf( "ss: %d/%d\n", substring_start, substring_end );                  */

  redraw();
}


/********************************* GLUI_TextBox::special_handler() **********/

int    GLUI_TextBox::special_handler( int key,int modifiers )
{
  int tmp_insertion_pt;
  if ( NOT glui )
    return false;

  if ( debug )
    printf( "SPECIAL:%d - mod:%d   subs:%d/%d  ins:%d  sel:%d/%d\n", 
        key, modifiers, substring_start, substring_end,insertion_pt,
        sel_start, sel_end );    

  if ( key == GLUT_KEY_DOWN ) {
    if (insert_x == -1 || insert_y == -1)
      return false;
    tmp_insertion_pt = find_insertion_pt( keygoal_x, insert_y+LINE_HEIGHT);
    if (tmp_insertion_pt < 0)
      return false;
    insertion_pt = tmp_insertion_pt;
    sel_end = insertion_pt;
    if (!(modifiers & GLUT_ACTIVE_SHIFT)) {
      sel_start = sel_end;
    }
    if ( can_draw())
      update_and_draw_text();    
  } else if ( key == GLUT_KEY_UP ) {
    if (insert_x == -1 || insert_y == -1)
      return false;
    tmp_insertion_pt = find_insertion_pt( keygoal_x, insert_y-LINE_HEIGHT);  
    if (tmp_insertion_pt < 0)
      return false;
    insertion_pt = tmp_insertion_pt;
    sel_end = insertion_pt;
    if (!(modifiers & GLUT_ACTIVE_SHIFT)) {
      sel_start = sel_end;
    }
    if ( can_draw())
      update_and_draw_text();    
  } else if ( key == GLUT_KEY_LEFT ) {
    if ( (modifiers & GLUT_ACTIVE_CTRL) != 0 ) {
      insertion_pt = find_word_break( insertion_pt, -1 );
    }
    else {
      insertion_pt--;
    }
    // update keygoal_x!
  }
  else if ( key == GLUT_KEY_RIGHT ) {
    if ( (modifiers & GLUT_ACTIVE_CTRL) != 0 ) {
      insertion_pt = find_word_break( insertion_pt, +1 );
    }
    else {
      insertion_pt++;
    }
    // update keygoal_x!
  }
  else if ( key == GLUT_KEY_HOME ) {
    insertion_pt = 0;
    // update keygoal_x!
  }
  else if ( key == GLUT_KEY_END ) {
    insertion_pt = text.length();
    // update keygoal_x!
  }

  /*** Update selection if shift key is down ***/
  if ( (modifiers & GLUT_ACTIVE_SHIFT ) != 0 )
    sel_end = insertion_pt;
  else 
    sel_start = sel_end = insertion_pt;
  

  CLAMP( insertion_pt, 0, (int)text.length()); /* Make sure insertion_pt 
                           is in bounds */
  CLAMP( sel_start, 0, (int)text.length()); /* Make sure insertion_pt 
                        is in bounds */
  CLAMP( sel_end, 0, (int)text.length()); /* Make sure insertion_pt 
                          is in bounds */

  /******** Now redraw text ***********/
  if ( can_draw())
    update_and_draw_text();

  return true;
}


/****************************** GLUI_TextBox::find_word_break() **********/
/* It looks either left or right (depending on value of 'direction'       */
/* for the beginning of the next 'word', where word are characters        */
/* separated by one of the following tokens:  " :-.,"                     */
/* If there is no next word in the specified direction, this returns      */
/* the beginning of 'text', or the very end.                              */

int    GLUI_TextBox::find_word_break( int start, int direction )
{
  int    i, j;
  char    breaks[] = " \n\t:-.,";
  int     num_break_chars = (int)strlen(breaks), text_len = text.length();
  int     new_pt;

  /** If we're moving left, we have to start two back, in case we're either
    already at the beginning of a word, or on a separating token.  
    Otherwise, this function would just return the word we're already at **/
  if ( direction == -1 ) {
    start -= 2;
  }

  /***** Iterate over text in the specified direction *****/
  for ( i=start; i >= 0 AND i < text_len; i += direction ) {

    /** For each character in text, iterate over list of separating tokens **/
    for( j=0; j<num_break_chars; j++ ) {
      if ( text[i] == breaks[j] ) {

    /** character 'i' is a separating token, so we return i+1 **/
    new_pt = i + 1;

    CLAMP( new_pt, 0, text_len );

    return new_pt;
      }
    }
  }

  if ( direction > 0 )  /* Return the end of string */
    return text_len;
  else                  /* Return the beginning of the text */
    return 0;
}


/********************************** GLUI_TextBox::clear_substring() ********/

void   GLUI_TextBox::clear_substring( int start, int end )
{
  text.erase(start,end-start);
}



/************************************ GLUI_TextBox::update_size() **********/

void   GLUI_TextBox::update_size( void )
{
  if ( NOT glui )
    return;

  if ( w < GLUI_TEXTBOX_MIN_TEXT_WIDTH )
      w = GLUI_TEXTBOX_MIN_TEXT_WIDTH;
}


/****************************** GLUI_TextBox::set_text() **********/

void    GLUI_TextBox::set_text( const char *new_text )
{
  text = new_text;

  substring_start = 0;
  substring_end   = text.length() - 1;
  insertion_pt    = -1;
  sel_start       = 0;
  sel_end         = 0;
  visible_lines   = 0;
  start_line      = 0;
  curr_line       = 0;
  num_lines       = 0;

  if ( can_draw() )
    update_and_draw_text();

  /*** Now update the live variable ***/
  output_live(true);
}


/*************************************** GLUI_TextBox::dump() **************/

void   GLUI_TextBox::dump( FILE *out, char *name )
{
  fprintf( out, 
       "%s (edittext@%p):   line:%d ins_pt:%d  subs:%d/%d  sel:%d/%d   len:%d\n",
       name, this, curr_line,
       insertion_pt, substring_start, substring_end, sel_start, sel_end,
       text.length());
}


/**************************************** GLUI_TextBox::mouse_over() ********/

int    GLUI_TextBox::mouse_over( int state, int x, int y )
{
  if ( state && enabled) {
    /*  curr_cursor = GLUT_CURSOR_TEXT;              */
    glutSetCursor( GLUT_CURSOR_TEXT );
  }
  else {
    /*    printf( "OUT\n" );              */
    glutSetCursor( GLUT_CURSOR_LEFT_ARROW );
  }

  return true;
}

void GLUI_TextBox::scrollbar_callback(GLUI_Control *my_scrollbar) {
  GLUI_Scrollbar *sb = dynamic_cast<GLUI_Scrollbar*>(my_scrollbar);
  if (!sb) return;
  GLUI_TextBox* me = (GLUI_TextBox*) sb->associated_object;
  if (me->scrollbar == NULL)
    return;
  int new_start_line = sb->get_int_val(); // ??
  me->start_line = new_start_line;
  if (new_start_line < (me->curr_line - me->visible_lines))
    me->curr_line = new_start_line + me->visible_lines;
  if (new_start_line > me->curr_line)
    me->curr_line = new_start_line;
  if ( me->can_draw() )
    me->update_and_draw_text();
}
