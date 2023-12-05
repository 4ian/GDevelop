/*
 * GDevelop Core
 * Copyright 2015 Victor Levasseur (victorlevasseur52@gmail.com).
 * This project is released under the MIT License.
 */

#ifndef GDCORE_UTF8_STRING_H
#define GDCORE_UTF8_STRING_H

#include <functional>
#include <iostream>
#include <iterator>
#include <sstream>
#include <string>
#include <vector>

#include "GDCore/Utf8/utf8.h"

namespace gd
{

class String;

/**
 * \brief String represents an UTF8 encoded string.
 *
 * This class represents an UTF8 encoded string. It provides almost the same features as the STL std::string class
 * but is UTF8 aware (size() returns the number of characters, not the number of bytes for example).
 */
class GD_CORE_API String
{

public:

    using value_type = char32_t;
    using reference = char32_t&;
    using const_reference = const char32_t&;
    using pointer = char32_t*;
    using const_pointer = const char32_t*;

    using size_type = std::string::size_type;
    using difference_type = std::string::difference_type;

    static constexpr size_type npos = -1;

    template<class T>
    class GD_CORE_API StringIterator : public std::iterator<std::bidirectional_iterator_tag, String::value_type, String::difference_type>
    {
        friend class String;
        friend class StringIterator<const T>;

    public:
        StringIterator() : strIt() {};

        StringIterator(const StringIterator<T> &other) : strIt(other.strIt) {}
        template<class U> StringIterator(const StringIterator<U> &other) : strIt(other.strIt) {} //Convert from const_iterator to iterator

        StringIterator<T>& operator=(const StringIterator<T> &other) { strIt = other.strIt; return *this; }

        String::value_type operator*() {return ::utf8::unchecked::peek_next(strIt);}

        StringIterator<T>& operator++() { ::utf8::unchecked::next(strIt); return *this; }
        StringIterator<T> operator++(int) { StringIterator<T> tmp(*this); operator++(); return tmp; }
        StringIterator<T>& operator--() { ::utf8::unchecked::prior(strIt); return *this; }
        StringIterator<T> operator--(int) { StringIterator<T> tmp(*this); operator--(); return tmp; }

        bool operator==(const StringIterator<T> &other) { return (strIt == other.strIt); }
        bool operator!=(const StringIterator<T> &other) { return !operator==(other); }

        bool operator<(const StringIterator<T> &other) { return (strIt < other.strIt); }
        bool operator<=(const StringIterator<T> &other) { return (strIt <= other.strIt); }
        bool operator>(const StringIterator<T> &other) { return (strIt > other.strIt); }
        bool operator>=(const StringIterator<T> &other) { return (strIt >= other.strIt); }

        T base() const {return strIt;}

    private:
        StringIterator(T strIt) : strIt(strIt) {};
        T strIt;
    };

    using iterator = StringIterator<std::string::iterator>;
    using const_iterator = StringIterator<std::string::const_iterator>;
    using reverse_iterator = std::reverse_iterator<iterator>;
    using const_reverse_iterator = std::reverse_iterator<const_iterator>;

/**
 * \name Constructors
 * \{
 */

    /**
     * Constructs an empty string.
     */
    String();

    /**
     * Constructs a string from an array of char **representing a string encoded
     * in UTF8**.
     *
     * Useful to implicitly create a String object from a string literal.
     *
     * **Usage:**
     * \code
     * gd::String str(u8"A little sentence.");
     * \endcode
     */
    String(const char *characters);

    /**
     * Constructs a String from a std::u32string.
     *
     * **Usage:**
     *
     * \code
     * gd::String str(U"A UTF32 encoded string.");
     * \endcode
     */
    String(const std::u32string &string);

/**
 * \}
 */

/**
 * \name Assignment (implicit conversions)
 * \{
 */
    /**
     * Assign the String using a string literal (it assumes that the **string
     * literal is encoded in UTF8**).
     *
     * Usage:
     * \code
     * gd::String str;
     * str = u8"This is a test string.";
     * \endcode
     */
    String& operator=(const char *characters);

    String& operator=(const std::u32string &string);

/**
 * \}
 */

/**
 * \name Size
 * \{
 */

    /**
     * \brief Returns true if the string is empty.
     */
    bool empty() const { return m_string.size() == 0; }

    /**
     * \brief Returns the string's length.
     */
    size_type size() const;

    /**
     * \brief Returns the string's length.
     */
    size_type length() const { return size(); };

