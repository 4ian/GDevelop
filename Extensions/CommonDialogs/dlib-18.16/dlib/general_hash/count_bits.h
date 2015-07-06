// Copyright (C) 2013  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_COUNT_BiTS_Hh_
#define DLIB_COUNT_BiTS_Hh_

#include "../algs.h"
#include <climits>

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    T count_bits (
        T v
    )
    /*!
        requires
            - T is an unsigned integral type
        ensures
            - returns the number of bits in v which are set to 1.
    !*/
    {
        COMPILE_TIME_ASSERT(is_unsigned_type<T>::value && sizeof(T) <= 8);

        // This bit of bit trickery is from:
        // http://graphics.stanford.edu/~seander/bithacks.html#CountBitsSet64

        v = v - ((v >> 1) & (T)~(T)0/3);                           
        v = (v & (T)~(T)0/15*3) + ((v >> 2) & (T)~(T)0/15*3);      
        v = (v + (v >> 4)) & (T)~(T)0/255*15;                      
        return (T)(v * ((T)~(T)0/255)) >> (sizeof(T) - 1) * CHAR_BIT; 
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    T hamming_distance (
        const T& a,
        const T& b
    )
    /*!
        requires
            - T is an unsigned integral type
        ensures
            - returns the number of bits which differ between a and b.
    !*/
    {
        return count_bits(a^b);
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_COUNT_BiTS_Hh_

