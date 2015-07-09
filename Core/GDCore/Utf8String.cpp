/*
 * GDevelop Core
 * Copyright 2015 Victor Levasseur (victorlevasseur52@gmail.com).
 * This project is released under the MIT License.
 */

#include "GDCore/Utf8String.h"

#include <SFML/System/String.hpp>
#include "GDCore/CommonTools.h"

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include <wx/string.h>
#include <wx/variant.h>
#endif

namespace gd
{

namespace utf8
{

const String::size_type GD_CORE_API String::npos;

String::String() : m_string()
{

}

String::String(const char *characters) : m_string(characters)
{

}

String::String(const sf::String &string) : m_string()
{
    *this = string;
}

String::String(const std::u32string &string) : m_string()
{
    *this = string;
}

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)

String::String(const wxString &string) : m_string()
{
    *this = string;
}

#endif

String& String::operator=(const char *characters)
{
    m_string = std::string(characters);
    return *this;
}

String& String::operator=(const sf::String &string)
{
    m_string.clear();

    //In theory, an UTF8 character can be up to 6 bytes (even if the current Unicode standard,
    //the last character is 4 bytes long).
    //So, reverse the maximum possible size to avoid reallocations.
    m_string.reserve( string.getSize() * 6 );

    //Push_back all characters inside the string.
    for( sf::String::ConstIterator it = string.begin(); it != string.end(); ++it )
    {
        push_back( *it );
    }

    m_string.shrink_to_fit();

    return *this;
}

String& String::operator=(const std::u32string &string)
{
    m_string.clear();

    //In theory, an UTF8 character can be up to 6 bytes (even if the current Unicode standard,
    //the last character is 4 bytes long).
    //So, reverse the maximum possible size to avoid reallocations.
    m_string.reserve( string.size() * 6 );

    //Push_back all characters inside the string.
    for( std::u32string::const_iterator it = string.begin(); it != string.end(); ++it )
    {
        push_back( *it );
    }

    m_string.shrink_to_fit();

    return *this;
}

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)

String& String::operator=(const wxString &string)
{
    m_string =  std::string(string.ToUTF8().data());
    return *this;
}

#endif

String::size_type String::size() const
{
    return std::distance(begin(), end());
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

int String::ToInt() const
{
    return gd::ToInt(m_string);
}

String String::FromUInt(unsigned int value)
{
    String str;
    str.m_string = ToString<unsigned int>(value);
    return str;
}

unsigned int String::ToUInt() const
{
    unsigned int i;
    std::istringstream oss(m_string);
    oss >> i;
    return i;
}

String String::FromFloat(float value)
{
    String str;
    str.m_string = ToString<float>(value);
    return str;
}

int String::ToFloat() const
{
    return gd::ToFloat(m_string);
}

String String::FromDouble(double value)
{
    String str;
    str.m_string = ToString<double>(value);
    return str;
}

int String::ToDouble() const
{
    return gd::ToDouble(m_string);
}

String String::FromLocale( const std::string &localizedString )
{
#if defined(WINDOWS)
    return FromSfString(sf::String(localizedString)); //Don't need to use the current locale, on Windows, std::locale is always the C locale
#else
    if(std::locale("").name().find("UTF-8") != std::string::npos)
        FromUTF8(localizedString); //UTF8 is already the current locale
    else
        return FromSfString(sf::String(localizedString, std::locale(""))); //Use the current locale (std::locale("")) for conversion
#endif
}

std::string String::ToLocale() const
{
#if defined(WINDOWS)
    return ToSfString().toAnsiString();
#else
    if(std::locale("").name().find("UTF-8") != std::string::npos)
        return m_string; //UTF8 is already the current locale on Linux
    else
        return ToSfString().toAnsiString(std::locale("")); //Use the current locale for conversion
#endif
}

String String::FromUTF32( const std::u32string &string )
{
    String str;
    str = string; //operator=(const std::u32string&)

    return str;
}

std::u32string String::ToUTF32() const
{
    std::u32string u32str;
    for( const_iterator it = begin(); it != end(); ++it )
    {
        u32str.push_back( *it );
    }

    return u32str;
}

String String::FromSfString( const sf::String &sfString )
{
    return String(sfString);
}

sf::String String::ToSfString() const
{
    sf::String str;
    for(const_iterator it = begin(); it != end(); ++it)
        str += sf::String(static_cast<sf::Uint32>(*it));

    return str;
}

String::operator sf::String() const
{
    return ToSfString();
}

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)

String String::FromWxString( const wxString &wxStr)
{
    return String(wxStr);
}

wxString String::ToWxString() const
{
    return wxString::FromUTF8(m_string.c_str());
}

String::operator wxString() const
{
    return ToWxString();
}

#endif

String String::FromUTF8( const std::string &utf8Str )
{
    return String(utf8Str.c_str());
}

std::string String::ToUTF8() const
{
    return m_string;
}

String::value_type String::operator[]( const String::size_type position ) const
{
    const_iterator it = begin();
    std::advance(it, position);
    return *it;
}

