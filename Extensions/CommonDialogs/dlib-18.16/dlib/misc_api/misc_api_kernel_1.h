// Copyright (C) 2004  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_MISC_API_KERNEl_1_
#define DLIB_MISC_API_KERNEl_1_

#ifdef DLIB_ISO_CPP_ONLY
#error "DLIB_ISO_CPP_ONLY is defined so you can't use this OS dependent code.  Turn DLIB_ISO_CPP_ONLY off if you want to use it."
#endif


#include "misc_api_kernel_abstract.h"
#include "../algs.h"
#include <string>
#include "../uintn.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    void sleep (
        unsigned long milliseconds
    );

// ----------------------------------------------------------------------------------------

    std::string get_current_dir (
    );

// ----------------------------------------------------------------------------------------

    class set_current_dir_error : public error
    {
    public:
        set_current_dir_error(
            const std::string& a
        ): error(a) {}
    };

    void set_current_dir (
        const std::string& new_dir
    );

// ----------------------------------------------------------------------------------------

    class timestamper 
    {
        /*!
            INITIAL VALUE
                - last_time == 0
                - offset == 0
                - dword_max == 2^32

            CONVENTION
                - last_time == the time returned by GetTickCount() the last time we
                  called it.
                - offset == the number of microseconds we should add to the result of
                  GetTickCount() so that it is correct.
                - dword_max == 2^32.  
                  This is the number of values representable by a DWORD.  
        !*/

        mutable unsigned long last_time;
        mutable uint64 offset;
        mutable uint64 dword_max;

    public:
        timestamper(
        ) :
            last_time(0),
            offset(0)
        {
            dword_max = 0xFFFFFFFF;
            ++dword_max;
        }

        uint64 get_timestamp (
        ) const;
    };

// ----------------------------------------------------------------------------------------

    class dir_create_error : public error 
    {
    public:
        dir_create_error(
            const std::string& dir_name
        ) : 
            error(EDIR_CREATE,"Error creating directory '" + dir_name + "'."),
            name(dir_name)
        {}

        ~dir_create_error() throw() {}
        const std::string name;
    }; 

    void create_directory (
        const std::string& dir
    );

// ----------------------------------------------------------------------------------------

}

#ifdef NO_MAKEFILE
#include "misc_api_kernel_1.cpp"
#endif

#endif // DLIB_MISC_API_KERNEl_1_

