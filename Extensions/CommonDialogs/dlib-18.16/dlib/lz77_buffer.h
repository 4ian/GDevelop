// Copyright (C) 2004  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_LZ77_BUFFEr_
#define DLIB_LZ77_BUFFEr_


#include "lz77_buffer/lz77_buffer_kernel_1.h"
#include "lz77_buffer/lz77_buffer_kernel_2.h"
#include "lz77_buffer/lz77_buffer_kernel_c.h"

#include "sliding_buffer.h"


namespace dlib
{


    class lz77_buffer
    {

        lz77_buffer() {}

        typedef sliding_buffer<unsigned char>::kernel_1a sb1;

    public:
        
        //----------- kernels ---------------

        // kernel_1a        
        typedef     lz77_buffer_kernel_1<sb1>   
                    kernel_1a;
        typedef     lz77_buffer_kernel_c<kernel_1a>
                    kernel_1a_c;


        // kernel_2a        
        typedef     lz77_buffer_kernel_2<sb1>   
                    kernel_2a;
        typedef     lz77_buffer_kernel_c<kernel_2a>
                    kernel_2a_c;
   

    };
}

#endif // DLIB_LZ77_BUFFEr_

