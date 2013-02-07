// Copyright (C) 2005  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_TOKENIZEr_
#define DLIB_TOKENIZEr_

#include "tokenizer/tokenizer_kernel_1.h"
#include "tokenizer/tokenizer_kernel_c.h"


namespace dlib
{

    class tokenizer
    {
        tokenizer() {}


    public:
        
        //----------- kernels ---------------

        // kernel_1a        
        typedef     tokenizer_kernel_1
                    kernel_1a;
        typedef     tokenizer_kernel_c<kernel_1a>
                    kernel_1a_c;
          

    };
}

#endif // DLIB_TOKENIZEr_

