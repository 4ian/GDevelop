// Copyright (C) 2012  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_BsP_ABSTRACT_Hh_
#ifdef DLIB_BsP_ABSTRACT_Hh_

#include "../noncopyable.h"
#include "../sockets/sockets_extensions_abstract.h"
#include <vector>

namespace dlib
{

// ----------------------------------------------------------------------------------------

    class bsp_context : noncopyable
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This is a tool used to implement algorithms using the Bulk Synchronous
                Parallel (BSP) computing model.  A BSP algorithm is composed of a number of
                processing nodes, each executing in parallel.  The general flow of
                execution in each processing node is the following:
                    1. Do work locally on some data.
                    2. Send some messages to other nodes.
                    3. Receive messages from other nodes.
                    4. Go to step 1 or terminate if complete.

                To do this, each processing node needs an API used to send and receive
                messages.  This API is implemented by the bsp_connect object which provides
                these services to a BSP node.  

                Note that BSP processing nodes are spawned using the bsp_connect() and
                bsp_listen() routines defined at the bottom of this file.  For example, to
                start a BSP algorithm consisting of N processing nodes, you would make N-1
                calls to bsp_listen() and one call to bsp_connect().  The call to
                bsp_connect() then initiates the computation on all nodes.

                Finally, note that there is no explicit barrier synchronization function
                you call at the end of step 3.  Instead, you can simply call a method such
                as try_receive() until it returns false.  That is, the bsp_context's
                receive methods incorporate a barrier synchronization that happens once all
                the BSP nodes are blocked on receive calls and there are no more messages
                in flight. 


            THREAD SAFETY
                This object is not thread-safe.  In particular, you should only ever have
                one thread that works with an instance of this object.  This means that,
                for example, you should not spawn sub-threads from within a BSP processing
                node and have them invoke methods on this object.  Instead, you should only
                invoke this object's methods from within the BSP processing node's main
                thread (i.e. the thread that executes the user supplied function funct()).
        !*/

    public:

        template <typename T>
        void send(
            const T& item,
            unsigned long target_node_id
        );
        /*!
            requires
                - item is serializable 
                - target_node_id < number_of_nodes()
                - target_node_id != node_id()
            ensures
                - sends a copy of item to the node with the given id.
            throws
                - dlib::socket_error:
                    This exception is thrown if there is an error which prevents us from
                    delivering the message to the given node.  One way this might happen is
                    if the target node has already terminated its execution or has lost
                    network connectivity. 
        !*/

        template <typename T>
        void broadcast (
            const T& item
        );
        /*!
            ensures
                - item is serializable
                - sends a copy of item to all other processing nodes.   
            throws
                - dlib::socket_error
                    This exception is thrown if there is an error which prevents us from
                    delivering a message to one of the other nodes.  This might happen, for
                    example, if one of the nodes has terminated its execution or has lost
                    network connectivity.
        !*/

        unsigned long node_id (
        ) const; 
        /*!
            ensures
                - Returns the id of the current processing node.  That is, 
                  returns a number N such that:
                    - N < number_of_nodes()
                    - N == the node id of the processing node that called node_id().  This
                      is a number that uniquely identifies the processing node.
        !*/

        unsigned long number_of_nodes (
        ) const; 
        /*!
            ensures
                - returns the number of processing nodes participating in the BSP
                  computation.
        !*/

        template <typename T>
        bool try_receive (
            T& item
        );
        /*!
            requires
                - item is serializable
            ensures
                - if (this function returns true) then
                    - #item == the next message which was sent to the calling processing
                      node.
                - else
                    - The following must have been true for this function to return false:
                        - All other nodes were blocked on calls to receive(),
                          try_receive(), or have terminated.
                        - There were not any messages in flight between any nodes.  
                        - That is, if all the nodes had continued to block on receive
                          methods then they all would have blocked forever.  Therefore,
                          this function only returns false once there are no more messages
                          to process by any node and there is no possibility of more being
                          generated until control is returned to the callers of receive
                          methods. 
                    - When one BSP node's receive method returns because of the above
                      conditions then all of them will also return.  That is, it is NOT the
                      case that just a subset of BSP nodes unblock.  Moreover, they all
                      unblock at the same time.  
            throws
                - dlib::socket_error:
                    This exception is thrown if some error occurs which prevents us from
                    communicating with other processing nodes.
                - dlib::serialization_error or any exception thrown by the global
                  deserialize(T) routine:
                    This is thrown if there is a problem in deserialize().  This might
                    happen if the message sent doesn't match the type T expected by
                    try_receive().
        !*/

