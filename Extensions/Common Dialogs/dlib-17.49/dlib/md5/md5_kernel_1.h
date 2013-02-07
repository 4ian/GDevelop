// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_MD5_KERNEl_1_
#define DLIB_MD5_KERNEl_1_

#include "md5_kernel_abstract.h"
#include <string>
#include <iosfwd>
#include "../algs.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    const std::string md5 (
        const std::string& input
    );

// ----------------------------------------------------------------------------------------

    void md5 (
        const unsigned char* input,
        unsigned long len,
        unsigned char* output
    );

// ----------------------------------------------------------------------------------------

    const std::string md5 (
        std::istream& input
    );

// ----------------------------------------------------------------------------------------

    void md5 (
        std::istream& input,
        unsigned char* output
    );

// ----------------------------------------------------------------------------------------

}

#ifdef NO_MAKEFILE
#include "md5_kernel_1.cpp"
#endif

#endif // DLIB_MD5_KERNEl_1_

