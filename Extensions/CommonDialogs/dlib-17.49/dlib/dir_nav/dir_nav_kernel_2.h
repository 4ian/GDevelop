// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_DIR_NAV_KERNEl_2_
#define DLIB_DIR_NAV_KERNEl_2_

#ifdef DLIB_ISO_CPP_ONLY
#error "DLIB_ISO_CPP_ONLY is defined so you can't use this OS dependent code.  Turn DLIB_ISO_CPP_ONLY off if you want to use it."
#endif


#include "dir_nav_kernel_abstract.h"

#include <string>
#include "../uintn.h"
#include "../algs.h"

#include <sys/types.h>
#include <dirent.h>
#include <libgen.h>
#include <unistd.h>
#include <sys/stat.h>
#include <errno.h>
#include <stdlib.h>

#if !defined(__USE_LARGEFILE64 ) && !defined(_LARGEFILE64_SOURCE)
#define stat64 stat
#endif

#include <vector>
#include "../stl_checked.h"
#include "../enable_if.h"
#include "../queue.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // file object    
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    
    class file
    {
        /*!
            INITIAL VALUES
                state->name        == name()
                state->full_name   == full_name()
                state->file_size   == size()

            CONVENTION
                state->name        == name()
                state->full_name   == full_name()
                state->file_size   == size()
                state->count       == the number of file objects that point to state

        !*/

        friend class directory;

        struct data
        {
            uint64 file_size;
            std::string name;
            std::string full_name;
            unsigned long count;
        };

        void init(const std::string& name);

    public:

        struct private_constructor{};
        inline file (
            const std::string& name,
            const std::string& full_name,
            const uint64 file_size,
            private_constructor
        )
        {
            state = new data;
            state->count = 1;
            state->file_size = file_size;
            state->name = name;
            state->full_name = full_name;
        }


        class file_not_found : public error { 
            public: file_not_found(const std::string& s): error(s){}
        };
        
        inline file (
        )
        {
            state = new data;
            state->count = 1;
            state->file_size = 0;
        }

        file (
            const std::string& name
        ) { init(name); }

        file (
            const char* name
        ) { init(name); }

        inline file (
            const file& item
        )
        {            
            state = item.state;
            state->count += 1;
        }

        inline ~file (
        )
        {
            if (state->count == 1)            
                delete state;
            else
                state->count -= 1;
        }

        inline const std::string& name (
        ) const { return state->name; }

        inline  const std::string& full_name (
        ) const { return state->full_name; }

        inline uint64 size (
        ) const { return state->file_size; }

        inline file& operator= (
            const file& rhs
        )
        {    
            if (&rhs == this)
                return *this;
        
            if (state->count == 1)            
                delete state;
            else
                state->count -= 1;

            state = rhs.state;
            state->count += 1;
            return *this;
        }

        bool operator == (
            const file& rhs
        ) const;

        bool operator != (
            const file& rhs
        ) const { return !(*this == rhs); }

        inline bool operator < (
            const file& item
        ) const { return full_name() < item.full_name(); }

        inline void swap (
            file& item
        ) 
        { 
            exchange(state,item.state); 
        }

    private:

        // member data
        data* state;

    };

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // directory object    
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
       
    class directory
    {
        /*!
            INITIAL VALUES
                state->name        == name()
                state->full_name   == full_name()

            CONVENTION
                state->name        == name()
                state->full_name   == full_name()
                state->count       == the number of directory objects that point to state
                is_root()          == state->name.size() == 0

        !*/

        void init(const std::string& name);

    public:
        struct private_constructor{};
        inline directory (
            const std::string& name,
            const std::string& full_name,
            private_constructor
        )
        {
            state = new data;
            state->count = 1;
            state->name = name;
            state->full_name = full_name;
        }

        struct data
        {
            std::string name;
            std::string full_name;
            unsigned long count;
        };

        class dir_not_found : public error {
            public: dir_not_found(const std::string& s):error(s){}
        };
        class listing_error : public error {
            public: listing_error(const std::string& s):error(s){}
        };
        
        inline directory (
        )
        {
            state = new data;
            state->count = 1;
        }

        directory (
            const std::string& name
        ) { init(name); }

        directory (
            const char* name
        ) { init(name); }

        inline directory (
            const directory& item
        )
        {            
            state = item.state;
            state->count += 1;
        }

        inline ~directory (
        )
        {            
            if (state->count == 1)            
                delete state;
            else
                state->count -= 1;
        }

        static char get_separator (
        );

        template <
            typename queue_of_files
            >
        void get_files (
            queue_of_files& files
        ) const;

        template <
            typename queue_of_dirs
            >
        void get_dirs (
            queue_of_dirs& dirs
        ) const;

        const directory get_parent (
        ) const;
       
        inline bool is_root (
        ) const { return state->name.size() == 0; }

        inline const std::string& name (
        ) const { return state->name; }

        inline const std::string& full_name (
        ) const { return state->full_name; }

        directory& operator= (
            const directory& rhs
        )
        {            
            if (&rhs == this)
                return *this;

            if (state->count == 1)            
                delete state;
            else
                state->count -= 1;

            state = rhs.state;
            state->count += 1;
            return *this;
        }

        bool operator == (
            const directory& rhs
        ) const;

        bool operator != (
            const directory& rhs
        ) const { return !(*this == rhs); }

        inline bool operator < (
            const directory& item
        ) const { return full_name() < item.full_name(); }

        inline void swap (
            directory& item
        ) 
        { 
            exchange(state,item.state); 
        }

    private:

        // member data
        data* state;

        bool is_root_path (
            const std::string& path
        ) const;
        /*!
            ensures
                - returns true if path is a root path.  
                  Note that this function considers root paths that don't
                  have a trailing separator to also be valid.
        !*/

    };

