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
    member_function_pointer<> make_mfp (
        T& object,
        void (T::*cb)()
    )
    {
        member_function_pointer<> temp;
        temp.set(object, cb);
        return temp;
    }

    template <
        typename T
        >
    member_function_pointer<> make_mfp (
        const T& object,
        void (T::*cb)()const
    )
    {
        member_function_pointer<> temp;
        temp.set(object, cb);
        return temp;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename A1
        >
    member_function_pointer<A1> make_mfp (
        T& object,
        void (T::*cb)(A1)
    )
    {
        member_function_pointer<A1> temp;
        temp.set(object, cb);
        return temp;
    }

    template <
        typename T,
        typename A1
        >
    member_function_pointer<A1> make_mfp (
        const T& object,
        void (T::*cb)(A1)const
    )
    {
        member_function_pointer<A1> temp;
        temp.set(object, cb);
        return temp;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename A1,
        typename A2
        >
    member_function_pointer<A1,A2> make_mfp (
        T& object,
        void (T::*cb)(A1,A2)
    )
    {
        member_function_pointer<A1,A2> temp;
        temp.set(object, cb);
        return temp;
    }

    template <
        typename T,
        typename A1,
        typename A2
        >
    member_function_pointer<A1,A2> make_mfp (
        const T& object,
        void (T::*cb)(A1,A2)const
    )
    {
        member_function_pointer<A1,A2> temp;
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
    member_function_pointer<A1,A2,A3> make_mfp (
        T& object,
        void (T::*cb)(A1,A2,A3)
    )
    {
        member_function_pointer<A1,A2,A3> temp;
        temp.set(object, cb);
        return temp;
    }

    template <
        typename T,
        typename A1,
        typename A2,
        typename A3
        >
    member_function_pointer<A1,A2,A3> make_mfp (
        const T& object,
        void (T::*cb)(A1,A2,A3)const
    )
    {
        member_function_pointer<A1,A2,A3> temp;
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
    member_function_pointer<A1,A2,A3,A4> make_mfp (
        T& object,
        void (T::*cb)(A1,A2,A3,A4)
    )
    {
        member_function_pointer<A1,A2,A3,A4> temp;
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
    member_function_pointer<A1,A2,A3,A4> make_mfp (
        const T& object,
        void (T::*cb)(A1,A2,A3,A4)const
    )
    {
        member_function_pointer<A1,A2,A3,A4> temp;
        temp.set(object, cb);
        return temp;
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_MAKE_MFp_H_



