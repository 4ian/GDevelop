/*
 * freeglut_window.c
 *
 * Window management methods.
 *
 * Copyright (c) 1999-2000 Pawel W. Olszta. All Rights Reserved.
 * Written by Pawel W. Olszta, <olszta@sourceforge.net>
 * Creation date: Fri Dec 3 1999
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

#define FREEGLUT_BUILDING_LIB
#include <GL/freeglut.h>
#include "freeglut_internal.h"

#if TARGET_HOST_POSIX_X11
#include <limits.h>  /* LONG_MAX */
#endif

#if defined(_WIN32_WCE)
#   include <Aygshell.h>
#   ifdef FREEGLUT_LIB_PRAGMAS
#       pragma comment( lib, "Aygshell.lib" )
#   endif

static wchar_t* fghWstrFromStr(const char* str)
{
    int i,len=strlen(str);
    wchar_t* wstr = (wchar_t*)malloc(2*len+2);
    for(i=0; i<len; i++)
        wstr[i] = str[i];
    wstr[len] = 0;
    return wstr;
}

#endif /* defined(_WIN32_WCE) */

/* pushing attribute/value pairs into an array */
#define ATTRIB(a) attributes[where++]=(a)
#define ATTRIB_VAL(a,v) {ATTRIB(a); ATTRIB(v);}

/*
 * TODO BEFORE THE STABLE RELEASE:
 *
 *  fgChooseFBConfig()      -- OK, but what about glutInitDisplayString()?
 *  fgSetupPixelFormat      -- ignores the display mode settings
 *  fgOpenWindow()          -- check the Win32 version, -iconic handling!
 *  fgCloseWindow()         -- check the Win32 version
 *  glutCreateWindow()      -- Check when default position and size is {-1,-1}
 *  glutCreateSubWindow()   -- Check when default position and size is {-1,-1}
 *  glutDestroyWindow()     -- check the Win32 version
 *  glutSetWindow()         -- check the Win32 version
 *  glutGetWindow()         -- OK
 *  glutSetWindowTitle()    -- check the Win32 version
 *  glutSetIconTitle()      -- check the Win32 version
 *  glutShowWindow()        -- check the Win32 version
 *  glutHideWindow()        -- check the Win32 version
 *  glutIconifyWindow()     -- check the Win32 version
 *  glutReshapeWindow()     -- check the Win32 version
 *  glutPositionWindow()    -- check the Win32 version
 *  glutPushWindow()        -- check the Win32 version
 *  glutPopWindow()         -- check the Win32 version
 */

/* -- PRIVATE FUNCTIONS ---------------------------------------------------- */

static int fghIsLegacyContextVersionRequested( void )
{
  return fgState.MajorVersion == 1 && fgState.MinorVersion == 0;
}

static int fghIsLegacyContextRequested( void )
{
  return fghIsLegacyContextVersionRequested() &&
         fgState.ContextFlags == 0 &&
         fgState.ContextProfile == 0;
}

static int fghNumberOfAuxBuffersRequested( void )
{
  if ( fgState.DisplayMode & GLUT_AUX4 ) {
    return 4;
  }
  if ( fgState.DisplayMode & GLUT_AUX3 ) {
    return 3;
  }
  if ( fgState.DisplayMode & GLUT_AUX2 ) {
    return 2;
  }
  if ( fgState.DisplayMode & GLUT_AUX1 ) { /* NOTE: Same as GLUT_AUX! */
    return fgState.AuxiliaryBufferNumber;
  }
  return 0;
}

static int fghMapBit( int mask, int from, int to )
{
  return ( mask & from ) ? to : 0;

}

static void fghContextCreationError( void )
{
    fgError( "Unable to create OpenGL %d.%d context (flags %x, profile %x)",
             fgState.MajorVersion, fgState.MinorVersion, fgState.ContextFlags,
             fgState.ContextProfile );
}

/*
 * Chooses a visual basing on the current display mode settings
 */
#if TARGET_HOST_POSIX_X11

#ifndef GLX_FRAMEBUFFER_SRGB_CAPABLE_ARB
#define GLX_FRAMEBUFFER_SRGB_CAPABLE_ARB 0x20B2
#endif

GLXFBConfig* fgChooseFBConfig( void )
{
  GLboolean wantIndexedMode = GL_FALSE;
  int attributes[ 100 ];
  int where = 0, numAuxBuffers;

  /* First we have to process the display mode settings... */
  if( fgState.DisplayMode & GLUT_INDEX ) {
    ATTRIB_VAL( GLX_BUFFER_SIZE, 8 );
    /*  Buffer size is selected later.  */

    ATTRIB_VAL( GLX_RENDER_TYPE, GLX_COLOR_INDEX_BIT );
    wantIndexedMode = GL_TRUE;
  } else {
    ATTRIB_VAL( GLX_RED_SIZE,   1 );
    ATTRIB_VAL( GLX_GREEN_SIZE, 1 );
    ATTRIB_VAL( GLX_BLUE_SIZE,  1 );
    if( fgState.DisplayMode & GLUT_ALPHA ) {
      ATTRIB_VAL( GLX_ALPHA_SIZE, 1 );
    }
  }

  if( fgState.DisplayMode & GLUT_DOUBLE ) {
    ATTRIB_VAL( GLX_DOUBLEBUFFER, True );
  }

  if( fgState.DisplayMode & GLUT_STEREO ) {
    ATTRIB_VAL( GLX_STEREO, True );
  }

  if( fgState.DisplayMode & GLUT_DEPTH ) {
    ATTRIB_VAL( GLX_DEPTH_SIZE, 1 );
  }

  if( fgState.DisplayMode & GLUT_STENCIL ) {
    ATTRIB_VAL( GLX_STENCIL_SIZE, 1 );
  }

  if( fgState.DisplayMode & GLUT_ACCUM ) {
    ATTRIB_VAL( GLX_ACCUM_RED_SIZE, 1 );
    ATTRIB_VAL( GLX_ACCUM_GREEN_SIZE, 1 );
    ATTRIB_VAL( GLX_ACCUM_BLUE_SIZE, 1 );
    if( fgState.DisplayMode & GLUT_ALPHA ) {
      ATTRIB_VAL( GLX_ACCUM_ALPHA_SIZE, 1 );
    }
  }

  numAuxBuffers = fghNumberOfAuxBuffersRequested();
  if ( numAuxBuffers > 0 ) {
    ATTRIB_VAL( GLX_AUX_BUFFERS, numAuxBuffers );
  }

  if( fgState.DisplayMode & GLUT_SRGB ) {
    ATTRIB_VAL( GLX_FRAMEBUFFER_SRGB_CAPABLE_ARB, True );
  }

  if (fgState.DisplayMode & GLUT_MULTISAMPLE) {
    ATTRIB_VAL(GLX_SAMPLE_BUFFERS, 1);
    ATTRIB_VAL(GLX_SAMPLES, fgState.SampleNumber);
  }

  /* Push a terminator at the end of the list */
  ATTRIB( None );

    {
        GLXFBConfig * fbconfigArray;  /*  Array of FBConfigs  */
        GLXFBConfig * fbconfig;       /*  The FBConfig we want  */
        int fbconfigArraySize;        /*  Number of FBConfigs in the array  */


        /*  Get all FBConfigs that match "attributes".  */
        fbconfigArray = glXChooseFBConfig( fgDisplay.Display,
                                           fgDisplay.Screen,
                                           attributes,
                                           &fbconfigArraySize );

        if (fbconfigArray != NULL)
        {
            int result;  /* Returned by glXGetFBConfigAttrib, not checked. */


            if( wantIndexedMode )
            {
                /*
                 * In index mode, we want the largest buffer size, i.e. visual
                 * depth.  Here, FBConfigs are sorted by increasing buffer size
                 * first, so FBConfigs with the largest size come last.
                 */

                int bufferSizeMin, bufferSizeMax;

                /*  Get bufferSizeMin.  */
                result =
                  glXGetFBConfigAttrib( fgDisplay.Display,
                                        fbconfigArray[0],
                                        GLX_BUFFER_SIZE,
                                        &bufferSizeMin );
                /*  Get bufferSizeMax.  */
                result =
                  glXGetFBConfigAttrib( fgDisplay.Display,
                                        fbconfigArray[fbconfigArraySize - 1],
                                        GLX_BUFFER_SIZE,
                                        &bufferSizeMax );

                if (bufferSizeMax > bufferSizeMin)
                {
                    /* 
                     * Free and reallocate fbconfigArray, keeping only FBConfigs
                     * with the largest buffer size.
                     */
                    XFree(fbconfigArray);

                    /*  Add buffer size token at the end of the list.  */
                    where--;
                    ATTRIB_VAL( GLX_BUFFER_SIZE, bufferSizeMax );
                    ATTRIB( None );

                    fbconfigArray = glXChooseFBConfig( fgDisplay.Display,
                                                       fgDisplay.Screen,
                                                       attributes,
                                                       &fbconfigArraySize );
                }
            }

            /*
             * We now have an array of FBConfigs, the first one being the "best"
             * one.  So we should return only this FBConfig:
             *
             * int fbconfigXID;
             *
             *  - pick the XID of the FBConfig we want
             * result = glXGetFBConfigAttrib( fgDisplay.Display,
             *                                fbconfigArray[0],
             *                                GLX_FBCONFIG_ID,
             *                                &fbconfigXID );
             *
             * - free the array
             * XFree(fbconfigArray);
             *
             * - reset "attributes" with the XID
             * where = 0;
             * ATTRIB_VAL( GLX_FBCONFIG_ID, fbconfigXID );
             * ATTRIB( None );
             *
             * - get our FBConfig only
             * fbconfig = glXChooseFBConfig( fgDisplay.Display,
             *                               fgDisplay.Screen,
             *                               attributes,
             *                               &fbconfigArraySize );
             *
             * However, for some configurations (for instance multisampling with
             * Mesa 6.5.2 and ATI drivers), this does not work:
             * glXChooseFBConfig returns NULL, whereas fbconfigXID is a valid
             * XID.  Further investigation is needed.
             *
             * So, for now, we return the whole array of FBConfigs.  This should
             * not produce any side effects elsewhere.
             */
            fbconfig = fbconfigArray;
        }
        else
        {
           fbconfig = NULL;
        }

        return fbconfig;
    }
}
#endif /* TARGET_HOST_POSIX_X11 */

