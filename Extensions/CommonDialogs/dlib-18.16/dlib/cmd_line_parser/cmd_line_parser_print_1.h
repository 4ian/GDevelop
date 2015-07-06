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
#include <map>
#include "../smart_pointers.h"

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
            ) const;

            void print_options (
            ) const
            {
                print_options(std::cout);
            }

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
    ) const
    {
        typedef typename clp_base::char_type ct;
        typedef std::basic_string<ct> string;
        typedef typename string::size_type size_type;

        typedef std::basic_ostringstream<ct> ostringstream;

        try
        {


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


            // Make a separate ostringstream for each option group.  We are going to write
            // the output for each group to a separate ostringstream so that we can keep
            // them grouped together in the final output.
            std::map<string,shared_ptr<ostringstream> > groups;
            this->reset();
            while(this->move_next())
            {
                if (!groups[this->element().group_name()])
                    groups[this->element().group_name()].reset(new ostringstream);
            }




            this->reset();

            while (this->move_next())
            {
                ostringstream& sout = *groups[this->element().group_name()];

                size_type len = 0; 
                sout << _dT(ct,"\n  -");
                len += 3;
                if (this->element().name().size() > 1)
                {
                    sout << _dT(ct,"-");
                    ++len;
                }
                sout << this->element().name();
                len += this->element().name().size();

                if (this->element().number_of_arguments() == 1)
                {
                    sout << _dT(ct," <arg>");
                    len += 6;
                }
                else
                {
                    for (unsigned long i = 0; i < this->element().number_of_arguments(); ++i)
                    {
                        sout << _dT(ct," <arg") << i+1 << _dT(ct,">");
                        len += 7;
                        if (i+1 > 9)
                            ++len;
                    }
                }

                sout << _dT(ct,"   ");
                len += 3;

                while (len < max_len)
                {
                    ++len;
                    sout << _dT(ct," ");
                }

                const unsigned long ml = static_cast<unsigned long>(max_len);
                // now print the description but make it wrap around nicely if it 
                // is to long to fit on one line.
                if (len <= max_len)
                    sout << wrap_string(this->element().description(),0,ml);
                else
                    sout << _dT(ct,"\n") << wrap_string(this->element().description(),ml,ml);
            }

            // Only print out a generic Options: group name if there is an unnamed option
            // present.
            if (groups.count(string()) == 1)
                out << _dT(ct,"Options:");

            // Now print everything out
            typename std::map<string,shared_ptr<ostringstream> >::iterator i;
            for (i = groups.begin(); i != groups.end(); ++i)
            {
                // print the group name if we have one
                if (i->first.size() != 0)
                {
                    if (i != groups.begin())
                        out << _dT(ct,"\n\n");
                    out << i->first << _dT(ct,":");
                }

                // print the options in the group
                out << i->second->str();
            }
            out << _dT(ct,"\n\n");
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

