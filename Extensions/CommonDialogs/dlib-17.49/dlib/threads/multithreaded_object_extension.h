// Copyright (C) 2007  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_MULTITHREADED_OBJECT_EXTENSIOn_
#define DLIB_MULTITHREADED_OBJECT_EXTENSIOn_ 

#include "multithreaded_object_extension_abstract.h"
#include "threads_kernel.h"
#include "auto_mutex_extension.h"
#include "../threads.h"
#include "rmutex_extension.h"
#include "rsignaler_extension.h"
#include "../algs.h"
#include "../assert.h"
#include "../map.h"
#include "../member_function_pointer.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    class multithreaded_object
    {
        /*!
            INITIAL VALUE
                - is_running_ == false
                - should_stop_ == false
                - thread_ids.size() == 0
                - dead_threads.size() == 0
                - threads_started == 0

            CONVENTION
                - number_of_threads_registered() == thread_ids.size() + dead_threads.size()
                - number_of_threads_alive() == threads_started 

                - is_running() == is_running_
                - should_stop() == should_stop_

                - thread_ids == a map of current thread ids to the member function
                  pointers that that thread runs.  
                - threads_started == the number of threads that have been spawned to run 
                  thread_helper but haven't ended yet.
                  
                - dead_threads == a queue that contains all the member function pointers
                  for threads that are currently registered but not running

                - m_ == the mutex used to protect all our variables
                - s == the signaler for m_
        !*/

    public:

        multithreaded_object (
        );

        virtual ~multithreaded_object (
        ) = 0;

        void clear (
        );

        bool is_running (
        ) const;

        unsigned long number_of_threads_alive (
        ) const;

        unsigned long number_of_threads_registered (
        ) const;

        void wait (
        ) const;

        void start (
        );

        void pause (
        );

        void stop (
        );

    protected:

        bool should_stop (
        ) const;

        template <
            typename T
            >
        void register_thread (
            T& object,
            void (T::*thread)()
        )
        {
            auto_mutex M(m_);
            try
            {
                mfp mf;
                mf.set(object,thread);
                dead_threads.enqueue(mf);
                if (is_running_)
                    start();
            }
            catch (...)
            {
                is_running_ = false;
                should_stop_ = true;
                s.broadcast();
                throw;
            }
        }

    private:

        class raii_thread_helper
        {
        public:
            raii_thread_helper(multithreaded_object& self_, thread_id_type id_);
            ~raii_thread_helper();

            multithreaded_object& self;
            thread_id_type id;
        };

        void thread_helper(
        );

        typedef member_function_pointer<>::kernel_1a_c mfp;

        rmutex m_;
        rsignaler s;
        map<thread_id_type,mfp,memory_manager<char>::kernel_2a>::kernel_1a thread_ids;
        queue<mfp,memory_manager<char>::kernel_2a>::kernel_1a dead_threads;

        bool is_running_;
        bool should_stop_;
        unsigned long threads_started;

        // restricted functions
        multithreaded_object(multithreaded_object&);        // copy constructor
        multithreaded_object& operator=(multithreaded_object&);    // assignment operator
    };

// ----------------------------------------------------------------------------------------

}

#ifdef NO_MAKEFILE
#include "multithreaded_object_extension.cpp"
#endif

#endif // DLIB_MULTITHREADED_OBJECT_EXTENSIOn_

