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

#ifndef __FTOutlineGlyphImpl__
#define __FTOutlineGlyphImpl__

#include "FTGlyphImpl.h"

class FTVectoriser;

class FTOutlineGlyphImpl : public FTGlyphImpl
{
    friend class FTOutlineGlyph;

    protected:
        FTOutlineGlyphImpl(FT_GlyphSlot glyph, float outset,
                           bool useDisplayList);

        virtual ~FTOutlineGlyphImpl();

        virtual const FTPoint& RenderImpl(const FTPoint& pen, int renderMode);

    private:
        /**
         * Private rendering method.
         */
        void DoRender();

        /**
         * Private rendering variables.
         */
        FTVectoriser *vectoriser;

        /**
         * Private rendering variables.
         */
        float outset;

        /**
         * OpenGL display list
         */
        GLuint glList;
};

#endif  // __FTOutlineGlyphImpl__

