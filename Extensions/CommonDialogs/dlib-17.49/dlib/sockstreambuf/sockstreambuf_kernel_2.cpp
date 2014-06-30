// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_SOCKSTREAMBUF_KERNEL_2_CPp_
#define DLIB_SOCKSTREAMBUF_KERNEL_2_CPp_
#include "sockstreambuf_kernel_2.h"
#include "../assert.h"

#include <cstring>

namespace dlib
{

// ---------------------------------------------------------------------------------------- 
    // output functions
// ---------------------------------------------------------------------------------------- 

    sockstreambuf_kernel_2::int_type sockstreambuf_kernel_2::
    overflow (
        int_type c
    )
    {
        if (c != EOF)
        {
            *pptr() = c;
            pbump(1);
        }
        if (flush_out_buffer() == EOF)
        {
            // an error occurred
            return EOF;
        }
        return c;
    }

// ---------------------------------------------------------------------------------------- 

    std::streamsize sockstreambuf_kernel_2::
    xsputn (
        const char* s,
        std::streamsize num
    )
    {
        // Add a sanity check here 
        DLIB_ASSERT(num >= 0,
            "\tstd::streamsize sockstreambuf::xsputn"
            << "\n\tThe number of bytes to write can't be negative"
            << "\n\tnum:  " << num 
            << "\n\tthis: " << this
            );

        std::streamsize space_left = static_cast<std::streamsize>(epptr()-pptr());
        if (num <= space_left)
        {
            std::memcpy(pptr(),s,static_cast<size_t>(num));
            pbump(static_cast<int>(num));
            return num;
        }
        else
        {
            std::memcpy(pptr(),s,static_cast<size_t>(space_left));
            s += space_left;
            pbump(space_left);
            std::streamsize num_left = num - space_left;

            if (flush_out_buffer() == EOF)
            {
                // the write was not successful so return that 0 bytes were written
                return 0;
            }

            if (num_left < out_buffer_size)
            {
                std::memcpy(pptr(),s,static_cast<size_t>(num_left));
                pbump(num_left);
                return num;
            }
            else
            {
                if (con.write(s,num_left) != num_left)
                {
                    // the write was not successful so return that 0 bytes were written
                    return 0;
                } 
                return num;
            }
        }
    }

// ---------------------------------------------------------------------------------------- 
    // input functions
// ---------------------------------------------------------------------------------------- 

    sockstreambuf_kernel_2::int_type sockstreambuf_kernel_2::
    underflow( 
    )
    {
        if (gptr() < egptr())
        {
            return static_cast<unsigned char>(*gptr());
        }

        int num_put_back = static_cast<int>(gptr() - eback());
        if (num_put_back > max_putback)
        {
            num_put_back = max_putback;
        }

        // copy the putback characters into the putback end of the in_buffer
        std::memmove(in_buffer+(max_putback-num_put_back), gptr()-num_put_back, num_put_back);

        int num = con.read(in_buffer+max_putback, in_buffer_size-max_putback);
        if (num <= 0)
        {
            // an error occurred or the connection is over which is EOF
            return EOF;
        }

        // reset in_buffer pointers
        setg (in_buffer+(max_putback-num_put_back),
              in_buffer+max_putback,
              in_buffer+max_putback+num);

        return static_cast<unsigned char>(*gptr());
    }

// ---------------------------------------------------------------------------------------- 

    std::streamsize sockstreambuf_kernel_2::
    xsgetn (
        char_type* s, 
        std::streamsize n
    )
    { 
        std::streamsize temp = n;
        while (n > 0)
        {
            int num = static_cast<int>(egptr() - gptr());
            if (num >= n)
            {
                // copy data from our buffer 
                std::memcpy(s, gptr(), static_cast<size_t>(n));
                gbump(static_cast<int>(n));
                return temp;
            }

            // read more data into our buffer  
            if (num == 0)
            {
                if (underflow() == EOF)
                    break;
                continue;
            }

            // copy all the data from our buffer 
            std::memcpy(s, gptr(), num);
            n -= num;
            gbump(num);
            s += num;
        }
        return temp-n;       
    }

// ---------------------------------------------------------------------------------------- 

}
#endif // DLIB_SOCKSTREAMBUF_KERNEL_2_CPp_

