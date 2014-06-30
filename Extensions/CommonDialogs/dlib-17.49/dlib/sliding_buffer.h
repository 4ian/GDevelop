// Copyright (C) 2004  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_SLIDING_BUFFEr_
#define DLIB_SLIDING_BUFFEr_


#include "sliding_buffer/sliding_buffer_kernel_1.h"
#include "sliding_buffer/sliding_buffer_kernel_c.h"
#include "sliding_buffer/circular_buffer.h"



namespace dlib
{

    template <
        typename T
        >
    class sliding_buffer
    {

        sliding_buffer() {}
    public:
        
        //----------- kernels ---------------

        // kernel_1a        
        typedef     sliding_buffer_kernel_1<T>    
                    kernel_1a;
        typedef     sliding_buffer_kernel_c<kernel_1a>
                    kernel_1a_c;
   

    };
}

#endif // DLIB_SLIDING_BUFFEr_

