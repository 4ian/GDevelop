// Copyright (C) 2004  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_ENTROPY_DECODER_MODEL_KERNEl_2_
#define DLIB_ENTROPY_DECODER_MODEL_KERNEl_2_

#include "../algs.h"
#include "entropy_decoder_model_kernel_abstract.h"
#include "../assert.h"

namespace dlib
{

    template <
        unsigned long alphabet_size,
        typename entropy_decoder,
        typename cc,
        typename ccbig
        >
    class entropy_decoder_model_kernel_2 
    {
        /*!
            REQUIREMENTS ON cc
                cc is an implementation of conditioning_class/conditioning_class_kernel_abstract.h
                cc::get_alphabet_size() == alphabet_size+1
                this will be used for the order-0 context

            REQUIREMENTS ON ccbig
                ccbig is an implementation of conditioning_class/conditioning_class_kernel_abstract.h
                ccbig::get_alphabet_size() == alphabet_size+1
                this will be used for the order-1 context

            INITIAL VALUE
                Initially this object's finite context model is empty
                previous_symbol == 0

            CONVENTION
                &get_entropy_decoder() == coder
                &order_0.get_global_state() == &gs
                &order_1[i]->get_global_state() == &gsbig


                This is an order-1-0 model. The last symbol in the order-0 and order-1
                context is an escape into the lower context.        

                previous_symbol == the last symbol seen
        !*/

    public:

        typedef entropy_decoder entropy_decoder_type;

        entropy_decoder_model_kernel_2 (
            entropy_decoder& coder
        );

        virtual ~entropy_decoder_model_kernel_2 (
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
        typename ccbig::global_state_type gsbig;
        cc order_0;
        ccbig* order_1[alphabet_size];
        unsigned long previous_symbol;


        // restricted functions
        entropy_decoder_model_kernel_2(entropy_decoder_model_kernel_2<alphabet_size,entropy_decoder,cc,ccbig>&);        // copy constructor
        entropy_decoder_model_kernel_2<alphabet_size,entropy_decoder,cc,ccbig>& operator=(entropy_decoder_model_kernel_2<alphabet_size,entropy_decoder,cc,ccbig>&);    // assignment operator

    };   

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        unsigned long alphabet_size,
        typename entropy_decoder,
        typename cc,
        typename ccbig
        >
    entropy_decoder_model_kernel_2<alphabet_size,entropy_decoder,cc,ccbig>::
    entropy_decoder_model_kernel_2 (
        entropy_decoder& coder_
    ) : 
        coder(coder_),
        order_0(gs),
        previous_symbol(0)
    {
        COMPILE_TIME_ASSERT( 1 < alphabet_size && alphabet_size < 65535);

        unsigned long i;
        try
        {
            for (i = 0; i < alphabet_size; ++i)
            {
                order_1[i] = new ccbig(gsbig);
            }
        }
        catch (...)
        {
            for (unsigned long j = 0; j < i; ++j)
            {
                delete order_1[j];
            }
            throw;
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        unsigned long alphabet_size,
        typename entropy_decoder,
        typename cc,
        typename ccbig
        >
    entropy_decoder_model_kernel_2<alphabet_size,entropy_decoder,cc,ccbig>::
    ~entropy_decoder_model_kernel_2 (
    )
    {
        for (unsigned long i = 0; i < alphabet_size; ++i)
        {
            delete order_1[i];
        }
    }
    
// ----------------------------------------------------------------------------------------

    template <
        unsigned long alphabet_size,
        typename entropy_decoder,
        typename cc,
        typename ccbig
        >
    void entropy_decoder_model_kernel_2<alphabet_size,entropy_decoder,cc,ccbig>::
    clear(
    )
    {
        previous_symbol = 0;
        order_0.clear();
        for (unsigned long i = 0; i < alphabet_size; ++i)
        {
            order_1[i]->clear();
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        unsigned long alphabet_size,
        typename entropy_decoder,
        typename cc,
        typename ccbig
        >
    void entropy_decoder_model_kernel_2<alphabet_size,entropy_decoder,cc,ccbig>::
    decode (
        unsigned long& symbol
    )
    {
        unsigned long current_symbol, low_count, high_count, target;

        // look in the order-1 context
        target = coder.get_target(order_1[previous_symbol]->get_total());
        order_1[previous_symbol]->get_symbol(target,current_symbol,low_count,high_count);

        // have the coder decode the next symbol
        coder.decode(low_count,high_count);

        // if the current_symbol is not an escape from the order-1 context
        if (current_symbol != alphabet_size)
        {
            symbol = current_symbol;
            order_1[previous_symbol]->increment_count(current_symbol,2);
            previous_symbol = current_symbol;
            return;
        }
            
        // since this is an escape to order-0 we should increment
        // the escape symbol
        order_1[previous_symbol]->increment_count(alphabet_size);



        // look in the order-0 context
        target = coder.get_target(order_0.get_total());
        order_0.get_symbol(target,current_symbol,low_count,high_count);

        // have coder decode the next symbol
        coder.decode(low_count,high_count);

        // if current_symbol is not an escape from the order-0 context
        if (current_symbol != alphabet_size)
        {
            // update the count for this symbol            
            order_1[previous_symbol]->increment_count(current_symbol,2);
            order_0.increment_count(current_symbol,2);

            symbol = current_symbol;
            previous_symbol = current_symbol;
            return;
        }

        // update the count for the escape symbol
        order_0.increment_count(current_symbol);


        // go into the order minus one context
        target = coder.get_target(alphabet_size);
        coder.decode(target,target+1);


        // update the count for this symbol             
        order_1[previous_symbol]->increment_count(target,2);
        order_0.increment_count(target,2);

        symbol = target;
        previous_symbol = target;

    }

// ----------------------------------------------------------------------------------------
  
}

#endif // DLIB_ENTROPY_DECODER_MODEL_KERNEl_2_

