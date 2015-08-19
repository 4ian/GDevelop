/****************************************************************************

  GLUI User Interface Toolkit (LGPL)
  ----------------------------------

     glui.h - Main (and only) external header for 
        GLUI User Interface Toolkit

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

#ifndef GLUI_GLUI_H
#define GLUI_GLUI_H

#if defined(GLUI_FREEGLUT)

  // FreeGLUT does not yet work perfectly with GLUI
  //  - use at your own risk.
  #include <GL/freeglut.h>

#elif defined(GLUI_OPENGLUT)

  // OpenGLUT does not yet work properly with GLUI
  //  - use at your own risk.
  
  #include <GL/openglut.h>

#else 

  #ifdef __APPLE__
  #include <GLUT/glut.h>
  #else
	#include "../../freeglut/GL/glut.h"
  //#include <GL/glut.h>
  #endif

#endif

#include <cstdlib>
#include <cstdio>
#include <cstring>
#include <string>
#include <vector>

#define GLUI_VERSION 2.3f    /********** Current version **********/

#if defined(_WIN32)
#if !defined(GLUI_NO_LIB_PRAGMA)
//#pragma comment(lib, "glui32.lib")  // Link automatically with GLUI library
#endif
#endif

/********** Do some basic defines *******/

#ifndef Byte
#define Byte unsigned char
#endif

#ifndef _RGBC_
class RGBc {
public:
  Byte r, g, b;
    
  void set(Byte r,Byte g,Byte b) {this->r=r;this->g=g;this->b=b;}
    
  RGBc( void ) {}
  RGBc( Byte r, Byte g, Byte b ) { set( r, g, b ); }
};
#define _RGBC_
#endif

/********** List of GLUT callbacks ********/

enum GLUI_Glut_CB_Types 
{ 
    GLUI_GLUT_RESHAPE,
    GLUI_GLUT_KEYBOARD,
    GLUI_GLUT_DISPLAY,
    GLUI_GLUT_MOUSE,
    GLUI_GLUT_MOTION,
    GLUI_GLUT_SPECIAL,
    GLUI_GLUT_PASSIVE_MOTION,  
    GLUI_GLUT_ENTRY,
    GLUI_GLUT_VISIBILITY  
};

/********* Constants for window placement **********/

#define GLUI_XOFF                       6
#define GLUI_YOFF                       6
#define GLUI_ITEMSPACING                3
#define GLUI_CHECKBOX_SIZE             13
#define GLUI_RADIOBUTTON_SIZE          13
#define GLUI_BUTTON_SIZE               20
#define GLUI_STATICTEXT_SIZE           13
#define GLUI_SEPARATOR_HEIGHT           8
#define GLUI_DEFAULT_CONTROL_WIDTH    100
#define GLUI_DEFAULT_CONTROL_HEIGHT    13 
#define GLUI_EDITTEXT_BOXINNERMARGINX   3
#define GLUI_EDITTEXT_HEIGHT           20
#define GLUI_EDITTEXT_WIDTH           130
#define GLUI_EDITTEXT_MIN_INT_WIDTH    35
#define GLUI_EDITTEXT_MIN_TEXT_WIDTH   50
#define GLUI_PANEL_NAME_DROP            8
#define GLUI_PANEL_EMBOSS_TOP           4
/* #define GLUI_ROTATION_WIDTH         60 */
/* #define GLUI_ROTATION_HEIGHT        78 */
#define GLUI_ROTATION_WIDTH            50
#define GLUI_ROTATION_HEIGHT           (GLUI_ROTATION_WIDTH+18)
#define GLUI_MOUSE_INTERACTION_WIDTH   50
#define GLUI_MOUSE_INTERACTION_HEIGHT  (GLUI_MOUSE_INTERACTION_WIDTH)+18

/** Different panel control types **/
#define GLUI_PANEL_NONE      0
#define GLUI_PANEL_EMBOSSED  1
#define GLUI_PANEL_RAISED    2

/**  Max # of els in control's float_array  **/
#define GLUI_DEF_MAX_ARRAY  30

/********* The control's 'active' behavior *********/
#define GLUI_CONTROL_ACTIVE_MOUSEDOWN       1
#define GLUI_CONTROL_ACTIVE_PERMANENT       2

/********* Control alignment types **********/
#define GLUI_ALIGN_CENTER   1
#define GLUI_ALIGN_RIGHT    2
#define GLUI_ALIGN_LEFT     3

/********** Limit types - how to limit spinner values *********/
#define GLUI_LIMIT_NONE    0
#define GLUI_LIMIT_CLAMP   1
#define GLUI_LIMIT_WRAP    2

/********** Translation control types ********************/
#define GLUI_TRANSLATION_XY 0
#define GLUI_TRANSLATION_Z  1
#define GLUI_TRANSLATION_X  2
#define GLUI_TRANSLATION_Y  3

#define GLUI_TRANSLATION_LOCK_NONE 0
#define GLUI_TRANSLATION_LOCK_X    1
#define GLUI_TRANSLATION_LOCK_Y    2

/********** How was a control activated? *****************/
#define GLUI_ACTIVATE_MOUSE 1
#define GLUI_ACTIVATE_TAB   2

/********** What type of live variable does a control have? **********/
#define GLUI_LIVE_NONE          0
#define GLUI_LIVE_INT           1
#define GLUI_LIVE_FLOAT         2
#define GLUI_LIVE_TEXT          3
#define GLUI_LIVE_STRING        6
#define GLUI_LIVE_DOUBLE        4
#define GLUI_LIVE_FLOAT_ARRAY   5

/************* Textbox and List Defaults - JVK ******************/
#define GLUI_TEXTBOX_HEIGHT          130
#define GLUI_TEXTBOX_WIDTH           130
#define GLUI_LIST_HEIGHT             130
#define GLUI_LIST_WIDTH              130
#define GLUI_DOUBLE_CLICK              1
#define GLUI_SINGLE_CLICK              0
#define GLUI_TAB_WIDTH                50 /* In pixels */
#define GLUI_TEXTBOX_BOXINNERMARGINX   3
#define GLUI_TEXTBOX_MIN_TEXT_WIDTH   50
#define GLUI_LIST_BOXINNERMARGINX      3
#define GLUI_LIST_MIN_TEXT_WIDTH      50

/*********************** TreePanel Defaults - JVK *****************************/
#define GLUI_TREEPANEL_DEFAULTS               0 // bar, standard bar color
#define GLUI_TREEPANEL_ALTERNATE_COLOR        1 // Alternate between 8 different bar colors
#define GLUI_TREEPANEL_ENABLE_BAR             2 // enable the bar
#define GLUI_TREEPANEL_DISABLE_BAR            4 // disable the bar
#define GLUI_TREEPANEL_DISABLE_DEEPEST_BAR    8 // disable only the deepest bar
#define GLUI_TREEPANEL_CONNECT_CHILDREN_ONLY 16 // disable only the bar of the last child of each root
#define GLUI_TREEPANEL_DISPLAY_HIERARCHY     32 // display some sort of hierachy in the tree node title
#define GLUI_TREEPANEL_HIERARCHY_NUMERICDOT  64 // display hierarchy in 1.3.2 (etc... ) format
#define GLUI_TREEPANEL_HIERARCHY_LEVEL_ONLY 128 // display hierarchy as only the level depth
 
/******************* GLUI Scrollbar Defaults - JVK ***************************/
#define  GLUI_SCROLL_ARROW_WIDTH     16
#define  GLUI_SCROLL_ARROW_HEIGHT    16
#define  GLUI_SCROLL_BOX_MIN_HEIGHT   5
#define  GLUI_SCROLL_BOX_STD_HEIGHT  16
#define  GLUI_SCROLL_STATE_NONE       0
#define  GLUI_SCROLL_STATE_UP         1
#define  GLUI_SCROLL_STATE_DOWN       2
#define  GLUI_SCROLL_STATE_BOTH       3
#define  GLUI_SCROLL_STATE_SCROLL     4
#define  GLUI_SCROLL_DEFAULT_GROWTH_EXP   1.05f
#define  GLUI_SCROLL_VERTICAL         0
#define  GLUI_SCROLL_HORIZONTAL       1


/** Size of the character width hash table for faster lookups. 
  Make sure to keep this a power of two to avoid the slow divide.
  This is also a speed/memory tradeoff; 128 is enough for low ASCII.
*/
#define CHAR_WIDTH_HASH_SIZE 128

/**********  Translation codes  **********/

enum TranslationCodes  
{
    GLUI_TRANSLATION_MOUSE_NONE = 0,
    GLUI_TRANSLATION_MOUSE_UP,
    GLUI_TRANSLATION_MOUSE_DOWN,
    GLUI_TRANSLATION_MOUSE_LEFT,
    GLUI_TRANSLATION_MOUSE_RIGHT,
    GLUI_TRANSLATION_MOUSE_UP_LEFT,
    GLUI_TRANSLATION_MOUSE_UP_RIGHT,
    GLUI_TRANSLATION_MOUSE_DOWN_LEFT,
    GLUI_TRANSLATION_MOUSE_DOWN_RIGHT
};

/************ A string type for us to use **********/

typedef std::string GLUI_String;
GLUI_String& glui_format_str(GLUI_String &str, const char* fmt, ...);

/********* Pre-declare classes as needed *********/

class GLUI;
class GLUI_Control;
class GLUI_Listbox;
class GLUI_StaticText;
class GLUI_EditText;
class GLUI_Panel;
class GLUI_Spinner;
class GLUI_RadioButton;
class GLUI_RadioGroup;
class GLUI_Glut_Window;
class GLUI_TreePanel;
class GLUI_Scrollbar;
class GLUI_List;

class Arcball;

/*** Flags for GLUI class constructor ***/
#define  GLUI_SUBWINDOW          ((long)(1<<1))
#define  GLUI_SUBWINDOW_TOP      ((long)(1<<2))
#define  GLUI_SUBWINDOW_BOTTOM   ((long)(1<<3))
#define  GLUI_SUBWINDOW_LEFT     ((long)(1<<4))
#define  GLUI_SUBWINDOW_RIGHT    ((long)(1<<5))

/*** Codes for different type of edittext boxes and spinners ***/
#define GLUI_EDITTEXT_TEXT             1
#define GLUI_EDITTEXT_INT              2
#define GLUI_EDITTEXT_FLOAT            3
#define GLUI_SPINNER_INT               GLUI_EDITTEXT_INT
#define GLUI_SPINNER_FLOAT             GLUI_EDITTEXT_FLOAT
#define GLUI_SCROLL_INT                GLUI_EDITTEXT_INT
#define GLUI_SCROLL_FLOAT              GLUI_EDITTEXT_FLOAT
// This is only for deprecated interface
#define GLUI_EDITTEXT_STRING           4

/*** Definition of callbacks ***/
typedef void (*GLUI_Update_CB) (int id);
typedef void (*GLUI_Control_CB)(GLUI_Control *);
typedef void (*Int1_CB)        (int);
typedef void (*Int2_CB)        (int, int);
typedef void (*Int3_CB)        (int, int, int);
typedef void (*Int4_CB)        (int, int, int, int);

