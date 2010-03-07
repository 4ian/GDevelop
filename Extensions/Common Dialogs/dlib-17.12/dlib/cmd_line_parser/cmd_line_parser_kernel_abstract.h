// Copyright (C) 2003  Davis E. King (davisking@users.sourceforge.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_CMD_LINE_PARSER_KERNEl_ABSTRACT_
#ifdef DLIB_CMD_LINE_PARSER_KERNEl_ABSTRACT_

#include "../algs.h"
#include <string>
#include "../interfaces/enumerable.h"
#include "../interfaces/cmd_line_parser_option.h"

namespace dlib
{

    template <
        typename charT
        >
    class cmd_line_parser : public enumerable<cmd_line_parser_option<charT> >
    {
        /*!
            REQUIREMENTS ON charT
                Must be an integral type suitable for storing characters.  (e.g. char
                or wchar_t)

            INITIAL VALUE
                parsed_line() == false
                option_is_defined(x) == false, for all values of x

            ENUMERATION ORDER   
                The enumerator will enumerate over all the options defined in *this 
                in alphebetical order according to the name of the option.

            POINTERS AND REFERENCES TO INTERNAL DATA
                parsed_line(), option_is_defined(), option(), number_of_arguments(),
                operator[](), and swap() functions do not invalidate pointers or 
                references to internal data.  All other functions have no such guarantee.


            WHAT THIS OBJECT REPRESENTS
                This object represents a command line parser. 
                The command lines must match the following BNF.  

                command_line     ::= <program_name> { <options> | <arg> } [ -- {<word>} ]
                program_name     ::= <word>
                arg              ::= any <word> that does not start with - 
                option_arg       ::= <sword> 
                option_name      ::= <char>                
                long_option_name ::= <char> {<char> | - }
                options          ::= <bword> - <option_name> {<option_name>}  {<option_arg>}  |
                                     <bword> -- <long_option_name> [=<option_arg>] {<bword> <option_arg>}
                char             ::= any character other than - or =
                word             ::= any string from argv where argv is the second 
                                     parameter to main() 
                sword            ::= any suffix of a string from argv where argv is the 
                                     second parameter to main() 
                bword            ::= This is an empty string which denotes the begining of a 
                                     <word>.


                Options with arguments:
                    An option with N arguments will consider the next N swords to be
                    its arguments. 

                    so for example, if we have an option o that expects 2 arguments 
                    then the following are a few legal examples:

                        program -o arg1 arg2 general_argument
                        program -oarg1 arg2 general_argument

                    arg1 and arg2 are associated with the option o and general_argument
                    is not.

                Arguments not associated with an option:
                    An argument that is not associated with an option is considered a
                    general command line argument and is indexed by operator[] defined
                    by the cmd_line_parser object.  Additionally, if the string
                    "--" appears in the command line all by itself then all words
                    following it are considered to be general command line arguments.


                    Consider the following two examples involving a command line and 
                    a cmd_line_parser object called parser.

                    Example 1:
                        command line: program general_arg1 -o arg1 arg2 general_arg2
                        Then the following is true (assuming the o option is defined
                        and takes 2 arguments).

                        parser[0] == "general_arg1"
                        parser[1] == "general_arg2"
                        parser.number_of_arguments() == 2
                        parser.option("o").argument(0) == "arg1"
                        parser.option("o").argument(1) == "arg2"
                        parser.option("o").count() == 1

                    Example 2:
                        command line: program general_arg1 -- -o arg1 arg2 general_arg2
                        Then the following is true (the -- causes everything following 
                        it to be treated as a general argument).
                        
                        parser[0] == "general_arg1"
                        parser[1] == "-o"
                        parser[2] == "arg1"
                        parser[3] == "arg2"
                        parser[4] == "general_arg2"
                        parser.number_of_arguments() == 5
                        parser.option("o").count() == 0
        !*/

    public:

        typedef charT char_type;
        typedef std::basic_string<charT> string_type;
        typedef cmd_line_parser_option<charT> option_type;

