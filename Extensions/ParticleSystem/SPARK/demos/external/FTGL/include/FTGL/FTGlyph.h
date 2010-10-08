/*
 * FTGL - OpenGL font library
 *
 * Copyright (c) 2001-2004 Henry Maddocks <ftgl@opengl.geek.nz>
 * Copyright (c) 2008 Sam Hocevar <sam@zoy.org>
 * Copyright (c) 2008 Sean Morrison <learner@brlcad.org>
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

#ifndef __ftgl__
#   warning This header is deprecated. Please use <FTGL/ftgl.h> from now.
#   include <FTGL/ftgl.h>
#endif

#ifndef __FTGlyph__
#define __FTGlyph__

#ifdef __cplusplus

class FTGlyphImpl;

/**
 * FTGlyph is the base class for FTGL glyphs.
 *
 * It provides the interface between Freetype glyphs and their openGL
 * renderable counterparts. This is an abstract class and derived classes
 * must implement the <code>Render</code> function.
 *
 * @see FTBBox
 * @see FTPoint
 */
class FTGL_EXPORT FTGlyph
{
    protected:
        /**
         * Create a glyph.
         *
         * @param glyph  The Freetype glyph to be processed
         */
        FTGlyph(FT_GlyphSlot glyph);

    private:
        /**
         * Internal FTGL FTGlyph constructor. For private use only.
         *
         * @param pImpl  Internal implementation object. Will be destroyed
         *               upon FTGlyph deletion.
         */
        FTGlyph(FTGlyphImpl *pImpl);

        /* Allow our internal subclasses to access the private constructor */
        friend class FTBitmapGlyph;
        friend class FTBufferGlyph;
        friend class FTExtrudeGlyph;
        friend class FTOutlineGlyph;
        friend class FTPixmapGlyph;
        friend class FTPolygonGlyph;
        friend class FTTextureGlyph;

    public:
        /**
          * Destructor
          */
        virtual ~FTGlyph();

        /**
         * Renders this glyph at the current pen position.
         *
         * @param pen  The current pen position.
         * @param renderMode  Render mode to display
         * @return  The advance distance for this glyph.
         */
        virtual const FTPoint& Render(const FTPoint& pen, int renderMode) = 0;

        /**
         * Return the advance width for this glyph.
         *
         * @return  advance width.
         */
        virtual float Advance() const;

        /**
         * Return the bounding box for this glyph.
         *
         * @return  bounding box.
         */
        virtual const FTBBox& BBox() const;

        /**
         * Queries for errors.
         *
         * @return  The current error code.
         */
        virtual FT_Error Error() const;

    private:
        /**
         * Internal FTGL FTGlyph implementation object. For private use only.
         */
        FTGlyphImpl *impl;
};

#endif //__cplusplus

FTGL_BEGIN_C_DECLS

/**
 * FTGLglyph is the base class for FTGL glyphs.
 *
 * It provides the interface between Freetype glyphs and their openGL
 * renderable counterparts. This is an abstract class and derived classes
 * must implement the ftglRenderGlyph() function.
 */
struct _FTGLGlyph;
typedef struct _FTGLglyph FTGLglyph;

/**
 * Create a custom FTGL glyph object.
 * FIXME: maybe get rid of "base" and have advanceCallback etc. functions
 *
 * @param base  The base FTGLglyph* to subclass.
 * @param data  A pointer to private data that will be passed to callbacks.
 * @param renderCallback  A rendering callback function.
 * @param destroyCallback  A callback function to be called upon destruction.
 * @return  An FTGLglyph* object.
 */
FTGL_EXPORT FTGLglyph *ftglCreateCustomGlyph(FTGLglyph *base, void *data,
    void (*renderCallback) (FTGLglyph *, void *, FTGL_DOUBLE, FTGL_DOUBLE,
                             int, FTGL_DOUBLE *, FTGL_DOUBLE *),
    void (*destroyCallback) (FTGLglyph *, void *));

/**
 * Destroy an FTGL glyph object.
 *
 * @param glyph  An FTGLglyph* object.
 */
FTGL_EXPORT void ftglDestroyGlyph(FTGLglyph *glyph);

/**
 * Render a glyph at the current pen position and compute the corresponding
 * advance.
 *
 * @param glyph  An FTGLglyph* object.
 * @param penx  The current pen's X position.
 * @param peny  The current pen's Y position.
 * @param renderMode  Render mode to display
 * @param advancex  A pointer to an FTGL_DOUBLE where to write the advance's X
 *                  component.
 * @param advancey  A pointer to an FTGL_DOUBLE where to write the advance's Y
 *                  component.
 */
FTGL_EXPORT void ftglRenderGlyph(FTGLglyph *glyph, FTGL_DOUBLE penx,
                                 FTGL_DOUBLE peny, int renderMode,
                                 FTGL_DOUBLE *advancex, FTGL_DOUBLE *advancey);
/**
 * Return the advance for a glyph.
 *
 * @param glyph  An FTGLglyph* object.
 * @return  The advance's X component.
 */
FTGL_EXPORT float ftglGetGlyphAdvance(FTGLglyph *glyph);

/**
 * Return the bounding box for a glyph.
 *
 * @param glyph  An FTGLglyph* object.
 * @param bounds  An array of 6 float values where the bounding box's lower
 *                left near and upper right far 3D coordinates will be stored.
 */
FTGL_EXPORT void ftglGetGlyphBBox(FTGLglyph *glyph, float bounds[6]);

/**
 * Query a glyph for errors.
 *
 * @param glyph  An FTGLglyph* object.
 * @return  The current error code.
 */
FTGL_EXPORT FT_Error ftglGetGlyphError(FTGLglyph* glyph);

FTGL_END_C_DECLS

#endif  //  __FTGlyph__

