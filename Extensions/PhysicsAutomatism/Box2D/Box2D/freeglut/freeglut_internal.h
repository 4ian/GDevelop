/*
 * freeglut_internal.h
 *
 * The freeglut library private include file.
 *
 * Copyright (c) 1999-2000 Pawel W. Olszta. All Rights Reserved.
 * Written by Pawel W. Olszta, <olszta@sourceforge.net>
 * Creation date: Thu Dec 2 1999
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

#ifndef  FREEGLUT_INTERNAL_H
#define  FREEGLUT_INTERNAL_H

#if HAVE_CONFIG_H
#    include "config.h"
#endif

/* XXX Update these for each release! */
#define  VERSION_MAJOR 2
#define  VERSION_MINOR 6
#define  VERSION_PATCH 0

/* Freeglut is intended to function under all Unix/X11 and Win32 platforms. */
/* XXX: Don't all MS-Windows compilers (except Cygwin) have _WIN32 defined?
 * XXX: If so, remove the first set of defined()'s below.
 */
#if defined(_MSC_VER) || defined(__WATCOMC__) || defined(__MINGW32__) \
    || defined(_WIN32) || defined(_WIN32_WCE) \
    || ( defined(__CYGWIN__) && defined(X_DISPLAY_MISSING) )
#   define  TARGET_HOST_MS_WINDOWS 1

#elif defined(__posix__) || defined(__unix__) || defined(__linux__)
#   define  TARGET_HOST_POSIX_X11  1

#elif defined(__APPLE__)
/* This is a placeholder until we get native OSX support ironed out -- JFF 11/18/09 */
#   define  TARGET_HOST_POSIX_X11  1
/* #   define  TARGET_HOST_MAC_OSX    1 */

#else
#   error "Unrecognized target host!"
*/
#endif

/* Detect both SunPro and gcc compilers on Sun Solaris */
#if defined (__SVR4) && defined (__sun)
#   define TARGET_HOST_SOLARIS 1
#endif

#ifndef TARGET_HOST_MS_WINDOWS
#   define  TARGET_HOST_MS_WINDOWS 0
#endif

#ifndef  TARGET_HOST_POSIX_X11
#   define  TARGET_HOST_POSIX_X11  0
#endif

#ifndef  TARGET_HOST_MAC_OSX
#   define  TARGET_HOST_MAC_OSX    0
#endif

#ifndef  TARGET_HOST_SOLARIS
#   define  TARGET_HOST_SOLARIS    0
#endif

/* -- FIXED CONFIGURATION LIMITS ------------------------------------------- */

#define  FREEGLUT_MAX_MENUS         3

/* -- PLATFORM-SPECIFIC INCLUDES ------------------------------------------- */

/* All Win32 headers depend on the huge Windows.h recursive include.
 * Note: Let's use proper case for MS-Win headers. Even though it's
 * not required due to case insensitivity, it's a good habit to keep
 * because the cross-platform includes are case sensitive.
 */
#if TARGET_HOST_MS_WINDOWS && !defined(_WIN32_WCE)
#    include <Windows.h>
#    include <WindowsX.h>
#    include <MMSystem.h>
/* CYGWIN does not have tchar.h, but has TEXT(x), defined in winnt.h. */
#    ifndef __CYGWIN__
#      include <tchar.h>
#    else
#      define _TEXT(x) TEXT(x)
#      define _T(x)    TEXT(x)
#    endif

#elif TARGET_HOST_POSIX_X11
#    include <GL/glx.h>
#    include <X11/Xlib.h>
#    include <X11/Xatom.h>
#    include <X11/keysym.h>
#    include <X11/extensions/XInput.h>
#    ifdef HAVE_X11_EXTENSIONS_XF86VMODE_H
#        include <X11/extensions/xf86vmode.h>
#    endif
/* If GLX is too old, we will fail during runtime when multisampling
   is requested, but at least freeglut compiles. */
#    ifndef GLX_SAMPLE_BUFFERS
#        define GLX_SAMPLE_BUFFERS 0x80A8
#    endif
#    ifndef GLX_SAMPLES
#        define GLX_SAMPLES 0x80A9
#    endif

#endif

/* These files should be available on every platform. */
#include <stdio.h>
#include <string.h>
#include <math.h>
#include <stdlib.h>