/*
 * Setup the pixel format for a Win32 window
 */
#if TARGET_HOST_MS_WINDOWS
/* The following include file is available from SGI but is not standard:
 *   #include <GL/wglext.h>
 * So we copy the necessary parts out of it.
 * XXX: should local definitions for extensions be put in a separate include file?
 */
typedef const char * (WINAPI * PFNWGLGETEXTENSIONSSTRINGARBPROC) (HDC hdc);

typedef BOOL (WINAPI * PFNWGLCHOOSEPIXELFORMATARBPROC) (HDC hdc, const int *piAttribIList, const FLOAT *pfAttribFList, UINT nMaxFormats, int *piFormats, UINT *nNumFormats);

#define WGL_DRAW_TO_WINDOW_ARB         0x2001
#define WGL_ACCELERATION_ARB           0x2003
#define WGL_SUPPORT_OPENGL_ARB         0x2010
#define WGL_DOUBLE_BUFFER_ARB          0x2011
#define WGL_COLOR_BITS_ARB             0x2014
#define WGL_ALPHA_BITS_ARB             0x201B
#define WGL_DEPTH_BITS_ARB             0x2022
#define WGL_STENCIL_BITS_ARB           0x2023
#define WGL_FULL_ACCELERATION_ARB      0x2027

#define WGL_SAMPLE_BUFFERS_ARB         0x2041
#define WGL_SAMPLES_ARB                0x2042

#define WGL_TYPE_RGBA_FLOAT_ARB        0x21A0

#define WGL_FRAMEBUFFER_SRGB_CAPABLE_ARB 0x20A9

#ifndef WGL_ARB_create_context
#define WGL_ARB_create_context 1
#ifdef WGL_WGLEXT_PROTOTYPES
extern HGLRC WINAPI wglCreateContextAttribsARB (HDC, HGLRC, const int *);
#endif /* WGL_WGLEXT_PROTOTYPES */
typedef HGLRC (WINAPI * PFNWGLCREATECONTEXTATTRIBSARBPROC) (HDC hDC, HGLRC hShareContext, const int *attribList);

#define WGL_CONTEXT_MAJOR_VERSION_ARB  0x2091
#define WGL_CONTEXT_MINOR_VERSION_ARB  0x2092
#define WGL_CONTEXT_LAYER_PLANE_ARB    0x2093
#define WGL_CONTEXT_FLAGS_ARB          0x2094
#define WGL_CONTEXT_PROFILE_MASK_ARB   0x9126

#define WGL_CONTEXT_DEBUG_BIT_ARB      0x0001
#define WGL_CONTEXT_FORWARD_COMPATIBLE_BIT_ARB 0x0002

#define WGL_CONTEXT_CORE_PROFILE_BIT_ARB 0x00000001
#define WGL_CONTEXT_COMPATIBILITY_PROFILE_BIT_ARB 0x00000002

#define ERROR_INVALID_VERSION_ARB      0x2095
#define ERROR_INVALID_PROFILE_ARB      0x2096
#endif

static void fghFillContextAttributes( int *attributes ) {
  int where = 0, contextFlags, contextProfile;

  if ( !fghIsLegacyContextVersionRequested() ) {
    ATTRIB_VAL( WGL_CONTEXT_MAJOR_VERSION_ARB, fgState.MajorVersion );
    ATTRIB_VAL( WGL_CONTEXT_MINOR_VERSION_ARB, fgState.MinorVersion );
  }

  contextFlags =
    fghMapBit( fgState.ContextFlags, GLUT_DEBUG, WGL_CONTEXT_DEBUG_BIT_ARB ) |
    fghMapBit( fgState.ContextFlags, GLUT_FORWARD_COMPATIBLE, WGL_CONTEXT_FORWARD_COMPATIBLE_BIT_ARB );
  if ( contextFlags != 0 ) {
    ATTRIB_VAL( WGL_CONTEXT_FLAGS_ARB, contextFlags );
  }

  contextProfile =
    fghMapBit( fgState.ContextProfile, GLUT_CORE_PROFILE, WGL_CONTEXT_CORE_PROFILE_BIT_ARB ) |
    fghMapBit( fgState.ContextProfile, GLUT_COMPATIBILITY_PROFILE, WGL_CONTEXT_COMPATIBILITY_PROFILE_BIT_ARB );
  if ( contextProfile != 0 ) {
    ATTRIB_VAL( WGL_CONTEXT_PROFILE_MASK_ARB, contextProfile );
  }

  ATTRIB( 0 );
}

static int fghIsExtensionSupported( HDC hdc, const char *extension ) {
    const char *pWglExtString;
    PFNWGLGETEXTENSIONSSTRINGARBPROC wglGetEntensionsStringARB =
      (PFNWGLGETEXTENSIONSSTRINGARBPROC) wglGetProcAddress("wglGetExtensionsStringARB");
    if ( wglGetEntensionsStringARB == NULL )
    {
      return FALSE;
    }
    pWglExtString = wglGetEntensionsStringARB( hdc );
    return ( pWglExtString != NULL ) && ( strstr(pWglExtString, extension) != NULL );
}

