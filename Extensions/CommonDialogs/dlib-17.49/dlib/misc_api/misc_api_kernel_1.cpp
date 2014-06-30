// Copyright (C) 2004  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_MISC_API_KERNEL_1_CPp_
#define DLIB_MISC_API_KERNEL_1_CPp_

#include "../platform.h"
#include "../threads.h"

#ifdef WIN32

#include "misc_api_kernel_1.h"

#include "../windows_magic.h"
#include <windows.h>

#ifdef __BORLANDC__
// Apparently the borland compiler doesn't define this.
#define INVALID_FILE_ATTRIBUTES ((DWORD)-1)
#endif

namespace dlib
{
// ----------------------------------------------------------------------------------------

    void sleep (
        unsigned long milliseconds
    )
    {
        ::Sleep(milliseconds);
    }

// ----------------------------------------------------------------------------------------

    namespace
    {
        mutex& cwd_mutex()
        {
            static mutex m;
            return m;
        }
        // Make sure the above mutex gets constructed before main() 
        // starts.  This way we can be pretty sure it will be constructed
        // before any threads could possibly call set_current_dir() or
        // get_current_dir() simultaneously.
        struct construct_cwd_mutex
        {
            construct_cwd_mutex()
            {
                cwd_mutex();
            }
        } oaimvweoinvwe;
    }

    std::string get_current_dir (
    )
    {
        // need to lock a mutex here because getting and setting the
        // current working directory is not thread safe on windows.
        auto_mutex lock(cwd_mutex());
        char buf[1024];
        if (GetCurrentDirectoryA(sizeof(buf),buf) == 0)
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
        // need to lock a mutex here because getting and setting the
        // current working directory is not thread safe on windows.
        auto_mutex lock(cwd_mutex());
        if (SetCurrentDirectoryA(new_dir.c_str()) == 0)
        {
            throw set_current_dir_error("Error changing current dir to '" + new_dir + "'");
        }
    }

// ----------------------------------------------------------------------------------------

    uint64 timestamper::
    get_timestamp (
    ) const
    {
        unsigned long temp = GetTickCount();
        if (temp >= last_time)
        {            
            last_time = temp;
            return (offset + temp)*1000;
        }
        else
        {
            last_time = temp;

            // there was overflow since the last call so we need to make the offset
            // bigger to account for that
            offset += dword_max;
            return (offset + temp)*1000;
        }        
    }

// ----------------------------------------------------------------------------------------

    void create_directory (
        const std::string& dir
    )
    {
        if (CreateDirectoryA(dir.c_str(),0) == 0)
        {
            // an error has occurred
            if (GetLastError() == ERROR_ALREADY_EXISTS)
            {
                // make sure this is actually a directory
                DWORD attribs = GetFileAttributesA(dir.c_str());
                if (attribs == INVALID_FILE_ATTRIBUTES ||
                    (attribs&FILE_ATTRIBUTE_DIRECTORY) == 0)
                {
                    // it isn't a directory
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

#endif // WIN32

#endif // DLIB_MISC_API_KERNEL_1_CPp_