/************************************************************/
/**
 Callback Adapter Class                            
    Allows us to support different types of callbacks;
    like a GLUI_Update_CB function pointer--which takes an int;
    and a GLUI_Control_CB function pointer--which takes a GUI_Control object.
*/
class GLUI_CB
{
public:
  GLUI_CB() : idCB(0),objCB(0) {}
  GLUI_CB(GLUI_Update_CB cb) : idCB(cb),objCB(0) {}
  GLUI_CB(GLUI_Control_CB cb) : idCB(0),objCB(cb) {}
  // (Compiler generated copy constructor)

  /** This control just activated.  Fire our callback.*/
  void operator()(GLUI_Control *ctrl) const;
  bool operator!() const { return !idCB && !objCB; }
  operator bool() const { return !(!(*this)); }
private:
  GLUI_Update_CB idCB;
  GLUI_Control_CB objCB;
};

/************************************************************/
/*                                                          */
/*          Base class, for hierarchical relationships      */
/*                                                          */
/************************************************************/

class GLUI_Control;

/**
 GLUI_Node is a node in a sort of tree of GLUI controls.
 Each GLUI_Node has a list of siblings (in a circular list)
 and a linked list of children.
 
 Everything onscreen is a GLUI_Node--windows, buttons, etc.
 The nodes are traversed for event processing, sizing, redraws, etc.
*/
class GLUI_Node 
{
    friend class GLUI_Tree;     /* JVK */
    friend class GLUI_Rollout;
    friend class GLUI_Main;

public:
    GLUI_Node();
    virtual ~GLUI_Node() {}

    GLUI_Node *first_sibling();
    GLUI_Node *last_sibling();
    GLUI_Node *prev();
    GLUI_Node *next();

    GLUI_Node *first_child()   { return child_head; }
    GLUI_Node *last_child()    { return child_tail; }
    GLUI_Node *parent()        { return parent_node; }

    /** Link in a new child control */
    virtual int  add_control( GLUI_Control *control );

    void link_this_to_parent_last (GLUI_Node *parent  );
    void link_this_to_parent_first(GLUI_Node *parent  );
    void link_this_to_sibling_next(GLUI_Node *sibling );
    void link_this_to_sibling_prev(GLUI_Node *sibling );
    void unlink();

    void dump( FILE *out, const char *name );

protected:
    static void add_child_to_control(GLUI_Node *parent,GLUI_Control *child);
    GLUI_Node *parent_node;
    GLUI_Node *child_head;
    GLUI_Node *child_tail;
    GLUI_Node *next_sibling;
    GLUI_Node *prev_sibling;
};


/************************************************************/
/*                                                          */
/*                  Standard Bitmap stuff                   */
/*                                                          */
/************************************************************/

enum GLUI_StdBitmaps_Codes 
{
    GLUI_STDBITMAP_CHECKBOX_OFF = 0,
    GLUI_STDBITMAP_CHECKBOX_ON,
    GLUI_STDBITMAP_RADIOBUTTON_OFF,
    GLUI_STDBITMAP_RADIOBUTTON_ON,
    GLUI_STDBITMAP_UP_ARROW,
    GLUI_STDBITMAP_DOWN_ARROW,
    GLUI_STDBITMAP_LEFT_ARROW,
    GLUI_STDBITMAP_RIGHT_ARROW,
    GLUI_STDBITMAP_SPINNER_UP_OFF,
    GLUI_STDBITMAP_SPINNER_UP_ON,
    GLUI_STDBITMAP_SPINNER_DOWN_OFF,
    GLUI_STDBITMAP_SPINNER_DOWN_ON,
    GLUI_STDBITMAP_CHECKBOX_OFF_DIS,    /*** Disactivated control bitmaps ***/
    GLUI_STDBITMAP_CHECKBOX_ON_DIS,
    GLUI_STDBITMAP_RADIOBUTTON_OFF_DIS,
    GLUI_STDBITMAP_RADIOBUTTON_ON_DIS,
    GLUI_STDBITMAP_SPINNER_UP_DIS,
    GLUI_STDBITMAP_SPINNER_DOWN_DIS,
    GLUI_STDBITMAP_LISTBOX_UP,
    GLUI_STDBITMAP_LISTBOX_DOWN,
    GLUI_STDBITMAP_LISTBOX_UP_DIS,
    GLUI_STDBITMAP_NUM_ITEMS
};

/************************************************************/
/*                                                          */
/*                  Class GLUI_Bitmap                       */
/*                                                          */
/************************************************************/

/**
 GLUI_Bitmap is a simple 2D texture map.  It's used
 to represent small textures like checkboxes, arrows, etc.
 via the GLUI_StdBitmaps class.
*/
class GLUI_Bitmap 
{
    friend class GLUI_StdBitmaps;

public:
    GLUI_Bitmap();
    ~GLUI_Bitmap();

    /** Create bitmap from greyscale byte image */
    void init_grey(unsigned char *array);
    
    /** Create bitmap from color int image */
    void init(int *array);

private:
    /** RGB pixel data */
    unsigned char *pixels;
    int            w, h;
};


/************************************************************/
/*                                                          */
/*                  Class GLUI_StdBitmap                    */
/*                                                          */
/************************************************************/

/**
 Keeps an array of GLUI_Bitmap objects to represent all the 
 images used in the UI: checkboxes, arrows, etc.
*/
class GLUI_StdBitmaps
{
public:
    GLUI_StdBitmaps(); 
    ~GLUI_StdBitmaps();

    /** Return the width (in pixels) of the n'th standard bitmap. */
    int  width (int n) const;
    /** Return the height (in pixels) of the n'th standard bitmap. */
    int  height(int n) const;

    /** Draw the n'th standard bitmap (one of the enums
       listed in GLUI_StdBitmaps_Codes) at pixel corner (x,y). 
    */
    void draw(int n, int x, int y) const;

private:
    GLUI_Bitmap bitmaps[GLUI_STDBITMAP_NUM_ITEMS];
};

/************************************************************/
/*                                                          */
/*                     Master GLUI Class                    */
/*                                                          */
/************************************************************/

/**
 The master manages our interaction with GLUT.
 There's only one GLUI_Master_Object.
*/
class GLUI_Master_Object 
{

    friend void glui_idle_func();
  
public:

    GLUI_Master_Object();
    ~GLUI_Master_Object();

    GLUI_Node     gluis;
    GLUI_Control *active_control, *curr_left_button_glut_menu;
    GLUI         *active_control_glui;
    int           glui_id_counter;

    GLUI_Glut_Window   *find_glut_window( int window_id );

    void           set_glutIdleFunc(void (*f)(void));

    /**************
    void (*glut_keyboard_CB)(unsigned char, int, int);
    void (*glut_reshape_CB)(int, int);
    void (*glut_special_CB)(int, int, int);
    void (*glut_mouse_CB)(int,int,int,int);

    void (*glut_passive_motion_CB)(int,int);
    void (*glut_visibility_CB)(int);
    void (*glut_motion_CB)(int,int);
    void (*glut_display_CB)(void);
    void (*glut_entry_CB)(int);
    **********/

    void  set_left_button_glut_menu_control( GLUI_Control *control );

    /********** GLUT callthroughs **********/
    /* These are the glut callbacks that we do not handle */

    void set_glutReshapeFunc (void (*f)(int width, int height));
    void set_glutKeyboardFunc(void (*f)(unsigned char key, int x, int y));
    void set_glutSpecialFunc (void (*f)(int key, int x, int y));
    void set_glutMouseFunc   (void (*f)(int, int, int, int ));

    void set_glutDisplayFunc(void (*f)(void)) {glutDisplayFunc(f);}
    void set_glutTimerFunc(unsigned int millis, void (*f)(int value), int value)
    { ::glutTimerFunc(millis,f,value);}
    void set_glutOverlayDisplayFunc(void(*f)(void)){glutOverlayDisplayFunc(f);}
    void set_glutSpaceballMotionFunc(Int3_CB f)  {glutSpaceballMotionFunc(f);}
    void set_glutSpaceballRotateFunc(Int3_CB f)  {glutSpaceballRotateFunc(f);}
    void set_glutSpaceballButtonFunc(Int2_CB f)  {glutSpaceballButtonFunc(f);}
    void set_glutTabletMotionFunc(Int2_CB f)        {glutTabletMotionFunc(f);}
    void set_glutTabletButtonFunc(Int4_CB f)        {glutTabletButtonFunc(f);}
    /*    void set_glutWindowStatusFunc(Int1_CB f)        {glutWindowStatusFunc(f);} */
    void set_glutMenuStatusFunc(Int3_CB f)            {glutMenuStatusFunc(f);}
    void set_glutMenuStateFunc(Int1_CB f)              {glutMenuStateFunc(f);}
    void set_glutButtonBoxFunc(Int2_CB f)              {glutButtonBoxFunc(f);}
    void set_glutDialsFunc(Int2_CB f)                      {glutDialsFunc(f);}  
  

    GLUI          *create_glui( const char *name, long flags=0, int x=-1, int y=-1 ); 
    GLUI          *create_glui_subwindow( int parent_window, long flags=0 );
    GLUI          *find_glui_by_window_id( int window_id );
    void           get_viewport_area( int *x, int *y, int *w, int *h );
    void           auto_set_viewport();
    void           close_all();
    void           sync_live_all();

    void           reshape();

    float          get_version() { return GLUI_VERSION; }

    void glui_setIdleFuncIfNecessary(void);

private:
    GLUI_Node     glut_windows;
    void (*glut_idle_CB)(void);

    void          add_cb_to_glut_window(int window,int cb_type,void *cb);
};

/**
 This is the only GLUI_Master_Object in existence.
*/
extern GLUI_Master_Object GLUI_Master;

/************************************************************/
/*                                                          */
/*              Class for managing a GLUT window            */
/*                                                          */
/************************************************************/

/**
 A top-level window.  The GLUI_Master GLUT callback can route events
 to the callbacks in this class, for arbitrary use by external users.
 (see GLUI_Master_Object::set_glutKeyboardFunc).
 
 This entire approach seems to be superceded by the "subwindow" flavor
 of GLUI.
*/
class GLUI_Glut_Window : public GLUI_Node 
{
public:
    GLUI_Glut_Window();

    int    glut_window_id;

    /*********** Pointers to GLUT callthrough functions *****/
    void (*glut_keyboard_CB)(unsigned char, int, int);
    void (*glut_special_CB)(int, int, int);
    void (*glut_reshape_CB)(int, int);
    void (*glut_passive_motion_CB)(int,int);
    void (*glut_mouse_CB)(int,int,int,int);
    void (*glut_visibility_CB)(int);
    void (*glut_motion_CB)(int,int);
    void (*glut_display_CB)(void);
    void (*glut_entry_CB)(int);
};

/************************************************************/
/*                                                          */
/*       Main Window GLUI class (not user-level)            */
/*                                                          */
/************************************************************/