void fgNewWGLCreateContext( SFG_Window* window )
{
    HGLRC context;
    int attributes[9];
    PFNWGLCREATECONTEXTATTRIBSARBPROC wglCreateContextAttribsARB;

    /* If nothing fancy has been required, leave the context as it is */
    if ( fghIsLegacyContextRequested() )
    {
        return;
    }

    wglMakeCurrent( window->Window.Device, window->Window.Context );

    if ( !fghIsExtensionSupported( window->Window.Device, "WGL_ARB_create_context" ) )
    {
        return;
    }

    /* new context creation */
    fghFillContextAttributes( attributes );

    wglCreateContextAttribsARB = (PFNWGLCREATECONTEXTATTRIBSARBPROC) wglGetProcAddress( "wglCreateContextAttribsARB" );
    if ( wglCreateContextAttribsARB == NULL )
    {
        fgError( "wglCreateContextAttribsARB not found" );
    }

    context = wglCreateContextAttribsARB( window->Window.Device, 0, attributes );
    if ( context == NULL )
    {
        fghContextCreationError();
    }

    wglMakeCurrent( NULL, NULL );
    wglDeleteContext( window->Window.Context );
    window->Window.Context = context;
}

#if !defined(_WIN32_WCE)

static void fghFillPFD( PIXELFORMATDESCRIPTOR *ppfd, HDC hdc, unsigned char layer_type )
{
  int flags = PFD_DRAW_TO_WINDOW | PFD_SUPPORT_OPENGL;
  if ( fgState.DisplayMode & GLUT_DOUBLE ) {
        flags |= PFD_DOUBLEBUFFER;
  }
  if ( fgState.DisplayMode & GLUT_STEREO ) {
    flags |= PFD_STEREO;
  }

#if defined(_MSC_VER)
#pragma message( "fgSetupPixelFormat(): there is still some work to do here!" )
#endif

  /* Specify which pixel format do we opt for... */
  ppfd->nSize = sizeof(PIXELFORMATDESCRIPTOR);
  ppfd->nVersion = 1;
  ppfd->dwFlags = flags;

  if( fgState.DisplayMode & GLUT_INDEX ) {
    ppfd->iPixelType = PFD_TYPE_COLORINDEX;
    ppfd->cRedBits = 0;
    ppfd->cGreenBits = 0;
    ppfd->cBlueBits = 0;
    ppfd->cAlphaBits = 0;
  } else {
    ppfd->iPixelType = PFD_TYPE_RGBA;
    ppfd->cRedBits = 8;
    ppfd->cGreenBits = 8;
    ppfd->cBlueBits = 8;
    ppfd->cAlphaBits = ( fgState.DisplayMode & GLUT_ALPHA ) ? 8 : 0;
  }

  ppfd->cColorBits = 24;
  ppfd->cRedShift = 0;
  ppfd->cGreenShift = 0;
  ppfd->cBlueShift = 0;
  ppfd->cAlphaShift = 0;
  ppfd->cAccumBits = 0;
  ppfd->cAccumRedBits = 0;
  ppfd->cAccumGreenBits = 0;
  ppfd->cAccumBlueBits = 0;
  ppfd->cAccumAlphaBits = 0;

  /* Hmmm, or 32/0 instead of 24/8? */
  ppfd->cDepthBits = 24;
  ppfd->cStencilBits = 8;

  ppfd->cAuxBuffers = fghNumberOfAuxBuffersRequested();
  ppfd->iLayerType = layer_type;
  ppfd->bReserved = 0;
  ppfd->dwLayerMask = 0;
  ppfd->dwVisibleMask = 0;
  ppfd->dwDamageMask = 0;
  
  ppfd->cColorBits = (BYTE) GetDeviceCaps( hdc, BITSPIXEL );
}

static void fghFillPixelFormatAttributes( int *attributes, const PIXELFORMATDESCRIPTOR *ppfd )
{
  int where = 0;

  ATTRIB_VAL( WGL_DRAW_TO_WINDOW_ARB, GL_TRUE );
  ATTRIB_VAL( WGL_SUPPORT_OPENGL_ARB, GL_TRUE );
  ATTRIB_VAL( WGL_ACCELERATION_ARB, WGL_FULL_ACCELERATION_ARB );

  ATTRIB_VAL( WGL_COLOR_BITS_ARB, ppfd->cColorBits );
  ATTRIB_VAL( WGL_ALPHA_BITS_ARB, ppfd->cAlphaBits );
  ATTRIB_VAL( WGL_DEPTH_BITS_ARB, ppfd->cDepthBits );
  ATTRIB_VAL( WGL_STENCIL_BITS_ARB, ppfd->cStencilBits );

  ATTRIB_VAL( WGL_DOUBLE_BUFFER_ARB, ( fgState.DisplayMode & GLUT_DOUBLE ) != 0 );

  if ( fgState.DisplayMode & GLUT_SRGB ) {
    ATTRIB_VAL( WGL_FRAMEBUFFER_SRGB_CAPABLE_ARB, TRUE );
  }

  ATTRIB_VAL( WGL_SAMPLE_BUFFERS_ARB, GL_TRUE );
  ATTRIB_VAL( WGL_SAMPLES_ARB, fgState.SampleNumber );
  ATTRIB( 0 );
}
#endif

GLboolean fgSetupPixelFormat( SFG_Window* window, GLboolean checkOnly,
                              unsigned char layer_type )
{
#if defined(_WIN32_WCE)
    return GL_TRUE;
#else
    PIXELFORMATDESCRIPTOR pfd;
    PIXELFORMATDESCRIPTOR* ppfd = &pfd;
    int pixelformat;

    fghFillPFD( ppfd, window->Window.Device, layer_type );
    pixelformat = ChoosePixelFormat( window->Window.Device, ppfd );

    /* windows hack for multismapling/sRGB */
    if ( ( fgState.DisplayMode & GLUT_MULTISAMPLE ) ||
         ( fgState.DisplayMode & GLUT_SRGB ) )
    {        
        HGLRC rc, rc_before=wglGetCurrentContext();
        HWND hWnd;
        HDC hDC, hDC_before=wglGetCurrentDC();
        WNDCLASS wndCls;

        /* create a dummy window */
        ZeroMemory(&wndCls, sizeof(wndCls));
        wndCls.lpfnWndProc = DefWindowProc;
        wndCls.hInstance = fgDisplay.Instance;
        wndCls.style = CS_OWNDC | CS_HREDRAW | CS_VREDRAW;
        wndCls.lpszClassName = _T("FREEGLUT_dummy");
        RegisterClass( &wndCls );

        hWnd=CreateWindow(_T("FREEGLUT_dummy"), _T(""), WS_CLIPSIBLINGS | WS_CLIPCHILDREN | WS_OVERLAPPEDWINDOW , 0,0,0,0, 0, 0, fgDisplay.Instance, 0 );
        hDC=GetDC(hWnd);
        SetPixelFormat( hDC, pixelformat, ppfd );
        
        rc = wglCreateContext( hDC );
        wglMakeCurrent(hDC, rc);
        
        if ( fghIsExtensionSupported( hDC, "WGL_ARB_multisample" ) )
        {
            PFNWGLCHOOSEPIXELFORMATARBPROC wglChoosePixelFormatARBProc =
              (PFNWGLCHOOSEPIXELFORMATARBPROC) wglGetProcAddress("wglChoosePixelFormatARB");
            if ( wglChoosePixelFormatARBProc )
            {
                int attributes[100];
                int iPixelFormat;
                BOOL bValid;
                float fAttributes[] = { 0, 0 };
                UINT numFormats;
                fghFillPixelFormatAttributes( attributes, ppfd );
                bValid = wglChoosePixelFormatARBProc(window->Window.Device, attributes, fAttributes, 1, &iPixelFormat, &numFormats);

                if ( bValid && numFormats > 0 )
                {
                    pixelformat = iPixelFormat;
                }
            }
        }

        wglMakeCurrent( hDC_before, rc_before);
        wglDeleteContext(rc);
        ReleaseDC(hWnd, hDC);
        DestroyWindow(hWnd);
        UnregisterClass(_T("FREEGLUT_dummy"), fgDisplay.Instance);
    }

    return ( pixelformat != 0 ) && ( checkOnly || SetPixelFormat( window->Window.Device, pixelformat, ppfd ) );
#endif /* defined(_WIN32_WCE) */
}
#endif /* TARGET_HOST_MS_WINDOWS */

