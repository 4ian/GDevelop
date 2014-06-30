// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef _SOCKSTREAMBUf_
#define _SOCKSTREAMBUf_

#include "sockstreambuf/sockstreambuf_kernel_1.h"
#include "sockstreambuf/sockstreambuf_kernel_2.h"


namespace dlib
{


    class sockstreambuf
    {
        sockstreambuf() {}


    public:
        
        //----------- kernels ---------------

        // kernel_1a        
        typedef     sockstreambuf_kernel_1
                    kernel_1a;
          
        // kernel_2a        
        typedef     sockstreambuf_kernel_2
                    kernel_2a;
          

    };
}

#endif

