// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_MD5_KERNEl_ABSTRACT_
#ifdef DLIB_MD5_KERNEl_ABSTRACT_

#include <string>
#include <iosfwd>

namespace dlib
{

    /*!
        NOTE:
        This is the RSA Data Security, Inc. MD5 Message-Digest Algorithm
        as described in rfc1321

        For the functions which return a unsigned char*.  The array contains 
        the 16 bytes of the digest and are in the correct order.  
        i.e.  output[0], output[1], output[2], ...
    !*/

// ----------------------------------------------------------------------------------------

    const std::string md5 (
        const std::string& input
    );
    /*!
        ensures
            - returns the md5 digest of input as a hexadecimal string
    !*/

// ----------------------------------------------------------------------------------------

    void md5 (
        const unsigned char* input,
        unsigned long len,
        unsigned char* output
    );
    /*!
        requires
            - input  == pointer to len bytes 
            - output == pointer to 16 bytes 
            - input != output
        ensures
            - #output == the md5 digest of input.  
    !*/

// ----------------------------------------------------------------------------------------

    const std::string md5 (
        std::istream& input
    );
    /*!
        requires
            - input.fail() == false
        ensures
            - returns the md5 digest of input as a hexadecimal string
            - #input.eof()     == true 
            - #input.fail()    == false
    !*/

// ----------------------------------------------------------------------------------------

    void md5 (
        std::istream& input
        unsigned char* output
    );
    /*!
        requires
            - input.fail() == false
            - output       == pointer to 16 bytes
        ensures
            - #output       == the md5 digest of input 
            - #input.eof()  == true 
            - #input.fail() == false
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_MD5_KERNEl_ABSTRACT_

