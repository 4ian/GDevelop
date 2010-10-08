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

#ifndef __FTTextureGlyph__
#define __FTTextureGlyph__

#ifdef __cplusplus


/**
 * FTTextureGlyph is a specialisation of FTGlyph for creating texture
 * glyphs.
 */
class FTGL_EXPORT FTTextureGlyph : public FTGlyph
{
    public:
        /**
         * Constructor
         *
         * @param glyph     The Freetype glyph to be processed
         * @param id        The id of the texture that this glyph will be
         *                  drawn in
         * @param xOffset   The x offset into the parent texture to draw
         *                  this glyph
         * @param yOffset   The y offset into the parent texture to draw
         *                  this glyph
         * @param width     The width of the parent texture
         * @param height    The height (number of rows) of the parent texture
         */
        FTTextureGlyph(FT_GlyphSlot glyph, int id, int xOffset, int yOffset,
                       int width, int height);

        /**
         * Destructor
         */
        virtual ~FTTextureGlyph();

        /**
         * Render this glyph at the current pen position.
         *
         * @param pen  The current pen position.
         * @param renderMode  Render mode to display
         * @return  The advance distance for this glyph.
         */
        virtual const FTPoint& Render(const FTPoint& pen, int renderMode);
};

#endif //__cplusplus

FTGL_BEGIN_C_DECLS

/**
 * Create a specialisation of FTGLglyph for creating pixmaps.
 *
 * @param glyph The Freetype glyph to be processed.
 * @param id  The id of the texture that this glyph will be drawn in.
 * @param xOffset  The x offset into the parent texture to draw this glyph.
 * @param yOffset  The y offset into the parent texture to draw this glyph.
 * @param width  The width of the parent texture.
 * @param height  The height (number of rows) of the parent texture.
 * @return  An FTGLglyph* object.
 */
FTGL_EXPORT FTGLglyph *ftglCreateTextureGlyph(FT_GlyphSlot glyph, int id,
                                              int xOffset, int yOffset,
                                              int width, int height);

FTGL_END_C_DECLS

#endif  //  __FTTextureGlyph__

