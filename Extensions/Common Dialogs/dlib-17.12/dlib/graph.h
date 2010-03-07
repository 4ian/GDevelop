// Copyright (C) 2007  Davis E. King (davisking@users.sourceforge.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_GRAPh_
#define DLIB_GRAPh_

#include "graph/graph_kernel_1.h"

#include "memory_manager.h"

namespace dlib
{

    template <
        typename T,
        typename E = char,
        typename mem_manager = memory_manager<char>::kernel_1a
        >
    class graph 
    {
        graph() {}
    public:
                

        //----------- kernels ---------------

        // kernel_1a        
        typedef     graph_kernel_1<T,E,mem_manager,false>    
                    kernel_1a;
        typedef     graph_kernel_1<T,E,mem_manager,true>    
                    kernel_1a_c;
 
    };
}

#endif // DLIB_GRAPh_ 


