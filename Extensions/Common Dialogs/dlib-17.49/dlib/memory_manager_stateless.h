// Copyright (C) 2006  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_MEMORY_MANAGER_STATELESs_
#define DLIB_MEMORY_MANAGER_STATELESs_

#include "memory_manager_stateless/memory_manager_stateless_kernel_1.h"
#include "memory_manager_stateless/memory_manager_stateless_kernel_2.h"
#include "memory_manager.h"



namespace dlib
{

    template <
        typename T
        >
    class memory_manager_stateless
    {
        memory_manager_stateless() {}


    public:
        
        //----------- kernels ---------------

        // kernel_1        
        typedef      memory_manager_stateless_kernel_1<T>
                     kernel_1a;
      
        // kernel_2        
        typedef      memory_manager_stateless_kernel_2<T,memory_manager<char>::kernel_1a>
                     kernel_2_1a;
        typedef      memory_manager_stateless_kernel_2<T,memory_manager<char>::kernel_1b>
                     kernel_2_1b;
        typedef      memory_manager_stateless_kernel_2<T,memory_manager<char>::kernel_1c>
                     kernel_2_1c;
        typedef      memory_manager_stateless_kernel_2<T,memory_manager<char>::kernel_1d>
                     kernel_2_1d;
        typedef      memory_manager_stateless_kernel_2<T,memory_manager<char>::kernel_1e>
                     kernel_2_1e;
        typedef      memory_manager_stateless_kernel_2<T,memory_manager<char>::kernel_1f>
                     kernel_2_1f;

        typedef      memory_manager_stateless_kernel_2<T,memory_manager<char>::kernel_2a>
                     kernel_2_2a;
        typedef      memory_manager_stateless_kernel_2<T,memory_manager<char>::kernel_2b>
                     kernel_2_2b;
        typedef      memory_manager_stateless_kernel_2<T,memory_manager<char>::kernel_2c>
                     kernel_2_2c;
        typedef      memory_manager_stateless_kernel_2<T,memory_manager<char>::kernel_2d>
                     kernel_2_2d;
        typedef      memory_manager_stateless_kernel_2<T,memory_manager<char>::kernel_2e>
                     kernel_2_2e;
      
        typedef      memory_manager_stateless_kernel_2<T,memory_manager<char>::kernel_3a>
                     kernel_2_3a;
        typedef      memory_manager_stateless_kernel_2<T,memory_manager<char>::kernel_3b>
                     kernel_2_3b;
        typedef      memory_manager_stateless_kernel_2<T,memory_manager<char>::kernel_3c>
                     kernel_2_3c;
        typedef      memory_manager_stateless_kernel_2<T,memory_manager<char>::kernel_3d>
                     kernel_2_3d;
        typedef      memory_manager_stateless_kernel_2<T,memory_manager<char>::kernel_3e>
                     kernel_2_3e;
      

    };
}

#endif // DLIB_MEMORY_MANAGER_STATELESs_

