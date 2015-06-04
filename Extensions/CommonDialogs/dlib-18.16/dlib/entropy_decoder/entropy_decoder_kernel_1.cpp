// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_ENTROPY_DECODER_KERNEL_1_CPp_
#define DLIB_ENTROPY_DECODER_KERNEL_1_CPp_
#include "entropy_decoder_kernel_1.h"
#include <iostream>
#include <streambuf>
#include <sstream>

#include "../assert.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    entropy_decoder_kernel_1::
    entropy_decoder_kernel_1(
    ) :
        initial_low(0x00000001),
        initial_high(0xffffffff),
        in(0),
        low(initial_low),
        high(initial_high),
        buf(0),
        buf_used(0),
        target(0x00000000),
        r(0)
    {
    }

// ----------------------------------------------------------------------------------------

    entropy_decoder_kernel_1::
    ~entropy_decoder_kernel_1 (
    )
    {
    }

// ----------------------------------------------------------------------------------------

    void entropy_decoder_kernel_1::
    clear(
    )
    {
        in       = 0;
        buf_used = 0;
        buf      = 0;
        r        = 0;
        low      = initial_low;
        high     = initial_high;
        target   = 0x00000000;
    }

// ----------------------------------------------------------------------------------------

    void entropy_decoder_kernel_1::
    set_stream (
        std::istream& in_
    )
    {
        buf_used = 0;
        buf      = 0;
        r        = 0;
        low      = initial_low;
        high     = initial_high;
        target   = 0x00000000;

        in = &in_;
        streambuf = in_.rdbuf();



        unsigned char ch;

        
        streambuf->sgetn((char*)&ch,1);
        target = ch;
        
        target <<= 8;
        if (streambuf->sgetn((char*)&ch,1))
            target += ch;


        target <<= 8;
        if (streambuf->sgetn((char*)&ch,1))
            target += ch;


        target <<= 8;
        if (streambuf->sgetn((char*)&ch,1))
            target += ch;

    }

// ----------------------------------------------------------------------------------------

    bool entropy_decoder_kernel_1::
    stream_is_set (
    ) const
    {
        if (in != 0)
            return true;
        else
            return false;
    }

// ----------------------------------------------------------------------------------------

    std::istream& entropy_decoder_kernel_1::
    get_stream (
    ) const
    {
        return *in;
    }

// ----------------------------------------------------------------------------------------

    void entropy_decoder_kernel_1::
    decode (
        uint32 low_count,
        uint32 high_count
    )
    {
        // note that we must subtract 1 to preserve the convention that
        // high == the real upper range - 1
        high = low + r*high_count - 1;
        low = low + r*low_count;
        r = 0;



        while (true)
        {

            // if the highest order bit in high and low is the same
            if ( low >= 0x80000000 || high < 0x80000000)
            {
                // make sure buf isn't empty
                if (buf_used == 0)
                {
                    buf_used = 8;
                    if (streambuf->sgetn(reinterpret_cast<char*>(&buf),1)==0)
                    {
                        // if there isn't anything else in the streambuffer then just
                        // make buf zero.  
                        buf = 0;      
                    }
                }

                // we will be taking one bit from buf to replace the one we threw away
                --buf_used;

                // roll off the bit in target
                target <<= 1;  

                // roll off the bit
                high <<= 1;
                low <<= 1;                
                high |= 1;  // note that it is ok to add one to high here because
                            // of the convention that high == real upper range - 1.
                            // so that means that if we want to shift the upper range
                            // left by one then we must shift a one into high also
                            // since real upper range == high + 0.999999999...

                // make sure low is never zero
                if (low == 0)
                    low = 1;

                  // take a bit from buf to fill in the one we threw away                
                target += (buf>>buf_used)&0x01;   
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

    bool entropy_decoder_kernel_1::
    get_target_called (        
    ) const
    {           
        return (r != 0);
    }

// ----------------------------------------------------------------------------------------

    uint32 entropy_decoder_kernel_1::
    get_target (
        uint32 total
    ) 
    {   
        // note that we must add one because of the convention that
        // high == the real upper range minus 1
        r = (high-low+1)/total;                   
        uint32 temp = (target-low)/r;
        if (temp < total)
            return temp;
        else
            return total-1;
    }

// ----------------------------------------------------------------------------------------

}
#endif // DLIB_ENTROPY_DECODER_KERNEL_1_CPp_

