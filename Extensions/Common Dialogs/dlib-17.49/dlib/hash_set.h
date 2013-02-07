// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_HASH_SEt_
#define DLIB_HASH_SEt_

#include "hash_set/hash_set_kernel_1.h"
#include "hash_set/hash_set_kernel_c.h"

#include "hash_table.h"
#include "algs.h"


#include "algs.h"
#include <functional>


namespace dlib
{

    template <
        typename T,
        unsigned long expnum,
        typename mem_manager = default_memory_manager,
        typename compare = std::less<T>
        >
    class hash_set
    {
        hash_set() {}

        typedef typename hash_table<T,char,mem_manager,compare>::kernel_1a ht1a;
        typedef typename hash_table<T,char,mem_manager,compare>::kernel_1a ht2a;
        typedef typename hash_table<T,char,mem_manager,compare>::kernel_1a ht2b;

    public:
        
        //----------- kernels ---------------

        // kernel_1a        
        typedef     hash_set_kernel_1<T,expnum,ht1a,mem_manager>
                    kernel_1a;
        typedef     hash_set_kernel_c<kernel_1a>
                    kernel_1a_c;

        // kernel_1b        
        typedef     hash_set_kernel_1<T,expnum,ht2a,mem_manager>
                    kernel_1b;
        typedef     hash_set_kernel_c<kernel_1b>
                    kernel_1b_c;

        // kernel_1c
        typedef     hash_set_kernel_1<T,expnum,ht2b,mem_manager>
                    kernel_1c;
        typedef     hash_set_kernel_c<kernel_1c>
                    kernel_1c_c;




    };
}

#endif // DLIB_HASH_SEt_

