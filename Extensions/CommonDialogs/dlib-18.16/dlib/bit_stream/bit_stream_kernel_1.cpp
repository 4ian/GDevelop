// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_BIT_STREAM_KERNEL_1_CPp_
#define DLIB_BIT_STREAM_KERNEL_1_CPp_


#include "bit_stream_kernel_1.h"
#include "../algs.h"

#include <iostream>

namespace dlib
{

    inline void swap (
        bit_stream_kernel_1& a, 
        bit_stream_kernel_1& b
    ) { a.swap(b); }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    void bit_stream_kernel_1::
    clear (
    )
    {
        if (write_mode)
        {
            write_mode = false;

            // flush output buffer
            if (buffer_size > 0)
            {
                buffer <<= 8 - buffer_size;
                osp->write(reinterpret_cast<char*>(&buffer),1);
            }
        }
        else
            read_mode = false;

    }

// ----------------------------------------------------------------------------------------

    void bit_stream_kernel_1::
    set_input_stream (
        std::istream& is
    )
    {
        isp = &is;
        read_mode = true;

        buffer_size = 0;
    }

// ----------------------------------------------------------------------------------------

    void bit_stream_kernel_1::
    set_output_stream (
        std::ostream& os
    )
    {
        osp = &os;
        write_mode = true;

        buffer_size = 0;
    }

// ----------------------------------------------------------------------------------------

    void bit_stream_kernel_1::
    close (
    )
    {
        if (write_mode)
        {
            write_mode = false;

            // flush output buffer
            if (buffer_size > 0)
            {
                buffer <<= 8 - buffer_size;
                osp->write(reinterpret_cast<char*>(&buffer),1);
            }
        }
        else
            read_mode = false;
    }

// ----------------------------------------------------------------------------------------

    bool bit_stream_kernel_1::
    is_in_write_mode (
    ) const
    {
        return write_mode;
    }

// ----------------------------------------------------------------------------------------

    bool bit_stream_kernel_1::
    is_in_read_mode (
    ) const
    {
        return read_mode;
    }

// ----------------------------------------------------------------------------------------

    void bit_stream_kernel_1::
    write (
        int bit
    )
    {
        // flush buffer if necessary
        if (buffer_size == 8)
        {
            buffer <<= 8 - buffer_size;
            if (osp->rdbuf()->sputn(reinterpret_cast<char*>(&buffer),1) == 0)
            {
                throw std::ios_base::failure("error occured in the bit_stream object");
            }

            buffer_size = 0;
        }

        ++buffer_size;
        buffer <<= 1;
        buffer += static_cast<unsigned char>(bit);
    }

// ----------------------------------------------------------------------------------------

    bool bit_stream_kernel_1::
    read (
        int& bit
    )
    {
        // get new byte if necessary
        if (buffer_size == 0)
        {
            if (isp->rdbuf()->sgetn(reinterpret_cast<char*>(&buffer), 1) == 0)
            {
                // if we didn't read anything then return false
                return false;
            }

            buffer_size = 8;
        }

        // put the most significant bit from buffer into bit
        bit = static_cast<int>(buffer >> 7);

        // shift out the bit that was just read
        buffer <<= 1;
        --buffer_size;

        return true;
    }

// ----------------------------------------------------------------------------------------

    void bit_stream_kernel_1::
    swap (
        bit_stream_kernel_1& item
    )
    {

        std::istream*   isp_temp            = item.isp;
        std::ostream*   osp_temp            = item.osp;
        bool            write_mode_temp     = item.write_mode;
        bool            read_mode_temp      = item.read_mode;
        unsigned char   buffer_temp         = item.buffer;
        unsigned short  buffer_size_temp    = item.buffer_size;

        item.isp            = isp;
        item.osp            = osp;
        item.write_mode     = write_mode;
        item.read_mode      = read_mode;
        item.buffer         = buffer;
        item.buffer_size    = buffer_size;


        isp             = isp_temp;
        osp             = osp_temp;
        write_mode      = write_mode_temp;
        read_mode       = read_mode_temp;
        buffer          = buffer_temp;
        buffer_size     = buffer_size_temp;

    }

// ----------------------------------------------------------------------------------------

}
#endif // DLIB_BIT_STREAM_KERNEL_1_CPp_

