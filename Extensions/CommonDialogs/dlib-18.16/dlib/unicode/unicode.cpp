// Copyright (C) 2008 Keita Mochizuki, Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_UNICODe_CPp_
#define DLIB_UNICODe_CPp_
#include "unicode.h"
#include <cwchar>
#include "../string.h"
#include <vector>

namespace dlib
{

// ----------------------------------------------------------------------------------------

    static const unichar SURROGATE_FIRST_TOP = 0xD800;
    static const unichar SURROGATE_SECOND_TOP = 0xDC00;
    static const unichar SURROGATE_CLEARING_MASK = 0x03FF;
    static const unichar SURROGATE_TOP = SURROGATE_FIRST_TOP;
    static const unichar SURROGATE_END = 0xE000;
    static const unichar SMP_TOP = 0x10000;
    static const int VALID_BITS = 10;

// ----------------------------------------------------------------------------------------

    template <typename T> bool is_surrogate(T ch)
    {
        return (zero_extend_cast<unichar>(ch) >= SURROGATE_TOP && 
                zero_extend_cast<unichar>(ch) < SURROGATE_END);
    }

// ----------------------------------------------------------------------------------------

    template <typename T> unichar surrogate_pair_to_unichar(T first, T second)
    {
        return ((first & SURROGATE_CLEARING_MASK) << VALID_BITS) | ((second & SURROGATE_CLEARING_MASK) + SMP_TOP);
    }
    //110110 0000000000
    //110111 0000000000

// ----------------------------------------------------------------------------------------

    void unichar_to_surrogate_pair(unichar input, unichar &first, unichar &second)
    {
        first = ((input - SMP_TOP) >> VALID_BITS) | SURROGATE_FIRST_TOP;
        second = (input & SURROGATE_CLEARING_MASK) | SURROGATE_SECOND_TOP;
    }

// ----------------------------------------------------------------------------------------

    template <int N> void wstr2ustring_t(const wchar_t *src, size_t src_len, ustring &dest);

    template <> void wstr2ustring_t<4>(const wchar_t *src, size_t , ustring &dest)
    {
        dest.assign((const unichar *)(src));
    }

    template <> void wstr2ustring_t<2>(const wchar_t *src, size_t src_len, ustring &dest)
    {
        size_t wlen = 0;
        for (size_t i = 0; i < src_len; i++)
        {
            is_surrogate(src[i]) ? i++, wlen++ : wlen++;
        }
        dest.resize(wlen);
        for (size_t i = 0, ii = 0; ii < src_len; ++i)
        {
            if (is_surrogate(src[ii]))
            {
                dest[i] = surrogate_pair_to_unichar(src[ii], src[ii+1]);
                ii += 2;
            }else
            {
                dest[i] = zero_extend_cast<unichar>(src[ii]);
                ii++;
            }
        }
    }

// ----------------------------------------------------------------------------------------

    const ustring convert_wstring_to_utf32(const std::wstring &src)
    {
        ustring dest;
        wstr2ustring_t<sizeof(wchar_t)>(src.c_str(), src.size(), dest);
        return dest;
    }

// ----------------------------------------------------------------------------------------

    template <int N> struct ustring2wstr
    {
    };

    // for the environment of sizeof(wchar_t) == 2 (i.e. Win32)
    template <> struct ustring2wstr<2>
    {
        wchar_t *wstr;
        size_t wlen;
        ustring2wstr(const ustring &src){
            wlen = 0;
            for (size_t i = 0; i < src.length(); ++i)
            {
                if (src[i] < SMP_TOP) wlen++;
                else wlen += 2;
            }
            wstr = new wchar_t[wlen+1];
            wstr[wlen] = L'\0';

            size_t wi = 0;
            for (size_t i = 0; i < src.length(); ++i)
            {
                if (src[i] < SMP_TOP)
                {
                    wstr[wi++] = (wchar_t)src[i];
                }else
                {
                    unichar high, low;
                    unichar_to_surrogate_pair(src[i], high, low);
                    wstr[wi++] = (wchar_t)high;
                    wstr[wi++] = (wchar_t)low;
                }
            }
        }
        ~ustring2wstr()
        {
            delete[] wstr;
        }
    };

    // for the environment of sizeof(wchar_t) == 4 (i.e. Unix gcc)
    template <> struct ustring2wstr<4>
    {
        const wchar_t *wstr;
        size_t wlen;
        ustring2wstr(const ustring &src){
            wstr = (const wchar_t *)(src.c_str());
            wlen = src.size();
        }
    };

// ----------------------------------------------------------------------------------------

    const std::wstring convert_utf32_to_wstring(const ustring &src)
    {
        ustring2wstr<sizeof(wchar_t)> conv(src);
        std::wstring dest(conv.wstr);
        return dest;
    }

// ----------------------------------------------------------------------------------------

    const std::wstring convert_mbstring_to_wstring(const std::string &src)
    {
        std::vector<wchar_t> wstr(src.length()+5);
        std::mbstowcs(&wstr[0], src.c_str(), src.length()+1);
        return std::wstring(&wstr[0]);
    }

// ----------------------------------------------------------------------------------------

    const std::string convert_wstring_to_mbstring(const std::wstring &src)
    {
        using namespace std;
        std::string str;
        str.resize((src.length() + 1) * MB_CUR_MAX);
        wcstombs(&str[0], src.c_str(), str.size());
        return std::string(&str[0]);
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_UNICODe_CPp_

