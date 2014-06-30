// Copyright (C) 2006  Davis E. King (davis@dlib.net)
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

    class invalid_network_address : public dlib::error 
    { 
        /*!
            WHAT THIS OBJECT REPRESENTS
                This is the exception thrown by network_address's constructor if the
                input is invalid.
        !*/
    };

// ----------------------------------------------------------------------------------------

    struct network_address
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object is simply a container for two things:
                    - A host machine address which is either an IP address or DNS name
                      for a machine.
                    - A port number.
            
                Together, these things define a machine and port on that machine.
        !*/

        network_address(
        );
        /*!
            ensures
                - host_address == ""
                - #port == 0
        !*/

        network_address(
            const std::string& full_address
        );
        /*!
            ensures
                - interprets full_address as a network address of the form:
                    host_address:port
                  and assigns each part into #host_address and #port.  For example,
                  network_address("localhost:80") would result in a network_address
                  object where host_address was "localhost" and port was 80.
            throws
                - invalid_network_address
                    This exception is thrown if the full_address string can't be
                    interpreted as a valid network address.
        !*/

        network_address (
            const char* full_address
        );
        /*!
            requires
                - full_address == a valid pointer to a null terminated string
            ensures
                - Invoking this constructor is equivalent to performing 
                  network_address(std::string(full_address))
        !*/

        network_address(
            const std::string& host_address_,
            const unsigned short port_
        );
        /*!
            ensures
                - #host_address == host_address_
                - #port == port_
        !*/
            

        std::string host_address;
        unsigned short port;
    };

    void serialize(
        const network_address& item,
        std::ostream& out
    );
    /*!
        ensures
            - provides serialization support
    !*/

    void deserialize(
        network_address& item,
        std::istream& in 
    );
    /*!
        ensures
            - provides deserialization support
    !*/

    std::ostream& operator<< (
        std::ostream& out,
        const network_address& item
    );
    /*!
        ensures
            - writes the given network_address to the output stream.  The format is the
              host_address, then a colon, then the port number.  So for example:
                cout << network_address("localhost", 80);
              would print:
                localhost:80
            - returns #out 
    !*/

    std::istream& operator>> (
        std::istream& in,
        network_address& item
    );
    /*!
        ensures
            - reads a network_address from the given input stream.  The expected format is
              the same as the one used to print them by the above operator<<() routine. 
            - returns #in
            - if (there is an error reading the network_address) then
                - #in.good() == false
    !*/

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
        const network_address& addr
    );
    /*!
        ensures
            - returns connect(addr.host_address, addr_port);
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
                creating the connection or if timeout milliseconds elapses before the
                connect is successful.
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


