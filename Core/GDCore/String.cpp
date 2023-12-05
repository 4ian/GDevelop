/*
 * GDevelop Core
 * Copyright 2015-2016 Victor Levasseur (victorlevasseur52@gmail.com).
 * This project is released under the MIT License.
 */

#include "GDCore/String.h"

#include <algorithm>
#include <string.h>

#include "GDCore/CommonTools.h"
#include "GDCore/Utf8/utf8proc.h"

namespace gd
{

constexpr String::size_type String::npos;

String::String() : m_string()
{

}

String::String(const char *characters) : m_string()
{
    *this = characters;
}

String::String(const std::u32string &string) : m_string()
{
    *this = string;
}

String& String::operator=(const char *characters)
{
    m_string = std::string(characters);
    return *this;
}

String& String::operator=(const std::u32string &string)
{
    m_string.clear();

    //In theory, an UTF8 character can be up to 6 bytes (even if in the current Unicode standard,
    //the last character is 4 bytes long when encoded in UTF8).
    //So, reserve the maximum possible size to avoid reallocations.
    m_string.reserve( string.size() * 6 );

    //Push_back all characters inside the string.
    for( std::u32string::const_iterator it = string.begin(); it != string.end(); ++it )
    {
        push_back( *it );
    }

    m_string.shrink_to_fit();

    return *this;
}

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

String String::FromLocale( const std::string &localizedString )
{
#if defined(WINDOWS)
    return FromUTF8(localizedString); //Don't need to use the current locale, on Windows, std::locale is always the C locale
#elif defined(MACOS)
    return FromUTF8(localizedString); //Assume UTF8 is the current locale
#elif defined(EMSCRIPTEN)
    return FromUTF8(localizedString); //Assume UTF8 is the current locale
#else
    if(std::locale("").name().find("utf-8") != std::string::npos ||
       std::locale("").name().find("UTF-8") != std::string::npos ||
       std::locale("").name().find("utf8") != std::string::npos ||
       std::locale("").name().find("UTF8") != std::string::npos)
        return FromUTF8(localizedString); //UTF8 is already the current locale
    else
        return FromUTF8(localizedString); //Use the current locale (std::locale("")) for conversion
#endif
}

String String::FromUTF32( const std::u32string &string )
{
    String str;
    str = string; //operator=(const std::u32string&)

    return str;
}

String String::FromUTF8( const std::string &utf8Str )
{
    String str(utf8Str.c_str());

    return str;
}

String String::FromWide( const std::wstring &wstr )
{
    String str;

    #ifdef WINDOWS //std::wstring is an UTF16 string on Windows
    ::utf8::utf16to8(wstr.begin(), wstr.end(), std::back_inserter(str.Raw()));
    #else //and a UTF32 string on other OSes
    ::utf8::utf32to8(wstr.begin(), wstr.end(), std::back_inserter(str.Raw()));
    #endif

    return str;
}

std::string String::ToLocale() const
{
#if defined(WINDOWS)
    return m_string;
#elif defined(MACOS)
    return m_string;
#elif defined(EMSCRIPTEN)
    return m_string;
#else
    if(std::locale("").name().find("utf-8") != std::string::npos ||
       std::locale("").name().find("UTF-8") != std::string::npos ||
       std::locale("").name().find("utf8") != std::string::npos ||
       std::locale("").name().find("UTF8") != std::string::npos)
        return m_string; //UTF8 is already the current locale on Linux
    else
        return m_string; //Use the current locale for conversion
#endif
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

std::string String::ToUTF8() const
{
    return m_string;
}

std::wstring String::ToWide() const
{
    std::wstring wstr;

    #ifdef WINDOWS //std::wstring is an UTF16 string on Windows
    ::utf8::utf8to16(m_string.begin(), m_string.end(), std::back_inserter(wstr));
    #else //and a UTF32 string on other OSes
    ::utf8::utf8to32(m_string.begin(), m_string.end(), std::back_inserter(wstr));
    #endif

    return wstr;
}

bool String::IsValid() const
{
    return ::utf8::is_valid(m_string.begin(), m_string.end());
}

String& String::ReplaceInvalid( value_type replacement )
{
    std::string validStr;
    ::utf8::replace_invalid(m_string.begin(), m_string.end(), std::back_inserter(validStr), replacement);

    m_string = validStr;

    return *this;
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
    m_string += other;
    return *this;
}

String& String::operator+=( value_type character )
{
    push_back(character);
    return *this;
}

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

String& String::replace_if(iterator i1, iterator i2, std::function<bool(char32_t)> p,  const String &str)
{
    String::size_type offset = 1;
    iterator it = i1.base();
    while(it < i2.base())
    {
      if (p(*it)) { replace(std::distance(begin(), it), offset, str); }
      else { it++; }
    }
    return *this;
}

String &String::RemoveConsecutiveOccurrences(iterator i1,
                                             iterator i2,
                                             const char c) {
    iterator end = i2;
    for (iterator current_index = i1.base(); current_index < end.base();
         current_index++) {
      if (*current_index == c) {
        iterator current_subindex = current_index;
        current_subindex++;
        while (current_subindex < end.base() && *current_subindex == c) {
          current_subindex++;
        }
        difference_type difference_to_replace =
            std::distance(current_index, current_subindex);
        if (difference_to_replace > 1) {
          replace(
              std::distance(begin(), current_index), difference_to_replace, c);
          std::advance(end, -(difference_to_replace - 1));
        }
      }
    }
    return *this;
}

String& String::replace( iterator i1, iterator i2, const String &str )
{
    m_string.replace(i1.base(), i2.base(), str.m_string);

    return *this;
}

String& String::replace( iterator i1, iterator i2, size_type n, const char c )
{
    m_string.replace(i1.base(), i2.base(), n, c);

    return *this;
}

String& String::replace( String::size_type pos, String::size_type len, const char c )
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

    return replace( i1, i2, 1, c );
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
    return iterator( m_string.erase( p.base() ) );
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

String String::CaseFold() const
{
    unsigned char *newStr = nullptr;

    utf8proc_map((unsigned char*)m_string.c_str(), 0, &newStr, static_cast<utf8proc_option_t>(UTF8PROC_CASEFOLD|UTF8PROC_NULLTERM));
    String str((char*)newStr);
    str.Normalize();

    free(newStr);

    return str;
}

String String::UpperCase() const
{
    gd::String upperCasedStr;
    std::for_each( begin(), end(), [&](char32_t codepoint){ upperCasedStr.push_back( utf8proc_toupper(codepoint) ); } );

    return upperCasedStr;
}

String String::LowerCase() const
{
    gd::String lowerCasedStr;
    std::for_each( begin(), end(), [&](char32_t codepoint){ lowerCasedStr.push_back( utf8proc_tolower(codepoint) ); } );

    return lowerCasedStr;
}

String String::CapitalizeFirstLetter() const
{
  return size() < 1 ? *this : substr(0, 1).UpperCase() + substr(1);
}

String String::FindAndReplace(String search, String replacement, bool all) const
{
    gd::String result(*this);

    size_type pos, lastPos = 0;
    do {
        pos = result.find(search, lastPos);
        lastPos = pos;
        if (pos != npos)
        {
            result.replace(pos, search.size(), replacement);
            lastPos += replacement.size();
        }

    } while(lastPos != npos && all);

    return result;
}

String& String::Normalize(String::NormForm form)
{
    unsigned char *newStr = nullptr;

    if(form == NFD)
        newStr = utf8proc_NFD((unsigned char*)m_string.c_str());
    else if(form == NFC)
        newStr = utf8proc_NFC((unsigned char*)m_string.c_str());
    else if(form == NFKD)
        newStr = utf8proc_NFKD((unsigned char*)m_string.c_str());
    else if(form == NFKC)
        newStr = utf8proc_NFKC((unsigned char*)m_string.c_str());

    m_string = (char*)newStr;

    free(newStr);

    return *this;
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
        //Temporary store the size to avoid a double call to size()
        String::size_type strSize = str.size();

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

namespace priv
{
    /**
     * As the casefolded version of a string can have a different size, the positions
     * in the two versions of the string are not the same.
     * \return where the **pos** position in the original string **str** is in the
     * casefolded version of **str**
     */
    String::size_type GetPositionInCaseFolded( const String &str, String::size_type pos )
    {
        //Use the substring to determine the differences between original and casefolded
        //Get the substring from 0 to pos and then casefold it to see where the character
        //is in the casefolded version
        return str.substr(0, pos).CaseFold().size();
    }

    /**
     * As the casefolded version of a string can have a different size, the positions
     * in the two versions of the string are not the same.
     * \return where the **pos** position in the casefolded string of **str** is in the
     * original version **str**
     * \note str must be the non-casefolded string.
     */
    String::size_type GetPositionFromCaseFolded( const String &str, String::size_type pos )
    {
        //Use the "opposite" operation (GetPositionInCaseFolded) to find where the position
        //is in the original string.
        String::size_type posInOrig = 0;
        while(pos != GetPositionInCaseFolded(str, posInOrig))
            posInOrig++;
        return posInOrig;
    }
}

String::size_type String::FindCaseInsensitive( const String &search, size_type pos ) const
{
    //Find where is pos in the casefolded string (it's important because some letters
    //are casefolded into multiples letters, e.g. the german eszett ß is casefolded to ss).

    //Do a traditionnal find with both strings casefolded
    gd::String casefoldedStr = CaseFold();
    size_type findPos = casefoldedStr.find( search.CaseFold(), priv::GetPositionInCaseFolded(*this, pos) );
    if(findPos == npos)
        return npos;
    else
        return priv::GetPositionFromCaseFolded(*this, findPos);
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

const String& GD_CORE_API operator||(const String& lhs, const String &rhs)
{
    return lhs.empty() ? rhs : lhs;
}

String GD_CORE_API operator||(String lhs, const char *rhs)
{
    return lhs.empty() ? rhs : lhs;
}

bool GD_CORE_API operator==( const String &lhs, const String &rhs )
{
    return (lhs.compare(rhs) == 0);
}

bool GD_CORE_API operator==( const String &lhs, const char *rhs )
{
    return (strcmp(lhs.c_str(), rhs) == 0);
}

bool GD_CORE_API operator==( const char *lhs, const gd::String &rhs )
{
    return (strcmp(lhs, rhs.c_str()) == 0);
}

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

bool GD_CORE_API operator<( const String &lhs, const String &rhs )
{
    return (lhs.compare(rhs) < 0);
}

bool GD_CORE_API operator<( const String &lhs, const char *rhs )
{
    return strcmp(lhs.c_str(), rhs) < 0;
}

bool GD_CORE_API operator<( const char *lhs, const String &rhs )
{
    return strcmp(lhs, rhs.c_str()) < 0;
}

bool GD_CORE_API operator<=( const String &lhs, const String &rhs )
{
    return (lhs.compare(rhs) <= 0);
}

bool GD_CORE_API operator<=( const String &lhs, const char *rhs )
{
    return strcmp(lhs.c_str(), rhs) <= 0;
}

bool GD_CORE_API operator<=( const char *lhs, const String &rhs )
{
    return strcmp(lhs, rhs.c_str()) <= 0;
}

bool GD_CORE_API operator>( const String &lhs, const String &rhs )
{
    return (lhs.compare(rhs) > 0);
}

bool GD_CORE_API operator>( const String &lhs, const char *rhs )
{
    return strcmp(lhs.c_str(), rhs) > 0;
}

bool GD_CORE_API operator>( const char *lhs, const String &rhs )
{
    return strcmp(lhs, rhs.c_str()) > 0;
}

bool GD_CORE_API operator>=( const String &lhs, const String &rhs )
{
    return (lhs.compare(rhs) >= 0);
}

bool GD_CORE_API operator>=( const String &lhs, const char *rhs )
{
    return strcmp(lhs.c_str(), rhs) >= 0;
}

bool GD_CORE_API operator>=( const char *lhs, const String &rhs )
{
    return strcmp(lhs, rhs.c_str()) >= 0;
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

bool GD_CORE_API CaseSensitiveEquiv( String lhs, String rhs, bool compat )
{
    if(compat)
        return (lhs.Normalize(String::NFKD) == rhs.Normalize(String::NFKD));
    else
        return (lhs.Normalize(String::NFD) == rhs.Normalize(String::NFD));
}

bool GD_CORE_API CaseInsensitiveEquiv( const String &lhs, const String &rhs, bool compat )
{
    if(compat)
        return (lhs.CaseFold().Normalize(String::NFKD) == rhs.CaseFold().Normalize(String::NFKD));
    else
        return (lhs.CaseFold().Normalize(String::NFD) == rhs.CaseFold().Normalize(String::NFD));
}

}
