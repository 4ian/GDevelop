// Copyright (C) 2005  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_STATIC_SET_KERNEl_C_
#define DLIB_STATIC_SET_KERNEl_C_

#include "static_set_kernel_abstract.h"
#include "../algs.h"
#include "../assert.h"
#include "../interfaces/remover.h"

namespace dlib
{

    template <
        typename set_base
        >
    class static_set_kernel_c : public set_base
    {
        typedef typename set_base::type T;
        public:

            const T& element (
            );

            const T& element (
            ) const;
    };


    template <
        typename set_base
        >
    inline void swap (
        static_set_kernel_c<set_base>& a, 
        static_set_kernel_c<set_base>& b 
    ) { a.swap(b); } 

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
 
    template <
        typename set_base
        >
    const typename set_base::type& static_set_kernel_c<set_base>::
    element (
    ) const
    {
        // make sure requires clause is not broken
        DLIB_CASSERT(this->current_element_valid() == true,
            "\tconst T& static_set::element() const"
            << "\n\tyou can't access the current element if it doesn't exist"
            << "\n\tthis: " << this
            );

        // call the real function
        return set_base::element();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename set_base
        >
    const typename set_base::type& static_set_kernel_c<set_base>::
    element (
    ) 
    {
        // make sure requires clause is not broken
        DLIB_CASSERT(this->current_element_valid() == true,
            "\tconst T& static_set::element"
            << "\n\tyou can't access the current element if it doesn't exist"
            << "\n\tthis: " << this
            );

        // call the real function
        return set_base::element();
    }

// ----------------------------------------------------------------------------------------


}

#endif // DLIB_STATIC_SET_KERNEl_C_