/*
 * Sets the OpenGL context and the fgStructure "Current Window" pointer to
 * the window structure passed in.
 */
void fgSetWindow ( SFG_Window *window )
{
#if TARGET_HOST_POSIX_X11
    if ( window )
    {
        glXMakeContextCurrent(
            fgDisplay.Display,
            window->Window.Handle,
            window->Window.Handle,
            window->Window.Context
        );

        /* also register this window to receive spaceball events */
        fgSpaceballSetWindow(window);
    }
#elif TARGET_HOST_MS_WINDOWS
    if( fgStructure.CurrentWindow )
        ReleaseDC( fgStructure.CurrentWindow->Window.Handle,
                   fgStructure.CurrentWindow->Window.Device );

    if ( window )
    {
        window->Window.Device = GetDC( window->Window.Handle );
        wglMakeCurrent(
            window->Window.Device,
            window->Window.Context
        );
    }
#endif
    fgStructure.CurrentWindow = window;
}



#if TARGET_HOST_POSIX_X11

#ifndef GLX_CONTEXT_MAJOR_VERSION_ARB
#define GLX_CONTEXT_MAJOR_VERSION_ARB 0x2091
#endif

#ifndef GLX_CONTEXT_MINOR_VERSION_ARB
#define GLX_CONTEXT_MINOR_VERSION_ARB 0x2092
#endif

#ifndef GLX_CONTEXT_FLAGS_ARB
#define GLX_CONTEXT_FLAGS_ARB 0x2094
#endif

#ifndef GLX_CONTEXT_PROFILE_MASK_ARB
#define GLX_CONTEXT_PROFILE_MASK_ARB 0x9126
#endif

#ifndef GLX_CONTEXT_DEBUG_BIT_ARB
#define GLX_CONTEXT_DEBUG_BIT_ARB 0x0001
#endif

#ifndef GLX_CONTEXT_FORWARD_COMPATIBLE_BIT_ARB
#define GLX_CONTEXT_FORWARD_COMPATIBLE_BIT_ARB 0x0002
#endif

#ifndef GLX_CONTEXT_CORE_PROFILE_BIT_ARB
#define GLX_CONTEXT_CORE_PROFILE_BIT_ARB 0x00000001
#endif

#ifndef GLX_CONTEXT_COMPATIBILITY_PROFILE_BIT_ARB
#define GLX_CONTEXT_COMPATIBILITY_PROFILE_BIT_ARB 0x00000002
#endif

#ifndef GLX_RGBA_FLOAT_TYPE
#define GLX_RGBA_FLOAT_TYPE 0x20B9
#endif

#ifndef GLX_RGBA_FLOAT_BIT
#define GLX_RGBA_FLOAT_BIT 0x00000004
#endif

static void fghFillContextAttributes( int *attributes ) {
  int where = 0, contextFlags, contextProfile;

  if ( !fghIsLegacyContextVersionRequested() ) {
    ATTRIB_VAL( GLX_CONTEXT_MAJOR_VERSION_ARB, fgState.MajorVersion );
    ATTRIB_VAL( GLX_CONTEXT_MINOR_VERSION_ARB, fgState.MinorVersion );
  }

  contextFlags =
    fghMapBit( fgState.ContextFlags, GLUT_DEBUG, GLX_CONTEXT_DEBUG_BIT_ARB ) |
    fghMapBit( fgState.ContextFlags, GLUT_FORWARD_COMPATIBLE, GLX_CONTEXT_FORWARD_COMPATIBLE_BIT_ARB );
  if ( contextFlags != 0 ) {
    ATTRIB_VAL( GLX_CONTEXT_FLAGS_ARB, contextFlags );
  }

  contextProfile =
    fghMapBit( fgState.ContextProfile, GLUT_CORE_PROFILE, GLX_CONTEXT_CORE_PROFILE_BIT_ARB ) |
    fghMapBit( fgState.ContextProfile, GLUT_COMPATIBILITY_PROFILE, GLX_CONTEXT_COMPATIBILITY_PROFILE_BIT_ARB );
  if ( contextProfile != 0 ) {
    ATTRIB_VAL( GLX_CONTEXT_PROFILE_MASK_ARB, contextProfile );
  }

  ATTRIB( 0 );
}

typedef GLXContext (*CreateContextAttribsProc)(Display *dpy, GLXFBConfig config,
					       GLXContext share_list, Bool direct,
					       const int *attrib_list);

static GLXContext fghCreateNewContext( SFG_Window* window )
{
  /* for color model calculation */
  int menu = ( window->IsMenu && !fgStructure.MenuContext );
  int index_mode = ( fgState.DisplayMode & GLUT_INDEX );

  /* "classic" context creation */
  Display *dpy = fgDisplay.Display;
  GLXFBConfig config = *(window->Window.FBConfig);
  int render_type = ( !menu && index_mode ) ? GLX_COLOR_INDEX_TYPE : GLX_RGBA_TYPE;
  GLXContext share_list = NULL;
  Bool direct = ( fgState.DirectContext != GLUT_FORCE_INDIRECT_CONTEXT );
  GLXContext context;

  /* new context creation */
  int attributes[9];
  CreateContextAttribsProc createContextAttribs;

  /* If nothing fancy has been required, simply use the old context creation GLX API entry */
  if ( fghIsLegacyContextRequested() )
  {
    context = glXCreateNewContext( dpy, config, render_type, share_list, direct );
    if ( context == NULL ) {
      fghContextCreationError();
    }
    return context;
  }

  /* color index mode is not available anymore with OpenGL 3.0 */
  if ( render_type == GLX_COLOR_INDEX_TYPE ) {
    fgWarning( "color index mode is deprecated, using RGBA mode" );
  }

  fghFillContextAttributes( attributes );

  createContextAttribs = (CreateContextAttribsProc) fghGetProcAddress( "glXCreateContextAttribsARB" );
  if ( createContextAttribs == NULL ) {
    fgError( "glXCreateContextAttribsARB not found" );
  }

  context = createContextAttribs( dpy, config, share_list, direct, attributes );
  if ( context == NULL ) {
    fghContextCreationError();
  }
  return context;
}
#endif


/*
 * Opens a window. Requires a SFG_Window object created and attached
 * to the freeglut structure. OpenGL context is created here.
 */
