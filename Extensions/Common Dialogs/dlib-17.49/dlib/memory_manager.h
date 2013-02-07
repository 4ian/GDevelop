// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_MEMORY_MANAGEr_
#define DLIB_MEMORY_MANAGEr_

#include "memory_manager/memory_manager_kernel_1.h"
#include "memory_manager/memory_manager_kernel_2.h"
#include "memory_manager/memory_manager_kernel_3.h"



namespace dlib
{

    template <
        typename T
        >
    class memory_manager
    {
        memory_manager() {}


    public:
        
        //----------- kernels ---------------

        // kernel_1        
        typedef      memory_manager_kernel_1<T,0>
                     kernel_1a;
        typedef      memory_manager_kernel_1<T,10>
                     kernel_1b;
        typedef      memory_manager_kernel_1<T,100>
                     kernel_1c;
        typedef      memory_manager_kernel_1<T,1000>
                     kernel_1d;
        typedef      memory_manager_kernel_1<T,10000>
                     kernel_1e;
        typedef      memory_manager_kernel_1<T,100000>
                     kernel_1f;
      
        // kernel_2        
        typedef      memory_manager_kernel_2<T,10>
                     kernel_2a;
        typedef      memory_manager_kernel_2<T,100>
                     kernel_2b;
        typedef      memory_manager_kernel_2<T,1000>
                     kernel_2c;
        typedef      memory_manager_kernel_2<T,10000>
                     kernel_2d;
        typedef      memory_manager_kernel_2<T,100000>
                     kernel_2e;
      
      
        // kernel_3        
        typedef      memory_manager_kernel_3<T,10>
                     kernel_3a;
        typedef      memory_manager_kernel_3<T,100>
                     kernel_3b;
        typedef      memory_manager_kernel_3<T,1000>
                     kernel_3c;
        typedef      memory_manager_kernel_3<T,10000>
                     kernel_3d;
        typedef      memory_manager_kernel_3<T,100000>
                     kernel_3e;
      
      
           

    };
}

#endif // DLIB_MEMORY_MANAGEr_

