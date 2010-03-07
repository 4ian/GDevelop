// Copyright (C) 2003  Davis E. King (davisking@users.sourceforge.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_SERVER_KERNEL_1_
#define DLIB_SERVER_KERNEL_1_

#include "server_kernel_abstract.h"

// non-templatable dependencies
#include "../threads.h"
#include "../sockets.h"
#include <string>
#include "../algs.h"
#include "../logger.h"


namespace dlib
{


    template <
        typename set_of_connections
        >
    class server_kernel_1
    {

        /*!
            REQUIREMENTS ON set_of_connections
                implements set/set_kernel_abstract.h or hash_set/hash_set_kernel_abstract.h
                and is a set/hash_set of dlib::connection*


            INITIAL VALUE
                listening_port          == 0
                listening_ip            == ""
                running                 == false
                shutting_down           == false
                cons.size()             == 0
                listening_port_mutex    == a mutex
                listening_ip_mutex      == a mutex
                running_mutex           == a mutex
                running_signaler        == a signaler associated with running_mutex
                shutting_down_mutex     == a mutex
                cons_mutex              == a mutex
                thread_count            == 0
                thread_count_mutex      == a mutex
                thread_count_signaler   == a signaler associated with thread_count_mutex
                thread_count_zero       == a signaler associated with thread_count_mutex
                max_connections         == 0
                max_connections_mutex   == a mutex for max_connections
             
            CONVENTION
                listening_port          == get_listening_port()
                listening_ip            == get_listening_ip()
                running                 == is_running()
                shutting_down           == true while clear() is running.  this
                                           bool is used to tell the thread blocked on
                                           accept that it should terminate
                cons                    == a set containing all open connections
                listening_port_mutex    == a mutex for listening_port
                listening_ip_mutex      == a mutex for listening_ip
                running_mutex           == a mutex for running
                running_signaler        == a signaler for running and
                                           is associated with running_mutex.  it is 
                                           used to signal when running is false
                shutting_down_mutex     == a mutex for shutting_down
                cons_mutex              == a mutex for cons
                thread_count            == the number of threads currently running
                thread_count_mutex      == a mutex for thread_count
                thread_count_signaler   == a signaler for thread_count and
                                           is associated with thread_count_mutex.  it
                                           is used to signal when thread_count is
                                           decremented  
                thread_count_zero       == a signaler for thread_count and
                                           is associated with thread_count_mutex.  it
                                           is used to signal when thread_count becomes
                                           zero
                max_connections         == get_max_connections()
                max_connections_mutex   == a mutex for max_connections
        !*/
        


        // this structure is used to pass parameters to new threads
        struct param
        {
            param (
                server_kernel_1<set_of_connections>& server_,
                connection& new_connection_
            ) :
                server(server_),
                new_connection(new_connection_)
            {}

            server_kernel_1<set_of_connections>& server;
            connection& new_connection;
        };
        


        public:

            server_kernel_1(
            );

            virtual ~server_kernel_1(
            ); 

            void clear(
            );

            void start (
            );

            bool is_running ( 
            ) const;

            const std::string get_listening_ip (
            ) const;

            int get_listening_port (
            ) const;

            void set_listening_port (
                int port
            );

            void set_listening_ip (
                const std::string& ip
            );

            void set_max_connections (
                int max
            );

            int get_max_connections (
            ) const;


        private:

            virtual void on_connect (
                connection& new_connection
            )=0;

            virtual void on_listening_port_assigned (
            ) {}

            const static logger sdlog;

            static void service_connection(
                void* item
            );
            /*!
                requires
                    item is a pointer to a param struct
                ensures
                    services the new connection
                    will take care of closing the connection and 
                    adding the connection to cons when it first starts and
                    remove the connection from cons and signal that it has 
                    done so when it ends
            !*/

            // data members
            int listening_port;
            std::string listening_ip;
            bool running;
            bool shutting_down;
            set_of_connections cons;
            mutex listening_port_mutex;
            mutex listening_ip_mutex;
            mutex running_mutex;
            signaler running_signaler;
            mutex shutting_down_mutex;
            mutex cons_mutex;
            int thread_count;
            mutex thread_count_mutex;
            signaler thread_count_signaler;
            int max_connections;
            mutex max_connections_mutex;
            signaler thread_count_zero;


            // restricted functions
            server_kernel_1(server_kernel_1<set_of_connections>&);   
            server_kernel_1<set_of_connections>& operator= (
                server_kernel_1<set_of_connections>&
                );    
    };

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename set_of_connections
        >
    server_kernel_1<set_of_connections>::
    server_kernel_1 (
    ) :
        listening_port(0),
        running(false),
        shutting_down(false),
        running_signaler(running_mutex),
        thread_count(0),
        thread_count_signaler(thread_count_mutex),
        max_connections(0),
        thread_count_zero(thread_count_mutex)
    {
    }

// ----------------------------------------------------------------------------------------

