// Copyright (C) 2006  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_BASE64_KERNEl_1_
#define DLIB_BASE64_KERNEl_1_

#include "../algs.h"
#include "base64_kernel_abstract.h"
#include <iosfwd>

namespace dlib
{

    class base64 
    {
        /*!
            INITIAL VALUE
                - bad_value == 100
                - encode_table == a pointer to an array of 64 chars
                - where x is a 6 bit value the following is true:
                    - encode_table[x] == the base64 encoding of x
                - decode_table == a pointer to an array of UCHAR_MAX chars
                - where x is any char value:
                    - if (x is a valid character in the base64 coding scheme) then
                        - decode_table[x] == the 6 bit value that x encodes
                    - else
                        - decode_table[x] == bad_value 

            CONVENTION
                - The state of this object never changes so just refer to its
                  initial value.
                  

        !*/

    public:
        // this is here for backwards compatibility with older versions of dlib.
        typedef base64 kernel_1a;

        class decode_error : public dlib::error { public:
        decode_error( const std::string& e) : error(e) {}};

        base64 (
        );

        virtual ~base64 (
        );

        enum line_ending_type
        {
            CR,  // i.e. "\r"
            LF,  // i.e. "\n"
            CRLF // i.e. "\r\n"
        };

        line_ending_type line_ending (
        ) const;

        void set_line_ending (
            line_ending_type eol_style_
        );

        void encode (
            std::istream& in,
            std::ostream& out
        ) const;

        void decode (
            std::istream& in,
            std::ostream& out
        ) const;

    private:

        char* encode_table;
        unsigned char* decode_table;
        const unsigned char bad_value;
        line_ending_type eol_style;

        // restricted functions
        base64(base64&);        // copy constructor
        base64& operator=(base64&);    // assignment operator

    };   
   
}

#ifdef NO_MAKEFILE
#include "base64_kernel_1.cpp"
#endif

#endif // DLIB_BASE64_KERNEl_1_

