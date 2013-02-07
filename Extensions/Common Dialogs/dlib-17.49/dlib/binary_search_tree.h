// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_BINARY_SEARCH_TREe_
#define DLIB_BINARY_SEARCH_TREe_


#include "binary_search_tree/binary_search_tree_kernel_1.h"
#include "binary_search_tree/binary_search_tree_kernel_2.h"
#include "binary_search_tree/binary_search_tree_kernel_c.h"


#include "algs.h"
#include <functional>


namespace dlib
{

    template <
        typename domain,
        typename range,
        typename mem_manager = default_memory_manager,
        typename compare = std::less<domain>
        >
    class binary_search_tree
    {
        binary_search_tree() {}

    public:
        
        //----------- kernels ---------------

        // kernel_1a        
        typedef     binary_search_tree_kernel_1<domain,range,mem_manager,compare>    
                    kernel_1a;
        typedef     binary_search_tree_kernel_c<kernel_1a>
                    kernel_1a_c;


        // kernel_2a        
        typedef     binary_search_tree_kernel_2<domain,range,mem_manager,compare>    
                    kernel_2a;
        typedef     binary_search_tree_kernel_c<kernel_2a>
                    kernel_2a_c;

    };
}

#endif // DLIB_BINARY_SEARCH_TREe_

