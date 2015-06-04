// Copyright (C) 2006  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_EXTRA_LOGGER_HEADERs_CPP_
#define DLIB_EXTRA_LOGGER_HEADERs_CPP_

#include "extra_logger_headers.h"
#include <ctime>
#include <cstring>

// ----------------------------------------------------------------------------------------

namespace dlib
{

    void print_datetime_logger_header (
        std::ostream& out,
        const std::string& logger_name,
        const log_level& l,
        const uint64 thread_id
    )
    {
        using namespace std;
        char* buf;

        time_t t = time(0);
        buf = ctime(&t);
        // remove the trailing '\n'
        size_t size = strlen(buf);
        buf[size-1] = '\0';

        out << l.name << " (" << buf << ") [" << thread_id << "] " << logger_name << ": ";
    }

}

// ----------------------------------------------------------------------------------------

#endif // DLIB_EXTRA_LOGGER_HEADERs_CPP_


