// Copyright (C) 2007  Davis E. King (davis@dlib.net), and Nils Labugt
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_UNICODe_H_
#define DLIB_UNICODe_H_

#include "../uintn.h"
#include "../algs.h"
#include "unicode_abstract.h"
#include <string>
#include <cstring>

#include <fstream>

namespace dlib
{

// ----------------------------------------------------------------------------------------

    typedef uint32 unichar;

#if defined(__GNUC__) && __GNUC__ < 4 && __GNUC_MINOR__ < 4
    struct unichar_traits 
    {
        typedef dlib::unichar    char_type;
        typedef dlib::unichar    int_type;
        typedef std::streamoff   off_type;
        typedef std::streampos   pos_type;
        typedef std::mbstate_t   state_type;

        static void assign(char_type& c1, const char_type& c2) { c1 = c2; }
        static bool eq(const char_type& c1, const char_type& c2) { return c1 == c2; }
        static bool lt(const char_type& c1, const char_type& c2) { return c1 < c2; }
        static int compare(const char_type* s1, const char_type* s2, size_t n) 
        {
            for (size_t i = 0; i < n; ++i)
            {
                if (s1[i] < s2[i])
                    return -1;
                else if (s1[i] > s2[i])
                    return 1;
            }
            return 0;
        }

        static size_t length(const char_type* s)
        {
            size_t i = 0;
            while (s[i] != 0)
                ++i;
            return i;
        }

        static const char_type* find(const char_type* s, size_t n,
                                     const char_type& a)
        {
            for (size_t i = 0; i < n; ++i)
            {
                if (s[i] == a)
                {
                    return s+i;
                }
            }
            return 0;
        }

        static char_type* move(char_type* s1, const char_type* s2, size_t n)
        {
            return static_cast<char_type*>(std::memmove(s1, s2, sizeof(char_type)*n));
        }

        static char_type* copy(char_type* s1, const char_type* s2, size_t n)
        {
            for (size_t i = 0; i < n; ++i)
                s1[i] = s2[i];

            return s1;
        }

        static char_type* assign(char_type* s, size_t n, char_type a)
        {
            for (size_t i = 0; i < n; ++i)
                s[i] = a;

            return s;
        }


        static int_type not_eof(const int_type& c) 
        {
            if (!eq_int_type(c,eof()))
                return to_int_type(c);
            else
                return 0;
        }

        static char_type to_char_type(const int_type& c) { return static_cast<char_type>(c); }
        static int_type to_int_type(const char_type& c) { return zero_extend_cast<int_type>(c); }

        static bool eq_int_type(const int_type& c1, const int_type& c2) { return c1 == c2; }

        static int_type eof() { return static_cast<int_type>(EOF); }
    };

    typedef std::basic_string<unichar, unichar_traits> ustring;
#else
    typedef std::basic_string<unichar> ustring;
#endif

// ----------------------------------------------------------------------------------------

    namespace unicode_helpers
    {