/**
  A GLUI_Main handles GLUT events for one window, routing them to the 
  appropriate controls.  The central user-visible "GLUI" class 
  inherits from this class; users should not allocate GLUT_Main objects.
  
  There's a separate GLUI_Main object for:
  	- Each top-level window with GUI stuff in it.
	- Each "subwindow" of another top-level window.

  All the GLUI_Main objects are listed in GLUI_Master.gluis.
  A better name for this class might be "GLUI_Environment";
  this class provides the window-level context for every control.
*/
class GLUI_Main : public GLUI_Node 
{
    /********** Friend classes *************/

    friend class GLUI_Control;
    friend class GLUI_Rotation;
    friend class GLUI_Translation;
    friend class GLUI;
    friend class GLUI_Master_Object;

    /*********** Friend functions **********/

    friend void glui_mouse_func(int button, int state, int x, int y);
    friend void glui_keyboard_func(unsigned char key, int x, int y);
    friend void glui_special_func(int key, int x, int y);
    friend void glui_passive_motion_func(int x, int y);
    friend void glui_reshape_func( int w, int h );
    friend void glui_visibility_func(int state);
    friend void glui_motion_func(int x, int y);
    friend void glui_entry_func(int state);
    friend void glui_display_func( void );
    friend void glui_idle_func(void);

    friend void glui_parent_window_reshape_func( int w, int h );
    friend void glui_parent_window_keyboard_func( unsigned char, int, int );
    friend void glui_parent_window_special_func( int, int, int );
    friend void glui_parent_window_mouse_func( int, int, int, int );

protected:
    /*** Variables ***/
    int           main_gfx_window_id;
    int           mouse_button_down;
    int           glut_window_id;
    int           top_level_glut_window_id;
    GLUI_Control *active_control;
    GLUI_Control *mouse_over_control;
    GLUI_Panel   *main_panel;
    enum buffer_mode_t {
      buffer_front=1, ///< Draw updated controls directly to screen.
      buffer_back=2   ///< Double buffering: postpone updates until next redraw.
    };
    buffer_mode_t buffer_mode; ///< Current drawing mode
    int           curr_cursor;
    int           w, h;
    long          flags; 
    bool          closing;
    int           parent_window;
    int           glui_id;

    /********** Misc functions *************/

    GLUI_Control  *find_control( int x, int y );
    GLUI_Control  *find_next_control( GLUI_Control *control );
    GLUI_Control  *find_next_control_rec( GLUI_Control *control );
    GLUI_Control  *find_next_control_( GLUI_Control *control );
    GLUI_Control  *find_prev_control( GLUI_Control *control );
    void           create_standalone_window( const char *name, int x=-1, int y=-1 );
    void           create_subwindow( int parent,int window_alignment );
    void           setup_default_glut_callbacks( void );

    void           mouse(int button, int state, int x, int y);
    void           keyboard(unsigned char key, int x, int y);
    void           special(int key, int x, int y);
    void           passive_motion(int x, int y);
    void           reshape( int w, int h );
    void           visibility(int state);
    void           motion(int x, int y);
    void           entry(int state);
    void           display( void );
    void           idle(void);
    int            needs_idle(void);

    void (*glut_mouse_CB)(int, int, int, int);
    void (*glut_keyboard_CB)(unsigned char, int, int);
    void (*glut_special_CB)(int, int, int);
    void (*glut_reshape_CB)(int, int);


    /*********** Controls ************/

    virtual int    add_control( GLUI_Node *parent, GLUI_Control *control );


    /********** Constructors and Destructors ***********/

    GLUI_Main( void );

public:
    GLUI_StdBitmaps  std_bitmaps;
    GLUI_String      window_name;
    RGBc             bkgd_color;
    float            bkgd_color_f[3];

    void            *font;
    int              curr_modifiers;

    void         adjust_glut_xy( int &x, int &y ) { x; y = h-y; }
    void         activate_control( GLUI_Control *control, int how );
    void         align_controls( GLUI_Control *control );
    void         deactivate_current_control( void );
    
    /** Draw a 3D-look pushed-out box around this rectangle */
    void         draw_raised_box( int x, int y, int w, int h );
    /** Draw a 3D-look pushed-in box around this rectangle */
    void         draw_lowered_box( int x, int y, int w, int h );
    
    /** Return true if this control should redraw itself immediately (front buffer);
       Or queue up a redraw and return false if it shouldn't (back buffer).
    */
    bool         should_redraw_now(GLUI_Control *ctl);
    
    /** Switch to the appropriate draw buffer now.  Returns the old draw buffer. 
       This routine should probably only be called from inside the GLUI_DrawingSentinal,
       in glui_internal_control.h
    */
    int          set_current_draw_buffer();
    /** Go back to using this draw buffer.  Undoes set_current_draw_buffer. */
    void         restore_draw_buffer( int buffer_state );
    
    /** Pack, resize the window, and redraw all the controls. */
    void         refresh();
    
    /** Redraw the main graphics window */
    void         post_update_main_gfx();
  
    /** Recompute the sizes and positions of all controls */
    void         pack_controls();
    
    void         close_internal();
    void         check_subwindow_position();
    void         set_ortho_projection();
    void         set_viewport();
    int          get_glut_window_id( void ) { return glut_window_id; } /* JVK */
};

/************************************************************/
/*                                                          */
/*       GLUI_Control: base class for all controls          */
/*                                                          */
/************************************************************/

/**
 All the GUI objects inherit from GLUI_Control: buttons,
 checkboxes, labels, edit boxes, scrollbars, etc.
 Most of the work of this class is in routing events,
 like keystrokes, mouseclicks, redraws, and sizing events.
 
 Yes, this is a huge and hideous class.  It needs to be 
 split up into simpler subobjects.  None of the data members
 should be directly accessed by users (they should be protected,
 not public); only subclasses.
*/
class GLUI_Control : public GLUI_Node 
{
public:

/** Onscreen coordinates */
    int             w, h;                        /* dimensions of control */
    int             x_abs, y_abs;
    int             x_off, y_off_top, y_off_bot; /* INNER margins, by which child
                                                    controls are indented */
    int             contain_x, contain_y; 
    int             contain_w, contain_h;
    /* if this is a container control (e.g., 
       radiogroup or panel) this indicated dimensions
       of inner area in which controls reside */

/** "activation" for tabbing between controls. */
    int             active_type; ///< "GLUI_CONTROL_ACTIVE_..."
    bool            active;       ///< If true, we've got the focus
    bool            can_activate; ///< If false, remove from tab order.
    bool            spacebar_mouse_click; ///< Spacebar simulates click.
    
/** Callbacks */
    long            user_id;  ///< Integer to pass to callback function.
    GLUI_CB         callback; ///< User callback function, or NULL.

/** Variable value storage */
    float           float_val;        /**< Our float value */
    int             int_val;          /**< Our integer value */
    float           float_array_val[GLUI_DEF_MAX_ARRAY];
    int             float_array_size;
    GLUI_String     text;       /**< The text inside this control */
    
/** "Live variable" updating */
    void           *ptr_val;          /**< A pointer to the user's live variable value */
    int             live_type;
    bool            live_inited;
    /* These variables store the last value that live variable was known to have. */
    int             last_live_int;  
    float           last_live_float;
    GLUI_String     last_live_text;
    float           last_live_float_array[GLUI_DEF_MAX_ARRAY];
    
/** Properties of our control */    
    GLUI           *glui;       /**< Our containing event handler (NEVER NULL during event processing!) */
    bool            is_container;  /**< Is this a container class (e.g., panel) */
    int             alignment;
    bool            enabled;    /**< Is this control grayed out? */
    GLUI_String     name;       /**< The name of this control */
    void           *font;       /**< Our glutbitmap font */
    bool            collapsible, is_open;
    GLUI_Node       collapsed_node;
    bool            hidden; /* Collapsed controls (and children) are hidden */
    int             char_widths[CHAR_WIDTH_HASH_SIZE][2]; /* Character width hash table */

public:
    /*** Get/Set values ***/
    virtual void   set_name( const char *string );
    virtual void   set_int_val( int new_int )         { int_val = new_int; output_live(true); }
    virtual void   set_float_val( float new_float )   { float_val = new_float; output_live(true); }
    virtual void   set_ptr_val( void *new_ptr )       { ptr_val = new_ptr; output_live(true); }
    virtual void   set_float_array_val( float *array_ptr );

    virtual float  get_float_val( void )              { return float_val; }
    virtual int    get_int_val( void )                { return int_val; }
    virtual void   get_float_array_val( float *array_ptr );
    virtual int    get_id( void ) const { return user_id; }
    virtual void   set_id( int id ) { user_id=id; }

    virtual int mouse_down_handler( int local_x, int local_y )                 { local_x; local_y; return false; }
    virtual int mouse_up_handler( int local_x, int local_y, bool inside )       { local_x; local_y; inside; return false; }
    virtual int mouse_held_down_handler( int local_x, int local_y, bool inside) { local_x; local_y; inside; return false; }
    virtual int key_handler( unsigned char key, int modifiers )                { key; modifiers; return false; }
    virtual int special_handler( int key,int modifiers )                       { key; modifiers; return false; }

    virtual void update_size( void )     { }
    virtual void idle( void )            { }
    virtual int  mouse_over( int state, int x, int y ) { state; x; y; return false; }

    virtual void enable( void ); 
    virtual void disable( void );
    virtual void activate( int how )     { how; active = true; }
    virtual void deactivate( void )     { active = false; }

    /** Hide (shrink into a rollout) and unhide (expose from a rollout) */
    void         hide_internal( int recurse );
    void         unhide_internal( int recurse );

    /** Return true if it currently makes sense to draw this class. */
    int          can_draw( void ) { return (glui != NULL && hidden == false); }

    /** Redraw this control.
       In single-buffering mode (drawing to GL_FRONT), this is just 
           a call to translate_and_draw_front (after a can_draw() check).
       In double-buffering mode (drawing to GL_BACK), this queues up 
          a redraw and returns false, since you shouldn't draw yet.
    */
    void          redraw(void);
    
    /** Redraw everybody in our window. */
    void         redraw_window(void);

    virtual void align( void );
    void         pack( int x, int y );    /* Recalculate positions and offsets */
    void         pack_old( int x, int y );    
    void         draw_recursive( int x, int y );
    int          set_to_glut_window( void );
    void         restore_window( int orig );
    void         translate_and_draw_front( void );
    void         translate_to_origin( void ) 
    {glTranslatef((float)x_abs+.5f,(float)y_abs+.5f,0.0f);}
    virtual void draw( int x, int y )=0;
    void         set_font( void *new_font );
    void        *get_font( void );
    int          string_width( const char *text );
    int          string_width( const GLUI_String &str ) 
    { return string_width(str.c_str()); }
    int          char_width( char c );

    void         draw_name( int x, int y );
    void         draw_box_inwards_outline( int x_min, int x_max, 
                                           int y_min, int y_max );
    void         draw_box( int x_min, int x_max, int y_min, int y_max,
                           float r, float g, float b );
    void         draw_bkgd_box( int x_min, int x_max, int y_min, int y_max );
    void         draw_emboss_box( int x_min, int x_max,int y_min,int y_max);
    void         draw_string( const char *text );
    void         draw_string( const GLUI_String &s ) 
    { draw_string(s.c_str()); }
    void         draw_char( char c );
    void         draw_active_box( int x_min, int x_max, int y_min, int y_max );
    void         set_to_bkgd_color( void );

