// Copyright (C) 2012  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_GET_OPTiON_ABSTRACT_H__
#ifdef DLIB_GET_OPTiON_ABSTRACT_H__

#inclue <string>

namespace dlib
{

// ----------------------------------------------------------------------------------------

    class option_parse_error : public error 
    { 
        /*!
            WHAT THIS OBJECT REPRESENTS
                This is the exception thrown by the get_option() functions.  It is
                thrown when the option string given by a command line parser or
                config reader can't be converted into the type T.
        !*/
    };

// ----------------------------------------------------------------------------------------

    template <
        typename config_reader_type, 
        typename T
        >
    T get_option (
        const config_reader_type& cr,
        const std::string& option_name,
        T default_value
    );
    /*!
        requires
            - T is a type which can be read from an input stream
            - config_reader_type == an implementation of config_reader/config_reader_kernel_abstract.h
        ensures
            - option_name is used to index into the given config_reader.  
            - if (cr contains an entry corresponding to option_name) then
                - converts the string value in cr corresponding to option_name into
                  an object of type T and returns it.
            - else
                - returns default_value
            - The scheme for indexing into cr based on option_name is best
              understood by looking at a few examples:
                - an option name of "name" corresponds to cr["name"]
                - an option name of "block1.name" corresponds to cr.block("block1")["name"]
                - an option name of "block1.block2.name" corresponds to cr.block("block1").block("block2")["name"]
        throws
            - option_parse_error
              This exception is thrown if we attempt but fail to convert the string value
              in cr into an object of type T.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename command_line_parser_type,
        typename T
        >
    T get_option (
        const command_line_parser_type& parser,
        const std::string& option_name,
        T default_value
    );
    /*!
        requires
            - parser.option_is_defined(option_name) == true
            - parser.option(option_name).number_of_arguments() == 1   
            - T is a type which can be read from an input stream
            - command_line_parser_type == an implementation of cmd_line_parser/cmd_line_parser_kernel_abstract.h
        ensures
            - if (parser.option(option_name)) then 
                - converts parser.option(option_name).argument() into an object
                  of type T and returns it.  That is, the string argument to this
                  command line option is converted into a T and returned.
            - else
                - returns default_value
        throws
            - option_parse_error
              This exception is thrown if we attempt but fail to convert the string
              argument into an object of type T.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename command_line_parser_type, 
        typename config_reader_type, 
        typename T
        >
    T get_option (
        const command_line_parser_type& parser,
        const config_reader_type& cr,
        const std::string& option_name,
        T default_value
    );
    /*!
        requires
            - parser.option_is_defined(option_name) == true
            - parser.option(option_name).number_of_arguments() == 1   
            - T is a type which can be read from an input stream
            - command_line_parser_type == an implementation of cmd_line_parser/cmd_line_parser_kernel_abstract.h
            - config_reader_type == an implementation of config_reader/config_reader_kernel_abstract.h
        ensures
            - if (parser.option(option_name)) then 
                - returns get_option(parser, option_name, default_value)
            - else
                - returns get_option(cr, option_name, default_value)
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename command_line_parser_type, 
        typename config_reader_type, 
        typename T
        >
    T get_option (
        const config_reader_type& cr,
        const command_line_parser_type& parser,
        const std::string& option_name,
        T default_value
    );
    /*!
        requires
            - parser.option_is_defined(option_name) == true
            - parser.option(option_name).number_of_arguments() == 1   
            - T is a type which can be read from an input stream
            - command_line_parser_type == an implementation of cmd_line_parser/cmd_line_parser_kernel_abstract.h
            - config_reader_type == an implementation of config_reader/config_reader_kernel_abstract.h
        ensures
            - if (parser.option(option_name)) then 
                - returns get_option(parser, option_name, default_value)
            - else
                - returns get_option(cr, option_name, default_value)
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_GET_OPTiON_ABSTRACT_H__


