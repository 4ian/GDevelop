// Copyright (C) 2005  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_STATIC_MAP_KERNEl_C_
#define DLIB_STATIC_MAP_KERNEl_C_

#include "static_map_kernel_abstract.h"
#include "../algs.h"
#include "../assert.h"
#include "../interfaces/map_pair.h"
#include "../interfaces/remover.h"

namespace dlib
{

    template <
        typename map_base
        >
    class static_map_kernel_c : public map_base
    {
        typedef typename map_base::domain_type domain;
        typedef typename map_base::range_type range;
        
        public:
            const map_pair<domain,range>& element (
            ) const;

            map_pair<domain,range>& element (
            );

    };

    template <
        typename map_base
        >
    inline void swap (
        static_map_kernel_c<map_base>& a, 
        static_map_kernel_c<map_base>& b 
    ) { a.swap(b); }  

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename map_base
        >
    const map_pair<typename map_base::domain_type,typename map_base::range_type>& static_map_kernel_c<map_base>::
    element (
    ) const
    {
        // make sure requires clause is not broken
        DLIB_CASSERT(this->current_element_valid() == true,
            "\tconst map_pair<domain,range>& static_map::element"
            << "\n\tyou can't access the current element if it doesn't exist"
            << "\n\tthis: " << this
            );

        // call the real function
        return map_base::element();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename map_base
        >
    map_pair<typename map_base::domain_type,typename map_base::range_type>& static_map_kernel_c<map_base>::
    element (
    ) 
    {
        // make sure requires clause is not broken
        DLIB_CASSERT(this->current_element_valid() == true,
            "\tmap_pair<domain,range>& static_map::element"
            << "\n\tyou can't access the current element if it doesn't exist"
            << "\n\tthis: " << this
            );

        // call the real function
        return map_base::element();
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_STATIC_MAP_KERNEl_C_

