/*
 * GDevelop Core
 * Copyright 2015 Victor Levasseur (victorlevasseur52@gmail.com).
 * This project is released under the MIT License.
 */

#ifndef GDCORE_UTF8_STRING_H
#define GDCORE_UTF8_STRING_H

#include <iostream>
#include <iterator>
#include <string>
#include <vector>
#include <SFML/System/String.hpp>

#include "GDCore/Utf8Tools.h"
#include "GDCore/Utf8/utf8.h"

/**
 * \name Utility macros
 * \{
 */

/**
 * \relates gd::utf8::String
 * Use this macro to create a gd::utf8::String from a literal.
 * \note You don't need to add the u8 literal as it's already added by the macro.
 */
#define GD_U8(x) gd::utf8::String::FromUTF8(u8##x)

/**
 * \relates gd::utf8::String
 * Use this macro to create a gd::utf8::String from a literal encoded in the current
 * locale (ANSI on Windows, already UTF8 on Linux).
 * \note You should consider using GD_U8 to generate a gd::utf8::String from an UTF8
 * literal.
 */
#define GD_LOC(x) gd::utf8::String::FromLocale( (x) ) 

/**
 * \}
 */

namespace sf {class String;};
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
class wxString;
class wxVariant;
#endif

namespace gd
{

namespace utf8
{

class String;

/**
 * \brief String represents an UTF8 encoded string.
 * This class represents an UTF8 encoded string. It provides almost the same features as the STL std::string class
 * but is UTF8 aware (size() returns the number of characters, not the number of bytes for example).
 */
class GD_CORE_API String
{

public:

    typedef char32_t value_type;
    typedef char32_t& reference;
    typedef const char32_t& const_reference;
    typedef char32_t* pointer;
    typedef const char32_t* const_pointer;

    typedef std::string::size_type size_type;
    typedef std::string::difference_type difference_type;

    static const size_type npos = -1;

    template<class T>
    class GD_CORE_API StringIterator : public std::iterator<std::bidirectional_iterator_tag, String::value_type, String::difference_type>
    {
        friend class String;

    public:
        StringIterator() : strIt() {};
        StringIterator(const StringIterator<T> &other) : strIt(other.strIt) {}
        StringIterator<T>& operator=(const StringIterator<T> &other) { strIt = other.strIt; }

        String::value_type operator*() {return ::utf8::unchecked::peek_next(strIt);}

        StringIterator<T>& operator++() { ::utf8::unchecked::next(strIt); return *this; }
        StringIterator<T> operator++(int) { StringIterator<T> tmp(*this); operator++(); return tmp; }
        StringIterator<T>& operator--() { ::utf8::unchecked::prior(strIt); return *this; }
        StringIterator<T> operator--(int) { StringIterator<T> tmp(*this); operator--(); return tmp; }
        
        bool operator==(const StringIterator<T> &other) { return (strIt == other.strIt); }
        bool operator!=(const StringIterator<T> &other) { return !operator==(other); }

    private:
        StringIterator(T strIt) : strIt(strIt) {};
        T strIt;
    };


    typedef StringIterator<std::string::iterator> iterator;
    typedef StringIterator<std::string::const_iterator> const_iterator;
    typedef std::reverse_iterator<iterator> reverse_iterator;
    typedef std::reverse_iterator<const_iterator> const_reverse_iterator;

/**
 * \name Constructors
 * \{
 */

    /**
     * Constructs an empty string.
     */
    String();

    /**
     * Constructs a string from an array of char **representing a string encoded in UTF8**.
     *
     * Usefull to implicitly create a String object from a string literal.
     *
     * **Usage :**
     * \code
     * gd::String str(u8"A little sentence.");
     * \endcode
     */
    String(const char *characters);

    /**
     * Constructs a String from a std::u32string.
     *
     * **Usage :**
     *
     * \code
     * gd::String str(U"A UTF32 encoded string.");
     * \endcode
     */
    String(const std::u32string &string);

    /**
     * Constructs a string from an sf::String.
     */
    String(const sf::String &string);

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)

    /**
     * Constructs a string from a wxString.
     */
    String(const wxString &string);

#endif

/**
 * \}
 */

/**
 * \name Assignment (implicit conversions)
 * \{
 */
    /**
     * Assign the String using a string literal (it assumes that the **string literal is encoded
     * in UTF8**).
     *
     * Usage :
     * \code
     * gd::String str;
     * str = u8"This is a test string.";
     * \endcode
     */
    String& operator=(const char *characters);

    String& operator=(const sf::String &string);

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)

    String& operator=(const wxString &string);

#endif

/**
 * \}
 */

/**
 * \name Size
 * \{
 */

    /**
     * Returns true if the string is empty.
     */
    bool empty() const { return m_string.size() == 0; }

    /**
     * Returns the string's length.
     */
    size_type size() const;

    /**
     * Clear the string
     */
    void clear() { m_string.clear(); }

/**
 * \}
 */

/**
 * \name Iterators
 * \{
 */

