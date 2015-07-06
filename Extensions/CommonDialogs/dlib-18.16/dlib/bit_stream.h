// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_BIT_STREAm_
#define DLIB_BIT_STREAm_

#include "bit_stream/bit_stream_kernel_1.h"
#include "bit_stream/bit_stream_kernel_c.h"

#include "bit_stream/bit_stream_multi_1.h"
#include "bit_stream/bit_stream_multi_c.h"

namespace dlib
{


    class bit_stream
    {
        bit_stream() {}
    public:
        
        //----------- kernels ---------------

        // kernel_1a        
        typedef     bit_stream_kernel_1    
                    kernel_1a;
        typedef     bit_stream_kernel_c<kernel_1a >
                    kernel_1a_c;

        //---------- extensions ------------

        
        // multi_1 extend kernel_1a
        typedef     bit_stream_multi_1<kernel_1a>
                    multi_1a;
        typedef     bit_stream_multi_c<bit_stream_multi_1<kernel_1a_c> >
                    multi_1a_c;

    };
}

#endif // DLIB_BIT_STREAm_

