// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_SERVER_KERNEL_ABSTRACT_
#ifdef DLIB_SERVER_KERNEL_ABSTRACT_

#include "../threads/threads_kernel_abstract.h"
#include "../sockets/sockets_kernel_abstract.h"
#include <string>


namespace dlib
{
    class server
    {

        /*!
            INITIAL VALUE
                get_listening_ip()           == ""
                get_listening_port()         == 0
                is_running()                 == false
                get_max_connections()        == 1000
                get_graceful_close_timeout() == 500 


            CALLBACK FUNCTIONS
            on_connect():
                To use this object inherit from it and define the pure virtual function
                on_connect.  Inside this function is where you will handle each new
                connection.  Note that the connection object passed to on_connect() should
                NOT be closed, just let the function end and it will be gracefully closed 
                for you.  Also note that each call to on_connect() is run in its own 
                thread.  Also note that on_connect() should NOT throw any exceptions, 
                all exceptions must be dealt with inside on_connect() and cannot be 
                allowed to leave.

            on_listening_port_assigned():
                This function is called to let the client know that the operating
                system has assigned a port number to the listening port.  This
                happens if a port number of zero was given.  Note that this
                function does not need to be defined.  If you don't care then
                don't define it and it will do nothing.  Note also that this function
                is NOT called in its own thread.  Thus, making it block might hang the
                server.

            WHAT THIS OBJECT REPRESENTS
                This object represents a server that listens on a port and spawns new
                threads to handle each new connection.            

                Note that the clear() function does not return until all calls to 
                on_connect() have finished and the start() function has been shutdown.
                Also note that when clear() is called all open connection objects 
                will be shutdown().

                A note about get_max_connections(): when the maximum number of connections
                has been reached accept() will simply not be called until the number of
                open connections drops below get_max_connections().  This means connections
                will just wait to be serviced, rather than being outright refused.

            THREAD SAFETY
                All member functions are thread-safe.
        !*/
        
        public:

            server(
            );
            /*!
                ensures 
                    - #*this is properly initialized
                throws
                    - std::bad_alloc
                    - dlib::thread_error
            !*/

            virtual ~server(
            ); 
            /*!
                requires
                    - is not called from any of server's callbacks
                ensures
                    - all resources associated with *this have been released
            !*/

            void clear(
            );
            /*!
                requires
                    - is not called from any of server's callbacks
                ensures
                    - #*this has its initial value 
                    - all open connection objects passed to on_connect() are shutdown() 
                    - blocks until all calls to on_connect() have finished 
                    - blocks until the start() function has released all its resources
                throws
                    - std::bad_alloc
                        if this exception is thrown then the server object is unusable 
                        until clear() is called and succeeds
            !*/

            void start (
            );
            /*!
                requires
                    - is_running() == false
                ensures
                    - starts listening on the port and ip specified by get_listening_ip()
                      and #get_listening_port() for new connections.
                    - if (get_listening_port() == 0) then
                        - a port to listen on will be automatically selected 
                        - #get_listening_port() == the selected port being used
                    - if (get_listening_ip() == "" ) then
                        - all local IPs will be listened on
                    - blocks until clear() is called or an error occurs  
                throws
                    - dlib::socket_error
                        start() will throw this exception if there is some problem binding
                        ports and/or starting the server or if there is a problem 
                        accepting new connections while it's running. 
                        If this happens then
                            - All open connection objects passed to on_connect() are shutdown()
                              and the exception will not be thrown until all on_connect() calls
                              have terminated.
                            - The server will be cleared and returned to its initial value. 
                    - dlib::thread_error
                        start() will throw this exception if there is a problem 
                        creating new threads.  Or it may throw this exception if there
                        is a problem creating threading objects. 
                        If this happens then
                            - All open connection objects passed to on_connect() are shutdown()
                              and the exception will not be thrown until all on_connect() calls
                              have terminated.
                            - The server will be cleared and returned to its initial value. 
                    - std::bad_alloc
                        start() may throw this exception and if it does then the object 
                        will be unusable until clear() is called and succeeds
            !*/

