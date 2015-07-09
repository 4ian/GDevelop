/*
 * GDevelop C++ Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#ifndef GDCPP_COMMONTOOLS_H_INCLUDED
#define GDCPP_COMMONTOOLS_H_INCLUDED
#include <string>
#include <sstream>
#include <vector>
#include <cmath>
#include <SFML/System/String.hpp>
#include "GDCpp/String.h"
#if defined(GD_IDE_ONLY)
class wxString;
#endif

/**
 * Convert anything to an integer.
 * Example:
 * \code
 * gd::String five = 5;
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
 * Convert anything to a gd::String
 * \ingroup CommonProgrammingTools
 */
template<typename T>
std::string ToString( const T & value )
{
    std::ostringstream oss;
    oss << value;
    return oss.str();
}

#if defined(GD_IDE_ONLY)
/**
 * Specialization for converting wxString to a gd::String
 * \ingroup CommonProgrammingTools
 */
template<>
std::string GD_API ToString( const wxString & value );
#endif

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

/**
 * \brief Functor testing if a gd::String is empty
 *
 * Usage example:
 * \code
 * //Remove all empty strings from a std::vector<gd::String>.
 * myVector.erase(std::remove_if(myVector.begin(), myVector.end(), StringEmpty()), myVector.end());
 * \endcode
 *
 * \ingroup CommonProgrammingTools
 */
struct StringEmpty
{
   bool operator ()(const gd::String & a) const
   {
      return a.empty();
   }
};

#ifdef __GNUC__
/**
 * Round the number to the nearest integer
 * \ingroup CommonProgrammingTools
 */
inline int GDRound(float x)
{
    return round(x);
}
#else
/**
 * Round the number to the nearest integer
 * \ingroup CommonProgrammingTools
 */
inline double GDRound( double d )
{
    return ( d >= 0 ? floor(d+0.5) : ceil(d-0.5) );
}
#endif

#endif // GDCPP_COMMONTOOLS_H_INCLUDED
