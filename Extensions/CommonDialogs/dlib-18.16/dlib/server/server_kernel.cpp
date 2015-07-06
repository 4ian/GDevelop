// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_SERVER_KERNEL_CPp_
#define DLIB_SERVER_KERNEL_CPp_

#include "server_kernel.h"
#include "../string.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    server::
    server (
    ) :
        listening_port(0),
        running(false),
        shutting_down(false),
        running_signaler(running_mutex),
        thread_count(0),
        thread_count_signaler(thread_count_mutex),
        max_connections(1000),
        thread_count_zero(thread_count_mutex),
        graceful_close_timeout(500)
    {
    }

// ----------------------------------------------------------------------------------------

    server::
    ~server (
    )
    {
        clear();
    }

// ----------------------------------------------------------------------------------------

    unsigned long server::
    get_graceful_close_timeout (
    ) const
    {
        auto_mutex lock(max_connections_mutex);
        return graceful_close_timeout;
    }

// ----------------------------------------------------------------------------------------

    void server::
    set_graceful_close_timeout (
        unsigned long timeout
    ) 
    {
        auto_mutex lock(max_connections_mutex);
        graceful_close_timeout = timeout;
    }

// ----------------------------------------------------------------------------------------


    int server::
    get_max_connections (
    ) const
    {
        max_connections_mutex.lock();
        int temp = max_connections;
        max_connections_mutex.unlock();
        return temp;
    }

// ----------------------------------------------------------------------------------------

    void server::
    set_max_connections (
        int max
    ) 
    {
        // make sure requires clause is not broken
        DLIB_CASSERT( 
            max >= 0 ,
            "\tvoid server::set_max_connections"
            << "\n\tmax == " << max
            << "\n\tthis: " << this
            );

        max_connections_mutex.lock();
        max_connections = max;
        max_connections_mutex.unlock();
    }

// ----------------------------------------------------------------------------------------

    void server::
    clear (
    )
    {
        // signal that we are shutting down
        shutting_down_mutex.lock();
        shutting_down = true;
        shutting_down_mutex.unlock();



        max_connections_mutex.lock();
        listening_port_mutex.lock();
        listening_ip_mutex.lock();
        listening_ip = "";        
        listening_port = 0;
        max_connections = 1000;
        graceful_close_timeout = 500;
        listening_port_mutex.unlock();
        listening_ip_mutex.unlock();
        max_connections_mutex.unlock();


        // tell all the connections to shut down
        cons_mutex.lock();
        connection* temp;
        while (cons.size() > 0)
        {
            cons.remove_any(temp);
            temp->shutdown();
        }
        cons_mutex.unlock();


        // wait for all the connections to shut down 
        thread_count_mutex.lock();
        while (thread_count > 0)
        {
            thread_count_zero.wait();
        }
        thread_count_mutex.unlock();
        



        // wait for the listener to close
        running_mutex.lock();
        while (running == true)
        {
            running_signaler.wait();
        }
        running_mutex.unlock();



        // signal that the shutdown is complete
        shutting_down_mutex.lock();
        shutting_down = false;
        shutting_down_mutex.unlock();
    }

// ----------------------------------------------------------------------------------------

    void server::
    start_async_helper (
    )
    {
        try
        {
            start_accepting_connections();
        }
        catch (std::exception& e)
        {
            sdlog << LERROR << e.what();
        }
    }

// ----------------------------------------------------------------------------------------

    void server::
    start_async (
    )
    {
        auto_mutex lock(running_mutex);
        if (running)
            return;

        // Any exceptions likely to be thrown by the server are going to be
        // thrown when trying to bind the port.  So calling this here rather
        // than in the thread we are about to make will cause start_async()
        // to report errors back to the user in a very straight forward way.
        open_listening_socket();

        async_start_thread.reset(new thread_function(make_mfp(*this,&server::start_async_helper)));
    }

