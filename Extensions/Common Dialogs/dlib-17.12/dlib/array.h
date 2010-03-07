// Copyright (C) 2003  Davis E. King (davisking@users.sourceforge.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_ARRAy_
#define DLIB_ARRAy_

#include "array/array_kernel_1.h"
#include "array/array_kernel_2.h"
#include "array/array_kernel_c.h"

#include "array/array_sort_1.h"
#include "array/array_sort_2.h"
#include "array/array_expand_1.h"
#include "array/array_expand_c.h"

#include "memory_manager.h"


namespace dlib
{

    template <
        typename T,
        typename mem_manager = memory_manager<char>::kernel_1a
        >
    class array
    {
        array() {}
    public:
        
        //----------- kernels ---------------

        // kernel_1a        
        typedef     array_kernel_1<T,mem_manager>    
                    kernel_1a;
        typedef     array_kernel_c<kernel_1a >
                    kernel_1a_c;

        // kernel_2a        
        typedef     array_kernel_2<T,mem_manager>    
                    kernel_2a;
        typedef     array_kernel_c<kernel_2a >
                    kernel_2a_c;



        //---------- extensions ------------

        
        // sort_1 extend kernel_1a
        typedef     array_sort_1<kernel_1a>
                    sort_1a;
        typedef     array_sort_1<kernel_1a_c>
                    sort_1a_c;

        // sort_1 extend kernel_2a
        typedef     array_sort_1<kernel_2a>
                    sort_1b;
        typedef     array_sort_1<kernel_2a_c>
                    sort_1b_c;



        // sort_2 extend kernel_1a
        typedef     array_sort_2<kernel_1a>
                    sort_2a;
        typedef     array_sort_2<kernel_1a_c>
                    sort_2a_c;

        // sort_2 extend kernel_2a
        typedef     array_sort_2<kernel_2a>
                    sort_2b;
        typedef     array_sort_2<kernel_2a_c>
                    sort_2b_c;



        
        // expand_1 extend sort_1a 
        typedef     array_expand_1<sort_1a>
                    expand_1a;
        typedef     array_expand_c<array_kernel_c<expand_1a> >
                    expand_1a_c;

        // expand_1 extend sort_1b 
        typedef     array_expand_1<sort_1b>
                    expand_1b;
        typedef     array_expand_c<array_kernel_c<expand_1b> >
                    expand_1b_c;

        // expand_1 extend sort_2a 
        typedef     array_expand_1<sort_2a>
                    expand_1c;
        typedef     array_expand_c<array_kernel_c<expand_1c> >
                    expand_1c_c;

        // expand_1 extend sort_2b 
        typedef     array_expand_1<sort_2b>
                    expand_1d;
        typedef     array_expand_c<array_kernel_c<expand_1d> >
                    expand_1d_c;

    };
}

#endif // DLIB_ARRAy_