        // exception class
        class cmd_line_parse_error : public dlib::error 
        {
            /*!
                GENERAL
                    This exception is thrown if there is an error detected in a 
                    command line while it is being parsed.  You can consult this 
                    object's type and item members to determine the nature of the 
                    error. (note that the type member is inherited from dlib::error).

                INTERPRETING THIS EXCEPTION
                    - if (type == EINVALID_OPTION) then
                        - There was an undefined option on the command line
                        - item == The invalid option that was on the command line
                    - if (type == ETOO_FEW_ARGS) then
                        - An option was given on the command line but it was not
                          supplied with the required number of arguments.
                        - item == The name of this option.
                        - num == The number of arguments expected by this option.
                    - if (type == ETOO_MANY_ARGS) then
                        - An option was given on the command line such as --option=arg
                          but this option doesn't take any arguments.
                        - item == The name of this option.
            !*/
        public:
            const std::basic_string<charT> item;
            const unsigned long num;
        };

    // --------------------------

        cmd_line_parser (
        );
        /*!
            ensures
                - #*this is properly initialized
            throws
                - std::bad_alloc
        !*/

        virtual ~cmd_line_parser (
        );
        /*!
            ensures
                 - all memory associated with *this has been released
        !*/

        void clear(
        );
        /*!
            ensures
                - #*this has its initial value
            throws
                - std::bad_alloc
                    if this exception is thrown then #*this is unusable 
                    until clear() is called and succeeds
        !*/

        void parse (
            int argc,
            const charT** argv
        );
        /*!
            requires                
                - argv == an array of strings that was obtained from the second argument 
                          of the function main().
                          (i.e. argv[0] should be the <program> token, argv[1] should be
                          an <options> or <arg> token, etc...)
                - argc == the number of strings in argv
            ensures
                - parses the command line given by argc and argv 
                - #parsed_line() == true
                - #at_start() == true
            throws
                - std::bad_alloc
                    if this exception is thrown then #*this is unusable until clear()
                    is called successfully
                - cmd_line_parse_error
                    This exception is thrown if there is an error parsing the command line.
                    If this exception is thrown then #parsed_line() == false and all 
                    options will have their count() set to 0 but otherwise there will 
                    be no effect (i.e. all registered options will remain registered).
        !*/

        void parse (
            int argc,
            charT** argv
        );
        /*!
            This just calls this->parse(argc,argv) and performs the necessary const_cast
            on argv.
        !*/

        bool parsed_line(
        ) const;
        /*!
            ensures
                - returns true if parse() has been called successfully 
                - returns false otherwise
        !*/

        bool option_is_defined (
            const string_type& name
        ) const;
        /*!
            ensures
                - returns true if the option has been added to the parser object 
                  by calling add_option(name). 
                - returns false otherwise
        !*/

        void add_option (
            const string_type& name,
            const string_type& description,
            unsigned long number_of_arguments = 0
        );
        /*!
            requires
                - parsed_line() == false 
                - option_is_defined(name) == false 
                - name does not contain any ' ', '\t', '\n', or '=' characters
                - name[0] != '-'
                - name.size() > 0
            ensures
                - #option_is_defined(name) == true 
                - #at_start() == true
                - #option(name).count() == 0
                - #option(name).description() == description 
                - #option(name).number_of_arguments() == number_of_arguments
            throws
                - std::bad_alloc
                    if this exception is thrown then the add_option() function has no 
                    effect
        !*/

        const option_type& option (
            const string_type& name
        ) const;
        /*! 
            requires
                - option_is_defined(name) == true
            ensures
                - returns the option specified by name
        !*/ 

        unsigned long number_of_arguments( 
        ) const;
        /*!
            requires
                - parsed_line() == true
            ensures
                - returns the number of arguments present in the command line.
                  This count does not include options or their arguments.  Only 
                  arguments unrelated to any option are counted.
        !*/

        const string_type& operator[] (
            unsigned long N
        ) const;
        /*!
            requires
                - parsed_line() == true
                - N < number_of_arguments()
            ensures
                - returns the Nth command line argument
        !*/

        void swap (
            cmd_line_parser& item
        );
        /*!
            ensures
                - swaps *this and item
        !*/

    private:

        // restricted functions
        cmd_line_parser(cmd_line_parser&);        // copy constructor
        cmd_line_parser& operator=(cmd_line_parser&);    // assignment operator

    };   
   

    template <
        typename charT
        >
    inline void swap (
        cmd_line_parser<charT>& a, 
        cmd_line_parser<charT>& b 
    ) { a.swap(b); }   
    /*!
        provides a global swap function
    !*/


}

#endif // DLIB_CMD_LINE_PARSER_KERNEl_ABSTRACT_

