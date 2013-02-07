// Copyright (C) 2005  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_ENTROPY_ENCODER_MODEL_KERNEl_6_
#define DLIB_ENTROPY_ENCODER_MODEL_KERNEl_6_

#include "../algs.h"
#include "entropy_encoder_model_kernel_abstract.h"
#include "../assert.h"

namespace dlib
{

    template <
        unsigned long alphabet_size,
        typename entropy_encoder 
        >
    class entropy_encoder_model_kernel_6 
    {
        /*!
            INITIAL VALUE
                Initially this object's finite context model is empty

            CONVENTION
                &get_entropy_encoder() == coder
           
                This is an order-(-1) model.  So it doesn't really do anything.
                Every symbol has the same probability.
        !*/

    public:

        typedef entropy_encoder entropy_encoder_type;

        entropy_encoder_model_kernel_6 (
            entropy_encoder& coder
        );

        virtual ~entropy_encoder_model_kernel_6 (
        );
        
        inline void clear(
        );

        inline void encode (
            unsigned long symbol
        );

        entropy_encoder& get_entropy_encoder (
        ) { return coder; }

        static unsigned long get_alphabet_size (
        ) { return alphabet_size; }

    private:

        entropy_encoder& coder;

        // restricted functions
        entropy_encoder_model_kernel_6(entropy_encoder_model_kernel_6<alphabet_size,entropy_encoder>&);        // copy constructor
        entropy_encoder_model_kernel_6<alphabet_size,entropy_encoder>& operator=(entropy_encoder_model_kernel_6<alphabet_size,entropy_encoder>&);    // assignment operator

    };   

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        unsigned long alphabet_size,
        typename entropy_encoder 
        >
    entropy_encoder_model_kernel_6<alphabet_size,entropy_encoder>::
    entropy_encoder_model_kernel_6 (
        entropy_encoder& coder_
    ) : 
        coder(coder_)
    {
        COMPILE_TIME_ASSERT( 1 < alphabet_size && alphabet_size < 65535 );
    }

// ----------------------------------------------------------------------------------------

    template <
        unsigned long alphabet_size,
        typename entropy_encoder 
        >
    entropy_encoder_model_kernel_6<alphabet_size,entropy_encoder>::
    ~entropy_encoder_model_kernel_6 (
    )
    {
    }
    
// ----------------------------------------------------------------------------------------

    template <
        unsigned long alphabet_size,
        typename entropy_encoder 
        >
    void entropy_encoder_model_kernel_6<alphabet_size,entropy_encoder>::
    clear(
    )
    {
    }

// ----------------------------------------------------------------------------------------

    template <
        unsigned long alphabet_size,
        typename entropy_encoder 
        >
    void entropy_encoder_model_kernel_6<alphabet_size,entropy_encoder>::
    encode (
        unsigned long symbol
    )
    {
        // use order minus one context
        coder.encode(symbol,symbol+1,alphabet_size);  
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_ENTROPY_ENCODER_MODEL_KERNEl_6_

