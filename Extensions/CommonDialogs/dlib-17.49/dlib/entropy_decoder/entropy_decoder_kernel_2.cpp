// Copyright (C) 2004  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_ENTROPY_DECODER_KERNEL_2_CPp_
#define DLIB_ENTROPY_DECODER_KERNEL_2_CPp_
#include "entropy_decoder_kernel_2.h"
#include <iostream>
#include <streambuf>
#include <sstream>

#include "../assert.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    entropy_decoder_kernel_2::
    entropy_decoder_kernel_2(
    ) :
        initial_low(0x00000001),
        initial_high(0xffffffff),
        in(0),
        low(initial_low),
        high(initial_high),
        target(0x00000000),
        r(0)
    {
    }

// ----------------------------------------------------------------------------------------

    entropy_decoder_kernel_2::
    ~entropy_decoder_kernel_2 (
    )
    {
    }

// ----------------------------------------------------------------------------------------

    void entropy_decoder_kernel_2::
    clear(
    )
    {
        in       = 0;
        r        = 0;
        low      = initial_low;
        high     = initial_high;
        target   = 0x00000000;
    }

// ----------------------------------------------------------------------------------------

    void entropy_decoder_kernel_2::
    set_stream (
        std::istream& in_
    )
    {
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

    bool entropy_decoder_kernel_2::
    stream_is_set (
    ) const
    {
        if (in != 0)
            return true;
        else
            return false;
    }

// ----------------------------------------------------------------------------------------

    std::istream& entropy_decoder_kernel_2::
    get_stream (
    ) const
    {
        return *in;
    }

// ----------------------------------------------------------------------------------------

    void entropy_decoder_kernel_2::
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


        while (true )
        {

            // if high and low don't have the same 8 high order bits
            if ((high&0xFF000000) != (low&0xFF000000)) 
            {   
                // if the distance between high and low is small and there aren't
                // any bits we can roll off then force high and low to have common high 
                // order bits.
                if ((high-low < 0x10000))
                {
                    if (high-low > 0x1000)
                    {
                        high>>=1;
                        low>>=1;
                        high = low = high+low;
                        high += 0xFF;
                        low -= 0xFF;
                    } 
                    else /**/
                    {
                        high>>=1;
                        low>>=1;
                        high = low = high+low;
                    }
                }
                else
                {
                    // there are no bits to roll off and high and low are not
                    // too close so just quit the loop
                    break;
                }
                
            }  
            // else if there are 8 bits we can roll off
            else
            {
                unsigned char buf;
                if (streambuf->sgetn(reinterpret_cast<char*>(&buf),1)==0)
                {
                    // if there isn't anything else in the streambuffer then just
                    // make buf zero.  
                    buf = 0;      
                }

                // also roll off the bits in target
                target <<= 8;  

                // roll off the bits
                high <<= 8;
                low <<= 8;             
                high |= 0xFF;  // note that it is ok to add 0xFF to high here because
                            // of the convention that high == real upper range - 1.
                            // so that means that if we want to shift the upper range
                            // left by one then we must shift a one into high also
                            // since real upper range == high + 0.999999999...

                // make sure low is never zero
                if (low == 0)
                    low = 1;
        

                // put the new bits into target            
                target |= static_cast<uint32>(buf);               
            }

        } // while (true)
    }

// ----------------------------------------------------------------------------------------

    bool entropy_decoder_kernel_2::
    get_target_called (        
    ) const
    {           
        return (r != 0);
    }

// ----------------------------------------------------------------------------------------

    uint32 entropy_decoder_kernel_2::
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
#endif // DLIB_ENTROPY_DECODER_KERNEL_2_CPp_

