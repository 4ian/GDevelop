// Copyright (C) 2006  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_MEMORY_MANAGER_GLOBAl_
#define DLIB_MEMORY_MANAGER_GLOBAl_

#include "memory_manager_global/memory_manager_global_kernel_1.h"
#include "memory_manager.h"



namespace dlib
{

    template <
        typename T,
        typename factory
        >
    class memory_manager_global
    {
        memory_manager_global() {}


    public:
        
        //----------- kernels ---------------

        // kernel_1        
        typedef      memory_manager_global_kernel_1<T,factory>
                     kernel_1a;
      
      
           

    };
}

#endif // DLIB_MEMORY_MANAGER_GLOBAl_

