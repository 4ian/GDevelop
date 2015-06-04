// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_SLIDING_BUFFER_KERNEl_C_
#define DLIB_SLIDING_BUFFER_KERNEl_C_

#include "sliding_buffer_kernel_abstract.h"
#include "../algs.h"
#include "../assert.h"
#include <iostream>

namespace dlib
{

    template <
        typename sb_base
        >
    class sliding_buffer_kernel_c : public sb_base
    {
        typedef typename sb_base::type T;
        
        public:
            void set_size (
                unsigned long exp_size
            );

            const T& operator[] (
                unsigned long index
            ) const;

            T& operator[] (
                unsigned long index
            );

            unsigned long get_element_id (
                unsigned long index
            ) const;

            unsigned long get_element_index (
                unsigned long element_id 
            ) const;

            const T& element (
            ) const;

            T& element (
            );


    };

    template <
        typename sb_base
        >
    inline void swap (
        sliding_buffer_kernel_c<sb_base>& a, 
        sliding_buffer_kernel_c<sb_base>& b 
    ) { a.swap(b); }  

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename sb_base
        >
    void sliding_buffer_kernel_c<sb_base>::
    set_size (
        unsigned long exp_size
    ) 
    {
        // make sure requires clause is not broken
        DLIB_CASSERT( 0 < exp_size && exp_size < 32,
            "\tvoid sliding_buffer::set_size(unsigned long)"
            << "\n\texp_size must be some number between 1 and 31"
            << "\n\tthis:     " << this
            << "\n\texp_size: " << exp_size
            );

        // call the real function
        sb_base::set_size(exp_size);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename sb_base
        >
    unsigned long sliding_buffer_kernel_c<sb_base>::
    get_element_id (
        unsigned long index
    ) const
    {
        // make sure requires clause is not broken
        DLIB_CASSERT( index < this->size(),
            "\tunsigned long sliding_buffer::get_element_id(unsigned long) const"
            << "\n\tindex must be in the range 0 to size()-1"
            << "\n\tthis:   " << this
            << "\n\tsize(): " << this->size()
            << "\n\tindex:  " << index
            );

        // call the real function
        return sb_base::get_element_id(index);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename sb_base
        >
    unsigned long sliding_buffer_kernel_c<sb_base>::
    get_element_index (
        unsigned long element_id
    ) const
    {
        // make sure requires clause is not broken
        DLIB_CASSERT( element_id < this->size(),
            "\tunsigned long sliding_buffer::get_element_index(unsigned long) const"
            << "\n\tid must be in the range 0 to size()-1"
            << "\n\tthis:   " << this
            << "\n\tsize(): " << this->size()
            << "\n\tid:     " << element_id
            );

        // call the real function
        return sb_base::get_element_index(element_id);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename sb_base
        >
    const typename sb_base::type& sliding_buffer_kernel_c<sb_base>::
    operator[] (
        unsigned long index
    ) const
    {
        // make sure requires clause is not broken
        DLIB_CASSERT( index < this->size(),
            "\tconst T& sliding_buffer::operator[](unsigned long) const"
            << "\n\tindex must be in the range 0 to size()-1"
            << "\n\tthis:   " << this
            << "\n\tsize(): " << this->size()
            << "\n\tindex:  " << index
            );

        // call the real function
        return sb_base::operator[](index);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename sb_base
        >
    typename sb_base::type& sliding_buffer_kernel_c<sb_base>::
    operator[] (
        unsigned long index
    ) 
    {
        // make sure requires clause is not broken
        DLIB_CASSERT( index < this->size(),
            "\tT& sliding_buffer::operator[](unsigned long)"
            << "\n\tindex must be in the range 0 to size()-1"
            << "\n\tthis:   " << this
            << "\n\tsize(): " << this->size()
            << "\n\tindex:  " << index
            );

        // call the real function
        return sb_base::operator[](index);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename sb_base
        >
    const typename sb_base::type& sliding_buffer_kernel_c<sb_base>::
    element (
    ) const
    {
        // make sure requires clause is not broken
        DLIB_CASSERT(this->current_element_valid() == true,
            "\tconst T& sliding_buffer::element"
            << "\n\tyou can't access the current element if it doesn't exist"
            << "\n\tthis: " << this
            );

        // call the real function
        return sb_base::element();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename sb_base
        >
    typename sb_base::type& sliding_buffer_kernel_c<sb_base>::
    element (
    ) 
    {
        // make sure requires clause is not broken
        DLIB_CASSERT(this->current_element_valid() == true,
            "\tT& sliding_buffer::element"
            << "\n\tyou can't access the current element if it doesn't exist"
            << "\n\tthis: " << this
            );

        // call the real function
        return sb_base::element();
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_SLIDING_BUFFER_KERNEl_C_

