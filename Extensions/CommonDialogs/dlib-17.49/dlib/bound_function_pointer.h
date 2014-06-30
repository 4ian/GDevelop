// Copyright (C) 2008  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_BOUND_FUNCTION_POINTEr_
#define DLIB_BOUND_FUNCTION_POINTEr_

#include "bound_function_pointer/bound_function_pointer_kernel_1.h"
#include "bound_function_pointer/bound_function_pointer_kernel_c.h"

namespace dlib
{

    class bound_function_pointer 
    {
        bound_function_pointer() {}


    public:
        
        //----------- kernels ---------------

        // kernel_1a        
        typedef      bound_function_pointer_kernel_1 
                     kernel_1a;
        typedef      bound_function_pointer_kernel_c<kernel_1a>
                     kernel_1a_c;
           

    };
}

#endif // DLIB_BOUND_FUNCTION_POINTEr_ 


