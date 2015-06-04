// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.

#include "common.h"
#include <fstream>
#include <dlib/error.h>

// ----------------------------------------------------------------------------------------

std::string strip_path (
    const std::string& str,
    const std::string& prefix
)
{
    unsigned long i;
    for (i = 0; i < str.size() && i < prefix.size(); ++i)
    {
        if (str[i] != prefix[i]) 
            return str;
    }

    if (i < str.size() && (str[i] == '/' || str[i] == '\\'))
        ++i;

    return str.substr(i);
}

// ----------------------------------------------------------------------------------------

void make_empty_file (
    const std::string& filename
)
{
    std::ofstream fout(filename.c_str());
    if (!fout)
        throw dlib::error("ERROR: Unable to open " + filename + " for writing.");
}

// ----------------------------------------------------------------------------------------

