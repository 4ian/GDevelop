// Copyright (C) 2006  Davis E. King (davisking@users.sourceforge.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_CMD_LINE_PARSER_CHECk_ABSTRACT_
#ifdef DLIB_CMD_LINE_PARSER_CHECk_ABSTRACT_ 


#include "cmd_line_parser_kernel_abstract.h"
#include <vector>

namespace dlib
{

    template <
        typename clp_base
        >
    class cmd_line_parser_check : public clp_base
    {

        /*!
            REQUIREMENTS ON CLP_BASE
                clp_base is an implementation of cmd_line_parser/cmd_line_parser_kernel_abstract.h

            POINTERS AND REFERENCES TO INTERNAL DATA
                None of the functions added by this extension will invalidate pointers 
                or references to internal data.

            WHAT THIS EXTENSION DOES FOR CMD_LINE_PARSER
                This gives a cmd_line_parser object the ability to easily perform various
                kinds of validation on the command line input.
        !*/


    public:
        typedef typename clp_base::char_type char_type;
        typedef typename clp_base::string_type string_type;

        // exception class
        class cmd_line_check_error : public dlib::error 
        {
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
                - all the arguments for the given option are convertable
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
                - all the arguments for the given option are convertable
                  by string_cast<T>() to an object of type T and the resuting value is
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
                    - this argument is convertable by string_cast<T>() to an object of
                      type T and the resulting value is equal to some string in the
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

    };

    template <
        template clp_base
        >
    inline void swap (
        cmd_line_parser_check<clp_base>& a, 
        cmd_line_parser_check<clp_base>& b 
    ) { a.swap(b); }  
    /*!
        provides a global swap function
    !*/

}

#endif // DLIB_CMD_LINE_PARSER_CHECk_ABSTRACT_ 


