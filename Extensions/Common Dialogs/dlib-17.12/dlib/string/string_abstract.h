// Copyright (C) 2006  Davis E. King (davisking@users.sourceforge.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_STRINg_ABSTRACT_
#ifdef DLIB_STRINg_ABSTRACT_

#include <string>
#include <iostream>
#include "../error.h"

namespace dlib
{

// ---------------------------------------------------------------------------------------- 

    class string_cast_error : public error
    {
    public:
        string_cast_error():error(ECAST_TO_STRING) {}
    };

    template <
        typename T,
        typename charT,
        typename traits,
        typename alloc
        >
    const T string_cast (
        const std::basic_string<charT,traits,alloc>& str
    );
    /*!
        requires
            - T is not a pointer type
        ensures
            - returns str converted to T
        throws
            - string_cast_error
                This exception is thrown if string_cast() is unable to convert
                str into a T.  Also, string_cast_error::info == str
    !*/

// ----------------------------------------------------------------------------------------

    class cast_to_string_error : public error
    {
    public:
        cast_to_string_error():error(ECAST_TO_STRING) {}
    };

    template <
        typename T
        >
    const std::string cast_to_string (
        const T& item 
    );
    /*!
        requires
            - T is not a pointer type
        ensures
            - returns item converted to std::string
        throws
            - cast_to_string_error
                This exception is thrown if cast_to_string() is unable to convert
                item into a std::string.  
    !*/

    template <
        typename T
        >
    const std::wstring cast_to_wstring (
        const T& item 
    );
    /*!
        requires
            - T is not a pointer type
        ensures
            - returns item converted to std::wstring
        throws
            - cast_to_string_error
                This exception is thrown if cast_to_string() is unable to convert
                item into a std::string.  
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename charT,
        typename traits,
        typename alloc
        >
    const std::string narrow (
        const std::basic_string<charT,traits,alloc>& str
    );
    /*!
        ensures
            - returns str as a std::string by converting every character in it to a char.
              Note that any characters that do not have a mapping to type char will be 
              converted to a space.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename charT,
        typename traits,
        typename alloc
        >
    const std::basic_string<charT,traits,alloc> wrap_string (
        const std::basic_string<charT,traits,alloc>& str,
        const unsigned long first_pad,
        const unsigned long rest_pad,
        const unsigned long max_per_line = 79
    );
    /*!
        requires
            - first_pad < max_per_line
            - rest_pad < max_per_line
            - rest_pad >= first_pad
        ensures
            - returns a copy of str S such that:
                - S is broken up into lines separated by the \n character.
                - The first line starts with first_pad space characters.
                - The second and all subsequent lines start with rest_pad space characters.
                - The first line is no longer than max_per_line - (rest_pad-first_pad) characters.
                - The second and all subsequent lines are no longer than max_per_line characters. 
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename traits 
        typename alloc
        >
    const std::basic_string<char,traits,alloc> tolower (
        const std::basic_string<char,traits,alloc>& str
    );
    /*!
        ensures
            - returns a copy of str S such that:
                - #S.size() == str.size()
                - #S[i] == std::tolower(str[i])
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename traits,
        typename alloc
        >
    const std::basic_string<char,traits,alloc> toupper (
        const std::basic_string<char,traits,alloc>& str
    );
    /*!
        ensures
            - returns a copy of str S such that:
                - #S.size() == str.size()
                - #S[i] == std::toupper(str[i])
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename charT,
        typename traits,
        typename alloc
        >
    const std::basic_string<charT,traits,alloc> ltrim (
        const std::basic_string<charT,traits,alloc>& str,
        const std::basic_string<charT,traits,alloc>& trim_chars 
    );
    /*!
        ensures
            - returns a copy of str with any leading trim_chars  
              from the left side of the string removed. 
    !*/

    template <
        typename charT,
        typename traits,
        typename alloc
        >
    const std::basic_string<charT,traits,alloc> ltrim (
        const std::basic_string<charT,traits,alloc>& str,
        const charT* trim_chars = _dT(charT," \t\r\n")
    );
    /*!
        ensures
            - returns ltrim(str, std::basic_string<charT,traits,alloc>(trim_chars))
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename charT,
        typename traits,
        typename alloc
        >
    const std::basic_string<charT,traits,alloc> rtrim (
        const std::basic_string<charT,traits,alloc>& str,
        const std::basic_string<charT,traits,alloc>& trim_chars 
    );
    /*!
        ensures
            - returns a copy of str with any trailing trim_chars 
              from the right side of the string removed. 
    !*/

    template <
        typename charT,
        typename traits,
        typename alloc
        >
    const std::basic_string<charT,traits,alloc> rtrim (
        const std::basic_string<charT,traits,alloc>& str,
        const charT* trim_chars = _dT(charT," \t\r\n")
    );
    /*!
        ensures
            - returns rtrim(str, std::basic_string<charT,traits,alloc>(trim_chars))
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename charT,
        typename traits,
        typename alloc
        >
    const std::basic_string<charT,traits,alloc> trim (
        const std::basic_string<charT,traits,alloc>& str,
        const std::basic_string<charT,traits,alloc>& trim_chars 
    );
    /*!
        ensures
            - returns a copy of str with any leading or trailing trim_chars 
              from the ends of the string removed. 
    !*/

