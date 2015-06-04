// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_SOCKETS_KERNEl_ABSTRACT_
#ifdef DLIB_SOCKETS_KERNEl_ABSTRACT_

#include <string>
#include "../threads.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    /*!
        GENERAL COMMENTS:
            Nothing in here will throw exceptions.   
            
            All ip address strings in this file refer to IPv4 addresses.  For 
            example "192.168.1.1"

            Timeouts:
                All timeout values are measured in milliseconds but you are not 
                guaranteed to have that level of resolution.  The actual resolution
                is implementation defined.

            GENERAL WARNING
                Don't call any of these functions or make any of these objects 
                before main() has been entered.  

        EXCEPTIONS
            Unless specified otherwise, nothing in this file throws exceptions.
    !*/

// ----------------------------------------------------------------------------------------

    // LOOKUP FUNCTIONS

    // all lookup functions are thread-safe

    int get_local_hostname (
        std::string& hostname
    );
    /*!
        ensures
            - if (#get_local_hostname() == 0) then
                - #hostname == a string containing the hostname of the local computer 

            - returns 0 upon success
            - returns OTHER_ERROR upon failure and in this case #hostname's value 
              is undefined
    !*/ 

// -----------------

    int hostname_to_ip (
        const std::string& hostname,
        std::string& ip,
        int n = 0
    );
    /*!
        requires
            - n >= 0
        ensures
            - if (#hostname_to_ip() == 0) then
                - #ip == string containing the nth ip address associated with the hostname

            - returns 0 upon success 
            - returns OTHER_ERROR upon failure  
    !*/

