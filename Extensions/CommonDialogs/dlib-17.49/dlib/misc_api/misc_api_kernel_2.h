// Copyright (C) 2004  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_MISC_API_KERNEl_2_
#define DLIB_MISC_API_KERNEl_2_

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
    public:
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
        const std::string& name;
    }; 


    void create_directory (
        const std::string& dir
    );

// ----------------------------------------------------------------------------------------

}

#ifdef NO_MAKEFILE
#include "misc_api_kernel_2.cpp"
#endif

#endif // DLIB_MISC_API_KERNEl_2_

