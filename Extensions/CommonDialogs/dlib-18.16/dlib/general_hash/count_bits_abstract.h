// Copyright (C) 2013  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_COUNT_BiTS_ABSTRACT_Hh_
#ifdef DLIB_COUNT_BiTS_ABSTRACT_Hh_


namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    T count_bits (
        T v
    );
    /*!
        requires
            - T is an unsigned integral type
        ensures
            - returns the number of bits in v which are set to 1.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    T hamming_distance (
        const T& a,
        const T& b
    );
    /*!
        requires
            - T is an unsigned integral type
        ensures
            - returns the number of bits which differ between a and b.  (I.e. returns
              count_bits(a^b).)
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_COUNT_BiTS_ABSTRACT_Hh_


