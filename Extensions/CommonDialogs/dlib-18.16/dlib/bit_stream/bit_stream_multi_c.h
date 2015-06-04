// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_BIT_STREAM_MULTi_C_
#define DLIB_BIT_STREAM_MULTi_C_

#include "bit_stream_multi_abstract.h"
#include "../algs.h"
#include "../assert.h"

namespace dlib
{
    template <
        typename bit_stream_base // implements bit_stream/bit_stream_multi_abstract.h
        >
    class bit_stream_multi_c : public bit_stream_base
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
        bit_stream_multi_c<bit_stream_base>& a, 
        bit_stream_multi_c<bit_stream_base>& b
    ) { a.swap(b); }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename bit_stream_base
        >
    void bit_stream_multi_c<bit_stream_base>:: 
    multi_write (
        unsigned long data,
        int num_to_write
    )
    {
        // make sure requires clause is not broken
        DLIB_CASSERT( (this->is_in_write_mode() == true) && (num_to_write >= 0 && num_to_write <=32), 
            "\tvoid bit_stream::write"
            << "\n\tthe bit stream bust be in write mode and"
            << "\n\tnum_to_write must be between 0 and 32 inclusive" 
            << "\n\tnum_to_write == " << num_to_write
            << "\n\tis_in_write_mode() == " << this->is_in_write_mode()
            << "\n\tthis: " << this
            );

        // call the real function
        bit_stream_base::multi_write(data,num_to_write);

    }

// ----------------------------------------------------------------------------------------

    template <
        typename bit_stream_base
        >
    int bit_stream_multi_c<bit_stream_base>:: 
    multi_read (
        unsigned long& data,
        int num_to_read
    )
    {

        // make sure requires clause is not broken
        DLIB_CASSERT(( this->is_in_read_mode() == true && ( num_to_read >= 0 && num_to_read <=32 ) ), 
            "\tvoid bit_stream::read"
            << "\n\tyou can't read from a bit_stream that isn't in read mode and" 
            << "\n\tnum_to_read must be between 0 and 32 inclusive"
            << "\n\tnum_to_read == " << num_to_read
            << "\n\tis_in_read_mode() == " << this->is_in_read_mode()
            << "\n\tthis: " << this
            );

        // call the real function
        return bit_stream_base::multi_read(data,num_to_read);

    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_BIT_STREAM_MULTi_C_