    template <
        typename charT,
        typename traits,
        typename alloc
        >
    const std::basic_string<charT,traits,alloc> trim (
        const std::basic_string<charT,traits,alloc>& str,
        const charT* trim_chars = _dT(charT," \t\r\n")
    );
    /*!
        ensures
            - returns trim(str, std::basic_string<charT,traits,alloc>(trim_chars))
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename charT,
        typename traits,
        typename alloc
        >
    const std::basic_string<charT,traits,alloc> rpad (
        const std::basic_string<charT,traits,alloc>& str,
        long pad_length,
        const std::basic_string<charT,traits,alloc>& pad_string 
    );
    /*!
        ensures
            - if (pad_length <= str.size()) then
                - returns str
            - else
                - let P be a string defined as follows:
                    - P.size() == pad_length - str.size()
                    - P == (pad_string + pad_string + ... + pad_string).substr(0,pad_length - str.size())
                      (i.e. P == a string with the above specified size that contains just
                      repitions of the pad_string)
                - returns the string str + P 
    !*/

    template <
        typename charT,
        typename traits,
        typename alloc
        >
    const std::basic_string<charT,traits,alloc> rpad (
        const std::basic_string<charT,traits,alloc>& str,
        long pad_length,
        const charT* pad_string = _dT(charT," ")
    );
    /*!
        ensures
            - returns rpad(str, pad_length, std::basic_string<charT,traits,alloc>(pad_string))
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename charT,
        typename traits,
        typename alloc
        >
    const std::basic_string<charT,traits,alloc> lpad (
        const std::basic_string<charT,traits,alloc>& str,
        long pad_length,
        const std::basic_string<charT,traits,alloc>& pad_string 
    );
    /*!
        ensures
            - if (pad_length <= str.size()) then
                - returns str
            - else
                - let P be a string defined as follows:
                    - P.size() == pad_length - str.size()
                    - P == (pad_string + pad_string + ... + pad_string).substr(0,pad_length - str.size())
                      (i.e. P == a string with the above specified size that contains just
                      repitions of the pad_string)
                - returns the string P + str
    !*/

    template <
        typename charT,
        typename traits,
        typename alloc
        >
    const std::basic_string<charT,traits,alloc> lpad (
        const std::basic_string<charT,traits,alloc>& str,
        long pad_length,
        const charT* pad_string = _dT(charT," ")
    );
    /*!
        ensures
            - returns lpad(str, pad_length, std::basic_string<charT,traits,alloc>(pad_string))
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename charT,
        typename traits,
        typename alloc
        >
    const std::basic_string<charT,traits,alloc> pad (
        const std::basic_string<charT,traits,alloc>& str,
        long pad_length,
        const std::basic_string<charT,traits,alloc>& pad_string 
    );
    /*!
        ensures
            - let str_size == static_cast<long>(str.size())
            - returns rpad( lpad(str, (pad_length-str_size)/2 + str_size, pad_string),  
                            pad_length, 
                            pad_string);
    !*/

    template <
        typename charT,
        typename traits,
        typename alloc
        >
    const std::basic_string<charT,traits,alloc> pad (
        const std::basic_string<charT,traits,alloc>& str,
        long pad_length,
        const charT* pad_string = _dT(charT," ")
    );
    /*!
        ensures
            - returns pad(str, pad_length, std::basic_string<charT,traits,alloc>(pad_string))
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename charT,
        typename traits,
        typename alloc
        >
    const std::basic_string<charT,traits,alloc> left_substr (
        const std::basic_string<charT,traits,alloc>& str,
        const std::basic_string<charT,traits,alloc>& delim 
    );
    /*!
        ensures
            - let delim_pos = str.find_first_of(delim)
            - returns str.substr(0,delim_pos)
    !*/

    template <
        typename charT,
        typename traits,
        typename alloc
        >
    const std::basic_string<charT,traits,alloc> left_substr (
        const std::basic_string<charT,traits,alloc>& str,
        const charT* delim = _dT(charT," \n\r\t")
    );
    /*!
        ensures
            - returns left_substr(str, std::basic_string<charT,traits,alloc>(delim))
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename charT,
        typename traits,
        typename alloc
        >
    const std::basic_string<charT,traits,alloc> right_substr (
        const std::basic_string<charT,traits,alloc>& str,
        const std::basic_string<charT,traits,alloc>& delim 
    );
    /*!
        ensures
            - let delim_pos = str.find_last_of(delim)
            - if (delim_pos == std::string::npos) then
                - returns ""
            - else
                - returns str.substr(delim_pos+1)
    !*/

    template <
        typename charT,
        typename traits
        typename alloc
        >
    const std::basic_string<charT,traits,alloc> right_substr (
        const std::basic_string<charT,traits,alloc>& str,
        const charT* delim = _dT(charT," \n\r\t")
    );
    /*!
        ensures
            - returns right_substr(str, std::basic_string<charT,traits,alloc>(delim))
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_STRINg_ABSTRACT_

