// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_THREADS_KERNEl_1_
#define DLIB_THREADS_KERNEl_1_

#ifdef DLIB_ISO_CPP_ONLY
#error "DLIB_ISO_CPP_ONLY is defined so you can't use this OS dependent code.  Turn DLIB_ISO_CPP_ONLY off if you want to use it."
#endif

#include "threads_kernel_abstract.h"

#include "../windows_magic.h"
#include <windows.h>
#include "../algs.h"


namespace dlib
{

// ----------------------------------------------------------------------------------------
    
    typedef DWORD thread_id_type;

    inline thread_id_type get_thread_id (
    )
    {
        return GetCurrentThreadId();
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // mutex object
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    // forward declaration of signaler
    class signaler;

    class mutex
    {
    public:

        mutex (
        ) 
        {
            InitializeCriticalSection(&cs);
        }

        ~mutex (
        ) { DeleteCriticalSection(&cs); }

        void lock (
        ) const { EnterCriticalSection(&cs); }

        void unlock (
        ) const { LeaveCriticalSection(&cs); }

    private:

        mutable CRITICAL_SECTION cs;

        // restricted functions
        mutex(mutex&);        // copy constructor
        mutex& operator=(mutex&);    // assignment operator
    };

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // signaler object
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    class signaler
    {

    public:
        signaler (
            const mutex& associated_mutex
        ) :
            hSemaphore(CreateSemaphore (NULL, 0, 100000000, NULL)),
            waiters(0),
            hCountSema(CreateSemaphore (NULL,0,100000000,NULL)),
            m(associated_mutex)
        {           
            if (hSemaphore == NULL || hCountSema == NULL)
            {
                if (hSemaphore != NULL)
                {
                    CloseHandle(hSemaphore); 
                }

                if (hCountSema != NULL)
                {
                    CloseHandle(hCountSema); 
                }

                throw dlib::thread_error(ECREATE_SIGNALER,
        "in function signaler::signaler() an error occurred making the signaler"
                );        
            }
        }

        ~signaler (
        ) { CloseHandle(hSemaphore); CloseHandle(hCountSema);}

        void wait (
        ) const
        { 
            // get a lock on the mutex for the waiters variable
            waiters_mutex.lock();
            // mark that one more thread will be waiting on this signaler
            ++waiters;
            // release the mutex for waiters
            waiters_mutex.unlock();

            // release the associated mutex
            m.unlock();

            // wait for the semaphore to be signaled
            WaitForSingleObject (hSemaphore,INFINITE);

            // signal that we are awake
            ReleaseSemaphore(hCountSema,(LONG)1,NULL);

            // relock the associated mutex 
            m.lock();
        }

        bool wait_or_timeout (
            unsigned long milliseconds
        ) const
        { 
            // get a lock on the mutex for the waiters variable
            waiters_mutex.lock();
            // mark that one more thread will be waiting on this signaler
            ++waiters;
            // release the mutex for waiters
            waiters_mutex.unlock();

            // release the associated mutex
            m.unlock();

            bool value;

            // wait for the semaphore to be signaled
            if ( WaitForSingleObject (hSemaphore, milliseconds ) == WAIT_TIMEOUT )
            {
                // in this case we should decrement waiters because we are returning
                // due to a timeout rather than because someone called signal() or 
                // broadcast().
                value = false;

                // signal that we are awake
                ReleaseSemaphore(hCountSema,(LONG)1,NULL);

                // get a lock on the mutex for the waiters variable
                waiters_mutex.lock();
                // mark that one less thread will be waiting on this signaler. 
                if (waiters != 0)
                    --waiters;
                // release the mutex for waiters
                waiters_mutex.unlock();
            }
            else 
            {
                value = true;

                // signal that we are awake
                ReleaseSemaphore(hCountSema,(LONG)1,NULL);
            }


            // relock the associated mutex 
            m.lock();

            return value;
        }

        void signal (
        ) const 
        { 
            // get a lock on the mutex for the waiters variable
            waiters_mutex.lock();
            
            if (waiters > 0)
            {
                --waiters;
                // make the semaphore release one waiting thread
                ReleaseSemaphore(hSemaphore,1,NULL);

                // wait for signaled thread to wake up
                WaitForSingleObject(hCountSema,INFINITE);               
            }

            // release the mutex for waiters
            waiters_mutex.unlock();
        }

        void broadcast (
        ) const 
        { 
            // get a lock on the mutex for the waiters variable
            waiters_mutex.lock();
            
            if (waiters > 0)
            {   
                // make the semaphore release all the waiting threads
                ReleaseSemaphore(hSemaphore,(LONG)waiters,NULL);

                // wait for count to be zero
                for (unsigned long i = 0; i < waiters; ++i)
                {
                    WaitForSingleObject(hCountSema,INFINITE);
                }

                waiters = 0;
            }

            // release the mutex for waiters
            waiters_mutex.unlock();
        }

        const mutex& get_mutex (
        ) const { return m; }

    private:

        mutable HANDLE hSemaphore;

        mutable unsigned long waiters;
        mutex waiters_mutex;
        

        mutable HANDLE hCountSema;

        const mutex& m;

        // restricted functions
        signaler(signaler&);        // copy constructor
        signaler& operator=(signaler&);    // assignment operator
    };

// ----------------------------------------------------------------------------------------

    namespace threads_kernel_shared_helpers
    {
        bool spawn_thread (
            void (*funct)(void*),
            void* param
        );
        /*!
            is identical to create_new_thread() but just doesn't use any thread pooling.
        !*/
    }

// ----------------------------------------------------------------------------------------

}

#include "threads_kernel_shared.h"

#ifdef NO_MAKEFILE
#include "threads_kernel_1.cpp"
#endif

#endif // DLIB_THREADS_KERNEl_1_

