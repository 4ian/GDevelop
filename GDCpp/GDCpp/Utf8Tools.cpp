/*
 * GDevelop Core
 * Copyright 2015 Victor Levasseur (victorlevasseur52@gmail.com).
 * This project is released under the MIT License.
 */

#include "GDCpp/Utf8Tools.h"
#include "GDCpp/Utf8/utf8.h"

#include <iostream>

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include <wx/string.h>
#endif

namespace utf8
{

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)

std::string GD_API FromWxString( const wxString &str )
{
    return std::string(str.ToUTF8().data());
}

wxString GD_API ToWxString( const std::string &utf8str )
{
    return wxString::FromUTF8(utf8str.c_str());
}

#endif

std::string GD_API FromSfString( const sf::String &str )
{
    std::string utf8str;
    ::utf8::utf32to8(str.begin(), str.end(), std::back_inserter(utf8str));

    return utf8str;
}

sf::String GD_API ToSfString( const std::string &utf8str )
{
    std::basic_string<sf::Uint32> utf32str;
    ::utf8::utf8to32(utf8str.begin(), utf8str.end(), std::back_inserter(utf32str));

    return sf::String(utf32str);
}

std::wstring GD_API ToWString( const std::string &utf8str )
{
    std::wstring wstr;

    #ifdef WINDOWS //std::wstring is an UTF16 string on Windows
    ::utf8::utf8to16(utf8str.begin(), utf8str.end(), std::back_inserter(wstr));
    #else //and a UTF32 string on other OSes
    ::utf8::utf8to32(utf8str.begin(), utf8str.end(), std::back_inserter(wstr));
    #endif

    return wstr;
}

std::string GD_API FromWString( const std::wstring &wstr )
{
    std::string utf8str;

    #ifdef WINDOWS //std::wstring is an UTF16 string on Windows
    ::utf8::utf16to8(wstr.begin(), wstr.end(), std::back_inserter(utf8str));
    #else //and a UTF32 string on other OSes
    ::utf8::utf32to8(wstr.begin(), wstr.end(), std::back_inserter(utf8str));
    #endif

    return utf8str;
}

std::string GD_API ReplaceInvalid( const std::string &utf8str )
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

std::size_t GD_API StrLength( const std::string &utf8str )
{
    return ::utf8::distance(utf8str.begin(), utf8str.end());
}

}

