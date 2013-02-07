// Copyright (C) 2004  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_ENTROPY_ENCODER_MODEL_KERNEl_1_
#define DLIB_ENTROPY_ENCODER_MODEL_KERNEl_1_

#include "../algs.h"
#include "entropy_encoder_model_kernel_abstract.h"
#include "../assert.h"

namespace dlib
{

    template <
        unsigned long alphabet_size,
        typename entropy_encoder,
        typename cc
        >
    class entropy_encoder_model_kernel_1 
    {
        /*!
            REQUIREMENTS ON cc
                cc is an implementation of conditioning_class/conditioning_class_kernel_abstract.h
                cc::get_alphabet_size() == alphabet_size+1

            INITIAL VALUE
                Initially this object's finite context model is empty

            CONVENTION
                &get_entropy_encoder() == coder
                &order_0.get_global_state() == &gs

                This is an order-0 model. The last symbol in the order-0 context is 
                an escape into the order minus 1 context.
        !*/

    public:

        typedef entropy_encoder entropy_encoder_type;

        entropy_encoder_model_kernel_1 (
            entropy_encoder& coder
        );

        virtual ~entropy_encoder_model_kernel_1 (
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
        typename cc::global_state_type gs;
        cc order_0;

        // restricted functions
        entropy_encoder_model_kernel_1(entropy_encoder_model_kernel_1<alphabet_size,entropy_encoder,cc>&);        // copy constructor
        entropy_encoder_model_kernel_1<alphabet_size,entropy_encoder,cc>& operator=(entropy_encoder_model_kernel_1<alphabet_size,entropy_encoder,cc>&);    // assignment operator

    };   

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        unsigned long alphabet_size,
        typename entropy_encoder,
        typename cc
        >
    entropy_encoder_model_kernel_1<alphabet_size,entropy_encoder,cc>::
    entropy_encoder_model_kernel_1 (
        entropy_encoder& coder_
    ) : 
        coder(coder_),
        order_0(gs)
    {
        COMPILE_TIME_ASSERT( 1 < alphabet_size && alphabet_size < 65535 );
    }

// ----------------------------------------------------------------------------------------

    template <
        unsigned long alphabet_size,
        typename entropy_encoder,
        typename cc
        >
    entropy_encoder_model_kernel_1<alphabet_size,entropy_encoder,cc>::
    ~entropy_encoder_model_kernel_1 (
    )
    {
    }
    
// ----------------------------------------------------------------------------------------

    template <
        unsigned long alphabet_size,
        typename entropy_encoder,
        typename cc
        >
    void entropy_encoder_model_kernel_1<alphabet_size,entropy_encoder,cc>::
    clear(
    )
    {
        order_0.clear();
    }

// ----------------------------------------------------------------------------------------

    template <
        unsigned long alphabet_size,
        typename entropy_encoder,
        typename cc
        >
    void entropy_encoder_model_kernel_1<alphabet_size,entropy_encoder,cc>::
    encode (
        unsigned long symbol
    )
    {
        unsigned long low_count = 0, high_count = 0, total_count = 0;

        // if we have seen this symbol in the order-0 context
        if (order_0.get_range(symbol,low_count,high_count,total_count))
        {
            // update the count for this symbol
            order_0.increment_count(symbol,2);
            // encode this symbol
            coder.encode(low_count,high_count,total_count);                
            return;
        }
    
        // if we are here then the symbol does not appear in the order-0 context

        
        // since we have never seen the current symbol in this context
        // escape from order-0 context
        order_0.get_range(alphabet_size,low_count,high_count,total_count);
        coder.encode(low_count,high_count,total_count);
        // increment the count for the escape symbol
        order_0.increment_count(alphabet_size);  

        // update the count for this symbol
        order_0.increment_count(symbol,2);

        // use order minus one context
        coder.encode(symbol,symbol+1,alphabet_size);
        
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_ENTROPY_ENCODER_MODEL_KERNEl_1_

