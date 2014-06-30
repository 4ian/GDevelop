// Copyright (C) 2006  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_CREATE_NEW_THREAD_EXTENSIOn_
#define DLIB_CREATE_NEW_THREAD_EXTENSIOn_ 

#include "threads_kernel_abstract.h"
#include "create_new_thread_extension_abstract.h"
#include "../threads.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        void (T::*funct)()
        >
    inline void dlib_create_new_thread_helper (
        void* obj
    )
    {
        T* o = static_cast<T*>(obj);
        (o->*funct)();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        void (T::*funct)()
        >
    inline bool create_new_thread (
        T& obj
    )
    {
        return create_new_thread(dlib_create_new_thread_helper<T,funct>,&obj);
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_CREATE_NEW_THREAD_EXTENSIOn_