void fgOpenWindow( SFG_Window* window, const char* title,
                   GLboolean positionUse, int x, int y,
                   GLboolean sizeUse, int w, int h,
                   GLboolean gameMode, GLboolean isSubWindow )
{
#if TARGET_HOST_POSIX_X11
    XVisualInfo * visualInfo;
    XSetWindowAttributes winAttr;
    XTextProperty textProperty;
    XSizeHints sizeHints;
    XWMHints wmHints;
    unsigned long mask;
    unsigned int current_DisplayMode = fgState.DisplayMode ;

    /* Save the display mode if we are creating a menu window */
    if( window->IsMenu && ( ! fgStructure.MenuContext ) )
        fgState.DisplayMode = GLUT_DOUBLE | GLUT_RGB ;

    window->Window.FBConfig = fgChooseFBConfig( );

    if( window->IsMenu && ( ! fgStructure.MenuContext ) )
        fgState.DisplayMode = current_DisplayMode ;

    if( ! window->Window.FBConfig )
    {
        /*
         * The "fgChooseFBConfig" returned a null meaning that the visual
         * context is not available.
         * Try a couple of variations to see if they will work.
         */
        if( !( fgState.DisplayMode & GLUT_DOUBLE ) )
        {
            fgState.DisplayMode |= GLUT_DOUBLE ;
            window->Window.FBConfig = fgChooseFBConfig( );
            fgState.DisplayMode &= ~GLUT_DOUBLE;
        }

        if( fgState.DisplayMode & GLUT_MULTISAMPLE )
        {
            fgState.DisplayMode &= ~GLUT_MULTISAMPLE ;
            window->Window.FBConfig = fgChooseFBConfig( );
            fgState.DisplayMode |= GLUT_MULTISAMPLE;
        }
    }

    FREEGLUT_INTERNAL_ERROR_EXIT( window->Window.FBConfig != NULL,
                                  "FBConfig with necessary capabilities not found", "fgOpenWindow" );

    /*  Get the X visual.  */
    visualInfo = glXGetVisualFromFBConfig( fgDisplay.Display,
                                           *(window->Window.FBConfig) );

    /*
     * XXX HINT: the masks should be updated when adding/removing callbacks.
     * XXX       This might speed up message processing. Is that true?
     * XXX
     * XXX A: Not appreciably, but it WILL make it easier to debug.
     * XXX    Try tracing old GLUT and try tracing freeglut.  Old GLUT
     * XXX    turns off events that it doesn't need and is a whole lot
     * XXX    more pleasant to trace.  (Think mouse-motion!  Tons of
     * XXX    ``bonus'' GUI events stream in.)
     */
    winAttr.event_mask        =
        StructureNotifyMask | SubstructureNotifyMask | ExposureMask |
        ButtonPressMask | ButtonReleaseMask | KeyPressMask | KeyReleaseMask |
        VisibilityChangeMask | EnterWindowMask | LeaveWindowMask |
        PointerMotionMask | ButtonMotionMask;
    winAttr.background_pixmap = None;
    winAttr.background_pixel  = 0;
    winAttr.border_pixel      = 0;

    winAttr.colormap = XCreateColormap(
        fgDisplay.Display, fgDisplay.RootWindow,
        visualInfo->visual, AllocNone
    );

    mask = CWBackPixmap | CWBorderPixel | CWColormap | CWEventMask;

    if( window->IsMenu || ( gameMode == GL_TRUE ) )
    {
        winAttr.override_redirect = True;
        mask |= CWOverrideRedirect;
    }

    if( ! positionUse )
        x = y = -1; /* default window position */
    if( ! sizeUse )
        w = h = 300; /* default window size */

    window->Window.Handle = XCreateWindow(
        fgDisplay.Display,
        window->Parent == NULL ? fgDisplay.RootWindow :
        window->Parent->Window.Handle,
        x, y, w, h, 0,
        visualInfo->depth, InputOutput,
        visualInfo->visual, mask,
        &winAttr
    );

    /*
     * The GLX context creation, possibly trying the direct context rendering
     *  or else use the current context if the user has so specified
     */

    if( window->IsMenu )
    {
        /*
         * If there isn't already an OpenGL rendering context for menu
         * windows, make one
         */
        if( !fgStructure.MenuContext )
        {
            fgStructure.MenuContext =
                (SFG_MenuContext *)malloc( sizeof(SFG_MenuContext) );
            fgStructure.MenuContext->MContext = fghCreateNewContext( window );
        }

        /* window->Window.Context = fgStructure.MenuContext->MContext; */
        window->Window.Context = fghCreateNewContext( window );
    }
    else if( fgState.UseCurrentContext )
    {
        window->Window.Context = glXGetCurrentContext( );

        if( ! window->Window.Context )
            window->Window.Context = fghCreateNewContext( window );
    }
    else
        window->Window.Context = fghCreateNewContext( window );

#if !defined( __FreeBSD__ ) && !defined( __NetBSD__ )
    if(  !glXIsDirect( fgDisplay.Display, window->Window.Context ) )
    {
      if( fgState.DirectContext == GLUT_FORCE_DIRECT_CONTEXT )
        fgError( "Unable to force direct context rendering for window '%s'",
                 title );
    }
#endif

    /*
     * XXX Assume the new window is visible by default
     * XXX Is this a  safe assumption?
     */
    window->State.Visible = GL_TRUE;

    sizeHints.flags = 0;
    if ( positionUse )
        sizeHints.flags |= USPosition;
    if ( sizeUse )
        sizeHints.flags |= USSize;

    /*
     * Fill in the size hints values now (the x, y, width and height
     * settings are obsolete, are there any more WMs that support them?)
     * Unless the X servers actually stop supporting these, we should
     * continue to fill them in.  It is *not* our place to tell the user
     * that they should replace a window manager that they like, and which
     * works, just because *we* think that it's not "modern" enough.
     */
    sizeHints.x      = x;
    sizeHints.y      = y;
    sizeHints.width  = w;
    sizeHints.height = h;

    wmHints.flags = StateHint;
    wmHints.initial_state = fgState.ForceIconic ? IconicState : NormalState;
    /* Prepare the window and iconified window names... */
    XStringListToTextProperty( (char **) &title, 1, &textProperty );

    XSetWMProperties(
        fgDisplay.Display,
        window->Window.Handle,
        &textProperty,
        &textProperty,
        0,
        0,
        &sizeHints,
        &wmHints,
        NULL
    );
    XFree( textProperty.value );

    XSetWMProtocols( fgDisplay.Display, window->Window.Handle,
                     &fgDisplay.DeleteWindow, 1 );

    glXMakeContextCurrent(
        fgDisplay.Display,
        window->Window.Handle,
        window->Window.Handle,
        window->Window.Context
    );

    XMapWindow( fgDisplay.Display, window->Window.Handle );

    XFree(visualInfo);

#elif TARGET_HOST_MS_WINDOWS

    WNDCLASS wc;
    DWORD flags;
    DWORD exFlags = 0;
    ATOM atom;
    int WindowStyle = 0;

    /* Grab the window class we have registered on glutInit(): */
    atom = GetClassInfo( fgDisplay.Instance, _T("FREEGLUT"), &wc );
    FREEGLUT_INTERNAL_ERROR_EXIT ( atom, "Window Class Info Not Found",
                                   "fgOpenWindow" );

    if( gameMode )
    {
        FREEGLUT_INTERNAL_ERROR_EXIT ( window->Parent == NULL,
                                       "Game mode being invoked on a subwindow",
                                       "fgOpenWindow" );

        /*
         * Set the window creation flags appropriately to make the window
         * entirely visible:
         */
        flags = WS_POPUP | WS_CLIPSIBLINGS | WS_CLIPCHILDREN | WS_VISIBLE;
    }
    else
    {
        int worig = w, horig = h;

#if !defined(_WIN32_WCE)
        if ( ( ! isSubWindow ) && ( ! window->IsMenu ) )
        {
            /*
             * Update the window dimensions, taking account of window
             * decorations.  "freeglut" is to create the window with the
             * outside of its border at (x,y) and with dimensions (w,h).
             */
            w += (GetSystemMetrics( SM_CXSIZEFRAME ) )*2;
            h += (GetSystemMetrics( SM_CYSIZEFRAME ) )*2 +
                GetSystemMetrics( SM_CYCAPTION );
        }
#endif /* defined(_WIN32_WCE) */

        if( ! positionUse )
        {
            x = CW_USEDEFAULT;
            y = CW_USEDEFAULT;
        }
        /* setting State.Width/Height to call resize callback later */
        if( ! sizeUse )
        {
            if( ! window->IsMenu )
            {
                w = CW_USEDEFAULT;
                h = CW_USEDEFAULT;
            }
            else /* fail safe - Windows can make a window of size (0, 0) */
                w = h = 300; /* default window size */
            window->State.Width = window->State.Height = -1;
        }
        else
        {
            window->State.Width = worig;
            window->State.Height = horig;
        }

        /*
         * There's a small difference between creating the top, child and
         * game mode windows
         */
        flags = WS_CLIPSIBLINGS | WS_CLIPCHILDREN | WS_VISIBLE;

        if ( window->IsMenu )
        {
            flags |= WS_POPUP;
            exFlags |= WS_EX_TOOLWINDOW;
        }
#if !defined(_WIN32_WCE)
        else if( window->Parent == NULL )
            flags |= WS_OVERLAPPEDWINDOW;
#endif
        else
            flags |= WS_CHILD;
    }

#if defined(_WIN32_WCE)
    {
        wchar_t* wstr = fghWstrFromStr(title);

        window->Window.Handle = CreateWindow(
            _T("FREEGLUT"),
            wstr,
            WS_VISIBLE | WS_POPUP,
            0,0, 240,320,
            NULL,
            NULL,
            fgDisplay.Instance,
            (LPVOID) window
        );

        free(wstr);

        SHFullScreen(window->Window.Handle, SHFS_HIDESTARTICON);
        SHFullScreen(window->Window.Handle, SHFS_HIDESIPBUTTON);
        SHFullScreen(window->Window.Handle, SHFS_HIDETASKBAR);
        MoveWindow(window->Window.Handle, 0, 0, 240, 320, TRUE);
        ShowWindow(window->Window.Handle, SW_SHOW);
        UpdateWindow(window->Window.Handle);
    }
#else
    window->Window.Handle = CreateWindowEx(
        exFlags,
        _T("FREEGLUT"),
        title,
        flags,
        x, y, w, h,
        (HWND) window->Parent == NULL ? NULL : window->Parent->Window.Handle,
        (HMENU) NULL,
        fgDisplay.Instance,
        (LPVOID) window
    );
#endif /* defined(_WIN32_WCE) */

    if( !( window->Window.Handle ) )
        fgError( "Failed to create a window (%s)!", title );

    /* Make a menu window always on top - fix Feature Request 947118 */
    if( window->IsMenu || gameMode )
        SetWindowPos(
                        window->Window.Handle,
                        HWND_TOPMOST,
                        0, 0, 0, 0,
                        SWP_NOMOVE | SWP_NOSIZE
                    );

    /* Hack to remove the caption (title bar) and/or border
     * and all the system menu controls.
     */
    WindowStyle = GetWindowLong(window->Window.Handle, GWL_STYLE);
    if ( fgState.DisplayMode & GLUT_CAPTIONLESS )
    {
        SetWindowLong ( window->Window.Handle, GWL_STYLE,
                        WindowStyle & ~(WS_DLGFRAME | WS_SYSMENU | WS_MINIMIZEBOX | WS_MAXIMIZEBOX));
    }
    else if ( fgState.DisplayMode & GLUT_BORDERLESS )
    {
        SetWindowLong ( window->Window.Handle, GWL_STYLE,
                        WindowStyle & ~(WS_BORDER | WS_SYSMENU | WS_MINIMIZEBOX | WS_MAXIMIZEBOX));
    }
/*  SetWindowPos(window->Window.Handle, NULL, 0, 0, 0, 0,
     SWP_NOMOVE | SWP_NOSIZE | SWP_NOZORDER | SWP_FRAMECHANGED); */


#if defined(_WIN32_WCE)
    ShowWindow( window->Window.Handle, SW_SHOW );
#else
    ShowWindow( window->Window.Handle,
                fgState.ForceIconic ? SW_SHOWMINIMIZED : SW_SHOW );
#endif /* defined(_WIN32_WCE) */

    UpdateWindow( window->Window.Handle );
    ShowCursor( TRUE );  /* XXX Old comments say "hide cursor"! */

#endif

    fgSetWindow( window );

    window->Window.DoubleBuffered =
        ( fgState.DisplayMode & GLUT_DOUBLE ) ? 1 : 0;

    if ( ! window->Window.DoubleBuffered )
    {
        glDrawBuffer ( GL_FRONT );
        glReadBuffer ( GL_FRONT );
    }
}

