/*
 * freeglut_state.c
 *
 * Freeglut state query methods.
 *
 * Copyright (c) 1999-2000 Pawel W. Olszta. All Rights Reserved.
 * Written by Pawel W. Olszta, <olszta@sourceforge.net>
 * Creation date: Thu Dec 16 1999
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

#include <GL/freeglut.h>
#include "freeglut_internal.h"

/*
 * TODO BEFORE THE STABLE RELEASE:
 *
 *  glutGet()               -- X11 tests passed, but check if all enums
 *                             handled (what about Win32?)
 *  glutDeviceGet()         -- X11 tests passed, but check if all enums
 *                             handled (what about Win32?)
 *  glutGetModifiers()      -- OK, but could also remove the limitation
 *  glutLayerGet()          -- what about GLUT_NORMAL_DAMAGED?
 *
 * The fail-on-call policy will help adding the most needed things imho.
 */

/* -- LOCAL DEFINITIONS ---------------------------------------------------- */

/* -- PRIVATE FUNCTIONS ---------------------------------------------------- */

#if TARGET_HOST_POSIX_X11
/*
 * Queries the GL context about some attributes
 */
static int fghGetConfig( int attribute )
{
  int returnValue = 0;
  int result;  /*  Not checked  */

  if( fgStructure.CurrentWindow )
      result = glXGetFBConfigAttrib( fgDisplay.Display,
                                     *(fgStructure.CurrentWindow->Window.FBConfig),
                                     attribute,
                                     &returnValue );

  return returnValue;
}
#endif

/* Check if the window is in full screen state. */
static int fghCheckFullScreen(void)
{
#if TARGET_HOST_POSIX_X11
    return fgStructure.CurrentWindow->State.IsFullscreen;
#else
    return 0;
#endif
}

/* -- INTERFACE FUNCTIONS -------------------------------------------------- */

/*
 * General settings assignment method
 */
void FGAPIENTRY glutSetOption( GLenum eWhat, int value )
{
    FREEGLUT_EXIT_IF_NOT_INITIALISED ( "glutSetOption" );

    /*
     * XXX In chronological code add order.  (WHY in that order?)
     */
    switch( eWhat )
    {
    case GLUT_INIT_WINDOW_X:
        fgState.Position.X = (GLint)value;
        break;

    case GLUT_INIT_WINDOW_Y:
        fgState.Position.Y = (GLint)value;
        break;

    case GLUT_INIT_WINDOW_WIDTH:
        fgState.Size.X = (GLint)value;
        break;

    case GLUT_INIT_WINDOW_HEIGHT:
        fgState.Size.Y = (GLint)value;
        break;

    case GLUT_INIT_DISPLAY_MODE:
        fgState.DisplayMode = (unsigned int)value;
        break;

    case GLUT_ACTION_ON_WINDOW_CLOSE:
        fgState.ActionOnWindowClose = value;
        break;

    case GLUT_RENDERING_CONTEXT:
        fgState.UseCurrentContext =
            ( value == GLUT_USE_CURRENT_CONTEXT ) ? GL_TRUE : GL_FALSE;
        break;

    case GLUT_DIRECT_RENDERING:
        fgState.DirectContext = value;
        break;

    case GLUT_WINDOW_CURSOR:
        if( fgStructure.CurrentWindow != NULL )
            fgStructure.CurrentWindow->State.Cursor = value;
        break;

    case GLUT_AUX:
      fgState.AuxiliaryBufferNumber = value;
      break;

    case GLUT_MULTISAMPLE:
      fgState.SampleNumber = value;
      break;

    default:
        fgWarning( "glutSetOption(): missing enum handle %d", eWhat );
        break;
    }
}

#if TARGET_HOST_MS_WINDOWS
/* The following include file is available from SGI but is not standard:
 *   #include <GL/wglext.h>
 * So we copy the necessary parts out of it to support the multisampling query
 */
#define WGL_SAMPLES_ARB                0x2042
#endif


/*
 * General settings query method
 */
