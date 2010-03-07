// Copyright (C) 2006  Davis E. King (davisking@users.sourceforge.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_ARRAY2d_ 
#define DLIB_ARRAY2d_


#include "array2d/array2d_kernel_1.h"
#include "array2d/array2d_kernel_c.h"
#include "memory_manager.h"



namespace dlib
{


    template <
        typename T,
        typename mem_manager = memory_manager<char>::kernel_1a
        >
    class array2d
    {

        array2d() {}
 

    public:
        
        //----------- kernels ---------------

        // kernel_1a        
        typedef     array2d_kernel_1<T,mem_manager>   
                    kernel_1a;
        typedef     array2d_kernel_c<kernel_1a>   
                    kernel_1a_c;

  

    };
}

#endif // DLIB_ARRAY2d_