        template <
            typename charT
            >
        int u8_to_u32(
            charT& result,
            std::istream& in
        )
        /*!
            ensures
                - if (there just wasn't any more data and we hit EOF) then
                    - returns 0
                - else if (we decoded another character without error) then
                    - #result == the decoded character
                    - returns the number of bytes consumed to make this character
                - else
                    - some error occurred
                    - returns -1
        !*/
        {
            int val = in.get();
            if (val == EOF)
                return 0;

            unichar ch[4];
            ch[0] = zero_extend_cast<unichar>(val);
            if ( ch[0] < 0x80 )
            {
                result = static_cast<charT>(ch[0]);
                return 1;
            }
            if ( ( ch[0] & ~0x3F ) == 0x80 )
            {
                // invalid leading byte
                return -1;
            }
            if ( ( ch[0] & ~0x1F ) == 0xC0 )
            {
                val = in.get();
                if ( val == EOF )
                    return -1;
                
                ch[1] = zero_extend_cast<unichar>(val); 
                if ( ( ch[1] & ~0x3F ) != 0x80 )
                    return -1; // invalid tail
                if ( ( ch[0] & ~0x01 ) == 0xC0 )
                    return -1; // overlong form
                ch[0] &= 0x1F;
                ch[1] &= 0x3F;
                result = static_cast<charT>(( ch[0] << 6 ) | ch[1]);
                return 2;
            }
            if ( ( ch[0] & ~0x0F ) == 0xE0 )
            {
                for ( unsigned n = 1;n < 3;n++ )
                {
                    val = in.get();
                    if ( val == EOF )
                        return -1;
                    ch[n] = zero_extend_cast<unichar>(val); 
                    if ( ( ch[n] & ~0x3F ) != 0x80 )
                        return -1; // invalid tail
                    ch[n] &= 0x3F;
                }
                ch[0] &= 0x0F;
                result = static_cast<charT>(( ch[0] << 12 ) | ( ch[1] << 6 ) | ch[2]);
                if ( result < 0x0800 )
                    return -1; // overlong form
                if ( result >= 0xD800 && result < 0xE000 )
                    return -1; // invalid character (UTF-16 surrogate pairs)
                if ( result >= 0xFDD0 && result <= 0xFDEF )
                    return -1; // noncharacter
                if ( result >= 0xFFFE )
                    return -1; // noncharacter
                return 3;
            }
            if ( ( ch[0] & ~0x07 ) == 0xF0 )
            {
                for ( unsigned n = 1;n < 4;n++ )
                {
                    val = in.get();
                    if ( val == EOF )
                        return -1;
                    ch[n] = zero_extend_cast<unichar>(val); 
                    if ( ( ch[n] & ~0x3F ) != 0x80 )
                        return -1; // invalid tail
                    ch[n] &= 0x3F;
                }
                if ( ( ch[0] ^ 0xF6 ) < 4 )
                    return -1;
                ch[0] &= 0x07;
                result  = static_cast<charT>(( ch[0] << 18 ) | ( ch[1] << 12 ) | ( ch[2] << 6 ) | ch[3]);
                if ( result < 0x10000 )
                    return -1; // overlong form
                if ( (result & 0xFFFF) >= 0xFFFE )
                    return -1; // noncharacter
                return 4;
            }
            return -1;
        }

    // ------------------------------------------------------------------------------------

        template <typename charT>
        class basic_utf8_streambuf : public std::basic_streambuf<charT>
        {
        public:
            basic_utf8_streambuf (
                std::ifstream& fin_
            ) :
                fin(fin_)
            {
                this->setg(in_buffer+max_putback, 
                     in_buffer+max_putback, 
                     in_buffer+max_putback);
            }

        protected:

            typedef typename std::basic_streambuf<charT>::int_type int_type;

            // input functions
            int_type underflow( 
            )
            {
                if (this->gptr() < this->egptr())
                {
                    return zero_extend_cast<int_type>(*this->gptr());
                }

                int num_put_back = static_cast<int>(this->gptr() - this->eback());
                if (num_put_back > max_putback)
                {
                    num_put_back = max_putback;
                }

                // copy the putback characters into the putback end of the in_buffer
                std::memmove(in_buffer+(max_putback-num_put_back), this->gptr()-num_put_back, num_put_back);


                // fill the buffer with characters
                int n = in_buffer_size-max_putback;
                int i;
                for (i = 0; i < n; ++i)
                {
                    charT ch;
                    if (unicode_helpers::u8_to_u32(ch,fin) > 0)
                    {
                        (in_buffer+max_putback)[i] = ch;
                    }
                    else
                    {
                        break;
                    }
                }

                if (i == 0)
                {
                    // an error occurred or we hit EOF
                    return EOF;
                }

                // reset in_buffer pointers
                this->setg (in_buffer+(max_putback-num_put_back),
                      in_buffer+max_putback,
                      in_buffer+max_putback+i);

                return zero_extend_cast<int_type>(*this->gptr());
            }

