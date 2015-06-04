// Copyright (C) 2006  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_CMD_LINE_PARSER_CHECk_C_
#define DLIB_CMD_LINE_PARSER_CHECk_C_

#include "cmd_line_parser_kernel_abstract.h"
#include "../algs.h"
#include "../assert.h"
#include <string>
#include "../interfaces/cmd_line_parser_option.h"
#include "../string.h"

namespace dlib
{

    template <
        typename clp_check
        >
    class cmd_line_parser_check_c : public clp_check
    {
        public:

        typedef typename clp_check::char_type char_type;
        typedef typename clp_check::string_type string_type;

        template <
            typename T
            >
        void check_option_arg_type (
            const string_type& option_name
        ) const;

        template <
            typename T
            >
        void check_option_arg_range (
            const string_type& option_name,
            const T& first,
            const T& last
        ) const;

        template <
            typename T,
            size_t length
            >
        void check_option_arg_range (
            const string_type& option_name,
            const T (&arg_set)[length]
        ) const;

        template <
            size_t length
            >
        void check_option_arg_range (
            const string_type& option_name,
            const char_type* (&arg_set)[length]
        ) const;

        template <
            size_t length
            >
        void check_incompatible_options (
            const char_type* (&option_set)[length]
        ) const;

        template <
            size_t length
            >
        void check_one_time_options (
            const char_type* (&option_set)[length]
        ) const;

        void check_incompatible_options (
            const string_type& option_name1,
            const string_type& option_name2
        ) const;

        void check_sub_option (
            const string_type& parent_option,
            const string_type& sub_option
        ) const;

        template <
            size_t length
            >
        void check_sub_options (
            const string_type& parent_option,
            const char_type* (&sub_option_set)[length]
        ) const;

        template <
            size_t length
            >
        void check_sub_options (
            const char_type* (&parent_option_set)[length],
            const string_type& sub_option
        ) const;

        template <
            size_t parent_length,
            size_t sub_length
            >
        void check_sub_options (
            const char_type* (&parent_option_set)[parent_length],
            const char_type* (&sub_option_set)[sub_length]
        ) const;
    };


    template <
        typename clp_check
        >
    inline void swap (
        cmd_line_parser_check_c<clp_check>& a, 
        cmd_line_parser_check_c<clp_check>& b 
    ) { a.swap(b); } 

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <typename clp_check>
    template <typename T>
    void cmd_line_parser_check_c<clp_check>::
    check_option_arg_type (
        const string_type& option_name
    ) const
    {
        COMPILE_TIME_ASSERT(is_pointer_type<T>::value == false);

        // make sure requires clause is not broken
        DLIB_CASSERT( this->parsed_line() == true && this->option_is_defined(option_name),
               "\tvoid cmd_line_parser_check::check_option_arg_type()"
            << "\n\tYou must have already parsed the command line and option_name must be valid."
            << "\n\tthis:                           " << this
            << "\n\toption_is_defined(option_name): " << ((this->option_is_defined(option_name))?"true":"false")
            << "\n\tparsed_line():                  " << ((this->parsed_line())?"true":"false")
            << "\n\toption_name:                    " << option_name 
            );

        clp_check::template check_option_arg_type<T>(option_name);
    }

// ----------------------------------------------------------------------------------------

    template <typename clp_check>
    template <typename T>
    void cmd_line_parser_check_c<clp_check>::
    check_option_arg_range (
        const string_type& option_name,
        const T& first,
        const T& last
    ) const
    {
        COMPILE_TIME_ASSERT(is_pointer_type<T>::value == false);

        // make sure requires clause is not broken
        DLIB_CASSERT( this->parsed_line() == true && this->option_is_defined(option_name) &&
                 first <= last,
               "\tvoid cmd_line_parser_check::check_option_arg_range()"
            << "\n\tSee the requires clause for this function."
            << "\n\tthis:                           " << this
            << "\n\toption_is_defined(option_name): " << ((this->option_is_defined(option_name))?"true":"false")
            << "\n\tparsed_line():                  " << ((this->parsed_line())?"true":"false")
            << "\n\toption_name:                    " << option_name 
            << "\n\tfirst:                          " << first 
            << "\n\tlast:                           " << last 
            );

        clp_check::check_option_arg_range(option_name,first,last);
    }

// ----------------------------------------------------------------------------------------

