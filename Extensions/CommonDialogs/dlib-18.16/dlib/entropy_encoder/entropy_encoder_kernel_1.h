// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_ENTROPY_ENCODER_KERNEl_1_
#define DLIB_ENTROPY_ENCODER_KERNEl_1_

#include "../algs.h"
#include "entropy_encoder_kernel_abstract.h"
#include <iosfwd>
#include "../uintn.h"

namespace dlib
{

    class entropy_encoder_kernel_1 
    {
        /*!
            GENERAL NOTES
                this encoder is implemented using arithmetic coding

            INITIAL VALUE
                out      == 0
                buf_used == 0
                buf      == 0
                initial_low      == 0x00000001  (slightly more than zero)
                initial_high     == 0xffffffff  (slightly less than one, 0.99999999976717)
                low      == initial_low
                high     == initial_high

            CONVENTION
                if (out != 0)
                    *out      == get_stream()
                    true      == stream_is_set()
                    streambuf == out->rdbuf()
                else
                    false     == stream_is_set()

                buf      == used to accumulate bits before writing them to out.  
                buf_used == the number of low order bits in buf that are currently 
                            in use
                low      == the low end of the range used for arithmetic encoding.
                            this number is used as a 32bit fixed point real number. 
                            the point is fixed just before the first bit, so it is
                            always in the range [0,1)

                            low is also never allowed to be zero to avoid overflow
                            in the calculation (high-low+1)/total.

                high     == the high end of the range - 1 used for arithmetic encoding.
                            this number is used as a 32bit fixed point real number. 
                            the point is fixed just before the first bit, so when we
                            interpret high as a real number then it is always in the
                            range [0,1)

                            the range for arithmetic encoding is always 
                            [low,high + 0.9999999...)   the 0.9999999... is why
                            high == real upper range - 1         
 
        !*/

    public:

        entropy_encoder_kernel_1 (
        );

        virtual ~entropy_encoder_kernel_1 (
        );

        void clear(
        );

        void set_stream (
            std::ostream& out
        );

        bool stream_is_set (
        ) const;

        std::ostream& get_stream (
        ) const;

        void encode (
            uint32 low_count,
            uint32 high_count,
            uint32 total
        );

    private:

        void flush ( 
        );
        /*!
            requires
                out != 0 (i.e.  there is a stream object to flush the data to 
        !*/

        // restricted functions
        entropy_encoder_kernel_1(entropy_encoder_kernel_1&);        // copy constructor
        entropy_encoder_kernel_1& operator=(entropy_encoder_kernel_1&);    // assignment operator

        // data members
        const uint32 initial_low;
        const uint32 initial_high;
        std::ostream* out;
        uint32 low;
        uint32 high;
        unsigned char buf; 
        uint32 buf_used; 
        std::streambuf* streambuf;

    };   
   
}

#ifdef NO_MAKEFILE
#include "entropy_encoder_kernel_1.cpp"
#endif

#endif // DLIB_ENTROPY_ENCODER_KERNEl_1_

