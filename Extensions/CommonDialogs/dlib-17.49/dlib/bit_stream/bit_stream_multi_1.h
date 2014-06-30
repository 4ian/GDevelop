// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_BIT_STREAM_MULTi_1_
#define DLIB_BIT_STREAM_MULTi_1_

#include "bit_stream_multi_abstract.h"

namespace dlib
{
    template <
        typename bit_stream_base
        >
    class bit_stream_multi_1 : public bit_stream_base
    {

    public:

        void multi_write (
            unsigned long data,
            int num_to_write
        );

        int multi_read (
            unsigned long& data,
            int num_to_read
        );

    };

    template <
        typename bit_stream_base
        >
    inline void swap (
        bit_stream_multi_1<bit_stream_base>& a, 
        bit_stream_multi_1<bit_stream_base>& b 
    ) { a.swap(b); }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename bit_stream_base
        >
    void bit_stream_multi_1<bit_stream_base>:: 
    multi_write (
        unsigned long data,
        int num_to_write
    )
    {
        // move the first bit into the most significant position
        data <<= 32 - num_to_write;

        for (int i = 0; i < num_to_write; ++i)
        {
            // write the first bit from data
            this->write(static_cast<char>(data >> 31));

            // shift the next bit into position
            data <<= 1;

        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename bit_stream_base
        >
    int bit_stream_multi_1<bit_stream_base>:: 
    multi_read (
        unsigned long& data,
        int num_to_read
    )
    {
        int bit, i;
        data = 0;
        for (i = 0; i < num_to_read; ++i)
        {

            // get a bit
            if (this->read(bit) == false)
                break;

            // shift data to make room for this new bit
            data <<= 1;

            // put bit into the least significant position in data
            data += static_cast<unsigned long>(bit);

        }

        return i;
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_BIT_STREAM_MULTi_1_

