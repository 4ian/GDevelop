// Copyright (C) 2005  Davis E. King (davisking@users.sourceforge.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_CMD_LINE_PARSER_PRINt_ABSTRACT_
#ifdef DLIB_CMD_LINE_PARSER_PRINt_ABSTRACT_


#include "cmd_line_parser_kernel_abstract.h"
#include <iosfwd>

namespace dlib
{

    template <
        typename clp_base
        >
    class cmd_line_parser_print : public clp_base
    {

        /*!
            REQUIREMENTS ON CLP_BASE
                clp_base is an implementation of cmd_line_parser/cmd_line_parser_kernel_abstract.h


            POINTERS AND REFERENCES TO INTERNAL DATA
                The print_options() function may invalidate pointers or references to 
                internal data.


            WHAT THIS EXTENSION DOES FOR CMD_LINE_PARSER
                This gives a cmd_line_parser object the ability to print its options
                in a nice format that fits into a console screen.
        !*/


        public:

            void print_options (
                std::basic_ostream<typename clp_base::char_type>& out
            ) const;
            /*!
                ensures
                    - prints all the command line options to out.
                    - #at_start() == true
                throws                
                    - any exception.
                        if an exception is thrown then #at_start() == true but otherwise  
                        it will have no effect on the state of #*this.
            !*/
    };

    template <
        typename clp_base
        >
    inline void swap (
        cmd_line_parser_print<clp_base>& a, 
        cmd_line_parser_print<clp_base>& b 
    ) { a.swap(b); }  
    /*!
        provides a global swap function
    !*/

}

#endif // DLIB_CMD_LINE_PARSER_PRINt_ABSTRACT_

