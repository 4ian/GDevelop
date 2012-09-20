/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDL/Variable.h"
#include <string>
#include <sstream>

using namespace std;

void Variable::SetValue(double val)
{
    value = val;
    isNumber = true;
}

void Variable::SetString(const string & val)
{
    str = val;
    isNumber = false;
}

/**
 * Get value as a double
 */
double Variable::GetValue() const
{
    if (!isNumber)
    {
        stringstream ss; ss << str;
        ss >> value;
    }
    isNumber = true;

    return value;
}

const std::string & Variable::GetString() const
{
    if (isNumber)
    {
        stringstream s; s << (value);
        str = s.str();
    }
    isNumber = false;

    return str;
}

