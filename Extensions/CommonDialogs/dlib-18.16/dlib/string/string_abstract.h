// Copyright (C) 2006  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_STRINg_ABSTRACT_
#ifdef DLIB_STRINg_ABSTRACT_

#include <string>
#include <iostream>
#include <vector>
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

    class string_assign
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This is a simple tool which provides an alternative syntax for using
                the string_cast() function.  It can be understood by considering
                the following example:

                    string_assign sa;
                    int val;
                    double dval;

                    val  = sa = "1234";   // executes: val = string_cast<int>("1234");
                    dval = sa = "3.141";  // executes: val = string_cast<double>("3.141");

                After executing, val will be equal to 1234 and dval will be 3.141.
                Note that you can use string_assign to assign to any type which you could
                use with string_cast(), except for std::basic_string, assigning to this
                type is ambiguous for boring technical reasons.  But there isn't much
                point in using this tool to assign from one string to another so it doesn't 
                matter.   

                Additionally, note that there is a global instance of this object, dlib::sa. 
                So you never have to create a string_assign object yourself.  Finally, this 
                object is totally stateless and threadsafe.   
        !*/
    };

    const string_assign sa = string_assign();

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

    std::string pad_int_with_zeros (
        int i,
        unsigned long width = 6
    );
    /*!
        ensures
            - converts i into a string of at least width characters in length.  If
              necessary, the string will be padded with leading zeros to get
              to width characters.
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
        const unsigned long first_pad = 0,
        const unsigned long rest_pad = 0,
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
        typename traits,
        typename alloc
        >
    bool strings_equal_ignore_case (
        const std::basic_string<char,traits,alloc>& str1,
        const std::basic_string<char,traits,alloc>& str2
    );
    /*!
        ensures
            - returns tolower(str1) == tolower(str2)
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename traits,
        typename alloc
        >
    bool strings_equal_ignore_case (
        const std::basic_string<char,traits,alloc>& str1,
        const std::basic_string<char,traits,alloc>& str2,
        unsigned long num
    );
    /*!
        ensures
            - returns tolower(str1.substr(0,num)) == tolower(str2.substr(0,num))
              (i.e. only compares the first num characters)
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
        requires
            - trim_chars == a valid null-terminated C string
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
        requires
            - trim_chars == a valid null-terminated C string
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
        requires
            - trim_chars == a valid null-terminated C string
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
        requires
            - pad_string == a valid null-terminated C string
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
        requires
            - pad_string == a valid null-terminated C string
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
        requires
            - pad_string == a valid null-terminated C string
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
        requires
            - delim == a valid null-terminated C string
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
        requires
            - delim == a valid null-terminated C string
        ensures
            - returns right_substr(str, std::basic_string<charT,traits,alloc>(delim))
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename charT,
        typename traits,
        typename alloc
        >
    std::pair<std::basic_string<charT,traits,alloc>, std::basic_string<charT,traits,alloc> > 
    split_on_first (
        const std::basic_string<charT,traits,alloc>& str,
        const charT* delim = _dT(charT, " \n\r\t")
    );
    /*!
        ensures
            - This function splits string into two parts, the split is based on the first
              occurrence of any character from delim.  
            - let delim_pos = str.find_first_of(delim)
            - if (delim_pos == std::string::npos) then
                - returns make_pair(str,"")
            - else
                - return make_pair(str.substr(0, delim_pos), str.substr(delim_pos+1));
    !*/

    template <
        typename charT,
        typename traits,
        typename alloc
        >
    std::pair<std::basic_string<charT,traits,alloc>, std::basic_string<charT,traits,alloc> > 
    split_on_first (
        const std::basic_string<charT,traits,alloc>& str,
        const std::basic_string<charT,traits,alloc>& delim 
    );
    /*!
        requires
            - delim == a valid null-terminated C string
        ensures
            - returns split_on_first(str, delim.c_str())
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename charT,
        typename traits,
        typename alloc
        >
    std::pair<std::basic_string<charT,traits,alloc>, std::basic_string<charT,traits,alloc> > 
    split_on_last (
        const std::basic_string<charT,traits,alloc>& str,
        const charT* delim = _dT(charT, " \n\r\t")
    );
    /*!
        ensures
            - This function splits string into two parts, the split is based on the last 
              occurrence of any character from delim.  
            - let delim_pos = str.find_last_of(delim)
            - if (delim_pos == std::string::npos) then
                - returns make_pair(str,"")
            - else
                - return make_pair(str.substr(0, delim_pos), str.substr(delim_pos+1));
    !*/

    template <
        typename charT,
        typename traits,
        typename alloc
        >
    std::pair<std::basic_string<charT,traits,alloc>, std::basic_string<charT,traits,alloc> > 
    split_on_last (
        const std::basic_string<charT,traits,alloc>& str,
        const std::basic_string<charT,traits,alloc>& delim 
    );
    /*!
        requires
            - delim == a valid null-terminated C string
        ensures
            - returns split_on_last(str, delim.c_str())
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename charT,
        typename traits,
        typename alloc
        >
    const std::vector<std::basic_string<charT,traits,alloc> > split (
        const std::basic_string<charT,traits,alloc>& str,
        const std::basic_string<charT,traits,alloc>& delim 
    );
    /*!
        ensures
            - Breaks the given string str into a sequence of substrings delimited
              by characters in delim and returns the results.  
            - returns a vector V such that:
                - V.size() == the number of substrings found in str.
                - for all i: V[i] == The ith substring.  Note that it will not contain
                  any delimiter characters (i.e. characters in delim).  It will also
                  never be an empty string.
                - V contains the substrings in the order in which they appear in str.
                  That is, V[0] contains the first substring, V[1] the second, and
                  so on.
    !*/

    template <
        typename charT,
        typename traits,
        typename alloc
        >
    const std::vector<std::basic_string<charT,traits,alloc> > split (
        const std::basic_string<charT,traits,alloc>& str,
        const charT* delim = _dT(charT," \n\r\t")
    );
    /*!
        requires
            - trim_chars == a valid null-terminated C string
        ensures
            - returns split(str, std::basic_string<charT,traits,alloc>(delim))
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_STRINg_ABSTRACT_