/*
 * Closes a window, destroying the frame and OpenGL context
 */
void fgCloseWindow( SFG_Window* window )
{
#if TARGET_HOST_POSIX_X11

    if( window->Window.Context )
        glXDestroyContext( fgDisplay.Display, window->Window.Context );
    XFree( window->Window.FBConfig );
    XDestroyWindow( fgDisplay.Display, window->Window.Handle );
    /* XFlush( fgDisplay.Display ); */ /* XXX Shouldn't need this */

#elif TARGET_HOST_MS_WINDOWS

    /* Make sure we don't close a window with current context active */
    if( fgStructure.CurrentWindow == window )
        wglMakeCurrent( NULL, NULL );

    /*
     * Step through the list of windows.  If the rendering context
     * is not being used by another window, then we delete it.
     */
    {
        int used = FALSE ;
        SFG_Window *iter ;

        for( iter = (SFG_Window *)fgStructure.Windows.First;
             iter;
             iter = (SFG_Window *)iter->Node.Next )
        {
            if( ( iter->Window.Context == window->Window.Context ) &&
                ( iter != window ) )
                used = TRUE;
        }

        if( ! used )
            wglDeleteContext( window->Window.Context );
    }

    DestroyWindow( window->Window.Handle );
#endif
}


/* -- INTERFACE FUNCTIONS -------------------------------------------------- */

/*
 * Creates a new top-level freeglut window
 */
int FGAPIENTRY glutCreateWindow( const char* title )
{
    /* XXX GLUT does not exit; it simply calls "glutInit" quietly if the
     * XXX application has not already done so.  The "freeglut" community
     * XXX decided not to go this route (freeglut-developer e-mail from
     * XXX Steve Baker, 12/16/04, 4:22 PM CST, "Re: [Freeglut-developer]
     * XXX Desired 'freeglut' behaviour when there is no current window"
     */
    FREEGLUT_EXIT_IF_NOT_INITIALISED ( "glutCreateWindow" );

    return fgCreateWindow( NULL, title, fgState.Position.Use,
                           fgState.Position.X, fgState.Position.Y,
                           fgState.Size.Use, fgState.Size.X, fgState.Size.Y,
                           GL_FALSE, GL_FALSE )->ID;
}

#if TARGET_HOST_MS_WINDOWS
int FGAPIENTRY __glutCreateWindowWithExit( const char *title, void (__cdecl *exit_function)(int) )
{
  __glutExitFunc = exit_function;
  return glutCreateWindow( title );
}
#endif

/*
 * This function creates a sub window.
 */
int FGAPIENTRY glutCreateSubWindow( int parentID, int x, int y, int w, int h )
{
    int ret = 0;
    SFG_Window* window = NULL;
    SFG_Window* parent = NULL;

    FREEGLUT_EXIT_IF_NOT_INITIALISED ( "glutCreateSubWindow" );
    parent = fgWindowByID( parentID );
    freeglut_return_val_if_fail( parent != NULL, 0 );
    if ( x < 0 )
    {
        x = parent->State.Width + x ;
        if ( w >= 0 ) x -= w ;
    }

    if ( w < 0 ) w = parent->State.Width - x + w ;
    if ( w < 0 )
    {
        x += w ;
        w = -w ;
    }

    if ( y < 0 )
    {
        y = parent->State.Height + y ;
        if ( h >= 0 ) y -= h ;
    }

    if ( h < 0 ) h = parent->State.Height - y + h ;
    if ( h < 0 )
    {
        y += h ;
        h = -h ;
    }

    window = fgCreateWindow( parent, "", GL_TRUE, x, y, GL_TRUE, w, h, GL_FALSE, GL_FALSE );
    ret = window->ID;

    return ret;
}

/*
 * Destroys a window and all of its subwindows
 */
void FGAPIENTRY glutDestroyWindow( int windowID )
{
    SFG_Window* window;
    FREEGLUT_EXIT_IF_NOT_INITIALISED ( "glutDestroyWindow" );
    window = fgWindowByID( windowID );
    freeglut_return_if_fail( window != NULL );
    {
        fgExecutionState ExecState = fgState.ExecState;
        fgAddToWindowDestroyList( window );
        fgState.ExecState = ExecState;
    }
}

/*
 * This function selects the current window
 */
