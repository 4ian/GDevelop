// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_SOCKSTrEAMBUF_UNBUFFERED_Hh_
#define DLIB_SOCKSTrEAMBUF_UNBUFFERED_Hh_

#include <iosfwd>
#include <streambuf>
#include "../sockets.h"
#include "sockstreambuf_abstract.h"

namespace dlib
{

// ---------------------------------------------------------------------------------------- 

    class sockstreambuf_unbuffered : public std::streambuf
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This is an implementation of the interface defined in
                sockstreambuf_abstract.h except that it doesn't do any kind of buffering at
                all.  It just writes data directly to a connection.  However, note that we
                don't implement the flushes_output_on_read() routine as this object always
                flushes immediately (since it isn't buffers.  Moreover, it should be
                pointed out that this object is deprecated and only present for backwards
                compatibility with previous versions of dlib.  So you really should use the
                sockstreambuf object instead.  

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


        sockstreambuf_unbuffered (
            connection* con_
        ) :
            con(*con_),
            peek(EOF),
            lastread_next(false)
        {}

        sockstreambuf_unbuffered (
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
#include "sockstreambuf_unbuffered.cpp"
#endif

#endif // DLIB_SOCKSTrEAMBUF_UNBUFFERED_Hh_

