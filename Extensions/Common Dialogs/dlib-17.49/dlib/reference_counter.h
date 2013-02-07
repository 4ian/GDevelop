// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_REFERENCE_COUNTEr_
#define DLIB_REFERENCE_COUNTEr_

#include "reference_counter/reference_counter_kernel_1.h"
#include "algs.h"

namespace dlib
{

    template <
        typename T,
        typename copy = copy_functor<T>
        >
    class reference_counter
    {
        reference_counter() {}
    public:
        
        //----------- kernels ---------------

        // kernel_1a        
        typedef     reference_counter_kernel_1<T,copy>    
                    kernel_1a;

    };
}

#endif // DLIB_REFERENCE_COUNTEr_

