// Copyright (C) 2007  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_THREADED_OBJECT_EXTENSIOn_
#define DLIB_THREADED_OBJECT_EXTENSIOn_ 

#include "threaded_object_extension_abstract.h"
#include "threads_kernel.h"
#include "auto_mutex_extension.h"
#include "../algs.h"
#include "../assert.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    class threaded_object
    {
        /*!
            INITIAL VALUE
                - is_running_ == false
                - is_alive_ == false 
                - should_stop_ == false
                - should_respawn_ == false

#ifdef ENABLE_ASSERTS
                - id_valid == false 
                - id1 == get_main_thread_id()
#endif

            CONVENTION
                - is_running() == is_running_
                - is_alive() == is_alive_
                - should_stop() == should_stop_
                - should_respawn() == should_respawn_


#ifdef ENABLE_ASSERTS
                - if (when thread() is executing) then
                    - id1 == the id of the running thread 
                    - id_valid == true
                - else
                    - id1 == an undefined value
                    - id_valid == false
#endif

                - m_ == the mutex used to protect all our variables
                - s == the signaler for m_
        !*/

    public:

        threaded_object (
        );

        virtual ~threaded_object (
        );

        bool is_running (
        ) const;

        bool is_alive (
        ) const;

        void wait (
        ) const;

        void start (
        );

        void restart (
        );

        void set_respawn (
        );

        bool should_respawn (
        ) const;

        void pause (
        );

        void stop (
        );

    protected:

        bool should_stop (
        ) const;

    private:

        void thread_helper(
        );

        virtual void thread (
        ) = 0;

        mutex m_;
        signaler s;
        thread_id_type id1;
        bool is_running_;
        bool is_alive_;
        bool should_stop_;
        bool should_respawn_;
        bool id_valid;

        // restricted functions
        threaded_object(threaded_object&);        // copy constructor
        threaded_object& operator=(threaded_object&);    // assignment operator
    };

// ----------------------------------------------------------------------------------------

}

#ifdef NO_MAKEFILE
#include "threaded_object_extension.cpp"
#endif

#endif // DLIB_THREADED_OBJECT_EXTENSIOn_


