// Copyright (C) 2006  Davis E. King (davisking@users.sourceforge.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_BYTE_ORDEREr_ 
#define DLIB_BYTE_ORDEREr_ 


#include "byte_orderer/byte_orderer_kernel_1.h"



namespace dlib
{


    class byte_orderer
    {

        byte_orderer() {}
 

    public:
        
        //----------- kernels ---------------

        // kernel_1a        
        typedef     byte_orderer_kernel_1   
                    kernel_1a;

  

    };
}

#endif // DLIB_BYTE_ORDEREr_ 