    void         set_w( int new_w );
    void         set_h( int new_w );
    void         set_alignment( int new_align );
    void         sync_live( int recurse, int draw );  /* Reads live variable */
    void         init_live( void );
    void         output_live( int update_main_gfx );        /** Writes live variable **/
    virtual void set_text( const char *t )   { t; }
    void         execute_callback( void );
    void         get_this_column_dims( int *col_x, int *col_y, 
                                       int *col_w, int *col_h, 
                                       int *col_x_off, int *col_y_off );
    virtual bool needs_idle( void ) const;
    virtual bool wants_tabs() const      { return false; }

    GLUI_Control(void) 
    {
        x_off          = GLUI_XOFF;
        y_off_top      = GLUI_YOFF;
        y_off_bot      = GLUI_YOFF;
        x_abs          = GLUI_XOFF;
        y_abs          = GLUI_YOFF;
        active         = false;
        enabled        = true;
        int_val        = 0;
        last_live_int  = 0;
        float_array_size = 0;
        glui_format_str(name, "Control: %p", this);
        float_val      = 0.0;
        last_live_float = 0.0;
        ptr_val        = NULL;
        glui           = NULL;
        w              = GLUI_DEFAULT_CONTROL_WIDTH;
        h              = GLUI_DEFAULT_CONTROL_HEIGHT;
        font           = NULL;
        active_type    = GLUI_CONTROL_ACTIVE_MOUSEDOWN;
        alignment      = GLUI_ALIGN_LEFT;
        is_container   = false;
        can_activate   = true;         /* By default, you can activate a control */
        spacebar_mouse_click = true;    /* Does spacebar simulate a mouse click? */
        live_type      = GLUI_LIVE_NONE;
        text = "";
        last_live_text == "";
        live_inited    = false;
        collapsible    = false;
        is_open        = true;
        hidden         = false;
        memset(char_widths, -1, sizeof(char_widths)); /* JVK */
        int i;
        for( i=0; i<GLUI_DEF_MAX_ARRAY; i++ )
            float_array_val[i] = last_live_float_array[i] = 0.0;
    }

    virtual ~GLUI_Control();
};

/************************************************************/
/*                                                          */
/*               Button class (container)                   */
/*                                                          */
/************************************************************/
/**
  An onscreen, clickable button--an outlined label that 
  can be clicked.  When clicked, a button
  calls its GLUI_CB callback with its ID.
*/
class GLUI_Button : public GLUI_Control
{
public:
    bool currently_inside;

    int  mouse_down_handler( int local_x, int local_y );
    int  mouse_up_handler( int local_x, int local_y, bool inside );
    int  mouse_held_down_handler( int local_x, int local_y, bool inside );
    int  key_handler( unsigned char key,int modifiers );

    void draw( int x, int y );
    void draw_pressed( void );
    void draw_text( int sunken );

    void update_size( void );

/**
 Create a new button.
 
  @param parent The panel our object is inside; or the main GLUI object.
  @param name The text inside the button.
  @param id Optional ID number, to pass to the optional callback function.
  @param callback Optional callback function, taking either the int ID or control.
*/
    GLUI_Button( GLUI_Node *parent, const char *name, 
                 int id=-1, GLUI_CB cb=GLUI_CB() );
    GLUI_Button( void ) { common_init(); };

protected:
    void common_init(void) {
        glui_format_str(name, "Button: %p", this );
        h            = GLUI_BUTTON_SIZE;
        w            = 100;
        alignment    = GLUI_ALIGN_CENTER;
        can_activate = true;
    }
};


/************************************************************/
/*                                                          */
/*               Checkbox class (container)                 */
/*                                                          */
/************************************************************/

/**
 A checkbox, which can be checked on or off.  Can be linked
 to an int value, which gets 1 for on and 0 for off.
*/
class GLUI_Checkbox : public GLUI_Control
{
public:
    int  orig_value;
    bool currently_inside;
    int  text_x_offset;

    int  mouse_down_handler( int local_x, int local_y );
    int  mouse_up_handler( int local_x, int local_y, bool inside );
    int  mouse_held_down_handler( int local_x, int local_y, bool inside );
    int  key_handler( unsigned char key,int modifiers );

    void update_size( void );

    void draw( int x, int y );

    void draw_active_area( void );
    void draw_empty_box( void );
    void set_int_val( int new_val );

/**
 Create a new checkbox object.
 
  @param parent The panel our object is inside; or the main GLUI object.
  @param name Label next to our checkbox.
  @param value_ptr Optional integer value to attach to this checkbox.  When the 
     checkbox is checked or unchecked, *value_ptr will also be changed. ("Live Vars").
  @param id Optional ID number, to pass to the optional callback function.
  @param callback Optional callback function, taking either the int ID or control.
*/
    GLUI_Checkbox(GLUI_Node *parent, const char *name, int *value_ptr=NULL,
                  int id=-1, GLUI_CB callback=GLUI_CB());
    GLUI_Checkbox( void ) { common_init(); }

protected:
    void common_init(void) {
        glui_format_str( name, "Checkbox: %p", this );
        w              = 100;
        h              = GLUI_CHECKBOX_SIZE;
        orig_value     = -1;
        text_x_offset  = 18;
        can_activate   = true;
        live_type      = GLUI_LIVE_INT;   /* This control has an 'int' live var */
    }
};

/************************************************************/
/*                                                          */
/*               Column class                               */
/*                                                          */
/************************************************************/

/**
 A GLUI_Column object separates all previous controls
 from subsequent controls with a vertical bar.
*/
class GLUI_Column : public GLUI_Control
{
public:
    void draw( int x, int y );

/**
 Create a new column, which separates the previous controls
 from subsequent controls.
 
  @param parent The panel our object is inside; or the main GLUI object.
  @param draw_bar If true, draw a visible bar between new and old controls.
*/
    GLUI_Column( GLUI_Node *parent, int draw_bar = true );
    GLUI_Column( void ) { common_init(); }

protected:
    void common_init() {
        w            = 0;
        h            = 0;
        int_val      = 0;
        can_activate = false;
    }
};


/************************************************************/
/*                                                          */
/*               Panel class (container)                    */
/*                                                          */
/************************************************************/

/**
 A GLUI_Panel contains a group of related controls.
*/
class GLUI_Panel : public GLUI_Control
{
public:

/**
 Create a new panel.  A panel groups together a set of related controls.
 
  @param parent The outer panel our panel is inside; or the main GLUI object.
  @param name The string name at the top of our panel.
  @param type Optional style to display the panel with--GLUI_PANEL_EMBOSSED by default.
      GLUI_PANEL_RAISED causes the panel to appear higher than the surroundings.
      GLUI_PANEL_NONE causes the panel's outline to be invisible.
*/
    GLUI_Panel( GLUI_Node *parent, const char *name, 
                int type=GLUI_PANEL_EMBOSSED );
    GLUI_Panel() { common_init(); }

    void draw( int x, int y );
    void set_name( const char *text );
    void set_type( int new_type );

    void update_size( void );

protected:
    void common_init( void ) {
        w            = 300;
        h            = GLUI_DEFAULT_CONTROL_HEIGHT + 7;
        int_val      = GLUI_PANEL_EMBOSSED;
        alignment    = GLUI_ALIGN_CENTER;
        is_container = true; 
        can_activate = false;
        name="";
    };
};

/************************************************************/
/*                                                          */
/*               File Browser class (container)             */
/*                         JVK                              */
/************************************************************/

/**
 A list of files the user can select from.
*/
class GLUI_FileBrowser : public GLUI_Panel
{
public:
/**
 Create a new list of files the user can select from.
 
  @param parent The panel our object is inside; or the main GLUI object.
  @param name Prompt to give to the user at the top of the file browser.
  @param frame_type Optional style to display the panel with--GLUI_PANEL_EMBOSSED by default.
      GLUI_PANEL_RAISED causes the panel to appear higher than the surroundings.
      GLUI_PANEL_NONE causes the panel's outline to be invisible.
  @param id Optional ID number, to pass to the optional callback function.
  @param callback Optional callback function, taking either the int ID or control.
*/
    GLUI_FileBrowser( GLUI_Node *parent, 
                      const char *name,
                      int frame_type = GLUI_PANEL_EMBOSSED,
                      int user_id = -1,
                      GLUI_CB callback = GLUI_CB());

    GLUI_List *list;
    GLUI_String current_dir;

    void fbreaddir(const char *);
    static void dir_list_callback(GLUI_Control*);

    void set_w(int w);
    void set_h(int h);
    const char* get_file() { return file.c_str(); }
    void set_allow_change_dir(int c) { allow_change_dir = c; }

protected:
    void common_init() 
    {
        w            = GLUI_DEFAULT_CONTROL_WIDTH;
        h            = GLUI_DEFAULT_CONTROL_HEIGHT;
        int_val      = GLUI_PANEL_EMBOSSED;
        alignment    = GLUI_ALIGN_CENTER;
        is_container = true; 
        can_activate = false;
        allow_change_dir = true;
        last_item    = -1;
        user_id      = -1;
        name         = "";
        current_dir  = ".";
        file         = "";
    };

private:
    int last_item;
    GLUI_String file;
    int allow_change_dir;

};

/************************************************************/
/*                                                          */
/*               Rollout class (container)                  */
/*                                                          */
/************************************************************/
/**
 A rollout contains a set of controls,
 like a panel, but can be collapsed to just the name.
*/
class GLUI_Rollout : public GLUI_Panel
{
public:

/**
 Create a new rollout.  A rollout contains a set of controls,
 like a panel, but can be collapsed to just the name.
 
  @param parent The panel our object is inside; or the main GLUI object.
  @param name String to show at the top of the rollout.
  @param open Optional boolean.  If true (the default), the rollout's controls are displayed.
    If false, the rollout is closed to display only the name.
  @param type Optional style to display the panel with--GLUI_PANEL_EMBOSSED by default.
      GLUI_PANEL_RAISED causes the panel to appear higher than the surroundings.
      GLUI_PANEL_NONE causes the panel's outline to be invisible.
*/
    GLUI_Rollout( GLUI_Node *parent, const char *name, int open=true, 
                  int type=GLUI_PANEL_EMBOSSED );
    GLUI_Rollout( void ) { common_init(); }
    
    
    bool        currently_inside, initially_inside;
    GLUI_Button  button;

    void draw( int x, int y );
    void draw_pressed( void );
    int mouse_down_handler( int local_x, int local_y );
    int mouse_up_handler( int local_x, int local_y, bool inside );
    int  mouse_held_down_handler( int local_x, int local_y, bool inside );
        
    void  open( void ); 
    void  close( void );

