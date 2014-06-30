// Copyright (C) 2004  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_ENTROPY_DECODER_MODEL_KERNEl_3_
#define DLIB_ENTROPY_DECODER_MODEL_KERNEl_3_

#include "../algs.h"
#include "entropy_decoder_model_kernel_abstract.h"
#include "../assert.h"

namespace dlib
{

    template <
        unsigned long alphabet_size,
        typename entropy_decoder,
        typename cc,
        typename cc_high
        >
    class entropy_decoder_model_kernel_3 
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
                - for all values of i: order_2[i] == 0

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

        typedef entropy_decoder entropy_decoder_type;

        entropy_decoder_model_kernel_3 (
            entropy_decoder& coder
        );

        virtual ~entropy_decoder_model_kernel_3 (
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
        typename cc_high::global_state_type gs_high;
        cc order_0;
        cc** order_1;
        unsigned long previous_symbol;
        cc_high** order_2;
        unsigned long previous_symbol2;

        // restricted functions
        entropy_decoder_model_kernel_3(entropy_decoder_model_kernel_3&);        // copy constructor
        entropy_decoder_model_kernel_3& operator=(entropy_decoder_model_kernel_3&);    // assignment operator

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
        typename cc_high
        >
    entropy_decoder_model_kernel_3<alphabet_size,entropy_decoder,cc,cc_high>::
    entropy_decoder_model_kernel_3 (
        entropy_decoder& coder_
    ) : 
        coder(coder_),
        order_0(gs),
        order_1(0),
        previous_symbol(0),
        order_2(0),
        previous_symbol2(0)
    {
        COMPILE_TIME_ASSERT( 1 < alphabet_size && alphabet_size < 65535);

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

        for (i = 0; i < alphabet_size*alphabet_size; ++i)
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
        typename entropy_decoder,
        typename cc,
        typename cc_high
        >
    entropy_decoder_model_kernel_3<alphabet_size,entropy_decoder,cc,cc_high>::
    ~entropy_decoder_model_kernel_3 (
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
        typename entropy_decoder,
        typename cc,
        typename cc_high
        >
    void entropy_decoder_model_kernel_3<alphabet_size,entropy_decoder,cc,cc_high>::
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
        typename entropy_decoder,
        typename cc,
        typename cc_high
        >
    void entropy_decoder_model_kernel_3<alphabet_size,entropy_decoder,cc,cc_high>::
    decode (
        unsigned long& symbol
    )
    {
        unsigned long current_symbol, low_count, high_count, target;


        // look in the order-2 context        
        unsigned long temp = previous_symbol + (previous_symbol2 * alphabet_size);
        if (order_2[temp] != 0)
        {
            target = coder.get_target(order_2[temp]->get_total());
            order_2[temp]->get_symbol(target,current_symbol,low_count,high_count);

            // have the coder decode the next symbol
            coder.decode(low_count,high_count);

            // if the current_symbol is not an escape from the order-2 context
            if (current_symbol != alphabet_size)
            {
                symbol = current_symbol;
                order_2[temp]->increment_count(current_symbol,2);
                previous_symbol2 = previous_symbol;
                previous_symbol = current_symbol;
                return;
            }

            // since this is an escape to order-1 we should increment
            // the escape symbol
            order_2[temp]->increment_count(alphabet_size);
        }
        else
        {
            order_2[temp] = new cc_high(gs_high);
        }
        





        // look in the order-1 context
        target = coder.get_target(order_1[previous_symbol]->get_total());
        order_1[previous_symbol]->get_symbol(target,current_symbol,low_count,high_count);

        // have the coder decode the next symbol
        coder.decode(low_count,high_count);

        // if the current_symbol is not an escape from the order-1 context
        if (current_symbol != alphabet_size)
        {
            symbol = current_symbol;
            order_2[temp]->increment_count(current_symbol,2);
            order_1[previous_symbol]->increment_count(current_symbol,2);            
            previous_symbol2 = previous_symbol;
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
            order_2[temp]->increment_count(current_symbol,2);            
            order_1[previous_symbol]->increment_count(current_symbol,2);
            order_0.increment_count(current_symbol,2);
            

            symbol = current_symbol;
            previous_symbol2 = previous_symbol;
            previous_symbol = current_symbol;
            return;
        }

        // update the count for the escape symbol
        order_0.increment_count(current_symbol);


        // go into the order minus one context
        target = coder.get_target(alphabet_size);
        coder.decode(target,target+1);


        // update the count for this symbol 
        order_2[temp]->increment_count(target,2);            
        order_1[previous_symbol]->increment_count(target,2);
        order_0.increment_count(target,2);
        

        symbol = target;
        previous_symbol2 = previous_symbol;
        previous_symbol = target;
    
       
    }

// ----------------------------------------------------------------------------------------
  
}

#endif // DLIB_ENTROPY_DECODER_MODEL_KERNEl_3_

