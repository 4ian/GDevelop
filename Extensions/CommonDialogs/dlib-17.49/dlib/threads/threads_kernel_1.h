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
        // give signaler access to hMutex
        friend class signaler;
    public:

        mutex (
        ) :
            hMutex(CreateMutex(NULL,FALSE,NULL))
        {
            if (hMutex == NULL)
            {
                throw dlib::thread_error(ECREATE_MUTEX,
        "in function mutex::mutex() an error occurred making the mutex"
                );           
            }
        }

        ~mutex (
        ) { CloseHandle(hMutex); }

        void lock (
        ) const { WaitForSingleObject (hMutex,INFINITE); }

        void unlock (
        ) const { ReleaseMutex(hMutex); }

    private:

        mutable HANDLE hMutex;

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
            hWaitersMutex(CreateMutex(NULL,FALSE,NULL)),
            hCountSema(CreateSemaphore (NULL,0,100000000,NULL)),
            m(associated_mutex)
        {           
            if (hSemaphore == NULL || hWaitersMutex == NULL || hCountSema == NULL)
            {
                if (hSemaphore != NULL)
                {
                    CloseHandle(hSemaphore); 
                }

                if (hWaitersMutex != NULL)
                {
                    CloseHandle(hWaitersMutex); 
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
        ) { CloseHandle(hSemaphore); CloseHandle(hWaitersMutex); CloseHandle(hCountSema);}

        void wait (
        ) const
        { 
            // get a lock on the mutex for the waiters variable
            WaitForSingleObject (hWaitersMutex,INFINITE);
            // mark that one more thread will be waiting on this signaler
            ++waiters;
            // release the mutex for waiters
            ReleaseMutex(hWaitersMutex);

            // release the assocaited mutex
            ReleaseMutex(m.hMutex);

            // wait for the semaphore to be signaled
            WaitForSingleObject (hSemaphore,INFINITE);

            // signal that we are awake
            ReleaseSemaphore(hCountSema,(LONG)1,NULL);

            // relock the associated mutex 
            WaitForSingleObject (m.hMutex,INFINITE);  
        }

        bool wait_or_timeout (
            unsigned long milliseconds
        ) const
        { 
            // get a lock on the mutex for the waiters variable
            WaitForSingleObject (hWaitersMutex,INFINITE);
            // mark that one more thread will be waiting on this signaler
            ++waiters;
            // release the mutex for waiters
            ReleaseMutex(hWaitersMutex);

            // release the assocaited mutex
            ReleaseMutex(m.hMutex);

            bool value;

            // wait for the semaphore to be signaled
            if ( WaitForSingleObject (hSemaphore, milliseconds ) == WAIT_TIMEOUT )
            {
                // in this case we should decrement waiters because we are returning
                // due to a timeout rather than because someone called signal() or 
                // broadcast().
                value = false;

                // get a lock on the mutex for the waiters variable
                WaitForSingleObject (hWaitersMutex,INFINITE);
                // mark that one less thread will be waiting on this signaler. 
                if (waiters != 0)
                    --waiters;
                // release the mutex for waiters
                ReleaseMutex(hWaitersMutex);
            }
            else 
            {
                value = true;
            }

            // signal that we are awake
            ReleaseSemaphore(hCountSema,(LONG)1,NULL);

            // relock the associated mutex 
            WaitForSingleObject (m.hMutex,INFINITE);  

            return value;
        }

        void signal (
        ) const 
        { 
            // get a lock on the mutex for the waiters variable
            WaitForSingleObject (hWaitersMutex,INFINITE);
            
            if (waiters > 0)
            {
                --waiters;
                // make the semaphore release one waiting thread
                ReleaseSemaphore(hSemaphore,1,NULL);

                // wait for signaled thread to wake up
                WaitForSingleObject(hCountSema,INFINITE);               
            }

            // release the mutex for waiters
            ReleaseMutex(hWaitersMutex);             
        }

        void broadcast (
        ) const 
        { 
            // get a lock on the mutex for the waiters variable
            WaitForSingleObject (hWaitersMutex,INFINITE);
            
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
            ReleaseMutex(hWaitersMutex);               
        }

        const mutex& get_mutex (
        ) const { return m; }

    private:

        mutable HANDLE hSemaphore;

        mutable unsigned long waiters;
        mutable HANDLE hWaitersMutex;
        

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

