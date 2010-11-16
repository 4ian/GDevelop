#include "GDL/Variable.h"
#include <string>
#include <sstream>

using namespace std;

void Variable::Setvalue(double val)
{
    value = val;

    stringstream s; s << (val);
    str = s.str();
}

void Variable::SetString(const string & val)
{
    str = val;

    stringstream ss; ss << val;
    ss >> value;
}
