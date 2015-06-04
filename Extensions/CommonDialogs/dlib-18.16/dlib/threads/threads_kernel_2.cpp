// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_THREADS_KERNEL_2_CPp_
#define DLIB_THREADS_KERNEL_2_CPp_

#include "../platform.h"

#ifdef POSIX

#include "threads_kernel_2.h"


namespace dlib
{
    namespace threads_kernel_shared_helpers
    {

    // -----------------------------------------------------------------------------------

        struct info
        {
            void* param;
            void (*funct)(void*);
        };

    // -----------------------------------------------------------------------------------

        void* thread_starter (
            void* param
        )
        {
            info* alloc_p = static_cast<info*>(param);
            info p = *alloc_p;
            delete alloc_p;

            // detach self
            pthread_detach(pthread_self());

            p.funct(p.param);
            return 0;
        }

    // -----------------------------------------------------------------------------------

        bool spawn_thread (
            void (*funct)(void*),
            void* param
        )
        {
            info* p;
            try { p = new info; }
            catch (...) { return false; }

            p->funct = funct;
            p->param = param;

            pthread_t thread_id;
            if ( pthread_create (&thread_id, 0, thread_starter, p) )
            {
                delete p;
                return false;
            }
            return true;
        }

    // -----------------------------------------------------------------------------------

    }

}

#endif // POSIX

#endif // DLIB_THREADS_KERNEL_2_CPp_

