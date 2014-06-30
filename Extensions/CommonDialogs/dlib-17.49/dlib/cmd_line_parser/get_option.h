// Copyright (C) 2012  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_GET_OPTiON_H__
#define DLIB_GET_OPTiON_H__

#include "get_option_abstract.h"
#include "../string.h"
#include "../is_kind.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    class option_parse_error : public error
    {
    public:
        option_parse_error(const std::string& option_string, const std::string& str):
            error(EOPTION_PARSE,"Error parsing argument for option '" + option_string + "', offending string is '" + str + "'.") {}
    };

// ----------------------------------------------------------------------------------------

    template <typename config_reader_type, typename T>
    T impl_config_reader_get_option (
        const config_reader_type& cr,
        const std::string& option_name,
        const std::string& full_option_name,
        T default_value
    )
    {
        std::string::size_type pos = option_name.find_first_of(".");
        if (pos == std::string::npos)
        {
            if (cr.is_key_defined(option_name))
            {
                try{ return string_cast<T>(cr[option_name]); }
                catch (string_cast_error&) { throw option_parse_error(full_option_name, cr[option_name]); }
            }
        }
        else
        {
            std::string block_name = option_name.substr(0,pos);
            if (cr.is_block_defined(block_name))
            {
                return impl_config_reader_get_option(cr.block(block_name), 
                                                     option_name.substr(pos+1),
                                                     full_option_name,
                                                     default_value);
            }
        }

        return default_value;
    }

// ----------------------------------------------------------------------------------------

    template <typename cr_type, typename T>
    typename enable_if<is_config_reader<cr_type>,T>::type get_option (
        const cr_type& cr,
        const std::string& option_name,
        T default_value
    )
    {
        return impl_config_reader_get_option(cr, option_name, option_name, default_value);
    }

// ----------------------------------------------------------------------------------------

    template <typename parser_type, typename T>
    typename disable_if<is_config_reader<parser_type>,T>::type get_option (
        const parser_type& parser,
        const std::string& option_name,
        T default_value
    )
    {
        // make sure requires clause is not broken
        DLIB_ASSERT( parser.option_is_defined(option_name) == true &&
                     parser.option(option_name).number_of_arguments() == 1,
            "\t T get_option()"
            << "\n\t option_name: " << option_name
            << "\n\t parser.option_is_defined(option_name):            " << parser.option_is_defined(option_name)
            << "\n\t parser.option(option_name).number_of_arguments(): " << parser.option(option_name).number_of_arguments()
            );

        if (parser.option(option_name))
        {
            try
            {
                default_value = string_cast<T>(parser.option(option_name).argument()); 
            }
            catch (string_cast_error&) 
            { 
                throw option_parse_error(option_name, parser.option(option_name).argument()); 
            }
        }
        return default_value;
    }

// ----------------------------------------------------------------------------------------

    template <typename parser_type, typename cr_type, typename T>
    typename disable_if<is_config_reader<parser_type>,T>::type get_option (
        const parser_type& parser,
        const cr_type& cr,
        const std::string& option_name,
        T default_value
    )
    {
        // make sure requires clause is not broken
        DLIB_ASSERT( parser.option_is_defined(option_name) == true &&
                     parser.option(option_name).number_of_arguments() == 1,
            "\t T get_option()"
            << "\n\t option_name: " << option_name
            << "\n\t parser.option_is_defined(option_name):            " << parser.option_is_defined(option_name)
            << "\n\t parser.option(option_name).number_of_arguments(): " << parser.option(option_name).number_of_arguments()
            );

        if (parser.option(option_name))
            return get_option(parser, option_name, default_value); 
        else
            return get_option(cr, option_name, default_value);
    }

// ----------------------------------------------------------------------------------------

    template <typename parser_type, typename cr_type, typename T>
    typename disable_if<is_config_reader<parser_type>,T>::type get_option (
        const cr_type& cr,
        const parser_type& parser,
        const std::string& option_name,
        T default_value
    )
    {
        // make sure requires clause is not broken
        DLIB_ASSERT( parser.option_is_defined(option_name) == true &&
                     parser.option(option_name).number_of_arguments() == 1,
            "\t T get_option()"
            << "\n\t option_name: " << option_name
            << "\n\t parser.option_is_defined(option_name):            " << parser.option_is_defined(option_name)
            << "\n\t parser.option(option_name).number_of_arguments(): " << parser.option(option_name).number_of_arguments()
            );

        if (parser.option(option_name))
            return get_option(parser, option_name, default_value); 
        else
            return get_option(cr, option_name, default_value);
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <typename T>
    inline std::string get_option (
        const T& cr,
        const std::string& option_name,
        const char* default_value
    )
    {
        return get_option(cr, option_name, std::string(default_value));
    }

// ----------------------------------------------------------------------------------------

    template <typename T, typename U>
    inline std::string get_option (
        const T& parser,
        const U& cr,
        const std::string& option_name,
        const char* default_value
    )
    {
        return get_option(parser, cr, option_name, std::string(default_value));
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_GET_OPTiON_H__

