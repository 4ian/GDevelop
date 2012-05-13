/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDL/BuiltinExtensions/CommonInstructionsTools.h"
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

}

}
