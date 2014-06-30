// Copyright (C) 2005  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.

#ifndef DLIB_UINtn_
#define DLIB_UINtn_

#include "assert.h"

namespace dlib
{

    /*!
        uint64 is a typedef for an unsigned integer that is exactly 64 bits wide.
        uint32 is a typedef for an unsigned integer that is exactly 32 bits wide.
        uint16 is a typedef for an unsigned integer that is exactly 16 bits wide.
        uint8  is a typedef for an unsigned integer that is exactly 8  bits wide.

        int64 is a typedef for an integer that is exactly 64 bits wide.
        int32 is a typedef for an integer that is exactly 32 bits wide.
        int16 is a typedef for an integer that is exactly 16 bits wide.
        int8  is a typedef for an integer that is exactly 8  bits wide.
    !*/


#ifdef __GNUC__
    typedef unsigned long long uint64;
    typedef long long int64;
#elif __BORLANDC__
    typedef unsigned __int64 uint64;
    typedef __int64 int64;
#elif _MSC_VER
    typedef unsigned __int64 uint64;
    typedef __int64 int64;
#else
    typedef unsigned long long uint64;
    typedef long long int64;
#endif

    typedef unsigned short uint16;
    typedef unsigned int   uint32;
    typedef unsigned char  uint8;

    typedef short int16;
    typedef int   int32;
    typedef char  int8;


    // make sure these types have the right sizes on this platform
    COMPILE_TIME_ASSERT(sizeof(uint8)  == 1);
    COMPILE_TIME_ASSERT(sizeof(uint16) == 2);
    COMPILE_TIME_ASSERT(sizeof(uint32) == 4);
    COMPILE_TIME_ASSERT(sizeof(uint64) == 8);

    COMPILE_TIME_ASSERT(sizeof(int8)  == 1);
    COMPILE_TIME_ASSERT(sizeof(int16) == 2);
    COMPILE_TIME_ASSERT(sizeof(int32) == 4);
    COMPILE_TIME_ASSERT(sizeof(int64) == 8);



    template <typename T, size_t s = sizeof(T)>
    struct unsigned_type;
    template <typename T>
    struct unsigned_type<T,1> { typedef uint8 type; };
    template <typename T>
    struct unsigned_type<T,2> { typedef uint16 type; };
    template <typename T>
    struct unsigned_type<T,4> { typedef uint32 type; };
    template <typename T>
    struct unsigned_type<T,8> { typedef uint64 type; };
    /*!
        ensures
            - sizeof(unsigned_type<T>::type) == sizeof(T)
            - unsigned_type<T>::type is an unsigned integral type
    !*/

    template <typename T, typename U>
    T zero_extend_cast(
        const U val
    )
    /*!
        requires
            - U and T are integral types
        ensures
            - let ut be a typedef for unsigned_type<U>::type
            - return static_cast<T>(static_cast<ut>(val));
    !*/
    {
        typedef typename unsigned_type<U>::type ut;
        return static_cast<T>(static_cast<ut>(val));
    }

}

#endif // DLIB_UINtn_