int FGAPIENTRY glutGet( GLenum eWhat )
{
#if TARGET_HOST_MS_WINDOWS
    int returnValue ;
    GLboolean boolValue ;
#endif

    int nsamples = 0;

    switch (eWhat)
    {
    case GLUT_INIT_STATE:
        return fgState.Initialised;

    case GLUT_ELAPSED_TIME:
        return fgElapsedTime();
    }

    FREEGLUT_EXIT_IF_NOT_INITIALISED ( "glutGet" );

    /* XXX In chronological code add order.  (WHY in that order?) */
    switch( eWhat )
    {
    /* Following values are stored in fgState and fgDisplay global structures */
    case GLUT_SCREEN_WIDTH:         return fgDisplay.ScreenWidth   ;
    case GLUT_SCREEN_HEIGHT:        return fgDisplay.ScreenHeight  ;
    case GLUT_SCREEN_WIDTH_MM:      return fgDisplay.ScreenWidthMM ;
    case GLUT_SCREEN_HEIGHT_MM:     return fgDisplay.ScreenHeightMM;
    case GLUT_INIT_WINDOW_X:        return fgState.Position.Use ?
                                           fgState.Position.X : -1 ;
    case GLUT_INIT_WINDOW_Y:        return fgState.Position.Use ?
                                           fgState.Position.Y : -1 ;
    case GLUT_INIT_WINDOW_WIDTH:    return fgState.Size.Use ?
                                           fgState.Size.X : -1     ;
    case GLUT_INIT_WINDOW_HEIGHT:   return fgState.Size.Use ?
                                           fgState.Size.Y : -1     ;
    case GLUT_INIT_DISPLAY_MODE:    return fgState.DisplayMode     ;
    case GLUT_INIT_MAJOR_VERSION:   return fgState.MajorVersion    ;
    case GLUT_INIT_MINOR_VERSION:   return fgState.MinorVersion    ;
    case GLUT_INIT_FLAGS:           return fgState.ContextFlags    ;
    case GLUT_INIT_PROFILE:         return fgState.ContextProfile  ;

#if TARGET_HOST_POSIX_X11
    /*
     * The window/context specific queries are handled mostly by
     * fghGetConfig().
     */
    case GLUT_WINDOW_NUM_SAMPLES:
#ifdef GLX_VERSION_1_3
        glGetIntegerv(GL_SAMPLES, &nsamples);
#endif
        return nsamples;

    /*
     * The rest of GLX queries under X are general enough to use a macro to
     * check them
     */
#   define GLX_QUERY(a,b) case a: return fghGetConfig( b );

    GLX_QUERY( GLUT_WINDOW_RGBA,                GLX_RGBA                );
    GLX_QUERY( GLUT_WINDOW_DOUBLEBUFFER,        GLX_DOUBLEBUFFER        );
    GLX_QUERY( GLUT_WINDOW_BUFFER_SIZE,         GLX_BUFFER_SIZE         );
    GLX_QUERY( GLUT_WINDOW_STENCIL_SIZE,        GLX_STENCIL_SIZE        );
    GLX_QUERY( GLUT_WINDOW_DEPTH_SIZE,          GLX_DEPTH_SIZE          );
    GLX_QUERY( GLUT_WINDOW_RED_SIZE,            GLX_RED_SIZE            );
    GLX_QUERY( GLUT_WINDOW_GREEN_SIZE,          GLX_GREEN_SIZE          );
    GLX_QUERY( GLUT_WINDOW_BLUE_SIZE,           GLX_BLUE_SIZE           );
    GLX_QUERY( GLUT_WINDOW_ALPHA_SIZE,          GLX_ALPHA_SIZE          );
    GLX_QUERY( GLUT_WINDOW_ACCUM_RED_SIZE,      GLX_ACCUM_RED_SIZE      );
    GLX_QUERY( GLUT_WINDOW_ACCUM_GREEN_SIZE,    GLX_ACCUM_GREEN_SIZE    );
    GLX_QUERY( GLUT_WINDOW_ACCUM_BLUE_SIZE,     GLX_ACCUM_BLUE_SIZE     );
    GLX_QUERY( GLUT_WINDOW_ACCUM_ALPHA_SIZE,    GLX_ACCUM_ALPHA_SIZE    );
    GLX_QUERY( GLUT_WINDOW_STEREO,              GLX_STEREO              );

#   undef GLX_QUERY

    /* Colormap size is handled in a bit different way than all the rest */
    case GLUT_WINDOW_COLORMAP_SIZE:
        if( (fghGetConfig( GLX_RGBA )) || (fgStructure.CurrentWindow == NULL) )
        {
            /*
             * We've got a RGBA visual, so there is no colormap at all.
             * The other possibility is that we have no current window set.
             */
            return 0;
        }
        else
        {
          const GLXFBConfig * fbconfig =
                fgStructure.CurrentWindow->Window.FBConfig;

          XVisualInfo * visualInfo =
                glXGetVisualFromFBConfig( fgDisplay.Display, *fbconfig );

          const int result = visualInfo->visual->map_entries;

          XFree(visualInfo);

          return result;
        }

    /*
     * Those calls are somewhat similiar, as they use XGetWindowAttributes()
     * function
     */
    case GLUT_WINDOW_X:
    case GLUT_WINDOW_Y:
    case GLUT_WINDOW_BORDER_WIDTH:
    case GLUT_WINDOW_HEADER_HEIGHT:
    {
        int x, y;
        Window w;

        if( fgStructure.CurrentWindow == NULL )
            return 0;

        XTranslateCoordinates(
            fgDisplay.Display,
            fgStructure.CurrentWindow->Window.Handle,
            fgDisplay.RootWindow,
            0, 0, &x, &y, &w);

        switch ( eWhat )
        {
        case GLUT_WINDOW_X: return x;
        case GLUT_WINDOW_Y: return y;
        }

        if ( w == 0 )
            return 0;
        XTranslateCoordinates(
            fgDisplay.Display,
            fgStructure.CurrentWindow->Window.Handle,
            w, 0, 0, &x, &y, &w);

        switch ( eWhat )
        {
        case GLUT_WINDOW_BORDER_WIDTH:  return x;
        case GLUT_WINDOW_HEADER_HEIGHT: return y;
        }
    }

    case GLUT_WINDOW_WIDTH:
    case GLUT_WINDOW_HEIGHT:
    {
        XWindowAttributes winAttributes;

        if( fgStructure.CurrentWindow == NULL )
            return 0;
        XGetWindowAttributes(
            fgDisplay.Display,
            fgStructure.CurrentWindow->Window.Handle,
            &winAttributes
        );
        switch ( eWhat )
        {
        case GLUT_WINDOW_WIDTH:            return winAttributes.width ;
        case GLUT_WINDOW_HEIGHT:           return winAttributes.height ;
        }
    }

    /* I do not know yet if there will be a fgChooseVisual() function for Win32 */
    case GLUT_DISPLAY_MODE_POSSIBLE:
    {
        /*  We should not have to call fgChooseFBConfig again here.  */
        GLXFBConfig * fbconfig;
        int isPossible;

        fbconfig = fgChooseFBConfig();

        if (fbconfig == NULL)
        {
            isPossible = 0;
        }
        else
        {
            isPossible = 1;
            XFree(fbconfig);
        }

        return isPossible;
    }

    /* This is system-dependant */
    case GLUT_WINDOW_FORMAT_ID:
        if( fgStructure.CurrentWindow == NULL )
            return 0;

        return fghGetConfig( GLX_VISUAL_ID );

#elif TARGET_HOST_MS_WINDOWS

    case GLUT_WINDOW_NUM_SAMPLES:
      glGetIntegerv(WGL_SAMPLES_ARB, &nsamples);
      return nsamples;

    /* Handle the OpenGL inquiries */
    case GLUT_WINDOW_RGBA:
#if defined(_WIN32_WCE)
      boolValue = (GLboolean)0;  /* WinCE doesn't support this feature */
#else
      glGetBooleanv ( GL_RGBA_MODE, &boolValue );
      returnValue = boolValue ? 1 : 0;
#endif
      return returnValue;
    case GLUT_WINDOW_DOUBLEBUFFER:
#if defined(_WIN32_WCE)
      boolValue = (GLboolean)0;  /* WinCE doesn't support this feature */
#else
      glGetBooleanv ( GL_DOUBLEBUFFER, &boolValue );
      returnValue = boolValue ? 1 : 0;
#endif
      return returnValue;
    case GLUT_WINDOW_STEREO:
#if defined(_WIN32_WCE)
      boolValue = (GLboolean)0;  /* WinCE doesn't support this feature */
#else
      glGetBooleanv ( GL_STEREO, &boolValue );
      returnValue = boolValue ? 1 : 0;
#endif
      return returnValue;

    case GLUT_WINDOW_RED_SIZE:
      glGetIntegerv ( GL_RED_BITS, &returnValue );
      return returnValue;
    case GLUT_WINDOW_GREEN_SIZE:
      glGetIntegerv ( GL_GREEN_BITS, &returnValue );
      return returnValue;
    case GLUT_WINDOW_BLUE_SIZE:
      glGetIntegerv ( GL_BLUE_BITS, &returnValue );
      return returnValue;
    case GLUT_WINDOW_ALPHA_SIZE:
      glGetIntegerv ( GL_ALPHA_BITS, &returnValue );
      return returnValue;
    case GLUT_WINDOW_ACCUM_RED_SIZE:
#if defined(_WIN32_WCE)
      returnValue = 0;  /* WinCE doesn't support this feature */
#else
      glGetIntegerv ( GL_ACCUM_RED_BITS, &returnValue );
#endif
      return returnValue;
    case GLUT_WINDOW_ACCUM_GREEN_SIZE:
#if defined(_WIN32_WCE)
      returnValue = 0;  /* WinCE doesn't support this feature */
#else
      glGetIntegerv ( GL_ACCUM_GREEN_BITS, &returnValue );
#endif
      return returnValue;
    case GLUT_WINDOW_ACCUM_BLUE_SIZE:
#if defined(_WIN32_WCE)
      returnValue = 0;  /* WinCE doesn't support this feature */
#else
      glGetIntegerv ( GL_ACCUM_BLUE_BITS, &returnValue );
#endif
      return returnValue;
    case GLUT_WINDOW_ACCUM_ALPHA_SIZE:
#if defined(_WIN32_WCE)
      returnValue = 0;  /* WinCE doesn't support this feature */
#else
      glGetIntegerv ( GL_ACCUM_ALPHA_BITS, &returnValue );
#endif
      return returnValue;
    case GLUT_WINDOW_DEPTH_SIZE:
      glGetIntegerv ( GL_DEPTH_BITS, &returnValue );
      return returnValue;

    case GLUT_WINDOW_BUFFER_SIZE:
      returnValue = 1 ;                                      /* ????? */
      return returnValue;
    case GLUT_WINDOW_STENCIL_SIZE:
      returnValue = 0 ;                                      /* ????? */
      return returnValue;

    case GLUT_WINDOW_X:
    case GLUT_WINDOW_Y:
    case GLUT_WINDOW_WIDTH:
    case GLUT_WINDOW_HEIGHT:
    {
        /*
         *  There is considerable confusion about the "right thing to
         *  do" concerning window  size and position.  GLUT itself is
         *  not consistent between Windows and UNIX/X11; since
         *  platform independence is a virtue for "freeglut", we
         *  decided to break with GLUT's behaviour.
         *
         *  Under UNIX/X11, it is apparently not possible to get the
         *  window border sizes in order to subtract them off the
         *  window's initial position until some time after the window
         *  has been created.  Therefore we decided on the following
         *  behaviour, both under Windows and under UNIX/X11:
         *  - When you create a window with position (x,y) and size
         *    (w,h), the upper left hand corner of the outside of the
         *    window is at (x,y) and the size of the drawable area  is
         *    (w,h).
         *  - When you query the size and position of the window--as
         *    is happening here for Windows--"freeglut" will return
         *    the size of the drawable area--the (w,h) that you
         *    specified when you created the window--and the coordinates
         *    of the upper left hand corner of the drawable
         *    area--which is NOT the (x,y) you specified.
         */

        RECT winRect;

        freeglut_return_val_if_fail( fgStructure.CurrentWindow != NULL, 0 );

        /*
         * We need to call GetWindowRect() first...
         *  (this returns the pixel coordinates of the outside of the window)
         */
        GetWindowRect( fgStructure.CurrentWindow->Window.Handle, &winRect );

        /* ...then we've got to correct the results we've just received... */

#if !defined(_WIN32_WCE)
        if ( ( fgStructure.GameModeWindow != fgStructure.CurrentWindow ) && ( fgStructure.CurrentWindow->Parent == NULL ) &&
             ( ! fgStructure.CurrentWindow->IsMenu ) )
        {
          winRect.left   += GetSystemMetrics( SM_CXSIZEFRAME );
          winRect.right  -= GetSystemMetrics( SM_CXSIZEFRAME );
          winRect.top    += GetSystemMetrics( SM_CYSIZEFRAME ) + GetSystemMetrics( SM_CYCAPTION );
          winRect.bottom -= GetSystemMetrics( SM_CYSIZEFRAME );
        }
#endif /* !defined(_WIN32_WCE) */

        switch( eWhat )
        {
        case GLUT_WINDOW_X:      return winRect.left                ;
        case GLUT_WINDOW_Y:      return winRect.top                 ;
        case GLUT_WINDOW_WIDTH:  return winRect.right - winRect.left;
        case GLUT_WINDOW_HEIGHT: return winRect.bottom - winRect.top;
        }
    }
    break;

    case GLUT_WINDOW_BORDER_WIDTH :
#if defined(_WIN32_WCE)
        return 0;
#else
        return GetSystemMetrics( SM_CXSIZEFRAME );
#endif /* !defined(_WIN32_WCE) */

    case GLUT_WINDOW_HEADER_HEIGHT :
#if defined(_WIN32_WCE)
        return 0;
#else
        return GetSystemMetrics( SM_CYCAPTION );
#endif /* defined(_WIN32_WCE) */

    case GLUT_DISPLAY_MODE_POSSIBLE:
#if defined(_WIN32_WCE)
        return 0;
#else
        return fgSetupPixelFormat( fgStructure.CurrentWindow, GL_TRUE,
                                    PFD_MAIN_PLANE );
#endif /* defined(_WIN32_WCE) */


    case GLUT_WINDOW_FORMAT_ID:
#if !defined(_WIN32_WCE)
        if( fgStructure.CurrentWindow != NULL )
            return GetPixelFormat( fgStructure.CurrentWindow->Window.Device );
#endif /* defined(_WIN32_WCE) */
        return 0;

#endif

    /* The window structure queries */
    case GLUT_WINDOW_PARENT:
        if( fgStructure.CurrentWindow         == NULL ) return 0;
        if( fgStructure.CurrentWindow->Parent == NULL ) return 0;
        return fgStructure.CurrentWindow->Parent->ID;

    case GLUT_WINDOW_NUM_CHILDREN:
        if( fgStructure.CurrentWindow == NULL )
            return 0;
        return fgListLength( &fgStructure.CurrentWindow->Children );

    case GLUT_WINDOW_CURSOR:
        if( fgStructure.CurrentWindow == NULL )
            return 0;
        return fgStructure.CurrentWindow->State.Cursor;

    case GLUT_MENU_NUM_ITEMS:
        if( fgStructure.CurrentMenu == NULL )
            return 0;
        return fgListLength( &fgStructure.CurrentMenu->Entries );

    case GLUT_ACTION_ON_WINDOW_CLOSE:
        return fgState.ActionOnWindowClose;

    case GLUT_VERSION :
        return VERSION_MAJOR * 10000 + VERSION_MINOR * 100 + VERSION_PATCH;

    case GLUT_RENDERING_CONTEXT:
        return fgState.UseCurrentContext ? GLUT_USE_CURRENT_CONTEXT
                                         : GLUT_CREATE_NEW_CONTEXT;

    case GLUT_DIRECT_RENDERING:
        return fgState.DirectContext;

    case GLUT_FULL_SCREEN:
        return fghCheckFullScreen();

    case GLUT_AUX:
      return fgState.AuxiliaryBufferNumber;

    case GLUT_MULTISAMPLE:
      return fgState.SampleNumber;

    default:
        fgWarning( "glutGet(): missing enum handle %d", eWhat );
        break;
    }
    return -1;
}