// ----------------------------------------------------------------------------------------

    void server::
    open_listening_socket (
    )
    {
        if (!sock)
        {
            int status = create_listener(sock,listening_port,listening_ip);
            const int port_used = listening_port;

            // if there was an error then clear this object
            if (status < 0)
            {
                max_connections_mutex.lock();
                listening_port_mutex.lock();
                listening_ip_mutex.lock();
                listening_ip = "";        
                listening_port = 0;
                max_connections = 1000;
                graceful_close_timeout = 500;
                listening_port_mutex.unlock();
                listening_ip_mutex.unlock();
                max_connections_mutex.unlock();
            }



            // throw an exception for the error
            if (status == PORTINUSE)
            {
                throw dlib::socket_error(
                    EPORT_IN_USE,
                    "error occurred in server::start()\nport " + cast_to_string(port_used) + " already in use"
                );
            }
            else if (status == OTHER_ERROR)
            {
                throw dlib::socket_error(
                    "error occurred in server::start()\nunable to create listener"
                );            
            }
        }

        running_mutex.lock();
        running = true;
        running_mutex.unlock();
    }

// ----------------------------------------------------------------------------------------

    void server::
    start (
    )
    {
        // make sure requires clause is not broken
        DLIB_CASSERT( 
              this->is_running() == false,
            "\tvoid server::start"
            << "\n\tis_running() == " << this->is_running() 
            << "\n\tthis: " << this
            );

        start_accepting_connections();

    }

// ----------------------------------------------------------------------------------------

    void server::
    start_accepting_connections (
    )
    {
        open_listening_socket();

        // determine the listening port
        bool port_assigned = false;
        listening_port_mutex.lock();
        if (listening_port == 0)
        {
            port_assigned = true;
            listening_port = sock->get_listening_port();
        }
        listening_port_mutex.unlock();
        if (port_assigned)
            on_listening_port_assigned();
        


        int status = 0;

        connection* client;
        bool exit = false;
        while ( true )
        {


            // accept the next connection
            status = sock->accept(client,1000);


            // if there was an error then quit the loop
            if (status == OTHER_ERROR)
            {
                break;
            }

            shutting_down_mutex.lock();
            // if we are shutting down then signal that we should quit the loop
            exit = shutting_down;
            shutting_down_mutex.unlock();  


            // if we should be shutting down 
            if (exit)
            {
                // if a connection was opened then close it
                if (status == 0)
                    delete client;
                break;
            }



            // if the accept timed out
            if (status == TIMEOUT)
            {
                continue;       
            }





            // add this new connection to cons
            cons_mutex.lock();
            connection* client_temp = client;
            try{cons.add(client_temp);}
            catch(...)
            { 
                sock.reset();
                delete client;
                cons_mutex.unlock();

                // signal that we are not running start() anymore
                running_mutex.lock();
                running = false;
                running_signaler.broadcast();
                running_mutex.unlock();               
                

                clear(); 
                throw;
            }
            cons_mutex.unlock();


            // make a param structure
            param* temp = 0;
            try{
            temp = new param (
                            *this,
                            *client,
                            get_graceful_close_timeout() 
                            );
            } catch (...) 
            {
                sock.reset();
                delete client;
                running_mutex.lock();
                running = false;
                running_signaler.broadcast();
                running_mutex.unlock();
                clear(); 
                throw;
            }


            // if create_new_thread failed
            if (!create_new_thread(service_connection,temp))
            {
                delete temp;
                // close the listening socket
                sock.reset();

                // close the new connection and remove it from cons
                cons_mutex.lock();
                connection* ctemp;
                if (cons.is_member(client))
                {
                    cons.remove(client,ctemp);
                }
                delete client;
                cons_mutex.unlock();


                // signal that the listener has closed
                running_mutex.lock();
                running = false;
                running_signaler.broadcast();
                running_mutex.unlock();

                // make sure the object is cleared
                clear();

                // throw the exception
                throw dlib::thread_error(
                    ECREATE_THREAD,
                    "error occurred in server::start()\nunable to start thread"
                    );    
            }
            // if we made the new thread then update thread_count
            else
            {
                // increment the thread count
                thread_count_mutex.lock();
                ++thread_count;
                if (thread_count == 0)
                    thread_count_zero.broadcast();
                thread_count_mutex.unlock();
            }


            

            // check if we have hit the maximum allowed number of connections
            max_connections_mutex.lock();
            // if max_connections is zero or the loop is ending then skip this
            if (max_connections != 0)
            {
                // wait for thread_count to be less than max_connections
                thread_count_mutex.lock();
                while (thread_count >= max_connections)
                {
                    max_connections_mutex.unlock();
                    thread_count_signaler.wait();
                    max_connections_mutex.lock();     

                    // if we are shutting down the quit the loop
                    shutting_down_mutex.lock();
                    exit = shutting_down;
                    shutting_down_mutex.unlock();
                    if (exit)
                        break;
                }
                thread_count_mutex.unlock();
            }
            max_connections_mutex.unlock();

            if (exit)
            {
                break;
            }
        } //while ( true )


        // close the socket
        sock.reset();

        // signal that the listener has closed
        running_mutex.lock();
        running = false;
        running_signaler.broadcast();
        running_mutex.unlock();

        // if there was an error with accept then throw an exception
        if (status == OTHER_ERROR)
        {
            // make sure the object is cleared
            clear();

            // throw the exception
            throw dlib::socket_error(
             "error occurred in server::start()\nlistening socket returned error"
                );            
        }
    }

