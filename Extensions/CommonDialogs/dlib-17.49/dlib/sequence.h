// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_SEQUENCe_
#define DLIB_SEQUENCe_

#include "sequence/sequence_kernel_1.h"
#include "sequence/sequence_kernel_2.h"
#include "sequence/sequence_kernel_c.h"

#include "sequence/sequence_compare_1.h"
#include "sequence/sequence_sort_1.h"
#include "sequence/sequence_sort_2.h"
#include "algs.h"




namespace dlib
{

    template <
        typename T,
        typename mem_manager = default_memory_manager
        >
    class sequence
    {

        sequence() {}
    public:
        
        //----------- kernels ---------------

        // kernel_1a        
        typedef     sequence_kernel_1<T,mem_manager>    
                    kernel_1a;
        typedef     sequence_kernel_c<kernel_1a>
                    kernel_1a_c;

        // kernel_2a
        typedef     sequence_kernel_2<T,mem_manager>
                    kernel_2a;
        typedef     sequence_kernel_c<kernel_2a>
                    kernel_2a_c;


        //---------- extensions ------------

        // compare_1 extend kernel_1a
        typedef     sequence_compare_1<kernel_1a >
                    compare_1a;
        typedef     sequence_compare_1<kernel_1a_c>
                    compare_1a_c;

        // compare_1 extend kernel_2a
        typedef     sequence_compare_1<kernel_2a >
                    compare_1b;
        typedef     sequence_compare_1<kernel_2a_c>
                    compare_1b_c;

        

        // sort_1 extend kernel_2a
        typedef     sequence_sort_1<kernel_2a>
                    sort_1a;
        typedef     sequence_sort_1<kernel_2a_c>
                    sort_1a_c;

        // sort_2 extend kernel_1a
        typedef     sequence_sort_2<kernel_1a>
                    sort_2a;
        typedef     sequence_sort_2<kernel_1a_c>
                    sort_2a_c;






    };
}

#endif // DLIB_SEQUENCe_

