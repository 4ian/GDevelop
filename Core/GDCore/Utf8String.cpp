/*
 * GDevelop Core
 * Copyright 2015 Victor Levasseur (victorlevasseur52@gmail.com).
 * This project is released under the MIT License.
 */

#include "GDCore/Utf8String.h"

#include <SFML/System/String.hpp>
#include "GDCore/CommonTools.h"
#include "GDCore/Utf8Tools.h"

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include <wx/string.h>
#include <wx/variant.h>
#endif

namespace gd
{

namespace utf8
{

String::String() : m_string()
{

}

String::String(const sf::String &string) : m_string()
{
    m_string = gd::utf8::FromSfString(string);
}

String::String(const std::u32string &string) : m_string()
{
    for( std::u32string::const_iterator it = string.begin(); it != string.end(); it++ )
    {
        push_back(*it);
    }
}

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)

String::String(const wxString &string) : m_string()
{
    m_string = gd::utf8::FromWxString(string);
}

#endif

String& String::operator=(const sf::String &string)
{
    m_string = gd::utf8::FromSfString(string);
    return *this;
}

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)

String& String::operator=(const wxString &string)
{
    m_string = gd::utf8::FromWxString(string);
    return *this;
}

#endif

String::size_type String::size() const
{
    return StrLength(m_string);
}

String::iterator String::begin()
{
    return String::iterator(m_string.begin());
}

String::const_iterator String::begin() const
{
    return String::const_iterator(m_string.cbegin());
}

String::iterator String::end()
{
    return String::iterator(m_string.end());
}

String::const_iterator String::end() const
{
    return String::const_iterator(m_string.end());
}

String String::FromInt(int value)
{
    String str;
    str.m_string = ToString<int>(value);
    return str;
}

String String::FromFloat(float value)
{
    String str;
    str.m_string = ToString<float>(value);
    return str;
}

String String::FromDouble(double value)
{
    String str;
    str.m_string = ToString<double>(value);
    return str;
}

String String::FromLocale( const std::string &localizedString )
{
    String str;
    str.m_string = gd::utf8::FromLocaleString(localizedString);
    return str;
}

std::string String::ToLocale() const
{
    return gd::utf8::ToLocaleString(m_string);
}

String String::FromSfString( const sf::String &sfString )
{
    String str;
    str.m_string = gd::utf8::FromSfString(sfString);
    return str;
}

sf::String String::ToSfString() const
{
    return gd::utf8::ToSfString(m_string);
}

String::operator sf::String() const
{
    return ToSfString();
}

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)

String String::FromWxString( const wxString &wxStr)
{
    String str;
    str.m_string = gd::utf8::FromWxString(wxStr);
    return str;
}

wxString String::ToWxString() const
{
    return gd::utf8::ToWxString(m_string);
}

String::operator wxString() const
{
    return ToWxString();
}

#endif

String String::FromUTF8( const std::string &utf8Str )
{
    String str;
    str.m_string = utf8Str;
    return str;
}

std::string String::ToUTF8() const
{
    return m_string;
}

std::vector<String> String::Split(char32_t delimiter) const
{
    std::vector<String> splittedStrings(1);
    String::const_iterator it = begin();

    for(; it != end(); ++it)
    {
        char32_t codepoint = *it;
        if(codepoint == delimiter) //It's the delimiter, insert a new String in the vector
        {
            splittedStrings.emplace_back();
        }
        else
        {
            splittedStrings.back().push_back(codepoint);
        }
    }

    return splittedStrings;
}

String String::substr( String::size_type start, String::size_type length ) const
{
    String str;
    str.m_string = SubStr(m_string, start, length);
    return str;
}

String::size_type String::find( const String &search, String::size_type pos ) const
{
    return gd::utf8::Find(m_string, search.m_string, pos);
}

String::size_type String::rfind( const String &search, String::size_type pos ) const
{
    return gd::utf8::RFind(m_string, search.m_string, pos);
}

bool String::operator==(const String &other) const
{
    return (m_string == other.m_string);
}

String::value_type String::operator[](const String::size_type position) const
{
    const_iterator it = begin();
    std::advance(it, position);
    return *it;
}

String& String::operator+=(const String &other)
{
    m_string += other.m_string;
    return *this;
}

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)

String& String::operator+=(const wxString &other)
{
    *this += FromWxString(other);
    return *this;
}

#endif

void String::push_back(String::value_type character)
{
    ::utf8::unchecked::append(character, std::back_inserter(m_string));
}

String GD_CORE_API operator+(String lhs, const String &rhs)
{
    lhs += rhs;
    return lhs;
}

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)

String GD_CORE_API operator+(String lhs, const wxString &rhs)
{
    lhs += String::FromWxString(rhs);
    return lhs;
}

String GD_CORE_API operator+(const wxString &lhs, const String &rhs)
{
    String str(lhs);
    str += rhs;
    return str;
}

#endif

std::ostream& GD_CORE_API operator<<(std::ostream& os, const String& str)
{
    os << str.ToLocale();

    return os;
}

std::istream& GD_CORE_API operator>>(std::istream &is, String &str)
{
    std::string extractedString;
    is >> extractedString;

    str = String::FromLocale(extractedString);

    return is;
}

}

}