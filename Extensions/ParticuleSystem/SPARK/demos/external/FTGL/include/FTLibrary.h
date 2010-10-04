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

#ifndef     __FTLibrary__
#define     __FTLibrary__

#include <ft2build.h>
#include FT_FREETYPE_H
//#include FT_CACHE_H

#include "FTGL/ftgl.h"


/**
 * FTLibrary class is the global accessor for the Freetype library.
 *
 * This class encapsulates the Freetype Library. This is a singleton class
 * and ensures that only one FT_Library is in existence at any one time.
 * All constructors are private therefore clients cannot create or
 * instantiate this class themselves and must access it's methods via the
 * static <code>FTLibrary::Instance()</code> function.
 *
 * Just because this class returns a valid <code>FTLibrary</code> object
 * doesn't mean that the Freetype Library has been successfully initialised.
 * Clients should check for errors. You can initialse the library AND check
 * for errors using the following code...
 * <code>err = FTLibrary::Instance().Error();</code>
 *
 * @see "Freetype 2 Documentation"
 *
 */
class FTLibrary
{
    public:
        /**
         * Global acces point to the single FTLibrary object.
         *
         * @return  The global <code>FTLibrary</code> object.
         */
        static const FTLibrary& Instance();

        /**
         * Gets a pointer to the native Freetype library.
         *
         * @return A handle to a FreeType library instance.
         */
        const FT_Library* const GetLibrary() const { return library; }

        /**
         * Queries the library for errors.
         *
         * @return  The current error code.
         */
        FT_Error Error() const { return err; }

        /**
         * Destructor
         *
         * Disposes of the Freetype library
         */
        ~FTLibrary();

    private:
        /**
         * Default constructors.
         *
         * Made private to stop clients creating there own FTLibrary
         * objects.
         */
        FTLibrary();
        FTLibrary(const FT_Library&){}
        FTLibrary& operator=(const FT_Library&) { return *this; }

        /**
         * Initialises the Freetype library
         *
         * Even though this function indicates success via the return value,
         * clients can't see this so must check the error codes. This function
         * is only ever called by the default c_stor
         *
         * @return  <code>true</code> if the Freetype library was
         *          successfully initialised, <code>false</code>
         *          otherwise.
         */
        bool Initialise();

        /**
         * Freetype library handle.
         */
        FT_Library* library;
//      FTC_Manager* manager;

        /**
         * Current error code. Zero means no error.
         */
        FT_Error err;

};

#endif  //  __FTLibrary__
