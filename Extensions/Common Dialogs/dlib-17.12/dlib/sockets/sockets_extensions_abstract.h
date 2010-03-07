// Copyright (C) 2006  Davis E. King (davisking@users.sourceforge.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_SOCKETS_EXTENSIONs_ABSTRACT_
#ifdef DLIB_SOCKETS_EXTENSIONs_ABSTRACT_

#include <string>
#include "sockets_kernel_abstract.h"
#include "../smart_pointers.h"
#include "../error.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    connection* connect (
        const std::string& host_or_ip,
        unsigned short port
    );
    /*!
        ensures
            - returns a connection object that is connected to the given host at the 
              given port
        throws
            - dlib::socket_error
              This exception is thrown if there is some problem that prevents us from
              creating the connection
            - std::bad_alloc
    !*/

// ----------------------------------------------------------------------------------------

    connection* connect (
        const std::string& host_or_ip,
        unsigned short port,
        unsigned long timeout
    );
    /*!
        ensures
            - returns a connection object that is connected to the given host at the 
              given port.  
            - blocks for at most timeout milliseconds
        throws
            - dlib::socket_error
              This exception is thrown if there is some problem that prevents us from
              creating the connection or if timeout milliseconds elapses before
              the connect is successful.
            - std::bad_alloc
    !*/

// ----------------------------------------------------------------------------------------


    bool is_ip_address (
        std::string ip
    );
    /*!
        ensures
            - if (ip is a valid ip address) then
                - returns true
            - else
                - returns false
    !*/

// ----------------------------------------------------------------------------------------

    void close_gracefully (
        connection* con,
        unsigned long timeout = 500
    );
    /*!
        requires
            - con == a valid pointer to a connection object
        ensures
            - performs a graceful close of the given connection and if it takes longer than
              timeout milliseconds to complete then forces the connection closed. 
                - Specifically, a graceful close means that the outgoing part of con is
                  closed (a FIN is sent) and then we wait for the other end to to close their 
                  end of the connection.  This way any data still on its way to the other
                  end of the connection will be received properly.
            - this function will block until the graceful close is completed or we timeout.
            - calls "delete con;".  Thus con is no longer a valid pointer after this function
              has finished.
        throws
            - std::bad_alloc or dlib::thread_error
              If either of these exceptions are thrown con will still be closed via
              "delete con;" 
    !*/

// ----------------------------------------------------------------------------------------

    void close_gracefully (
        scoped_ptr<connection>& con,
        unsigned long timeout = 500
    );
    /*!
        requires
            - con == a valid pointer to a connection object
        ensures
            - performs a graceful close of the given connection and if it takes longer than
              timeout milliseconds to complete then forces the connection closed. 
                - Specifically, a graceful close means that the outgoing part of con is
                  closed (a FIN is sent) and then we wait for the other end to to close their 
                  end of the connection.  This way any data still on its way to the other
                  end of the connection will be received properly.
            - this function will block until the graceful close is completed or we timeout.
            - #con.get() == 0.  Thus con is no longer a valid pointer after this function
              has finished.
        throws
            - std::bad_alloc or dlib::thread_error
              If either of these exceptions are thrown con will still be closed and
              deleted (i.e. #con.get() == 0).
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_SOCKETS_EXTENSIONs_ABSTRACT_


