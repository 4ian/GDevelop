/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#ifndef COMMONTOOLS_H
#define COMMONTOOLS_H
#include <algorithm>
#include <cmath>
#include <iterator>
#include <sstream>
#include <string>
#include <vector>
#include "Utf8/utf8.h"
#include <SFML/System/String.hpp>
class wxString;

namespace gd
{

/**
 * Convert anything to a double
 * \ingroup CommonProgrammingTools
 */
template<typename T>
double ToDouble( const T & value )
{
    double d;
    std::istringstream oss(value);
    oss >> d;
    return d;
}

/**
 * Convert anything to a std::string
 * Example:
 * \code
 * std::string five = gd::ToString(5);
 * \endcode
 * \ingroup CommonProgrammingTools
 */
template<typename T>
std::string ToString( const T & value )
{
    std::ostringstream oss;
    oss << value;
    return oss.str();
}

/**
 * Convert anything to an integer.
 * Example:
 * \code
 * std::string five = "5";
 * int number = ToInt(five);
 * \endcode
 * \ingroup CommonProgrammingTools
 */
template<typename T>
int ToInt( const T & value )
{
    int i;
    std::istringstream oss(value);
    oss >> i;
    return i;
}

/**
 * Convert anything to a float
 * \ingroup CommonProgrammingTools
 */
template<typename T>
float ToFloat( const T & value )
{
    float f;
    std::istringstream oss(value);
    oss >> f;
    return f;
}

/**
 * Specialization for converting wxString to a std::string
 * \ingroup CommonProgrammingTools
 */
template<>
std::string GD_CORE_API ToString( const wxString & value );

/**
 * Split a string into tokens stored in a vector, using the specified separator.
 * \param str String to split
 * \param separator Separator to use
 */
template <typename T>
std::vector <T> SplitString( const std::string & str, char separator )
{
    std::istringstream iss( str );
    std::string token;
    std::vector <T> array;

    while ( std::getline( iss, token, separator ) )
        array.push_back( T(token) );

    return array;
}

inline double Pi()
{
    return 3.141592653589793238;
}

#ifdef __GNUC__
/**
 * Round the number to the nearest integer
 * \ingroup CommonProgrammingTools
 */
inline int Round(float x)
{
    return round(x);
}
#else
/**
 * Round the number to the nearest integer
 * \ingroup CommonProgrammingTools
 */
inline double Round( double d )
{
    return ( d >= 0 ? floor(d+0.5) : ceil(d-0.5) );
}
#endif

/**
 * Make the whole string uppercase.
 * \ingroup CommonProgrammingTools
 */
inline std::string StrUppercase( const std::string& in )
{
    std::string out;

    std::transform( in.begin(), in.end(), std::back_inserter( out ), ::toupper );
    return out;
}

}

#endif // COMMONTOOLS_H
