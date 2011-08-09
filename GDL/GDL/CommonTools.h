/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef STDALGO_H_INCLUDED
#define STDALGO_H_INCLUDED

#include <string>
#include <sstream>
#include <iostream>
#include <vector>
#include <cmath>
#if defined(GD_IDE_ONLY)
class wxString;
#endif

#include "GDL/LightweightCommonTools.h"

/**
 * Convert anything to an integer.
 * Example :
 * \code
 * std::string five = 5;
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

#if defined(GD_IDE_ONLY)
/**
 * Specialization for converting wxString to a std::string
 * \ingroup CommonProgrammingTools
 */
template<>
std::string GD_API ToString( const wxString & value );
#endif

/**
 * Replace all spaces by tildes in a std::string
 */
std::string ReplaceSpacesByTildes(std::string text);

int Spliter(std::string Tableau[] , std::string chaine, char separateur, int longueur = -1);
int SpliterV(std::vector <std::string> *Tableau , std::string chaine, char separateur);
int SpliterVInt(std::vector <int> *Tableau , std::string chaine, char separateur);

template <typename T>
std::vector <T> SpliterStringToVector( const std::string & str, char separator )
{
    std::istringstream iss( str );
    std::string token;
    std::vector <T> array;

    unsigned int i = 0;
    while ( std::getline( iss, token, separator ) )
    {
        array.push_back( T(token) );
        ++i;
    }

    return array;
}

/**
 * Functor testing if a std::string is empty
 */
struct StringEmpty
{
   bool operator ()(const std::string & a) const
   {
      return a.empty();
   }
};

#endif // STDALGO_H_INCLUDED