/*
 * Returns various device information.
 */
int FGAPIENTRY glutDeviceGet( GLenum eWhat )
{
    FREEGLUT_EXIT_IF_NOT_INITIALISED ( "glutDeviceGet" );

    /* XXX WARNING: we are mostly lying in this function. */
    switch( eWhat )
    {
    case GLUT_HAS_KEYBOARD:
        /*
         * Win32 is assumed a keyboard, and this cannot be queried,
         * except for WindowsCE.
         *
         * X11 has a core keyboard by definition, although it can
         * be present as a virtual/dummy keyboard. For now, there
         * is no reliable way to tell if a real keyboard is present.
         */
#if defined(_WIN32_CE)
        return ( GetKeyboardStatus() & KBDI_KEYBOARD_PRESENT ) ? 1 : 0;
#   if FREEGLUT_LIB_PRAGMAS
#       pragma comment (lib,"Kbdui.lib")
#   endif

#else
        return 1;
#endif

#if TARGET_HOST_POSIX_X11

    /* X11 has a mouse by definition */
    case GLUT_HAS_MOUSE:
        return 1 ;

    case GLUT_NUM_MOUSE_BUTTONS:
        /* We should be able to pass NULL when the last argument is zero,
         * but at least one X server has a bug where this causes a segfault.
         *
         * In XFree86/Xorg servers, a mouse wheel is seen as two buttons
         * rather than an Axis; "freeglut_main.c" expects this when
         * checking for a wheel event.
         */
        {
            unsigned char map;
            int nbuttons = XGetPointerMapping(fgDisplay.Display, &map,0);
            return nbuttons;
        }

#elif TARGET_HOST_MS_WINDOWS

    case GLUT_HAS_MOUSE:
        /*
         * MS Windows can be booted without a mouse.
         */
        return GetSystemMetrics( SM_MOUSEPRESENT );

    case GLUT_NUM_MOUSE_BUTTONS:
#  if defined(_WIN32_WCE)
        return 1;
#  else
        return GetSystemMetrics( SM_CMOUSEBUTTONS );
#  endif
#endif

    case GLUT_HAS_JOYSTICK:
        return fgJoystickDetect ();

    case GLUT_OWNS_JOYSTICK:
        return fgState.JoysticksInitialised;

    case GLUT_JOYSTICK_POLL_RATE:
        return fgStructure.CurrentWindow ? fgStructure.CurrentWindow->State.JoystickPollRate : 0;

    /* XXX The following two are only for Joystick 0 but this is an improvement */
    case GLUT_JOYSTICK_BUTTONS:
        return glutJoystickGetNumButtons ( 0 );

    case GLUT_JOYSTICK_AXES:
        return glutJoystickGetNumAxes ( 0 );

    case GLUT_HAS_DIAL_AND_BUTTON_BOX:
        return fgInputDeviceDetect ();

    case GLUT_NUM_DIALS:
        if ( fgState.InputDevsInitialised ) return 8;
        return 0;
 
    case GLUT_NUM_BUTTON_BOX_BUTTONS:
        return 0;

    case GLUT_HAS_SPACEBALL:
        return fgHasSpaceball();

    case GLUT_HAS_TABLET:
        return 0;

    case GLUT_NUM_SPACEBALL_BUTTONS:
        return fgSpaceballNumButtons();

    case GLUT_NUM_TABLET_BUTTONS:
        return 0;

    case GLUT_DEVICE_IGNORE_KEY_REPEAT:
        return fgStructure.CurrentWindow ? fgStructure.CurrentWindow->State.IgnoreKeyRepeat : 0;

    case GLUT_DEVICE_KEY_REPEAT:
        return fgState.KeyRepeat;

    default:
        fgWarning( "glutDeviceGet(): missing enum handle %d", eWhat );
        break;
    }

    /* And now -- the failure. */
    return -1;
}

