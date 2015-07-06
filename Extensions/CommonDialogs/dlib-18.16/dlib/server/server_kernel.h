// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_SERVER_KERNEL_1_
#define DLIB_SERVER_KERNEL_1_

#include "server_kernel_abstract.h"

#include "../threads.h"
#include "../sockets.h"
#include <string>
#include "../algs.h"
#include "../set.h"
#include "../logger.h"
#include "../smart_pointers.h"


namespace dlib
{

    // These forward declarations are here so we can use them in the typedefs in the server
    // class.  The reason for this is for backwards compatibility with previous versions of
    // dlib.
    class server_http;
    class server_iostream;

    class server
    {


        /*!
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
                max_connections         == 1000 
                max_connections_mutex   == a mutex for max_connections and graceful_close_timeout
                graceful_close_timeout  == 500 
             
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
        

        typedef set<connection*>::kernel_1a set_of_connections;

        // this structure is used to pass parameters to new threads
        struct param
        {
            param (
                server& server_,
                connection& new_connection_,
                unsigned long graceful_close_timeout_
            ) :
                the_server(server_),
                new_connection(new_connection_),
                graceful_close_timeout(graceful_close_timeout_)
            {}

            server& the_server;
            connection& new_connection;
            unsigned long graceful_close_timeout; 
        };
        


        public:

            // These typedefs are here for backward compatibility with previous versions of dlib
            typedef     server kernel_1a;
            typedef     server kernel_1a_c;
            typedef     server_iostream iostream_1a;
            typedef     server_iostream iostream_1a_c;
            typedef     server_http http_1a;
            typedef     server_http http_1a_c;

            server(
            );

            virtual ~server(
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

            void start_async (
            );

            void set_graceful_close_timeout (
                unsigned long timeout
            );

            unsigned long get_graceful_close_timeout (
            ) const;

        private:

            void start_async_helper (
            );

            void start_accepting_connections (
            );

            void open_listening_socket (
            );

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
            rmutex running_mutex;
            rsignaler running_signaler;
            mutex shutting_down_mutex;
            mutex cons_mutex;
            int thread_count;
            mutex thread_count_mutex;
            signaler thread_count_signaler;
            int max_connections;
            mutex max_connections_mutex;
            signaler thread_count_zero;
            scoped_ptr<thread_function> async_start_thread;
            scoped_ptr<listener> sock;
            unsigned long graceful_close_timeout;


            // restricted functions
            server(server&);   
            server& operator= (
                server&
                );    
    };

// ----------------------------------------------------------------------------------------

}

#ifdef NO_MAKEFILE
#include "server_kernel.cpp"
#endif

#endif // DLIB_SERVER_KERNEL_1_