    /**
     * \brief Clear the string.
     *
     * **Iterators :** Obviously, all iterators are invalidated.
     */
    void clear() { m_string.clear(); }

    void reserve(gd::String::size_type size) { m_string.reserve(size); }

/**
 * \}
 */

/**
 * \name Iterators
 * \{
 */

    /**
     * \brief Get a beginning iterator.
     */
    String::iterator begin();

    /**
     * \brief Get a constant beginning iterator.
     */
    String::const_iterator begin() const;

    /**
     * \brief Get a ending iterator.
     */
    String::iterator end();

    /**
     * \brief Get a constant ending iterator.
     */
    String::const_iterator end() const;

/**
 * \}
 */

/**
 * \name Convert from/to numbers
 * \{
 */

    /**
     * \brief Method to create a gd::String from a number (float, double, int, ...)
     * \return a gd::String created from **value**.
     */
    template<typename T>
    static String From(T value)
    {
        static_assert(!std::is_same<T, std::string>::value, "Can't use gd::String::From with std::string.");

        std::ostringstream oss;
        oss << value;
        return gd::String(oss.str().c_str());
    }

    /**
     * \brief Method to convert the string to a number
     * \return the string converted to the type **T**
     */
    template<typename T>
    T To() const
    {
        static_assert(!std::is_same<T, std::string>::value, "Can't use gd::String::To with std::string.");

        T value;
        std::istringstream oss(m_string);
        oss >> value;
        return value;
    }

/**
 * \}
 */

/**
 * \name Conversions from other string types
 * \{
 */

    /**
     * \return a String created from a std::string encoded in the current
     * locale.
     *
     * See \ref Conversions2 for more information.
     */
    static String FromLocale( const std::string &localizedString );

    /**
     * \return a String created from a std::u32string.
     */
    static String FromUTF32( const std::u32string &string );

    /**
     * \return a String created an UTF8 encoded std::string.
     */
    static String FromUTF8( const std::string &utf8Str );

    /**
     * \return a String created from a std::wstring (UTF32 on Linux and UCS-2 on Windows)
     */
    static String FromWide( const std::wstring &wstr );

/**
 * \}
 */

/**
 * \name Conversions to other string types
 * \{
 */

    /**
     * \return a localized std::string from the current string.
     *
     * See \ref Conversions2 for more information.
     */
    std::string ToLocale() const;

    /**
     * \return a std::u32string.
     */
    std::u32string ToUTF32() const;

    /**
     * \return a UTF8 encoded std::string from the current string.
     */
    std::string ToUTF8() const;

    /**
     * \return a wide string (std::wstring) encoded in UTF32 on Linux and in UCS-2 on Windows
     * \note On Windows, this is possibly a lossy conversion.
     */
    std::wstring ToWide() const;

/**
 * \}
 */

/**
 * \name UTF8 tools
 * \{
 */

    /**
     * \return true if the string is valid.
     */
    bool IsValid() const;

    /**
     * \brief Searches the string for invalid characters and replaces them with **replacement**.
     * \return *this
     */
    String& ReplaceInvalid( value_type replacement = 0xfffd );

/**
 * \}
 */

/**
 * \name Element access / Internal string access
 * \{
 */

    /**
     * \brief Returns the code point at the specified position
     * \warning This operator has a linear complexity on the character's
     * position. You should avoid to use it in a loop and use the iterators
     * provided by this class instead.
     */
    value_type operator[]( const size_type position ) const;

    /**
     * \brief Get the raw UTF8-encoded std::string
     */
    std::string& Raw() { return m_string; }

    /**
     * \brief Get the raw UTF8-encoded std::string
     */
    const std::string& Raw() const { return m_string; }

    /**
     * \brief Get the C-string.
     */
    const char* c_str() const { return m_string.c_str(); }

/**
 * \}
 */

/**
 * \name String modifiers
 * \{
 */

    String& operator+=( const String &other );

    String& operator+=( const char *other );

    String& operator+=( value_type character );

    /**
     * \brief Add a character (from its codepoint) at the end of the String.
     *
     * **Iterators : ** All iterators may be invalidated (in particular if the
     * string is reallocated).
     */
    void push_back( value_type character );

    /**
     * \brief Remove the last character of the String.
     *
     * **Iterators : ** All iterators may be invalidated (in particular if the
     * string is reallocated).
     */
    void pop_back();

