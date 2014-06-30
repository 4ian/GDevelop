// Copyright (C) 2008  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_BOUND_FUNCTION_POINTER_KERNEl_C_
#define DLIB_BOUND_FUNCTION_POINTER_KERNEl_C_

#include "bound_function_pointer_kernel_abstract.h"
#include "../algs.h"
#include "../assert.h"

namespace dlib
{


    template <
        typename bound_function_pointer_base // is an implementation of bound_function_pointer_kernel_abstract.h
        >
    class bound_function_pointer_kernel_c : public bound_function_pointer_base
    {
        public:

            void operator () (
            ) const;

    };

    template <
        typename bound_function_pointer_base
        >
    inline void swap (
        bound_function_pointer_kernel_c<bound_function_pointer_base>& a, 
        bound_function_pointer_kernel_c<bound_function_pointer_base>& b 
    ) { a.swap(b); }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename bound_function_pointer_base
        >
    void bound_function_pointer_kernel_c<bound_function_pointer_base>::
    operator() (
    ) const
    {

        // make sure requires clause is not broken
        DLIB_CASSERT(this->is_set() == true ,
                "\tvoid bound_function_pointer::operator()"
                << "\n\tYou must call set() before you can use this function"
                << "\n\tthis: " << this
        );

        // call the real function
        bound_function_pointer_base::operator()();

    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_BOUND_FUNCTION_POINTER_KERNEl_C_


