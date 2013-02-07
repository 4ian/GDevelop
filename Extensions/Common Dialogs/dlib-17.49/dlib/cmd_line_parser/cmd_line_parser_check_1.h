// Copyright (C) 2006  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_CMD_LINE_PARSER_CHECk_1_
#define DLIB_CMD_LINE_PARSER_CHECk_1_ 

#include "cmd_line_parser_kernel_abstract.h"
#include <sstream>
#include <string>
#include "../string.h"
#include <vector>

namespace dlib
{

    template <
        typename clp_base
        >
    class cmd_line_parser_check_1 : public clp_base
    {

        /*!
            This extension doesn't add any state.

        !*/


    public:
        typedef typename clp_base::char_type char_type;
        typedef typename clp_base::string_type string_type;

    // ------------------------------------------------------------------------------------

        class cmd_line_check_error : public dlib::error 
        {
            friend class cmd_line_parser_check_1;

            cmd_line_check_error(
                error_type t,
                const string_type& opt_,
                const string_type& arg_ 
            ) :
                dlib::error(t),
                opt(opt_),
                opt2(),
                arg(arg_),
                required_opts()
            { set_info_string(); }

            cmd_line_check_error(
                error_type t,
                const string_type& opt_,
                const string_type& opt2_,
                int  // this is just to make this constructor different from the one above
            ) :
                dlib::error(t),
                opt(opt_),
                opt2(opt2_),
                arg(),
                required_opts()
            { set_info_string(); }

            cmd_line_check_error (
                error_type t,
                const string_type& opt_,
                const std::vector<string_type>& vect
            ) :
                dlib::error(t),
                opt(opt_),
                opt2(),
                arg(),
                required_opts(vect)
            { set_info_string(); }

            cmd_line_check_error(
                error_type t,
                const string_type& opt_
            ) :
                dlib::error(t),
                opt(opt_),
                opt2(),
                arg(),
                required_opts()
            { set_info_string(); }

            ~cmd_line_check_error() throw() {}

            void set_info_string (
            )
            {
                std::ostringstream sout;
                switch (type)
                {
                    case EINVALID_OPTION_ARG:
                        sout << "Command line error: '" << narrow(arg) << "' is not a valid argument to " 
                             << "the '" << narrow(opt) << "' option.";
                        break;
                    case EMISSING_REQUIRED_OPTION:
                        if (required_opts.size() == 1)
                        {
                            sout << "Command line error: The '" << narrow(opt) << "' option requires the presence of "
                                 << "the '" << required_opts[0] << "' option.";
                        }
                        else
                        {
                            sout << "Command line error: The '" << narrow(opt) << "' option requires the presence of "
                                 << "one of the following options: ";
                            for (unsigned long i = 0; i < required_opts.size(); ++i)
                            {
                                if (i == required_opts.size()-2)
                                    sout << "'" << required_opts[i] << "' or ";
                                else if (i == required_opts.size()-1)
                                    sout << "'" << required_opts[i] << "'.";
                                else
                                    sout << "'" << required_opts[i] << "', ";
                            }
                        }
                        break;
                    case EINCOMPATIBLE_OPTIONS:
                        sout << "Command line error: The '" << narrow(opt) << "' and '" << narrow(opt2) 
                            << "' options cannot be given together on the command line.";
                        break;
                    case EMULTIPLE_OCCURANCES:
                        sout << "Command line error: The '" << narrow(opt) << "' option can only "
                             << "be given on the command line once.";
                        break;
                    default:
                        sout << "Command line error.";
                        break;
                }
                const_cast<std::string&>(info) = wrap_string(sout.str(),0,0);
            }

        public:
            const string_type opt;
            const string_type opt2;
            const string_type arg; 
            const std::vector<string_type> required_opts; 
        };

    // ------------------------------------------------------------------------------------

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
        typename clp_base
        >
    inline void swap (
        cmd_line_parser_check_1<clp_base>& a, 
        cmd_line_parser_check_1<clp_base>& b 
    ) { a.swap(b); }  

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <typename clp_base>
    template <typename T>
    void cmd_line_parser_check_1<clp_base>::
    check_option_arg_type (
        const string_type& option_name
    ) const
    {
        try
        {
            const typename clp_base::option_type& opt = this->option(option_name);
            const unsigned long number_of_arguments = opt.number_of_arguments();
            const unsigned long count = opt.count();
            for (unsigned long i = 0; i < number_of_arguments; ++i)
            {
                for (unsigned long j = 0; j < count; ++j)
                {
                    string_cast<T>(opt.argument(i,j));
                }
            }
        }
        catch (string_cast_error& e)
        {
            throw cmd_line_check_error(EINVALID_OPTION_ARG,option_name,e.info);
        }
    }

// ----------------------------------------------------------------------------------------

