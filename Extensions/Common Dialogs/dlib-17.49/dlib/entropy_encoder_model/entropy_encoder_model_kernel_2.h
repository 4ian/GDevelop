// Copyright (C) 2004  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_ENTROPY_ENCODER_MODEL_KERNEl_2_
#define DLIB_ENTROPY_ENCODER_MODEL_KERNEl_2_

#include "../algs.h"
#include "entropy_encoder_model_kernel_abstract.h"
#include "../assert.h"

namespace dlib
{

    template <
        unsigned long alphabet_size,
        typename entropy_encoder,
        typename cc,
        typename ccbig
        >
    class entropy_encoder_model_kernel_2 
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
                &get_entropy_encoder() == coder
                &order_0.get_global_state() == &gs
                &order_1[i]->get_global_state() == &gsbig


                This is an order-1-0 model. The last symbol in the order-0 and order-1
                context is an escape into the lower context.

                previous_symbol == the last symbol seen                
        !*/

    public:

        typedef entropy_encoder entropy_encoder_type;

        entropy_encoder_model_kernel_2 (
            entropy_encoder& coder
        );

        virtual ~entropy_encoder_model_kernel_2 (
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
        typename ccbig::global_state_type gsbig;
        cc order_0;
        ccbig* order_1[alphabet_size];
        unsigned long previous_symbol;
        

        // restricted functions
        entropy_encoder_model_kernel_2(entropy_encoder_model_kernel_2<alphabet_size,entropy_encoder,cc,ccbig>&);        // copy constructor
        entropy_encoder_model_kernel_2<alphabet_size,entropy_encoder,cc,ccbig>& operator=(entropy_encoder_model_kernel_2<alphabet_size,entropy_encoder,cc,ccbig>&);    // assignment operator

    };   

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        unsigned long alphabet_size,
        typename entropy_encoder,
        typename cc,
        typename ccbig
        >
    entropy_encoder_model_kernel_2<alphabet_size,entropy_encoder,cc,ccbig>::
    entropy_encoder_model_kernel_2 (
        entropy_encoder& coder_
    ) : 
        coder(coder_),
        order_0(gs),
        previous_symbol(0)
    {
        COMPILE_TIME_ASSERT( 1 < alphabet_size && alphabet_size < 65535 );

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
        typename entropy_encoder,
        typename cc,
        typename ccbig
        >
    entropy_encoder_model_kernel_2<alphabet_size,entropy_encoder,cc,ccbig>::
    ~entropy_encoder_model_kernel_2 (
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
        typename entropy_encoder,
        typename cc,
        typename ccbig
        >
    void entropy_encoder_model_kernel_2<alphabet_size,entropy_encoder,cc,ccbig>::
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
        typename entropy_encoder,
        typename cc,
        typename ccbig
        >
    void entropy_encoder_model_kernel_2<alphabet_size,entropy_encoder,cc,ccbig>::
    encode (
        unsigned long symbol
    )
    {
        unsigned long low_count = 0, high_count = 0, total_count = 0;


        ccbig& context = *order_1[previous_symbol];

        // if we have seen this symbol in the order-1 context
        if (context.get_range(symbol,low_count,high_count,total_count))
        {
            // update the count for this symbol
            context.increment_count(symbol,2);
            // encode this symbol
            coder.encode(low_count,high_count,total_count);
            previous_symbol = symbol;
            return;
        }       

        // we didn't find the symbol in the order-1 context so we must escape to a 
        // lower context.

        // escape to the order-0 context
        context.get_range(alphabet_size,low_count,high_count,total_count);
        coder.encode(low_count,high_count,total_count);


        // increment counts for the escape symbol and the current symbol
        context.increment_count(alphabet_size);
        context.increment_count(symbol,2);
        
        previous_symbol = symbol;





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

#endif // DLIB_ENTROPY_ENCODER_MODEL_KERNEl_2_

