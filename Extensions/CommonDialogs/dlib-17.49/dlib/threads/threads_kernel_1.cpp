// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_THREADS_KERNEL_1_CPp_
#define DLIB_THREADS_KERNEL_1_CPp_

#include "../platform.h"

#ifdef WIN32

#include "threads_kernel_1.h"

#include <process.h>


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

        unsigned int __stdcall thread_starter (
            void* param
        )
        {
            info* alloc_p = static_cast<info*>(param);
            info p = *alloc_p;
            delete alloc_p;

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


            unsigned int garbage;

            HANDLE thandle = (HANDLE)_beginthreadex (NULL,0,thread_starter,p,0,&garbage);
            // make thread and add it to the pool

            // return false if _beginthreadex didn't work
            if ( thandle == 0)
            {
                delete p;
                return false;
            }

            // throw away the thread handle
            CloseHandle(thandle); 
            return true;
        }

    // -----------------------------------------------------------------------------------

    }

}

#endif // WIN32

#endif // DLIB_THREADS_KERNEL_1_CPp_

