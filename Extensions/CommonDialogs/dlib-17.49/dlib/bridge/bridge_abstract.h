// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_BRIDGe_ABSTRACT_
#ifdef DLIB_BRIDGe_ABSTRACT_

#include <string>
#include "../pipe/pipe_kernel_abstract.h"

namespace dlib
{

// ---------------------------------------------------------------------------------------- 

    struct connect_to_ip_and_port
    {
        connect_to_ip_and_port (
            const std::string& ip,
            unsigned short port
        );
        /*!
            requires
                - is_ip_address(ip) == true
                - port != 0
            ensures
                - this object will represent a request to make a TCP connection
                  to the given IP address and port number.
        !*/
    };

    connect_to_ip_and_port connect_to (
        const network_address& addr
    );
    /*!
        requires
            - addr.port != 0
        ensures
            - converts the given network_address object into a connect_to_ip_and_port
              object.
    !*/

    struct listen_on_port
    {
        listen_on_port(
            unsigned short port
        );
        /*!
            requires
                - port != 0
            ensures
                - this object will represent a request to listen on the given
                  port number for incoming TCP connections.
        !*/
    };

    template <
        typename pipe_type
        >
    bridge_transmit_decoration<pipe_type> transmit ( 
        pipe_type& p
    ); 
    /*!
        requires
            - pipe_type is some kind of dlib::pipe object
            - the objects in the pipe must be serializable
        ensures
            - Adds a type decoration to the given pipe, marking it as a transmit pipe, and 
              then returns it.  
    !*/

    template <
        typename pipe_type
        >
    bridge_receive_decoration<pipe_type> receive ( 
        pipe_type& p
    );
    /*!
        requires
            - pipe_type is some kind of dlib::pipe object
            - the objects in the pipe must be serializable
        ensures
            - Adds a type decoration to the given pipe, marking it as a receive pipe, and 
              then returns it.  
    !*/

// ----------------------------------------------------------------------------------------

    struct bridge_status
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This simple struct represents the state of a bridge object.  A
                bridge is either connected or not.  If it is connected then it
                is connected to a foreign host with an IP address and port number
                as indicated by this object.
        !*/
        
        bridge_status(
        ); 
        /*!
            ensures
                - #is_connected == false
                - #foreign_port == 0
                - #foreign_ip == ""
        !*/

        bool is_connected;
        unsigned short foreign_port;
        std::string foreign_ip;
    };