            void start_async (
            );
            /*!
                ensures
                    - starts listening on the port and ip specified by get_listening_ip()
                      and #get_listening_port() for new connections.  
                    - if (get_listening_port() == 0) then
                        - a port to listen on will be automatically selected 
                        - #get_listening_port() == the selected port being used
                    - if (get_listening_ip() == "" ) then
                        - all local IPs will be listened on
                    - does NOT block.  That is, this function will return right away and
                      the server will run on a background thread until clear() or this
                      object's destructor is called (or until some kind of fatal error
                      occurs).  
                    - if an error occurs in the background thread while the server is
                      running then it will shut itself down, set is_running() to false, and
                      log the error to a dlib::logger object. 
                    - calling start_async() on a running server has no effect.
                throws
                    - dlib::socket_error
                        start_async() will throw this exception if there is some problem binding
                        ports and/or starting the server. 
                        If this happens then
                            - The server will be cleared and returned to its initial value. 
            !*/

            bool is_running ( 
            ) const;
            /*!
                ensures
                    - returns true if start() is running 
                    - returns false if start() is not running or has released all
                      its resources and is about to terminate
                throws
                    - std::bad_alloc
            !*/

            int get_max_connections (
            ) const;
            /*!
                ensures
                    - returns the maximum number of connections the server will accept 
                      at a time.
                    - returns 0 if the server will accept any number of connections
                throws
                    - std::bad_alloc
            !*/


            const std::string get_listening_ip (
            ) const;
            /*!
                ensures
                    - returns the local ip to listen for new connections on 
                    - returns "" if ALL local ips are to be listened on
                throws
                    - std::bad_alloc
            !*/

            int get_listening_port (
            ) const;
            /*!
                ensures
                    - returns the local port number to listen for new connections on 
                    - returns 0 if the local port number has not yet been set
                throws
                    - std::bad_alloc
            !*/

            void set_listening_port (
                int port
            );
            /*!
                requires
                    - port >= 0 
                    - is_running() == false
                ensures
                    - #get_listening_port() == port
                throws
                    - std::bad_alloc
            !*/

            void set_listening_ip (
                const std::string& ip
            );
            /*!
                requires
                    - is_ip_address(ip) == true or ip == ""
                    - is_running() == false
                ensures
                    - #get_listening_ip() == ip                     
                throws
                    - std::bad_alloc
            !*/

            void set_max_connections (
                int max
            );
            /*!
                requires
                    - max >= 0
                ensures
                    - #get_max_connections() == max
                throws
                    - std::bad_alloc
            !*/
    
            void set_graceful_close_timeout (
                unsigned long timeout
            );
            /*!
                ensures
                    - #get_graceful_close_timeout() == timeout
            !*/

            unsigned long get_graceful_close_timeout (
            ) const;
            /*!
                ensures
                    - When on_connect() terminates, it will close the connection using
                      close_gracefully().  This is done so that any data still in the
                      operating system's output buffers gets a chance to be properly
                      transmitted to the remote host.  Part of this involves waiting for
                      the remote host to close their end of the connection.  Therefore,
                      get_graceful_close_timeout() returns the timeout, in milliseconds,
                      that we wait for the remote host to close their end of the
                      connection.  This is the timeout value given to close_gracefully().
            !*/

        private:

            virtual void on_connect (
                connection& new_connection
            )=0;
            /*!
                requires
                    - on_connect() is run in its own thread 
                    - is_running() == true 
                    - the number of current connections < get_max_connection() 
                    - new_connection == the new connection to the server which is
                      to be serviced by this call to on_connect()
                ensures
                    - when new_connection is shutdown() on_connect() will terminate 
                    - this function will not call clear()  
                throws
                    - does not throw any exceptions
            !*/

            // do nothing by default
            virtual void on_listening_port_assigned (
            ) {}
            /*!
                requires
                    - is called if a listening port of zero was specified and
                      an actual port number has just been assigned to the server
                ensures
                    - this function will not block  
                    - this function will not call clear()  
                throws
                    - does not throw any exceptions
            !*/


            // restricted functions
            server(server&);        // copy constructor
            server& operator=(server&);    // assignment operator
    };

}

#endif // DLIB_SERVER_KERNEL_ABSTRACT_

