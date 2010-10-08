/*
 * FTGL - OpenGL font library
 *
 * Copyright (c) 2001-2004 Henry Maddocks <ftgl@opengl.geek.nz>
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

#ifndef __FTTextureFontImpl__
#define __FTTextureFontImpl__

#include "FTFontImpl.h"

#include "FTVector.h"

class FTTextureGlyph;

class FTTextureFontImpl : public FTFontImpl
{
    friend class FTTextureFont;

    protected:
        FTTextureFontImpl(FTFont *ftFont, const char* fontFilePath);

        FTTextureFontImpl(FTFont *ftFont, const unsigned char *pBufferBytes,
                          size_t bufferSizeInBytes);

        virtual ~FTTextureFontImpl();

        /**
         * Set the char size for the current face.
         *
         * @param size      the face size in points (1/72 inch)
         * @param res       the resolution of the target device.
         * @return          <code>true</code> if size was set correctly
         */
        virtual bool FaceSize(const unsigned int size,
                              const unsigned int res = 72);

        virtual FTPoint Render(const char *s, const int len,
                               FTPoint position, FTPoint spacing,
                               int renderMode);

        virtual FTPoint Render(const wchar_t *s, const int len,
                               FTPoint position, FTPoint spacing,
                               int renderMode);

    private:
        /**
         * Create an FTTextureGlyph object for the base class.
         */
        FTGlyph* MakeGlyphImpl(FT_GlyphSlot ftGlyph);

        /**
         * Get the size of a block of memory required to layout the glyphs
         *
         * Calculates a width and height based on the glyph sizes and the
         * number of glyphs. It over estimates.
         */
        inline void CalculateTextureSize();

        /**
         * Creates a 'blank' OpenGL texture object.
         *
         * The format is GL_ALPHA and the params are
         * GL_TEXTURE_WRAP_S = GL_CLAMP
         * GL_TEXTURE_WRAP_T = GL_CLAMP
         * GL_TEXTURE_MAG_FILTER = GL_LINEAR
         * GL_TEXTURE_MIN_FILTER = GL_LINEAR
         * Note that mipmapping is NOT used
         */
        inline GLuint CreateTexture();

        /**
         * The maximum texture dimension on this OpenGL implemetation
         */
        GLsizei maximumGLTextureSize;

        /**
         * The minimum texture width required to hold the glyphs
         */
        GLsizei textureWidth;

        /**
         * The minimum texture height required to hold the glyphs
         */
        GLsizei textureHeight;

        /**
         *An array of texture ids
         */
        FTVector<GLuint> textureIDList;

        /**
         * The max height for glyphs in the current font
         */
        int glyphHeight;

        /**
         * The max width for glyphs in the current font
         */
        int glyphWidth;

        /**
         * A value to be added to the height and width to ensure that
         * glyphs don't overlap in the texture
         */
        unsigned int padding;

        /**
         *
         */
        unsigned int numGlyphs;

        /**
         */
        unsigned int remGlyphs;

        /**
         */
        int xOffset;

        /**
         */
        int yOffset;

        /* Internal generic Render() implementation */
        template <typename T>
        inline FTPoint RenderI(const T *s, const int len,
                               FTPoint position, FTPoint spacing, int mode);
};

#endif // __FTTextureFontImpl__