/* These are included based on autoconf directives. */
#if HAVE_SYS_TYPES_H
#    include <sys/types.h>
#endif
#if HAVE_UNISTD_H
#    include <unistd.h>
#endif
#if TIME_WITH_SYS_TIME
#    include <sys/time.h>
#    include <time.h>
#elif HAVE_SYS_TIME_H
#    include <sys/time.h>
#else
#    include <time.h>
#endif

/* -- AUTOCONF HACKS --------------------------------------------------------*/

/* XXX: Update autoconf to avoid these.
 * XXX: Are non-POSIX platforms intended not to use autoconf?
 * If so, perhaps there should be a config_guess.h for them. Alternatively,
 * config guesses could be placed above, just after the config.h exclusion.
 */
#if defined(__FreeBSD__) || defined(__NetBSD__)
#    define HAVE_USB_JS 1
#    if defined(__NetBSD__) || ( defined(__FreeBSD__) && __FreeBSD_version >= 500000)
#        define HAVE_USBHID_H 1
#    endif
#endif

#if TARGET_HOST_MS_WINDOWS
#    define  HAVE_VPRINTF 1
#endif

#if !defined(HAVE_VPRINTF) && !defined(HAVE_DOPRNT)
/* XXX warning directive here? */
#    define  HAVE_VPRINTF 1
#endif

/* MinGW may lack a prototype for ChangeDisplaySettingsEx() (depending on the version?) */
#if TARGET_HOST_MS_WINDOWS && !defined(ChangeDisplaySettingsEx)
LONG WINAPI ChangeDisplaySettingsExA(LPCSTR,LPDEVMODEA,HWND,DWORD,LPVOID);
LONG WINAPI ChangeDisplaySettingsExW(LPCWSTR,LPDEVMODEW,HWND,DWORD,LPVOID);
#    ifdef UNICODE
#        define ChangeDisplaySettingsEx ChangeDisplaySettingsExW
#    else
#        define ChangeDisplaySettingsEx ChangeDisplaySettingsExA
#    endif
#endif

#if defined(_MSC_VER) || defined(__WATCOMC__)
/* strdup() is non-standard, for all but POSIX-2001 */
#define strdup   _strdup
#endif

/* M_PI is non-standard (defined by BSD, not ISO-C) */
#ifndef M_PI
#    define  M_PI  3.14159265358979323846
#endif

#ifndef TRUE
#    define  TRUE  1
#endif

#ifndef FALSE
#    define  FALSE  0
#endif

/* General defines */

#define INVALID_MODIFIERS 0xffffffff

/* -- GLOBAL TYPE DEFINITIONS ---------------------------------------------- */

/* Freeglut callbacks type definitions */
typedef void (* FGCBDisplay       )( void );
typedef void (* FGCBReshape       )( int, int );
typedef void (* FGCBVisibility    )( int );
typedef void (* FGCBKeyboard      )( unsigned char, int, int );
typedef void (* FGCBSpecial       )( int, int, int );
typedef void (* FGCBMouse         )( int, int, int, int );
typedef void (* FGCBMouseWheel    )( int, int, int, int );
typedef void (* FGCBMotion        )( int, int );
typedef void (* FGCBPassive       )( int, int );
typedef void (* FGCBEntry         )( int );
typedef void (* FGCBWindowStatus  )( int );
typedef void (* FGCBSelect        )( int, int, int );
typedef void (* FGCBJoystick      )( unsigned int, int, int, int );
typedef void (* FGCBKeyboardUp    )( unsigned char, int, int );
typedef void (* FGCBSpecialUp     )( int, int, int );
typedef void (* FGCBOverlayDisplay)( void );
typedef void (* FGCBSpaceMotion   )( int, int, int );
typedef void (* FGCBSpaceRotation )( int, int, int );
typedef void (* FGCBSpaceButton   )( int, int );
typedef void (* FGCBDials         )( int, int );
typedef void (* FGCBButtonBox     )( int, int );
typedef void (* FGCBTabletMotion  )( int, int );
typedef void (* FGCBTabletButton  )( int, int, int, int );
typedef void (* FGCBDestroy       )( void );

/* The global callbacks type definitions */
typedef void (* FGCBIdle          )( void );
typedef void (* FGCBTimer         )( int );
typedef void (* FGCBMenuState     )( int );
typedef void (* FGCBMenuStatus    )( int, int, int );

/* The callback used when creating/using menus */
typedef void (* FGCBMenu          )( int );