    void update_size( void );

protected:
    void common_init() {
        currently_inside = false;
        initially_inside = false;
        can_activate     = true;
        is_container     = true;
        h                = GLUI_DEFAULT_CONTROL_HEIGHT + 7;
        w                = GLUI_DEFAULT_CONTROL_WIDTH;
        y_off_top        = 21;
        collapsible      = true;
        name = "";
    }
};

/************************************************************/
/*                                                          */
/*               Tree    Panel class (container)            */
/*                         JVK                              */
/************************************************************/

/**
  One collapsible entry in a GLUI_TreePanel.
*/
class GLUI_Tree : public GLUI_Panel
{
public:
    GLUI_Tree(GLUI_Node *parent, const char *name, 
              int open=false, int inset=0);

private:
    int level;   // how deep is this node
    float red;   //Color coding of column line
    float green;
    float blue;
    float lred;   //Color coding of level name
    float lgreen;
    float lblue;
    int id;
    GLUI_Column *column;
    int is_current;          // Whether this tree is the
    // current root in a treePanel
    int child_number;
    int format;

public:
    bool        currently_inside, initially_inside;
    GLUI_Button  button;
    GLUI_String  level_name; // level name, eg: 1.1.2, III, or 3
    GLUI_TreePanel *panel; 

    void draw( int x, int y );
    void draw_pressed( void );
    int mouse_down_handler( int local_x, int local_y );
    int mouse_up_handler( int local_x, int local_y, bool inside );
    int  mouse_held_down_handler( int local_x, int local_y, bool inside );
    void set_column(GLUI_Column *c) { column = c; }
    void  open( void ); 
    void  close( void );

    /*   void set_name( const char *text )   { panel.set_name( text ); }; */
    void update_size( void );
    void set_id(int i) { id = i; }
    void set_level(int l) { level = l; }
    void set_format(int f) { format = f; }
    void set_current(int c) { is_current = c; }
    int get_id() { return id; }
    int get_level() { return level; }
    int get_child_number() { return child_number; }
    void enable_bar() { if (column) { column->int_val = 1;  set_color(red, green, blue); } }
    void disable_bar() { if (column) { column->int_val = 0;  } } 
    void set_child_number(int c) { child_number = c; } 
    void set_level_color(float r, float g, float b) { 
        lred = r;
        lgreen = g;
        lblue  = b;
    }
    void set_color(float r, float g, float b) { 
        red = r;
        green = g;
        blue  = b;
    }
protected:
    void common_init()
    {
        currently_inside = false;
        initially_inside = false;
        can_activate     = true;
        is_container     = true;
        h                = GLUI_DEFAULT_CONTROL_HEIGHT + 7;
        w                = GLUI_DEFAULT_CONTROL_WIDTH;
        y_off_top        = 21;
        collapsible      = true;
        red              = .5;
        green            = .5;
        blue             = .5;
        lred             = 0;
        lgreen           = 0;
        lblue            = 0;
        column           = NULL;
        is_current       = 0;
        child_number     = 0;
        format           = 0;
        panel            = NULL;
        name             = "";
        level_name       = "";
        level            = 0;
    
    };
};


/************************************************************/
/*                                                          */
/*               TreePanel class (container) JVK            */
/*                                                          */
/************************************************************/

/**
  Manages, maintains, and formats a tree of GLUI_Tree objects.
  These are shown in a heirarchical, collapsible display.
  
  FIXME: There's an infinite loop in the traversal code (OSL 2006/06)
*/
class GLUI_TreePanel : public GLUI_Panel 
{
public:
    GLUI_TreePanel(GLUI_Node *parent, const char *name,
                   bool open=false, int inset=0);

    int max_levels;
    int next_id;
    int format;
    float red;
    float green;
    float blue;
    float lred;
    float lgreen;
    float lblue;
    int root_children;
    /* These variables allow the tree panel to traverse the tree
       using only two function calls. (Well, four, if you count 
       going in reverse */

    GLUI_Tree    *curr_branch; /* Current Branch */
    GLUI_Panel *curr_root;   /* Current Root */

public:
    void            set_color(float r, float g, float b); 
    void            set_level_color(float r, float g, float b);
    void            set_format(int f) { format = f; }

    /* Adds branch to curr_root */
    GLUI_Tree *     ab(const char *name, GLUI_Tree *root = NULL);
    /* Goes up one level, resets curr_root and curr_branch to parents*/
    void            fb(GLUI_Tree *branch= NULL);
    /* Deletes the curr_branch, goes up one level using fb */
    void            db(GLUI_Tree *branch = NULL);
    /* Finds the very last branch of curr_root, resets vars */
    void            descendBranch(GLUI_Panel *root = NULL);
    /* Resets curr_root and curr branch to TreePanel and lastChild */
    void            resetToRoot(GLUI_Panel *new_root = NULL);
    void            next( void );
    void            refresh( void );
    void            expand_all( void );
    void            collapse_all( void );
    void            update_all( void );
    void            initNode(GLUI_Tree *temp);
    void            formatNode(GLUI_Tree *temp);

protected:
    int uniqueID( void ) { next_id++; return next_id - 1; }
    void common_init() 
    {
        GLUI_Panel();
        next_id = 0;
        curr_root = this;
        curr_branch = NULL;
        red = .5;
        green = .5;
        blue = .5;
        root_children = 0;
    }
};

/************************************************************/
/*                                                          */
/*                     User-Level GLUI class                */
/*                                                          */
/************************************************************/

class GLUI_Rotation;
class GLUI_Translation;

/**
 The main user-visible interface object to GLUI.
 
*/
class GLUI : public GLUI_Main 
{
public:
/** DEPRECATED interface for creating new GLUI objects */
    int   add_control( GLUI_Control *control ) { return main_panel->add_control(control); }

    void  add_column( int draw_bar = true );
    void  add_column_to_panel( GLUI_Panel *panel, int draw_bar = true );

    void  add_separator( void );
    void  add_separator_to_panel( GLUI_Panel *panel );

    GLUI_RadioGroup 
    *add_radiogroup( int *live_var=NULL,
                     int user_id=-1,GLUI_CB callback=GLUI_CB());

    GLUI_RadioGroup 
    *add_radiogroup_to_panel(  GLUI_Panel *panel,
                               int *live_var=NULL,
                               int user_id=-1, GLUI_CB callback=GLUI_CB() );
    GLUI_RadioButton
    *add_radiobutton_to_group(  GLUI_RadioGroup *group,
                                const char *name );

    GLUI_Listbox *add_listbox( const char *name, int *live_var=NULL,
                               int id=-1, GLUI_CB callback=GLUI_CB()	);
    GLUI_Listbox *add_listbox_to_panel( GLUI_Panel *panel,
                                        const char *name, int *live_var=NULL,
                                        int id=-1, GLUI_CB callback=GLUI_CB());

    GLUI_Rotation *add_rotation( const char *name, float *live_var=NULL,
                                 int id=-1, GLUI_CB callback=GLUI_CB()	);
    GLUI_Rotation *add_rotation_to_panel( GLUI_Panel *panel,
                                          const char *name, float *live_var=NULL,
                                          int id=-1, GLUI_CB callback=GLUI_CB());
  
    GLUI_Translation *add_translation( const char *name,
                                       int trans_type, float *live_var=NULL,
                                       int id=-1, GLUI_CB callback=GLUI_CB()	);
    GLUI_Translation *add_translation_to_panel( 
        GLUI_Panel *panel, const char *name, 
        int trans_type, float *live_var=NULL,
        int id=-1, GLUI_CB callback=GLUI_CB());
  
    GLUI_Checkbox  *add_checkbox( const char *name, 
                                  int *live_var=NULL,
                                  int id=-1, GLUI_CB callback=GLUI_CB());
    GLUI_Checkbox  *add_checkbox_to_panel( GLUI_Panel *panel, const char *name, 
                                           int *live_var=NULL, int id=-1, 
                                           GLUI_CB callback=GLUI_CB());

    GLUI_Button  *add_button( const char *name, int id=-1, 
                              GLUI_CB callback=GLUI_CB());
    GLUI_Button  *add_button_to_panel( GLUI_Panel *panel, const char *name, 
                                       int id=-1, GLUI_CB callback=GLUI_CB() );

    GLUI_StaticText  *add_statictext( const char *name );
    GLUI_StaticText  *add_statictext_to_panel( GLUI_Panel *panel, const char *name );

    GLUI_EditText  *add_edittext( const char *name, 
                                  int data_type=GLUI_EDITTEXT_TEXT,
                                  void*live_var=NULL,
                                  int id=-1, GLUI_CB callback=GLUI_CB()	);
    GLUI_EditText  *add_edittext_to_panel( GLUI_Panel *panel, 
                                           const char *name,
                                           int data_type=GLUI_EDITTEXT_TEXT,
                                           void *live_var=NULL, int id=-1, 
                                           GLUI_CB callback=GLUI_CB() );
    GLUI_EditText  *add_edittext( const char *name, GLUI_String& live_var, 
                                  int id=-1, GLUI_CB callback=GLUI_CB()	);
    GLUI_EditText  *add_edittext_to_panel( GLUI_Panel *panel, const char *name, 
                                           GLUI_String& live_var, int id=-1,
                                           GLUI_CB callback=GLUI_CB() );

    GLUI_Spinner  *add_spinner( const char *name, 
                                int data_type=GLUI_SPINNER_INT,
                                void *live_var=NULL,
                                int id=-1, GLUI_CB callback=GLUI_CB() );
    GLUI_Spinner  *add_spinner_to_panel( GLUI_Panel *panel, 
                                         const char *name,
                                         int data_type=GLUI_SPINNER_INT,
                                         void *live_var=NULL,
                                         int id=-1,
                                         GLUI_CB callback=GLUI_CB() );

    GLUI_Panel     *add_panel( const char *name, int type=GLUI_PANEL_EMBOSSED );
    GLUI_Panel     *add_panel_to_panel( GLUI_Panel *panel, const char *name, 
                                        int type=GLUI_PANEL_EMBOSSED );


    GLUI_Rollout   *add_rollout( const char *name, int open=true,
                                 int type=GLUI_PANEL_EMBOSSED);
    GLUI_Rollout   *add_rollout_to_panel( GLUI_Panel *panel, const char *name, 
                                          int open=true,
                                          int type=GLUI_PANEL_EMBOSSED);


/** Set the window where our widgets should be displayed. */
    void            set_main_gfx_window( int window_id );
    int             get_glut_window_id( void ) { return glut_window_id; }

    void            enable( void ) { main_panel->enable(); }
    void            disable( void );

    void            sync_live( void );

    void            close( void );

    void            show( void );
    void            hide( void );

    /***** GLUT callback setup functions *****/
    /*
      void set_glutDisplayFunc(void (*f)(void));
      void set_glutReshapeFunc(void (*f)(int width, int height));
      void set_glutKeyboardFunc(void (*f)(unsigned char key, int x, int y));
      void set_glutSpecialFunc(void (*f)(int key, int x, int y));
      void set_glutMouseFunc(void (*f)(int button, int state, int x, int y));
      void set_glutMotionFunc(void (*f)(int x, int y));
      void set_glutPassiveMotionFunc(void (*f)(int x, int y));
      void set_glutEntryFunc(void (*f)(int state));
      void set_glutVisibilityFunc(void (*f)(int state));
      void set_glutInit( int *argcp, const char **argv );
      void set_glutInitWindowSize(int width, int height);
      void set_glutInitWindowPosition(int x, int y);
      void set_glutInitDisplayMode(unsigned int mode);
      int  set_glutCreateWindow(const char *name);
    */

