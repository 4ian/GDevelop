// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_LINKER_KERNEL_1_CPp_
#define DLIB_LINKER_KERNEL_1_CPp_
#include "linker_kernel_1.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    
    linker::
    linker (
    ) :
        running(false),
        running_signaler(running_mutex),
        A(0),
        B(0),
        service_connection_running_signaler(service_connection_running_mutex)
    {
    }

// ----------------------------------------------------------------------------------------

    linker::
    linker (
        connection& a,
        connection& b
    ) :
        running(false),
        running_signaler(running_mutex),
        A(0),
        B(0),
        service_connection_running_signaler(service_connection_running_mutex)
    {
        link(a,b);
    }

// ----------------------------------------------------------------------------------------

    linker::
    ~linker (
    )
    {
        clear();
    }

// ----------------------------------------------------------------------------------------

    void linker::
    clear (
    )
    {

        // shutdown the connections
        cons_mutex.lock();
        if (A != 0 )
        {
            A->shutdown();
            A = 0;
        }
        if (B != 0)
        {
            B->shutdown();
            B = 0;
        }
        cons_mutex.unlock();
       

        // wait for the other threads to signal that they have ended
        running_mutex.lock();
        while (running == true)
        {
            running_signaler.wait();
        }
        running_mutex.unlock();

    }

// ----------------------------------------------------------------------------------------

    bool linker::
    is_running (
    ) const
    {
        running_mutex.lock();
        bool temp = running;
        running_mutex.unlock();
        return temp;
    }

// ----------------------------------------------------------------------------------------

    void linker::
    link (
        connection& a,
        connection& b
    )
    {
        // make sure requires clause is not broken
        DLIB_CASSERT( 
            this->is_running() == false ,
            "\tvoid linker::link"
            << "\n\tis_running() == " << this->is_running() 
            << "\n\tthis: " << this
            );

        running_mutex.lock();
        running = true;
        running_mutex.unlock();

        cons_mutex.lock();
        A = &a;
        B = &b;
        cons_mutex.unlock();

        

        service_connection_running_mutex.lock();
        service_connection_running = true;
        service_connection_running_mutex.unlock();

        service_connection_error_mutex.lock();
        service_connection_error = false;
        service_connection_error_mutex.unlock();

        // if we fail to make the thread
        if (!create_new_thread(service_connection,this))
        {
            a.shutdown();
            b.shutdown();

            service_connection_running_mutex.lock();
            service_connection_running = false;
            service_connection_running_mutex.unlock();

            cons_mutex.lock();
            A = 0;
            B = 0;
            cons_mutex.unlock();  

            running_mutex.lock();
            running = false;
            running_mutex.unlock();



            throw dlib::thread_error (
                ECREATE_THREAD,
                "failed to make new thread in linker::link()"
                );
        }



        // forward data from a to b
        char buf[200];
        int status;
        bool error = false; // becomes true if one of the connections returns an error
        while (true)
        {
            status = a.read(buf,sizeof(buf));
            // if there was an error reading from the socket
            if (status == OTHER_ERROR)
            {
                error = true;
                break;
            }
            else if (status == SHUTDOWN)
            {
                b.shutdown();
            }

            if (status <= 0)
            {
                // if a has closed normally
                if (status == 0)
                    b.shutdown_outgoing();
                break;            
            }

            status = b.write(buf,status);
            // if there was an error writing to the socket then break
            if (status == OTHER_ERROR)
            {
                error = true;
                break;
            }
            
            if (status <= 0)
                break;            
        }


        // if there was an error then shutdown both connections
        if (error)
        {
            a.shutdown();
            b.shutdown();
        }




        // wait for the other thread to end
        service_connection_running_mutex.lock();
        while(service_connection_running)
        {
            service_connection_running_signaler.wait();
        }
        service_connection_running_mutex.unlock();


        // make sure connections are shutdown
        a.shutdown();
        b.shutdown();


        // both threads have ended so the connections are no longer needed
        cons_mutex.lock();
        A = 0;
        B = 0;
        cons_mutex.unlock();


        // if service_connection terminated due to an error then set error to true
        service_connection_error_mutex.lock();
        if (service_connection_error)
            error = true;
        service_connection_error_mutex.unlock();


        // if we are ending because of an error
        if (error)
        {

            // signal that the link() function is ending
            running_mutex.lock();
            running = false;
            running_signaler.broadcast();
            running_mutex.unlock();

            // throw the exception for this error
            throw dlib::socket_error (
                ECONNECTION,
                "a connection returned an error in linker::link()"
                );
         
        }

        // signal that the link() function is ending
        running_mutex.lock();
        running = false;
        running_signaler.broadcast();
        running_mutex.unlock();
    }

// ----------------------------------------------------------------------------------------

    void linker::
    service_connection (
        void* param
    )
    {
        linker& p = *static_cast<linker*>(param);

        p.cons_mutex.lock();
        // if the connections are gone for whatever reason then return
        if (p.A == 0 || p.B == 0)
        {
            // signal that this function is ending
            p.service_connection_running_mutex.lock();
            p.service_connection_running = false;
            p.service_connection_running_signaler.broadcast();
            p.service_connection_running_mutex.unlock();
            return;
        }
        connection& a = *p.A;
        connection& b = *p.B;
        p.cons_mutex.unlock();



        // forward data from b to a
        char buf[200];
        int status;
        bool error = false;
        while (true)
        {
            status = b.read(buf,sizeof(buf));
            // if there was an error reading from the socket
            if (status == OTHER_ERROR)
            {
                error = true;
                break;
            }
            else if (status == SHUTDOWN)
            {
                a.shutdown();
            }


            if (status <= 0)
            {
                // if b has closed normally 
                if (status == 0)
                    a.shutdown_outgoing();
                break;            
            }


            status = a.write(buf,status);
            // if there was an error writing to the socket then break
            if (status == OTHER_ERROR)
            {
                error = true;
                break;
            }
            
            if (status <= 0)
                break;            
        }


        // if there was an error then shutdown both connections
        if (error)
        {
            a.shutdown();
            b.shutdown();
        }


        // if there was an error then signal that
        if (error)
        {
            p.service_connection_error_mutex.lock();
            p.service_connection_error = true;
            p.service_connection_error_mutex.unlock();
        }

        // signal that this function is ending
        p.service_connection_running_mutex.lock();
        p.service_connection_running = false;
        p.service_connection_running_signaler.broadcast();
        p.service_connection_running_mutex.unlock();

    }

// ----------------------------------------------------------------------------------------

}
#endif // DLIB_LINKER_KERNEL_1_CPp_

