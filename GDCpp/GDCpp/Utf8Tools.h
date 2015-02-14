/*
 * GDevelop Core
 * Copyright 2015 Victor Levasseur (victorlevasseur52@gmail.com).
 * This project is released under the MIT License.
 */

#include <string>
#include <SFML/System/String.hpp>

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
class wxString;
#endif

namespace utf8
{

std::string GD_API FromLocaleString( const std::string &str );
std::string GD_API ToLocaleString( const std::string &utf8str );

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
std::string GD_API FromWxString( const wxString &str );
wxString GD_API ToWxString( const std::string &utf8str );
#endif
std::string GD_API FromSfString( const sf::String &str );
sf::String GD_API ToSfString( const std::string &utf8str );

std::wstring GD_API ToWString( const std::string &utf8str );
std::string GD_API FromWString( const std::wstring &wstr );

std::string GD_API ReplaceInvalid( const std::string &utf8str );

std::size_t GD_API StrLength( const std::string &utf8str );
std::string GD_API SubStr( const std::string &utf8str, std::size_t pos, std::size_t len );

}
