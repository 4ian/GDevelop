// Copyright (C) 2005  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_STATIC_MAp_
#define DLIB_STATIC_MAp_

#include "static_map/static_map_kernel_1.h"
#include "static_map/static_map_kernel_c.h"

#include <functional>


namespace dlib
{

    template <
        typename domain,
        typename range,
        typename compare = std::less<domain>
        >
    class static_map
    {
        static_map() {}


    public:
        
        //----------- kernels ---------------

        // kernel_1a        
        typedef     static_map_kernel_1<domain,range,compare>
                    kernel_1a;
        typedef     static_map_kernel_c<kernel_1a>
                    kernel_1a_c;
        
   



    };
}

#endif // DLIB_STATIC_MAp_

