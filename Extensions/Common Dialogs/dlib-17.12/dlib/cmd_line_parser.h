// Copyright (C) 2003  Davis E. King (davisking@users.sourceforge.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_CMD_LINE_PARSEr_
#define DLIB_CMD_LINE_PARSEr_

#include "cmd_line_parser/cmd_line_parser_kernel_1.h"
#include "cmd_line_parser/cmd_line_parser_kernel_c.h"
#include "cmd_line_parser/cmd_line_parser_print_1.h"
#include "cmd_line_parser/cmd_line_parser_check_1.h"
#include "cmd_line_parser/cmd_line_parser_check_c.h"
#include <string>

#include "map.h"
#include "sequence.h"



namespace dlib
{


    template <
        typename charT
        >
    class cmd_line_parser
    {
        cmd_line_parser() {}

        typedef typename sequence<std::basic_string<charT> >::kernel_2a sequence_2a;
        typedef typename sequence<std::basic_string<charT>*>::kernel_2a psequence_2a;
        typedef typename map<std::basic_string<charT>,void*>::kernel_1a map_1a_string;

    public:
        
        //----------- kernels ---------------

        // kernel_1a        
        typedef     cmd_line_parser_kernel_1<charT,map_1a_string,sequence_2a,psequence_2a>
                    kernel_1a;
        typedef     cmd_line_parser_kernel_c<kernel_1a>
                    kernel_1a_c;
          


        //----------- extensions ---------------
        
        // print_1 extend kernel_1a
        typedef     cmd_line_parser_print_1<kernel_1a>
                    print_1a;
        typedef     cmd_line_parser_print_1<kernel_1a_c>
                    print_1a_c;

        // check_1 extend print_1a
        typedef     cmd_line_parser_check_1<print_1a>
                    check_1a;
        typedef     cmd_line_parser_check_c<cmd_line_parser_check_1<print_1a_c> >
                    check_1a_c;

    };
}

#endif // DLIB_CMD_LINE_PARSEr_