void FGAPIENTRY glutSetWindow( int ID )
{
    SFG_Window* window = NULL;

    FREEGLUT_EXIT_IF_NOT_INITIALISED ( "glutSetWindow" );
    if( fgStructure.CurrentWindow != NULL )
        if( fgStructure.CurrentWindow->ID == ID )
            return;

    window = fgWindowByID( ID );
    if( window == NULL )
    {
        fgWarning( "glutSetWindow(): window ID %d not found!", ID );
        return;
    }

    fgSetWindow( window );
}

/*
 * This function returns the ID number of the current window, 0 if none exists
 */
int FGAPIENTRY glutGetWindow( void )
{
    SFG_Window *win = fgStructure.CurrentWindow;
    /*
     * Since GLUT did not throw an error if this function was called without a prior call to
     * "glutInit", this function shouldn't do so here.  Instead let us return a zero.
     * See Feature Request "[ 1307049 ] glutInit check".
     */
    if ( ! fgState.Initialised )
        return 0;

    while ( win && win->IsMenu )
        win = win->Parent;
    return win ? win->ID : 0;
}

/*
 * This function makes the current window visible
 */
void FGAPIENTRY glutShowWindow( void )
{
    FREEGLUT_EXIT_IF_NOT_INITIALISED ( "glutShowWindow" );
    FREEGLUT_EXIT_IF_NO_WINDOW ( "glutShowWindow" );

#if TARGET_HOST_POSIX_X11

    XMapWindow( fgDisplay.Display, fgStructure.CurrentWindow->Window.Handle );
    XFlush( fgDisplay.Display ); /* XXX Shouldn't need this */

#elif TARGET_HOST_MS_WINDOWS

    ShowWindow( fgStructure.CurrentWindow->Window.Handle, SW_SHOW );

#endif

    fgStructure.CurrentWindow->State.Redisplay = GL_TRUE;
}

/*
 * This function hides the current window
 */
void FGAPIENTRY glutHideWindow( void )
{
    FREEGLUT_EXIT_IF_NOT_INITIALISED ( "glutHideWindow" );
    FREEGLUT_EXIT_IF_NO_WINDOW ( "glutHideWindow" );

#if TARGET_HOST_POSIX_X11

    if( fgStructure.CurrentWindow->Parent == NULL )
        XWithdrawWindow( fgDisplay.Display,
                         fgStructure.CurrentWindow->Window.Handle,
                         fgDisplay.Screen );
    else
        XUnmapWindow( fgDisplay.Display,
                      fgStructure.CurrentWindow->Window.Handle );
    XFlush( fgDisplay.Display ); /* XXX Shouldn't need this */

#elif TARGET_HOST_MS_WINDOWS

    ShowWindow( fgStructure.CurrentWindow->Window.Handle, SW_HIDE );

#endif

    fgStructure.CurrentWindow->State.Redisplay = GL_FALSE;
}

/*
 * Iconify the current window (top-level windows only)
 */
void FGAPIENTRY glutIconifyWindow( void )
{
    FREEGLUT_EXIT_IF_NOT_INITIALISED ( "glutIconifyWindow" );
    FREEGLUT_EXIT_IF_NO_WINDOW ( "glutIconifyWindow" );

    fgStructure.CurrentWindow->State.Visible   = GL_FALSE;
#if TARGET_HOST_POSIX_X11

    XIconifyWindow( fgDisplay.Display, fgStructure.CurrentWindow->Window.Handle,
                    fgDisplay.Screen );
    XFlush( fgDisplay.Display ); /* XXX Shouldn't need this */

#elif TARGET_HOST_MS_WINDOWS

    ShowWindow( fgStructure.CurrentWindow->Window.Handle, SW_MINIMIZE );

#endif

    fgStructure.CurrentWindow->State.Redisplay = GL_FALSE;
}

/*
 * Set the current window's title
 */
void FGAPIENTRY glutSetWindowTitle( const char* title )
{
    FREEGLUT_EXIT_IF_NOT_INITIALISED ( "glutSetWindowTitle" );
    FREEGLUT_EXIT_IF_NO_WINDOW ( "glutSetWindowTitle" );
    if( ! fgStructure.CurrentWindow->Parent )
    {
#if TARGET_HOST_POSIX_X11

        XTextProperty text;

        text.value = (unsigned char *) title;
        text.encoding = XA_STRING;
        text.format = 8;
        text.nitems = strlen( title );

        XSetWMName(
            fgDisplay.Display,
            fgStructure.CurrentWindow->Window.Handle,
            &text
        );

        XFlush( fgDisplay.Display ); /* XXX Shouldn't need this */

#elif TARGET_HOST_MS_WINDOWS
#    ifdef _WIN32_WCE
        {
            wchar_t* wstr = fghWstrFromStr(title);
            SetWindowText( fgStructure.CurrentWindow->Window.Handle, wstr );
            free(wstr);
        }
#    else
        SetWindowText( fgStructure.CurrentWindow->Window.Handle, title );
#    endif

#endif
    }
}

/*
 * Set the current window's iconified title
 */
void FGAPIENTRY glutSetIconTitle( const char* title )
{
    FREEGLUT_EXIT_IF_NOT_INITIALISED ( "glutSetIconTitle" );
    FREEGLUT_EXIT_IF_NO_WINDOW ( "glutSetIconTitle" );

    if( ! fgStructure.CurrentWindow->Parent )
    {
#if TARGET_HOST_POSIX_X11

        XTextProperty text;

        text.value = (unsigned char *) title;
        text.encoding = XA_STRING;
        text.format = 8;
        text.nitems = strlen( title );

        XSetWMIconName(
            fgDisplay.Display,
            fgStructure.CurrentWindow->Window.Handle,
            &text
        );

        XFlush( fgDisplay.Display ); /* XXX Shouldn't need this */

#elif TARGET_HOST_MS_WINDOWS
#    ifdef _WIN32_WCE
        {
            wchar_t* wstr = fghWstrFromStr(title);
            SetWindowText( fgStructure.CurrentWindow->Window.Handle, wstr );
            free(wstr);
        }
#    else
        SetWindowText( fgStructure.CurrentWindow->Window.Handle, title );
#    endif

#endif
    }
}

/*
 * Change the current window's size
 */
void FGAPIENTRY glutReshapeWindow( int width, int height )
{
    FREEGLUT_EXIT_IF_NOT_INITIALISED ( "glutReshapeWindow" );
    FREEGLUT_EXIT_IF_NO_WINDOW ( "glutReshapeWindow" );

    if (glutGet(GLUT_FULL_SCREEN))
    {
      /*  Leave full screen state before resizing. */
      glutFullScreenToggle();
    }

    fgStructure.CurrentWindow->State.NeedToResize = GL_TRUE;
    fgStructure.CurrentWindow->State.Width  = width ;
    fgStructure.CurrentWindow->State.Height = height;
}

/*
 * Change the current window's position
 */
void FGAPIENTRY glutPositionWindow( int x, int y )
{
    FREEGLUT_EXIT_IF_NOT_INITIALISED ( "glutPositionWindow" );
    FREEGLUT_EXIT_IF_NO_WINDOW ( "glutPositionWindow" );

    if (glutGet(GLUT_FULL_SCREEN))
    {
      /*  Leave full screen state before moving. */
      glutFullScreenToggle();
    }

#if TARGET_HOST_POSIX_X11

    XMoveWindow( fgDisplay.Display, fgStructure.CurrentWindow->Window.Handle,
                 x, y );
    XFlush( fgDisplay.Display ); /* XXX Shouldn't need this */

#elif TARGET_HOST_MS_WINDOWS

    {
        RECT winRect;

        /* "GetWindowRect" returns the pixel coordinates of the outside of the window */
        GetWindowRect( fgStructure.CurrentWindow->Window.Handle, &winRect );
        MoveWindow(
            fgStructure.CurrentWindow->Window.Handle,
            x,
            y,
            winRect.right - winRect.left,
            winRect.bottom - winRect.top,
            TRUE
        );
    }

#endif
}

