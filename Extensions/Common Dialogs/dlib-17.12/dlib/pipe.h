// Copyright (C) 2006  Davis E. King (davisking@users.sourceforge.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_PIPe_
#define DLIB_PIPe_ 

#include "pipe/pipe_kernel_1.h"


namespace dlib
{

    template <
        typename T
        >
    class pipe
    {
        pipe() {}
    public:
                

        //----------- kernels ---------------

        // kernel_1a        
        typedef     pipe_kernel_1<T>    
                    kernel_1a;


    };
}

#endif // DLIB_PIPe_

