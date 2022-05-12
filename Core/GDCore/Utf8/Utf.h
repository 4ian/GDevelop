// This is adapted from SFML (https://github.com/SFML/SFML).
// Anything not related to Ansi and UTF8 translation were striped off.

////////////////////////////////////////////////////////////
//
// SFML - Simple and Fast Multimedia Library
// Copyright (C) 2007-2016 Laurent Gomila (laurent@sfml-dev.org)
//
// This software is provided 'as-is', without any express or implied warranty.
// In no event will the authors be held liable for any damages arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it freely,
// subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented;
//    you must not claim that you wrote the original software.
//    If you use this software in a product, an acknowledgment
//    in the product documentation would be appreciated but is not required.
//
// 2. Altered source versions must be plainly marked as such,
//    and must not be misrepresented as being the original software.
//
// 3. This notice may not be removed or altered from any source distribution.
//
////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////
// References:
//
// https://www.unicode.org/
// https://www.unicode.org/Public/PROGRAMS/CVTUTF/ConvertUTF.c
// https://www.unicode.org/Public/PROGRAMS/CVTUTF/ConvertUTF.h
// https://people.w3.org/rishida/scripts/uniview/conversion
//
////////////////////////////////////////////////////////////



#ifndef GDCORE_UTF_H
#define GDCORE_UTF_H

////////////////////////////////////////////////////////////
// Headers
////////////////////////////////////////////////////////////
#include <algorithm>
#include <locale>
#include <string>
#include <cstdlib>


namespace gd
{
template <unsigned int N>
class Utf;

////////////////////////////////////////////////////////////
/// \brief Specialization of the Utf template for UTF-32
///
////////////////////////////////////////////////////////////
template <>
class Utf<32>
{
public:

    ////////////////////////////////////////////////////////////
    /// \brief Decode a single ANSI character to UTF-32
    ///
    /// This function does not exist in other specializations
    /// of sf::Utf<>, it is defined for convenience (it is used by
    /// several other conversion functions).
    ///
    /// \param input  Input ANSI character
    /// \param locale Locale to use for conversion
    ///
    /// \return Converted character
    ///
    ////////////////////////////////////////////////////////////
    template <typename In>
    static std::uint32_t decodeAnsi(In input, const std::locale& locale = std::locale())
    {
        // On Windows, GCC's standard library (glibc++) has almost
        // no support for Unicode stuff. As a consequence, in this
        // context we can only use the default locale and ignore
        // the one passed as parameter.

        #if defined(WINDOWS)

            (void)locale; // to avoid warnings

            wchar_t character = 0;
            mbtowc(&character, &input, 1);
            return static_cast<std::uint32_t>(character);

        #else

            // Get the facet of the locale which deals with character conversion
            const std::ctype<wchar_t>& facet = std::use_facet< std::ctype<wchar_t> >(locale);

            // Use the facet to convert each character of the input string
            return static_cast<std::uint32_t>(facet.widen(input));

        #endif
    }

    ////////////////////////////////////////////////////////////
    /// \brief Encode a single UTF-32 character to ANSI
    ///
    /// This function does not exist in other specializations
    /// of sf::Utf<>, it is defined for convenience (it is used by
    /// several other conversion functions).
    ///
    /// \param codepoint   Iterator pointing to the beginning of the input sequence
    /// \param output      Iterator pointing to the beginning of the output sequence
    /// \param replacement Replacement if the input character is not convertible to ANSI (use 0 to skip it)
    /// \param locale      Locale to use for conversion
    ///
    /// \return Iterator to the end of the output sequence which has been written
    ///
    ////////////////////////////////////////////////////////////
    template <typename Out>
    static Out encodeAnsi(std::uint32_t codepoint, Out output, char replacement = 0, const std::locale& locale = std::locale())
    {
        // On Windows, gcc's standard library (glibc++) has almost
        // no support for Unicode stuff. As a consequence, in this
        // context we can only use the default locale and ignore
        // the one passed as parameter.

        #if defined(WINDOWS)

            (void)locale; // to avoid warnings

            char character = 0;
            if (wctomb(&character, static_cast<wchar_t>(codepoint)) >= 0)
                *output++ = character;
            else if (replacement)
                *output++ = replacement;

            return output;

        #else

            // Get the facet of the locale which deals with character conversion
            const std::ctype<wchar_t>& facet = std::use_facet< std::ctype<wchar_t> >(locale);

            // Use the facet to convert each character of the input string
            *output++ = facet.narrow(static_cast<wchar_t>(codepoint), replacement);

            return output;

        #endif
    }
};

////////////////////////////////////////////////////////////
/// \brief Specialization of the Utf template for UTF-8
///
////////////////////////////////////////////////////////////
template <>
class Utf<8>
{
public:

