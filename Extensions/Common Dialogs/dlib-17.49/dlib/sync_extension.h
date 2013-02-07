// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_SYNC_EXTENSIOn_
#define DLIB_SYNC_EXTENSIOn_

#include "sync_extension/sync_extension_kernel_1.h"



namespace dlib
{

    template <
        typename base
        >
    class sync_extension
    {
        sync_extension() {}
    public:
        
        //----------- kernels ---------------

        // kernel_1a        
        typedef     sync_extension_kernel_1<base>    
                    kernel_1a;
 
    };
}

#endif // DLIB_SYNC_EXTENSIOn_