// ----------------------------------------------------------------------------------------

    bool server::
    is_running (
    ) const
    {
        running_mutex.lock();
        bool temp = running;
        running_mutex.unlock();
        return temp;
    }

// ----------------------------------------------------------------------------------------

    const std::string server::
    get_listening_ip (
    ) const
    {
        listening_ip_mutex.lock();
        std::string ip(listening_ip);
        listening_ip_mutex.unlock();
        return ip;
    }

// ----------------------------------------------------------------------------------------

    int server::
    get_listening_port (
    ) const
    {
        listening_port_mutex.lock();
        int port = listening_port;
        listening_port_mutex.unlock();        
        return port;
    }

// ----------------------------------------------------------------------------------------

    void server::
    set_listening_port (
        int port
    )
    {
        // make sure requires clause is not broken
        DLIB_CASSERT( 
            ( port >= 0 &&
              this->is_running() == false ),
            "\tvoid server::set_listening_port"
            << "\n\tport         == " << port
            << "\n\tis_running() == " << this->is_running() 
            << "\n\tthis: " << this
            );

        listening_port_mutex.lock();
        listening_port = port;
        listening_port_mutex.unlock();
    }

// ----------------------------------------------------------------------------------------

    void server::
    set_listening_ip (
        const std::string& ip
    )
    {
        // make sure requires clause is not broken
        DLIB_CASSERT( 
            ( ( is_ip_address(ip) || ip == "" ) &&
              this->is_running() == false ),
            "\tvoid server::set_listening_ip"
            << "\n\tip           == " << ip
            << "\n\tis_running() == " << this->is_running() 
            << "\n\tthis: " << this
            );

        listening_ip_mutex.lock();
        listening_ip = ip;
        listening_ip_mutex.unlock();
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // static member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    const logger server::sdlog("dlib.server");

    void server::
    service_connection(
        void* item
    )
    {
        param& p = *static_cast<param*>(item);


        p.the_server.on_connect(p.new_connection);


        // remove this connection from cons and close it
        p.the_server.cons_mutex.lock();
        connection* temp;
        if (p.the_server.cons.is_member(&p.new_connection))
            p.the_server.cons.remove(&p.new_connection,temp);
        p.the_server.cons_mutex.unlock();

        try{ close_gracefully(&p.new_connection, p.graceful_close_timeout); } 
        catch (...) { sdlog << LERROR << "close_gracefully() threw"; } 

        // decrement the thread count and signal if it is now zero
        p.the_server.thread_count_mutex.lock();
        --p.the_server.thread_count;
        p.the_server.thread_count_signaler.broadcast();
        if (p.the_server.thread_count == 0)
            p.the_server.thread_count_zero.broadcast();
        p.the_server.thread_count_mutex.unlock();

        delete &p;


    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_SERVER_KERNEL_CPp_

