// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_BRIDGe_Hh_
#define DLIB_BRIDGe_Hh_

#include "bridge_abstract.h"
#include <string>
#include "../pipe.h"
#include "../threads.h"
#include "../smart_pointers.h"
#include "../serialize.h"
#include "../sockets.h"
#include "../sockstreambuf.h"
#include "../logger.h"
#include "../algs.h"
#include <iostream>

namespace dlib
{

// ---------------------------------------------------------------------------------------- 

    struct connect_to_ip_and_port
    {
        connect_to_ip_and_port (
            const std::string& ip_,
            unsigned short port_
        ): ip(ip_), port(port_)
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(is_ip_address(ip) && port != 0,
                "\t connect_to_ip_and_port()"
                << "\n\t Invalid inputs were given to this function"
                << "\n\t ip:   " << ip 
                << "\n\t port: " << port
                << "\n\t this: " << this
                );
        }

    private:
        friend class bridge;
        const std::string ip;
        const unsigned short port;
    };

    inline connect_to_ip_and_port connect_to (
        const network_address& addr
    )
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(addr.port != 0,
            "\t connect_to_ip_and_port()"
            << "\n\t The TCP port to connect to can't be 0."
            << "\n\t addr.port: " << addr.port
            );

        if (is_ip_address(addr.host_address))
        {
            return connect_to_ip_and_port(addr.host_address, addr.port);
        }
        else
        {
            std::string ip;
            if(hostname_to_ip(addr.host_address,ip))
                throw socket_error(ERESOLVE,"unable to resolve '" + addr.host_address + "' in connect_to()");

            return connect_to_ip_and_port(ip, addr.port);
        }
    }

    struct listen_on_port
    {
        listen_on_port(
            unsigned short port_
        ) : port(port_) 
        {
            // make sure requires clause is not broken
            DLIB_ASSERT( port != 0,
                "\t listen_on_port()"
                << "\n\t Invalid inputs were given to this function"
                << "\n\t port: " << port
                << "\n\t this: " << this
                );
        }

    private:
        friend class bridge;
        const unsigned short port;
    };

    template <typename pipe_type>
    struct bridge_transmit_decoration
    {
        bridge_transmit_decoration ( 
            pipe_type& p_
        ) : p(p_) {}

    private:
        friend class bridge;
        pipe_type& p;
    };

    template <typename pipe_type>
    bridge_transmit_decoration<pipe_type> transmit ( pipe_type& p) { return bridge_transmit_decoration<pipe_type>(p); }

    template <typename pipe_type>
    struct bridge_receive_decoration
    {
        bridge_receive_decoration ( 
            pipe_type& p_
        ) : p(p_) {}

    private:
        friend class bridge;
        pipe_type& p;
    };

    template <typename pipe_type>
    bridge_receive_decoration<pipe_type> receive ( pipe_type& p) { return bridge_receive_decoration<pipe_type>(p); }

// ----------------------------------------------------------------------------------------

    struct bridge_status
    {
        bridge_status() : is_connected(false), foreign_port(0){}

        bool is_connected;
        unsigned short foreign_port;
        std::string foreign_ip;
    };

    inline void serialize ( const bridge_status& , std::ostream& )
    {
        throw serialization_error("It is illegal to serialize bridge_status objects.");
    }

    inline void deserialize ( bridge_status& , std::istream& )
    {
        throw serialization_error("It is illegal to serialize bridge_status objects.");
    }

