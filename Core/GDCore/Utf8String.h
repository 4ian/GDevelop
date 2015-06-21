/*
 * GDevelop Core
 * Copyright 2015 Victor Levasseur (victorlevasseur52@gmail.com).
 * This project is released under the MIT License.
 */

#ifndef GDCORE_UTF8_STRING_H
#define GDCORE_UTF8_STRING_H

#include <iterator>
#include <string>
#include <SFML/System/String.hpp>

#include "GDCore/Utf8Tools.h"
#include "GDCore/Utf8/utf8.h"

#define GD_U8(x) gd::utf8::String::FromUTF8String(u8##x)
#define GD_LOC(x) gd::utf8::String::FromLocale(##x)

namespace sf {class String;};
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
class wxString;
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
    template<class ValueType>
    friend class StringIterator;

public:

    template<class ValueType, class StringType, class InternalIterator>
    class GD_CORE_API StringIterator : public std::iterator<std::bidirectional_iterator_tag, ValueType, std::size_t>
    {
        friend class String;

    public:
        StringIterator() : str(nullptr), strIt() {};
        StringIterator(const StringIterator<ValueType, StringType, InternalIterator> &other) : str(other.str), strIt(other.strIt) {};
        StringIterator<ValueType, StringType, InternalIterator>& operator=(const StringIterator<ValueType, StringType, InternalIterator> &other) { str = other.str; strIt = other.strIt; };

        ValueType operator*() {return ::utf8::peek_next(strIt, str->m_string.cend());};

        StringIterator<ValueType, StringType, InternalIterator>& operator++() {::utf8::next(strIt, str->m_string.cend()); return *this;};
        StringIterator<ValueType, StringType, InternalIterator> operator++(int) {StringIterator<ValueType, StringType, InternalIterator> tmp(*this); operator++(); return tmp;};
        StringIterator<ValueType, StringType, InternalIterator>& operator--() {::utf8::prior(strIt, str->m_string.cbegin()); return *this;};
        StringIterator<ValueType, StringType, InternalIterator> operator--(int) {StringIterator<ValueType, StringType, InternalIterator> tmp(*this); operator--(); return tmp;};
        
        bool operator==(const StringIterator<ValueType, StringType, InternalIterator> &other) {return ((str == other.str) && (strIt == other.strIt));};
        bool operator!=(const StringIterator<ValueType, StringType, InternalIterator> &other) {return !operator==(other);};

    private:
        StringIterator(StringType &str, InternalIterator strIt) : str(&str), strIt(strIt) {};
        StringType *str;
        InternalIterator strIt;

    };


    typedef StringIterator<char32_t, String, std::string::iterator> Iterator;
    typedef StringIterator<const char32_t, const String, std::string::const_iterator> ConstIterator;

    /**
     * Constructs an empty string.
     */
    String();

    /**
     * Constructs a string from an sf::String.
     */
    String(const sf::String &string);

    /**
     * Returns the string's length.
     */
    std::size_t GetLength() const;

    /**
     * Get a beginning iterator.
     */
    String::Iterator Begin();

    /**
     * Get a constant beginning iterator.
     */
    String::ConstIterator Begin() const;

    /**
     * Get a ending iterator.
     */
    String::Iterator End();

    /**
     * Get a constant ending iterator.
     */
    String::ConstIterator End() const;

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
    operator sf::String() const { return ToSfString(); }

    #if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
    /**
     * Returns a String created from a wxString.
     */
    static String FromWxString( const wxString &wxStr);

    /**
     * Returns a wxString from the current string.
     */
    wxString ToWxString() const;
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
     * Returns a sub-string starting from "start" and with length "length".
     */
    String SubString( std::size_t start, std::size_t length ) const;

    /**
     * Returns the position of the first occurence of "search" starting from "pos".
     */
    std::size_t Find( const String &search, std::size_t pos ) const;

    /**
     * Returns the position of the last occurence starting before "pos".
     */
    std::size_t RFind( const String &search, std::size_t pos ) const;

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
    char32_t operator[](const std::size_t position) const;

private:
    std::string m_string; ///< Internal container

};

}

}

#endif
