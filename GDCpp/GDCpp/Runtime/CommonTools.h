/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#ifndef GDCPP_COMMONTOOLS_H_INCLUDED
#define GDCPP_COMMONTOOLS_H_INCLUDED
#include <string>
#include <sstream>
#include <vector>
#include <cmath>
#include <SFML/System/String.hpp>
#include "GDCpp/Runtime/String.h"
#if defined(GD_IDE_ONLY)
class wxString;
#endif

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