// ---------------------------------------------------------------------------------------- 

    class bridge : noncopyable
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object is a tool for bridging a dlib::pipe object between
                two network connected applications.  


                Note also that this object contains a dlib::logger object
                which will log various events taking place inside a bridge.
                If you want to see these log messages then enable the logger
                named "dlib.bridge".

            
            BRIDGE PROTOCOL DETAILS
                The bridge object creates a single TCP connection between
                two applications.  Whenever it sends an object from a pipe
                over a TCP connection it sends a byte with the value 1 followed 
                immediately by the serialized copy of the object from the pipe. 
                The serialization is performed by calling the global serialize()
                function.  

                Additionally, a bridge object will periodically send bytes with
                a value of 0 to ensure the TCP connection remains alive.  These
                are just read and ignored.  
        !*/

    public:

        bridge (
        );
        /*!
            ensures
                - this object is properly initialized
                - #get_bridge_status().is_connected == false
        !*/

        template <typename T, typename U, typename V>
        bridge (
            T network_parameters,
            U pipe1,
            V pipe2 
        ); 
        /*!
            requires
                - T is of type connect_to_ip_and_port or listen_on_port
                - U and V are of type bridge_transmit_decoration or bridge_receive_decoration,
                  however, U and V must be of different types (i.e. one is a receive type and 
                  another a transmit type).
            ensures
                - this object is properly initialized
                - performs: reconfigure(network_parameters, pipe1, pipe2)
                  (i.e. using this constructor is identical to using the default constructor 
                  and then calling reconfigure())
        !*/

        template <typename T, typename U>
        bridge (
            T network_parameters,
            U pipe 
        ); 
        /*!
            requires
                - T is of type connect_to_ip_and_port or listen_on_port
                - U is of type bridge_transmit_decoration or bridge_receive_decoration.
            ensures
                - this object is properly initialized
                - performs: reconfigure(network_parameters, pipe)
                  (i.e. using this constructor is identical to using the default constructor 
                  and then calling reconfigure())
        !*/

        ~bridge (
        );
        /*!
            ensures
                - blocks until all resources associated with this object have been destroyed.
        !*/

        void clear (
        );
        /*!
            ensures
                - returns this object to its default constructed state.  That is, it will
                  be inactive, neither maintaining a connection nor attempting to acquire one.
                - Any active connections or listening sockets will be closed.
        !*/

        bridge_status get_bridge_status (
        ) const;
        /*!
            ensures
                - returns the current status of this bridge object. In particular, returns 
                  an object BS such that:
                    - BS.is_connected == true if and only if the bridge has an active TCP 
                      connection to another computer.
                    - if (BS.is_connected) then
                        - BS.foreign_ip == the IP address of the remote host we are connected to.
                        - BS.foreign_port == the port number on the remote host we are connected to.
                    - else if (the bridge has previously been connected to a remote host but hasn't been 
                               reconfigured or cleared since) then
                        - BS.foreign_ip == the IP address of the remote host we were connected to.
                        - BS.foreign_port == the port number on the remote host we were connected to.
                    - else
                        - BS.foreign_ip == ""
                        - BS.foreign_port == 0
        !*/



        template < typename T, typename R >
        void reconfigure (
            listen_on_port network_parameters,
            bridge_transmit_decoration<T> transmit_pipe,
            bridge_receive_decoration<R> receive_pipe
        ); 
        /*!
            ensures
                - This object will begin listening on the port specified by network_parameters
                  for incoming TCP connections.  Any previous bridge state is cleared out.
                - Onces a connection is established we will:
                    - Stop accepting new connections.
                    - Begin dequeuing objects from the transmit pipe and serializing them over 
                      the TCP connection.
                    - Begin deserializing objects from the TCP connection and enqueueing them 
                      onto the receive pipe.
                - if (the current TCP connection is lost) then 
                    - This object goes back to listening for a new connection.
                - if (the receive pipe can contain bridge_status objects) then
                    - Whenever the bridge's status changes the updated bridge_status will be
                      enqueued onto the receive pipe unless the change was a TCP disconnect 
                      resulting from a user calling reconfigure(), clear(), or destructing this 
                      bridge.  The status contents are defined by get_bridge_status().
            throws
                - socket_error
                  This exception is thrown if we are unable to open the listening socket.
        !*/
        template < typename T, typename R >
        void reconfigure (
            listen_on_port network_parameters,
            bridge_receive_decoration<R> receive_pipe,
            bridge_transmit_decoration<T> transmit_pipe
        ); 
        /*!
            ensures
                - performs reconfigure(network_parameters, transmit_pipe, receive_pipe)
        !*/
        template < typename T >
        void reconfigure (
            listen_on_port network_parameters,
            bridge_transmit_decoration<T> transmit_pipe
        );
        /*!
            ensures
                - This function is identical to the above two reconfigure() functions 
                  except that there is no receive pipe.
        !*/
        template < typename R >
        void reconfigure (
            listen_on_port network_parameters,
            bridge_receive_decoration<R> receive_pipe
        );
        /*!
            ensures
                - This function is identical to the above three reconfigure() functions 
                  except that there is no transmit pipe.
        !*/



        template <typename T, typename R>
        void reconfigure (
            connect_to_ip_and_port network_parameters,
            bridge_transmit_decoration<T> transmit_pipe,
            bridge_receive_decoration<R> receive_pipe
        ); 
        /*!
            ensures
                - This object will begin making TCP connection attempts to the IP address and port 
                  specified by network_parameters.  Any previous bridge state is cleared out.
                - Onces a connection is established we will:
                    - Stop attempting new connections.
                    - Begin dequeuing objects from the transmit pipe and serializing them over 
                      the TCP connection.
                    - Begin deserializing objects from the TCP connection and enqueueing them 
                      onto the receive pipe.
                - if (the current TCP connection is lost) then 
                    - This object goes back to attempting to make a TCP connection with the
                      IP address and port specified by network_parameters.
                - if (the receive pipe can contain bridge_status objects) then
                    - Whenever the bridge's status changes the updated bridge_status will be
                      enqueued onto the receive pipe unless the change was a TCP disconnect 
                      resulting from a user calling reconfigure(), clear(), or destructing this 
                      bridge.  The status contents are defined by get_bridge_status().
        !*/
        template <typename T, typename R>
        void reconfigure (
            connect_to_ip_and_port network_parameters,
            bridge_receive_decoration<R> receive_pipe,
            bridge_transmit_decoration<T> transmit_pipe
        ); 
        /*!
            ensures
                - performs reconfigure(network_parameters, transmit_pipe, receive_pipe)
        !*/
        template <typename T>
        void reconfigure (
            connect_to_ip_and_port network_parameters,
            bridge_transmit_decoration<T> transmit_pipe
        );
        /*!
            ensures
                - This function is identical to the above two reconfigure() functions 
                  except that there is no receive pipe.
        !*/
        template <typename R>
        void reconfigure (
            connect_to_ip_and_port network_parameters,
            bridge_receive_decoration<R> receive_pipe
        );
        /*!
            ensures
                - This function is identical to the above three reconfigure() functions 
                  except that there is no transmit pipe.
        !*/

    };

// ---------------------------------------------------------------------------------------- 

}

#endif // DLIB_BRIDGe_ABSTRACT_


