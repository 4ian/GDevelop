// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_LINKEr_
#define DLIB_LINKEr_

#include "linker/linker_kernel_1.h"
#include "linker/linker_kernel_c.h"

#include "algs.h"



namespace dlib
{


    class linker
    {
        linker() {}

    public:
        
        //----------- kernels ---------------

        // kernel_1a        
        typedef     linker_kernel_1  
                    kernel_1a;
        typedef     linker_kernel_c<kernel_1a>
                    kernel_1a_c;
 

    };

}

#endif // DLIB_LINKEr_

