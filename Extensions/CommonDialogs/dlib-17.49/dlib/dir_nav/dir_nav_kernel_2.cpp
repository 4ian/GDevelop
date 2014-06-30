// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_DIR_NAV_KERNEL_2_CPp_
#define DLIB_DIR_NAV_KERNEL_2_CPp_

#include "../platform.h"

#ifdef POSIX


#include "dir_nav_kernel_2.h"





namespace dlib
{

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // file object implementation
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    void file::
    init (
        const std::string& name
    )
    {
        using namespace std;
        state = new data;
        state->count = 1;



        char buf[PATH_MAX];
        if (realpath(name.c_str(),buf) == 0)
        {
            // the file was not found
            throw file_not_found("Unable to find file " + name);
        }
        state->full_name = buf;


        string::size_type pos = state->full_name.find_last_of(directory::get_separator());
        if (pos == string::npos)
        {
            // no valid full path has no separtor characters.  
            throw file_not_found("Unable to find file " + name);
        }
        state->name = state->full_name.substr(pos+1);


        // now find the size of this file
        struct stat64 buffer;
        if (::stat64(state->full_name.c_str(), &buffer) ||
            S_ISDIR(buffer.st_mode))
        {
            // there was an error during the call to stat64 or
            // name is actually a directory
            throw file_not_found("Unable to find file " + name);
        }
        else
        {
            state->file_size = static_cast<uint64>(buffer.st_size);
        }

    }

// ----------------------------------------------------------------------------------------

    bool file::
    operator == (
        const file& rhs
    ) const 
    { 
        using namespace std;
        if (state->full_name.size() == 0 && rhs.state->full_name.size() == 0)
            return true;

        // These files might have different names but actually represent the same
        // file due to the presence of symbolic links.
        char buf[PATH_MAX];
        string left, right;
        if (realpath(state->full_name.c_str(),buf) == 0)
            return false;    
        left = buf;

        if (realpath(rhs.state->full_name.c_str(),buf) == 0)
            return false;    
        right = buf;

        return (left == right);
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // directory object implementation
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    void directory::
    init (
        const std::string& name
    )
    {
        using namespace std;

        state = new data;
        state->count = 1;        
        
        char buf[PATH_MAX];
        if (realpath(name.c_str(),buf) == 0)
        {
            // the directory was not found
            throw dir_not_found("Unable to find directory " + name);
        }
        state->full_name = buf;
  
        
        const char sep = get_separator();
        if (is_root_path(state->full_name) == false)
        {
            // ensure that thre is not a trialing separator
            if (state->full_name[state->full_name.size()-1] == sep)
                state->full_name.erase(state->full_name.size()-1);

            // pick out the directory name
            string::size_type pos = state->full_name.find_last_of(sep);
            state->name = state->full_name.substr(pos+1);
        }
        else
        {
            // ensure that there is a trailing separator
            if (state->full_name[state->full_name.size()-1] != sep)
                state->full_name += sep;
        }


        struct stat64 buffer;
        // now check that this is actually a valid directory
        if (::stat64(state->full_name.c_str(),&buffer))
        {
            // the directory was not found
            throw dir_not_found("Unable to find directory " + name);
        }
        else if (S_ISDIR(buffer.st_mode) == 0)
        {
            // It is not a directory
            throw dir_not_found("Unable to find directory " + name);
        }
    }

// ----------------------------------------------------------------------------------------

    char directory::
    get_separator (
    ) 
    {
        return '/';
    }

// ----------------------------------------------------------------------------------------

    bool directory::
    operator == (
        const directory& rhs
    ) const 
    { 
        using namespace std;
        if (state->full_name.size() == 0 && rhs.state->full_name.size() == 0)
            return true;

        // These directories might have different names but actually represent the same
        // directory due to the presence of symbolic links.
        char buf[PATH_MAX];
        string left, right;
        if (realpath(state->full_name.c_str(),buf) == 0)
            return false;    
        left = buf;

        if (realpath(rhs.state->full_name.c_str(),buf) == 0)
            return false;    
        right = buf;

        return (left == right);
    }

// ----------------------------------------------------------------------------------------

    const directory directory::
    get_parent (
    ) const
    {
        using namespace std;
        // if *this is the root then just return *this
        if (is_root())
        {
            return *this;
        }
        else
        {
            directory temp;

            const char sep = get_separator();

            string::size_type pos = state->full_name.find_last_of(sep);
            temp.state->full_name = state->full_name.substr(0,pos);

            if ( is_root_path(temp.state->full_name))
            {
                temp.state->full_name += sep;
            }
            else
            {
                pos = temp.state->full_name.find_last_of(sep);
                if (pos != string::npos)
                {
                    temp.state->name = temp.state->full_name.substr(pos+1);
                }
                else
                {
                    temp.state->full_name += sep;
                }
            }
            return temp;
        }
    }

// ----------------------------------------------------------------------------------------

    bool directory::
    is_root_path (
        const std::string& path
    ) const
    {
        const char sep = get_separator();
        if (path.size() == 1 && path[0] == sep)
            return true;
        else
            return false;   
    }

// ----------------------------------------------------------------------------------------

}

#endif // POSIX

#endif // DLIB_DIR_NAV_KERNEL_2_CPp_