    ////////////////////////////////////////////////////////////
    /// \brief Decode a single UTF-8 character
    ///
    /// Decoding a character means finding its unique 32-bits
    /// code (called the codepoint) in the Unicode standard.
    ///
    /// \param begin       Iterator pointing to the beginning of the input sequence
    /// \param end         Iterator pointing to the end of the input sequence
    /// \param output      Codepoint of the decoded UTF-8 character
    /// \param replacement Replacement character to use in case the UTF-8 sequence is invalid
    ///
    /// \return Iterator pointing to one past the last read element of the input sequence
    ///
    ////////////////////////////////////////////////////////////
    template <typename In>
    static In decode(In begin, In end, std::uint32_t& output, std::uint32_t replacement = 0)
    {
        // Some useful precomputed data
        static const int trailing[256] =
        {
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5
        };
        static const std::uint32_t offsets[6] =
        {
            0x00000000, 0x00003080, 0x000E2080, 0x03C82080, 0xFA082080, 0x82082080
        };

        // decode the character
        int trailingBytes = trailing[static_cast<std::uint8_t>(*begin)];
        if (begin + trailingBytes < end)
        {
            output = 0;
            switch (trailingBytes)
            {
                case 5: output += static_cast<std::uint8_t>(*begin++); output <<= 6;
                case 4: output += static_cast<std::uint8_t>(*begin++); output <<= 6;
                case 3: output += static_cast<std::uint8_t>(*begin++); output <<= 6;
                case 2: output += static_cast<std::uint8_t>(*begin++); output <<= 6;
                case 1: output += static_cast<std::uint8_t>(*begin++); output <<= 6;
                case 0: output += static_cast<std::uint8_t>(*begin++);
            }
            output -= offsets[trailingBytes];
        }
        else
        {
            // Incomplete character
            begin = end;
            output = replacement;
        }

        return begin;
    }

    ////////////////////////////////////////////////////////////
    /// \brief Encode a single UTF-8 character
    ///
    /// Encoding a character means converting a unique 32-bits
    /// code (called the codepoint) in the target encoding, UTF-8.
    ///
    /// \param input       Codepoint to encode as UTF-8
    /// \param output      Iterator pointing to the beginning of the output sequence
    /// \param replacement Replacement for characters not convertible to UTF-8 (use 0 to skip them)
    ///
    /// \return Iterator to the end of the output sequence which has been written
    ///
    ////////////////////////////////////////////////////////////
    template <typename Out>
    static Out encode(std::uint32_t input, Out output, std::uint8_t replacement = 0)
    {
        // Some useful precomputed data
        static const std::uint8_t firstBytes[7] =
        {
            0x00, 0x00, 0xC0, 0xE0, 0xF0, 0xF8, 0xFC
        };

        // encode the character
        if ((input > 0x0010FFFF) || ((input >= 0xD800) && (input <= 0xDBFF)))
        {
            // Invalid character
            if (replacement)
                *output++ = replacement;
        }
        else
        {
            // Valid character

            // Get the number of bytes to write
            std::size_t bytestoWrite = 1;
            if      (input <  0x80)       bytestoWrite = 1;
            else if (input <  0x800)      bytestoWrite = 2;
            else if (input <  0x10000)    bytestoWrite = 3;
            else if (input <= 0x0010FFFF) bytestoWrite = 4;

            // Extract the bytes to write
            std::uint8_t bytes[4];
            switch (bytestoWrite)
            {
                case 4: bytes[3] = static_cast<std::uint8_t>((input | 0x80) & 0xBF); input >>= 6;
                case 3: bytes[2] = static_cast<std::uint8_t>((input | 0x80) & 0xBF); input >>= 6;
                case 2: bytes[1] = static_cast<std::uint8_t>((input | 0x80) & 0xBF); input >>= 6;
                case 1: bytes[0] = static_cast<std::uint8_t> (input | firstBytes[bytestoWrite]);
            }

            // Add them to the output
            output = std::copy(bytes, bytes + bytestoWrite, output);
        }

        return output;
    }

