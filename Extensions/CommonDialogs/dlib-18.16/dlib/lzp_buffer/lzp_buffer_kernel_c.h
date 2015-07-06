// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_LZP_BUFFER_KERNEl_C_
#define DLIB_LZP_BUFFER_KERNEl_C_

#include "lzp_buffer_kernel_abstract.h"
#include "../algs.h"
#include "../assert.h"
#include <iostream>

namespace dlib
{

    template <
        typename lzp_base
        >
    class lzp_buffer_kernel_c : public lzp_base
    {
        
        public:
        lzp_buffer_kernel_c (
            unsigned long buffer_size         
        );

     
        unsigned char operator[] (
            unsigned long index
        ) const;


        unsigned long make_safe (
            unsigned long buffer_size
        )
        /*!
            ensures
                - if ( 10 < buffer_size < 32) then
                    - returns buffer_size
                - else
                    - throws due to failed CASSERT
        !*/
        {

            // make sure requires clause is not broken
            DLIB_CASSERT( 10 < buffer_size && buffer_size < 32,
                "\tlzp_buffer::lzp_buffer(unsigned long)"
                << "\n\tbuffer_size must be in the range 11 to 31."
                << "\n\tthis:         " << this
                << "\n\tbuffer_size:  " << buffer_size
                );

            return buffer_size;
        }

    };

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename lzp_base
        >
    unsigned char lzp_buffer_kernel_c<lzp_base>::
    operator[] (
            unsigned long index
    ) const
    {
        // make sure requires clause is not broken
        DLIB_CASSERT( index < this->size(),
            "\tunsigned char lzp_buffer::operator[](unsigned long) const"
            << "\n\tindex must be in the range 0 to size()()-1"
            << "\n\tthis:    " << this
            << "\n\tsize():  " << this->size()
            << "\n\tindex:   " << index
            );

        // call the real function
        return lzp_base::operator[](index);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename lzp_base
        >
    lzp_buffer_kernel_c<lzp_base>::
    lzp_buffer_kernel_c (
        unsigned long buffer_size
    ) :
        lzp_base(make_safe(buffer_size))
    {
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_LZP_BUFFER_KERNEl_C_