    template <typename clp_base>
    template <typename T>
    void cmd_line_parser_check_1<clp_base>::
    check_option_arg_range (
        const string_type& option_name,
        const T& first,
        const T& last
    ) const
    {
        try
        {
            const typename clp_base::option_type& opt = this->option(option_name);
            const unsigned long number_of_arguments = opt.number_of_arguments();
            const unsigned long count = opt.count();
            for (unsigned long i = 0; i < number_of_arguments; ++i)
            {
                for (unsigned long j = 0; j < count; ++j)
                {
                    T temp(string_cast<T>(opt.argument(i,j)));
                    if (temp < first || last < temp)
                    {
                        throw cmd_line_check_error(
                            EINVALID_OPTION_ARG,
                            option_name,
                            opt.argument(i,j)
                        );
                    }
                }
            }
        }
        catch (string_cast_error& e)
        {
            throw cmd_line_check_error(EINVALID_OPTION_ARG,option_name,e.info);
        }
    }

// ----------------------------------------------------------------------------------------

    template <typename clp_base> 
    template < typename T, size_t length >
    void cmd_line_parser_check_1<clp_base>::
    check_option_arg_range (
        const string_type& option_name,
        const T (&arg_set)[length]
    ) const
    {
        try
        {
            const typename clp_base::option_type& opt = this->option(option_name);
            const unsigned long number_of_arguments = opt.number_of_arguments();
            const unsigned long count = opt.count();
            for (unsigned long i = 0; i < number_of_arguments; ++i)
            {
                for (unsigned long j = 0; j < count; ++j)
                {
                    T temp(string_cast<T>(opt.argument(i,j)));
                    size_t k = 0;
                    for (; k < length; ++k)
                    {
                        if (arg_set[k] == temp)
                            break;
                    }
                    if (k == length)
                    {
                        throw cmd_line_check_error(
                            EINVALID_OPTION_ARG,
                            option_name,
                            opt.argument(i,j)
                        );
                    }
                }
            }
        }
        catch (string_cast_error& e)
        {
            throw cmd_line_check_error(EINVALID_OPTION_ARG,option_name,e.info);
        }
    }

// ----------------------------------------------------------------------------------------

    template <typename clp_base>
    template < size_t length >
    void cmd_line_parser_check_1<clp_base>::
    check_option_arg_range (
        const string_type& option_name,
        const char_type* (&arg_set)[length]
    ) const
    {
        const typename clp_base::option_type& opt = this->option(option_name);
        const unsigned long number_of_arguments = opt.number_of_arguments();
        const unsigned long count = opt.count();
        for (unsigned long i = 0; i < number_of_arguments; ++i)
        {
            for (unsigned long j = 0; j < count; ++j)
            {
                size_t k = 0;
                for (; k < length; ++k)
                {
                    if (arg_set[k] == opt.argument(i,j))
                        break;
                }
                if (k == length)
                {
                    throw cmd_line_check_error(
                        EINVALID_OPTION_ARG,
                        option_name,
                        opt.argument(i,j)
                    );
                }
            }
        }
    }

// ----------------------------------------------------------------------------------------

    template <typename clp_base>
    template < size_t length >
    void cmd_line_parser_check_1<clp_base>::
    check_incompatible_options (
        const char_type* (&option_set)[length]
    ) const
    {
        for (size_t i = 0; i < length; ++i)
        {
            for (size_t j = i+1; j < length; ++j)
            {
                if (this->option(option_set[i]).count() > 0 &&
                    this->option(option_set[j]).count() > 0 )
                {
                    throw cmd_line_check_error(
                        EINCOMPATIBLE_OPTIONS,
                        option_set[i],
                        option_set[j],
                        0 // this argument has no meaning and is only here to make this
                        // call different from the other constructor
                    );
                }
            }
        }
    }

// ----------------------------------------------------------------------------------------

