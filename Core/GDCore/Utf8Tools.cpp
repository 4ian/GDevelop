/*
 * GDevelop Core
 * Copyright 2015 Victor Levasseur (victorlevasseur52@gmail.com).
 * This project is released under the MIT License.
 */

#include "GDCore/Utf8Tools.h"
#include "GDCore/Utf8/utf8.h"

#include <iostream>

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include <wx/string.h>
#endif

namespace gd
{

namespace utf8
{

std::string GD_API FromLocaleString( const std::string &str )
{
    return FromSfString(sf::String(str));
}

std::string GD_API ToLocaleString( const std::string &utf8str )
{
    return ToSfString(utf8str).toAnsiString();
}

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)

std::string GD_CORE_API FromWxString( const wxString &str )
{
    return std::string(str.ToUTF8().data());
}

wxString GD_CORE_API ToWxString( const std::string &utf8str )
{
    return wxString::FromUTF8(utf8str.c_str());
}

#endif

std::string GD_CORE_API FromSfString( const sf::String &str )
{
    std::string utf8str;
    ::utf8::utf32to8(str.begin(), str.end(), std::back_inserter(utf8str));

    return utf8str;
}

sf::String GD_CORE_API ToSfString( const std::string &utf8str )
{
    std::basic_string<sf::Uint32> utf32str;
    ::utf8::utf8to32(utf8str.begin(), utf8str.end(), std::back_inserter(utf32str));

    return sf::String(utf32str);
}

std::wstring GD_CORE_API ToWString( const std::string &utf8str )
{
    std::wstring wstr;

    #ifdef WINDOWS //std::wstring is an UTF16 string on Windows
    ::utf8::utf8to16(utf8str.begin(), utf8str.end(), std::back_inserter(wstr));
    #else //and a UTF32 string on other OSes
    ::utf8::utf8to32(utf8str.begin(), utf8str.end(), std::back_inserter(wstr));
    #endif

    return wstr;
}

std::string GD_CORE_API FromWString( const std::wstring &wstr )
{
    std::string utf8str;

    #ifdef WINDOWS //std::wstring is an UTF16 string on Windows
    ::utf8::utf16to8(wstr.begin(), wstr.end(), std::back_inserter(utf8str));
    #else //and a UTF32 string on other OSes
    ::utf8::utf32to8(wstr.begin(), wstr.end(), std::back_inserter(utf8str));
    #endif

    return utf8str;
}

std::string GD_CORE_API ReplaceInvalid( const std::string &utf8str )
{
    std::string validStr;

    try
    {
        ::utf8::replace_invalid(utf8str.begin(), utf8str.end(), std::back_inserter(validStr));
    }
    catch(const std::exception &exc)
    {
        std::cout << "[UTF8] invalid codepoint replacement warning : " << exc.what() << std::endl;
    }

    return validStr;
}

std::size_t GD_CORE_API StrLength( const std::string &utf8str )
{
    return ::utf8::distance(utf8str.begin(), utf8str.end());
}

std::string GD_CORE_API SubStr( const std::string &utf8str, std::size_t pos, std::size_t len )
{
    std::string::const_iterator it = utf8str.begin();

    //Move to pos
    int i = 0;
    for(i = 0; i < pos && it != utf8str.end(); i++)
    {
        try
        {
            ::utf8::next(it, utf8str.end());
        }
        catch(const std::exception &exc)
        {
            std::cout << "[UTF8] SubStr : " << exc.what() << std::endl;
        }
    }
    if(i != pos)
    {
        std::cout << "[UTF8] String is not long enough !" << std::endl;
        return ""; //We can't go to pos as the string is not big enough
    }

    //Copy needed code points to the new string (temporary in UTF32)
    std::basic_string<std::uint32_t> utf32substr;
    for(i = 0; i < len && it != utf8str.end(); i++)
    {
        try
        {
            utf32substr.push_back(::utf8::next(it, utf8str.end()));
        }
        catch(const std::exception &exc)
        {
            std::cout << "[UTF8] SubStr : " << exc.what() << std::endl;
        }
    }

    //Convert the UTF32 substr to UTF8
    std::string utf8substr;
    ::utf8::utf32to8(utf32substr.begin(), utf32substr.end(), std::back_inserter(utf8substr));

    return utf8substr;
}

}

}
