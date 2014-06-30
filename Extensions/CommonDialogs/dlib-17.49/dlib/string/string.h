// Copyright (C) 2006  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_STRINg_
#define DLIB_STRINg_ 

#include "string_abstract.h"
#include <sstream>
#include "../algs.h"
#include <string>
#include <iostream>
#include <iomanip>
#include "../error.h"
#include "../assert.h"
#include "../uintn.h"
#include <cctype>
#include <algorithm>
#include <vector>
#include "../enable_if.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename charT,
        typename traits,
        typename alloc
        >
    inline const typename disable_if<is_same_type<charT,char>,std::string>::type narrow (
        const std::basic_string<charT,traits,alloc>& str
    )
    {
        std::string temp;
        temp.reserve(str.size());
        std::string::size_type i;
        for (i = 0; i < str.size(); ++i)
        {
            if (zero_extend_cast<unsigned long>(str[i]) > 255)
                temp += ' ';
            else
                temp += zero_extend_cast<char>(str[i]);
        }
        return temp;
    }

    template <
        typename charT,
        typename traits,
        typename alloc
        >
    inline const typename enable_if<is_same_type<charT,char>,std::string>::type narrow (
        const std::basic_string<charT,traits,alloc>& str
    )
    { 
        return str;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename traits,
        typename alloc
        >
    const std::basic_string<char,traits,alloc> tolower (
        const std::basic_string<char,traits,alloc>& str
    )
    {
        std::basic_string<char,traits,alloc> temp;

        temp.resize(str.size());

        for (typename std::basic_string<char,traits,alloc>::size_type i = 0; i < str.size(); ++i)
            temp[i] = (char)std::tolower(str[i]);

        return temp;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename traits,
        typename alloc
        >
    const std::basic_string<char,traits,alloc> toupper (
        const std::basic_string<char,traits,alloc>& str
    )
    {
        std::basic_string<char,traits,alloc> temp;

        temp.resize(str.size());

        for (typename std::basic_string<char,traits,alloc>::size_type i = 0; i < str.size(); ++i)
            temp[i] = (char)std::toupper(str[i]);

        return temp;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename traits,
        typename alloc
        >
    bool strings_equal_ignore_case (
        const std::basic_string<char,traits,alloc>& str1,
        const std::basic_string<char,traits,alloc>& str2
    )
    {
        if (str1.size() != str2.size())
            return false;

        for (typename std::basic_string<char,traits,alloc>::size_type i = 0; i < str1.size(); ++i)
        {
            if (std::tolower(str1[i]) != std::tolower(str2[i]))
                return false;
        }

        return true;
    }

    template <
        typename traits,
        typename alloc
        >
    bool strings_equal_ignore_case (
        const std::basic_string<char,traits,alloc>& str1,
        const char* str2
    )
    {
        typename std::basic_string<char,traits,alloc>::size_type i;
        for (i = 0; i < str1.size(); ++i)
        {
            // if we hit the end of str2 then the strings aren't the same length
            if (str2[i] == '\0')
                return false;

            if (std::tolower(str1[i]) != std::tolower(str2[i]))
                return false;
        }

        // This happens when str2 is longer than str1
        if (str2[i] != '\0')
            return false;

        return true;
    }

    template <
        typename traits,
        typename alloc
        >
    bool strings_equal_ignore_case (
        const char* str1,
        const std::basic_string<char,traits,alloc>& str2
    )
    {
        return strings_equal_ignore_case(str2, str1);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename traits,
        typename alloc
        >
    bool strings_equal_ignore_case (
        const std::basic_string<char,traits,alloc>& str1,
        const std::basic_string<char,traits,alloc>& str2,
        unsigned long num
    )
    {
        if (str1.size() != str2.size() && (str1.size() < num || str2.size() < num))
            return false;

        for (typename std::basic_string<char,traits,alloc>::size_type i = 0; i < str1.size() && i < num; ++i)
        {
            if (std::tolower(str1[i]) != std::tolower(str2[i]))
                return false;
        }

        return true;
    }

    template <
        typename traits,
        typename alloc
        >
    bool strings_equal_ignore_case (
        const std::basic_string<char,traits,alloc>& str1,
        const char* str2,
        unsigned long num
    )
    {
        typename std::basic_string<char,traits,alloc>::size_type i;
        for (i = 0; i < str1.size() && i < num; ++i)
        {
            // if we hit the end of str2 then the strings aren't the same length
            if (str2[i] == '\0')
                return false;

            if (std::tolower(str1[i]) != std::tolower(str2[i]))
                return false;
        }

        return true;
    }

    template <
        typename traits,
        typename alloc
        >
    bool strings_equal_ignore_case (
        const char* str1,
        const std::basic_string<char,traits,alloc>& str2,
        unsigned long num
    )
    {
        return strings_equal_ignore_case(str2, str1, num);
    }

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
    )
    {
        std::ostringstream sout;
        sout << item;
        if (!sout)
            throw cast_to_string_error();
        return sout.str();
    }

    // don't declare this if we are using mingw because it apparently doesn't
    // support iostreams with wchar_t?
#if !(defined(__MINGW32__) && (__GNUC__ < 4))
    template <
        typename T
        >
    const std::wstring cast_to_wstring (
        const T& item 
    )
    {
        std::basic_ostringstream<wchar_t> sout;
        sout << item;
        if (!sout)
            throw cast_to_string_error();
        return sout.str();
    }
#endif

// ----------------------------------------------------------------------------------------

    inline std::string pad_int_with_zeros (
        int i,
        unsigned long width = 6
    )
    {
        std::ostringstream sout;
        sout << std::setw(width) << std::setfill('0') << i;
        return sout.str();
    }

// ----------------------------------------------------------------------------------------

    class string_cast_error : public error
    {
    public:
        string_cast_error(const std::string& str):
            error(ESTRING_CAST,"string cast error: invalid string = '" + str + "'") {}
    };

    template <
        typename T
        >
    struct string_cast_helper
    {
        template < typename charT, typename traits, typename alloc >
        static const T cast (
            const std::basic_string<charT,traits,alloc>& str
        )
        {
            using namespace std;
            basic_istringstream<charT,traits,alloc> sin(str);
            T temp;
            sin >> temp;
            if (!sin) throw string_cast_error(narrow(str));
            if (sin.get() != char_traits<charT>::eof()) throw string_cast_error(narrow(str));   
            return temp;
        }
    };

    template <typename C, typename T, typename A>
    struct string_cast_helper<std::basic_string<C,T,A> >
    {
        template < typename charT, typename traits, typename alloc >
        static const std::basic_string<C,T,A> cast (
            const std::basic_string<charT,traits,alloc>& str
        )
        {
            std::basic_string<C,T,A> temp;
            temp.resize(str.size());
            for (unsigned long i = 0; i < str.size(); ++i)
                temp[i] = zero_extend_cast<C>(str[i]);
            return temp;
        }
    };

    template <>
    struct string_cast_helper<bool>
    {
        template < typename charT, typename traits, typename alloc >
        static bool cast (
            const std::basic_string<charT,traits,alloc>& str
        )
        {
            using namespace std;
            if (str.size() == 1 && str[0] == '1')
                return true;
            if (str.size() == 1 && str[0] == '0')
                return false;
            if (tolower(narrow(str)) == "true")
                return true;
            if (tolower(narrow(str)) == "false")
                return false;

            throw string_cast_error(narrow(str));
        }
    };

#define DLIB_STRING_CAST_INTEGRAL(type)                             \
    template <>                                                     \
    struct string_cast_helper<type>                                 \
    {                                                               \
        template < typename charT, typename traits, typename alloc> \
        static type cast (                                    \
            const std::basic_string<charT,traits,alloc>& str        \
        )                                                           \
        {                                                           \
            using namespace std;                                    \
            basic_istringstream<charT,traits,alloc> sin(str);       \
            type temp;                                              \
            if (str.size() > 2 && str[0] == _dT(charT,'0') && str[1] == _dT(charT,'x'))   \
                sin >> hex >> temp;                                 \
            else                                                    \
                sin >> temp;                                        \
            if (!sin) throw string_cast_error(narrow(str));                 \
            if (sin.get() != char_traits<charT>::eof()) throw string_cast_error(narrow(str));     \
            return temp;                                            \
        }                                                           \
    };

    DLIB_STRING_CAST_INTEGRAL(unsigned short)
    DLIB_STRING_CAST_INTEGRAL(short)
    DLIB_STRING_CAST_INTEGRAL(unsigned int)
    DLIB_STRING_CAST_INTEGRAL(int)
    DLIB_STRING_CAST_INTEGRAL(unsigned long)
    DLIB_STRING_CAST_INTEGRAL(long)
    DLIB_STRING_CAST_INTEGRAL(uint64)

    template <
        typename T,
        typename charT,
        typename traits,
        typename alloc
        >
    inline const T string_cast (
        const std::basic_string<charT,traits,alloc>& str
    )
    {
        COMPILE_TIME_ASSERT(is_pointer_type<T>::value == false);
        return string_cast_helper<T>::cast(str);
    }

    template <typename T>
    inline const T string_cast (const char* str){ return string_cast<T>(std::string(str)); }
    template <typename T>
    inline const T string_cast (const wchar_t* str){ return string_cast<T>(std::wstring(str)); }

// ----------------------------------------------------------------------------------------

    class string_assign
    {
        template <
            typename charT,
            typename traits,
            typename alloc
            >
        class string_assign_helper
        {
        public:
            string_assign_helper (
                const std::basic_string<charT,traits,alloc>& str_
            ) : str(str_) {}

            template <typename T>
            operator T () const
            {
                return string_cast<T>(str);
            }

        private:

            const std::basic_string<charT,traits,alloc>& str;
        };

    // -------------

        class char_assign_helper
        {
        public:
            char_assign_helper (
                const char* str_
            ) : str(str_) {}

            template <typename T>
            operator T () const
            {
                return string_cast<T>(str);
            }

        private:

            const char* str;
        };

    // -------------

        class wchar_t_assign_helper
        {
        public:
            wchar_t_assign_helper (
                const wchar_t* str_
            ) : str(str_) {}

            template <typename T>
            operator T () const
            {
                return string_cast<T>(str);
            }

        private:

            const wchar_t* str;
        };

    // -------------

    public:

        template <
            typename charT,
            typename traits,
            typename alloc
            >
        string_assign_helper<charT,traits,alloc> operator=(
            const std::basic_string<charT,traits,alloc>& str
        ) const
        {
            return string_assign_helper<charT,traits,alloc>(str);
        }

        char_assign_helper operator= (
            const char* str
        ) const 
        {
            return char_assign_helper(str);
        }

        wchar_t_assign_helper operator= (
            const wchar_t* str
        ) const 
        {
            return wchar_t_assign_helper(str);
        }
    };

    const string_assign sa = string_assign();

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
    )
    {
        DLIB_ASSERT ( first_pad < max_per_line && rest_pad < max_per_line && 
                 rest_pad >= first_pad,
                 "\tconst std::basic_string<charT,traits,alloc> wrap_string()"
                 << "\n\tfirst_pad:    " << first_pad
                 << "\n\trest_pad:     " << rest_pad
                 << "\n\tmax_per_line: " << max_per_line  );

        using namespace std;

        basic_ostringstream<charT,traits,alloc> sout;
        basic_istringstream<charT,traits,alloc> sin(str);

        for (unsigned long i = 0; i < rest_pad; ++i)
            sout << _dT(charT," ");
        const basic_string<charT,traits,alloc> pad(sout.str());
        sout.str(_dT(charT,""));

        for (unsigned long i = 0; i < first_pad; ++i)
            sout << _dT(charT," ");


        typename basic_string<charT,traits,alloc>::size_type remaining = max_per_line - rest_pad;

        basic_string<charT,traits,alloc> temp;

        sin >> temp;
        while (sin)
        {
            if (temp.size() > remaining)
            {
                if (temp.size() + rest_pad >= max_per_line)
                {
                    string::size_type i = 0;
                    for (; i < temp.size(); ++i)
                    {
                        sout << temp[i];
                        --remaining;
                        if (remaining == 0)
                        {
                            sout << _dT(charT,"\n") << pad;
                            remaining = max_per_line - rest_pad;
                        }
                    }
                }
                else
                {
                    sout << _dT(charT,"\n") << pad << temp;
                    remaining = max_per_line - rest_pad - temp.size();
                }
            }
            else if (temp.size() == remaining)
            {
                sout << temp;
                remaining = 0;
            }
            else
            {
                sout << temp;
                remaining -= temp.size();
            }

            sin >> temp;
            if (remaining == 0 && sin)
            {
                sout << _dT(charT,"\n") << pad;
                remaining = max_per_line - rest_pad;
            }
            else
            {
                sout << _dT(charT," ");
                --remaining;
            }
        }

        return sout.str();
    }

    template <
        typename charT
        >
    const std::basic_string<charT> wrap_string (
        const charT* str,
        const unsigned long first_pad,
        const unsigned long rest_pad,
        const unsigned long max_per_line = 79
    ) { return wrap_string(std::basic_string<charT>(str),first_pad,rest_pad,max_per_line); }

// ----------------------------------------------------------------------------------------

    template <
        typename charT,
        typename traits,
        typename alloc
        >
    const std::basic_string<charT,traits,alloc> ltrim (
        const std::basic_string<charT,traits,alloc>& str,
        const std::basic_string<charT,traits,alloc>& trim_chars 
    )
    {
        typedef std::basic_string<charT,traits,alloc> string;
        typename string::size_type pos = str.find_first_not_of(trim_chars);
        if (pos != string::npos)
            return str.substr(pos);
        else
            return std::basic_string<charT,traits,alloc>();
    }

    template <
        typename charT,
        typename traits,
        typename alloc
        >
    const std::basic_string<charT,traits,alloc> ltrim (
        const std::basic_string<charT,traits,alloc>& str,
        const charT* trim_chars = _dT(charT," \t\r\n")
    ) { return ltrim(str,std::basic_string<charT,traits,alloc>(trim_chars)); }

// ----------------------------------------------------------------------------------------

    template <
        typename charT,
        typename traits,
        typename alloc
        >
    const std::basic_string<charT,traits,alloc> rtrim (
        const std::basic_string<charT,traits,alloc>& str,
        const std::basic_string<charT,traits,alloc>& trim_chars 
    )
    {
        typedef std::basic_string<charT,traits,alloc> string;

        typename string::size_type pos = str.find_last_not_of(trim_chars);
        if (pos != string::npos)
            return str.substr(0,pos+1);
        else
            return std::basic_string<charT,traits,alloc>();
    }

    template <
        typename charT,
        typename traits,
        typename alloc
        >
    const std::basic_string<charT,traits,alloc> rtrim (
        const std::basic_string<charT,traits,alloc>& str,
        const charT* trim_chars = _dT(charT," \t\r\n")
    ) { return rtrim(str,std::basic_string<charT,traits,alloc>(trim_chars)); }

// ----------------------------------------------------------------------------------------

    template <
        typename charT,
        typename traits,
        typename alloc
        >
    const std::basic_string<charT,traits,alloc> trim (
        const std::basic_string<charT,traits,alloc>& str,
        const std::basic_string<charT,traits,alloc>& trim_chars 
    )
    {
        typedef std::basic_string<charT,traits,alloc> string;
        typename string::size_type lpos = str.find_first_not_of(trim_chars); 
        if (lpos != string::npos)
        {
            typename string::size_type rpos = str.find_last_not_of(trim_chars);
            return str.substr(lpos,rpos-lpos+1);
        }
        else
        {
            return std::basic_string<charT,traits,alloc>();
        }
    }

    template <
        typename charT,
        typename traits,
        typename alloc
        >
    const std::basic_string<charT,traits,alloc> trim (
        const std::basic_string<charT,traits,alloc>& str,
        const charT* trim_chars = _dT(charT," \t\r\n")
    ) { return trim(str,std::basic_string<charT,traits,alloc>(trim_chars)); }

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
    )
    {
        typedef std::basic_string<charT,traits,alloc> string;
        // if str is too big then just return str
        if (pad_length <= static_cast<long>(str.size()))
            return str;

        // make the string we will padd onto the string
        string P;
        while (P.size() < pad_length - str.size())
            P += pad_string;
        P = P.substr(0,pad_length - str.size());

        // return the padded string
        return str + P;
    }

    template <
        typename charT,
        typename traits,
        typename alloc
        >
    const std::basic_string<charT,traits,alloc> rpad (
        const std::basic_string<charT,traits,alloc>& str,
        long pad_length,
        const charT* pad_string = _dT(charT," ")
    ) { return rpad(str,pad_length,std::basic_string<charT,traits,alloc>(pad_string)); }

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
    )
    {
        typedef std::basic_string<charT,traits,alloc> string;
        // if str is too big then just return str
        if (pad_length <= static_cast<long>(str.size()))
            return str;

        // make the string we will padd onto the string
        string P;
        while (P.size() < pad_length - str.size())
            P += pad_string;
        P = P.substr(0,pad_length - str.size());

        // return the padded string
        return P + str;
    }

    template <
        typename charT,
        typename traits,
        typename alloc
        >
    const std::basic_string<charT,traits,alloc> lpad (
        const std::basic_string<charT,traits,alloc>& str,
        long pad_length,
        const charT* pad_string = _dT(charT," ")
    ) { return lpad(str,pad_length,std::basic_string<charT,traits,alloc>(pad_string)); }

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
    )
    {
        const long str_size = static_cast<long>(str.size());
        return rpad(lpad(str,(pad_length-str_size)/2 + str_size,pad_string),  
                    pad_length, 
                    pad_string);
    }

    template <
        typename charT,
        typename traits,
        typename alloc
        >
    const std::basic_string<charT,traits,alloc> pad (
        const std::basic_string<charT,traits,alloc>& str,
        long pad_length,
        const charT* pad_string = _dT(charT," ")
    ) { return pad(str,pad_length,std::basic_string<charT,traits,alloc>(pad_string)); }