    /**
     * \brief Inserts characters right before the character at **pos**.
     *
     * \return *this
     *
     * **Iterators :** All iterators may be invalidated.
     */
    String& insert( size_type pos, const String &str );

    /**
     * \brief Replace the portion of the String between **i1** and **i2** (**i2** not
     * included) by the String **str**.
     * \return *this
     *
     * **Iterators :** All iterators may be invalidated.
     */
    String& replace( iterator i1, iterator i2, const String &str );

    /**
     * \brief Replace the portion of the String between **i1** and **i2** (**i2** not
     * included) by **n** consecutive copies of character **c**.
     * \return *this
     *
     * **Iterators :** All iterators may be invalidated.
     */
    String& replace( iterator i1, iterator i2, size_type n, const char c );

    /**
     * \brief Replace the portion of the String between **pos** and **pos** + **len**
     * (the character at **pos** + **len** is not included) with **str**.
     * \return *this
     *
     * **Iterators :** All iterators may be invalidated.
     */
    String& replace( size_type pos, size_type len, const String &str );

    /**
     * \brief Replace the portion of the String between **pos** and **pos** + **len**
     * (the character at **pos** + **len** is not included) with the character **c**.
     * \return *this
     *
     * **Iterators :** All iterators may be invalidated.
     */
    String& replace( size_type pos, size_type len, const char c );

    /**
     * \brief Search in the portion of the String between **i1** and **i2** (**i2** not
     * included) for characters matching predicate function **p** and replace them
     * by the String **str**.
     * \return *this
     *
     * **Iterators :** All iterators may be invalidated.
     */
    String& replace_if( iterator i1, iterator i2, std::function<bool(char32_t)> p, const String &str );

    /**
     * \brief Remove consecutive occurrences of the character **c** in the portion of the
     * between **i1** and **i2** (**i2** not included) to replace it by a single occurrence.
     * \return *this
     *
     * **Iterators :** All iterators may be invalidated.
     */
    String& RemoveConsecutiveOccurrences(iterator i1, iterator i2, const char c);

    /**
     * \brief Erase the characters between **first** and **last** (**last** not included).
     * \param first an iterator to the first character to remove
     * \param last an iterator to the character next to the last one to remove
     * \return an iterator pointing at the old position of the first deleted character
     */
    iterator erase( iterator first, iterator last );

    /**
     * \brief Erase the character pointed by **p**.
     * \param p an iterator pointing to the character to be erased
     * \return an interator pointing at the old position of the deleted character
     */
    iterator erase( iterator p );

    /**
     * \brief Erase the characters between the positions **pos** and **pos** + **len**
     * (**pos** + **len** not included).
     * \param pos the position of the first character to remove
     * \param len the number of characters to remove from **pos**
     */
    void erase( size_type pos = 0, size_type len = npos );

/**
 * \}
 */

/**
 * \name String operations
 * \{
 */

    /**
     * \brief Split the string with a delimiter
     * \param delimiter delimiter (an UTF32 codepoint)
     * \return a std::vector containing all the gd::String objects
     *
     * **Usage:**
     *
     * \code
     * gd::String str = u8"10;20;30;40";
     * std::vector<gd::String> splittedStr = str.Split(U';');
     * //the U prefix is mandatory to get a char32_t from the literal
     * //Now the vector contains "10", "20", "30" and "40" as gd::String objects
     * \endcode
     */
    std::vector<String> Split( value_type delimiter ) const;

    /**
     * \brief Returns the case-folded string.
     * \note This string is almost but not totally suitable for case-insensitive comparison because you have to make sure
     * that it is normalized. So, to do a case-insensitive comparison, do :
     * \code
     * str1.CaseFold().Normalize() == str2.CaseFold().Normalize()
     * \endcode
     * You can also use gd::CaseInsensitiveEquiv();
     */
    String CaseFold() const;

    /**
     * \brief Returns the string in uppercase.
     * \note Some characters that maps to multiple characters when uppercased may not be processed, e.g. the german etzett.
     */
    String UpperCase() const;

    /**
     * \brief Returns the string in lowercase.
     * \note Some characters that maps to multiple characters when lowercased may not be processed, e.g. double SS to etzett in german.
     */
    String LowerCase() const;

    /**
     * \brief Returns the string with the first letter in upper case.
     */
    String CapitalizeFirstLetter() const;

    /**
     * \brief Searches a string for a specified substring and returns a new string where all occurrences of this substring is replaced.
     * \param search The string that will be replaced by the new string.
     * \param replacement The value to replace the old substring with.
     * \param all If set to false, only the first matching substring will be replaced.
     */
    String FindAndReplace(String search, String replacement, bool all = true) const;

