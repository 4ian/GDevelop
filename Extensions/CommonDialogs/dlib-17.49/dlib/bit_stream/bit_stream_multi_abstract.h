// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_BIT_STREAM_MULTi_ABSTRACT_
#ifdef DLIB_BIT_STREAM_MULTi_ABSTRACT_

#include "bit_stream_kernel_abstract.h"

namespace dlib
{
    template <
        typename bit_stream_base  
        >
    class bit_stream_multi : public bit_stream_base
    {

        /*!
            REQUIREMENTS ON BIT_STREAM_BASE
                it is an implementation of bit_stream/bit_stream_kernel_abstract.h

      
            WHAT THIS EXTENSION DOES FOR BIT_STREAM
                this gives a bit_stream object the ability to read/write multible bits 
                at a time
        !*/


        public:

        void multi_write (
            unsigned long data,
            int num_to_write
        );
        /*!
            requires
                - is_in_write_mode() == true 
                - 0 <= num_to_write <= 32
            ensures
                - num_to_write low order bits from data will be written to the ostream 
                - object associated with *this
                  example: if data is 10010 then the bits will be written in the 
                  order 1,0,0,1,0
        !*/


        int multi_read (
            unsigned long& data,
            int num_to_read
        );
        /*!
            requires
                - is_in_read_mode() == true 
                - 0 <= num_to_read <= 32
            ensures
                - tries to read num_to_read bits into the low order end of #data       
                  example:  if the incoming bits were 10010 then data would end 
                  up with 10010 as its low order bits
                - all of the bits in #data not filled in by multi_read() are zero             
                - returns the number of bits actually read into #data
        !*/

    };

    template <
        typename bit_stream_base
        >
    inline void swap (
        bit_stream_multi<bit_stream_base>& a, 
        bit_stream_multi<bit_stream_base>& b 
    ) { a.swap(b); }
    /*!
        provides a global swap function
    !*/

}

#endif // DLIB_BIT_STREAM_MULTi_ABSTRACT_

