// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_ASSERt_
#define DLIB_ASSERt_

#include "config.h"
#include <sstream>
#include <iosfwd>
#include "error.h"

// -----------------------------

// Use some stuff from boost here
//  (C) Copyright John Maddock 2001 - 2003.
//  (C) Copyright Darin Adler 2001.
//  (C) Copyright Peter Dimov 2001.
//  (C) Copyright Bill Kempf 2002.
//  (C) Copyright Jens Maurer 2002.
//  (C) Copyright David Abrahams 2002 - 2003.
//  (C) Copyright Gennaro Prota 2003.
//  (C) Copyright Eric Friedman 2003.
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef BOOST_JOIN
#define BOOST_JOIN( X, Y ) BOOST_DO_JOIN( X, Y )
#define BOOST_DO_JOIN( X, Y ) BOOST_DO_JOIN2(X,Y)
#define BOOST_DO_JOIN2( X, Y ) X##Y
#endif

// figure out if the compiler has static_assert. 
#if defined(__clang__) 
#   if __has_feature(cxx_static_assert)
#       define DLIB_HAS_STATIC_ASSERT
#   endif
#elif defined(__GNUC__) && (__GNUC__ > 4 || (__GNUC__ == 4 && __GNUC_MINOR__ > 2)) && defined(__GXX_EXPERIMENTAL_CXX0X__) 
#   define DLIB_HAS_STATIC_ASSERT
#elif defined(_MSC_VER) && _MSC_VER >= 1600
#   define DLIB_HAS_STATIC_ASSERT
#elif defined(__INTEL_COMPILER) && defined(BOOST_INTEL_STDCXX0X)
#   define DLIB_HAS_STATIC_ASSERT
#endif


// -----------------------------

namespace dlib
{
    template <bool value> struct compile_time_assert;
    template <> struct compile_time_assert<true> { enum {value=1};  };

    template <typename T, typename U> struct assert_are_same_type;
    template <typename T> struct assert_are_same_type<T,T> {enum{value=1};};
    template <typename T, typename U> struct assert_are_not_same_type {enum{value=1}; };
    template <typename T> struct assert_are_not_same_type<T,T> {};

    template <typename T, typename U> struct assert_types_match {enum{value=0};};
    template <typename T> struct assert_types_match<T,T> {enum{value=1};};
}


// gcc 4.8 will warn about unused typedefs.  But we use typedefs in some of the compile
// time assert macros so we need to make it not complain about them "not being used".
#ifdef __GNUC__
#define DLIB_NO_WARN_UNUSED __attribute__ ((unused))
#else
#define DLIB_NO_WARN_UNUSED 
#endif

// Use the newer static_assert if it's available since it produces much more readable error
// messages.
#ifdef DLIB_HAS_STATIC_ASSERT
    #define COMPILE_TIME_ASSERT(expression) static_assert(expression, "Failed assertion")
    #define ASSERT_ARE_SAME_TYPE(type1, type2) static_assert(::dlib::assert_types_match<type1,type2>::value, "These types should be the same but aren't.")
    #define ASSERT_ARE_NOT_SAME_TYPE(type1, type2) static_assert(!::dlib::assert_types_match<type1,type2>::value, "These types should NOT be the same.")
#else
    #define COMPILE_TIME_ASSERT(expression) \
        DLIB_NO_WARN_UNUSED typedef char BOOST_JOIN(DLIB_CTA, __LINE__)[::dlib::compile_time_assert<(bool)(expression)>::value] 

    #define ASSERT_ARE_SAME_TYPE(type1, type2) \
        DLIB_NO_WARN_UNUSED typedef char BOOST_JOIN(DLIB_AAST, __LINE__)[::dlib::assert_are_same_type<type1,type2>::value] 

    #define ASSERT_ARE_NOT_SAME_TYPE(type1, type2) \
        DLIB_NO_WARN_UNUSED typedef char BOOST_JOIN(DLIB_AANST, __LINE__)[::dlib::assert_are_not_same_type<type1,type2>::value] 
