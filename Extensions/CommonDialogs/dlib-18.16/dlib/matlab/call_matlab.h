// Copyright (C) 2012 Massachusetts Institute of Technology, Lincoln Laboratory
// License: Boost Software License   See LICENSE.txt for the full license.
// Authors: Davis E. King (davis@dlib.net)
#ifndef MIT_LL_CALL_MATLAB_H__
#define MIT_LL_CALL_MATLAB_H__

#include <string>

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

template <typename T> 
struct output_decorator
{
    output_decorator(T& item_):item(item_){}
    T& item;
};

template <typename T>
output_decorator<T> returns(T& item) { return output_decorator<T>(item); }
/*!
    ensures
        - decorates item as an output type.  This stuff is used by the call_matlab()
          functions to tell if an argument is an input to the function or is supposed
          to be bound to one of the return arguments.
!*/

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

struct function_handle
{
    /*!
        WHAT THIS OBJECT REPRESENTS
            This type is used to represent function handles passed from MATLAB into a
            mex function.  You can call the function referenced by the handle by
            saying:
                call_matlab(my_handle);
    !*/

    // These two lines are just implementation details, ignore them.
    function_handle():h(0){}
    void* const h;
};

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

void call_matlab (
    const std::string& function_name
);
/*!
    ensures
        - Calls MATLAB's function of the given name
!*/

// ----------------------------------------------------------------------------------------

void call_matlab (
    const function_handle& funct 
);
/*!
    ensures
        - Calls MATLAB's function represented by the handle funct
!*/

// ----------------------------------------------------------------------------------------

template <
    typename T1
    >
void call_matlab (
    const std::string& function_name,
    const T1& A1
);
/*!
    ensures
        - calls MATLAB's function of the given name.  
        - if (A1 is not decorated as an output by returns()) then
            - A1 is passed as an argument into the MATLAB function
        - else
            - A1 is treated as the first return value from the MATLAB function.
!*/

template <
    typename T1
    >
void call_matlab (
    const function_handle& funct,
    const T1& A1
) { call_matlab("feval", funct, A1); }
/*!
    ensures
        - Calls MATLAB's function represented by the handle funct
        - if (A1 is not decorated as an output by returns()) then
            - A1 is passed as an argument into the MATLAB function
        - else
            - A1 is treated as the first return value from the MATLAB function.
!*/

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
/*
    The rest of this file is just overloads of call_matlab() for up to 10 arguments (or
    just 9 arguments if function_handle is used).  They all do the same thing as the above 
    version of call_matlab().  Generally, any argument not decorated by returns() is an 
    input to the MATLAB function.  On the other hand, all arguments decorated by returns() 
    are treated as outputs.  
*/
// ----------------------------------------------------------------------------------------

template <
    typename T1, 
    typename T2
    >
void call_matlab (
    const std::string& function_name,
    const T1& A1,
    const T2& A2
);

// ----------------------------------------------------------------------------------------

template <
    typename T1, 
    typename T2,
    typename T3
    >
void call_matlab (
    const std::string& function_name,
    const T1& A1,
    const T2& A2,
    const T3& A3
);

// ----------------------------------------------------------------------------------------

template <
    typename T1, 
    typename T2,
    typename T3,
    typename T4
    >
void call_matlab (
    const std::string& function_name,
    const T1& A1,
    const T2& A2,
    const T3& A3,
    const T4& A4
);

// ----------------------------------------------------------------------------------------

template <
    typename T1, 
    typename T2,
    typename T3,
    typename T4,
    typename T5
    >
void call_matlab (
    const std::string& function_name,
    const T1& A1,
    const T2& A2,
    const T3& A3,
    const T4& A4,
    const T5& A5
);

// ----------------------------------------------------------------------------------------

template <
    typename T1, 
    typename T2,
    typename T3,
    typename T4,
    typename T5,
    typename T6
    >
void call_matlab (
    const std::string& function_name,
    const T1& A1,
    const T2& A2,
    const T3& A3,
    const T4& A4,
    const T5& A5,
    const T6& A6
);

// ----------------------------------------------------------------------------------------

template <
    typename T1, 
    typename T2,
    typename T3,
    typename T4,
    typename T5,
    typename T6,
    typename T7
    >
void call_matlab (
    const std::string& function_name,
    const T1& A1,
    const T2& A2,
    const T3& A3,
    const T4& A4,
    const T5& A5,
    const T6& A6,
    const T7& A7
);

// ----------------------------------------------------------------------------------------

