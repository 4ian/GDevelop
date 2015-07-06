// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_CMD_LINE_PARSER_KERNEl_ABSTRACT_
#ifdef DLIB_CMD_LINE_PARSER_KERNEl_ABSTRACT_

#include "../algs.h"
#include <string>
#include "../interfaces/enumerable.h"
#include "../interfaces/cmd_line_parser_option.h"
#include <vector>
#include <iostream>

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
                - parsed_line() == false
                - option_is_defined(x) == false, for all values of x
                - get_group_name() == ""

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
                          an <options> or <arg> token, etc.)
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
                - #option(name).group_name() == get_group_name()
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

        void print_options (
            std::basic_ostream<char_type>& out
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

        void print_options (
        ) const;
        /*!
            ensures
                - prints all the command line options to cout.
                - #at_start() == true
            throws                
                - any exception.
                    if an exception is thrown then #at_start() == true but otherwise  
                    it will have no effect on the state of #*this.
        !*/

        string_type get_group_name (
        ) const;
        /*!
            ensures
                - returns the current group name.  This is the group new options will be
                  added into when added via add_option().  
                - The group name of an option is used by print_options().  In particular,
                  it groups all options with the same group name together and displays them
                  under a title containing the text of the group name.  This allows you to
                  group similar options together in the output of print_options().
                - A group name of "" (i.e. the empty string) means that no group name is
                  set.
        !*/

        void set_group_name (
            const string_type& group_name
        );
        /*!
            ensures
                - #get_group_name() == group_name
        !*/

    // -------------------------------------------------------------
    //                    Input Validation Tools
    // -------------------------------------------------------------

        class cmd_line_check_error : public dlib::error 
        {
            /*!
                This is the exception thrown by the check_*() routines if they find a
                command line error.  The interpretation of the member variables is defined
                below in each check_*() routine.
            !*/

        public:
            const string_type opt;
            const string_type opt2;
            const string_type arg; 
            const std::vector<string_type> required_opts; 
        };

        template <
            typename T
            >
        void check_option_arg_type (
            const string_type& option_name
        ) const;
        /*!
            requires
                - parsed_line() == true
                - option_is_defined(option_name) == true
                - T is not a pointer type
            ensures
                - all the arguments for the given option are convertible
                  by string_cast<T>() to an object of type T.
            throws
                - std::bad_alloc
                - cmd_line_check_error
                    This exception is thrown if the ensures clause could not be satisfied. 
                    The exception's members will be set as follows:
                        - type == EINVALID_OPTION_ARG
                        - opt == option_name
                        - arg == the text of the offending argument
        !*/

        template <
            typename T
            >
        void check_option_arg_range (
            const string_type& option_name,
            const T& first,
            const T& last
        ) const;
        /*!
            requires
                - parsed_line() == true
                - option_is_defined(option_name) == true
                - first <= last
                - T is not a pointer type
            ensures
                - all the arguments for the given option are convertible
                  by string_cast<T>() to an object of type T and the resulting value is
                  in the range first to last inclusive.
            throws
                - std::bad_alloc
                - cmd_line_check_error
                    This exception is thrown if the ensures clause could not be satisfied.
                    The exception's members will be set as follows:
                        - type == EINVALID_OPTION_ARG
                        - opt == option_name
                        - arg == the text of the offending argument
        !*/

        template <
            typename T,
            size_t length
            >
        void check_option_arg_range (
            const string_type& option_name,
            const T (&arg_set)[length]
        ) const;
        /*!
            requires
                - parsed_line() == true
                - option_is_defined(option_name) == true
                - T is not a pointer type
            ensures
                - for each argument to the given option:
                    - this argument is convertible by string_cast<T>() to an object of
                      type T and the resulting value is equal to some element in the
                      arg_set array.
            throws
                - std::bad_alloc
                - cmd_line_check_error
                    This exception is thrown if the ensures clause could not be satisfied.
                    The exception's members will be set as follows:
                        - type == EINVALID_OPTION_ARG
                        - opt == option_name
                        - arg == the text of the offending argument
        !*/

        template <
            size_t length
            >
        void check_option_arg_range (
            const string_type& option_name,
            const char_type* (&arg_set)[length]
        ) const;
        /*!
            requires
                - parsed_line() == true
                - option_is_defined(option_name) == true
            ensures
                - for each argument to the given option:
                    - there is a string in the arg_set array that is equal to this argument.
            throws
                - std::bad_alloc
                - cmd_line_check_error
                    This exception is thrown if the ensures clause could not be satisfied.
                    The exception's members will be set as follows:
                        - type == EINVALID_OPTION_ARG
                        - opt == option_name
                        - arg == the text of the offending argument
        !*/

        template <
            size_t length
            >
        void check_one_time_options (
            const char_type* (&option_set)[length]
        ) const;
        /*!
            requires
                - parsed_line() == true
                - for all valid i:
                    - option_is_defined(option_set[i]) == true
            ensures
                - all the options in the option_set array occur at most once on the
                  command line.
            throws
                - std::bad_alloc
                - cmd_line_check_error
                    This exception is thrown if the ensures clause could not be satisfied.
                    The exception's members will be set as follows:
                        - type == EMULTIPLE_OCCURANCES 
                        - opt == the option that occurred more than once on the command line. 
        !*/

        void check_incompatible_options (
            const string_type& option_name1,
            const string_type& option_name2
        ) const;
        /*!
            requires
                - parsed_line() == true
                - option_is_defined(option_name1) == true
                - option_is_defined(option_name2) == true
            ensures
                - option(option_name1).count() == 0 || option(option_name2).count() == 0
                  (i.e. at most, only one of the options is currently present)
            throws
                - std::bad_alloc
                - cmd_line_check_error
                    This exception is thrown if the ensures clause could not be satisfied.
                    The exception's members will be set as follows:
                        - type == EINCOMPATIBLE_OPTIONS 
                        - opt == option_name1 
                        - opt2 == option_name2 
        !*/

        template <
            size_t length
            >
        void check_incompatible_options (
            const char_type* (&option_set)[length]
        ) const;
        /*!
            requires
                - parsed_line() == true
                - for all valid i:
                    - option_is_defined(option_set[i]) == true
            ensures
                - At most only one of the options in the array option_set has a count()
                  greater than 0.  (i.e. at most, only one of the options is currently present)
            throws
                - std::bad_alloc
                - cmd_line_check_error
                    This exception is thrown if the ensures clause could not be satisfied.
                    The exception's members will be set as follows:
                        - type == EINCOMPATIBLE_OPTIONS 
                        - opt == One of the incompatible options found.
                        - opt2 == The next incompatible option found.
        !*/

        void check_sub_option (
            const string_type& parent_option,
            const string_type& sub_option
        ) const;
        /*!
            requires
                - parsed_line() == true
                - option_is_defined(parent_option) == true
                - option_is_defined(sub_option) == true
            ensures
                - if (option(parent_option).count() == 0) then
                    - option(sub_option).count() == 0
            throws
                - std::bad_alloc
                - cmd_line_check_error
                    This exception is thrown if the ensures clause could not be satisfied.
                    The exception's members will be set as follows:
                        - type == EMISSING_REQUIRED_OPTION 
                        - opt == sub_option. 
                        - required_opts == a vector that contains only parent_option. 
        !*/

        template <
            size_t length
            >
        void check_sub_options (
            const char_type* (&parent_option_set)[length],
            const string_type& sub_option
        ) const;
        /*!
            requires
                - parsed_line() == true
                - option_is_defined(sub_option) == true
                - for all valid i:
                    - option_is_defined(parent_option_set[i] == true
            ensures
                - if (option(sub_option).count() > 0) then
                    - At least one of the options in the array parent_option_set has a count()
                      greater than 0. (i.e. at least one of the options in parent_option_set
                      is currently present)
            throws
                - std::bad_alloc
                - cmd_line_check_error
                    This exception is thrown if the ensures clause could not be satisfied.
                    The exception's members will be set as follows:
                        - type == EMISSING_REQUIRED_OPTION 
                        - opt == the first option from the sub_option that is present. 
                        - required_opts == a vector containing everything from parent_option_set.
        !*/

        template <
            size_t length
            >
        void check_sub_options (
            const string_type& parent_option,
            const char_type* (&sub_option_set)[length]
        ) const;
        /*!
            requires
                - parsed_line() == true
                - option_is_defined(parent_option) == true
                - for all valid i:
                    - option_is_defined(sub_option_set[i]) == true
            ensures
                - if (option(parent_option).count() == 0) then
                    - for all valid i:
                        - option(sub_option_set[i]).count() == 0
            throws
                - std::bad_alloc
                - cmd_line_check_error
                    This exception is thrown if the ensures clause could not be satisfied.
                    The exception's members will be set as follows:
                        - type == EMISSING_REQUIRED_OPTION 
                        - opt == the first option from the sub_option_set that is present.
                        - required_opts == a vector that contains only parent_option. 
        !*/

        template <
            size_t parent_length,
            size_t sub_length
            >
        void check_sub_options (
            const char_type* (&parent_option_set)[parent_length],
            const char_type* (&sub_option_set)[sub_length]
        ) const;
        /*!
            requires
                - parsed_line() == true
                - for all valid i:
                    - option_is_defined(parent_option_set[i] == true
                - for all valid j:
                    - option_is_defined(sub_option_set[j]) == true
            ensures
                - for all valid j:
                    - if (option(sub_option_set[j]).count() > 0) then
                        - At least one of the options in the array parent_option_set has a count()
                          greater than 0. (i.e. at least one of the options in parent_option_set
                          is currently present)
            throws
                - std::bad_alloc
                - cmd_line_check_error
                    This exception is thrown if the ensures clause could not be satisfied.
                    The exception's members will be set as follows:
                        - type == EMISSING_REQUIRED_OPTION 
                        - opt == the first option from the sub_option_set that is present. 
                        - required_opts == a vector containing everything from parent_option_set.
        !*/


    private:

        // restricted functions
        cmd_line_parser(cmd_line_parser&);        // copy constructor
        cmd_line_parser& operator=(cmd_line_parser&);    // assignment operator

    };   

// -----------------------------------------------------------------------------------------

    typedef cmd_line_parser<char>    command_line_parser;
    typedef cmd_line_parser<wchar_t> wcommand_line_parser;
   
// -----------------------------------------------------------------------------------------

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

// -----------------------------------------------------------------------------------------

}

#endif // DLIB_CMD_LINE_PARSER_KERNEl_ABSTRACT_

