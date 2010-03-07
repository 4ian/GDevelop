// Copyright (C) 2003  Davis E. King (davisking@users.sourceforge.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_ARRAY_KERNEl_C_
#define DLIB_ARRAY_KERNEl_C_

#include "array_kernel_abstract.h"
#include "../algs.h"
#include "../assert.h"

namespace dlib
{

    template <
        typename array_base
        >
    class array_kernel_c : public array_base
    {
        typedef typename array_base::type T;
        public:

            const T& operator[] (
                unsigned long pos
            ) const;
            
            T& operator[] (
                unsigned long pos
            );

            void set_size (
                unsigned long size
            );

            const T& element (
            ) const;

            T& element( 
            );

    };

    template <
        typename array_base
        >
    inline void swap (
        array_kernel_c<array_base>& a, 
        array_kernel_c<array_base>& b 
    ) { a.swap(b); }   

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename array_base
        >
    const typename array_base::type& array_kernel_c<array_base>::
    operator[] (
        unsigned long pos
    ) const
    {
        // make sure requires clause is not broken
        DLIB_CASSERT( pos < this->size() , 
            "\tconst T& array::operator[]"
            << "\n\tpos must < size()" 
            << "\n\tpos: " << pos 
            << "\n\tsize(): " << this->size()
            << "\n\tthis: " << this
            );

        // call the real function
        return array_base::operator[](pos);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename array_base
        >
    typename array_base::type& array_kernel_c<array_base>::
    operator[] (
        unsigned long pos
    )
    {
        // make sure requires clause is not broken
        DLIB_CASSERT( pos < this->size() , 
            "\tT& array::operator[]"
            << "\n\tpos must be < size()" 
            << "\n\tpos: " << pos 
            << "\n\tsize(): " << this->size()
            << "\n\tthis: " << this
            );

        // call the real function
        return array_base::operator[](pos);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename array_base
        >
    void array_kernel_c<array_base>::
    set_size (
        unsigned long size
    )
    {

        // make sure requires clause is not broken
        DLIB_CASSERT(( size <= this->max_size() ),
            "\tvoid array::set_size"
            << "\n\tsize must be <= max_size()"
            << "\n\tsize: " << size 
            << "\n\tmax size: " << this->max_size()
            << "\n\tthis: " << this
            );

        // call the real function
        array_base::set_size(size);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename array_base
        >
    const typename array_base::type& array_kernel_c<array_base>::
    element (
    ) const
    {

        // make sure requires clause is not broken
        DLIB_CASSERT(this->current_element_valid(),
            "\tconst T& array::element()"
            << "\n\tThe current element must be valid if you are to access it."
            << "\n\tthis: " << this
            );

        // call the real function
        return array_base::element();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename array_base
        >
    typename array_base::type& array_kernel_c<array_base>::
    element (
    ) 
    {

        // make sure requires clause is not broken
        DLIB_CASSERT(this->current_element_valid(),
            "\tT& array::element()"
            << "\n\tThe current element must be valid if you are to access it."
            << "\n\tthis: " << this
            );

        // call the real function
        return array_base::element();
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_ARRAY_KERNEl_C_