        template <typename T>
        void receive (
            T& item
        );
        /*!
            requires
                - item is serializable
            ensures
                - #item == the next message which was sent to the calling processing
                  node.
                - This function is just a wrapper around try_receive() that throws an
                  exception if a message is not received (i.e. if try_receive() returns
                  false).
            throws
                - dlib::socket_error:
                    This exception is thrown if some error occurs which prevents us from
                    communicating with other processing nodes or if there was not a message
                    to receive.
                - dlib::serialization_error or any exception thrown by the global
                  deserialize(T) routine:
                    This is thrown if there is a problem in deserialize().  This might
                    happen if the message sent doesn't match the type T expected by
                    receive().
        !*/

        template <typename T>
        bool try_receive (
            T& item,
            unsigned long& sending_node_id
        ); 
        /*!
            requires
                - item is serializable
            ensures
                - if (this function returns true) then
                    - #item == the next message which was sent to the calling processing
                      node.
                    - #sending_node_id == the node id of the node that sent this message.
                    - #sending_node_id < number_of_nodes()
                - else
                    - The following must have been true for this function to return false:
                        - All other nodes were blocked on calls to receive(),
                          try_receive(), or have terminated.
                        - There were not any messages in flight between any nodes.  
                        - That is, if all the nodes had continued to block on receive
                          methods then they all would have blocked forever.  Therefore,
                          this function only returns false once there are no more messages
                          to process by any node and there is no possibility of more being
                          generated until control is returned to the callers of receive
                          methods. 
                    - When one BSP node's receive method returns because of the above
                      conditions then all of them will also return.  That is, it is NOT the
                      case that just a subset of BSP nodes unblock.  Moreover, they all
                      unblock at the same time.  
            throws
                - dlib::socket_error:
                    This exception is thrown if some error occurs which prevents us from
                    communicating with other processing nodes.
                - dlib::serialization_error or any exception thrown by the global
                  deserialize(T) routine:
                    This is thrown if there is a problem in deserialize().  This might
                    happen if the message sent doesn't match the type T expected by
                    try_receive().
        !*/

        template <typename T>
        void receive (
            T& item,
            unsigned long& sending_node_id
        ); 
        /*!
            requires
                - item is serializable
            ensures
                - #item == the next message which was sent to the calling processing node.
                - #sending_node_id == the node id of the node that sent this message.
                - #sending_node_id < number_of_nodes()
                - This function is just a wrapper around try_receive() that throws an
                  exception if a message is not received (i.e. if try_receive() returns
                  false).
            throws
                - dlib::socket_error:
                    This exception is thrown if some error occurs which prevents us from
                    communicating with other processing nodes or if there was not a message
                    to receive.
                - dlib::serialization_error or any exception thrown by the global
                  deserialize(T) routine:
                    This is thrown if there is a problem in deserialize().  This might
                    happen if the message sent doesn't match the type T expected by
                    receive().
        !*/

