// Copyright (C) 2004  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_ENTROPY_DECODER_KERNEl_2_
#define DLIB_ENTROPY_DECODER_KERNEl_2_

#include "../algs.h"
#include "entropy_decoder_kernel_abstract.h"
#include <iosfwd>
#include "../uintn.h"

namespace dlib
{

    class entropy_decoder_kernel_2 
    {
        /*!
            GENERAL NOTES
                this decoder is implemented using "range" coding

            INITIAL VALUE
                in       == 0
                initial_low      == 0x00000001  (slightly more than zero)
                initial_high     == 0xffffffff  (slightly less than one, 0.99999999976717)
                target   == 0x00000000  (zero)
                low      == initial_low
                high     == initial_high
                r        == 0

            CONVENTION
                if (in != 0)
                    *in       == get_stream()
                    true      == stream_is_set()
                    streambuf == in->rdbuf()
                else
                    false   == stream_is_set()


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

                target  ==  32 bits of the fraction produced from an arithmetic encoder.
                            this number is used as a 32bit fixed point real number. 
                            the point is fixed just before the first bit, so it is
                            always in the range [0,1)      

                r       ==  the value (high-low+1)/total from the last call to 
                            get_target() or 0 if get_target_called() should be false

                get_target_called() == (r != 0)

        !*/

    public:

        entropy_decoder_kernel_2 (
        );

        virtual ~entropy_decoder_kernel_2 (
        );

        void clear(
        );

        void set_stream (
            std::istream& in
        );

        bool stream_is_set (
        ) const;

        std::istream& get_stream (
        ) const;

        void decode (
            uint32 low_count,
            uint32 high_count
        );

        bool get_target_called (
        ) const;

        uint32 get_target (
            uint32 total
        );

    private:

        // restricted functions
        entropy_decoder_kernel_2(entropy_decoder_kernel_2&);        // copy constructor
        entropy_decoder_kernel_2& operator=(entropy_decoder_kernel_2&);    // assignment operator

        // data members
        const uint32 initial_low;
        const uint32 initial_high;
        std::istream* in;
        uint32 low;
        uint32 high;
        uint32 target;
        uint32 r;
        std::streambuf* streambuf;

    };   
   

}

#ifdef NO_MAKEFILE
#include "entropy_decoder_kernel_2.cpp"
#endif

#endif // DLIB_ENTROPY_DECODER_KERNEl_2_