#endif

// -----------------------------

#if defined DLIB_DISABLE_ASSERTS
    // if DLIB_DISABLE_ASSERTS is on then never enable DLIB_ASSERT no matter what.
    #undef ENABLE_ASSERTS
#endif

#if !defined(DLIB_DISABLE_ASSERTS) && ( defined DEBUG || defined _DEBUG)
    // make sure ENABLE_ASSERTS is defined if we are indeed using them.
    #ifndef ENABLE_ASSERTS
        #define ENABLE_ASSERTS
    #endif
#endif

// -----------------------------

#ifdef __GNUC__
// There is a bug in version 4.4.5 of GCC on Ubuntu which causes GCC to segfault
// when __PRETTY_FUNCTION__ is used within certain templated functions.  So just
// don't use it with this version of GCC.
#  if !(__GNUC__ == 4 && __GNUC_MINOR__ == 4 && __GNUC_PATCHLEVEL__ == 5)
#    define DLIB_FUNCTION_NAME __PRETTY_FUNCTION__
#  else
#    define DLIB_FUNCTION_NAME "unknown function" 
#  endif
#elif defined(_MSC_VER)
#define DLIB_FUNCTION_NAME __FUNCSIG__
#else
#define DLIB_FUNCTION_NAME "unknown function" 
#endif

#define DLIB_CASSERT(_exp,_message)                                              \
    {if ( !(_exp) )                                                         \
    {                                                                       \
        dlib_assert_breakpoint();                                           \
        std::ostringstream dlib_o_out;                                       \
        dlib_o_out << "\n\nError detected at line " << __LINE__ << ".\n";    \
        dlib_o_out << "Error detected in file " << __FILE__ << ".\n";      \
        dlib_o_out << "Error detected in function " << DLIB_FUNCTION_NAME << ".\n\n";      \
        dlib_o_out << "Failing expression was " << #_exp << ".\n";           \
        dlib_o_out << std::boolalpha << _message << "\n";                    \
        throw dlib::fatal_error(dlib::EBROKEN_ASSERT,dlib_o_out.str());      \
    }}                                                                      


#ifdef ENABLE_ASSERTS 
    #define DLIB_ASSERT(_exp,_message) DLIB_CASSERT(_exp,_message)
    #define DLIB_IF_ASSERT(exp) exp
#else
    #define DLIB_ASSERT(_exp,_message) {}
    #define DLIB_IF_ASSERT(exp) 
#endif

// ----------------------------------------------------------------------------------------

    /*!A DLIB_ASSERT_HAS_STANDARD_LAYOUT 
    
        This macro is meant to cause a compiler error if a type doesn't have a simple
        memory layout (like a C struct). In particular, types with simple layouts are
        ones which can be copied via memcpy().
        
        
        This was called a POD type in C++03 and in C++0x we are looking to check if 
        it is a "standard layout type".  Once we can use C++0x we can change this macro 
        to something that uses the std::is_standard_layout type_traits class.  
        See: http://www2.research.att.com/~bs/C++0xFAQ.html#PODs
    !*/
    // Use the fact that in C++03 you can't put non-PODs into a union.
#define DLIB_ASSERT_HAS_STANDARD_LAYOUT(type)   \
    union  BOOST_JOIN(DAHSL_,__LINE__) { type TYPE_NOT_STANDARD_LAYOUT; };  \
    DLIB_NO_WARN_UNUSED typedef char BOOST_JOIN(DAHSL2_,__LINE__)[sizeof(BOOST_JOIN(DAHSL_,__LINE__))]; 

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

// breakpoints
extern "C"
{
    inline void dlib_assert_breakpoint(
    ) {}
    /*!
        ensures
            - this function does nothing 
              It exists just so you can put breakpoints on it in a debugging tool.
              It is called only when an DLIB_ASSERT or DLIB_CASSERT fails and is about to
              throw an exception.
    !*/
}

// -----------------------------

#include "stack_trace.h"

#endif // DLIB_ASSERt_

