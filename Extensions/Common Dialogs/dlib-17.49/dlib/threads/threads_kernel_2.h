// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_THREADS_KERNEl_2_
#define DLIB_THREADS_KERNEl_2_

#ifdef DLIB_ISO_CPP_ONLY
#error "DLIB_ISO_CPP_ONLY is defined so you can't use this OS dependent code.  Turn DLIB_ISO_CPP_ONLY off if you want to use it."
#endif

#include "threads_kernel_abstract.h"
#include <pthread.h>
#include <errno.h>
#include <sys/time.h>
#include "../algs.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------
    
    typedef pthread_t thread_id_type;

    inline thread_id_type get_thread_id (
    )
    {
        return pthread_self();
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
        )
        { 
            if (pthread_mutex_init(&myMutex,0)) 
            {
                throw dlib::thread_error(ECREATE_MUTEX,
        "in function mutex::mutex() an error occurred making the mutex"
                );      
            }
        }

        ~mutex (
        ) { pthread_mutex_destroy(&myMutex); }

        void lock (
        ) const { pthread_mutex_lock(&myMutex); }

        void unlock (
        ) const { pthread_mutex_unlock(&myMutex); }

    private:

        mutable pthread_mutex_t myMutex;

        // restricted functions
        mutex(mutex&);        // copy constructor
        mutex& operator=(mutex&);    // assignement opertor
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
            const mutex& assoc_mutex
        ) :
            associated_mutex(&assoc_mutex.myMutex),
            m(assoc_mutex)
        { 
            if (pthread_cond_init(&cond,0))
            {
                throw dlib::thread_error(ECREATE_SIGNALER,
        "in function signaler::signaler() an error occurred making the signaler"
                );      
            }
        }

        ~signaler (
        ) { pthread_cond_destroy(&cond); }

        void wait (
        ) const
        { 
            pthread_cond_wait(&cond,associated_mutex);
        }

        bool wait_or_timeout (
            unsigned long milliseconds
        ) const
        { 
            timespec time_to_wait;

            timeval curtime;
            gettimeofday(&curtime,0);

            // get the time and adjust the timespec object by the appropriate amount
            time_to_wait.tv_sec = milliseconds/1000 + curtime.tv_sec;
            time_to_wait.tv_nsec = curtime.tv_usec;
            time_to_wait.tv_nsec *= 1000; 
            time_to_wait.tv_nsec += (milliseconds%1000)*1000000;

            time_to_wait.tv_sec += time_to_wait.tv_nsec/1000000000;
            time_to_wait.tv_nsec = time_to_wait.tv_nsec%1000000000;

            if ( pthread_cond_timedwait(&cond,associated_mutex,&time_to_wait) == ETIMEDOUT)
            {
                return false;
            }
            else 
            {
                return true;
            }
        }

        void signal (
        ) const { pthread_cond_signal(&cond); }

        void broadcast (
        ) const { pthread_cond_broadcast(&cond); }

        const mutex& get_mutex (
        ) const { return m; }

    private:

        pthread_mutex_t* const associated_mutex;
        mutable pthread_cond_t  cond;
        const mutex& m;

        // restricted functions
        signaler(signaler&);        // copy constructor
        signaler& operator=(signaler&);    // assignement opertor
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
#include "threads_kernel_2.cpp"
#endif

#endif // DLIB_THREADS_KERNEl_2_

