// Copyright (C) 2010  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_BOOST_NUMERIC_BINDINGS_TRAITS_FORTRAN_H
#define DLIB_BOOST_NUMERIC_BINDINGS_TRAITS_FORTRAN_H

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
//       FORTRAN BINDING STUFF FROM BOOST 
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

//  Permission to copy, use, modify, sell and
//  distribute this software is granted provided this copyright notice appears
//  in all copies. This software is provided "as is" without express or implied
//  warranty, and with no claim as to its suitability for any purpose.
//  Copyright (C) 2002, 2003 Si-Lab b.v.b.a., Toon Knapen and Kresimir Fresl 


// First we need to know what the conventions for linking
// C with Fortran is on this platform/toolset
#if defined(__GNUC__) || defined(__ICC) || defined(__sgi) || defined(__COMO__) || defined(__KCC)
#define DLIB_BIND_FORTRAN_LOWERCASE_UNDERSCORE
#elif defined(__IBMCPP__) || defined(_MSC_VER)
#define DLIB_BIND_FORTRAN_LOWERCASE
#else
#error do not know how to link with fortran for the given platform
#endif

// Next we define macros to convert our symbols to 
// the current convention
#if defined(DLIB_BIND_FORTRAN_LOWERCASE_UNDERSCORE)
#define DLIB_FORTRAN_ID( id ) id##_
#elif defined(DLIB_BIND_FORTRAN_LOWERCASE)
#define DLIB_FORTRAN_ID( id ) id
#else
#error do not know how to bind to fortran calling convention
#endif



namespace dlib
{
    namespace lapack
    {
            // stuff from f2c used to define what exactly is an integer in fortran
#if defined(__alpha__) || defined(__sparc64__) || defined(__x86_64__) || defined(__ia64__)
            typedef int integer;
            typedef unsigned int uinteger;
#else
            typedef long int integer;
            typedef unsigned long int uinteger;
#endif

    }
}

#endif // DLIB_BOOST_NUMERIC_BINDINGS_TRAITS_FORTRAN_H

