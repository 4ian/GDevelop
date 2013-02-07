// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_BIGINt_
#define DLIB_BIGINt_

#include "bigint/bigint_kernel_1.h"
#include "bigint/bigint_kernel_2.h"
#include "bigint/bigint_kernel_c.h"




namespace dlib
{


    class bigint
    {
        bigint() {}


    public:
        
        //----------- kernels ---------------

        // kernel_1a        
        typedef     bigint_kernel_1
                    kernel_1a;
        typedef     bigint_kernel_c<kernel_1a>
                    kernel_1a_c;
          
        // kernel_2a        
        typedef     bigint_kernel_2
                    kernel_2a;
        typedef     bigint_kernel_c<kernel_2a>
                    kernel_2a_c;
          

    };
}

#endif // DLIB_BIGINt_