    template <typename clp_check> 
    template < typename T, size_t length >
    void cmd_line_parser_check_c<clp_check>::
    check_option_arg_range (
        const string_type& option_name,
        const T (&arg_set)[length]
    ) const
    {
        COMPILE_TIME_ASSERT(is_pointer_type<T>::value == false);

        // make sure requires clause is not broken
        DLIB_CASSERT( this->parsed_line() == true && this->option_is_defined(option_name), 
               "\tvoid cmd_line_parser_check::check_option_arg_range()"
            << "\n\tSee the requires clause for this function."
            << "\n\tthis:                           " << this
            << "\n\toption_is_defined(option_name): " << ((this->option_is_defined(option_name))?"true":"false")
            << "\n\tparsed_line():                  " << ((this->parsed_line())?"true":"false")
            << "\n\toption_name:                    " << option_name 
            );

        clp_check::check_option_arg_range(option_name,arg_set);
    }

// ----------------------------------------------------------------------------------------

    template <typename clp_check>
    template < size_t length >
    void cmd_line_parser_check_c<clp_check>::
    check_option_arg_range (
        const string_type& option_name,
        const char_type* (&arg_set)[length]
    ) const
    {
        // make sure requires clause is not broken
        DLIB_CASSERT( this->parsed_line() == true && this->option_is_defined(option_name), 
               "\tvoid cmd_line_parser_check::check_option_arg_range()"
            << "\n\tSee the requires clause for this function."
            << "\n\tthis:                           " << this
            << "\n\toption_is_defined(option_name): " << ((this->option_is_defined(option_name))?"true":"false")
            << "\n\tparsed_line():                  " << ((this->parsed_line())?"true":"false")
            << "\n\toption_name:                    " << option_name 
            );

        clp_check::check_option_arg_range(option_name,arg_set);
    }

// ----------------------------------------------------------------------------------------

    template <typename clp_check>
    template < size_t length >
    void cmd_line_parser_check_c<clp_check>::
    check_incompatible_options (
        const char_type* (&option_set)[length]
    ) const
    {
        // make sure requires clause is not broken
        for (size_t i = 0; i < length; ++i)
        {
            DLIB_CASSERT( this->parsed_line() == true && this->option_is_defined(option_set[i]), 
                     "\tvoid cmd_line_parser_check::check_incompatible_options()"
                     << "\n\tSee the requires clause for this function."
                     << "\n\tthis:                             " << this
                     << "\n\toption_is_defined(option_set[i]): " << ((this->option_is_defined(option_set[i]))?"true":"false")
                     << "\n\tparsed_line():                    " << ((this->parsed_line())?"true":"false")
                     << "\n\toption_set[i]:                    " << option_set[i] 
                     << "\n\ti:                                " << static_cast<unsigned long>(i) 
            );

        }
        clp_check::check_incompatible_options(option_set);
    }

// ----------------------------------------------------------------------------------------

