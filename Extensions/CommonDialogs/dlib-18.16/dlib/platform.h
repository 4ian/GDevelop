// Copyright (C) 2006  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_PLATFORm_
#define DLIB_PLATFORm_


/*!
    This file ensures that:
        - if (we are compiling under a posix platform) then
            - POSIX will be defined
            - if (this is also Mac OS X) then
                - MACOSX will be defined
            - if (this is also HP-UX) then
                - HPUX will be defined
        - if (we are compiling under an MS Windows platform) then
            - WIN32 will be defined
!*/


/*
    A good reference for this sort of information is
    http://predef.sourceforge.net/
*/

// Define WIN32 if this is MS Windows
#ifndef WIN32
    #if defined( _MSC_VER) || defined(__BORLANDC__) || defined(_WIN32) || defined(__WIN32__) || defined(__TOS_WIN__)
    #define WIN32 
    #endif 
#endif

#ifndef WIN32
    // since this is the only other platform the library currently supports
    // just assume it is POSIX if it isn't WIN32
    #ifndef POSIX
        #define POSIX
    #endif
 
    #ifndef HPUX
       #if defined(__hpux ) || defined(hpux) || defined (_hpux)
       #define HPUX
       #endif	
    #endif

    #ifndef MACOSX
        #ifdef __MACOSX__
        #define MACOSX
        #endif 
        #ifdef __APPLE__
        #define MACOSX
        #endif
    #endif

#endif




#endif // DLIB_PLATFORm_

