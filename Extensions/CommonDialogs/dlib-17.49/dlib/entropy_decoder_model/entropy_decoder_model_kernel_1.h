// Copyright (C) 2004  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_ENTROPY_DECODER_MODEL_KERNEl_1_
#define DLIB_ENTROPY_DECODER_MODEL_KERNEl_1_

#include "../algs.h"
#include "entropy_decoder_model_kernel_abstract.h"
#include "../assert.h"

namespace dlib
{

    template <
        unsigned long alphabet_size,
        typename entropy_decoder,
        typename cc
        >
    class entropy_decoder_model_kernel_1 
    {
        /*!
            REQUIREMENTS ON cc
                cc is an implementation of conditioning_class/conditioning_class_kernel_abstract.h
                cc::get_alphabet_size() == alphabet_size+1

            INITIAL VALUE
                Initially this object's finite context model is empty

            CONVENTION
                &get_entropy_decoder() == coder
                &order_0.get_global_state() == &gs

                This is an order-0 model. The last symbol in the order-0 context is 
                an escape into the order minus 1 context.           
        !*/

    public:

        typedef entropy_decoder entropy_decoder_type;

        entropy_decoder_model_kernel_1 (
            entropy_decoder& coder
        );

        virtual ~entropy_decoder_model_kernel_1 (
        );
        
        inline void clear(
        );

        inline void decode (
            unsigned long& symbol
        );

        entropy_decoder& get_entropy_decoder (
        ) { return coder; }

        static unsigned long get_alphabet_size (
        ) { return alphabet_size; }

    private:

        entropy_decoder& coder;
        typename cc::global_state_type gs;
        cc order_0;

        // restricted functions
        entropy_decoder_model_kernel_1(entropy_decoder_model_kernel_1<alphabet_size,entropy_decoder,cc>&);        // copy constructor
        entropy_decoder_model_kernel_1<alphabet_size,entropy_decoder,cc>& operator=(entropy_decoder_model_kernel_1<alphabet_size,entropy_decoder,cc>&);    // assignment operator

    };   

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        unsigned long alphabet_size,
        typename entropy_decoder,
        typename cc
        >
    entropy_decoder_model_kernel_1<alphabet_size,entropy_decoder,cc>::
    entropy_decoder_model_kernel_1 (
        entropy_decoder& coder_
    ) : 
        coder(coder_),
        order_0(gs)
    {
        COMPILE_TIME_ASSERT( 1 < alphabet_size && alphabet_size < 65535 );
    }

// ----------------------------------------------------------------------------------------

    template <
        unsigned long alphabet_size,
        typename entropy_decoder,
        typename cc
        >
    entropy_decoder_model_kernel_1<alphabet_size,entropy_decoder,cc>::
    ~entropy_decoder_model_kernel_1 (
    )
    {
    }
    
// ----------------------------------------------------------------------------------------

    template <
        unsigned long alphabet_size,
        typename entropy_decoder,
        typename cc
        >
    void entropy_decoder_model_kernel_1<alphabet_size,entropy_decoder,cc>::
    clear(
    )
    {
        order_0.clear();
    }

// ----------------------------------------------------------------------------------------

    template <
        unsigned long alphabet_size,
        typename entropy_decoder,
        typename cc
        >
    void entropy_decoder_model_kernel_1<alphabet_size,entropy_decoder,cc>::
    decode (
        unsigned long& symbol
    )
    {
        unsigned long current_symbol, low_count, high_count, target;

        // look in the order-0 context
        target = coder.get_target(order_0.get_total());
        order_0.get_symbol(target,current_symbol,low_count,high_count);


        // have coder decode the next symbol
        coder.decode(low_count,high_count);

        // if current_symbol is not an escape from the order-0 context
        if (current_symbol != alphabet_size)
        {
            // update the count for this symbol
            order_0.increment_count(current_symbol,2);

            symbol = current_symbol;
            return;
        }

        // update the count for the escape symbol
        order_0.increment_count(alphabet_size);


        // go into the order minus one context
        target = coder.get_target(alphabet_size);
        coder.decode(target,target+1);


        // update the count for this symbol in the order-0 context
        order_0.increment_count(target,2);

        symbol = target;

    }

// ----------------------------------------------------------------------------------------
  
}

#endif // DLIB_ENTROPY_DECODER_MODEL_KERNEl_1_

