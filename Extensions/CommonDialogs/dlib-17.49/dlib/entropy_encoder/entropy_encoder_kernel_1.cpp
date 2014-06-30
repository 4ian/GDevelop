// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_ENTROPY_ENCODER_KERNEL_1_CPp_
#define DLIB_ENTROPY_ENCODER_KERNEL_1_CPp_
#include "entropy_encoder_kernel_1.h"
#include <iostream>
#include <streambuf>

namespace dlib
{


// ----------------------------------------------------------------------------------------

    entropy_encoder_kernel_1::
    entropy_encoder_kernel_1(
    ) :
        initial_low(0x00000001),
        initial_high(0xffffffff),
        out(0),
        low(initial_low),
        high(initial_high),
        buf(0),
        buf_used(0)
    {
    }

// ----------------------------------------------------------------------------------------

    entropy_encoder_kernel_1::
    ~entropy_encoder_kernel_1 (
    )
    {
        try {
            if (out != 0)
            {
                flush();
            }
        } catch (...) {}
    }

// ----------------------------------------------------------------------------------------

    void entropy_encoder_kernel_1::
    clear(
    )
    {
        if (out != 0)
        {
            flush();
        }
        out = 0;
    }

// ----------------------------------------------------------------------------------------

    void entropy_encoder_kernel_1::
    set_stream (
        std::ostream& out_
    )
    {
        if (out != 0)
        {
            // if a stream is currently set then flush the buffers to it before
            // we switch to the new stream
            flush();
        }
    
        out = &out_;
        streambuf = out_.rdbuf();

        // reset the encoder state
        buf_used = 0;
        buf = 0;
        low = initial_low;
        high = initial_high;
    }

// ----------------------------------------------------------------------------------------

    bool entropy_encoder_kernel_1::
    stream_is_set (
    ) const
    {
        if (out != 0)
            return true;
        else
            return false;
    }

// ----------------------------------------------------------------------------------------

    std::ostream& entropy_encoder_kernel_1::
    get_stream (
    ) const
    {
        return *out;
    }

// ----------------------------------------------------------------------------------------

    void entropy_encoder_kernel_1::
    encode (
        uint32 low_count,
        uint32 high_count,
        uint32 total
    )
    {
        // note that we must add one because of the convention that
        // high == the real upper range minus 1
        uint32 r = (high-low+1)/total;                 

        // note that we must subtract 1 to preserve the convention that
        // high == the real upper range - 1
        high = low + r*high_count-1;
        low = low + r*low_count;


        while (true)
        {

            // if the highest order bit in high and low is the same
            if ( low >= 0x80000000 || high < 0x80000000)
            {              
                // if buf is full then write it out
                if (buf_used == 8)
                {
                    if (streambuf->sputn(reinterpret_cast<char*>(&buf),1)==0)
                    {
                        throw std::ios_base::failure("error occured in the entropy_encoder object");
                    }
                    buf = 0;
                    buf_used = 0;
                }   


                // write the high order bit from low into buf
                buf <<= 1;
                ++buf_used;                
                if (low&0x80000000)
                    buf |= 0x1;

                // roll off the bit we just wrote to buf
                low <<= 1;                
                high <<= 1;  
                high |= 1;     // note that it is ok to add one to high here because
                            // of the convention that high == real upper range - 1.
                            // so that means that if we want to shift the upper range
                            // left by one then we must shift a one into high also
                            // since real upper range == high + 0.999999999...

                // make sure low is never zero
                if (low == 0)
                    low = 1;
            }
            // if the distance between high and low is small and there aren't
            // any bits we can roll off then round low up or high down.
            else if (high-low < 0x10000)
            {
                if (high == 0x80000000)
                    high = 0x7fffffff;
                else
                    low = 0x80000000;
            }
            else
            {
                break;
            }
        } // while (true)

    }

// ----------------------------------------------------------------------------------------

    void entropy_encoder_kernel_1::
    flush (
    )
    {
        // flush the next 4 or 5 bytes that are buffered
        // thats whatever is contained in buf and then all of low plus any extra 
        // bits needed to pad that to be an even 4 or 5 bytes


        if (buf_used != 8)
        {
            buf <<= (8-buf_used);   
            buf |= static_cast<unsigned char>(low>>(24+buf_used));         
            low <<= (8-buf_used);
        }

        if (streambuf->sputn(reinterpret_cast<char*>(&buf),1) == 0)
            throw std::ios_base::failure("error occured in the entropy_encoder object");



        buf = static_cast<unsigned char>((low >> 24)&0xFF);
        if (streambuf->sputn(reinterpret_cast<char*>(&buf),1) == 0)
            throw std::ios_base::failure("error occured in the entropy_encoder object");




        buf = static_cast<unsigned char>((low >> 16)&0xFF);
        if (streambuf->sputn(reinterpret_cast<char*>(&buf),1)==0)
            throw std::ios_base::failure("error occured in the entropy_encoder object");



        buf = static_cast<unsigned char>((low >> 8)&0xFF);
        if (streambuf->sputn(reinterpret_cast<char*>(&buf),1)==0)
            throw std::ios_base::failure("error occured in the entropy_encoder object");



        if (buf_used != 0)
        {
            buf = static_cast<unsigned char>((low)&0xFF);
            if (streambuf->sputn(reinterpret_cast<char*>(&buf),1)==0)
                throw std::ios_base::failure("error occured in the entropy_encoder object");
        }
    

        
        // make sure the stream buffer flushes to its I/O channel
        streambuf->pubsync();


        // reset the encoder state
        buf_used = 0;
        buf = 0;
        low = initial_low;
        high = initial_high;
    }

// ----------------------------------------------------------------------------------------

}
#endif // DLIB_ENTROPY_ENCODER_KERNEL_1_CPp_