    template <
        typename set_of_connections
        >
    server_kernel_1<set_of_connections>::
    ~server_kernel_1 (
    )
    {
        clear();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename set_of_connections
        >
    int server_kernel_1<set_of_connections>::
    get_max_connections (
    ) const
    {
        max_connections_mutex.lock();
        int temp = max_connections;
        max_connections_mutex.unlock();
        return temp;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename set_of_connections
        >
    void server_kernel_1<set_of_connections>::
    set_max_connections (
        int max
    ) 
    {
        max_connections_mutex.lock();
        max_connections = max;
        max_connections_mutex.unlock();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename set_of_connections
        >
    void server_kernel_1<set_of_connections>::
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
        max_connections = 0;
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

    template <
        typename set_of_connections
        >
    void server_kernel_1<set_of_connections>::
    start (
    )
    {
  
        listener* sock;
        int status = create_listener(sock,listening_port,listening_ip);

        // if there was an error then clear this object
        if (status < 0)
        {
            max_connections_mutex.lock();
            listening_port_mutex.lock();
            listening_ip_mutex.lock();
            listening_ip = "";        
            listening_port = 0;
            max_connections = 0;
            listening_port_mutex.unlock();
            listening_ip_mutex.unlock();
            max_connections_mutex.unlock();
        }

        

        // throw an exception for the error
        if (status == PORTINUSE)
        {
            throw dlib::socket_error(
                EPORT_IN_USE,
                "error occurred in server_kernel_1::start()\nport already in use"
                );
        }
        else if (status == OTHER_ERROR)
        {
            throw dlib::socket_error(
                EOTHER,
                "error occurred in server_kernel_1::start()\nunable to crate listener"
                );            
        }

        running_mutex.lock();
        running = true;
        running_mutex.unlock();

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
                delete sock;
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
            param* temp;
            try{
            temp = new param (
                            *this,
                            *client
                            );
            } catch (...) 
            {
                delete sock;
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
                delete sock;

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
                    "error occurred in server_kernel_1::start()\nunable to start thread"
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
        delete sock;

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
                EOTHER,
             "error occurred in server_kernel_1::start()\nlistening socket returned error"
                );            
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename set_of_connections
        >
    bool server_kernel_1<set_of_connections>::
    is_running (
    ) const
    {
        running_mutex.lock();
        bool temp = running;
        running_mutex.unlock();
        return temp;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename set_of_connections
        >
    const std::string server_kernel_1<set_of_connections>::
    get_listening_ip (
    ) const
    {
        listening_ip_mutex.lock();
        std::string ip(listening_ip);
        listening_ip_mutex.unlock();
        return ip;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename set_of_connections
        >
    int server_kernel_1<set_of_connections>::
    get_listening_port (
    ) const
    {
        listening_port_mutex.lock();
        int port = listening_port;
        listening_port_mutex.unlock();        
        return port;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename set_of_connections
        >
    void server_kernel_1<set_of_connections>::
    set_listening_port (
        int port
    )
    {
        listening_port_mutex.lock();
        listening_port = port;
        listening_port_mutex.unlock();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename set_of_connections
        >
    void server_kernel_1<set_of_connections>::
    set_listening_ip (
        const std::string& ip
    )
    {
        listening_ip_mutex.lock();
        listening_ip = ip;
        listening_ip_mutex.unlock();
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // static member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename soc
        >
    const logger server_kernel_1<soc>::sdlog("dlib.server");

    template <
        typename soc
        >
    void server_kernel_1<soc>::
    service_connection(
        void* item
    )
    {
        param& p = *reinterpret_cast<param*>(item);


        p.server.on_connect(p.new_connection);


        // remove this connection from cons and close it
        p.server.cons_mutex.lock();
        connection* temp;
        if (p.server.cons.is_member(&p.new_connection))
            p.server.cons.remove(&p.new_connection,temp);
        try{ close_gracefully(&p.new_connection); } 
        catch (...) { sdlog << LERROR << "close_gracefully() threw"; } 
        p.server.cons_mutex.unlock();

        // decrement the thread count and signal if it is now zero
        p.server.thread_count_mutex.lock();
        --p.server.thread_count;
        p.server.thread_count_signaler.broadcast();
        if (p.server.thread_count == 0)
            p.server.thread_count_zero.broadcast();
        p.server.thread_count_mutex.unlock();

        delete &p;


    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_SERVER_KERNEL_1_

