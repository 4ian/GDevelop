// Copyright (C) 2003  Davis E. King (davisking@users.sourceforge.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_STACk_
#define DLIB_STACk_

#include "stack/stack_kernel_1.h"
#include "stack/stack_kernel_c.h"
#include "memory_manager.h"

namespace dlib
{

    template <
        typename T,
        typename mem_manager = memory_manager<char>::kernel_1a
        >
    class stack
    {
        stack() {}
    public:
        
        //----------- kernels ---------------

        // kernel_1a        
        typedef     stack_kernel_1<T,mem_manager>    
                    kernel_1a;
        typedef     stack_kernel_c<kernel_1a>
                    kernel_1a_c;
 
    };
}

#endif // DLIB_STACk_

