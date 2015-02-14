/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#include "GDCore/CommonTools.h"
#include <string>
#include <iostream>
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include <wx/string.h>
#endif

namespace gd
{
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
template<>
std::string GD_CORE_API ToString( const wxString & value )
{
    return std::string(value.mb_str());
}

wxString GD_CORE_API Utf8ToWxString( const std::string &utf8Str )
{
    return wxString::FromUTF8(utf8Str.c_str());
}

std::string GD_CORE_API ToUtf8String( const wxString & value )
{
    return std::string(value.ToUTF8().data());
}
#endif

sf::String GD_CORE_API Utf8ToSfString( const std::string &utf8str )
{
    std::basic_string<sf::Uint32> utf32str;
    utf8::utf8to32(utf8str.begin(), utf8str.end(), std::back_inserter(utf32str));

    return sf::String(utf32str);
}

std::string GD_CORE_API ToUtf8String( const sf::String &str )
{
    std::string utf8str;
    utf8::utf32to8(str.begin(), str.end(), std::back_inserter(utf8str));

    return utf8str;
}

}