/* A list structure */
typedef struct tagSFG_List SFG_List;
struct tagSFG_List
{
    void *First;
    void *Last;
};

/* A list node structure */
typedef struct tagSFG_Node SFG_Node;
struct tagSFG_Node
{
    void *Next;
    void *Prev;
};

/* A helper structure holding two ints and a boolean */
typedef struct tagSFG_XYUse SFG_XYUse;
struct tagSFG_XYUse
{
    GLint           X, Y;               /* The two integers...               */
    GLboolean       Use;                /* ...and a single boolean.          */
};

/*
 * An enumeration containing the state of the GLUT execution:
 * initializing, running, or stopping
 */
typedef enum
{
  GLUT_EXEC_STATE_INIT,
  GLUT_EXEC_STATE_RUNNING,
  GLUT_EXEC_STATE_STOP
} fgExecutionState ;

/* This structure holds different freeglut settings */
typedef struct tagSFG_State SFG_State;
struct tagSFG_State
{
    SFG_XYUse        Position;             /* The default windows' position  */
    SFG_XYUse        Size;                 /* The default windows' size      */
    unsigned int     DisplayMode;          /* Display mode for new windows   */

    GLboolean        Initialised;          /* freeglut has been initialised  */

    int              DirectContext;        /* Direct rendering state         */

    GLboolean        ForceIconic;          /* New top windows are iconified  */
    GLboolean        UseCurrentContext;    /* New windows share with current */

    GLboolean        GLDebugSwitch;        /* OpenGL state debugging switch  */
    GLboolean        XSyncSwitch;          /* X11 sync protocol switch       */

    int              KeyRepeat;            /* Global key repeat mode.        */
    int              Modifiers;            /* Current ALT/SHIFT/CTRL state   */

    GLuint           FPSInterval;          /* Interval between FPS printfs   */
    GLuint           SwapCount;            /* Count of glutSwapBuffer calls  */
    GLuint           SwapTime;             /* Time of last SwapBuffers       */

    unsigned long    Time;                 /* Time that glutInit was called  */
    SFG_List         Timers;               /* The freeglut timer hooks       */
    SFG_List         FreeTimers;           /* The unused timer hooks         */

    FGCBIdle         IdleCallback;         /* The global idle callback       */

    int              ActiveMenus;          /* Num. of currently active menus */
    FGCBMenuState    MenuStateCallback;    /* Menu callbacks are global      */
    FGCBMenuStatus   MenuStatusCallback;

    SFG_XYUse        GameModeSize;         /* Game mode screen's dimensions  */
    int              GameModeDepth;        /* The pixel depth for game mode  */
    int              GameModeRefresh;      /* The refresh rate for game mode */

    int              ActionOnWindowClose; /* Action when user closes window  */

    fgExecutionState ExecState;           /* Used for GLUT termination       */
    char            *ProgramName;         /* Name of the invoking program    */
    GLboolean        JoysticksInitialised;  /* Only initialize if application calls for them */
    GLboolean        InputDevsInitialised;  /* Only initialize if application calls for them */

    int              AuxiliaryBufferNumber;  /* Number of auxiliary buffers */
    int              SampleNumber;         /*  Number of samples per pixel  */

    int              MajorVersion;         /* Major OpenGL context version  */
    int              MinorVersion;         /* Minor OpenGL context version  */
    int              ContextFlags;         /* OpenGL context flags          */
    int              ContextProfile;       /* OpenGL context profile        */
};

/* The structure used by display initialization in freeglut_init.c */
typedef struct tagSFG_Display SFG_Display;
struct tagSFG_Display
{
#if TARGET_HOST_POSIX_X11
    Display*        Display;            /* The display we are being run in.  */
    int             Screen;             /* The screen we are about to use.   */
    Window          RootWindow;         /* The screen's root window.         */
    int             Connection;         /* The display's connection number   */
    Atom            DeleteWindow;       /* The window deletion atom          */
    Atom            State;              /* The state atom                    */
    Atom            StateFullScreen;    /* The full screen atom              */

#ifdef X_XF86VidModeGetModeLine
    /*
     * XF86VidMode may be compilable even if it fails at runtime.  Therefore,
     * the validity of the VidMode has to be tracked
     */
    int             DisplayModeValid;   /* Flag that indicates runtime status*/
    XF86VidModeModeLine DisplayMode;    /* Current screen's display settings */
    int             DisplayModeClock;   /* The display mode's refresh rate   */
    int             DisplayViewPortX;   /* saved X location of the viewport  */
    int             DisplayViewPortY;   /* saved Y location of the viewport  */
    int             DisplayPointerX;    /* saved X location of the pointer   */
    int             DisplayPointerY;    /* saved Y location of the pointer   */

#endif /* X_XF86VidModeGetModeLine */

#elif TARGET_HOST_MS_WINDOWS
    HINSTANCE        Instance;          /* The application's instance        */
    DEVMODE         DisplayMode;        /* Desktop's display settings        */

#endif

