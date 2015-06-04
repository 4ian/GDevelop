// Copyright (C) 2006  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_EXTRA_LOGGER_HEADERs_
#define DLIB_EXTRA_LOGGER_HEADERs_

#include "logger_kernel_abstract.h"
#include "logger_kernel_1.h"
#include <iostream>
#include <string>
#include "../uintn.h"

// ----------------------------------------------------------------------------------------

namespace dlib
{

    void print_datetime_logger_header (
        std::ostream& out,
        const std::string& logger_name,
        const log_level& l,
        const uint64 thread_id
    );
    /*!
        requires
            - is not called more than once at a time (i.e. is not called from multiple
              threads at the same time).
        ensures
            - let DATE be the current date and time (e.g. Thu Aug 31 16:41:52 2006).  
            - prints a string to out in the form:  "l.name (DATE) [thread_id] logger_name:"
    !*/

}

// ----------------------------------------------------------------------------------------

#ifdef NO_MAKEFILE
#include "extra_logger_headers.cpp"
#endif

#endif // DLIB_EXTRA_LOGGER_HEADERs_

