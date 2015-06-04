// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_DIR_NAV_KERNEl_ABSTRACT_
#ifdef DLIB_DIR_NAV_KERNEl_ABSTRACT_

#include <string>
#include <vector>
#include "../uintn.h"
#include "../algs.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    /*!
        GENERAL WARNING
            Don't call any of these functions or make any of these objects 
            before main() has been entered.   That means no instances
            of file or directory at the global scope.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename queue_of_dir
        >
    void get_filesystem_roots (
        queue_of_dir& roots
    );
    /*!
        requires
            - queue_of_dirs == an implementation of queue/queue_kernel_abstract.h with T 
              set to directory or a std::vector<directory> or dlib::std_vector_c<directory>.
        ensures
            - #roots == a queue containing directories that represent all the roots 
              of the filesystem on this machine.   (e.g. in windows you have c:\, d:\ 
              etc.)
        throws
            - std::bad_alloc
    !*/

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // file object    
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    
    class file
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object represents a file.

                Note that the size of a file is determined at the time the file
                object is constructed.  Thus if a file changes sizes after its
                file object has been created its file object's size() method
                will not reflect the new file size.    
        !*/

    public:

        class file_not_found : public error {};
        
        file (
        );
        /*!
            ensures
                - #*this has been properly initialized
                - #name() == ""
                - #full_name() == ""
                - #size() == 0
                - #*this does not represent any file
            throws  
                - std::bad_alloc
        !*/

        file (
            const std::string& name
        );
        /*!
            ensures
                - #*this has been properly initialized 
                - #*this represents the file given by name
                  Note that name can be a fully qualified path or just a path
                  relative to the current working directory.  Also, any symbolic 
                  links in name will be resolved.
            throws  
                - std::bad_alloc
                - file_not_found
                    This exception is thrown if the file can not be found or
                    accessed.                    
        !*/

        file (
            const char* name
        );
        /*!
            ensures
                - this function is identical to file(const std::string& name)
        !*/

        file (
            const file& item
        );
        /*!
            ensures
                - #*this == item
            throws  
                - std::bad_alloc
        !*/

        ~file (
        );
        /*!
            ensures
                - all resources associated with *this have been released
        !*/

        const std::string& name (
        ) const;
        /*!
            ensures
                - returns the name of the file.  This is full_name() minus 
                  the path to the file.            
        !*/

        const std::string& full_name (
        ) const;
        /*!
            ensures
                - returns the fully qualified name for the file represented by *this 
        !*/

        uint64 size (
        ) const;
        /*!
            ensures
                - returns the size of this file in bytes.
        !*/

        operator std::string (
        ) const; 
        /*!
            ensures
                - returns full_name()
                  (i.e. provides an implicit conversion to string from dlib::file)
        !*/

        file& operator= (
            const file& rhs
        );
        /*!
            ensures
                - #*this == rhs
        !*/

        bool operator == (
            const file& rhs
        ) const;
        /*!
            ensures
                - if (*this and rhs represent the same file) then
                    - returns true
                - else
                    - returns false
        !*/

        bool operator != (
            const file& rhs
        ) const;
        /*!
            ensures
                - if (*this and rhs represent the same file) then
                    - returns false 
                - else
                    - returns true 
        !*/

        bool operator < (
            const file& item
        ) const;
        /*!
            ensures
                - if (full_name() < item.full_name()) then
                    - returns true
                - else
                    - returns false
        !*/

        void swap (
            file& item
        );
        /*!
            ensures
                - swaps *this and item
        !*/ 

    };

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // directory object    
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    
    class directory
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object represents a directory in a file system.  It gives
                the ability to traverse a directory tree.  

                Note that the directories . and .. are not returned by get_dirs() 
        !*/

    public:

        class dir_not_found : public error {};
        class listing_error : public error {};
        
        directory (
        );
        /*!
            ensures
                - #*this has been properly initialized
                - #full_name() == ""
                - #name() == ""
                - #is_root() == true
                - #*this does not represent any directory
            throws  
                - std::bad_alloc
        !*/

        directory (
            const std::string& name
        );
        /*!
            ensures
                - #*this has been properly initialized 
                - #*this represents the directory given by name.
                  Note that name can be a fully qualified path or just a path
                  relative to the current working directory. Also, any symbolic 
                  links in name will be resolved.
            throws  
                - std::bad_alloc
                - dir_not_found
                    This exception is thrown if the directory can not be found or
                    accessed.    
        !*/

        directory (
            const char* name
        );
        /*!
            ensures
                - this function is identical to directory(const std::string& name)
        !*/

        directory (
            const directory& item
        );
        /*!
            ensures
                - #*this == item
            throws  
                - std::bad_alloc
        !*/

        ~directory (
        );
        /*!
            ensures
                - all resources associated with *this have been released
        !*/

        static char get_separator (
        );
        /*!
            ensures
                - returns the character used to separate directories and file names in a
                  path.  (i.e.  \ on windows and / in unix)
        !*/

        template <
            typename queue_of_files
            >
        void get_files (
            queue_of_files& files
        ) const;
        /*!
            requires
                - queue_of_files == an implementation of queue/queue_kernel_abstract.h with T 
                  set to file or a std::vector<file> or dlib::std_vector_c<file>.
            ensures
                - #files == A queue containing all the files present in this directory.
                  (Note that symbolic links will not have been resolved in the names 
                  of the returned files.)
                - #files.size() == the number of files in this directory
            throws 
                - bad_alloc
                    If this exception is thrown then the call to get_files() has
                    no effect on *this and #files is unusable until files.clear()
                    is called and succeeds.
                - listing_error
                    This exception is thrown if listing access has been denied to this
                    directory or if some error occurred that prevented us from successfully
                    getting the contents of this directory.       
                    If this exception is thrown then the call to get_files() has
                    no effect on *this and #files.size()==0.         
        !*/

        std::vector<file> get_files (
        ) const;
        /*!
            ensures
                - This function simply calls get_files(temp_vector) and then returns temp_vector.
        !*/

        template <
            typename queue_of_dirs
            >
        void get_dirs (
            queue_of_dirs& dirs
        ) const;
        /*!
            requires
                - queue_of_dirs == an implementation of queue/queue_kernel_abstract.h with T 
                  set to directory or a std::vector<directory> or dlib::std_vector_c<directory>.
            ensures
                - #dirs == a queue containing all the directories present in this directory.
                  (note that symbolic links will not have been resolved in the names 
                  of the returned directories.)
                - #dirs.size() == the number of subdirectories in this directory
            throws 
                - bad_alloc
                    If this exception is thrown then the call to get_files() has
                    no effect on *this and #files is unusable until files.clear()
                    is called and succeeds.
                - listing_error
                    This exception is thrown if listing access has been denied to this
                    directory or if some error occurred that prevented us from successfully
                    getting the contents of this directory.
                    If this exception is thrown then the call to get_dirs() has
                    no effect on *this and #dirs.size()==0.
        !*/

        std::vector<directory> get_dirs (
        ) const;
        /*!
            ensures
                - This function simply calls get_dirs(temp_vector) and then returns temp_vector.
        !*/

        bool is_root (
        ) const;
        /*!
            ensures
                - if (*this represents the root of this directory tree) then
                    - returns true
                - else
                    - returns false
        !*/

        const directory get_parent (
        ) const;
        /*!
            ensures
                - if (is_root()) then
                    - returns a copy of *this                    
                - else
                    - returns the parent directory of *this                    
            throws
                - bad_alloc
                    If this exception is thrown then the call to get_parent() will
                    have no effect.
        !*/

        const std::string& name (
        ) const;
        /*!
            ensures
                - if (is_root()) then
                    - returns ""
                - else
                    - returns the name of the directory.  This is full_name() minus 
                      the path to the directory.           
        !*/

        const std::string& full_name (
        ) const;
        /*!
            ensures
                - returns the fully qualified directory name for *this 
                - if (is_root()) then
                    - the last character of #full_name() is get_separator()
                - else
                    - the last character of #full_name() is NOT get_separator()
        !*/

        operator std::string (
        ) const; 
        /*!
            ensures
                - returns full_name()
                  (i.e. provides an implicit conversion to string from dlib::directory)
        !*/

        directory& operator= (
            const directory& rhs
        );
        /*!
            ensures
                - #*this == rhs
        !*/

        bool operator == (
            const directory& rhs
        ) const;
        /*!
            ensures
                - if (*this and rhs represent the same directory) then
                    - returns true
                - else
                    - returns false
        !*/

        bool operator != (
            const directory& rhs
        ) const;
        /*!
            ensures
                - if (*this and rhs represent the same directory) then
                    - returns false 
                - else
                    - returns true 
        !*/

        bool operator < (
            const directory& item
        ) const;
        /*!
            ensures
                - if (full_name() < item.full_name()) then
                    - returns true
                - else
                    - returns false
        !*/

        void swap (
            directory& item
        );
        /*!
            ensures
                - swaps *this and item
        !*/ 

    };

// ----------------------------------------------------------------------------------------

    inline std::ostream& operator<< (
        std::ostream& out,
        const directory& item
    );
    /*!
        ensures
            - performs: out << item.full_name()
            - returns out
    !*/

    inline std::ostream& operator<< (
        std::ostream& out,
        const file& item
    );
    /*!
        ensures
            - performs: out << item.full_name()
            - returns out
    !*/

// ----------------------------------------------------------------------------------------

    inline void swap (
        file& a, 
        file& b 
    ) { a.swap(b); }   
    /*!
        provides a global swap function for file objects
    !*/

// ----------------------------------------------------------------------------------------

    inline void swap (
        directory& a, 
        directory& b 
    ) { a.swap(b); }   
    /*!
        provides a global swap function for directory objects
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_DIR_NAV_KERNEl_ABSTRACT_

