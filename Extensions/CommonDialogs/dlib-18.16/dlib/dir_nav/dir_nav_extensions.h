// Copyright (C) 2009  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_DIR_NAV_EXTENSIONs_H_
#define DLIB_DIR_NAV_EXTENSIONs_H_

#include <string>
#include <vector>
#include <algorithm>
#include "dir_nav_extensions_abstract.h"
#include "../dir_nav.h"
#include "../string.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    bool file_exists (
        const std::string& filename
    );

// ----------------------------------------------------------------------------------------

    namespace implementation_details
    {
        void get_all_sub_dirs (
            const directory& top_of_tree,
            unsigned long max_depth,
            std::vector<directory>& result,
            std::vector<directory>& temp
        );
    }

// ----------------------------------------------------------------------------------------

    template <typename T>
    const std::vector<file> get_files_in_directory_tree (
        const directory& top_of_tree,
        const T& add_file,
        unsigned long max_depth = 30
    )
    {
        std::vector<file> result, temp;
        std::vector<directory> dirs, dirs_temp;
        dirs.push_back(top_of_tree);

        // get all the directories in the tree first
        implementation_details::get_all_sub_dirs(top_of_tree, max_depth, dirs, dirs_temp);

        // now just loop over all the directories and pick out the files we want to keep
        for (unsigned long d = 0; d < dirs.size(); ++d)
        {
            dirs[d].get_files(temp);

            // pick out the members of temp that we should keep
            for (unsigned long i = 0; i < temp.size(); ++i)
            {
                if (add_file(temp[i]))
                    result.push_back(temp[i]);
            }
        }

        return result;
    }

// ----------------------------------------------------------------------------------------

    class match_ending
    {

    public:
        match_ending ( 
            const std::string& ending_
        ) : ending(ending_) {}

        bool operator() (
            const file& f
        ) const
        {
            // if the ending is bigger than f's name then it obviously doesn't match
            if (ending.size() > f.name().size())
                return false;

            // now check if the actual characters that make up the end of the file name 
            // matches what is in ending.
            return std::equal(ending.begin(), ending.end(), f.name().end()-ending.size());
        }

    private:
        std::string ending;
    };

// ----------------------------------------------------------------------------------------

    class match_endings
    {

    public:
        match_endings ( 
            const std::string& endings_
        ) 
        {
            const std::vector<std::string>& s = split(endings_);
            for (unsigned long i = 0; i < s.size(); ++i)
            {
                endings.push_back(match_ending(s[i]));
            }
        }

        bool operator() (
            const file& f
        ) const
        {
            for (unsigned long i = 0; i < endings.size(); ++i)
            {
                if (endings[i](f))
                    return true;
            }

            return false;
        }

    private:
        std::vector<match_ending> endings;
    };

// ----------------------------------------------------------------------------------------

    class match_all
    {
    public:
        bool operator() (
            const file& 
        ) const { return true; }
    };

// ----------------------------------------------------------------------------------------

    directory get_parent_directory (
        const directory& dir
    );

// ----------------------------------------------------------------------------------------

    directory get_parent_directory (
        const file& f
    );

// ----------------------------------------------------------------------------------------

}

#ifdef NO_MAKEFILE
#include "dir_nav_extensions.cpp"
#endif

#endif // DLIB_DIR_NAV_EXTENSIONs_H_