// ----------------------------------------------------------------------------------------

    template <
        typename charT,
        typename traits,
        typename alloc
        >
    const std::basic_string<charT,traits,alloc> left_substr (
        const std::basic_string<charT,traits,alloc>& str,
        const std::basic_string<charT,traits,alloc>& delim 
    )
    {
        return str.substr(0,str.find_first_of(delim));
    }

    template <
        typename charT,
        typename traits,
        typename alloc
        >
    const std::basic_string<charT,traits,alloc> left_substr (
        const std::basic_string<charT,traits,alloc>& str,
        const charT* delim = _dT(charT," \n\r\t")
    )
    {
        return str.substr(0,str.find_first_of(delim));
    }

// ----------------------------------------------------------------------------------------

    template <
        typename charT,
        typename traits,
        typename alloc
        >
    const std::basic_string<charT,traits,alloc> right_substr (
        const std::basic_string<charT,traits,alloc>& str,
        const std::basic_string<charT,traits,alloc>& delim 
    )
    {
        typename std::basic_string<charT,traits,alloc>::size_type delim_pos = str.find_last_of(delim);
        if (delim_pos != std::basic_string<charT,traits,alloc>::npos)
            return str.substr(delim_pos+1);
        else
            return _dT(charT,"");
    }

    template <
        typename charT,
        typename traits,
        typename alloc
        >
    const std::basic_string<charT,traits,alloc> right_substr (
        const std::basic_string<charT,traits,alloc>& str,
        const charT* delim = _dT(charT," \n\r\t")
    )
    {
        typename std::basic_string<charT,traits,alloc>::size_type delim_pos = str.find_last_of(delim);
        if (delim_pos != std::basic_string<charT,traits,alloc>::npos)
            return str.substr(delim_pos+1);
        else
            return _dT(charT,"");
    }

