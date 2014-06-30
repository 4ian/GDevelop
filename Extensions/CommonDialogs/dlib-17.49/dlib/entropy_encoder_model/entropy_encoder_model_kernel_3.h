// Copyright (C) 2004  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_ENTROPY_ENCODER_MODEL_KERNEl_3_
#define DLIB_ENTROPY_ENCODER_MODEL_KERNEl_3_

#include "../algs.h"
#include "entropy_encoder_model_kernel_abstract.h"
#include "../assert.h"

namespace dlib
{

    template <
        unsigned long alphabet_size,
        typename entropy_encoder,
        typename cc,
        typename cc_high
        >
    class entropy_encoder_model_kernel_3 
    {
        /*!
            REQUIREMENTS ON cc
                cc is an implementation of conditioning_class/conditioning_class_kernel_abstract.h
                cc::get_alphabet_size() == alphabet_size+1

            REQUIREMENTS ON cc_high
                cc_high is an implementation of conditioning_class/conditioning_class_kernel_abstract.h
                cc_high::get_alphabet_size() == alphabet_size+1

            INITIAL VALUE
                - Initially this object's finite context model is empty
                - previous_symbol == 0
                - previous_symbol2 == 0
                - order_1 == pointer to an array of alphabet_size elements
                - order_2 == pointer to an array of alphabet_size*alphabet_size elements
                - order_2[i] == 0

            CONVENTION
                &get_entropy_encoder() == coder
                &order_0.get_global_state() == &gs
                &order_1[i]->get_global_state() == &gs

                if (order_2[i] != 0) then
                    &order_2[i]->get_global_state() == &gs_high

                This is an order-2-1-0 model. The last symbol in the order-2, order-1 and 
                order-0 contexts is an escape into the lower context.

                previous_symbol == the last symbol seen
                previous_symbol2 == the symbol we saw before previous_symbol
        !*/

    public:

        typedef entropy_encoder entropy_encoder_type;

        entropy_encoder_model_kernel_3 (
            entropy_encoder& coder
        );

        virtual ~entropy_encoder_model_kernel_3 (
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
        typename cc_high::global_state_type gs_high;
        cc order_0;
        cc** order_1;
        unsigned long previous_symbol;
        cc_high** order_2;
        unsigned long previous_symbol2;
        

        // restricted functions
        entropy_encoder_model_kernel_3(entropy_encoder_model_kernel_3&);        // copy constructor
        entropy_encoder_model_kernel_3& operator=(entropy_encoder_model_kernel_3&);    // assignment operator

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
        typename cc_high
        >
    entropy_encoder_model_kernel_3<alphabet_size,entropy_encoder,cc,cc_high>::
    entropy_encoder_model_kernel_3 (
        entropy_encoder& coder_
    ) : 
        coder(coder_),
        order_0(gs),
        order_1(0),
        previous_symbol(0),
        order_2(0),
        previous_symbol2(0)
    {
        COMPILE_TIME_ASSERT( 1 < alphabet_size && alphabet_size < 65535 );

        try
        {
            order_1 = new cc*[alphabet_size];
            order_2 = new cc_high*[alphabet_size*alphabet_size];
        }
        catch (...)
        {
            if (order_1) delete [] order_1;
            if (order_2) delete [] order_2;
            throw;
        }

        unsigned long i;

        for (i = 0; i < (alphabet_size*alphabet_size); ++i)
        {
            order_2[i] = 0;
        }

        try
        {
            for (i = 0; i < alphabet_size; ++i)
            {
                order_1[i] = new cc(gs);
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
        typename cc_high
        >
    entropy_encoder_model_kernel_3<alphabet_size,entropy_encoder,cc,cc_high>::
    ~entropy_encoder_model_kernel_3 (
    )
    {
        for (unsigned long i = 0; i < alphabet_size; ++i)
        {           
            delete order_1[i];
        }

        for (unsigned long i = 0; i < alphabet_size*alphabet_size; ++i)
        {
            if (order_2[i] != 0)
                delete order_2[i];
        }
        delete [] order_1;
        delete [] order_2;
    }
    
// ----------------------------------------------------------------------------------------

    template <
        unsigned long alphabet_size,
        typename entropy_encoder,
        typename cc,
        typename cc_high
        >
    void entropy_encoder_model_kernel_3<alphabet_size,entropy_encoder,cc,cc_high>::
    clear(
    )
    {
        previous_symbol = 0;
        previous_symbol2 = 0;
        order_0.clear();
        for (unsigned long i = 0; i < alphabet_size; ++i)
        {
            order_1[i]->clear();
        }

        for (unsigned long i = 0; i < alphabet_size*alphabet_size; ++i)
        {
            if (order_2[i] != 0)
            {
                delete order_2[i];
                order_2[i] = 0;
            }
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        unsigned long alphabet_size,
        typename entropy_encoder,
        typename cc,
        typename cc_high
        >
    void entropy_encoder_model_kernel_3<alphabet_size,entropy_encoder,cc,cc_high>::
    encode (
        unsigned long symbol
    )
    {
        unsigned long low_count = 0, high_count = 0, total_count = 0;

        
        // order-2 context stuff
        {
            unsigned long temp = previous_symbol + (previous_symbol2 * alphabet_size);
            previous_symbol2 = previous_symbol;

            if (order_2[temp] != 0)
            {
                if (order_2[temp]->get_range(symbol,low_count,high_count,total_count))
                {
                    // there was an entry for this symbol in this context

                    // update the count for this symbol
                    order_2[temp]->increment_count(symbol,2);
                    // encode this symbol
                    coder.encode(low_count,high_count,total_count);
                    previous_symbol = symbol;
                    return;
                }

                // there was no entry for this symbol in this context so we must
                // escape to order-1

                // escape to the order-1 context
                order_2[temp]->get_range(alphabet_size,low_count,high_count,total_count);
                coder.encode(low_count,high_count,total_count);

                // increment the count for the escape symbol
                order_2[temp]->increment_count(alphabet_size);
                
            }
            else
            {                
                order_2[temp] = new cc_high(gs_high);

                // in this case the decoder knows to escape to order-1 because 
                // there was no conditioning_class object in this context yet.
                // so we don't need to actually write the escape symbol
            }            

            // update the count for this symbol in this context
            order_2[temp]->increment_count(symbol,2);
        }




        // order-1 context stuff
        {
            cc& context = *order_1[previous_symbol];

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
        }
        
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

#endif // DLIB_ENTROPY_ENCODER_MODEL_KERNEl_3_