    int             ScreenWidth;        /* The screen's width in pixels      */
    int             ScreenHeight;       /* The screen's height in pixels     */
    int             ScreenWidthMM;      /* The screen's width in milimeters  */
    int             ScreenHeightMM;     /* The screen's height in milimeters */
};


/* The user can create any number of timer hooks */
typedef struct tagSFG_Timer SFG_Timer;
struct tagSFG_Timer
{
    SFG_Node        Node;
    int             ID;                 /* The timer ID integer              */
    FGCBTimer       Callback;           /* The timer callback                */
    long            TriggerTime;        /* The timer trigger time            */
};

/*
 * Make "freeglut" window handle and context types so that we don't need so
 * much conditionally-compiled code later in the library.
 */
#if TARGET_HOST_POSIX_X11

typedef Window     SFG_WindowHandleType ;
typedef GLXContext SFG_WindowContextType ;

#elif TARGET_HOST_MS_WINDOWS

typedef HWND    SFG_WindowHandleType ;
typedef HGLRC   SFG_WindowContextType ;

#endif

/*
 * A window and its OpenGL context. The contents of this structure
 * are highly dependant on the target operating system we aim at...
 */
typedef struct tagSFG_Context SFG_Context;
struct tagSFG_Context
{
    SFG_WindowHandleType  Handle;    /* The window's handle                 */
    SFG_WindowContextType Context;   /* The window's OpenGL/WGL context     */

#if TARGET_HOST_POSIX_X11
    GLXFBConfig*    FBConfig;        /* The window's FBConfig               */
#elif TARGET_HOST_MS_WINDOWS
    HDC             Device;          /* The window's device context         */
#endif

    int             DoubleBuffered;  /* Treat the window as double-buffered */
};

/* Window's state description. This structure should be kept portable. */
typedef struct tagSFG_WindowState SFG_WindowState;
struct tagSFG_WindowState
{
    int             Width;              /* Window's width in pixels          */
    int             Height;             /* The same about the height         */
    int             OldWidth;           /* Window width from before a resize */
    int             OldHeight;          /*   "    height  "    "    "   "    */

    GLboolean       Redisplay;          /* Do we have to redisplay?          */
    GLboolean       Visible;            /* Is the window visible now         */

    int             Cursor;             /* The currently selected cursor     */

    long            JoystickPollRate;   /* The joystick polling rate         */
    long            JoystickLastPoll;   /* When the last poll happened       */

    int             MouseX, MouseY;     /* The most recent mouse position    */

    GLboolean       IgnoreKeyRepeat;    /* Whether to ignore key repeat.     */
    GLboolean       KeyRepeating;       /* Currently in repeat mode          */

    GLboolean       NeedToResize;       /* Do we need to resize the window?  */

    GLboolean       IsFullscreen;       /* is the window fullscreen? */
};


/*
 * A generic function pointer.  We should really use the GLUTproc type
 * defined in freeglut_ext.h, but if we include that header in this file
 * a bunch of other stuff (font-related) blows up!
 */
typedef void (*SFG_Proc)();


/*
 * SET_WCB() is used as:
 *
 *     SET_WCB( window, cbname, func );
 *
 * ...where {window} is the freeglut window to set the callback,
 *          {cbname} is the window-specific callback to set,
 *          {func} is a function-pointer.
 *
 * Originally, {FETCH_WCB( ... ) = func} was rather sloppily used,
 * but this can cause warnings because the FETCH_WCB() macro type-
 * casts its result, and a type-cast value shouldn't be an lvalue.
 *
 * The {if( FETCH_WCB( ... ) != func )} test is to do type-checking
 * and for no other reason.  Since it's hidden in the macro, the
 * ugliness is felt to be rather benign.
 */
