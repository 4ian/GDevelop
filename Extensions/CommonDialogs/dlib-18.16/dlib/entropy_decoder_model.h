// Copyright (C) 2004  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_ENTROPY_DECODER_MODEl_
#define DLIB_ENTROPY_DECODER_MODEl_

#include "entropy_decoder_model/entropy_decoder_model_kernel_1.h"
#include "entropy_decoder_model/entropy_decoder_model_kernel_2.h"
#include "entropy_decoder_model/entropy_decoder_model_kernel_3.h"
#include "entropy_decoder_model/entropy_decoder_model_kernel_4.h"
#include "entropy_decoder_model/entropy_decoder_model_kernel_5.h"
#include "entropy_decoder_model/entropy_decoder_model_kernel_6.h"

#include "conditioning_class.h"
#include "memory_manager.h"

namespace dlib
{

    
    template <
        unsigned long alphabet_size,
        typename entropy_decoder
        >
    class entropy_decoder_model
    {
        entropy_decoder_model() {}

        typedef typename conditioning_class<alphabet_size+1>::kernel_1a cc1;
        typedef typename conditioning_class<alphabet_size+1>::kernel_2a cc2;
        typedef typename conditioning_class<alphabet_size+1>::kernel_3a cc3;
        typedef typename conditioning_class<alphabet_size+1>::kernel_4a cc4a;
        typedef typename conditioning_class<alphabet_size+1>::kernel_4b cc4b;
        typedef typename conditioning_class<alphabet_size+1>::kernel_4c cc4c;
        typedef typename conditioning_class<alphabet_size+1>::kernel_4d cc4d;

    public:
        
        //----------- kernels ---------------

        // kernel_1        
        typedef     entropy_decoder_model_kernel_1<alphabet_size,entropy_decoder,cc1>
                    kernel_1a;
    
        typedef     entropy_decoder_model_kernel_1<alphabet_size,entropy_decoder,cc2>
                    kernel_1b;

        typedef     entropy_decoder_model_kernel_1<alphabet_size,entropy_decoder,cc3>
                    kernel_1c;

        // --------------------

        // kernel_2      
        typedef     entropy_decoder_model_kernel_2<alphabet_size,entropy_decoder,cc1,cc1>
                    kernel_2a;
    
        typedef     entropy_decoder_model_kernel_2<alphabet_size,entropy_decoder,cc2,cc2>
                    kernel_2b;

        typedef     entropy_decoder_model_kernel_2<alphabet_size,entropy_decoder,cc3,cc3>
                    kernel_2c;

        typedef     entropy_decoder_model_kernel_2<alphabet_size,entropy_decoder,cc2,cc4b>
                    kernel_2d;

        // --------------------

        // kernel_3       
        typedef     entropy_decoder_model_kernel_3<alphabet_size,entropy_decoder,cc1,cc4b>
                    kernel_3a;
    
        typedef     entropy_decoder_model_kernel_3<alphabet_size,entropy_decoder,cc2,cc4b>
                    kernel_3b;

        typedef     entropy_decoder_model_kernel_3<alphabet_size,entropy_decoder,cc3,cc4b>
                    kernel_3c;

        // --------------------

        // kernel_4       
        typedef     entropy_decoder_model_kernel_4<alphabet_size,entropy_decoder,200000,4>
                    kernel_4a;
        typedef     entropy_decoder_model_kernel_4<alphabet_size,entropy_decoder,1000000,5>
                    kernel_4b;


        // --------------------

        // kernel_5       
        typedef     entropy_decoder_model_kernel_5<alphabet_size,entropy_decoder,200000,4>
                    kernel_5a;
        typedef     entropy_decoder_model_kernel_5<alphabet_size,entropy_decoder,1000000,5>
                    kernel_5b;
        typedef     entropy_decoder_model_kernel_5<alphabet_size,entropy_decoder,2500000,7>
                    kernel_5c;


        // --------------------

        // kernel_6       
        typedef     entropy_decoder_model_kernel_6<alphabet_size,entropy_decoder>
                    kernel_6a;


    };
}

#endif // DLIB_ENTROPY_DECODER_MODEl_