        private:
            std::ifstream& fin;
            static const int max_putback = 4;
            static const int in_buffer_size = 10;
            charT in_buffer[in_buffer_size];
        };
    }

// ----------------------------------------------------------------------------------------

    template <typename T>
    bool is_combining_char(
        const T ch_
    )
    {
        const unichar ch = zero_extend_cast<unichar>(ch_);
        if ( ch < 0x300 ) return false;
        if ( ch < 0x370 ) return true;

        if ( ch < 0x800 )
        {
            if ( ch < 0x483 )return false;if ( ch < 0x48A )return true;

            if ( ch < 0x591 )return false;if ( ch < 0x5D0 )
            {
                if ( ch == 0x5C0 )return false;
                if ( ch == 0x5C3 )return false;
                if ( ch == 0x5C6 )return false;
                return true;
            }
            if ( ch < 0x610 )return false;if ( ch < 0x616 )return true;
            if ( ch < 0x64B )return false;if ( ch < 0x660 )return true;

            if ( ch == 0x670 )return true;

            if ( ch < 0x6D6 )return false;if ( ch < 0x6EE )
            {
                if ( ch == 0x6DD )return false;
                if ( ch == 0x6E5 )return false;
                if ( ch == 0x6E6 )return false;
                if ( ch == 0x6E9 )return false;
                return true;
            }
            if ( ch == 0x711 )return true;

            if ( ch < 0x730 )return false;if ( ch < 0x74B )return true;
            if ( ch < 0x7A6 )return false;if ( ch < 0x7B1 )return true;
            if ( ch < 0x7EB )return false;if ( ch < 0x7F4 )return true;
            return false;
        }
        if ( ch < 0xA00 )
        {
            if ( ch < 0x901 )return false;if ( ch < 0x904 )return true;
            if ( ch < 0x93C )return false;if ( ch < 0x955 )
            {
                if ( ch == 0x93D )return false;
                if ( ch == 0x950 )return false;
                return true;
            }
            if ( ch < 0x962 )return false;if ( ch < 0x964 )return true;
            if ( ch < 0x981 )return false;if ( ch < 0x984 )return true;
            if ( ch < 0x9BC )return false;if ( ch < 0x9D8 )
            {
                if ( ch == 0x9BD )return false;
                if ( ch == 0x9CE )return false;
                return true;
            }
            if ( ch < 0x9E2 )return false;if ( ch < 0x9E4 )return true;
            return false;
        }
        if ( ch < 0xC00 )
        {
            if ( ch < 0xA01 )return false;if ( ch < 0xA04 )return true;
            if ( ch < 0xA3C )return false;if ( ch < 0xA4E )return true;
            if ( ch < 0xA70 )return false;if ( ch < 0xA72 )return true;
            if ( ch < 0xA81 )return false;if ( ch < 0xA84 )return true;
            if ( ch < 0xABC )return false;if ( ch < 0xACE )
            {
                if ( ch == 0xABD )return false;
                return true;
            }
            if ( ch < 0xAE2 )return false;if ( ch < 0xAE4 )return true;
            if ( ch < 0xB01 )return false;if ( ch < 0xB04 )return true;
            if ( ch < 0xB3C )return false;if ( ch < 0xB58 )
            {
                if ( ch == 0xB3D )return false;
                return true;
            }
            if ( ch == 0xB82 )return true;

            if ( ch < 0xBBE )return false;if ( ch < 0xBD8 )return true;

            if ( ch == 0xBF4 )return true;
            if ( ch == 0xBF8 )return true;
            return false;
        }
        if(ch < 0xE00)
        {
            if ( ch < 0xC01 )return false;if ( ch < 0xC04 )return true;
            if ( ch < 0xC3E )return false;if ( ch < 0xC57 )return true;
            if ( ch < 0xC82 )return false;if ( ch < 0xC84 )return true;
            if ( ch < 0xCBC )return false;if ( ch < 0xCD7 )
            {
                if ( ch == 0xCBD )return false;
                return true;
            }
            if ( ch < 0xCE2 )return false;if ( ch < 0xCE4 )return true;
            if ( ch < 0xD02 )return false;if ( ch < 0xD04 )return true;
            if ( ch < 0xD3E )return false;if ( ch < 0xD58 )return true;
            if ( ch < 0xD82 )return false;if ( ch < 0xD84 )return true;
            if ( ch < 0xDCA )return false;if ( ch < 0xDF4 )return true;
            return false;
        }
        if(ch < 0x1000)
        {
            if ( ch == 0xE31 )return true;

            if ( ch < 0xE34 )return false;if ( ch < 0xE3B )return true;
            if ( ch < 0xE47 )return false;if ( ch < 0xE4F )return true;

            if ( ch == 0xEB1 )return true;

            if ( ch < 0xEB4 )return false;if ( ch < 0xEBD )return true;
            if ( ch < 0xEC8 )return false;if ( ch < 0xECE )return true;
            if ( ch < 0xF18 )return false;if ( ch < 0xF1A )return true;

            if ( ch == 0xF35 )return true;
            if ( ch == 0xF37 )return true;
            if ( ch == 0xF39 )return true;

            if ( ch < 0xF3E )return false;if ( ch < 0xF40 )return true;
            if ( ch < 0xF71 )return false;if ( ch < 0xF88 )
            {
                if ( ch == 0xF85 )return false;
                return true;
            }
            if ( ch < 0xF90 )return false;if ( ch < 0xFBD )return true;

            if ( ch == 0xFC6 )return true;
            return false;
        }
        if ( ch < 0x1800 )
        {
            if ( ch < 0x102C )return false;if ( ch < 0x1040 )return true;
            if ( ch < 0x1056 )return false;if ( ch < 0x105A )return true;

            if ( ch == 0x135F )return true;

            if ( ch < 0x1712 )return false;if ( ch < 0x1715 )return true;
            if ( ch < 0x1732 )return false;if ( ch < 0x1735 )return true;
            if ( ch < 0x1752 )return false;if ( ch < 0x1754 )return true;
            if ( ch < 0x1772 )return false;if ( ch < 0x1774 )return true;
            if ( ch < 0x17B6 )return false;if ( ch < 0x17D4 )return true;

            if ( ch == 0x17DD )return true;
            return false;
        }
        if(ch < 0x2000)
        {
            if ( ch < 0x180B )return false;if ( ch < 0x180E )return true;

            if ( ch == 0x18A9 )return true;

            if ( ch < 0x1920 )return false;if ( ch < 0x193C )return true;
            if ( ch < 0x19B0 )return false;if ( ch < 0x19C1 )return true;
            if ( ch < 0x19C8 )return false;if ( ch < 0x19CA )return true;
            if ( ch < 0x1A17 )return false;if ( ch < 0x1A1C )return true;
            if ( ch < 0x1B00 )return false;if ( ch < 0x1B05 )return true;
            if ( ch < 0x1B34 )return false;if ( ch < 0x1B45 )return true;
            if ( ch < 0x1B6B )return false;if ( ch < 0x1B74 )return true;
            if ( ch < 0x1DC0 )return false;if ( ch < 0x1E00 )return true;
            return false;
        }
        if ( ch < 0x20D0 )return false;if ( ch < 0x2100 )return true;
        if ( ch < 0x302A )return false;if ( ch < 0x3030 )return true;
        if ( ch < 0x3099 )return false;if ( ch < 0x309B )return true;

        if ( ch == 0xA802 )return true;
        if ( ch == 0xA806 )return true;
        if ( ch == 0xA80B )return true;

        if ( ch < 0xA823 )return false;if ( ch < 0xA828 )return true;

        if ( ch == 0xFB1E )return true;

        if ( ch < 0xFE00 )return false;if ( ch < 0xFE10 )return true;
        if ( ch < 0xFE20 )return false;if ( ch < 0xFE30 )return true;
        if ( ch < 0x10A01 )return false;if ( ch < 0x10A10 )return true;
        if ( ch < 0x10A38 )return false;if ( ch < 0x10A40 )return true;
        if ( ch < 0x1D165 )return false;if ( ch < 0x1D16A )return true;
        if ( ch < 0x1D16D )return false;if ( ch < 0x1D173 )return true;
        if ( ch < 0x1D17B )return false;if ( ch < 0x1D183 )return true;
        if ( ch < 0x1D185 )return false;if ( ch < 0x1D18C )return true;
        if ( ch < 0x1D1AA )return false;if ( ch < 0x1D1AE )return true;
        if ( ch < 0x1D242 )return false;if ( ch < 0x1D245 )return true;
        if ( ch < 0xE0100 )return false;if ( ch < 0xE01F0 )return true;
        return false;
    }

// ----------------------------------------------------------------------------------------