// ----------------------------------------------------------------------------------------

    namespace impl
    {
        class impl_bridge_base
        {
        public:

            virtual ~impl_bridge_base() {}

            virtual bridge_status get_bridge_status (
            ) const = 0;
        };

        template <
            typename transmit_pipe_type,
            typename receive_pipe_type
            >
        class impl_bridge : public impl_bridge_base, private noncopyable, private multithreaded_object
        {
            /*!
                CONVENTION
                    - if (list) then
                        - this object is supposed to be listening on the list object for incoming
                          connections when not connected.
                    - else
                        - this object is supposed to be attempting to connect to ip:port when
                          not connected.

                    - get_bridge_status() == current_bs
            !*/
        public:

            impl_bridge (
                unsigned short listen_port,
                transmit_pipe_type* transmit_pipe_,
                receive_pipe_type* receive_pipe_
            ) :
                s(m),
                receive_thread_active(false),
                transmit_thread_active(false),
                port(0),
                transmit_pipe(transmit_pipe_),
                receive_pipe(receive_pipe_),
                dlog("dlib.bridge"),
                keepalive_code(0),
                message_code(1)
            {
                int status = create_listener(list, listen_port);
                if (status == PORTINUSE)
                {
                    std::ostringstream sout;
                    sout << "Error, the port " << listen_port << " is already in use.";
                    throw socket_error(EPORT_IN_USE, sout.str());
                }
                else if (status == OTHER_ERROR)
                {
                    throw socket_error("Unable to create listening socket for an unknown reason.");
                }

                register_thread(*this, &impl_bridge::transmit_thread);
                register_thread(*this, &impl_bridge::receive_thread);
                register_thread(*this, &impl_bridge::connect_thread);

                start();
            }

            impl_bridge (
                const std::string ip_,
                unsigned short port_,
                transmit_pipe_type* transmit_pipe_,
                receive_pipe_type* receive_pipe_
            ) :
                s(m),
                receive_thread_active(false),
                transmit_thread_active(false),
                port(port_),
                ip(ip_),
                transmit_pipe(transmit_pipe_),
                receive_pipe(receive_pipe_),
                dlog("dlib.bridge"),
                keepalive_code(0),
                message_code(1)
            {
                register_thread(*this, &impl_bridge::transmit_thread);
                register_thread(*this, &impl_bridge::receive_thread);
                register_thread(*this, &impl_bridge::connect_thread);

                start();
            }

            ~impl_bridge()
            {
                // tell the threads to terminate
                stop();

                // save current pipe enabled status so we can restore it to however
                // it was before this destructor ran.
                bool transmit_enabled = true;
                bool receive_enabled = true;

                // make any calls blocked on a pipe return immediately.
                if (transmit_pipe)
                {
                    transmit_enabled = transmit_pipe->is_dequeue_enabled();
                    transmit_pipe->disable_dequeue();
                }
                if (receive_pipe)
                {
                    receive_enabled = receive_pipe->is_enqueue_enabled();
                    receive_pipe->disable_enqueue();
                }

                {
                    auto_mutex lock(m);
                    s.broadcast();
                    // Shutdown the connection if we have one.  This will cause
                    // all blocked I/O calls to return an error.
                    if (con)
                        con->shutdown();
                }

                // wait for all the threads to terminate.
                wait();

                if (transmit_pipe && transmit_enabled)
                    transmit_pipe->enable_dequeue();
                if (receive_pipe && receive_enabled)
                    receive_pipe->enable_enqueue();
            }

            bridge_status get_bridge_status (
            ) const
            {
                auto_mutex lock(current_bs_mutex);
                return current_bs;
            }

        private:


            template <typename pipe_type>
            typename enable_if<is_convertible<bridge_status, typename pipe_type::type> >::type  enqueue_bridge_status (
                pipe_type* p,
                const bridge_status& status
            )
            {
                if (p)
                {
                    typename pipe_type::type temp(status);
                    p->enqueue(temp);
                }
            }

            template <typename pipe_type>
            typename disable_if<is_convertible<bridge_status, typename pipe_type::type> >::type  enqueue_bridge_status (
                pipe_type* ,
                const bridge_status& 
            )
            {
            }

            void connect_thread (
            )
            {
                while (!should_stop())
                {
                    auto_mutex lock(m);
                    int status = OTHER_ERROR;
                    if (list)
                    {
                        do
                        {
                            status = list->accept(con, 1000);
                        } while (status == TIMEOUT && !should_stop());
                    }
                    else
                    {
                        status = create_connection(con, port, ip);
                    }
                    
                    if (should_stop())
                        break;

                    if (status != 0)
                    {
                        // The last connection attempt failed.  So pause for a little bit before making another attempt.
                        s.wait_or_timeout(2000);
                        continue;
                    }

                    dlog << LINFO << "Established new connection to " << con->get_foreign_ip() << ":" << con->get_foreign_port() << ".";

                    bridge_status temp_bs;
                    {   auto_mutex lock(current_bs_mutex);
                        current_bs.is_connected = true;
                        current_bs.foreign_port = con->get_foreign_port();
                        current_bs.foreign_ip = con->get_foreign_ip();
                        temp_bs = current_bs;
                    }
                    enqueue_bridge_status(receive_pipe, temp_bs);


                    receive_thread_active = true;
                    transmit_thread_active = true;

                    s.broadcast();

                    // Wait for the transmit and receive threads to end before we continue.
                    // This way we don't invalidate the con pointer while it is in use.
                    while (receive_thread_active || transmit_thread_active)
                        s.wait();


                    dlog << LINFO << "Closed connection to " << con->get_foreign_ip() << ":" << con->get_foreign_port() << ".";
                    {   auto_mutex lock(current_bs_mutex);
                        current_bs.is_connected = false;
                        current_bs.foreign_port = con->get_foreign_port();
                        current_bs.foreign_ip = con->get_foreign_ip();
                        temp_bs = current_bs;
                    }
                    enqueue_bridge_status(receive_pipe, temp_bs);
                }

            }


            void receive_thread (
            )
            {
                while (true)
                {
                    // wait until we have a connection
                    {   auto_mutex lock(m);
                        while (!receive_thread_active && !should_stop())
                        {
                            s.wait();
                        }

                        if (should_stop())
                            break;
                    }



                    try
                    {
                        if (receive_pipe)
                        {
                            sockstreambuf buf(con);
                            std::istream in(&buf);
                            typename receive_pipe_type::type item;
                            // This isn't necessary but doing it avoids a warning about
                            // item being uninitialized sometimes.
                            assign_zero_if_built_in_scalar_type(item);

                            while (in.peek() != EOF)
                            {
                                unsigned char code;
                                in.read((char*)&code, sizeof(code));
                                if (code == message_code)
                                {
                                    deserialize(item, in);
                                    receive_pipe->enqueue(item);
                                }
                            }
                        }
                        else
                        {
                            // Since we don't have a receive pipe to put messages into we will
                            // just read the bytes from the connection and ignore them.
                            char buf[1000];
                            while (con->read(buf, sizeof(buf)) > 0) ;
                        }
                    }
                    catch (std::bad_alloc& )
                    {
                        dlog << LERROR << "std::bad_alloc thrown while deserializing message from " 
                            << con->get_foreign_ip() << ":" << con->get_foreign_port();
                    }
                    catch (dlib::serialization_error& e)
                    {
                        dlog << LERROR << "dlib::serialization_error thrown while deserializing message from " 
                            << con->get_foreign_ip() << ":" << con->get_foreign_port() 
                            << ".\nThe exception error message is: \n" << e.what();
                    }
                    catch (std::exception& e)
                    {
                        dlog << LERROR << "std::exception thrown while deserializing message from " 
                            << con->get_foreign_ip() << ":" << con->get_foreign_port() 
                            << ".\nThe exception error message is: \n" << e.what();
                    }




                    con->shutdown();
                    auto_mutex lock(m);
                    receive_thread_active = false;
                    s.broadcast();
                }

                auto_mutex lock(m);
                receive_thread_active = false;
                s.broadcast();
            }

            void transmit_thread (
            )
            {
                while (true)
                {
                    // wait until we have a connection
                    {   auto_mutex lock(m);
                        while (!transmit_thread_active && !should_stop())
                        {
                            s.wait();
                        }

                        if (should_stop())
                            break;
                    }



                    try
                    {
                        sockstreambuf buf(con);
                        std::ostream out(&buf);
                        typename transmit_pipe_type::type item;
                        // This isn't necessary but doing it avoids a warning about
                        // item being uninitialized sometimes.
                        assign_zero_if_built_in_scalar_type(item);


                        while (out)
                        {
                            bool dequeue_timed_out = false;
                            if (transmit_pipe )
                            {
                                if (transmit_pipe->dequeue_or_timeout(item,1000))
                                {
                                    out.write((char*)&message_code, sizeof(message_code));
                                    serialize(item, out);
                                    if (transmit_pipe->size() == 0)
                                        out.flush();

                                    continue;
                                }

                                dequeue_timed_out = (transmit_pipe->is_enabled() && transmit_pipe->is_dequeue_enabled());
                            }

                            // Pause for about a second.  Note that we use a wait_or_timeout() call rather 
                            // than sleep() here because we want to wake up immediately if this object is 
                            // being destructed rather than hang for a second.
                            if (!dequeue_timed_out)
                            {
                                auto_mutex lock(m);
                                if (should_stop())
                                    break;

                                s.wait_or_timeout(1000);
                            }
                            // Just send the keepalive byte periodically so we can
                            // tell if the connection is alive. 
                            out.write((char*)&keepalive_code, sizeof(keepalive_code));
                            out.flush();
                        }
                    }
                    catch (std::bad_alloc& )
                    {
                        dlog << LERROR << "std::bad_alloc thrown while serializing message to " 
                            << con->get_foreign_ip() << ":" << con->get_foreign_port();
                    }
                    catch (dlib::serialization_error& e)
                    {
                        dlog << LERROR << "dlib::serialization_error thrown while serializing message to " 
                            << con->get_foreign_ip() << ":" << con->get_foreign_port() 
                            << ".\nThe exception error message is: \n" << e.what();
                    }
                    catch (std::exception& e)
                    {
                        dlog << LERROR << "std::exception thrown while serializing message to " 
                            << con->get_foreign_ip() << ":" << con->get_foreign_port() 
                            << ".\nThe exception error message is: \n" << e.what();
                    }




                    con->shutdown();
                    auto_mutex lock(m);
                    transmit_thread_active = false;
                    s.broadcast();
                }

                auto_mutex lock(m);
                transmit_thread_active = false;
                s.broadcast();
            }

            mutex m;
            signaler s;
            bool receive_thread_active;
            bool transmit_thread_active;
            scoped_ptr<connection> con;
            scoped_ptr<listener> list;
            const unsigned short port;
            const std::string ip;
            transmit_pipe_type* const transmit_pipe;
            receive_pipe_type* const receive_pipe;
            logger dlog;
            const unsigned char keepalive_code;
            const unsigned char message_code;

            mutex current_bs_mutex;
            bridge_status current_bs;
        };
    }


