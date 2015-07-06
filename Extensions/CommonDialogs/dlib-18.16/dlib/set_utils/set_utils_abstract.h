// Copyright (C) 2007  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_SET_UTILs_ABSTRACT_
#ifdef DLIB_SET_UTILs_ABSTRACT_

#include "../set.h"
#include "../algs.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename U
        >
    unsigned long set_intersection_size (
        const T& a,
        const U& b
    );
    /*!
        requires
            - T and U must both be implementations of set/set_kernel_abstract.h
        ensures
            - returns the number of elements that are in both set a and b
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename U,
        typename V
        >
    void set_union (
        const T& a,
        const U& b,
        V& u
    );
    /*!
        requires
            - T, U, and V must all be implementations of set/set_kernel_abstract.h
            - the types of objects contained in these sets must be copyable
        ensures
            - #u == the union of a and b.  That is, u contains all elements 
              of a and all the elements of b.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename U,
        typename V
        >
    void set_intersection (
        const T& a,
        const U& b,
        V& i
    );
    /*!
        requires
            - T, U, and V must all be implementations of set/set_kernel_abstract.h
            - the types of objects contained in these sets must be copyable
        ensures
            - #i == the intersection of a and b.  That is, i contains all elements 
              of a that are also in b.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename U,
        typename V
        >
    void set_difference (
        const T& a,
        const U& b,
        V& d 
    );
    /*!
        requires
            - T, U, and V must all be implementations of set/set_kernel_abstract.h
            - the types of objects contained in these sets must be copyable
        ensures
            - #d == the difference of a and b.  That is, d contains all elements 
              of a that are NOT in b.
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_SET_UTILs_ABSTRACT_


