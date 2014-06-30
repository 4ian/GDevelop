// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_CMD_LINE_PARSER_OPTIOn_
#define DLIB_CMD_LINE_PARSER_OPTIOn_

#include <string>

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename charT
        >
    class cmd_line_parser_option
    {
        /*!
            POINTERS AND REFERENCES TO INTERNAL DATA
                None of the functions in cmd_line_parser_option will invalidate
                pointers or references to internal data when called.

            WHAT THIS OBJECT REPRESENTS
                This object represents a command line option.  
        !*/

    public:

        typedef charT char_type;
        typedef std::basic_string<charT> string_type;

        virtual ~cmd_line_parser_option (
        ) = 0;

        virtual const string_type& name (
        ) const = 0;
        /*!
            ensures
                - returns the name of this option
        !*/

        virtual const string_type& description (
        ) const = 0;
        /*!
            ensures
                - returns the description for this option
        !*/

        virtual unsigned long number_of_arguments( 
        ) const = 0;
        /*!
            ensures
                - returns the number of arguments for this option
        !*/

        virtual unsigned long count(
        ) const = 0;
        /*!
            ensures
                - returns the number of times this option appears on the command line.
        !*/

        virtual const string_type& argument (
            unsigned long arg = 0,
            unsigned long N = 0
        ) const = 0;
        /*!
            requires
                - arg < number_of_arguments()
                - N < count()
            ensures
                - returns the argth argument to the Nth occurance of this 
                  option on the command line.
        !*/

        inline operator bool (
        ) const { return count() > 0; }
        /*!
            ensures
                - returns true if this option appears on the command line at all
        !*/

    protected:

        // restricted functions
        cmd_line_parser_option& operator=(const cmd_line_parser_option&){return *this;}

    };

    // destructor does nothing
    template < typename charT >
    cmd_line_parser_option<charT>::~cmd_line_parser_option() {}

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_CMD_LINE_PARSER_OPTIOn_

