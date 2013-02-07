// Copyright (C) 2004  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_ENTROPY_ENCODER_KERNEl_2_
#define DLIB_ENTROPY_ENCODER_KERNEl_2_

#include "../algs.h"
#include "entropy_encoder_kernel_abstract.h"
#include <iosfwd>
#include "../uintn.h"

namespace dlib
{

    class entropy_encoder_kernel_2 
    {
        /*!
            GENERAL NOTES
                this encoder is implemented using "range" coding

            INITIAL VALUE
                out      == 0
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

        entropy_encoder_kernel_2 (
        );

        virtual ~entropy_encoder_kernel_2 (
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
        entropy_encoder_kernel_2(entropy_encoder_kernel_2&);        // copy constructor
        entropy_encoder_kernel_2& operator=(entropy_encoder_kernel_2&);    // assignment operator

        // data members
        const uint32 initial_low;
        const uint32 initial_high;
        std::ostream* out;
        uint32 low;
        uint32 high;
        std::streambuf* streambuf;

    };   

}

#ifdef NO_MAKEFILE
#include "entropy_encoder_kernel_2.cpp"
#endif

#endif // DLIB_ENTROPY_ENCODER_KERNEl_2_