template <
    typename T1, 
    typename T2,
    typename T3,
    typename T4,
    typename T5,
    typename T6,
    typename T7,
    typename T8
    >
void call_matlab (
    const std::string& function_name,
    const T1& A1,
    const T2& A2,
    const T3& A3,
    const T4& A4,
    const T5& A5,
    const T6& A6,
    const T7& A7,
    const T8& A8
);

// ----------------------------------------------------------------------------------------

template <
    typename T1, 
    typename T2,
    typename T3,
    typename T4,
    typename T5,
    typename T6,
    typename T7,
    typename T8,
    typename T9
    >
void call_matlab (
    const std::string& function_name,
    const T1& A1,
    const T2& A2,
    const T3& A3,
    const T4& A4,
    const T5& A5,
    const T6& A6,
    const T7& A7,
    const T8& A8,
    const T9& A9
);

// ----------------------------------------------------------------------------------------

template <
    typename T1, 
    typename T2,
    typename T3,
    typename T4,
    typename T5,
    typename T6,
    typename T7,
    typename T8,
    typename T9,
    typename T10
    >
void call_matlab (
    const std::string& function_name,
    const T1& A1,
    const T2& A2,
    const T3& A3,
    const T4& A4,
    const T5& A5,
    const T6& A6,
    const T7& A7,
    const T8& A8,
    const T9& A9,
    const T10& A10
);

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

template <
    typename T1,
    typename T2
    >
void call_matlab (
    const function_handle& funct,
    const T1& A1,
    const T2& A2
)
{
    call_matlab("feval", funct, A1, A2);
}

template <
    typename T1,
    typename T2,
    typename T3
    >
void call_matlab (
    const function_handle& funct,
    const T1& A1,
    const T2& A2,
    const T3& A3
)
{
    call_matlab("feval", funct, A1, A2, A3);
}

template <
    typename T1,
    typename T2,
    typename T3,
    typename T4
    >
void call_matlab (
    const function_handle& funct,
    const T1& A1,
    const T2& A2,
    const T3& A3,
    const T4& A4
)
{
    call_matlab("feval", funct, A1, A2, A3, A4);
}

template <
    typename T1,
    typename T2,
    typename T3,
    typename T4,
    typename T5
    >
void call_matlab (
    const function_handle& funct,
    const T1& A1,
    const T2& A2,
    const T3& A3,
    const T4& A4,
    const T5& A5
)
{
    call_matlab("feval", funct, A1, A2, A3, A4, A5);
}

template <
    typename T1,
    typename T2,
    typename T3,
    typename T4,
    typename T5,
    typename T6
    >
void call_matlab (
    const function_handle& funct,
    const T1& A1,
    const T2& A2,
    const T3& A3,
    const T4& A4,
    const T5& A5,
    const T6& A6
)
{
    call_matlab("feval", funct, A1, A2, A3, A4, A5, A6);
}

template <
    typename T1,
    typename T2,
    typename T3,
    typename T4,
    typename T5,
    typename T6,
    typename T7
    >
void call_matlab (
    const function_handle& funct,
    const T1& A1,
    const T2& A2,
    const T3& A3,
    const T4& A4,
    const T5& A5,
    const T6& A6,
    const T7& A7
)
{
    call_matlab("feval", funct, A1, A2, A3, A4, A5, A6, A7);
}

template <
    typename T1,
    typename T2,
    typename T3,
    typename T4,
    typename T5,
    typename T6,
    typename T7,
    typename T8
    >
void call_matlab (
    const function_handle& funct,
    const T1& A1,
    const T2& A2,
    const T3& A3,
    const T4& A4,
    const T5& A5,
    const T6& A6,
    const T7& A7,
    const T8& A8
)
{
    call_matlab("feval", funct, A1, A2, A3, A4, A5, A6, A7, A8);
}

template <
    typename T1,
    typename T2,
    typename T3,
    typename T4,
    typename T5,
    typename T6,
    typename T7,
    typename T8,
    typename T9
    >
void call_matlab (
    const function_handle& funct,
    const T1& A1,
    const T2& A2,
    const T3& A3,
    const T4& A4,
    const T5& A5,
    const T6& A6,
    const T7& A7,
    const T8& A8,
    const T9& A9
)
{
    call_matlab("feval", funct, A1, A2, A3, A4, A5, A6, A7, A8, A9);
}

// ----------------------------------------------------------------------------------------

#endif // MIT_LL_CALL_MATLAB_H__