/*
 * Lowers the current window (by Z order change)
 */
void FGAPIENTRY glutPushWindow( void )
{
    FREEGLUT_EXIT_IF_NOT_INITIALISED ( "glutPushWindow" );
    FREEGLUT_EXIT_IF_NO_WINDOW ( "glutPushWindow" );

#if TARGET_HOST_POSIX_X11

    XLowerWindow( fgDisplay.Display, fgStructure.CurrentWindow->Window.Handle );

#elif TARGET_HOST_MS_WINDOWS

    SetWindowPos(
        fgStructure.CurrentWindow->Window.Handle,
        HWND_BOTTOM,
        0, 0, 0, 0,
        SWP_NOSIZE | SWP_NOMOVE
    );

#endif
}

/*
 * Raises the current window (by Z order change)
 */
void FGAPIENTRY glutPopWindow( void )
{
    FREEGLUT_EXIT_IF_NOT_INITIALISED ( "glutPopWindow" );
    FREEGLUT_EXIT_IF_NO_WINDOW ( "glutPopWindow" );

#if TARGET_HOST_POSIX_X11

    XRaiseWindow( fgDisplay.Display, fgStructure.CurrentWindow->Window.Handle );

#elif TARGET_HOST_MS_WINDOWS

    SetWindowPos(
        fgStructure.CurrentWindow->Window.Handle,
        HWND_TOP,
        0, 0, 0, 0,
        SWP_NOSIZE | SWP_NOMOVE
    );

#endif
}

#if TARGET_HOST_POSIX_X11
static int ewmh_fullscr_toggle(void);
static int resize_fullscr_toogle(void);

static int toggle_fullscreen(void)
{
    /* first try the EWMH (_NET_WM_STATE) method ... */
    if(ewmh_fullscr_toggle() != -1) {
        return 0;
    }

    /* fall back to resizing the window */
    if(resize_fullscr_toogle() != -1) {
        return 0;
    }
    return -1;
}

#define _NET_WM_STATE_TOGGLE    2
static int ewmh_fullscr_toggle(void)
{
    XEvent xev;
    long evmask = SubstructureRedirectMask | SubstructureNotifyMask;

    if(!fgDisplay.State || !fgDisplay.StateFullScreen) {
        return -1;
    }

    xev.type = ClientMessage;
    xev.xclient.window = fgStructure.CurrentWindow->Window.Handle;
    xev.xclient.message_type = fgDisplay.State;
    xev.xclient.format = 32;
    xev.xclient.data.l[0] = _NET_WM_STATE_TOGGLE;
    xev.xclient.data.l[1] = fgDisplay.StateFullScreen;
    xev.xclient.data.l[2] = 0;	/* no second property to toggle */
    xev.xclient.data.l[3] = 1;	/* source indication: application */
    xev.xclient.data.l[4] = 0;	/* unused */

    if(!XSendEvent(fgDisplay.Display, fgDisplay.RootWindow, 0, evmask, &xev)) {
        return -1;
    }
    return 0;
}

static int resize_fullscr_toogle(void)
{
    XWindowAttributes attributes;

    if(glutGet(GLUT_FULL_SCREEN)) {
        /* restore original window size */
        SFG_Window *win = fgStructure.CurrentWindow;
        fgStructure.CurrentWindow->State.NeedToResize = GL_TRUE;
        fgStructure.CurrentWindow->State.Width  = win->State.OldWidth;
        fgStructure.CurrentWindow->State.Height = win->State.OldHeight;

    } else {
        /* resize the window to cover the entire screen */
        XGetWindowAttributes(fgDisplay.Display,
                fgStructure.CurrentWindow->Window.Handle,
                &attributes);
        
        /*
         * The "x" and "y" members of "attributes" are the window's coordinates
         * relative to its parent, i.e. to the decoration window.
         */
        XMoveResizeWindow(fgDisplay.Display,
                fgStructure.CurrentWindow->Window.Handle,
                -attributes.x,
                -attributes.y,
                fgDisplay.ScreenWidth,
                fgDisplay.ScreenHeight);
    }
    return 0;
}
#endif	/* TARGET_HOST_POSIX_X11 */


/*
 * Resize the current window so that it fits the whole screen
 */
void FGAPIENTRY glutFullScreen( void )
{
    SFG_Window *win;

    FREEGLUT_EXIT_IF_NOT_INITIALISED ( "glutFullScreen" );
    FREEGLUT_EXIT_IF_NO_WINDOW ( "glutFullScreen" );

    win = fgStructure.CurrentWindow;

#if TARGET_HOST_POSIX_X11
    if(!glutGet(GLUT_FULL_SCREEN)) {
        if(toggle_fullscreen() != -1) {
            win->State.IsFullscreen = GL_TRUE;
        }
    }

#elif TARGET_HOST_MS_WINDOWS && !defined(_WIN32_WCE) /* FIXME: what about WinCE */

    if (glutGet(GLUT_FULL_SCREEN))
    {
        /*  Leave full screen state before resizing. */
        glutFullScreenToggle();
    }

    {
        RECT rect;

        /* For fullscreen mode, force the top-left corner to 0,0
         * and adjust the window rectangle so that the client area
         * covers the whole screen.
         */

        rect.left   = 0;
        rect.top    = 0;
        rect.right  = fgDisplay.ScreenWidth;
        rect.bottom = fgDisplay.ScreenHeight;

        AdjustWindowRect ( &rect, WS_OVERLAPPEDWINDOW | WS_CLIPSIBLINGS |
                                  WS_CLIPCHILDREN, FALSE );

        /*
         * SWP_NOACTIVATE     Do not activate the window
         * SWP_NOOWNERZORDER  Do not change position in z-order
         * SWP_NOSENDCHANGING Supress WM_WINDOWPOSCHANGING message
         * SWP_NOZORDER       Retains the current Z order (ignore 2nd param)
         */

        SetWindowPos( fgStructure.CurrentWindow->Window.Handle,
                      HWND_TOP,
                      rect.left,
                      rect.top,
                      rect.right  - rect.left,
                      rect.bottom - rect.top,
                      SWP_NOACTIVATE | SWP_NOOWNERZORDER | SWP_NOSENDCHANGING |
                      SWP_NOZORDER
                    );
        
        win->State.IsFullscreen = GL_TRUE;
    }
#endif
}

/*
 * Toggle the window's full screen state.
 */
void FGAPIENTRY glutFullScreenToggle( void )
{
    SFG_Window *win;

    FREEGLUT_EXIT_IF_NOT_INITIALISED ( "glutFullScreenToggle" );
    FREEGLUT_EXIT_IF_NO_WINDOW ( "glutFullScreenToggle" );

    win = fgStructure.CurrentWindow;

#if TARGET_HOST_POSIX_X11
    if(toggle_fullscreen() != -1) {
        win->State.IsFullscreen = !win->State.IsFullscreen;
    }
#elif TARGET_HOST_MS_WINDOWS
    glutFullScreen();
    win->State.IsFullscreen = !win->State.IsFullscreen;
#endif
}

/*
 * A.Donev: Set and retrieve the window's user data
 */
void* FGAPIENTRY glutGetWindowData( void )
{
    FREEGLUT_EXIT_IF_NOT_INITIALISED ( "glutGetWindowData" );
    FREEGLUT_EXIT_IF_NO_WINDOW ( "glutGetWindowData" );
    return fgStructure.CurrentWindow->UserData;
}

void FGAPIENTRY glutSetWindowData(void* data)
{
    FREEGLUT_EXIT_IF_NOT_INITIALISED ( "glutSetWindowData" );
    FREEGLUT_EXIT_IF_NO_WINDOW ( "glutSetWindowData" );
    fgStructure.CurrentWindow->UserData = data;
}

/*** END OF FILE ***/
