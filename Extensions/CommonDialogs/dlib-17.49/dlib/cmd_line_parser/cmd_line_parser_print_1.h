// Copyright (C) 2005  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_CMD_LINE_PARSER_PRINt_1_
#define DLIB_CMD_LINE_PARSER_PRINt_1_

#include "cmd_line_parser_kernel_abstract.h"
#include "../algs.h"
#include "../string.h"
#include <iostream>
#include <string>
#include <sstream>

namespace dlib
{

    template <
        typename clp_base 
        >
    class cmd_line_parser_print_1 : public clp_base
    {

        public:

            void print_options (
                std::basic_ostream<typename clp_base::char_type>& out
            );

    };

    template <
        typename clp_base
        >
    inline void swap (
        cmd_line_parser_print_1<clp_base>& a, 
        cmd_line_parser_print_1<clp_base>& b 
    ) { a.swap(b); }   

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename clp_base
        >
    void cmd_line_parser_print_1<clp_base>::
    print_options (
        std::basic_ostream<typename clp_base::char_type>& out
    )
    {
        typedef typename clp_base::char_type ct;
        typedef std::basic_string<ct> string;
        typedef typename string::size_type size_type;

        try
        {

            out << _dT(ct,"Options:");

            size_type max_len = 0; 
            this->reset();

            // this loop here is just the bottom loop but without the print statements.
            // I'm doing this to figure out what len should be.
            while (this->move_next())
            {
                size_type len = 0; 
                len += 3;
                if (this->element().name().size() > 1)
                {
                    ++len;
                }
                len += this->element().name().size();

                if (this->element().number_of_arguments() == 1)
                {
                    len += 6;
                }
                else
                {
                    for (unsigned long i = 0; i < this->element().number_of_arguments(); ++i)
                    {
                        len += 7;
                        if (i+1 > 9)
                            ++len;
                    }
                }

                len += 3;
                if (len < 33)
                    max_len = std::max(max_len,len);
            }






            this->reset();

            while (this->move_next())
            {
                size_type len = 0; 
                out << _dT(ct,"\n  -");
                len += 3;
                if (this->element().name().size() > 1)
                {
                    out << _dT(ct,"-");
                    ++len;
                }
                out << this->element().name();
                len += this->element().name().size();

                if (this->element().number_of_arguments() == 1)
                {
                    out << _dT(ct," <arg>");
                    len += 6;
                }
                else
                {
                    for (unsigned long i = 0; i < this->element().number_of_arguments(); ++i)
                    {
                        out << _dT(ct," <arg") << i+1 << _dT(ct,">");
                        len += 7;
                        if (i+1 > 9)
                            ++len;
                    }
                }

                out << "   ";
                len += 3;

                while (len < max_len)
                {
                    ++len;
                    out << " ";
                }

                const unsigned long ml = static_cast<unsigned long>(max_len);
                // now print the description but make it wrap around nicely if it 
                // is to long to fit on one line.
                if (len <= max_len)
                    out << wrap_string(this->element().description(),0,ml);
                else
                    out << "\n" << wrap_string(this->element().description(),ml,ml);
            }
            this->reset();
        }
        catch (...)
        {
            this->reset();
            throw;
        }
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_CMD_LINE_PARSER_PRINt_1_

