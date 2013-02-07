// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_CONDITIONING_CLASS_KERNEl_C_
#define DLIB_CONDITIONING_CLASS_KERNEl_C_

#include "conditioning_class_kernel_abstract.h"
#include "../algs.h"
#include "../assert.h"
#include <iostream>

namespace dlib
{

    template <
        typename cc_base
        >
    class conditioning_class_kernel_c : public cc_base
    {
        const unsigned long alphabet_size;

    public:

        conditioning_class_kernel_c (
            typename cc_base::global_state_type& global_state
            ) : cc_base(global_state),alphabet_size(cc_base::get_alphabet_size()) {}

        bool increment_count (
            unsigned long symbol,
            unsigned short amount = 1
        );

        unsigned long get_count (
            unsigned long symbol
        ) const;

        unsigned long get_range (
            unsigned long symbol,
            unsigned long& low_count,
            unsigned long& high_count,
            unsigned long& total_count
        ) const;

        void get_symbol (
            unsigned long target,
            unsigned long& symbol,            
            unsigned long& low_count,
            unsigned long& high_count
        ) const;
    };

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename cc_base
        >
    bool conditioning_class_kernel_c<cc_base>::
    increment_count (
        unsigned long symbol,
        unsigned short amount
    )
    {
        // make sure requires clause is not broken
        DLIB_CASSERT(symbol < alphabet_size &&
                0 < amount && amount < 32768,
                "\tvoid conditioning_class::increment_count()"
                << "\n\tthe symbol must be in the range 0 to alphabet_size-1. and"
                << "\n\tamount must be in the range 1 to 32767"
                << "\n\talphabet_size: " << alphabet_size
                << "\n\tsymbol:        " << symbol
                << "\n\tamount:        " << amount
                << "\n\tthis:          " << this
        );

        // call the real function
        return cc_base::increment_count(symbol,amount);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename cc_base
        >
    unsigned long conditioning_class_kernel_c<cc_base>::
    get_count (
        unsigned long symbol
    ) const
    {
        // make sure requires clause is not broken
        DLIB_CASSERT(symbol < alphabet_size,
                "\tvoid conditioning_class::get_count()"
                << "\n\tthe symbol must be in the range 0 to alphabet_size-1"
                << "\n\talphabet_size: " << alphabet_size
                << "\n\tsymbol:        " << symbol
                << "\n\tthis:          " << this
        );

        // call the real function
        return cc_base::get_count(symbol);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename cc_base
        >
    unsigned long conditioning_class_kernel_c<cc_base>::
    get_range (
        unsigned long symbol,
        unsigned long& low_count,
        unsigned long& high_count,
        unsigned long& total_count
    ) const
    {
        // make sure requires clause is not broken
        DLIB_CASSERT(symbol < alphabet_size,
                "\tvoid conditioning_class::get_range()"
                << "\n\tthe symbol must be in the range 0 to alphabet_size-1"
                << "\n\talphabet_size: " << alphabet_size
                << "\n\tsymbol:        " << symbol
                << "\n\tthis:          " << this
        );

        // call the real function
        return cc_base::get_range(symbol,low_count,high_count,total_count);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename cc_base
        >
    void conditioning_class_kernel_c<cc_base>::
    get_symbol (
        unsigned long target,
        unsigned long& symbol,            
        unsigned long& low_count,
        unsigned long& high_count
    ) const
    {
        // make sure requires clause is not broken
        DLIB_CASSERT( target < this->get_total(),
                 "\tvoid conditioning_class::get_symbol()"
                 << "\n\tthe target must be in the range 0 to get_total()-1"
                 << "\n\tget_total(): " << this->get_total()
                 << "\n\ttarget:       " << target
                 << "\n\tthis:         " << this
        );

        // call the real function
        cc_base::get_symbol(target,symbol,low_count,high_count);
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_CONDITIONING_CLASS_KERNEl_C_