// -----------------

    int ip_to_hostname (
        const std::string& ip,
        std::string& hostname
    );
    /*!
        ensures
            - if (#ip_to_hostname() == 0) then
                - #hostname == string containing the hostname associated with ip

            - returns 0 upon success 
            - returns OTHER_ERROR upon failure 
    !*/

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    //
    // socket creation functions
    // 
    // The following functions are guaranteed to be thread-safe
    //
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------    

    int create_listener (
        listener*& new_listener,
        unsigned short port,
        const std::string& ip = ""
    );
    /*!
        requires
            - 0 <= port <= 65535
        ensures
            - if (#create_listener() == 0) then
                - #new_listener == a pointer to a listener object that is listening on 
                  the specified port and ip for an incoming connection 
                - if (ip == "") then 
                    - the new listener will be listening on all interfaces 
                - if (port == 0) then 
                    - the operating system will assign a free port to listen on 


            - returns 0 if create_listener was successful 
            - returns PORTINUSE if the specified local port was already in use 
            - returns OTHER_ERROR if some other error occurred
    !*/

    int create_listener (
        scoped_ptr<listener>& new_listener,
        unsigned short port,
        const std::string& ip = ""
    );
    /*!
        This function is just an overload of the above function but it gives you a
        scoped_ptr smart pointer instead of a C pointer.
    !*/

    int create_connection ( 
        connection*& new_connection,
        unsigned short foreign_port, 
        const std::string& foreign_ip, 
        unsigned short local_port = 0,
        const std::string& local_ip = ""
    );
    /*!
        requires
            - 0 <  foreign_port <= 65535 
            - 0 <= local_port   <= 65535
        ensures
            - if (#create_connection() == 0) then
                - #new_connection  == a pointer to a connection object that is connected 
                  to foreign_ip on port foreign_port and is using the local interface 
                  local_ip and local port local_port
                - #new_connection->user_data == 0
                - if (local_ip == "") then 
                    - the operating system will chose this for you
                - if (local_port == 0) then 
                    - the operating system will chose this for you

            - returns 0 if create_connection was successful 
            - returns PORTINUSE if the specified local port was already in use 
            - returns OTHER_ERROR if some other error occurred
        !*/

    int create_connection ( 
        scoped_ptr<connection>& new_connection,
        unsigned short foreign_port, 
        const std::string& foreign_ip, 
        unsigned short local_port = 0,
        const std::string& local_ip = ""
    );
    /*!
        This function is just an overload of the above function but it gives you a
        scoped_ptr smart pointer instead of a C pointer.
    !*/

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // connection object
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    class connection
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object represents a TCP connection.

                Instances of this class can only be created by using the 
                create_connection function or listener class defined below.

                NOTE:  
                    A connection object must ALWAYS be closed (delete the pointer to the 
                    connection) or it will cause a resource leak.  

                    Note also that all errors indicated by a return code of OTHER_ERROR
                    are fatal so if one occurs the connection should just be closed.

            CLOSING A CONNECTION
                Note that if ~connection() or shutdown() is called before the remote client 
                has received all sent data it is possible that the data will be lost.  To 
                avoid this you should call the close_gracefully() function to close your 
                connections (unless you actually do want to immediately dispose of a 
                connection and don't care about the data).
                (example: close_gracefully(con); // close con gracefully but force it closed
                                                   // if it takes more than 500 milliseconds.)

            THREAD SAFETY
                - It is always safe to call shutdown() or shutdown_outgoing().   
                - you may NOT call any function more than once at a time (except the 
                  shutdown functions).
                - do not call read() more than once at a time
                - do not call write() more than once at a time
                - You can safely call shutdown or shutdown_outgoing in conjunction with 
                  the read/write functions.
                    This is helpful if you want to unblock another thread that is 
                    blocking on a read/write operation.  Shutting down the connection 
                    will cause the read/write functions to return a value of SHUTDOWN.

            OUT-OF-BAND DATA:
                All out-of-band data will be put inline into the normal data stream.
                This means that you can read any out-of-band data via calls to read(). 
                (i.e. the SO_OOBINLINE socket option will be set) 
        !*/

    public:

        ~connection (
        );
        /*!
            requires
                - no other threads are using this connection object 
            ensures
                - closes the connection (this is an abrupt non-graceful close) 
                - frees the resources used by this object
        !*/

        void* user_data;
        /*!
            This pointer is provided so that the client programmer may easily associate
            some data with a connection object.  You can really do whatever you want
            with it.  Initially user_data is 0.
        !*/

        long write (
            const char* buf, 
            long num
        );
        /*!
            requires
                - num > 0 
                - buf points to an array of at least num bytes
            ensures
                - will block until ONE of the following occurs:
                    - num bytes from buf have been written to the connection 
                    - an error has occurred
                    - the outgoing channel of the connection has been shutdown locally

                - returns num if write succeeded 
                - returns OTHER_ERROR if there was an error (this could be due to a 
                  connection close)
                - returns SHUTDOWN if the outgoing channel of the connection has been 
                  shutdown locally
        !*/

        long read (
            char* buf, 
            long num
        );
        /*!
            requires
                - num > 0 
                - buf points to an array of at least num bytes
            ensures
                - read() will not read more than num bytes of data into #buf 
                - read blocks until ONE of the following happens:
                    - there is some data available and it has been written into #buf 
                    - the remote end of the connection is closed 
                    - an error has occurred
                    - the connection has been shutdown locally

                - returns the number of bytes read into #buf if there was any data.
                - returns 0 if the connection has ended/terminated and there is no more data.
                - returns OTHER_ERROR if there was an error.
                - returns SHUTDOWN if the connection has been shutdown locally
        !*/

        long read (
            char* buf, 
            long num,
            unsigned long timeout 
        );
        /*!
            requires
                - num > 0 
                - buf points to an array of at least num bytes
                - timeout < 2000000                
            ensures
                - read() will not read more than num bytes of data into #buf 
                - if (timeout > 0) then read() blocks until ONE of the following happens:
                    - there is some data available and it has been written into #buf 
                    - the remote end of the connection is closed 
                    - an error has occurred
                    - the connection has been shutdown locally
                    - timeout milliseconds has elapsed
                - else
                    - read() does not block

                - returns the number of bytes read into #buf if there was any data.
                - returns 0 if the connection has ended/terminated and there is no more data.
                - returns TIMEOUT if timeout milliseconds elapsed before we got any data.
                - returns OTHER_ERROR if there was an error.
                - returns SHUTDOWN if the connection has been shutdown locally
        !*/

        unsigned short get_local_port (
        ) const;
        /*!
            ensures
                - returns the local port number for this connection
        !*/

        unsigned short get_foreign_port ( 
        ) const;
        /*!
            ensures
                - returns the foreign port number for this connection
        !*/

        const std::string& get_local_ip (
        ) const;
        /*!
            ensures
                - returns the IP of the local interface this connection is using
        !*/

        const std::string& get_foreign_ip (
        ) const;
        /*!
            ensures
                - returns the IP of the foreign host for this connection
        !*/

        int shutdown (
        );
        /*!
            ensures
                - if (#shutdown() == 0 && connection was still open) then
                    - terminates the connection but does not free the resources for the 
                      connection object 

                - any read() or write() calls on this connection will return immediately 
                  with the code SHUTDOWN.

                - returns 0 upon success 
                - returns OTHER_ERROR if there was an error
        !*/        

        int shutdown_outgoing (
        );
        /*!
            ensures
                - if (#shutdown_outgoing() == 0 && outgoing channel was still open) then
                    - sends a FIN to indicate that no more data will be sent on this 
                      connection but leaves the receive half of the connection open to 
                      receive more data from the other host 

                - any calls to write() will return immediately with the code SHUTDOWN.

                - returns 0 upon success 
                - returns OTHER_ERROR if there was an error 
        !*/

        int disable_nagle(
        );
        /*!
            ensures
                - Sets the TCP_NODELAY socket option to disable Nagle's algorithm.
                  This can sometimes reduce transmission latency, however, in almost
                  all normal cases you don't want to mess with this as the default
                  setting is usually appropriate.  

                - returns 0 upon success
                - returns OTHER_ERROR if there was an error 
        !*/

        typedef platform_specific_type socket_descriptor_type;
        socket_descriptor_type get_socket_descriptor (
        ) const;
        /*!
            ensures
                - returns the underlying socket descriptor for this connection
                  object.  The reason you might want access to this is to 
                  pass it to some other library that requires a socket file 
                  descriptor.  However, if you do this then you probably shouldn't 
                  use the dlib::connection read() and write() anymore since
                  whatever you are doing with the socket descriptor is probably 
                  doing I/O with the socket.
        !*/

    private:
        // restricted functions
        connection();
        connection(connection&);        // copy constructor
        connection& operator=(connection&);    // assignment operator

    }; 

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // listener object
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    class listener
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object represents a TCP socket waiting for incoming connections.
                Calling accept returns a pointer to any new incoming connections on its
                port.

                Instances of this class can only be created by using the 
                create_listener function defined below.

                NOTE:  
                    A listener object must ALWAYS be closed (delete the pointer to it) or 
                    it will cause a resource leak.  

                    Note also that all errors indicated by a return code of OTHER_ERROR
                    are fatal so if one occurs the listener should be closed.

            THREAD SAFETY
                None of the functions in this object are guaranteed to be thread-safe.
                This means that you must serialize all access to this object.
        !*/

    public:

        ~listener (
        );
        /*!
            requires
                - no other threads are using this listener object 
            ensures
                - closes the listener 
                - frees the resources used by this object
        !*/

        int accept (
            connection*& new_connection,
            unsigned long timeout = 0
        );
        /*!
            requires
                - timeout < 2000000                
            ensures
                - blocks until a new connection is ready or timeout milliseconds have 
                  elapsed.
                - #new_connection == a pointer to the new connection object 
                - #new_connection->user_data == 0
                - if (timeout == 0) then 
                    - the timeout argument is ignored

                - returns 0 if accept() was successful                
                - returns TIMEOUT if timeout milliseconds have elapsed 
                - returns OTHER_ERROR if an error has occurred 
        !*/

        int accept (
            scoped_ptr<connection>& new_connection,
            unsigned long timeout = 0
        );
        /*!
            This function is just an overload of the above function but it gives you a
            scoped_ptr smart pointer instead of a C pointer.
        !*/

        unsigned short get_listening_port (
        ) const;
        /*!
            ensures
                - returns the port number that this object is listening on
        !*/

        const std::string& get_listening_ip (
        ) const;
        /*!
            ensures
                - returns a string containing the IP (e.g. "127.0.0.1") of the 
                  interface this object is listening on 
                - returns "" if it is accepting connections on all interfaces
        !*/

    private:
        // restricted functions
        listener();
        listener(listener&);        // copy constructor
        listener& operator=(listener&);    // assignment operator
    };
}

#endif // DLIB_SOCKETS_KERNEl_ABSTRACT_

