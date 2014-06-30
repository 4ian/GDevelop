// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_SOCKSTREAMBUF_KERNEl_ABSTRACT_
#ifdef DLIB_SOCKSTREAMBUF_KERNEl_ABSTRACT_

#include <iosfwd>
#include <streambuf>
#include "../sockets/sockets_kernel_abstract.h"

namespace dlib
{

// ---------------------------------------------------------------------------------------- 

    class sockstreambuf : public std::streambuf
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object represents a stream buffer capable of writing to and
                reading from TCP connections.

            NOTE:
                For a sockstreambuf EOF is when the connection has closed or otherwise
                returned some kind of error.

                Also note that any data written to the streambuf may be buffered 
                internally.  So if you need to ensure that data is actually sent then you 
                should flush the stream.  

                A read operation is guaranteed to block until the number of bytes
                requested has arrived on the connection.  It will never keep blocking
                once enough data has arrived.

            THREADING
                generally speaking, this object has the same kind of threading
                restrictions as a connection object.  those being:
                - do not try to write to a sockstreambuf from more than one thread
                - do not try to read from a sockstreambuf from more than one thread
                - you may call shutdown() on the connection object and this will
                  cause any reading or writing calls to end.  To the sockstreambuf it
                  will appear the same as hitting EOF.  (note that EOF for a sockstreambuf
                  means that the connection has closed)
                - it is safe to read from and write to the sockstreambuf at the same time
                - it is not safe to try to putback a char and read from the stream from
                  different threads
        !*/
    public:
        sockstreambuf (
            connection* con
        );
        /*!
            requires
                - con == a valid connection object
            ensures
                - *this will read from and write to con
            throws
                - std::bad_alloc
        !*/

        sockstreambuf (
            const scoped_ptr<connection>& con
        );
        /*!
            requires
                - con == a valid connection object
            ensures
                - *this will read from and write to con
            throws
                - std::bad_alloc
        !*/

        ~sockstreambuf (
        );
        /*!
            requires
                - get_connection() object has not been deleted
            ensures
                - sockstream buffer is destructed but the connection object will 
                  NOT be closed.  
                - Any buffered data is flushed to the connection. 
        !*/

        connection* get_connection (
        );
        /*!
            ensures
                - returns a pointer to the connection object which this buffer
                  reads from and writes to
        !*/

    };

// ---------------------------------------------------------------------------------------- 

}

#endif // DLIB_SOCKSTREAMBUF_KERNEl_ABSTRACT_