/*
 * This should return the current state of ALT, SHIFT and CTRL keys.
 */
int FGAPIENTRY glutGetModifiers( void )
{
    FREEGLUT_EXIT_IF_NOT_INITIALISED ( "glutGetModifiers" );
    if( fgState.Modifiers == INVALID_MODIFIERS )
    {
        fgWarning( "glutGetModifiers() called outside an input callback" );
        return 0;
    }

    return fgState.Modifiers;
}

/*
 * Return the state of the GLUT API overlay subsystem. A misery ;-)
 */
int FGAPIENTRY glutLayerGet( GLenum eWhat )
{
    FREEGLUT_EXIT_IF_NOT_INITIALISED ( "glutLayerGet" );

    /*
     * This is easy as layers are not implemented ;-)
     *
     * XXX Can we merge the UNIX/X11 and WIN32 sections?  Or
     * XXX is overlay support planned?
     */
    switch( eWhat )
    {

#if TARGET_HOST_POSIX_X11

    case GLUT_OVERLAY_POSSIBLE:
        return 0;

    case GLUT_LAYER_IN_USE:
        return GLUT_NORMAL;

    case GLUT_HAS_OVERLAY:
        return 0;

    case GLUT_TRANSPARENT_INDEX:
        /*
         * Return just anything, which is always defined as zero
         *
         * XXX HUH?
         */
        return 0;

    case GLUT_NORMAL_DAMAGED:
        /* XXX Actually I do not know. Maybe. */
        return 0;

    case GLUT_OVERLAY_DAMAGED:
        return -1;

#elif TARGET_HOST_MS_WINDOWS

    case GLUT_OVERLAY_POSSIBLE:
/*      return fgSetupPixelFormat( fgStructure.CurrentWindow, GL_TRUE,
                                   PFD_OVERLAY_PLANE ); */
      return 0 ;

    case GLUT_LAYER_IN_USE:
        return GLUT_NORMAL;

    case GLUT_HAS_OVERLAY:
        return 0;

    case GLUT_TRANSPARENT_INDEX:
        /*
         * Return just anything, which is always defined as zero
         *
         * XXX HUH?
         */
        return 0;

    case GLUT_NORMAL_DAMAGED:
        /* XXX Actually I do not know. Maybe. */
        return 0;

    case GLUT_OVERLAY_DAMAGED:
        return -1;
#endif

    default:
        fgWarning( "glutLayerGet(): missing enum handle %d", eWhat );
        break;
    }

    /* And fail. That's good. Programs do love failing. */
    return -1;
}

