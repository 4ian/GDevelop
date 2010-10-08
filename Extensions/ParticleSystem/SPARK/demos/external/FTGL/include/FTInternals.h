/*
 * FTGL - OpenGL font library
 *
 * Copyright (c) 2001-2004 Henry Maddocks <ftgl@opengl.geek.nz>
 * Copyright (c) 2008 Éric Beets <ericbeets@free.fr>
 * Copyright (c) 2008 Sam Hocevar <sam@zoy.org>
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
 * CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

#ifndef __FTINTERNALS_H__
#define __FTINTERNALS_H__

#include "FTGL/ftgl.h"

#include <stdlib.h>
#include <stdio.h>


// Fixes for deprecated identifiers in 2.1.5
#ifndef FT_OPEN_MEMORY
    #define FT_OPEN_MEMORY (FT_Open_Flags)1
#endif

#ifndef FT_RENDER_MODE_MONO
    #define FT_RENDER_MODE_MONO ft_render_mode_mono
#endif

#ifndef FT_RENDER_MODE_NORMAL
    #define FT_RENDER_MODE_NORMAL ft_render_mode_normal
#endif


#ifdef WIN32

    // Under windows avoid including <windows.h> is overrated.
    // Sure, it can be avoided and "name space pollution" can be
    // avoided, but why? It really doesn't make that much difference
    // these days.
    #define  WIN32_LEAN_AND_MEAN
    #include <windows.h>

    #ifndef __gl_h_
        #include <GL/gl.h>
        #include <GL/glu.h>
    #endif

#else

    // Non windows platforms - don't require nonsense as seen above :-)
    #ifndef __gl_h_
        #ifdef SDL_main
            #include "SDL_opengl.h"
        #elif __APPLE_CC__
            #include <OpenGL/gl.h>
            #include <OpenGL/glu.h>
        #else
            #include <GL/gl.h>
            #if defined (__sun__) && !defined (__sparc__)
                #include <mesa/glu.h>
            #else
                #include <GL/glu.h>
            #endif
        #endif

    #endif

    // Required for compatibility with glext.h style function definitions of
    // OpenGL extensions, such as in src/osg/Point.cpp.
    #ifndef APIENTRY
        #define APIENTRY
    #endif
#endif

FTGL_BEGIN_C_DECLS

typedef enum
{
    GLYPH_CUSTOM,
    GLYPH_BITMAP,
    GLYPH_BUFFER,
    GLYPH_PIXMAP,
    GLYPH_OUTLINE,
    GLYPH_POLYGON,
    GLYPH_EXTRUDE,
    GLYPH_TEXTURE,
} GlyphType;

struct _FTGLglyph
{
    FTGlyph *ptr;
    FTGL::GlyphType type;
};

typedef enum
{
    FONT_CUSTOM,
    FONT_BITMAP,
    FONT_BUFFER,
    FONT_PIXMAP,
    FONT_OUTLINE,
    FONT_POLYGON,
    FONT_EXTRUDE,
    FONT_TEXTURE,
} FontType;

struct _FTGLfont
{
    FTFont *ptr;
    FTGL::FontType type;
};

typedef enum
{
    LAYOUT_SIMPLE,
} LayoutType;

struct _FTGLlayout
{
    FTLayout *ptr;
    FTGLfont *font;
    FTGL::LayoutType type;
};

FTGL_END_C_DECLS

#endif  //__FTINTERNALS_H__

