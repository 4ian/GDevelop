// Copyright (C) 2012  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_IOSOCKSTrEAM_ABSTRACT_Hh_
#ifdef DLIB_IOSOCKSTrEAM_ABSTRACT_Hh_

#include "../sockstreambuf/sockstreambuf_abstract.h"

#include <iostream>

namespace dlib
{

// ---------------------------------------------------------------------------------------- 

    class iosockstream : public std::iostream
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This is an iostream object that reads/writes from a TCP network connection.

                Note that any attempt to read from this stream will automatically flush the
                stream's output buffers.  

            THREAD SAFETY
                It is not safe for multiple threads to make concurrent accesses to the same
                instance of this object (except for calls to shutdown() which are always
                threadsafe).  Therefore, you should mutex lock an instance of this object
                if you need to touch it from multiple threads. 
        !*/

    public:

        iosockstream(
        );
        /*!
            ensures
                - #good() == false
        !*/

        iosockstream( 
            const network_address& addr
        );
        /*!
            ensures
                - Attempts to connect to the given network address. 
                - Calling this constructor is equivalent to calling the default constructor
                  and then invoking open(addr).
                - #good() == true 
            throws
                - dlib::socket_error
                    This exception is thrown if there is some problem that prevents us from
                    creating the connection.  
        !*/

        iosockstream( 
            const network_address& addr,
            unsigned long timeout
        ); 
        /*!
            ensures
                - Attempts to connect to the given network address. 
                - Calling this constructor is equivalent to calling the default constructor
                  and then invoking open(addr, timeout).
                - #good() == true 
            throws
                - dlib::socket_error
                    This exception is thrown if there is some problem that prevents us from
                    creating the connection or if timeout milliseconds elapses before the
                    connect is successful.
        !*/

        ~iosockstream(
        );
        /*!
            ensures
                - Invokes close() before destructing the stream.  Therefore, any open
                  connection will be gracefully closed using the default timeout time.
                  This also means any data in the stream will be flushed to the connection.
        !*/

        void open (
            const network_address& addr
        );
        /*!
            ensures
                - This object will attempt to create a TCP connection with the remote host
                  indicated by addr.  
                - Any previous connection in this iosockstream is closed by calling close()
                  before we make any new connection.
                - #good() == true
                  (i.e. the error flags are reset by calling open())
            throws
                - dlib::socket_error
                    This exception is thrown if there is some problem that prevents us from
                    creating the connection.  
        !*/

        void open (
            const network_address& addr,
            unsigned long timeout 
        );
        /*!
            ensures
                - This object will attempt to create a TCP connection with the remote host
                  indicated by addr.  
                - Any previous connection in this iosockstream is closed by calling close()
                  before we make any new connection.
                - #good() == true
                  (i.e. the error flags are reset by calling open())
            throws
                - dlib::socket_error
                    This exception is thrown if there is some problem that prevents us from
                    creating the connection or if timeout milliseconds elapses before the
                    connect is successful.
        !*/

        void close(
            unsigned long timeout = 10000
        );
        /*!
            ensures
                - #good() == false 
                - if (there is an active TCP connection) then
                    - Flushes any data buffered in the output part of the stream
                      to the connection.  
                    - Performs a proper graceful close (i.e. like dlib::close_gracefully()).
                    - Will only wait timeout milliseconds for the buffer flush and graceful
                      close to finish before the connection is terminated forcefully.
                      Therefore, close() will only block for at most timeout milliseconds.
        !*/

        void terminate_connection_after_timeout (
            unsigned long timeout
        );
        /*!
            ensures
                - if (there is an active TCP connection) then
                    - Any operations on this TCP connection will return error or
                      end-of-file once timeout milliseconds have elapsed from this call to
                      terminate_connection_after_timeout().  This is true unless another
                      call to terminate_connection_after_timeout() is made which gives a
                      new time.  In this case, the previous call is forgotten and the
                      timeout is reset.
                    - This timeout only applies to the current TCP connection.  That is, if
                      the iosockstream is closed and a new connection is established, any
                      previous timeouts setup by terminate_connection_after_timeout() do
                      not apply. 
                - else
                    - This function has no effect on this object.
        !*/

        void shutdown (
        );
        /*!
            ensures
                - Immediately closes the TCP connection and causes all I/O operations on
                  this object to return an error.  
                - It is safe to call this function from any thread, therefore, you can use
                  it to signal when you want a connection to terminate from another thread.
        !*/
    };

// ---------------------------------------------------------------------------------------- 

}


#endif // DLIB_IOSOCKSTrEAM_ABSTRACT_Hh_