    /**
     * \brief Removes the specified characters (by default all the "whitespaces" and line breaks) from the beginning of the string,
     * and return the new string.
     */
    String LeftTrim(const gd::String& chars = " \t\n\v\f\r")
    {
        String trimmedString(*this);
        trimmedString.erase(0, trimmedString.find_first_not_of(chars));
        return trimmedString;
    }

    /**
     * \brief Removes the specified characters (by default all the "whitespaces" and line breaks) from the end of the string,
     * and return the new string.
     */
    String RightTrim(const gd::String& chars = " \t\n\v\f\r")
    {
        String trimmedString(*this);
        trimmedString.erase(trimmedString.find_last_not_of(chars) + 1);
        return trimmedString;
    }

    /**
     * \brief Removes the specified characters (by default all the "whitespaces" and line breaks) from the
     * beginning and the end of the string and return the new string.
     */
    String Trim(const gd::String& chars = " \t\n\v\f\r")
    {
        return LeftTrim(chars).RightTrim(chars);
    }

    /**
     * Normalization form
     */
    enum NormForm
    {
        NFD, ///< Normalization Form Decomposition: characters are decomposed by canonical equivalence, and multiple combining characters are arranged in a specific order.
        NFC, ///< Normalization Form Composition: characters are decomposed and then recomposed by canonical equivalence.
        NFKD, ///< Normalization Form Compatibility Decomposition: characters are decomposed by compatibility, and multiple combining characters are arranged in a specific order.
        NFKC, ///< Normalization Form Compatibility Composition: characters are decomposed by compatibility, then recomposed by canonical equivalence.
    };

    /**
     * Normalize the string using the normalization form **form**.
     * \return *this
     */
    String& Normalize(NormForm form = NFC);

    /**
     * Returns a sub-string starting from **start** and with length **length**.
     */
    String substr( size_type start = 0, size_type length = npos ) const;

    /**
     * \return the position of the first occurrence of **search** starting from **pos**.
     */
    size_type find( const String &search, size_type pos = 0 ) const;

    /**
     * \return the position of the first occurrence of **search** starting from **pos**.
     */
    size_type find( const char *search, size_type pos = 0 ) const;

    /**
     * \return the position of the first occurrence of **search** starting from **pos**.
     */
    size_type find( const value_type search, size_type pos = 0 ) const;

    /**
     * \return the position of the last occurrence of **search** starting before **pos**.
     */
    size_type rfind( const String &search, size_type pos = npos ) const;

    /**
     * \return the position of the last occurrence of **search** starting before **pos**.
     */
    size_type rfind( const char *search, size_type pos = npos ) const;

    /**
     * \return the position of the last occurrence of **search** starting before **pos**.
     */
    size_type rfind( const value_type &search, size_type pos = npos ) const;

    /**
     * \brief Searches the string for the first character that matches any of the characters specified in
     * its arguments.
     * \param match the characters that will be looked for in the String
     * \param startPos where to start the search
     * \return the position of the first found character
     */
    size_type find_first_of( const String &match, size_type startPos = 0 ) const;

    /**
     * \brief Searches the string for the first character that doesn't match any of the characters
     * specified in its arguments.
     * \param not_match the characters that will be looked for in the String
     * \param startPos where to start the search
     * \return the position of the first found character
     */
    size_type find_first_not_of( const String &not_match, size_type startPos = 0 ) const;

    /**
     * \brief Searches the string for the last character that matches any of the characters specified in
     * its arguments.
     * \param match the characters that will be looked for in the String
     * \param endPos where to end the search (this is the last character considered in the
     * search)
     * \return the position of the last found character
     */
    size_type find_last_of( const String &match, size_type endPos = npos ) const;

    /**
     * \brief Searches the string for the last character that doesn't match any of the characters
     * specified in its arguments.
     * \param not_match the characters that will be looked for in the String
     * \param endPos where to end the search (this is the last character considered in the
     * search)
     * \return the position of the last found character
     */
    size_type find_last_not_of( const String &not_match, size_type endPos = npos ) const;

    /**
     * \brief Compares the current string with another.
     */
    int compare( const String &other ) const;

