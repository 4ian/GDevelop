// Copyright (C) 2005  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_ENTROPY_DECODER_MODEL_KERNEl_6_
#define DLIB_ENTROPY_DECODER_MODEL_KERNEl_6_

#include "../algs.h"
#include "entropy_decoder_model_kernel_abstract.h"
#include "../assert.h"

namespace dlib
{

    template <
        unsigned long alphabet_size,
        typename entropy_decoder
        >
    class entropy_decoder_model_kernel_6 
    {
        /*!
            INITIAL VALUE
                This object has no state

            CONVENTION
                &get_entropy_decoder() == coder
                
                This is an order-(-1) model.  So it doesn't really do anything.
                Every symbol has the same probability.
        !*/

    public:

        typedef entropy_decoder entropy_decoder_type;

        entropy_decoder_model_kernel_6 (
            entropy_decoder& coder
        );

        virtual ~entropy_decoder_model_kernel_6 (
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

        // restricted functions
        entropy_decoder_model_kernel_6(entropy_decoder_model_kernel_6<alphabet_size,entropy_decoder>&);        // copy constructor
        entropy_decoder_model_kernel_6<alphabet_size,entropy_decoder>& operator=(entropy_decoder_model_kernel_6<alphabet_size,entropy_decoder>&);    // assignment operator

    };   

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        unsigned long alphabet_size,
        typename entropy_decoder
        >
    entropy_decoder_model_kernel_6<alphabet_size,entropy_decoder>::
    entropy_decoder_model_kernel_6 (
        entropy_decoder& coder_
    ) : 
        coder(coder_)
    {
        COMPILE_TIME_ASSERT( 1 < alphabet_size && alphabet_size < 65535 );
    }

// ----------------------------------------------------------------------------------------

    template <
        unsigned long alphabet_size,
        typename entropy_decoder
        >
    entropy_decoder_model_kernel_6<alphabet_size,entropy_decoder>::
    ~entropy_decoder_model_kernel_6 (
    )
    {
    }
    
// ----------------------------------------------------------------------------------------

    template <
        unsigned long alphabet_size,
        typename entropy_decoder
        >
    void entropy_decoder_model_kernel_6<alphabet_size,entropy_decoder>::
    clear(
    )
    {
    }

// ----------------------------------------------------------------------------------------

    template <
        unsigned long alphabet_size,
        typename entropy_decoder
        >
    void entropy_decoder_model_kernel_6<alphabet_size,entropy_decoder>::
    decode (
        unsigned long& symbol
    )
    {
        unsigned long target;

        target = coder.get_target(alphabet_size);
        coder.decode(target,target+1);

        symbol = target;
    }

// ----------------------------------------------------------------------------------------
  
}

#endif // DLIB_ENTROPY_DECODER_MODEL_KERNEl_6_