        void receive (
        );
        /*!
            ensures
                - Waits for the following to all be true:
                    - All other nodes were blocked on calls to receive(), try_receive(), or
                      have terminated.
                    - There are not any messages in flight between any nodes.  
                    - That is, if all the nodes had continued to block on receive methods
                      then they all would have blocked forever.  Therefore, this function
                      only returns once there are no more messages to process by any node
                      and there is no possibility of more being generated until control is
                      returned to the callers of receive methods. 
                - When one BSP node's receive method returns because of the above
                  conditions then all of them will also return.  That is, it is NOT the
                  case that just a subset of BSP nodes unblock.  Moreover, they all unblock
                  at the same time.  
            throws
                - dlib::socket_error:
                    This exception is thrown if some error occurs which prevents us from
                    communicating with other processing nodes or if a message is received
                    before this function would otherwise return.

        !*/

    };

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename funct_type
        >
    void bsp_connect (
        const std::vector<network_address>& hosts,
        funct_type funct
    );
    /*!
        requires
            - let CONTEXT be an instance of a bsp_context object.  Then:
                - funct(CONTEXT) must be a valid expression 
                  (i.e. funct must be a function or function object)
        ensures
            - This function spawns a BSP job consisting of hosts.size()+1 processing nodes.
            - The processing node with a node ID of 0 will run locally on the machine
              calling bsp_connect().  In particular, this node will execute funct(CONTEXT),
              which is expected to carry out this node's portion of the BSP computation.
            - The other processing nodes are executed on the hosts indicated by the input
              argument.  In particular, this function interprets hosts as a list addresses
              identifying machines running the bsp_listen() or bsp_listen_dynamic_port()
              routines.  
            - This call to bsp_connect() blocks until the BSP computation has completed on
              all processing nodes.
        throws
            - dlib::socket_error
                This exception is thrown if there is an error which prevents the BSP
                job from executing.  
            - Any exception thrown by funct() will be propagated out of this call to
              bsp_connect().
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename funct_type,
        typename ARG1
        >
    void bsp_connect (
        const std::vector<network_address>& hosts,
        funct_type funct,
        ARG1 arg1
    );
    /*!
        requires
            - let CONTEXT be an instance of a bsp_context object.  Then:
                - funct(CONTEXT,arg1) must be a valid expression 
                  (i.e. funct must be a function or function object)
        ensures
            - This function spawns a BSP job consisting of hosts.size()+1 processing nodes.
            - The processing node with a node ID of 0 will run locally on the machine
              calling bsp_connect().  In particular, this node will execute funct(CONTEXT,arg1),
              which is expected to carry out this node's portion of the BSP computation.
            - The other processing nodes are executed on the hosts indicated by the input
              argument.  In particular, this function interprets hosts as a list addresses
              identifying machines running the bsp_listen() or bsp_listen_dynamic_port()
              routines.  
            - This call to bsp_connect() blocks until the BSP computation has completed on
              all processing nodes.
        throws
            - dlib::socket_error
                This exception is thrown if there is an error which prevents the BSP
                job from executing.  
            - Any exception thrown by funct() will be propagated out of this call to
              bsp_connect().
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename funct_type,
        typename ARG1,
        typename ARG2
        >
    void bsp_connect (
        const std::vector<network_address>& hosts,
        funct_type funct,
        ARG1 arg1,
        ARG2 arg2
    );
    /*!
        requires
            - let CONTEXT be an instance of a bsp_context object.  Then:
                - funct(CONTEXT,arg1,arg2) must be a valid expression 
                  (i.e. funct must be a function or function object)
        ensures
            - This function spawns a BSP job consisting of hosts.size()+1 processing nodes.
            - The processing node with a node ID of 0 will run locally on the machine
              calling bsp_connect().  In particular, this node will execute funct(CONTEXT,arg1,arg2),
              which is expected to carry out this node's portion of the BSP computation.
            - The other processing nodes are executed on the hosts indicated by the input
              argument.  In particular, this function interprets hosts as a list addresses
              identifying machines running the bsp_listen() or bsp_listen_dynamic_port()
              routines.  
            - This call to bsp_connect() blocks until the BSP computation has completed on
              all processing nodes.
        throws
            - dlib::socket_error
                This exception is thrown if there is an error which prevents the BSP
                job from executing.  
            - Any exception thrown by funct() will be propagated out of this call to
              bsp_connect().
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename funct_type,
        typename ARG1,
        typename ARG2,
        typename ARG3
        >
    void bsp_connect (
        const std::vector<network_address>& hosts,
        funct_type funct,
        ARG1 arg1,
        ARG2 arg2,
        ARG3 arg3
    );
    /*!
        requires
            - let CONTEXT be an instance of a bsp_context object.  Then:
                - funct(CONTEXT,arg1,arg2,arg3) must be a valid expression 
                  (i.e. funct must be a function or function object)
        ensures
            - This function spawns a BSP job consisting of hosts.size()+1 processing nodes.
            - The processing node with a node ID of 0 will run locally on the machine
              calling bsp_connect().  In particular, this node will execute funct(CONTEXT,arg1,arg2,arg3),
              which is expected to carry out this node's portion of the BSP computation.
            - The other processing nodes are executed on the hosts indicated by the input
              argument.  In particular, this function interprets hosts as a list addresses
              identifying machines running the bsp_listen() or bsp_listen_dynamic_port()
              routines.  
            - This call to bsp_connect() blocks until the BSP computation has completed on
              all processing nodes.
        throws
            - dlib::socket_error
                This exception is thrown if there is an error which prevents the BSP
                job from executing.  
            - Any exception thrown by funct() will be propagated out of this call to
              bsp_connect().
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename funct_type,
        typename ARG1,
        typename ARG2,
        typename ARG3,
        typename ARG4
        >
    void bsp_connect (
        const std::vector<network_address>& hosts,
        funct_type funct,
        ARG1 arg1,
        ARG2 arg2,
        ARG3 arg3,
        ARG4 arg4
    );
    /*!
        requires
            - let CONTEXT be an instance of a bsp_context object.  Then:
                - funct(CONTEXT,arg1,arg2,arg3,arg4) must be a valid expression 
                  (i.e. funct must be a function or function object)
        ensures
            - This function spawns a BSP job consisting of hosts.size()+1 processing nodes.
            - The processing node with a node ID of 0 will run locally on the machine
              calling bsp_connect().  In particular, this node will execute funct(CONTEXT,arg1,arg2,arg3,arg4),
              which is expected to carry out this node's portion of the BSP computation.
            - The other processing nodes are executed on the hosts indicated by the input
              argument.  In particular, this function interprets hosts as a list addresses
              identifying machines running the bsp_listen() or bsp_listen_dynamic_port()
              routines.  
            - This call to bsp_connect() blocks until the BSP computation has completed on
              all processing nodes.
        throws
            - dlib::socket_error
                This exception is thrown if there is an error which prevents the BSP
                job from executing.  
            - Any exception thrown by funct() will be propagated out of this call to
              bsp_connect().
    !*/

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename funct_type
        >
    void bsp_listen (
        unsigned short listening_port,
        funct_type funct
    );
    /*!
        requires
            - listening_port != 0
            - let CONTEXT be an instance of a bsp_context object.  Then:
                - funct(CONTEXT) must be a valid expression 
                  (i.e. funct must be a function or function object)
        ensures
            - This function listens for a connection from the bsp_connect() routine.  Once
              this connection is established, funct(CONTEXT) will be executed and it will
              then be able to participate in the BSP computation as one of the processing
              nodes.  
            - This function will listen on TCP port listening_port for a connection from
              bsp_connect().  Once the connection is established, it will close the
              listening port so it is free for use by other applications.  The connection
              and BSP computation will continue uninterrupted.
            - This call to bsp_listen() blocks until the BSP computation has completed on
              all processing nodes.
        throws
            - dlib::socket_error
                This exception is thrown if there is an error which prevents the BSP
                job from executing.  
            - Any exception thrown by funct() will be propagated out of this call to
              bsp_connect().
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename funct_type,
        typename ARG1
        >
    void bsp_listen (
        unsigned short listening_port,
        funct_type funct,
        ARG1 arg1
    );
    /*!
        requires
            - listening_port != 0
            - let CONTEXT be an instance of a bsp_context object.  Then:
                - funct(CONTEXT,arg1) must be a valid expression 
                  (i.e. funct must be a function or function object)
        ensures
            - This function listens for a connection from the bsp_connect() routine.  Once
              this connection is established, funct(CONTEXT,arg1) will be executed and it will
              then be able to participate in the BSP computation as one of the processing
              nodes.  
            - This function will listen on TCP port listening_port for a connection from
              bsp_connect().  Once the connection is established, it will close the
              listening port so it is free for use by other applications.  The connection
              and BSP computation will continue uninterrupted.
            - This call to bsp_listen() blocks until the BSP computation has completed on
              all processing nodes.
        throws
            - dlib::socket_error
                This exception is thrown if there is an error which prevents the BSP
                job from executing.  
            - Any exception thrown by funct() will be propagated out of this call to
              bsp_connect().
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename funct_type,
        typename ARG1,
        typename ARG2
        >
    void bsp_listen (
        unsigned short listening_port,
        funct_type funct,
        ARG1 arg1,
        ARG2 arg2
    );
    /*!
        requires
            - listening_port != 0
            - let CONTEXT be an instance of a bsp_context object.  Then:
                - funct(CONTEXT,arg1,arg2) must be a valid expression 
                  (i.e. funct must be a function or function object)
        ensures
            - This function listens for a connection from the bsp_connect() routine.  Once
              this connection is established, funct(CONTEXT,arg1,arg2) will be executed and
              it will then be able to participate in the BSP computation as one of the
              processing nodes.  
            - This function will listen on TCP port listening_port for a connection from
              bsp_connect().  Once the connection is established, it will close the
              listening port so it is free for use by other applications.  The connection
              and BSP computation will continue uninterrupted.
            - This call to bsp_listen() blocks until the BSP computation has completed on
              all processing nodes.
        throws
            - dlib::socket_error
                This exception is thrown if there is an error which prevents the BSP
                job from executing.  
            - Any exception thrown by funct() will be propagated out of this call to
              bsp_connect().
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename funct_type,
        typename ARG1,
        typename ARG2,
        typename ARG3
        >
    void bsp_listen (
        unsigned short listening_port,
        funct_type funct,
        ARG1 arg1,
        ARG2 arg2,
        ARG3 arg3
    );
    /*!
        requires
            - listening_port != 0
            - let CONTEXT be an instance of a bsp_context object.  Then:
                - funct(CONTEXT,arg1,arg2,arg3) must be a valid expression 
                  (i.e. funct must be a function or function object)
        ensures
            - This function listens for a connection from the bsp_connect() routine.  Once
              this connection is established, funct(CONTEXT,arg1,arg2,arg3) will be
              executed and it will then be able to participate in the BSP computation as
              one of the processing nodes.  
            - This function will listen on TCP port listening_port for a connection from
              bsp_connect().  Once the connection is established, it will close the
              listening port so it is free for use by other applications.  The connection
              and BSP computation will continue uninterrupted.
            - This call to bsp_listen() blocks until the BSP computation has completed on
              all processing nodes.
        throws
            - dlib::socket_error
                This exception is thrown if there is an error which prevents the BSP
                job from executing.  
            - Any exception thrown by funct() will be propagated out of this call to
              bsp_connect().
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename funct_type,
        typename ARG1,
        typename ARG2,
        typename ARG3,
        typename ARG4
        >
    void bsp_listen (
        unsigned short listening_port,
        funct_type funct,
        ARG1 arg1,
        ARG2 arg2,
        ARG3 arg3,
        ARG4 arg4
    );
    /*!
        requires
            - listening_port != 0
            - let CONTEXT be an instance of a bsp_context object.  Then:
                - funct(CONTEXT,arg1,arg2,arg3,arg4) must be a valid expression 
                  (i.e. funct must be a function or function object)
        ensures
            - This function listens for a connection from the bsp_connect() routine.  Once
              this connection is established, funct(CONTEXT,arg1,arg2,arg3,arg4) will be
              executed and it will then be able to participate in the BSP computation as
              one of the processing nodes.  
            - This function will listen on TCP port listening_port for a connection from
              bsp_connect().  Once the connection is established, it will close the
              listening port so it is free for use by other applications.  The connection
              and BSP computation will continue uninterrupted.
            - This call to bsp_listen() blocks until the BSP computation has completed on
              all processing nodes.
        throws
            - dlib::socket_error
                This exception is thrown if there is an error which prevents the BSP
                job from executing.  
            - Any exception thrown by funct() will be propagated out of this call to
              bsp_connect().
    !*/

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename port_notify_function_type,
        typename funct_type
        >
    void bsp_listen_dynamic_port (
        unsigned short listening_port,
        port_notify_function_type port_notify_function,
        funct_type funct
    );
    /*!
        requires
            - let CONTEXT be an instance of a bsp_context object.  Then:
                - funct(CONTEXT) must be a valid expression 
                  (i.e. funct must be a function or function object)
            - port_notify_function((unsigned short) 1234) must be a valid expression
              (i.e. port_notify_function() must be a function or function object taking an 
              unsigned short)
        ensures
            - This function listens for a connection from the bsp_connect() routine.  Once
              this connection is established, funct(CONTEXT) will be executed and it will
              then be able to participate in the BSP computation as one of the processing
              nodes.  
            - if (listening_port != 0) then
                - This function will listen on TCP port listening_port for a connection
                  from bsp_connect().  
            - else
                - An available TCP port number is automatically selected and this function
                  will listen on it for a connection from bsp_connect(). 
            - Once a listening port is opened, port_notify_function() is called with the
              port number used.  This provides a mechanism to find out what listening port
              has been used if it is automatically selected.  It also allows you to find
              out when the routine has begun listening for an incoming connection from
              bsp_connect().
            - Once a connection is established, we will close the listening port so it is
              free for use by other applications.  The connection and BSP computation will
              continue uninterrupted.
            - This call to bsp_listen_dynamic_port() blocks until the BSP computation has
              completed on all processing nodes.
        throws
            - dlib::socket_error
                This exception is thrown if there is an error which prevents the BSP
                job from executing.  
            - Any exception thrown by funct() will be propagated out of this call to
              bsp_connect().
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename port_notify_function_type,
        typename funct_type,
        typename ARG1
        >
    void bsp_listen_dynamic_port (
        unsigned short listening_port,
        port_notify_function_type port_notify_function,
        funct_type funct,
        ARG1 arg1
    );
    /*!
        requires
            - let CONTEXT be an instance of a bsp_context object.  Then:
                - funct(CONTEXT,arg1) must be a valid expression 
                  (i.e. funct must be a function or function object)
            - port_notify_function((unsigned short) 1234) must be a valid expression
              (i.e. port_notify_function() must be a function or function object taking an 
              unsigned short)
        ensures
            - This function listens for a connection from the bsp_connect() routine.  Once
              this connection is established, funct(CONTEXT,arg1) will be executed and it
              will then be able to participate in the BSP computation as one of the
              processing nodes.  
            - if (listening_port != 0) then
                - This function will listen on TCP port listening_port for a connection
                  from bsp_connect().  
            - else
                - An available TCP port number is automatically selected and this function
                  will listen on it for a connection from bsp_connect(). 
            - Once a listening port is opened, port_notify_function() is called with the
              port number used.  This provides a mechanism to find out what listening port
              has been used if it is automatically selected.  It also allows you to find
              out when the routine has begun listening for an incoming connection from
              bsp_connect().
            - Once a connection is established, we will close the listening port so it is
              free for use by other applications.  The connection and BSP computation will
              continue uninterrupted.
            - This call to bsp_listen_dynamic_port() blocks until the BSP computation has
              completed on all processing nodes.
        throws
            - dlib::socket_error
                This exception is thrown if there is an error which prevents the BSP
                job from executing.  
            - Any exception thrown by funct() will be propagated out of this call to
              bsp_connect().
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename port_notify_function_type,
        typename funct_type,
        typename ARG1,
        typename ARG2
        >
    void bsp_listen_dynamic_port (
        unsigned short listening_port,
        port_notify_function_type port_notify_function,
        funct_type funct,
        ARG1 arg1,
        ARG2 arg2
    );
    /*!
        requires
            - let CONTEXT be an instance of a bsp_context object.  Then:
                - funct(CONTEXT,arg1,arg2) must be a valid expression 
                  (i.e. funct must be a function or function object)
            - port_notify_function((unsigned short) 1234) must be a valid expression
              (i.e. port_notify_function() must be a function or function object taking an 
              unsigned short)
        ensures
            - This function listens for a connection from the bsp_connect() routine.  Once
              this connection is established, funct(CONTEXT,arg1,arg2) will be executed and
              it will then be able to participate in the BSP computation as one of the
              processing nodes.  
            - if (listening_port != 0) then
                - This function will listen on TCP port listening_port for a connection
                  from bsp_connect().  
            - else
                - An available TCP port number is automatically selected and this function
                  will listen on it for a connection from bsp_connect(). 
            - Once a listening port is opened, port_notify_function() is called with the
              port number used.  This provides a mechanism to find out what listening port
              has been used if it is automatically selected.  It also allows you to find
              out when the routine has begun listening for an incoming connection from
              bsp_connect().
            - Once a connection is established, we will close the listening port so it is
              free for use by other applications.  The connection and BSP computation will
              continue uninterrupted.
            - This call to bsp_listen_dynamic_port() blocks until the BSP computation has
              completed on all processing nodes.
        throws
            - dlib::socket_error
                This exception is thrown if there is an error which prevents the BSP
                job from executing.  
            - Any exception thrown by funct() will be propagated out of this call to
              bsp_connect().
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename port_notify_function_type,
        typename funct_type,
        typename ARG1,
        typename ARG2,
        typename ARG3
        >
    void bsp_listen_dynamic_port (
        unsigned short listening_port,
        port_notify_function_type port_notify_function,
        funct_type funct,
        ARG1 arg1,
        ARG2 arg2,
        ARG3 arg3
    );
    /*!
        requires
            - let CONTEXT be an instance of a bsp_context object.  Then:
                - funct(CONTEXT,arg1,arg2,arg3) must be a valid expression 
                  (i.e. funct must be a function or function object)
            - port_notify_function((unsigned short) 1234) must be a valid expression
              (i.e. port_notify_function() must be a function or function object taking an 
              unsigned short)
        ensures
            - This function listens for a connection from the bsp_connect() routine.  Once
              this connection is established, funct(CONTEXT,arg1,arg2,arg3) will be
              executed and it will then be able to participate in the BSP computation as
              one of the processing nodes.  
            - if (listening_port != 0) then
                - This function will listen on TCP port listening_port for a connection
                  from bsp_connect().  
            - else
                - An available TCP port number is automatically selected and this function
                  will listen on it for a connection from bsp_connect(). 
            - Once a listening port is opened, port_notify_function() is called with the
              port number used.  This provides a mechanism to find out what listening port
              has been used if it is automatically selected.  It also allows you to find
              out when the routine has begun listening for an incoming connection from
              bsp_connect().
            - Once a connection is established, we will close the listening port so it is
              free for use by other applications.  The connection and BSP computation will
              continue uninterrupted.
            - This call to bsp_listen_dynamic_port() blocks until the BSP computation has
              completed on all processing nodes.
        throws
            - dlib::socket_error
                This exception is thrown if there is an error which prevents the BSP
                job from executing.  
            - Any exception thrown by funct() will be propagated out of this call to
              bsp_connect().
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename port_notify_function_type,
        typename funct_type,
        typename ARG1,
        typename ARG2,
        typename ARG3,
        typename ARG4
        >
    void bsp_listen_dynamic_port (
        unsigned short listening_port,
        port_notify_function_type port_notify_function,
        funct_type funct,
        ARG1 arg1,
        ARG2 arg2,
        ARG3 arg3,
        ARG4 arg4
    );
    /*!
        requires
            - let CONTEXT be an instance of a bsp_context object.  Then:
                - funct(CONTEXT,arg1,arg2,arg3,arg4) must be a valid expression 
                  (i.e. funct must be a function or function object)
            - port_notify_function((unsigned short) 1234) must be a valid expression
              (i.e. port_notify_function() must be a function or function object taking an 
              unsigned short)
        ensures
            - This function listens for a connection from the bsp_connect() routine.  Once
              this connection is established, funct(CONTEXT,arg1,arg2,arg3,arg4) will be
              executed and it will then be able to participate in the BSP computation as
              one of the processing nodes.  
            - if (listening_port != 0) then
                - This function will listen on TCP port listening_port for a connection
                  from bsp_connect().  
            - else
                - An available TCP port number is automatically selected and this function
                  will listen on it for a connection from bsp_connect(). 
            - Once a listening port is opened, port_notify_function() is called with the
              port number used.  This provides a mechanism to find out what listening port
              has been used if it is automatically selected.  It also allows you to find
              out when the routine has begun listening for an incoming connection from
              bsp_connect().
            - Once a connection is established, we will close the listening port so it is
              free for use by other applications.  The connection and BSP computation will
              continue uninterrupted.
            - This call to bsp_listen_dynamic_port() blocks until the BSP computation has
              completed on all processing nodes.
        throws
            - dlib::socket_error
                This exception is thrown if there is an error which prevents the BSP
                job from executing.  
            - Any exception thrown by funct() will be propagated out of this call to
              bsp_connect().
    !*/

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

}

#endif // DLIB_BsP_ABSTRACT_Hh_

