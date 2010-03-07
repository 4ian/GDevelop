// Copyright (C) 2005  Davis E. King (davisking@users.sourceforge.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_CRc32_
#define DLIB_CRc32_


#include "crc32/crc32_kernel_1.h"



namespace dlib
{


    class crc32
    {

        crc32() {}
 

    public:
        
        //----------- kernels ---------------

        // kernel_1a        
        typedef     crc32_kernel_1   
                    kernel_1a;

  

    };
}

#endif // DLIB_CRc32_

