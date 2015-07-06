// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_DIR_NAV_KERNEL_1_CPp_
#define DLIB_DIR_NAV_KERNEL_1_CPp_
#include "../platform.h"

#ifdef WIN32

#include "dir_nav_kernel_1.h"
#include "../string.h"


#ifdef __BORLANDC__
// Apparently the borland compiler doesn't define this.
#define INVALID_FILE_ATTRIBUTES ((DWORD)-1)
#endif

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


        char buf[3000];
        char* str;
        if (GetFullPathNameA(name.c_str(),sizeof(buf),buf,&str) == 0)
        {
            // the file was not found
            throw file_not_found("Unable to find file " + name);
        }
        state.full_name = buf;
        

        string::size_type pos = state.full_name.find_last_of(directory::get_separator());
        if (pos == string::npos)
        {
            // no valid full path has no separator characters.  
            throw file_not_found("Unable to find file " + name);
        }
        state.name = state.full_name.substr(pos+1);


        // now find the size of this file
        WIN32_FIND_DATAA data;
        HANDLE ffind = FindFirstFileA(state.full_name.c_str(), &data);
        if (ffind == INVALID_HANDLE_VALUE ||
            (data.dwFileAttributes&FILE_ATTRIBUTE_DIRECTORY) != 0)
        {
            throw file_not_found("Unable to find file " + name);                
        }
        else
        {
            uint64 temp = data.nFileSizeHigh;            
            temp <<= 32;
            temp |= data.nFileSizeLow;
            state.file_size = temp;
            FindClose(ffind);
        } 

    }

// ----------------------------------------------------------------------------------------

    bool file::
    operator == (
        const file& rhs
    ) const 
    { 
        using namespace std;

        if (state.full_name.size() != rhs.state.full_name.size())
            return false;
        
        // compare the strings but ignore the case because file names
        // are not case sensitive on windows
        return tolower(state.full_name) == tolower(rhs.state.full_name);
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

        
        char buf[3000];
        char* str;
        if (GetFullPathNameA(name.c_str(),sizeof(buf),buf,&str) == 0)
        {
            // the directory was not found
            throw dir_not_found("Unable to find directory " + name);
        }
        state.full_name = buf;
  
        
        const char sep = get_separator();
        if (is_root_path(state.full_name) == false)
        {
            // ensure that thre is not a trialing separator
            if (state.full_name[state.full_name.size()-1] == sep)
                state.full_name.erase(state.full_name.size()-1);

            // pick out the directory name
            string::size_type pos = state.full_name.find_last_of(sep);
            state.name = state.full_name.substr(pos+1);
        }
        else
        {
            // ensure that there is a trailing separator
            if (state.full_name[state.full_name.size()-1] != sep)
                state.full_name += sep;
        }


        // now check that this is actually a valid directory
        DWORD attribs = GetFileAttributesA(state.full_name.c_str());
        if (attribs == INVALID_FILE_ATTRIBUTES ||
            (attribs&FILE_ATTRIBUTE_DIRECTORY) == 0)
        {
            // the directory was not found
            throw dir_not_found("Unable to find directory " + name);
        }

    }

// ----------------------------------------------------------------------------------------

    char directory::
    get_separator (
    ) 
    {
        return '\\';
    }

// ----------------------------------------------------------------------------------------

    bool directory::
    operator == (
        const directory& rhs
    ) const 
    { 
        using namespace std;

        if (state.full_name.size() != rhs.state.full_name.size())
            return false;

        // compare the strings but ignore the case because file names
        // are not case sensitive on windows
        return tolower(state.full_name) == tolower(rhs.state.full_name);
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

            string::size_type pos = state.full_name.find_last_of(sep);
            temp.state.full_name = state.full_name.substr(0,pos);

            if ( is_root_path(temp.state.full_name))
            {
                temp.state.full_name += sep;
            }
            else
            {
                pos = temp.state.full_name.find_last_of(sep);
                if (pos != string::npos)
                {
                    temp.state.name = temp.state.full_name.substr(pos+1);
                }
                else
                {
                    temp.state.full_name += sep;
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
        using namespace std;
        const char sep = get_separator();
        bool root_path = false;
        if (path.size() > 2 && path[0] == sep && path[1] == sep)
        {
            // in this case this is a windows share path
            string::size_type pos = path.find_first_of(sep,2);
            if (pos != string::npos)
            {                
                pos = path.find_first_of(sep,pos+1);

                if (pos == string::npos && path[path.size()-1] != sep)
                    root_path = true;
                else if (pos == path.size()-1)
                    root_path = true;
            }

        }
        else if ( (path.size() == 2 || path.size() == 3) && path[1] == ':')
        {
            // if this is a valid windows path then it must be a root path
            root_path = true;
        }

        return root_path;
    }

// ----------------------------------------------------------------------------------------

}

#endif // WIN32

#endif // DLIB_DIR_NAV_KERNEL_1_CPp_

