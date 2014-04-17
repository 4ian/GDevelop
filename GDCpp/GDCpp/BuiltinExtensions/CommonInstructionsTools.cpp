/** \file
 *  Game Develop
 *  2008-2014 Florian Rival (Florian.Rival@gmail.com)
 */
#include "GDCpp/BuiltinExtensions/CommonInstructionsTools.h"
#include "GDCpp/profile.h"
#include <SFML/Graphics.hpp>
#include <sstream>

namespace GDpriv
{

namespace CommonInstructions
{

/**
 * Private data to initialize randomizer global seed.
 * Original code by Laurent Gomila.
 */
namespace
{
    // Initialize the generator's seed with the current system time
    // in milliseconds, so that it is always different
    unsigned int InitializeSeed()
    {
        unsigned int seed = static_cast<unsigned int>(std::time(NULL));
        std::srand(seed);
        return seed;
    }

    // Global variable storing the current seed
    unsigned int globalSeed = InitializeSeed();
}

double GD_API Random(int end)
{
    if ( end <= 0 ) return 0;

    int begin = 0;
    return std::rand() % (end - begin + 1) + begin;
}

bool GD_API LogicalNegation(bool param)
{
    return !param;
}

double GD_API ToDouble( const std::string & str )
{
    double d;
    std::istringstream oss(str);
    oss >> d;
    return d;
}

std::string GD_API ToString( double number )
{
    std::ostringstream oss;
    oss << number;
    return oss.str();
}

std::string GD_API LargeNumberToString( double number )
{
    std::ostringstream oss;
    oss.setf(std::ios::fixed);
    oss << number;
    std::string formattedStr = oss.str();

    //Delete trailing zero if needed
    size_t pointPos = formattedStr.find('.');
    if ( pointPos < formattedStr.length() )
    {
        size_t searchPos = formattedStr.length()-1;
        while (formattedStr[searchPos] == '0') searchPos--;
        if ( formattedStr[searchPos] == '.') searchPos--;

        formattedStr.resize(searchPos+1);
    }

    return formattedStr;
}

double GD_API ToRad( double angle )
{
    return angle*3.1415926/180.0;
}

double GD_API ToDeg( double angle )
{
    return angle*180.0/3.1415926;
}

}

}