// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.


#include <string>
#include <dlib/string.h>

#include <dlib/cmd_line_parser.h>

#include "tester.h"

#include "cmd_line_parser.h"
namespace  
{

    class cmd_line_parser_tester : public tester
    {
    public:
        cmd_line_parser_tester (
        ) :
            tester ("test_cmd_line_parser_char",
                    "Runs tests on the cmd_line_parser component.")
        {}

        void perform_test (
        )
        {
            dlog << LINFO << "testing kernel_1a with char";
            cmd_line_parser_kernel_test<cmd_line_parser<char>::kernel_1a>();
            print_spinner();

            dlog << LINFO << "testing kernel_1a_c with char";
            cmd_line_parser_kernel_test<cmd_line_parser<char>::kernel_1a_c>();
            print_spinner();
        }
    } a;

}