#define SET_WCB(window,cbname,func)                            \
do                                                             \
{                                                              \
    if( FETCH_WCB( window, cbname ) != (SFG_Proc)(func) )      \
        (((window).CallBacks[CB_ ## cbname]) = (SFG_Proc)(func)); \
} while( 0 )

/*
 * FETCH_WCB() is used as:
 *
 *     FETCH_WCB( window, cbname );
 *
 * ...where {window} is the freeglut window to fetch the callback from,
 *          {cbname} is the window-specific callback to fetch.
 *
 * The result is correctly type-cast to the callback function pointer
 * type.
 */
#define FETCH_WCB(window,cbname) \
    ((window).CallBacks[CB_ ## cbname])

/*
 * INVOKE_WCB() is used as:
 *
 *     INVOKE_WCB( window, cbname, ( arg_list ) );
 *
 * ...where {window} is the freeglut window,
 *          {cbname} is the window-specific callback to be invoked,
 *          {(arg_list)} is the parameter list.
 *
 * The callback is invoked as:
 *
 *    callback( arg_list );
 *
 * ...so the parentheses are REQUIRED in the {arg_list}.
 *
 * NOTE that it does a sanity-check and also sets the
 * current window.
 *
 */
#if TARGET_HOST_MS_WINDOWS && !defined(_WIN32_WCE) /* FIXME: also WinCE? */
#define INVOKE_WCB(window,cbname,arg_list)    \
do                                            \
{                                             \
    if( FETCH_WCB( window, cbname ) )         \
    {                                         \
        FGCB ## cbname func = (FGCB ## cbname)(FETCH_WCB( window, cbname )); \
        fgSetWindow( &window );               \
        func arg_list;                        \
    }                                         \
} while( 0 )
#else
#define INVOKE_WCB(window,cbname,arg_list)    \
do                                            \
{                                             \
    if( FETCH_WCB( window, cbname ) )         \
    {                                         \
        fgSetWindow( &window );               \
        ((FGCB ## cbname)FETCH_WCB( window, cbname )) arg_list; \
    }                                         \
} while( 0 )
#endif

/*
 * The window callbacks the user can supply us with. Should be kept portable.
 *
 * This enumeration provides the freeglut CallBack numbers.
 * The symbolic constants are indices into a window's array of
 * function callbacks.  The names are formed by splicing a common
 * prefix onto the callback's base name.  (This was originally
 * done so that an early stage of development could live side-by-
 * side with the old callback code.  The old callback code used
 * the bare callback's name as a structure member, so I used a
 * prefix for the array index name.)
 *
 * XXX For consistancy, perhaps the prefix should match the
 * XXX FETCH* and INVOKE* macro suffices.  I.e., WCB_, rather than
 * XXX CB_.
 */
enum
{
    CB_Display,
    CB_Reshape,
    CB_Keyboard,
    CB_KeyboardUp,
    CB_Special,
    CB_SpecialUp,
    CB_Mouse,
    CB_MouseWheel,
    CB_Motion,
    CB_Passive,
    CB_Entry,
    CB_Visibility,
    CB_WindowStatus,
    CB_Joystick,
    CB_Destroy,

    /* Presently ignored */
    CB_Select,
    CB_OverlayDisplay,
    CB_SpaceMotion,     /* presently implemented only on UNIX/X11 */
    CB_SpaceRotation,   /* presently implemented only on UNIX/X11 */
    CB_SpaceButton,     /* presently implemented only on UNIX/X11 */
    CB_Dials,
    CB_ButtonBox,
    CB_TabletMotion,
    CB_TabletButton,

    /* Always make this the LAST one */
    TOTAL_CALLBACKS
};


/* This structure holds the OpenGL rendering context for all the menu windows */
typedef struct tagSFG_MenuContext SFG_MenuContext;
struct tagSFG_MenuContext
{
    SFG_WindowContextType MContext;       /* The menu window's WGL context   */
};

/* This structure describes a menu */
typedef struct tagSFG_Window SFG_Window;
typedef struct tagSFG_MenuEntry SFG_MenuEntry;
typedef struct tagSFG_Menu SFG_Menu;
struct tagSFG_Menu
{
    SFG_Node            Node;
    void               *UserData;     /* User data passed back at callback   */
    int                 ID;           /* The global menu ID                  */
    SFG_List            Entries;      /* The menu entries list               */
    FGCBMenu            Callback;     /* The menu callback                   */
    FGCBDestroy         Destroy;      /* Destruction callback                */
    GLboolean           IsActive;     /* Is the menu selected?               */
    int                 Width;        /* Menu box width in pixels            */
    int                 Height;       /* Menu box height in pixels           */
    int                 X, Y;         /* Menu box raster position            */

    SFG_MenuEntry      *ActiveEntry;  /* Currently active entry in the menu  */
    SFG_Window         *Window;       /* Window for menu                     */
    SFG_Window         *ParentWindow; /* Window in which the menu is invoked */
};

/* This is a menu entry */
struct tagSFG_MenuEntry
{
    SFG_Node            Node;
    int                 ID;                     /* The menu entry ID (local) */
    int                 Ordinal;                /* The menu's ordinal number */
    char*               Text;                   /* The text to be displayed  */
    SFG_Menu*           SubMenu;                /* Optional sub-menu tree    */
    GLboolean           IsActive;               /* Is the entry highlighted? */
    int                 Width;                  /* Label's width in pixels   */
};

/*
 * A window, making part of freeglut windows hierarchy.
 * Should be kept portable.
 *
 * NOTE that ActiveMenu is set to menu itself if the window is a menu.
 */
struct tagSFG_Window
{
    SFG_Node            Node;
    int                 ID;                     /* Window's ID number        */

    SFG_Context         Window;                 /* Window and OpenGL context */
    SFG_WindowState     State;                  /* The window state          */
    SFG_Proc            CallBacks[ TOTAL_CALLBACKS ]; /* Array of window callbacks */
    void               *UserData ;              /* For use by user           */

    SFG_Menu*       Menu[ FREEGLUT_MAX_MENUS ]; /* Menus appended to window  */
    SFG_Menu*       ActiveMenu;                 /* The window's active menu  */

    SFG_Window*         Parent;                 /* The parent to this window */
    SFG_List            Children;               /* The subwindows d.l. list  */

    GLboolean           IsMenu;                 /* Set to 1 if we are a menu */
};


/* A linked list structure of windows */
typedef struct tagSFG_WindowList SFG_WindowList ;
struct tagSFG_WindowList
{
    SFG_Node node;
    SFG_Window *window ;
};

/* This holds information about all the windows, menus etc. */
typedef struct tagSFG_Structure SFG_Structure;
struct tagSFG_Structure
{
    SFG_List        Windows;         /* The global windows list            */
    SFG_List        Menus;           /* The global menus list              */
    SFG_List        WindowsToDestroy;

    SFG_Window*     CurrentWindow;   /* The currently set window          */
    SFG_Menu*       CurrentMenu;     /* Same, but menu...                 */

    SFG_MenuContext* MenuContext;    /* OpenGL rendering context for menus */

    SFG_Window*      GameModeWindow; /* The game mode window               */

    int              WindowID;       /* The new current window ID          */
    int              MenuID;         /* The new current menu ID            */
};

/*
 * This structure is used for the enumeration purposes.
 * You can easily extend its functionalities by declaring
 * a structure containing enumerator's contents and custom
 * data, then casting its pointer to (SFG_Enumerator *).
 */
typedef struct tagSFG_Enumerator SFG_Enumerator;
struct tagSFG_Enumerator
{
    GLboolean   found;                          /* Used to terminate search  */
    void*       data;                           /* Custom data pointer       */
};
typedef void (* FGCBenumerator  )( SFG_Window *, SFG_Enumerator * );

/* The bitmap font structure */
typedef struct tagSFG_Font SFG_Font;
struct tagSFG_Font
{
    char*           Name;         /* The source font name             */
    int             Quantity;     /* Number of chars in font          */
    int             Height;       /* Height of the characters         */
    const GLubyte** Characters;   /* The characters mapping           */

    float           xorig, yorig; /* Relative origin of the character */
};

/* The stroke font structures */

typedef struct tagSFG_StrokeVertex SFG_StrokeVertex;
struct tagSFG_StrokeVertex
{
    GLfloat         X, Y;
};

typedef struct tagSFG_StrokeStrip SFG_StrokeStrip;
struct tagSFG_StrokeStrip
{
    int             Number;
    const SFG_StrokeVertex* Vertices;
};

typedef struct tagSFG_StrokeChar SFG_StrokeChar;
struct tagSFG_StrokeChar
{
    GLfloat         Right;
    int             Number;
    const SFG_StrokeStrip* Strips;
};

typedef struct tagSFG_StrokeFont SFG_StrokeFont;
struct tagSFG_StrokeFont
{
    char*           Name;                       /* The source font name      */
    int             Quantity;                   /* Number of chars in font   */
    GLfloat         Height;                     /* Height of the characters  */
    const SFG_StrokeChar** Characters;          /* The characters mapping    */
};

/* -- GLOBAL VARIABLES EXPORTS --------------------------------------------- */

/* Freeglut display related stuff (initialized once per session) */
extern SFG_Display fgDisplay;

/* Freeglut internal structure */
extern SFG_Structure fgStructure;

/* The current freeglut settings */
extern SFG_State fgState;


/* -- PRIVATE FUNCTION DECLARATIONS ---------------------------------------- */

/*
 * A call to this function makes us sure that the Display and Structure
 * subsystems have been properly initialized and are ready to be used
 */
#define  FREEGLUT_EXIT_IF_NOT_INITIALISED( string )               \
  if ( ! fgState.Initialised )                                    \
  {                                                               \
    fgError ( " ERROR:  Function <%s> called"                     \
              " without first calling 'glutInit'.", (string) ) ;  \
  }

#define  FREEGLUT_INTERNAL_ERROR_EXIT_IF_NOT_INITIALISED( string )  \
  if ( ! fgState.Initialised )                                      \
  {                                                                 \
    fgError ( " ERROR:  Internal <%s> function called"              \
              " without first calling 'glutInit'.", (string) ) ;    \
  }

#define  FREEGLUT_INTERNAL_ERROR_EXIT( cond, string, function )  \
  if ( ! ( cond ) )                                              \
  {                                                              \
    fgError ( " ERROR:  Internal error <%s> in function %s",     \
              (string), (function) ) ;                           \
  }

/*
 * Following definitions are somewhat similiar to GLib's,
 * but do not generate any log messages:
 */
#define  freeglut_return_if_fail( expr ) \
    if( !(expr) )                        \
        return;
#define  freeglut_return_val_if_fail( expr, val ) \
    if( !(expr) )                                 \
        return val ;

/*
 * A call to those macros assures us that there is a current
 * window set, respectively:
 */
#define  FREEGLUT_EXIT_IF_NO_WINDOW( string )                   \
  if ( ! fgStructure.CurrentWindow )                            \
  {                                                             \
    fgError ( " ERROR:  Function <%s> called"                   \
              " with no current window defined.", (string) ) ;  \
  }

/*
 * The deinitialize function gets called on glutMainLoop() end. It should clean up
 * everything inside of the freeglut
 */
void fgDeinitialize( void );

/*
 * Those two functions are used to create/destroy the freeglut internal
 * structures. This actually happens when calling glutInit() and when
 * quitting the glutMainLoop() (which actually happens, when all windows
 * have been closed).
 */
void fgCreateStructure( void );
void fgDestroyStructure( void );

/* A helper function to check if a display mode is possible to use */
#if TARGET_HOST_POSIX_X11
GLXFBConfig* fgChooseFBConfig( void );
#endif

/* The window procedure for Win32 events handling */
#if TARGET_HOST_MS_WINDOWS
LRESULT CALLBACK fgWindowProc( HWND hWnd, UINT uMsg,
                               WPARAM wParam, LPARAM lParam );
void fgNewWGLCreateContext( SFG_Window* window );
GLboolean fgSetupPixelFormat( SFG_Window* window, GLboolean checkOnly,
                              unsigned char layer_type );
#endif

/*
 * Window creation, opening, closing and destruction.
 * Also CallBack clearing/initialization.
 * Defined in freeglut_structure.c, freeglut_window.c.
 */
SFG_Window* fgCreateWindow( SFG_Window* parent, const char* title,
                            GLboolean positionUse, int x, int y,
                            GLboolean sizeUse, int w, int h,
                            GLboolean gameMode, GLboolean isMenu );
void        fgSetWindow ( SFG_Window *window );
void        fgOpenWindow( SFG_Window* window, const char* title,
                          GLboolean positionUse, int x, int y,
                          GLboolean sizeUse, int w, int h,
                          GLboolean gameMode, GLboolean isSubWindow );
void        fgCloseWindow( SFG_Window* window );
void        fgAddToWindowDestroyList ( SFG_Window* window );
void        fgCloseWindows ();
void        fgDestroyWindow( SFG_Window* window );

/* Menu creation and destruction. Defined in freeglut_structure.c */
SFG_Menu*   fgCreateMenu( FGCBMenu menuCallback );
void        fgDestroyMenu( SFG_Menu* menu );

/* Joystick device management functions, defined in freeglut_joystick.c */
int         fgJoystickDetect( void );
void        fgInitialiseJoysticks( void );
void        fgJoystickClose( void );
void        fgJoystickPollWindow( SFG_Window* window );

/* InputDevice Initialisation and Closure */
int         fgInputDeviceDetect( void );
void        fgInitialiseInputDevices( void );
void        fgInputDeviceClose( void );

/* spaceball device functions, defined in freeglut_spaceball.c */
void        fgInitialiseSpaceball( void );
void        fgSpaceballClose( void );
void        fgSpaceballSetWindow( SFG_Window *window );

int         fgHasSpaceball( void );
int         fgSpaceballNumButtons( void );

#if TARGET_HOST_POSIX_X11
int         fgIsSpaceballXEvent( const XEvent *ev );
void        fgSpaceballHandleXEvent( const XEvent *ev );
#endif

/* Setting the cursor for a given window */
void fgSetCursor ( SFG_Window *window, int cursorID );

/*
 * Helper function to enumerate through all registered windows
 * and one to enumerate all of a window's subwindows...
 *
 * The GFunc callback for those functions will be defined as:
 *
 *      void enumCallback( gpointer window, gpointer enumerator );
 *
 * where window is the enumerated (sub)window pointer (SFG_Window *),
 * and userData is the a custom user-supplied pointer. Functions
 * are defined and exported from freeglut_structure.c file.
 */
void fgEnumWindows( FGCBenumerator enumCallback, SFG_Enumerator* enumerator );
void fgEnumSubWindows( SFG_Window* window, FGCBenumerator enumCallback,
                       SFG_Enumerator* enumerator );

/*
 * fgWindowByHandle returns a (SFG_Window *) value pointing to the
 * first window in the queue matching the specified window handle.
 * The function is defined in freeglut_structure.c file.
 */
SFG_Window* fgWindowByHandle( SFG_WindowHandleType hWindow );

/*
 * This function is similiar to the previous one, except it is
 * looking for a specified (sub)window identifier. The function
 * is defined in freeglut_structure.c file.
 */
SFG_Window* fgWindowByID( int windowID );

/*
 * Looks up a menu given its ID. This is easier than fgWindowByXXX
 * as all menus are placed in a single doubly linked list...
 */
SFG_Menu* fgMenuByID( int menuID );

/*
 * The menu activation and deactivation the code. This is the meat
 * of the menu user interface handling code...
 */
void fgUpdateMenuHighlight ( SFG_Menu *menu );
GLboolean fgCheckActiveMenu ( SFG_Window *window, int button, GLboolean pressed,
                              int mouse_x, int mouse_y );
void fgDeactivateMenu( SFG_Window *window );

/*
 * This function gets called just before the buffers swap, so that
 * freeglut can display the pull-down menus via OpenGL. The function
 * is defined in freeglut_menu.c file.
 */
void fgDisplayMenu( void );

/* Elapsed time as per glutGet(GLUT_ELAPSED_TIME). */
long fgElapsedTime( void );

/* System time in milliseconds */
long unsigned fgSystemTime(void);

/* List functions */
void fgListInit(SFG_List *list);
void fgListAppend(SFG_List *list, SFG_Node *node);
void fgListRemove(SFG_List *list, SFG_Node *node);
int fgListLength(SFG_List *list);
void fgListInsert(SFG_List *list, SFG_Node *next, SFG_Node *node);

/* Error Message functions */
void fgError( const char *fmt, ... );
void fgWarning( const char *fmt, ... );

/*
 * Check if "hint" is present in "property" for "window".  See freeglut_init.c
 */
#if TARGET_HOST_POSIX_X11
int fgHintPresent(Window window, Atom property, Atom hint);
#endif

SFG_Proc fghGetProcAddress( const char *procName );

#if TARGET_HOST_MS_WINDOWS
extern void (__cdecl *__glutExitFunc)( int return_value );
#endif

#endif /* FREEGLUT_INTERNAL_H */

/*** END OF FILE ***/
