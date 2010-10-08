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

#ifndef __FTExtrudeFontImpl__
#define __FTExtrudeFontImpl__

#include "FTFontImpl.h"

class FTGlyph;

class FTExtrudeFontImpl : public FTFontImpl
{
    friend class FTExtrudeFont;

    protected:
        FTExtrudeFontImpl(FTFont *ftFont, const char* fontFilePath);

        FTExtrudeFontImpl(FTFont *ftFont, const unsigned char *pBufferBytes,
                          size_t bufferSizeInBytes);

        /**
         * Set the extrusion distance for the font.
         *
         * @param d  The extrusion distance.
         */
        virtual void Depth(float d) { depth = d; }

        /**
         * Set the outset distance for the font. Only implemented by
         * FTOutlineFont, FTPolygonFont and FTExtrudeFont
         *
         * @param o  The outset distance.
         */
        virtual void Outset(float o) { front = back = o; }

        /**
         * Set the outset distance for the font. Only implemented by
         * FTExtrudeFont
         *
         * @param f  The front outset distance.
         * @param b  The back outset distance.
         */
        virtual void Outset(float f, float b) { front = f; back = b; }

    private:
        /**
         * The extrusion distance for the font.
         */
        float depth;

        /**
         * The outset distance (front and back) for the font.
         */
        float front, back;
};

#endif // __FTExtrudeFontImpl__