    class invalid_utf8_error : public error
    {
    public:
        invalid_utf8_error():error(EUTF8_TO_UTF32) {}
    };

    inline const ustring convert_utf8_to_utf32 (
        const std::string& str
    )
    {
        using namespace unicode_helpers;
        ustring temp;
        std::istringstream sin(str);

        temp.reserve(str.size());

        int status;
        unichar ch;
        while ( (status = u8_to_u32(ch,sin)) > 0)
            temp.push_back(ch);

        if (status < 0)
            throw invalid_utf8_error();

        return temp;
    }

// ----------------------------------------------------------------------------------------

    bool is_surrogate(unichar ch);

    unichar surrogate_pair_to_unichar(unichar first, unichar second);

    void unichar_to_surrogate_pair(unichar unicode, unichar &first, unichar &second);


    const ustring convert_wstring_to_utf32 (
        const std::wstring &wstr
    );

    const std::wstring convert_utf32_to_wstring (
        const ustring &src
    );

    const std::wstring convert_mbstring_to_wstring (
        const std::string &src
    );

    const std::string convert_wstring_to_mbstring(
        const std::wstring &src
    );

// ----------------------------------------------------------------------------------------

    template <typename charT>
    class basic_utf8_ifstream : public std::basic_istream<charT>
    {
    public:

