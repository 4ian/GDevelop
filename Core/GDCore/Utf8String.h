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
#include <SFML/System/String.hpp>

#include "GDCore/Utf8Tools.h"
#include "GDCore/Utf8/utf8.h"

#define GD_U8(x) gd::utf8::String::FromUTF8(u8##x)
#define GD_LOC(x) gd::utf8::String::FromLocale( (x) ) 

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
 * The String class stores an UTF8-encoded string.
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
     * Constructs an empty string.
     */
    String();

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
     * Returns a String created from a std::string encoded in the current locale.
     */
    static String FromLocale( const std::string &localizedString );

    /**
     * Returns a localized std::string from the current string.
     */
    std::string ToLocale() const;

    /**
     * Returns a String created from a sf::String (UTF32).
     */
    static String FromSfString( const sf::String &sfString );

    /**
     * Returns a sf::String from the current string.
     */
    sf::String ToSfString() const;

    /**
     * Implicit conversion operator to sf::String.
     */
    operator sf::String() const;

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)

    /**
     * Returns a String created from a wxString.
     */
    static String FromWxString( const wxString &wxStr);

    /**
     * Returns a wxString from the current string.
     */
    wxString ToWxString() const;

    /**
     * Implicit conversion operator to wxString.
     */
    operator wxString() const;

#endif

    /**
     * Returns a String created an UTF8 encoded std::string.
     */
    static String FromUTF8( const std::string &utf8Str );

    /**
     * Returns a UTF8 encoded std::string from the current string.
     */
    std::string ToUTF8() const;

    /**
     * Returns the code point at the 
     */
    value_type operator[](const size_type position) const;

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
     * Get the raw UTF8-encoded std::string
     */
    std::string& Raw() { return m_string; }

    /**
     * Get the raw UTF8-encoded std::string
     */
    const std::string& Raw() const { return m_string; }

    bool operator==(const String &other) const;

    String operator+(const String &other) const;
    String& operator+=(const String &other);

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)

    String operator+(const wxString &other) const;
    String& operator+=(const wxString &other);

#endif

private:
    std::string m_string; ///< Internal container

};

/**
 * Output the string in a stream.
 * \note The string is converted to the current locale before.
 */
std::ostream& operator<<(std::ostream &os, const String &str);

/**
 * Extracts a string from an input string.
 * \note The content of the string is replaced.
 */
std::istream& operator>>(std::istream &is, String &str);

}

typedef utf8::String String;

}

#endif
