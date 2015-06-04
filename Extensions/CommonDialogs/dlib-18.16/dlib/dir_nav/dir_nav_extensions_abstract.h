// Copyright (C) 2009  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_DIR_NAV_EXTENSIONs_ABSTRACT_
#ifdef DLIB_DIR_NAV_EXTENSIONs_ABSTRACT_

#include <string>
#include <vector>
#include "dir_nav_kernel_abstract.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    bool file_exists (
        const std::string& filename
    );
    /*!
        ensures
            - if (a file with the given filename exists) then
                - returns true
            - else
                - returns false
    !*/

// ----------------------------------------------------------------------------------------

    template <typename T>
    const std::vector<file> get_files_in_directory_tree (
        const directory& top_of_tree,
        const T& add_file,
        unsigned long max_depth = 30
    );
    /*!
        requires
            - add_file must be a function object with the following prototype:
                bool add_file (file f);
        ensures
            - performs a recursive search through the directory top_of_tree and all
              its sub-directories (up to the given max depth).  All files in these
              directories are examined by passing them to add_file() and if it 
              returns true then they will be included in the returned std::vector<file>
              object.
            - Note that a max_depth of 0 means that only the files in the directory
              top_of_tree will be considered.  A depth of 1 means that only files in 
              top_of_tree and its immediate sub-directories will be considered.  And
              so on...
    !*/

// ----------------------------------------------------------------------------------------

    class match_ending
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This is a simple function object that can be used with the
                above get_files_in_directory_tree() function.  This object
                just looks for files with a certain ending.
        !*/

    public:
        match_ending ( 
            const std::string& ending
        );
        /*!
            ensures
                - this object will be a function that checks if a file has a 
                  name that ends with the given ending string.
        !*/

        bool operator() (
            const file& f
        ) const;
        /*!
            ensures
                - if (the file f has a name that ends with the ending string given
                  to this object's constructor) then
                    - returns true
                - else
                    - returns false
        !*/
    };

// ----------------------------------------------------------------------------------------

    class match_endings
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This is a simple function object that can be used with the
                above get_files_in_directory_tree() function.  This object
                allows you to look for files with a number of different 
                endings.
        !*/

    public:
        match_endings ( 
            const std::string& ending_list
        );
        /*!
            ensures
                - ending_list is interpreted as a whitespace separated list
                  of file endings. 
                - this object will be a function that checks if a file has a 
                  name that ends with one of the strings in ending_list.
        !*/

        bool operator() (
            const file& f
        ) const;
        /*!
            ensures
                - if (the file f has a name that ends with one of the ending strings 
                  given to this object's constructor) then
                    - returns true
                - else
                    - returns false
        !*/
    };

// ----------------------------------------------------------------------------------------

    class match_all
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This is a simple function object that can be used with the
                above get_files_in_directory_tree() function.  This object
                matches all files. 
        !*/

    public:
        bool operator() (
            const file& f
        ) const;
        /*!
            ensures
                - returns true
                  (i.e. this function doesn't do anything.  It just says it
                  matches all files no matter what)
        !*/
    };

// ----------------------------------------------------------------------------------------

    directory get_parent_directory (
        const directory& dir
    );
    /*!
        ensures
            - returns the parent directory of dir.  In particular, this
              function returns the value of dir.get_parent()
    !*/

// ----------------------------------------------------------------------------------------

    directory get_parent_directory (
        const file& f
    );
    /*!
        ensures
            - if (f.full_name() != "") then
                - returns the directory which contains the given file
            - else
                - returns a default initialized directory (i.e. directory())
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_DIR_NAV_EXTENSIONs_ABSTRACT_


