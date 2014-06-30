// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_MAKE_MFp_ABSTRACT_
#ifdef DLIB_MAKE_MFp_ABSTRACT_

#include "member_function_pointer_kernel_abstract.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    member_function_pointer<>::kernel_1a make_mfp (
        T& object,
        void (T::*cb)()
    );
    /*!
        requires
            - cb == a valid member function pointer for class T
        ensures
            - returns a member function pointer object MFP such that:
                - MFP.is_set() == true
                - calls to MFP() will call (object.*cb)()
    !*/

    template <
        typename T
        >
    member_function_pointer<>::kernel_1a make_mfp (
        const T& object,
        void (T::*cb)()const
    );
    /*!
        requires
            - cb == a valid member function pointer for class T
        ensures
            - returns a member function pointer object MFP such that:
                - MFP.is_set() == true
                - calls to MFP() will call (object.*cb)()
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename A1
        >
    typename member_function_pointer<A1>::kernel_1a make_mfp (
        T& object,
        void (T::*cb)(A1 a1)
    );
    /*!
        requires
            - cb == a valid member function pointer for class T
        ensures
            - returns a member function pointer object MFP such that:
                - MFP.is_set() == true
                - calls to MFP(a1) will call (object.*cb)(a1)
    !*/

    template <
        typename T,
        typename A1
        >
    typename member_function_pointer<A1>::kernel_1a make_mfp (
        const T& object,
        void (T::*cb)(A1 a1)const
    );
    /*!
        requires
            - cb == a valid member function pointer for class T
        ensures
            - returns a member function pointer object MFP such that:
                - MFP.is_set() == true
                - calls to MFP(a1) will call (object.*cb)(a1)
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename A1,
        typename A2
        >
    typename member_function_pointer<A1,A2>::kernel_1a make_mfp (
        T& object,
        void (T::*cb)(A1 a1, A2 a2)
    );
    /*!
        requires
            - cb == a valid member function pointer for class T
        ensures
            - returns a member function pointer object MFP such that:
                - MFP.is_set() == true
                - calls to MFP(a1,a2) will call (object.*cb)(a1,a2)
    !*/

    template <
        typename T,
        typename A1,
        typename A2
        >
    typename member_function_pointer<A1,A2>::kernel_1a make_mfp (
        const T& object,
        void (T::*cb)(A1 a1, A2 a2)const
    );
    /*!
        requires
            - cb == a valid member function pointer for class T
        ensures
            - returns a member function pointer object MFP such that:
                - MFP.is_set() == true
                - calls to MFP(a1,a2) will call (object.*cb)(a1,a2)
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename A1,
        typename A2,
        typename A3
        >
    typename member_function_pointer<A1,A2,A3>::kernel_1a make_mfp (
        T& object,
        void (T::*cb)(A1 a1, A2 a2, A3 a3)
    );
    /*!
        requires
            - cb == a valid member function pointer for class T
        ensures
            - returns a member function pointer object MFP such that:
                - MFP.is_set() == true
                - calls to MFP(a1,a2,a3) will call (object.*cb)(a1,a2,a3)
    !*/

    template <
        typename T,
        typename A1,
        typename A2,
        typename A3
        >
    typename member_function_pointer<A1,A2,A3>::kernel_1a make_mfp (
        const T& object,
        void (T::*cb)(A1 a1, A2 a2, A3 a3)const
    );
    /*!
        requires
            - cb == a valid member function pointer for class T
        ensures
            - returns a member function pointer object MFP such that:
                - MFP.is_set() == true
                - calls to MFP(a1,a2,a3) will call (object.*cb)(a1,a2,a3)
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename A1,
        typename A2,
        typename A3,
        typename A4
        >
    typename member_function_pointer<A1,A2,A3,A4>::kernel_1a make_mfp (
        T& object,
        void (T::*cb)(A1 a1, A2 a2, A3 a3, A4 a4)
    );
    /*!
        requires
            - cb == a valid member function pointer for class T
        ensures
            - returns a member function pointer object MFP such that:
                - MFP.is_set() == true
                - calls to MFP(a1,a2,a3,a4) will call (object.*cb)(a1,a2,a3,a4)
    !*/

    template <
        typename T,
        typename A1,
        typename A2,
        typename A3,
        typename A4
        >
    typename member_function_pointer<A1,A2,A3,A4>::kernel_1a make_mfp (
        const T& object,
        void (T::*cb)(A1 a1, A2 a2, A3 a3, A4 a4)const
    );
    /*!
        requires
            - cb == a valid member function pointer for class T
        ensures
            - returns a member function pointer object MFP such that:
                - MFP.is_set() == true
                - calls to MFP(a1,a2,a3,a4) will call (object.*cb)(a1,a2,a3,a4)
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_MAKE_MFp_ABSTRACT_