    ////////////////////////////////////////////////////////////
    /// \brief Advance to the next UTF-8 character
    ///
    /// This function is necessary for multi-elements encodings, as
    /// a single character may use more than 1 storage element.
    ///
    /// \param begin Iterator pointing to the beginning of the input sequence
    /// \param end   Iterator pointing to the end of the input sequence
    ///
    /// \return Iterator pointing to one past the last read element of the input sequence
    ///
    ////////////////////////////////////////////////////////////
    template <typename In>
    static In next(In begin, In end)
    {
        std::uint32_t codepoint;
        return decode(begin, end, codepoint);
    }

    ////////////////////////////////////////////////////////////
    /// \brief Count the number of characters of a UTF-8 sequence
    ///
    /// This function is necessary for multi-elements encodings, as
    /// a single character may use more than 1 storage element, thus the
    /// total size can be different from (begin - end).
    ///
    /// \param begin Iterator pointing to the beginning of the input sequence
    /// \param end   Iterator pointing to the end of the input sequence
    ///
    /// \return Iterator pointing to one past the last read element of the input sequence
    ///
    ////////////////////////////////////////////////////////////
    template <typename In>
    static std::size_t count(In begin, In end)
    {
        std::size_t length = 0;
        while (begin < end)
        {
            begin = next(begin, end);
            ++length;
        }

        return length;
    }

    ////////////////////////////////////////////////////////////
    /// \brief Convert an ANSI characters range to UTF-8
    ///
    /// The current global locale will be used by default, unless you
    /// pass a custom one in the \a locale parameter.
    ///
    /// \param begin  Iterator pointing to the beginning of the input sequence
    /// \param end    Iterator pointing to the end of the input sequence
    /// \param output Iterator pointing to the beginning of the output sequence
    /// \param locale Locale to use for conversion
    ///
    /// \return Iterator to the end of the output sequence which has been written
    ///
    ////////////////////////////////////////////////////////////
    template <typename In, typename Out>
    static Out fromAnsi(In begin, In end, Out output, const std::locale& locale = std::locale())
    {
        while (begin < end)
        {
            std::uint32_t codepoint = Utf<32>::decodeAnsi(*begin++, locale);
            output = encode(codepoint, output);
        }

        return output;
    }

    ////////////////////////////////////////////////////////////
    /// \brief Convert an UTF-8 characters range to ANSI characters
    ///
    /// The current global locale will be used by default, unless you
    /// pass a custom one in the \a locale parameter.
    ///
    /// \param begin       Iterator pointing to the beginning of the input sequence
    /// \param end         Iterator pointing to the end of the input sequence
    /// \param output      Iterator pointing to the beginning of the output sequence
    /// \param replacement Replacement for characters not convertible to ANSI (use 0 to skip them)
    /// \param locale      Locale to use for conversion
    ///
    /// \return Iterator to the end of the output sequence which has been written
    ///
    ////////////////////////////////////////////////////////////
    template <typename In, typename Out>
    static Out toAnsi(In begin, In end, Out output, char replacement = 0, const std::locale& locale = std::locale())
    {
        while (begin < end)
        {
            std::uint32_t codepoint;
            begin = decode(begin, end, codepoint);
            output = Utf<32>::encodeAnsi(codepoint, output, replacement, locale);
        }

        return output;
    }
};

// Make typedefs to get rid of the template syntax
typedef Utf<8>  Utf8;
typedef Utf<32> Utf32;

} // namespace sf


#endif // GDCORE_UTF_H


////////////////////////////////////////////////////////////
/// \class sf::Utf
/// \ingroup system
///
/// Utility class providing generic functions for UTF conversions.
///
/// sf::Utf is a low-level, generic interface for counting, iterating,
/// encoding and decoding Unicode characters and strings. It is able
/// to handle ANSI and UTF-8 encodings.
///
/// sf::Utf<X> functions are all static, these classes are not meant to
/// be instantiated. All the functions are template, so that you
/// can use any character / string type for a given encoding.
///
/// It has 3 specializations:
/// \li sf::Utf<8> (typedef'd to sf::Utf8)
///
////////////////////////////////////////////////////////////
