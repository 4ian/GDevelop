// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_XML_PARSER_KERNEL_C_
#define DLIB_XML_PARSER_KERNEL_C_

#include "xml_parser_kernel_abstract.h"
#include <string>
#include <iostream>
#include "../algs.h"
#include "../assert.h"

namespace dlib
{

    template <
        typename xml_parser_base
        >
    class xml_parser_kernel_c : public xml_parser_base 
    {
        public:
            void parse (
                std::istream& in
            );
    };


    template < 
        typename xml_parser_base
        >
    inline void swap (
        xml_parser_kernel_c<xml_parser_base>& a, 
        xml_parser_kernel_c<xml_parser_base>& b 
    ) { a.swap(b); }   

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------


    template <
        typename xml_parser_base
        >
    void xml_parser_kernel_c<xml_parser_base>:: 
    parse (
        std::istream& in
    )
    {
        DLIB_CASSERT ( in.fail() == false ,
            "\tvoid xml_parser::parse"
            << "\n\tthe input stream must not be in the fail state"
            << "\n\tthis: " << this
            );

        return xml_parser_base::parse(in);
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_XML_PARSER_KERNEL_C_

