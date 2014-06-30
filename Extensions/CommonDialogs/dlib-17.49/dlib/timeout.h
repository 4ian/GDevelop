// Copyright (C) 2007  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_TIMEOUt_
#define DLIB_TIMEOUt_

#include "timeout/timeout_kernel_1.h"

namespace dlib
{

    class timeout
    {
        timeout() {}


    public:
        
        //----------- kernels ---------------

        // kernel_1a
        typedef     timeout_kernel_1
                    kernel_1a;

    };
}

#endif // DLIB_TIMEOUt_