    /**
     * \brief Do a case-insensitive search
     * \return the position of the first occurrence of **search** starting from **pos**.
     *
     * \note This method isn't very efficient as it is linear on the string size times the
     * search string size
     */
    size_type FindCaseInsensitive( const String &search, size_type pos = 0 ) const;

/**
 * \}
 */

private:
    std::string m_string; ///< Internal std::string container

};

/**
 * \name Non-member operators
 * \{
 */

/**
 * \relates String
 * \return a String containing the concatenation of lhs and rhs.
 */
String GD_CORE_API operator+(String lhs, const String &rhs);

/**
 * \relates String
 * \return a String containing the concatenation of lhs and rhs (rhs is
 * converted to gd::String assuming it's encoded in UTF8).
 */
String GD_CORE_API operator+(String lhs, const char *rhs);

/**
 * \relates String
 * \return a String containing the concatenation of lhs and rhs (lhs is
 * converted to gd::String assuming it's encoded in UTF8).
 */
String GD_CORE_API operator+(const char *lhs, const String &rhs);

const String& GD_CORE_API operator||(const String &lhs, const String &rhs);

String GD_CORE_API operator||(String lhs, const char *rhs);

/**
 * \}
 */

/**
 * \name Relational operators
 * \{
 */

///\relates String
bool GD_CORE_API operator==( const String &lhs, const String &rhs );
///\relates String
bool GD_CORE_API operator==( const String &lhs, const char *rhs );
///\relates String
bool GD_CORE_API operator==( const char *lhs, const String &rhs );

///\relates String
bool GD_CORE_API operator!=( const String &lhs, const String &rhs );
///\relates String
bool GD_CORE_API operator!=( const String &lhs, const char *rhs );
///\relates String
bool GD_CORE_API operator!=( const char *lhs, const String &rhs );

///\relates String
bool GD_CORE_API operator<( const String &lhs, const String &rhs );
///\relates String
bool GD_CORE_API operator<( const String &lhs, const char *rhs );
///\relates String
bool GD_CORE_API operator<( const char *lhs, const String &rhs );

///\relates String
bool GD_CORE_API operator<=( const String &lhs, const String &rhs );
///\relates String
bool GD_CORE_API operator<=( const String &lhs, const char *rhs );
///\relates String
bool GD_CORE_API operator<=( const char *lhs, const String &rhs );

///\relates String
bool GD_CORE_API operator>( const String &lhs, const String &rhs );
///\relates String
bool GD_CORE_API operator>( const String &lhs, const char *rhs );
///\relates String
bool GD_CORE_API operator>( const char *lhs, const String &rhs );

///\relates String
bool GD_CORE_API operator>=( const String &lhs, const String &rhs );
///\relates String
bool GD_CORE_API operator>=( const String &lhs, const char *rhs );
///\relates String
bool GD_CORE_API operator>=( const char *lhs, const String &rhs );

/**
 * \}
 */

/**
 * \name Stream operators
 * \{
 */

/**
 * \relates String
 * Outputs the string in a stream.
 * \note The string is converted to the current locale before. If you want to stream the string
 * as UTF8, do :
 * \code
 * std::cout << myString.Raw();
 * \endcode
 */
std::ostream& GD_CORE_API operator<<(std::ostream &os, const String &str);

/**
 * \relates String
 * Extracts a string from an input string assuming the stream inputs characters encoded in the
 * current locale.
 * \note The content of the string is replaced.
 */
std::istream& GD_CORE_API operator>>(std::istream &is, String &str);

/**
 * \}
 */


/**
 * \relates String
 * \param compat if true, the strings are normalized using a compatibility normalization form to remove characters special appearance.
 * \return true if the two string are equivalent (in a case-sensitive way).
 */
bool GD_CORE_API CaseSensitiveEquiv( String lhs, String rhs, bool compat = true );

/**
 * \relates String
 * \param compat if true, the strings are normalized using a compatibility normalization form to remove characters special appearance.
 * \return true if the two string are equivalent (in a case-insensitive way).
 */
bool GD_CORE_API CaseInsensitiveEquiv( const String &lhs, const String &rhs, bool compat = true );

}

namespace std
{
    /**
     * std::hash specialization for gd::String
     */
    template <> struct GD_CORE_API hash<gd::String>
    {
        size_t operator()(const gd::String & x) const
        {
            return hash<std::string>()(x.Raw());
        }
    };
}

#endif