    template <typename clp_check>
    void cmd_line_parser_check_c<clp_check>::
    check_incompatible_options (
        const string_type& option_name1,
        const string_type& option_name2
    ) const
    {
        // make sure requires clause is not broken
        DLIB_CASSERT( this->parsed_line() == true && this->option_is_defined(option_name1) &&
                 this->option_is_defined(option_name2), 
               "\tvoid cmd_line_parser_check::check_incompatible_options()"
            << "\n\tSee the requires clause for this function."
            << "\n\tthis:                            " << this
            << "\n\toption_is_defined(option_name1): " << ((this->option_is_defined(option_name1))?"true":"false")
            << "\n\toption_is_defined(option_name2): " << ((this->option_is_defined(option_name2))?"true":"false")
            << "\n\tparsed_line():                   " << ((this->parsed_line())?"true":"false")
            << "\n\toption_name1:                    " << option_name1 
            << "\n\toption_name2:                    " << option_name2 
            );

        clp_check::check_incompatible_options(option_name1,option_name2);
    }

// ----------------------------------------------------------------------------------------

    template <typename clp_check>
    void cmd_line_parser_check_c<clp_check>::
    check_sub_option (
        const string_type& parent_option,
        const string_type& sub_option
    ) const
    {
        // make sure requires clause is not broken
        DLIB_CASSERT( this->parsed_line() == true && this->option_is_defined(parent_option) &&
                      this->option_is_defined(sub_option), 
                 "\tvoid cmd_line_parser_check::check_sub_option()"
                 << "\n\tSee the requires clause for this function."
                 << "\n\tthis:                             " << this
                 << "\n\tparsed_line():                    " << this->parsed_line()
                 << "\n\toption_is_defined(parent_option): " << this->option_is_defined(parent_option)
                 << "\n\toption_is_defined(sub_option):    " << this->option_is_defined(sub_option)
                 << "\n\tparent_option:                    " << parent_option 
                 << "\n\tsub_option:                       " << sub_option 
        );
        clp_check::check_sub_option(parent_option,sub_option);
    }

// ----------------------------------------------------------------------------------------

    template <typename clp_check>
    template < size_t length >
    void cmd_line_parser_check_c<clp_check>::
    check_sub_options (
        const string_type& parent_option,
        const char_type* (&sub_option_set)[length]
    ) const
    {
        // make sure requires clause is not broken
        for (size_t i = 0; i < length; ++i)
        {
            DLIB_CASSERT( this->option_is_defined(sub_option_set[i]), 
                     "\tvoid cmd_line_parser_check::check_sub_options()"
                     << "\n\tSee the requires clause for this function."
                     << "\n\tthis:                                 " << this
                     << "\n\toption_is_defined(sub_option_set[i]): " 
                         << ((this->option_is_defined(sub_option_set[i]))?"true":"false")
                     << "\n\tsub_option_set[i]:                    " << sub_option_set[i] 
                     << "\n\ti:                                    " << static_cast<unsigned long>(i) 
            );

        }

        DLIB_CASSERT( this->parsed_line() == true && this->option_is_defined(parent_option), 
                 "\tvoid cmd_line_parser_check::check_sub_options()"
                 << "\n\tSee the requires clause for this function."
                 << "\n\tthis:                             " << this
                 << "\n\toption_is_defined(parent_option): " << ((this->option_is_defined(parent_option))?"true":"false")
                 << "\n\tparsed_line():                    " << ((this->parsed_line())?"true":"false")
                 << "\n\tparent_option:                    " << parent_option 
        );
        clp_check::check_sub_options(parent_option,sub_option_set);

    }

// ----------------------------------------------------------------------------------------

