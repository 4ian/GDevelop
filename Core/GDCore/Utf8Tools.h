#ifndef GDCORE_UTF8TOOLS_H
#define GDCORE_UTF8TOOLS_H
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
 * GDevelop uses std::strings to store its character strings. These strings are encoded in UTF8. As UTF8 is a variable size encoding,
 * some of the default std::string function can not be used anymore (size, substr, ...).
 * There are also other functions to convert from/to other string classes (like sf::String and wxString) as their default conversion methods
 * assumes that std::strings are encoded in the current locale (and that is not the case as there are encoded in UTF8).
 *
 * \warning std::strings containing file or folder paths are not encoded in the OS locale (it is not needed). 
 * This does not mean that it can not be encoded in UTF8. In fact, on most Linux OSes, the locale is UTF8, so, paths will still be encoded in UTF8.
 * On Windows, the locale is not UTF8 but an ASCII codepage so paths will be encoded in an ASCII codepage.
 *
 * \section utf8translations How to handle translations correctly ? Difference between _() and GD_T() ?
 * As all std::strings are encoded in UTF8, GDevelop can not rely on the default conversion between std::string and wxString.
 * So, each of these two macros creates a translatable string but not the same type of string.
 * - GD_T() creates a translatable string as an std::string (useful for actions/conditions declaration and everywhere a std::string is needed)
 * - _() creates a translatable string as an wxString (useful everywhere a wxString is needed, like in GUI)
 * \warning If you use the wrong macro, the compilation might still work but strange behavior with special characters might occur.
 *
 * \section howtouseutf8 How to use UTF8 strings ?
 * Although UTF8 strings are stored inside std::string, some utility functions should be used instead of std::string methods.
 * As UTF8 characters can be represented by a variable length array of char, the std::string::size() method is invalidated (it will return
 * the amount of bytes representing the string) and gd::utf8::StrLength should be used instead.
 * Here is the list of changed functions
 * - myString.size() becomes gd::utf8::StrLength(myString);
 * - myString.substr(i, len) becomes gd::utf8::SubStr(myString, i, len)
 * \note Some parts of GDevelop do not use these functions (like the object editor), it is because objects names can not contain special
 * characters (so there are like pure ASCII strings).
 */

namespace gd
{

/**
 \brief UTF8 tools
 */
namespace utf8
{

/**
 * \name Conversion from or to current locale
 * \{
 */

/**
 * \brief Convert a locale std::string to an UTF8 encoded string
 * Convert a std::string encoded in the current locale to an UTF8 encoded string.
 * \param str a string encoded in the current locale
 * \return a string encoded in UTF8
 * \ingroup utf8support
 */
std::string GD_CORE_API FromLocaleString( const std::string &str );

/**
 * \brief Convert an UTF8 encoded std::string to a std::string encoded in the current locale
 * Convert a std::string encoded in UTF8 to a std::string encoded in the current locale.
 * \param utf8str a string encoded in UTF8
 * \return a string encoded in the current locale
 * \ingroup utf8support
 */
std::string GD_CORE_API ToLocaleString( const std::string &utf8str );

/**
 * \}
 */

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)

/**
 * \name Conversion from or to wxString
 * \{
 */

/**
 * \brief Convert a wxString to an UTF8 encoded string
 * \param str a wxString
 * \return a string encoded in UTF8
 * \note Only available when GDevelop is compiled with wxWidgets (not in Runtime Cpp games).
 * \ingroup utf8support
 */
std::string GD_CORE_API FromWxString( const wxString &str );

/**
 * \brief Convert an UTF8 encoded std::string to a wxString
 * \param str a string encoded in UTF8
 * \return a wxString
 * \note Only available when GDevelop is compiled with wxWidgets (not in Runtime Cpp games).
 * \ingroup utf8support
 */
wxString GD_CORE_API ToWxString( const std::string &utf8str );

/**
 * \}
 */

#endif


/**
 * \name Conversion from or to sf::String
 * \{
 */

/**
 * \brief Convert a sf::String to an UTF8 encoded string
 * \param str a sf::String
 * \return a string encoded in UTF8
 * \ingroup utf8support
 */
std::string GD_CORE_API FromSfString( const sf::String &str );

/**
 * \brief Convert an UTF8 encoded std::string to a sf::String
 * \param str a string encoded in UTF8
 * \return a sf::String
 * \ingroup utf8support
 */
sf::String GD_CORE_API ToSfString( const std::string &utf8str );

/**
 * \}
 */

/**
 * \name Conversion from or to std::wstring
 * \{
 */

/**
 * \brief Convert a std::wstring to an UTF8 encoded string
 * \param str a std::wstring
 * \return a string encoded in UTF8
 * \ingroup utf8support
 */
std::string GD_CORE_API FromWString( const std::wstring &wstr );

/**
 * \brief Convert an UTF8 encoded std::string to a std::wstring
 * \param str a string encoded in UTF8
 * \return a std::wstring
 * \ingroup utf8support
 */
std::wstring GD_CORE_API ToWString( const std::string &utf8str );

/**
 * \}
 */

/**
 * \name Utility functions
 * \{
 */

/**
 * \brief Remove all invalid characters from an UTF8 string
 * \param utf8str an UTF8 encoded string that may contain invalid characters
 * \return the UTF8 encoded string without invalid characters
 * \ingroup utf8support
 */
std::string GD_CORE_API ReplaceInvalid( const std::string &utf8str );

/**
 * \brief Get the size of an UTF8 encoded string
 * \param utf8str a UTF8 encoded string
 * \return the size of the UTF8 encoded string
 * \ingroup utf8support
 */
std::size_t GD_CORE_API StrLength( const std::string &utf8str );

/**
 * \brief Get a substring from an UTF8 encoded string
 * \param utf8str a UTF8 encoded string
 * \param pos position of the first character to be copied as a substring
 * \param len number of characters to be copied as a substring
 * \return a substring
 * \ingroup utf8support
 */
std::string GD_CORE_API SubStr( const std::string &utf8str, std::size_t pos, std::size_t len );

/**
 * \brief Find the first occurence from a string in another one
 * \param utf8str a UTF8 encoded string
 * \param search the UTF8 encoded string to look for in utf8str
 * \param pos the first character to be considered in the search
 * \return the position of the first match (beginning of the match)
 * \ingroup utf8support
 */
std::size_t GD_CORE_API Find( const std::string &utf8str, const std::string &search, std::size_t pos = 0 );

/**
 * \brief Find the last occurence from a string in another one
 * \param utf8str a UTF8 encoded string
 * \param search the UTF8 encoded string to look for in utf8str
 * \param pos the last character to be considered as the beginning of the search
 * \return the position of the last match (beginning of the match)
 * \ingroup utf8support
 */
std::size_t GD_CORE_API RFind( const std::string &utf8str, const std::string &search, std::size_t pos = std::string::npos );

/**
 * \}
 */

/**
 * \name Locale functions
 * \{
 */

bool GD_CORE_API IsUTF8Locale();

/**
 * \}
 */

}

}

#endif //GDCORE_UTF8TOOLS_H
