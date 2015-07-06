// Copyright (C) 2006  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_SERVER_IOSTREAm_ABSTRACT_
#ifdef DLIB_SERVER_IOSTREAm_ABSTRACT_


#include "server_kernel_abstract.h"
#include <iostream>
#include <string>
#include "../uintn.h"

namespace dlib
{

    class server_iostream : public server 
    {

        /*!
            WHAT THIS EXTENSION DOES FOR server 
                This extension redefines the on_connect() function so that
                instead of giving you a connection object you get an istream 
                and ostream object.

            THREAD SAFETY
                Note that in on_connect() the input stream in is tied to the output stream 
                out.  This means that when you read from in it will modify out and thus 
                it is not safe to touch in and out concurrently from different threads 
                unless you untie them (which you do by saying in.tie(0);)
        !*/

    protected:

        void shutdown_connection (
            uint64 id
        );
        /*!
            ensures
                - if (there is a connection currently being serviced with the given id) then
                    - the specified connection is shutdown. (i.e. connection::shutdown() is
                      called on it so the iostreams operating on it will return EOF)
        !*/

    private:

        virtual void on_connect (
            std::istream& in,
            std::ostream& out,
            const std::string& foreign_ip,
            const std::string& local_ip,
            unsigned short foreign_port,
            unsigned short local_port,
            uint64 connection_id
        )=0;
        /*!
            requires
                - on_connect() is called when there is a new TCP connection that needs
                  to be serviced.
                - in == the input stream that reads data from the new connection
                - out == the output stream that writes data to the new connection
                - in.tie() == &out (i.e. when you read from in it automatically calls out.flush())
                - foreign_ip == the foreign ip address for this connection 
                - foreign_port == the foreign port number for this connection 
                - local_ip == the IP of the local interface this connection is using
                - local_port == the local port number for this connection
                - on_connect() is run in its own thread 
                - is_running() == true 
                - the number of current connections < get_max_connection() 
                - connection_id == an integer that uniquely identifies this connection. 
                  It can be used by shutdown_connection() to terminate this connection.
            ensures
                - when the iostreams hit EOF on_connect() will terminate.  
                  (because this is how clear() signals you the server is shutting down)
                - this function will not call clear()  
            throws
                - does not throw any exceptions
        !*/

    };

}

#endif // DLIB_SERVER_IOSTREAm_ABSTRACT_ 


