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

#ifndef    __FTCharToGlyphIndexMap__
#define    __FTCharToGlyphIndexMap__

#include <stdlib.h>

#include "FTGL/ftgl.h"

/**
 * Provides a non-STL alternative to the STL map<unsigned long, unsigned long>
 * which maps character codes to glyph indices inside FTCharmap.
 *
 * Implementation:
 *   - NumberOfBuckets buckets are considered.
 *   - Each bucket has BucketSize entries.
 *   - When the glyph index for the character code C has to be stored, the
 *     bucket this character belongs to is found using 'C div BucketSize'.
 *     If this bucket has not been allocated yet, do it now.
 *     The entry in the bucked is found using 'C mod BucketSize'.
 *     If it is set to IndexNotFound, then the glyph entry has not been set.
 *   - Try to mimic the calls made to the STL map API.
 *
 * Caveats:
 *   - The glyph index is now a signed long instead of unsigned long, so
 *     the special value IndexNotFound (= -1) can be used to specify that the
 *     glyph index has not been stored yet.
 */
class FTCharToGlyphIndexMap
{
    public:

        typedef unsigned long CharacterCode;
        typedef signed long GlyphIndex;

        enum
        {
            NumberOfBuckets = 256,
            BucketSize = 256,
            IndexNotFound = -1
        };

        FTCharToGlyphIndexMap()
        {
            this->Indices = 0;
        }

        virtual ~FTCharToGlyphIndexMap()
        {
            if(this->Indices)
            {
                // Free all buckets
                this->clear();

                // Free main structure
                delete [] this->Indices;
                this->Indices = 0;
            }
        }

        void clear()
        {
            if(this->Indices)
            {
                for(int i = 0; i < FTCharToGlyphIndexMap::NumberOfBuckets; i++)
                {
                    if(this->Indices[i])
                    {
                        delete [] this->Indices[i];
                        this->Indices[i] = 0;
                    }
                }
            }
        }

        const GlyphIndex find(CharacterCode c)
        {
            if(!this->Indices)
            {
                return 0;
            }

            // Find position of char code in buckets
            div_t pos = div(c, FTCharToGlyphIndexMap::BucketSize);

            if(!this->Indices[pos.quot])
            {
                return 0;
            }

            const FTCharToGlyphIndexMap::GlyphIndex *ptr = &this->Indices[pos.quot][pos.rem];
            if(*ptr == FTCharToGlyphIndexMap::IndexNotFound)
            {
                return 0;
            }

            return *ptr;
        }

        void insert(CharacterCode c, GlyphIndex g)
        {
            if(!this->Indices)
            {
                this->Indices = new GlyphIndex* [FTCharToGlyphIndexMap::NumberOfBuckets];
                for(int i = 0; i < FTCharToGlyphIndexMap::NumberOfBuckets; i++)
                {
                    this->Indices[i] = 0;
                }
            }

            // Find position of char code in buckets
            div_t pos = div(c, FTCharToGlyphIndexMap::BucketSize);

            // Allocate bucket if does not exist yet
            if(!this->Indices[pos.quot])
            {
                this->Indices[pos.quot] = new GlyphIndex [FTCharToGlyphIndexMap::BucketSize];
                for(int i = 0; i < FTCharToGlyphIndexMap::BucketSize; i++)
                {
                    this->Indices[pos.quot][i] = FTCharToGlyphIndexMap::IndexNotFound;
                }
            }

            this->Indices[pos.quot][pos.rem] = g;
        }

    private:
        GlyphIndex** Indices;
};


#endif  //  __FTCharToGlyphIndexMap__
