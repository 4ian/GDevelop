/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDCore/PlatformDefinition/Variable.h"
#include <string>
#include <sstream>

using namespace std;

namespace gd
{

/**
 * Get value as a double
 */
double Variable::GetValue() const
{
    if (!isNumber)
    {
        stringstream ss; ss << str;
        ss >> value;
        isNumber = true;
    }

    return value;
}

const std::string & Variable::GetString() const
{
    if (isNumber)
    {
        stringstream s; s << (value);
        str = s.str();
        isNumber = false;
    }

    return str;
}

}