String& String::operator+=( const String &other )
{
    m_string += other.m_string;
    return *this;
}

String& String::operator+=( const char *other )
{
    *this += gd::String(other);
    return *this;
}

String& String::operator+=( char32_t character )
{
    push_back(character);
    return *this;
}

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)

String& String::operator+=( const wxString &other )
{
    *this += gd::String(other);
    return *this;
}

#endif

void String::push_back( String::value_type character )
{
    ::utf8::unchecked::append(character, std::back_inserter(m_string));
}

void String::pop_back()
{
    m_string.erase((--end()).base(), end().base());
}

String& String::insert( size_type pos, const String &str )
{
    iterator it = begin();
    std::advance(it, pos);

    //Use the real position as bytes using the std::string::iterators
    m_string.insert( std::distance(m_string.begin(), it.base()), str.m_string );

    return *this;
}

String& String::replace( iterator i1, iterator i2, const String &str )
{
    m_string.replace(i1.base(), i2.base(), str.m_string);

    return *this;
}

String& String::replace( String::size_type pos, String::size_type len, const String &str )
{
    if(pos > size())
        throw std::out_of_range("[gd::String::replace] starting pos greater than size");

    iterator i1 = begin();
    std::advance( i1, pos );

    iterator i2 = i1;
    while(i2 != end() && len > 0) //Increment "len" times and stop if end() is reached
    {
        ++i2;
        --len;
    }

    return replace( i1, i2, str );
}

String::iterator String::erase( String::iterator first, String::iterator last )
{
    return iterator( m_string.erase( first.base(), last.base() ) );
}

String::iterator String::erase( String::iterator p )
{
    return erase( p, ++p );
}

void String::erase( String::size_type pos, String::size_type len )
{
    if(pos > size())
        throw std::out_of_range("[gd::String::erase] starting pos greater than size");

    iterator i1 = begin();
    std::advance(i1, pos);

    iterator i2 = i1;
    while(i2 != end() && len != 0) //Increment "len" times and stop if end() is reached
    {
        ++i2;
        len--;
    }

    erase( i1, i2 );
}

