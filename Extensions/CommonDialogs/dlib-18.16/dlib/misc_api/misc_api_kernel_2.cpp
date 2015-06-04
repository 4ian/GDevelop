// Copyright (C) 2004  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_MISC_API_KERNEL_2_CPp_
#define DLIB_MISC_API_KERNEL_2_CPp_
#include "../platform.h"

#ifdef POSIX

#include <unistd.h>
#include "misc_api_kernel_2.h"
#include <sys/time.h>
#include <sys/stat.h>
#include <sys/types.h>
#include <errno.h>

namespace dlib
{
// ----------------------------------------------------------------------------------------

    void sleep (
        unsigned long milliseconds
    )
    {
        // in HP-UX you can only usleep for less than a second 
#ifdef HPUX
        if (milliseconds >= 1000)
        {
            ::sleep(milliseconds/1000);
            unsigned long remaining = milliseconds%1000;
            if (remaining > 0)
                ::usleep(remaining*1000);
        }
        else
        {
            ::usleep(milliseconds*1000);
        }
#else
        ::usleep(milliseconds*1000);
#endif
    }

// ----------------------------------------------------------------------------------------

    std::string get_current_dir (
    )
    {
        char buf[1024];
        if (getcwd(buf,sizeof(buf)) == 0)
        {
            return std::string();
        }
        else
        {
            return std::string(buf);
        }
    }

// ----------------------------------------------------------------------------------------

    void set_current_dir (
        const std::string& new_dir
    )
    {
        if (chdir(new_dir.c_str()))
        {
            throw set_current_dir_error("Error changing current dir to '" + new_dir + "'");
        }
    }

// ----------------------------------------------------------------------------------------

    uint64 timestamper::
    get_timestamp (
    ) const
    {
        uint64 ts;
        timeval curtime;
        gettimeofday(&curtime,0);       

        ts = curtime.tv_sec;
        ts *= 1000000;
        ts += curtime.tv_usec;
        return ts;
    }

// ----------------------------------------------------------------------------------------

    void create_directory (
        const std::string& dir
    )
    {
        if (mkdir(dir.c_str(),0777))
        {
            // an error has occurred
            if (errno == EEXIST)
            {
                struct stat buffer;
                // now check that this is actually a valid directory
                if (::stat(dir.c_str(),&buffer))
                {
                    // the directory was not found
                    throw dir_create_error(dir);
                }
                else if (S_ISDIR(buffer.st_mode) == 0)
                {
                    // It is not a directory
                    throw dir_create_error(dir);
                }
            }
            else
            {
                throw dir_create_error(dir);
            }
        }
    }

// ----------------------------------------------------------------------------------------
}

#endif // POSIX

#endif // DLIB_MISC_API_KERNEL_2_CPp_