/**
 * \class gd::String
 *
 * \section WhatIsUTF8 What is UTF8 and Unicode ?
 * (from https://en.wikipedia.org/wiki/Unicode and https://en.wikipedia.org/wiki/UTF-8)

 * Unicode is a computing industry standard for the consistent encoding, representation, and handling of text
 * expressed in most of the world's writing systems.
 * Unicode can be implemented by different character encodings. The most commonly used encodings are UTF-8, UTF-16
 * and the now-obsolete UCS-2.
 *
 * UTF-8 is a character encoding capable of encoding all possible characters, or code points, in Unicode.
 * The encoding is variable-length (not every codepoint is 1 byte long) and uses 8-bit code units. It was designed
 * for backward compatibility with ASCII.
 * UTF-8 encodes each of the 1,112,064 valid code points in the Unicode code space using one to four 8-bit bytes
 * (a group of 8 bits is known as an octet in the Unicode Standard). Code points with lower numerical values
 * (i.e., earlier code positions in the Unicode character set, which tend to occur more frequently) are encoded using
 * fewer bytes. The first 128 characters of Unicode, which correspond one-to-one with ASCII, are encoded using a
 * single octet with the same binary value as ASCII, making valid ASCII text valid UTF-8-encoded Unicode as well.
 *
 * \section Limitations Limitations
 * The String class stores internally the string as an UTF8 encoded std::string. It results in some limitations : it's
 * impossible to edit a single character with operator[]() nor at() because the new character length might not be the same.
 *
 * **The gd::String class supports almost all Unicode characters, except the ones that can't be represented as a single
 * codepoint (obviously, a codepoint can be represented by 1 to 4 bytes, as codepoints are encoded in UTF8).** For examples,
 * some special letters are composed of multiple codepoints (a letter, and the accents). Most of them can be combined into a
 * single codepoint but some can't. These are the not supported ones. See \ref Normalization.
 *
 * \section Performance Performance
 * The UTF8 encoding has the advantage to reduce the RAM consumption compared to UTF16 or UTF32 for strings using a lot
 * of latin characters. But the characters variable length brings some performance issues compared to fixed size encoding.
 * That's why the complexity of each methods is written in their documentation. For instance, the size() method is linear
 * on the string size and so is the operator[]().
 *
 * \section Conversion Conversions from/to other string types
 * The String handles implicit conversion with std::String (implicit constructor and implicit conversion
 * operator).
 *
 * **However, this is not the case with std::string** as this conversion is not often lossless (mostly on Windows).
 * You need to explicitly call gd::String::FromLocale or gd::String::FromUTF8
 * to convert a std::string to a String. However, if you want to get a String object from a string literal, you can
 * directly use the operator=() or the constructor as they are supporting const char* as argument (it assumes the string
 * literal is encoded in UTF8, so you'll need to put the u8 prefix).
 *
 * \subsection Conversions2 Conversion from/to std::string
 * \code
 * //Get a String from a std::string encoded in the current locale
 * std::string ansiStr = "Some beautiful localized characters. "; //Encoded in ANSI on Windows, UTF8 on Linux
 * gd::String str = gd::String::FromLocale(ansiStr);
 *
 * //Create a String using a string literal encoded in UTF8
 * gd::String anotherStr = u8"This is an UTF8 string";
 * //The same as gd::String anotherStr = gd::utf8::FromUTF8(u8"This is an UTF8 string");
 * //But it works only with string literals.
 *
 * gd::String finalStr = str + anotherStr; //Concatenates the two Strings
 * std::cout << finalStr.ToLocale() << std::endl //Shows "Some beautiful localized characters. This is an UTF8 string"
 * \endcode
 *
 * \section Normalization Normalization
 * This class stores Unicode strings normalized with NFC which means that all characters are combined (if they can). For example, the "à"
 * character can be written in two ways according to the Unicode norm : U+00E0 (the "à" in a single codepoint) or
 * U+0061 (the "a" letter codepoint) + U+0300 "the "`" combining accent. We say that they are canonically equivalent.
 * However, this can cause problem when comparing strings, that's why **this class normalizes the string when constructed** using
 * the **Normalization Form Composition** (all characters are combined, e.g. "à" is represented by a single codepoint).
 * If the string **is invalid when constructed, the string is not normalized** : it will be **normalized when the invalid characters
 * will be removed using gd::String::ReplaceInvalid()**.
 *
 * \section CaseInsensitiveComparison Case-insensitive comparison
 * In Unicode, uppercasing/lowercasing strings to compare them in a case-insensitive way is not recommended.
 * That's why the function gd::CaseInsensitiveEquiv exists to compare two strings in a case-insensitive way.
 */