    /***** Constructors and desctructors *****/

    int init( const char *name, long flags, int x, int y, int parent_window );
protected:
    virtual int add_control( GLUI_Node *parent, GLUI_Control *control ) {
        return GLUI_Main::add_control( parent, control );
    }
};

/************************************************************/
/*                                                          */
/*               EditText class                             */
/*                                                          */
/************************************************************/

class GLUI_EditText : public GLUI_Control
{
public:
    int                 has_limits;
    int                 data_type;
    GLUI_String         orig_text;
    int                 insertion_pt;
    int                 title_x_offset;
    int                 text_x_offset;
    int                 substring_start; /*substring that gets displayed in box*/
    int                 substring_end;  
    int                 sel_start, sel_end;  /* current selection */
    int                 num_periods;
    int                 last_insertion_pt;
    float               float_low, float_high;
    int                 int_low, int_high;
    GLUI_Spinner       *spinner;
    int                 debug;
    int                 draw_text_only;


    int  mouse_down_handler( int local_x, int local_y );
    int  mouse_up_handler( int local_x, int local_y, bool inside );
    int  mouse_held_down_handler( int local_x, int local_y, bool inside );
    int  key_handler( unsigned char key,int modifiers );
    int  special_handler( int key, int modifiers );

    void activate( int how );
    void deactivate( void );

    void draw( int x, int y );

    int  mouse_over( int state, int x, int y );

    int  find_word_break( int start, int direction );
    int  substring_width( int start, int end );
    void clear_substring( int start, int end );
    int  find_insertion_pt( int x, int y );
    int  update_substring_bounds( void );
    void update_and_draw_text( void );
    void draw_text( int x, int y );
    void draw_insertion_pt( void );
    void set_numeric_text( void );
    void update_x_offsets( void );
    void update_size( void );

    void set_float_limits( float low,float high,int limit_type=GLUI_LIMIT_CLAMP);
    void set_int_limits( int low, int high, int limit_type=GLUI_LIMIT_CLAMP );
    void set_float_val( float new_val );
    void set_int_val( int new_val );
    void set_text( const char *text );
    void set_text( const GLUI_String &s) { set_text(s.c_str()); }
    const char *get_text()               { return text.c_str(); }

    void dump( FILE *out, const char *text );

    // Constructor, no live variable
    GLUI_EditText( GLUI_Node *parent, const char *name,
                   int text_type=GLUI_EDITTEXT_TEXT,
                   int id=-1, GLUI_CB callback=GLUI_CB() );
    // Constructor, int live variable
    GLUI_EditText( GLUI_Node *parent, const char *name,
                   int *live_var,
                   int id=-1, GLUI_CB callback=GLUI_CB() );
    // Constructor, float live variable
    GLUI_EditText( GLUI_Node *parent, const char *name,
                   float *live_var,
                   int id=-1, GLUI_CB callback=GLUI_CB() );
    // Constructor, char* live variable
    GLUI_EditText( GLUI_Node *parent, const char *name, 
                   char *live_var,
                   int id=-1, GLUI_CB callback=GLUI_CB() );
    // Constructor, std::string live variable
    GLUI_EditText( GLUI_Node *parent, const char *name, 
                   std::string &live_var,
                   int id=-1, GLUI_CB callback=GLUI_CB() );

    // Deprecated constructor, only called internally
    GLUI_EditText( GLUI_Node *parent, const char *name,
                   int text_type, void *live_var,
                   int id, GLUI_CB callback );
    // Deprecated constructor, only called internally
    GLUI_EditText( void ) { common_init(); }

protected:
    void common_init( void ) {
        h                     = GLUI_EDITTEXT_HEIGHT;
        w                     = GLUI_EDITTEXT_WIDTH;
        title_x_offset        = 0;
        text_x_offset         = 55;
        insertion_pt          = -1;
        last_insertion_pt     = -1;
        name                  = "";
        substring_start       = 0;
        data_type             = GLUI_EDITTEXT_TEXT;
        substring_end         = 2;
        num_periods           = 0;
        has_limits            = GLUI_LIMIT_NONE;
        sel_start             = 0;
        sel_end               = 0;
        active_type           = GLUI_CONTROL_ACTIVE_PERMANENT;
        can_activate          = true;
        spacebar_mouse_click  = false;
        spinner               = NULL;
        debug                 = false;
        draw_text_only        = false;
    }
    void common_construct( GLUI_Node *parent, const char *name, 
                           int data_type, int live_type, void *live_var,
                           int id, GLUI_CB callback );
};

/************************************************************/
/*                                                          */
/*               CommandLine class                          */
/*                                                          */
/************************************************************/

class GLUI_CommandLine : public GLUI_EditText
{
public:
    typedef GLUI_EditText Super;

    enum { HIST_SIZE = 100 };
    std::vector<GLUI_String> hist_list;
    int  curr_hist;
    int  oldest_hist;
    int  newest_hist;
    bool commit_flag;

public:
    int  key_handler( unsigned char key,int modifiers );
    int  special_handler(	int key,int modifiers );
    void deactivate( void );

    virtual const char *get_history( int command_number ) const
    { return hist_list[command_number - oldest_hist].c_str(); }
    virtual GLUI_String& get_history_str( int command_number )
    { return hist_list[command_number - oldest_hist]; }
    virtual const GLUI_String& get_history_str( int command_number ) const
    { return hist_list[command_number - oldest_hist]; }
    virtual void recall_history( int history_number );
    virtual void scroll_history( int direction );
    virtual void add_to_history( const char *text );
    virtual void reset_history( void );

    void dump( FILE *out, const char *text );


    GLUI_CommandLine( GLUI_Node *parent, const char *name, void *live_var=NULL,
                      int id=-1, GLUI_CB callback=GLUI_CB() );
    GLUI_CommandLine( void ) { common_init(); }
protected:
    void common_init() {
        hist_list.resize(HIST_SIZE);
        curr_hist = 0;
        oldest_hist = 0;
        newest_hist = 0;
        commit_flag = false;
    }
};

/************************************************************/
/*                                                          */
/*              RadioGroup class (container)                */
/*                                                          */
/************************************************************/

class GLUI_RadioGroup : public GLUI_Control
{
public:
    int  num_buttons;

    void draw( int x, int y );
    void set_name( const char *text );
    void set_int_val( int int_val ); 
    void set_selected( int int_val );

    void draw_group( int translate );

    GLUI_RadioGroup( GLUI_Node *parent, int *live_var=NULL,
                     int user_id=-1,GLUI_CB callback=GLUI_CB() );
    GLUI_RadioGroup( void ) { common_init(); }

protected:
    void common_init( void ) {
        x_off         = 0;
        y_off_top     = 0;
        y_off_bot     = 0;
        is_container  = true;
        w             = 300;
        h             = 300;
        num_buttons   = 0;
        name          = "";
        can_activate  = false;
        live_type     = GLUI_LIVE_INT;
    }
};

/************************************************************/
/*                                                          */
/*               RadioButton class (container)              */
/*                                                          */
/************************************************************/

class GLUI_RadioButton : public GLUI_Control
{
public:
    int orig_value;
    bool currently_inside;
    int text_x_offset;

    int  mouse_down_handler( int local_x, int local_y );
    int  mouse_up_handler( int local_x, int local_y, bool inside );
    int  mouse_held_down_handler( int local_x, int local_y, bool inside );

    void draw( int x, int y );
    void update_size( void );

    void draw_active_area( void );
    void draw_checked( void );
    void draw_unchecked( void );
    void draw_O( void );

    GLUI_RadioButton( GLUI_RadioGroup *group, const char *name );
    GLUI_RadioGroup *group;

protected:
    void common_init()
    {
        glui_format_str( name, "RadioButton: %p", (void *) this );
        h              = GLUI_RADIOBUTTON_SIZE;
        group          = NULL;
        orig_value     = -1;
        text_x_offset  = 18;
        can_activate   = true;
    }
};


/************************************************************/
/*                                                          */
/*               Separator class (container)                */
/*                                                          */
/************************************************************/

class GLUI_Separator : public GLUI_Control
{
public:
    void draw( int x, int y );

    GLUI_Separator( GLUI_Node *parent );
    GLUI_Separator( void ) { common_init(); }

protected:
    void common_init() {
        w            = 100;
        h            = GLUI_SEPARATOR_HEIGHT;
        can_activate = false;
    }
};

#define  GLUI_SPINNER_ARROW_WIDTH   12
#define  GLUI_SPINNER_ARROW_HEIGHT   8
#define  GLUI_SPINNER_ARROW_Y        2

#define  GLUI_SPINNER_STATE_NONE     0
#define  GLUI_SPINNER_STATE_UP       1
#define  GLUI_SPINNER_STATE_DOWN     2
#define  GLUI_SPINNER_STATE_BOTH     3

#define  GLUI_SPINNER_DEFAULT_GROWTH_EXP   1.05f

/************************************************************/
/*                                                          */
/*               Spinner class (container)                  */
/*                                                          */
/************************************************************/
 
class GLUI_Spinner : public GLUI_Control
{
public:
    // Constructor, no live var
    GLUI_Spinner( GLUI_Node* parent, const char *name, 
                  int data_type=GLUI_SPINNER_INT, int id=-1, GLUI_CB callback=GLUI_CB() );
    // Constructor, int live var
    GLUI_Spinner( GLUI_Node* parent, const char *name, 
                  int *live_var, int id=-1, GLUI_CB callback=GLUI_CB() );
    // Constructor, float live var
    GLUI_Spinner( GLUI_Node* parent, const char *name, 
                  float *live_var, int id=-1, GLUI_CB callback=GLUI_CB() );
    // Deprecated constructor
    GLUI_Spinner( GLUI_Node* parent, const char *name, 
                  int data_type,
                  void *live_var,
                  int id=-1, GLUI_CB callback=GLUI_CB() );
    // Deprecated constructor
    GLUI_Spinner( void ) { common_init(); }

    bool          currently_inside;
    int           state;
    float         growth, growth_exp;
    int           last_x, last_y;
    int           data_type;
    int           callback_count;
    int           last_int_val;
    float         last_float_val;
    int           first_callback;
    float         user_speed;

    GLUI_EditText *edittext;

    int  mouse_down_handler( int local_x, int local_y );
    int  mouse_up_handler( int local_x, int local_y, bool inside );
    int  mouse_held_down_handler( int local_x, int local_y, bool inside );
    int  key_handler( unsigned char key,int modifiers );
    int  special_handler(   int key,int modifiers );

    void draw( int x, int y );
    void draw_pressed( void );
    void draw_unpressed( void );
    void draw_text( int sunken );

    void update_size( void );

