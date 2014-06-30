// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_BIT_STREAM_KERNEl_C_
#define DLIB_BIT_STREAM_KERNEl_C_

#include "bit_stream_kernel_abstract.h"
#include "../algs.h"
#include "../assert.h"
#include <iosfwd>

namespace dlib
{

    template <
        typename bit_stream_base // implements bit_stream/bit_stream_kernel_abstract.h
        >
    class bit_stream_kernel_c : public bit_stream_base
    {
    public:


        void set_input_stream (
            std::istream& is
        );

        void set_output_stream (
            std::ostream& os
        );

        void close (
        );

        void write (
            int bit
        );

        bool read (
            int& bit
        );

    };

    template <
        typename bit_stream_base
        >
    inline void swap (
        bit_stream_kernel_c<bit_stream_base>& a, 
        bit_stream_kernel_c<bit_stream_base>& b
    ) { a.swap(b); }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename bit_stream_base
        >
    void bit_stream_kernel_c<bit_stream_base>:: 
    set_input_stream (
        std::istream& is
    )
    {
        // make sure requires clause is not broken
        DLIB_CASSERT(( this->is_in_write_mode() == false ) && ( this->is_in_read_mode() == false ), 
            "\tvoid bit_stream::set_intput_stream"
            << "\n\tbit_stream must not be in write or read mode" 
            << "\n\tthis: " << this
            );

        // call the real function
        bit_stream_base::set_input_stream(is);

    }

// ----------------------------------------------------------------------------------------

    template <
        typename bit_stream_base
        >
    void bit_stream_kernel_c<bit_stream_base>:: 
    set_output_stream (
        std::ostream& os
    )
    {

        // make sure requires clause is not broken
        DLIB_CASSERT(( this->is_in_write_mode() == false ) && ( this->is_in_read_mode() == false ), 
            "\tvoid bit_stream::set_output_stream"
            << "\n\tbit_stream must not be in write or read mode" 
            << "\n\tthis: " << this
            );

        // call the real function
        bit_stream_base::set_output_stream(os);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename bit_stream_base
        >
    void bit_stream_kernel_c<bit_stream_base>:: 
    close (
    )
    {

        // make sure requires clause is not broken
        DLIB_CASSERT(( this->is_in_write_mode() == true ) || ( this->is_in_read_mode() == true ), 
            "\tvoid bit_stream::close"
            << "\n\tyou can't close a bit_stream that isn't open" 
            << "\n\tthis: " << this
            );

        // call the real function
        bit_stream_base::close();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename bit_stream_base
        >
    void bit_stream_kernel_c<bit_stream_base>:: 
    write (
        int bit
    )
    {
        // make sure requires clause is not broken
        DLIB_CASSERT(( this->is_in_write_mode() == true ) && ( bit == 0 || bit == 1 ), 
            "\tvoid bit_stream::write"
            << "\n\tthe bit stream bust be in write mode and bit must be either 1 or 0" 
            << "\n\tis_in_write_mode() == " << this->is_in_write_mode()
            << "\n\tbit == " << bit
            << "\n\tthis: " << this
            );

        // call the real function
        bit_stream_base::write(bit);

    }

// ----------------------------------------------------------------------------------------

    template <
        typename bit_stream_base
        >
    bool bit_stream_kernel_c<bit_stream_base>:: 
    read (
        int& bit
    )
    {

        // make sure requires clause is not broken
        DLIB_CASSERT(( this->is_in_read_mode() == true ), 
            "\tbool bit_stream::read"
            << "\n\tyou can't read from a bit_stream that isn't in read mode" 
            << "\n\tthis: " << this
            );

        // call the real function
        return bit_stream_base::read(bit);

    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_BIT_STREAM_KERNEl_C_