    /**
     * Get a beginning iterator.
     */
    String::iterator begin();

    /**
     * Get a constant beginning iterator.
     */
    String::const_iterator begin() const;

    /**
     * Get a ending iterator.
     */
    String::iterator end();

    /**
     * Get a constant ending iterator.
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
     * Returns a String created from an integer.
     */
    static String FromInt(int value);

    /**
     * Returns a String created from a float.
     */
    static String FromFloat(float value);

    /**
     * Returns a String created from a double.
     */
    static String FromDouble(double value);

/**
 * \}
 */

/**
 * \name Conversions from other string types
 * \{
 */

    /**
     * Returns a String created from a std::string encoded in the current locale.
     *
     * See \ref Conversions2 for more information.
     */
    static String FromLocale( const std::string &localizedString );

    /**
     * Returns a String created from a sf::String (UTF32).
     *
     * See \ref Conversions1 for more information.
     */
    static String FromSfString( const sf::String &sfString );

    /**
     * Returns a String created an UTF8 encoded std::string.
     */
    static String FromUTF8( const std::string &utf8Str );

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)

    /**
     * Returns a String created from a wxString.
     *
     * See \ref Conversions1 for more information.
     */
    static String FromWxString( const wxString &wxStr);

#endif

/**
 * \}
 */

/**
 * \name Conversions to other string types
 * \{
 */

    /**
     * Returns a localized std::string from the current string.
     *
     * See \ref Conversions2 for more information.
     */
    std::string ToLocale() const;



    /**
     * Returns a sf::String from the current string.
     *
     * See \ref Conversions1 for more information.
     */
    sf::String ToSfString() const;

    /**
     * Implicit conversion operator to sf::String.
     *
     * See \ref Conversions1 for more information.
     */
    operator sf::String() const;

    /**
     * Returns a UTF8 encoded std::string from the current string.
     */
    std::string ToUTF8() const;

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)

    /**
     * Returns a wxString from the current string.
     *
     * See \ref Conversions1 for more information.
     */
    wxString ToWxString() const;

    /**
     * Implicit conversion operator to wxString.
     *
     * See \ref Conversions1 for more information.
     */
    operator wxString() const;

#endif

/**
 * \}
 */

/**
 * \name Element access / Internal string access
 * \{
 */

    /**
     * Returns the code point at the specified position
     * \warning This operator has a linear complexity on the character's position. 
     * You should avoid to use it in a loop and use the iterators provided by this
     * class instead.
     */
    value_type operator[]( const size_type position ) const;

    /**
     * Get the raw UTF8-encoded std::string
     */
    std::string& Raw() { return m_string; }

    /**
     * Get the raw UTF8-encoded std::string
     */
    const std::string& Raw() const { return m_string; }

/**
 * \}
 */

/**
 * \name String modifiers
 * \{
 */

    String& operator+=(const String &other);

    String& operator+=(const char *other);

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)

    String& operator+=(const wxString &other);

#endif

    void push_back(value_type character);

/**
 * \}
 */

/**
 * \name String operations
 * \{
 */

    /**
     * Split the string with a delimiter
     * \param delimiter delimiter (an UTF32 codepoint)
     * \return a std::vector containing all the gd::String objects
     *
     * **Usage :**
     *
     * \code
     * gd::utf8::String str = u8"10;20;30;40";
     * std::vector<gd::utf8::String> splittedStr = str.Split(U';'); //the U prefix is mandatory to get a char32_t from the literal
     * //Now the vector contains "10", "20", "30" and "40" as gd::String objects
     * \endcode
     */
    std::vector<String> Split(char32_t delimiter) const;

    /**
     * Returns a sub-string starting from "start" and with length "length".
     */
    String substr( size_type start = 0, size_type length = npos ) const;

    /**
     * Returns the position of the first occurence of "search" starting from "pos".
     */
    size_type find( const String &search, size_type pos = 0 ) const;

    /**
     * Returns the position of the last occurence starting before "pos".
     */
    size_type rfind( const String &search, size_type pos = npos ) const;

    /**
     * Compares the current string with another.
     * \todo Implement it !
     */
    int compare( const String &other ) const;

    /**
     * Test equality of two strings.
     */
    bool operator==( const String &other ) const;

    /**
     * Test equality of two strings.
     */
    bool operator==( const char *character ) const;

/**
 * \}
 */

private:
    std::string m_string; ///< Internal container

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
 * \return a String containing the concatenation of lhs and rhs (rhs is converted
 * to gd::utf8::String assuming it's encoded in UTF8).
 */
String GD_CORE_API operator+(String lhs, const char *rhs);

/**
 * \relates String
 * \return a String containing the concatenation of lhs and rhs (lhs is converted
 * to gd::utf8::String assuming it's encoded in UTF8).
 */
String GD_CORE_API operator+(const char *lhs, const String &rhs);

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)

/**
 * \relates String
 * \return a String containing the concatenation of lhs and rhs (rhs is converted
 * to String).
 */
