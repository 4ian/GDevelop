// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_HASH_MAp_
#define DLIB_HASH_MAp_

#include "hash_map/hash_map_kernel_1.h"
#include "hash_map/hash_map_kernel_c.h"

#include "hash_table.h"
#include "algs.h"

#include "algs.h"
#include <functional>

namespace dlib
{

    template <
        typename domain,
        typename range,
        unsigned long expnum,
        typename mem_manager = default_memory_manager,
        typename compare = std::less<domain>
        >
    class hash_map
    {
        hash_map() {}

        typedef typename hash_table<domain,range,mem_manager,compare>::kernel_1a
                hash_table_1;
        typedef typename hash_table<domain,range,mem_manager,compare>::kernel_2a
                hash_table_2;
        typedef typename hash_table<domain,range,mem_manager,compare>::kernel_2b
                hash_table_3;

    public:
        
        //----------- kernels ---------------

        // kernel_1a        
        typedef     hash_map_kernel_1<domain,range,expnum,hash_table_1,mem_manager>
                    kernel_1a;
        typedef     hash_map_kernel_c<kernel_1a>
                    kernel_1a_c;

        // kernel_1b        
        typedef     hash_map_kernel_1<domain,range,expnum,hash_table_2,mem_manager>
                    kernel_1b;
        typedef     hash_map_kernel_c<kernel_1b>
                    kernel_1b_c;
 
        // kernel_1c        
        typedef     hash_map_kernel_1<domain,range,expnum,hash_table_3,mem_manager>
                    kernel_1c;
        typedef     hash_map_kernel_c<kernel_1c>
                    kernel_1c_c;


    };
}

#endif // DLIB_HASH_MAp_

