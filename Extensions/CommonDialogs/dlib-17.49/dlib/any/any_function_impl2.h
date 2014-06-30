// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_ANY_FUNCTION_ARG_LIST
#error "You aren't supposed to directly #include this file.  #include <dlib/any.h> instead."  
#endif

#ifdef DLIB_ANY_FUNCTION_ARG_LIST 

// The case where function_type has a non-void return type
    template <typename function_type, typename Enabled>
    class any_function<function_type, Enabled, DLIB_ANY_FUNCTION_NUM_ARGS>
    {
#define DLIB_ANY_FUNCTION_RETURN return
#include "any_function_impl.h"
#undef DLIB_ANY_FUNCTION_RETURN
    };

// The case where function_type has a void return type
    template <typename function_type>
    class any_function<function_type, typename sig_traits<function_type>::type, DLIB_ANY_FUNCTION_NUM_ARGS>
    {
#define DLIB_ANY_FUNCTION_RETURN 
#include "any_function_impl.h"
#undef DLIB_ANY_FUNCTION_RETURN
    };

#undef DLIB_ANY_FUNCTION_ARG_LIST
#undef DLIB_ANY_FUNCTION_ARGS
#undef DLIB_ANY_FUNCTION_NUM_ARGS

#endif // DLIB_ANY_FUNCTION_ARG_LIST