// ----------------------------------------------------------------------------------------

    template <
        typename charT,
        typename traits,
        typename alloc
        >
    const std::vector<std::basic_string<charT,traits,alloc> > split (
        const std::basic_string<charT,traits,alloc>& str,
        const charT* delim = _dT(charT," \n\r\t")
    )
    {
        std::basic_string<charT,traits,alloc> temp;

        std::vector<std::basic_string<charT,traits,alloc> > res;

        for (unsigned long i = 0; i < str.size(); ++i)
        {
            // check if delim contains the character str[i]
            bool hit = false;
            const charT* d = delim;
            while (*d != '\0')
            {
                if (str[i] == *d)
                {
                    hit = true;
                    break;
                }
                ++d;
            }

            if (hit)
            {
                if (temp.size() != 0)
                {
                    res.push_back(temp);
                    temp.clear();
                }
            }
            else
            {
                temp.push_back(str[i]);
            }
        }

        if (temp.size() != 0)
            res.push_back(temp);

        return res;
    }

    template <
        typename charT,
        typename traits,
        typename alloc
        >
    const std::vector<std::basic_string<charT,traits,alloc> > split (
        const std::basic_string<charT,traits,alloc>& str,
        const std::basic_string<charT,traits,alloc>& delim 
    )
    {
        return split(str,delim.c_str());
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_STRINg_

