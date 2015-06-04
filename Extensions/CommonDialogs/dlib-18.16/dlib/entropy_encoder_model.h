// Copyright (C) 2004  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_ENTROPY_ENCODER_MODEl_
#define DLIB_ENTROPY_ENCODER_MODEl_

#include "entropy_encoder_model/entropy_encoder_model_kernel_1.h"
#include "entropy_encoder_model/entropy_encoder_model_kernel_2.h"
#include "entropy_encoder_model/entropy_encoder_model_kernel_3.h"
#include "entropy_encoder_model/entropy_encoder_model_kernel_4.h"
#include "entropy_encoder_model/entropy_encoder_model_kernel_5.h"
#include "entropy_encoder_model/entropy_encoder_model_kernel_6.h"
#include "entropy_encoder_model/entropy_encoder_model_kernel_c.h"

#include "conditioning_class.h"
#include "memory_manager.h"
#include "sliding_buffer.h"


namespace dlib
{

    
    template <
        unsigned long alphabet_size,
        typename entropy_encoder
        >
    class entropy_encoder_model
    {
        entropy_encoder_model() {}

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
        typedef     entropy_encoder_model_kernel_1<alphabet_size,entropy_encoder,cc1>
                    kernel_1a;
        typedef     entropy_encoder_model_kernel_c<kernel_1a>
                    kernel_1a_c;
    
        typedef     entropy_encoder_model_kernel_1<alphabet_size,entropy_encoder,cc2>
                    kernel_1b;
        typedef     entropy_encoder_model_kernel_c<kernel_1b>
                    kernel_1b_c;

        typedef     entropy_encoder_model_kernel_1<alphabet_size,entropy_encoder,cc3>
                    kernel_1c;
        typedef     entropy_encoder_model_kernel_c<kernel_1c>
                    kernel_1c_c;

        // --------------------

        // kernel_2        
        typedef     entropy_encoder_model_kernel_2<alphabet_size,entropy_encoder,cc1,cc1>
                    kernel_2a;
        typedef     entropy_encoder_model_kernel_c<kernel_2a>
                    kernel_2a_c;
    
        typedef     entropy_encoder_model_kernel_2<alphabet_size,entropy_encoder,cc2,cc2>
                    kernel_2b;
        typedef     entropy_encoder_model_kernel_c<kernel_2b>
                    kernel_2b_c;

        typedef     entropy_encoder_model_kernel_2<alphabet_size,entropy_encoder,cc3,cc3>
                    kernel_2c;
        typedef     entropy_encoder_model_kernel_c<kernel_2c>
                    kernel_2c_c;

        typedef     entropy_encoder_model_kernel_2<alphabet_size,entropy_encoder,cc2,cc4b>
                    kernel_2d;
        typedef     entropy_encoder_model_kernel_c<kernel_2d>
                    kernel_2d_c;

        // --------------------

        // kernel_3        
        typedef     entropy_encoder_model_kernel_3<alphabet_size,entropy_encoder,cc1,cc4b>
                    kernel_3a;
        typedef     entropy_encoder_model_kernel_c<kernel_3a>
                    kernel_3a_c;
    
        typedef     entropy_encoder_model_kernel_3<alphabet_size,entropy_encoder,cc2,cc4b>
                    kernel_3b;
        typedef     entropy_encoder_model_kernel_c<kernel_3b>
                    kernel_3b_c;

        typedef     entropy_encoder_model_kernel_3<alphabet_size,entropy_encoder,cc3,cc4b>
                    kernel_3c;
        typedef     entropy_encoder_model_kernel_c<kernel_3c>
                    kernel_3c_c;

        // --------------------

        // kernel_4        
        typedef     entropy_encoder_model_kernel_4<alphabet_size,entropy_encoder,200000,4>
                    kernel_4a;
        typedef     entropy_encoder_model_kernel_c<kernel_4a>
                    kernel_4a_c;

        typedef     entropy_encoder_model_kernel_4<alphabet_size,entropy_encoder,1000000,5>
                    kernel_4b;
        typedef     entropy_encoder_model_kernel_c<kernel_4b>
                    kernel_4b_c;

        // --------------------

        // kernel_5        
        typedef     entropy_encoder_model_kernel_5<alphabet_size,entropy_encoder,200000,4>
                    kernel_5a;
        typedef     entropy_encoder_model_kernel_c<kernel_5a>
                    kernel_5a_c;

        typedef     entropy_encoder_model_kernel_5<alphabet_size,entropy_encoder,1000000,5>
                    kernel_5b;
        typedef     entropy_encoder_model_kernel_c<kernel_5b>
                    kernel_5b_c;

        typedef     entropy_encoder_model_kernel_5<alphabet_size,entropy_encoder,2500000,7>
                    kernel_5c;
        typedef     entropy_encoder_model_kernel_c<kernel_5c>
                    kernel_5c_c;
    
        // --------------------

        // kernel_6        
        typedef     entropy_encoder_model_kernel_6<alphabet_size,entropy_encoder>
                    kernel_6a;
        typedef     entropy_encoder_model_kernel_c<kernel_6a>
                    kernel_6a_c;


    
    };
}

#endif // DLIB_ENTROPY_ENCODER_MODEl_