    void set_float_limits( float low,float high,int limit_type=GLUI_LIMIT_CLAMP);
    void set_int_limits( int low, int high,int limit_type=GLUI_LIMIT_CLAMP);
    int  find_arrow( int local_x, int local_y );
    void do_drag( int x, int y );
    void do_callbacks( void );
    void do_click( void );
    void idle( void );
    bool needs_idle( void ) const;

    const char *get_text( void );

    void set_float_val( float new_val );
    void set_int_val( int new_val );
    float  get_float_val( void );
    int    get_int_val( void );
    void increase_growth( void );
    void reset_growth( void );

    void set_speed( float speed ) { user_speed = speed; }

protected:
    void common_init() {
        glui_format_str( name, "Spinner: %p", this );
        h            = GLUI_EDITTEXT_HEIGHT;
        w            = GLUI_EDITTEXT_WIDTH;
        x_off        = 0;
        y_off_top    = 0;
        y_off_bot    = 0;
        can_activate = true;
        state        = GLUI_SPINNER_STATE_NONE;
        edittext     = NULL;
        growth_exp   = GLUI_SPINNER_DEFAULT_GROWTH_EXP;
        callback_count = 0;
        first_callback = true;
        user_speed   = 1.0;
    }
    void common_construct( GLUI_Node* parent, const char *name, 
                           int data_type, void *live_var,
                           int id, GLUI_CB callback );
};

/************************************************************/
/*                                                          */
/*               StaticText class                           */
/*                                                          */
/************************************************************/

class GLUI_StaticText : public GLUI_Control
{
public:
    void set_text( const char *text );
    void draw( int x, int y );
    void draw_text( void );
    void update_size( void );
    void erase_text( void );

    GLUI_StaticText(GLUI_Node *parent, const char *name);
    GLUI_StaticText( void ) { common_init(); }

protected:
    void common_init() {
        h       = GLUI_STATICTEXT_SIZE;
        name    = "";
        can_activate  = false;
    }
};

/************************************************************/
/*                                                          */
/*               TextBox class - JVK                        */
/*                                                          */
/************************************************************/

class GLUI_TextBox : public GLUI_Control
{
public:
    /* GLUI Textbox - JVK */
    GLUI_TextBox(GLUI_Node *parent, GLUI_String &live_var,
                 bool scroll = false, int id=-1, GLUI_CB callback=GLUI_CB() );
    GLUI_TextBox( GLUI_Node *parent,
                  bool scroll = false, int id=-1,
                  GLUI_CB callback=GLUI_CB() );

    GLUI_String         orig_text;
    int                 insertion_pt;
    int                 substring_start; /*substring that gets displayed in box*/
    int                 substring_end;  
    int                 sel_start, sel_end;  /* current selection */
    int                 last_insertion_pt;
    int                 debug;
    int                 draw_text_only;
    int                 tab_width;
    int                 start_line;
    int                 num_lines;
    int                 curr_line;
    int                 visible_lines;
    int                 insert_x;        /* Similar to "insertion_pt", these variables keep */
    int                 insert_y;        /* track of where the ptr is, but in pixels */
    int                 keygoal_x;       /* where up down keys would like to put insertion pt*/
    GLUI_Scrollbar     *scrollbar;

    int  mouse_down_handler( int local_x, int local_y );
    int  mouse_up_handler( int local_x, int local_y, bool inside );
    int  mouse_held_down_handler( int local_x, int local_y, bool inside );
    int  key_handler( unsigned char key,int modifiers );
    int  special_handler( int key,int modifiers );
  
    void activate( int how );
    void deactivate( void );

    void enable( void );
    void disable( void );

    void draw( int x, int y );

    int  mouse_over( int state, int x, int y );

    int get_box_width();
    int  find_word_break( int start, int direction );
    int  substring_width( int start, int end, int initial_width=0 );
    void clear_substring( int start, int end );
    int  find_insertion_pt( int x, int y );
    int  update_substring_bounds( void );
    void update_and_draw_text( void );
    void draw_text( int x, int y );
    void draw_insertion_pt( void );
    void update_x_offsets( void );
    void update_size( void );

    void set_text( const char *text );
    const char *get_text( void )         { return text.c_str(); }

    void dump( FILE *out, char *text );
    void set_tab_w(int w) { tab_width = w; }
    void set_start_line(int l) { start_line = l; }
    static void scrollbar_callback(GLUI_Control*);

    bool wants_tabs( void ) const { return true; }

protected:
    void common_init()
    {
        h                     = GLUI_TEXTBOX_HEIGHT;
        w                     = GLUI_TEXTBOX_WIDTH;
        tab_width             = GLUI_TAB_WIDTH;
        num_lines             = 0;
        visible_lines         = 0;
        start_line            = 0;
        curr_line             = 0;
        insert_y              = -1;
        insert_x              = -1;
        insertion_pt          = -1;
        last_insertion_pt     = -1;
        name[0]               = '\0';
        substring_start       = 0;
        substring_end         = 2;
        sel_start             = 0;
        sel_end               = 0;
        active_type           = GLUI_CONTROL_ACTIVE_PERMANENT;
        can_activate          = true;
        spacebar_mouse_click  = false;
        scrollbar             = NULL;
        debug                 = false;
        draw_text_only        = false;
    }
    void common_construct(
        GLUI_Node *parent, GLUI_String *live_var, 
        bool scroll, int id, GLUI_CB callback); 
};

/************************************************************/
/*                                                          */
/*                   List class - JVK                       */
/*                                                          */
/************************************************************/

class GLUI_List_Item : public GLUI_Node 
{
public:
    GLUI_String text;
    int         id;
};

/************************************************************/
/*                                                          */
/*               List class - JVK                           */
/*                                                          */
/************************************************************/

class GLUI_List : public GLUI_Control
{
public:
    /* GLUI List - JVK */
    GLUI_List( GLUI_Node *parent, bool scroll = false,
               int id=-1, GLUI_CB callback=GLUI_CB() );
               /*, GLUI_Control *object = NULL 
               ,GLUI_InterObject_CB obj_cb = NULL);*/

    GLUI_List( GLUI_Node *parent,
               GLUI_String& live_var, bool scroll = false, 
               int id=-1, 
               GLUI_CB callback=GLUI_CB()
               /*,GLUI_Control *object = NULL */
               /*,GLUI_InterObject_CB obj_cb = NULL*/);


    GLUI_String         orig_text;
    int                 debug;
    int                 draw_text_only;
    int                 start_line;
    int                 num_lines;
    int                 curr_line;
    int                 visible_lines;
    GLUI_Scrollbar      *scrollbar;
    GLUI_List_Item      items_list;
    GLUI_Control        *associated_object;
    GLUI_CB             obj_cb;
    int                 cb_click_type;
    int                 last_line;
    int                 last_click_time;

    int  mouse_down_handler( int local_x, int local_y );
    int  mouse_up_handler( int local_x, int local_y, bool inside );
    int  mouse_held_down_handler( int local_x, int local_y, bool inside );
    int  key_handler( unsigned char key,int modifiers );
    int  special_handler( int key,int modifiers );
  
    void activate( int how );
    void deactivate( void );

    void draw( int x, int y );

    int  mouse_over( int state, int x, int y );

    int get_box_width();
    int  find_word_break( int start, int direction );
    int  substring_width( const char *t, int start, int end );
    int  find_line( int x, int y );
    void update_and_draw_text( void );
    void draw_text( const char *t, int selected, int x, int y );
    void update_size( void );


    int  add_item( int id, const char *text );
    int  delete_item( const char *text );
    int  delete_item( int id );
    int  delete_all();

    GLUI_List_Item *get_item_ptr( const char *text );
    GLUI_List_Item *get_item_ptr( int id );

    void dump( FILE *out, const char *text );
    void set_start_line(int l) { start_line = l; }
    static void scrollbar_callback(GLUI_Control*);
    int get_current_item() { return curr_line; }
    void set_click_type(int d) {
        cb_click_type = d; }
    void set_object_callback(GLUI_CB cb=GLUI_CB(), GLUI_Control*obj=NULL)
    { obj_cb=cb; associated_object=obj; }

protected:
    void common_init()
    {
        h                     = GLUI_LIST_HEIGHT;
        w                     = GLUI_LIST_WIDTH;
        num_lines             = 0;
        visible_lines         = 0;
        start_line            = 0;
        curr_line             = 0;
        name[0]               = '\0';
        active_type           = GLUI_CONTROL_ACTIVE_PERMANENT;
        can_activate          = true;
        spacebar_mouse_click  = false;
        scrollbar             = NULL;
        debug                 = false;
        draw_text_only        = false;
        cb_click_type         = GLUI_SINGLE_CLICK;
        last_line             = -1;
        last_click_time       = 0;
        associated_object     = NULL;
    };
    void common_construct(
        GLUI_Node *parent,
        GLUI_String* live_var, bool scroll,
        int id,
        GLUI_CB callback
        /*,GLUI_Control *object*/
        /*,GLUI_InterObject_CB obj_cb*/);
};

/************************************************************/
/*                                                          */
/*               Scrollbar class - JVK                      */
/*                                                          */
/************************************************************/
 
class GLUI_Scrollbar : public GLUI_Control
{
public:
    // Constructor, no live var
    GLUI_Scrollbar( GLUI_Node *parent,
                    const char *name, 
                    int horz_vert=GLUI_SCROLL_HORIZONTAL,
                    int data_type=GLUI_SCROLL_INT,
                    int id=-1, GLUI_CB callback=GLUI_CB() 
                    /*,GLUI_Control *object = NULL*/
                    /*,GLUI_InterObject_CB obj_cb = NULL*/
                    );

    // Constructor, int live var
    GLUI_Scrollbar( GLUI_Node *parent, const char *name, int horz_vert,
                    int *live_var,
                    int id=-1, GLUI_CB callback=GLUI_CB() 
                    /*,GLUI_Control *object = NULL*/
                    /*,GLUI_InterObject_CB obj_cb = NULL*/
                    );

    // Constructor, float live var
    GLUI_Scrollbar( GLUI_Node *parent, const char *name, int horz_vert,
                    float *live_var,
                    int id=-1, GLUI_CB callback=GLUI_CB()
                    /*,GLUI_Control *object = NULL*/
                    /*,GLUI_InterObject_CB obj_cb = NULL*/
                    );

    bool          currently_inside;
    int           state;
    float         growth, growth_exp;
    int           last_x, last_y;
    int           data_type;
    int           callback_count;
    int           last_int_val;  ///< Used to prevent repeated callbacks.
    float         last_float_val;
    int           first_callback;
    float         user_speed;
    float         float_min, float_max;
    int           int_min, int_max;
    int           horizontal;
    double     last_update_time; ///< GLUI_Time() we last advanced scrollbar.
    double     velocity_limit; ///< Maximum distance to advance per second.
    int box_length;
    int box_start_position;
    int box_end_position;
    int track_length;


    /* Rather than directly access an Editbox or Textbox for 
       changing variables, a pointer to some object is defined
       along with a static callback in the form func(void *, int) -
       the int is the new value, the void * must be cast to that
       particular object type before use.
    */
    void *        associated_object; /* Lets the Spinner manage it's own callbacks */
    GLUI_CB       object_cb; /* function pointer to object call_back */

