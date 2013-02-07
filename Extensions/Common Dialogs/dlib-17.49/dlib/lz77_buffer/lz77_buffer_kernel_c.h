// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_LZ77_BUFFER_KERNEl_C_
#define DLIB_LZ77_BUFFER_KERNEl_C_

#include "lz77_buffer_kernel_abstract.h"
#include "../algs.h"
#include "../assert.h"
#include <iostream>

namespace dlib
{

    template <
        typename lz77_base
        >
    class lz77_buffer_kernel_c : public lz77_base
    {
        
        public:
        lz77_buffer_kernel_c (
            unsigned long total_limit,
            unsigned long lookahead_limit            
        );

        unsigned char lookahead_buffer (
            unsigned long index
        ) const;

        unsigned char history_buffer (
            unsigned long index
        ) const;

        void shift_buffers (
            unsigned long N
        );



        unsigned long make_safe (
            unsigned long total_limit,
            unsigned long lookahead_limit
        )
        /*!
            ensures
                - if ( 6 < total_limit < 32 && 
                       15 < lookahead_limit <= 2^(total_limit-2) 
                       ) then
                    - returns total_limit
                - else
                    - throws due to failed CASSERT
        !*/
        {
            unsigned long exp_size = (total_limit!=0)?total_limit-2:0;
            unsigned long two_pow_total_limit_minus_2 = 1;
            while (exp_size != 0)
            {
                --exp_size;
                two_pow_total_limit_minus_2 <<= 1;            
            }

            // make sure requires clause is not broken
            DLIB_CASSERT( 6 < total_limit && total_limit < 32 &&
                    15 < lookahead_limit && lookahead_limit <= two_pow_total_limit_minus_2,
                "\tlz77_buffer::lz77_buffer(unsigned long,unsigned long)"
                << "\n\ttotal_limit must be in the range 7 to 31 and \n\tlookahead_limit in the range 15 to 2^(total_limit-2)"
                << "\n\tthis:            " << this
                << "\n\ttotal_limit:     " << total_limit
                << "\n\tlookahead_limit: " << lookahead_limit
                );

            return total_limit;
        }

    };

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename lz77_base
        >
    void lz77_buffer_kernel_c<lz77_base>::
    shift_buffers (
            unsigned long N
    ) 
    {
        // make sure requires clause is not broken
        DLIB_CASSERT( N <= this->get_lookahead_buffer_size(),
            "\tvoid lz77_buffer::shift_buffers(unsigned long)"
            << "\n\tN must be <= the number of chars in the lookahead buffer"
            << "\n\tthis:                        " << this
            << "\n\tget_lookahead_buffer_size(): " << this->get_lookahead_buffer_size()
            << "\n\tN:                           " << N
            );

        // call the real function
        lz77_base::shift_buffers(N);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename lz77_base
        >
    unsigned char lz77_buffer_kernel_c<lz77_base>::
    history_buffer (
            unsigned long index
    ) const
    {
        // make sure requires clause is not broken
        DLIB_CASSERT( index < this->get_history_buffer_size(),
            "\tunsigned char lz77_buffer::history_buffer(unsigned long) const"
            << "\n\tindex must be in the range 0 to get_history_buffer_size()-1"
            << "\n\tthis:                      " << this
            << "\n\tget_history_buffer_size(): " << this->get_history_buffer_size()
            << "\n\tindex:                     " << index
            );

        // call the real function
        return lz77_base::history_buffer(index);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename lz77_base
        >
    unsigned char lz77_buffer_kernel_c<lz77_base>::
    lookahead_buffer (
            unsigned long index
    ) const
    {
        // make sure requires clause is not broken
        DLIB_CASSERT( index < this->get_lookahead_buffer_size(),
            "\tunsigned char lz77_buffer::lookahead_buffer(unsigned long) const"
            << "\n\tindex must be in the range 0 to get_lookahead_buffer_size()-1"
            << "\n\tthis:                        " << this
            << "\n\tget_lookahead_buffer_size(): " << this->get_lookahead_buffer_size()
            << "\n\tindex:                       " << index
            );

        // call the real function
        return lz77_base::lookahead_buffer(index);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename lz77_base
        >
    lz77_buffer_kernel_c<lz77_base>::
    lz77_buffer_kernel_c (
        unsigned long total_limit,
        unsigned long lookahead_limit  
    ) :
        lz77_base(make_safe(total_limit,lookahead_limit),lookahead_limit)
    {
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_LZ77_BUFFER_KERNEl_C_

