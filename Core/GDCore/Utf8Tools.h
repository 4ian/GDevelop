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

/** \file */ 

/**
 * \defgroup utf8support UTF8 Tools
 * \brief Contains functions to deal with UTF8 encoded std::string used by GDevelop (GDCore) and GDCpp games.
 * \code
 * #include "GDCore/Utf8Tools.h"
 * \endcode
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
 * Although UTF8 strings are stored inside std::string, some utility functions should be used instead of std::string methods.
 * As UTF8 characters can be represented by a variable length array of char, the std::string::size() method is invalidated (it will return
 * the amount of bytes representing the string) and gd::utf8::StrLength should be used instead.
 * Here is the list of changed functions
 * - myString.size() becomes gd::utf8::StrLength(myString);
 * - myString.substr(i, len) becomes gd::utf8::SubStr(myString, i, len)
 *
 * \note These functions are available in gd::utf8 namespace when using GDCore and utf8 namespace when using GDCpp
 *
 */

namespace gd
{

/**
 \brief UTF8 tools
 */
namespace utf8
{

/**
 * \brief Convert a locale std::string to an UTF8 encoded string
 * Convert a std::string encoded in the current locale to an UTF8 encoded string.
 * \param str a string encoded in the current locale
 * \return a string encoded in UTF8
 * \ingroup utf8support
 */
std::string GD_CORE_API FromLocaleString( const std::string &str );
std::string GD_CORE_API ToLocaleString( const std::string &utf8str );

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
std::string GD_CORE_API FromWxString( const wxString &str );
wxString GD_CORE_API ToWxString( const std::string &utf8str );
#endif
std::string GD_CORE_API FromSfString( const sf::String &str );
sf::String GD_CORE_API ToSfString( const std::string &utf8str );

std::wstring GD_CORE_API ToWString( const std::string &utf8str );
std::string GD_CORE_API FromWString( const std::wstring &wstr );

std::string GD_CORE_API ReplaceInvalid( const std::string &utf8str );

std::size_t GD_CORE_API StrLength( const std::string &utf8str );
std::string GD_CORE_API SubStr( const std::string &utf8str, std::size_t pos, std::size_t len );

}

}