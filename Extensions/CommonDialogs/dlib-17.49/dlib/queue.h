// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_QUEUe_
#define DLIB_QUEUe_

#include "queue/queue_kernel_1.h"
#include "queue/queue_kernel_2.h"
#include "queue/queue_kernel_c.h"

#include "queue/queue_sort_1.h"


#include "algs.h"

namespace dlib
{

    template <
        typename T,
        typename mem_manager = default_memory_manager 
        >
    class queue
    {
        queue() {}
    public:
                

        //----------- kernels ---------------

        // kernel_1a        
        typedef     queue_kernel_1<T,mem_manager>    
                    kernel_1a;
        typedef     queue_kernel_c<kernel_1a>
                    kernel_1a_c;
 

        // kernel_2a        
        typedef     queue_kernel_2<T,20,mem_manager>    
                    kernel_2a;
        typedef     queue_kernel_c<kernel_2a>
                    kernel_2a_c;


        // kernel_2b        
        typedef     queue_kernel_2<T,100,mem_manager>    
                    kernel_2b;
        typedef     queue_kernel_c<kernel_2b>
                    kernel_2b_c;




        //---------- extensions ------------

        // sort_1 extend kernel_1a
        typedef     queue_sort_1<kernel_1a>
                    sort_1a;
        typedef     queue_sort_1<kernel_1a_c>
                    sort_1a_c;


        // sort_1 extend kernel_2a
        typedef     queue_sort_1<kernel_2a>
                    sort_1b;
        typedef     queue_sort_1<kernel_2a_c>
                    sort_1b_c;



        // sort_1 extend kernel_2b
        typedef     queue_sort_1<kernel_2b>
                    sort_1c;
        typedef     queue_sort_1<kernel_2b_c>
                    sort_1c_c;





    };
}

#endif // DLIB_QUEUe_

