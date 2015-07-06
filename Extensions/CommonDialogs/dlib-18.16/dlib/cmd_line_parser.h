// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_CMD_LINE_PARSEr_
#define DLIB_CMD_LINE_PARSEr_

#include "cmd_line_parser/cmd_line_parser_kernel_1.h"
#include "cmd_line_parser/cmd_line_parser_kernel_c.h"
#include "cmd_line_parser/cmd_line_parser_print_1.h"
#include "cmd_line_parser/cmd_line_parser_check_1.h"
#include "cmd_line_parser/cmd_line_parser_check_c.h"
#include <string>
#include "cmd_line_parser/get_option.h"

#include "map.h"
#include "sequence.h"



namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename charT
        >
    class impl_cmd_line_parser
    {
        /*!
            This class is basically just a big templated typedef for building 
            a complete command line parser type out of all the parts it needs.
        !*/

        impl_cmd_line_parser() {}

        typedef typename sequence<std::basic_string<charT> >::kernel_2a sequence_2a;
        typedef typename sequence<std::basic_string<charT>*>::kernel_2a psequence_2a;
        typedef typename map<std::basic_string<charT>,void*>::kernel_1a map_1a_string;

    public:
        
        typedef cmd_line_parser_kernel_1<charT,map_1a_string,sequence_2a,psequence_2a> kernel_1a;
        typedef cmd_line_parser_kernel_c<kernel_1a> kernel_1a_c;
        typedef cmd_line_parser_print_1<kernel_1a_c> print_1a_c;
        typedef cmd_line_parser_check_c<cmd_line_parser_check_1<print_1a_c> > check_1a_c;
    };

// ----------------------------------------------------------------------------------------

    template <
        typename charT
        >
    class cmd_line_parser : public impl_cmd_line_parser<charT>::check_1a_c
    {
    public:

        // These typedefs are here for backwards compatibility with previous versions of dlib.
        typedef cmd_line_parser kernel_1a;
        typedef cmd_line_parser kernel_1a_c;
        typedef cmd_line_parser print_1a;
        typedef cmd_line_parser print_1a_c;
        typedef cmd_line_parser check_1a;
        typedef cmd_line_parser check_1a_c;
    };

    template <
        typename charT 
        >
    inline void swap (
        cmd_line_parser<charT>& a, 
        cmd_line_parser<charT>& b 
    ) { a.swap(b); } 

// ----------------------------------------------------------------------------------------

    typedef cmd_line_parser<char> command_line_parser;
    typedef cmd_line_parser<wchar_t> wcommand_line_parser;

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_CMD_LINE_PARSEr_

