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

#ifndef __FTExtrudeGlyph__
#define __FTExtrudeGlyph__

#ifdef __cplusplus


/**
 * FTExtrudeGlyph is a specialisation of FTGlyph for creating tessellated
 * extruded polygon glyphs.
 */
class FTGL_EXPORT FTExtrudeGlyph : public FTGlyph
{
    public:
        /**
         * Constructor. Sets the Error to Invalid_Outline if the glyph isn't
         * an outline.
         *
         * @param glyph The Freetype glyph to be processed
         * @param depth The distance along the z axis to extrude the glyph
         * @param frontOutset outset contour size
         * @param backOutset outset contour size
         * @param useDisplayList Enable or disable the use of Display Lists
         *                       for this glyph
         *                       <code>true</code> turns ON display lists.
         *                       <code>false</code> turns OFF display lists.
         */
        FTExtrudeGlyph(FT_GlyphSlot glyph, float depth, float frontOutset,
                       float backOutset, bool useDisplayList);

        /**
         * Destructor
         */
        virtual ~FTExtrudeGlyph();

        /**
         * Render this glyph at the current pen position.
         *
         * @param pen  The current pen position.
         * @param renderMode  Render mode to display
         * @return  The advance distance for this glyph.
         */
        virtual const FTPoint& Render(const FTPoint& pen, int renderMode);
};

#define FTExtrdGlyph FTExtrudeGlyph

#endif //__cplusplus

FTGL_BEGIN_C_DECLS

/**
 * Create a specialisation of FTGLglyph for creating tessellated
 * extruded polygon glyphs.
 *
 * @param glyph The Freetype glyph to be processed
 * @param depth The distance along the z axis to extrude the glyph
 * @param frontOutset outset contour size
 * @param backOutset outset contour size
 * @param useDisplayList Enable or disable the use of Display Lists
 *                       for this glyph
 *                       <code>true</code> turns ON display lists.
 *                       <code>false</code> turns OFF display lists.
 * @return  An FTGLglyph* object.
 */
FTGL_EXPORT FTGLglyph *ftglCreateExtrudeGlyph(FT_GlyphSlot glyph, float depth,
                                float frontOutset, float backOutset,
                                int useDisplayList);

FTGL_END_C_DECLS

#endif  //  __FTExtrudeGlyph__