    template <typename clp_base>
    void cmd_line_parser_check_1<clp_base>::
    check_incompatible_options (
        const string_type& option_name1,
        const string_type& option_name2
    ) const
    {
        if (this->option(option_name1).count() > 0 &&
            this->option(option_name2).count() > 0 )
        {
            throw cmd_line_check_error(
                EINCOMPATIBLE_OPTIONS,
                option_name1,
                option_name2,
                0 // this argument has no meaning and is only here to make this
                // call different from the other constructor
            );
        }
    }

// ----------------------------------------------------------------------------------------

    template <typename clp_base>
    void cmd_line_parser_check_1<clp_base>::
    check_sub_option (
        const string_type& parent_option,
        const string_type& sub_option
    ) const
    {
        if (this->option(parent_option).count() == 0)
        {
            if (this->option(sub_option).count() != 0)
            {
                std::vector<string_type> vect;
                vect.resize(1);
                vect[0] = parent_option;
                throw cmd_line_check_error( EMISSING_REQUIRED_OPTION, sub_option, vect);
            }
        }
    }

// ----------------------------------------------------------------------------------------

    template <typename clp_base>
    template < size_t length >
    void cmd_line_parser_check_1<clp_base>::
    check_sub_options (
        const string_type& parent_option,
        const char_type* (&sub_option_set)[length]
    ) const
    {
        if (this->option(parent_option).count() == 0)
        {
            size_t i = 0;
            for (; i < length; ++i)
            {
                if (this->option(sub_option_set[i]).count() > 0)
                    break;
            }
            if (i != length)
            {
                std::vector<string_type> vect;
                vect.resize(1);
                vect[0] = parent_option;
                throw cmd_line_check_error( EMISSING_REQUIRED_OPTION, sub_option_set[i], vect);
            }
        }
    }

// ----------------------------------------------------------------------------------------

    template <typename clp_base>
    template < size_t length > 
    void cmd_line_parser_check_1<clp_base>::
    check_sub_options (
        const char_type* (&parent_option_set)[length],
        const string_type& sub_option
    ) const
    {
        // first check if the sub_option is present
        if (this->option(sub_option).count() > 0)
        {
            // now check if any of the parents are present
            bool parents_present = false;
            for (size_t i = 0; i < length; ++i)
            {
                if (this->option(parent_option_set[i]).count() > 0)
                {
                    parents_present = true;
                    break;
                }
            }

            if (!parents_present)
            {
                std::vector<string_type> vect(parent_option_set, parent_option_set+length);
                throw cmd_line_check_error( EMISSING_REQUIRED_OPTION, sub_option, vect);
            }
        }
    }

// ----------------------------------------------------------------------------------------

    template <typename clp_base>
    template < size_t parent_length, size_t sub_length > 
    void cmd_line_parser_check_1<clp_base>::
    check_sub_options (
        const char_type* (&parent_option_set)[parent_length],
        const char_type* (&sub_option_set)[sub_length]
    ) const
    {
        // first check if any of the parent options are present
        bool parents_present = false;
        for (size_t i = 0; i < parent_length; ++i)
        {
            if (this->option(parent_option_set[i]).count() > 0)
            {
                parents_present = true;
                break;
            }
        }

        if (!parents_present)
        {
            // none of these sub options should be present
            size_t i = 0;
            for (; i < sub_length; ++i)
            {
                if (this->option(sub_option_set[i]).count() > 0)
                    break;
            }
            if (i != sub_length)
            {
                std::vector<string_type> vect(parent_option_set, parent_option_set+parent_length);
                throw cmd_line_check_error( EMISSING_REQUIRED_OPTION, sub_option_set[i], vect);
            }
        }
    }

// ----------------------------------------------------------------------------------------

    template <typename clp_base>
    template < size_t length >
    void cmd_line_parser_check_1<clp_base>::
    check_one_time_options (
        const char_type* (&option_set)[length]
    ) const
    {
        size_t i = 0;
        for (; i < length; ++i)
        {
            if (this->option(option_set[i]).count() > 1)
                break;
        }
        if (i != length)
        {
            throw cmd_line_check_error(
                EMULTIPLE_OCCURANCES,
                option_set[i] 
            );
        }
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_CMD_LINE_PARSER_CHECk_1_ 