        basic_utf8_ifstream (
        ) : std::basic_istream<charT>(&buf), buf(fin) {}

        basic_utf8_ifstream (
            const char* file_name,
            std::ios_base::openmode mode = std::ios::in 
        ) : 
            std::basic_istream<charT>(&buf),
            buf(fin)
        {
            fin.open(file_name,mode);
            // make this have the same error state as fin
            this->clear(fin.rdstate());
        }

        basic_utf8_ifstream (
            const std::string& file_name,
            std::ios_base::openmode mode = std::ios::in 
        ) : 
            std::basic_istream<charT>(&buf),
            buf(fin)
        {
            fin.open(file_name.c_str(),mode);
            // make this have the same error state as fin
            this->clear(fin.rdstate());
        }

        void open(
            const std::string& file_name,
            std::ios_base::openmode mode = std::ios::in 
        )
        {
            open(file_name.c_str(),mode);
        }

        void open (
            const char* file_name,
            std::ios_base::openmode mode = std::ios::in 
        )
        {
            fin.close();
            fin.clear();
            fin.open(file_name,mode);
            // make this have the same error state as fin
            this->clear(fin.rdstate());
        }

        void close (
        )
        {
            fin.close();
            // make this have the same error state as fin
            this->clear(fin.rdstate());
        }

    private:

        std::ifstream fin;
        unicode_helpers::basic_utf8_streambuf<charT> buf;
    };

    typedef basic_utf8_ifstream<unichar> utf8_uifstream;
    typedef basic_utf8_ifstream<wchar_t> utf8_wifstream;

// ----------------------------------------------------------------------------------------

}

#ifdef NO_MAKEFILE
#include "unicode.cpp"
#endif

#endif // DLIB_UNICODe_H_

