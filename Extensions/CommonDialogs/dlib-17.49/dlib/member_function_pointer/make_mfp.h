// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_MAKE_MFp_H_
#define DLIB_MAKE_MFp_H_

#include "member_function_pointer_kernel_1.h"
#include "make_mfp_abstract.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    mfpk1<> make_mfp (
        T& object,
        void (T::*cb)()
    )
    {
        mfpk1<> temp;
        temp.set(object, cb);
        return temp;
    }

    template <
        typename T
        >
    mfpk1<> make_mfp (
        const T& object,
        void (T::*cb)()const
    )
    {
        mfpk1<> temp;
        temp.set(object, cb);
        return temp;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename A1
        >
    mfpk1<A1> make_mfp (
        T& object,
        void (T::*cb)(A1)
    )
    {
        mfpk1<A1> temp;
        temp.set(object, cb);
        return temp;
    }

    template <
        typename T,
        typename A1
        >
    mfpk1<A1> make_mfp (
        const T& object,
        void (T::*cb)(A1)const
    )
    {
        mfpk1<A1> temp;
        temp.set(object, cb);
        return temp;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename A1,
        typename A2
        >
    mfpk1<A1,A2> make_mfp (
        T& object,
        void (T::*cb)(A1,A2)
    )
    {
        mfpk1<A1,A2> temp;
        temp.set(object, cb);
        return temp;
    }

    template <
        typename T,
        typename A1,
        typename A2
        >
    mfpk1<A1,A2> make_mfp (
        const T& object,
        void (T::*cb)(A1,A2)const
    )
    {
        mfpk1<A1,A2> temp;
        temp.set(object, cb);
        return temp;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename A1,
        typename A2,
        typename A3
        >
    mfpk1<A1,A2,A3> make_mfp (
        T& object,
        void (T::*cb)(A1,A2,A3)
    )
    {
        mfpk1<A1,A2,A3> temp;
        temp.set(object, cb);
        return temp;
    }

    template <
        typename T,
        typename A1,
        typename A2,
        typename A3
        >
    mfpk1<A1,A2,A3> make_mfp (
        const T& object,
        void (T::*cb)(A1,A2,A3)const
    )
    {
        mfpk1<A1,A2,A3> temp;
        temp.set(object, cb);
        return temp;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename A1,
        typename A2,
        typename A3,
        typename A4
        >
    mfpk1<A1,A2,A3,A4> make_mfp (
        T& object,
        void (T::*cb)(A1,A2,A3,A4)
    )
    {
        mfpk1<A1,A2,A3,A4> temp;
        temp.set(object, cb);
        return temp;
    }

    template <
        typename T,
        typename A1,
        typename A2,
        typename A3,
        typename A4
        >
    mfpk1<A1,A2,A3,A4> make_mfp (
        const T& object,
        void (T::*cb)(A1,A2,A3,A4)const
    )
    {
        mfpk1<A1,A2,A3,A4> temp;
        temp.set(object, cb);
        return temp;
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_MAKE_MFp_H_