    template <typename clp_check>
    template < size_t length >
    void cmd_line_parser_check_c<clp_check>::
    check_sub_options (
        const char_type* (&parent_option_set)[length],
        const string_type& sub_option
    ) const
    {
        // make sure requires clause is not broken
        for (size_t i = 0; i < length; ++i)
        {
            DLIB_CASSERT( this->option_is_defined(parent_option_set[i]), 
                     "\tvoid cmd_line_parser_check::check_sub_options()"
                     << "\n\tSee the requires clause for this function."
                     << "\n\tthis:                                    " << this
                     << "\n\toption_is_defined(parent_option_set[i]): " 
                         << ((this->option_is_defined(parent_option_set[i]))?"true":"false")
                     << "\n\tparent_option_set[i]:                    " << parent_option_set[i] 
                     << "\n\ti:                                       " << static_cast<unsigned long>(i) 
            );

        }

        DLIB_CASSERT( this->parsed_line() == true && this->option_is_defined(sub_option), 
                 "\tvoid cmd_line_parser_check::check_sub_options()"
                 << "\n\tSee the requires clause for this function."
                 << "\n\tthis:                          " << this
                 << "\n\toption_is_defined(sub_option): " << ((this->option_is_defined(sub_option))?"true":"false")
                 << "\n\tparsed_line():                 " << ((this->parsed_line())?"true":"false")
                 << "\n\tsub_option:                    " << sub_option 
        );
        clp_check::check_sub_options(parent_option_set,sub_option);

    }

// ----------------------------------------------------------------------------------------

    template <typename clp_check>
    template < size_t parent_length, size_t sub_length > 
    void cmd_line_parser_check_c<clp_check>::
    check_sub_options (
        const char_type* (&parent_option_set)[parent_length],
        const char_type* (&sub_option_set)[sub_length]
    ) const
    {
        // make sure requires clause is not broken
        for (size_t i = 0; i < sub_length; ++i)
        {
            DLIB_CASSERT( this->option_is_defined(sub_option_set[i]), 
                     "\tvoid cmd_line_parser_check::check_sub_options()"
                     << "\n\tSee the requires clause for this function."
                     << "\n\tthis:                                 " << this
                     << "\n\toption_is_defined(sub_option_set[i]): " 
                         << ((this->option_is_defined(sub_option_set[i]))?"true":"false")
                     << "\n\tsub_option_set[i]:                    " << sub_option_set[i] 
                     << "\n\ti:                                    " << static_cast<unsigned long>(i) 
            );
        }

        for (size_t i = 0; i < parent_length; ++i)
        {
            DLIB_CASSERT( this->option_is_defined(parent_option_set[i]), 
                     "\tvoid cmd_line_parser_check::check_parent_options()"
                     << "\n\tSee the requires clause for this function."
                     << "\n\tthis:                                    " << this
                     << "\n\toption_is_defined(parent_option_set[i]): " 
                         << ((this->option_is_defined(parent_option_set[i]))?"true":"false")
                     << "\n\tparent_option_set[i]:                    " << parent_option_set[i] 
                     << "\n\ti:                                       " << static_cast<unsigned long>(i)
            );
        }



        DLIB_CASSERT( this->parsed_line() == true , 
                 "\tvoid cmd_line_parser_check::check_sub_options()"
                 << "\n\tYou must have parsed the command line before you call this function."
                 << "\n\tthis:                             " << this
                 << "\n\tparsed_line():                    " << ((this->parsed_line())?"true":"false")
        );

        clp_check::check_sub_options(parent_option_set,sub_option_set);

    }

// ----------------------------------------------------------------------------------------

    template <typename clp_check>
    template < size_t length >
    void cmd_line_parser_check_c<clp_check>::
    check_one_time_options (
        const char_type* (&option_set)[length]
    ) const
    {
        // make sure requires clause is not broken
        for (size_t i = 0; i < length; ++i)
        {
            DLIB_CASSERT( this->parsed_line() == true && this->option_is_defined(option_set[i]), 
                     "\tvoid cmd_line_parser_check::check_one_time_options()"
                     << "\n\tSee the requires clause for this function."
                     << "\n\tthis:                             " << this
                     << "\n\toption_is_defined(option_set[i]): " << ((this->option_is_defined(option_set[i]))?"true":"false")
                     << "\n\tparsed_line():                    " << ((this->parsed_line())?"true":"false")
                     << "\n\toption_set[i]:                    " << option_set[i] 
                     << "\n\ti:                                " << static_cast<unsigned long>(i)
            );

        }
        clp_check::check_one_time_options(option_set);
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_CMD_LINE_PARSER_CHECk_C_

