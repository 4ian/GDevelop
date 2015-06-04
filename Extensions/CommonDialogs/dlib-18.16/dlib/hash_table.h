// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_HASH_TABLe_
#define DLIB_HASH_TABLe_


#include "hash_table/hash_table_kernel_1.h"
#include "hash_table/hash_table_kernel_2.h"
#include "hash_table/hash_table_kernel_c.h"
#include "algs.h"

#include "binary_search_tree.h"
#include <functional>


namespace dlib
{

    template <
        typename domain,
        typename range,
        typename mem_manager = default_memory_manager,
        typename compare = std::less<domain>
        >
    class hash_table
    {
        hash_table() {}

        typedef typename binary_search_tree<domain,range,mem_manager,compare>::kernel_1a
                    bst_1;
        typedef typename binary_search_tree<domain,range,mem_manager,compare>::kernel_2a
                    bst_2;

    public:
        
        //----------- kernels ---------------

        // kernel_1a        
        typedef     hash_table_kernel_1<domain,range,mem_manager,compare>    
                    kernel_1a;
        typedef     hash_table_kernel_c<kernel_1a>
                    kernel_1a_c;


        // kernel_2a        
        typedef     hash_table_kernel_2<domain,range,bst_1,mem_manager,compare>    
                    kernel_2a;
        typedef     hash_table_kernel_c<kernel_2a>
                    kernel_2a_c;

        // kernel_2b
        typedef     hash_table_kernel_2<domain,range,bst_2,mem_manager,compare>    
                    kernel_2b;
        typedef     hash_table_kernel_c<kernel_2b>
                    kernel_2b_c;
    };
}

#endif // DLIB_HASH_TABLe_