int * FGAPIENTRY glutGetModeValues(GLenum eWhat, int * size)
{
  int * array;

#if TARGET_HOST_POSIX_X11
  int attributes[9];
  GLXFBConfig * fbconfigArray;  /*  Array of FBConfigs  */
  int fbconfigArraySize;        /*  Number of FBConfigs in the array  */
  int attribute_name = 0;
#endif

  FREEGLUT_EXIT_IF_NOT_INITIALISED("glutGetModeValues");

  array = NULL;
  *size = 0;

  switch (eWhat)
    {
#if TARGET_HOST_POSIX_X11
    case GLUT_AUX:
    case GLUT_MULTISAMPLE:

      attributes[0] = GLX_BUFFER_SIZE;
      attributes[1] = GLX_DONT_CARE;

      switch (eWhat)
        {
        case GLUT_AUX:
          /*
            FBConfigs are now sorted by increasing number of auxiliary
            buffers.  We want at least one buffer.
          */
          attributes[2] = GLX_AUX_BUFFERS;
          attributes[3] = 1;
          attributes[4] = None;

          attribute_name = GLX_AUX_BUFFERS;

          break;


        case GLUT_MULTISAMPLE:
          attributes[2] = GLX_AUX_BUFFERS;
          attributes[3] = GLX_DONT_CARE;
          attributes[4] = GLX_SAMPLE_BUFFERS;
          attributes[5] = 1;
          /*
            FBConfigs are now sorted by increasing number of samples per
            pixel.  We want at least one sample.
          */
          attributes[6] = GLX_SAMPLES;
          attributes[7] = 1;
          attributes[8] = None;

          attribute_name = GLX_SAMPLES;

          break;
        }

      fbconfigArray = glXChooseFBConfig(fgDisplay.Display,
                                        fgDisplay.Screen,
                                        attributes,
                                        &fbconfigArraySize);

      if (fbconfigArray != NULL)
        {
          int * temp_array;
          int result;   /*  Returned by glXGetFBConfigAttrib. Not checked.  */
          int previous_value;
          int i;

          temp_array = malloc(sizeof(int) * fbconfigArraySize);
          previous_value = 0;

          for (i = 0; i < fbconfigArraySize; i++)
            {
              int value;

              result = glXGetFBConfigAttrib(fgDisplay.Display,
                                            fbconfigArray[i],
                                            attribute_name,
                                            &value);
              if (value > previous_value)
                {
                  temp_array[*size] = value;
                  previous_value = value;
                  (*size)++;
                }
            }

          array = malloc(sizeof(int) * (*size));
          for (i = 0; i < *size; i++)
            {
              array[i] = temp_array[i];
            }

          free(temp_array);
          XFree(fbconfigArray);
        }

      break;
#endif      

    default:
      break;
    }

  return array;
}

/*** END OF FILE ***/
