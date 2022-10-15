/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
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

#ifdef __GNUC__
    #define GD_DEPRECATED    __attribute__((deprecated))
#else
    #define GD_DEPRECATED
#endif

namespace gd
{

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

}

#endif // COMMONTOOLS_H
