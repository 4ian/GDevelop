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

/**
 * \page utf8support UTF8 support
 * String expressions (string entered by the user inside numerical/string expression editor) are stored inside
 * std::string but encoded in UTF8.
 *
 * \section utf8encoded What is encoded in UTF8 ?
 * Not all the strings used by GDevelop are encoded in UTF8. Here is the list of all UTF8 encoded strings :
 * - string parameters passed to actions, conditions and expressions
 * - return value of string expressions
 * - string variable's content and variable's name
 * - expressions entered by the user inside a numerical/string expression editor (but they are not used directly
 * by extensions)
 * - layers' names
 * - scenes' names
 * - debugger properties' values (names are not encoded in UTF8 as they come from a translation)
 *
 * \section notutf8encoded What is NOT encoded in UTF8 ?
 * - Objects' names
 * - Automatisms' names
 * - Translations used by GDevelop for actions/conditions... (they depends on the current locale, e.g. a russian translation
 * will not be shown correctly under an english computer)
 *
 * \section howtouseutf8 How to use UTF8 strings ?
 * First, include this header :
 * \code
 * #include "GDCpp/Utf8Tools.h"
 * \endcode
 * Although UTF8 strings are stored inside std::string, some utility functions should be used instead of std::string methods.
 * As UTF8 characters can be represented by a variable length array of char, the std::string::size() method is invalidated (it will return
 * the amount of bytes representing the string) and utf8::StrLength should be used instead.
 * Here is the list of changed functions
 * - myString.size() becomes utf8::StrLength(myString);
 * - myString.substr(i, len) becomes utf8::SubStr(myString, i, len)
 *
 * \note These functions are available in gd::utf8 namespace when using GDCore and utf8 namespace when using GDCpp
 */
