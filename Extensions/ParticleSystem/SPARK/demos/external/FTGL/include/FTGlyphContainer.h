/*
 * FTGL - OpenGL font library
 *
 * Copyright (c) 2001-2004 Henry Maddocks <ftgl@opengl.geek.nz>
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

#ifndef     __FTGlyphContainer__
#define     __FTGlyphContainer__

#include <ft2build.h>
#include FT_FREETYPE_H
#include FT_GLYPH_H

#include "FTGL/ftgl.h"

#include "FTVector.h"

class FTFace;
class FTGlyph;
class FTCharmap;

/**
 * FTGlyphContainer holds the post processed FTGlyph objects.
 *
 * @see FTGlyph
 */
class FTGlyphContainer
{
        typedef FTVector<FTGlyph*> GlyphVector;
    public:
        /**
         * Constructor
         *
         * @param face      The Freetype face
         */
        FTGlyphContainer(FTFace* face);

        /**
         * Destructor
         */
        ~FTGlyphContainer();

        /**
         * Sets the character map for the face.
         *
         * @param encoding      the Freetype encoding symbol. See above.
         * @return              <code>true</code> if charmap was valid
         *                      and set correctly
         */
        bool CharMap(FT_Encoding encoding);

        /**
         * Get the font index of the input character.
         *
         * @param characterCode The character code of the requested glyph in the
         *                      current encoding eg apple roman.
         * @return      The font index for the character.
         */
        unsigned int FontIndex(const unsigned int characterCode) const;

        /**
         * Adds a glyph to this glyph list.
         *
         * @param glyph         The FTGlyph to be inserted into the container
         * @param characterCode The char code of the glyph NOT the glyph index.
         */
        void Add(FTGlyph* glyph, const unsigned int characterCode);

        /**
         * Get a glyph from the glyph list
         *
         * @param characterCode The char code of the glyph NOT the glyph index
         * @return              An FTGlyph or <code>null</code> is it hasn't been
         * loaded.
         */
        const FTGlyph* const Glyph(const unsigned int characterCode) const;

        /**
         * Get the bounding box for a character.
         * @param characterCode The char code of the glyph NOT the glyph index
         */
        FTBBox BBox(const unsigned int characterCode) const;

        /**
        * Returns the kerned advance width for a glyph.
        *
        * @param characterCode     glyph index of the character
        * @param nextCharacterCode the next glyph in a string
        * @return                  advance width
        */
        float Advance(const unsigned int characterCode,
                      const unsigned int nextCharacterCode);

        /**
         * Renders a character
         * @param characterCode      the glyph to be Rendered
         * @param nextCharacterCode  the next glyph in the string. Used for kerning.
         * @param penPosition        the position to Render the glyph
         * @param renderMode         Render mode to display
         * @return                   The distance to advance the pen position after Rendering
         */
        FTPoint Render(const unsigned int characterCode,
                       const unsigned int nextCharacterCode,
                       FTPoint penPosition, int renderMode);

        /**
         * Queries the Font for errors.
         *
         * @return  The current error code.
         */
        FT_Error Error() const { return err; }

    private:
        /**
         * The FTGL face
         */
        FTFace* face;

        /**
         * The Character Map object associated with the current face
         */
        FTCharmap* charMap;

        /**
         * A structure to hold the glyphs
         */
        GlyphVector glyphs;

        /**
         * Current error code. Zero means no error.
         */
        FT_Error err;
};


#endif  //  __FTGlyphContainer__
