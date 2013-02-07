// Copyright (C) 2004  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_ENTROPY_ENCODER_MODEL_KERNEl_C_
#define DLIB_ENTROPY_ENCODER_MODEL_KERNEl_C_

#include "entropy_encoder_model_kernel_abstract.h"
#include "../algs.h"
#include "../assert.h"
#include <iostream>

namespace dlib
{

    template <
        typename eem_base
        >
    class entropy_encoder_model_kernel_c : public eem_base
    {
        const unsigned long alphabet_size;
        typedef typename eem_base::entropy_encoder_type entropy_encoder;
        
        public:

            entropy_encoder_model_kernel_c (
                entropy_encoder& coder
            ) : eem_base(coder), alphabet_size(eem_base::get_alphabet_size()) {}

            void encode (
                unsigned long symbol
            );
    };

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename eem_base
        >
    void entropy_encoder_model_kernel_c<eem_base>::
    encode (
        unsigned long symbol
    )
    {
        // make sure requires clause is not broken
        DLIB_CASSERT(symbol < alphabet_size,
            "\tvoid entropy_encoder_model::encode()"
            << "\n\tthe symbol must be in the range 0 to alphabet_size-1"
            << "\n\talphabet_size: " << alphabet_size
            << "\n\tsymbol:        " << symbol
            << "\n\tthis:          " << this
            );

        // call the real function
        eem_base::encode(symbol);
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_ENTROPY_ENCODER_MODEL_KERNEl_C_

