// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_CMD_LINE_PARSER_KERNEl_C_
#define DLIB_CMD_LINE_PARSER_KERNEl_C_

#include "cmd_line_parser_kernel_abstract.h"
#include "../algs.h"
#include "../assert.h"
#include <string>
#include "../interfaces/cmd_line_parser_option.h"
#include "../string.h"

namespace dlib
{

    template <
        typename clp_base
        >
    class cmd_line_parser_kernel_c : public clp_base
    {
    public:

        typedef typename clp_base::char_type char_type;
        typedef typename clp_base::string_type string_type;
        typedef typename clp_base::option_type option_type;

        void add_option (
            const string_type& name,
            const string_type& description,
            unsigned long number_of_arguments = 0
        );

        const option_type& option (
            const string_type& name
        ) const;

        unsigned long number_of_arguments( 
        ) const;

        const option_type& element (
        ) const;

        option_type& element (
        );

        const string_type& operator[] (
            unsigned long N
        ) const;

    };


    template <
        typename clp_base
        >
    inline void swap (
        cmd_line_parser_kernel_c<clp_base>& a, 
        cmd_line_parser_kernel_c<clp_base>& b 
    ) { a.swap(b); } 

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename clp_base
        >
    const typename clp_base::string_type& cmd_line_parser_kernel_c<clp_base>::
    operator[] (
        unsigned long N
    ) const
    {
        // make sure requires clause is not broken
        DLIB_CASSERT( this->parsed_line() == true && N < number_of_arguments(),
                 "\tvoid cmd_line_parser::operator[](unsigned long N)"
                 << "\n\tYou must specify a valid index N and the parser must have run already."
                 << "\n\tthis:                      " << this
                 << "\n\tN:                         " << N
                 << "\n\tparsed_line():             " << this->parsed_line()
                 << "\n\tnumber_of_arguments():     " << number_of_arguments()
        );

        return clp_base::operator[](N);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename clp_base
        >
    void cmd_line_parser_kernel_c<clp_base>::
    add_option (
        const string_type& name,
        const string_type& description,
        unsigned long number_of_arguments
    )
    {
        // make sure requires clause is not broken
        DLIB_CASSERT( this->parsed_line() == false &&
                 name.size() > 0 &&
                 this->option_is_defined(name) == false &&
                 name.find_first_of(_dT(char_type," \t\n=")) == string_type::npos &&
                 name[0] != '-',
                 "\tvoid cmd_line_parser::add_option(const string_type&,const string_type&,unsigned long)"
                 << "\n\tsee the requires clause of add_option()"
                 << "\n\tthis:                   " << this
                 << "\n\tname.size():            " << static_cast<unsigned long>(name.size())
                 << "\n\tname:                  \"" << narrow(name) << "\""
                 << "\n\tparsed_line():          " << (this->parsed_line()? "true" : "false")
                 << "\n\tis_option_defined(\"" << narrow(name) << "\"): " << (this->option_is_defined(name)? "true" : "false")
        );

        clp_base::add_option(name,description,number_of_arguments);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename clp_base
        >
    const typename clp_base::option_type& cmd_line_parser_kernel_c<clp_base>::
    option (
        const string_type& name
    ) const
    {
        // make sure requires clause is not broken
        DLIB_CASSERT( this->option_is_defined(name) == true,
                 "\toption cmd_line_parser::option(const string_type&)"
                 << "\n\tto get an option it must be defined by a call to add_option()"
                 << "\n\tthis:   " << this
                 << "\n\tname:  \"" << narrow(name) << "\""
        );

        return clp_base::option(name);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename clp_base
        >
    unsigned long cmd_line_parser_kernel_c<clp_base>::
    number_of_arguments( 
    ) const
    {
        // make sure requires clause is not broken
        DLIB_CASSERT( this->parsed_line() == true ,
                 "\tunsigned long cmd_line_parser::number_of_arguments()"
                 << "\n\tyou must parse the command line before you can find out how many arguments it has"
                 << "\n\tthis:            " << this
        );

        return clp_base::number_of_arguments();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename clp_base
        >
    const typename clp_base::option_type& cmd_line_parser_kernel_c<clp_base>::
    element (
    ) const
    {
        // make sure requires clause is not broken
        DLIB_CASSERT(this->current_element_valid() == true,
                "\tconst cmd_line_parser_option& cmd_line_parser::element()"
                << "\n\tyou can't access the current element if it doesn't exist"
                << "\n\tthis: " << this
        );

        // call the real function
        return clp_base::element();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename clp_base
        >
    typename clp_base::option_type& cmd_line_parser_kernel_c<clp_base>::
    element (
    ) 
    {
        // make sure requires clause is not broken
        DLIB_CASSERT(this->current_element_valid() == true,
                "\tcmd_line_parser_option& cmd_line_parser::element()"
                << "\n\tyou can't access the current element if it doesn't exist"
                << "\n\tthis: " << this
        );

        // call the real function
        return clp_base::element();
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_CMD_LINE_PARSER_KERNEl_C_