String GD_CORE_API operator+(String lhs, const wxString &rhs);

/**
 * \relates String
 * \return a String containing the concatenation of lhs and rhs (rhs is converted
 * to String).
 */
String GD_CORE_API operator+(const wxString &lhs, const String &rhs);

#endif

/**
 * \relates String
 * Output the string in a stream.
 * \note The string is converted to the current locale before.
 */
std::ostream& GD_CORE_API operator<<(std::ostream &os, const String &str);

/**
 * \relates String
 * Extracts a string from an input string.
 * \note The content of the string is replaced.
 */
std::istream& GD_CORE_API operator>>(std::istream &is, String &str);

/**
 * \}
 */

}

typedef utf8::String String;

}

#endif


/**
 * \class gd::utf8::String
 *
 * \note Instead of gd::utf8::String, you can use gd::String which is just a typedef of gd::utf8::String.
 *
 * \section WhatIsUTF8 What is UTF8 and Unicode ?
 * (from https://en.wikipedia.org/wiki/Unicode and https://en.wikipedia.org/wiki/UTF-8)

 * Unicode is a computing industry standard for the consistent encoding, representation, and handling of text 
 * expressed in most of the world's writing systems. 
 * Unicode can be implemented by different character encodings. The most commonly used encodings are UTF-8, UTF-16 
 * and the now-obsolete UCS-2. 
 *
 * UTF-8 is a character encoding capable of encoding all possible characters, or code points, in Unicode.
 * The encoding is variable-length (not every character is 1 byte long) and uses 8-bit code units. It was designed 
 * for backward compatibility with ASCII.
 * UTF-8 encodes each of the 1,112,064 valid code points in the Unicode code space using one to four 8-bit bytes 
 * (a group of 8 bits is known as an octet in the Unicode Standard). Code points with lower numerical values 
 * (i.e., earlier code positions in the Unicode character set, which tend to occur more frequently) are encoded using 
 * fewer bytes. The first 128 characters of Unicode, which correspond one-to-one with ASCII, are encoded using a 
 * single octet with the same binary value as ASCII, making valid ASCII text valid UTF-8-encoded Unicode as well.
 *
 * \section Limitations Limitations
 * The String class stores internally the string as an UTF8 encoded std::string. This creates some limitations : it's
 * impossible to edit a single character with operator[]() nor at because the new character length might not be the same.
 *
 * \section Performance Performance
 * The UTF8 encoding has the advantage to reduce the RAM consumption compared to UTF16 or UTF32 for strings using a lot 
 * of latin characters. But the characters variable length brings some performance issues compared to fixed size encoding.
 * That's why the complexity of each methods is written in their documentation. For instance, the size() method is linear 
 * on the string size and so is the operator[]().
 *
 * \section Conversion Conversions from/to other string types
 * The String handles implicit conversion with sf::String and wxString (implicit constructor and implicit conversion 
 * operator). 
 *
 * **However, this is not the case with std::string** as this conversion is not often lossless (mostly on Windows). 
 * You need to explicitly call gd::String::FromLocale or gd::String::FromUTF8
 * to convert a std::string to a String. However, if you want to get a String object from a string literal, you can 
 * directly use the operator=() or the constructor as they are supporting const char* as argument (it assumes the string
 * literal is encoded in UTF8, so you'll need to put the u8 prefix).
 *
 * \subsection Conversions1 Implicit conversion from/to wxString and sf::String 
 * \code
 * //Get a String from sf::String
 * sf::String sfmlStr("This is a test ! ");
 * gd::utf8::String str1(sfmlStr); //Now contains "This is a test ! " encoded in UTF8
 * 
 * //Get a String from wxString
 * wxString wxStr("Another test ! ");
 * str = wxStr; //Now contains "Another test ! " encoded in UTF8
 *
 * //Get a wxString from String
 * wxString anotherWxStr = str; //anotherWxStr contains "Another test ! " correctly encoded
 * 
 * //Get a sf::String from String
 * sf::String anotherSfmlString = str; //anotherSfmlString now contains "Another test ! "
 * \endcode
 *
 * \subsection Conversions2 Conversion from/to std::string
 * \code
 * //Get a String from a std::string encoded in the current locale
 * std::string ansiStr = "Some beautiful localized characters. "; //Encoded in ANSI on Windows, UTF8 on Linux
 * gd::utf8::String str = gd::utf8::String::FromLocale(ansiStr);
 * 
 * //Create a String using a string literal encoded in UTF8
 * gd::utf8::String anotherStr = u8"This is an UTF8 string";
 * //The same as gd::utf8::String anotherStr = gd::utf8::FromUTF8(u8"This is an UTF8 string");
 * //But it works only with string literals.
 *
 * gd::utf8::String finalStr = str + anotherStr; //Concatenates the two Strings
 * std::cout << finalStr.ToLocale() << std::endl //Shows "Some beautiful localized characters. This is an UTF8 string"
 * \endcode
 */
