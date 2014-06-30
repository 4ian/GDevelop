// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_SOCKSTREAMBUF_KERNEl_1_
#define DLIB_SOCKSTREAMBUF_KERNEl_1_

#include <iosfwd>
#include <streambuf>
#include "../sockets.h"
#include "sockstreambuf_kernel_abstract.h"

namespace dlib
{

// ---------------------------------------------------------------------------------------- 

    class sockstreambuf_kernel_1 : public std::streambuf
    {
        /*!
            INITIAL VALUE
                con == a connection
                lastread_next == false
                peek == EOF

            CONVENTION
                if (peek != EOF) then
                    peek == the last character read from the connection object and
                            is used to store the char in the event the user peeks by
                            calling sgetc()
                if (lastread != EOF) then
                    lastread == the last character read and consumed by the user

                if (lastread_next) then
                    the next character to be returned to the user is lastread because
                    the user put it back into the buffer

        !*/

    public:
        sockstreambuf_kernel_1 (
            connection* con_
        ) :
            con(*con_),
            peek(EOF),
            lastread_next(false)
        {}

        sockstreambuf_kernel_1 (
            const scoped_ptr<connection>& con_
        ) :
            con(*con_),
            peek(EOF),
            lastread_next(false)
        {}

        connection* get_connection (
        ) { return &con; }


    protected:

        // output functions
        int_type overflow (
            int_type c
        );

        std::streamsize xsputn (
            const char* s,
            std::streamsize num
        );

        // input functions
        int_type underflow( 
        );

        int_type uflow( 
        );

        int_type pbackfail(
            int_type c
        );

        std::streamsize xsgetn (
            char_type* s, 
            std::streamsize n
        );

    private:

        // member data
        connection&  con;
        int_type peek;
        int_type lastread;
        bool lastread_next;
    
    };

// ---------------------------------------------------------------------------------------- 

}

#ifdef NO_MAKEFILE
#include "sockstreambuf_kernel_1.cpp"
#endif

#endif // DLIB_SOCKSTREAMBUF_KERNEl_1_

