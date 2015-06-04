// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_LINKER_KERNEl_1_
#define DLIB_LINKER_KERNEl_1_

#include "linker_kernel_abstract.h"
#include "../threads.h"
#include "../sockets.h"
#include "../algs.h"


namespace dlib
{

    class linker 
    {

        /*!
            INITIAL VALUE
                running             == false
                A                   == 0
                B                   == 0
                running_mutex       == a mutex 
                running_signaler    == a signaler associated with running_mutex
                cons_mutex          == a mutex
                service_connection_running          == false
                service_connection_running_mutex    == a mutex
                service_connection_running_signaler == a signaler associated with 
                                                       service_connection_running_mutex

                service_connection_error        == false
                service_connection_error_mutex  == a mutex

               

            CONVENTION
                running             == is_running()
                running_mutex       == a mutex for running
                running_signaler    == a signaler for signaling when
                                       running becomes false and is associated with
                                       running_mutex
                cons_mutex          == a mutex for A and B

                service_connection_running          == true when service_connection() is
                                                       running or is about to run else
                                                       false
                service_connection_running_mutex    == a mutex for service_connection_running
                service_connection_running_signaler == a signaler associated with 
                                                       service_connection_running_mutex

                if (running) then
                    A               == address of a from link()
                    B               == address of b from link()
                else
                    A               == 0
                    B               == 0

                service_connection_error        == service_connection uses this bool
                                                   to indicate if it terminated due to 
                                                   an error or not
                service_connection_error_mutex  == a mutex for service_connection_error


        !*/

        public:

            // These two typedefs are here for backwards compatibility with previous
            // versions of dlib.
            typedef linker kernel_1a;
            typedef linker kernel_1a_c;

            linker(
            );

            linker (
                connection& a,
                connection& b
            );

            virtual ~linker(
            ); 

            void clear(
            );

            bool is_running(
            ) const;

            void link (
                connection& a,
                connection& b
            );


        private:

            static void service_connection (
                void* param
            );
            /*!
                requires
                    param == pointer to a linker object
                ensures
                    waits for data from b and forwards it to a and
                    if (b closes normally or is shutdown()) service_connection ends and
                    if (b closes normally) then a.shutdown_outgoing() is called and
                    if (a or b returns an error) then a and b are shutdown() 
            !*/


            // data members
            bool running;
            mutex running_mutex;
            signaler running_signaler;
            connection* A;
            connection* B;
            mutex cons_mutex;

            bool service_connection_running;
            mutex service_connection_running_mutex;
            signaler service_connection_running_signaler;

            bool service_connection_error;
            mutex service_connection_error_mutex;

            // restricted functions
            linker(linker&);        // copy constructor
            linker& operator=(linker&);    // assignment operator
    };



}

#ifdef NO_MAKEFILE
#include "linker_kernel_1.cpp"
#endif

#endif // DLIB_LINKER_KERNEl_1_

