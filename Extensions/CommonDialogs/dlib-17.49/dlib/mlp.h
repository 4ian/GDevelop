// Copyright (C) 2007  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_MLp_
#define DLIB_MLp_

#include "mlp/mlp_kernel_1.h"
#include "mlp/mlp_kernel_c.h"

namespace dlib
{

    class mlp
    {
        mlp() {}

    public:
        
        //----------- kernels ---------------

        // kernel_1a        
        typedef     mlp_kernel_1    
                    kernel_1a;
        typedef     mlp_kernel_c<kernel_1a >
                    kernel_1a_c;   

    };
}

#endif // DLIB_MLp_