    int  mouse_down_handler( int local_x, int local_y );
    int  mouse_up_handler( int local_x, int local_y, bool inside );
    int  mouse_held_down_handler( int local_x, int local_y, bool inside );
    int  key_handler( unsigned char key,int modifiers );
    int  special_handler( int key,int modifiers );
  
    void draw( int x, int y );
    void draw_pressed( void );
    void draw_unpressed( void );
    void draw_text( int sunken );

    void update_size( void );

    void set_int_limits( int low, int high,int limit_type=GLUI_LIMIT_CLAMP);
    void set_float_limits( float low,float high,int limit_type=GLUI_LIMIT_CLAMP);
    int  find_arrow( int local_x, int local_y );
    void do_drag( int x, int y );
    void do_callbacks( void );
    void draw_scroll( void );
    void do_click( void );
    void idle( void );
    bool needs_idle( void ) const;
    void set_int_val( int new_val );
    void set_float_val( float new_val );
    void increase_growth( void );
    void reset_growth( void );

    void set_speed( float speed ) { user_speed = speed; };
    void update_scroll_parameters();
    void set_object_callback(GLUI_CB cb=GLUI_CB(), GLUI_Control*obj=NULL)
    { object_cb=cb; associated_object=obj; }

protected:
    void common_init ( void );
    void common_construct(
        GLUI_Node *parent,
        const char *name, 
        int horz_vert,
        int data_type, void* live_var,
        int id, GLUI_CB callback
        /*,GLUI_Control *object
        ,GLUI_InterObject_CB obj_cb*/
        );

    virtual void draw_scroll_arrow(int arrowtype, int x, int y);
    virtual void draw_scroll_box(int x, int y, int w, int h);
};

/************************************************************/
/*                                                          */
/*                   Listbox class                          */
/*                                                          */
/************************************************************/

class GLUI_Listbox_Item : public GLUI_Node 
{
public:
    GLUI_String text;
    int         id;
};

class GLUI_Listbox : public GLUI_Control
{
public:
    GLUI_String       curr_text;
    GLUI_Listbox_Item items_list;
    int               depressed;

    int  orig_value;
    bool currently_inside;
    int  text_x_offset, title_x_offset;
    int  glut_menu_id;

    int  mouse_down_handler( int local_x, int local_y );
    int  mouse_up_handler( int local_x, int local_y, bool inside );
    int  mouse_held_down_handler( int local_x, int local_y, bool inside );
    int  key_handler( unsigned char key,int modifiers );
    int  special_handler( int key,int modifiers );

    void update_size( void );
    void draw( int x, int y );
    int  mouse_over( int state, int x, int y );

    void set_int_val( int new_val );
    void dump( FILE *output );

    int  add_item( int id, const char *text );
    int  delete_item( const char *text );
    int  delete_item( int id );
    int  sort_items( void );

    int  do_selection( int item );

    GLUI_Listbox_Item *get_item_ptr( const char *text );
    GLUI_Listbox_Item *get_item_ptr( int id );
  

    GLUI_Listbox( GLUI_Node *parent,
                  const char *name, int *live_var=NULL,
                  int id=-1, GLUI_CB callback=GLUI_CB() );
    GLUI_Listbox( void ) { common_init(); }

protected:
    /** Change w and return true if we need to be widened to fit the current item. */
    bool recalculate_item_width( void );
    void common_init() {
        glui_format_str( name, "Listbox: %p", this );
        w              = GLUI_EDITTEXT_WIDTH;
        h              = GLUI_EDITTEXT_HEIGHT;
        orig_value     = -1;
        title_x_offset = 0;
        text_x_offset  = 55;
        can_activate   = true;
        curr_text      = "";
        live_type      = GLUI_LIVE_INT;  /* This has an integer live var */
        depressed      = false;
        glut_menu_id   = -1;
    }

    ~GLUI_Listbox();
};

/************************************************************/
/*                                                          */
/*              Mouse_Interaction class                     */
/*                                                          */
/************************************************************/

/**
  This is the superclass of translation and rotation widgets.
*/
class GLUI_Mouse_Interaction : public GLUI_Control
{
public:
    /*int  get_main_area_size( void ) { return MIN( h-18,  */
    int            draw_active_area_only;

    int  mouse_down_handler( int local_x, int local_y );
    int  mouse_up_handler( int local_x, int local_y, bool inside );
    int  mouse_held_down_handler( int local_x, int local_y, bool inside );
    int  special_handler( int key, int modifiers );
    void update_size( void );
    void draw( int x, int y );
    void draw_active_area( void );

    /***  The following methods (starting with "iaction_") need to
          be overloaded  ***/
    virtual int  iaction_mouse_down_handler( int local_x, int local_y ) = 0;
    virtual int  iaction_mouse_up_handler( int local_x, int local_y, bool inside )=0;
    virtual int  iaction_mouse_held_down_handler( int local_x, int local_y, bool inside )=0;
    virtual int  iaction_special_handler( int key, int modifiers )=0;
    virtual void iaction_draw_active_area_persp( void )=0;
    virtual void iaction_draw_active_area_ortho( void )=0;
    virtual void iaction_dump( FILE *output )=0;
    virtual void iaction_init( void ) = 0;
  
    GLUI_Mouse_Interaction( void ) {
        glui_format_str( name, "Mouse_Interaction: %p", this );
        w              = GLUI_MOUSE_INTERACTION_WIDTH;
        h              = GLUI_MOUSE_INTERACTION_HEIGHT;
        can_activate   = true;
        live_type      = GLUI_LIVE_NONE;
        alignment      = GLUI_ALIGN_CENTER;
        draw_active_area_only = false;
    }
};

/************************************************************/
/*                                                          */
/*                   Rotation class                         */
/*                                                          */
/************************************************************/

/**
  An onscreen rotation controller--allows the user to interact with
  a 3D rotation via a spaceball-like interface.
*/
class GLUI_Rotation : public GLUI_Mouse_Interaction
{
public:
    Arcball        *ball;
    GLUquadricObj *quadObj;
    bool           can_spin, spinning;
    float          damping;
  
    int  iaction_mouse_down_handler( int local_x, int local_y );
    int  iaction_mouse_up_handler( int local_x, int local_y, bool inside );
    int  iaction_mouse_held_down_handler( int local_x, int local_y, bool inside );
    int  iaction_special_handler( int key, int modifiers );
    void iaction_init( void ) { init_ball(); }
    void iaction_draw_active_area_persp( void );
    void iaction_draw_active_area_ortho( void );
    void iaction_dump( FILE *output );

    /*  void update_size( void ); */
    /*  void draw( int x, int y ); */
    /*  int mouse_over( int state, int x, int y ); */

    void setup_texture( void );
    void setup_lights( void );
    void draw_ball( float radius );

    void init_ball( void );

    void reset( void );

    bool needs_idle( void ) const;
    void idle( void );

    void copy_float_array_to_ball( void );
    void copy_ball_to_float_array( void );

    void set_spin( float damp_factor );

    GLUI_Rotation( GLUI_Node *parent, const char *name, float *live_var=NULL,
                   int id=-1, GLUI_CB callback=GLUI_CB() );
    GLUI_Rotation(void) { common_init(); }

protected:
    void common_init();
};

/************************************************************/
/*                                                          */
/*                   Translation class                      */
/*                                                          */
/************************************************************/

/**
  An onscreen translation controller--allows the user to interact with
  a 3D translation.
*/
class GLUI_Translation : public GLUI_Mouse_Interaction
{
public:
    int trans_type;  /* Is this an XY or a Z controller? */
    int down_x, down_y;
    float scale_factor;
    GLUquadricObj *quadObj;
    int   trans_mouse_code;
    float orig_x, orig_y, orig_z;
    int   locked;

    int  iaction_mouse_down_handler( int local_x, int local_y );
    int  iaction_mouse_up_handler( int local_x, int local_y, bool inside );
    int  iaction_mouse_held_down_handler( int local_x, int local_y, bool inside );
    int  iaction_special_handler( int key, int modifiers );
    void iaction_init( void ) { }
    void iaction_draw_active_area_persp( void );
    void iaction_draw_active_area_ortho( void );
    void iaction_dump( FILE *output );

    void set_speed( float s ) { scale_factor = s; }

    void setup_texture( void );
    void setup_lights( void );
    void draw_2d_arrow( int radius, int filled, int orientation ); 
    void draw_2d_x_arrows( int radius );
    void draw_2d_y_arrows( int radius );
    void draw_2d_z_arrows( int radius );
    void draw_2d_xy_arrows( int radius );

    int  get_mouse_code( int x, int y );

    /* Float array is either a single float (for single-axis controls),
       or two floats for X and Y (if an XY controller) */

    float get_z( void ) {       return float_array_val[0];  }
    float get_x( void ) {       return float_array_val[0];  }
    float get_y( void ) {
        if ( trans_type == GLUI_TRANSLATION_XY )    return float_array_val[1];
        else					return float_array_val[0];
    }

    void  set_z( float val );
    void  set_x( float val );
    void  set_y( float val );
    void  set_one_val( float val, int index );

    GLUI_Translation( GLUI_Node *parent, const char *name,
                      int trans_type, float *live_var=NULL,
                      int id=-1, GLUI_CB callback=GLUI_CB()	);
    GLUI_Translation( void ) { common_init(); }

protected:
    void common_init() {
        locked              = GLUI_TRANSLATION_LOCK_NONE;
        glui_format_str( name, "Translation: %p", this );
        w                   = GLUI_MOUSE_INTERACTION_WIDTH;
        h                   = GLUI_MOUSE_INTERACTION_HEIGHT;
        can_activate        = true;
        live_type           = GLUI_LIVE_FLOAT_ARRAY;
        float_array_size    = 0;
        alignment           = GLUI_ALIGN_CENTER;
        trans_type          = GLUI_TRANSLATION_XY;
        scale_factor        = 1.0;
        quadObj             = NULL;
        trans_mouse_code    = GLUI_TRANSLATION_MOUSE_NONE;
    }
};

/********** Misc functions *********************/
int _glutBitmapWidthString( void *font, const char *s );
void _glutBitmapString( void *font, const char *s );

/********** Our own callbacks for glut *********/
/* These are the callbacks that we pass to glut.  They take
   some action if necessary, then (possibly) call the user-level
   glut callbacks.  
*/

void glui_display_func( void );
void glui_reshape_func( int w, int h );
void glui_keyboard_func(unsigned char key, int x, int y);
void glui_special_func(int key, int x, int y);
void glui_mouse_func(int button, int state, int x, int y);
void glui_motion_func(int x, int y);
void glui_passive_motion_func(int x, int y);
void glui_entry_func(int state);
void glui_visibility_func(int state);
void glui_idle_func(void);

void glui_parent_window_reshape_func( int w, int h );
void glui_parent_window_keyboard_func(unsigned char key, int x, int y);
void glui_parent_window_mouse_func(int, int, int, int );
void glui_parent_window_special_func(int key, int x, int y);

#endif