std::vector<String> String::Split( String::value_type delimiter ) const
{
    std::vector<String> splittedStrings(1);
    String::const_iterator it = begin();

    for(; it != end(); ++it)
    {
        String::value_type codepoint = *it;
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

    const_iterator startIt = begin();
    while(start > 0 && startIt != end())
    {
        ++startIt;
        --start;
    }
    if(start > 0) //We reach the end of the string before the start position
        throw std::out_of_range("[gd::String::substr] starting pos greater than size");

    const_iterator endIt = startIt;
    while(length > 0 && endIt != end())
    {
        ++endIt;
        --length;
    }

    str.m_string = std::string( startIt.base(), endIt.base() );

    return str;
}

String::size_type String::find( const String &search, String::size_type pos ) const
{
    const_iterator it = begin();

    //Move to pos
    if(pos < size())
        std::advance( it, pos );
    else
        return npos;

    //Use the standard std::string to find a string (using their internal std::strings).
    //Use the raw std::string iterator to get the offset as a **byte** count for the starting
    //position.
    std::string::size_type findPos =
        m_string.find( search.m_string, std::distance( m_string.begin(), it.base() ) );

    if( findPos != std::string::npos )
    {
        //Create a String::iterator from the std::string::iterator pointing to the find result.
        const_iterator findPosIt( m_string.begin() + findPos );

        //Return the distance in **characters** count (that's why we need a String::iterator).
        return std::distance( begin(), findPosIt );
    }
    else
        return npos;
}

String::size_type String::find( const char *search, String::size_type pos ) const
{
    return find( String( search ), pos );
}

String::size_type String::find( const String::value_type search, String::size_type pos ) const
{
    return find( String( std::u32string( 1, search ) ), pos );
}

String::size_type String::rfind( const String &search, String::size_type pos ) const
{
    //Move to pos + 1 (we will then get the last byte of the character at pos)
    const_iterator it = begin();
    std::string::const_iterator baseIt;
    if( pos < size() ) //little optimization by testing npos directly (avoid calculating size())
    {
        std::advance( it, pos + 1 );
        baseIt = it.base();
        --baseIt; //Decrement the std::string::iterator by one because we need
        //it to point to the last byte of the character at pos
    }

    //The last character is included, so we need to put the position
    //of the last byte of the character at the position "pos"
    std::string::size_type findPos = m_string.rfind( search.m_string,
        pos < size() ? std::distance( m_string.begin(), baseIt ) : std::string::npos
        );

    if( findPos != std::string::npos )
    {
        //Create a String::iterator to the find position to be able to get the real
        //distance as characters count (it would be a distance as bytes count
        //with a std::string::iterator)
        const_iterator findPosIt( m_string.begin() + findPos );

        //Return the distance (which is a distance as characters count)
        return std::distance( begin(), findPosIt );
    }
    else
        return npos;
}

String::size_type String::rfind( const char *search, String::size_type pos ) const
{
    return rfind( String( search ), pos );
}

String::size_type String::rfind( const value_type &search, String::size_type pos ) const
{
    return rfind( String( std::u32string( 1, search ) ), pos );
}

namespace priv
{
    String::size_type find_first_of( const String &str, const String &match,
        String::size_type startPos, bool not_of )
    {
        String::const_iterator it = str.begin();
        if(startPos < str.size())
            std::advance( it, startPos );
        else
            return String::npos;

        for( ; it != str.end(); ++it )
        {
            //Search the current char in the match string
            if( ( std::find( match.begin(), match.end(), (*it) ) != match.end() ) != not_of )
                return std::distance( str.begin(), it );
        }

        return String::npos;
    }
}

String::size_type String::find_first_of( const String &match, size_type startPos ) const
{
    return priv::find_first_of(*this, match, startPos, false);
}

String::size_type String::find_first_not_of( const String &match, size_type startPos ) const
{
    return priv::find_first_of(*this, match, startPos, true);
}

namespace priv
{
    String::size_type find_last_of( const String &str, const String &match,
        String::size_type endPos, bool not_of )
    {
        String::size_type strSize = str.size(); //Temporary store the size to avoid a double call to size()

        String::const_iterator it = str.end();
        if( endPos < strSize )
            std::advance( it, endPos - strSize + 1 );

        while( it != str.begin() )
        {
            --it;

            if( ( std::find( match.begin(), match.end(), (*it) ) != match.end() ) != not_of )
                return std::distance( str.begin(), it );
        }

        return String::npos;
    }
}

String::size_type String::find_last_of( const String &match, size_type endPos ) const
{
    return priv::find_last_of( *this, match, endPos, false );
}

String::size_type String::find_last_not_of( const String &match, size_type endPos ) const
{
    return priv::find_last_of( *this, match, endPos, true );
}

int String::compare( const String &other ) const
{
    return m_string.compare( other.m_string );
}

String GD_CORE_API operator+(String lhs, const String &rhs)
{
    lhs += rhs;
    return lhs;
}

String GD_CORE_API operator+(String lhs, const char *rhs)
{
    lhs += rhs;
    return lhs;
}

String GD_CORE_API operator+(const char *lhs, const String &rhs)
{
    String str(lhs);
    str += rhs;
    return str;
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

bool GD_CORE_API operator==( const String &lhs, const String &rhs )
{
    return (lhs.compare(rhs) == 0);
}

bool GD_CORE_API operator==( const String &lhs, const char *rhs )
{
    return (lhs == String(rhs));
}

bool GD_CORE_API operator==( const char *lhs, const gd::String &rhs )
{
    return (String(lhs) == rhs);
}

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
bool GD_CORE_API operator==( const String &lhs, const wxString &rhs)
{
    return (lhs == String(rhs));
}

bool GD_CORE_API operator==( const wxString &lhs, const String &rhs)
{
    return (String(lhs) == rhs);
}
#endif

bool GD_CORE_API operator!=( const String &lhs, const String &rhs )
{
    return !(lhs == rhs);
}

bool GD_CORE_API operator!=( const String &lhs, const char *rhs )
{
    return !(lhs == rhs);
}

bool GD_CORE_API operator!=( const char *lhs, const String &rhs )
{
    return !(lhs == rhs);
}

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
bool GD_CORE_API operator!=( const String &lhs, const wxString &rhs)
{
    return !(lhs == rhs);
}

bool GD_CORE_API operator!=( const wxString &lhs, const String &rhs)
{
    return !(lhs == rhs);
}
#endif

bool GD_CORE_API operator<( const String &lhs, const String &rhs )
{
    return (lhs.compare(rhs) < 0);
}

bool GD_CORE_API operator<( const String &lhs, const char *rhs )
{
    return (lhs < String(rhs));
}

bool GD_CORE_API operator<( const char *lhs, const String &rhs )
{
    return (String(lhs) < rhs);
}

bool GD_CORE_API operator<=( const String &lhs, const String &rhs )
{
    return (lhs.compare(rhs) <= 0);
}

bool GD_CORE_API operator<=( const String &lhs, const char *rhs )
{
    return (lhs <= String(rhs));
}

bool GD_CORE_API operator<=( const char *lhs, const String &rhs )
{
    return (String(lhs) <= rhs);
}

bool GD_CORE_API operator>( const String &lhs, const String &rhs )
{
    return (lhs.compare(rhs) > 0);
}

bool GD_CORE_API operator>( const String &lhs, const char *rhs )
{
    return (lhs > String(rhs));
}

bool GD_CORE_API operator>( const char *lhs, const String &rhs )
{
    return (String(lhs) > rhs);
}

bool GD_CORE_API operator>=( const String &lhs, const String &rhs )
{
    return (lhs.compare(rhs) >= 0);
}

bool GD_CORE_API operator>=( const String &lhs, const char *rhs )
{
    return (lhs >= String(rhs));
}

bool GD_CORE_API operator>=( const char *lhs, const String &rhs )
{
    return (String(lhs) >= rhs);
}

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
