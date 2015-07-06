// Copyright (C) 2006  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_CREATE_NEW_THREAD_EXTENSIOn_ABSTRACT_
#ifdef DLIB_CREATE_NEW_THREAD_EXTENSIOn_ABSTRACT_ 

#include "threads_kernel_abstract.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        void (T::*funct)()
        >
    bool create_new_thread (
        T& obj
    );
    /*!
        ensures
            - creates a new thread and calls obj.*funct() from it.
            - returns true upon success and false upon failure to create the new thread.
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_CREATE_NEW_THREAD_EXTENSIOn_ABSTRACT_



