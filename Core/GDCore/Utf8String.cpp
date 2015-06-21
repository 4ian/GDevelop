/*
 * GDevelop Core
 * Copyright 2015 Victor Levasseur (victorlevasseur52@gmail.com).
 * This project is released under the MIT License.
 */

#include "GDCore/Utf8String.h"

#include "GDCore/Utf8Tools.h"
#include <SFML/System/String.hpp>

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include <wx/string.h>
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

std::size_t String::size() const
{
    return StrLength(m_string);
}

String::Iterator String::begin()
{
    return String::Iterator(m_string.begin());
}

String::ConstIterator String::begin() const
{
    return String::ConstIterator(m_string.cbegin());
}

String::Iterator String::end()
{
    return String::Iterator(m_string.end());
}

String::ConstIterator String::end() const
{
    return String::ConstIterator(m_string.end());
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

String String::substr( std::size_t start, std::size_t length ) const
{
    String str;
    str.m_string = SubStr(m_string, start, length);
    return str;
}

std::size_t String::find( const String &search, std::size_t pos ) const
{
    return gd::utf8::Find(m_string, search.m_string, pos);
}

std::size_t String::rfind( const String &search, std::size_t pos ) const
{
    return gd::utf8::RFind(m_string, search.m_string, pos);
}

bool String::operator==(const String &other) const
{
    return (m_string == other.m_string);
}

String String::operator+(const String &other) const
{
    String str;
    str.m_string = m_string + other.m_string;
    return str;
}

String& String::operator+=(const String &other)
{
    m_string += other.m_string;
    return *this;
}

char32_t String::operator[](const std::size_t position) const
{
    ConstIterator it = begin();
    std::advance(it, position);
    return *it;
}

}

}