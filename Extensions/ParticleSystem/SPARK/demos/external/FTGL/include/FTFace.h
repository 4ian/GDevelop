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

#ifndef     __FTFace__
#define     __FTFace__

#include <ft2build.h>
#include FT_FREETYPE_H
#include FT_GLYPH_H

#include "FTGL/ftgl.h"

#include "FTSize.h"

/**
 * FTFace class provides an abstraction layer for the Freetype Face.
 *
 * @see "Freetype 2 Documentation"
 *
 */
class FTFace
{
    public:
        /**
         * Opens and reads a face file. Error is set.
         *
         * @param fontFilePath  font file path.
         */
        FTFace(const char* fontFilePath, bool precomputeKerning = true);

        /**
         * Read face data from an in-memory buffer. Error is set.
         *
         * @param pBufferBytes  the in-memory buffer
         * @param bufferSizeInBytes  the length of the buffer in bytes
         */
        FTFace(const unsigned char *pBufferBytes, size_t bufferSizeInBytes,
               bool precomputeKerning = true);

        /**
         * Destructor
         *
         * Disposes of the current Freetype Face.
         */
        virtual ~FTFace();

        /**
         * Attach auxilliary file to font (e.g., font metrics).
         *
         * @param fontFilePath  auxilliary font file path.
         * @return          <code>true</code> if file has opened
         *                  successfully.
         */
        bool Attach(const char* fontFilePath);

        /**
         * Attach auxilliary data to font (e.g., font metrics) from memory
         *
         * @param pBufferBytes  the in-memory buffer
         * @param bufferSizeInBytes  the length of the buffer in bytes
         * @return          <code>true</code> if file has opened
         *                  successfully.
         */
        bool Attach(const unsigned char *pBufferBytes,
                    size_t bufferSizeInBytes);

        /**
         * Get the freetype face object..
         *
         * @return pointer to an FT_Face.
         */
        FT_Face* Face() const { return ftFace; }

        /**
         * Sets the char size for the current face.
         *
         * This doesn't guarantee that the size was set correctly. Clients
         * should check errors.
         *
         * @param size      the face size in points (1/72 inch)
         * @param res       the resolution of the target device.
         * @return          <code>FTSize</code> object
         */
        const FTSize& Size(const unsigned int size, const unsigned int res);

        /**
         * Get the number of character maps in this face.
         *
         * @return character map count.
         */
        unsigned int CharMapCount() const;

        /**
         * Get a list of character maps in this face.
         *
         * @return pointer to the first encoding.
         */
        FT_Encoding* CharMapList();

        /**
         * Gets the kerning vector between two glyphs
         */
        FTPoint KernAdvance(unsigned int index1, unsigned int index2);

        /**
         * Loads and creates a Freetype glyph.
         */
        FT_GlyphSlot Glyph(unsigned int index, FT_Int load_flags);

        /**
         * Gets the number of glyphs in the current face.
         */
        unsigned int GlyphCount() const { return numGlyphs; }

        /**
         * Queries for errors.
         *
         * @return  The current error code.
         */
        FT_Error Error() const { return err; }

    private:
        /**
         * The Freetype face
         */
        FT_Face* ftFace;

        /**
         * The size object associated with this face
         */
        FTSize  charSize;

        /**
         * The number of glyphs in this face
         */
        int numGlyphs;

        FT_Encoding* fontEncodingList;

        /**
         * This face has kerning tables
         */
        bool hasKerningTable;

        /**
         * If this face has kerning tables, we can cache them.
         */
        void BuildKerningCache();
        static const unsigned int MAX_PRECOMPUTED = 128;
        float *kerningCache;

        /**
         * Current error code. Zero means no error.
         */
        FT_Error err;
};


#endif  //  __FTFace__