// ----------------------------------------------------------------------------------------

    class bridge : noncopyable
    {
    public:

        bridge () {}

        template < typename T, typename U, typename V >
        bridge (
            T network_parameters,
            U pipe1,
            V pipe2 
        ) { reconfigure(network_parameters,pipe1,pipe2); }

        template < typename T, typename U>
        bridge (
            T network_parameters,
            U pipe 
        ) { reconfigure(network_parameters,pipe); }


        void clear (
        )
        {
            pimpl.reset();
        }

        template < typename T, typename R >
        void reconfigure (
            listen_on_port network_parameters,
            bridge_transmit_decoration<T> transmit_pipe,
            bridge_receive_decoration<R> receive_pipe
        ) { pimpl.reset(); pimpl.reset(new impl::impl_bridge<T,R>(network_parameters.port, &transmit_pipe.p, &receive_pipe.p)); }

        template < typename T, typename R >
        void reconfigure (
            listen_on_port network_parameters,
            bridge_receive_decoration<R> receive_pipe,
            bridge_transmit_decoration<T> transmit_pipe
        ) { pimpl.reset(); pimpl.reset(new impl::impl_bridge<T,R>(network_parameters.port, &transmit_pipe.p, &receive_pipe.p)); }

        template < typename T >
        void reconfigure (
            listen_on_port network_parameters,
            bridge_transmit_decoration<T> transmit_pipe
        ) { pimpl.reset(); pimpl.reset(new impl::impl_bridge<T,T>(network_parameters.port, &transmit_pipe.p, 0)); }

        template < typename R >
        void reconfigure (
            listen_on_port network_parameters,
            bridge_receive_decoration<R> receive_pipe
        ) { pimpl.reset(); pimpl.reset(new impl::impl_bridge<R,R>(network_parameters.port, 0, &receive_pipe.p)); }




        template < typename T, typename R >
        void reconfigure (
            connect_to_ip_and_port network_parameters,
            bridge_transmit_decoration<T> transmit_pipe,
            bridge_receive_decoration<R> receive_pipe
        ) { pimpl.reset(); pimpl.reset(new impl::impl_bridge<T,R>(network_parameters.ip, network_parameters.port, &transmit_pipe.p, &receive_pipe.p)); }

        template < typename T, typename R >
        void reconfigure (
            connect_to_ip_and_port network_parameters,
            bridge_receive_decoration<R> receive_pipe,
            bridge_transmit_decoration<T> transmit_pipe
        ) { pimpl.reset(); pimpl.reset(new impl::impl_bridge<T,R>(network_parameters.ip, network_parameters.port, &transmit_pipe.p, &receive_pipe.p)); }

        template < typename R >
        void reconfigure (
            connect_to_ip_and_port network_parameters,
            bridge_receive_decoration<R> receive_pipe
        ) { pimpl.reset(); pimpl.reset(new impl::impl_bridge<R,R>(network_parameters.ip, network_parameters.port, 0, &receive_pipe.p)); }

        template < typename T >
        void reconfigure (
            connect_to_ip_and_port network_parameters,
            bridge_transmit_decoration<T> transmit_pipe
        ) { pimpl.reset(); pimpl.reset(new impl::impl_bridge<T,T>(network_parameters.ip, network_parameters.port, &transmit_pipe.p, 0)); }


        bridge_status get_bridge_status (
        ) const
        {
            if (pimpl)
                return pimpl->get_bridge_status();
            else
                return bridge_status();
        }

    private:

        scoped_ptr<impl::impl_bridge_base> pimpl;
    };

// ---------------------------------------------------------------------------------------- 

}

#endif // DLIB_BRIDGe_Hh_