// ----------------------------------------------------------------------------------------

    inline void swap (
        file& a, 
        file& b 
    ) { a.swap(b); }   

// ----------------------------------------------------------------------------------------

    inline void swap (
        directory& a, 
        directory& b 
    ) { a.swap(b); }  

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // templated member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename queue_of_files
        >
    typename disable_if<is_std_vector<queue_of_files>,void>::type
    directory_helper_get_files (
        const directory::data* state,
        queue_of_files& files
    ) 
    {
        using namespace std;

        files.clear();
        if (state->full_name.size() == 0)
            throw directory::listing_error("This directory object currently doesn't represent any directory.");

        DIR* ffind = 0;
        struct dirent* data;
        struct stat64 buffer;

        try
        {
            string path = state->full_name;
            // ensure that the path ends with a separator
            if (path[path.size()-1] != directory::get_separator())
                path += directory::get_separator();

            // get a handle to something we can search with
            ffind = opendir(state->full_name.c_str());
            if (ffind == 0)
            {
                throw directory::listing_error("Unable to list the contents of " + state->full_name);
            }

            while(true)
            {
                errno = 0;
                if ( (data = readdir(ffind)) == 0)
                {                    
                    // there was an error or no more files
                    if ( errno == 0)
                    {
                        // there are no more files
                        break;
                    }
                    else
                    {
                        // there was an error
                        throw directory::listing_error("Unable to list the contents of " + state->full_name);
                    }                
                }

                uint64 file_size;
                // get a stat64 structure so we can see if this is a file
                if (::stat64((path+data->d_name).c_str(), &buffer) != 0)
                {
                    // this might be a broken symbolic link.  We can check by calling
                    // readlink and seeing if it finds anything.  
                    char buf[PATH_MAX];
                    ssize_t temp = readlink((path+data->d_name).c_str(),buf,sizeof(buf));
                    if (temp == -1)                    
                        throw directory::listing_error("Unable to list the contents of " + state->full_name);
                    else
                        file_size = static_cast<uint64>(temp);
                }
                else
                {
                    file_size = static_cast<uint64>(buffer.st_size);
                }

                if (S_ISDIR(buffer.st_mode) == 0)
                {
                    // this is actually a file
                    file temp(
                        data->d_name,
                        path+data->d_name,
                        file_size,
                        file::private_constructor()
                        );
                    files.enqueue(temp);
                }
            } // while (true)

            if (ffind != 0)
            {
                while (closedir(ffind))
                {
                    if (errno != EINTR)
                        break;
                }
                ffind = 0;
            }

        }
        catch (...)
        {
            if (ffind != 0)
            {
                while (closedir(ffind))
                {
                    if (errno != EINTR)
                        break;
                }
                ffind = 0;
            }
            files.clear();
            throw;
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename queue_of_files
        >
    typename enable_if<is_std_vector<queue_of_files>,void>::type 
    directory_helper_get_files (
        const directory::data* state,
        queue_of_files& files
    ) 
    {
        queue<file>::kernel_2a temp_files;
        directory_helper_get_files(state,temp_files);

        files.clear();

        // copy the queue of files into the vector
        temp_files.reset();
        while (temp_files.move_next())
        {
            files.push_back(temp_files.element());
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename queue_of_files
        >
    void directory::
    get_files (
        queue_of_files& files
    ) const
    {
        // the reason for this indirection here is because it avoids a bug in
        // the cygwin version of gcc
        directory_helper_get_files(state,files);
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename queue_of_dirs
        >
    typename disable_if<is_std_vector<queue_of_dirs>,void>::type 
    directory_helper_get_dirs (
        const directory::data* state,
        queue_of_dirs& dirs
    ) 
    {
        using namespace std;

        dirs.clear();
        if (state->full_name.size() == 0)
            throw directory::listing_error("This directory object currently doesn't represent any directory.");

        DIR* ffind = 0;
        struct dirent* data;
        struct stat64 buffer;

        try
        {
            string path = state->full_name;
            // ensure that the path ends with a separator
            if (path[path.size()-1] != directory::get_separator())
                path += directory::get_separator();

            // get a handle to something we can search with
            ffind = opendir(state->full_name.c_str());
            if (ffind == 0)
            {
                throw directory::listing_error("Unable to list the contents of " + state->full_name);
            }

            while(true)
            {
                errno = 0;
                if ( (data = readdir(ffind)) == 0)
                {                    
                    // there was an error or no more files
                    if ( errno == 0)
                    {
                        // there are no more files
                        break;
                    }
                    else
                    {
                        // there was an error
                        throw directory::listing_error("Unable to list the contents of " + state->full_name);
                    }                
                }

                // get a stat64 structure so we can see if this is a file
                if (::stat64((path+data->d_name).c_str(), &buffer) != 0)
                {
                    // just assume this isn't a directory.  It is probably a broken
                    // symbolic link.
                    continue;
                }

                string dtemp(data->d_name);
                if (S_ISDIR(buffer.st_mode) &&
                    dtemp != "." &&
                    dtemp != ".." )
                {
                    // this is a directory so add it to dirs
                    directory temp(dtemp,path+dtemp, directory::private_constructor());
                    dirs.enqueue(temp);
                }
            } // while (true)

            if (ffind != 0)
            {
                while (closedir(ffind))
                {
                    if (errno != EINTR)
                        break;
                }
                ffind = 0;
            }

        }
        catch (...)
        {
            if (ffind != 0)
            {
                while (closedir(ffind))
                {
                    if (errno != EINTR)
                        break;
                }
                ffind = 0;
            }
            dirs.clear();
            throw;
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename queue_of_dirs
        >
    typename enable_if<is_std_vector<queue_of_dirs>,void>::type 
    directory_helper_get_dirs (
        const directory::data* state,
        queue_of_dirs& dirs
    ) 
    {
        queue<directory>::kernel_2a temp_dirs;
        directory_helper_get_dirs(state,temp_dirs);

        dirs.clear();

        // copy the queue of dirs into the vector
        temp_dirs.reset();
        while (temp_dirs.move_next())
        {
            dirs.push_back(temp_dirs.element());
        }
    }

// ----------------------------------------------------------------------------------------


    template <
        typename queue_of_dirs
        >
    void directory::
    get_dirs (
        queue_of_dirs& dirs
    ) const
    {
        // the reason for this indirection here is because it avoids a bug in
        // the cygwin version of gcc
        directory_helper_get_dirs(state,dirs);
    }
 
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename queue_of_dir
        >
    typename disable_if<is_std_vector<queue_of_dir>,void>::type get_filesystem_roots (
        queue_of_dir& roots
    )
    {
        roots.clear();
        directory dir("/");
        roots.enqueue(dir);
    }

    template <
        typename queue_of_dir
        >
    typename enable_if<is_std_vector<queue_of_dir>,void>::type get_filesystem_roots (
        std::vector<directory>& roots
    )
    {
        roots.clear();
        directory dir("/");
        roots.push_back(dir);
    }

// ----------------------------------------------------------------------------------------

}


#ifdef NO_MAKEFILE
#include "dir_nav_kernel_2.cpp"
#endif

#endif // DLIB_DIR_NAV_KERNEl_2_

