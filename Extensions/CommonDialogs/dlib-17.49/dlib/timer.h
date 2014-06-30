// Copyright (C) 2005  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_TIMEr_
#define DLIB_TIMEr_

#include "timer/timer_kernel_1.h"
#include "timer/timer_kernel_2.h"
#include "uintn.h"

namespace dlib
{

    template <
        typename T
        >
    class timer
    {
        timer() {}



    public:
        
        //----------- kernels ---------------

        // kernel_1a
        typedef     timer_kernel_1<T>
                    kernel_1a;

        // kernel_2a
        typedef     timer_kernel_2<T>
                    kernel_2a;
    };
}

#endif // DLIB_TIMEr_

