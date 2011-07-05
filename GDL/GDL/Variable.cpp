/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDL/Variable.h"
#include <string>
#include <sstream>

using namespace std;

void Variable::SetValue(double val)
{
    value = val;

    //TODO : Performance KILLER.
    stringstream s; s << (val);
    str = s.str();
}

void Variable::SetString(const string & val)
{
    str = val;

    stringstream ss; ss << val;
    ss >> value;
}
